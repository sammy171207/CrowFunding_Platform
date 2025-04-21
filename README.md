# 🎯 Crowdfunding Platform

A responsive crowdfunding platform built using **HTML, CSS, JavaScript (DOM)** with **Firebase Authentication** and **Firestore** integration. Users can sign up, create campaigns, view others' campaigns, and support causes they care about. The project is deployed using **GitHub Pages**.

## 🚀 Features

- User authentication (Sign Up & Login) via Firebase
- Firestore database to store campaign details
- Add and view crowdfunding campaigns
- Clean and responsive UI
- Hosted live on GitHub Pages

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript (DOM)
- **Backend Services:** Firebase Auth, Firebase Firestore
- **Hosting:** GitHub Pages

## 📁 Folder Structure

```
📦 crowdfunding-platform/
├── index.html
├── style.css
├── dashboard.html
├── signup.html
├── ls.css
├── js/
│   ├── firebase_config.js
│   ├── checkauth.js
│   └── auth.js
└── README.md
```

## 🔧 Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Email/Password** in Authentication.
3. Enable **Cloud Firestore**.
4. Add your config to `firebase.js`:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  // ... other config
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
```

## 🌐 Deployment (GitHub Pages)

1. Push your project to GitHub.
2. Go to **Settings > Pages**.
3. Select the `main` branch and `/root` folder.
4. Your site will be live at:
   ```
   https://<your-username>.github.io/<repo-name>/
   ```

## ✨ Future Enhancements

- Add payment gateway for real donations
- Campaign image uploads
- User dashboard with campaign tracking

---

👨‍💻 **Developed by:** Sameer Randive  
📍 **Hosted at:** https://sammy171207.github.io/CrowFunding_Platform/index.html
