# Linea Message Board

一个基于 Linea Sepolia 的链上留言板示例。使用 React + TypeScript + Vite 搭建前端，结合 Wagmi 与 viem 进行合约读写，通过 Web3Auth 提供免助记词的社交登录体验。

**功能概览**
- 连接钱包（Web3Auth，自动切换到 Linea Sepolia）
- 查看链上已有消息
- 发布新消息，可选择是否等待交易上链确认
- 交易状态提示与错误提示

**技术栈**
- 前端：`React 19`、`Vite`、`TypeScript`、`Tailwind CSS`
- Web3：`wagmi v3`、`viem v2`、`@web3auth/modal`
- 其他：`@tanstack/react-query`、`@ant-design/icons`

**合约信息**
- 网络：Linea Sepolia（`chainId 59141`），`src/constants.ts:4`
- RPC：`https://rpc.sepolia.linea.build`，`src/constants.ts:3`
- 合约地址：`0x9abb5861e3a1eDF19C51F8Ac74A81782e94F8FdC`，`src/constants.ts:2`
- ABI 文件：`src/lib/abi.ts`
- 读方法：`getMessageCount()`、`getMessage(index)`
- 写方法：`postMessage(content)`
- 事件：`MessagePosted(address sender, string content, uint256 timestamp)`

**快速开始**
- 环境要求：`Node.js >= 18`
- 安装依赖：`npm install`
- 本地开发：`npm run dev`（默认 `http://localhost:5173`）
- 生产构建：`npm run build`
- 本地预览：`npm run preview`（默认 `http://localhost:4173`）

**钱包与登录配置**
- Web3Auth 的 `clientId` 在 `src/components/Provider.tsx:18-19` 定义，需替换为你在 Web3Auth Dashboard 申请的 Client ID，建议改为使用环境变量管理。
- 成功连接后，如果当前网络不是 Linea Sepolia，会自动切换，逻辑见 `src/components/ConnectWallet.tsx:43-47`。

**核心代码位置**
- 列表与发帖：`src/components/MessageBoard.tsx`（读取消息、提交交易、是否等待确认的开关在 `src/components/MessageBoard.tsx:148-152`）
- 连接钱包与网络切换：`src/components/ConnectWallet.tsx`
- Provider 入口：`src/components/Provider.tsx`（Web3Auth、Wagmi、QueryClient）
- 合约 ABI：`src/lib/abi.ts`
- 常量配置：`src/constants.ts`
- 样式入口：`src/index.css`（Tailwind）
- Polyfills：`src/polyfills.ts`

**使用说明**
- 点击 `Connect Wallet` 使用 Web3Auth 登录（支持邮箱/社交登录）
- 点击 `New Message` 打开发布对话框，输入消息内容
- 可通过 `Wait for confirmation` 开关决定是否等待链上确认（等待期间按钮会显示 `Sending...`）
- 右下角弹窗展示交易状态与提示

**环境变量**
- 仓库附带 `.env` 示例，包含 Coinbase CDP 相关键（`CDP_API_KEY_ID` 等），当前应用逻辑未直接使用这些变量，仅作占位。
- 建议将 Web3Auth `clientId` 迁移到 `.env` 并通过 `import.meta.env` 读取，以避免硬编码。

**常见问题**
- 无法连接：检查 Web3Auth `clientId` 是否有效，网络是否可达
- 交易失败或被拒绝：用户取消签名、余额不足或 RPC 暂时不可用
- 看不到消息：确认 `CONTRACT_ADDRESS` 指向的合约已在 Linea Sepolia 上部署并有数据

**许可证**
- 本项目采用 MIT 许可证，详见 `LICENSE` 文件
