import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";
import Guild from "../../database/models/Guild";

export default class Prefix extends BaseCommand {
    constructor() {
        super({
            aliases: [],
            category: "general",
            description: "Change the bots prefix",
            name: "prefix",
            permissions: ["MANAGE_GUILD"],
            usage: "prefix <prefix>",
        });
    }

    async run(client: BackupClient, message: Message, args: string[]) {
        
        if (!args[0]) return message.channel.send("You can't set your prefix to nothing");
        
        let guild = await Guild.findOne({ id: message.guild.id });
        if (!guild) guild = new Guild({
            id: message.guild.id,
        });

        guild.prefix = args.join(" ");

        try {
            await guild.save();
            client.cachePrefixes(message.guild, args.join(" "));
        } catch (err) {
            return message.channel.send("There was an error trying to save your prefix to the database.");
        }

        return message.channel.send(`Successfully set your prefix to \`${args.join(" ")}\``);

    }
}