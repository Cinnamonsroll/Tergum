import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import Backup from "../../database/models/Backup";

export default class DeleteBackup extends BaseCommand {
    constructor() {
        super({
            aliases: ["deletebackup", "backupd", "backupdelete"],
            category: "backup",
            description: "Delete a backup that is stored in the database.",
            name: "dbackup",
            permissions: ["ADMINISTRATOR"],
            usage: "dbackup <code>",
            g_owner_only: true,
            examples: [
                "?dbackup qweRtyAsdF"
            ]
        });
    }
    async run (client: BackupClient, message: Message, args: string[]) {
        const code = args[0];

        const backup = await Backup.findOne({ code });

        if (!backup) return message.channel.send("You can't delete a backup that doesn't exist!");

        if (message.author.id !== backup.owner) return message.channel.send("You can't delete someone elses backup!");

        const deleteEmbed = new MessageEmbed()
            .setAuthor("Are you sure you want to delete your Backup?", message.author.displayAvatarURL({ format: "png" }))
            .setColor(client.colors.noColor)
            .setDescription("This will **permanently** remove the backup from the database and is **irreversible**. Are you sure you want to continue?\n\n ✅ Continue | ❌ Cancel");
        const msg = await message.channel.send(deleteEmbed);

        await Promise.all([msg.react("✅"), msg.react("❌")]);

        const filter = (reaction: MessageReaction, user: User) => user.id === message.author.id && ["✅", "❌"].includes(reaction.emoji.name);
        const response = await msg.awaitReactions(filter, { max: 1, time: 30000, errors: ["time"] });

        if (response) {
            const reaction = response.first();

            switch (reaction.emoji.name) {
                case "✅":
                    await msg.delete();
                    try {
                        await backup.deleteOne()
                    } catch (err) {
                        return message.channel.send("Something went wrong while deleting the backup from the database. Please try again later");
                    }
                    message.channel.send("Successfully deleted your backup from the database!");
                break;

                case "❌":
                    await msg.delete();
                    message.channel.send("Successfully cancelled deletion of your backup.");
                break;
            }
        }
    }
}