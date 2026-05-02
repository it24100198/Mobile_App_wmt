import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { shadows } from '../theme/styles';

export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    ...shadows.card,
  },
});
