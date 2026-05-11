# 自主工作协议

Updated: 2026-05-11

## 目标

在有限时间内自主推进 `file-preview-kit` v2.0 React 适配包，形成可 review 的阶段性成果。

## 小队分工

- 主控 Codex：拆任务、合并结果、维护看板、决定停止点。
- 开发 agent：使用 `gpt-5.4`，负责实现 `packages/react` 和相关源码/文档。
- 测试 agent：使用 `gpt-5.4`，负责独立检查构建、类型、测试、消费者使用路径和风险。

## 当前推进范围

只推进 React adapter：

- `packages/react` 包骨架
- React `FilePreview` wrapper
- props、DOM property、custom event 到 React callback 的映射
- React README
- 聚焦测试或 consumer smoke 验证

## 明确不做

- 不推进 Vue adapter，除非 React 阶段成果已经完成并经主控确认。
- 不推进 Angular/Svelte 正式包。
- 不改文件预览格式范围。
- 不做服务端转换、编辑能力或 Office 布局级还原。
- 不重写 `core` 里的预览逻辑。

## 停止条件

达到以下任一条件就停止自主推进并汇报：

1. React adapter 已形成可 review 的阶段成果，并且至少完成 TypeScript 构建或可解释的验证尝试。
2. 遇到需要用户产品判断的分歧，例如 API 命名、包发布范围、是否引入新依赖。
3. 遇到环境阻塞，例如依赖安装、构建工具权限、网络或测试运行限制。
4. 发现继续推进会违反“薄适配层”原则。

## 工作节奏

- 每轮先读取 `KANBAN.md`。
- 只把一个任务放入“进行中”。
- 每完成一个步骤，必须立刻更新 `KANBAN.md`：把对应任务打勾，或从“进行中”移动到“已完成”。
- 不允许先做完一批再统一补看板；看板必须跟着工作同步变化。
- 不因为完成一个小步骤就停下等待用户；只要没有触发停止条件，就继续推进看板上的下一项。
- 开发 agent 完成一个可验证切片后，测试 agent 必须立刻进入验证，不等待用户确认。
- 开发 agent 和测试 agent 每完成一个小步骤都要通知主控 Codex，主控 Codex 负责监听状态并接力安排下一步。
- 如果测试 agent 发现问题，开发 agent 优先修复当前 React adapter 问题，再继续后续任务。
- 开发 agent 和测试 agent 并行时写入范围要分离。
- 测试 agent 不直接重写开发 agent 的实现；它只指出问题、补充验证或提出小修建议。
- 主控 Codex 负责最终整合和更新看板。

## 验收标准

阶段性成果至少包含：

- 新增 React 包结构清晰。
- React 用户不需要手动调用 Web Component 注册函数。
- `requestConfig` 和 `previewService` 这类对象配置能通过 React props 传入。
- `loadstart`、`load`、`error` 能以 React callback 形式使用。
- README 说明 Vite 和 Next client-only 使用边界。
- 验证结果清楚记录。
