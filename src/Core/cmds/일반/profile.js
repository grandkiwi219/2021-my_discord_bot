const Discord = require("discord.js");
const { userinfo } = require("../../../settings").info;
const Canvas = require("canvas");
const mla = require("mee6-levels-api");
const moment = require("moment");
const fetch = require("node-fetch");

module.exports.help = {
    aliases: ["pf"]
}

module.exports.run = async (gkb, msg, config, args) => {

    let canvas = Canvas.createCanvas(1024, 1024)
    let ctx = canvas.getContext('2d')

    let eType = 'custom'
    loadingEmoji = config.msg.emoji[eType].loading

    if (msg.guild) {
        if (!msg.channel.permissionsFor(msg.guild.me).has('USE_EXTERNAL_EMOJIS')) eType = 'basic'
        if (!msg.channel.permissionsFor(msg.guild.me).has('EMBED_LINKS')) return msg.channel.send(config.msg.message.embed.replace('{zui}', config.msg.title.zui))
    }

    let waitEmbed = new Discord.MessageEmbed()
    .setColor(config.msg.color.base)
    .setFooter(config.bot.initial)
    .setTitle(loadingEmoji + ' 처리 중입니다')
    .setDescription('처리 중이니 잠시만 기다려주시길 바랍니다!')

    let errorE = new Discord.MessageEmbed()
    .setColor(config.msg.color.error)
    .setFooter(config.bot.initial)
    .setTitle(config.msg.title.error)

    msg.channel.send({ embeds: [waitEmbed] }).then(async function(m) {

        if (msg.guild) {
            if (!msg.channel.permissionsFor(msg.guild.me).has('ATTACH_FILES')) {
                m.delete()
                return msg.channel.send({ embeds: [errorE.setDescription('`사진 업로드 권한`을 확인 할 수 없습니다')] })
            }
        }

        var memberBasic = ''

        var member = ''

        if (msg.guild) {
            let userID = args.join('').replace(/<@/g, '').replace(/>/g, '')
            memberBasic = msg.guild.members.cache.get(msg.mentions.users.first()?.id) || msg.guild.members.cache.get(userID) || msg.member
            member = memberBasic.user
        } else {
            member = msg.author
        }

        let avatar = await Canvas.loadImage(member.displayAvatarURL({ format: 'png', size: 2048 }));
        var icon = ''

        const background = await fetch(config.bot.web.api + '/background.json').then(r => r.json())

        if (background[member.id]) {
            backgroundLink = ''
            if (background[member.id]["pictures"]) {
                backArr = background[member.id]["pictures"]
                random = Math.floor(Math.random() * backArr.length)
                backgroundArr = backArr[random]
                if (!backgroundArr.startsWith('http')) {
                    backgroundLink = config.bot.web.site + '/bot/img/' + backgroundArr
                } else {
                    backgroundLink = backgroundArr
                }
                icon = await Canvas.loadImage(backgroundLink)
            } else if (background[member.id]["picture"]) {
                backgroundEle = background[member.id]["picture"]
                if (!backgroundEle.startsWith('http')) {
                    backgroundLink = config.bot.web.site + '/bot/img/' + backgroundEle
                } else {
                    backgroundLink = backgroundEle
                }
                icon = await Canvas.loadImage(backgroundLink)
            } else {
                icon = await Canvas.loadImage(config.bot.web.site + '/bot/img/basic.png')
            }
        } else if (msg.guild) {
            if (msg.guild.iconURL()) {
                icon = await Canvas.loadImage(msg.guild.iconURL({ format: 'png', size: 2048}))
            } else {
                icon = await Canvas.loadImage(config.bot.web.site + '/bot/img/basic.png') 
            }
        } else {
            icon = await Canvas.loadImage(config.bot.web.site + '/bot/img/basic.png')
        }

    //---------------------------------------------

        var customStatusWidth = 0
        var mee6Width = 0

    //---------------------------------------------

        let presence = member.presence || { activities: [] }
	
	if (presence.activities[0]) {
            if (member.presence.activities[0].type == 'CUSTOM_STATUS') {
                if (member.presence.activities[0].state) {
                    if (member.presence.activities[0].state.length < 31) {
                        customStatusWidth = 80
                    }
                }
            }
        }

        var mee6 = ''

        if (msg.guild) {
            await mla.getUserXp(msg.guild.id, member.id).then(m => mee6 = m).catch(e => mee6 = '')

            if (mee6) mee6Width = 80
        }
	    
    //---------------------------------------------

        ctx.fillStyle = 'rgba(51, 51, 51, 0.5)'
    
        ctx.drawImage(icon, 0, 0, 1024, 1024)
        ctx.fillRect(0, 512 - customStatusWidth - mee6Width, 1024, 1024)

        Canvas.registerFont('src/storage/font/나눔손글씨 암스테르담.ttf', {family:'kiwiFont'})

        ctx.font = '72px kiwiFont';
        ctx.fillStyle = '#ffffff';

        ctx.fillText(userinfo.status[presence.status], 360, 575 - customStatusWidth - mee6Width);
        ctx.fillText(member.tag, 135 - ( member.tag.length * 3 ), 677 - customStatusWidth - mee6Width);
   
    //---------------------------------------------
	    
         if (customStatusWidth) {
            ctx.fillText(`"${presence.activities[0].state}"`, 110, 677 - mee6Width)
        }
	    
    //---------------------------------------------

        ctx.fillText('생성일 :', 110, 772 - mee6Width)
        if (msg.guild) {
            ctx.fillText('입장일 :', 110, 862 - mee6Width)
        }

    //---------------------------------------------

        if (mee6Width) {
            ctx.fillText('#' + mee6.rank, 190, 861)
            ctx.fillText(mee6.level, 580, 861)
        }
	    
    //---------------------------------------------

        ctx.fillStyle = 'rgb(200, 200, 200)'

    //---------------------------------------------

        let x = Date.now() - gkb.users.cache.get(member.id).createdAt;
        const created = Math.floor(x / 86400000);

        ctx.fillText(`${moment(member.createdAt, "Asia/Seoul").add(9, 'h').format("L")} | ${created} 일 전`, 280, 772 - mee6Width)

        if (msg.guild) {
            let y = Date.now() - msg.guild.members.cache.get(member.id).joinedAt;
            const joined = Math.floor(y / 86400000);

            ctx.fillText(`${moment(memberBasic.joinedAt, "Asia/Seoul").add(9, 'h').format("L")} | ${joined} 일 전`, 280, 862 - mee6Width)
        }

    //---------------------------------------------

        ctx.font = '40px kiwiFont'

        if (mee6Width) {

            ctx.fillText('Rank', 110, 865)
            ctx.fillText('Level', 500, 865)

        }

        ctx.font = '50px kiwiFont'
        ctx.fillStyle = '#ffffff'

        if (mee6Width) {

            ctx.fillText(mee6.xp.userXp + ' / ' + mee6.xp.levelXp + ' - ' + Math.floor((mee6.xp.userXp / mee6.xp.levelXp) * 10000) / 100 + ' %', 110, 977)

        }
	    
    //---------------------------------------------

        var rectX = 100;
        var rectY = 880; 
        var rectWidth = 800; 
        var rectHeight = 50;
        var cornerRadius = 50;
        ctx.lineJoin = "round";
        ctx.lineWidth = cornerRadius;

        if (mee6Width) {

            mee6Color = memberBasic.displayHexColor

            if (mee6Color == '#000000') mee6Color = config.msg.color.base

            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'
 
            ctx.strokeRect(rectX+(cornerRadius/2), rectY+(cornerRadius/2), rectWidth-cornerRadius, rectHeight-cornerRadius);

            ctx.strokeStyle = mee6Color

            mee6XpLength = Math.floor((mee6.xp.userXp / mee6.xp.levelXp) * 10000) / 100

            ctx.strokeRect(rectX+(cornerRadius/2), rectY+(cornerRadius/2), (mee6XpLength*8)-cornerRadius, rectHeight-cornerRadius);

        }

    //---------------------------------------------
 
        ctx.beginPath()
        ctx.lineWidth = 10
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.65)'
    
        ctx.strokeRect(110, 402 - customStatusWidth - mee6Width, 220, 220)
    
        ctx.drawImage(avatar, 120, 412 - customStatusWidth - mee6Width, 200, 200)
    
    //---------------------------------------------

        let imagE = await new Discord.MessageAttachment(canvas.toBuffer(), 'profile.png'); 
    
    //---------------------------------------------

        m.delete().then(() => msg.channel.send({ files: [imagE] }))

    }).catch(e => msg.channel.send({ embeds: [errorE.setDescription('```\n' + e.message + '\n```')] }))
    
};
