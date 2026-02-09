const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bearerRoutes = require('./routes/bearerRoutes');
const videoRoutes = require('./routes/videoRoutes');
const collegeRoutes = require('./routes/collegeRoutes');
const Admin = require('./models/Admin');
const College = require('./models/College');

const app = express();

// Validate critical environment variables
if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
}
if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not defined. Admin authentication will fail.');
}
if (!process.env.APPSCRIPT_URL) {
    console.warn('⚠️ WARNING: APPSCRIPT_URL is missing. Email confirmations will NOT work.');
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        seedAdmin();
        seedColleges();
    })
    .catch(err => console.log(err));

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow localhost and Render domains
        if (origin.indexOf('localhost') !== -1 || origin.indexOf('onrender.com') !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bearers', bearerRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/colleges', collegeRoutes);

// Static file serving for production
if (process.env.NODE_ENV === 'production') {
    const clientPath = path.join(__dirname, '..', 'client', 'dist');
    app.use(express.static(clientPath));

    app.get('*', (req, res) =>
        res.sendFile(path.join(clientPath, 'index.html'))
    );
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

// Seed Admin
const seedAdmin = async () => {
    try {
        const adminExists = await Admin.findOne({ email: 'ramdasshariram@gmail.com' });
        if (!adminExists) {
            await Admin.create({
                email: 'ramdasshariram@gmail.com',
                password: 'hari567@4'
            });
            console.log('Default admin seeded');
        }
    } catch (error) {
        console.error('Admin seeding failed:', error);
    }
};

// Seed Colleges (Tamil Nadu Extensive List)
const seedColleges = async () => {
    try {
        const count = await College.countDocuments();
        if (count > 0) return;

        const majorColleges = [
            // Erode
            { name: "Kongu Engineering College", district: "Erode", type: "Engineering", affiliation: "Autonomous" },
            { name: "Bannari Amman Institute of Technology", district: "Erode", type: "Engineering", affiliation: "Autonomous" },
            { name: "Nandha Engineering College", district: "Erode", type: "Engineering", affiliation: "Anna University" },
            { name: "Erode Sengunthar Engineering College", district: "Erode", type: "Engineering", affiliation: "Anna University" },
            { name: "Velalar College of Engineering and Technology", district: "Erode", type: "Engineering", affiliation: "Autonomous" },

            // Coimbatore
            { name: "PSG College of Technology", district: "Coimbatore", type: "Engineering", affiliation: "Autonomous" },
            { name: "Kumaraguru College of Technology", district: "Coimbatore", type: "Engineering", affiliation: "Autonomous" },
            { name: "Government College of Technology", district: "Coimbatore", type: "Engineering" },
            { name: "Coimbatore Institute of Technology", district: "Coimbatore", type: "Engineering", affiliation: "Government Aided" },
            { name: "Sri Krishna College of Engineering and Technology", district: "Coimbatore", type: "Engineering", affiliation: "Autonomous" },
            { name: "Sri Ramakrishna Engineering College", district: "Coimbatore", type: "Engineering", affiliation: "Autonomous" },
            { name: "Amrita Vishwa Vidyapeetham", district: "Coimbatore", type: "Engineering", affiliation: "Deemed" },

            // Chennai
            { name: "College of Engineering, Guindy", district: "Chennai", type: "Engineering", affiliation: "Anna University" },
            { name: "Madras Institute of Technology", district: "Chennai", type: "Engineering", affiliation: "Anna University" },
            { name: "Loyola College", district: "Chennai", type: "Arts & Science" },
            { name: "Madras Christian College", district: "Chennai", type: "Arts & Science" },
            { name: "Madras Medical College", district: "Chennai", type: "Medical" },
            { name: "Stanley Medical College", district: "Chennai", type: "Medical" },
            { name: "St. Joseph's College of Engineering", district: "Chennai", type: "Engineering", affiliation: "Autonomous" },
            { name: "Panimalar Engineering College", district: "Chennai", type: "Engineering" },

            // Trichy / Madurai / Salem
            { name: "National Institute of Technology", district: "Tiruchirappalli", type: "Engineering", affiliation: "NIT" },
            { name: "Thiagarajar College of Engineering", district: "Madurai", type: "Engineering", affiliation: "Autonomous" },
            { name: "Government College of Engineering, Salem", district: "Salem", type: "Engineering" },
            { name: "Government College of Engineering, Bargur", district: "Krishnagiri", type: "Engineering" },
            { name: "Government College of Engineering, Tirunelveli", district: "Tirunelveli", type: "Engineering" },

            // Polytechnic
            { name: "Government Polytechnic College, Erode", district: "Erode", type: "Polytechnic" },
            { name: "Government Polytechnic College, Coimbatore", district: "Coimbatore", type: "Polytechnic" },
            { name: "Nandha Polytechnic College", district: "Erode", type: "Polytechnic" },

            // Arts
            { name: "PSG College of Arts and Science", district: "Coimbatore", type: "Arts & Science" },
            { name: "Kongu Arts and Science College", district: "Erode", type: "Arts & Science" },
            { name: "Bishop Heber College", district: "Tiruchirappalli", type: "Arts & Science" }
        ];

        await College.insertMany(majorColleges);
        console.log('Tamil Nadu colleges database initialized');
    } catch (error) {
        console.error('College seeding failed:', error);
    }
};

// Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
