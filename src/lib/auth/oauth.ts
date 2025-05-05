import { Roblox } from "arctic";

export const roblox = new Roblox(
	process.env.ROBLOX_CLIENT_ID,
	process.env.ROBLOX_CLIENT_SECRET,
	'http://localhost:3000/login/callback'
);