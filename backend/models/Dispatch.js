const mongoose = require('mongoose');

const dispatchSchema = new mongoose.Schema({
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    customerName: { type: String, required: true },
    expectedDeliveryDate: { type: Date },
    deliveryAddress: { type: String, required: true },
    courierPartner: { type: String },
    trackingId: { type: String },
    status: { type: String, enum: ['Packed', 'Shipped', 'Delivered'], default: 'Packed' }
}, { timestamps: true });

module.exports = mongoose.model('Dispatch', dispatchSchema);
