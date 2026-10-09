import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PrimaryButton } from '../components/ui';

import { useApp } from '../context/AppContext';

export default function ClashWarningScreen({ navigation, route }) {
  const { clashes } = useApp();

  const clash = clashes[0] || {};
  const clashingModuleCode = clash.moduleB || 'IT3070';
  const clashingGroupName = clash.groupB ? `Group ${clash.groupB.replace('G', '')}` : 'Group 2';
  const conflictDescription = clash.moduleA
    ? `Overlaps ${clash.moduleA}-${clash.groupA} · ${clash.dayOfWeek || clash.day} ${clash.overlapWindow}`
    : 'Overlaps IT3060-G1 · Mon 10:00–12:00';

  const handleViewAlternatives = () => {
    navigation.navigate('AlternativeSelection', {
      moduleCode: clashingModuleCode,
    });
  };

  const handleAskAdvisor = () => {
    navigation.navigate('HelpRequest', {
      conflictDescription,
      modules: `${clashingModuleCode}-${clash.groupB || 'G2'} vs ${clash.moduleA || 'IT3060'}-${clash.groupA || 'G1'}`,
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
            <Text style={styles.headerTitle}>Course registration</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Dim / Centered Content Area */}
      <View style={styles.modalArea}>
        {/* White Card Modal */}
        <View style={styles.card}>
          {/* Red Circle with Exclamation Mark */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconExclamation}>!</Text>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Time clash detected</Text>
          <Text style={styles.subtitle}>This selection overlaps another class</Text>

          {/* Conflict Detail Box */}
          <View style={styles.conflictBox}>
            <Text style={styles.conflictModuleName}>
              {clashingModuleCode} – {clashingGroupName}
            </Text>
            <Text style={styles.conflictDetailText}>{conflictDescription}</Text>
            <Text style={styles.conflictHint}>
              Please select an alternative group to continue registration.
            </Text>
          </View>

          {/* CTA: View Alternatives */}
          <View style={styles.btnWrap}>
            <PrimaryButton
              title="View alternatives"
              onPress={handleViewAlternatives}
            />
          </View>

          {/* Secondary Action: Keep anyway (blocked) - Disabled */}
          <TouchableOpacity
            style={[styles.secondaryBtn, { opacity: 0.45 }]}
            disabled={true}
            activeOpacity={1}
          >
            <Text style={[styles.secondaryBtnText, { color: '#9CA3AF' }]}>
              Keep anyway (blocked)
            </Text>
          </TouchableOpacity>

          {/* Ask an Advisor Link */}
          <TouchableOpacity
            style={{ marginTop: SPACING.md, padding: SPACING.xs }}
            onPress={handleAskAdvisor}
            activeOpacity={0.7}
          >
            <Text style={{ color: '#6C3BFF', fontWeight: '700', fontSize: 14 }}>
              Need an exception? Ask an advisor ›
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
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
    fontSize: FONTS.sizes.lg,
    fontWeight: '700',
  },

  modalArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 28,
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.md,
  },

  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  iconExclamation: {
    color: COLORS.white,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 44,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },

  conflictBox: {
    width: '100%',
    backgroundColor: '#FFF1F0',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.xl,
  },
  conflictModuleName: {
    fontSize: FONTS.sizes.base,
    fontWeight: '800',
    color: '#FF3B30',
    marginBottom: 4,
  },
  conflictDetailText: {
    fontSize: FONTS.sizes.sm,
    color: '#FF3B30',
    fontWeight: '500',
  },
  conflictHint: {
    fontSize: FONTS.sizes.xs,
    color: '#FF3B30',
    fontWeight: '400',
    marginTop: 6,
    opacity: 0.8,
  },

  btnWrap: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  secondaryBtn: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sizes.base,
    fontWeight: '600',
  },
});
