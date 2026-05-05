import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Button from '../../components/Button';
import Card from '../../components/Card';
import LoadingState from '../../components/LoadingState';
import ScreenScaffold from '../../components/ScreenScaffold';
import { getAccountSettingsMe } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { ROLE_LABELS } from '../../utils/roles';

const valueOrDash = (value) => {
  const text = String(value || '').trim();
  return text || '-';
};

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
};

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{valueOrDash(value)}</Text>
    </View>
  );
}

function ActionButton({ icon, title, subtitle, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
      <View style={styles.actionIcon}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.muted} />
    </Pressable>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAccountSettingsMe();
      setProfile(res?.data?.data || res?.data || null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const details = useMemo(() => {
    const fullName = profile?.fullName || user?.fullName || user?.name || user?.email || 'User';
    return {
      fullName,
      initial: String(fullName || 'U').charAt(0).toUpperCase(),
      email: profile?.email || user?.email || '',
      phone: profile?.phone || user?.phone || '',
      photo: profile?.profilePhoto || user?.profilePhoto || user?.avatarUrl || '',
      role: profile?.designation || profile?.role || ROLE_LABELS[user?.role] || user?.role || '',
      department: profile?.department || user?.department || '',
      employeeId: profile?.employeeId || user?.employeeId || '',
      joinedDate: profile?.joinedDate || user?.createdAt || '',
    };
  }, [profile, user]);

  const openAccountSettings = () => {
    navigation.navigate('Dashboard', {
      screen: 'Resource',
      params: { moduleKey: 'account', itemKey: 'settings', title: 'Account Settings' },
    });
  };

  const openEditProfile = () => {
    navigation.navigate('Dashboard', {
      screen: 'Resource',
      params: { moduleKey: 'account', itemKey: 'profile', title: 'Profile' },
    });
  };

  const logout = () => Alert.alert('Logout', 'Sign out of this device?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Logout', style: 'destructive', onPress: signOut },
  ]);

  return (
    <ScreenScaffold title="Profile" subtitle="Manage your profile, work details, and account settings." refreshing={loading} onRefresh={loadProfile}>
      {loading ? <LoadingState message="Loading profile..." /> : null}

      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <Text style={styles.sectionSubtitle}>Update your public profile details and contact information.</Text>
          </View>
        </View>

        <View style={styles.profileTop}>
          {details.photo ? (
            <Image source={{ uri: details.photo }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{details.initial}</Text>
            </View>
          )}
          <View style={styles.profileIdentity}>
            <Text style={styles.name}>{details.fullName}</Text>
            <Text style={styles.role}>{details.role || 'Account profile'}</Text>
          </View>
        </View>

        <View style={styles.infoList}>
          <InfoRow label="Name" value={details.fullName} />
          <InfoRow label="Email" value={details.email} />
          <InfoRow label="Phone number" value={details.phone} />
        </View>

        <Button title="Edit Profile" onPress={openEditProfile} />
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>Work Information</Text>
          <Text style={styles.sectionSubtitle}>Your role, department, and employment identifiers.</Text>
        </View>
        <View style={styles.infoList}>
          <InfoRow label="Role / Position" value={details.role} />
          <InfoRow label="Department" value={details.department} />
          <InfoRow label="Employee ID" value={details.employeeId} />
          <InfoRow label="Joining date" value={formatDate(details.joinedDate)} />
        </View>
      </Card>

      <Card style={styles.sectionCard}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>Fast access to security and account settings.</Text>
        </View>
        <View style={styles.actions}>
          <ActionButton
            icon="lock-reset"
            title="Change Password"
            subtitle="Open account security settings"
            onPress={openAccountSettings}
          />
          <ActionButton
            icon="account-cog-outline"
            title="Account Settings"
            subtitle="Manage profile and preferences"
            onPress={openAccountSettings}
          />
        </View>
      </Card>

      <Button title="Logout" variant="danger" onPress={logout} />
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitleWrap: {
    flex: 1,
    gap: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIdentity: {
    flex: 1,
    gap: 3,
  },
  avatar: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.sidebar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.surfaceMuted,
  },
  avatarText: {
    color: '#fff',
    fontSize: 27,
    fontWeight: '900',
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  role: {
    color: colors.muted,
    textTransform: 'capitalize',
    fontSize: 13,
    fontWeight: '800',
  },
  infoList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  infoRow: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    flex: 1,
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  infoValue: {
    flex: 1.3,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'right',
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: 12,
  },
  pressed: {
    opacity: 0.74,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chip,
  },
  actionText: {
    flex: 1,
    gap: 3,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  actionSubtitle: {
    color: colors.muted,
    fontSize: 12,
  },
});
