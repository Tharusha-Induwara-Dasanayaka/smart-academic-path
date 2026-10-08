import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { PrimaryButton } from '../components/ui';
import { useApp } from '../context/AppContext';
import { getSeatInfo, detectClashes } from '../utils/clashLogic';

export default function ModuleDetailScreen({ navigation, route }) {
  const {
    modules,
    groups,
    selectedModules,
    selectGroup,
    lastSyncTime,
  } = useApp();

  const moduleCode = route.params?.moduleCode || 'IT3070';
  const moduleData = modules.find((m) => m.code === moduleCode) || {
    code: moduleCode,
    name: 'Software Engineering',
    credits: 3,
  };

  const moduleGroups = useMemo(() => {
    return groups.filter((g) => g.moduleCode === moduleCode);
  }, [groups, moduleCode]);

  const currentlySelected = selectedModules.find((s) => s.moduleCode === moduleCode);
  const [pickedGroupId, setPickedGroupId] = useState(
    currentlySelected?.groupId || moduleGroups[0]?.groupId || 'G4'
  );

  const [syncSeconds, setSyncSeconds] = useState(
    Math.max(5, Math.floor((Date.now() - lastSyncTime) / 1000))
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncSeconds((prev) => (prev > 90 ? 8 : prev + 3));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Other module selections
  const otherSelections = useMemo(() => {
    return selectedModules.filter((s) => s.moduleCode !== moduleCode);
  }, [selectedModules, moduleCode]);

  const handleAddToRegistration = () => {
    selectGroup(moduleCode, pickedGroupId);
    Alert.alert(
      'Updated Registration',
      `${moduleCode} (${pickedGroupId}) has been updated in your course list.`,
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('CourseRegistration'),
        },
      ]
    );
  };

  const handleAskAdvisor = (group) => {
    navigation.navigate('HelpRequest', {
      modules: `${moduleCode}-${group.groupId} conflict`,
      conflictDescription: `Class overlaps existing schedule on ${group.dayOfWeek || group.day} ${group.start}-${group.end}`,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Purple Gradient Header */}
      <LinearGradient
        colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{moduleData.code}</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Module Subhead */}
        <Text style={styles.moduleSubhead}>
          {moduleData.name} · {moduleData.credits} credits
        </Text>

        {/* Section Header */}
        <Text style={styles.sectionTitle}>Class groups</Text>

        {/* Group Cards */}
        {moduleGroups.map((group) => {
          const isSelected = pickedGroupId === group.groupId;
          const testHypothetical = [...otherSelections, { moduleCode, groupId: group.groupId }];
          const groupClashes = detectClashes(testHypothetical, groups);
          const hasClash = groupClashes.length > 0;
          const seatInfo = getSeatInfo(group.seatsLeft);
          const timeText = `${group.groupName || `Group ${group.groupId.replace('G','')}`} · ${
            group.timeDisplay || `${group.day} ${group.start}–${group.end}`
          }`;

          if (hasClash) {
            return (
              <TouchableOpacity
                key={group._id}
                style={styles.clashCard}
                onPress={() => {
                  setPickedGroupId(group.groupId);
                  navigation.navigate('ClashWarning');
                }}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupCardTitle}>{timeText}</Text>
                  <View style={styles.clashBadge}>
                    <Text style={styles.clashBadgeText}>Clashes</Text>
                  </View>
                </View>
                {isSelected ? (
                  <View style={[styles.checkCircle, { backgroundColor: '#EF4444' }]}>
                    <Text style={styles.checkMark}>!</Text>
                  </View>
                ) : (
                  <View style={styles.emptyCircle} />
                )}
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={group._id}
              style={[
                styles.groupCard,
                isSelected && styles.groupCardSelected,
              ]}
              onPress={() => setPickedGroupId(group.groupId)}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1 }}>
                <Text style={isSelected ? styles.groupCardTitleBlue : styles.groupCardTitle}>
                  {timeText}
                </Text>
                <View style={styles.seatsBadge}>
                  <Text
                    style={[
                      styles.seatsBadgeText,
                      { color: seatInfo.color },
                    ]}
                  >
                    {seatInfo.text}
                  </Text>
                </View>
              </View>

              {isSelected ? (
                <View style={styles.checkCircle}>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              ) : (
                <View style={styles.emptyCircle} />
              )}
            </TouchableOpacity>
          );
        })}

        {/* Link to Help / Escalation */}
        <TouchableOpacity
          style={styles.advisorHelpBtn}
          onPress={() =>
            navigation.navigate('HelpRequest', {
              modules: `${moduleCode} Schedule Request`,
              conflictDescription: 'Requesting assistance with module group allocation',
            })
          }
          activeOpacity={0.7}
        >
          <Text style={styles.advisorHelpText}>
            Need assistance with this module? Ask an advisor ›
          </Text>
        </TouchableOpacity>

        {/* Seats Update Live Info Card */}
        <View style={styles.liveSyncCard}>
          <Text style={styles.liveSyncTitle}>Seats update live</Text>
          <Text style={styles.liveSyncSubtitle}>
            Last synced {syncSeconds} seconds ago
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Add to registration"
          onPress={handleAddToRegistration}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F8',
  },
  header: {
    paddingTop: 44,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.base,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    paddingRight: SPACING.sm,
  },
  backArrow: {
    color: COLORS.white,
    fontSize: 32,
    lineHeight: 32,
    fontWeight: '300',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 20,
  },

  moduleSubhead: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.md,
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  // Clash Card
  clashCard: {
    backgroundColor: '#FDF2F2',
    borderRadius: 20,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  groupCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  clashBadge: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  clashBadgeText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },

  // Selected Group Card
  groupCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  groupCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 1.5,
  },
  groupCardTitleBlue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 8,
  },
  seatsBadge: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  seatsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },

  advisorHelpBtn: {
    paddingVertical: 12,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  advisorHelpText: {
    color: '#6C3BFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Live Sync Card
  liveSyncCard: {
    backgroundColor: '#FEFCE8',
    borderRadius: 20,
    padding: SPACING.lg,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  liveSyncTitle: {
    color: '#B45309',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  liveSyncSubtitle: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '500',
  },

  footer: {
    paddingHorizontal: SPACING.base,
    paddingBottom: 28,
    paddingTop: SPACING.sm,
    backgroundColor: '#F3F4F8',
  },
});
