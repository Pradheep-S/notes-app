// Manual Admin Setup Instructions
// ==============================
// 
// Since we're having issues with Cloud Functions, here's how to manually set admin claims:
//
// Method 1: Firebase Console (Easiest)
// 1. Go to Firebase Console: https://console.firebase.google.com/project/notes-app-admin
// 2. Navigate to Authentication > Users
// 3. Find your user (gunalikkavr@gmail.com)
// 4. Click on the user
// 5. Scroll down to "Custom claims"
// 6. Add this JSON:
//    {
//      "admin": true,
//      "role": "admin"
//    }
// 7. Save the changes
//
// Method 2: Firebase CLI (If Cloud Functions work)
// Run this in the Firebase Functions shell:
// 
// firebase functions:shell
// > admin.auth().setCustomUserClaims('jQZuiiBX6FehgBP0X8zYGnyk6lA3', {admin: true, role: 'admin'})
//
// Method 3: Temporary Admin Setup Component (Below)

import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const TempAdminSetup = () => {
  const [email, setEmail] = useState('gunalikkavr@gmail.com');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateAdmin = async () => {
    try {
      // First sign in as this user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      setMessage(`Signed in as ${user.email}. UID: ${user.uid}`);
      setMessage(prev => prev + '\n\nNow you need to manually set custom claims in Firebase Console for this UID.');
      setMessage(prev => prev + '\n\nGo to Firebase Console > Authentication > Users > Click on your user > Custom claims');
      setMessage(prev => prev + '\n\nAdd: {"admin": true, "role": "admin"}');
      
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Temporary Admin Setup</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <button
          onClick={handleCreateAdmin}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Get User UID for Admin Setup
        </button>

        {message && (
          <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded whitespace-pre-line">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
