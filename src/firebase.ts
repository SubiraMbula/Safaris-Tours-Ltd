import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// 1. Define the config using environment variables (SECURE)
// These should be set in the AI Studio Secrets panel.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID,
};

// 2. Fallback for AI Studio preview environment (CONVENIENT)
// This allows the app to work while you transition to secrets.
// If you export to GitHub, you should set the VITE_FIREBASE_* secrets
// and remove this fallback to prevent exposing your keys.
if (!firebaseConfig.apiKey) {
  try {
    // @ts-ignore - Fallback for local development/preview
    const config = await import('../firebase-applet-config.json');
    Object.assign(firebaseConfig, config.default || config);
  } catch (e) {
    console.warn("Firebase configuration missing. Please set VITE_FIREBASE_* secrets.");
  }
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function testConnection() {
  try {
    // Test connection to Firestore
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}

testConnection();

export default app;
