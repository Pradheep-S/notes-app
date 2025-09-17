const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Simple function to set admin claims
exports.setAdminClaim = functions.https.onRequest(async (req, res) => {
  // Allow CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(400).json({
      success: false,
      error: 'Only POST method is allowed'
    });
    return;
  }

  const uid = 'jQZuiiBX6FehgBP0X8zYGnyk6lA3'; // Your user UID
  const email = 'gunalikkavr@gmail.com'; // Your email

  try {
    console.log(`Setting admin claims for: ${email} (${uid})`);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      admin: true,
      role: 'admin'
    });
    
    console.log('✅ Admin claims set successfully!');
    
    // Verify the claims were set
    const userRecord = await admin.auth().getUser(uid);
    console.log('Custom claims:', userRecord.customClaims);
    
    res.status(200).json({
      success: true,
      message: 'Admin claims set successfully!',
      customClaims: userRecord.customClaims
    });
  } catch (error) {
    console.error('Error setting admin claims:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
