const PDFDocument = require('pdfkit');
const Admission = require('../models/admissionModel');
const Admin = require("../models/adminModel");
const News = require('../models/newsModel');
const Announcement = require('../models/announcementModel');
const Proprietor = require('../models/proprietorModel');
const Album = require('../models/albumModel');
const Gallery = require('../models/galleryModel');
const Contact = require('../models/contactModel');
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

exports.loginPage = (req, res) => {
    res.render("admin/login", { error: null, success: req.query.success || null });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (admin && await bcrypt.compare(password, admin.password)) {
            req.session.isAdmin = true;
            req.session.adminUsername = username;
            return res.redirect("/admin/dashboard?success=" + encodeURIComponent("Login successful! Welcome back."));
        } else {
            return res.render("admin/login", { error: "Invalid username or password.", success: null });
        }
    } catch (err) {
        return res.render("admin/login", { error: "Server error. Please try again.", success: null });
    }
};

exports.dashboard = (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    res.render("admin/dashboard", { 
        username: req.session.adminUsername || "Admin",
        adminUsername: req.session.adminUsername || "Admin",
        success: req.query.success
    });
};

exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin/login?success=" + encodeURIComponent("You have been logged out successfully."));
    });
};

exports.newsUpdatePage = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const totalNews = await News.countDocuments();
        const totalPages = Math.ceil(totalNews / limit);
        const newsList = await News.find().sort({date: -1}).skip(skip).limit(limit);
        res.render("admin/news-update", { 
            newsList, 
            page, 
            totalPages,
            adminUsername: req.session.adminUsername || 'Admin',
            activePage: 'news'
        });
    } catch (err) {
        console.error('Error fetching news:', err);
        res.render("admin/news-update", { newsList: [], page: 1, totalPages: 1 });
    }
};

exports.announcementsPage = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    const announcementPage = parseInt(req.query.announcementPage) || 1;
    const limit = 10;
    const skip = (announcementPage - 1) * limit;
    const totalAnnouncements = await Announcement.countDocuments();
    const totalAnnouncementPages = Math.ceil(totalAnnouncements / limit);
    const announcements = await Announcement.find().sort({date: -1}).skip(skip).limit(limit);
    res.render("admin/announcements", { 
        announcements, 
        announcementPage, 
        totalAnnouncementPages,
        adminUsername: req.session.adminUsername || 'Admin',
        activePage: 'announcements'
    });
};

exports.editNews = async (req, res) => {
    try {
        const { id, title, author, date, content } = req.body;
        await News.findByIdAndUpdate(id, { title, author, date, content });
        res.redirect('/admin/news-update?success=' + encodeURIComponent('News article updated successfully!'));
    } catch (err) {
        console.error('Error editing news:', err);
        res.redirect('/admin/news-update?error=' + encodeURIComponent('Failed to update news article. Please try again.'));
    }
};

exports.addNews = async (req, res) => {
    try {
        const { title, author, date, content } = req.body;
        await News.create({ title, author, date, content });
        res.redirect('/admin/news-update?success=' + encodeURIComponent('News article created successfully!'));
    } catch (err) {
        console.error('Error adding news:', err);
        res.redirect('/admin/news-update?error=' + encodeURIComponent('Failed to create news article. Please try again.'));
    }
};

exports.deleteNews = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    try {
        const newsId = req.params.id;
        await News.findByIdAndDelete(newsId);
        res.redirect('/admin/news-update?success=' + encodeURIComponent('News article deleted successfully!'));
    } catch (err) {
        console.error('Error deleting news:', err);
        res.redirect('/admin/news-update?error=' + encodeURIComponent('Failed to delete news article. Please try again.'));
    }
};

exports.addAnnouncement = async (req, res) => {
    try {
        const { title, description, date } = req.body;
        await Announcement.create({ title, description, date });
        res.redirect('/admin/announcements?success=' + encodeURIComponent('Announcement created successfully!'));
    } catch (err) {
        console.error('Error adding announcement:', err);
        res.redirect('/admin/announcements?error=' + encodeURIComponent('Failed to create announcement. Please try again.'));
    }
};

exports.editAnnouncement = async (req, res) => {
    try {
        const { id, title, description, date } = req.body;
        await Announcement.findByIdAndUpdate(id, { title, description, date });
        res.redirect('/admin/announcements?success=' + encodeURIComponent('Announcement updated successfully!'));
    } catch (err) {
        console.error('Error editing announcement:', err);
        res.redirect('/admin/announcements?error=' + encodeURIComponent('Failed to update announcement. Please try again.'));
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcementId = req.params.id;
        await Announcement.findByIdAndDelete(announcementId);
        res.redirect('/admin/announcements?success=' + encodeURIComponent('Announcement deleted successfully!'));
    } catch (err) {
        console.error('Error deleting announcement:', err);
        res.redirect('/admin/announcements?error=' + encodeURIComponent('Failed to delete announcement. Please try again.'));
    }
};

exports.proprietorPage = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    try {
        const proprietor = await Proprietor.findOne();
        res.render("admin/proprietor", { 
            proprietor,
            adminUsername: req.session.adminUsername || 'Admin',
            activePage: 'proprietor'
        });
    } catch (err) {
        console.error('Error fetching proprietor:', err);
        res.render("admin/proprietor", { proprietor: null });
    }
};

exports.updateProprietor = async (req, res) => {
    try {
        const { title, author, date, content } = req.body;
        const updateData = { title, author, date, content };
        
        if (req.file) {
            try {
                // Delete previous proprietor images from Cloudinary
                const existingProprietor = await Proprietor.findOne();
                if (existingProprietor && existingProprietor.image) {
                    try {
                        await cloudinary.api.delete_resources_by_prefix('RUTERO MODEL SCHOOL/Proprietor/');
                    } catch (deleteErr) {
                        console.log('No previous proprietor images to delete');
                    }
                }
                
                console.log('Uploading proprietor image from memory');
                const result = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        {
                            folder: 'RUTERO MODEL SCHOOL/Proprietor'
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    ).end(req.file.buffer);
                });
                updateData.image = result.secure_url;
                console.log('Proprietor image uploaded:', result.secure_url);
            } catch (uploadErr) {
                console.error('Proprietor image upload error:', uploadErr);
                throw uploadErr;
            }
        }
        
        await Proprietor.findOneAndUpdate({}, updateData, { upsert: true });
        res.redirect('/admin/proprietor?success=' + encodeURIComponent('Proprietor message updated successfully!'));
    } catch (err) {
        console.error('Error updating proprietor:', err);
        res.redirect('/admin/proprietor?error=' + encodeURIComponent('Failed to update proprietor message. Please try again.'));
    }
};

// Gallery Management
exports.galleryPage = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    try {
        let gallery = await Gallery.findOne();
        if (!gallery) {
            gallery = await Gallery.create({});
        }
        const albums = await Album.find({ galleryId: gallery._id }).sort({ createdAt: -1 });
        res.render("admin/gallery", { 
            gallery, 
            albums,
            adminUsername: req.session.adminUsername || 'Admin',
            activePage: 'gallery'
        });
    } catch (err) {
        console.error('Error fetching gallery:', err);
        res.render("admin/gallery", { gallery: null, albums: [] });
    }
};



exports.addAlbum = async (req, res) => {
    try {
        const { title, description } = req.body;
        console.log('Creating album:', title);
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No images uploaded.');
        }
        
        let gallery = await Gallery.findOne();
        if (!gallery) {
            gallery = await Gallery.create({});
        }
        
        const folderName = `RUTERO MODEL SCHOOL/${title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}`;
        console.log('Uploading to folder:', folderName);
        
        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: folderName,
                        quality: 'auto:best',
                        fetch_format: 'auto'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(file.buffer);
            });
        });

        const results = await Promise.all(uploadPromises);
        console.log('Upload results:', results.length, 'images uploaded');
        
        const images = results.map(result => ({
            filename: result.public_id,
            path: result.secure_url,
            thumbnail: cloudinary.url(result.public_id, {
                width: 300,
                height: 200,
                crop: 'fill',
                quality: 'auto:best'
            })
        }));

        const newAlbum = await Album.create({
            galleryId: gallery._id,
            title,
            description,
            images,
            cloudinaryFolder: folderName
        });
        console.log('Album created:', newAlbum._id);

        res.redirect('/admin/gallery?success=' + encodeURIComponent('Album created successfully!'));
    } catch (err) {
        console.error('Error adding album:', err);
        res.redirect('/admin/gallery?error=' + encodeURIComponent('Failed to create album: ' + err.message));
    }
};



exports.deleteAlbum = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    try {
        const albumId = req.params.id;
        const album = await Album.findById(albumId);
        
        if (!album) {
            return res.redirect('/admin/gallery?error=' + encodeURIComponent('Album not found.'));
        }
        
        if (album.cloudinaryFolder) {
            try {
                await cloudinary.api.delete_resources_by_prefix(album.cloudinaryFolder);
                await cloudinary.api.delete_folder(album.cloudinaryFolder);
            } catch (deleteErr) {
                console.log('Error deleting folder from Cloudinary:', deleteErr);
            }
        }
        
        await Album.findByIdAndDelete(albumId);
        res.redirect('/admin/gallery?success=' + encodeURIComponent('Album deleted successfully!'));
    } catch (err) {
        console.error('Error deleting album:', err);
        res.redirect('/admin/gallery?error=' + encodeURIComponent('Failed to delete album. Please try again.'));
    }
};

exports.addImages = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    try {
        const albumId = req.params.id;
        const album = await Album.findById(albumId);
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).send('No images uploaded.');
        }
        
        const folderName = album.cloudinaryFolder || `RUTERO MODEL SCHOOL/${album.title.replace(/[^a-zA-Z0-9]/g, '_')}`;
        
        const uploadPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: folderName,
                        quality: 'auto:best',
                        fetch_format: 'auto'
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                ).end(file.buffer);
            });
        });

        const results = await Promise.all(uploadPromises);
        
        const images = results.map(result => ({
            filename: result.public_id,
            path: result.secure_url,
            thumbnail: cloudinary.url(result.public_id, {
                width: 300,
                height: 200,
                crop: 'fill',
                quality: 'auto:best'
            })
        }));

        await Album.findByIdAndUpdate(albumId, {
            $push: { images: { $each: images } },
            cloudinaryFolder: folderName
        });

        // No file cleanup needed with memory storage

        res.redirect('/admin/gallery?success=' + encodeURIComponent(`${images.length} image(s) added successfully!`));
    } catch (err) {
        console.error('Error adding images:', err);
        res.redirect('/admin/gallery?error=' + encodeURIComponent('Failed to add images. Please try again.'));
    }
};

exports.deleteImage = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    try {
        const albumId = req.params.albumId;
        const filename = req.params[0];
        
        // Delete from Cloudinary first
        await cloudinary.uploader.destroy(filename);
        
        // Then remove from database
        await Album.findByIdAndUpdate(albumId, {
            $pull: { images: { filename: filename } }
        });
        
        res.redirect('/admin/gallery?success=' + encodeURIComponent('Image deleted successfully!') + '&reopenAlbum=' + albumId);
    } catch (err) {
        console.error('Error deleting image:', err);
        res.redirect('/admin/gallery?error=' + encodeURIComponent('Failed to delete image. Please try again.'));
    }
};

exports.emailsPage = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const totalEmails = await Contact.countDocuments();
        const totalPages = Math.ceil(totalEmails / limit);
        const emails = await Contact.find().sort({ sentAt: -1 }).skip(skip).limit(limit);
        res.render("admin/emails", { 
            emails, 
            page, 
            totalPages,
            totalEmails,
            adminUsername: req.session.adminUsername || 'Admin',
            activePage: 'emails',
            error: req.query.error,
            success: req.query.success
        });
    } catch (err) {
        console.error('Error fetching emails:', err);
        res.render("admin/emails", { 
            emails: [], 
            page: 1, 
            totalPages: 1,
            totalEmails: 0,
            username: req.session.adminUsername || 'Admin', 
            activePage: 'emails',
            error: req.query.error,
            success: req.query.success
        });
    }
};

exports.replyEmail = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    
    const { id } = req.params;
    const { replyMessage } = req.body;
    
    try {
        const contact = await Contact.findById(id);
        if (!contact) {
            return res.redirect('/admin/emails?error=' + encodeURIComponent('Email not found'));
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact.email)) {
            return res.redirect('/admin/emails?error=' + encodeURIComponent('Invalid recipient email address'));
        }
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.redirect('/admin/emails?error=' + encodeURIComponent('Email configuration missing'));
        }
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            logger: true,
            debug: true
        });
        
        const mailOptions = {
            from: `"Rutero Model School" <${process.env.EMAIL_USER}>`,
            to: contact.email,
            subject: `Re: ${contact.subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h3 style="color: #333;">Reply from Rutero Model School</h3>
                    <p>Dear ${contact.name},</p>
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
                        ${replyMessage.replace(/\n/g, '<br>')}
                    </div>
                    <p>Best regards,<br><strong>Rutero Model School</strong></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #666;">This is a reply to your message: "${contact.subject}"</p>
                </div>
            `,
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'High'
            }
        };
        
        await transporter.verify();
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        
        await Contact.findByIdAndUpdate(id, { 
            status: 'replied',
            reply: replyMessage
        });
        
        res.redirect('/admin/emails?success=' + encodeURIComponent('Reply sent successfully'));
    } catch (error) {
        console.error('Reply error:', error);
        
        let errorMessage = 'Failed to send reply';
        if (error.responseCode === 550) {
            errorMessage = 'Recipient email address does not exist';
        } else if (error.code === 'EAUTH') {
            errorMessage = 'Email authentication failed. Check your email credentials.';
        }
        
        res.redirect('/admin/emails?error=' + encodeURIComponent(errorMessage + ': ' + error.message));
    }
};

exports.deleteEmail = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.redirect('/admin/emails?success=' + encodeURIComponent('Email deleted successfully!'));
    } catch (err) {
        console.error('Error deleting email:', err);
        res.redirect('/admin/emails?error=' + encodeURIComponent('Failed to delete email.'));
    }
};

exports.admissionsPage = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    try {
        const admissions = await Admission.find().sort({ applicationDate: -1 });
        res.render("admin/admissions", { 
            admissions,
            adminUsername: req.session.adminUsername || 'Admin',
            activePage: 'admissions'
        });
    } catch (err) {
        console.error('Error fetching admissions:', err);
        res.render("admin/admissions", { 
            admissions: [],
            adminUsername: req.session.adminUsername || 'Admin',
            activePage: 'admissions'
        });
    }
};

exports.admissionDetailsPage = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.redirect("/admin/login");
    }
    try {
        const admission = await Admission.findById(req.params.id);
        if (!admission) {
            return res.redirect("/admin/admissions");
        }
        res.render("admin/admission-details", { 
            admission,
            adminUsername: req.session.adminUsername || 'Admin',
            activePage: 'admissions'
        });
    } catch (err) {
        console.error('Error fetching admission details:', err);
        res.redirect("/admin/admissions");
    }
};

exports.exportAdmissionPdf = async (req, res) => {
    try {
        const admission = await Admission.findById(req.params.id);
        if (!admission) {
            return res.redirect("/admin/admissions");
        }

        const doc = new PDFDocument({ 
            margin: 30, // Reduced margins
            layout: 'portrait',
            size: 'A4'
        });

        const filename = `admission-${admission.firstName}-${admission.lastName}.pdf`;
        res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // Register fonts
        doc.registerFont('Helvetica-Bold', 'Helvetica-Bold');

        // Colors
        const primaryColor = '#003366'; // Dark blue
        const secondaryColor = '#4a4a4a'; // Dark grey

        // Header
        doc.image('public/Images/image.png', 30, 30, { width: 50 })
           .fillColor(primaryColor)
           .font('Helvetica-Bold').fontSize(20).text('RUTERO MODEL SCHOOL', 90, 40)
           .moveDown(2);

        // Title
        doc.font('Helvetica-Bold').fontSize(16).fillColor(primaryColor)
           .text('Admission Application Form', { align: 'center' })
           .moveDown(1.5);

        // Helper function for sections
        const addSection = (title, data) => {
            doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor)
               .text(title, { underline: true })
               .moveDown(0.5);

            data.forEach(item => {
                doc.font('Helvetica-Bold').fontSize(9).fillColor(secondaryColor).text(item.label + ':');
                doc.font('Helvetica').fontSize(9).fillColor(secondaryColor).text(item.value || 'N/A');
                doc.moveDown(0.4);
            });

            doc.moveDown(0.8);
        };

        // Student Information
        addSection('Student Information', [
            { label: 'Full Name', value: `${admission.firstName} ${admission.lastName}` },
            { label: 'Date of Birth', value: new Date(admission.dateOfBirth).toLocaleDateString() },
            { label: 'Gender', value: admission.gender },
            { label: 'Grade Applying For', value: admission.gradeApplying }
        ]);

        // Parent/Guardian Information
        addSection('Parent/Guardian Information', [
            { label: 'Full Name', value: admission.parentName },
            { label: 'Relationship', value: admission.relationship },
            { label: 'Email', value: admission.parentEmail },
            { label: 'Phone Number', value: admission.parentPhone },
            { label: 'Address', value: admission.address }
        ]);

        // Previous School Information
        addSection('Previous Academic Records', [
            { label: 'School Name', value: admission.previousSchool },
            { label: 'Last Grade', value: admission.lastGrade },
            { label: 'Year Completed', value: admission.yearCompleted }
        ]);

        // Additional Information
        addSection('Additional Information', [
            { label: 'Special Needs or Allergies', value: admission.specialNeeds },
            { label: 'Student Interests and Hobbies', value: admission.interests },
            { label: 'Reason for Choosing Rutero Model School', value: admission.whyRutero }
        ]);

        // Footer
        const pageHeight = doc.page.height;
        doc.font('Helvetica').fontSize(7).fillColor(secondaryColor)
           .text('Generated on: ' + new Date().toLocaleDateString(), 30, pageHeight - 30)
           .text('Rutero Model School Admission System', doc.page.width / 2 - 100, pageHeight - 20, { align: 'center' });

        doc.end();

    } catch (err) {
        console.error('Error exporting PDF:', err);
        res.redirect("/admin/admissions");
    }
};

exports.sendAdmissionFeedback = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { message, email } = req.body;
    const { id } = req.params;

    try {
        const admission = await Admission.findById(id);
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({ message: 'Email configuration missing' });
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Rutero Model School" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Feedback on your Admission Application for ${admission.firstName} ${admission.lastName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h3 style="color: #333;">Feedback from Rutero Model School</h3>
                    <p>Dear ${admission.parentName},</p>
                    <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <p>Best regards,<br><strong>Rutero Model School</strong></p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Feedback sent successfully!' });

    } catch (error) {
        console.error('Error sending feedback:', error);
        res.status(500).json({ message: 'Failed to send feedback.' });
    }
};

exports.updateAdmissionStatus = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status } = req.body;

    try {
        const admission = await Admission.findByIdAndUpdate(id, { status }, { new: true });
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }
        res.status(200).json({ message: 'Status updated successfully', admission });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Failed to update status' });
    }
};

exports.deleteAdmission = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const { id } = req.params;

    try {
        const admission = await Admission.findByIdAndDelete(id);
        if (!admission) {
            return res.status(404).json({ message: 'Admission not found' });
        }
        res.status(200).json({ message: 'Admission deleted successfully' });
    } catch (error) {
        console.error('Error deleting admission:', error);
        res.status(500).json({ message: 'Failed to delete admission' });
    }
};

exports.getEmailsAPI = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const totalEmails = await Contact.countDocuments();
        const totalPages = Math.ceil(totalEmails / limit);
        const emails = await Contact.find().sort({ sentAt: -1 }).skip(skip).limit(limit);
        res.json({ emails, page, totalPages, totalEmails });
    } catch (err) {
        console.error('Error fetching emails API:', err);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
};

exports.getAdmissionsAPI = async (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const { search, status, sort } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { parentEmail: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        let sortOption = { applicationDate: -1 };
        if (sort) {
            const [field, order] = sort.split('-');
            sortOption = { [field]: order === 'asc' ? 1 : -1 };
        }

        const admissions = await Admission.find(query).sort(sortOption);
        res.json(admissions);
    } catch (err) {
        console.error('Error fetching admissions API:', err);
        res.status(500).json({ error: 'Failed to fetch admissions' });
    }
};

exports.submitAdmission = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            dateOfBirth,
            gender,
            gradeApplying,
            parentName,
            relationship,
            parentEmail,
            parentPhone,
            address,
            previousSchool,
            lastGrade,
            yearCompleted,
            specialNeeds,
            interests,
            whyRutero
        } = req.body;

        // Basic server-side validation (you can enhance this as needed)
        const errors = {};
        if (!firstName) errors.firstName = 'First Name is required.';
        if (!lastName) errors.lastName = 'Last Name is required.';
        if (!dateOfBirth) errors.dateOfBirth = 'Date of Birth is required.';
        if (!gender) errors.gender = 'Gender is required.';
        if (!gradeApplying) errors.gradeApplying = 'Grade Applying For is required.';
        if (!parentName) errors.parentName = 'Parent/Guardian Name is required.';
        if (!relationship) errors.relationship = 'Relationship is required.';
        if (!parentEmail) errors.parentEmail = 'Email Address is required.';
        if (!parentPhone) errors.parentPhone = 'Phone Number is required.';
        if (!address) errors.address = 'Home Address is required.';

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: 'Validation errors', errors });
        }

        const newAdmission = new Admission({
            firstName, lastName, dateOfBirth, gender, gradeApplying, parentName,
            relationship, parentEmail, parentPhone, address, previousSchool,
            lastGrade, yearCompleted, specialNeeds, interests, whyRutero,
            status: 'Submitted',  // Default status
            applicationDate: new Date()
        });

        await newAdmission.save();
        res.status(200).json({ message: 'Admission application submitted successfully!' });
    } catch (err) {
        console.error('Error submitting admission:', err);
        res.status(500).json({ message: 'Failed to submit admission application.' });
    }
};
