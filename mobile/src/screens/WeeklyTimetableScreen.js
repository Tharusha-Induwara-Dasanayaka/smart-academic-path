import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { PrimaryButton } from '../components/ui';
import TimetableGrid from '../components/TimetableGrid';
import { useApp } from '../context/AppContext';

export default function WeeklyTimetableScreen({ navigation }) {
  const {
    selectedModules,
    groups,
    clashes,
    isClashFree,
    registrationStatus,
    confirmRegistration,
    reviewTimetable,
  } = useApp();

  const isClean = isClashFree;

  React.useEffect(() => {
    reviewTimetable();
  }, [reviewTimetable]);

  const handleExport = async () => {
    try {
      const moduleSummary = selectedModules
        .map((s) => {
          const g = groups.find((grp) => grp.moduleCode === s.moduleCode && grp.groupId === s.groupId);
          return `• ${s.moduleCode} (${s.groupId}) - ${g?.day || ''} ${g?.start || ''}–${g?.end || ''}`;
        })
        .join('\n');

      await Share.share({
        title: 'Smart Academic Path - Timetable',
        message: `Smart Academic Path Official Weekly Timetable (Semester 2):\n\n${moduleSummary}\n\nStatus: ${
          isClean ? '0 Clashes Detected (All clear)' : `${clashes.length} Clash(es) Detected`
        }`,
      });
    } catch {
      Alert.alert('Exported', 'Timetable has been exported to your device.');
    }
  };

  const handleProceedToConfirmation = () => {
    const result = confirmRegistration(navigation);
    if (!result.success) {
      Alert.alert('Unable to confirm registration', result.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>My week</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Live Timetable Grid */}
        <TimetableGrid
          selectedModules={selectedModules}
          groups={groups}
          clashes={clashes}
          onModulePress={(code) => navigation.navigate('ModuleDetail', { moduleCode: code })}
        />

        {/* Overlap Status Row */}
        {isClean ? (
          <View style={styles.overlapStatusRow}>
            <View style={styles.greenCheckCircle}>
              <Text style={styles.checkIconText}>✓</Text>
            </View>
            <Text style={styles.overlapStatusText}>No overlaps detected</Text>
          </View>
        ) : (
          <View style={[styles.overlapStatusRow, styles.clashStatusRow]}>
            <View style={[styles.greenCheckCircle, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.checkIconText}>!</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.overlapStatusText, { color: '#DC2626' }]}>
                {clashes.length} timetable clash{clashes.length > 1 ? 'es' : ''} detected
              </Text>
              <Text style={styles.clashDetailText}>
                {clashes[0]?.moduleA} and {clashes[0]?.moduleB} overlap on {clashes[0]?.day}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        {registrationStatus !== 'confirmed' && (
          <View style={{ marginBottom: SPACING.sm }}>
            <PrimaryButton
              title="Proceed to confirmation"
              onPress={handleProceedToConfirmation}
              disabled={!isClean}
            />
          </View>
        )}
        <PrimaryButton
          title="Export timetable"
          onPress={handleExport}
          variant="outline"
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

  overlapStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  clashStatusRow: {
    backgroundColor: '#FEE2E2',
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  clashDetailText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  greenCheckCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
  overlapStatusText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },

  footer: {
    paddingHorizontal: SPACING.base,
    paddingBottom: 28,
    paddingTop: SPACING.sm,
    backgroundColor: '#F3F4F8',
  },
});
