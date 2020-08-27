import { Snowflake, ClientOptions, Client, Guild, Collection, ActivityType } from "discord.js";
import { BaseCommand } from "./BaseCommand";

export default class BackupClient extends Client {
    defaultPrefix: string;
    commands: Collection<string, BaseCommand>;
    aliases: Map<string, string>;
    owners: Array<Snowflake>;
    baseOptions?: ClientOptions;
    cachedPrefixes: Map<string, string>;
    colors: { noColor: "#2F3136" };
    constructor(defaultPrefix: string, owners: Array<Snowflake>, baseOptions?: ClientOptions) {
        super();
        this.commands = new Collection<string, BaseCommand>();
        this.aliases = new Map<string, string>();
        this.cachedPrefixes = new Map<string, string>();
        this.owners = owners;
        this.baseOptions = baseOptions;
        this.defaultPrefix = defaultPrefix;
        this.colors = { noColor: "#2F3136" };
    };
    cachePrefixes (guild: Guild, prefix: string) {
        this.cachedPrefixes.set(guild.id, prefix);
    };
    getPrefix (client: BackupClient, guild: Guild) {
        return client.cachedPrefixes.get(guild.id) || client.defaultPrefix;
    };
    setStatus (client: BackupClient, statuses: string[] | string, presence: ActivityType, changing?: boolean) {
        if (changing) {
            let i = 0;
            setTimeout(() => client.user.setActivity(statuses[i++ % statuses.length], { type: presence }), 1000 * 60 * 2);
        //@ts-ignore
        } else client.user.setActivity(statuses, { type: presence });
    }
}