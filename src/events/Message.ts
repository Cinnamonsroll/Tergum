import { Message as Msg } from "discord.js";
import BaseEvent from "../util/structures/BaseEvent";
import BackupClient from "../util/structures/BackupClient";
import { BaseCommand } from "../util/structures/BaseCommand";
import Pinged from "../util/checks/Pinged";

export default class Message extends BaseEvent {
    constructor() {
        super({
            name: "message",
        });
    }
    async run (client: BackupClient, message: Msg) {

        if (!message.guild) return;
        if (message.author.bot) return;

        const prefix = client.getPrefix(client, message.guild);

        const pinged = new Pinged(message, "equal", client);
        if (pinged.check()) return message.channel.send(`My prefix is set to \`${prefix}\` in \`${message.guild.name}\``);

        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();

        const commandFile: BaseCommand = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));

        if (commandFile) {
            if (commandFile.g_owner_only && message.author.id !== message.guild.ownerID) return message.channel.send("This command is locked to guild owner only.");
            return commandFile.run(client, message, args);
        }

    }
}