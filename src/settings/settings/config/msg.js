const zui = '⛔ 주의'

module.exports = {
    title: {
        uw: '📗 올바른 사용법',
        zui: zui,
        alim: '🔔 알림',
        error: '❗ 오류'
    },
    color: {
        base: '#AEFFA0',
        ocean: '#84DEFF',
        red_right: '#FF7899',
        uw: '#FFF7B6',
        zui: '#FF6167',
        alim: '#FEF883',
        error: '#FF0C42'
    },
    msg: {
        zui: {
            owner: '당신은 봇 소유자가 아닙니다!',
            staff: '당신은 관리자가 아닙니다!',
            bot: '당신은 봇입니다!',
            no: '금지된 작업입니다!'
        },
        error: '오류가 났습니다!',
        embed: `> **${zui}**\n> \n> \`링크 보내기 권한\`을 확인 할 수 없습니다`
    },
    emoji: {
        custom: {
            check: '<a:_check:764139773933387776>',
            check_name: '_check',
            check_id: '764139773933387776',

            no: '<a:_x:764139803833925683>',
            no_name: '_x',
            no_id: '764139803833925683',

            loading: '<a:mc_loading:800006715809595392>'
        },
        basic: {
            check: '✅',
            no: '❎',
            loading: '🔧'
        }
    }
}
