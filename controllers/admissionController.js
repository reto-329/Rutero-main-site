const Admission = require('../models/admissionModel');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Submit admission application
exports.submitApplication = async (req, res) => {
    try {
        // Create new application
        const application = await Admission.create(req.body);

        // Send confirmation email
        await sendConfirmationEmail(application);

        res.status(201).json({
            status: 'success',
            message: 'Application submitted successfully!',
            data: {
                application
            }
        });
    } catch (err) {
        // Handle validation errors
        if (err.name === 'ValidationError') {
            const errors = Object.values(err.errors).map(el => el.message);
            return res.status(400).json({
                status: 'fail',
                message: 'Validation error',
                errors
            });
        }
        
        // Handle duplicate email error
        if (err.code === 11000 && err.keyPattern.parentEmail) {
            return res.status(400).json({
                status: 'fail',
                message: 'An application with this email already exists'
            });
        }

        // Handle other errors
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong processing your application'
        });
    }
};

// Helper function to send confirmation email
async function sendConfirmationEmail(application) {
    // Only proceed if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('Email credentials not configured - skipping email send');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Render the email template
    const emailHtml = await ejs.renderFile(
        path.join(__dirname, '../views/emails/admissionConfirmation.ejs'),
        {
            ...application.toObject(),
            parentName: application.parentName,
            firstName: application.firstName,
            lastName: application.lastName,
            gradeApplying: formatGrade(application.gradeApplying),
            applicationDate: application.applicationDate
        }
    );

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: application.parentEmail,
        subject: 'Rutero Model School - Application Received',
        html: emailHtml
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Confirmation email sent to ${application.parentEmail}`);
    } catch (err) {
        console.error('Error sending confirmation email:', err);
    }
}

// Helper function to format grade for display
function formatGrade(grade) {
    const gradeMap = {
        nursery1: 'Nursery 1',
        nursery2: 'Nursery 2',
        kg1: 'KG 1',
        kg2: 'KG 2',
        primary1: 'Primary 1',
        primary2: 'Primary 2',
        primary3: 'Primary 3',
        primary4: 'Primary 4',
        primary5: 'Primary 5',
        primary6: 'Primary 6',
        jss1: 'JSS 1',
        jss2: 'JSS 2',
        jss3: 'JSS 3',
        ss1: 'SS 1',
        ss2: 'SS 2'
    };
    return gradeMap[grade] || grade;
}
