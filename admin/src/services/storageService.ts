import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../config/firebase';
import { UploadProgress } from '../types/content';

export class StorageService {
  async uploadFile(
    file: File,
    contentId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `content/${contentId}/${fileName}`;
    const storageRef = ref(storage, filePath);

    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.({
            fileId: fileName,
            fileName: file.name,
            progress,
            status: 'uploading',
          });
        },
        (error) => {
          onProgress?.({
            fileId: fileName,
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: error.message,
          });
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            onProgress?.({
              fileId: fileName,
              fileName: file.name,
              progress: 100,
              status: 'completed',
              url: downloadURL,
            });
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  }

  async uploadMultipleFiles(
    files: File[],
    contentId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string[]> {
    const uploadPromises = files.map((file) =>
      this.uploadFile(file, contentId, onProgress)
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading files:', error);
      throw error;
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async generateThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        // For images, create a thumbnail
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
          const maxWidth = 300;
          const maxHeight = 200;
          
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to create thumbnail'));
            }
          }, 'image/jpeg', 0.8);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        // For videos, capture first frame
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.onloadedmetadata = () => {
          video.currentTime = 1; // Capture frame at 1 second
        };

        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx?.drawImage(video, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to create video thumbnail'));
            }
          }, 'image/jpeg', 0.8);
        };

        video.onerror = () => reject(new Error('Failed to load video'));
        video.src = URL.createObjectURL(file);
      } else if (file.type === 'application/pdf') {
        // For PDFs, return a generic PDF icon or use PDF.js to render first page
        resolve('/pdf-icon.png'); // You'll need to add this asset
      } else {
        resolve('/file-icon.png'); // Generic file icon
      }
    });
  }

  getFileType(file: File): 'pdf' | 'video' | 'image' | 'other' {
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    return 'other';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  validateFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 200 * 1024 * 1024; // 200MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/webm',
    ];

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${this.formatFileSize(maxSize)}`,
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not supported. Please upload PDF, image, or video files.',
      };
    }

    return { isValid: true };
  }
}
