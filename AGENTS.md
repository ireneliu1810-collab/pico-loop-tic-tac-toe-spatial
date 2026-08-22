# PICO Loop Tic Tac Toe Spatial handoff

- This is the native PICO Spatial version of the loop tic-tac-toe WebSpatial game.
- Android package: `com.luluanan.looptictactoe.spatial`; Spatial SDK BOM: `0.13.3`.
- `platform/SpatialApplication.kt` launches `mainApp`; `platform/LaunchActivity.kt` inherits `SpatialLaunchActivity`.
- `Main.kt` owns the planar `DefaultWindowContainer` and keeps the root wrapped in `PicoTheme`.
- `content/HomePage.kt` embeds the game in a WebView and serves bundled assets from `https://appassets.androidplatform.net/assets/web/` through request interception. Never use `file://`, localhost, LAN URLs, `about:blank`, `WebAppActivity`, or the historical offline wrapper.
- Web source lives in `web/`. Build it with `npm run build`, then run `scripts/sync-web-assets.sh`.
- All Android SDK levels are 35 and the APK is restricted to `arm64-v8a`.
- Build with `./gradlew assembleDebug`; install the resulting `app/build/outputs/apk/debug/app-debug.apk`.
- Keep native 2D Compose UI within SpatialUI and `PicoTheme`; do not introduce Material or Material3.
