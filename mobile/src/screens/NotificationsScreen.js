import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { useApp } from '../context/AppContext';

export default function NotificationsScreen({ navigation }) {
  const { notifications, markNotificationsRead } = useApp();
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((item) => {
    if (filter === 'unread') return !item.read;
    return true;
  });

  const handleNotificationPress = (notif) => {
    if (notif.targetRoute === 'Register') {
      navigation.navigate('Register');
    } else if (notif.targetRoute === 'Timetable') {
      navigation.navigate('Timetable');
    } else if (notif.targetRoute === 'Confirmation') {
      navigation.navigate('Confirmation');
    } else {
      navigation.navigate('Home');
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
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.pill, filter === 'all' && styles.pillActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.pillText,
                filter === 'all' && styles.pillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, filter === 'unread' && styles.pillActive]}
            onPress={() => setFilter('unread')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.pillText,
                filter === 'unread' && styles.pillTextActive,
              ]}
            >
              Unread ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <View style={styles.listContainer}>
          {filteredNotifications.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🔔</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.text }}>
                No {filter === 'unread' ? 'unread ' : ''}notifications
              </Text>
            </View>
          ) : (
            filteredNotifications.map((notif) => {
              if (notif.type === 'warning' || notif.type === 'deadline') {
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={styles.warningCard}
                    onPress={() => handleNotificationPress(notif)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.warningIconCircle}>
                      <Text style={styles.warningExclamation}>!</Text>
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={styles.warningTitle}>{notif.title}</Text>
                      <Text style={styles.warningTime}>{notif.timeAgo || notif.time}</Text>
                    </View>
                    {!notif.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              }

              if (notif.type === 'info' || notif.type === 'change') {
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={styles.infoCard}
                    onPress={() => handleNotificationPress(notif)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.notifContent}>
                      <Text style={styles.infoTitle}>{notif.title}</Text>
                      <Text style={styles.infoTime}>{notif.timeAgo || notif.time}</Text>
                    </View>
                    {!notif.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              }

              // Default / Success / Confirmed
              return (
                <TouchableOpacity
                  key={notif.id}
                  style={styles.successCard}
                  onPress={() => handleNotificationPress(notif)}
                  activeOpacity={0.8}
                >
                  <View style={styles.successIconCircle}>
                    <Text style={styles.successCheck}>✓</Text>
                  </View>
                  <View style={styles.notifContent}>
                    <Text style={styles.successTitle}>{notif.title}</Text>
                    <Text style={styles.successTime}>{notif.timeAgo || notif.time}</Text>
                  </View>
                  {!notif.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Mark All As Read Link */}
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllReadBtn}
            onPress={markNotificationsRead}
            activeOpacity={0.7}
          >
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
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

  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    marginTop: 4,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pillActive: {
    backgroundColor: '#5C33FF',
    borderColor: '#5C33FF',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  pillTextActive: {
    color: COLORS.white,
  },

  listContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xxl,
  },

  warningCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 22,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    minHeight: 88,
  },
  warningIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningExclamation: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '900',
  },
  warningTitle: {
    color: '#B45309',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  warningTime: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '500',
  },

  infoCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 22,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 88,
    justifyContent: 'space-between',
  },
  infoTitle: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  infoTime: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '500',
  },

  successCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...SHADOWS.sm,
    minHeight: 88,
  },
  successIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCheck: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
  },
  successTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  successTime: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },

  notifContent: {
    flex: 1,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5C33FF',
  },

  markAllReadBtn: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  markAllReadText: {
    color: '#5C33FF',
    fontSize: 16,
    fontWeight: '800',
  },
});
