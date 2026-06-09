import { Context } from 'koishi';
export declare function getBoundUid(ctx: Context, userId: string): Promise<string | null>;
export declare function bindUid(ctx: Context, userId: string, uid: string): Promise<void>;
