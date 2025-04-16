import { auth, db } from "./firebase_config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { doc, setDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("....dashboard load");

  const addcampaign = document.getElementById('campaignForm');
  const logout_btn = document.getElementById('logout_btn');
  const addCampaignBtn = document.getElementById('add_campaign_btn'); 
  const campaignDataSection = document.getElementById("campaignData"); 
  const addCampaignSection = document.getElementById("add_campaign"); 
 

  if (addcampaign) {
    addcampaign.addEventListener('submit', addCamp);
  }

  if (logout_btn) {
    logout_btn.addEventListener("click", logout);
  }

  if (addCampaignBtn) {
    addCampaignBtn.addEventListener("click", () => {
      // Toggle visibility between sections
      campaignDataSection.style.display = 'none';
      addCampaignSection.style.display = 'block';
    });
  }



  onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("user_email", user.email);
      localStorage.setItem("uid", user.uid);
      loadCampaign();
    } else {
      window.location.href = "index.html"; // redirect to login if not logged in
    }
  });
});

// ✅ Load Campaigns from Firestore
async function loadCampaign() {
  const campaignContainer = document.getElementById("campaignData");
  campaignContainer.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "campaigns"));

    if (querySnapshot.empty) {
      campaignContainer.innerHTML = "<p>No campaigns found.</p>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const card = document.createElement('div');
      card.classList.add('campaign-card');

      card.innerHTML = `
        <img src="${data.media}" alt="Campaign Image">
        <div class="campaign-info">
          <h2>${data.title}</h2>
          <h3>Goal: $${data.goalAmount.toLocaleString()}</h3>
          <p>${data.description}</p>
<button class="donation-button" data-id="${data.id}">Donate</button>        </div>
      `;
      const give_donation=document.querySelector(".donation-button")
      if(give_donation){
        give_donation.addEventListener("click",giveDonation)
      }
      campaignContainer.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading campaigns:", error);
    campaignContainer.innerHTML = "<p>Failed to load campaigns.</p>";
  }
}

// ✅ Add Campaign to Firestore
async function addCamp(e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const goalAmount = parseFloat(document.getElementById("goalAmount").value);
  const media = document.getElementById("media").value.trim();
  const category = document.getElementById("category").value.trim();
  const createdBy = localStorage.getItem('user_email');

  if (!title || !description || !goalAmount || !media || !category || !createdBy) {
    alert("Please fill out all fields.");
    return;
  }


  try {
    previewCard(title,description,goalAmount,media,category,createdBy)
    const campaignsRef = collection(db, "campaigns");
    const newDocRef = doc(campaignsRef); // generates a new unique ID

    await setDoc(newDocRef, {
      id: newDocRef.id,
      title,
      description,
      goalAmount,
      media,
      category,
      createdBy,
      createdAt: new Date().toISOString()
    });

    alert("Campaign added successfully!");
    document.getElementById("campaignForm").reset();
    loadCampaign(); // refresh list
  } catch (error) {
    console.error("Error adding campaign:", error);
    alert("Failed to add campaign. Please try again.");
  }
}

async function previewCard(title,description,goalAmount,media,category,createdBy) {
  const preview_title=document.getElementById('preview_title');
  const preview_desc=document.getElementById("preview_desc");
  const preview_goal=document.getElementById('preview_goal');
  preview_title.textContent=title
  preview_desc.textContent=description
  preview_goal.textContent=goalAmount;
}

/// Donation check;
async function giveDonation() {
  console.log("Donation Runing")
  let show=prompt("Enter The Name");
  console.log(show)
}

async function logout() {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "index.html";
}

