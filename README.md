# AI- 前端（数据 + 对话）插件界面

说明
本仓库是一个基于 Vite + React（TypeScript）的前端演示项目，目标是提供“数据导入/可视化 + AI 对话/分析”能力的交互界面。项目使用 React 19、Vite、TypeScript，并集成了可视化与模型交互相关依赖（见 package.json）。

我做了什么
- 已读取仓库根目录与 package.json，生成本 README（基于实际脚本与依赖）。
- 若需，我可以继续把 README 提交为仓库文件或根据更多代码文件进一步补充示例和截图。

快速概览（基于仓库现状）
- 运行框架：Vite
- 语言：TypeScript + React
- 入口文件（示例）：index.tsx / App.tsx
- 主要目录（存在于仓库）：components/, services/
- 主要依赖（摘要，详见 package.json）：react, react-dom, @google/genai, recharts, react-markdown, html2canvas, jspdf
- 开发依赖（摘要）：vite, typescript, @vitejs/plugin-react

安装与运行
1. 克隆仓库并进入目录：
   git clone https://github.com/catherinechai58-svg/AI-.git
   cd AI-
2. 安装依赖：
   npm install
   或使用 pnpm / yarn：pnpm install 或 yarn
3. 启动开发服务器：
   npm run dev
   默认使用 Vite，通常可在 http://localhost:5173 或 http://localhost:3000（取决于 PORT 配置）访问
4. 构建与预览：
   npm run build
   npm run preview

package.json 关键脚本（来自仓库）
- dev: vite
- build: vite build
- preview: vite preview

环境变量（示例 .env.local）
建议将模型 Key 放在后端或私有环境变量，不要直接将 Key 提交到仓库。
示例 .env.local.example：
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
VITE_API_BASE_URL=http://localhost:4000
PORT=3000

项目功能说明（与代码结构对应）
- CSV 上传与解析：前端可使用 PapaParse 或内置解析器在浏览器中解析小/中等文件；如需上传到服务端请使用 services/ 下的 API 封装。
- 可视化：建议使用仓库中已包含的 Recharts 来绘制图表；提供导出截图（html2canvas + jspdf）。
- AI 文本交互：项目已引入 @google/genai（示例），前端应通过后端代理转发模型请求以保护 Key。
- 组件化：UI 与功能组件放在 components/ 下（CSV 上传、数据表、图表、聊天组件等）；services/ 封装网络请求与模型代理调用。

后端/代理建议
- 强烈建议通过后端（Express / FastAPI 等）转发模型请求并存储 Key。
- 推荐后端端点示例：
  - POST /api/upload-csv -> 接收并返回预览
  - POST /api/model/ask -> 转发 prompt 到模型 API 并返回结果

开发建议
- 使用 TypeScript 完善数据类型（尤其是表格数据、模型请求/响应）
- 添加 ESLint/Prettier 配置以统一代码风格
- 对较大 CSV 使用后端分页或流式处理以避免浏览器内存问题

常见问题与排查
- 无法启动：确认 Node 与依赖安装无误；删除 node_modules 并重装常可解决版本问题。
- 模型 401/403：检查后端是否正确使用环境变量与 Key。
- 图表/数据异常：检查数据列类型（数值/日期/文本）并确认传入图表组件的数据格式。

下一步（可选）
- 我可以把这个 README 提交到仓库（创建或更新 README.md），或者根据 components/、services/ 的实际文件内容把“组件目录说明”与“示例 API 请求”补充为真实文件名与代码片段。若要我现在就创建 PR，请回复“确认创建 PR”。如需先修改 README 内容，请直接告诉我你希望调整的点（例如 PR 标题、README 中某段文字或示例 env）。