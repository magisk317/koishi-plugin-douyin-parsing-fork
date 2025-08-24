# 🚀 GitHub 仓库设置详细指南

## 📋 前置准备

### 1. GitHub 账户
- 确保您有 GitHub 账户
- 如果没有，请访问 [github.com](https://github.com) 注册

### 2. NPM 账户
- 确保您有 NPM 账户
- 如果没有，请访问 [npmjs.com](https://npmjs.com) 注册

## 🔧 第一步：在 GitHub 上创建仓库

### 1. 创建新仓库
1. 登录 GitHub
2. 点击右上角 `+` 号 → `New repository`
3. 填写仓库信息：
   - **Repository name**: `koishi-plugin-douyin-parsing-fork`
   - **Description**: `解析抖音链接，支持直接发送视频（无需自行配置API）- Fork版本`
   - **Visibility**: 选择 `Public` 或 `Private`
   - **不要**勾选 "Add a README file"（我们已经有了）
   - **不要**勾选 "Add .gitignore"（我们已经有了）
   - **不要**勾选 "Choose a license"（我们已经有了）

### 2. 创建仓库
点击 `Create repository` 按钮

## 🔗 第二步：连接本地仓库到 GitHub

### 1. 添加远程仓库
在您的本地项目目录中运行：
```bash
git remote add origin https://github.com/YOUR_USERNAME/koishi-plugin-douyin-parsing-fork.git
```

**注意**: 将 `YOUR_USERNAME` 替换为您的 GitHub 用户名

### 2. 推送代码
```bash
git push -u origin main
```

## 🔑 第三步：设置 GitHub Secrets

### 1. 获取 NPM Token
1. 登录 [npmjs.com](https://npmjs.com)
2. 点击右上角头像 → `Access Tokens`
3. 点击 `Generate New Token`
4. 选择 `Automation` 类型
5. 复制生成的 Token（注意保存，只显示一次）

### 2. 在 GitHub 中设置 Secret
1. 进入您的 GitHub 仓库
2. 点击 `Settings` 标签
3. 左侧菜单选择 `Secrets and variables` → `Actions`
4. 点击 `New repository secret`
5. 填写信息：
   - **Name**: `NPM_TOKEN`
   - **Value**: 粘贴您的 NPM Token
6. 点击 `Add secret`

## 📦 第四步：发布到 NPM

### 方法 1：使用 GitHub Actions（推荐）

#### 1. 创建版本标签
```bash
git tag v1.0.0
git push origin v1.0.0
```

#### 2. 自动发布
GitHub Actions 会自动：
- 构建项目
- 发布到 npm
- 创建 GitHub Release

### 方法 2：手动发布

#### 1. 登录 NPM
```bash
npm login
```

#### 2. 发布包
```bash
npm publish
```

## 🔄 第五步：更新版本

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

- [ ] GitHub 仓库已创建
- [ ] 本地代码已推送到 GitHub
- [ ] NPM_TOKEN 已设置
- [ ] GitHub Actions 已启用
- [ ] 第一个版本标签已创建
- [ ] 自动发布成功
- [ ] npm 包可正常安装

## 🆘 常见问题解决

### Q: 推送失败 "remote origin already exists"
A: 运行以下命令重新设置：
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/koishi-plugin-douyin-parsing-fork.git
```

### Q: GitHub Actions 失败
A: 检查：
1. NPM_TOKEN 是否正确设置
2. 仓库是否有 Actions 权限
3. 构建是否有错误

### Q: npm 发布失败
A: 检查：
1. 包名是否唯一
2. package.json 配置是否正确
3. 是否已登录 npm

### Q: 权限不足
A: 确保：
1. 您有仓库的写入权限
2. NPM_TOKEN 有发布权限

## 📞 获取帮助

如果遇到问题：
1. 检查 GitHub Actions 日志
2. 查看 npm 错误信息
3. 参考 GitHub 和 npm 官方文档

## 🎯 下一步

设置完成后，您可以：
1. 在 README 中更新仓库链接
2. 添加更多功能
3. 接受社区贡献
4. 维护和更新项目
