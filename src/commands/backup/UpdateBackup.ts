import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";
import Backup from "../../database/models/Backup";

export default class UpdateBackup extends BaseCommand {
    constructor() {
        super({
            aliases: ["updatebackup", "backupu", "backupupdate"],
            category: "backup",
            description: "Update a server backup by Code",
            name: "ubackup",
            permissions: ["ADMINISTRATOR"],
            usage: "?ubackup <code>",
            g_owner_only: true,
        });
    }
    async run (client: BackupClient, message: Message, args: string[]) {

        const code = args[0];

        const backup = await Backup.findOne({ code });

        if (!backup) return message.channel.send("You can't update a backup that doesn't exist!");

        if (message.author.id !== backup.owner) return message.channel.send("You can't update someone elses backup!");

        if (message.guild.id !== backup.originalServer) return message.channel.send("You can't update a backup in a new server!");

        

    };
}