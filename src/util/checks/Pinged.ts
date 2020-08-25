import { Message } from "discord.js";
import BackupClient from "../structures/BackupClient";

export default class Pinged {
    constructor(public message: Message, public type: "equal" | "start" | "include", public client: BackupClient) {
        this.message = message;
        this.type = type;
        this.client = client;
    }
    public check() {
        switch (this.type) {
            case "equal":
                if (this.message.content === `<@${this.client.user.id}>` || this.message.content === `<@!${this.client.user.id}>`) return true;
                else return false;
            case "include":
                if (this.message.content.includes(`<@${this.client.user.id}>`) || this.message.content.includes(`<@!${this.client.user.id}>`)) return true;
                else return false;
            case "start":
                if (this.message.content.startsWith(`<@${this.client.user.id}>`) || this.message.content.startsWith(`<@!${this.client.user.id}>`)) return true;
                else return false;
        };
    }
    
}