const { MessageEmbed } = require("discord.js");

module.exports = (cmds, set, category = {}) => {
    if (!set) return console.log('명령어에 설정된 것이 없습니다.');
    if (!cmds) return console.log('정의된 봇 안에 cmds가 정의되지 않았습니다.');

    let name = set.name?.replace(/ /g, '-') || 'unknown';
    let nameCheck = 1;

    while (cmds.get(name)) {
        name += `-${nameCheck}`;
        nameCheck++;
    }
    
    let aliases =  set.aliases ? Array.isArray(set.aliases) ? set.aliases.map(r => r.replace(/ /g, '-')) : typeof set.aliases == 'string' ? [set.aliases.replace(/ /g, '-')] : [] : [];
    
    if (aliases.length > 1) {
        for (const alias of aliases) {
            let num = 1;
            
            while (cmds.find(r => r.help.aliases.includes(alias))) {
                alias += `-${num}`;
                num++;
            }
        }
    }

    let available = {
        guild: true,
        dm: true,
    };

    let agArr = [];

    let ca = category.available;

    if (ca) {
        if (boolean(ca.guild)) available.guild = ca.guild;
        if (boolean(ca.dm)) available.dm = ca.dm;

        if (Array.isArray(ca.guild))
            ca.guild.forEach(r => { if (r) agArr.push(r) });

        if (agArr.length > 0) available.guild = agArr;
    }

    let sa = set.available;

    if (sa) {
        let agBoolean = false;

        if (boolean(sa.guild)) {
            available.guild = sa.guild;
            agBoolean = true;
        }
        if (boolean(sa.dm)) available.dm = sa.dm;

        if (Array.isArray(sa.guild)) 
            sa.guild.forEach(r => { if (r) agArr.push(r) });

        if (!agBoolean && agArr.length > 0) available.guild = agArr;
    }

    let access = {
        owner: false,
        admin: false,
        user: [],
        bot: true
    };

    let cc = category.access;

    if (cc) {
        if (boolean(cc.owner)) access.owner = cc.owner;
        if (boolean(cc.admin)) access.admin = cc.admin;
        if (cc.user)
            if (cc.user.length > 0) cc.forEach(r => { if (r) access.user.push(r) });
        if (boolean(cc.bot)) access.bot = cc.bot;
    }

    let sc = set.access;

    if (sc) {
        if (boolean(sc.owner)) access.owner = sc.owner;
        if (boolean(sc.admin)) access.admin = sc.admin;
        if (sc.user)
            if (sc.user.length > 0) sc.forEach(r => { if (r) access.user.push(r) });
        if (boolean(sc.bot)) access.bot = sc.bot;
    }

    return {
        name,
        aliases,
        description: set.description || '이 명령어를 설명하려면 **`천문학적 시간`**이 필요해요..!',
        example: `${name}${set.example ? ' ' + set.example : ''}`,
        category: {
            name: category.name || false,
            description: category.description || false
        },
        enable: set.enable !== false ? true : false,
        available,
        access
    }
}

function boolean (x) {
    return (typeof x == 'boolean' && (x == true || x == false))
}
