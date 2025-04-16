import { auth,db} from "./firebase_config.js";
import{createUserWithEmailAndPassword ,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import{
    doc,
    getDoc,
    setDoc,
    collection
}  from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


document.addEventListener('DOMContentLoaded',()=>{
    console.log('-----loading')
    
    const signForm = document.getElementById("signForm");
    if (signForm) {
      console.log("Sign form found, attaching signup handler");
      signForm.addEventListener("submit", signUp);
    }
    

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      console.log("Login form found, attaching login handler");
      loginForm.addEventListener("submit", logIn);
    }
    
   
})
async function signUp(e) {
    e.preventDefault();
    console.log("...signup click");
  
    const email = document.getElementById('sign_email').value;
    const password = document.getElementById('sign_pwd').value;
    const role = document.getElementById('signup_role').value;
  
    if (!email || !password || !role) {
      alert("Please fill in all fields.");
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userid = userCredential.user.uid;
  
      await setDoc(doc(db, "users", userid), {
        email: email,
        role: role
      });
  
      alert("Saved successfully");
      console.log("User ID:", userid);
      window.location.href = 'index.html';
    } catch (error) {
      console.log("Signup error:", error.message);
      alert("Signup failed: " + error.message);
    }
  }
  
  async function logIn(e) {
    e.preventDefault();
    console.log('....login function start');
    const email=document.getElementById('login_email').value;
    const pwd=document.getElementById('login_pwd').value;
    try{
      const userCredential= await signInWithEmailAndPassword(auth,email,pwd);

      const userdoc= await getDoc(doc(db,"users",userCredential.user.uid));
      const userData=userdoc.data();
      alert("Login Successfull");
      window.location.href="dashboard.html";
    }catch(error){
      console.log(error)
    }
    console.log(email,pwd)
  }
  