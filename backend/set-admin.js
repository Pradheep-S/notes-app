const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
const app = initializeApp({
  projectId: 'notes-app-admin'
});

async function setAdminClaims() {
  const auth = getAuth();
  
  // Use the UID from the exported users
  const uid = 'jQZuiiBX6FehgBP0X8zYGnyk6lA3';
  const email = 'gunalikkavr@gmail.com';
  
  try {
    console.log(`Setting admin claims for: ${email} (${uid})`);
    
    // Set custom claims
    await auth.setCustomUserClaims(uid, {
      admin: true,
      role: 'admin'
    });
    
    console.log('✅ Admin claims set successfully!');
    console.log('The user will need to log out and log back in for the changes to take effect.');
    
    // Verify the claims were set
    const userRecord = await auth.getUser(uid);
    console.log('Custom claims:', userRecord.customClaims);
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin claims:', error);
    process.exit(1);
  }
}

setAdminClaims();
