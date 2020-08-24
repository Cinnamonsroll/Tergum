import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";

export default class Prefix extends BaseCommand {
    constructor() {
        super({
            aliases: [],
            category: "general",
            description: "Change the bots prefix",
            name: "prefix",
            permissions: ["MANAGE_GUILD"],
            usage: "?prefix <prefix>",
        });
    }

    async run(client: BackupClient, message: Message, args: string[]) {
        return message.channel.send("Bruh")
    }
}