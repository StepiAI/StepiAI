# StepiAI

**StepiAI** is an AI-powered personal scheduling and productivity assistant designed to help users organize their day, manage tasks, and adapt their schedule more efficiently.

Instead of only displaying calendar events, StepiAI combines calendar integration with an AI assistant to help users understand their schedule, find available time, create plans, and respond to changes throughout the day.

## ✨ Main Features

### 📅 Smart Schedule Management

View daily and weekly schedules through an integrated calendar experience. StepiAI connects with Google Calendar to retrieve and organize existing events.

### 🤖 AI-Powered Schedule Assistant

Chat with STEPI AI to get help managing your schedule using natural language.

Users can ask STEPI to:

* Summarize today's schedule
* Find available time during the week
* Build a study schedule
* Help organize activities and plans

### 🎙️ Voice Assistant

Manage your schedule through voice commands for a faster and more natural way to interact with StepiAI.

### ⚡ Automatic Schedule Adjustment

Automatically adapt your day based on real-time conditions such as traffic, weather, delays, and changing plans. StepiAI helps adjust upcoming activities when unexpected changes affect your schedule.

### 📅 Smart Calendar Management

Connect and manage your Google Calendar in one place. View daily and weekly schedules while using existing events as context for smarter planning

### ✅ Tasks & Life Plans

Turn goals and activities into structured plans. StepiAI helps organize tasks, study sessions, and other activities around your existing schedule.

### 📍 Context-Aware Scheduling

Use factors such as time, location, travel duration, and surrounding conditions to create more practical and realistic schedules.

### 🔔 Smart Reminders & Alerts

Receive timely reminders and alerts about upcoming activities, schedule conflicts, or changes that may affect your plans.

## 🛠️ Technologies Used

StepiAI is built as a cross-platform mobile application using:

| Technology                | Usage                               |
| ------------------------- | ----------------------------------- |
| React Native              | Cross-platform mobile application   |
| React 19                  | UI and component architecture       |
| TypeScript                | Type-safe application development   |
| NativeWind / Tailwind CSS | Styling                             |
| React Navigation          | Application navigation              |
| Supabase                  | Authentication and backend services |
| Google Sign-In            | Google account authentication       |
| Google Calendar           | Calendar integration                |
| Azure AI Foundry TTS      | AI-powered text-to-speech for voice assistant responses |
| Firebase Cloud Messaging  | Push notifications                  |
| React Native Voice        | Voice input                         |
| React Native Audio API    | Audio functionality                 |
| AsyncStorage              | Local data persistence              |
| Geolocation               | Location-based functionality        |
| Jest                      | Testing                             |

## 🚀 Getting Started

### Prerequisites

Before running StepiAI, make sure the React Native development environment is installed and configured.

You will need:

* Node.js **22.11.0 or newer**
* npm
* Android Studio for Android development
* Xcode for iOS development
* CocoaPods for iOS dependencies

### 1. Clone the Repository

```bash
git clone https://github.com/StepiAI/StepiAI.git
cd StepiAI
```

### 2. Install Dependencies

```bash
npm install
```

For iOS, install the native dependencies:

```bash
bundle install
cd ios
bundle exec pod install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the project root.

You can use `.env.example` as the template:

```env
API_BASE_URL=http://localhost:3000

SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
```

Replace the placeholder values with the credentials for your development environment.

### 4. Start Metro

Start the React Native Metro development server:

```bash
npm start
```

Keep Metro running while developing the application.

### 5. Run the Application

Open another terminal and run:

#### Android

```bash
npm run android
```

Make sure an Android emulator is running or an Android device is connected.

#### iOS

```bash
npm run ios
```

Make sure Xcode and the required iOS dependencies are properly configured.

## 🧪 Testing

Run the test suite with:

```bash
npm test
```

Run ESLint with:

```bash
npm run lint
```

## 📱 Supported Platforms

* Android
* iOS

## 📌 Project Status

StepiAI is currently under active development. Some features and integrations may still be experimental or under development.

---

**StepiAI — Plan smarter. Achieve better.**
