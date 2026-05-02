import {
  getAccountSettingsMe,
  getEmployees,
  getManufacturingOverview,
  getOrderStats,
  getProducts,
  getSections,
  createEmployee,
  updateEmployee,
  createJob,
  createCustomerOrder,
  createManufacturingProduct,
  createSection,
  listCustomerOrders,
  listCuttingJobs,
  listFinalJobs,
  listHourlyJobs,
  listJobs,
  listQc,
  getSupervisorDashboard,
  getWashing,
} from '../api/client';
import { aiApi, expensesApi, purchaseApi, salesApi, stockApi } from '../api/erp';
import { ROLES } from '../utils/roles';

const adminManager = [ROLES.ADMIN, ROLES.MANAGER];
const productionRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR];
const stockRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.OPERATOR];
const accountingRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT];
const salesRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.ACCOUNTANT];

export const modules = [
  {
    key: 'manufacturing',
    label: 'Manufacturing',
    icon: 'factory',
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR, ROLES.OPERATOR],
    items: [
      { key: 'overview', title: 'Overview', loader: () => getManufacturingOverview(), roles: productionRoles },
      { key: 'workflow', title: 'Workflow Board', loader: () => listJobs({ limit: 50 }), roles: productionRoles },
      { key: 'jobs', title: 'All Jobs', loader: () => listJobs({ limit: 50 }), creator: (payload) => createJob(payload), detailLoader: (id) => listJobs().then(() => ({ data: { id } })), roles: productionRoles },
      { key: 'cutting', title: 'Cutting', loader: () => listCuttingJobs(), roles: productionRoles },
      { key: 'washing', title: 'Washing Gatepass', loader: () => getWashing(), roles: productionRoles },
      { key: 'qc', title: 'QC Checking', loader: () => listQc(), roles: productionRoles },
      { key: 'final', title: 'Final Checking', loader: () => listFinalJobs(), roles: productionRoles },
      { key: 'line-assignment', title: 'Line Assignment', loader: () => listJobs({ status: 'ready_for_line_assignment' }), roles: productionRoles },
      { key: 'sections', title: 'Sections & Supervisors', loader: () => getSections(), creator: (payload) => createSection(payload), roles: productionRoles },
      { key: 'hourly', title: 'Hourly Production', loader: () => listHourlyJobs(), roles: [...productionRoles, ROLES.OPERATOR] },
      { key: 'supervisor', title: 'Supervisor Dashboard', loader: () => getSupervisorDashboard(), roles: productionRoles },
    ],
  },
  {
    key: 'orders',
    label: 'Orders',
    icon: 'clipboard-list',
    roles: productionRoles,
    items: [
      { key: 'orders-dashboard', title: 'Orders Dashboard', loader: () => getOrderStats(), roles: productionRoles },
      { key: 'all-orders', title: 'All Orders', loader: () => listCustomerOrders({ limit: 50 }), creator: (payload) => createCustomerOrder(payload), roles: productionRoles },
      { key: 'order-report', title: 'Order Report', loader: () => listCustomerOrders({ limit: 50 }), roles: accountingRoles },
    ],
  },
  {
    key: 'expenses',
    label: 'Expenses',
    icon: 'cash-multiple',
    roles: [...accountingRoles, ROLES.EMPLOYEE, ROLES.OPERATOR, ROLES.SUPERVISOR],
    items: [
      { key: 'financial-health', title: 'Financial Health', loader: () => expensesApi.summary(new Date().getFullYear()), roles: accountingRoles },
      { key: 'categories', title: 'Categories', loader: () => expensesApi.categories(), creator: (payload) => expensesApi.createCategory(payload), updater: (id, payload) => expensesApi.updateCategory(id, payload), remover: (id) => expensesApi.deleteCategory(id), roles: accountingRoles },
      { key: 'expenses', title: 'All Expenses', loader: () => expensesApi.list(), creator: (payload) => expensesApi.create(payload), updater: (id, payload) => expensesApi.update(id, payload), remover: (id) => expensesApi.delete(id), roles: accountingRoles },
      { key: 'recurring', title: 'Recurring Costs', loader: () => expensesApi.recurring(), roles: accountingRoles },
      { key: 'reimbursements', title: 'Reimbursements', loader: () => expensesApi.reimbursements(), creator: (payload) => expensesApi.createReimbursement(payload), roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.EMPLOYEE, ROLES.OPERATOR, ROLES.SUPERVISOR] },
    ],
  },
  {
    key: 'employees',
    label: 'Employees',
    icon: 'account-group',
    roles: adminManager,
    items: [
      { key: 'employees', title: 'Employee Management', loader: () => getEmployees(), creator: (payload) => createEmployee(payload), updater: (id, payload) => updateEmployee(id, payload), roles: adminManager },
      { key: 'account-requests', title: 'Pending User Requests', loader: () => import('../api/client').then((m) => m.listRegistrationRequests('pending')), roles: [ROLES.ADMIN] },
    ],
  },
  {
    key: 'purchase',
    label: 'Purchasing',
    icon: 'cart',
    roles: productionRoles,
    items: [
      { key: 'suppliers', title: 'Suppliers', loader: () => purchaseApi.suppliers(), creator: (payload) => purchaseApi.createSupplier(payload), roles: productionRoles },
      { key: 'materials', title: 'Material Catalog', loader: () => purchaseApi.materials(), creator: (payload) => purchaseApi.createMaterial(payload), roles: productionRoles },
      { key: 'requisitions', title: 'Requisitions', loader: () => purchaseApi.requisitions(), creator: (payload) => purchaseApi.createRequisition(payload), roles: productionRoles },
      { key: 'purchase-orders', title: 'Purchase Orders', loader: () => purchaseApi.orders(), creator: (payload) => purchaseApi.createOrder(payload), roles: productionRoles },
      { key: 'grn', title: 'Goods Received', loader: () => purchaseApi.grns(), creator: (payload) => purchaseApi.createGrn(payload), roles: productionRoles },
      { key: 'purchase-analytics', title: 'Analytics', loader: () => purchaseApi.analytics(new Date().getFullYear()), roles: productionRoles },
    ],
  },
  {
    key: 'stock',
    label: 'Stock',
    icon: 'package-variant-closed',
    roles: stockRoles,
    items: [
      { key: 'inventory', title: 'Inventory Dashboard', loader: () => stockApi.overview(), roles: productionRoles },
      { key: 'products', title: 'Products', loader: () => getProducts(), creator: (payload) => createManufacturingProduct(payload), roles: productionRoles },
      { key: 'adjustments', title: 'Stock Adjustments', loader: () => stockApi.adjustments(), creator: (payload) => stockApi.createAdjustment(payload), roles: productionRoles },
      { key: 'issuance', title: 'Material Issuance', loader: () => stockApi.issuances(), creator: (payload) => stockApi.createIssuance(payload), roles: stockRoles },
      { key: 'history', title: 'Stock History', loader: () => stockApi.history(), roles: productionRoles },
      { key: 'barcode', title: 'Barcode Scanner', loader: () => stockApi.overview(), roles: stockRoles },
    ],
  },
  {
    key: 'sales',
    label: 'Sales',
    icon: 'cart-check',
    roles: salesRoles,
    items: [
      { key: 'quotations', title: 'Quotations', loader: () => salesApi.quotations(), creator: (payload) => salesApi.createQuotation(payload), roles: productionRoles },
      { key: 'sales-orders', title: 'Sales Orders', loader: () => salesApi.orders(), creator: (payload) => salesApi.createOrder(payload), roles: productionRoles },
      { key: 'invoices', title: 'Invoices', loader: () => salesApi.invoices(), creator: (payload) => salesApi.createInvoice(payload), roles: accountingRoles },
      { key: 'delivery', title: 'Delivery & Dispatch', loader: () => salesApi.delivery(), creator: (payload) => salesApi.createDelivery(payload), roles: productionRoles },
      { key: 'returns', title: 'Sales Returns', loader: () => salesApi.returns(), creator: (payload) => salesApi.createReturn(payload), roles: accountingRoles },
      { key: 'sales-analytics', title: 'Sales Analytics', loader: () => salesApi.analytics(new Date().getFullYear()), roles: accountingRoles },
    ],
  },
  {
    key: 'ai',
    label: 'AI',
    icon: 'brain',
    roles: productionRoles,
    items: [
      { key: 'ai-dashboard', title: 'AI Dashboard', loader: () => aiApi.dashboard(), roles: productionRoles },
      { key: 'wastage', title: 'Wastage Prediction', loader: () => aiApi.predictionHistory('latest'), roles: productionRoles },
      { key: 'efficiency', title: 'Efficiency AI', loader: () => aiApi.dashboard(), roles: productionRoles },
      { key: 'suggestions', title: 'Smart Suggestions', loader: () => aiApi.suggestions(), roles: productionRoles },
      { key: 'worker-performance', title: 'Worker AI', loader: () => aiApi.workerPerformance(), roles: productionRoles },
      { key: 'alerts', title: 'Alerts', loader: () => aiApi.alerts(), roles: productionRoles },
    ],
  },
  {
    key: 'account',
    label: 'Account',
    icon: 'account-cog',
    roles: [],
    items: [
      { key: 'profile', title: 'Profile', loader: () => getAccountSettingsMe(), roles: [] },
      { key: 'settings', title: 'Account Settings', loader: () => getAccountSettingsMe(), roles: [] },
    ],
  },
];

export const getVisibleModules = (user) =>
  modules
    .filter((module) => !module.roles.length || module.roles.includes(user?.role))
    .map((module) => ({
      ...module,
      items: module.items.filter((item) => !item.roles?.length || item.roles.includes(user?.role)),
    }))
    .filter((module) => module.items.length);

export const findModuleItem = (moduleKey, itemKey) =>
  modules.find((module) => module.key === moduleKey)?.items.find((item) => item.key === itemKey);
