# koishi-plugin-douyin-parsing-fork

抖音链接解析插件 - 支持合并转发功能

## 功能特性

- 🔗 自动解析抖音分享链接
- 📱 智能合并转发多个视频链接
- ⚙️ 简洁的配置选项
- 🚀 轻量级设计，专注于核心功能

## 安装

```bash
npm install koishi-plugin-douyin-parsing-fork
```

## 配置

```typescript
export default {
  plugins: {
    'douyin-parsing-fork': {
      enableMergeForward: true,    // 启用合并转发
      mergeDelay: 2000,            // 合并延迟(毫秒)
      maxMergeCount: 5,            // 最大合并数量
      debug: false                 // 调试模式
    }
  }
}
```

## 使用方法

1. 在聊天中发送抖音分享链接
2. 插件自动解析并显示视频信息
3. 如果启用合并转发，多个链接会合并成一条消息

## 配置说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enableMergeForward` | boolean | `true` | 是否启用合并转发功能 |
| `mergeDelay` | number | `2000` | 合并延迟时间（毫秒） |
| `maxMergeCount` | number | `5` | 最大合并视频数量 |
| `debug` | boolean | `false` | 是否启用调试模式 |

## 原始项目

基于 [koishi-plugin-douyin-parsing](https://www.npmjs.com/package/koishi-plugin-douyin-parsing) 项目

## 许可证

MIT