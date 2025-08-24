# 更新日志

## [1.0.0] - 2024-12-19

### 新增
- 🎉 初始版本发布
- 🔗 抖音链接自动解析功能
- 🎥 支持直接发送视频文件
- 🖼️ 显示视频封面、标题、作者信息
- ⚙️ 丰富的配置选项
- 🚫 防重复处理机制
- 📏 智能文件大小检测
- 🏷️ 话题标签过滤功能
- 🐛 完善的错误处理

### 技术特性
- TypeScript 支持
- Koishi 4.x 兼容
- 零配置 API 使用
- 智能降级策略

### 致谢
- 基于 [koishi-plugin-douyin-parsing](https://www.npmjs.com/package/koishi-plugin-douyin-parsing) 项目
- 原项目作者: [ixbai](https://github.com/ixbai)

---

## 安装使用

```bash
npm install koishi-plugin-douyin-parsing-fork
```

## 配置示例

```typescript
export default {
  plugins: {
    'douyin-parsing-fork': {
      enablePrivateChat: false,
      maxVideoSize: 50,
      filterHashtags: true
    }
  }
}
```
