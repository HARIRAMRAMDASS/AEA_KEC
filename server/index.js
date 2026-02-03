const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("MONGO_URI is not defined in .env");
}

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Serve static files from the React app (Client)
// This enables the "one service" deployment model if desired, or just helpful for testing.
// In production on Render, if we deploy as a backend service that also serves frontend:
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
    // Only send index.html if the request isn't an API request
    if (!req.path.startsWith('/api')) {
         res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
