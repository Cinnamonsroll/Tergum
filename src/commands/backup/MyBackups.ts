import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";
import Backup from "../../database/models/Backup";

export default class MyBackups extends BaseCommand {
    constructor() {
        super({
            aliases: ["mybackups", "mbackups"],
            category: "backup",
            description: "View all the backups that you have",
            name: "backups",
            permissions: ["SEND_MESSAGES"],
            usage: "?backups",
        });
    };
    async run (client: BackupClient, message: Message, args: string[]) {
        const Backups = await Backup.find();
        const yourBackups = Backups.filter(data => data.owner === message.author.id);

        if (yourBackups.length < 1) return message.channel.send("You haven't made any backups yet!");
        try {
            await message.author.send(`You own ${yourBackups.length} backup(s).\n${yourBackups.map(data => `\`${data.name}\` - \`${data.code}\``).join(", ")}`)
        } catch (err) {
            return message.channel.send("Unable to send you DMs. Please make sure you have your DMs turned on for this server");
        }

        return message.channel.send("Check your DMs!");
    };
}