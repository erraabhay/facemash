# facemash
 


```markdown
# 🔥 FaceMash 

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Made With Node](https://img.shields.io/badge/Backend-Node.js-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![Socket.IO](https://img.shields.io/badge/Real--time-Socket.IO-purple)

A modern **Facemash** clone where users vote between two random faces. Inspired by the infamous 2003 site by Mark Zuckerberg, but recreated responsibly and ethically for learning purposes.

> ⚠️ All images used are for demo/educational use. No actual voting or objectification intended.

---

## 📸 Live Preview

> _Optional: Add a demo link or screenshot here_  
> ![Screenshot](public/assets/screenshot.png)

---

## 🚀 Features

- 🎯 Random image pairing for face-off voting
- 📊 Elo-based rating system
- 💾 Persistent MongoDB storage
- 🌐 Real-time updates via Socket.IO
- ✨ Elegant and responsive UI with HTML/CSS
- 🧰 Developer utilities for data reset & seeding
- 📂 MVC project structure for scalability

---

## 🧰 Tech Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB + Mongoose
- **Templating**: Handlebars
- **Real-time**: Socket.IO
- **Utilities**: dotenv, custom logger

---

## 🏗️ Folder Structure

```
facemash-replica/
│
├── config/                 # MongoDB config
├── db.js
├── logs/                  # Vote logs (ratings.log)
├── models/                # Photo schema
├── public/
│   ├── css/               # style.css
│   └── js/                # Client-side logic
├── uploads/               # User/seeded images
├── routes/                # Express routes
├── scripts/               # DB utilities
├── seeds/                 # Seed images and data
├── socket/                # Real-time voting logic
├── utils/                 # Helpers and logger
├── views/                 # Handlebars templates
├── .env                   # Environment variables
├── server.js              # Main entry point
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/facemash-replica.git
cd facemash-replica
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add `.env` file

```env
MONGO_URI=mongodb://localhost:27017/facemash
PORT=3000
```

### 4. (Optional) Seed initial image data

```bash
node seeds/seed.js
```

### 5. Run the app

```bash
npm start
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Developer Scripts

| Script                     | Description                        |
|---------------------------|------------------------------------|
| `npm start`               | Start the server                   |
| `npm run dev`             | Start in dev mode (Nodemon)        |
| `node scripts/resetRatings.js`      | Reset ratings in DB        |
| `node scripts/addLastMatchField.js` | Add missing field to schema |

---

## 📥 Uploading Images

Simply drop `.jpg`, `.jpeg`, or `.png` files into the `/uploads` folder. These are automatically picked up by the app.

---

## ⚠️ Disclaimer

This project is made purely for educational purposes and **does not promote objectification**. All images are used with the assumption of fair use in a dev/testing environment.

---

## ✨ Author

Made with ❤️ by [abhay](https://github.com/erraabhay)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
```

---

You can tweak the screenshot section, add GIFs, or even deploy it on **Render**, **Vercel**, or **Glitch** and drop a live link in the readme
