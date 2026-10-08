import React, { useState, useMemo, useEffect } from 'react';
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

import { COLORS, FONTS, SPACING } from '../constants/theme';
import { PrimaryButton } from '../components/ui';
import TimetableGrid from '../components/TimetableGrid';

import { useApp } from '../context/AppContext';
import {
  detectClashes,
  getAlternatives,
  getSeatInfo,
} from '../utils/clashLogic';

import { registrationsAPI } from '../services/api';

export default function AlternativeSelectionScreen({ navigation, route }) {
  const {
    groups,
    modules,
    selectedModules,
    selectGroup,
  } = useApp();

  const moduleCode = route.params?.moduleCode || 'IT3070';

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ------------------------------------------------------
  // Get alternatives for the clashing module
  // ------------------------------------------------------
  const rawAlternatives = useMemo(() => {
    return getAlternatives(
      moduleCode,
      selectedModules,
      groups
    );
  }, [
    moduleCode,
    selectedModules,
    groups,
  ]);

  // ------------------------------------------------------
  // Remove alternatives that clash with other modules
  // ------------------------------------------------------
  const availableAlternatives = useMemo(() => {
    return rawAlternatives.filter(
      (alt) => !alt.hasClashWithOthers
    );
  }, [rawAlternatives]);

  // ------------------------------------------------------
  // Select best match by default
  // ------------------------------------------------------
  const defaultSelected = useMemo(() => {
    const best = availableAlternatives.find(
      (alt) => alt.isBestMatch
    );

    if (best) {
      return best.groupId;
    }

    return availableAlternatives[0]?.groupId || null;
  }, [availableAlternatives]);

  const [
    selectedGroupId,
    setSelectedGroupId,
  ] = useState(defaultSelected);

  // Update selection when alternatives finish loading
  useEffect(() => {
    if (defaultSelected) {
      setSelectedGroupId(defaultSelected);
    }
  }, [defaultSelected]);

  // ------------------------------------------------------
  // Preview timetable with selected alternative
  // ------------------------------------------------------
  const previewSelections = useMemo(() => {
    return selectedModules.map((item) =>
      item.moduleCode === moduleCode
        ? {
            moduleCode,
            groupId: selectedGroupId,
          }
        : item
    );
  }, [
    selectedModules,
    moduleCode,
    selectedGroupId,
  ]);

  // ------------------------------------------------------
  // Detect preview clashes
  // ------------------------------------------------------
  const previewClashes = useMemo(() => {
    return detectClashes(
      previewSelections,
      groups
    );
  }, [
    previewSelections,
    groups,
  ]);

  const isClashFree =
    previewClashes.length === 0 &&
    Boolean(selectedGroupId);

  // ------------------------------------------------------
  // Confirm selected alternative
  // ------------------------------------------------------
  const handleConfirm = async () => {
    if (
      !isClashFree ||
      !selectedGroupId ||
      isSubmitting
    ) {
      return;
    }

    try {
      setIsSubmitting(true);

      // ------------------------------------
      // Find module data
      // ------------------------------------
      const selectedModule = modules.find(
        (module) =>
          module.code === moduleCode ||
          module.moduleCode === moduleCode
      );

      if (!selectedModule) {
        throw new Error(
          `Module ${moduleCode} could not be found.`
        );
      }

      // ------------------------------------
      // Find selected class group data
      // ------------------------------------
      const selectedGroup = groups.find(
        (group) =>
          group.groupId === selectedGroupId &&
          group.moduleCode === moduleCode
      );

      if (!selectedGroup) {
        throw new Error(
          'Selected class group could not be found.'
        );
      }

      const moduleId =
        selectedModule._id ||
        selectedModule.id;

      const classGroupId =
        selectedGroup._id ||
        selectedGroup.id;

      if (!moduleId) {
        throw new Error(
          'Module database ID is missing.'
        );
      }

      if (!classGroupId) {
        throw new Error(
          'Class group database ID is missing.'
        );
      }

      // ------------------------------------
      // Get current registration
      // ------------------------------------
      const registrationResponse =
        await registrationsAPI.get();

      const responseData =
        registrationResponse.data;

      let registration = null;

      if (responseData?.registration) {
        registration =
          responseData.registration;
      } else if (
        responseData?.data &&
        !Array.isArray(responseData.data)
      ) {
        registration =
          responseData.data;
      } else if (
        Array.isArray(responseData?.data)
      ) {
        registration =
          responseData.data[0];
      } else if (
        Array.isArray(responseData)
      ) {
        registration =
          responseData[0];
      } else {
        registration =
          responseData;
      }

      const registrationId =
        registration?._id ||
        registration?.id;

      if (!registrationId) {
        throw new Error(
          'Registration could not be found.'
        );
      }

      // ------------------------------------
      // Update selected group in MongoDB
      // ------------------------------------
      await registrationsAPI.updateItem(
        registrationId,
        moduleId,
        classGroupId
      );

      // ------------------------------------
      // Confirm registration in MongoDB
      // ------------------------------------
      await registrationsAPI.confirm(
        registrationId
      );

      // ------------------------------------
      // Update local app state
      // ------------------------------------
      selectGroup(
        moduleCode,
        selectedGroupId
      );

      // ------------------------------------
      // Navigate to confirmation
      // ------------------------------------
      navigation.navigate(
        'Confirmation',
        {
          registrationId,
          moduleCode,
          selectedGroup:
            selectedGroupId,
        }
      );
    } catch (error) {
      console.error(
        'Alternative confirmation failed:',
        error.response?.data ||
          error.message
      );

      const message =
        error.response?.data?.message ||
        error.message ||
        'Could not confirm your registration.';

      Alert.alert(
        'Registration failed',
        message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[
          COLORS.primaryGradientStart,
          COLORS.primaryGradientEnd,
        ]}
        style={styles.header}
      >
        <SafeAreaView>
          <View
            style={styles.headerContent}
          >
            <TouchableOpacity
              onPress={() =>
                navigation.goBack()
              }
              style={styles.backBtn}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <Text
                style={styles.backArrow}
              >
                ‹
              </Text>
            </TouchableOpacity>

            <Text
              style={styles.headerTitle}
            >
              Choose an alternative
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Empty State */}
        {availableAlternatives.length ===
        0 ? (
          <View
            style={styles.emptyCard}
          >
            <Text
              style={styles.emptyTitle}
            >
              No alternatives available
            </Text>

            <Text
              style={styles.emptyText}
            >
              There are currently no
              clash-free class groups
              available for {moduleCode}.
            </Text>
          </View>
        ) : (
          <>
            {/* Alternative Cards */}
            <View
              style={
                styles.alternativesList
              }
            >
              {availableAlternatives.map(
                (alt) => {
                  const isSelected =
                    selectedGroupId ===
                    alt.groupId;

                  const seatInfo =
                    getSeatInfo(
                      alt.seatsLeft
                    );

                  const title =
                    `${
                      alt.moduleCode
                    } – ${
                      alt.groupName ||
                      `Group ${alt.groupId.replace(
                        'G',
                        ''
                      )}`
                    }`;

                  const detailText =
                    `${
                      alt.timeDisplay ||
                      `${alt.day} ${alt.start}-${alt.end}`
                    } · ${
                      seatInfo.text
                    }${
                      alt.isBestMatch
                        ? ' · Best match'
                        : ''
                    }`;

                  return (
                    <TouchableOpacity
                      key={
                        alt._id ||
                        alt.id ||
                        alt.groupId
                      }
                      style={[
                        styles.altCard,
                        isSelected
                          ? styles.altCardSelected
                          : styles.altCardUnselected,
                        alt.isFull && {
                          opacity: 0.6,
                        },
                      ]}
                      onPress={() => {
                        if (
                          !alt.isFull
                        ) {
                          setSelectedGroupId(
                            alt.groupId
                          );
                        }
                      }}
                      disabled={
                        alt.isFull
                      }
                      activeOpacity={0.85}
                    >
                      <View
                        style={
                          styles.altTextWrap
                        }
                      >
                        <Text
                          style={[
                            styles.altTitle,
                            isSelected &&
                              styles.altTitleSelected,
                          ]}
                        >
                          {title}
                        </Text>

                        <Text
                          style={[
                            styles.altDetail,
                            isSelected &&
                              styles.altDetailSelected,
                          ]}
                        >
                          {detailText}
                        </Text>
                      </View>

                      {isSelected ? (
                        <View
                          style={
                            styles.checkCircle
                          }
                        >
                          <Text
                            style={
                              styles.checkMark
                            }
                          >
                            ✓
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={
                            styles.radioCircle
                          }
                        />
                      )}
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            {/* Timetable Preview */}
            <Text
              style={
                styles.sectionHeader
              }
            >
              Weekly timetable preview
            </Text>

            <TimetableGrid
              selectedModules={
                previewSelections
              }
              groups={groups}
              clashes={
                previewClashes
              }
            />

            {/* Clash Warning */}
            {!isClashFree && (
              <View
                style={
                  styles.clashWarningBanner
                }
              >
                <Text
                  style={
                    styles.clashWarningText
                  }
                >
                  ⚠️ This option still has
                  a timetable clash. Please
                  select another group to
                  confirm.
                </Text>
              </View>
            )}

            {/* Clash Free Message */}
            {isClashFree && (
              <View
                style={
                  styles.successBanner
                }
              >
                <Text
                  style={
                    styles.successText
                  }
                >
                  ✓ This alternative is
                  clash-free and can be
                  confirmed.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          title={
            isSubmitting
              ? 'Confirming...'
              : 'Confirm registration'
          }
          onPress={handleConfirm}
          disabled={
            !isClashFree ||
            isSubmitting ||
            availableAlternatives.length ===
              0
          }
        />

        {!isClashFree &&
          availableAlternatives.length >
            0 && (
            <Text
              style={
                styles.disabledHelperText
              }
            >
              Confirm disabled while
              clashes exist
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
    justifyContent:
      'space-between',
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

  successBanner: {
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },

  successText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    marginTop: SPACING.md,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
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