import { Message, PermissionResolvable } from "discord.js";
import BackupClient from "./BackupClient";

export abstract class BaseCommand {
    name: string;
    usage: string;
    aliases: Array<string>;
    category: "general" | "backup" | "owner";
    description: string;
    permissions: Array<PermissionResolvable>;
    enabled: boolean;
    ownerOnly: boolean;
    g_owner_only?: boolean;
    cooldown?: number;
    
    constructor(BaseCommandInfo: { 
        name: string;
        usage: string;
        aliases: string[];
        category: "general" | "backup" | "owner"; 
        description: string;
        permissions: PermissionResolvable[];
        enabled?: boolean;
        ownerOnly?: boolean;
        g_owner_only?: boolean;
        cooldown?: number;
    }) {

        this.name = BaseCommandInfo.name;
        this.usage = BaseCommandInfo.usage;
        this.aliases = BaseCommandInfo.aliases;
        this.description = BaseCommandInfo.description;
        this.permissions = BaseCommandInfo.permissions;
        this.enabled = BaseCommandInfo.enabled;
        this.category = BaseCommandInfo.category;
        this.ownerOnly = BaseCommandInfo.ownerOnly;
        this.g_owner_only = BaseCommandInfo.g_owner_only;
        this.cooldown = BaseCommandInfo.cooldown;
    };

    abstract async run(client: BackupClient, message: Message, args: Array<string>): Promise<any>;

}