import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";

export default class SetBackup extends BaseCommand {
    constructor() {
        super({
            aliases: ["setbackup"],
            category: "backup",
            description: "Set a backup to a specific version of past backups. (Premium Only)",
            name: "setbackups",
            permissions: ["ADMINISTRATOR"],
            usage: "setbackups <start code> <target code>",
            cooldown: 60,
        });
    }
    async run (client: BackupClient, message: Message, args: string[], premium: number) {
        
    }
}