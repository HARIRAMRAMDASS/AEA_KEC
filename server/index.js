const express = require('express');
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
const Admin = require('./models/Admin');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        seedAdmin();
    })
    .catch(err => console.log(err));

app.use(cors({
    origin: process.env.CLIENT_URL,
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

app.get('/', (req, res) => {
    res.send('API is running...');
});

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

// Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
