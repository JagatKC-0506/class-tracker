<div align="center">

# 📚 Class Tracker

### Your All-in-One Academic Companion

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Capacitor](https://img.shields.io/badge/Capacitor-7.4-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)

*Stay organized, track attendance, manage assignments, and never miss an important event!*

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 📅 **Smart Schedule Management**
- Create and organize your weekly class schedule
- Add subjects with custom colors for easy identification
- Set class times, rooms, and instructor information
- View your schedule at a glance

### ✅ **Attendance Tracking**
- Mark attendance as Present, Absent, Late, or Excused
- Add notes to attendance records
- Track attendance history for each class
- Monitor your overall attendance percentage

### 📝 **Assignment Management**
- Create and track assignments with due dates
- Set priority levels (Low, Medium, High)
- Update assignment status (Pending, In Progress, Completed)
- Never miss a deadline with organized task lists

### 🎯 **Event & Exam Planner**
- Schedule exams, quizzes, presentations, and projects
- Set reminders for important events
- Mark holidays and personal events
- Stay ahead of your academic calendar

### 📊 **Analytics Dashboard**
- Visualize attendance statistics with interactive charts
- Track weekly attendance trends
- Monitor performance across all subjects
- Get insights into your academic progress

### 📱 **Cross-Platform Support**
- Progressive Web App (PWA) support
- Native Android app via Capacitor
- iOS support available
- Works offline with local data persistence

---

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/JagatKC-0506/class-tracker.git
   cd class-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Building for Production

```bash
npm run build
npm run preview
```

### Android Development

```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android
```

---

## 💻 Usage

### Initial Setup

1. **Launch the app** - You'll be greeted with a setup wizard
2. **Set semester dates** - Define your semester start and end dates
3. **Add subjects** - Create your subjects with names, codes, and colors
4. **Create schedule** - Assign subjects to specific days and times

### Daily Workflow

1. **Check Today's Classes** - View your classes for the day on the home page
2. **Mark Attendance** - Record your attendance after each class
3. **Track Assignments** - Add new assignments and update their status
4. **View Analytics** - Monitor your progress on the analytics page

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool & Dev Server |
| **Zustand** | State Management |
| **React Router** | Navigation |
| **Recharts** | Data Visualization |
| **Lucide React** | Icons |
| **date-fns** | Date Utilities |
| **Capacitor** | Native Mobile Apps |

---

## 📁 Project Structure

```
class-tracker/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Application pages
│   │   ├── HomePage.tsx
│   │   ├── SchedulePage.tsx
│   │   ├── AttendancePage.tsx
│   │   ├── AssignmentsPage.tsx
│   │   ├── EventsPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   └── SetupPage.tsx
│   ├── store/          # Zustand state management
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Helper functions
│   └── assets/         # Static assets
├── public/             # Public assets & PWA files
├── android/            # Android native project
└── ...config files
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - The library for web and native user interfaces
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Capacitor](https://capacitorjs.com/) - Cross-platform native runtime
- [Zustand](https://github.com/pmndrs/zustand) - Bear necessities for state management
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons

---

<div align="center">

**Made with ❤️ for students everywhere**

⭐ Star this repo if you find it helpful!

</div>
