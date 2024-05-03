const Discord = require("discord.js");
const Flags = Discord.Intents.FLAGS;

module.exports = [
    Flags.GUILDS,
    Flags.GUILD_MEMBERS,
    Flags.GUILD_MESSAGES,
    Flags.DIRECT_MESSAGES,
    Flags.GUILD_PRESENCES
];
