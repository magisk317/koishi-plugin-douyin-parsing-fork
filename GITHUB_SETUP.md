# GitHub 仓库设置指南

## 🚀 推送代码到 GitHub

### 1. 初始化 Git 仓库
```bash
git init
git add .
git commit -m "Initial commit: Fork koishi-plugin-douyin-parsing"
```

### 2. 添加远程仓库
```bash
git remote add origin https://github.com/your-username/koishi-plugin-douyin-parsing-fork.git
```

### 3. 推送代码
```bash
git branch -M main
git push -u origin main
```

## 🔑 设置 GitHub Secrets

### 1. NPM_TOKEN
1. 登录 [npmjs.com](https://www.npmjs.com)
2. 进入 Profile → Access Tokens
3. 创建新的 Access Token
4. 复制 Token 值
5. 在 GitHub 仓库中：
   - Settings → Secrets and variables → Actions
   - 点击 "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: 粘贴你的 npm token

### 2. 验证 GITHUB_TOKEN
- 这个通常会自动设置，无需手动配置

## 📦 发布到 NPM

### 方法 1: 使用 GitHub Actions (推荐)
1. 创建新的 Git 标签：
```bash
git tag v1.0.0
git push origin v1.0.0
```

2. GitHub Actions 会自动：
   - 构建项目
   - 发布到 npm
   - 创建 GitHub Release

### 方法 2: 手动发布
```bash
npm login
npm publish
```

## 🔄 更新版本

### 1. 修改版本号
```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

### 2. 推送标签
```bash
git push origin --tags
```

## 📋 检查清单

- [ ] 代码已推送到 GitHub
- [ ] NPM_TOKEN 已设置
- [ ] GitHub Actions 已启用
- [ ] 第一个版本标签已创建
- [ ] 自动发布成功
- [ ] npm 包可正常安装

## 🆘 常见问题

### Q: GitHub Actions 失败
A: 检查 NPM_TOKEN 是否正确设置，以及是否有构建错误

### Q: npm 发布失败
A: 确保包名唯一，检查 package.json 配置

### Q: 版本冲突
A: 确保每次发布都使用新的版本号
