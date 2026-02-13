
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyTestKey_Firebase",
  authDomain: "school-bus-pro.firebaseapp.com",
  projectId: "school-bus-pro",
  storageBucket: "school-bus-pro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const setupRecaptcha = (containerId: string) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('Recaptcha resolved');
    }
  });
};

export const sendOtp = async (phoneNumber: string, appVerifier: any) => {
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};
