import { Context, Schema, h } from 'koishi';

export const name = 'douyin-parsing-fork';
export const usage = '抖音链接解析插件 - 支持合并转发和视频发送';

export interface Config {
  enableMergeForward: boolean;
  mergeDelay: number;
  maxMergeCount: number;
  debug: boolean;
  // 新增配置项
  isSendVideo: boolean;
  isCache: boolean;
  maxDuration: number;
  maxSize: number;
}

export const Config: Schema<Config> = Schema.object({
  enableMergeForward: Schema.boolean().default(true).description('启用合并转发'),
  mergeDelay: Schema.number().default(2000).min(500).max(10000).description('合并延迟(毫秒)'),
  maxMergeCount: Schema.number().default(5).min(1).max(20).description('最大合并数量'),
  debug: Schema.boolean().default(false).description('调试模式'),
  // 新增配置项
  isSendVideo: Schema.boolean().default(false).description('是否发送视频'),
  isCache: Schema.boolean().default(false).description('是否缓存到内存后再发送'),
  maxDuration: Schema.number().default(0).min(0).description('允许发送的最大视频长度(秒),0为不限制'),
  maxSize: Schema.number().default(0).min(0).description('允许发送的最大视频大小(MB),0为不限制')
});

// 计算视频时长
function formatMilliseconds(milliseconds: number): string {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  seconds %= 60;
  minutes %= 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return `${hh}时${mm}分${ss}秒`;
}

// 视频信息类型
interface VideoInfo {
  desc: string;           // 视频描述
  author: string;         // 作者
  digg_count: number;     // 点赞数
  share_count: number;    // 分享数
  comment_count: number;  // 评论数
  collect_count: number;  // 收藏数
  videoCover: string;     // 视频封面
  duration: number;       // 视频时长
  videoData: any;         // 视频数据
}

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
      videoInfo: VideoInfo;
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

      // 如果启用视频发送，逐个发送视频
      if (config.isSendVideo) {
        for (const msg of messages) {
          await sendVideo(session, msg.videoInfo, msg.videoUrl);
        }
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
  const addToMerge = (sessionId: string, videoData: any, session: any, videoInfo: VideoInfo) => {
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
      videoUrl: videoData.video_url,
      videoInfo
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

  // 发送视频函数
  const sendVideo = async (session: any, videoInfo: VideoInfo, videoUrl: string) => {
    try {
      // 检测视频大小与时长
      if (config.maxSize && config.maxSize !== 0 && videoInfo.videoData.data_size / 1024 / 1024 > config.maxSize) {
        ctx.logger.warn(`视频大小超过限制 (${config.maxSize}MB)，取消发送`);
        return;
      }
      if (config.maxDuration && config.maxDuration !== 0 && videoInfo.duration / 1000 > config.maxDuration) {
        ctx.logger.warn(`视频时长超过限制 (${config.maxDuration}秒)，取消发送`);
        return;
      }

      // 发送视频
      if (config.isCache) {
        // 缓存到内存后再发送
        try {
          const videoBuffer = await ctx.http.get<ArrayBuffer>(videoUrl, {
            responseType: 'arraybuffer',
          });
          
          // 直接发送视频buffer
          await session.send(h.video(Buffer.from(videoBuffer), 'video/mp4'));
        } catch (error) {
          ctx.logger.error('视频缓存发送失败，尝试直接发送链接:', error);
          // 如果缓存发送失败，回退到直接发送链接
          await session.send(h('video', { src: videoUrl }));
        }
      } else {
        // 直接发送视频链接
        await session.send(h('video', { src: videoUrl }));
      }
    } catch (error) {
      ctx.logger.error('发送视频失败:', error);
    }
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
          
          // 构建视频信息
          const videoInfo: VideoInfo = {
            desc: data.title,
            author: data.author.name,
            digg_count: 0,  // API没有这些信息
            share_count: 0,
            comment_count: 0,
            collect_count: 0,
            videoCover: data.cover_url,
            duration: 0,  // API没有时长信息
            videoData: {
              url_list: [data.video_url],
              data_size: 0  // API没有文件大小信息
            }
          };
          
          // 生成会话ID
          const sessionId = session.guildId || session.userId || 'default';
          
          // 尝试添加到合并队列
          const addedToMerge = addToMerge(sessionId, data, session, videoInfo);
          
          if (!addedToMerge) {
            // 如果没有启用合并转发，直接发送
            const videoTitle = 
              "标题：" + videoInfo.desc +
              "\n作者：" + videoInfo.author +
              "\n点赞数：" + videoInfo.digg_count +
              "\t  分享数：" + videoInfo.share_count +
              "\n评论数：" + videoInfo.comment_count +
              "\t  收藏数：" + videoInfo.collect_count +
              (config.isSendVideo ? "\n时长：" + formatMilliseconds(videoInfo.duration) +
               "\t  大小：" + (videoInfo.videoData.data_size / 1024 / 1024).toFixed(2) + "MB" : "");

            await session.send([
              h('quote', { id: session.messageId }),
              h('image', { src: videoInfo.videoCover }),
              videoTitle
            ]);

            // 如果启用视频发送，发送视频
            if (config.isSendVideo) {
              await sendVideo(session, videoInfo, data.video_url);
            }
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
