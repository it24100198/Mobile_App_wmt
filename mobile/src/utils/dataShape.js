export const toArray = (payload) => {
  const data = payload?.data ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (data && typeof data === 'object') {
    const firstArray = Object.values(data).find(Array.isArray);
    if (firstArray) return firstArray;
  }
  return data ? [data] : [];
};

const safeText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (['string', 'number', 'boolean'].includes(typeof value)) return String(value);
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'object') {
    if (value.name) return String(value.name);
    if (value.title) return String(value.title);
    if (value.email) return String(value.email);
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return String(value);
};

export const getId = (item) => {
  const value = item?._id || item?.id || item?.jobId || item?.orderId || item?.email;
  if (value !== undefined && value !== null) return safeText(value, 'record');
  return safeText(item, 'record').slice(0, 40);
};

export const titleFor = (item, fallback = 'Record') =>
  safeText(
    item?.name ||
    item?.fullName ||
    item?.title ||
    item?.jobNumber ||
    item?.orderNumber ||
    item?.invoiceNumber ||
    item?.quotationNumber ||
    item?.materialName ||
    item?.productName ||
    item?.email,
    fallback
  );

export const subtitleFor = (item) =>
  safeText(
    item?.description ||
    item?.customerName ||
    item?.supplierName ||
    item?.category ||
    item?.department ||
    item?.role ||
    item?.status ||
    item?.createdAt,
    ''
  );

export const money = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return safeText(value, '-');
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
};

export const metricEntries = (payload) => {
  const data = payload?.data ?? payload;
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  return Object.entries(data)
    .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    .slice(0, 8);
};

export const detailEntries = (item) =>
  Object.entries(item || {})
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== 'object')
    .slice(0, 18);
