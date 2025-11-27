<div align="center">

# 📚 Class Tracker

### Your All-in-One Academic Companion

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.4-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

*Stay organized, track attendance, manage assignments, and never miss an important event!*

[Features](#-features) • [Installation](#-installation) • [Run Project](#%EF%B8%8F-run-project) • [Build APK](#-build-apk) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📅 **Schedule Management** | Create and manage your weekly class schedule with ease |
| ✅ **Attendance Tracking** | Track your attendance for each class with visual statistics |
| 📝 **Assignment Manager** | Never miss a deadline with assignment tracking and reminders |
| 🎉 **Event Planning** | Keep track of exams, holidays, and important academic events |
| 📊 **Analytics Dashboard** | Visualize your academic performance with beautiful charts |
| 🔔 **Smart Notifications** | Get timely reminders for classes, assignments, and events |
| 📱 **Cross-Platform** | Works on Web, Android, and iOS |
| 🌐 **Offline Support** | Full PWA support - works without internet |

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Download |
|-------------|---------|----------|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | v9+ | Comes with Node.js |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |
| **Android Studio** | Latest | [developer.android.com](https://developer.android.com/studio) |
| **JDK** | 17+ | [adoptium.net](https://adoptium.net/) |

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/JagatKC-0506/class-tracker.git
cd class-tracker
```

### 2. Install Dependencies

```bash
npm install
```

---

## ▶️ Run Project

### 🌐 Run on Web (Development)

```bash
# Start development server
npm run dev
```

Then open your browser at: **http://localhost:5173**

### 🌐 Run on Web (Production Preview)

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### 📱 Run on Android (Emulator/Device)

```bash
# Step 1: Build the web app
npm run build

# Step 2: Sync with Android
npx cap sync android

# Step 3: Open in Android Studio
npx cap open android
```

Then in Android Studio:
1. Wait for Gradle sync to complete
2. Select your device/emulator
3. Click the **Run ▶️** button

### 📱 Run on Android (Live Reload)

For development with live reload:

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Run with live reload
npx cap run android -l --external
```

---

## 📦 Build APK

### Debug APK (For Testing)

```bash
# Step 1: Build web app
npm run build

# Step 2: Sync with Capacitor
npx cap sync android

# Step 3: Build Debug APK
cd android
./gradlew assembleDebug
```

📍 **APK Location:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (For Distribution)

```bash
# Step 1: Build web app
npm run build

# Step 2: Sync with Capacitor
npx cap sync android

# Step 3: Build Release APK
cd android
./gradlew assembleRelease
```

📍 **APK Location:** `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Signed Release APK

1. **Generate a keystore** (one-time setup):

```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
```

2. **Create `android/keystore.properties`**:

```properties
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=my-alias
storeFile=../my-release-key.jks
```

3. **Build signed APK**:

```bash
cd android
./gradlew assembleRelease
```

### Build AAB (For Play Store)

```bash
cd android
./gradlew bundleRelease
```

📍 **AAB Location:** `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🛠 Tech Stack

<div align="center">

| Category | Technology |
|----------|------------|
| **Frontend** | React 19.2, TypeScript 5.9 |
| **Build Tool** | Vite 7.2 (Rolldown) |
| **State Management** | Zustand 5.0 |
| **Routing** | React Router 7.9 |
| **Charts** | Recharts 3.5 |
| **Icons** | Lucide React |
| **Date Handling** | date-fns 4.1 |
| **Mobile** | Capacitor 7.4 |
| **Notifications** | @capacitor/local-notifications |

</div>

---

## 📁 Project Structure

```
class-tracker/
├── 📂 src/
│   ├── 📂 components/      # Reusable UI components
│   ├── 📂 pages/           # Application pages
│   │   ├── HomePage.tsx        # Dashboard with today's classes
│   │   ├── SchedulePage.tsx    # Weekly schedule management
│   │   ├── AttendancePage.tsx  # Attendance tracking
│   │   ├── AssignmentsPage.tsx # Assignment management
│   │   ├── EventsPage.tsx      # Events & exams
│   │   ├── AnalyticsPage.tsx   # Statistics & charts
│   │   └── SetupPage.tsx       # Initial setup wizard
│   ├── 📂 store/           # Zustand state management
│   ├── 📂 types/           # TypeScript definitions
│   ├── 📂 utils/           # Helper functions
│   └── main.tsx            # App entry point
├── 📂 public/
│   ├── 📂 icons/           # App icons (PWA)
│   ├── manifest.json       # PWA manifest
│   └── sw.js               # Service Worker
├── 📂 android/             # Android native project
│   ├── 📂 app/
│   │   ├── build.gradle
│   │   └── 📂 src/main/
│   ├── build.gradle
│   └── gradlew
├── capacitor.config.ts     # Capacitor configuration
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npx cap sync` | Sync web build with native projects |
| `npx cap open android` | Open Android project in Android Studio |
| `npx cap run android` | Run on Android device/emulator |

---

## 💻 Usage

### Initial Setup

1. **Launch the app** - You'll be greeted with a setup wizard
2. **Set semester dates** - Define your semester start and end dates
3. **Add subjects** - Create your subjects with names, codes, colors, instructor and room
4. **Create schedule** - Assign subjects to specific days and times

### Adding Classes Later

When adding new classes from the Schedule page:
- **Existing Subject**: Select from dropdown to auto-fill all details
- **New Subject**: Toggle to "New Subject" and enter details manually

### Daily Workflow

1. **Check Today's Classes** - View your classes for the day on the home page
2. **Mark Attendance** - Record your attendance after each class
3. **Track Assignments** - Add new assignments and update their status
4. **View Analytics** - Monitor your progress on the analytics page

---

## 🔧 Troubleshooting

<details>
<summary><b>Gradle build fails</b></summary>

```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```
</details>

<details>
<summary><b>Capacitor sync issues</b></summary>

```bash
# Remove and re-add android platform
rm -rf android
npx cap add android
npx cap sync android
```
</details>

<details>
<summary><b>Node modules issues</b></summary>

```bash
# Clean install
rm -rf node_modules
rm package-lock.json
npm install
```
</details>

<details>
<summary><b>Android Studio can't find SDK</b></summary>

1. Open Android Studio
2. Go to **File > Project Structure > SDK Location**
3. Set the correct Android SDK path
4. Sync Gradle
</details>

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI Library
- [Vite](https://vitejs.dev/) - Build Tool
- [Capacitor](https://capacitorjs.com/) - Native Runtime
- [Zustand](https://github.com/pmndrs/zustand) - State Management
- [Lucide](https://lucide.dev/) - Icons
- [Recharts](https://recharts.org/) - Charts

---

<div align="center">

**Made with ❤️ for students everywhere**

⭐ **Star this repo if you find it helpful!** ⭐

[Report Bug](https://github.com/JagatKC-0506/class-tracker/issues) • [Request Feature](https://github.com/JagatKC-0506/class-tracker/issues)

</div>
