const Discord = require("discord.js");

const ready = require("../ready");
const { config, key, events } = require("../settings");
const { expand } = require("../function");

const client = new Discord.Client({ intents: config.intents, partials: config.partials });
client.cmds = new Discord.Collection();
client.ias = [];

client.login(key.token.discord);

client.on(events.CLIENT_READY, () => {
    expand.ready(client, config);
    expand.cmdLoad(client.cmds, client.ias, ready.start.location + '/cmds');
});

client.on(events.MESSAGE_CREATE, async msg => {

    if (msg.author.id == client.user.id && !config.bot.msg) return;

    if (!msg.content.startsWith(config.bot.prefix)) return;

    let msgArrayReady = msg.content.split(' ');
    let msgArray = [];

    msgArrayReady.forEach(r => { if (r) msgArray.push(r) });

    let check = msgArray[0];
    let exe = check.slice(config.bot.prefix.length).toLowerCase();
    let args = msgArray.slice(1);
    let cmd = client.cmds.get(exe) || client.cmds.find(r => r.help.aliases.includes(exe));

    if (cmd) {
        return expand.execute(cmd, client, msg, config, args);
    }

});

client.on(events.INTERACTION_CREATE, async ia => {
    if (ia.isCommand()) {
        if (client.cmds.get(ia.commandName))
            expand.execute(client.cmds.get(ia.commandName), client, ia, config, [], ia);
    }

    if (ia.isSelectMenu()) {
        if (client.cmds.get(ia.customId.split('-')[0])) {
            expand.execute(client.cmds.get(ia.customId.split('-')[0]), client, ia, config, ia.values, ia);
        }
    }
});
