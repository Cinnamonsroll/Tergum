import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message, MessageEmbed } from "discord.js";
import Backup from "../../database/models/Backup";

export default class Ping extends BaseCommand {
    constructor() {
        super({
            aliases: ["pong"],
            category: "general",
            description: "Check the bots message and API latency",
            name: "ping",
            permissions: ["SEND_MESSAGES"],
            usage: "?ping",
        });
    }
    async run (client: BackupClient, message: Message, args: string[]) {
        const embed = new MessageEmbed()
            .setAuthor("Ping?", client.user.displayAvatarURL({ format: "png" }))
            .setColor(client.colors.noColor);
        const m = await message.channel.send(embed);

        embed.setAuthor(`Ping! My message latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${client.ws.ping}ms`);
        m.edit(embed);
    }
}