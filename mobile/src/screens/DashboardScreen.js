import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PrimaryButton, Card } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function DashboardScreen({ navigation }) {
  const {
    student,
    clashes,
    registrationStatus,
    registrationProgress,
    resumeRegistration,
  } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const deadlineStr = 'Closes in 2 days, 11:59pm';

  const handleResumeCTA = () => {
    resumeRegistration(navigation);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Purple Header */}
      <LinearGradient
        colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
        style={styles.header}
      >
        <Text style={styles.greeting}>Hi, {student?.name?.split(' ')[0] || 'Nethmi'}</Text>
        <Text style={styles.subGreeting}>Semester {student?.semester || 2} registration is open</Text>
      </LinearGradient>

      <View style={styles.body}>
        {/* Deadline Warning Card -> navigates to Notifications */}
        <TouchableOpacity
          onPress={() => navigation.navigate('notifications')}
          activeOpacity={0.85}
        >
          <Card style={styles.deadlineCard}>
            <View style={styles.deadlineRow}>
              <View style={styles.deadlineIcon}>
                <Text style={{ fontSize: 18 }}>⚠️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.deadlineTitle}>Deadline approaching</Text>
                <Text style={styles.deadlineText}>{deadlineStr}</Text>
              </View>
              <Text style={{ color: COLORS.warning, fontSize: 18, fontWeight: '700' }}>›</Text>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Progress Section */}
        <Text style={styles.sectionTitle}>Your progress</Text>

        <View style={styles.progressList}>
          {/* Step 1 - Modules */}
          <View style={styles.progressItem}>
            <View style={[styles.stepIcon, { backgroundColor: COLORS.success }]}>
              <Text style={styles.stepIconText}>✓</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Modules selected</Text>
              <Text style={styles.stepSubtitle}>{registrationProgress.modules} of {registrationProgress.totalModules} chosen</Text>
            </View>
          </View>

          {/* Step 2 - Clashes */}
          <View style={styles.progressItem}>
            <View style={[styles.stepIcon, { backgroundColor: registrationProgress.clashes > 0 ? COLORS.warning : COLORS.success }]}>
              {registrationProgress.clashes > 0 ? (
                <Text style={styles.stepIconText}>!</Text>
              ) : (
                <Text style={styles.stepIconText}>✓</Text>
              )}
            </View>
            <View style={styles.progressLine} />
            <View style={styles.stepContent}>
              {registrationProgress.clashes > 0 ? (
                <>
                  <Text style={[styles.stepTitle, { color: COLORS.warning }]}>
                    {registrationProgress.clashes} clash{registrationProgress.clashes > 1 ? 'es' : ''} to resolve
                  </Text>
                  <Text style={[styles.stepSubtitle, { color: COLORS.warning }]}>
                    {clashes[0]?.moduleA} overlaps {clashes[0]?.moduleB}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.stepTitle}>No clashes detected</Text>
                  <Text style={styles.stepSubtitle}>All modules are clear</Text>
                </>
              )}
            </View>
          </View>

          {/* Step 3 - Timetable */}
          <View style={styles.progressItem}>
            <View style={[styles.stepIcon, { backgroundColor: registrationProgress.timetableReviewed ? COLORS.success : COLORS.border }]}>
              {registrationProgress.timetableReviewed ? (
                <Text style={styles.stepIconText}>✓</Text>
              ) : (
                <View style={styles.stepIconEmpty} />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Review weekly timetable</Text>
              <Text style={styles.stepSubtitle}>
                {registrationProgress.timetableReviewed ? 'Completed' : 'Not started'}
              </Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.cta}>
          {registrationStatus === 'confirmed' ? (
            <View style={{ alignItems: 'center', backgroundColor: '#ECFDF5', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#A7F3D0' }}>
              <Text style={{ color: '#065F46', fontSize: 16, fontWeight: '800', marginBottom: 4 }}>
                ✓ Registration complete
              </Text>
              <Text style={{ color: '#047857', fontSize: 13, marginBottom: 12 }}>
                Your timetable has been confirmed and finalized.
              </Text>
              <PrimaryButton
                title="View confirmed timetable"
                onPress={handleResumeCTA}
              />
            </View>
          ) : (
            <PrimaryButton
              title="Resume registration!"
              onPress={handleResumeCTA}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1 },

  header: {
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.base,
  },
  greeting: { color: COLORS.white, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
  subGreeting: { color: 'rgba(255,255,255,0.85)', fontSize: FONTS.sizes.base, marginTop: 4 },

  body: { padding: SPACING.base, paddingTop: SPACING.lg },

  deadlineCard: {
    borderWidth: 1,
    borderColor: '#FDE68A',
    backgroundColor: COLORS.warningLight,
    marginBottom: SPACING.xl,
  },
  deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  deadlineIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadlineTitle: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.warning },
  deadlineText: { fontSize: FONTS.sizes.sm, color: COLORS.warning, marginTop: 2 },

  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },

  progressList: { gap: 0, marginBottom: SPACING.xxl },
  progressItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.lg },

  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  stepIconText: { color: COLORS.white, fontWeight: '900', fontSize: 14 },
  stepIconEmpty: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.white, opacity: 0.5 },
  progressLine: {
    position: 'absolute',
    left: 15,
    top: 34,
    width: 2,
    height: 32,
    backgroundColor: COLORS.border,
  },

  stepContent: { flex: 1 },
  stepTitle: { fontSize: FONTS.sizes.base, fontWeight: '700', color: COLORS.text },
  stepSubtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },

  cta: { marginTop: SPACING.md },
});
