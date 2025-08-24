import { Context, Schema } from 'koishi';
export declare const name: string;
export declare const usage: string;

export interface Config {
  enableMergeForward: boolean;
  mergeDelay: number;
  maxMergeCount: number;
  debug: boolean;
}

export declare const Config: import("koishi").Schema<Config>;
export declare function apply(ctx: import("koishi").Context, config: Config): void;