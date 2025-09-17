import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Function to set admin claims - callable from client or CLI
export const setAdminClaim = functions.https.onCall(async (data, context) => {
  // Check if the request is from an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { uid, isAdmin } = data;

  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'UID is required');
  }

  try {
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      admin: isAdmin,
      role: isAdmin ? 'admin' : 'user'
    });

    return { 
      success: true, 
      message: `Admin claims ${isAdmin ? 'granted' : 'removed'} for user ${uid}` 
    };
  } catch (error) {
    console.error('Error setting admin claims:', error);
    throw new functions.https.HttpsError('internal', 'Failed to set admin claims');
  }
});

// Function to make the first user an admin (for initial setup)
export const makeFirstUserAdmin = functions.https.onCall(async (data, context) => {
  try {
    // List all users
    const listUsersResult = await admin.auth().listUsers(10);
    const users = listUsersResult.users;

    if (users.length === 0) {
      throw new functions.https.HttpsError('not-found', 'No users found');
    }

    // Get the first user (or you can specify an email)
    const firstUser = users[0];
    
    // Set admin claims for the first user
    await admin.auth().setCustomUserClaims(firstUser.uid, {
      admin: true,
      role: 'admin'
    });

    return { 
      success: true, 
      message: `Made ${firstUser.email} an admin`,
      uid: firstUser.uid 
    };
  } catch (error) {
    console.error('Error making first user admin:', error);
    throw new functions.https.HttpsError('internal', 'Failed to make first user admin');
  }
});

// Function to set admin by email
export const setAdminByEmail = functions.https.onCall(async (data, context) => {
  const { email, isAdmin } = data;

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: isAdmin,
      role: isAdmin ? 'admin' : 'user'
    });

    return { 
      success: true, 
      message: `Admin claims ${isAdmin ? 'granted' : 'removed'} for ${email}`,
      uid: userRecord.uid 
    };
  } catch (error) {
    console.error('Error setting admin claims by email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to set admin claims');
  }
});
