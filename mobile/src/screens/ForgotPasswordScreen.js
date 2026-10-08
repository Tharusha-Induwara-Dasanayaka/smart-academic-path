import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PrimaryButton } from '../components/ui';
import { authAPI } from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your student email');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (error) {
      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reset password</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✉️</Text>
          </View>
        </View>

        <Text style={styles.title}>Forgot your password?</Text>
        <Text style={styles.subtitle}>
          Enter your student email and we'll send you a link to reset it.
        </Text>

        {/* Form Card */}
        <View style={styles.card}>
          {sent ? (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Check your email</Text>
              <Text style={styles.successText}>
                If an account with that email exists, we've sent a reset link.
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: SPACING.lg }}>
                <Text style={styles.linkText}>Back to sign in</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.label}>Student Email</Text>
              <View style={styles.inputWrap}>
                <TextInput
                  style={styles.input}
                  placeholder="IT23xxxxxxx@my.sliit.lk"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={{ marginTop: SPACING.lg }}>
                <PrimaryButton title="Send reset link" onPress={handleSend} loading={loading} />
              </View>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Remembered your password? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.linkText}>Back to sign in</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom continue button */}
      {!sent && (
        <View style={styles.bottomBtn}>
          <PrimaryButton title="Continue" onPress={() => navigation.goBack()} variant="gradient" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingTop: 50,
    paddingBottom: SPACING.base,
    paddingHorizontal: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { padding: SPACING.xs, marginRight: SPACING.sm },
  backArrow: { color: COLORS.white, fontSize: 28, fontWeight: '300', lineHeight: 32 },
  headerTitle: { color: COLORS.white, fontSize: FONTS.sizes.lg, fontWeight: '700' },

  content: { padding: SPACING.base, paddingTop: SPACING.xxl },

  iconContainer: { alignItems: 'center', marginBottom: SPACING.lg },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 34 },

  title: { fontSize: FONTS.sizes.xl, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  subtitle: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 20 },

  card: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.sm,
  },

  label: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600', marginBottom: SPACING.xs },
  inputWrap: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 50,
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  input: { fontSize: FONTS.sizes.base, color: COLORS.text },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg, flexWrap: 'wrap' },
  footerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
  linkText: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.sm },

  successContainer: { alignItems: 'center', padding: SPACING.md },
  successIcon: { fontSize: 48, marginBottom: SPACING.md },
  successTitle: { fontSize: FONTS.sizes.lg, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  successText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },

  bottomBtn: { padding: SPACING.base, paddingBottom: 32 },
});
