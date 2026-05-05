import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function EmptyState({ title = 'No records found', message = 'Pull to refresh or add a new record.' }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 22,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    gap: 5,
  },
  title: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  message: {
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
