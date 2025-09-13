import { Roblox } from "arctic";
import { config } from "@/lib/config";

export const roblox = new Roblox(
	config.robloxClientId,
	config.robloxClientSecret,
	config.oauthCallbackUrl
);