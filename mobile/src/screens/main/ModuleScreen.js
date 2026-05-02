import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenScaffold from '../../components/ScreenScaffold';
import { getVisibleModules } from '../../navigation/modules';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function ModuleScreen({ route, navigation }) {
  const { user } = useAuth();
  const module = getVisibleModules(user).find((item) => item.key === route.params?.moduleKey);

  return (
    <ScreenScaffold title={module?.label || 'Module'} subtitle="Mobile screens follow the same web feature grouping.">
      <View style={styles.list}>
        {module?.items.map((item) => (
          <Pressable
            key={item.key}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            onPress={() => navigation.navigate('Resource', { moduleKey: module.key, itemKey: item.key, title: item.title })}
          >
            <View style={styles.icon}>
              <MaterialCommunityIcons name={module.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>Open records, actions, and workflow details</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>
        ))}
      </View>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  row: {
    minHeight: 72,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: {
    opacity: 0.74,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chip,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3,
  },
});
