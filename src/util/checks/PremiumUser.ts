import { User } from "discord.js";
import BackupClient from "../structures/BackupClient";

export default class PremiumUser {
    constructor(public client: BackupClient) { }
    check (user: User) {
        const server = this.client.guilds.cache.get("748347662016839770");
        if (server.members.cache.has(user.id)) {
            const member = server.members.cache.get(user.id);
            let tier: number = 0;
            if (member.roles.cache.has("748351787211161693")) tier = 1;
            if (member.roles.cache.has("748674137249022024")) tier = 2;
            if (member.roles.cache.has("748674183202078798")) tier = 3;
            return tier;
        }
    };
}