import { auth,db } from "./firebase_config.js";
import{onAuthStateChanged ,signOut} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js"

const baseUrl='https://crowfunding-42bf3-default-rtdb.asia-southeast1.firebasedatabase.app/'
document.addEventListener("DOMContentLoaded",()=>{
    console.log("....Dashboard Load")
    const logout_btn = document.getElementById("logout_btn");
    const compaign_btn=document.getElementById('add_campaign_btn')
    const add_campaign=document.getElementById('campaignForm')
    if(logout_btn){
        logout_btn.addEventListener('click',logoutFn)
    }
    if(add_campaign){
        add_campaign.addEventListener('submit',addCamp)
    }

    if (compaign_btn) {
        compaign_btn.addEventListener('click', () => showSection('add_campaign'));
    }
     onAuthStateChanged(auth,(user)=>{
        console.log(user.email)
        
        if(user){
            loadData()
            localStorage.setItem('user_email',user.email)
            localStorage.setItem('user_uid',user.uid)
        }
        
    })
})

async function logoutFn() {
    console.log("Logout Click");
    try {
        await signOut(auth);
        console.log("User signed out successfully");
        window.location.href = "index.html";
      } catch (error) {
        console.error("Logout error:", error.message);
        alert("Logout failed: " + error.message);
      }
}

async function loadData() {
    try {
        const response = await fetch(baseUrl + "campaigns.json");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (!data || typeof data !== 'object') throw new Error('Invalid data');
        
        const campaigns = data; // data already contains the campaigns
        if (!campaigns) throw new Error('No campaigns found');
        
        const arr = Object.entries(campaigns).map(([id, campaign]) => ({ id, ...campaign }));
        display(arr);
    } catch (error) {
        console.error("Failed to load campaign data:", error);
    }
}



function display(campaignsArray) {
    const container = document.getElementById('display_container');
    container.innerHTML = '';
    campaignsArray.forEach(campaign => {
        const card = document.createElement('div');
        card.classList.add('campaign_card');
        const createdDate = new Date(campaign.createdAt * 1000).toLocaleDateString();
        card.innerHTML = `
            <img src="${campaign.media}" alt="Campaign Image">
            <h2>${campaign.title}</h2>
            <h3>Created on: ${createdDate}</h3>
            <h3>Email: ${campaign.userEmail}</h3>
            <h3>Goal: $${campaign.goalAmount}</h3>
            <p>${campaign.description}</p>
        `;
        container.appendChild(card);
    });
}

async function addCamp(e) {
    e.preventDefault();
    console.log("...Add function load");

    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const goalAmount = document.getElementById("goalAmount").value;
    const media = document.getElementById("media").value;
    const category = document.getElementById("category").value;
    const createdBy = localStorage.getItem('user_uid');
    const userEmail = localStorage.getItem('user_email');
    const createAt = Math.floor(Date.now() / 1000);

    const addobbj = { title, description, goalAmount, media, category, createdBy, userEmail, createAt };

    try {
        const add = await fetch(baseUrl + "campaigns.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(addobbj)
        });

        const response = await add.json();
        alert("Add SuccessFull")
        window.location.href="dashboard.html"
        console.log(response);
    } catch (error) {
        console.error("Error adding campaign:", error);
    }
}

function showSection(sectionId) {
    const sections = ['display_container', 'add_campaign'];
    sections.forEach((section) => {
        const sectionElement = document.getElementById(section);
        if (section === sectionId) {
            sectionElement.style.display = 'block';  
        } else {
            sectionElement.style.display = 'none';  
        }
    });
}