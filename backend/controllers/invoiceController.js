const Invoice = require('../models/Invoice');

exports.createInvoice = async (req, res) => {
    try {
        const invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);
        const invoice = new Invoice({ ...req.body, invoiceNumber });
        const savedInvoice = await invoice.save();
        res.status(201).json(savedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('quoteId').sort({ createdAt: -1 });
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const idParam = req.params.id.trim();
        let invoice;

        if (/^[0-9a-fA-F]{24}$/.test(idParam)) {
            invoice = await Invoice.findById(idParam).populate('quoteId');
        }

        if (!invoice) {
            invoice = await Invoice.findOne({ invoiceNumber: new RegExp('^' + idParam + '$', 'i') }).populate('quoteId');
        }

        if (!invoice && idParam.length <= 24) {
            const allInvoices = await Invoice.find().populate('quoteId');
            const searchSuffix = idParam.toUpperCase().startsWith('INV-') ? idParam.substring(4) : idParam;
            invoice = allInvoices.find(inv => inv._id.toString().toLowerCase().endsWith(searchSuffix.toLowerCase()));
        }

        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateInvoice = async (req, res) => {
    try {
        const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedInvoice);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteInvoice = async (req, res) => {
    try {
        await Invoice.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
