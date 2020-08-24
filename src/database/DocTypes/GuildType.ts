import { Document } from "mongoose";
import { Snowflake } from "discord.js";

export default interface GuildType extends Document {
    /**
     * The ID of the guild
     */
    id: Snowflake;
    /**
     * The prefix for that server
     */
    prefix: string | null;
}