# 星环井字棋

为 PICO WebSpatial 设计的循环消子井字棋。双方各最多保留 3 枚棋子，第 4 枚落下时最旧棋子自动移除，之后再判断胜负。

## 开发

```bash
npm install
npm run dev
```

固定开发端口：`5195`。

## 构建

```bash
npm run build
```

项目使用 `@webspatial/core-sdk` 与 `@webspatial/react-sdk`，并通过 Web App Manifest 声明 1280×820 空间窗口。
