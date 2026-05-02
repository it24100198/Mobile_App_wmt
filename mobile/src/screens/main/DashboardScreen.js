import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ScreenScaffold from '../../components/ScreenScaffold';
import StatusPill from '../../components/StatusPill';
import { getManufacturingOverview } from '../../api/client';
import { getVisibleModules } from '../../navigation/modules';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { ROLE_LABELS } from '../../utils/roles';
import { metricEntries } from '../../utils/dataShape';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const modules = useMemo(() => getVisibleModules(user), [user]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getManufacturingOverview();
      setOverview(res.data);
    } catch {
      setOverview(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <ScreenScaffold
      title="Dashboard"
      subtitle={`Welcome ${user?.fullName || user?.name || user?.email || ''}`}
      refreshing={loading}
      onRefresh={load}
    >
      <Card style={styles.identity}>
        <View>
          <Text style={styles.identityName}>{user?.fullName || user?.name || user?.email}</Text>
          <Text style={styles.identityRole}>{ROLE_LABELS[user?.role] || user?.role || 'User'}</Text>
        </View>
        <StatusPill value={user?.mustChangePassword ? 'password change required' : 'active'} />
      </Card>

      {loading ? (
        <LoadingState />
      ) : (
        <View style={styles.metrics}>
          {metricEntries(overview).map(([key, value]) => (
            <Card key={key} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{key.replace(/([A-Z])/g, ' $1')}</Text>
              <Text style={styles.metricValue}>{String(value)}</Text>
            </Card>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>Modules</Text>
      <View style={styles.grid}>
        {modules.map((module) => (
          <Pressable
            key={module.key}
            style={({ pressed }) => [styles.module, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Module', { moduleKey: module.key, title: module.label })}
          >
            <MaterialCommunityIcons name={module.icon} size={24} color={colors.primary} />
            <Text style={styles.moduleTitle}>{module.label}</Text>
            <Text style={styles.moduleCount}>{module.items.length} screens</Text>
          </Pressable>
        ))}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  identity: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  identityName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  identityRole: {
    color: colors.muted,
    marginTop: 2,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    minHeight: 82,
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  metricValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 6,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  module: {
    width: '48%',
    minHeight: 118,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.75,
  },
  moduleTitle: {
    color: colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
  moduleCount: {
    color: colors.muted,
    fontSize: 12,
  },
});
