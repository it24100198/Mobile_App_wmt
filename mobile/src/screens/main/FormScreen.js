import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ScreenScaffold from '../../components/ScreenScaffold';
import TextField from '../../components/TextField';
import { getMaterials, getSections } from '../../api/client';
import { expensesApi, purchaseApi, salesApi } from '../../api/erp';
import { findModuleItem } from '../../navigation/modules';
import { colors } from '../../theme/colors';

const today = () => new Date().toISOString().slice(0, 10);

const expenseTypes = ['rent', 'electricity', 'salaries', 'maintenance', 'internet', 'transport', 'other'];
const categoryStatuses = ['active', 'inactive'];
const paymentMethods = ['cash', 'bank_transfer', 'credit_card'];
const expenseStatuses = ['recorded', 'pending', 'approved', 'rejected'];
const reimbursementTypes = ['travel', 'meal', 'other'];
const employeeRoles = ['admin', 'manager', 'supervisor', 'accountant', 'operator', 'employee'];
const supervisorRoles = ['supervisor', 'line_supervisor', 'washing_supervisor', 'cutting_supervisor'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const materialCategories = ['fabric', 'accessory', 'packaging', 'thread', 'chemical', 'other'];
const materialUnits = ['meters', 'kg', 'pcs', 'rolls', 'liters', 'boxes'];
const priorityOptions = ['low', 'medium', 'high'];
const poStatuses = ['draft', 'sent'];
const conditions = ['good', 'damaged'];
const productStatuses = ['draft', 'active', 'inactive'];
const productClassifications = ['normal', 'damage'];
const adjustmentTypes = ['add', 'subtract'];
const quoteStatuses = ['draft', 'sent', 'approved', 'rejected'];
const salesOrderStatuses = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'];
const invoiceTypes = ['tax', 'proforma'];
const deliveryStatuses = ['pending', 'packed', 'shipped', 'delivered'];
const returnStatuses = ['pending', 'approved', 'rejected', 'completed'];
const refundTypes = ['credit_note', 'replacement', 'refund'];
const returnConditions = ['sellable', 'damaged'];

const labels = {
  bank_transfer: 'Bank transfer',
  credit_card: 'Credit card',
  draft: 'Pending',
  sent: 'Approved',
  good: 'Good',
  damaged: 'Damaged',
};

function ChoiceGroup({ label, value, options, onChange }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.choices}>
        {options.map((option) => {
          const active = value === option;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}
            >
              <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
                {labels[option] || option.replace(/_/g, ' ')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ToggleRow({ label, value, onValueChange }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.label}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} thumbColor={value ? colors.primary : '#f4f4f5'} />
    </View>
  );
}

function CategorySelector({ value, onChange, categories, loading }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>Category</Text>
      {loading ? <LoadingState message="Loading categories..." /> : null}
      {!loading && (
        <View style={styles.choices}>
          {categories.map((category) => {
            const id = category?._id || category?.id;
            const active = value === id;
            return (
              <Pressable
                key={id}
                onPress={() => onChange(id)}
                style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}
              >
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{category.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {!loading && categories.length === 0 && (
        <Text style={styles.helpText}>No categories found. Create a category first.</Text>
      )}
    </View>
  );
}

export default function FormScreen({ route, navigation }) {
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sections, setSections] = useState([]);
  const [purchaseMetaLoading, setPurchaseMetaLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [manufacturingMaterialsLoading, setManufacturingMaterialsLoading] = useState(false);
  const [manufacturingMaterials, setManufacturingMaterials] = useState([]);
  const [salesMetaLoading, setSalesMetaLoading] = useState(false);
  const [salesOrders, setSalesOrders] = useState([]);
  const item = findModuleItem(route.params?.moduleKey, route.params?.itemKey);
  const formKey = route.params?.itemKey;
  const isEditing = route.params?.mode === 'edit';
  const editingRecord = route.params?.record || null;
  const prefill = route.params?.prefill || null;

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'other',
    description: '',
    isRecurring: false,
    recurringDay: '',
    status: 'active',
  });

  const [expenseForm, setExpenseForm] = useState({
    category: '',
    amount: '',
    date: today(),
    description: '',
    paymentMethod: 'cash',
    isPettyCash: false,
    vendorName: '',
    receiptUrl: '',
    approvedBy: '',
    status: 'pending',
    isRecurring: false,
    recurringMonth: '',
  });

  const [reimbursementForm, setReimbursementForm] = useState({
    employeeName: '',
    amount: '',
    type: 'other',
    expenseDate: today(),
    description: '',
    receiptUrl: '',
    paymentMethod: '',
  });

  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'operator',
    salary: '0',
    productionSectionId: '',
    isActive: true,
  });

  const [orderForm, setOrderForm] = useState({
    orderNumber: '',
    customerName: '',
    customerContact: '',
    productDescription: '',
    quantity: '',
    expectedDeliveryDate: today(),
    notes: '',
  });

  const [jobForm, setJobForm] = useState({
    materialId: '',
    issuedFabricQuantity: '',
    styleRef: '',
    batchRef: '',
    accessories: '',
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    isActive: true,
  });

  const [materialForm, setMaterialForm] = useState({
    name: '',
    category: 'fabric',
    uom: 'pcs',
    unitPrice: '',
    currentStock: '',
    description: '',
  });

  const [requisitionForm, setRequisitionForm] = useState({
    requestedBy: '',
    section: '',
    material: '',
    qty: '',
    requiredDate: today(),
    urgency: 'medium',
  });

  const [purchaseOrderForm, setPurchaseOrderForm] = useState({
    supplier: '',
    material: '',
    description: '',
    qty: '',
    unitPrice: '',
    expectedDeliveryDate: today(),
    status: 'draft',
  });

  const [grnForm, setGrnForm] = useState({
    purchaseOrder: '',
    material: '',
    description: '',
    orderedQty: '',
    receivedQty: '',
    condition: 'good',
    receivedDate: today(),
    receivedBy: '',
    notes: '',
  });

  const [stockProductForm, setStockProductForm] = useState({
    name: '',
    sku: '',
    classification: 'normal',
    status: 'active',
    stockQty: '',
  });

  const [stockAdjustmentForm, setStockAdjustmentForm] = useState({
    material: '',
    adjustmentType: 'add',
    quantity: '',
    reason: '',
    adjustedBy: '',
    note: '',
  });

  const [issuanceForm, setIssuanceForm] = useState({
    material: '',
    issuedTo: '',
    issuedBy: '',
    quantity: '',
    jobReference: '',
    note: '',
  });

  const [salesForm, setSalesForm] = useState({
    salesOrder: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    itemDescription: '',
    qty: '',
    unitPrice: '',
    costPrice: '',
    taxRate: '0',
    validUntil: today(),
    deliveryDate: today(),
    dueDate: today(),
    invoiceType: 'tax',
    status: 'draft',
    driver: '',
    vehicle: '',
    refundType: 'credit_note',
    condition: 'sellable',
    notes: '',
  });

  const updateCategory = (key, value) => setCategoryForm((prev) => ({ ...prev, [key]: value }));
  const updateExpense = (key, value) => setExpenseForm((prev) => ({ ...prev, [key]: value }));
  const updateReimbursement = (key, value) => setReimbursementForm((prev) => ({ ...prev, [key]: value }));
  const updateEmployee = (key, value) => setEmployeeForm((prev) => ({ ...prev, [key]: value }));
  const updateOrder = (key, value) => setOrderForm((prev) => ({ ...prev, [key]: value }));
  const updateJob = (key, value) => setJobForm((prev) => ({ ...prev, [key]: value }));
  const updateSupplier = (key, value) => setSupplierForm((prev) => ({ ...prev, [key]: value }));
  const updateMaterial = (key, value) => setMaterialForm((prev) => ({ ...prev, [key]: value }));
  const updateRequisition = (key, value) => setRequisitionForm((prev) => ({ ...prev, [key]: value }));
  const updatePurchaseOrder = (key, value) => setPurchaseOrderForm((prev) => ({ ...prev, [key]: value }));
  const updateGrn = (key, value) => setGrnForm((prev) => ({ ...prev, [key]: value }));
  const updateStockProduct = (key, value) => setStockProductForm((prev) => ({ ...prev, [key]: value }));
  const updateStockAdjustment = (key, value) => setStockAdjustmentForm((prev) => ({ ...prev, [key]: value }));
  const updateIssuance = (key, value) => setIssuanceForm((prev) => ({ ...prev, [key]: value }));
  const updateSales = (key, value) => setSalesForm((prev) => ({ ...prev, [key]: value }));

  const needsCategories = formKey === 'expenses';
  const needsSections = formKey === 'employees';
  const needsManufacturingMaterials = formKey === 'jobs';
  const isSalesForm = ['quotations', 'sales-orders', 'invoices', 'delivery', 'returns'].includes(formKey);
  const needsSalesOrders = ['invoices', 'delivery', 'returns'].includes(formKey);
  const needsPurchaseMeta = ['requisitions', 'purchase-orders', 'grn', 'adjustments', 'issuance'].includes(formKey);

  useEffect(() => {
    if (formKey !== 'categories' || !isEditing || !editingRecord) return;

    setCategoryForm({
      name: editingRecord.name || '',
      type: editingRecord.type || 'other',
      description: editingRecord.description || '',
      isRecurring: !!editingRecord.isRecurring,
      recurringDay: editingRecord.recurringDay ? String(editingRecord.recurringDay) : '',
      status: editingRecord.status || 'active',
    });
  }, [editingRecord, formKey, isEditing]);

  useEffect(() => {
    if (formKey !== 'expenses' || !isEditing || !editingRecord) return;

    setExpenseForm({
      category: editingRecord.category?._id || editingRecord.category || '',
      amount: String(editingRecord.amount ?? ''),
      date: editingRecord.date ? new Date(editingRecord.date).toISOString().slice(0, 10) : today(),
      description: editingRecord.description || '',
      paymentMethod: editingRecord.paymentMethod || 'cash',
      isPettyCash: !!editingRecord.isPettyCash,
      vendorName: editingRecord.vendorName || '',
      receiptUrl: editingRecord.receiptUrl || '',
      approvedBy: editingRecord.approvedBy || '',
      status: editingRecord.status || 'pending',
      isRecurring: !!editingRecord.isRecurring,
      recurringMonth: editingRecord.recurringMonth ? String(editingRecord.recurringMonth) : '',
    });
  }, [editingRecord, formKey, isEditing]);

  useEffect(() => {
    if (formKey !== 'expenses' || isEditing || !prefill) return;

    setExpenseForm((prev) => ({
      ...prev,
      category: prefill.category || prev.category,
      date: prefill.date || prev.date,
      description: prefill.description || prev.description,
      paymentMethod: prefill.paymentMethod || prev.paymentMethod,
      isRecurring: !!prefill.isRecurring,
      recurringMonth: prefill.recurringMonth ? String(prefill.recurringMonth) : prev.recurringMonth,
    }));
  }, [formKey, isEditing, prefill]);

  useEffect(() => {
    if (formKey !== 'employees' || !isEditing || !editingRecord) return;

    setEmployeeForm({
      name: editingRecord.name || editingRecord.userId?.name || '',
      email: editingRecord.userId?.email || editingRecord.email || '',
      phone: editingRecord.phone || '',
      role: editingRecord.role || 'operator',
      salary: String(editingRecord.salary ?? '0'),
      productionSectionId: editingRecord.productionSectionId?._id || editingRecord.productionSectionId || '',
      isActive: editingRecord.userId?.isActive !== false,
    });
  }, [editingRecord, formKey, isEditing]);

  useEffect(() => {
    if (formKey !== 'suppliers' || !isEditing || !editingRecord) return;

    setSupplierForm({
      name: editingRecord.name || '',
      contactPerson: editingRecord.contactPerson || '',
      email: editingRecord.email || '',
      phone: editingRecord.phone || editingRecord.contactInfo || '',
      address: editingRecord.address || '',
      isActive: editingRecord.isActive !== false && editingRecord.status !== 'inactive',
    });
  }, [editingRecord, formKey, isEditing]);

  useEffect(() => {
    if (formKey !== 'materials' || !isEditing || !editingRecord) return;

    setMaterialForm({
      name: editingRecord.name || '',
      category: editingRecord.category || 'fabric',
      uom: editingRecord.uom || editingRecord.unit || 'pcs',
      unitPrice: String(editingRecord.unitPrice ?? ''),
      currentStock: String(editingRecord.currentStock ?? editingRecord.stockQuantity ?? ''),
      description: editingRecord.description || '',
    });
  }, [editingRecord, formKey, isEditing]);

  useEffect(() => {
    if (formKey !== 'purchase-orders' || !isEditing || !editingRecord) return;

    const firstItem = Array.isArray(editingRecord.items) ? editingRecord.items[0] : null;
    setPurchaseOrderForm({
      supplier: editingRecord.supplier?._id || editingRecord.supplier || '',
      material: firstItem?.material?._id || firstItem?.material || '',
      description: firstItem?.description || '',
      qty: String(firstItem?.qty ?? firstItem?.quantity ?? ''),
      unitPrice: String(firstItem?.unitPrice ?? ''),
      expectedDeliveryDate: editingRecord.expectedDeliveryDate ? new Date(editingRecord.expectedDeliveryDate).toISOString().slice(0, 10) : today(),
      status: editingRecord.status || 'draft',
    });
  }, [editingRecord, formKey, isEditing]);

  useEffect(() => {
    if (!isSalesForm || !isEditing || !editingRecord) return;

    const firstItem = Array.isArray(editingRecord.items) ? editingRecord.items[0] : null;
    setSalesForm({
      salesOrder: editingRecord.salesOrder?._id || editingRecord.salesOrder || '',
      customerName: editingRecord.customer?.name || '',
      customerEmail: editingRecord.customer?.email || '',
      customerPhone: editingRecord.customer?.phone || '',
      customerAddress: editingRecord.customer?.address || '',
      itemDescription: firstItem?.description || '',
      qty: String(firstItem?.qty ?? ''),
      unitPrice: String(firstItem?.unitPrice ?? ''),
      costPrice: String(firstItem?.costPrice ?? ''),
      taxRate: String(editingRecord.taxRate ?? '0'),
      validUntil: editingRecord.validUntil ? new Date(editingRecord.validUntil).toISOString().slice(0, 10) : today(),
      deliveryDate: editingRecord.deliveryDate ? new Date(editingRecord.deliveryDate).toISOString().slice(0, 10) : today(),
      dueDate: editingRecord.dueDate ? new Date(editingRecord.dueDate).toISOString().slice(0, 10) : today(),
      invoiceType: editingRecord.invoiceType || 'tax',
      status: editingRecord.status || (formKey === 'quotations' ? 'draft' : formKey === 'sales-orders' ? 'pending' : formKey === 'delivery' ? 'pending' : 'pending'),
      driver: editingRecord.driver || '',
      vehicle: editingRecord.vehicle || '',
      refundType: editingRecord.refundType || 'credit_note',
      condition: firstItem?.condition || 'sellable',
      notes: editingRecord.notes || firstItem?.reason || '',
    });
  }, [editingRecord, formKey, isEditing, isSalesForm]);

  useEffect(() => {
    if (formKey !== 'products' || !isEditing || !editingRecord) return;

    setStockProductForm({
      name: editingRecord.name || '',
      sku: editingRecord.sku || '',
      classification: editingRecord.classification || 'normal',
      status: editingRecord.status || 'active',
      stockQty: String(editingRecord.stockQty ?? ''),
    });
  }, [editingRecord, formKey, isEditing]);

  const loadCategories = useCallback(async () => {
    if (!needsCategories) return;
    setCategoriesLoading(true);
    try {
      const list = await expensesApi.categories({ status: 'active' });
      setCategories(Array.isArray(list) ? list : list?.items || []);
    } catch {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, [needsCategories]);

  const loadSections = useCallback(async () => {
    if (!needsSections) return;
    setSectionsLoading(true);
    try {
      const res = await getSections();
      const data = res?.data ?? res;
      setSections(Array.isArray(data) ? data : data?.items || data?.data || []);
    } catch {
      setSections([]);
    } finally {
      setSectionsLoading(false);
    }
  }, [needsSections]);

  const loadManufacturingMaterials = useCallback(async () => {
    if (!needsManufacturingMaterials) return;
    setManufacturingMaterialsLoading(true);
    try {
      const res = await getMaterials();
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : data?.items || data?.data || [];
      setManufacturingMaterials(list.filter((material) => (material.type || material.category || '').toLowerCase() === 'fabric'));
    } catch {
      setManufacturingMaterials([]);
    } finally {
      setManufacturingMaterialsLoading(false);
    }
  }, [needsManufacturingMaterials]);

  const loadPurchaseMeta = useCallback(async () => {
    if (!needsPurchaseMeta) return;
    setPurchaseMetaLoading(true);
    try {
      const [supplierList, materialList, orderList] = await Promise.all([
        purchaseApi.suppliers().catch(() => []),
        purchaseApi.materials().catch(() => []),
        purchaseApi.orders().catch(() => []),
      ]);
      setSuppliers(Array.isArray(supplierList) ? supplierList : supplierList?.items || []);
      setMaterials(Array.isArray(materialList) ? materialList : materialList?.items || []);
      setPurchaseOrders(Array.isArray(orderList) ? orderList : orderList?.items || []);
    } finally {
      setPurchaseMetaLoading(false);
    }
  }, [needsPurchaseMeta]);

  const loadSalesMeta = useCallback(async () => {
    if (!needsSalesOrders) return;
    setSalesMetaLoading(true);
    try {
      const list = await salesApi.orders();
      setSalesOrders(Array.isArray(list) ? list : list?.items || list?.data || []);
    } catch {
      setSalesOrders([]);
    } finally {
      setSalesMetaLoading(false);
    }
  }, [needsSalesOrders]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  useEffect(() => {
    loadManufacturingMaterials();
  }, [loadManufacturingMaterials]);

  useEffect(() => {
    loadPurchaseMeta();
  }, [loadPurchaseMeta]);

  useEffect(() => {
    loadSalesMeta();
  }, [loadSalesMeta]);

  useEffect(() => {
    if (!isSalesForm || isEditing) return;
    const defaultStatus = formKey === 'quotations'
      ? 'draft'
      : formKey === 'sales-orders'
        ? 'pending'
        : formKey === 'delivery'
          ? 'pending'
          : formKey === 'returns'
            ? 'pending'
            : salesForm.status;
    if (salesForm.status !== defaultStatus) updateSales('status', defaultStatus);
  }, [formKey, isEditing, isSalesForm, salesForm.status]);

  useEffect(() => {
    if (!expenseForm.category && categories[0]?._id) {
      updateExpense('category', categories[0]._id);
    }
  }, [categories, expenseForm.category]);

  useEffect(() => {
    if (!jobForm.materialId && manufacturingMaterials[0]?._id) {
      updateJob('materialId', manufacturingMaterials[0]._id);
    }
  }, [jobForm.materialId, manufacturingMaterials]);

  useEffect(() => {
    if (!salesForm.salesOrder && salesOrders[0]?._id) {
      const order = salesOrders[0];
      updateSales('salesOrder', order._id);
      updateSales('customerName', order.customer?.name || '');
      updateSales('customerEmail', order.customer?.email || '');
      updateSales('customerPhone', order.customer?.phone || '');
      updateSales('customerAddress', order.customer?.address || '');
      const firstItem = Array.isArray(order.items) ? order.items[0] : null;
      if (firstItem) {
        updateSales('itemDescription', firstItem.description || '');
        updateSales('qty', String(firstItem.qty ?? ''));
        updateSales('unitPrice', String(firstItem.unitPrice ?? ''));
        updateSales('costPrice', String(firstItem.costPrice ?? ''));
      }
    }
  }, [salesForm.salesOrder, salesOrders]);

  useEffect(() => {
    if (!requisitionForm.material && materials[0]?._id) updateRequisition('material', materials[0]._id);
    if (!purchaseOrderForm.material && materials[0]?._id) {
      const material = materials[0];
      updatePurchaseOrder('material', material._id);
      updatePurchaseOrder('description', material.name || '');
      updatePurchaseOrder('unitPrice', String(material.unitPrice ?? ''));
    }
    if (!purchaseOrderForm.supplier && suppliers[0]?._id) updatePurchaseOrder('supplier', suppliers[0]._id);
    if (!grnForm.purchaseOrder && purchaseOrders[0]?._id) updateGrn('purchaseOrder', purchaseOrders[0]._id);
    if (!grnForm.material && materials[0]?._id) {
      updateGrn('material', materials[0]._id);
      updateGrn('description', materials[0].name || '');
    }
    if (!stockAdjustmentForm.material && materials[0]?._id) updateStockAdjustment('material', materials[0]._id);
    if (!issuanceForm.material && materials[0]?._id) updateIssuance('material', materials[0]._id);
  }, [grnForm.material, grnForm.purchaseOrder, issuanceForm.material, materials, purchaseOrderForm.material, purchaseOrderForm.supplier, purchaseOrders, requisitionForm.material, stockAdjustmentForm.material, suppliers]);

  const payload = useMemo(() => {
    if (formKey === 'categories') {
      return {
        name: categoryForm.name.trim(),
        type: categoryForm.type,
        description: categoryForm.description.trim(),
        isRecurring: categoryForm.isRecurring,
        recurringDay: categoryForm.isRecurring && categoryForm.recurringDay ? Number(categoryForm.recurringDay) : null,
        status: categoryForm.status,
      };
    }

    if (formKey === 'expenses') {
      return {
        category: expenseForm.category,
        amount: Number(expenseForm.amount),
        date: expenseForm.date,
        description: expenseForm.description.trim(),
        paymentMethod: expenseForm.paymentMethod,
        isPettyCash: expenseForm.isPettyCash,
        vendorName: expenseForm.vendorName.trim(),
        receiptUrl: expenseForm.receiptUrl.trim(),
        approvedBy: expenseForm.approvedBy.trim(),
        status: expenseForm.status,
        isRecurring: expenseForm.isRecurring,
        recurringMonth: expenseForm.recurringMonth ? Number(expenseForm.recurringMonth) : null,
      };
    }

    if (formKey === 'reimbursements') {
      return {
        employeeName: reimbursementForm.employeeName.trim(),
        amount: Number(reimbursementForm.amount),
        type: reimbursementForm.type,
        expenseDate: reimbursementForm.expenseDate,
        description: reimbursementForm.description.trim(),
        receiptUrl: reimbursementForm.receiptUrl.trim(),
        paymentMethod: reimbursementForm.paymentMethod.trim(),
      };
    }

    if (formKey === 'employees') {
      return {
        name: employeeForm.name.trim(),
        email: employeeForm.email.trim().toLowerCase(),
        phone: employeeForm.phone.trim(),
        role: employeeForm.role,
        salary: Number(employeeForm.salary),
        productionSectionId: employeeForm.productionSectionId || null,
        isActive: employeeForm.isActive,
      };
    }

    if (formKey === 'all-orders') {
      return {
        orderNumber: orderForm.orderNumber.trim(),
        customerName: orderForm.customerName.trim(),
        customerContact: orderForm.customerContact.trim(),
        productDescription: orderForm.productDescription.trim(),
        quantity: Number(orderForm.quantity),
        expectedDeliveryDate: orderForm.expectedDeliveryDate,
        notes: orderForm.notes.trim(),
      };
    }

    if (formKey === 'jobs') {
      return {
        materialId: jobForm.materialId,
        issuedFabricQuantity: Number(jobForm.issuedFabricQuantity),
        styleRef: jobForm.styleRef.trim(),
        batchRef: jobForm.batchRef.trim(),
        accessories: jobForm.accessories.trim() || null,
      };
    }

    if (formKey === 'suppliers') {
      return {
        name: supplierForm.name.trim(),
        contactPerson: supplierForm.contactPerson.trim(),
        email: supplierForm.email.trim(),
        phone: supplierForm.phone.trim(),
        address: supplierForm.address.trim(),
        isActive: supplierForm.isActive,
      };
    }

    if (formKey === 'materials') {
      return {
        name: materialForm.name.trim(),
        category: materialForm.category,
        uom: materialForm.uom,
        unitPrice: Number(materialForm.unitPrice || 0),
        currentStock: Number(materialForm.currentStock || 0),
        description: materialForm.description.trim(),
      };
    }

    if (formKey === 'requisitions') {
      return {
        requestedBy: requisitionForm.requestedBy.trim(),
        section: requisitionForm.section.trim(),
        urgency: requisitionForm.urgency,
        approvalNote: requisitionForm.requiredDate ? `Required date: ${requisitionForm.requiredDate}` : '',
        items: [
          {
            material: requisitionForm.material,
            qty: Number(requisitionForm.qty),
            note: requisitionForm.requiredDate ? `Required date: ${requisitionForm.requiredDate}` : '',
          },
        ],
      };
    }

    if (formKey === 'purchase-orders') {
      const qty = Number(purchaseOrderForm.qty);
      const unitPrice = Number(purchaseOrderForm.unitPrice);
      return {
        supplier: purchaseOrderForm.supplier,
        status: purchaseOrderForm.status,
        expectedDeliveryDate: purchaseOrderForm.expectedDeliveryDate || null,
        items: [
          {
            material: purchaseOrderForm.material || null,
            description: purchaseOrderForm.description.trim(),
            qty,
            unitPrice,
            totalPrice: qty * unitPrice,
          },
        ],
      };
    }

    if (formKey === 'grn') {
      return {
        purchaseOrder: grnForm.purchaseOrder,
        receivedDate: grnForm.receivedDate,
        receivedBy: grnForm.receivedBy.trim(),
        overallQcStatus: grnForm.condition === 'good' ? 'pass' : 'fail',
        notes: grnForm.notes.trim(),
        items: [
          {
            material: grnForm.material || null,
            description: grnForm.description.trim(),
            orderedQty: Number(grnForm.orderedQty),
            receivedQty: Number(grnForm.receivedQty),
            qcStatus: grnForm.condition === 'good' ? 'pass' : 'fail',
            qcNote: grnForm.notes.trim(),
          },
        ],
      };
    }

    if (formKey === 'products') {
      return {
        name: stockProductForm.name.trim(),
        sku: stockProductForm.sku.trim(),
        classification: stockProductForm.classification,
        status: stockProductForm.status,
        stockQty: Number(stockProductForm.stockQty || 0),
      };
    }

    if (formKey === 'adjustments') {
      return {
        material: stockAdjustmentForm.material,
        adjustmentType: stockAdjustmentForm.adjustmentType,
        quantity: Number(stockAdjustmentForm.quantity),
        reason: stockAdjustmentForm.reason.trim(),
        adjustedBy: stockAdjustmentForm.adjustedBy.trim(),
        note: stockAdjustmentForm.note.trim(),
      };
    }

    if (formKey === 'issuance') {
      return {
        material: issuanceForm.material,
        issuedTo: issuanceForm.issuedTo.trim(),
        issuedBy: issuanceForm.issuedBy.trim(),
        quantity: Number(issuanceForm.quantity),
        jobReference: issuanceForm.jobReference.trim(),
        note: issuanceForm.note.trim(),
      };
    }

    if (isSalesForm) {
      const qty = Number(salesForm.qty);
      const unitPrice = Number(salesForm.unitPrice);
      const baseItem = {
        description: salesForm.itemDescription.trim(),
        qty,
        unitPrice,
        totalPrice: qty * unitPrice,
      };
      const customer = {
        name: salesForm.customerName.trim(),
        email: salesForm.customerEmail.trim(),
        phone: salesForm.customerPhone.trim(),
        address: salesForm.customerAddress.trim(),
      };
      if (formKey === 'quotations') {
        return {
          customer,
          items: [baseItem],
          taxRate: Number(salesForm.taxRate || 0),
          validUntil: salesForm.validUntil,
          status: salesForm.status,
          notes: salesForm.notes.trim(),
        };
      }
      if (formKey === 'sales-orders') {
        return {
          customer,
          items: [{ ...baseItem, costPrice: Number(salesForm.costPrice || 0), material: null }],
          taxRate: Number(salesForm.taxRate || 0),
          status: salesForm.status,
          deliveryDate: salesForm.deliveryDate || null,
          notes: salesForm.notes.trim(),
        };
      }
      if (formKey === 'invoices') {
        return {
          salesOrder: salesForm.salesOrder || null,
          customer,
          items: [baseItem],
          taxRate: Number(salesForm.taxRate || 0),
          invoiceType: salesForm.invoiceType,
          dueDate: salesForm.dueDate || null,
          notes: salesForm.notes.trim(),
        };
      }
      if (formKey === 'delivery') {
        return {
          salesOrder: salesForm.salesOrder,
          customer: { name: customer.name, phone: customer.phone, address: customer.address },
          status: salesForm.status,
          driver: salesForm.driver.trim(),
          vehicle: salesForm.vehicle.trim(),
          notes: salesForm.notes.trim(),
        };
      }
      if (formKey === 'returns') {
        return {
          salesOrder: salesForm.salesOrder,
          customer: { name: customer.name, phone: customer.phone },
          items: [{
            description: baseItem.description,
            qty: baseItem.qty,
            reason: salesForm.notes.trim(),
            condition: salesForm.condition,
            material: null,
          }],
          status: salesForm.status,
          refundType: salesForm.refundType,
          notes: salesForm.notes.trim(),
        };
      }
    }

    return null;
  }, [categoryForm, employeeForm, expenseForm, formKey, grnForm, isSalesForm, issuanceForm, jobForm, materialForm, orderForm, purchaseOrderForm, reimbursementForm, requisitionForm, salesForm, stockAdjustmentForm, stockProductForm, supplierForm]);

  const validate = () => {
    if (formKey === 'categories') {
      if (!payload.name) return 'Category name is required.';
      if (payload.isRecurring) {
        if (!Number.isInteger(payload.recurringDay) || payload.recurringDay < 1 || payload.recurringDay > 31) {
          return 'Due on Day of Month must be between 1 and 31.';
        }
      }
    }
    if (formKey === 'expenses') {
      if (!payload.category) return 'Select a category.';
      if (!Number.isFinite(payload.amount) || payload.amount <= 0) return 'Enter a valid amount.';
      if (!payload.date) return 'Date is required.';
      if (payload.isRecurring && (!Number.isInteger(payload.recurringMonth) || payload.recurringMonth < 1 || payload.recurringMonth > 12)) {
        return 'Recurring month must be between 1 and 12.';
      }
    }
    if (formKey === 'reimbursements') {
      if (!payload.employeeName) return 'Employee name is required.';
      if (!Number.isFinite(payload.amount) || payload.amount < 0) return 'Enter a valid amount.';
      if (!payload.description) return 'Description is required.';
    }
    if (formKey === 'employees') {
      if (!payload.name) return 'Employee name is required.';
      if (!payload.email) return 'Email is required.';
      if (!emailPattern.test(payload.email)) return 'Enter a valid email address.';
      if (!payload.phone) return 'Phone number is required.';
      if (!/^[0-9]{10}$/.test(payload.phone)) return 'Phone number must be exactly 10 digits.';
      if (!payload.role) return 'Select a role.';
      if (!Number.isFinite(payload.salary) || payload.salary < 0) return 'Salary cannot be negative.';
      if (supervisorRoles.includes(payload.role) && !payload.productionSectionId) {
        return 'Section is required for supervisor roles.';
      }
    }
    if (formKey === 'all-orders') {
      if (!payload.orderNumber) return 'Order number is required.';
      if (!payload.customerName) return 'Customer name is required.';
      if (!payload.productDescription) return 'Product description is required.';
      if (!Number.isFinite(payload.quantity) || payload.quantity <= 0) return 'Quantity must be greater than 0.';
      if (!payload.expectedDeliveryDate) return 'Expected delivery date is required.';
    }
    if (formKey === 'jobs') {
      if (!payload.materialId) return 'Select a fabric material.';
      if (!Number.isFinite(payload.issuedFabricQuantity) || payload.issuedFabricQuantity <= 0) {
        return 'Issued fabric quantity must be greater than 0.';
      }
    }
    if (formKey === 'suppliers') {
      if (!payload.name) return 'Supplier name is required.';
      if (payload.email && !emailPattern.test(payload.email)) return 'Enter a valid supplier email.';
    }
    if (formKey === 'materials') {
      if (!payload.name) return 'Material name is required.';
      if (!Number.isFinite(payload.unitPrice) || payload.unitPrice < 0) return 'Unit price cannot be negative.';
      if (!Number.isFinite(payload.currentStock) || payload.currentStock < 0) return 'Stock quantity cannot be negative.';
    }
    if (formKey === 'requisitions') {
      if (!payload.requestedBy) return 'Requested by is required.';
      if (!payload.section) return 'Employee or department is required.';
      if (!payload.items[0].material) return 'Select a material.';
      if (!Number.isFinite(payload.items[0].qty) || payload.items[0].qty <= 0) return 'Quantity must be greater than 0.';
      if (!requisitionForm.requiredDate) return 'Required date is required.';
    }
    if (formKey === 'purchase-orders') {
      if (!payload.supplier) return 'Select a supplier.';
      if (!payload.items[0].description) return 'Item description is required.';
      if (!Number.isFinite(payload.items[0].qty) || payload.items[0].qty <= 0) return 'Quantity must be greater than 0.';
      if (!Number.isFinite(payload.items[0].unitPrice) || payload.items[0].unitPrice < 0) return 'Price cannot be negative.';
    }
    if (formKey === 'grn') {
      if (!payload.purchaseOrder) return 'Select a purchase order.';
      if (!payload.receivedBy) return 'Received by is required.';
      if (!payload.items[0].description && !payload.items[0].material) return 'Received item is required.';
      if (!Number.isFinite(payload.items[0].orderedQty) || payload.items[0].orderedQty <= 0) return 'Ordered quantity must be greater than 0.';
      if (!Number.isFinite(payload.items[0].receivedQty) || payload.items[0].receivedQty <= 0) return 'Received quantity must be greater than 0.';
    }
    if (formKey === 'products') {
      if (!payload.name) return 'Product name is required.';
      if (!Number.isFinite(payload.stockQty) || payload.stockQty < 0) return 'Stock quantity cannot be negative.';
    }
    if (formKey === 'adjustments') {
      if (!payload.material) return 'Select a material.';
      if (!Number.isFinite(payload.quantity) || payload.quantity <= 0) return 'Quantity must be greater than 0.';
      if (!payload.reason) return 'Reason is required.';
      if (!payload.adjustedBy) return 'Adjusted by is required.';
    }
    if (formKey === 'issuance') {
      if (!payload.material) return 'Select a material.';
      if (!payload.issuedTo) return 'Issued to is required.';
      if (!payload.issuedBy) return 'Issued by is required.';
      if (!Number.isFinite(payload.quantity) || payload.quantity <= 0) return 'Quantity must be greater than 0.';
    }
    if (isSalesForm) {
      if (!payload.customer?.name) return 'Customer name is required.';
      if (payload.customer?.email && !emailPattern.test(payload.customer.email)) return 'Enter a valid customer email.';
      if (['invoices', 'delivery', 'returns'].includes(formKey) && !payload.salesOrder) return 'Select a sales order.';
      if (formKey !== 'delivery') {
        const item = payload.items?.[0];
        if (!item?.description) return 'Item description is required.';
        if (!Number.isFinite(item?.qty) || item.qty <= 0) return 'Quantity must be greater than 0.';
        if (!Number.isFinite(item?.unitPrice) || item.unitPrice < 0) return 'Unit price cannot be negative.';
      }
      if (formKey === 'quotations' && !payload.validUntil) return 'Valid until date is required.';
    }
    return '';
  };

  const submit = async () => {
    const message = validate();
    if (message) {
      Alert.alert('Check form', message);
      return;
    }

    if (!isEditing && !item?.creator) {
      Alert.alert('Create unavailable', 'This screen does not expose a create endpoint in the web workflow.');
      return;
    }
    if (isEditing && !item?.updater) {
      Alert.alert('Update unavailable', 'This screen does not expose an update endpoint for this record.');
      return;
    }

    setLoading(true);
    try {
      const res = isEditing
        ? await item.updater(editingRecord?._id, payload)
        : await item.creator(payload);
      if (formKey === 'employees') {
        const temporaryPassword = res?.data?.temporaryPassword;
        Alert.alert(
          isEditing ? 'Employee updated' : 'Employee created',
          !isEditing && temporaryPassword
            ? `Temporary password: ${temporaryPassword}\n\nThe employee must change it on first login.`
            : `Employee was ${isEditing ? 'updated' : 'created'} successfully.`
        );
      } else {
        Alert.alert(isEditing ? 'Updated' : 'Created', `The record was ${isEditing ? 'updated' : 'submitted'} successfully.`);
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Create failed', error.response?.data?.error || error.response?.data?.message || error.message || 'The backend rejected this payload.');
    } finally {
      setLoading(false);
    }
  };

  const renderExpenseForm = () => {
    if (formKey === 'categories') {
      return (
        <>
          <TextField label="Category name" value={categoryForm.name} onChangeText={(v) => updateCategory('name', v)} />
          <ChoiceGroup label="Type" value={categoryForm.type} options={expenseTypes} onChange={(v) => updateCategory('type', v)} />
          <TextField label="Description" value={categoryForm.description} onChangeText={(v) => updateCategory('description', v)} multiline />
          <ToggleRow label="Recurring Monthly Expense" value={categoryForm.isRecurring} onValueChange={(v) => updateCategory('isRecurring', v)} />
          {categoryForm.isRecurring && (
            <TextField
              label="Due on Day of Month"
              value={categoryForm.recurringDay}
              onChangeText={(v) => updateCategory('recurringDay', v)}
              keyboardType="numeric"
              placeholder="1-31"
            />
          )}
          <ChoiceGroup label="Status" value={categoryForm.status} options={categoryStatuses} onChange={(v) => updateCategory('status', v)} />
        </>
      );
    }

    if (formKey === 'expenses') {
      return (
        <>
          <CategorySelector
            value={expenseForm.category}
            onChange={(v) => updateExpense('category', v)}
            categories={categories}
            loading={categoriesLoading}
          />
          <TextField label="Amount" value={expenseForm.amount} onChangeText={(v) => updateExpense('amount', v)} keyboardType="numeric" />
          <TextField label="Date (YYYY-MM-DD)" value={expenseForm.date} onChangeText={(v) => updateExpense('date', v)} />
          <TextField label="Description" value={expenseForm.description} onChangeText={(v) => updateExpense('description', v)} multiline />
          <ChoiceGroup label="Payment method" value={expenseForm.paymentMethod} options={paymentMethods} onChange={(v) => updateExpense('paymentMethod', v)} />
          <ToggleRow label="Petty cash" value={expenseForm.isPettyCash} onValueChange={(v) => updateExpense('isPettyCash', v)} />
          <TextField label="Vendor name" value={expenseForm.vendorName} onChangeText={(v) => updateExpense('vendorName', v)} />
          <TextField label="Receipt URL" value={expenseForm.receiptUrl} onChangeText={(v) => updateExpense('receiptUrl', v)} />
          <TextField label="Approved by" value={expenseForm.approvedBy} onChangeText={(v) => updateExpense('approvedBy', v)} />
          <ChoiceGroup label="Status" value={expenseForm.status} options={expenseStatuses} onChange={(v) => updateExpense('status', v)} />
          {expenseForm.isRecurring && (
            <TextField label="Recurring Month (1-12)" value={expenseForm.recurringMonth} onChangeText={(v) => updateExpense('recurringMonth', v)} keyboardType="numeric" />
          )}
        </>
      );
    }

    if (formKey === 'reimbursements') {
      return (
        <>
          <TextField label="Employee name" value={reimbursementForm.employeeName} onChangeText={(v) => updateReimbursement('employeeName', v)} />
          <TextField label="Amount" value={reimbursementForm.amount} onChangeText={(v) => updateReimbursement('amount', v)} keyboardType="numeric" />
          <ChoiceGroup label="Claim type" value={reimbursementForm.type} options={reimbursementTypes} onChange={(v) => updateReimbursement('type', v)} />
          <TextField label="Expense date (YYYY-MM-DD)" value={reimbursementForm.expenseDate} onChangeText={(v) => updateReimbursement('expenseDate', v)} />
          <TextField label="Description" value={reimbursementForm.description} onChangeText={(v) => updateReimbursement('description', v)} multiline />
          <TextField label="Receipt URL" value={reimbursementForm.receiptUrl} onChangeText={(v) => updateReimbursement('receiptUrl', v)} />
          <TextField label="Payment method" value={reimbursementForm.paymentMethod} onChangeText={(v) => updateReimbursement('paymentMethod', v)} />
        </>
      );
    }

    return (
      <Text style={styles.helpText}>
        A custom form is not configured for this resource yet.
      </Text>
    );
  };

  const renderEmployeeForm = () => {
    if (formKey !== 'employees') return null;

    return (
      <>
        <TextField label="Full name" value={employeeForm.name} onChangeText={(v) => updateEmployee('name', v)} placeholder="Employee name" />
        <TextField label="Email" value={employeeForm.email} onChangeText={(v) => updateEmployee('email', v)} keyboardType="email-address" placeholder="employee@company.com" />
        <TextField label="Phone number" value={employeeForm.phone} onChangeText={(v) => updateEmployee('phone', v)} keyboardType="phone-pad" placeholder="0771234567" />
        <ChoiceGroup label="Role" value={employeeForm.role} options={employeeRoles} onChange={(v) => updateEmployee('role', v)} />
        <TextField label="Salary" value={employeeForm.salary} onChangeText={(v) => updateEmployee('salary', v)} keyboardType="numeric" placeholder="0.00" />
        <ToggleRow label={`Status: ${employeeForm.isActive ? 'Active' : 'Inactive'}`} value={employeeForm.isActive} onValueChange={(v) => updateEmployee('isActive', v)} />
        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Section</Text>
          {sectionsLoading ? <LoadingState message="Loading sections..." /> : null}
          {!sectionsLoading && (
            <View style={styles.choices}>
              <Pressable
                onPress={() => updateEmployee('productionSectionId', '')}
                style={({ pressed }) => [
                  styles.choice,
                  !employeeForm.productionSectionId && styles.choiceActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.choiceText, !employeeForm.productionSectionId && styles.choiceTextActive]}>No section</Text>
              </Pressable>
              {sections.map((section) => {
                const id = section?._id || section?.id;
                const active = employeeForm.productionSectionId === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => updateEmployee('productionSectionId', id)}
                    style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}
                  >
                    <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{section.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          <Text style={styles.helpText}>
            {supervisorRoles.includes(employeeForm.role)
              ? 'Section is required for supervisor roles.'
              : 'Section assignment is optional for this role.'}
          </Text>
        </View>
      </>
    );
  };

  const renderMaterialChoices = (value, onChange) => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>Material List</Text>
      {purchaseMetaLoading ? <LoadingState message="Loading materials..." /> : null}
      {!purchaseMetaLoading && (
        <View style={styles.choices}>
          {materials.map((material) => {
            const active = value === material._id;
            return (
              <Pressable
                key={material._id}
                onPress={() => onChange(material)}
                style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}
              >
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{material.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {!purchaseMetaLoading && materials.length === 0 && <Text style={styles.helpText}>No materials found. Add a material first.</Text>}
    </View>
  );

  const renderSupplierChoices = () => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>Supplier Selection</Text>
      {purchaseMetaLoading ? <LoadingState message="Loading suppliers..." /> : null}
      {!purchaseMetaLoading && (
        <View style={styles.choices}>
          {suppliers.map((supplier) => {
            const active = purchaseOrderForm.supplier === supplier._id;
            return (
              <Pressable
                key={supplier._id}
                onPress={() => updatePurchaseOrder('supplier', supplier._id)}
                style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}
              >
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{supplier.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {!purchaseMetaLoading && suppliers.length === 0 && <Text style={styles.helpText}>No suppliers found. Add a supplier first.</Text>}
    </View>
  );

  const renderPurchaseOrderChoices = () => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>Purchase Order Reference</Text>
      {purchaseMetaLoading ? <LoadingState message="Loading purchase orders..." /> : null}
      {!purchaseMetaLoading && (
        <View style={styles.choices}>
          {purchaseOrders.map((order) => {
            const active = grnForm.purchaseOrder === order._id;
            return (
              <Pressable
                key={order._id}
                onPress={() => updateGrn('purchaseOrder', order._id)}
                style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}
              >
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{order.poNumber || order._id}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {!purchaseMetaLoading && purchaseOrders.length === 0 && <Text style={styles.helpText}>No purchase orders found.</Text>}
    </View>
  );

  const renderManufacturingMaterialChoices = () => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>Fabric Material</Text>
      {manufacturingMaterialsLoading ? <LoadingState message="Loading fabric materials..." /> : null}
      {!manufacturingMaterialsLoading && manufacturingMaterials.length > 0 && (
        <View style={styles.choices}>
          {manufacturingMaterials.map((material) => {
            const active = jobForm.materialId === material._id;
            return (
              <Pressable
                key={material._id}
                onPress={() => updateJob('materialId', material._id)}
                style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}
              >
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>
                  {material.name || material.materialCode || 'Fabric'} ({material.stockQty ?? 0} {material.unit || material.uom || ''})
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {!manufacturingMaterialsLoading && manufacturingMaterials.length === 0 && (
        <Text style={styles.helpText}>No fabric materials found. Add fabric stock before creating a job.</Text>
      )}
    </View>
  );

  const renderSalesOrderChoices = () => (
    <View style={styles.fieldBlock}>
      <Text style={styles.label}>Sales Order</Text>
      {salesMetaLoading ? <LoadingState message="Loading sales orders..." /> : null}
      {!salesMetaLoading && salesOrders.length > 0 && (
        <View style={styles.choices}>
          {salesOrders.map((order) => {
            const active = salesForm.salesOrder === order._id;
            return (
              <Pressable
                key={order._id}
                onPress={() => {
                  updateSales('salesOrder', order._id);
                  updateSales('customerName', order.customer?.name || '');
                  updateSales('customerEmail', order.customer?.email || '');
                  updateSales('customerPhone', order.customer?.phone || '');
                  updateSales('customerAddress', order.customer?.address || '');
                }}
                style={({ pressed }) => [styles.choice, active && styles.choiceActive, pressed && styles.pressed]}
              >
                <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{order.orderNumber || order.customer?.name || order._id}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {!salesMetaLoading && salesOrders.length === 0 && <Text style={styles.helpText}>No sales orders found.</Text>}
    </View>
  );

  const renderSalesForm = () => {
    if (!isSalesForm) return null;
    const statusOptions = formKey === 'quotations'
      ? quoteStatuses
      : formKey === 'sales-orders'
        ? salesOrderStatuses
        : formKey === 'delivery'
          ? deliveryStatuses
          : formKey === 'returns'
            ? returnStatuses
            : [];

    return (
      <>
        <Text style={styles.formTitle}>{route.params?.title || 'Sales Record'}</Text>
        {needsSalesOrders ? renderSalesOrderChoices() : null}
        <TextField label="Customer Name" value={salesForm.customerName} onChangeText={(v) => updateSales('customerName', v)} />
        <TextField label="Customer Email" value={salesForm.customerEmail} onChangeText={(v) => updateSales('customerEmail', v)} keyboardType="email-address" />
        <TextField label="Customer Phone" value={salesForm.customerPhone} onChangeText={(v) => updateSales('customerPhone', v)} keyboardType="phone-pad" />
        {formKey !== 'returns' && <TextField label="Customer Address" value={salesForm.customerAddress} onChangeText={(v) => updateSales('customerAddress', v)} multiline />}
        {formKey !== 'delivery' && (
          <>
            <TextField label="Item Description" value={salesForm.itemDescription} onChangeText={(v) => updateSales('itemDescription', v)} />
            <TextField label="Quantity" value={salesForm.qty} onChangeText={(v) => updateSales('qty', v)} keyboardType="numeric" />
            <TextField label="Unit Price" value={salesForm.unitPrice} onChangeText={(v) => updateSales('unitPrice', v)} keyboardType="numeric" />
          </>
        )}
        {formKey === 'sales-orders' && <TextField label="Cost Price" value={salesForm.costPrice} onChangeText={(v) => updateSales('costPrice', v)} keyboardType="numeric" />}
        {['quotations', 'sales-orders', 'invoices'].includes(formKey) && <TextField label="Tax Rate %" value={salesForm.taxRate} onChangeText={(v) => updateSales('taxRate', v)} keyboardType="numeric" />}
        {formKey === 'quotations' && <TextField label="Valid Until (YYYY-MM-DD)" value={salesForm.validUntil} onChangeText={(v) => updateSales('validUntil', v)} />}
        {formKey === 'sales-orders' && <TextField label="Delivery Date (YYYY-MM-DD)" value={salesForm.deliveryDate} onChangeText={(v) => updateSales('deliveryDate', v)} />}
        {formKey === 'invoices' && <ChoiceGroup label="Invoice Type" value={salesForm.invoiceType} options={invoiceTypes} onChange={(v) => updateSales('invoiceType', v)} />}
        {formKey === 'invoices' && <TextField label="Due Date (YYYY-MM-DD)" value={salesForm.dueDate} onChangeText={(v) => updateSales('dueDate', v)} />}
        {formKey === 'delivery' && <TextField label="Driver" value={salesForm.driver} onChangeText={(v) => updateSales('driver', v)} />}
        {formKey === 'delivery' && <TextField label="Vehicle" value={salesForm.vehicle} onChangeText={(v) => updateSales('vehicle', v)} />}
        {formKey === 'returns' && <ChoiceGroup label="Refund Type" value={salesForm.refundType} options={refundTypes} onChange={(v) => updateSales('refundType', v)} />}
        {formKey === 'returns' && <ChoiceGroup label="Condition" value={salesForm.condition} options={returnConditions} onChange={(v) => updateSales('condition', v)} />}
        {!!statusOptions.length && <ChoiceGroup label="Status" value={salesForm.status} options={statusOptions} onChange={(v) => updateSales('status', v)} />}
        <TextField label={formKey === 'returns' ? 'Reason / Notes' : 'Notes'} value={salesForm.notes} onChangeText={(v) => updateSales('notes', v)} multiline />
      </>
    );
  };

  const renderOrderAndPurchaseForm = () => {
    if (formKey === 'all-orders') {
      return (
        <>
          <TextField label="Order Number" value={orderForm.orderNumber} onChangeText={(v) => updateOrder('orderNumber', v)} placeholder="ORD-001" />
          <TextField label="Customer Name" value={orderForm.customerName} onChangeText={(v) => updateOrder('customerName', v)} />
          <TextField label="Customer Contact" value={orderForm.customerContact} onChangeText={(v) => updateOrder('customerContact', v)} />
          <TextField label="Product Description" value={orderForm.productDescription} onChangeText={(v) => updateOrder('productDescription', v)} multiline />
          <TextField label="Quantity" value={orderForm.quantity} onChangeText={(v) => updateOrder('quantity', v)} keyboardType="numeric" />
          <TextField label="Expected Delivery Date (YYYY-MM-DD)" value={orderForm.expectedDeliveryDate} onChangeText={(v) => updateOrder('expectedDeliveryDate', v)} />
          <TextField label="Notes" value={orderForm.notes} onChangeText={(v) => updateOrder('notes', v)} multiline />
        </>
      );
    }

    if (formKey === 'jobs') {
      return (
        <>
          <Text style={styles.formTitle}>Manufacturing Job</Text>
          <Text style={styles.helpText}>Create a job by issuing fabric to production. Job number and workflow status are generated automatically.</Text>
          {renderManufacturingMaterialChoices()}
          <TextField label="Issued Fabric Quantity" value={jobForm.issuedFabricQuantity} onChangeText={(v) => updateJob('issuedFabricQuantity', v)} keyboardType="numeric" />
          <TextField label="Style Reference" value={jobForm.styleRef} onChangeText={(v) => updateJob('styleRef', v)} placeholder="STYLE-001" />
          <TextField label="Batch Reference" value={jobForm.batchRef} onChangeText={(v) => updateJob('batchRef', v)} placeholder="BATCH-001" />
          <TextField label="Accessories / Notes" value={jobForm.accessories} onChangeText={(v) => updateJob('accessories', v)} multiline placeholder="Optional accessories or remarks" />
        </>
      );
    }

    if (formKey === 'suppliers') {
      return (
        <>
          <TextField label="Supplier Name" value={supplierForm.name} onChangeText={(v) => updateSupplier('name', v)} />
          <TextField label="Contact Info" value={supplierForm.contactPerson} onChangeText={(v) => updateSupplier('contactPerson', v)} />
          <TextField label="Email" value={supplierForm.email} onChangeText={(v) => updateSupplier('email', v)} keyboardType="email-address" />
          <TextField label="Phone" value={supplierForm.phone} onChangeText={(v) => updateSupplier('phone', v)} keyboardType="phone-pad" />
          <TextField label="Address" value={supplierForm.address} onChangeText={(v) => updateSupplier('address', v)} multiline />
          <ToggleRow label={`Status: ${supplierForm.isActive ? 'Active' : 'Inactive'}`} value={supplierForm.isActive} onValueChange={(v) => updateSupplier('isActive', v)} />
        </>
      );
    }

    if (formKey === 'materials') {
      return (
        <>
          <TextField label="Material Name" value={materialForm.name} onChangeText={(v) => updateMaterial('name', v)} />
          <ChoiceGroup label="Category" value={materialForm.category} options={materialCategories} onChange={(v) => updateMaterial('category', v)} />
          <ChoiceGroup label="Unit" value={materialForm.uom} options={materialUnits} onChange={(v) => updateMaterial('uom', v)} />
          <TextField label="Unit Price" value={materialForm.unitPrice} onChangeText={(v) => updateMaterial('unitPrice', v)} keyboardType="numeric" />
          <TextField label="Stock Quantity" value={materialForm.currentStock} onChangeText={(v) => updateMaterial('currentStock', v)} keyboardType="numeric" />
          <TextField label="Description" value={materialForm.description} onChangeText={(v) => updateMaterial('description', v)} multiline />
        </>
      );
    }

    if (formKey === 'requisitions') {
      return (
        <>
          <TextField label="Requested By" value={requisitionForm.requestedBy} onChangeText={(v) => updateRequisition('requestedBy', v)} />
          <TextField label="Employee / Dept" value={requisitionForm.section} onChangeText={(v) => updateRequisition('section', v)} />
          {renderMaterialChoices(requisitionForm.material, (material) => updateRequisition('material', material._id))}
          <TextField label="Quantity" value={requisitionForm.qty} onChangeText={(v) => updateRequisition('qty', v)} keyboardType="numeric" />
          <TextField label="Required Date (YYYY-MM-DD)" value={requisitionForm.requiredDate} onChangeText={(v) => updateRequisition('requiredDate', v)} />
          <ChoiceGroup label="Priority" value={requisitionForm.urgency} options={priorityOptions} onChange={(v) => updateRequisition('urgency', v)} />
        </>
      );
    }

    if (formKey === 'purchase-orders') {
      return (
        <>
          {renderSupplierChoices()}
          {renderMaterialChoices(purchaseOrderForm.material, (material) => {
            updatePurchaseOrder('material', material._id);
            updatePurchaseOrder('description', material.name || '');
            updatePurchaseOrder('unitPrice', String(material.unitPrice ?? ''));
          })}
          <TextField label="Item Description" value={purchaseOrderForm.description} onChangeText={(v) => updatePurchaseOrder('description', v)} />
          <TextField label="Quantity" value={purchaseOrderForm.qty} onChangeText={(v) => updatePurchaseOrder('qty', v)} keyboardType="numeric" />
          <TextField label="Price" value={purchaseOrderForm.unitPrice} onChangeText={(v) => updatePurchaseOrder('unitPrice', v)} keyboardType="numeric" />
          <TextField label="Order Date" value={today()} onChangeText={() => {}} />
          <TextField label="Expected Delivery Date (YYYY-MM-DD)" value={purchaseOrderForm.expectedDeliveryDate} onChangeText={(v) => updatePurchaseOrder('expectedDeliveryDate', v)} />
          <ChoiceGroup label="Status" value={purchaseOrderForm.status} options={poStatuses} onChange={(v) => updatePurchaseOrder('status', v)} />
        </>
      );
    }

    if (formKey === 'grn') {
      return (
        <>
          {renderPurchaseOrderChoices()}
          {renderMaterialChoices(grnForm.material, (material) => {
            updateGrn('material', material._id);
            updateGrn('description', material.name || '');
          })}
          <TextField label="Received Item" value={grnForm.description} onChangeText={(v) => updateGrn('description', v)} />
          <TextField label="Ordered Quantity" value={grnForm.orderedQty} onChangeText={(v) => updateGrn('orderedQty', v)} keyboardType="numeric" />
          <TextField label="Quantity Received" value={grnForm.receivedQty} onChangeText={(v) => updateGrn('receivedQty', v)} keyboardType="numeric" />
          <ChoiceGroup label="Condition" value={grnForm.condition} options={conditions} onChange={(v) => updateGrn('condition', v)} />
          <TextField label="Received Date (YYYY-MM-DD)" value={grnForm.receivedDate} onChangeText={(v) => updateGrn('receivedDate', v)} />
          <TextField label="Received By" value={grnForm.receivedBy} onChangeText={(v) => updateGrn('receivedBy', v)} />
          <TextField label="Remarks" value={grnForm.notes} onChangeText={(v) => updateGrn('notes', v)} multiline />
        </>
      );
    }

    if (formKey === 'products') {
      return (
        <>
          <TextField label="Product Name" value={stockProductForm.name} onChangeText={(v) => updateStockProduct('name', v)} />
          <TextField label="SKU" value={stockProductForm.sku} onChangeText={(v) => updateStockProduct('sku', v)} />
          <ChoiceGroup label="Classification" value={stockProductForm.classification} options={productClassifications} onChange={(v) => updateStockProduct('classification', v)} />
          <ChoiceGroup label="Status" value={stockProductForm.status} options={productStatuses} onChange={(v) => updateStockProduct('status', v)} />
          <TextField label="Stock Quantity" value={stockProductForm.stockQty} onChangeText={(v) => updateStockProduct('stockQty', v)} keyboardType="numeric" />
        </>
      );
    }

    if (formKey === 'adjustments') {
      return (
        <>
          {renderMaterialChoices(stockAdjustmentForm.material, (material) => updateStockAdjustment('material', material._id))}
          <ChoiceGroup label="Adjustment Type" value={stockAdjustmentForm.adjustmentType} options={adjustmentTypes} onChange={(v) => updateStockAdjustment('adjustmentType', v)} />
          <TextField label="Quantity" value={stockAdjustmentForm.quantity} onChangeText={(v) => updateStockAdjustment('quantity', v)} keyboardType="numeric" />
          <TextField label="Reason" value={stockAdjustmentForm.reason} onChangeText={(v) => updateStockAdjustment('reason', v)} />
          <TextField label="Adjusted By" value={stockAdjustmentForm.adjustedBy} onChangeText={(v) => updateStockAdjustment('adjustedBy', v)} />
          <TextField label="Note" value={stockAdjustmentForm.note} onChangeText={(v) => updateStockAdjustment('note', v)} multiline />
        </>
      );
    }

    if (formKey === 'issuance') {
      return (
        <>
          {renderMaterialChoices(issuanceForm.material, (material) => updateIssuance('material', material._id))}
          <TextField label="Issued To" value={issuanceForm.issuedTo} onChangeText={(v) => updateIssuance('issuedTo', v)} />
          <TextField label="Issued By" value={issuanceForm.issuedBy} onChangeText={(v) => updateIssuance('issuedBy', v)} />
          <TextField label="Quantity" value={issuanceForm.quantity} onChangeText={(v) => updateIssuance('quantity', v)} keyboardType="numeric" />
          <TextField label="Job Reference" value={issuanceForm.jobReference} onChangeText={(v) => updateIssuance('jobReference', v)} />
          <TextField label="Note" value={issuanceForm.note} onChangeText={(v) => updateIssuance('note', v)} multiline />
        </>
      );
    }

    return null;
  };

  const customOrderOrPurchaseForm = renderOrderAndPurchaseForm();
  const customSalesForm = renderSalesForm();

  return (
    <ScreenScaffold title={`${isEditing ? 'Edit' : 'Add'} ${route.params?.title || 'Record'}`} subtitle="Fill the form. The app converts it to the API payload automatically.">
      <Card style={styles.formCard}>{customSalesForm || customOrderOrPurchaseForm || (formKey === 'employees' ? renderEmployeeForm() : renderExpenseForm())}</Card>
      <Button title={formKey === 'employees' ? (isEditing ? 'Save employee' : 'Create employee') : (isEditing ? 'Save record' : 'Create record')} loading={loading} onPress={submit} />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: 14,
  },
  fieldBlock: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  formTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choice: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  choiceActive: {
    borderColor: colors.primary,
    backgroundColor: colors.chip,
  },
  pressed: {
    opacity: 0.72,
  },
  choiceText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  choiceTextActive: {
    color: colors.primary,
  },
  toggleRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  helpText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
