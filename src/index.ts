import { Context, Schema, h } from 'koishi';

export const name = 'douyin-parsing-fork';

export const usage = `📢 官方交流群：767723753

欢迎加入官方QQ群交流技术、反馈问题和获取最新更新信息！

🔗 快速加入：https://qm.qq.com/q/tcTUHy0bm0

📈 Fork自: koishi-plugin-douyin-parsing by ixbai`;

export interface Config {
  allowedGuilds: string[];
  enablePrivateChat: boolean;
  debug: boolean;
  sendVideoAsLink: boolean;
  maxVideoSize: number;
  filterHashtags: boolean;
  duplicateInterval: number;
  showWaitingMessage: boolean;
  enableMergeForward: boolean;
  mergeForwardDelay: number;
  mergeForwardMaxCount: number;
}

export const Config: Schema<Config> = Schema.object({
  allowedGuilds: Schema.array(Schema.string()).default([]).description('允许使用的群聊ID列表，为空表示所有群聊都可使用').collapse(),
  enablePrivateChat: Schema.boolean().default(false).description('是否在私聊中启用抖音链接解析'),
  debug: Schema.boolean().default(false).description('是否启用调试模式，输出详细日志'),
  sendVideoAsLink: Schema.boolean().default(false).description('是否发送视频链接而不是视频文件'),
  maxVideoSize: Schema.number().default(50).min(1).max(500).description('视频文件大小限制（MB），超过此大小将发送链接'),
  filterHashtags: Schema.boolean().default(true).description('是否过滤视频标题中的话题标签（如 #叶问 #中国功夫）'),
  duplicateInterval: Schema.number().default(60).min(0).max(3600).description('防重复处理间隔时间（秒），0表示关闭此功能'),
  showWaitingMessage: Schema.boolean().default(false).description('是否发送等待提示语，让用户知道正在处理中'),
  enableMergeForward: Schema.boolean().default(false).description('是否启用合并转发功能'),
  mergeForwardDelay: Schema.number().default(1000).min(0).max(30000).description('合并转发延迟时间（毫秒）'),
  mergeForwardMaxCount: Schema.number().default(5).min(1).max(100).description('合并转发最大消息数量')
});

export function apply(ctx: Context, config: Config) {
  const douyinRegex = /https?:\/\/(?:www\.)?(douyin\.com\/video\/|v\.douyin\.com\/|iesdouyin\.com\/share\/video\/|douyin\.com\/share\/video\/)[^\s]+/g;
  const linkCache = new Map<string, number>();
  
  // 合并转发相关数据结构
  const mergeForwardCache = new Map<string, {
    messages: Array<{
      title: string;
      author: string;
      coverUrl: string;
      videoUrl: string;
      timestamp: number;
    }>;
    timer: NodeJS.Timeout | null;
    session: any;
  }>();

  // 合并转发处理函数
  const processMergeForward = async (sessionId: string) => {
    const cache = mergeForwardCache.get(sessionId);
    if (!cache || cache.messages.length === 0) return;

    const { messages, session } = cache;
    
    if (config.debug) {
      ctx.logger.info(`执行合并转发，消息数量: ${messages.length}`);
    }

    try {
      // 创建合并转发消息
      const forwardMessages = messages.map(msg => ({
        title: msg.title,
        author: msg.author,
        coverUrl: msg.coverUrl,
        videoUrl: msg.videoUrl
      }));

      // 发送合并转发
      await session.send(h('message', [
        h('text', `📱 抖音视频合集 (${forwardMessages.length}个视频)\n`),
        ...forwardMessages.map((msg, index) => [
          h('text', `\n${index + 1}. ${msg.title}\n`),
          h('text', `   作者: ${msg.author}\n`),
          h('image', { src: msg.coverUrl }),
          h('text', `\n   视频链接: ${msg.videoUrl}\n`)
        ]).flat()
      ]));

      if (config.debug) {
        ctx.logger.info(`合并转发发送成功，包含 ${forwardMessages.length} 个视频`);
      }
    } catch (error) {
      if (config.debug) {
        ctx.logger.error(`合并转发发送失败: ${error}`);
      }
      // 降级为单独发送
      for (const msg of messages) {
        try {
          const singleMessage = [
            h.image(msg.coverUrl),
            `标题：${msg.title}`,
            `作者：${msg.author}`,
            `视频链接：${msg.videoUrl}`
          ].join('\n');
          await session.send(singleMessage);
        } catch (sendError) {
          if (config.debug) {
            ctx.logger.error(`单独发送失败: ${sendError}`);
          }
        }
      }
    }

    // 清理缓存
    mergeForwardCache.delete(sessionId);
  };

  // 添加消息到合并转发队列
  const addToMergeForward = (sessionId: string, messageData: any, session: any) => {
    if (!config.enableMergeForward) return false;

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
                h.image(data.cover_url),
                `标题：${title}`,
                `作者：${data.author.name}`
              ].join('\n');

              await session.send(firstMessage);

              setTimeout(async () => {
                if (data.video_url) {
                  if (config.sendVideoAsLink) {
                    await session.send(`视频链接：${data.video_url}`);
                  } else {
                    try {
                      const response2 = await ctx.http.head(data.video_url);
                      if (config.debug) {
                        ctx.logger.info('HEAD响应头:', response2);
                      }

                      let contentLength: string | null = null;
                      if (typeof response2.get === 'function') {
                        contentLength = response2.get('content-length') || response2.get('Content-Length');
                      } else {
                        // 处理非标准Headers对象的情况
                        const headers = response2 as any;
                        contentLength = headers['content-length'] || headers['Content-Length'];
                        if (!contentLength) {
                          for (const [key, value] of Object.entries(headers)) {
                            if (key.toLowerCase() === 'content-length') {
                              contentLength = value as string;
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
                        await session.send(h.video(data.video_url));
                      } catch (videoError) {
                        if (config.debug) {
                          ctx.logger.error(`发送视频失败，改为发送链接: ${videoError}`);
                        }
                        await session.send(`视频链接：${data.video_url}`);
                      }
                    } catch (headError) {
                      if (config.debug) {
                        ctx.logger.error(`获取视频头信息失败: ${headError}，尝试直接发送视频`);
                      }
                      try {
                        await session.send(h.video(data.video_url));
                      } catch (videoError) {
                        if (config.debug) {
                          ctx.logger.error(`发送视频失败，改为发送链接: ${videoError}`);
                        }
                        await session.send(`视频链接：${data.video_url}`);
                      }
                    }
                  }
                } else {
                  await session.send('视频解析失败，无法获取视频链接');
                }
              }, 1000);
            } else {
              if (config.debug) {
                ctx.logger.info(`视频已添加到合并转发队列，会话ID: ${sessionId}`);
              }
            }
          } else {
            await session.send('抖音链接解析失败');
          }
        } catch (error) {
          if (config.debug) {
            ctx.logger.error(`解析抖音链接时出错: ${error}`);
          } else {
            console.error('解析抖音链接时出错:', error);
          }
          await session.send('解析抖音链接时发生错误');
        }
      }
    }

    return next();
  });
}
