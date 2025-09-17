// Run this script to create an admin user
// You'll need to install firebase-admin: npm install firebase-admin

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// Make sure to set up your service account key
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'notes-app-admin'
});

async function createAdminUser() {
  const email = 'admin@example.com'; // Change this
  const password = 'adminpassword123'; // Change this
  
  try {
    // Create user
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: 'Admin User',
      emailVerified: true
    });
    
    console.log('Successfully created user:', userRecord.uid);
    
    // Set admin custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: 'admin'
    });
    
    console.log('Admin claims set successfully!');
    console.log('You can now login with:');
    console.log('Email:', email);
    console.log('Password:', password);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
