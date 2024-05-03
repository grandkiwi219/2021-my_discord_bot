module.exports = (client, config) => {
    console.log(`${client.user.username} 봇이 실행되었습니다.`);

/*
    let atvt = config.bot.activity;

    if (!atvt) return;

    let checkArray = Array.isArray(atvt);

    if (!checkArray) return console.log('봇의 상태 메세지 형식이 알맞지 않습니다. 봇의 상태 메세지의 형식은 String 혹은 Array여야 합니다.');

    atvt.status ? client.user.setStatus(atvt.status) : 0;

    config.bot.initial = `${client.user.username} Menu`;

    if (!atvt.msg) return;

    var t = 0;

    setInterval(() => {
        client.user.setActivity(atvt.msg[t], { type: atvt.type[t] });

        t != atvt.msg.length - 1 ? t++ : t = 0;
    }, atvt.sec * 1000);
*/
}
