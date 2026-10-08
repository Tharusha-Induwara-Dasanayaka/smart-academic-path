import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS, SHADOWS } from '../constants/theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CourseRegistrationScreen from '../screens/CourseRegistrationScreen';
import ClashWarningScreen from '../screens/ClashWarningScreen';
import AlternativeSelectionScreen from '../screens/AlternativeSelectionScreen';
import ModuleDetailScreen from '../screens/ModuleDetailScreen';
import WeeklyTimetableScreen from '../screens/WeeklyTimetableScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HelpRequestScreen from '../screens/HelpRequestScreen';
import AdvisorCasesScreen from '../screens/AdvisorCasesScreen';
import AdminStatusScreen from '../screens/AdminStatusScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Pixel-perfect SVG Tab Icons matching design references
function TabIcon({ name, focused }) {
  const color = focused ? '#6C3BFF' : '#9CA3AF';
  const size = 22;

  switch (name) {
    case 'Home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </Svg>
      );
    case 'Register':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </Svg>
      );
    case 'Timetable':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
        </Svg>
      );
    case 'notifications':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
        </Svg>
      );
    case 'Profile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </Svg>
      );
    default:
      return null;
  }
}

// Custom Bottom Tab Bar with active pill container
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.iconWrapper,
                isFocused && styles.iconWrapperFocused,
              ]}
            >
              <TabIcon name={route.name} focused={isFocused} />
            </View>
            <Text
              style={[
                styles.tabLabel,
                isFocused ? styles.tabLabelFocused : styles.tabLabelUnfocused,
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Main Bottom Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Register"
        component={CourseRegistrationScreen}
        options={{ tabBarLabel: 'Register' }}
      />
      <Tab.Screen
        name="Timetable"
        component={WeeklyTimetableScreen}
        options={{ tabBarLabel: 'Timetable' }}
      />
      <Tab.Screen
        name="notifications"
        component={NotificationsScreen}
        options={{ tabBarLabel: 'notifications' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

import { useApp } from '../context/AppContext';

// Root App Navigator
export default function AppNavigator() {
  const { isAuthenticated, role, clashes } = useApp();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
      screenListeners={({ route, navigation }) => ({
        focus: () => {
          const publicScreens = ['Splash', 'Onboarding', 'Login', 'ForgotPassword'];
          if (!publicScreens.includes(route.name)) {
            // Guard 1: Block screens until logged in
            if (!isAuthenticated) {
              navigation.replace('Login');
              return;
            }

            // Guard 2: Block advisor and admin screens for students
            if (role === 'student') {
              if (route.name === 'AdvisorCases' || route.name === 'AdminStatus') {
                navigation.replace('MainTabs');
                return;
              }
            } else if (role === 'advisor') {
              if (route.name === 'AdminStatus') {
                navigation.replace('AdvisorCases');
                return;
              }
            } else if (role === 'admin') {
              if (route.name === 'AdvisorCases') {
                navigation.replace('AdminStatus');
                return;
              }
            }

            // Guard 3: Block Confirmation while any clash exists, and redirect to Selection
            if (route.name === 'Confirmation' && clashes.length > 0) {
              navigation.replace('CourseRegistration');
              return;
            }
          }
        },
      })}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Main App Screens */}
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="CourseRegistration" component={CourseRegistrationScreen} />
      <Stack.Screen name="ClashWarning" component={ClashWarningScreen} />
      <Stack.Screen name="AlternativeSelection" component={AlternativeSelectionScreen} />
      <Stack.Screen name="ModuleDetail" component={ModuleDetailScreen} />
      <Stack.Screen name="WeeklyTimetable" component={WeeklyTimetableScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="HelpRequest" component={HelpRequestScreen} />
      <Stack.Screen name="AdvisorCases" component={AdvisorCasesScreen} />
      <Stack.Screen name="AdminStatus" component={AdminStatusScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    ...SHADOWS.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  iconWrapperFocused: {
    backgroundColor: '#EDE9FE',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelFocused: {
    color: '#6C3BFF',
    fontWeight: '700',
  },
  tabLabelUnfocused: {
    color: '#9CA3AF',
  },
});
