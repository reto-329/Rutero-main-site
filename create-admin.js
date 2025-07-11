const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");
require("dotenv").config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => { console.error("MongoDB connection error:", err); process.exit(1); });

async function createAdmin(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Admin({ username, password: hashedPassword });
    await admin.save();
    console.log(`Admin user '${username}' created.`);
    mongoose.disconnect();
}

// Usage: node create-admin.js <username> <password>
const [,, username, password] = process.argv;
if (!username || !password) {
    console.log("Usage: node create-admin.js <username> <password>");
    process.exit(1);
}
createAdmin(username, password);
