const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const quotationRoutes = require('./routes/quotationRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/quotations', quotationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Connected to MongoDB successfully');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
