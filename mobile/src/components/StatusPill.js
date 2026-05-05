import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

const toneMap = {
  pending: colors.warning,
  approved: colors.success,
  active: colors.success,
  completed: colors.success,
  rejected: colors.danger,
  cancelled: colors.danger,
};

export default function StatusPill({ value }) {
  if (!value) return null;
  const normalized = String(value).toLowerCase();
  const tone = toneMap[normalized] || colors.primary;
  return (
    <View style={[styles.pill, { borderColor: `${tone}33`, backgroundColor: `${tone}12` }]}>
      <Text style={[styles.text, { color: tone }]}>{String(value).replace(/_/g, ' ')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
