# facemash
 
That’s a super cool project structure—you really went full throttle on replicating *Facemash*! Here’s a clean and detailed `README.md` for your project based on the structure and stack you used:

---

```markdown
# 🔥 FaceMash Replica

A modern replica of the original **FaceMash** website, created for fun, practice, and nostalgia. Users can vote between two random faces to determine who's "hotter," just like the controversial site originally built by Mark Zuckerberg in his dorm room.

> Built with ❤️ using **HTML**, **CSS**, **JavaScript**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

---

## 🚀 Features

- 🔄 Real-time face voting (pair of random images)
- 📊 Rating system based on Elo algorithm
- 💾 MongoDB-backed persistent storage
- 📸 Easy image upload support
- 🔌 Live vote updates using Socket.IO
- 📂 Organized MVC folder structure
- 🧠 Handlebars helpers for clean views
- 🔧 Logging of voting activity

---

## 🧰 Tech Stack

- **Frontend**: HTML, CSS (custom styling)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Templating**: Handlebars
- **Utilities**: dotenv, custom logger, image seeding

---

## 📁 Project Structure

```
.
├── config/              # DB config
├── db.js
├── logs/               # Vote activity logs
│   └── ratings.log
├── models/
│   └── Photo.js         # Mongoose model
├── public/
│   ├── css/             # CSS files
│   └── js/              # Client-side scripts
├── uploads/             # Uploaded images
├── routes/
│   ├── index.js         # Main routes
│   └── voteRoutes.js    # Voting logic
├── scripts/             # Scripts to manage data
│   ├── addLastMatchField.js
│   ├── resetRatings.js
├── seeds/
│   ├── seed.js          # Seeder script
│   └── imageData.json   # Seed data
├── socket/
│   └── socketHandler.js # Real-time voting
├── utils/
│   ├── handlebarsHelpers.js
│   └── logger.js
├── views/               # Handlebars views
├── .env                 # Environment config
├── server.js            # Entry point
├── README.md
├── package.json
```

---

## ⚙️ Setup Instructions

1. **Clone the repo**
   ```bash
   git clone https://github.com/erraabhay/facemash-.git
   cd facemash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file**
   ```
   MONGO_URI=mongodb://localhost:27017/facemash
   PORT=3000
   ```

4. **Seed images (optional)**
   ```bash
   node seeds/seed.js
   ```

5. **Start the app**
   ```bash
   npm start
   ```

6. **Visit**
   ```
   http://localhost:3000
   ```

---

## 🧪 Available Scripts

- `npm start`: Run the app
- `npm run dev`: Run in development mode (nodemon)
- `node scripts/resetRatings.js`: Reset all ratings to default
- `node scripts/addLastMatchField.js`: Add missing fields in DB

---

## 🖼 Image Uploads

Place your image files in the `uploads/` directory and make sure their paths are referenced correctly. Only `.jpg`, `.jpeg`, and `.png` files are supported.

---

## ⚠️ Disclaimer

This project is for educational and personal use only. Respect privacy, consent, and ethical boundaries when using images.

---

## ✨ Credits

Made with 💻 by [abhay]  
Inspired by the original **Facemash** concept (2003)

---

## 📜 License

MIT License – feel free to use, modify, and share.

```

---

Let me know if you want the voting logic, seeding script explanation, or even a cool logo idea for this project! 😎
