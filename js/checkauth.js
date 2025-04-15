import { auth,db } from "./firebase_config.js";
import{onAuthStateChanged ,signOut} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js"

const baseUrl='https://crowfunding-42bf3-default-rtdb.asia-southeast1.firebasedatabase.app/'
document.addEventListener("DOMContentLoaded",()=>{
    console.log("....Dashboard Load")
    const logout_btn = document.getElementById("logout_btn");
    if(logout_btn){
        logout_btn.addEventListener('click',logoutFn)
    }
     onAuthStateChanged(auth,(user)=>{
        console.log(user.email)
        if(user){
            loadData()
        }
        
    })
})

async function logoutFn() {
    console.log("Logout Click");
    try {
        await signOut(auth);
        console.log("User signed out successfully");
        window.location.href = "login.html";
      } catch (error) {
        console.error("Logout error:", error.message);
        alert("Logout failed: " + error.message);
      }
}

async function loadData() {
    try {
        const response = await fetch(baseUrl + "campaigns.json");
        const data = await response.json(); 
        const arr = Object.entries(data).map(([id, campaign]) => {
            return { id, ...campaign }; 
        });
        console.log(arr); 
    } catch (error) {
        console.log(error);
    }
}
