import { StyleSheet, Text, View } from 'react-native';
import Card from '../../components/Card';
import ScreenScaffold from '../../components/ScreenScaffold';
import StatusPill from '../../components/StatusPill';
import { colors } from '../../theme/colors';
import { detailEntries, titleFor } from '../../utils/dataShape';

const readable = (key) => key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');

export default function DetailScreen({ route }) {
  const record = route.params?.record || {};
  return (
    <ScreenScaffold title={route.params?.title || titleFor(record)} subtitle="Record detail adapted for mobile review.">
      <Card style={styles.hero}>
        <Text style={styles.title}>{titleFor(record)}</Text>
        <StatusPill value={record?.status || record?.state || record?.role} />
      </Card>
      <Card>
        {detailEntries(record).map(([key, value]) => (
          <View key={key} style={styles.field}>
            <Text style={styles.label}>{readable(key)}</Text>
            <Text style={styles.value}>{String(value)}</Text>
          </View>
        ))}
      </Card>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 10,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  field: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 3,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  value: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
});
