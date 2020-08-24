import { Document } from "mongoose";
import { Snowflake, VerificationLevel } from "discord.js";
import BackupData from "./BackupData";

export default interface BackupType extends Document {
    code: string;
    originalServer: Snowflake;
    data: BackupData;
    private: boolean;
    owner: Snowflake;
    name: string;
    icon: string;
    settings: {
        banner: string | null;
        defaultMsgNotis: number | "ALL" | "MENTIONS";
        description: string | null;
        discoverySplash: string | null;
        mfaLevel: number;
        preferredLocale: string;
        region: string;
        splash: string | null;
        verificationLevel: VerificationLevel;
        afkChannel: string | null;
        afkTimeout: number | null;
        vanityURL: string | null;
    }
}