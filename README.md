# 🎓 Smart Academic Path

A full-stack mobile academic scheduling and registration system built with **React Native (Expo)**, **Node.js/Express**, and **MongoDB**. Designed to prevent timetable clashes, recommend optimal course schedule alternatives, and provide seamless academic management for students, advisors, and administrators.

---

## 📱 Visual Design & UI Reference Mapping

All 19 UI screens from the `design-reference` folder are implemented:

| # | Screen Name | Design Reference | Source File |
|---|-------------|------------------|-------------|
| 01 | **Splash Screen** | `01-splash.png` | [`mobile/src/screens/SplashScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/SplashScreen.js) |
| 02 | **Onboarding (Clashes)** | `02-onboarding-clash.png` | [`mobile/src/screens/OnboardingScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/OnboardingScreen.js) |
| 03 | **Onboarding (Alternatives)** | `03-onboarding-alternatives.png` | [`mobile/src/screens/OnboardingScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/OnboardingScreen.js) |
| 04 | **Onboarding (Timetable)** | `04-onboarding-timetable.png` | [`mobile/src/screens/OnboardingScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/OnboardingScreen.js) |
| 05 | **Sign In** | `05-login.png` | [`mobile/src/screens/LoginScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/LoginScreen.js) |
| 06 | **Forgot Password** | `06-forgot-password.png` | [`mobile/src/screens/ForgotPasswordScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/ForgotPasswordScreen.js) |
| 07 | **Dashboard** | `07-dashboard.png` | [`mobile/src/screens/DashboardScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/DashboardScreen.js) |
| 08 | **Course Registration (Initial)** | `08-course-registration.png` | [`mobile/src/screens/CourseRegistrationScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/CourseRegistrationScreen.js) |
| 09 | **Course Registration (Selected)** | `09-course-registration-selected.png` | [`mobile/src/screens/CourseRegistrationScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/CourseRegistrationScreen.js) |
| 10 | **Clash Warning Modal** | `10-clash-warning.png` | [`mobile/src/screens/ClashWarningScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/ClashWarningScreen.js) |
| 11 | **Alternative Selection** | `11-alternative-selection.png` | [`mobile/src/screens/AlternativeSelectionScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/AlternativeSelectionScreen.js) |
| 12 | **Module Detail** | `12-module-detail.png` | [`mobile/src/screens/ModuleDetailScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/ModuleDetailScreen.js) |
| 13 | **Weekly Timetable (My Week)** | `13-weekly-timetable.png` | [`mobile/src/screens/WeeklyTimetableScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/WeeklyTimetableScreen.js) |
| 14 | **Confirmation (All Set)** | `14-confirmation.png` | [`mobile/src/screens/ConfirmationScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/ConfirmationScreen.js) |
| 15 | **Notifications** | `15-notifications.png` | [`mobile/src/screens/NotificationsScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/NotificationsScreen.js) |
| 16 | **Profile** | `16-profile.png` | [`mobile/src/screens/ProfileScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/ProfileScreen.js) |
| 17 | **Help Request / Ask an Advisor** | `17-help-reques.png` | [`mobile/src/screens/HelpRequestScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/HelpRequestScreen.js) |
| 18 | **Advisor Open Cases** | `18-advisor-open-cases.png` | [`mobile/src/screens/AdvisorCasesScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/AdvisorCasesScreen.js) |
| 19 | **Admin System Status** | `19-admin-system-status.png` | [`mobile/src/screens/AdminStatusScreen.js`](file:///c:/Users/kavin/OneDrive/Desktop/smart-academic-path/mobile/src/screens/AdminStatusScreen.js) |

---

## 🛠️ Technology Stack

- **Frontend Mobile App**:
  - React Native (0.74.5) with Expo SDK 51
  - React Navigation v6 (Native Stack + Custom Bottom Tab Bar)
  - `expo-linear-gradient` for the signature purple gradient headers
  - `react-native-svg` for vector icons and live trendline charts
  - `expo-secure-store` for JWT persistence
  - `axios` with interceptors for API communication
- **Backend Server**:
  - Node.js & Express.js
  - MongoDB Atlas with Mongoose ODM
  - JSON Web Tokens (JWT) & bcrypt authentication
  - Real-time timetable conflict detection algorithm
  - Seat count reservation & capacity validation

---

## 🚀 Getting Started

### 1. Backend Server Setup

```bash
cd server

# Configure environment in server/.env
# PORT=5000
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/smart-academic-path
# JWT_SECRET=smart_academic_path_jwt_secret_dev_key_2025

# Seed the database with modules, class groups, users, and notifications
npm run seed

# Start server in development mode
npm run dev
```

### 2. Mobile App Setup

```bash
cd mobile

# Install dependencies (already installed)
npm install

# Start the Expo development server
npm start
```

Press `w` to open in web browser, `a` for Android emulator, or scan the QR code with Expo Go on your mobile phone.

---

## 🔑 Demo Accounts

| Role | Student / User ID | Password | Notes |
|------|-------------------|----------|-------|
| **Student** | `IT23583764` | `password123` | Nethmi Perera (Year 3 IT) |
| **Advisor** | `ADV001` | `password123` | Dr. Kasun Silva (Faculty Advisor) |
| **Admin** | `ADMIN001` | `password123` | System Administrator |

*Tip: The Login screen includes one-tap **Demo Quick Access** buttons (Student, Advisor, Admin) allowing instant evaluation and offline testing.*
