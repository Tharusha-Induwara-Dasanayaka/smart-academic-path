import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PrimaryButton } from '../components/ui';
import { adminAPI } from '../services/api';

import { useApp } from '../context/AppContext';
import { Modal } from 'react-native';

export default function AdminStatusScreen({ navigation }) {
  const { systemLogs } = useApp();
  const [showLogModal, setShowLogModal] = useState(false);

  const uptime = '99.8%';
  const syncLag = '1.2s';

  const handleViewFullLog = () => {
    setShowLogModal(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Audit Log Modal */}
      <Modal visible={showLogModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>System Audit Log</Text>
              <TouchableOpacity onPress={() => setShowLogModal(false)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.colHeader, { flex: 1.2 }]}>Time</Text>
              <Text style={[styles.colHeader, { flex: 3 }]}>Event</Text>
              <Text style={[styles.colHeader, { flex: 1.2, textAlign: 'right' }]}>Status</Text>
            </View>

            {/* Table Rows */}
            <ScrollView style={{ maxHeight: 350 }}>
              {systemLogs.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1.2, color: '#6B7280', fontSize: 12 }]}>{item.time}</Text>
                  <Text style={[styles.tableCell, { flex: 3, fontWeight: '600' }]}>{item.event}</Text>
                  <Text
                    style={[
                      styles.tableCell,
                      {
                        flex: 1.2,
                        textAlign: 'right',
                        fontWeight: '700',
                        color:
                          item.status === 'Success'
                            ? '#059669'
                            : item.status === 'Warning'
                            ? '#D97706'
                            : '#2563EB',
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={{ marginTop: 16 }}>
              <PrimaryButton title="Close Log" onPress={() => setShowLogModal(false)} />
            </View>
          </View>
        </View>
      </Modal>

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
            <Text style={styles.headerTitle}>System Status</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Stat Cards (Uptime & Sync lag) */}
        <View style={styles.topStatsRow}>
          {/* Uptime Card */}
          <View style={styles.uptimeCard}>
            <Text style={styles.uptimeLabel}>Uptime</Text>
            <Text style={styles.uptimeValue}>{uptime}</Text>
          </View>

          {/* Sync lag Card */}
          <View style={styles.syncLagCard}>
            <Text style={styles.syncLagLabel}>Sync lag</Text>
            <Text style={styles.syncLagValue}>{syncLag}</Text>
          </View>
        </View>

        {/* Section: Active registrtions (live) */}
        <Text style={styles.sectionTitle}>Active registrtions  (live)</Text>

        {/* Live Chart Card with Purple Trendline */}
        <View style={styles.chartCard}>
          <Svg width="100%" height={160} viewBox="0 0 320 160">
            {/* Distinctive jagged trendline from design reference 19 */}
            <Path
              d="M 12 120 L 38 102 L 60 108 L 84 80 L 108 98 L 132 58 L 156 75 L 180 44 L 204 62 L 228 32 L 254 52 L 274 38 L 296 46"
              fill="none"
              stroke="#6C3BFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        {/* Section: Recent errors */}
        <Text style={styles.sectionTitle}>Recent errors</Text>

        {/* Error Item 1: Timeout with red ! */}
        <View style={styles.errorCardRed}>
          <View style={styles.errorIconCircleRed}>
            <Text style={styles.errorIconRed}>!</Text>
          </View>
          <Text style={styles.errorTextRed}>Seat feed timeout -- 3 retries</Text>
        </View>

        {/* Error Item 2: Resolved item with green checkmark */}
        <View style={styles.errorCardGreen}>
          <View style={styles.errorIconCircleGreen}>
            <Text style={styles.errorIconGreen}>✓</Text>
          </View>
          <Text style={styles.errorTextGreen}>Seat feed timeout -- 3 retries</Text>
        </View>
      </ScrollView>

      {/* Footer View Full Log Button */}
      <View style={styles.footer}>
        <PrimaryButton
          title="View full log"
          onPress={handleViewFullLog}
        />
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
    fontSize: 20,
    fontWeight: '800',
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.base,
    paddingBottom: 20,
  },

  topStatsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    marginTop: 4,
  },
  uptimeCard: {
    flex: 1,
    backgroundColor: '#D1FAE5',
    borderRadius: 22,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uptimeLabel: {
    color: '#065F46',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  uptimeValue: {
    color: '#047857',
    fontSize: 24,
    fontWeight: '800',
  },

  syncLagCard: {
    flex: 1,
    backgroundColor: '#FEF9C3',
    borderRadius: 22,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncLagLabel: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  syncLagValue: {
    color: '#D97706',
    fontSize: 24,
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  // Chart Card
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.sm,
    justifyContent: 'center',
  },

  // Errors List
  errorCardRed: {
    backgroundColor: '#FDF2F2',
    borderRadius: 22,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorIconCircleRed: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconRed: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  errorTextRed: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },

  errorCardGreen: {
    backgroundColor: '#DCFCE7',
    borderRadius: 22,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  errorIconCircleGreen: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconGreen: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
  },
  errorTextGreen: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },

  footer: {
    paddingHorizontal: SPACING.base,
    paddingBottom: 28,
    paddingTop: SPACING.sm,
    backgroundColor: '#F3F4F8',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: SPACING.xl,
    maxHeight: '85%',
    ...SHADOWS.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  colHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 13,
    color: COLORS.text,
  },
});
