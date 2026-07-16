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

Prerequisites: Android SDK + NDK, a JDK 17+ (Android Studio's bundled JDK works),
and env vars set for the shell:

```bash
export JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
export ANDROID_HOME="$LOCALAPPDATA\Android\Sdk"
export NDK_HOME="$ANDROID_HOME\ndk\android-ndk-r27c"
export ANDROID_NDK_HOME="$NDK_HOME"

npm run tauri android init     # one-time, generates src-tauri/gen/android
npm run tauri android dev      # run on emulator/device
npm run tauri android build --debug --apk --target aarch64
```

### 16 KB page-size alignment (Android 15+)
Recent devices (e.g. Pixels on Android 15+) use 16 KB memory pages and warn on /
reject native libraries whose ELF LOAD segments are 4 KB-aligned. Google Play
also requires 16 KB support for new submissions. The repo's `.cargo/config.toml`
links every Android target with `-Wl,-z,max-page-size=16384`; AGP ≥ 8.5 handles
the zip-level alignment automatically. Verify a build with:

```bash
llvm-readelf -l libapp_lib.so | grep LOAD    # Align column must be 0x4000
zipalign -c -P 16 -v 4 app-universal-debug.apk
```

(`llvm-strip` preserves segment alignment, so stripping is safe.)

### Windows symlink workaround
`tauri android build` cross-compiles the Rust `.so` fine, but its last step
**symlinks** the library into Gradle's `jniLibs`, which Windows blocks unless
**Developer Mode** is on (Settings → System → For developers). Either enable that,
or build the APK with Gradle directly after the Rust step (Tauri embeds the web
assets *into* the `.so`, so the APK is self-contained):

```bash
cd src-tauri/gen/android
cp ../../target/aarch64-linux-android/debug/libapp_lib.so \
   app/src/main/jniLibs/arm64-v8a/libapp_lib.so
./gradlew assembleArm64Debug -x rustBuildArm64Debug -x rustBuildUniversalDebug
# → app/build/outputs/apk/arm64/debug/app-arm64-debug.apk
```

Installing the debug APK: enable "install unknown apps" on the phone and copy it
over, or with USB debugging on: `adb install -r NihongoReader-arm64-debug.apk`.

For a Play-Store release you need a signing keystore and `--release --aab`
(configure signing in `src-tauri/gen/android/app/build.gradle.kts`).

## iOS

Requires **macOS with Xcode** (cannot be built on Windows). On a Mac:
```bash
npm run tauri ios init
npm run tauri ios dev
npm run tauri ios build
```

## Status

- ✅ Web app (dev + production build)
- ✅ Windows `.exe` — `npm run tauri:build` (installer + standalone `nihongo.exe`)
- ✅ Android — arm64 debug APK builds (see workaround above); `NihongoReader-arm64-debug.apk`
- ⏳ iOS — needs a Mac with Xcode
