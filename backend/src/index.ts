import { initializeApp } from 'firebase-admin/app';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin (only in production or when credentials are available)
if (process.env.NODE_ENV === 'production' || process.env.FIREBASE_ADMIN_SDK_JSON) {
  initializeApp();
}

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

// Start server in development mode
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Backend server running on http://localhost:${port}`);
    console.log(`📋 Health check: http://localhost:${port}/health`);
  });
}

// Export for Firebase Functions (when firebase-functions is available)
export const api = app;
