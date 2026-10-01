# 🚗 Permit Quest - Getting Started

## Quick Start

### Option 1: Run with Script (Recommended)
```bash
./run.sh
```

### Option 2: Manual Start
```bash
# With Python 3
python3 -m http.server 8000

# With Python 2
python -m SimpleHTTPServer 8000

# Or just open index.html directly in your browser
```

## On another Windows computer

Copy `dist/PermitQuest-Windows.zip` to that computer and unzip it. Double-click `Install.bat`. That copies the app to `%LOCALAPPDATA%\Permit Quest` and adds a **Permit Quest** shortcut on the desktop and in the Start menu.

The only install besides that zip is Python 3, from [python.org](https://www.python.org/downloads/). The app has no build step and no packages to install, and that computer does not need WSL. The shortcut runs the server. If Windows asks whether to allow Python on private networks, allow it.

The shortcut window prints `http://localhost:8000` for this computer and the address a phone on the same Wi-Fi should open. To remove the app, run `Uninstall.bat` in the installed folder.

Rebuild the zip from this repo with `windows/build-package.sh`. The driver guide PDF is not in the zip; the running app does not need it.

## Install on an Android phone

The phone does not need a copy of the project. Chrome installs the app after it loads the page from your computer. `./run.sh` inside WSL only serves `localhost` on that computer, so the phone cannot reach it. Serve the same folder from Windows instead.

1. Put the phone and the computer on the same Wi-Fi network.
2. In PowerShell on Windows, serve the project:

```powershell
cd \\wsl.localhost\Ubuntu\home\lewis\repos\permit-quest
py -m http.server 8000
```

If Windows asks whether to allow Python on private networks, allow it. Leave this window open.

3. In another PowerShell window, run `ipconfig` and note the IPv4 address of the Wi-Fi adapter (for example `192.168.1.20`).
4. On the phone, open Chrome and go to `http://` that address, port `8000`. `localhost` on the phone is the phone, not the computer.
5. Tap the Chrome menu (⋮) and choose **Install app** or **Add to Home screen**.

The first visit has to succeed while the server is running. After that, the home-screen icon opens the cached app without the computer. The driver guide PDF is not cached, so that file still needs the server.

## Features Working

✅ **FIXED: No More 404 Errors** - All files load properly (updated service worker)
✅ **15 Floors, 120 Questions** across the five parts of the Washington Driver Guide
- Licenses, Vehicles, Drivers, Roads, Risks (see `README.md` for the full floor list)

✅ **Game Features**
- Progress tracking
- Floor battles, artifacts and a three-trial final boss
- **NEW: Instant explanations** - See explanations immediately after selecting answers
- Offline functionality (after first load)

✅ **Mobile Optimized**
- Touch-friendly interface
- PWA installation
- Works offline
- Responsive design

## Test the App

1. Start the server using `./run.sh`
2. Open `http://localhost:8000` in your browser
3. Try a few questions in different categories
4. Check the progress tracking works
5. On Android, add to home screen for full experience

## Washington-Specific Content

All questions are based on the Washington Driver Guide (`docs/WA-driver-guide.pdf`), including:
- Intermediate license restrictions and teen licensing steps
- BAC, THC and implied consent rules
- Roundabouts, HOV lanes, ferries and other Washington road features
- Insurance, registration and Move Over requirements

Good luck on the Driving Knowledge Exam! 🎯

## 🛠️ Troubleshooting

**Not seeing explanations when you select answers?**
- This is likely a browser caching issue
- See `CACHE-FIX-INSTRUCTIONS.md` for detailed solution
- Quick fix: Press `Ctrl+Shift+R` for hard refresh
- Test page: `http://localhost:8000/test-explanation.html`
