
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
} from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function AdvisorCasesScreen({ navigation }) {
  const { cases, approveCase, deleteCase } = useApp();

  const [selectedCaseId, setSelectedCaseId] = useState(
    cases[0]?.id || ''
  );

  const selectedCase =
    cases.find((c) => c.id === selectedCaseId) || cases[0];

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.replace('MainTabs', { screen: 'Profile' });
  };

  // Approve a case
  const handleApprove = () => {
    if (!selectedCase) return;

    approveCase(selectedCase.id);

    Alert.alert(
      'Case Approved',
      `Schedule alteration for ${selectedCase.studentName} has been approved and applied to their course selections.`,
      [{ text: 'OK' }]
    );
  };

  // Contact the student
  const handleContact = () => {
    if (!selectedCase) return;

    Alert.alert(
      'Contact Student',
      `Notification sent to ${selectedCase.studentName} (${selectedCase.studentId}@my.sliit.lk).`
    );
  };

  // Delete a case
  const handleDelete = () => {
    if (!selectedCase) return;

    Alert.alert(
      'Delete Case',
      `Are you sure you want to delete the case for ${selectedCase.studentName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const deletedId = selectedCase.id;

            // Select another case before the deleted case disappears
            const remainingCases = cases.filter(
              (item) => item.id !== deletedId
            );

            deleteCase(deletedId);

            setSelectedCaseId(
              remainingCases[0]?.id || ''
            );

            Alert.alert(
              'Deleted',
              'Case deleted successfully.'
            );
          },
        },
      ]
    );
  };

  const openCasesCount = cases.filter(
    (c) => c.status !== 'resolved'
  ).length;

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
        <SafeAreaView edges={[]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backBtn}
              hitSlop={{
                top: 10,
                bottom: 10,
                left: 10,
                right: 10,
              }}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              Advisor Dashboard
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Count */}
        <Text style={styles.reviewLabel}>
          {openCasesCount} case
          {openCasesCount !== 1 ? 's' : ''} need review
        </Text>

        {/* Cases List */}
        <View style={styles.casesList}>
          {cases.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>
                No Cases Available
              </Text>
              <Text style={styles.emptyText}>
                There are no student requests to review.
              </Text>
            </View>
          ) : (
            cases.map((item) => {
              const isSelected = item.id === selectedCaseId;
              const isConflict = item.status === 'conflict';
              const isResolved = item.status === 'resolved';

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.caseCard,
                    isConflict && styles.caseCardUrgent,
                    isResolved && styles.caseCardResolved,
                    isSelected && !isConflict && styles.caseCardSelected,
                  ]}
                  onPress={() => setSelectedCaseId(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.caseHeader}>
                    <Text
                      style={[
                        styles.caseName,
                        isConflict && styles.caseNameUrgent,
                      ]}
                    >
                      {item.studentName}
                    </Text>

                    {isResolved && (
                      <Text style={styles.resolvedLabel}>
                        ✓ Resolved
                      </Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.caseIssue,
                      isConflict && styles.caseIssueUrgent,
                    ]}
                  >
                    {item.clashSummary}
                  </Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        <View style={styles.divider} />

        {/* Case Details */}
        {selectedCase && (
          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>
              Case detail – {selectedCase.studentName}
            </Text>

            <Text style={styles.detailDesc}>
              {selectedCase.message ||
                'Both modules are required; current groups overlap on Monday'}
            </Text>

            {/* Suggested Action */}
            <View style={styles.suggestionCard}>
              <Text style={styles.suggestionTitle}>
                Suggested: {selectedCase.suggestedModule || 'IT3070'}-
                {selectedCase.suggestedGroup || 'G4'}
              </Text>

              <Text style={styles.suggestionSub}>
                {selectedCase.suggestedDetails ||
                  '12 seats available, no new clash'}
              </Text>
            </View>

            {/* Approve and Contact Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.approveBtn,
                  selectedCase.status === 'resolved' &&
                    styles.approveBtnDisabled,
                ]}
                onPress={handleApprove}
                disabled={selectedCase.status === 'resolved'}
                activeOpacity={0.8}
              >
                <Text style={styles.approveBtnText}>
                  {selectedCase.status === 'resolved'
                    ? 'Resolved ✓'
                    : 'Approve'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.contactBtn}
                onPress={handleContact}
                activeOpacity={0.8}
              >
                <Text style={styles.contactBtnText}>
                  Contact
                </Text>
              </TouchableOpacity>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteBtnText}>
                Delete Case
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    fontSize: 20,
    fontWeight: '800',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 40,
  },

  reviewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: SPACING.md,
    marginTop: 4,
  },

  casesList: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },

  caseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.sm,
  },

  caseCardUrgent: {
    backgroundColor: '#FDF2F2',
    borderColor: '#FECACA',
  },

  caseCardResolved: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },

  caseCardSelected: {
    borderColor: '#6C3BFF',
    borderWidth: 1.5,
  },

  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  caseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },

  caseNameUrgent: {
    color: '#991B1B',
  },

  resolvedLabel: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },

  caseIssue: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  caseIssueUrgent: {
    color: '#DC2626',
    fontWeight: '600',
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: SPACING.md,
  },

  detailSection: {
    marginTop: 4,
  },

  detailTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },

  detailDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },

  suggestionCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 22,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  suggestionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 4,
  },

  suggestionSub: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
  },

  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },

  approveBtn: {
    flex: 1,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: '#5C33FF',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },

  approveBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },

  approveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },

  contactBtn: {
    flex: 1,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  contactBtnText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },

  deleteBtn: {
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },

  deleteBtnText: {
    color: '#B91C1C',
    fontSize: 15,
    fontWeight: '800',
  },
});
