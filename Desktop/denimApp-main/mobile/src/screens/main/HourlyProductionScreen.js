import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getEmployees, getHourlyRecords, getSections, listHourlyJobs, saveHourlyProduction } from '../../api/client';
import PickerModal from '../../components/PickerModal';
import s, { colors as C } from './hourlyStyles';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const fmtHour = (h) => { const v = Number(h); if (v === 0) return '12 AM'; if (v < 12) return `${v} AM`; if (v === 12) return '12 PM'; return `${v - 12} PM`; };
const fmtNum = (v) => Number(v || 0).toLocaleString();
const todayStr = () => new Date().toISOString().slice(0, 10);
const jobTarget = (j) => Number(j?.totalCutPieces ?? j?.issuedFabricQuantity ?? 0);

export default function HourlyProductionScreen({ route }) {
  const preselectedJobId = route.params?.jobId;
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sections, setSections] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedLine, setSelectedLine] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [modalHour, setModalHour] = useState(null);
  const [hourQtys, setHourQtys] = useState({});
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listHourlyJobs();
      const list = Array.isArray(res?.data) ? res.data : res?.data?.items || res?.data?.data || [];
      setJobs(list);
      if (preselectedJobId && !selectedJobId) {
        const match = list.find((j) => j._id === preselectedJobId);
        if (match) setSelectedJobId(match._id);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [preselectedJobId, selectedJobId]);

  useEffect(() => { loadJobs(); }, [loadJobs]);
  useFocusEffect(useCallback(() => { loadJobs(); }, [loadJobs]));

  useEffect(() => {
    (async () => {
      try {
        const [empRes, secRes] = await Promise.all([getEmployees(), getSections({ type: 'line' })]);
        setEmployees(Array.isArray(empRes?.data) ? empRes.data : empRes?.data?.data || []);
        setSections(Array.isArray(secRes?.data) ? secRes.data : secRes?.data?.data || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (!selectedJobId) { setRecords([]); return; }
    (async () => {
      try {
        const res = await getHourlyRecords(selectedJobId);
        setRecords(Array.isArray(res?.data) ? res.data : res?.data?.data || []);
      } catch {}
    })();
  }, [selectedJobId, toast]);

  const selectedJob = useMemo(() => jobs.find((j) => j._id === selectedJobId), [jobs, selectedJobId]);

  const lineNames = useMemo(() => {
    const set = new Set();
    sections.forEach((sec) => { if (sec.name || sec.slug) set.add(sec.name || sec.slug); });
    records.forEach((r) => { if (r.lineName) set.add(r.lineName); });
    if (selectedLine) set.add(selectedLine);
    return Array.from(set);
  }, [sections, records, selectedLine]);

  useEffect(() => {
    if (selectedLine) return;
    const fromRec = records.find((r) => r.lineName)?.lineName;
    if (fromRec) { setSelectedLine(fromRec); return; }
    if (sections.length) setSelectedLine(sections[0].name || sections[0].slug || '');
  }, [records, sections, selectedLine]);

  const empsForLine = useMemo(() => {
    if (!selectedLine) return [];
    return employees.filter((e) => { const n = e.productionSectionId?.name || e.productionSectionId?.slug; return n === selectedLine; });
  }, [employees, selectedLine]);

  useEffect(() => {
    if (selectedEmpId && empsForLine.some((e) => e._id === selectedEmpId)) return;
    setSelectedEmpId(empsForLine[0]?._id || '');
  }, [empsForLine, selectedEmpId]);

  const dateRecords = useMemo(() => records.filter((r) => r.lineName === selectedLine && r.productionDate === selectedDate), [records, selectedLine, selectedDate]);

  const actualByHour = useMemo(() => {
    const m = new Map(HOURS.map((h) => [h, 0]));
    dateRecords.forEach((r) => { const h = Number(r.hour); if (m.has(h)) m.set(h, m.get(h) + Number(r.quantity || 0)); });
    return m;
  }, [dateRecords]);

  const lockedHours = useMemo(() => { const s = new Set(); dateRecords.forEach((r) => s.add(Number(r.hour))); return s; }, [dateRecords]);
  const target = selectedJob ? jobTarget(selectedJob) : 0;
  const todayProduced = useMemo(() => Array.from(actualByHour.values()).reduce((a, b) => a + b, 0), [actualByHour]);
  const totalProduced = useMemo(() => records.reduce((a, r) => a + Number(r.quantity || 0), 0), [records]);
  const remaining = Math.max(target - todayProduced, 0);
  const efficiency = target > 0 ? Math.round((todayProduced / target) * 100) : 0;

  const plannedByHour = useMemo(() => {
    const m = new Map();
    if (target <= 0) { HOURS.forEach((h) => m.set(h, 0)); return m; }
    const base = Math.floor(target / HOURS.length);
    let rem = target % HOURS.length;
    HOURS.forEach((h) => { m.set(h, base + (rem > 0 ? 1 : 0)); if (rem > 0) rem--; });
    return m;
  }, [target]);

  const maxVal = useMemo(() => Math.max(...HOURS.map((h) => Math.max(plannedByHour.get(h) || 0, actualByHour.get(h) || 0)), 1), [plannedByHour, actualByHour]);

  const openModal = (hour) => {
    if (!selectedJobId || !selectedLine || lockedHours.has(hour)) return;
    const init = {};
    empsForLine.forEach((emp) => {
      const key = `${selectedLine}|${selectedDate}|${hour}|${emp._id}`;
      init[emp._id] = records.find((r) => `${r.lineName}|${r.productionDate}|${r.hour}|${r.employeeId}` === key)?.quantity ?? '';
    });
    setHourQtys(init);
    setModalHour(hour);
    setError('');
  };

  const handleSave = async () => {
    if (!selectedJobId || modalHour == null || !selectedLine) return;
    if (lockedHours.has(modalHour)) return;
    setSaving(true); setError('');
    try {
      const rows = empsForLine.map((emp) => ({ lineName: selectedLine, productionDate: selectedDate, hour: modalHour, employeeId: emp._id, quantity: Number(hourQtys[emp._id] ?? 0) || 0 }));
      await saveHourlyProduction({ jobId: selectedJobId, rows });
      setModalHour(null); setHourQtys({});
      setToast('Production saved successfully!');
      setTimeout(() => setToast(''), 2500);
    } catch (e) { setError(e.response?.data?.error || e.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const onJobChange = (id) => { setSelectedJobId(id); setSelectedLine(''); setSelectedEmpId(''); };

  const jobItems = jobs.map((j) => ({ label: `${j.jobNumber} · ${j.productId?.name || 'Product'}`, value: j._id }));
  const lineItems = lineNames.map((n) => ({ label: n, value: n }));
  const empItems = empsForLine.map((e) => ({ label: e.name || e.employeeId || e._id, value: e._id }));

  if (loading) return (
    <View style={[s.safe, s.center]}>
      <ActivityIndicator size="large" color={C.primary} />
      <Text style={s.emptyText}>Loading jobs...</Text>
    </View>
  );

  return (
    <View style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={s.heroCard}>
          <View style={s.heroGradient}>
            <View style={s.heroBadge}>
              <MaterialCommunityIcons name="clock-outline" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={s.heroBadgeText}>Production Board</Text>
            </View>
            <Text style={s.heroTitle}>Hourly Production</Text>
            <Text style={s.heroSub}>Record hourly output, track progress, and monitor production.</Text>
            <View style={s.heroInfoRow}>
              <View style={s.heroInfoBox}><Text style={s.heroInfoLabel}>Date</Text><Text style={s.heroInfoValue}>{selectedDate}</Text></View>
              <View style={s.heroInfoBox}><Text style={s.heroInfoLabel}>Line</Text><Text style={s.heroInfoValue}>{selectedLine || '—'}</Text></View>
              <View style={s.heroInfoBox}><Text style={s.heroInfoLabel}>Status</Text><Text style={s.heroInfoValue}>{selectedJob ? (selectedJob.status === 'LINE_IN_PROGRESS' ? 'Live' : 'Ready') : 'Idle'}</Text></View>
            </View>
          </View>
        </View>

        {/* Selectors */}
        <View style={s.card}>
          <PickerModal label="Select Job" placeholder="— Choose a job —" value={selectedJobId} items={jobItems} onValueChange={onJobChange} icon="briefcase-outline" />
          <View style={[s.row, s.gap8]}>
            <View style={{ flex: 1 }}><PickerModal label="Line" placeholder="— Line —" value={selectedLine} items={lineItems} onValueChange={setSelectedLine} disabled={!selectedJobId} icon="account-switch-outline" /></View>
            <View style={{ flex: 1 }}><PickerModal label="Operator" placeholder="All" value={selectedEmpId} items={empItems} onValueChange={setSelectedEmpId} disabled={!selectedLine} icon="account-outline" /></View>
          </View>
        </View>

        {/* Empty / No selection */}
        {!jobs.length ? (
          <View style={[s.card, s.center]}>
            <View style={s.emptyIcon}><MaterialCommunityIcons name="inbox-outline" size={28} color={C.muted} /></View>
            <Text style={s.emptyTitle}>No active jobs</Text>
            <Text style={s.emptyText}>Jobs in LINE_ASSIGNED or LINE_IN_PROGRESS will appear here.</Text>
          </View>
        ) : !selectedJob ? (
          <View style={[s.card, s.center]}>
            <View style={s.emptyIcon}><MaterialCommunityIcons name="hand-pointing-down" size={28} color={C.primary} /></View>
            <Text style={s.emptyTitle}>Select a job</Text>
            <Text style={s.emptyText}>Choose a job above to view the dashboard and record hourly output.</Text>
            <View style={[s.statsGrid, { marginTop: 16 }]}>
              <View style={s.statCard}><Text style={s.statLabel}>Active Jobs</Text><Text style={s.statValue}>{jobs.length}</Text></View>
              <View style={s.statCard}><Text style={s.statLabel}>Selected Line</Text><Text style={[s.statValue, { fontSize: 14 }]}>{selectedLine || '—'}</Text></View>
            </View>
          </View>
        ) : (
          <>
            {/* Job Card */}
            <View style={s.card}>
              <View style={[s.row, s.spaceBetween]}>
                <Text style={s.cardTitle}>Job Summary</Text>
                <View style={{ backgroundColor: C.chip, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: C.primary }}>{selectedJob.status?.replace(/_/g, ' ')}</Text>
                </View>
              </View>
              <View style={s.statsGrid}>
                <SummaryTile icon="pound" label="Job ID" value={selectedJob.jobNumber} bg="#f0f9ff" color="#0369a1" />
                <SummaryTile icon="package-variant" label="Product" value={selectedJob.productId?.name || '—'} bg="#fdf4ff" color="#a21caf" />
                <SummaryTile icon="bullseye-arrow" label="Target" value={fmtNum(target)} bg="#f0fdf4" color="#15803d" />
                <SummaryTile icon="check-circle-outline" label="Completed" value={fmtNum(totalProduced)} bg="#fffbeb" color="#b45309" />
              </View>
            </View>

            {/* Stats */}
            <View style={s.statsGrid}>
              <KpiCard label="Today Target" value={fmtNum(target)} icon="bullseye" bg="#0f172a" />
              <KpiCard label="Today Output" value={fmtNum(todayProduced)} icon="trending-up" bg="#059669" />
              <KpiCard label="Remaining" value={fmtNum(remaining)} icon="clock-outline" bg="#d97706" />
              <KpiCard label="Efficiency" value={`${efficiency}%`} icon="speedometer" bg="#2563eb" />
            </View>

            {/* Chart */}
            <View style={s.card}>
              <View style={[s.row, s.spaceBetween]}>
                <View><Text style={s.cardTitle}>Hourly Output</Text><Text style={s.cardSub}>Planned vs Actual · {selectedDate}</Text></View>
                <View style={[s.row, s.gap8]}>
                  <View style={[s.row, s.gap8]}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: 'rgba(15,23,42,0.15)' }} /><Text style={{ fontSize: 10, color: C.muted }}>Plan</Text></View>
                  <View style={[s.row, s.gap8]}><View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: C.primary }} /><Text style={{ fontSize: 10, color: C.muted }}>Actual</Text></View>
                </View>
              </View>
              <View style={s.hourGrid}>
                {HOURS.map((hour) => {
                  const planned = plannedByHour.get(hour) || 0;
                  const actual = actualByHour.get(hour) || 0;
                  const locked = lockedHours.has(hour);
                  const pw = `${Math.min(100, (planned / maxVal) * 100)}%`;
                  const aw = `${Math.min(100, (actual / maxVal) * 100)}%`;
                  return (
                    <Pressable key={hour} onPress={() => openModal(hour)} style={[s.hourRow, locked && s.hourRowLocked]}>
                      <Text style={s.hourLabel}>{fmtHour(hour)}</Text>
                      <View style={s.hourBarWrap}>
                        <View style={[s.hourBarPlanned, { width: pw }]} />
                        <View style={[s.hourBarActual, { width: aw }]} />
                      </View>
                      <Text style={s.hourQty}>{actual}</Text>
                      <View style={[s.hourAction, locked ? s.hourActionLocked : s.hourActionOpen]}>
                        <MaterialCommunityIcons name={locked ? 'lock' : 'pencil'} size={16} color={locked ? '#b45309' : '#fff'} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Recent entries preview */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Recent Entries</Text>
              {HOURS.slice(-5).map((hour) => {
                const planned = plannedByHour.get(hour) || 0;
                const actual = actualByHour.get(hour) || 0;
                const pct = planned > 0 ? Math.min(100, Math.round((actual / planned) * 100)) : 0;
                return (
                  <View key={hour} style={{ gap: 4, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border }}>
                    <View style={[s.row, s.spaceBetween]}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>{fmtHour(hour)}</Text>
                      <Text style={{ fontSize: 12, color: C.muted }}>Plan {fmtNum(planned)} · Actual {fmtNum(actual)}</Text>
                    </View>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: C.surfaceMuted }}>
                      <View style={{ height: 6, borderRadius: 3, backgroundColor: C.primary, width: `${pct}%` }} />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Entry Modal */}
      <Modal visible={modalHour != null} transparent animationType="slide" onRequestClose={() => { if (!saving) { setModalHour(null); setError(''); } }}>
        <View style={s.modalOverlay}>
          <Pressable style={s.modalBackdrop} onPress={() => { if (!saving) { setModalHour(null); setError(''); } }} />
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>Record Production</Text>
            <Text style={s.modalSub}>{selectedLine} · {selectedDate} · {fmtHour(modalHour)}</Text>
            {!!error && <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View>}
            <View style={s.modalMiniStats}>
              <View style={s.modalMiniStat}><Text style={s.modalMiniLabel}>Job</Text><Text style={s.modalMiniValue}>{selectedJob?.jobNumber}</Text></View>
              <View style={s.modalMiniStat}><Text style={s.modalMiniLabel}>Target</Text><Text style={s.modalMiniValue}>{fmtNum(target)}</Text></View>
              <View style={s.modalMiniStat}><Text style={s.modalMiniLabel}>Operators</Text><Text style={s.modalMiniValue}>{empsForLine.length}</Text></View>
            </View>
            <ScrollView style={{ maxHeight: 260 }}>
              {empsForLine.length === 0 ? (
                <Text style={[s.emptyText, { paddingVertical: 20 }]}>No operators for this line.</Text>
              ) : (
                <View style={s.gap8}>
                  {empsForLine.map((emp) => (
                    <View key={emp._id} style={[s.empCard, selectedEmpId === emp._id && s.empCardFocused]}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.empName}>{emp.name || emp.employeeId || emp._id}</Text>
                        <Text style={s.empId}>{emp.employeeId || 'Operator'}</Text>
                      </View>
                      <TextInput
                        value={String(hourQtys[emp._id] ?? '')}
                        onChangeText={(v) => setHourQtys((p) => ({ ...p, [emp._id]: v }))}
                        placeholder="Qty"
                        placeholderTextColor={C.muted}
                        keyboardType="numeric"
                        editable={!lockedHours.has(modalHour)}
                        style={[s.qtyInput, lockedHours.has(modalHour) && s.qtyInputDisabled]}
                      />
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
            <Text style={{ fontSize: 12, color: C.muted }}>{lockedHours.has(modalHour) ? 'This hour is locked.' : 'Enter quantity and save.'}</Text>
            <View style={s.modalFooter}>
              <Pressable style={s.btnSecondary} onPress={() => { setModalHour(null); setError(''); }}><Text style={s.btnSecondaryText}>Close</Text></Pressable>
              <Pressable
                style={[s.btnPrimary, (lockedHours.has(modalHour) || saving || !empsForLine.length) && s.btnDisabled]}
                disabled={lockedHours.has(modalHour) || saving || !empsForLine.length}
                onPress={handleSave}
              >
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <MaterialCommunityIcons name="content-save-outline" size={18} color="#fff" />}
                <Text style={s.btnPrimaryText}>Save & Lock</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {!!toast && (
        <View style={s.toast}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
          <Text style={s.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

function SummaryTile({ icon, label, value, bg, color }) {
  return (
    <View style={[s.statCard, { backgroundColor: bg }]}>
      <Text style={[s.statLabel, { color }]}>{label}</Text>
      <Text style={[s.statValue, { fontSize: 15, color }]} numberOfLines={1}>{value}</Text>
      <View style={[s.statIcon, { backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color} />
      </View>
    </View>
  );
}

function KpiCard({ label, value, icon, bg }) {
  return (
    <View style={[s.statCard, { backgroundColor: bg, borderColor: bg }]}>
      <Text style={[s.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>{label}</Text>
      <Text style={[s.statValue, { color: '#fff' }]}>{value}</Text>
      <View style={[s.statIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
        <MaterialCommunityIcons name={icon} size={18} color="#fff" />
      </View>
    </View>
  );
}
