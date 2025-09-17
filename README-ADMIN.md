# Notes App Admin Panel

A comprehensive React-based admin panel for managing educational content with Firebase integration, featuring file uploads, OCR text extraction, and AI content approval workflows.

## Features

### 🔐 Authentication & Authorization
- Firebase Authentication with admin role verification
- Role-based access control (RBAC)
- Protected routes requiring admin privileges

### 📄 Content Management
- Upload PDFs, videos, and images to Firebase Storage
- Resumable file uploads with progress tracking
- Preview thumbnails for uploaded files
- Content metadata management (title, description, subject, semester, tags)
- Version control for content updates
- Publish/unpublish content functionality

### 🤖 AI Content Integration
- Review and approve AI-generated content
- Publish button for approved content
- Rejection workflow with review notes

### 🔍 Text Extraction & OCR
- Automatic text extraction from uploaded PDFs and images
- Google Vision API integration for high-accuracy OCR
- Tesseract.js fallback for offline processing
- Searchable content text

### 📊 Analytics Dashboard
- Content statistics and analytics
- File upload metrics
- Subject and semester distribution
- Recent uploads overview

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **TailwindCSS** for styling
- **React Query** for state management
- **React Dropzone** for file uploads
- **React Select** for form components
- **React Toastify** for notifications

### Backend
- **Firebase Functions** (Cloud Functions)
- **Firebase Firestore** for database
- **Firebase Storage** for file storage
- **Firebase Authentication** for user management
- **Google Vision API** for OCR
- **Tesseract.js** for fallback OCR

## Project Structure

```
admin/
├── src/
│   ├── components/
│   │   ├── ContentForm.tsx         # Content creation/editing form
│   │   ├── FileUpload.tsx          # File upload with drag-and-drop
│   │   ├── Layout.tsx              # Main app layout
│   │   └── ProtectedRoute.tsx      # RBAC route protection
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication state management
│   ├── pages/
│   │   ├── Dashboard.tsx           # Analytics dashboard
│   │   ├── ContentList.tsx         # Content management interface
│   │   ├── ContentEditor.tsx       # Content creation/editing
│   │   ├── AIContentApproval.tsx   # AI content review interface
│   │   └── Login.tsx               # Admin login page
│   ├── services/
│   │   ├── contentService.ts       # Content CRUD operations
│   │   └── storageService.ts       # File upload/management
│   ├── types/
│   │   ├── content.ts              # Content-related type definitions
│   │   └── auth.ts                 # Authentication type definitions
│   └── config/
│       └── firebase.ts             # Firebase configuration
├── package.json
└── vite.config.ts

backend/
├── src/
│   └── index.ts                    # Cloud Functions (OCR, analytics)
├── package.json
└── tsconfig.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- Firebase CLI
- Firebase project with enabled services:
  - Authentication
  - Firestore
  - Storage
  - Functions
  - Hosting

### 1. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
   - Functions
   - Hosting (optional)

3. Set up authentication:
   ```bash
   # Enable Email/Password authentication in Firebase Console
   # Add admin users and set custom claims
   ```

4. Configure custom claims for admin users:
   ```javascript
   // Use Firebase Admin SDK to set admin claims
   admin.auth().setCustomUserClaims(uid, { admin: true, role: 'admin' });
   ```

### 2. Environment Configuration

1. Copy environment variables:
   ```bash
   cd admin
   cp .env.example .env
   ```

2. Update `.env` with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdefg
   ```

### 3. Installation

1. Install root dependencies:
   ```bash
   npm install
   ```

2. Install all workspace dependencies:
   ```bash
   npm run install:all
   ```

### 4. Development

1. Start the development servers:
   ```bash
   npm run dev
   ```

   This starts:
   - Admin frontend on http://localhost:5173
   - Backend functions on http://localhost:5001

2. Start Firebase emulators (optional):
   ```bash
   firebase emulators:start
   ```

### 5. Google Vision API Setup (Optional)

1. Enable Google Vision API in Google Cloud Console
2. Create a service account and download credentials
3. Set environment variable:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/credentials.json"
   ```

## Deployment

### Frontend Deployment

1. Build the admin app:
   ```bash
   npm run build:admin
   ```

2. Deploy to Firebase Hosting:
   ```bash
   firebase deploy --only hosting:admin
   ```

### Backend Deployment

1. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

### Security Rules Deployment

1. Deploy Firestore and Storage rules:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

## Usage

### Admin User Setup

1. Create admin users in Firebase Authentication
2. Set custom claims using Firebase Admin SDK:
   ```javascript
   await admin.auth().setCustomUserClaims(uid, {
     admin: true,
     role: 'admin'
   });
   ```

### Content Upload Workflow

1. **Login**: Admin users login with email/password
2. **Upload**: Use the content form to upload files and metadata
3. **Processing**: Files are automatically processed for text extraction
4. **Review**: Review extracted content and metadata
5. **Publish**: Approve and publish content for users

### AI Content Approval

1. **Review**: Navigate to AI Content section
2. **Evaluate**: Review AI-generated content details
3. **Approve/Reject**: Use publish or reject buttons
4. **Notes**: Add review notes for documentation

## Features in Detail

### File Upload System
- **Drag & Drop**: Modern file upload interface
- **Progress Tracking**: Real-time upload progress
- **File Validation**: Type and size restrictions
- **Resumable Uploads**: Handle network interruptions
- **Preview Generation**: Automatic thumbnail creation

### OCR Integration
- **Google Vision API**: Primary OCR service for high accuracy
- **Tesseract Fallback**: Offline processing capability
- **Automatic Processing**: Trigger on file upload
- **Manual Extraction**: Re-process existing content

### Content Management
- **Rich Metadata**: Title, description, subject, semester, tags
- **Version Control**: Track content changes over time
- **Status Management**: Draft/published workflow
- **Premium Content**: Support for paid content tiers

### Security Features
- **RBAC**: Role-based access control
- **Firebase Rules**: Server-side security enforcement
- **Admin Verification**: Custom claims validation
- **Protected Routes**: Client-side route protection

## API Endpoints

### Cloud Functions

- `processContentText`: Automatic OCR on file upload
- `extractTextFromContent`: Manual text extraction
- `getContentAnalytics`: Dashboard analytics data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review Firebase and Google Cloud documentation for API-specific issues
