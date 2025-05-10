# night-chapter

**NightChapter** is a calm, minimalist mobile app built with React Native + Expo, designed to help you build a consistent bedtime reading habit. Set a nightly alarm, block distractions, log what you read, and end the day screen-free and mindfully.

---

## ✨ Features

- ⏰ **Reading Timer + Bedtime Alarm**
  - Set your ideal bedtime and nightly reading duration
  - Get gentle reminders to start reading

- 📵 **Focus Mode (Distraction Blocking)**
  - Block distracting apps via soft reminders or screen overlay
  - Designed to encourage mindfulness, not force it

- 📖 **Post-Reading Journal**
  - Log what you read and how you felt
  - Store thoughts, quotes, or reflections in a scrollable journal

- 📊 **Reading Progress Tracker**
  - Visualize your consistency with streaks and insights

---

## 🌟 NightChapter Pro (Coming Soon)

- 🎵 Ambient sound options (rain, wind, white noise)
- 📚 Personalized book recommendations
- 🎨 Custom themes and fonts
- 📄 Journal export (PDF, Notion)
- ☁️ Sync via Firebase (or iCloud if needed)

---

## 🧱 Built With

- **Expo SDK**
- **React Native**
- **Firebase**
  - Firestore (for journals & progress)
  - Authentication (optional, guest mode supported)
  - Cloud Functions (for future features)
- **AsyncStorage** (for local state)
- **React Navigation** for screen flow
- **Expo Notifications** for bedtime alerts

---

## 🚧 Roadmap

- [x] Bedtime reminder + reading timer
- [x] Post-reading journaling UI
- [ ] Focus overlay mode (optional blocker)
- [ ] Reading streak logic
- [ ] Firebase sync & backup
- [ ] Ambient sound integration
- [ ] Polished UI animations
- [ ] App Store + Play Store release

---

## 📦 Setup Instructions

```bash
git clone https://github.com/yourusername/nightchapter.git
cd nightchapter
npm install
npx expo start
