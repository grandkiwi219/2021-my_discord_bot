const moment = require("moment");
const Discord = require("discord.js");
const { userinfo } = require("../../../settings").info;
const fetch = require("node-fetch");

module.exports.help = {
    aliases: ['ui', 'user info']
}

const keyword = {
    name: '검색어',
    description: '찾으시는 유저를 멘션하시거나, 혹은 아이디, 닉네임 또는 그의 일부를 적어주세요!',
    type: 3
}

const s_keyword = {
    name: keyword.name,
    description: '찾으시는 유저의 닉네임 또는 그의 일부를 적어주세요!',
    type: keyword.type
}

const hide = {
    name: '숨김여부',
    description: '다른 사람들에게 자신이 찾는 정보를 숨기게 할 수 있어요!',
    type: 3,
    choices: [{ name: '나만 보이게 하기', value: 'true' }, { name: '모두 보이게 하기', value: 'false' }]
}

const search = 'search';

module.exports.ia = {
    enable: true,
    data: {
        options: [
            {
                name: 'find',
                description: '찾으시는 유저를 바로 보여줍니다!',
                type: 1,
                options: [keyword, hide]
            },
            {
                name: 'search',
                description: '찾으시는 유저를 최대 20명까지 불러와 선택하실 수 있습니다!',
                type: 1,
                options: [s_keyword, hide]
            }
        ]
    }
}

module.exports.run = async (client, msg, config, args, ia) => {

    var hidden = false;
    var iaTag = [];
    var send = (options) => { msg.channel.send(options) }

    if (ia) {
        if (ia.isCommand()) {
            iaTag.push('ia');
            if (ia.options._subcommand) args.push(ia.options._subcommand);
            ia.options._hoistedOptions.forEach(r => {
                if (r.name == keyword.name) args.push(r.value);
                if (r.name == hide.name) {
                    if (r.value == 'true') {
                        iaTag.push('hide');
                        hidden = true;
                    }
                }
            });
            send = (options) => { ia.reply(options) }
        } else if (ia.isSelectMenu()) {
            let check = ia.customId.split('-')

            if (check[1] != ia.user.id) return;

            if (check[3] != 'hide')
                ia ? ia.message.delete() : msg.delete();

            if (check[2] == 'ia') {
                send = (options) => {
                    options.failIfNotExists = false;
                    ia.reply(options);
                }
                if (check[3] == 'hide') hidden = true;
            }
        }
    }

    if (msg.guild) {
        if (!msg.channel.permissionsFor(msg.guild.me).has('EMBED_LINKS')) return send({ content: config.msg.msg.embed, ephemeral: hidden });
    }

    if ([search, 's'].includes(args[0])) {
        let info = [];

        let limit = 20;

        let num = args[0].length;

        let action = new Discord.MessageActionRow();

        let embed = new Discord.MessageEmbed()
        .setTitle('🔎 유저 검색 결과')
        .setColor(config.msg.color.base)
        .setDescription('찾고 계신 유저의 검색 결과에요!');

        let errorE = new Discord.MessageEmbed()
        .setTitle('🔎 유저 검색 결과')
        .setColor(config.msg.color.zui)
        .setDescription('찾고 계신 유저가 없어요 :(');

        let select = new Discord.MessageSelectMenu()
        .setCustomId(`userinfo-${msg.author?.id || msg.user.id}${iaTag.length > 0 ? '-' + iaTag.join('-') : ''}`)
        .setPlaceholder('찾고 계신 유저를 선택해주세요!')
        .setMaxValues(1)

        if (args[1]) {
            if (msg.guild) {
                if (msg.guild.memberCount > 150) await msg.guild.members.fetch()

                info = msg.guild.members.cache.filter(r => {
                    if (r.user.username.replace(/ /g, '').toLowerCase().includes(args.join('').toLowerCase().slice(num))) {
                        return true;
                    } else if (r.nickname) {
                        if (r.nickname.replace(/ /g, '').toLowerCase().includes(args.join('').toLowerCase().slice(num))) {
                            return true;
                        } else return false;
                    } else return false;
                }).map(r => {
                    return {
                        label: `${r.user.username}${r.nickname ? ' 「 ' + r.nickname + ' 」' : ''}`,
                        description: '#' + r.user.discriminator,
                        value: r.id
                    };
                })
            }

            if (info.length < limit) {
                client.users.cache.filter(r => {
                    return r.username.replace(/ /g, '').toLowerCase().includes(args.join('').toLowerCase().slice(num))
                }).filter(r => {
                    if (msg.guild) {
                        let check = true;
                        info.forEach(t => { if (t.value == r.id) check = false; })
                        return check;
                    } else return true;
                }).map(r => {
                    return {
                        label: r.username,
                        description: '#' + r.discriminator,
                        value: r.id
                    };
                }).forEach(r => info.push(r))
            }
        } else {
            info = config.bot.owner.id.map(i => {
                let r = client.users.cache.get(i);

                return {
                    label: r.username + ' 「 봇 오너 」',
                    description: '#' + r.discriminator,
                    value: r.id,
                };
            });
        }

        if (info.length <= 0) return msg.channel.send({ embeds: [errorE], ephemeral: hidden });

        action.addComponents(
            select.addOptions(info.slice(0, limit))
        );

        return send({ embeds: [embed], components: [action], ephemeral: hidden });
    }
    
    var member = ''
    var memberBase = ''
    
    var guild = true
    
    let userId = args.join('').replace(/<@/g, '').replace(/<@!/g, '').replace(/>/g, '')
    let userName = args.join(' ').replace(/ /g, '')
    
    if (!userId) {
        if (msg.guild) {
            member = msg.member.user
            memberBase = msg.member
        } else {
            member = msg.author
            guild = false
        }
    } else if (msg.guild) {
        memberBase = msg.guild.members.cache.find(r => r.user.username == userName || r.nickname == userName) || msg.guild.members.cache.find(r => (r.nickname ? r.nickname.replace(/ /g, '').includes(userName) : false) || r.user.username.replace(/ /g, '').includes(userName)) || msg.guild.members.cache.get(msg.mentions?.users?.first()?.id) || msg.guild.members.cache.get(userId)
        if (!memberBase) {
            try {
                member = client.users.cache.get(userId) || await client.users.fetch(userId)
                guild = false
            } catch (e) {
                member = msg.member.user
                memberBase = msg.member
                guild = true
            }  
        } else {
            member = memberBase.user
        }
    } else {
        try {
            member = client.users.cache.get(userId) || await client.users.fetch(userId)
        } catch (e) {
            member = msg.author
        }
        guild = false
    }
    
    memberName = member.tag
    color = config.msg.color.base
    infoTitle = 'USER INFO | 유저 정보'
    infoFooter = '유저'
    position = ''
    
    let presence = memberBase?.presence || { activities: [''] };
    
    if (guild) {
        if (member.username != memberBase.displayName) memberName = `${member.tag} ~ ${memberBase.displayName}`
        color = memberBase.displayHexColor
    }
    
    if (member.bot) {
        infoTitle = 'BOT INFO | 봇 정보'
        infoFooter = '봇'
    }

    if (guild) position = await joinedPosition(msg, memberBase)

    if (guild && !presence.status) {
        presence.status = 'offline'
    } else if (client.users.cache.get(member.id) && !presence.status) {
        if (client.guilds.cache.map(r => { if (r.members.cache.get(member.id)) { return true } else { return false } }).indexOf(true) >= 0) {
            client.guilds.cache.map(r => r.members.cache.get(member.id)).forEach(r => {
                if (r) {
                    r.guild.members.cache.get(member.id).presence ? presence = r.guild.members.cache.get(member.id).presence : presence.status = 'offline'
                }
            })
        }
    }
    
    let x = Date.now() - client.users.cache.get(member.id).createdAt
    const created = Math.floor(x / 86400000)
    
    let userEmbed = new Discord.MessageEmbed()
    .setAuthor(memberName)
    .setThumbnail(member.avatarURL({ dynamic: true }))
    .setColor(color)
    .setTitle(infoTitle)
    .setFooter(position + infoFooter + ' 아이디 : ' + member.id)
    .addField('현재 상태', userinfo.status[presence.status] + '')
    
    discordFlags = []
    join = ' '
    
    if (member.flags) {
        if (member.flags.bitfield) {
            canEmoji = 'emoji'
            if (msg.guild) {
                if (!msg.channel.permissionsFor(msg.guild.me).has('USE_EXTERNAL_EMOJIS')) {
                    canEmoji = 'text'
                }
            }
            let infoFlags = userinfo.flags[canEmoji]
            if (canEmoji == 'text') join = ' **|** '
        
            if (member.flags.has('DISCORD_EMPLOYEE')) discordFlags.push(infoFlags.staff);
            if (member.flags.has('DISCORD_CERTIFIED_MODERATOR')) discordFlags.push(infoFlags.mod);
            if (member.flags.has('PARTNERED_SERVER_OWNER')) discordFlags.push(infoFlags.partner_server);
            if (member.flags.has('BUGHUNTER_LEVEL_1')) discordFlags.push(infoFlags.bugHunter);
            if (member.flags.has('BUGHUNTER_LEVEL_2')) discordFlags.push(infoFlags.bugHunter2);
            if (member.flags.has('EARLY_SUPPORTER')) discordFlags.push(infoFlags.early_supporter);
            if (member.flags.has('EARLY_VERIFIED_BOT_DEVELOPER')) discordFlags.push(infoFlags.early_bot_developer);
            if (member.flags.has('VERIFIED_BOT')) discordFlags.push(infoFlags.verified_bot);
            if (member.flags.has('HYPESQUAD_EVENTS')) discordFlags.push(infoFlags.hype_events);
            if (member.flags.has('HOUSE_BALANCE')) discordFlags.push(infoFlags.balance);
            if (member.flags.has('HOUSE_BRAVERY')) discordFlags.push(infoFlags.bravery);
            if (member.flags.has('HOUSE_BRILLIANCE')) discordFlags.push(infoFlags.brilliance);
        }
    }
        
    if (discordFlags.length > 0) {
        userEmbed.addField('디스코드 뱃지', discordFlags.join(join) + '឵')
    }
    
    userEmbed.addField('계정 생성일', `${moment(member.createdAt).add(9, 'h').format("L/HH:mm:ss")}\n> ${created} 일 전`)
    
    if (guild == true) {
        let y = Date.now() - msg.guild.members.cache.get(member.id).joinedAt
        let joined = Math.floor(y / 86400000)
        
        userEmbed.addField('서버 접속일', `${moment(memberBase.joinedAt).add(9, 'h').format("L/HH:mm:ss")}\n> ${joined} 일 전`)
    }
    
    if (member.id == client.user.id) {
        userEmbed.setDescription(`Prefix | 접두사: \`${config.bot.prefix}\``)
        
        let owner = config.bot.owner.id.map(r => client.users.cache.get(r).tag).join('`** | **`')
        let owner_id = config.bot.owner.id.map(r => r).join('` | `')
        userEmbed.addField('봇 소유자', `**\`${owner}\`**\nㄴ ID: \`${owner_id}\``)

        userEmbed.addField('어드민 필요 권한', `\`${config.bot.admin}\``)
        
        userEmbed.addField('현재 세팅된 뮤트', `
Mute Name: \`${config.bot.mute.name}\`
Mute Color: \`${config.bot.mute.color}\`
        `)
        
        userEmbed.addField('로그 세팅 안내', `
Message Log | 메세지 로그
ㄴ 채널 주제: \`${config.bot.channel.log.msg.global.join('`, `')}\`

Punishment Log | 처벌 로그
ㄴ 채널 주제: \`${config.bot.channel.log.warn.join('`, `')}\`
        `)
        
        userEmbed.addField('Support', `
[Invite Link](https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&permissions=2147483639&scope=bot+applications.commands&response_type=code&redirect_uri=https%3A%2F%2Fkoreanbots.dev%2Fbots%2F467239643667234824) **|** [Support Server](${config.bot.web.discord}) **|** [Website](${config.bot.web.site}/bot)
        `)
        
        
    }
    
    if (presence.activities[0] && member.id != client.user.id) {
            
        let presenceMap = presence.activities.map(mpa => {
            let listMap = ''

            if (mpa.type == 'CUSTOM') {
                if (mpa.emoji) {
                    if (mpa.emoji.id) {
                        if (mpa.state) {
                            listMap += `Custom Status\n<${userinfo.animated[mpa.emoji.animated]}:${mpa.emoji.name}:${mpa.emoji.id}> **${mpa.state}**`
                        } else { 
                            listMap += `Custom Status\n<${userinfo.animated[mpa.emoji.animated]}:${mpa.emoji.name}:${mpa.emoji.id}>`
                        }
                    } else {
                        if (mpa.state) {
                            listMap += `Custom Status\n${mpa.emoji.name} **${mpa.state}**`
                        } else {
                            listMap += `Custom Status\n${mpa.emoji.name}`
                        }
                    }
                } else {
                    listMap += `Custom Status\n**${mpa.state}**`
                }
            } else if (mpa.type == 'PLAYING') {
                listMap += `**${mpa.name}** 하는 중`
                if (mpa.details) listMap += `\nㄴ ${mpa.details}`
                if (mpa.state) listMap += `\nㄴ ${mpa.state}`
                if (mpa.party) {
                    if (mpa.party.size) {
                        listMap += `\n Size: \`${mpa.party.size[0]}\` | \`${mpa.party.size[1]}\``
                    }
                }
                if (mpa.assets) {
                    if (mpa.assets.largeText && mpa.assets.smallText) {
                        listMap += `\n __**\`${mpa.assets.largeText}\`**__ | \`${mpa.assets.smallText}\``
                    } else if (mpa.assets.largeText && !mpa.assets.smallText) {
                        listMap += `\n __**\`${mpa.assets.largeText}\`**__`
                    } else if (mpa.assets.smallText && !mpa.assets.largeText) {
                        listMap += `\n \`${mpa.assets.smallText}\``
                    }
                }
            } else if (mpa.type == 'STREAMING') {
                if (mpa.url) {
                    listMap += `**[${mpa.name}](${mpa.url})** 방송 중`
                } else {
                    listMap += `**${mpa.name}** 방송 중`
                }
                if (mpa.details) listMap += `\nㄴ ${mpa.details}`
                if (mpa.state) listMap += `\nㄴ ${mpa.state} 하는 중`
            } else if (mpa.type == 'LISTENING') {
                listMap += `**${mpa.name}** 듣는 중`
                if (mpa.details) listMap += `\nㄴ **${mpa.details}**`
                if (mpa.state) listMap += `\n  ㄴ 아티스트: ${mpa.state}`
                if (mpa.assets) listMap += `\n  ㄴ 앨범: ${mpa.assets.largeText}`
            } else if (mpa.type == 'WATCHING') {
                listMap += `**${mpa.name}** 시청 중`
            } else if (mpa.type == 'COMPETING') {
                listMap += `**${mpa.name}** 경쟁 중`
            } else {
                listMap += '만약 이 텍스트가 보인다면 그 유저의 상태를 스샷을 찍어 보내주세요'
            }

            return listMap;
        })

        let limitNum = 0;
        let checkMap = '';

        presenceMap.forEach(r => {
            if (checkMap.replace('\n\n', '').length <= 1024) {
                checkMap += `${r + '\n\n'}`
                limitNum++
            }
        })

        let list = presenceMap.slice(limitNum - 1).join('\n\n');
        
        userEmbed.addField('현재 활동', list)
         
    }
    
    if (guild) {
        memberRole = `<@&${memberBase._roles.join('> <@&')}>`

        if (memberRole.length > 1024) memberRole = '`역할이 넘무 많아여!`'

        if (memberRole != '<@&>') userEmbed.addField('소유중인 역할', memberRole)
    }
    
    emoji = ''
    
    const badge = await fetch(config.bot.web.api + '/badge.json').then(r => r.json())
    
    let owner_badge_info = client.emojis.cache.get(badge.id.owner) 
    let boost_badge_info = client.emojis.cache.get(badge.id.boost)

    if (config.bot.owner.id.includes(member.id)) emoji += '<' + userinfo.animated[owner_badge_info.animated] + ':' + owner_badge_info.name + ':' + badge.id.owner + '>'

    if (badge[member.id]) {
        badge[member.id].badge.forEach(r => {
            if (!r.id) {
                emoji += ' ' + r.name
            } else {
                let r_badge_info = client.emojis.cache.get(r.id)
                if (r_badge_info) emoji += ' <' + userinfo.animated[r_badge_info.animated] + ':' + r_badge_info?.name + ':' + r.id + '>'
            }
        })
    }

    let kiwiserver = client.guilds.cache.get(config.bot.server).members.cache.get(member.id)

    if (kiwiserver) {
        if (kiwiserver.roles.cache.has('605746776120492032')) emoji += '<' + userinfo.animated[boost_badge_info.animated] + ':' + boost_badge_info.name + ':' + badge.id.boost + '>'
    }

    if (msg.guild) {
        if (!msg.channel.permissionsFor(msg.guild.me).has('USE_EXTERNAL_EMOJIS')) {
            emoji = ''
        } 
    }

    cli = ''

    if (presence.clientStatus && member.id != client.user.id) {
        
        if (presence.clientStatus.mobile) cli += '\n📱 Mobile | 모바일'
        if (presence.clientStatus.web) cli += '\n🌐 Web | 웹'
        if (presence.clientStatus.desktop) cli += '\n🖥 Desktop | 데스크탑'
        
    }
    
    if (cli || emoji) {
       if (!cli) { 
           userEmbed.setDescription(emoji + '឵')
       } else {
           userEmbed.setDescription(emoji + cli)
       }
   }
    
    
    return send({ embeds: [userEmbed], ephemeral: hidden })
}

async function joinedPosition(msg, member) {
    if (msg.guild.memberCount > 150) await msg.guild.members.fetch()
    const position = msg.guild.members.cache.sort(function(a, b) { return a.joinedTimestamp - b.joinedTimestamp; }).map(r => r).indexOf(member) + 1
    return '#' + position + ' - '
}
