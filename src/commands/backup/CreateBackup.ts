import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";
import Backups from "../../database/models/Backup";
import CreateCode from "../../util/functions/CreateCode";

export default class CreateBackup extends BaseCommand {
    constructor() {
        super({
            aliases: ["createbackup", "backupc", "backupcreate"],
            category: "backup",
            description: "Create a backup of your entire server!",
            name: "cbackup",
            permissions: ["ADMINISTRATOR"],
            usage: "cbackup <private/public>",
            g_owner_only: true,
        });
    }
    async run (client: BackupClient, message: Message, args: string[], premium: number) {
        
        const private_public = args[0];
        if (!private_public) return message.channel.send("Please specify if you would like to make this backup private or public");
        if (private_public !== "private" && private_public !== "public") return message.channel.send("Please specify if you would like to make this backup private or public. " + `\`${client.getPrefix(client, message.guild)}cbackup <public | private>\``);

        if ((await Backups.findOne({ originalServer: message.guild.id }))) return message.channel.send(`You can only have one backup of a server at a time! Try \`${client.getPrefix(client, message.guild)}ubackup <code>\` instead!`)

        const docs = (await Backups.find()).filter(data => data.owner === message.author.id).length;

        if (premium === 0 && docs === 3) return message.channel.send("You have reached the maximum amount of backups for the free version! (3 Backups) Upgrade to premium for more storage!");
        if (premium === 1 && docs === 5) return message.channel.send("You have reached the maximum amount of backups for Premium Tier 1! (5 Backups) Upgrade to Tier 2 or Tier 3 to get more or Unlimited Storage!");
        if (premium === 2 && docs === 10) return message.channel.send("You have reached the maximum amount of backups for Premium Tier 2! (10 Backups) Upgrade to Tier 3 to get UNLIMITED Storage!");

        const waitMsg = await message.channel.send("<a:loading3:709992480757776405> Your server backup is being created. This can take some time, please wait...");

        const Backup = new Backups({
            code: CreateCode(10),
            originalServer: message.guild.id,
            private: private_public === "private" ? true : false,
            owner: message.author.id,
            name: message.guild.name,
            icon: message.guild.iconURL({ format: "png" }),
            settings: {
                banner: message.guild.banner ? message.guild.banner : null,
                defaultMsgNotis: message.guild.defaultMessageNotifications,
                description: message.guild.description,
                discoverySplash: message.guild.discoverySplashURL({ format: "png" }),
                mfaLevel: message.guild.mfaLevel,
                preferredLocale: message.guild.preferredLocale,
                region: message.guild.region,
                splash: message.guild.splash,
                verificationLevel: message.guild.verificationLevel,
                afkChannel: message.guild.afkChannel ? message.guild.afkChannel.name : null,
                afkTimeout: message.guild.afkTimeout,
                vanityURL: message.guild.vanityURLCode ? message.guild.vanityURLCode : null,
            },
            date: new Date(),
        });

        // Backup all channels in the server
        for (const [__, channel] of message.guild.channels.cache) {

            Backup.data.channels.push({
                name: channel.name,
                // @ts-ignore
                nsfw: channel.type === "text" ? channel.nsfw : undefined,
                parent: channel.type !== "category" ? channel.parent !== null ? channel.parent.name : undefined : undefined,
                position: channel.position,
                type: channel.type,
                //@ts-ignore
                rateLimit: channel.type === "text" ? channel.rateLimitPerUser : undefined,
                //@ts-ignore
                topic: channel.type === "text" ? channel.topic : undefined,
                //@ts-ignore
                userLimit: channel.type === "voice" ? channel.userLimit : undefined,
                //@ts-ignore
                bitrate: channel.type === "voice" ? channel.bitrate : undefined,
                oldId: channel.id,
                rolePermissions: [],
                messages: [],
            });

            // Push that channels permissions to the array
            for (const [_, perm] of channel.permissionOverwrites) {
                const role_member = message.guild.roles.cache.get(perm.id) == undefined ? undefined : message.guild.roles.cache.get(perm.id).name

                Backup.data.channels.find(c => c.oldId === channel.id).rolePermissions.push({
                    permission: {
                        allow: perm.allow,
                        deny: perm.deny,
                    },
                    roleName: role_member,
                });
            }


            // If its a text or news channel, backup the last 100 messages
            if (channel.type === "text" || channel.type === "news") {
                // @ts-ignore
                const ch: TextChannel = channel;
                const msgs = (await ch.messages.fetch({ limit: premium === 3 ? 100 : premium === 2 ? 75 : premium === 1 ? 50 : 10 })).array().reverse();

                for (const msg of msgs) {
                    Backup.data.channels.find(c => c.oldId === ch.id).messages.push({
                        authr: msg.author.username,
                        avatar: msg.author.displayAvatarURL({ format: "png" }),
                        content: msg.content,
                        embed: msg.embeds.length > 0 ? msg.embeds : null,
                        attachment: msg.attachments.size > 0 ? msg.attachments.array() : null,
                    });
                }
            }
        }

        // Backup each role and its permissions
        for (const [__, role] of message.guild.roles.cache) {
            Backup.data.roles.push({
                name: role.name,
                permission: role.permissions,
                position: role.position,
                color: role.hexColor,
                hoist: role.hoist,
                mentionable: role.mentionable,
            });
        };

        
        // Push each emoji to an array to restore
        for (const [__, emoji] of message.guild.emojis.cache) {
            Backup.data.emojis.push({
                name: emoji.name,
                url: emoji.url,
            });
        }

        // Sort the channels so the categories are created first
        //@ts-ignore
        Backup.data.channels.sort((a, b) => {
            if (a.type < b.type) {
                return -1;
            } else if (a.type > b.type) {
                return 1;
            } else {
                return 0;
            }
        });

        Backup.data.roles.sort((a, b) => b.position - a.position);


        try {
            await Backup.save();
        } catch (err) {
            console.log(err);
            return waitMsg.edit("Something went wrong while saving your server backup! Please try again later.");
        }

        message.author.send(`Your backup code is \`${Backup.code}\` for \`${message.guild.name}\``);

        return waitMsg.edit("Successfully backed up your Server! Please check your DM's for your backup code.");
    }
}