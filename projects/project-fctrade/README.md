# Conflux Exchange DApp

一个基于Conflux eSpac网的FC代币和CFX的订单薄兑换平台。

## 功能特性

### 智能合约功能
- **可升级合约**: 使用OpenZeppelin的UUPS代理模式，支持合约升级
- **管理员功能**: 
  - 设置FC:CFX兑换比例
  - 存入/提取FC代币
  - 存入/提取CFX
  - 执行待兑换订单
- **用户兑换功能**:
  - FC → CFX 兑换
  - CFX → FC 兑换
  - 自动处理余额不足的待兑换订单
- **ERC20代币**: FC代币合约，支持标准ERC20功能

### 前端功能
- **钱包连接**: 支持MetaMask连接
- **网络切换**: 自动切换到Conflux eSpace测试网
- **实时数据**: 显示合约信息、用户余额等
- **兑换界面**: 直观的兑换操作界面
- **管理员面板**: 管理员专用功能界面
- **响应式设计**: 支持移动端和桌面端

## 技术栈

### 智能合约
- **Solidity**: 0.8.20
- **OpenZeppelin**: 合约库和升级功能
- **Hardhat**: 开发框架
- **Conflux eSpace**: 目标区块链网络

### 前端
- **Next.js 14**: React框架
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **Ethers.js**: Web3交互
- **MetaMask**: 钱包连接

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- MetaMask钱包

### 安装依赖
```bash
npm install
```

### 环境配置
1. 复制环境变量文件：
```bash
cp env.example .env
```

2. 编辑 `.env` 文件，添加你的私钥：
```
PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_CONFLUX_RPC_URL=https://evmtestnet.confluxrpc.com
```

### 编译合约
```bash
npm run compile
```

### 部署合约
```bash
npm run deploy
```

部署完成后，将合约地址更新到 `.env` 文件：
```
NEXT_PUBLIC_FC_TOKEN_ADDRESS=部署的FCToken合约地址
NEXT_PUBLIC_ORDERBOOK_CONTRACT_ADDRESS=部署的OrderBook合约地址
```

### 启动前端
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 使用说明

### 管理员操作
1. 连接钱包（管理员地址）
2. 设置兑换比例（默认5:1）
3. 存入FC代币和CFX到合约
4. 执行待兑换订单

### 用户操作
1. 连接钱包
2. 选择兑换类型（FC→CFX 或 CFX→FC）
3. 输入兑换数量
4. 确认兑换（首次FC兑换需要授权）

### 兑换机制
- **即时兑换**: 如果合约余额充足，立即完成兑换
- **待兑换订单**: 如果余额不足，创建待兑换订单，等待管理员补充余额后执行

## 合约架构

### FCToken.sol
- ERC20代币合约
- 支持铸造功能（仅管理员）

### Exchange.sol
- 可升级的兑换合约
- 使用UUPS代理模式
- 支持FC和CFX的双向兑换
- 待兑换订单管理

## 安全特性

- **可升级性**: 合约支持升级以修复bug或添加功能
- **权限控制**: 管理员功能仅限owner调用
- **SafeERC20**: 使用OpenZeppelin的安全ERC20操作
- **余额检查**: 严格的余额和授权检查

## 网络配置

### Conflux eSpace网
- **Chain ID**: 71
- **RPC URL**: https://evm.confluxrpc.com
- **Explorer**: https://evm.confluxscan.io
- **Currency**: CFX

## 开发命令

```bash
# 编译合约
npm run compile

# 运行测试
npm run test

# 部署到测试网
npm run deploy

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 联系方式

如有问题，请通过GitHub Issues联系。 

note:
0. delete .openzeppelin
1. .env
2.npm run compile
3.npm run deploytest (modify .envtest)
4.npm run dev:test ()
 
upgrade
1.npm run compile
2.modify upgrade.js(modify)
3. npx hardhat run scripts/upgrade.js --network confluxTestnet

 npx hardhat run scripts/getImplementation.js --network confluxMainnet
