# koishi-plugin-douyin-parsing-fork

抖音链接解析插件 - 支持合并转发和视频发送功能

## 功能特性

- 🔗 自动解析抖音分享链接
- 📱 智能合并转发多个视频链接
- 🎥 支持直接发送视频文件
- ⚙️ 丰富的配置选项
- 🚀 轻量级设计，功能完整

## 安装

```bash
npm install koishi-plugin-douyin-parsing-fork
```

## 配置

```typescript
export default {
  plugins: {
    'douyin-parsing-fork': {
      // 合并转发配置
      enableMergeForward: true,    // 启用合并转发
      mergeDelay: 2000,            // 合并延迟(毫秒)
      maxMergeCount: 5,            // 最大合并数量
      debug: false,                // 调试模式
      
      // 视频发送配置
      isSendVideo: false,          // 是否发送视频
      isCache: false,              // 是否缓存到内存后再发送
      maxDuration: 0,              // 最大视频时长(秒),0为不限制
      maxSize: 0                   // 最大视频大小(MB),0为不限制
    }
  }
}
```

## 使用方法

1. 在聊天中发送抖音分享链接
2. 插件自动解析并显示视频信息
3. 如果启用合并转发，多个链接会合并成一条消息
4. 如果启用视频发送，会直接发送视频文件

## 配置说明

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enableMergeForward` | boolean | `true` | 是否启用合并转发功能 |
| `mergeDelay` | number | `2000` | 合并延迟时间（毫秒） |
| `maxMergeCount` | number | `5` | 最大合并视频数量 |
| `debug` | boolean | `false` | 是否启用调试模式 |
| `isSendVideo` | boolean | `false` | 是否发送视频文件 |
| `isCache` | boolean | `false` | 是否缓存到内存后再发送 |
| `maxDuration` | number | `0` | 最大视频时长限制（秒） |
| `maxSize` | number | `0` | 最大视频大小限制（MB） |

## 功能说明

### 合并转发
- 智能合并多个抖音链接
- 可配置延迟时间和最大数量
- 减少消息刷屏，提升聊天体验

### 视频发送
- 支持直接发送视频文件
- 可选择缓存模式或直接发送
- 支持视频时长和大小限制
- 自动降级到链接发送

## 原始项目

基于 [koishi-plugin-douyin-parsing](https://www.npmjs.com/package/koishi-plugin-douyin-parsing) 项目

## 许可证

MIT