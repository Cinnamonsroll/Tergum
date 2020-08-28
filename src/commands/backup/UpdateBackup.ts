import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import Backup from "../../database/models/Backup";
import CreateCode from "../../util/functions/CreateCode";

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
            cooldown: 7200000,
        });
    }
    async run (client: BackupClient, message: Message, args: string[], premium: number) {

        const code = args[0];

        const backup = await Backup.findOne({ code });

        if (!backup) return message.channel.send("You can't update a backup that doesn't exist!");

        if (message.author.id !== backup.owner) return message.channel.send("You can't update someone elses backup!");

        if (message.guild.id !== backup.originalServer) {

            return message.channel.send("You can't update a backup in a new server!");
        }

        if (!backup.parent) {
            const parentBackup = (await Backup.find()).filter(data => data.previousStates.includes(backup._id))[0];
            // console.log(parentBackup);
            message.author.send("Your parents backup code is " + parentBackup.code);
            return message.channel.send("You can't update a child backup! Please update the parent. Check your DMs for your Parent's code.");
        }
        const msg = await message.channel.send("<a:loading3:709992480757776405> Please wait while new data is stored... This can take some time...");

        backup.parent = false;

        const dataToUpdate = {
            name: message.guild.name,
            icon: message.guild.iconURL({ format: "png" }),
            originalServer: backup.originalServer,
            owner: backup.owner,
            private: backup.private,
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
            data: {
                channels: [],
                roles: [],
                emojis: [],
            },
            date: new Date(),
        }



        for (const [__, channel] of message.guild.channels.cache) {

            dataToUpdate.data.channels.push({
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

                dataToUpdate.data.channels.find(c => c.oldId === channel.id).rolePermissions.push({
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
                    dataToUpdate.data.channels.find(c => c.oldId === ch.id).messages.push({
                        authr: msg.author.username,
                        avatar: msg.author.displayAvatarURL({ format: "png" }),
                        content: msg.content,
                        embed: msg.embeds.length > 0 ? msg.embeds : null,
                        attachment: msg.attachments.size > 0 ? msg.attachments.array() : null,
                    });
                }
            }
        }

        for (const [__, role] of message.guild.roles.cache) {
            dataToUpdate.data.roles.push({
                name: role.name,
                permission: role.permissions,
                position: role.position,
                color: role.hexColor,
                hoist: role.hoist,
                mentionable: role.mentionable,
            });
        }


        for (const [__, emoji] of message.guild.emojis.cache) {
            dataToUpdate.data.emojis.push({
                name: emoji.name,
                url: emoji.url,
            });
        }

        if (premium > 1) {
            //@ts-ignore
            dataToUpdate.code = CreateCode(10);
        }

        const newParent = new Backup(dataToUpdate);


        for (const id of backup.previousStates) {
            newParent.previousStates.unshift(id);
        }

        newParent.previousStates.unshift(backup._id);

        let toDeleteID: string;

        if (premium === 2) {
            if (newParent.previousStates.length > 1) {
                toDeleteID = newParent.previousStates.pop();
            }
        } else if (premium === 3) {
            if (newParent.previousStates.length > 2) {
                toDeleteID = newParent.previousStates.pop();
            }
        }

        if (toDeleteID) {
            try {
                await Backup.findByIdAndRemove(toDeleteID);
                backup.previousStates = [];
            } catch (err) {
                return msg.edit("Something went wrong while updating your backup. Please try again later.");
            }
        }

        try {
            if (premium > 1) {
                await backup.updateOne(backup);
                await newParent.save();
            } else {
                await backup.updateOne(dataToUpdate);
            }
        } catch (err) {
            console.log(err);
            return msg.edit("Something went wrong while updating your backup. Please try again later.");
        }

        if (!backup.parent) {
            try {
                //@ts-ignore
                await message.author.send(`Successfully updated your servers backup! Your new backup code is \`${dataToUpdate.code}\` for \`${message.guild.name}\``);
            } catch (err) {
                return msg.edit(`Your server backup has been successfully updated. It appears your DMs are off so I couldn't send you your new backup code. To recieve the code, run \`${client.getPrefix(client, message.guild)}backups\` with your DMs open.`)
            }
        }

        return msg.edit("Successfully updated your servers backup!");

    };
}