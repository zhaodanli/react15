import { defineConfig } from "@umijs/max";
import routes from "./routes";

export default defineConfig({
    npmClient: "pnpm", // 指定 npm 客户端
    routes,
    antd: {},
    tailwindcss: {},
    layout: {
        title: "埋点操作平台",
        locale: false, // 关掉国际化
    },
    request: {},
    model: {},
    initialState: {},
    access: {},
    proxy: {
        '/api/': {
            target: 'http://127.0.0.1:8080/',
            changeOrigin: true
        }
    },
});
