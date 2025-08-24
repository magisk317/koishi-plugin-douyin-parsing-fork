# koishi-plugin-douyin-parsing-fork

[![npm](https://img.shields.io/npm/v/koishi-plugin-douyin-parsing-fork?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-douyin-parsing-fork)

解析抖音链接（无需自行配置API）- Fork版本

## 📋 项目说明

这是一个基于 [koishi-plugin-douyin-parsing](https://www.npmjs.com/package/koishi-plugin-douyin-parsing) 的Fork版本。

**原始项目**: [koishi-plugin-douyin-parsing](https://www.npmjs.com/package/koishi-plugin-douyin-parsing) by [ixbai](https://github.com/ixbai)

**Fork版本**: 保持原项目功能的同时，进行了优化和改进。

## ✨ 功能特性

- 🔗 自动解析抖音分享链接
- 🎥 支持直接发送视频文件
- 🖼️ 显示视频封面、标题、作者信息
- ⚙️ 丰富的配置选项
- 🚫 防重复处理机制
- 📏 智能文件大小检测
- 🏷️ 话题标签过滤
- 🐛 完善的错误处理
- 📱 **合并转发功能** - 智能合并多个视频链接，减少消息刷屏

## 🚀 安装使用

```bash
npm install koishi-plugin-douyin-parsing-fork
```

## 📖 配置说明

```typescript
export default {
  plugins: {
    'douyin-parsing-fork': {
      // 允许使用的群聊ID列表，为空表示所有群聊都可使用
      allowedGuilds: [],
      // 是否在私聊中启用抖音链接解析
      enablePrivateChat: false,
      // 是否启用调试模式，输出详细日志
      debug: false,
      // 是否发送视频链接而不是视频文件
      sendVideoAsLink: false,
      // 视频文件大小限制（MB），超过此大小将发送链接
      maxVideoSize: 50,
      // 是否过滤视频标题中的话题标签
      filterHashtags: true,
      // 防重复处理间隔时间（秒），0表示关闭此功能
      duplicateInterval: 60,
      // 是否发送等待提示语，让用户知道正在处理中
      showWaitingMessage: false,
      // 是否启用合并转发功能
      enableMergeForward: false,
      // 合并转发延迟时间（毫秒）
      mergeForwardDelay: 1000,
      // 合并转发最大消息数量
      mergeForwardMaxCount: 5
    }
  }
}
```

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件