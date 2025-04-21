import { auth, db } from "./firebase_config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  getDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Global pagination state
let currentCampaignPage = 1;
let campaignsPerPage = 6;
let campaignsData = [];

let currentDonationPage = 1;
let donationsPerPage = 3;
let userDonationsData = [];

let collectedDonation=[]

document.addEventListener("DOMContentLoaded", () => {
  const addcampaign = document.getElementById("campaignForm");
  const logout_btn = document.getElementById("logout_btn");
  const addCampaignBtn = document.getElementById("add_campaign_btn");
  const mycampaignBtn=document.getElementById("campaign_donation");
  const campaignDataSection = document.getElementById("campaignData");
  const addCampaignSection = document.getElementById("add_campaign");
  const viewDonationsSection = document.getElementById("userDonationsSection");
  const myCampaignSection=document.getElementById("mycampaign_donation")
  const view_donations_button = document.getElementById("view_donations_button");
  const homeBtn = document.getElementById("back_btn");

  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "dashboard.html";
    });
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
       myCampaignSection.style.display="none"
      addCampaignSection.style.display = "block";
      viewDonationsSection.style.display = "none";
    });
  }

  if (view_donations_button) {
    view_donations_button.addEventListener("click", async () => {
      campaignDataSection.style.display = "none";
      addCampaignSection.style.display = "none";
      myCampaignSection.style.display="none"
      viewDonationsSection.style.display = "block";
      await loadUserDonations(localStorage.getItem("user_email"));
      renderUserDonationsPage(1);
    });
  }
  if(mycampaignBtn){
    mycampaignBtn.addEventListener('click',()=>{
      campaignDataSection.style.display = "none";
      addCampaignSection.style.display = "none";
      viewDonationsSection.style.display = "none";
      myCampaignSection.style.display="block"
      const userEmail = localStorage.getItem("user_email");
      if (userEmail) {
        campaignandDonationLoad(userEmail);
      } else {
        console.error("User email not found in localStorage.");
      }
    });
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      localStorage.setItem("user_email", user.email);
      localStorage.setItem("uid", user.uid);
      loadCampaigns();
    } else {
      window.location.href = "index.html";
    }
  });
});

async function loadCampaigns() {
  const campaignContainer = document.getElementById("campaignData");
  campaignContainer.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "campaigns"));
    campaignsData = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      data.id = docSnap.id;
      data.totalDonated = await getTotalDonations(docSnap.id);
      campaignsData.push(data);
    }

    renderCampaignsPage(currentCampaignPage);
  } catch (error) {
    console.error("Error loading campaigns:", error);
    campaignContainer.innerHTML = "<p>Failed to load campaigns.</p>";
  }
}

function renderCampaignsPage(page) {
  const campaignContainer = document.getElementById("campaignData");
  campaignContainer.innerHTML = "";

  const start = (page - 1) * campaignsPerPage;
  const end = start + campaignsPerPage;
  const paginatedCampaigns = campaignsData.slice(start, end);

  if (paginatedCampaigns.length === 0) {
    campaignContainer.innerHTML = "<p>No campaigns found.</p>";
    return;
  }

  paginatedCampaigns.forEach((data) => {
    const isGoalReached = data.totalDonated >= data.goalAmount;

    const card = document.createElement("div");
    card.classList.add("campaign-card");

    card.innerHTML = `
      <img src="${data.media}" alt="Campaign Image">
      <div class="campaign-info">
        <h2>${data.title}</h2>
        <h3>Goal: $${data.goalAmount.toLocaleString()}</h3>
        <h4>Raised: $${data.totalDonated.toLocaleString()}</h4>
        <p>${data.description}</p>
        <button class="donation-button" data-id="${data.id}" ${isGoalReached ? "disabled" : ""}>
          ${isGoalReached ? "Goal Reached" : "Donate"}
        </button>

        <h5>Comments</h5>
        <div class="comments-section" id="comments-${data.id}"></div>
        <input type="text" id="comment-input-${data.id}" placeholder="Write a comment...">
        <button class="post-comment-btn" data-id="${data.id}">Post Comment</button>
      </div>
    `;

    campaignContainer.appendChild(card);

    loadComments(data.id);

    if (!isGoalReached) {
      card.querySelector(".donation-button").addEventListener("click", giveDonation);
    }

    card.querySelector(".post-comment-btn").addEventListener("click", postComment);
  });

  const totalPages = Math.ceil(campaignsData.length / campaignsPerPage);
  const nav = document.createElement("div");
  nav.className = "pagination-nav";

  nav.innerHTML = `
    <button ${page === 1 ? "disabled" : ""} id="prevPage">Prev</button>
    <span>Page ${page} of ${totalPages}</span>
    <button ${page === totalPages ? "disabled" : ""} id="nextPage">Next</button>
  `;

  campaignContainer.appendChild(nav);

  document.getElementById("prevPage")?.addEventListener("click", () => {
    renderCampaignsPage(--currentCampaignPage);
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
    renderCampaignsPage(++currentCampaignPage);
  });
}

async function getTotalDonations(campaignId) {
  const donationsRef = collection(db, "campaigns", campaignId, "donations");
  const snapshot = await getDocs(donationsRef);
  let total = 0;
  snapshot.forEach(doc => {
    total += parseFloat(doc.data().amount);
  });
  return total;
}

async function loadUserDonations(userEmail) {
  userDonationsData = [];

  const campaignsRef = collection(db, "campaigns");
  const campaignSnapshots = await getDocs(campaignsRef);

  for (const campaign of campaignSnapshots.docs) {
    const campaignId = campaign.id;
    const donationRef = collection(db, "campaigns", campaignId, "donations");
    const q = query(donationRef, where("donor", "==", userEmail));
    const snapshot = await getDocs(q);

    snapshot.forEach((docSnap) => {
      userDonationsData.push({
        title: campaign.data().title,
        amount: docSnap.data().amount,
        donatedAt: docSnap.data().donatedAt,
      });
    });
  }
}

function renderUserDonationsPage(page) {
  const container = document.getElementById("userDonationsContainer");
  container.innerHTML = "";

  const start = (page - 1) * donationsPerPage;
  const end = start + donationsPerPage;
  const pageData = userDonationsData.slice(start, end);

  if (pageData.length === 0) {
    container.innerHTML = "<p>No donations found.</p>";
    return;
  }

  pageData.forEach((donation) => {
    const card = document.createElement("div");
    card.classList.add("donation-card");

    card.innerHTML = `
      <h3>Campaign: ${donation.title}</h3>
      <p>Donated Amount: $${donation.amount}</p>
      <p>Date: ${new Date(donation.donatedAt).toLocaleDateString()}</p>
    `;

    container.appendChild(card);
  });

  const totalPages = Math.ceil(userDonationsData.length / donationsPerPage);
  const nav = document.createElement("div");
  nav.className = "pagination-nav";

  nav.innerHTML = `
    <button ${page === 1 ? "disabled" : ""} id="prevDonationPage">Prev</button>
    <span>Page ${page} of ${totalPages}</span>
    <button ${page === totalPages ? "disabled" : ""} id="nextDonationPage">Next</button>
  `;

  container.appendChild(nav);

  document.getElementById("prevDonationPage")?.addEventListener("click", () => {
    renderUserDonationsPage(--currentDonationPage);
  });

  document.getElementById("nextDonationPage")?.addEventListener("click", () => {
    renderUserDonationsPage(++currentDonationPage);
  });
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
    loadCampaigns();
  } catch (error) {
    console.error("Error adding campaign:", error);
    alert("Failed to add campaign. Please try again.");
  }
}

function previewCard(title, description, goalAmount) {
  document.getElementById("preview_title").textContent = title;
  document.getElementById("preview_desc").textContent = description;
  document.getElementById("preview_goal").textContent = `$${goalAmount.toLocaleString()}`;
  document.getElementById("preview_image").src = document.getElementById("media").value.trim();
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
    loadCampaigns();
  } catch (error) {
    console.error("Error processing donation:", error);
    alert("Failed to process donation. Please try again.");
  }
}

async function postComment(event) {
  const campaignId = event.target.getAttribute("data-id");
  const input = document.getElementById(`comment-input-${campaignId}`);
  const comment = input.value.trim();
  const user = localStorage.getItem("user_email");

  if (!comment) {
    alert("Please write a comment.");
    return;
  }

  try {
    await addDoc(collection(db, "campaigns", campaignId, "comments"), {
      user,
      comment,
      postedAt: new Date().toISOString(),
    });

    input.value = "";
    loadComments(campaignId);
  } catch (error) {
    console.error("Error posting comment:", error);
  }
}

async function loadComments(campaignId) {
  const commentSection = document.getElementById(`comments-${campaignId}`);
  commentSection.innerHTML = "";

  const commentsRef = collection(db, "campaigns", campaignId, "comments");
  const snapshot = await getDocs(commentsRef);

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const p = document.createElement("p");
    p.textContent = `${data.user}: ${data.comment}`;
    commentSection.appendChild(p);
  });
}

async function campaignandDonationLoad(user_email) {
  console.log("....campaign running");

  try {
    const campaignsRef = collection(db, "campaigns");
    const q = query(campaignsRef, where("createdBy", "==", user_email));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
      const campaignId = doc.id;
      const campaign = doc.data();
      const donationRef = collection(db, "campaigns", campaignId, "donations");
      const donationSnapshot = await getDocs(donationRef);

      donationSnapshot.forEach((donationDoc) => {
        const individualDonation = donationDoc.data();
        // console.log("Donation:", individualDonation);
        collectedDonation.push({"title":campaign.title,"amount":individualDonation.amount,"donor":individualDonation.donor,"donatedAt":individualDonation.donatedAt})
      });
    }
    renderCampaignDonation(collectedDonation)
  } catch (error) {
    console.error("Error fetching campaigns: ", error);
  }
}

async function renderCampaignDonation(data) {
  const container = document.getElementById("campaign_donation_container");
  container.innerHTML = "";  // Clear previous content
  
  data.forEach((camp) => {
    const card = document.createElement('div');
    card.innerHTML = `
      <h2>${camp.title}</h2>
      <p>Donar Name:${camp.donor} && Donated Amount :${camp.amount}</p> 
      <p>${camp.donatedAt}</p> 
    `;
    container.appendChild(card); 
  });
}




function logout() {
  signOut(auth).then(() => {
    localStorage.clear();
    window.location.href = "index.html";
  }).catch((error) => {
    console.error("Logout Error:", error);
  });
}
