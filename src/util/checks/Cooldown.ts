import { BaseCommand } from "../structures/BaseCommand";
import { GuildMember, Collection } from "discord.js";

export default class Cooldown {
    constructor(public cooldown: Collection<string, Collection<string, number>>, public command: BaseCommand, public member: GuildMember) { };

    public check () {
        if (!this.cooldown.has(this.member.id)) {
            this.cooldown.set(this.member.id, new Collection());
        }

        const cmd = this.cooldown.get(this.member.id);
        const amount = (this.command.cooldown || 30) * 1000;

        if (cmd.has(this.command.name)) {
            const expire = cmd.get(this.command.name) + amount;
            if (Date.now() < expire) {
                const left = (expire - Date.now()) / 1000;
                return `Please wait ${left} more second(s) before you use ${this.command.name} again.`
            }
        }

        cmd.set(this.command.name, Date.now())
        setTimeout(() => cmd.delete(this.command.name), amount);
    }
}