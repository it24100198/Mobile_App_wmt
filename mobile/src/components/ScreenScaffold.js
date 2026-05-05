import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';

export default function ScreenScaffold({ title, subtitle, children, refreshing = false, onRefresh, actions }) {
  return (
    <SafeAreaView style={globalStyles.screen} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={globalStyles.content}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={globalStyles.title}>{title}</Text>
            {!!subtitle && <Text style={globalStyles.subtitle}>{subtitle}</Text>}
          </View>
          {actions}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 2,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
});
