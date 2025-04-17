import { auth, db } from "./firebase_config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDocs,
  getDoc,
  collection,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const addcampaign = document.getElementById("campaignForm");
  const logout_btn = document.getElementById("logout_btn");
  const addCampaignBtn = document.getElementById("add_campaign_btn");
  const campaignDataSection = document.getElementById("campaignData");
  const addCampaignSection = document.getElementById("add_campaign");
  const viewDonationsSection = document.getElementById("userDonationsSection");
  const view_donations_button = document.getElementById("view_donations_button");
  const homeBtn=document.getElementById("back_btn")
  
  if(homeBtn){
    homeBtn.addEventListener('click',()=>{
      window.location.href="dashboard.html"
    })
  }

  if (addcampaign) {
    addcampaign.addEventListener("submit", addCamp);
  }

  if (logout_btn) {
    logout_btn.addEventListener("click", logout);
  }

  if (addCampaignBtn) {
    addCampaignBtn.addEventListener("click", () => {
      campaignDataSection.style.display = "none";
      addCampaignSection.style.display = "block";
      viewDonationsSection.style.display = "none";
    });
  }

  if (view_donations_button) {
    view_donations_button.addEventListener("click", () => {
      campaignDataSection.style.display = "none";
      addCampaignSection.style.display = "none";
      viewDonationsSection.style.display = "block";
      fetchUserDonations(localStorage.getItem("user_email"));
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("user_email", user.email);
      localStorage.setItem("uid", user.uid);
      loadCampaign();
    } else {
      window.location.href = "index.html";
    }
  });
});

async function loadCampaign() {
  const campaignContainer = document.getElementById("campaignData");
  campaignContainer.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "campaigns"));

    if (querySnapshot.empty) {
      campaignContainer.innerHTML = "<p>No campaigns found.</p>";
      return;
    }

    querySnapshot.forEach(async (docSnap) => {
      const data = docSnap.data();
      const campaignId = docSnap.id;
      const totalDonated = await getTotalDonations(campaignId);

      const card = document.createElement("div");
      card.classList.add("campaign-card");

      card.innerHTML = `
        <img src="${data.media}" alt="Campaign Image">
        <div class="campaign-info">
          <h2>${data.title}</h2>
          <h3>Goal: $${data.goalAmount.toLocaleString()}</h3>
          <h4>Raised: $${totalDonated.toLocaleString()}</h4>
          <p>${data.description}</p>
          <button class="donation-button" data-id="${campaignId}">Donate</button>
        </div>
      `;

      campaignContainer.appendChild(card);

      const donationButtons = document.querySelectorAll(".donation-button");
      donationButtons.forEach((btn) => {
        btn.addEventListener("click", giveDonation);
      });
    });
  } catch (error) {
    console.error("Error loading campaigns:", error);
    campaignContainer.innerHTML = "<p>Failed to load campaigns.</p>";
  }
}

async function addCamp(e) {
  e.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const goalAmount = parseFloat(document.getElementById("goalAmount").value);
  const media = document.getElementById("media").value.trim();
  const category = document.getElementById("category").value.trim();
  const createdBy = localStorage.getItem("user_email");

  if (!title || !description || !goalAmount || !media || !category || !createdBy) {
    alert("Please fill out all fields.");
    return;
  }

  try {
    previewCard(title, description, goalAmount);
    const campaignsRef = collection(db, "campaigns");
    const newDocRef = doc(campaignsRef);

    await setDoc(newDocRef, {
      id: newDocRef.id,
      title,
      description,
      goalAmount,
      media,
      category,
      createdBy,
      createdAt: new Date().toISOString(),
    });

    alert("Campaign added successfully!");
    document.getElementById("campaignForm").reset();
    loadCampaign();
  } catch (error) {
    console.error("Error adding campaign:", error);
    alert("Failed to add campaign. Please try again.");
  }
}

function previewCard(title, description, goalAmount) {
  const preview_title = document.getElementById("preview_title");
  const preview_desc = document.getElementById("preview_desc");
  const preview_goal = document.getElementById("preview_goal");

  preview_title.textContent = title;
  preview_desc.textContent = description;
  preview_goal.textContent = goalAmount;
}

async function giveDonation(event) {
  const button = event.target;
  const campaignId = button.getAttribute("data-id");
  const donor = localStorage.getItem("user_email");

  let donationAmount = prompt("Enter the donation amount:");
  if (!donationAmount || isNaN(donationAmount) || Number(donationAmount) <= 0) {
    alert("Please enter a valid donation amount.");
    return;
  }

  donationAmount = parseFloat(donationAmount);

  try {
    const donationRef = collection(db, "campaigns", campaignId, "donations");
    const newDonationRef = doc(donationRef);

    await setDoc(newDonationRef, {
      id: newDonationRef.id,
      donor,
      amount: donationAmount,
      donatedAt: new Date().toISOString(),
    });

    alert("Thank you for your donation!");
    loadCampaign();
  } catch (error) {
    console.error("Error processing donation:", error);
    alert("Failed to process donation. Please try again.");
  }
}

async function getTotalDonations(campaignId) {
  try {
    const donationRef = collection(db, "campaigns", campaignId, "donations");
    const snapshot = await getDocs(donationRef);

    let total = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      total += parseFloat(data.amount || 0);
    });

    return total;
  } catch (error) {
    console.error("Error getting donation total:", error);
    return 0;
  }
}

//  FIXED fetchUserDonations()
async function fetchUserDonations(userEmail) {
  const container = document.getElementById("userDonationsContainer");
  container.innerHTML = "";

  try {
    const campaignsRef = collection(db, "campaigns");
    const campaignSnapshots = await getDocs(campaignsRef);

    for (const campaign of campaignSnapshots.docs) {
      const campaignId = campaign.id;
      const donationRef = collection(db, "campaigns", campaignId, "donations");
      const q = query(donationRef, where("donor", "==", userEmail));
      const userDonationSnapshot = await getDocs(q);

      userDonationSnapshot.forEach((docSnap) => {
        const donationData = docSnap.data();

        const card = document.createElement("div");
        card.classList.add("donation-card");

        card.innerHTML = `
          <h3>Campaign: ${campaign.data().title}</h3>
          <p>Donated Amount: $${donationData.amount}</p>
          <p>Date: ${new Date(donationData.donatedAt).toLocaleDateString()}</p>
        `;

        container.appendChild(card);
      });
    }

    if (container.innerHTML === "") {
      container.innerHTML = "<p>No donations found.</p>";
    }
  } catch (error) {
    console.error("Error fetching donations:", error);
    container.innerHTML = "<p>Failed to load donations.</p>";
  }
}

async function logout() {
  await signOut(auth);
  localStorage.clear();
  window.location.href = "index.html";
}
