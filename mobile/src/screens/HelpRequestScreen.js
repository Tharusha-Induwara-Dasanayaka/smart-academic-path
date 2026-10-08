import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { PrimaryButton } from '../components/ui';
import { useApp } from '../context/AppContext';

export default function HelpRequestScreen({ navigation, route }) {
  const { clashes, addCase } = useApp();

  const clash = clashes[0];
  const conflictHeader = route.params?.modules || (clash ? `${clash.moduleB}-${clash.groupB} vs ${clash.moduleA}-${clash.groupA}` : 'IT3070-G2 vs IT3060-G1');
  const conflictSub = route.params?.conflictDescription || (clash ? `${clash.day} ${clash.overlapWindow} · both required modules` : 'Mon 10:00-12:00 · both required modules');

  const [requestType, setRequestType] = useState('Approve an alternative group');
  const [message, setMessage] = useState(
    'Hi Dr. Kasun, both modules are required for my degree. Could you approve Group 4 instead?'
  );

  const handleSend = () => {
    if (!message.trim()) {
      Alert.alert('Required', 'Please enter a message for the advisor.');
      return;
    }

    // Add case to global state for Advisor Dashboard
    addCase({
      requestType,
      message,
      conflictDetails: `${conflictHeader} (${conflictSub})`,
    });

    Alert.alert(
      'Request Sent',
      'Your request has been submitted to your academic advisor. You will receive a notification within 1-2 working days.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
            <Text style={styles.headerTitle}>Ask an advisor</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Label above attached conflict */}
        <Text style={styles.attachLabel}>Your Conflict details are attached</Text>

        {/* Attached Conflict Card (Non-editable from current clash state) */}
        <View style={styles.conflictCard}>
          <Text style={styles.conflictTitle}>{conflictHeader}</Text>
          <Text style={styles.conflictSub}>{conflictSub}</Text>
          <Text style={styles.autoAttachedText}>Auto-attached</Text>
        </View>

        {/* What do you need? */}
        <Text style={styles.sectionTitle}>What do you need?</Text>
        <View style={styles.inputCard}>
          <TextInput
            style={styles.inputField}
            value={requestType}
            onChangeText={setRequestType}
            placeholder="e.g. Approve an alternative group"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Message */}
        <Text style={styles.sectionTitle}>Message</Text>
        <View style={styles.textAreaCard}>
          <TextInput
            style={styles.textArea}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="Explain why you need this schedule exception..."
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Reply time note */}
        <Text style={styles.replyTimeText}>Typical reply time : 1-2 working days</Text>
      </ScrollView>

      {/* Send Button Footer */}
      <View style={styles.footer}>
        <PrimaryButton
          title="Send request"
          onPress={handleSend}
        />
      </View>
    </KeyboardAvoidingView>
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

  attachLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: SPACING.sm,
    marginTop: 4,
  },

  conflictCard: {
    backgroundColor: '#FDF2F2',
    borderRadius: 22,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  conflictTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 4,
  },
  conflictSub: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
    marginBottom: 8,
  },
  autoAttachedText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '800',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: SPACING.base,
    paddingVertical: 14,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.sm,
  },
  inputField: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },

  textAreaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: SPACING.base,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.sm,
    minHeight: 120,
  },
  textArea: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    height: 100,
  },

  replyTimeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 4,
    marginBottom: SPACING.lg,
  },

  footer: {
    paddingHorizontal: SPACING.base,
    paddingBottom: 28,
    paddingTop: SPACING.sm,
    backgroundColor: '#F3F4F8',
  },
});
