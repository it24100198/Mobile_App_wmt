const Quotation = require('../models/Quotation');

exports.createQuotation = async (req, res) => {
    try {
        const quoteNumber = 'QT-' + Math.floor(100000 + Math.random() * 900000);
        const quotation = new Quotation({ ...req.body, quoteNumber });
        const savedQuotation = await quotation.save();
        res.status(201).json(savedQuotation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find().sort({ createdAt: -1 });
        res.status(200).json(quotations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getQuotationById = async (req, res) => {
    try {
        const idParam = req.params.id.trim();
        let quotation;

        if (/^[0-9a-fA-F]{24}$/.test(idParam)) {
            quotation = await Quotation.findById(idParam);
        }

        if (!quotation) {
            quotation = await Quotation.findOne({ quoteNumber: new RegExp('^' + idParam + '$', 'i') });
        }

        if (!quotation && idParam.length <= 24) {
            const allQuotes = await Quotation.find();
            quotation = allQuotes.find(q => q._id.toString().toLowerCase().endsWith(idParam.toLowerCase()));
        }

        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
        res.status(200).json(quotation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateQuotation = async (req, res) => {
    try {
        const updatedQuotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedQuotation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteQuotation = async (req, res) => {
    try {
        await Quotation.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Quotation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
