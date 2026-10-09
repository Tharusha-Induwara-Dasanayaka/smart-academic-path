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
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PrimaryButton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function LoginScreen({ navigation }) {
  const { login, loginDemo, isAuthenticated: authIsAuthenticated } = useAuth();
  const { setRole, setIsAuthenticated } = useApp();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Keep AppContext isAuthenticated in sync with AuthContext token on mount
  // This fixes the dual-store desync on cold restart
  React.useEffect(() => {
    if (authIsAuthenticated) {
      setIsAuthenticated(true);
    }
  }, [authIsAuthenticated]);

  const validate = () => {
    const newErrors = {};
    if (!studentId.trim()) {
      newErrors.studentId = 'Student ID is required';
    } else if (studentId.trim().length < 9) {
      newErrors.studentId = 'Student ID must be at least 9 characters';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const routeByRole = (userRole) => {
    setIsAuthenticated(true);
    setRole(userRole);
    if (userRole === 'advisor') {
      navigation.replace('AdvisorCases');
    } else if (userRole === 'admin') {
      navigation.replace('AdminStatus');
    } else {
      navigation.replace('MainTabs');
    }
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await login(studentId.trim(), password);
    setLoading(false);

    if (result.success && result.user) {
      const userRole = result.user.role || (studentId.toUpperCase().startsWith('ADV') ? 'advisor' : studentId.toUpperCase().startsWith('ADM') ? 'admin' : 'student');
      routeByRole(userRole);
    } else {
      // Check local demo credentials if server returns error
      const sId = studentId.trim().toUpperCase();
      if ((sId === 'IT23583764' || sId === 'IT23000001') && password === 'password123') {
        routeByRole('student');
        return;
      }
      if (sId === 'ADV001' && password === 'password123') {
        routeByRole('advisor');
        return;
      }
      if (sId === 'ADMIN001' && password === 'password123') {
        routeByRole('admin');
        return;
      }

      // Inline error staying on screen
      setErrors({ general: 'Invalid ID or password. Please try again.' });
    }
  };

  const handleDemoLogin = async (targetRole) => {
    setLoading(true);
    await loginDemo(targetRole);
    setLoading(false);
    routeByRole(targetRole);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🎓</Text>
          </View>
        </View>

        <Text style={styles.title}>Sign in to registration</Text>

        {/* Form Card */}
        <View style={styles.card}>
          {errors.general && (
            <View style={{ backgroundColor: '#FEE2E2', padding: 12, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#FCA5A5' }}>
              <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '700', textAlign: 'center' }}>
                {errors.general}
              </Text>
            </View>
          )}

          {/* Student ID */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Student ID</Text>
            <Text style={styles.charCounter}>{studentId.length}/11</Text>
          </View>
          <View style={[styles.inputWrap, errors.studentId && styles.inputError]}>
            <TextInput
              style={styles.input}
              placeholder="IT23xxxxxxx"
              placeholderTextColor={COLORS.textMuted}
              value={studentId}
              onChangeText={(v) => { setStudentId(v); setErrors((e) => ({ ...e, studentId: null })); }}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={11}
            />
          </View>
          {errors.studentId && <Text style={styles.errorText}>{errors.studentId}</Text>}

          {/* Password */}
          <Text style={[styles.label, { marginTop: SPACING.md }]}>Password</Text>
          <View style={[styles.inputWrap, errors.password && styles.inputError]}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: null })); }}
              secureTextEntry={!showPassword}
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Sign In */}
          <View style={{ marginTop: SPACING.lg }}>
            <PrimaryButton title="Sign in" onPress={handleLogin} loading={loading} />
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Demo Fast Logins */}
        <View style={styles.demoSection}>
          <Text style={styles.demoLabel}>Demo Quick Access:</Text>
          <View style={styles.demoButtonsRow}>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleDemoLogin('student')}
            >
              <Text style={styles.demoBtnText}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleDemoLogin('advisor')}
            >
              <Text style={styles.demoBtnText}>Advisor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => handleDemoLogin('admin')}
            >
              <Text style={styles.demoBtnText}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.xxl },

  logoContainer: { alignItems: 'center', marginBottom: SPACING.lg },
  logoBox: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.md,
  },
  logoEmoji: { fontSize: 48 },

  title: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },

  card: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.sm,
  },

  label: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, fontWeight: '600', marginBottom: SPACING.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  charCounter: { fontSize: FONTS.sizes.xs, color: COLORS.textMuted },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 50,
    marginBottom: SPACING.xs,
  },
  inputError: { borderColor: COLORS.error },
  input: { flex: 1, fontSize: FONTS.sizes.base, color: COLORS.text },
  eyeBtn: { padding: SPACING.xs },
  eyeIcon: { fontSize: 18 },
  errorText: { fontSize: FONTS.sizes.xs, color: COLORS.error, marginBottom: SPACING.xs },

  forgotBtn: { alignItems: 'center', marginTop: SPACING.md, padding: SPACING.sm },
  forgotText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },

  demoSection: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  demoBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.base,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6C3BFF',
  },
});
