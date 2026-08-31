const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously, getIdToken } = require('firebase/auth');
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

async function getRealFirebaseToken() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  
  const userCredential = await signInAnonymously(auth);
  const token = await getIdToken(userCredential.user);
  
  console.log("export TEST_TOKEN=\"fb-" + token + "\"");
  console.log("export TEST_USER_ID=\"" + userCredential.user.uid + "\"");
  process.exit(0);
}

getRealFirebaseToken().catch(console.error);
