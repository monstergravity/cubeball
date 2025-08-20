#!/bin/bash

echo "🚀 开始部署足球游戏..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo ""
    echo "📁 构建文件位于 dist/ 目录"
    echo ""
    echo "🌐 部署选项："
    echo "1. Vercel: 访问 https://vercel.com 并导入此项目"
    echo "2. Netlify: 将 dist/ 文件夹拖拽到 https://netlify.com"
    echo "3. GitHub Pages: 运行 'npm run deploy' (需要先推送到 GitHub)"
    echo "4. 本地预览: 运行 'npm run preview'"
    echo ""
    echo "🎮 游戏特性："
    echo "- 3D 足球场景"
    echo "- 昼夜切换功能"
    echo "- 增强的夜间照明系统"
    echo "- 物理引擎驱动的游戏玩法"
else
    echo "❌ 构建失败！请检查错误信息。"
    exit 1
fi
