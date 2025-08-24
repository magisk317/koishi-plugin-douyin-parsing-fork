# 更新日志

## [1.0.3] - 2024-12-19

### 修复
- 修复合并转发功能：使用h.figure确保真正合并成一条消息
- 参考哔哩哔哩插件的合并转发实现方式
- 优化降级逻辑，保持合并格式一致性

---

## [1.0.2] - 2024-12-19

### 修复
- 修复合并转发功能中的消息发送错误
- 移除官方QQ交流群信息
- 优化错误处理逻辑

---

## [1.0.1] - 2024-12-19

### 修复
- 修复GitHub Actions权限问题
- 更新发布工作流配置
- 优化.gitignore文件

---

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
- 📱 **合并转发功能** - 智能合并多个视频链接，减少消息刷屏

### 技术特性
- TypeScript 支持
- Koishi 4.x 兼容
- 零配置 API 使用
- 智能降级策略

### 致谢
- 基于 [koishi-plugin-douyin-parsing](https://www.npmjs.com/package/koishi-plugin-douyin-parsing) 项目

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
