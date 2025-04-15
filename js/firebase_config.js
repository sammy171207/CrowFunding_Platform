   import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import{getAuth} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  import {getFirestore} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
 
  const firebaseConfig = {
    apiKey: "AIzaSyAo4bdRe5zYYbdMK1X1O6DTuPlnbCguI6Y",
    authDomain: "crowfunding-42bf3.firebaseapp.com",
    projectId: "crowfunding-42bf3",
    storageBucket: "crowfunding-42bf3.firebasestorage.app",
    messagingSenderId: "476649610599",
    appId: "1:476649610599:web:b2b29daec045c507e9e3c2",
    measurementId: "G-FTZNBDSW1K"
  };

  const app = initializeApp(firebaseConfig);
  export const auth=getAuth(app);
  export const db=getFirestore(app);
