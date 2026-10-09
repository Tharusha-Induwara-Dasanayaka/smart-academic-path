import React, { useEffect, useState } from 'react';
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
import { COLORS, FONTS, SPACING, RADIUS } from '../constants/theme';
import { PrimaryButton } from '../components/ui';
import TimetableGrid from '../components/TimetableGrid';
import { useApp } from '../context/AppContext';
import { getSeatInfo } from '../utils/clashLogic';

export default function AlternativeSelectionScreen({ navigation, route }) {
  const {
    groups,
    getModuleAlternatives,
    getRegistrationPreview,
    confirmRegistration,
  } = useApp();

  const moduleCode = route.params?.moduleCode || 'IT3070';
  const availableAlternatives = getModuleAlternatives(moduleCode).filter(
    (alternative) => !alternative.hasClashWithOthers
  );
  const defaultSelected =
    availableAlternatives.find((alternative) => alternative.isBestMatch)?.groupId ||
    availableAlternatives.find((alternative) => !alternative.isFull)?.groupId ||
    '';
  const [selectedGroupId, setSelectedGroupId] = useState(defaultSelected);

  useEffect(() => {
    setSelectedGroupId(defaultSelected);
  }, [moduleCode, defaultSelected]);

  const preview = getRegistrationPreview(moduleCode, selectedGroupId);
  const isClashFree = preview.isClashFree;
  const selectedAlternative = availableAlternatives.find(
    (alternative) => alternative.groupId === selectedGroupId
  );

  const handleConfirm = () => {
    const result = confirmRegistration(navigation, { moduleCode, groupId: selectedGroupId });
    if (!result.success) {
      Alert.alert('Unable to confirm registration', result.message);
    }
  };

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
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Choose an alternative</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Alternative Cards List */}
        <View style={styles.alternativesList}>
          {availableAlternatives.map((alt) => {
            const isSelected = selectedGroupId === alt.groupId;
            const seatInfo = getSeatInfo(alt.seatsLeft);
            const title = `${alt.moduleCode} – ${alt.groupName || `Group ${alt.groupId.replace('G', '')}`}`;
            const detailText = alt.isFull
              ? 'Full'
              : `${alt.timeDisplay || `${alt.day} ${alt.start}-${alt.end}`} · ${seatInfo.text}${
                  alt.isBestMatch ? ' · Best match' : ''
                }`;

            return (
              <TouchableOpacity
                key={alt._id}
                style={[
                  styles.altCard,
                  isSelected ? styles.altCardSelected : styles.altCardUnselected,
                  alt.isFull && { opacity: 0.6 },
                ]}
                onPress={() => !alt.isFull && setSelectedGroupId(alt.groupId)}
                disabled={alt.isFull}
                activeOpacity={0.85}
              >
                <View style={styles.altTextWrap}>
                  <Text style={[styles.altTitle, isSelected && styles.altTitleSelected]}>
                    {title}
                  </Text>
                  <Text style={[styles.altDetail, isSelected && styles.altDetailSelected]}>
                    {detailText}
                  </Text>
                </View>

                {isSelected ? (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.radioCircle} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Weekly Timetable Preview Section */}
        <Text style={styles.sectionHeader}>Weekly timetable preview</Text>

        {/* Dynamic Timetable Grid */}
        <TimetableGrid
          selectedModules={preview.selectedModules}
          groups={groups}
          clashes={preview.clashes}
        />

        {/* Helper status text */}
        {!isClashFree && (
          <View style={styles.clashWarningBanner}>
            <Text style={styles.clashWarningText}>
              ⚠️ This group still clashes with {preview.conflictingModule}. Please select another group to confirm.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer Confirm Button */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Confirm registration"
          onPress={handleConfirm}
          disabled={!isClashFree || !selectedAlternative || selectedAlternative.isFull}
        />
        {!isClashFree && (
          <Text style={styles.disabledHelperText}>
            Confirm disabled while clashes exist
          </Text>
        )}
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

  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 20,
  },

  alternativesList: {
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },

  altCard: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  altCardSelected: {
    backgroundColor: '#EBF3FE',
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  altCardUnselected: {
    backgroundColor: COLORS.white,
  },

  altTextWrap: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  altTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  altTitleSelected: {
    color: '#2563EB',
  },
  altDetail: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
  altDetailSelected: {
    color: '#3B82F6',
  },

  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },

  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  clashWarningBanner: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  clashWarningText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  footer: {
    paddingHorizontal: SPACING.base,
    paddingBottom: 28,
    paddingTop: SPACING.sm,
    backgroundColor: '#F3F4F8',
  },
  disabledHelperText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
});