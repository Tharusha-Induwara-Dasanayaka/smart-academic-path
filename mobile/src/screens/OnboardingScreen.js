import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { PrimaryButton } from '../components/ui';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Catch clashes before they happen',
    subtitle: 'We check every module and group you pick against your timetable in real time.',
    illustration: 'clash',
  },
  {
    id: '2',
    title: 'Get smart alternatives instantly',
    subtitle: 'If a class clashes, we suggest open groups that fit your schedule right away.',
    illustration: 'alternatives',
  },
  {
    id: '3',
    title: 'See your whole week at a glance',
    subtitle: 'A clean, live weekly timetable so you always know exactly where to be.',
    illustration: 'timetable',
  },
];

const ClashIllustration = () => (
  <View style={styles.illustrationContainer}>
    <View style={[styles.illustBg, { backgroundColor: '#EEF2FF' }]}>
      <View style={styles.clashCard1}>
        <Text style={styles.clashCardCode}>IT3060</Text>
        <Text style={styles.clashCardTime}>Mon 10-12</Text>
      </View>
      <View style={styles.clashCard2}>
        <Text style={[styles.clashCardCode, { color: COLORS.clashRed }]}>IT3070</Text>
        <Text style={styles.clashCardTime}>Mon 10-12</Text>
      </View>
      <View style={styles.clashBadge}>
        <Text style={styles.clashBadgeText}>!</Text>
      </View>
    </View>
  </View>
);

const AlternativesIllustration = () => (
  <View style={styles.illustrationContainer}>
    <View style={[styles.illustBg, { backgroundColor: '#F0FFF4' }]}>
      <View style={[styles.altCard, { borderColor: COLORS.error, backgroundColor: COLORS.errorLight }]}>
        <View style={styles.altIcon}>
          <Text style={{ color: COLORS.error, fontSize: 16 }}>✕</Text>
        </View>
        <Text style={styles.altCardText}>Group 2 - full</Text>
      </View>
      <View style={[styles.altCard, { borderColor: COLORS.success, backgroundColor: COLORS.successLight, borderWidth: 2 }]}>
        <View style={[styles.altIcon, { backgroundColor: COLORS.success }]}>
          <Text style={{ color: COLORS.white, fontSize: 14 }}>✓</Text>
        </View>
        <Text style={[styles.altCardText, { color: COLORS.success, fontWeight: '700' }]}>Group 4 - 12 seats</Text>
      </View>
    </View>
  </View>
);

const TimetableIllustration = () => (
  <View style={styles.illustrationContainer}>
    <View style={[styles.illustBg, { backgroundColor: '#FFFBEB' }]}>
      <View style={styles.miniGrid}>
        {[...Array(9)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.miniCell,
              i === 0 && { backgroundColor: '#FEF08A' },
              i === 6 && { backgroundColor: '#FED7AA' },
            ]}
          />
        ))}
      </View>
      <View style={[styles.successCircle]}>
        <Text style={{ color: COLORS.white, fontSize: 20, fontWeight: '700' }}>✓</Text>
      </View>
    </View>
  </View>
);

import { useApp } from '../context/AppContext';

export default function OnboardingScreen({ navigation }) {
  const { setHasSeenOnboarding } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      setHasSeenOnboarding(true);
      navigation.replace('Login');
    }
  };

  const handleSkip = () => {
    setHasSeenOnboarding(true);
    navigation.replace('Login');
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      {item.illustration === 'clash' && <ClashIllustration />}
      {item.illustration === 'alternatives' && <AlternativesIllustration />}
      {item.illustration === 'timetable' && <TimetableIllustration />}

      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />

      {/* Dot indicators */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              currentIndex === i ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* CTA Button */}
      <View style={styles.btnContainer}>
        <PrimaryButton
          title={currentIndex === slides.length - 1 ? 'Get started' : 'Next'}
          onPress={handleNext}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  skipBtn: { position: 'absolute', top: 50, right: SPACING.base, zIndex: 10, padding: SPACING.sm },
  skipText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.base, fontWeight: '500' },

  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
  },
  slideTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.xxl,
    marginBottom: SPACING.md,
  },
  slideSubtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.sm,
  },

  // Illustrations
  illustrationContainer: { width: '100%', alignItems: 'center' },
  illustBg: {
    width: 220,
    height: 200,
    borderRadius: RADIUS.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Clash illustration
  clashCard1: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.moduleBlue,
    padding: SPACING.md,
    width: 130,
  },
  clashCard2: {
    position: 'absolute',
    top: 80,
    right: 10,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.clashRed,
    padding: SPACING.md,
    width: 130,
  },
  clashCardCode: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.moduleBlue, marginBottom: 2 },
  clashCardTime: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  clashBadge: {
    position: 'absolute',
    top: 72,
    right: 14,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.clashRed,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  clashBadgeText: { color: COLORS.white, fontWeight: '900', fontSize: 16 },

  // Alternatives illustration
  altCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    width: 180,
    gap: SPACING.sm,
  },
  altIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  altCardText: { fontSize: FONTS.sizes.base, fontWeight: '600', color: COLORS.text },

  // Timetable illustration
  miniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 120,
    gap: 4,
  },
  miniCell: {
    width: 34,
    height: 30,
    borderRadius: 6,
    backgroundColor: COLORS.borderLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  successCircle: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Dots
  dots: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  dot: { height: 8, borderRadius: 4 },
  dotActive: { width: 28, backgroundColor: COLORS.primary },
  dotInactive: { width: 8, backgroundColor: COLORS.border },

  btnContainer: { paddingHorizontal: SPACING.base, paddingBottom: 40 },
});
