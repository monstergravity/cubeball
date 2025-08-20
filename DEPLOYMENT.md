# 足球游戏部署指南

## 方案1：Vercel 部署（推荐）

### 前提条件
- GitHub 账号
- 项目已推送到 GitHub

### 部署步骤

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置项目**
   - Project Name: `cubeball-game`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成（通常2-3分钟）

### 自动部署
- 每次推送到 GitHub 主分支时，Vercel 会自动重新部署
- 支持预览部署（Pull Request）

---

## 方案2：Netlify 部署

### 部署步骤

1. **访问 Netlify**
   - 打开 https://netlify.com
   - 注册/登录账号

2. **拖拽部署**
   - 将 `dist` 文件夹直接拖拽到 Netlify 部署区域
   - 或者连接 GitHub 仓库进行自动部署

3. **配置**
   - Build command: `npm run build`
   - Publish directory: `dist`

---

## 方案3：GitHub Pages 部署

### 部署步骤

1. **安装 gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **修改 package.json**
   添加部署脚本：
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/your-repo-name"
   }
   ```

3. **部署**
   ```bash
   npm run deploy
   ```

---

## 方案4：Firebase Hosting

### 部署步骤

1. **安装 Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **初始化项目**
   ```bash
   firebase login
   firebase init hosting
   ```

3. **配置 firebase.json**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **部署**
   ```bash
   npm run build
   firebase deploy
   ```

---

## 本地预览构建版本

在部署前，你可以本地预览构建版本：

```bash
npm run build
npm run preview
```

然后访问 http://localhost:4173

---

## 注意事项

1. **构建优化**
   - 项目构建后的 JS 文件较大（600KB+）
   - 考虑代码分割来优化加载速度

2. **域名配置**
   - 部署后可以配置自定义域名
   - 支持 HTTPS（推荐）

3. **环境变量**
   - 如果需要配置环境变量，在部署平台的设置中添加

4. **性能优化**
   - 启用 gzip 压缩
   - 配置 CDN 加速
   - 优化图片和资源加载
