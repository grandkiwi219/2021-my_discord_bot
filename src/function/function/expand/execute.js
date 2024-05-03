module.exports = (cmd, client, msg, config, args, ia) => {

    if (!cmd.help.enable) return;

    if (!cmd.help.access.bot && msg.author.bot && msg.author.id !== client.user.id) return;

    if (cmd.help.available.guild == true && msg.guild) {

        access();

    } else if (Array.isArray(cmd.help.available.guild) && cmd.help.available.guild.length > 0 && cmd.help.available.guild.includes(msg.guild.id)) {

        access();

    } else if (!cmd.help.available.guild[0] && cmd.help.available.dm && !msg.guild) {

        access(false);

    } else return;


    function access (guild = true) {

        let ca = cmd.help.access;

        if (ca.user.length <= 0 && !ca.admin && !ca.owner) {
           run();
        } else

        if (ca.user.length >= 1 && ca.user.includes(msg.author.id)) {
            run();
        } else

        if (guild && (!msg.author.bot || msg.author.id == client.user.id) && ca.admin && msg.member.permissions.has(config.bot.admin)) {
            run();
        } else

        if (ca.owner && config.bot.owner.id.includes(msg.author.id)) {
            run();
        } else return msg.channel.send('failed');

    }

    function run () {

        try {
            cmd.run(client, msg, config, args, ia);
        } catch (e) {
            msg.channel.send('명령어 실행 중에 오류가 났습니다.');
            console.log(e);
        }

    }

}
