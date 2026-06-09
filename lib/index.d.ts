import { Context, Schema } from 'koishi';
export declare const name = "ap-api";
export declare const inject: {
    required: string[];
};
export interface Config {
    apiUrl: string;
    apiPrefix: string;
    apiKey: string;
}
export declare const Config: Schema<Config>;
export declare function apply(ctx: Context, config: Config): void;
