import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';

// ── Primary Button ───────────────────────────────────────────────────────────
export const PrimaryButton = ({ title, onPress, loading, disabled, style, textStyle, variant = 'gradient' }) => {
  const isDisabled = loading || disabled;

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[styles.btn, styles.btnOutline, isDisabled && styles.btnDisabled, style]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="small" />
        ) : (
          <Text style={[styles.btnTextOutline, textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.btnWrapper, isDisabled && styles.btnDisabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.btn}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Text style={[styles.btnText, textStyle]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ── White Card ───────────────────────────────────────────────────────────────
export const Card = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
};

// ── Purple Header ────────────────────────────────────────────────────────────
export const PurpleHeader = ({ title, onBack, rightElement, children }) => (
  <LinearGradient
    colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
    style={styles.header}
  >
    <View style={styles.headerContent}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
      )}
      <Text style={[styles.headerTitle, onBack && { marginLeft: SPACING.sm }]}>{title}</Text>
      {rightElement && <View style={styles.headerRight}>{rightElement}</View>}
    </View>
    {children}
  </LinearGradient>
);

// ── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ label, color = 'green', style }) => {
  const badgeStyle = {
    green: { bg: COLORS.successLight, text: COLORS.success },
    orange: { bg: COLORS.warningLight, text: COLORS.warning },
    red: { bg: COLORS.errorLight, text: COLORS.error },
    blue: { bg: COLORS.moduleBlueLight, text: COLORS.moduleBlue },
    gray: { bg: COLORS.borderLight, text: COLORS.textSecondary },
  }[color] || { bg: COLORS.successLight, text: COLORS.success };

  return (
    <View style={[styles.badge, { backgroundColor: badgeStyle.bg }, style]}>
      <Text style={[styles.badgeText, { color: badgeStyle.text }]}>{label}</Text>
    </View>
  );
};

// ── Loading Spinner ──────────────────────────────────────────────────────────
export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    {message && <Text style={styles.loadingText}>{message}</Text>}
  </View>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, message, actionLabel, onAction }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {message && <Text style={styles.emptyMessage}>{message}</Text>}
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction} style={styles.emptyAction}>
        <Text style={styles.emptyActionText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Section Header ────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ── Input Field ───────────────────────────────────────────────────────────────
export const InputField = ({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize, style }) => (
  <View style={[styles.inputWrapper, style]}>
    {label && <Text style={styles.inputLabel}>{label}</Text>}
    <View style={styles.inputContainer}>
      <Text
        style={[styles.inputText, !value && styles.inputPlaceholder]}
        numberOfLines={1}
      >
        {/* Real TextInput below — this is just for display structure */}
      </Text>
    </View>
  </View>
);

// ── Separator ─────────────────────────────────────────────────────────────────
export const Separator = ({ style }) => <View style={[styles.separator, style]} />;

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Button
  btnWrapper: { borderRadius: RADIUS.full, overflow: 'hidden', ...SHADOWS.lg },
  btn: {
    height: 54,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  btnText: { color: COLORS.white, fontSize: FONTS.sizes.md, fontWeight: '700', letterSpacing: 0.3 },
  btnOutline: {
    height: 54,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  btnTextOutline: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.base,
    ...SHADOWS.sm,
    marginBottom: SPACING.md,
  },

  // Header
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.base,
    paddingHorizontal: SPACING.base,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700', flex: 1 },
  headerRight: { marginLeft: 'auto' },
  backBtn: { padding: SPACING.xs, marginRight: SPACING.xs },
  backArrow: { color: COLORS.white, fontSize: 28, fontWeight: '300', lineHeight: 32 },

  // Badge
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.base, marginTop: SPACING.sm },

  // Empty state
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  emptyMessage: { fontSize: FONTS.sizes.base, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptyAction: { marginTop: SPACING.lg, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm, backgroundColor: COLORS.surfaceSecondary, borderRadius: RADIUS.full },
  emptyActionText: { color: COLORS.primary, fontWeight: '600', fontSize: FONTS.sizes.base },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  sectionTitle: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.text },
  sectionAction: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600' },

  // Separator
  separator: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },

  // Input
  inputWrapper: { marginBottom: SPACING.md },
  inputLabel: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginBottom: SPACING.xs, fontWeight: '500' },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    height: 48,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputText: { fontSize: FONTS.sizes.base, color: COLORS.text },
  inputPlaceholder: { color: COLORS.textMuted },
});
