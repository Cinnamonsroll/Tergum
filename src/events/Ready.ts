import BaseEvent from "../util/structures/BaseEvent";
import BackupClient from "../util/structures/BackupClient";
import Guild from "../database/models/Guild";

export default class Message extends BaseEvent {
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

        client.setStatus(client, ["server backups", `for @${client.user.username}`], "WATCHING", true);

        console.log(`Successfully logged in as ` + `${client.user.tag}`.red);
    }
}