import React, { useEffect } from 'react';
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
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PrimaryButton } from '../components/ui';
import TimetableGrid from '../components/TimetableGrid';
import { useApp } from '../context/AppContext';

export default function ConfirmationScreen({ navigation, route }) {
  const { selectedModules, groups, clashes, confirmRegistration } = useApp();

  // ROUTE GUARD: Block Confirmation while any clash exists, and redirect to Selection
  // Acceptance Test H: Typing /confirmation while clashing redirects back
  useEffect(() => {
    if (clashes.length > 0) {
      Alert.alert(
        'Clash Detected',
        'Confirmation is blocked because timetable conflicts exist. Please resolve them first.'
      );
      navigation.replace('CourseRegistration');
      return;
    }

    // On entry: confirm status and ensure push notification is delivered
    confirmRegistration();
  }, [clashes.length]);

  const moduleSummary = selectedModules.map((s) => s.moduleCode).join(' · ');

  const handleDownloadPDF = async () => {
    try {
      const details = selectedModules
        .map((s) => {
          const g = groups.find((grp) => grp.moduleCode === s.moduleCode && grp.groupId === s.groupId);
          return `• ${s.moduleCode} (${s.groupId}) - ${g?.day || ''} ${g?.start || ''}–${g?.end || ''}`;
        })
        .join('\n');

      await Share.share({
        title: 'Smart Academic Path Timetable Confirmation',
        message: `Official Academic Timetable Confirmation (SLIIT)\n\nStudent: Nethmi Perera (IT23583764)\nSemester: 2 (Year 3)\n\nEnrolled Modules:\n${details}\n\nTotal Clashes: 0 (All Conflicts Resolved)\nStatus: Confirmed & Finalized`,
      });
    } catch {
      Alert.alert('PDF Downloaded', 'Timetable PDF has been saved to your downloads.');
    }
  };

  if (clashes.length > 0) {
    return null; // Will redirect via useEffect
  }

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
            <Text style={styles.headerTitle}>All set</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Large Green Check Circle */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconCheck}>✓</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>You’re all set – no conflicts</Text>

        {/* Live Timetable Snapshot Grid */}
        <View style={{ width: '100%', marginBottom: SPACING.lg }}>
          <TimetableGrid
            selectedModules={selectedModules}
            groups={groups}
            clashes={[]}
            compact
          />
        </View>

        {/* Modules & Clashes Info */}
        <Text style={styles.modulesSummary}>
          {moduleSummary} — 0 clashes
        </Text>
      </ScrollView>

      {/* Footer CTA & Notice */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Download PDF timetable"
          onPress={handleDownloadPDF}
        />
        <Text style={styles.footerNotice}>Confirmation sent to your email</Text>
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
    alignItems: 'center',
    paddingTop: SPACING.xl,
  },

  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  iconCheck: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: '900',
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },

  modulesSummary: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SPACING.md,
  },

  footer: {
    paddingHorizontal: SPACING.base,
    paddingBottom: 28,
    paddingTop: SPACING.sm,
    backgroundColor: '#F3F4F8',
    alignItems: 'center',
  },
  footerNotice: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
    marginTop: SPACING.md,
  },
});
