import { api, unwrapItems, unwrapList } from './client';

const data = (res) => res.data;

export const expensesApi = {
  categories: (params = {}) => api.get('/expenses/categories', { params }).then(data),
  createCategory: (payload) => api.post('/expenses/categories', payload).then(data),
  updateCategory: (id, payload) => api.put(`/expenses/categories/${id}`, payload).then(data),
  deleteCategory: (id) => api.delete(`/expenses/categories/${id}`).then(data),
  summary: (year) => api.get('/expenses/summary', { params: { year } }).then(data),
  recurring: () => api.get('/expenses/recurring').then(data),
  list: (params = {}) => api.get('/expenses', { params }).then(data),
  create: (payload) => api.post('/expenses', payload).then(data),
  update: (id, payload) => api.put(`/expenses/${id}`, payload).then(data),
  delete: (id) => api.delete(`/expenses/${id}`).then(data),
  reimbursements: (params = {}) => api.get('/reimbursements', { params }).then(data),
  createReimbursement: (payload) => api.post('/reimbursements', payload).then(data),
  approveReimbursement: (id, payload = {}) => api.put(`/reimbursements/${id}/approve`, payload).then(data),
  rejectReimbursement: (id, payload = {}) => api.put(`/reimbursements/${id}/reject`, payload).then(data),
};

export const purchaseApi = {
  suppliers: (params = {}) => api.get('/purchase/suppliers', { params }).then((r) => unwrapItems(r.data)),
  suppliersList: (params = {}) => api.get('/purchase/suppliers', { params: { ...params, paginated: true } }).then((r) => unwrapList(r.data)),
  createSupplier: (payload) => api.post('/purchase/suppliers', payload).then(data),
  updateSupplier: (id, payload) => api.put(`/purchase/suppliers/${id}`, payload).then(data),
  deleteSupplier: (id) => api.delete(`/purchase/suppliers/${id}`).then(data),
  materials: (params = {}) => api.get('/purchase/materials', { params }).then((r) => unwrapItems(r.data)),
  reorderAlerts: () => api.get('/purchase/materials/reorder-alerts').then(data),
  createMaterial: (payload) => api.post('/purchase/materials', payload).then(data),
  updateMaterial: (id, payload) => api.put(`/purchase/materials/${id}`, payload).then(data),
  deleteMaterial: (id) => api.delete(`/purchase/materials/${id}`).then(data),
  requisitions: (params = {}) => api.get('/purchase/requisitions', { params }).then((r) => unwrapItems(r.data)),
  createRequisition: (payload) => api.post('/purchase/requisitions', payload).then(data),
  approveRequisition: (id, payload) => api.put(`/purchase/requisitions/${id}/approve`, payload).then(data),
  rejectRequisition: (id, payload) => api.put(`/purchase/requisitions/${id}/reject`, payload).then(data),
  orders: (params = {}) => api.get('/purchase/orders', { params }).then((r) => unwrapItems(r.data)),
  createOrder: (payload) => api.post('/purchase/orders', payload).then(data),
  updateOrder: (id, payload) => api.put(`/purchase/orders/${id}`, payload).then(data),
  deleteOrder: (id) => api.delete(`/purchase/orders/${id}`).then(data),
  grns: (params = {}) => api.get('/purchase/grn', { params }).then((r) => unwrapItems(r.data)),
  createGrn: (payload) => api.post('/purchase/grn', payload).then(data),
  recordGrnPayment: (id, payload) => api.put(`/purchase/grn/${id}/payment`, payload).then(data),
  analytics: (year) => api.get('/purchase/analytics/summary', { params: { year } }).then(data),
};

export const stockApi = {
  overview: () => api.get('/stock/overview').then(data),
  adjustments: (params = {}) => api.get('/stock/adjustments', { params }).then(data),
  createAdjustment: (payload) => api.post('/stock/adjustments', payload).then(data),
  issuances: (params = {}) => api.get('/stock/issuances', { params }).then(data),
  createIssuance: (payload) => api.post('/stock/issuances', payload).then(data),
  history: (params = {}) => api.get('/stock/history', { params }).then(data),
  materialHistory: (id) => api.get(`/stock/history/material/${id}`).then(data),
  barcodeLookup: (query) => api.post('/stock/barcode/lookup', { query }).then(data),
};

export const salesApi = {
  quotations: (params = {}) => api.get('/sales/quotations', { params }).then(data),
  createQuotation: (payload) => api.post('/sales/quotations', payload).then(data),
  updateQuotation: (id, payload) => api.put(`/sales/quotations/${id}`, payload).then(data),
  deleteQuotation: (id) => api.delete(`/sales/quotations/${id}`).then(data),
  convertQuotation: (id, payload) => api.put(`/sales/quotations/${id}/convert`, payload).then(data),
  orders: (params = {}) => api.get('/sales/orders', { params }).then(data),
  createOrder: (payload) => api.post('/sales/orders', payload).then(data),
  updateOrder: (id, payload) => api.put(`/sales/orders/${id}`, payload).then(data),
  deleteOrder: (id) => api.delete(`/sales/orders/${id}`).then(data),
  invoices: (params = {}) => api.get('/sales/invoices', { params }).then(data),
  createInvoice: (payload) => api.post('/sales/invoices', payload).then(data),
  updateInvoice: (id, payload) => api.put(`/sales/invoices/${id}`, payload).then(data),
  recordPayment: (id, payload) => api.post(`/sales/invoices/${id}/payment`, payload).then(data),
  agingReport: () => api.get('/sales/invoices/aging').then(data),
  delivery: (params = {}) => api.get('/sales/delivery', { params }).then(data),
  createDelivery: (payload) => api.post('/sales/delivery', payload).then(data),
  updateDelivery: (id, payload) => api.put(`/sales/delivery/${id}`, payload).then(data),
  deleteDelivery: (id) => api.delete(`/sales/delivery/${id}`).then(data),
  returns: (params = {}) => api.get('/sales/returns', { params }).then(data),
  createReturn: (payload) => api.post('/sales/returns', payload).then(data),
  approveReturn: (id, payload) => api.put(`/sales/returns/${id}/approve`, payload).then(data),
  rejectReturn: (id, payload) => api.put(`/sales/returns/${id}/reject`, payload).then(data),
  analytics: (year) => api.get('/sales/analytics/summary', { params: { year } }).then(data),
};

export const aiApi = {
  dashboard: () => api.get('/ai/dashboard').then(data),
  jobSummary: (jobId) => api.get(`/ai/job/${jobId}`).then(data),
  predictWastage: (payload) => api.post('/ai/predict/wastage', payload).then(data),
  predictEfficiency: (payload) => api.post('/ai/predict/efficiency', payload).then(data),
  suggestions: (params = {}) => api.get('/ai/suggestions', { params }).then(data),
  alerts: (params = {}) => api.get('/ai/alerts', { params }).then(data),
  workerPerformance: () => api.get('/ai/worker-performance').then(data),
  predictionHistory: (jobId) => api.get(`/ai/prediction-history/${jobId}`).then(data),
};
