# 鞍钢物流智能平台（需求梳理原型）

Vue 3 + Pinia + Vue Router + Element Plus，纯 JavaScript。

顶部菜单对应 7 个业务模块：全程可视化追踪、产品准发预测、车辆智能调度、出厂计划智能编制、码头智能调度、车辆智能配载、物流驾驶舱。

## 本地开发

```bash
npm install
npm run dev
```

演示账号：`admin` / `123456`

## 打包并直接打开

```bash
npm run build
```

把生成的 `dist/index.html` 发给对方，双击即可打开（JS/CSS 已内联进这一个文件）。

关键配置：

- `vite.config.js`：`base: './'` + `vite-plugin-singlefile` 打成单文件
- 路由使用 `createWebHashHistory()`（地址带 `#`），本地文件也能切换页面
- 构建后脚本已处理，避免 `file://` 白屏
