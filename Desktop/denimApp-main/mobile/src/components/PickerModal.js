import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { shadows } from '../theme/styles';

/**
 * Reusable dropdown picker using a bottom-sheet-style modal.
 *
 * Props:
 *   label        – field label shown above the trigger
 *   placeholder  – text when nothing is selected
 *   value        – currently selected value (string)
 *   items        – [{ label, value }]
 *   onValueChange(value) – called when the user taps an item
 *   disabled     – disables the trigger
 *   icon         – optional MaterialCommunityIcons name
 */
export default function PickerModal({
  label,
  placeholder = 'Select…',
  value,
  items = [],
  onValueChange,
  disabled = false,
  icon,
}) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedItem = items.find((item) => item.value === value);
  const displayText = selectedItem?.label || placeholder;

  const filtered = search.trim()
    ? items.filter((item) => item.label.toLowerCase().includes(search.trim().toLowerCase()))
    : items;

  const open = () => {
    if (disabled) return;
    setSearch('');
    setVisible(true);
  };

  const select = (itemValue) => {
    onValueChange?.(itemValue);
    setVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      {!!label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        onPress={open}
        disabled={disabled}
        style={({ pressed }) => [
          styles.trigger,
          disabled && styles.triggerDisabled,
          pressed && styles.triggerPressed,
        ]}
      >
        <View style={styles.triggerContent}>
          {!!icon && (
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={disabled ? colors.muted : colors.primary}
              style={styles.triggerIcon}
            />
          )}
          <Text
            style={[styles.triggerText, !selectedItem && styles.triggerPlaceholder]}
            numberOfLines={1}
          >
            {displayText}
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={disabled ? colors.border : colors.muted}
        />
      </Pressable>

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.overlay} onPress={() => setVisible(false)}>
          <View />
        </Pressable>

        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label || 'Select option'}</Text>
            <Pressable onPress={() => setVisible(false)} hitSlop={12}>
              <MaterialCommunityIcons name="close" size={22} color={colors.muted} />
            </Pressable>
          </View>

          {items.length > 6 && (
            <View style={styles.searchWrap}>
              <MaterialCommunityIcons name="magnify" size={18} color={colors.muted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search…"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                style={styles.searchInput}
              />
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(item, index) => `${item.value}-${index}`}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No options found</Text>
            }
            renderItem={({ item }) => {
              const isActive = item.value === value;
              return (
                <Pressable
                  onPress={() => select(item.value)}
                  style={({ pressed }) => [
                    styles.option,
                    isActive && styles.optionActive,
                    pressed && styles.optionPressed,
                  ]}
                >
                  <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                  {isActive && (
                    <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    ...shadows.card,
  },
  triggerDisabled: {
    backgroundColor: colors.surfaceMuted,
    opacity: 0.6,
  },
  triggerPressed: { opacity: 0.8 },
  triggerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  triggerIcon: { marginRight: 2 },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  triggerPlaceholder: {
    color: colors.muted,
    fontWeight: '400',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '65%',
    paddingBottom: 24,
    ...shadows.card,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: colors.text,
  },
  list: { paddingHorizontal: 8 },
  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 13,
    paddingVertical: 24,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginVertical: 2,
    borderRadius: 10,
  },
  optionActive: {
    backgroundColor: `${colors.primary}10`,
  },
  optionPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  optionText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  optionTextActive: {
    fontWeight: '700',
    color: colors.primary,
  },
});
