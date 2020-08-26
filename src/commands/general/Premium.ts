import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";

export default class Premium extends BaseCommand {
    constructor() {
        super({
            name: "premium",
            aliases: [],
            category: "general",
            description: "View all the premium features for this bot and where to buy!",
            permissions: ["SEND_MESSAGES"],
            usage: "premium",
        });
    }
    async run (client: BackupClient, message: Message, args: string[]) {

    }
}