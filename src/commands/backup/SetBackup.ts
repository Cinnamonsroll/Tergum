import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";
import Backup from "../../database/models/Backup";

export default class SetBackup extends BaseCommand {
    constructor() {
        super({
            aliases: ["setbackup"],
            category: "backup",
            description: "Set a backup to a specific version of past backups. (Premium Only)",
            name: "setbackups",
            permissions: ["ADMINISTRATOR"],
            usage: "setbackups <start code> <target code>",
            cooldown: 120,
        });
    }
    async run (client: BackupClient, message: Message, args: string[], premium: number) {

        if (premium < 2) return message.channel.send("You can't use this command. Consider buying premium!");

        const parentBackupCode = args[0];
        const childBackupCode = args[1];

        if (!parentBackupCode && !childBackupCode) return message.channel.send("Please provide a parent backup code and restore state backup code");

        if (parentBackupCode === childBackupCode) return message.channel.send("You can't set a previous state to itself. Please make sure that the first backup code is the parent code and the second code is your previous state.");

        const parentBackup = await Backup.findOne({ code: parentBackupCode });
        const childBackup = await Backup.findOne({ code: childBackupCode });

        if (!parentBackup) return message.channel.send("That parent backup doesn't exist!");
        if (!childBackup) return message.channel.send("That previous state doesn't exist!");

        if (!parentBackup.parent) return message.channel.send("Make sure the first backup code you provide is a parent backup!");
        if (childBackup.parent) return message.channel.send("Make sure that the second backup code you provide is a previous state!");

        childBackup.previousStates = [];

        const previousStates = parentBackup.previousStates;
        const newParent = previousStates.splice(previousStates.indexOf(childBackup._id), 1);
        const oldParent = parentBackup._id;

        childBackup.parent = true;
        parentBackup.parent = false;

        // parentBackup.previousStates = [];

        childBackup.previousStates.push(oldParent);
        if (previousStates.length) childBackup.previousStates.push(previousStates[0]);
        parentBackup.previousStates = [];

        try {
            await parentBackup.updateOne(parentBackup);
            await childBackup.updateOne(childBackup);
        } catch (err) {
            return message.channel.send("Something went wrong while switching your parent backup");
        }
        message.author.send(`Your new parent code for \`${message.guild.name}\` is \`${childBackup.code}\``);
        return message.channel.send("Successfully switched your parent backup! Check your DM's for the new parent code!");

    }
}