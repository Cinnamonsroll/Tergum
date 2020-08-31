import { MessageEmbed, MessageAttachment, Snowflake, PermissionResolvable, ColorResolvable } from "discord.js";

export default interface BackupData {

    channels: {
        name: string;
        position: number;
        type: "text" | "voice" | "category" | "news" | "store" | "unknown";
        nsfw: boolean | undefined;
        parent: string | undefined;
        topic: string | undefined;
        rateLimit: number | undefined;
        userLimit: number | undefined;
        bitrate: number | undefined;
        oldId: Snowflake;

        messages?: {
            content: string;
            embed?: MessageEmbed[] | null;
            authr: string;
            avatar: string;
            attachment?: MessageAttachment[] | null;
        }[];

        rolePermissions: {
            roleName: Snowflake | undefined;
            permission: {
                deny: PermissionResolvable;
                allow: PermissionResolvable;
            };
        }[];
    }[];

    roles: {
        name: string;
        permission: PermissionResolvable;
        position: number;
        color: ColorResolvable;
        mentionable: boolean;
        hoist: boolean;
    }[];

    emojis: {
        name: string;
        url: string;
    }[];

    bans: {
        user: Snowflake;
        reason: string;
    }[];

    members: {
        id: Snowflake;
        nickname: string | null;
        roles: {
            name: string;
        }[];    
    }[];
}