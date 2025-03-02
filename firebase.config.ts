import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCibWj-axxZvSU_fds1lXG22VvlzQNBJyg",
    authDomain: "purpledot-68400.firebaseapp.com",
    projectId: "purpledot-68400",
    storageBucket: "purpledot-68400.firebasestorage.app",
    messagingSenderId: "669790288516",
    appId: "1:669790288516:web:689baf40db356a3fc720d1",
    measurementId: "G-EPCFSDLYC3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);