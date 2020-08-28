import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";

export default class ScheduledUpdates extends BaseCommand {
    constructor() {
        super({
            aliases: ["supdates", "autoupdate"],
            category: "backup",
            description: "Start or stop auto updates for your servers backup.",
            name: "scheduleupdates",
            permissions: ["ADMINISTRATOR"],
            usage: "scheduleupdates <on/off>",
            cooldown: 120,
        });
    }
    async run (client: BackupClient, message: Message, args: string[], premium: number) {

    }
}