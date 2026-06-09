import { Context } from 'koishi';
import { Config } from '../index';
export declare function initApi(config: Config): void;
export declare function get(ctx: Context, path: string): Promise<any>;
