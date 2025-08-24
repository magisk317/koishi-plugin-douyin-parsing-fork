import { Context, Schema } from 'koishi';
export declare const name = "douyin-parsing-fork";
export declare const usage = "\uD83D\uDCE2 \u5B98\u65B9\u4EA4\u6D41\u7FA4\uFF1A767723753\n\n\u6B22\u8FCE\u52A0\u5165\u5B98\u65B9QQ\u7FA4\u4EA4\u6D41\u6280\u672F\u3001\u53CD\u9988\u95EE\u9898\u548C\u83B7\u53D6\u6700\u65B0\u66F4\u65B0\u4FE1\u606F\uFF01\n\n\uD83D\uDD17 \u5FEB\u901F\u52A0\u5165\uFF1Ahttps://qm.qq.com/q/tcTUHy0bm0\n\n\uD83D\uDCC8 Fork自: koishi-plugin-douyin-parsing by ixbai";
export interface Config {
    allowedGuilds: string[];
    enablePrivateChat: boolean;
    sendVideoAsLink: boolean;
    maxVideoSize: number;
    debug: boolean;
    filterHashtags: boolean;
    duplicateInterval: number;
    showWaitingMessage: boolean;
    enableMergeForward: boolean;
    mergeForwardDelay: number;
    mergeForwardMaxCount: number;
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context, config: Config): void;