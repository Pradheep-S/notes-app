# Notes App

A comprehensive notes application built as a mono-repo with Flutter mobile app, Node.js backend, and React admin dashboard.

## Project Structure

```
notes-app/
├── mobile/          # Flutter mobile application
├── backend/         # Node.js Cloud Functions backend
├── admin/           # React admin dashboard
├── .github/         # GitHub workflows and configurations
├── .env.example     # Environment variables template
├── package.json     # Root package.json for shared scripts
└── README.md        # This file
```

## Features

### Mobile App (Flutter)
- **PDF Support**: View and annotate PDF documents using pdfx and flutter_pdfview
- **State Management**: Riverpod for robust state management
- **In-App Purchases**: Monetization through in_app_purchase
- **Secure Storage**: flutter_secure_storage for sensitive data
- **HTTP Client**: Dio for API communication
- **Testing**: Integration tests included

### Backend (Node.js Cloud Functions)
- **Firebase Integration**: Firebase Admin SDK and Cloud Functions
- **PDF Processing**: pdf-lib for PDF manipulation
- **API Framework**: Express.js for RESTful APIs
- **Google APIs**: googleapis for extended functionality
- **HTTP Client**: Axios for external API calls
- **Testing**: Jest testing framework

### Admin Dashboard (React)
- **Modern Stack**: Vite + TypeScript + Tailwind CSS
- **Form Handling**: react-hook-form with validation
- **Firebase Integration**: Firebase SDK for admin operations
- **UI Components**: Tailwind CSS for responsive design
- **Testing**: Vitest for unit and integration tests

## Getting Started

### Prerequisites
- Node.js 18+
- Flutter 3.10+
- Firebase CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd notes-app
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Setup Mobile App**
   ```bash
   cd mobile
   flutter pub get
   cd ..
   ```

4. **Setup Backend**
   ```bash
   cd backend
   npm install
   cd ..
   ```

5. **Setup Admin Dashboard**
   ```bash
   cd admin
   npm install
   cd ..
   ```

6. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development

#### Start all services
```bash
npm run dev
```

#### Individual services
```bash
# Mobile (Flutter)
cd mobile && flutter run

# Backend (Firebase Functions)
cd backend && npm run serve

# Admin Dashboard
cd admin && npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Mobile tests
cd mobile && flutter test

# Backend tests
cd backend && npm test

# Admin tests
cd admin && npm test
```

### Building for Production

```bash
# Build all projects
npm run build

# Individual builds
cd mobile && flutter build apk
cd backend && npm run build
cd admin && npm run build
```

## Environment Variables

See `.env.example` for required environment variables. Key variables include:

- Firebase configuration
- API keys and secrets
- Database connection strings
- Third-party service credentials

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Tech Stack

### Mobile
- Flutter 3.10+
- Riverpod (State Management)
- Dio (HTTP Client)
- PDF Libraries (pdfx, flutter_pdfview)
- Flutter Secure Storage

### Backend
- Node.js 18
- Firebase Functions
- Express.js
- TypeScript
- Jest (Testing)
- PDF-lib

### Admin
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Hook Form
- Firebase SDK

### DevOps
- GitHub Actions (CI/CD)
- Husky (Pre-commit hooks)
- ESLint/Prettier (Linting)
- Firebase Hosting/Functions
