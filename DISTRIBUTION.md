# Distribution & Porting

Nihongo Reader is a React + Vite web app. It runs as a local website today and is
wired up with **Tauri 2** so the *same* codebase can ship as a Windows desktop
app, an Android app, and (from a Mac) an iOS app.

## Best way to serve other users

Two good options, depending on the audience:

| Goal | Approach | Notes |
| --- | --- | --- |
| Easiest for users, zero install, auto-updates | **Host the static web build** | `npm run build` → deploy `dist/` to GitHub Pages, Netlify, Vercel, or Cloudflare Pages. Users just open a URL. You maintain the host. |
| Offline, installable, "hand them one file" | **Tauri desktop/mobile builds** | Produces a small native installer/binary (~10–15 MB + dictionary) that bundles everything. No server, works offline. |

Recommendation: **publish the web build for general use** (one link, nothing to
install) **and** offer the **Tauri desktop installer** for people who want an
offline app with its own window and icon. Both come from this one repo.

> Web-host note: serve the `public/dict/*.dat.gz` files **without** a
> `Content-Encoding: gzip` header (serve as `application/octet-stream`).
> Otherwise the browser auto-decompresses them and the kuromoji furigana engine
> stalls. The Vite dev server handles this via a middleware in `vite.config.ts`;
> replicate it on your host (e.g. a `_headers` file on Netlify/Cloudflare).

## Windows desktop (.exe)

Prerequisites (one-time):
1. **Visual Studio 2022 Build Tools** with the *Desktop development with C++*
   workload (provides the MSVC linker). Rust is already installed.
2. WebView2 runtime (preinstalled on Windows 11).

Then:
```bash
npm install
npm run tauri:build      # → src-tauri/target/release/bundle/  (.exe + .msi installer)
npm run tauri:dev        # run the desktop app in dev with hot reload
```

## Android

Prerequisites: Android Studio (SDK + NDK), a JDK (17+), and env vars
`ANDROID_HOME` and `NDK_HOME` set.

```bash
npm run tauri android init     # one-time, generates src-tauri/gen/android
npm run tauri android dev      # run on emulator/device
npm run tauri android build    # → signed APK/AAB
```

## iOS

Requires **macOS with Xcode** (cannot be built on Windows). On a Mac:
```bash
npm run tauri ios init
npm run tauri ios dev
npm run tauri ios build
```

## Status

- ✅ Web app (dev + production build)
- ✅ Tauri project scaffolded (`src-tauri/`), configured for all three targets
- ⏳ Windows `.exe` — needs the MSVC C++ Build Tools, then `npm run tauri:build`
- ⏳ Android — needs Android Studio/SDK/NDK + JDK
- ⏳ iOS — needs a Mac with Xcode
