import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message, MessageEmbed } from "discord.js";
import Backup from "../../database/models/Backup";

export default class PublicBackups extends BaseCommand {
    constructor() {
        super({
            aliases: ["publicbackups"],
            category: "backup",
            description: "View a list of some of the Public Backups others have created!",
            name: "pbackups",
            permissions: ["SEND_MESSAGES"],
            usage: "pbackups"
        });
    }
    async run (client: BackupClient, message: Message, args: string[]) {
        const AllBackups = await Backup.find();

        const PublicBackups = AllBackups.filter(backup => !backup.private);

        const embed = new MessageEmbed()
            for (const backup of PublicBackups) {
                embed.addField(backup.name, backup.code);
            };
        message.channel.send(embed);

    }
}