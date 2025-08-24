import { Context, Schema, h } from 'koishi';

export const name = 'douyin-parsing-fork';
export const usage = '抖音链接解析插件 - 支持合并转发';

export interface Config {
  enableMergeForward: boolean;
  mergeDelay: number;
  maxMergeCount: number;
  debug: boolean;
}

export const Config: Schema<Config> = Schema.object({
  enableMergeForward: Schema.boolean().default(true).description('启用合并转发'),
  mergeDelay: Schema.number().default(2000).min(500).max(10000).description('合并延迟(毫秒)'),
  maxMergeCount: Schema.number().default(5).min(1).max(20).description('最大合并数量'),
  debug: Schema.boolean().default(false).description('调试模式')
});

export function apply(ctx: Context, config: Config) {
  // 抖音链接正则
  const douyinRegex = /https?:\/\/(?:www\.)?(douyin\.com\/video\/|v\.douyin\.com\/|iesdouyin\.com\/share\/video\/)[^\s]+/g;
  
  // 合并转发缓存
  const mergeCache = new Map<string, {
    messages: Array<{
      title: string;
      author: string;
      cover: string;
      videoUrl: string;
    }>;
    timer: NodeJS.Timeout | null;
    session: any;
  }>();

  // 处理合并转发
  const processMerge = async (sessionId: string) => {
    const cache = mergeCache.get(sessionId);
    if (!cache || cache.messages.length === 0) return;

    const { messages, session } = cache;
    
    if (config.debug) {
      ctx.logger.info(`执行合并转发，消息数量: ${messages.length}`);
    }

    try {
      // 构建合并消息
      const mergeMessage = [
        h('text', `📱 抖音视频合集 (${messages.length}个视频)\n`),
        ...messages.map((msg, index) => [
          h('text', `${index + 1}. ${msg.title}`),
          h('text', `   作者: ${msg.author}`),
          h('image', { src: msg.cover }),
          h('text', `   视频: ${msg.videoUrl}`)
        ]).flat()
      ];

      // 发送合并消息
      await session.send(mergeMessage);
      
      if (config.debug) {
        ctx.logger.info(`合并转发成功`);
      }
    } catch (error) {
      if (config.debug) {
        ctx.logger.error(`合并转发失败: ${error}`);
      }
    }

    // 清理缓存
    mergeCache.delete(sessionId);
  };

  // 添加到合并队列
  const addToMerge = (sessionId: string, videoData: any, session: any) => {
    if (!config.enableMergeForward) return false;

    let cache = mergeCache.get(sessionId);
    if (!cache) {
      cache = {
        messages: [],
        timer: null,
        session
      };
      mergeCache.set(sessionId, cache);
    }

    // 添加视频信息
    cache.messages.push({
      title: videoData.title,
      author: videoData.author.name,
      cover: videoData.cover_url,
      videoUrl: videoData.video_url
    });

    // 检查是否达到最大数量
    if (cache.messages.length >= config.maxMergeCount) {
      if (cache.timer) {
        clearTimeout(cache.timer);
        cache.timer = null;
      }
      processMerge(sessionId);
      return true;
    }

    // 设置延迟定时器
    if (cache.timer) {
      clearTimeout(cache.timer);
    }
    cache.timer = setTimeout(() => {
      processMerge(sessionId);
    }, config.mergeDelay);

    return true;
  };

  // 消息中间件
  ctx.middleware(async (session, next) => {
    if (session.type !== 'message') return next();

    const content = session.content || '';
    const douyinLinks = content.match(douyinRegex);
    
    if (!douyinLinks || douyinLinks.length === 0) return next();

    if (config.debug) {
      ctx.logger.info(`检测到抖音链接: ${douyinLinks.join(', ')}`);
    }

    for (const link of douyinLinks) {
      try {
        // 调用API解析链接
        const apiUrl = `https://sv.mznzd.com/video/share/url/parse?url=${encodeURIComponent(link)}`;
        const response = await ctx.http.get(apiUrl);

        if (response.code === 200 && response.data) {
          const data = response.data;
          
          // 生成会话ID
          const sessionId = session.guildId || session.userId || 'default';
          
          // 尝试添加到合并队列
          const addedToMerge = addToMerge(sessionId, data, session);
          
          if (!addedToMerge) {
            // 如果没有启用合并转发，直接发送
            await session.send([
              h('image', { src: data.cover_url }),
              h('text', `标题：${data.title}`),
              h('text', `作者：${data.author.name}`)
            ]);
          } else {
            if (config.debug) {
              ctx.logger.info(`视频已添加到合并队列`);
            }
          }
        } else {
          await session.send('抖音链接解析失败');
        }
      } catch (error) {
        if (config.debug) {
          ctx.logger.error(`解析失败: ${error}`);
        }
        await session.send('解析抖音链接时发生错误');
      }
    }

    return next();
  });
}
