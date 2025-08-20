# 🏈 CubeBall - 3D 足球游戏

一个基于 Three.js 和 Cannon.js 的 3D 足球游戏，具有真实的物理引擎和昼夜切换功能。

## 🎮 游戏特性

- **3D 足球场景**: 使用 Three.js 渲染的真实足球场
- **物理引擎**: Cannon.js 驱动的真实物理碰撞
- **昼夜切换**: 动态的光照系统，支持白天和夜间模式
- **增强照明**: 新增的中央点光源和环境增强光，让夜间更加明亮
- **响应式设计**: 支持不同屏幕尺寸
- **实时游戏**: 60秒倒计时的足球比赛

## 🚀 快速开始

### 本地运行

```bash
# 克隆项目
git clone <your-repo-url>
cd cubeball

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建项目

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🌐 部署到网络

### 方案1: Vercel (推荐)

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 导入此项目仓库
4. 自动部署完成

### 方案2: Netlify

1. 访问 [Netlify](https://netlify.com)
2. 将 `dist/` 文件夹拖拽到部署区域
3. 或连接 GitHub 仓库自动部署

### 方案3: GitHub Pages

```bash
# 安装 gh-pages (已包含在 devDependencies)
npm install

# 部署到 GitHub Pages
npm run deploy
```

### 方案4: 一键部署脚本

```bash
# 运行部署脚本
./deploy.sh
```

## 🎯 游戏控制

- **WASD**: 控制蓝色玩家移动
- **方向键**: 控制红色玩家移动
- **Day/Night 按钮**: 切换昼夜模式
- **Restart 按钮**: 重新开始游戏

## 🛠️ 技术栈

- **Three.js**: 3D 图形渲染
- **Cannon.js**: 物理引擎
- **TypeScript**: 类型安全的 JavaScript
- **Vite**: 快速的构建工具
- **Vitest**: 单元测试框架

## 📁 项目结构

```
src/
├── game/
│   ├── engine.ts      # 3D 渲染引擎和灯光系统
│   ├── physics.ts     # 物理世界设置
│   ├── entities.ts    # 游戏实体（玩家、球）
│   ├── match.ts       # 游戏逻辑和循环
│   └── constants.ts   # 游戏常量
├── utils/
│   └── goal.ts        # 进球判定逻辑
├── main.ts            # 应用入口点
└── style.css          # 样式文件
```

## 🌟 新增功能

### 增强的夜间照明系统

- **中央点光源**: 位于球场中央上方，提供主要照明
- **环境增强光**: 模拟月光效果的定向光源
- **智能光照控制**: 根据昼夜模式自动调节所有光源强度

## 🔧 开发

### 运行测试

```bash
npm run test
npm run test:watch  # 监听模式
```

### 代码检查

项目使用 TypeScript 严格模式，确保代码质量。

## 📝 部署注意事项

1. **构建优化**: 项目构建后约 600KB，考虑代码分割优化
2. **HTTPS**: 部署平台通常自动提供 HTTPS
3. **自定义域名**: 可在部署平台配置自定义域名
4. **环境变量**: 如需配置，在部署平台设置中添加

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
