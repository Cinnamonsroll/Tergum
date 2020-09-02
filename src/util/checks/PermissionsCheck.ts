import { GuildMember } from "discord.js";

export default class PermissionsCheck {
    constructor(public clientMember: GuildMember) {};
    check() { if (this.clientMember.permissions.has(8)) return true; };
}