import { https } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import express from 'express';

// Initialize Firebase Admin
initializeApp();

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Notes endpoints
app.get('/notes', (req, res) => {
  // TODO: Implement get notes
  res.json({ message: 'Get notes endpoint' });
});

app.post('/notes', (req, res) => {
  // TODO: Implement create note
  res.json({ message: 'Create note endpoint' });
});

// PDF processing endpoints
app.post('/pdf/process', (req, res) => {
  // TODO: Implement PDF processing
  res.json({ message: 'PDF processing endpoint' });
});

// Export the Express app as a Firebase Function
export const api = https.onRequest(app);
