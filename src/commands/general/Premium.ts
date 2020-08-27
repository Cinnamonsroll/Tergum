import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message, MessageEmbed } from "discord.js";

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
        const premiumEmbed = new MessageEmbed()
            .setAuthor("Premium Features", client.user.displayAvatarURL({ format: "png" })) 
            .setDescription(`**What do you get access to when you buy premium?**\n\`\`\`diff\n- Maximum of 2 Backups\n+ Unlimited Backups\n\n- Only 10 Messages Backed up per Text Channel\n+ Full 100 Message Backup per Text Channel\n\n- Manual Backup Updating Only\n+ Auto Updating Backups\n\n- No Banned Member Backups\n+ Banned Member Backups\`\`\``)
            .setColor(client.colors.noColor);
        message.channel.send(premiumEmbed);
    }
}