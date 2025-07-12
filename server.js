const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const session = require("express-session");
const multer = require("multer");
const { SitemapStream, streamToPromise } = require('sitemap');
const { createGzip } = require('zlib');
const path = require("path");
const adminRoutes = require("./routes/adminRoutes"); // Import admin routes
const newsRoutes = require('./routes/newsRoutes');
const bannerRoutes = require('./routes/bannerRoutes'); // Import banner routes
require("dotenv").config(); // Load environment variables from .env file

const admissionController = require('./controllers/admissionController');


const app = express();

// Set up EJS as the view engine
app.set("view engine", "ejs");


// Middleware
app.use(express.static("public")); // Serve static files

app.use(express.urlencoded({ extended: true })); // Process form fields
app.use(express.json()); // Parse JSON bodies
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected to RMS database"))
.catch(err => console.error("MongoDB connection error:", err));

// Connection event handlers
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Routes

// Add this route (place with your other routes)
app.get('/sitemap.xml', async (req, res) => {
  res.header('Content-Type', 'application/xml');
  res.header('Content-Encoding', 'gzip');
  
  try {
    const smStream = new SitemapStream({
      hostname: 'https://ruteromodelschool.com'
    });
    
    const pipeline = smStream.pipe(createGzip());
    
    // Add your URLs here
    smStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
    smStream.write({ url: '/about', changefreq: 'monthly', priority: 0.8 });
    smStream.write({ url: '/admission', changefreq: 'monthly', priority: 0.8 });
    smStream.write({ url: '/contact', changefreq: 'monthly', priority: 0.7 });
    smStream.write({ url: '/gallery', changefreq: 'weekly', priority: 0.9 });
    
    smStream.end();
    
    // Cache the sitemap
    const sitemap = await streamToPromise(pipeline);
    
    res.write(sitemap);
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});


app.get("/", async (req, res) => {
    try {
        const News = require('./models/newsModel');
        const Announcement = require('./models/announcementModel');
        const Proprietor = require('./models/proprietorModel');
        const Banner = require('./models/bannerModel');
        const latestNews = await News.find().sort({ date: -1 }).limit(3);
        const latestAnnouncements = await Announcement.find().sort({ date: -1 }).limit(2);
        const proprietor = await Proprietor.findOne();
        const banner = await Banner.findOne();
        res.render("index", { activePage: "home", latestNews, latestAnnouncements, proprietor, banner });
    } catch (err) {
        console.error('Error fetching data:', err);
        res.render("index", { activePage: "home", latestNews: [], latestAnnouncements: [], proprietor: null });
    }
});

app.get("/about", (req, res) => {
    res.render("about", { activePage: "about" });
});

app.get("/admission", (req, res) => {
    res.render("admission", { activePage: "admission" });
});

app.get("/gallery", async (req, res) => {
    try {
        const Album = require('./models/albumModel');
        const Gallery = require('./models/galleryModel');
        
        const albumId = req.query.album;
        
        let gallery = await Gallery.findOne();
        if (!gallery) {
            gallery = await Gallery.create({});
        }
        
        if (albumId) {
            // Show specific album images with pagination
            const page = parseInt(req.query.page) || 1;
            const limit = 12;
            
            const selectedAlbum = await Album.findById(albumId);
            let totalPages = 1;
            
            if (selectedAlbum && selectedAlbum.images) {
                const totalImages = selectedAlbum.images.length;
                totalPages = Math.ceil(totalImages / limit);
                const startIndex = (page - 1) * limit;
                const paginatedImages = selectedAlbum.images.slice(startIndex, startIndex + limit);
                
                selectedAlbum.images = paginatedImages;
            }
            
            res.render("gallery", { 
                activePage: "gallery", 
                selectedAlbum,
                albums: null,
                gallery,
                currentPage: page,
                totalPages,
                albumId
            });
        } else {
            // Show albums as folders
            const albums = await Album.find({ galleryId: gallery._id }).sort({ createdAt: -1 });
            res.render("gallery", { 
                activePage: "gallery", 
                albums,
                selectedAlbum: null,
                gallery,
                currentPage: 1,
                totalPages: 1,
                albumId: null
            });
        }
    } catch (err) {
        console.error('Error fetching gallery:', err);
        res.render("gallery", { 
            activePage: "gallery", 
            albums: [], 
            selectedAlbum: null, 
            gallery: null,
            currentPage: 1,
            totalPages: 1,
            albumId: null
        });
    }
});

app.get("/contact", (req, res) => {
    res.render("contact", { activePage: "contact" });
});

app.get("/curriculum", (req, res) => {
    res.render("curriculum", { activePage: "curriculum" });
});

// Removed duplicate /news and /announcements routes to avoid conflict with newsRoutes.js

app.get('/login', (req, res) => {
    res.render('login', { activePage: 'login' });
});

// Route to handle email form submission
app.post('/send_email', (req, res) => {
    const { name, email, subject, message } = req.body;

    // Validate environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Email credentials are missing in .env file");
        return res.status(500).json({ message: 'Email configuration error.' });
    }

    // Nodemailer transporter configuration
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        logger: true, // Enable logging
        debug: true,  // Enable debugging output
    });

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER, // Gmail account email
        replyTo: email, // User email for replying
        to: process.env.EMAIL_USER, // Receiving email address
        subject: subject || "No subject provided", // Email subject
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`, // Email body
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error details:', error); // Log detailed error information
            res.status(500).json({ message: 'Error sending email.', error: error.message });
        } else {
            console.log('Email sent successfully:', info.response);
            
            // Save to database
            const Contact = require('./models/contactModel');
            Contact.create({ name, email, subject: subject || 'No subject provided', message })
                .then(() => console.log('Contact saved to database'))
                .catch(err => console.error('Database save error:', err));
            
            res.status(200).json({ message: 'Email sent successfully!' });
        }
    });
});


app.post('/submit-admission', admissionController.submitApplication);


// Admin routes
app.use("/admin", adminRoutes);
app.use("/admin", bannerRoutes);
app.use(newsRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
