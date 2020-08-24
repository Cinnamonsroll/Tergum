import { ClientEvents } from 'discord.js';
import BackupClient from "./BackupClient";

export default abstract class BaseEvent {
    constructor(private eventData: { name: keyof ClientEvents, description?: string }) { }

    public get name(): keyof ClientEvents { return this.eventData.name }
    public get description(): string { return this.eventData.description }

    public abstract run(client: BackupClient, ...args: any): void
}