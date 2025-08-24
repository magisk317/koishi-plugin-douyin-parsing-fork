# GitHub 仓库设置自动化脚本
# 使用方法: .\setup-github.ps1 "YOUR_GITHUB_USERNAME"

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

Write-Host "🚀 开始设置 GitHub 仓库..." -ForegroundColor Green

# 检查是否在Git仓库中
if (-not (Test-Path ".git")) {
    Write-Host "❌ 错误: 当前目录不是Git仓库" -ForegroundColor Red
    Write-Host "请先运行: git init" -ForegroundColor Yellow
    exit 1
}

# 检查是否有远程仓库
$remoteOrigin = git remote get-url origin 2>$null
if ($remoteOrigin) {
    Write-Host "⚠️  检测到已存在的远程仓库: $remoteOrigin" -ForegroundColor Yellow
    $removeRemote = Read-Host "是否要移除并重新设置? (y/N)"
    if ($removeRemote -eq "y" -or $removeRemote -eq "Y") {
        git remote remove origin
        Write-Host "✅ 已移除旧的远程仓库" -ForegroundColor Green
    } else {
        Write-Host "❌ 操作已取消" -ForegroundColor Red
        exit 1
    }
}

# 添加新的远程仓库
$remoteUrl = "https://github.com/$GitHubUsername/koishi-plugin-douyin-parsing-fork.git"
Write-Host "🔗 添加远程仓库: $remoteUrl" -ForegroundColor Blue
git remote add origin $remoteUrl

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 远程仓库添加成功" -ForegroundColor Green
} else {
    Write-Host "❌ 远程仓库添加失败" -ForegroundColor Red
    exit 1
}

# 推送代码
Write-Host "📤 推送代码到 GitHub..." -ForegroundColor Blue
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 代码推送成功" -ForegroundColor Green
} else {
    Write-Host "❌ 代码推送失败" -ForegroundColor Red
    Write-Host "请检查:" -ForegroundColor Yellow
    Write-Host "1. GitHub 仓库是否已创建" -ForegroundColor Yellow
    Write-Host "2. 网络连接是否正常" -ForegroundColor Yellow
    Write-Host "3. 是否有推送权限" -ForegroundColor Yellow
    exit 1
}

# 创建版本标签
Write-Host "🏷️  创建版本标签 v1.0.0..." -ForegroundColor Blue
git tag v1.0.0

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 版本标签创建成功" -ForegroundColor Green
} else {
    Write-Host "❌ 版本标签创建失败" -ForegroundColor Red
    exit 1
}

# 推送标签
Write-Host "📤 推送标签到 GitHub..." -ForegroundColor Blue
git push origin v1.0.0

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 标签推送成功" -ForegroundColor Green
} else {
    Write-Host "❌ 标签推送失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 GitHub 仓库设置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步操作:" -ForegroundColor Yellow
Write-Host "1. 在 GitHub 仓库中设置 NPM_TOKEN Secret" -ForegroundColor White
Write-Host "2. 等待 GitHub Actions 自动构建和发布" -ForegroundColor White
Write-Host "3. 检查 npm 包是否发布成功" -ForegroundColor White
Write-Host ""
Write-Host "📖 详细说明请查看: GITHUB_SETUP_DETAILED.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repository URL: $remoteUrl" -ForegroundColor Blue
