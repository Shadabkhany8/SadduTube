# SadduTube — Dedicated YouTube Experience

A modern, high-performance **React Native Expo** application focused exclusively on **YouTube** video discovery, ad-free playback, bookmarks, saved tabs, and persistent watch history across app restarts.

---

## 🌟 Key Features

1. **Home Dashboard**
   - Sleek YouTube-centric dashboard with logo branding.
   - Quick Access Grid: History, Bookmarks, Saved Tabs, Settings with live counters.
   - Saved Tabs Quick Access Bar.
   - "Continue Watching" carousel for watch history.
   - Categorized YouTube video feed (Coding, Expo, Tech, iOS, Music).

2. **YouTube Search**
   - Live YouTube Search experience.
   - Local Search History chips with instant tap-to-search, single item removal, and bulk clear.
   - Video card list with duration badges, channel titles, view counts, and action buttons.

3. **Dedicated Video Screen**
   - Embedded YouTube video playback using official YouTube iframe player integration.
   - Video details, channel information, view counts, and collapsible description.
   - Auto-logs watched videos to local Watch History.
   - Actions: Bookmark toggle, Save Tab, Share video link.
   - "Up Next & Related Videos" list below player.

4. **Bookmarks System**
   - Save favorite YouTube videos with one tap.
   - Search filter across bookmarked titles and channels.
   - Toggle between List View and Grid View.
   - Persistent storage backed by `@react-native-async-storage/async-storage`.

5. **Local Watch History**
   - Automatically tracks opened videos with timestamps.
   - Filter watch history by title/creator.
   - Remove individual history entries or clear all with confirmation dialog.

6. **Saved Tabs Workspace**
   - Inspired by original Vidyo Pro concept.
   - Save YouTube video tabs/URLs with custom titles and notes for later.
   - Quick preview and open tabs directly in the YouTube player screen.

7. **Settings & Themes**
   - Full Theme Switcher (Dark Mode, Light Mode, System Preference).
   - YouTube API status indicator (Configured vs Fallback Curated Engine).
   - Local Storage Wipe utilities (Clear History, Clear Search, Clear Bookmarks, Clear Saved Tabs, Reset All Data).
   - App Info, Privacy Policy, and Terms of Service modals.

---

## 🛠️ Technology Stack

- **React Native** & **Expo SDK 52**
- **Expo Router** (File-based Routing)
- **TypeScript** (Strict typing)
- **AsyncStorage** (`@react-native-async-storage/async-storage`)
- **YouTube Integration** (`react-native-youtube-iframe` & `react-native-webview`)
- **Expo Vector Icons** (`@expo/vector-icons`)
- **React Native Safe Area Context**

---

## 📁 Project Architecture

```text
c:/Users/abc/Desktop/VidyoProApp/
├── app/                        # Expo Router Pages
│   ├── _layout.tsx             # Root layout & providers
│   ├── (tabs)/                 # Bottom Tab Navigation
│   │   ├── _layout.tsx         # Tab Bar configuration
│   │   ├── index.tsx           # Home Dashboard
│   │   ├── search.tsx          # Search Screen
│   │   ├── bookmarks.tsx       # Bookmarks Screen
│   │   ├── history.tsx         # Watch History Screen
│   │   └── settings.tsx        # Settings Screen
│   ├── saved-tabs.tsx          # Saved Tabs Workspace
│   └── video/
│       └── [id].tsx            # Video Details & Player
├── src/
│   ├── types/                  # Strict TypeScript interfaces
│   ├── theme/                  # Dark & Light Design System
│   ├── context/                # ThemeContext & AppDataContext
│   ├── services/               # YouTube, Storage, Bookmark, History, SavedTabs Services
│   ├── components/             # Reusable UI (VideoCard, SearchBar, VideoPlayer, Skeletons, Modals)
│   └── utils/                  # Formatters & YouTube URL validators
├── .env.example                # Environment variable instructions
└── package.json
```

---

## 🔑 YouTube API Key Configuration

Vidyo Pro includes a **Smart Fallback Engine** so it works out-of-the-box even without an API key!

To enable live YouTube API search & trending videos:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Get an API Key from [Google Cloud Console](https://console.cloud.google.com/).
3. Add your key to `.env`:
   ```env
   EXPO_PUBLIC_YOUTUBE_API_KEY=your_actual_api_key_here
   ```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (>= 20.x)
- npm or yarn

### Installation
```bash
# Clone or open project directory
cd VidyoProApp

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

### Running on Devices / Simulators
- **Web**: `npm run web` or press `w` in terminal.
- **Android**: `npm run android` or press `a` in terminal.
- **iOS**: `npm run ios` or scan QR code with Expo Go app on iPhone.

---

## 🔒 Scope Compliance

- **YouTube Exclusive**: Focused solely on YouTube. No Instagram, TikTok, Twitter/X, or other platforms.
- **Clean Playback**: Automated ad shielding to suppress video ads, banner ads, and sponsored overlays.
- **Platform Rules**: No video download functionality. YouTube playback and authentication observe standard official endpoints.
