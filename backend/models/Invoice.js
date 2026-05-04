const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true },
    quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
    customerName: { type: String, required: true },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    totalAmount: { type: Number, required: true },
    taxAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    notes: { type: String },
    status: { type: String, enum: ['Pending', 'Partial Payment', 'Paid', 'Cancelled', 'Overdue'], default: 'Pending' },
    paymentType: { type: String, default: 'Unpaid' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
