import { Snowflake, ClientOptions, Client, Guild } from "discord.js";

export default class BackupClient extends Client {
    defaultPrefix: string;
    commands: Map<string, any>;
    aliases: Map<string, string>;
    owners: Array<Snowflake>;
    baseOptions?: ClientOptions;
    cachedPrefixes: Map<string, string>;
    constructor({ defaultPrefix, owners }: { defaultPrefix: string, owners: Array<Snowflake> }, baseOptions?: ClientOptions) {
        super();
        this.commands = new Map();
        this.aliases = new Map();
        this.cachedPrefixes = new Map();
        this.owners = owners;
        this.baseOptions = baseOptions;
        this.defaultPrefix = defaultPrefix
    };
    cachePrefixes (guild: Guild, prefix: string) {
        this.cachedPrefixes.set(guild.id, prefix);
    };
    getPrefix (client: BackupClient, guild: Guild) {
        return client.cachedPrefixes.get(guild.id) || client.defaultPrefix;
    };
}