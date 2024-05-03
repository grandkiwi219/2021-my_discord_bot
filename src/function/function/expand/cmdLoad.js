const fileLoad = require("../fileLoad");
const cmd = require("../form/cmd");
const ia = require("../form/ia");
const ready = require("../../../ready");
const { MessageEmbed } = require("discord.js");

const noRun = (client, msg, config) => {
    msg.reply({
        embeds: [new MessageEmbed().setColor(config.msg.color.ocean).setTitle('이런! 죄송해요!').setDescription('아직 명령어가 덜 준비되었어요..')],
        allowedMentions: { repliedUser: false }
    });
};

module.exports = async (cmds, ias, path) => {
    fileLoad({ path: path, all: true }, async (files, pat) => {
        let theLoad = files.filter(r => ready.lang.includes(r.split('.').pop()));
        let theFile = files.filter(r => r.split('.').length < 2);

        let checkCmds = false;

        try {
            cmds.get('exam');
        } catch (e) {
            checkCmds = true;
        }

        if (checkCmds) return console.log("명령어 추가 오브젝트가 Map 형식이 아닙니다.");

        if (theLoad.length > 0) await theLoad.forEach(r => {
            const load = require("../../../" + pat + "/" + r);
            if (!load.help) load.help = {};
            if (!load.help.name) load.help.name = r.split('.')[0];
            load.help = cmd(cmds, load.help);
            load.run = load.run ? load.run : noRun;

            if (load.ia) {
                if (load.ia.enable) {
                    load.ia.data = ia(load.help, load.ia.data);
                    ias.push(load.ia.data);
                }
            }
            
            cmds.set(load.help.name, load);
        });

        if (theFile.length > 0) await theFile.forEach(r => {
            fileLoad({ path: pat + '/' + r }, (fil, pa) => {
                let checkIndex;

                try {
                    require("../../../" + pa + "/index." + ready.lang[0]);
                    checkIndex = true;
                } catch (e) {
                    checkIndex = false;
                }

                const index = checkIndex ? require("../../../" + pa + "/index." + ready.lang[0]) : {};
                if (!index.name) index.name = r.split('.')[0];

                fil.filter(t => t.split('.')[0] != 'index').forEach(t => {
                    const load = require("../../../" + pa + "/" + t);
                    if (!load.help) load.help = {};
                    if (!load.help.name) load.help.name = t.split('.')[0];
                    load.help = cmd(cmds, load.help, index);
                    load.run = load.run && typeof load.run === 'function' ? load.run : noRun;

                    if (load.ia) {
                        if (load.ia.enable) {
                            load.ia.data = ia(load.help, load.ia.data);
                            ias.push(load.ia.data);
                        }
                    }
                    
                    cmds.set(load.help.name, load);
                });
            });
        });

        console.log('명령어를 로드 했습니다.');
    });
}
