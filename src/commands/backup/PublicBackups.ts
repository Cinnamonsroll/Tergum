import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
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

        const Backups = [];

        let i = 0;
        do {
            const random = Math.floor(Math.random() * PublicBackups.length);
            const toPush = PublicBackups.splice(random, 1)[0];
            Backups.push(toPush);
            i++;
        } while (i < 20);

        
        const len = Backups.length;
        for (let j = 0; j < len; j++) {
            if (!Backups[j]) Backups.splice(Backups.indexOf(Backups[j]), 1);
        }

        const splitData = [];
        let page = 0;

        for (let k = 0; k < Backups.length; k += 5) {
            splitData.push(Backups.slice(k, k + 5));
        }



        const embed = new MessageEmbed()
            .setColor(client.colors.noColor)
            .setAuthor("Public Backups", client.user.displayAvatarURL({ format: "png" }))
                for (const backup of splitData[page]) {
                    embed.addField(backup.name, backup.code);
                };
            embed.setFooter(`Page ${page + 1}/${splitData.length}` + `${splitData.length > 1 ? " - Use ◀️ and ▶️ to navigate the public backups pages!" : ""}`)
        const msg = await message.channel.send(embed);

        if (splitData.length > 1) {
            await Promise.all([msg.react("◀️"), msg.react("▶️")]);

            const filter = (reaction: MessageReaction, user: User) => user.id === message.author.id && ["◀️", "▶️"].includes(reaction.emoji.name);

            const collector = msg.createReactionCollector(filter, { time: 1000 * 60 });

            collector.on("collect", (reacion, user) => {

                reacion.users.remove(user.id);

                switch (reacion.emoji.name) {
                    case "◀️":
                        if (page > 0) {
                            page--
                            const membed = new MessageEmbed()
                            .setColor(client.colors.noColor)
                            .setAuthor("Public Backups", client.user.displayAvatarURL({ format: "png" }))
                            .setFooter(`Page ${page + 1}/${splitData.length}` + `${splitData.length > 1 ? " - Use ◀️ and ▶️ to navigate the public backups pages!" : ""}`)
                            for (const backup of splitData[page]) {
                                membed.addField(backup.name, backup.code);
                            }
                            msg.edit(membed);
                        }

                    break;
                    case "▶️":
                        if (page < splitData.length - 1) {
                            page++
                            const membed = new MessageEmbed()
                            .setColor(client.colors.noColor)
                            .setAuthor("Public Backups", client.user.displayAvatarURL({ format: "png" }))
                            .setFooter(`Page ${page + 1}/${splitData.length}` + `${splitData.length > 1 ? " - Use ◀️ and ▶️ to navigate the public backups pages!" : ""}`)
                            for (const backup of splitData[page]) {
                                membed.addField(backup.name, backup.code);
                            }
                            msg.edit(membed);
                        }
                    break;
                }

            });

        }
    }
}