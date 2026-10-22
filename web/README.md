# SadduTube Web Version

A complete, responsive web application version of **SadduTube** built for free, static hosting on **GitHub Pages**.

---

## 🌟 Key Features

1. **Home Dashboard**
   - Sleek responsive dashboard with SadduTube logo branding.
   - Quick Access Cards: Bookmarks, History, and Offline Downloads.
   - "Continue Watching" carousel populated from persistent watch history.
   - "Saved Bookmarks" carousel with instant preview.
   - Categorized Trending & Discover video feed (Music, Gaming, Tech, Cooking, Travel, Sports).

2. **Dedicated Video Screen (`/#/video/:id`)**
   - Embedded official YouTube player with auto-play, responsive 16:9 ratio, and theater mode.
   - Pro playback controls: speed adjustments (0.5x – 2.0x), fullscreen toggle.
   - **SponsorBlock Integration**: automatically queries SponsorBlock skip segments and skips sponsored/intro segments with floating toast notifications.
   - Video metadata, creator channel info, and collapsible description.
   - Action bar: Bookmark toggle, Save Tab to workspace, Share link (Web Share API / clipboard), and Download Offline.
   - "Up Next & Related Videos" recommendation sidebar.

3. **YouTube Explorer & Search (`/#/youtube`)**
   - Live YouTube Search experience across all categories.
   - Quick destination jump chips (Trending, Music, Gaming, Tech, News, Library).
   - Enter full YouTube URLs or 11-character video IDs to jump straight into playback.

4. **Saved Tabs Workspace (`/#/saved-tabs`)**
   - Save YouTube video tabs with custom titles and personal notes for later review.
   - Add new tabs manually or directly from any video screen.
   - Instant 1-click playback, share, and delete.

5. **Local Watch History (`/#/history`)**
   - Automatically tracks watched YouTube videos with timestamps.
   - Search filter across history titles, creators, and URLs.
   - Individual item deletion and bulk clear with confirmation dialog.

6. **Bookmarks System (`/#/bookmarks`)**
   - Save favorite videos with one tap.
   - List View & Grid View switcher.
   - Real-time search filter and bulk clear with confirmation dialog.

7. **Offline Downloads (`/#/downloads`)**
   - Media library for offline playback.
   - Built-in HTML5 media player modal to watch/listen offline without leaving the site.
   - Filter by format: All Files, Videos (MP4), Audio (MP3).

8. **Settings & Themes (`/#/settings`)**
   - Full Theme Switcher (Dark Mode, Light Mode, System Preference) with persistent storage.
   - Playback & Shield Status indicators:
     - Ad-Free Shield: ACTIVE
     - Background Playback: ACTIVE
     - SponsorBlock Auto-Skip: ACTIVE
     - Picture-in-Picture (PiP): ACTIVE
   - Data & Storage Wipe utilities.
   - About SadduTube and Privacy Policy dialogs.

---

## 🛠️ Technology Stack

- **React 18 & TypeScript** (Strict typing)
- **Vite 6** (Fast bundler configured with `base: './'` for path-agnostic static hosting)
- **React Router 6** (`HashRouter` for 100% reliable GitHub Pages routing without 404 reload issues)
- **React Icons (`react-icons/io5`)** (1-to-1 match with `@expo/vector-icons/Ionicons` in mobile app)
- **SponsorBlock API** (`https://sponsor.ajay.app`)
- **Web Storage API** (localStorage persistence under `@saddutube_*` keys)

---

## 🚀 Local Development & Build

### Prerequisites
- Node.js (>= 18.x)
- npm or yarn

### Commands
```bash
# Navigate to the web folder
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (outputs to web/dist/)
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 GitHub Pages Deployment

### Automatic Deployment (GitHub Actions)
A workflow is configured in `.github/workflows/deploy-web.yml`:
1. Push your repository to GitHub (`main` branch).
2. On GitHub, go to **Repository Settings** -> **Pages**.
3. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
4. The workflow will automatically build `web/dist` and deploy it to `https://<username>.github.io/<repo>/`.

---

## 🔒 Mobile App Preservation Notice
The original mobile application (`app/`, `src/`, `android/`, `package.json`, `app.json`) remains 100% untouched and fully functional. All web code, assets, and dependencies reside strictly inside the `web/` directory.
