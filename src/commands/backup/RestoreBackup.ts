import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message, TextChannel, WebhookClient, User, MessageReaction, MessageEmbed } from "discord.js";
import Backups from "../../database/models/Backup";
import sleep from "../../util/functions/Sleep";

export default class RestoreBackup extends BaseCommand {
    constructor() {
        super({
            category: "backup",
            description: "Restore a backup by backup code",
            name: "rbackup",
            permissions: ["ADMINISTRATOR"],
            usage: "rbackup <code>",
            aliases: ["restorebackup", "backupr", "backuprestore"],
            g_owner_only: true,
        });
    }
    async run (client: BackupClient, message: Message, args: string[], premium: number) {
        const code = args[0];
        
        const Backup = await Backups.findOne({ code });
        if (!Backup) return message.channel.send("That backup doesn't exist!");

        if (Backup.private && message.author.id !== Backup.owner) return message.channel.send("You can't use this private backup!");

        let messageFlag = false;
        let roleFlag = false;
        let rolePermFlag = false;
        let channelsFlag = false;
        let channelPermFlag = false;
        let emojisFlag = false;
        let serverNameFlag = false;
        let serverIconFlag = false;
        let serverSettingsFlag = false;
        let bansFlag = false;
        let membersFlag = false;
        let deleteOld = false;
        let all = false;


        const settingsEmbed = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ format: "png" }))
            .setFooter("Choose your prefered backup restore settings with the reactions below")
            .setTitle("Backup Restore Settings")
            .setColor(client.colors.noColor)
            .setDescription(`1️⃣ Roles: ${roleFlag ? "On" : "Off"}\n${roleFlag ? `╚⇒2️⃣ Role Permissions: ${rolePermFlag ? "On" : "Off"}` : ""}\n3️⃣ Channels: ${channelsFlag ? "On" : "Off"}\n${channelsFlag && roleFlag ? `╠⇒ 4️⃣ Channel Permissions: ${channelPermFlag ? "On" : "Off"}\n` : ""}${channelsFlag ? `╚⇒ 5️⃣ Channel Messages: ${messageFlag ? "On" : "Off"}` : ""}\n6️⃣ Emojis: ${emojisFlag ? "On" : "Off"}\n7️⃣ Server Name: ${serverNameFlag ? "On" : "Off"}\n8️⃣ Server Icon: ${serverIconFlag ? "On" : "Off"}\n9️⃣ Server Settings: ${serverSettingsFlag ? "On" : "Off"}\n🔟 Delete Old Settings: ${deleteOld ? "On" : "Off"}\n${premium >= 2 ? bansFlag ? "⛔ Server Bans: On\n" : "⛔ Server Bans: Off\n" : ""}➕ Toggle All Options\n\n ✅ Start Backup | ❌ Cancel Backup`);
        const settings = await message.channel.send(settingsEmbed);

        if (premium < 2) await Promise.all([ settings.react("1️⃣"), settings.react("2️⃣"), settings.react("3️⃣"), settings.react("4️⃣"), settings.react("5️⃣"), settings.react("6️⃣"), settings.react("7️⃣"), settings.react("8️⃣"), settings.react("9️⃣"), settings.react("🔟"), settings.react("➕"), settings.react("✅"), settings.react("❌") ]);
        else await Promise.all([ settings.react("1️⃣"), settings.react("2️⃣"), settings.react("3️⃣"), settings.react("4️⃣"), settings.react("5️⃣"), settings.react("6️⃣"), settings.react("7️⃣"), settings.react("8️⃣"), settings.react("9️⃣"), settings.react("🔟"), settings.react("⛔"), settings.react("➕"), settings.react("✅"), settings.react("❌") ]);

        const filter = (reaction: MessageReaction, user: User): boolean => message.author.id === user.id && ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟", "➕", "⛔", "✅", "❌"].includes(reaction.emoji.name); 

        const collector = settings.createReactionCollector(filter, { time: 1000 * 60 * 5 });


        collector.on("collect", (reaction, _) => {
            switch (reaction.emoji.name) {
                case "1️⃣":
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
                case "🔟":
                    deleteOld = !deleteOld;
                break;
                case "➕":
                    if (!all) {
                        all = true;
                        messageFlag = true;
                        roleFlag = true;
                        rolePermFlag = true;
                        channelsFlag = true;
                        channelPermFlag = true;
                        emojisFlag = true;
                        serverNameFlag = true;
                        serverIconFlag = true;
                        serverSettingsFlag = true;
                        deleteOld = true;

                        if (premium >= 2) bansFlag = true;

                    } else {
                        all = false;
                        messageFlag = false;
                        roleFlag = false;
                        rolePermFlag = false;
                        channelsFlag = false;
                        channelPermFlag = false;
                        emojisFlag = false;
                        serverNameFlag = false;
                        serverIconFlag = false;
                        serverSettingsFlag = false;
                        deleteOld = false;

                        if (premium >= 2) bansFlag = false;
                    }
                break;
                case "⛔":
                    if (premium >= 2) {
                        bansFlag = !bansFlag;
                    }
                break;
                case "✅":
                if (!messageFlag && !roleFlag && !rolePermFlag && !channelsFlag && !channelPermFlag && !emojisFlag && !serverNameFlag && !serverIconFlag && !serverSettingsFlag && !deleteOld) {
                    reaction.users.remove(_.id);
                    return message.channel.send("You can't start your server restore with no settings selected!").then(m => m.delete({ timeout: 10000 }));
                }
                return collector.stop("success+");
                case "❌":
                return collector.stop("cancelled");
            }

            reaction.users.remove(_.id);

            settingsEmbed.setDescription(`1️⃣ Roles: ${roleFlag ? "On" : "Off"}\n${roleFlag ? `╚⇒2️⃣ Role Permissions: ${rolePermFlag ? "On" : "Off"}` : ""}\n3️⃣ Channels: ${channelsFlag ? "On" : "Off"}\n${channelsFlag && roleFlag ? `╠⇒ 4️⃣ Channel Permissions: ${channelPermFlag ? "On" : "Off"}\n` : ""}${channelsFlag ? `╚⇒ 5️⃣ Channel Messages: ${messageFlag ? "On" : "Off"}` : ""}\n6️⃣ Emojis: ${emojisFlag ? "On" : "Off"}\n7️⃣ Server Name: ${serverNameFlag ? "On" : "Off"}\n8️⃣ Server Icon: ${serverIconFlag ? "On" : "Off"}\n9️⃣ Server Settings: ${serverSettingsFlag ? "On" : "Off"}\n🔟 Delete Old Settings: ${deleteOld ? "On" : "Off"}\n${premium >= 2 ? bansFlag ? "⛔ Server Bans: On\n" : "⛔ Server Bans: Off\n" : ""}➕ Toggle All Options\n\n ✅ Start Backup | ❌ Cancel Backup`);
            settings.edit(settingsEmbed);
        });

        collector.on("end", async (__, reason) => {

            if (reason !== "success+") {
                settingsEmbed.setDescription("Cancelled Restore").setTitle("").setFooter("Cancelled");
                return settings.edit(settingsEmbed);
            }

            settings.delete();

            //@ts-ignore
            message.channel.setName(`restoring-backup-${Backup.code}`);

            // Set server name and icon
            if (serverNameFlag) {
                message.guild.setName(Backup.name);
            }
            if (serverIconFlag) {
                message.guild.setIcon(Backup.icon);
            }

            const sendMe = await message.channel.send("<a:loading3:709992480757776405> Restoring your server backup. Please wait... This can take several minutes... " + `${deleteOld ? "Deleting old settings..." : "Loading in roles..."}`);


            // Delete old settings
            if (deleteOld) {
                // if (channelsFlag) {
                    for (const [__, channel] of message.guild.channels.cache) {
                        if (message.channel.id !== channel.id) {
                            message.guild.channels.cache.get(channel.id).delete();
                            await sleep(450);
                        }
                    }
                // }

                // if (roleFlag) {
                    for (const [__, role] of message.guild.roles.cache) {
                        if (message.guild.id !== role.id) {
                            if (!role.managed) {
                                message.guild.roles.cache.get(role.id).delete().catch(err => console.log(err));
                                await sleep(500);
                            }
                        }
                    }
                // }

                // for (const [__, emoji] of message.guild.emojis.cache) {
                //     message.guild.emojis.cache.get(emoji.id).delete();
                //     await sleep(500);
                // }
            }


            // Load in roles
            if (roleFlag) {
                sendMe.edit("<a:loading3:709992480757776405> Restoring your server backup. Please wait... This can take several minutes... " + "Loading in roles...");
                for (const role of Backup.data.roles) {
                    if (role.name !== "@everyone") {

                        await message.guild.roles.create({
                            data: {
                                name: role.name,
                                color: role.color,
                                hoist: role.hoist,
                                mentionable: role.mentionable,
                                permissions: rolePermFlag ? role.permission : 0,
                            }
                        });
                    }  else {
                        await message.guild.roles.cache.get(message.guild.id).setPermissions(role.permission);
                    }
                    await sleep(1000);
                }
            }


            // Load in channels
            if (channelsFlag) {
                sendMe.edit(`<a:loading3:709992480757776405> Restoring your server backup. Please wait... This can take several minutes... Loading in channels${messageFlag ? " and their messages..." : "..."}`);
                for (const channel of Backup.data.channels) {

                    const overwrites = [];
                    if (channelPermFlag) {
                        if (roleFlag) {
                            for (const perm of channel.rolePermissions) {
                                let role = message.guild.roles.cache.find(role => role.name === perm.roleName);
                                if (role) {
                                    overwrites.push({
                                        id: role.id,
                                        allow: perm.permission.allow,
                                        deny: perm.permission.deny,
                                    });
                                }
                            }
                        }
                    }

                    //@ts-ignore
                    const createdChannel: TextChannel = await message.guild.channels.create(channel.name, {
                        //@ts-ignore
                        type: channel.type === "news" ? "text" : channel.type,
                        nsfw: channel.nsfw,
                        bitrate: channel.bitrate,
                        topic: channel.topic,
                        userLimit: channel.userLimit,
                        rateLimitPerUser: channel.rateLimit,
                        permissionOverwrites: overwrites,
                    });

                    if (channel.parent) {
                        createdChannel.setParent(message.guild.channels.cache.find(chan => chan.name === channel.parent).id);
                    }
                    createdChannel.setPosition(channel.position);
                    //@ts-ignore
                    channel.tempId = createdChannel.id;

                    await sleep(100);
                }
            }


            // Load in each channels messages
            if (messageFlag && channelsFlag) {
                Backup.data.channels.forEach(async channel => {
                    if (channel.type === "text" || channel.type === "news") {
                        //@ts-ignore
                        const chtosend = message.guild.channels.cache.get(channel.tempId);
                        //@ts-ignore
                        const webhook = await chtosend.createWebhook("Captain Hook");

                        const wbhkClient = new WebhookClient(webhook.id, webhook.token);

                        channel.messages.forEach((msg, index) => {
                            setTimeout(async () => {

                                await wbhkClient.send(msg.content, {
                                    username: msg.authr,
                                    avatarURL: msg.avatar,
                                    embeds: msg.embed,
                                    files: msg.attachment,
                                    disableMentions: "everyone",
                                });

                            }, 2000 * index);
                        });
                    }
                });
            }

            // Load in emojis
            if (emojisFlag) {
                sendMe.edit("<a:loading3:709992480757776405> Restoring your server backup. Please wait... This can take several minutes... Loading in Emojis...")
                for (const emoji of Backup.data.emojis) {
                    message.guild.emojis.create(emoji.url, emoji.name);
                    await sleep(1000);
                }
            }

            // Load in server settings
            if (serverSettingsFlag) { // Very messy right now, i know, its like 3AM right now, I'll make it nicer later
                if (channelsFlag && Backup.settings.afkChannel) message.guild.setAFKChannel(message.guild.channels.cache.find(ch => ch.name === Backup.settings.afkChannel).id);
                await sleep(200);
                if (Backup.settings.afkTimeout) message.guild.setAFKTimeout(Backup.settings.afkTimeout);
                await sleep(200);
                if (Backup.settings.banner) message.guild.setBanner(Backup.settings.banner).catch(err => console.log(err));
                await sleep(200);
                if (Backup.settings.defaultMsgNotis) message.guild.setDefaultMessageNotifications(Backup.settings.defaultMsgNotis);
                await sleep(200);
                if (Backup.settings.discoverySplash) message.guild.setDiscoverySplash(Backup.settings.discoverySplash).catch(err => console.log(err));
                await sleep(200);
                if (Backup.settings.preferredLocale) message.guild.setPreferredLocale(Backup.settings.preferredLocale);
                await sleep(200);
                if (Backup.settings.region) message.guild.setRegion(Backup.settings.region);
                await sleep(200);
                if (Backup.settings.splash) message.guild.setSplash(Backup.settings.splash).catch(err => console.log(err));
                await sleep(200);
                if (Backup.settings.verificationLevel) message.guild.setVerificationLevel(Backup.settings.verificationLevel); 
            }
            await message.reply("successfully restored your server backup! You can now safely delete this channel.");
            //@ts-ignore
            await message.channel.setName("success");
            return sendMe.edit("Successfully restored your server backup!");
        });
    }
}