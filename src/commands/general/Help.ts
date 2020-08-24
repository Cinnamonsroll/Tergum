import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";

export default class HelpCommand extends BaseCommand {
    constructor() {
        super({
            aliases: ["halp", "commands"],
            category: "general",
            description: "Get help for the bot!",
            name: "help",
            permissions: ["SEND_MESSAGES"],
            usage: "?help",
        });
    }

    async run(client: BackupClient, message: Message, args: string[]) {
        return message.channel.send("whatatheiohrsadhasiol")
    }
}