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
import { useAuth } from '../context/AuthContext';

export default function DashboardScreen({ navigation }) {
  const { student, selectedModules, clashes, registrationStatus, lastSyncTime, logout } = useApp();
  const { logout: authLogout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleLogout = async () => {
    await authLogout();   // clears SecureStore token
    logout();             // clears AppContext state
    navigation.replace('Login');
  };

  // Format lastSyncTime (timestamp) into a readable "X mins ago" string
  const formatSyncTime = (timestamp) => {
    if (!timestamp) return null;
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 10) return 'Just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMins = Math.floor(diffSeconds / 60);
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    return 'Over an hour ago';
  };

  const progress = {
    modules: selectedModules.length,
    total: 5,
    clashes: clashes.length,
    timetableReviewed: registrationStatus === 'confirmed',
  };

  const deadlineStr = 'Closes in 2 days, 11:59pm';

  const handleResumeCTA = () => {
    if (registrationStatus === 'confirmed') {
      navigation.navigate('Confirmation');
    } else if (registrationStatus === 'has_clash') {
      // Step reached: clash exists -> Selection / Clash flow
      navigation.navigate('CourseRegistration', { openClashModal: true });
    } else if (registrationStatus === 'clash_free') {
      // Step reached: clash_free -> Weekly Timetable
      navigation.navigate('Timetable');
    } else {
      // not_started -> go to Course Registration (stack screen, not tab name)
      navigation.navigate('CourseRegistration');
    }
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
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Hi, {student?.name?.split(' ')[0] || 'Nethmi'}</Text>
            <Text style={styles.subGreeting}>Semester {student?.semester || 2} registration is open</Text>
            {lastSyncTime ? (
              <Text style={styles.syncText}>Last synced: {formatSyncTime(lastSyncTime)}</Text>
            ) : null}
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.7}>
            <Text style={styles.logoutIcon}>⏻</Text>
          </TouchableOpacity>
        </View>
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
              <Text style={styles.stepSubtitle}>{progress.modules} of {progress.total} chosen</Text>
            </View>
          </View>

          {/* Step 2 - Clashes */}
          <View style={styles.progressItem}>
            <View style={[styles.stepIcon, { backgroundColor: progress.clashes > 0 ? COLORS.warning : COLORS.success }]}>
              {progress.clashes > 0 ? (
                <Text style={styles.stepIconText}>!</Text>
              ) : (
                <Text style={styles.stepIconText}>✓</Text>
              )}
            </View>
            <View style={styles.progressLine} />
            <View style={styles.stepContent}>
              {progress.clashes > 0 ? (
                <>
                  <Text style={[styles.stepTitle, { color: COLORS.warning }]}>
                    {progress.clashes} clash{progress.clashes > 1 ? 'es' : ''} to resolve
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
            <View style={[styles.stepIcon, { backgroundColor: progress.timetableReviewed ? COLORS.success : COLORS.border }]}>
              {progress.timetableReviewed ? (
                <Text style={styles.stepIconText}>✓</Text>
              ) : (
                <View style={styles.stepIconEmpty} />
              )}
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Review weekly timetable</Text>
              <Text style={styles.stepSubtitle}>
                {progress.timetableReviewed ? 'Completed' : 'Not started'}
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
                onPress={() => navigation.navigate('Confirmation')}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: { color: COLORS.white, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
  subGreeting: { color: 'rgba(255,255,255,0.85)', fontSize: FONTS.sizes.base, marginTop: 4 },
  syncText: { color: 'rgba(255,255,255,0.55)', fontSize: FONTS.sizes.xs, marginTop: 6 },
  logoutBtn: {
    marginTop: 4,
    padding: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  logoutIcon: {
    fontSize: 18,
    color: COLORS.white,
  },

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
