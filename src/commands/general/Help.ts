import { BaseCommand } from "../../util/structures/BaseCommand";
import BackupClient from "../../util/structures/BackupClient";
import { Message, MessageEmbed, MessageReaction, User, Base } from "discord.js";

export default class HelpCommand extends BaseCommand {
    constructor() {
        super({
            aliases: ["halp", "commands"],
            category: "general",
            description: "Get help for the bot!",
            name: "help",
            permissions: ["SEND_MESSAGES"],
            usage: "help",
        });
    }
    async run(client: BackupClient, message: Message, args: string[]) {
        // const commands = client.commands;

        const owner = client.owners.some(id => id === message.author.id);
        const prefix = client.getPrefix(client, message.guild);
        const categories = ["Backup", "General"];
        const categoryNums = {
            Backup: "1️⃣",
            General: "2️⃣",
        }

        if (owner) {
            categories.push("Owner");
            //@ts-ignore
            categoryNums.Owner = "3️⃣";
        }

        const startEmbed = new MessageEmbed()
            for (const category of categories) {
                startEmbed.addField(category, `\`\`\`Click ${categoryNums[category]} to view commands\`\`\``, true);
            }
            startEmbed.setAuthor("Help Menu", client.user.displayAvatarURL({ format: "png" }))
            .setColor(client.colors.noColor)
            .setFooter("Use the reactions below to get through the help menu!");

        const help = await message.channel.send(startEmbed);

        const info = {
            pageType: "home",
            pageNumber: 0,
            pageData: (pageType: string) => client.commands.filter(c => c.category === pageType).array(),
            lastPages: [],
            pagesData: null,
            currentCommandCategory: null,
        };

        let toDisplay = [];
        if (owner) await Promise.all([ help.react("↩️"),  help.react("1️⃣"), help.react("2️⃣"), help.react("3️⃣"), help.react("◀️"), help.react("▶️"), help.react("❌") ]);
        else await Promise.all([ help.react("↩️"),  help.react("1️⃣"), help.react("2️⃣"), help.react("◀️"), help.react("▶️"), help.react("❌") ]);
        

        const filter = (reaction: MessageReaction, user: User) => user.id === message.author.id && ["↩️", "1️⃣", "2️⃣", "3️⃣", "◀️", "▶️", "❌"].includes(reaction.emoji.name);

        const collector = help.createReactionCollector(filter, { time: 1000 * 60 * 5 });

        collector.on("collect", async (reaction, user) => {
            switch (reaction.emoji.name) {
                case "↩️":
                    if (info.pageType === "home") return reaction.users.remove(user.id);
                    else {
                        const toEdit: { type: string; embed: MessageEmbed } = info.lastPages.pop();
                        info.pageType = toEdit.type;
                        help.edit(toEdit.embed);
                        if (info.pageType === "home") info.pageNumber = 0;
                    }
                break;

                case "1️⃣":
                return numberFn(reaction, "backup", user, 0);

                case "2️⃣":
                return numberFn(reaction, "general", user, 1);

                case "3️⃣":
                if (!owner) {
                    reaction.users.remove(user.id);
                    return message.channel.send("You can't access this section.");
                }
                return numberFn(reaction, "owner", user, null);
                case "◀️":
                return left_right("left", reaction, user);

                case "▶️":
                return left_right("right", reaction, user);

                case "❌":
                help.reactions.removeAll();
                return collector.stop("Cancelled");

            };
            reaction.users.remove(user.id);
        });

        collector.on("end", (_, reason) => {
            const cancelled = new MessageEmbed()
                .setAuthor(reason === "Cancelled" ? "Closed Help" : "Help Expired", client.user.displayAvatarURL({ format: "png" }))
                .setColor(client.colors.noColor);
            help.edit(cancelled);
        });

        // Functions
        function numberFn(reaction: MessageReaction, newPageType: string, user: User, num: number) {

            if (info.pageType === "home") {
                toDisplay = [];

                info.lastPages.push({
                    type: info.pageType,
                    embed: help.embeds[0], 
                });
                info.pageType = "commands";

                const data = info.pageData(newPageType);
                const ToSplitAt = 2;

                for (let i = 0; i < data.length; i += ToSplitAt) {
                    toDisplay.push(data.slice(i, i + ToSplitAt));
                }

                info.pagesData = toDisplay;
                info.currentCommandCategory = newPageType;

                const newEmbed = new MessageEmbed()
                    for (const cmd of toDisplay[info.pageNumber]) {
                        newEmbed.addField(`${cmd.name} ${cmd.name === toDisplay[info.pageNumber][0].name ? "1️⃣" : "2️⃣"}`, cmd.description, true);
                    }
                    newEmbed.setColor(client.colors.noColor)
                    .setAuthor(`${newPageType} Commands [${client.commands.filter(c => c.category === newPageType).size}]`, client.user.displayAvatarURL({ format: "png" }))
                    .setFooter(`Page ${info.pageNumber + 1}/${toDisplay.length} - Use ↩️ to go back or ◀️ and ▶️ to view all commands`)
                help.edit(newEmbed);

            } else if (info.pageType === "commands") {
                if (info.pagesData[info.pageNumber][num]) {
                    info.lastPages.push({
                        type: info.pageType,
                        embed: help.embeds[0], 
                    });
                    info.pageType = "command";

                    const cmd = info.pagesData[info.pageNumber][num];

                    const editMe = new MessageEmbed()   
                        .setColor(client.colors.noColor)
                        .setFooter("Use ↩️ to go back!")
                        .setAuthor(`${cmd.name} Info`, client.user.displayAvatarURL({ format: "png" }))
                        .setDescription(`**Command Name:** ${cmd.name}\n**Usage:** ${prefix}${cmd.usage}\n**Aliases:** ${cmd.aliases.length > 0 ? cmd.aliases.join(", ") : "None"}\n**Permissions:** ${cmd.permissions.join(", ")}`) 
                    help.edit(editMe);
                }
                
            } else if (info.pageType === "command") return reaction.users.remove(user.id);

            reaction.users.remove(user.id);
        }

        function left_right (left_right: "left" | "right", reaction: MessageReaction, user: User) {

            if (left_right === "right" && info.pageNumber < toDisplay.length - 1 && info.pageType === "commands") {
                info.pageNumber++;
            } else if (left_right === "left" && info.pageNumber > 0 && info.pageType === "commands") {
                info.pageNumber--;
            } else return reaction.users.remove(user.id);

            const cmdEmbed = new MessageEmbed()
                for (const cmd of toDisplay[info.pageNumber]) {
                    cmdEmbed.addField(`${cmd.name} ${cmd.name === toDisplay[info.pageNumber][0].name ? "1️⃣" : "2️⃣"}`, cmd.description, true)
                }
                cmdEmbed.setFooter(`Page ${info.pageNumber + 1}/${toDisplay.length} - Use ↩️ to go back or ◀️ and ▶️ to view all commands`)
                .setColor(client.colors.noColor)
                .setAuthor(`${info.currentCommandCategory[0].toUpperCase()}${info.currentCommandCategory.slice(1, info.currentCommandCategory.length)} Commands [${client.commands.filter(c => c.category === info.currentCommandCategory).size}]`, client.user.displayAvatarURL({ format: "png" }))
            help.edit(cmdEmbed).then(m => reaction.users.remove(user.id));
        }
    }
}