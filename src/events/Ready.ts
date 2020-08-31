import BaseEvent from "../util/structures/BaseEvent";
import BackupClient from "../util/structures/BackupClient";
import Guild from "../database/models/Guild";
import BackupSchedule from "../database/models/BackupSchedule";
import Backup from "../database/models/Backup";
import { scheduleJob } from "node-schedule";
import UpdateBackup from "../commands/backup/UpdateBackup";
import PremiumUser from "../util/checks/PremiumUser";
import { Message } from "discord.js";

export default class Ready extends BaseEvent {
    constructor() {
        super({
            name: "ready",
        });
    }
    async run (client: BackupClient) {

        for (const [__, guild] of client.guilds.cache) {
            const GuildDoc = await Guild.findOne({ id: guild.id });

            const prefix = GuildDoc ? GuildDoc.prefix : client.defaultPrefix;

            client.cachePrefixes(guild, prefix);
        }

        const schedules = await BackupSchedule.find();

        for (const schedule of schedules) {
            const idToSendTo = schedule.ownerId;
            let code = schedule.backupId;

            const backup = await Backup.findOne({ code });

            if (backup) {
                const user = client.users.cache.get(idToSendTo);

                user.send(`The bot has just restarted and your Auto Updates for your backup of \`${backup.name}\` have successfully restarted.`)

                const job = scheduleJob(schedule.schedule, async () => {
                    const Update = new UpdateBackup();
                    const premiumUser = new PremiumUser(client);
                    let oldCode = code;
                    client.jobs.delete(oldCode);
                    //@ts-ignore
                    const newCode = await Update.run(client, new Message(client, { author: user, guild: client.guilds.cache.find(g => g.name === backup.name) }, client.guilds.cache.find(g => g.name === backup.name).channels.cache.filter(ch => ch.type === "text").first()), [code], premiumUser.check(user), true);
                    client.jobs.set(newCode, job);
        
                    const bckup = await BackupSchedule.findOne({ backupId: oldCode })
                    bckup.backupId = newCode;
        
                    code = newCode;
                    await bckup.save();
                    user.send(`Your backup for \`${backup.name}\` has successfully updated! The new backup code is \`${newCode}\``);
                });

                client.jobs.set(code, job);
            }

        }

        client.setStatus(client, ["server backups", `for @${client.user.username}`], "WATCHING", true);

        console.log(`Successfully logged in as ` + `${client.user.tag}`.red);
    }
}