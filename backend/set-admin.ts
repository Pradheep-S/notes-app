import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin with project ID
initializeApp({
  projectId: 'notes-app-admin'
});

async function setAdminClaims() {
  const auth = getAuth();
  
  try {
    // First, let's find your user
    const listUsersResult = await auth.listUsers(10);
    
    console.log('Available users:');
    listUsersResult.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (UID: ${user.uid})`);
    });
    
    if (listUsersResult.users.length === 0) {
      console.log('No users found. Please create a user in Firebase Console first.');
      process.exit(1);
    }
    
    // Use the first user or specify an email
    const targetEmail = process.argv[2]; // Get email from command line
    let targetUser;
    
    if (targetEmail) {
      try {
        targetUser = await auth.getUserByEmail(targetEmail);
      } catch (error) {
        console.error(`User with email ${targetEmail} not found.`);
        process.exit(1);
      }
    } else {
      // Use the first user
      targetUser = listUsersResult.users[0];
    }
    
    console.log(`Setting admin claims for: ${targetUser.email}`);
    
    // Set custom claims
    await auth.setCustomUserClaims(targetUser.uid, {
      admin: true,
      role: 'admin'
    });
    
    console.log('✅ Admin claims set successfully!');
    console.log('The user will need to log out and log back in for the changes to take effect.');
    
    // Verify the claims were set
    const userRecord = await auth.getUser(targetUser.uid);
    console.log('Custom claims:', userRecord.customClaims);
    
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin claims:', error);
    process.exit(1);
  }
}

setAdminClaims();
