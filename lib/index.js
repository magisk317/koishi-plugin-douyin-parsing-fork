"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.usage = exports.name = void 0;
exports.apply = apply;
const koishi_1 = require("koishi");
exports.name = 'douyin-parsing-fork';
exports.usage = `📈 Fork自: koishi-plugin-douyin-parsing by ixbai

## 📋 插件说明
这是一个基于 koishi-plugin-douyin-parsing 的Fork版本，支持抖音链接自动解析和合并转发功能。

## 🔗 相关链接
- **原始项目**: [koishi-plugin-douyin-parsing](https://www.npmjs.com/package/koishi-plugin-douyin-parsing)
- **Fork版本**: 保持原项目功能的同时，进行了优化和改进

## ✨ 主要功能
- 🔗 自动解析抖音分享链接
- 🎥 支持直接发送视频文件
- 📱 合并转发功能 - 智能合并多个视频链接
- ⚙️ 丰富的配置选项`;
exports.Config = koishi_1.Schema.object({
    allowedGuilds: koishi_1.Schema.array(koishi_1.Schema.string()).default([]).description('允许使用的群聊ID列表，为空表示所有群聊都可使用').collapse(),
    enablePrivateChat: koishi_1.Schema.boolean().default(false).description('是否在私聊中启用抖音链接解析'),
    debug: koishi_1.Schema.boolean().default(false).description('是否启用调试模式，输出详细日志'),
    sendVideoAsLink: koishi_1.Schema.boolean().default(false).description('是否发送视频链接而不是视频文件'),
    maxVideoSize: koishi_1.Schema.number().default(50).min(1).max(500).description('视频文件大小限制（MB），超过此大小将发送链接'),
    filterHashtags: koishi_1.Schema.boolean().default(true).description('是否过滤视频标题中的话题标签（如 #叶问 #中国功夫）'),
    duplicateInterval: koishi_1.Schema.number().default(60).min(0).max(3600).description('防重复处理间隔时间（秒），0表示关闭此功能'),
    showWaitingMessage: koishi_1.Schema.boolean().default(false).description('是否发送等待提示语，让用户知道正在处理中'),
    enableMergeForward: koishi_1.Schema.boolean().default(false).description('是否启用合并转发功能'),
    mergeForwardDelay: koishi_1.Schema.number().default(1000).min(0).max(30000).description('合并转发延迟时间（毫秒）'),
    mergeForwardMaxCount: koishi_1.Schema.number().default(5).min(1).max(100).description('合并转发最大消息数量')
});
function apply(ctx, config) {
    const douyinRegex = /https?:\/\/(?:www\.)?(douyin\.com\/video\/|v\.douyin\.com\/|iesdouyin\.com\/share\/video\/|douyin\.com\/share\/video\/)[^\s]+/g;
    const linkCache = new Map();
    // 合并转发相关数据结构
    const mergeForwardCache = new Map();
    // 合并转发处理函数 - 参考哔哩哔哩插件的实现
    const processMergeForward = async (sessionId) => {
        const cache = mergeForwardCache.get(sessionId);
        if (!cache || cache.messages.length === 0)
            return;
        const { messages, session } = cache;
        if (config.debug) {
            ctx.logger.info(`执行合并转发，消息数量: ${messages.length}`);
        }
        try {
            // 准备发送的所有元素 - 使用更简单的方式
            const allElements = [];
            // 添加标题
            allElements.push((0, koishi_1.h)('text', `📱 抖音视频合集 (${messages.length}个视频)\n`));
            // 添加每个视频的信息
            for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];
                allElements.push((0, koishi_1.h)('text', `${i + 1}. ${msg.title}`));
                allElements.push((0, koishi_1.h)('text', `   作者: ${msg.author}`));
                allElements.push((0, koishi_1.h)('image', { src: msg.coverUrl }));
                allElements.push((0, koishi_1.h)('text', `   视频链接: ${msg.videoUrl}`));
            }
            // 合并转发处理 - 参考哔哩哔哩插件的实现
            if (session.platform === "onebot" || session.platform === "red") {
                if (config.debug) {
                    ctx.logger.info(`使用合并转发，正在合并消息。`);
                }
                // 创建 figure 元素
                const figureContent = (0, koishi_1.h)('figure', {
                    children: allElements
                });
                // 发送合并转发消息
                await session.send(figureContent);
            }
            else {
                // 其他平台按顺序发送所有元素
                for (const element of allElements) {
                    await session.send(element);
                }
            }
            if (config.debug) {
                ctx.logger.info(`合并转发发送成功，包含 ${messages.length} 个视频`);
            }
        }
        catch (error) {
            if (config.debug) {
                ctx.logger.error(`合并转发发送失败: ${error}`);
            }
            // 降级为合并发送（即使失败也要保持合并格式）
            try {
                if (config.debug) {
                    ctx.logger.info(`尝试降级发送...`);
                }
                // 降级时直接按顺序发送，不使用figure
                const fallbackElements = [];
                fallbackElements.push((0, koishi_1.h)('text', `📱 抖音视频合集 (${messages.length}个视频) - 降级模式\n`));
                for (let i = 0; i < messages.length; i++) {
                    const msg = messages[i];
                    fallbackElements.push((0, koishi_1.h)('text', `${i + 1}. ${msg.title}`));
                    fallbackElements.push((0, koishi_1.h)('text', `   作者: ${msg.author}`));
                    fallbackElements.push((0, koishi_1.h)('image', { src: msg.coverUrl }));
                    fallbackElements.push((0, koishi_1.h)('text', `   视频链接: ${msg.videoUrl}`));
                }
                // 降级时直接发送元素数组，不使用figure
                await session.send(fallbackElements);
                if (config.debug) {
                    ctx.logger.info(`降级发送成功`);
                }
            }
            catch (fallbackError) {
                if (config.debug) {
                    ctx.logger.error(`降级发送也失败: ${fallbackError}`);
                }
            }
        }
        // 清理缓存
        mergeForwardCache.delete(sessionId);
    };
    // 添加消息到合并转发队列
    const addToMergeForward = (sessionId, messageData, session) => {
        if (!config.enableMergeForward)
            return false;
        let cache = mergeForwardCache.get(sessionId);
        if (!cache) {
            cache = {
                messages: [],
                timer: null,
                session
            };
            mergeForwardCache.set(sessionId, cache);
        }
        // 添加消息
        cache.messages.push({
            title: messageData.title,
            author: messageData.author.name,
            coverUrl: messageData.cover_url,
            videoUrl: messageData.video_url,
            timestamp: Date.now()
        });
        // 检查是否达到最大数量
        if (cache.messages.length >= config.mergeForwardMaxCount) {
            if (cache.timer) {
                clearTimeout(cache.timer);
                cache.timer = null;
            }
            processMergeForward(sessionId);
            return true;
        }
        // 设置延迟定时器
        if (cache.timer) {
            clearTimeout(cache.timer);
        }
        cache.timer = setTimeout(() => {
            processMergeForward(sessionId);
        }, config.mergeForwardDelay);
        return true;
    };
    ctx.middleware(async (session, next) => {
        if (session.type !== 'message' && session.type !== 'message-created') {
            if (config.debug) {
                ctx.logger.info(`跳过非消息类型: ${session.type}`);
            }
            return next();
        }
        if (!session.guildId && !config.enablePrivateChat) {
            if (config.debug) {
                ctx.logger.info('跳过私聊消息（私聊功能未启用）');
            }
            return next();
        }
        if (session.guildId && config.allowedGuilds.length > 0) {
            if (!config.allowedGuilds.includes(session.guildId)) {
                if (config.debug) {
                    ctx.logger.info(`跳过未授权群聊: ${session.guildId}`);
                }
                return next();
            }
        }
        const content = session.content || '';
        if (config.debug) {
            ctx.logger.info(`收到消息: ${content}`);
            ctx.logger.info(`消息类型: ${session.guildId ? '群聊' : '私聊'}`);
        }
        const douyinLinks = content.match(douyinRegex);
        if (config.debug) {
            ctx.logger.info(`检测到的抖音链接: ${douyinLinks ? douyinLinks.join(', ') : '无'}`);
        }
        if (douyinLinks && douyinLinks.length > 0) {
            for (const link of douyinLinks) {
                try {
                    if (config.duplicateInterval > 0) {
                        const now = Date.now();
                        const lastProcessed = linkCache.get(link);
                        if (lastProcessed && now - lastProcessed < config.duplicateInterval * 1000) {
                            if (config.debug) {
                                ctx.logger.info(`跳过重复链接: ${link} (${Math.round((now - lastProcessed) / 1000)}秒前已处理)`);
                            }
                            continue;
                        }
                        linkCache.set(link, now);
                        // 清理过期的缓存
                        for (const [cachedLink, timestamp] of linkCache.entries()) {
                            if (now - timestamp > config.duplicateInterval * 1000) {
                                linkCache.delete(cachedLink);
                            }
                        }
                    }
                    if (config.showWaitingMessage) {
                        await session.send('正在解析抖音视频，请稍候...');
                    }
                    if (config.debug) {
                        ctx.logger.info(`开始解析链接: ${link}`);
                    }
                    const apiUrl = `https://sv.mznzd.com/video/share/url/parse?url=${encodeURIComponent(link)}`;
                    if (config.debug) {
                        ctx.logger.info(`API请求地址: ${apiUrl}`);
                    }
                    const response = await ctx.http.get(apiUrl);
                    if (config.debug) {
                        ctx.logger.info(`API响应: ${JSON.stringify(response)}`);
                    }
                    if (response.code === 200 && response.data) {
                        const data = response.data;
                        let title = data.title;
                        if (config.filterHashtags) {
                            title = title.replace(/#[^\s#]+/g, '').replace(/\s+/g, ' ').trim();
                        }
                        // 生成会话ID用于合并转发
                        const sessionId = session.guildId || session.userId || session.channelId || 'default';
                        // 尝试添加到合并转发队列
                        const addedToMerge = addToMergeForward(sessionId, data, session);
                        if (!addedToMerge) {
                            // 如果没有启用合并转发或添加失败，使用原来的单独发送逻辑
                            const firstMessage = [
                                koishi_1.h.image(data.cover_url),
                                `标题：${title}`,
                                `作者：${data.author.name}`
                            ].join('\n');
                            await session.send(firstMessage);
                            setTimeout(async () => {
                                if (data.video_url) {
                                    if (config.sendVideoAsLink) {
                                        await session.send(`视频链接：${data.video_url}`);
                                    }
                                    else {
                                        try {
                                            const response2 = await ctx.http.head(data.video_url);
                                            if (config.debug) {
                                                ctx.logger.info('HEAD响应头:', response2);
                                            }
                                            let contentLength = null;
                                            if (typeof response2.get === 'function') {
                                                contentLength = response2.get('content-length') || response2.get('Content-Length');
                                            }
                                            else {
                                                // 处理非标准Headers对象的情况
                                                const headers = response2;
                                                contentLength = headers['content-length'] || headers['Content-Length'];
                                                if (!contentLength) {
                                                    for (const [key, value] of Object.entries(headers)) {
                                                        if (key.toLowerCase() === 'content-length') {
                                                            contentLength = value;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            if (config.debug) {
                                                ctx.logger.info(`获取到的content-length: ${contentLength}`);
                                            }
                                            if (contentLength) {
                                                const fileSizeMB = parseInt(contentLength) / (1024 * 1024);
                                                if (config.debug) {
                                                    ctx.logger.info(`视频文件大小: ${fileSizeMB.toFixed(2)}MB`);
                                                }
                                                if (fileSizeMB > config.maxVideoSize) {
                                                    if (config.debug) {
                                                        ctx.logger.info(`视频文件过大 (${fileSizeMB.toFixed(2)}MB > ${config.maxVideoSize}MB)，发送提示`);
                                                    }
                                                    await session.send('视频太大了，内容还是去抖音看吧~');
                                                    return;
                                                }
                                            }
                                            try {
                                                await session.send(koishi_1.h.video(data.video_url));
                                            }
                                            catch (videoError) {
                                                if (config.debug) {
                                                    ctx.logger.error(`发送视频失败，改为发送链接: ${videoError}`);
                                                }
                                                await session.send(`视频链接：${data.video_url}`);
                                            }
                                        }
                                        catch (headError) {
                                            if (config.debug) {
                                                ctx.logger.error(`获取视频头信息失败: ${headError}，尝试直接发送视频`);
                                            }
                                            try {
                                                await session.send(koishi_1.h.video(data.video_url));
                                            }
                                            catch (videoError) {
                                                if (config.debug) {
                                                    ctx.logger.error(`发送视频失败，改为发送链接: ${videoError}`);
                                                }
                                                await session.send(`视频链接：${data.video_url}`);
                                            }
                                        }
                                    }
                                }
                                else {
                                    await session.send('视频解析失败，无法获取视频链接');
                                }
                            }, 1000);
                        }
                        else {
                            if (config.debug) {
                                ctx.logger.info(`视频已添加到合并转发队列，会话ID: ${sessionId}`);
                            }
                            // 当启用合并转发时，不发送任何单独消息，等待合并完成
                        }
                    }
                    else {
                        await session.send('抖音链接解析失败');
                    }
                }
                catch (error) {
                    if (config.debug) {
                        ctx.logger.error(`解析抖音链接时出错: ${error}`);
                    }
                    else {
                        console.error('解析抖音链接时出错:', error);
                    }
                    await session.send('解析抖音链接时发生错误');
                }
            }
        }
        return next();
    });
}
//# sourceMappingURL=index.js.map