import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import sharp from 'sharp';
import Tesseract from 'tesseract.js';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

// Initialize Google Vision API
const visionClient = new ImageAnnotatorClient();

// Cloud Function to process uploaded content and extract text
export const processContentText = functions.storage.object().onFinalize(async (object) => {
  const { name, bucket, contentType } = object;
  
  if (!name || !contentType) return;

  // Check if this is a content file (not user files)
  if (!name.startsWith('content/')) return;

  // Extract contentId from the file path: content/{contentId}/filename
  const pathParts = name.split('/');
  if (pathParts.length < 3) return;
  
  const contentId = pathParts[1];
  
  try {
    let extractedText = '';
    
    if (contentType === 'application/pdf') {
      extractedText = await extractTextFromPDF(bucket, name);
    } else if (contentType.startsWith('image/')) {
      extractedText = await extractTextFromImage(bucket, name);
    }
    
    if (extractedText) {
      // Update the content document with extracted text
      await db.collection('content').doc(contentId).update({
        contentText: extractedText,
        textExtractedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`Text extracted for content ${contentId}: ${extractedText.length} characters`);
    }
  } catch (error) {
    console.error('Error processing content text:', error);
    
    // Log the error to the content document
    await db.collection('content').doc(contentId).update({
      textExtractionError: error instanceof Error ? error.message : 'Unknown error',
      textExtractionAttemptedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
});

async function extractTextFromPDF(bucketName: string, filePath: string): Promise<string> {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);
  
  // Download the PDF file
  const [fileBuffer] = await file.download();
  
  try {
    // Use OCR for PDF text extraction
    return await extractTextFromPDFUsingOCR(fileBuffer);
  } catch (error) {
    console.log('PDF text extraction failed:', error);
    throw error;
  }
}

async function extractTextFromPDFUsingOCR(pdfBuffer: Buffer): Promise<string> {
  try {
    // Use Tesseract for OCR
    const { data: { text } } = await Tesseract.recognize(pdfBuffer, 'eng', {
      logger: (m) => console.log(m)
    });
    
    return text;
  } catch (error) {
    console.error('OCR extraction from PDF failed:', error);
    throw error;
  }
}

async function extractTextFromImage(bucketName: string, filePath: string): Promise<string> {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filePath);
  
  try {
    // Use Google Vision API for better accuracy
    const [result] = await visionClient.textDetection(`gs://${bucketName}/${filePath}`);
    const detections = result.textAnnotations;
    
    if (detections && detections.length > 0) {
      return detections[0].description || '';
    }
    
    // Fallback to Tesseract if Vision API fails
    const [fileBuffer] = await file.download();
    return await extractTextFromImageUsingTesseract(fileBuffer);
  } catch (error) {
    console.log('Google Vision API failed, falling back to Tesseract:', error);
    
    // Fallback to Tesseract
    const [fileBuffer] = await file.download();
    return await extractTextFromImageUsingTesseract(fileBuffer);
  }
}

async function extractTextFromImageUsingTesseract(imageBuffer: Buffer): Promise<string> {
  try {
    // Preprocess image for better OCR accuracy
    const processedImage = await sharp(imageBuffer)
      .greyscale()
      .normalize()
      .sharpen()
      .toBuffer();
    
    const { data: { text } } = await Tesseract.recognize(processedImage, 'eng', {
      logger: (m) => console.log(m)
    });
    
    return text;
  } catch (error) {
    console.error('Tesseract OCR failed:', error);
    throw error;
  }
}

// Function to manually trigger text extraction for existing content
export const extractTextFromContent = functions.https.onCall(async (data, context) => {
  // Verify admin access
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger text extraction');
  }
  
  const { contentId } = data;
  
  if (!contentId) {
    throw new functions.https.HttpsError('invalid-argument', 'Content ID is required');
  }
  
  try {
    // Get content document
    const contentDoc = await db.collection('content').doc(contentId).get();
    
    if (!contentDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Content not found');
    }
    
    const content = contentDoc.data();
    if (!content || !content.fileUrls || content.fileUrls.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'No files found for content');
    }
    
    let allExtractedText = '';
    
    // Process each file
    for (const fileUrl of content.fileUrls) {
      try {
        // Extract bucket and file path from URL
        const url = new URL(fileUrl);
        const pathMatch = url.pathname.match(/\/b\/([^\/]+)\/o\/(.+)/);
        
        if (pathMatch) {
          const bucketName = pathMatch[1];
          const filePath = decodeURIComponent(pathMatch[2]);
          
          // Determine file type from URL or content type
          let extractedText = '';
          
          if (filePath.toLowerCase().endsWith('.pdf')) {
            extractedText = await extractTextFromPDF(bucketName, filePath);
          } else if (filePath.match(/\.(jpg|jpeg|png|gif|bmp|tiff)$/i)) {
            extractedText = await extractTextFromImage(bucketName, filePath);
          }
          
          if (extractedText) {
            allExtractedText += extractedText + '\n\n';
          }
        }
      } catch (fileError) {
        console.error(`Error processing file ${fileUrl}:`, fileError);
        // Continue with other files
      }
    }
    
    // Update content with extracted text
    await db.collection('content').doc(contentId).update({
      contentText: allExtractedText.trim(),
      textExtractedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    return {
      success: true,
      extractedLength: allExtractedText.length,
      message: 'Text extraction completed successfully'
    };
  } catch (error) {
    console.error('Manual text extraction failed:', error);
    throw new functions.https.HttpsError('internal', 'Text extraction failed');
  }
});

// Function to get content analytics
export const getContentAnalytics = functions.https.onCall(async (data, context) => {
  // Verify admin access
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can access analytics');
  }
  
  try {
    const contentCollection = db.collection('content');
    const snapshot = await contentCollection.get();
    
    const analytics = {
      totalContent: 0,
      publishedContent: 0,
      draftContent: 0,
      premiumContent: 0,
      withExtractedText: 0,
      totalFileSize: 0,
      contentBySubject: {} as Record<string, number>,
      contentBySemester: {} as Record<string, number>,
      recentUploads: [] as any[],
    };
    
    const recentUploads: any[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      analytics.totalContent++;
      
      if (data.status === 'published') {
        analytics.publishedContent++;
      } else {
        analytics.draftContent++;
      }
      
      if (data.isPremium) {
        analytics.premiumContent++;
      }
      
      if (data.contentText) {
        analytics.withExtractedText++;
      }
      
      if (data.fileSize) {
        analytics.totalFileSize += data.fileSize;
      }
      
      // Count by subject
      if (data.subject) {
        analytics.contentBySubject[data.subject] = (analytics.contentBySubject[data.subject] || 0) + 1;
      }
      
      // Count by semester
      if (data.semester) {
        analytics.contentBySemester[data.semester] = (analytics.contentBySemester[data.semester] || 0) + 1;
      }
      
      // Collect for recent uploads
      recentUploads.push({
        id: doc.id,
        title: data.title,
        subject: data.subject,
        createdAt: data.createdAt,
        status: data.status,
      });
    });
    
    // Sort and limit recent uploads
    analytics.recentUploads = recentUploads
      .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
      .slice(0, 10);
    
    return analytics;
  } catch (error) {
    console.error('Error getting analytics:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get analytics');
  }
});

// Express app for development
const app = express();
const port = process.env.PORT || 5001;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Notes endpoints
app.get('/api/notes', (req: express.Request, res: express.Response) => {
  // TODO: Implement get notes
  res.json({ 
    message: 'Get notes endpoint', 
    notes: [] 
  });
});

app.post('/api/notes', (req: express.Request, res: express.Response) => {
  // TODO: Implement create note
  res.json({ 
    message: 'Create note endpoint',
    note: req.body
  });
});

// PDF processing endpoints
app.post('/api/pdf/process', (req: express.Request, res: express.Response) => {
  // TODO: Implement PDF processing
  res.json({ 
    message: 'PDF processing endpoint',
    file: req.body
  });
});

// Start server in development mode only
if (process.env.NODE_ENV === 'development' && !process.env.FUNCTIONS_EMULATOR) {
  app.listen(port, () => {
    console.log(`🚀 Backend server running on http://localhost:${port}`);
    console.log(`📋 Health check: http://localhost:${port}/health`);
  });
}

// Export for Firebase Functions
export const api = app;

// Export admin functions
export { setAdminClaim, makeFirstUserAdmin, setAdminByEmail } from './admin-functions';
