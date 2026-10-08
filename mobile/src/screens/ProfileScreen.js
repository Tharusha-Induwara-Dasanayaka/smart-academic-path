import React from 'react';
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
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

import { useApp } from '../context/AppContext';

export default function ProfileScreen({ navigation }) {
  const { student, selectedModules, clashes, role, logout } = useApp();

  const studentName = student?.name || 'Nethmi Perera';
  const studentId = student?.id || 'IT23583764';
  const email = student?.email || 'IT23583764@my.sliit.lk';
  const phone = student?.phone || '+94 71 234 5678';
  const programme = student?.programme || 'BSc (Hons) IT – Year 3';
  const initials = studentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'NP';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Purple Gradient Header with Avatar & Details */}
      <LinearGradient
        colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
        style={styles.header}
      >
        <SafeAreaView style={styles.headerInner}>
          {/* Avatar Circle */}
          <View style={styles.avatarBorder}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </View>

          {/* User Name & Subtitle */}
          <Text style={styles.userName}>{studentName}</Text>
          <Text style={styles.userSubtitle}>
            {studentId} Year {student?.year || 3}, {student?.department || 'IT'}
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Floating Stat Summary Card */}
        <View style={styles.statCard}>
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{selectedModules.length}</Text>
            <Text style={styles.statLabel}>Modules</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: clashes.length > 0 ? '#DC2626' : '#059669' }]}>
              {clashes.length}
            </Text>
            <Text style={styles.statLabel}>Clashes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statValue}>2</Text>
            <Text style={styles.statLabel}>Semesters</Text>
          </View>
        </View>

        {/* Section: Account */}
        <Text style={styles.sectionTitle}>Account</Text>

        {/* EMAIL Item */}
        <TouchableOpacity style={styles.itemCard} activeOpacity={0.8}>
          <View style={[styles.itemIconCircle, { backgroundColor: '#E0F2FE' }]}>
            <Text style={styles.itemIcon}>✉️</Text>
          </View>
          <View style={styles.itemTextWrap}>
            <Text style={styles.itemLabel}>EMAIL</Text>
            <Text style={styles.itemValue}>{email}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* PHONE Item */}
        <TouchableOpacity style={styles.itemCard} activeOpacity={0.8}>
          <View style={[styles.itemIconCircle, { backgroundColor: '#DCFCE7' }]}>
            <Text style={styles.itemIcon}>📞</Text>
          </View>
          <View style={styles.itemTextWrap}>
            <Text style={styles.itemLabel}>PHONE</Text>
            <Text style={styles.itemValue}>{phone}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* PROGRAMME Item */}
        <TouchableOpacity style={styles.itemCard} activeOpacity={0.8}>
          <View style={[styles.itemIconCircle, { backgroundColor: '#FFEDD5' }]}>
            <Text style={styles.itemIcon}>🎓</Text>
          </View>
          <View style={styles.itemTextWrap}>
            <Text style={styles.itemLabel}>PROGRAMME</Text>
            <Text style={styles.itemValue}>{programme}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* HELP Item */}
        <TouchableOpacity
          style={styles.itemCard}
          onPress={() => navigation.navigate('HelpRequest')}
          activeOpacity={0.8}
        >
          <View style={[styles.itemIconCircle, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.itemIcon}>🎧</Text>
          </View>
          <View style={styles.itemTextWrap}>
            <Text style={styles.itemValueNoLabel}>Help</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Advisor Open Cases (Visible only for Academic Advisors) */}
        {role === 'advisor' && (
          <TouchableOpacity
            style={styles.specialCard}
            onPress={() => navigation.navigate('AdvisorCases')}
            activeOpacity={0.8}
          >
            <View style={[styles.itemIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.itemIcon}>📋</Text>
            </View>
            <View style={styles.itemTextWrap}>
              <Text style={styles.specialCardTitle}>Advisor Portal</Text>
              <Text style={styles.specialCardSub}>Review open clash cases</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}

        {/* Admin System Status (Visible only for System Admins) */}
        {role === 'admin' && (
          <TouchableOpacity
            style={styles.specialCard}
            onPress={() => navigation.navigate('AdminStatus')}
            activeOpacity={0.8}
          >
            <View style={[styles.itemIconCircle, { backgroundColor: '#E0E7FF' }]}>
              <Text style={styles.itemIcon}>⚡</Text>
            </View>
            <View style={styles.itemTextWrap}>
              <Text style={styles.specialCardTitle}>Admin Dashboard</Text>
              <Text style={styles.specialCardSub}>System status & live feeds</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F8',
  },
  header: {
    paddingTop: 54,
    paddingBottom: 48,
    alignItems: 'center',
  },
  headerInner: {
    alignItems: 'center',
  },
  avatarBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#CFE6FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#2563EB',
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  userSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    paddingBottom: 40,
  },

  // Floating stat card
  statCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    marginTop: -26,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.md,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    height: '80%',
    alignSelf: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  // Account item cards
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.sm,
  },
  itemIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  itemIcon: {
    fontSize: 20,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  itemValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '700',
  },
  itemValueNoLabel: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '700',
  },
  chevron: {
    fontSize: 24,
    color: '#D1D5DB',
    fontWeight: '300',
  },

  specialCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 20,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  specialCardTitle: {
    fontSize: 15,
    color: '#6C3BFF',
    fontWeight: '700',
  },
  specialCardSub: {
    fontSize: 12,
    color: '#9333EA',
  },

  logoutBtn: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
