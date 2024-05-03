const { web } = require("../../../ready");

module.exports = {
    prefix: require('../../../../prefix.json').prefix, //'>',
    msg: false,

    owner: {
        id: [],
        protect: false
    },
    admin: ['BAN_MEMBERS'],

    server: '467097011011977236',
    channel: {
        log: {
            msg: {
                root: '563001761783349262',
                global: ['챗-로그', 'chat-log']
            },
            warn: ['키위-로그', 'kiwi-log'],
            other: {
                root: '802761199350710292'
            }
        },
        notice: {
            root: '479159275147493377'
        },
        count: {
            root: '749222152372355092'
        }
    },
    mute: {
        name: '뮤트',
        color: '#000001'
    },
/*
    activity: {
        type: 'PLAYING',
        status: 'online',
        msg: [
            ""
        ],
        sec: 7
    },
*/
    web: {
        site: web.root.location + web.root.domain,
        discord: web.root.location + 'invite.' + web.root.domain,
        api: web.root.location + 'api.' + web.root.domain,

        koreanbots: web.root.location + 'api.koreanbots.dev/v2'
    }
}