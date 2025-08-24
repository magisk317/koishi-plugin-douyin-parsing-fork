import { Context, Schema } from 'koishi';
export declare const name = "douyin-parsing-fork";
export declare const usage = "\uD83D\uDCC8 Fork自: koishi-plugin-douyin-parsing by ixbai";
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