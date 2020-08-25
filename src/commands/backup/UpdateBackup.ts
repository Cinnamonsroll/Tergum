import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import Backup from "../../database/models/Backup";

export default class UpdateBackup extends BaseCommand {
    constructor() {
        super({
            name: "ubackup",
            aliases: ["updatebackup", "backupu", "backupupdate"],
            category: "backup",
            description: "Update a server backup by Code",
            permissions: ["ADMINISTRATOR"],
            usage: "ubackup <code>",
            g_owner_only: true,
        });
    }
    async run (client: BackupClient, message: Message, args: string[]) {

        const code = args[0];

        const backup = await Backup.findOne({ code });

        if (!backup) return message.channel.send("You can't update a backup that doesn't exist!");

        if (message.author.id !== backup.owner) return message.channel.send("You can't update someone elses backup!");

        if (message.guild.id !== backup.originalServer) return message.channel.send("You can't update a backup in a new server!");

        let messageFlag = false;
        let roleFlag = false;
        let rolePermFlag = false;
        let channelsFlag = false;
        let channelPermFlag = false;
        let emojisFlag = false;
        let serverNameFlag = false;
        let serverIconFlag = false;
        let serverSettingsFlag = false;
        // let deleteOld = false;

        const settingsEmbed = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png" }))
            .setFooter("Choose your prefered backup update settings with the reactions below")
            .setTitle("Update Settings")
            .setDescription(`1️⃣ Roles: ${roleFlag ? "On" : "Off"}\n${roleFlag ? `╚⇒2️⃣ Role Permissions: ${rolePermFlag ? "On" : "Off"}` : ""}\n3️⃣ Channels: ${channelsFlag ? "On" : "Off"}\n${channelsFlag && roleFlag ? `╠⇒ 4️⃣ Channel Permissions: ${channelPermFlag ? "On" : "Off"}\n` : ""}${channelsFlag ? `╚⇒ 5️⃣ Channel Messages: ${messageFlag ? "On" : "Off"}` : ""}\n6️⃣ Emojis: ${emojisFlag ? "On" : "Off"}\n7️⃣ Server Name: ${serverNameFlag ? "On" : "Off"}\n8️⃣ Server Icon: ${serverIconFlag ? "On" : "Off"}\n9️⃣ Server Settings: ${serverSettingsFlag ? "On" : "Off"}\n\n ✅ Start Update | ❌ Cancel Update`);
        const settings = await message.channel.send(settingsEmbed);

        await Promise.all([ settings.react("1️⃣"), settings.react("2️⃣"), settings.react("3️⃣"), settings.react("4️⃣"), settings.react("5️⃣"), settings.react("6️⃣"), settings.react("7️⃣"), settings.react("8️⃣"), settings.react("9️⃣")/*, settings.react("🔟")*/, settings.react("✅"), settings.react("❌") ]);

        const filter = (reaction: MessageReaction, user: User): boolean => message.author.id === user.id && ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"/*, "🔟"*/, "✅", "❌"].includes(reaction.emoji.name); 

        const collector = settings.createReactionCollector(filter, { time: 1000 * 60 * 5 });

        collector.on("collect", async (reaction, _) => {
            switch (reaction.emoji.name) {
                case "1️⃣":
                    console.log("case 1")
                    roleFlag = !roleFlag;
                    if (!roleFlag) {
                        rolePermFlag = false;
                        channelPermFlag = false;
                    }
                break;
                case "2️⃣":
                    if (!roleFlag) {
                        reaction.users.remove(_.id);
                        return message.channel.send("You can't modify this setting unless you enable Roles! (1️⃣)").then(m => m.delete({ timeout: 10000 }));
                    }
                    rolePermFlag = !rolePermFlag;
                break;
                case "3️⃣":
                    channelsFlag = !channelsFlag;
                    if (!channelsFlag) {
                        channelPermFlag = false;
                        messageFlag = false;
                    }
                break;
                case "4️⃣":
                    if (!channelsFlag || !roleFlag) {
                        reaction.users.remove(_.id);
                        return message.channel.send(!channelsFlag && !roleFlag ? `You can't modify this setting unless you enable Channels and Roles! (3️⃣) + (1️⃣)` : !channelsFlag ? `You can't modify this setting unless you enable Channels! (3️⃣)` : `You can't modify this setting unless you enable Roles! (1️⃣)`).then(m => m.delete({ timeout: 10000 }));
                    }
                    channelPermFlag = !channelPermFlag;
                break;
                case "5️⃣":
                    if (!channelsFlag) {
                        reaction.users.remove(_.id);
                        return message.channel.send("You can't modify this setting unless you enable Channels! (3️⃣)").then(m => m.delete({ timeout: 10000 }));
                    }
                    messageFlag = !messageFlag;
                break;
                case "6️⃣":
                    emojisFlag = !emojisFlag;
                break;
                case "7️⃣":
                    serverNameFlag = !serverNameFlag;
                break;
                case "8️⃣":
                    serverIconFlag = !serverIconFlag;
                break;
                case "9️⃣":
                    serverSettingsFlag = !serverSettingsFlag;
                break;
                // case "🔟":
                //     deleteOld = !deleteOld;
                // break;
                case "✅":
                if (!messageFlag && !roleFlag && !rolePermFlag && !channelsFlag && !channelPermFlag && !emojisFlag && !serverNameFlag && !serverIconFlag && !serverSettingsFlag /*&& !deleteOld*/) {
                    reaction.users.remove(_.id);
                    return message.channel.send("You can't start your server restore with no settings selected!").then(m => m.delete({ timeout: 10000 }));
                }
                return collector.stop("success+");
                case "❌":
                return collector.stop("cancelled");
            }

            reaction.users.remove(_.id);

            settingsEmbed.setDescription(`1️⃣ Roles: ${roleFlag ? "On" : "Off"}\n${roleFlag ? `╚⇒2️⃣ Role Permissions: ${rolePermFlag ? "On" : "Off"}` : ""}\n3️⃣ Channels: ${channelsFlag ? "On" : "Off"}\n${channelsFlag && roleFlag ? `╠⇒ 4️⃣ Channel Permissions: ${channelPermFlag ? "On" : "Off"}\n` : ""}${channelsFlag ? `╚⇒ 5️⃣ Channel Messages: ${messageFlag ? "On" : "Off"}` : ""}\n6️⃣ Emojis: ${emojisFlag ? "On" : "Off"}\n7️⃣ Server Name: ${serverNameFlag ? "On" : "Off"}\n8️⃣ Server Icon: ${serverIconFlag ? "On" : "Off"}\n9️⃣ Server Settings: ${serverSettingsFlag ? "On" : "Off"}\n\n ✅ Start Backup | ❌ Cancel Backup`);
            settings.edit(settingsEmbed);

        });

        collector.on("end", async (_, reason) => {
            if (reason !== "success+") {
                settingsEmbed.setDescription("Cancelled Restore").setTitle("").setFooter("Cancelled");
                return settings.edit(settingsEmbed);
            }

            settings.delete();

            if (roleFlag) {
                
            }

        });

    };
}