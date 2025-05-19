# 🌙 NightChapter – Read to Sleep, Mindfully

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

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
