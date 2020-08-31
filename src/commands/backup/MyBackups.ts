import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import Backup from "../../database/models/Backup";

export default class MyBackups extends BaseCommand {
    constructor() {
        super({
            aliases: ["mybackups", "mbackups"],
            category: "backup",
            description: "View all the backups that you have",
            name: "backups",
            permissions: ["SEND_MESSAGES"],
            usage: "backups",
        });
    };
    async run (client: BackupClient, message: Message, args: string[]) {
        const Backups = await Backup.find();
        const yourBackups = Backups.filter(data => data.owner === message.author.id);

        if (yourBackups.length < 1) return message.channel.send("You haven't made any backups yet!");

        const parentBackups = yourBackups.filter(data => data.parent);
    
        const sendData: { 
            parent: string, 
            parentCode: string, 
            childrenCodes: { 
                code: string, 
                date: Date 
            }[] 
        }[] = [];

        for (const backup of parentBackups) {
            let backupCodes = [];
            for (const id of backup.previousStates) {
                const oldBackup = await Backup.findById(id);
                backupCodes.push({ code: oldBackup.code, date: oldBackup.date });
            }
            sendData.push({ parent: backup.name, parentCode: backup.code, childrenCodes: backupCodes.reverse() });
        }

        const splitData = [];

        for (let i = 0; i < sendData.length; i += 5) {
            splitData.push(sendData.slice(i, i + 5));
        }

        let page = 0;

        try {
            const embed = new MessageEmbed()
                .setAuthor("Your Backup Codes", message.author.displayAvatarURL({ format: "png" }))
                .setColor(client.colors.noColor)
                .setFooter(`${splitData.length > 1 ? `Page ${page + 1}/${splitData.length} - ` : ""}You have ${parentBackups.length} backup(s)`)
                for (const data of splitData[page]) {
                    embed.addField(data.parent, `${data.childrenCodes.length > 0 ? "Parent" : ""} Code: \`${data.parentCode}\` ${data.childrenCodes.length > 0 ? `\nBackup Restore States:\n${data.childrenCodes.map((child: { code: string, date: Date }) => ` [\`${child.code}\` at ${child.date.toLocaleString()}]`).join("\n")}` : ""}`)
                }
            const msg = await message.author.send(embed);

            if (splitData.length > 1) {
                await Promise.all([msg.react("◀️"), msg.react("▶️")]);

                const filter = (reaction: MessageReaction, user: User) => user.id === message.author.id && ["◀️", "▶️"].includes(reaction.emoji.name);

                const collector = msg.createReactionCollector(filter, { time: 60000 * 5 });

                collector.on("collect", (reaction, user) => {
                    switch (reaction.emoji.name) {
                        case "◀️":
                            if (page > 0) {
                                page--;
                                const Embed = new MessageEmbed()
                                    .setAuthor("Your Backup Codes", message.author.displayAvatarURL({ format: "png" }))
                                    .setColor(client.colors.noColor)
                                    .setFooter(`${splitData.length > 1 ? `Page ${page + 1}/${splitData.length} - ` : ""}You have ${parentBackups.length} backup(s)`)
                                    for (const data of splitData[page]) {
                                        Embed.addField(data.parent, `${data.childrenCodes.length > 0 ? "Parent" : ""} Code: \`${data.parentCode}\` ${data.childrenCodes.length > 0 ? `\nBackup Restore States:\n${data.childrenCodes.map((child: { code: string, date: Date }) => ` [\`${child.code}\` at ${child.date.toLocaleString()}]`).join("\n")}` : ""}`)
                                    }
                                return msg.edit(Embed);
                            }
                        break;
                        case "▶️":
                            if (page < splitData.length - 1) {
                                page++;
                                const Embed = new MessageEmbed()
                                    .setAuthor("Your Backup Codes", message.author.displayAvatarURL({ format: "png" }))
                                    .setColor(client.colors.noColor)
                                    .setFooter(`${splitData.length > 1 ? `Page ${page + 1}/${splitData.length} - ` : ""}You have ${parentBackups.length} backup(s)`)
                                    for (const data of splitData[page]) {
                                        Embed.addField(data.parent, `${data.childrenCodes.length > 0 ? "Parent" : ""} Code: \`${data.parentCode}\` ${data.childrenCodes.length > 0 ? `\nBackup Restore States:\n${data.childrenCodes.map((child: { code: string, date: Date }) => ` [\`${child.code}\` at ${child.date.toLocaleString()}]`).join("\n")}` : ""}`)
                                    }
                                return msg.edit(Embed);
                            }
                        break;
                    }
                });

            }
            // await message.author.send(`You have ${parentBackups.length} backups: ${sendData.map(data => `Server: ${data.parent} - ${data.parentCode}${data.childrenCodes ? ` ~ ${data.parent}'s Old States: ${data.childrenCodes.map(child => ` [${child.code} - ${child.date.toLocaleString()}]`)}` : ""}`)}`)
        } catch (err) {
            console.log(err);
            return message.channel.send("Unable to send you DMs. Please make sure you have your DMs turned on for this server");
        }

        return message.channel.send("Check your DMs!");
    };
}
