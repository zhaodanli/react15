import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

/**
 * vite用的
 * 配置全局常量，用于条件编译和功能控制。
 * 设置模块路径别名，方便开发时引用自定义模块。
 * 启用 React 插件，支持 React 项目开发。
 * 优化依赖预构建，提升开发体验。
 * 
 *  defineConfig 方法来定义项目的构建和开发配置。以下是对文件中各部分的解释：
 *  defineConfig：Vite 提供的一个辅助函数，用于定义配置，能够提供类型提示。
 *  @vitejs/plugin-react：Vite 的 React 插件，用于支持 React 项目开发（如 JSX 转换、HMR 等）。
 *  path：Node.js 的内置模块，用于处理文件路径。
 */
export default defineConfig({
    // 这些常量通常在代码中通过 if (__DEV__) 等方式进行条件编译。
    define: {
        __DEV__: true, // 通常用于标识开发模式。
        __PROFILE__: true, // 可能用于性能分析相关功能。
        __UMD__: true, // 可能用于标识是否构建为 UMD 模块。
        __EXPERIMENTAL__: true, // 可能用于启用实验性功能。
    },
    resolve: {
        // 配置模块路径别名，用于简化模块导入路径。在项目中使用自定义实现的 React 相关模块，而不是直接使用 npm 包。
        alias: {
            react: path.posix.resolve("src/react"),
            "react-dom": path.posix.resolve("src/react-dom"),
            "react-dom-bindings": path.posix.resolve("src/react-dom-bindings"),
            "react-reconciler": path.posix.resolve("src/react-reconciler"),
            scheduler: path.posix.resolve("src/scheduler"),
            shared: path.posix.resolve("src/shared"),
        },
    },
    // plugins：用于配置 Vite 插件。react()：启用 React 插件，支持 JSX 和 React 的开发功能。
    plugins: [react()],
    // optimizeDeps：用于优化依赖预构建。force: true：强制重新预构建依赖，确保依赖的最新版本被使用。
    optimizeDeps: {
        force: true,
    },
});