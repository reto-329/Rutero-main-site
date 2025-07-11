const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage (direct to Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});
const uploadMultiple = upload.array('images', 20);

router.get("/login", adminController.loginPage);
router.post("/login", adminController.login);
router.get("/dashboard", adminController.dashboard);
router.get("/logout", adminController.logout);
router.get("/news-update", adminController.newsUpdatePage);
router.post("/news-update/edit", adminController.editNews);
router.post("/news-update/add", adminController.addNews);
router.post("/news-update/delete/:id", adminController.deleteNews);

// Announcements
router.get("/announcements", adminController.announcementsPage);
router.post("/announcements/add", adminController.addAnnouncement);
router.post("/announcements/edit", adminController.editAnnouncement);
router.post("/announcements/delete/:id", adminController.deleteAnnouncement);

// Proprietor
router.get("/proprietor", adminController.proprietorPage);
const uploadSingle = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
}).single('image');

router.post("/proprietor/update", uploadSingle, adminController.updateProprietor);

// Gallery
router.get("/gallery", adminController.galleryPage);
router.post("/gallery/add-album", uploadMultiple, adminController.addAlbum);
router.post("/gallery/delete-album/:id", adminController.deleteAlbum);

router.post("/gallery/add-images/:id", uploadMultiple, adminController.addImages);
router.post("/gallery/delete-image/:albumId/*", adminController.deleteImage);

// Emails
router.get("/emails", adminController.emailsPage);
router.get("/api/emails", adminController.getEmailsAPI);
router.post("/emails/reply/:id", adminController.replyEmail);
router.post("/emails/delete/:id", adminController.deleteEmail);

// Admissions
router.get("/admissions", adminController.admissionsPage);
router.get("/admissions/:id", adminController.admissionDetailsPage);
router.get("/admissions/:id/export-pdf", adminController.exportAdmissionPdf);
router.post("/admissions/:id/feedback", adminController.sendAdmissionFeedback);
router.put("/admissions/:id/status", adminController.updateAdmissionStatus);
router.delete("/admissions/:id", adminController.deleteAdmission);


// API for admissions
router.get("/api/admissions", adminController.getAdmissionsAPI);

module.exports = router;
