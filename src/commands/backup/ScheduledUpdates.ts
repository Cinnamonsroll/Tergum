import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";
import node_schedule from "node-schedule";
import Backup from "../../database/models/Backup";
import BackupSchedule from "../../database/models/BackupSchedule";
import ms from "ms";
import UpdateBackup from "./UpdateBackup";
import PremiumUser from "../../util/checks/PremiumUser";


export default class ScheduledUpdates extends BaseCommand {
    constructor() {
        super({
            aliases: ["supdates", "autoupdate"],
            category: "backup",
            description: "Start or stop auto updates for your servers backup.",
            name: "scheduleupdates",
            permissions: ["ADMINISTRATOR"],
            g_owner_only: true,
            usage: "scheduleupdates <backup code> <off/time>",
            cooldown: 120,
            examples: [
                "?scheduleupdates qweRtyAsdF 5h",
                "?scheduleupdates qweRtyAsdF off"
            ]
        });
    }
    async run (client: BackupClient, message: Message, args: string[], premium: number) {
        if (premium < 2) return message.channel.send("You can't use this command, consider buying premium Tier 2 and above!");


        
        let code = args[0];
        const time_off = args[1];

        if (!code) return message.channel.send("Please provide the correct arguments");
        if (!time_off) return message.channel.send("Please provide the correct arguments");

        if (!time_off.match(/\d+h/g) && time_off !== "off") return message.channel.send("Please provide a valid recurrence time! Ex: `5h`");

        if (parseInt(time_off.slice(0, 1)) < 3 && premium === 2) return message.channel.send("The minimum recurrence Tier 2 Premium can use is 3 hours!");
        if (parseInt(time_off.slice(0, 1)) < 1 && premium === 3) return message.channel.send("The minimum recurrence Tier 3 Premium can use is 1 hour!");

        const backup = await Backup.findOne({ code });

        if (!backup) return message.channel.send("That Backup Doesn't Exist!");

        if (!backup.parent) return message.channel.send("You can only turn on Auto Updates for Parent Backups!");
        
        if (time_off === "off") {
            const foundData = await BackupSchedule.findOne({ backupId: code });
            if (!foundData) return message.channel.send("That backup doesn't exist");

            client.jobs.get(code).cancel();

            client.jobs.delete(code);
            await foundData.deleteOne();

            return message.channel.send("Successfully stopped scheduled updates.");
        }


        const job = node_schedule.scheduleJob(`0 */${time_off.slice(0, 1)} * * *`, async () => {

            const Update = new UpdateBackup();
            const premiumUser = new PremiumUser(client);
            let oldCode = code;
            client.jobs.delete(oldCode);

            const newCode = await Update.run(client, message, [code], premiumUser.check(message.author), true);
            client.jobs.set(newCode, job);

            const bckup = await BackupSchedule.findOne({ backupId: oldCode })
            bckup.backupId = newCode;

            code = newCode;
            await bckup.save();
            message.author.send(`Your backup for \`${message.guild.name}\` has successfully updated! The new backup code is \`${newCode}\``);

        });

        client.jobs.set(code, job);

        const schedule = new BackupSchedule({
            backupId: backup.code,
            schedule: `0 */${time_off.slice(0, 1)} * * *`,
            ownerId: message.author.id,
        });

        try {
            schedule.save();
        } catch (err) {
            job.cancel();
            return message.channel.send("Something went wrong while starting your backups auto updates, please try again later");
        }

        return message.channel.send("Successfully enabled auto updates for your backup! You will get DM's whenever your backup updates!");

    }
}