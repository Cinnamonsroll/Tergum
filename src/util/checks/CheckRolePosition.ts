import { GuildMember, Role, Collection } from "discord.js";

export default class CheckRolePosition {
    constructor(public clientMember: GuildMember, public serverRoles: Collection<string, Role>) {};
    check() {
        for (const [_, role] of this.clientMember.roles.cache) {
            if (role.position === this.serverRoles.size - 1) return true;
        }
    } 
}