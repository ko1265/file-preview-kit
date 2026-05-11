# 看板

Updated: 2026-05-11

## 进行中

无

## 下一步

无


## 稍后

- [ ] React 边界验证后，添加 Vue 适配包。
- [ ] 添加 Vue Vite/Nuxt 使用文档。
- [ ] 添加 Angular Web Component 集成指南。
- [ ] 添加 Angular 消费者 smoke 示例，再决定是否做完整 Angular 包。
- [ ] 添加 Svelte/SvelteKit Web Component 集成指南。
- [ ] 添加 Svelte 消费者 smoke 示例，再决定是否做完整 Svelte 包。

## 已完成

- [x] 对齐 README / README.zh 的 consumer smoke 说明，补充 React adapter 已纳入外部消费者验证。
- [x] 补充 React post-publish registry smoke 命令，并使用真实 React `createElement` 路径避免文档误导。
- [x] 复验 release/checklist 定向测试与 `pnpm smoke:consumer` 均通过。
- [x] 运行 release/checklist 定向验证：`tests/release-checklist.test.ts`、`tests/release-readiness.test.ts`、`tests/package-entrypoints.test.ts`、`tests/react-adapter-contract.test.ts` 共 13 项通过。
- [x] 复核 release/changelog/checklist 与发布测试，确认 changelog 和 release checklist 已记录 React milestone，但 npm publish 文档与 package entrypoint 校验仍遗漏 React 发布口径。
- [x] 更新多包发布检查清单。
- [x] 更新 v2.0 框架适配 changelog。
- [x] 补一层 React consumer smoke，验证 packed React adapter 的真实消费者 import 和最小组件调用路径。
- [x] React consumer smoke 后复验全量 build 和全量 test 均通过。
- [x] README 调整后重新运行最小验证：React 包 build 通过，React adapter 契约测试 6 项通过。
- [x] 修正 React README 中对象 prop 清理说明，避免暗示 `previewService` 可被 `undefined` 清空。
- [x] 运行最小验证：React 包 build 通过，React adapter 契约测试 6 项通过。
- [x] 精简 React wrapper 内部实现：删除转手类型别名，并合并 custom event 注册与卸载逻辑。
- [x] Review React adapter 当前改动，确认本轮只做 wrapper 内部低风险精简，不扩到其他框架。
- [x] 创建 `packages/react` 包骨架。
- [x] 定义适配层共用的 props 和事件类型。
- [x] 基于 Web Component 构建 React `FilePreview` 包装组件。
- [x] 把 `requestConfig` 和 `previewService` 映射为 DOM property。
- [x] 把 `file-preview:loadstart`、`file-preview:load`、`file-preview:error` 映射为 React 回调。
- [x] 添加 React README，包含 Vite 和 Next client-only 示例。
- [x] 确认 React 是第一个完整适配目标。
- [x] 确认框架适配使用独立 npm 包。
- [x] 确认开发分支为 `v2-framework-adapters`。
- [x] 对齐 v2.0 路线图、下一步和项目看板。
- [x] 添加 React adapter 静态契约测试，覆盖包元数据、薄适配、DOM property、custom events 和 SSR 文档边界。
- [x] 运行 React adapter 契约测试，确认当前 React 包仍阻塞于 `src` 和 README 未完成。
- [x] 重跑 React adapter 契约测试，确认实现已覆盖大部分契约，测试需放行 type-only core 类型导入。
- [x] 运行 React adapter 契约测试通过。
- [x] React adapter 契约测试通过：包元数据、薄 wrapper、DOM property、custom events 和 SSR README 边界均已覆盖。
- [x] 运行 React 包 build 验证，当前阻塞于未安装依赖 / workspace symlink 缺失，需主控允许安装后复验。
- [x] 运行全量 Vitest，React 契约测试通过；剩余失败为既有 release 文案断言漂移，非 React adapter 阻塞。
- [x] 检查发布链路静态覆盖，发现 lockfile 与 pack 验证脚本尚未纳入 React adapter。
- [x] 修正 React 包源码、package 和 README 的明显问题：补充自动注册与 peer/client-only 说明，收紧对象 prop 清理语义，并清理 React 包 `clean` 脚本的可移植性问题。
- [x] 把 React 包纳入 `pack:check` / `pack:verify` 发布校验链路，并补充静态测试覆盖。
- [x] 复核 React adapter 验收覆盖：现有契约测试已覆盖薄 wrapper、对象 props、custom events 和 SSR README 边界，但仍缺少发布产物/消费者路径验证。
- [x] 核对 React 包元数据、lockfile 和 pack 发布校验覆盖风险，确认当前优先修正点集中在 wrapper prop 清理语义、包脚本可移植性和 React 包未进入发布校验链路。
- [x] 补充发布产物检查：确认 `packages/react/dist/index.d.ts` 当前把 `FilePreview` 导出为 `any`，这会直接削弱“typed React component”验收目标。
- [x] 修正 React adapter 的 `exactOptionalPropertyTypes` 构建错误，并确认 React 包 build 通过。
- [x] 运行 React adapter 契约测试通过，确认当前为 6 个测试通过。
- [x] 运行当前环境可执行的 React 定向验证：确认 `pnpm-lock.yaml` 与 `pack:check` 已纳入 React 包，但 `scripts/verify-packed-packages.mjs` 仍未校验 React，且 `pnpm pack` / Vitest 继续阻塞于未安装工作区依赖。
- [x] 重新运行 React 定向验证：`pnpm pack:verify` 已覆盖 React 包，`pnpm --filter @ko1265/file-preview-kit-react build` 当前环境通过。
- [x] 复核当前 React 构建产物：`packages/react/dist/index.d.ts` 现已导出带 `ForwardRefExoticComponent` 类型的 `FilePreview`，不再是 `any`。
- [x] 主控完成依赖安装后复验：React 包 build、React 契约测试、`pack:verify`、全量 build、全量测试均通过。
- [x] 暂停自主推进自动化，React adapter 阶段成果到达可 review 状态后停止。
