import { Context, Schema } from 'koishi';
export declare const name: string;
export declare const usage: string;

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

export declare const Config: import("koishi").Schema<Config>;
export declare function apply(ctx: import("koishi").Context, config: Config): void;