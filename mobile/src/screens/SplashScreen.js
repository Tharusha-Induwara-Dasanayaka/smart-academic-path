import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING } from '../constants/theme';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  const { hasSeenOnboarding, isAuthenticated, role, isReady } = useApp();
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Wait until AppContext has finished loading persisted state
    // before deciding which screen to navigate to
    if (!isReady) return;

    const timer = setTimeout(() => {
      if (!hasSeenOnboarding) {
        navigation.replace('Onboarding');
      } else if (isAuthenticated) {
        if (role === 'advisor') {
          navigation.replace('AdvisorCases');
        } else if (role === 'admin') {
          navigation.replace('AdminStatus');
        } else {
          navigation.replace('MainTabs');
        }
      } else {
        navigation.replace('Login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isReady, hasSeenOnboarding, isAuthenticated, role]);

  return (
    <LinearGradient
      colors={['#7C3AED', '#6C3BFF', '#8B5CF6']}
      style={styles.container}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
    >
      {/* Decorative circle bottom */}
      <View style={styles.circleBottom} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🎓</Text>
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
        SMART ACADEMIC PATH
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Connecting Time & Education
      </Animated.Text>

      {/* Dots indicator */}
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBottom: {
    position: 'absolute',
    bottom: -80,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoContainer: {
    marginBottom: SPACING.xl,
  },
  logoBox: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 56,
  },
  appName: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FONTS.sizes.base,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  dots: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: COLORS.white,
    width: 24,
  },
});
