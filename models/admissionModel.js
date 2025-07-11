const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    // Student Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['male', 'female']
    },
    gradeApplying: {
        type: String,
        required: [true, 'Grade applying for is required'],
        enum: [
            'nursery1', 'nursery2', 'kg1', 'kg2',
            'primary1', 'primary2', 'primary3', 'primary4', 'primary5', 'primary6',
            'jss1', 'jss2', 'jss3', 'ss1', 'ss2'
        ]
    },
    
    // Parent/Guardian Information
    parentName: {
        type: String,
        required: [true, 'Parent/guardian name is required'],
        trim: true
    },
    relationship: {
        type: String,
        required: [true, 'Relationship is required'],
        enum: ['father', 'mother', 'guardian']
    },
    parentEmail: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: props => `${props.value} is not a valid email address!`
        }
    },
    parentPhone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function(v) {
                return /^\+?[0-9\s-()]{10,20}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    
    // Previous School Information
    previousSchool: {
        type: String,
        trim: true
    },
    lastGrade: {
        type: String,
        trim: true
    },
    yearCompleted: {
        type: Number,
        min: [2015, 'Year completed must be at least 2015'],
        max: [new Date().getFullYear(), `Year completed cannot be in the future`]
    },
    
    // Additional Information
    specialNeeds: {
        type: String,
        trim: true
    },
    interests: {
        type: String,
        trim: true
    },
    whyRutero: {
        type: String,
        trim: true
    },
    
    // Metadata
    applicationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['submitted', 'under_review', 'assessment_scheduled', 'interview_scheduled', 'accepted', 'rejected'],
        default: 'submitted'
    }
});

// Add text index for search functionality
admissionSchema.index({
    firstName: 'text',
    lastName: 'text',
    parentName: 'text',
    parentEmail: 'text',
    address: 'text'
});

const Admission = mongoose.model('Admission', admissionSchema);

module.exports = Admission;