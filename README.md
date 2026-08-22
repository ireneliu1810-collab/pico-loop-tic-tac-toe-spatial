# 星环井字棋

星环井字棋是一款面向 PICO Spatial 环境的循环规则井字棋。每位玩家在棋盘上最多保留三枚棋子；当第四枚棋子落下时，该玩家最早放置的棋子会离开棋盘，让局面持续变化，减少传统井字棋快速进入固定和局的情况。

## 核心玩法

- 挑战空间 AI：提供轻松、策略、大师三档难度。
- 本地双人对战：两位玩家轮流操作同一设备。
- 循环消除：每位玩家最多保留三枚棋子，并提示下一枚将消除的棋子。
- 对局反馈：显示当前回合、棋子库存、胜利连线、累计比分和声音开关。

## PICO 交互

应用运行在 PICO Spatial 的平面空间窗口中。使用 PICO 手柄射线指向按钮或棋格并点击完成选择和落子；窗口可通过系统提供的空间窗口控件进行移动与缩放。

## 技术栈

- Android / Kotlin / Gradle
- PICO Spatial SDK 0.13.3 与 SpatialUI
- Android WebView，本地安全域名资源拦截
- React 19、TypeScript、Vite、WebSpatial SDK
- Android API 35、ARM64 (`arm64-v8a`)

网页生产资源会内置到 APK 的 `assets/web/`，由 Spatial Activity 中的 WebView 从 `https://appassets.androidplatform.net/assets/web/` 加载。运行时不依赖 localhost、局域网或在线开发服务器。

## 本地运行前端

```bash
cd web
npm install
npm run dev
```

默认开发端口为 `5195`。

## 构建 APK

```bash
cd web
npm run lint
npm run build
../scripts/sync-web-assets.sh
cd ..
./gradlew testDebugUnitTest assembleDebug
```

构建产物位于 `app/build/outputs/apk/debug/app-debug.apk`。构建前请确保 PICO Spatial SDK 依赖仓库、Android SDK 35 与 JDK 17 已正确配置。

## 安装与验证

```bash
pico-cli app install app/build/outputs/apk/debug/app-debug.apk
pico-cli app launch com.luluanan.looptictactoe.spatial --activity com.luluanan.looptictactoe.spatial.platform.LaunchActivity
```

当前应用包名为 `com.luluanan.looptictactoe.spatial`，版本为 `1.0.1`（versionCode `2`）。
