import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import LoadingState from '../../components/LoadingState';
import ScreenScaffold from '../../components/ScreenScaffold';
import StatusPill from '../../components/StatusPill';
import { findModuleItem } from '../../navigation/modules';
import { colors } from '../../theme/colors';
import { getId, metricEntries, money, subtitleFor, titleFor, toArray } from '../../utils/dataShape';

const readable = (key) => key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
const formatRoleLabel = (role) => String(role || '').replace(/_/g, ' ');
const employeeStatus = (employee) => (employee?.userId?.isActive ? 'Active' : 'Inactive');
const employeeEmail = (employee) => employee?.userId?.email || employee?.email || '';
const employeeName = (employee) => employee?.name || employee?.userId?.name || 'Unnamed employee';
const expenseStatuses = ['pending', 'approved', 'rejected'];
const statusLabel = (value) => String(value || 'pending').replace(/_/g, ' ');
const expenseTitle = (expense) => String(expense?.description || '').split('||')[0]?.trim() || expense?.vendorName || 'Expense';
const expenseCategoryName = (expense) => expense?.category?.name || expense?.category?.title || '-';
const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;
const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('en-GB');
};
const getNumber = (...values) => {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return 0;
};
const isRawMaterialType = (value) => {
  const text = String(value || '').toLowerCase();
  return ['raw', 'material', 'materials', 'fabric', 'accessory', 'accessories', 'production'].some((token) => text.includes(token));
};

export default function ResourceScreen({ route, navigation }) {
  const { moduleKey, itemKey, title } = route.params || {};
  const item = useMemo(() => findModuleItem(moduleKey, itemKey), [itemKey, moduleKey]);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const isEmployeeManagement = moduleKey === 'employees' && itemKey === 'employees';
  const isExpenseList = moduleKey === 'expenses' && itemKey === 'expenses';
  const isExpenseCategories = moduleKey === 'expenses' && itemKey === 'categories';
  const isFinancialHealth = moduleKey === 'expenses' && itemKey === 'financial-health';

  const load = useCallback(async () => {
    if (!item?.loader) return;
    setLoading(true);
    setError('');
    try {
      const res = await item.loader();
      setPayload(res?.data ?? res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not load records.');
    } finally {
      setLoading(false);
    }
  }, [item]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const records = toArray(payload);
  const metrics = metricEntries(payload);
  const employeeSummary = useMemo(() => {
    if (!isEmployeeManagement) return null;

    const total = records.length;
    const active = records.filter((employee) => !!employee?.userId?.isActive).length;
    return {
      total,
      active,
      inactive: total - active,
    };
  }, [isEmployeeManagement, records]);

  const financialSummary = useMemo(() => {
    if (!isFinancialHealth) return null;

    const data = payload?.data ?? payload ?? {};
    const monthly = Array.isArray(data?.monthly) ? data.monthly : [];
    const totalExpenses = getNumber(data?.yearTotal, data?.totalExpenses, data?.total);
    const rawMaterialCost = monthly.reduce((sum, row) => (
      isRawMaterialType(row?.categoryType || row?.categoryName)
        ? sum + getNumber(row?.total, row?.amount)
        : sum
    ), getNumber(data?.rawMaterialCost, data?.rawMaterialCosts, data?.directMaterialSpend));
    const operationalExpenses = Math.max(0, getNumber(data?.operationalExpenses, totalExpenses - rawMaterialCost));
    const totalIncome = getNumber(data?.totalIncome, data?.income, data?.totalSales, data?.revenue);
    const netExpense = totalIncome > 0 ? totalIncome - totalExpenses : -totalExpenses;
    const status = netExpense > 0 ? 'Balanced' : netExpense < 0 ? (totalIncome > 0 ? 'Loss' : 'Overspent') : 'Balanced';

    return {
      totalExpenses,
      rawMaterialCost,
      operationalExpenses,
      netExpense,
      status,
      hasIncome: totalIncome > 0,
    };
  }, [isFinancialHealth, payload]);

  const toggleEmployeeStatus = async (employee) => {
    if (!item?.updater || !employee?._id) return;

    const nextActive = !employee?.userId?.isActive;
    setUpdatingId(employee._id);
    try {
      await item.updater(employee._id, { isActive: nextActive });
      setPayload((prev) => {
        const list = toArray(prev).map((row) => {
          if (row?._id !== employee._id) return row;
          return {
            ...row,
            userId: {
              ...(row.userId || {}),
              isActive: nextActive,
            },
          };
        });
        return Array.isArray(prev) ? list : { ...prev, items: list, data: Array.isArray(prev?.data) ? list : prev?.data };
      });
      await load();
    } catch (err) {
      Alert.alert('Status update failed', err.response?.data?.error || err.response?.data?.message || err.message || 'Could not update employee status.');
    } finally {
      setUpdatingId('');
    }
  };

  const openEmployeeEdit = (employee) => {
    navigation.navigate('Form', {
      moduleKey,
      itemKey,
      title: 'Employee',
      mode: 'edit',
      record: employee,
    });
  };

  const renderEmployeeRows = () => (
    <View style={styles.list}>
      {records.map((employee, index) => {
        const active = !!employee?.userId?.isActive;
        const id = getId(employee);
        return (
          <Card key={`${id}-${index}`} style={styles.employeeCard}>
            <View style={styles.employeeHeader}>
              <View style={styles.employeeTitleBlock}>
                <Text style={styles.rowTitle} numberOfLines={1}>{employeeName(employee)}</Text>
                {!!employeeEmail(employee) && <Text style={styles.rowSubtitle} numberOfLines={1}>{employeeEmail(employee)}</Text>}
              </View>
              <View style={[styles.statusBadge, active ? styles.statusActive : styles.statusInactive]}>
                <Text style={[styles.statusText, active ? styles.statusTextActive : styles.statusTextInactive]}>
                  {employeeStatus(employee)}
                </Text>
              </View>
            </View>

            <View style={styles.employeeMetaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Role</Text>
                <Text style={styles.metaValue}>{formatRoleLabel(employee?.role)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Phone</Text>
                <Text style={styles.metaValue}>{employee?.phone || '-'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Section</Text>
                <Text style={styles.metaValue}>{employee?.productionSectionId?.name || '-'}</Text>
              </View>
            </View>

            <View style={styles.employeeActions}>
              <View style={styles.statusToggle}>
                <Text style={styles.metaLabel}>Status</Text>
                <Switch
                  value={active}
                  disabled={updatingId === employee._id}
                  onValueChange={() => toggleEmployeeStatus(employee)}
                  thumbColor={active ? colors.primary : '#f4f4f5'}
                />
              </View>
              <Pressable
                onPress={() => openEmployeeEdit(employee)}
                style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="pencil" size={17} color={colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            </View>
          </Card>
        );
      })}
    </View>
  );

  const renderEmployeeSummary = () => {
    if (!employeeSummary) return null;

    return (
      <View style={styles.summaryGrid}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Employees</Text>
          <Text style={styles.summaryValue}>{employeeSummary.total}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Active Employees</Text>
          <Text style={[styles.summaryValue, styles.summaryActive]}>{employeeSummary.active}</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Inactive Employees</Text>
          <Text style={[styles.summaryValue, styles.summaryInactive]}>{employeeSummary.inactive}</Text>
        </Card>
      </View>
    );
  };

  const changeExpenseStatus = async (expense, status) => {
    if (!item?.updater || !expense?._id || expense.status === status) return;

    setUpdatingId(expense._id);
    try {
      await item.updater(expense._id, { status });
      setPayload((prev) => {
        const list = toArray(prev).map((row) => (row?._id === expense._id ? { ...row, status } : row));
        return Array.isArray(prev) ? list : { ...prev, items: list, data: Array.isArray(prev?.data) ? list : prev?.data };
      });
      await load();
    } catch (err) {
      Alert.alert('Status update failed', err.response?.data?.error || err.response?.data?.message || err.message || 'Could not update expense status.');
    } finally {
      setUpdatingId('');
    }
  };

  const openExpenseEdit = (expense) => {
    navigation.navigate('Form', {
      moduleKey,
      itemKey,
      title: 'Expense',
      mode: 'edit',
      record: expense,
    });
  };

  const deleteExpense = (expense) => {
    if (!item?.remover || !expense?._id) return;

    Alert.alert('Delete expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setUpdatingId(expense._id);
          try {
            await item.remover(expense._id);
            setPayload((prev) => {
              const list = toArray(prev).filter((row) => row?._id !== expense._id);
              return Array.isArray(prev) ? list : { ...prev, items: list, data: Array.isArray(prev?.data) ? list : prev?.data };
            });
          } catch (err) {
            Alert.alert('Delete failed', err.response?.data?.error || err.response?.data?.message || err.message || 'Could not delete expense.');
          } finally {
            setUpdatingId('');
          }
        },
      },
    ]);
  };

  const renderExpenseRows = () => (
    <View style={styles.list}>
      {records.map((expense, index) => {
        const id = getId(expense);
        const currentStatus = expense?.status || 'pending';
        return (
          <Card key={`${id}-${index}`} style={styles.employeeCard}>
            <View style={styles.employeeHeader}>
              <View style={styles.employeeTitleBlock}>
                <Text style={styles.rowTitle} numberOfLines={1}>{expenseTitle(expense)}</Text>
                <Text style={styles.rowSubtitle} numberOfLines={1}>
                  {expenseCategoryName(expense)} · {formatDate(expense?.date)}
                </Text>
              </View>
              <View style={[styles.statusBadge, styles[`expenseStatus_${currentStatus}`] || styles.statusInactive]}>
                <Text style={[styles.statusText, styles[`expenseStatusText_${currentStatus}`] || styles.statusTextInactive]}>
                  {statusLabel(currentStatus)}
                </Text>
              </View>
            </View>

            <View style={styles.employeeMetaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Amount</Text>
                <Text style={styles.metaValue}>{formatMoney(expense?.amount)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Payment</Text>
                <Text style={styles.metaValue}>{statusLabel(expense?.paymentMethod || 'cash')}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Vendor</Text>
                <Text style={styles.metaValue}>{expense?.vendorName || '-'}</Text>
              </View>
            </View>

            <View style={styles.statusActions}>
              {expenseStatuses.map((status) => (
                <Pressable
                  key={status}
                  disabled={updatingId === expense._id || currentStatus === status}
                  onPress={() => changeExpenseStatus(expense, status)}
                  style={({ pressed }) => [
                    styles.statusActionButton,
                    currentStatus === status && styles.statusActionActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.statusActionText, currentStatus === status && styles.statusActionTextActive]}>
                    {statusLabel(status)}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.employeeActions}>
              <Pressable
                onPress={() => navigation.navigate('Detail', { title: expenseTitle(expense), record: expense })}
                style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="eye-outline" size={17} color={colors.primary} />
                <Text style={styles.editButtonText}>View</Text>
              </Pressable>
              <Pressable
                onPress={() => openExpenseEdit(expense)}
                style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="pencil" size={17} color={colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => deleteExpense(expense)}
                disabled={updatingId === expense._id}
                style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={17} color={colors.danger} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          </Card>
        );
      })}
    </View>
  );

  const openCategoryEdit = (category) => {
    navigation.navigate('Form', {
      moduleKey,
      itemKey,
      title: 'Category',
      mode: 'edit',
      record: category,
    });
  };

  const deleteCategory = (category) => {
    if (!item?.remover || !category?._id) return;

    Alert.alert('Delete category', `Are you sure you want to delete "${category.name || 'this category'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setUpdatingId(category._id);
          try {
            await item.remover(category._id);
            setPayload((prev) => {
              const list = toArray(prev).filter((row) => row?._id !== category._id);
              return Array.isArray(prev) ? list : { ...prev, items: list, data: Array.isArray(prev?.data) ? list : prev?.data };
            });
          } catch (err) {
            Alert.alert('Delete failed', err.response?.data?.error || err.response?.data?.message || err.message || 'Could not delete category.');
          } finally {
            setUpdatingId('');
          }
        },
      },
    ]);
  };

  const renderCategoryRows = () => (
    <View style={styles.list}>
      {records.map((category, index) => {
        const id = getId(category);
        return (
          <Card key={`${id}-${index}`} style={styles.employeeCard}>
            <View style={styles.employeeHeader}>
              <View style={styles.employeeTitleBlock}>
                <Text style={styles.rowTitle} numberOfLines={1}>{category?.name || 'Unnamed category'}</Text>
                {!!category?.description && <Text style={styles.rowSubtitle} numberOfLines={2}>{category.description}</Text>}
              </View>
              {!!category?.status && (
                <View style={[styles.statusBadge, category.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                  <Text style={[styles.statusText, category.status === 'active' ? styles.statusTextActive : styles.statusTextInactive]}>
                    {statusLabel(category.status)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.employeeMetaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Type</Text>
                <Text style={styles.metaValue}>{statusLabel(category?.type || 'other')}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Recurring</Text>
                <Text style={styles.metaValue}>{category?.isRecurring ? 'Yes' : 'No'}</Text>
              </View>
            </View>

            <View style={styles.employeeActions}>
              <Pressable
                onPress={() => openCategoryEdit(category)}
                style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="pencil" size={17} color={colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
              <Pressable
                onPress={() => deleteCategory(category)}
                disabled={updatingId === category._id}
                style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={17} color={colors.danger} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          </Card>
        );
      })}
    </View>
  );

  const renderKpiCard = ({ title: cardTitle, value, subtitle, icon, tone, status }) => (
    <Card style={[styles.kpiCard, tone === 'danger' && styles.kpiDangerCard, tone === 'success' && styles.kpiSuccessCard, tone === 'warning' && styles.kpiWarningCard]}>
      <View style={styles.kpiHeader}>
        <View style={[styles.kpiIcon, tone === 'danger' && styles.kpiIconDanger, tone === 'success' && styles.kpiIconSuccess, tone === 'warning' && styles.kpiIconWarning]}>
          <MaterialCommunityIcons name={icon} size={22} color="#fff" />
        </View>
        {status ? (
          <View style={[styles.kpiStatus, tone === 'danger' && styles.kpiStatusDanger, tone === 'success' && styles.kpiStatusSuccess, tone === 'warning' && styles.kpiStatusWarning]}>
            <Text style={[styles.kpiStatusText, tone === 'danger' && styles.kpiStatusTextDanger, tone === 'success' && styles.kpiStatusTextSuccess, tone === 'warning' && styles.kpiStatusTextWarning]}>
              {status}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.kpiTitle}>{cardTitle}</Text>
      <Text style={styles.kpiValue}>{formatMoney(value)}</Text>
      <Text style={styles.kpiSubtitle}>{subtitle}</Text>
    </Card>
  );

  const renderFinancialHealth = () => {
    if (!financialSummary) return null;

    const healthTone = financialSummary.netExpense < 0 ? 'danger' : 'success';

    return (
      <View style={styles.financialDashboard}>
        <View style={styles.financialHero}>
          <Text style={styles.financialEyebrow}>Financial Health Dashboard</Text>
          <Text style={styles.financialTitle}>Expense Management Overview</Text>
          <Text style={styles.financialSubtitle}>
            Quick KPI view for expenses, material spend, operating costs, and overall financial impact.
          </Text>
        </View>

        <View style={styles.kpiGrid}>
          {renderKpiCard({
            title: 'Total Expenses',
            value: financialSummary.totalExpenses,
            subtitle: 'All expense records',
            icon: 'receipt-text-outline',
            tone: 'danger',
          })}
          {renderKpiCard({
            title: 'Raw Material Cost',
            value: financialSummary.rawMaterialCost,
            subtitle: 'Direct material spend',
            icon: 'package-variant-closed',
            tone: 'warning',
          })}
          {renderKpiCard({
            title: 'Operational Expenses',
            value: financialSummary.operationalExpenses,
            subtitle: 'Operational cost summary',
            icon: 'office-building-cog-outline',
            tone: 'warning',
          })}
          {renderKpiCard({
            title: 'Net Expense / Financial Health',
            value: financialSummary.netExpense,
            subtitle: financialSummary.hasIncome ? 'Total income minus total expenses' : 'Overall expense impact',
            icon: financialSummary.netExpense < 0 ? 'trending-down' : 'trending-up',
            tone: healthTone,
            status: financialSummary.status,
          })}
        </View>
      </View>
    );
  };

  return (
    <ScreenScaffold
      title={title || item?.title || 'Records'}
      subtitle="Live data from the existing MERN backend API."
      refreshing={loading}
      onRefresh={load}
      actions={
        item?.creator ? (
          <Button
            title="Add"
            onPress={() => navigation.navigate('Form', { moduleKey, itemKey, title: isEmployeeManagement ? 'Employee' : isExpenseList ? 'Expense' : isExpenseCategories ? 'Category' : title || item?.title })}
            style={styles.addButton}
          />
        ) : null
      }
    >
      {loading ? <LoadingState /> : null}
      {!!error && (
        <Card>
          <Text style={styles.error}>{error}</Text>
          <Button title="Retry" variant="secondary" onPress={load} />
        </Card>
      )}
      {!loading && !error && isFinancialHealth && renderFinancialHealth()}
      {!loading && !error && !isFinancialHealth && metrics.length > 0 && records.length <= 1 && (
        <View style={styles.metrics}>
          {metrics.map(([key, value]) => (
            <Card key={key} style={styles.metric}>
              <Text style={styles.metricLabel}>{readable(key)}</Text>
              <Text style={styles.metricValue}>{money(value)}</Text>
            </Card>
          ))}
        </View>
      )}
      {!loading && !error && !isFinancialHealth && records.length === 0 && <EmptyState />}
      {!loading && !error && isEmployeeManagement && renderEmployeeSummary()}
      {!loading && !error && isEmployeeManagement && renderEmployeeRows()}
      {!loading && !error && isExpenseList && renderExpenseRows()}
      {!loading && !error && isExpenseCategories && renderCategoryRows()}
      {!loading && !error && !isEmployeeManagement && !isExpenseList && !isExpenseCategories && !isFinancialHealth && (
        <View style={styles.list}>
          {records.map((record, index) => (
            <Pressable
              key={`${getId(record)}-${index}`}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              onPress={() => navigation.navigate('Detail', { title: titleFor(record, item?.title), record })}
            >
              <View style={styles.rowTop}>
                <Text style={styles.rowTitle} numberOfLines={1}>{titleFor(record, item?.title)}</Text>
                <StatusPill value={record?.status || record?.state || record?.role} />
              </View>
              {!!subtitleFor(record) && <Text style={styles.rowSubtitle} numberOfLines={2}>{String(subtitleFor(record))}</Text>}
              <View style={styles.rowFooter}>
                <Text style={styles.rowMeta}>{record?.createdAt ? new Date(record.createdAt).toLocaleDateString() : getId(record)}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.muted} />
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  addButton: {
    minHeight: 38,
    paddingHorizontal: 12,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    lineHeight: 20,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    width: '48%',
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  metricValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 5,
  },
  list: {
    gap: 10,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    minWidth: '30%',
    gap: 6,
  },
  summaryLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  summaryValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  summaryActive: {
    color: '#15803d',
  },
  summaryInactive: {
    color: colors.danger,
  },
  financialDashboard: {
    gap: 14,
  },
  financialHero: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 5,
  },
  financialEyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  financialTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  financialSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48%',
    minHeight: 158,
    justifyContent: 'space-between',
    gap: 8,
  },
  kpiDangerCard: {
    borderColor: '#fecaca',
  },
  kpiSuccessCard: {
    borderColor: '#bbf7d0',
  },
  kpiWarningCard: {
    borderColor: '#fed7aa',
  },
  kpiHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  kpiIconDanger: {
    backgroundColor: colors.danger,
  },
  kpiIconSuccess: {
    backgroundColor: colors.success,
  },
  kpiIconWarning: {
    backgroundColor: colors.warning,
  },
  kpiStatus: {
    borderRadius: 999,
    backgroundColor: colors.chip,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  kpiStatusDanger: {
    backgroundColor: '#fee2e2',
  },
  kpiStatusSuccess: {
    backgroundColor: '#dcfce7',
  },
  kpiStatusWarning: {
    backgroundColor: '#ffedd5',
  },
  kpiStatusText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  kpiStatusTextDanger: {
    color: colors.danger,
  },
  kpiStatusTextSuccess: {
    color: colors.success,
  },
  kpiStatusTextWarning: {
    color: colors.warning,
  },
  kpiTitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 16,
  },
  kpiValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  kpiSubtitle: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  row: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 8,
  },
  pressed: {
    opacity: 0.75,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  rowSubtitle: {
    color: colors.muted,
    lineHeight: 19,
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  employeeCard: {
    gap: 12,
  },
  employeeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  employeeTitleBlock: {
    flex: 1,
    gap: 4,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#f1f5f9',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  statusTextActive: {
    color: '#15803d',
  },
  statusTextInactive: {
    color: colors.muted,
  },
  employeeMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaItem: {
    minWidth: '30%',
    flex: 1,
    gap: 3,
  },
  metaLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  metaValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  employeeActions: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: '900',
  },
  deleteButton: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 12,
    backgroundColor: '#fff1f2',
  },
  deleteButtonText: {
    color: colors.danger,
    fontWeight: '900',
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusActionButton: {
    minHeight: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusActionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.chip,
  },
  statusActionText: {
    color: colors.muted,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  statusActionTextActive: {
    color: colors.primary,
  },
  expenseStatus_pending: {
    backgroundColor: '#fef3c7',
  },
  expenseStatus_approved: {
    backgroundColor: '#dcfce7',
  },
  expenseStatus_rejected: {
    backgroundColor: '#fee2e2',
  },
  expenseStatusText_pending: {
    color: '#b45309',
  },
  expenseStatusText_approved: {
    color: '#15803d',
  },
  expenseStatusText_rejected: {
    color: colors.danger,
  },
});
