import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PrimaryButton, Badge } from '../components/ui';
import { useApp } from '../context/AppContext';
import { getSeatInfo, detectClashes } from '../utils/clashLogic';

export default function CourseRegistrationScreen({ navigation, route }) {
  const {
    modules,
    groups,
    selectedModules,
    selectGroup,
    addNextAvailableModule,
    clashes,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  // Auto-open clash warning if instructed by route param (e.g. from Dashboard Resume)
  useEffect(() => {
    if (route.params?.openClashModal && clashes.length > 0) {
      navigation.navigate('ClashWarning');
    }
  }, [route.params, clashes.length]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleContinue = () => {
    if (selectedModules.length === 0) {
      Alert.alert('No Selection', 'Please select at least one module and class group.');
      return;
    }

    // Run pure clash detection
    const activeClashes = detectClashes(selectedModules, groups);

    if (activeClashes.length > 0) {
      // Clashes detected -> show Clash Warning
      navigation.navigate('ClashWarning');
    } else {
      // Clash-free -> go to Weekly Timetable
      navigation.navigate('Timetable');
    }
  };

  const handleAddModule = () => {
    const addedCode = addNextAvailableModule();
    if (!addedCode) {
      Alert.alert('All Modules Selected', 'All 5 available semester modules have already been added.');
    }
  };

  // Get modules that have been added to registration
  const activeModules = modules.filter((m) =>
    selectedModules.some((s) => s.moduleCode === m.code)
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Course registration</Text>
        <Text style={styles.headerSub}>Select module and class groups ({selectedModules.length} of 5)</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {activeModules.map((module) => {
          const moduleGroups = groups.filter((g) => g.moduleCode === module.code);
          const currentSelection = selectedModules.find((s) => s.moduleCode === module.code);
          const selectedGroupId = currentSelection?.groupId;

          return (
            <View key={module.code} style={styles.moduleBlock}>
              {moduleGroups.map((group) => {
                const isSelected = selectedGroupId === group.groupId;
                const seatInfo = getSeatInfo(group.seatsLeft);

                return (
                  <View
                    key={group._id}
                    style={[styles.moduleCard, isSelected && styles.moduleCardSelected]}
                  >
                    {/* Card Body tap -> opens Module Detail */}
                    <TouchableOpacity
                      style={styles.cardBody}
                      onPress={() => navigation.navigate('ModuleDetail', { moduleCode: module.code })}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.moduleCode}>{module.code}</Text>
                        <Text style={styles.moduleName}>{module.name}</Text>
                        <View style={styles.moduleTagRow}>
                          <View style={styles.groupTag}>
                            <Text style={styles.groupTagText}>{group.groupName}</Text>
                          </View>
                          <Badge
                            label={seatInfo.text}
                            color={seatInfo.badgeColor}
                          />
                        </View>
                        <Text style={styles.groupTime}>
                          {group.dayOfWeek || group.day} · {group.start}–{group.end} · {group.venue}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* Radio Button tap -> toggles/selects group */}
                    <TouchableOpacity
                      style={styles.radioHitArea}
                      onPress={() => selectGroup(module.code, group.groupId)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.radio, isSelected && styles.radioSelected]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Add another module */}
        <TouchableOpacity style={styles.addModuleBtn} onPress={handleAddModule} activeOpacity={0.8}>
          <Text style={styles.addModuleText}>+ Add another module</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <PrimaryButton title="Continue" onPress={handleContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: SPACING.base, paddingHorizontal: SPACING.base },
  headerTitle: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: FONTS.sizes.sm, marginTop: 2 },

  scroll: { flex: 1 },
  content: { padding: SPACING.base, paddingTop: SPACING.md },

  // Wrapper around all group cards for a single module
  moduleBlock: { marginBottom: SPACING.lg },

  moduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    ...SHADOWS.sm,
  },
  moduleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F5F0FF',
  },
  cardBody: {
    flex: 1,
  },
  radioHitArea: {
    padding: 4,
    marginLeft: SPACING.xs,
  },
  moduleCode: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.text },
  moduleName: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  moduleTagRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' },
  groupTag: {
    backgroundColor: COLORS.borderLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  groupTagText: { fontSize: FONTS.sizes.xs, color: COLORS.textSecondary, fontWeight: '600' },
  groupTime: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted, marginTop: SPACING.sm },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  radioSelected: { borderColor: COLORS.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },

  addModuleBtn: { paddingVertical: SPACING.md, alignItems: 'flex-start' },
  addModuleText: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.base },

  footer: { padding: SPACING.base, paddingBottom: 32, backgroundColor: COLORS.background },
});
