import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message } from "discord.js";

export default class Eval extends BaseCommand {
    constructor() {
        super({
            name: "eval",
            aliases: [],
            category: "owner",
            description: "Eval, what do you expect it to do.",
            permissions: ["ADMINISTRATOR"],
            usage: "eval <code>",
        });
    }
    async run (client: BackupClient, message: Message, args: string[]) {
        try {
            eval(args.join(" "));
        } catch (err) {
            return message.channel.send("Oops\n\n" + err);
        }
        return message.channel.send("Success")
    }
}