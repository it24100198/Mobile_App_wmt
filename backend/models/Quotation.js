const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
    quoteNumber: { type: String, unique: true },
    customerName: { type: String, required: true },
    phoneNumber: { type: String },
    emailAddress: { type: String },
    billingAddress: { type: String },
    items: [
        {
            description: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true }
        }
    ],
    quoteDate: { type: Date, default: Date.now },
    validUntil: { type: Date },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Converted'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Quotation', quotationSchema);
