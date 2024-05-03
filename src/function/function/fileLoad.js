const fs = require("fs");
const ready = require("../../ready");
const { root } = require("../../../package");
const settings = { path: ready.start.location, lang: ready.lang };

module.exports = (options, func) => {
    let content = options ? options : settings;

    typeof content == 'object' && !Array.isArray(content) ? '' : content = settings;
 
    content.path ? '' : content.path = ready.start.location;
    content.lang ? Array.isArray(content.lang) ? '' : content.lang = ready.lang : content.lang = ready.lang;

    typeof func == 'object' && !Array.isArray(func) ? func.func == 'start' ? content.all = true : '' : '';

    const { path, lang } = content;

    fs.readdir(root + path, async (e, f) => {
        if (e) return console.log(e);

        let files = f.filter(r => content.all ? true : lang.includes('normal file') ? r.split('.').length < 2 : lang.includes(r.split('.').pop()));

        if (files.length < 1) return console.log(path + '에 ' + lang.join(', ') + ' 파일이 없음');

        if (!func) {
            files.forEach(r => require("../../" + path + "/" + r));
        } else if (typeof func == 'object' && !Array.isArray(func)) {
            if (func.func == 'start') {
                try {
                    let theStart = files.filter(r => lang.includes(r.split('.').pop()))
                    let theFile = files.filter(r => r.split('.').length < 2)

                    if (theStart.length > 0) {
                        await theStart.forEach(r => {
                            func.module[r.split('.')[0]] = require("../../" + path + "/" + r);
                        })
                    } else console.log(lang.join(', ') + ' 파일이 없음.' + " | " + func.module.type + " |");

                    if (theFile.length > 0) {
                       await theFile.forEach(t => {
                            fs.readdir(root + path + '/' + t + '/', (err, fil) => {
                                if (err) return console.log(err);

                                let filesS = fil.filter(r => lang.includes(r.split('.').pop()));

                                if (filesS.length < 1) return console.log('기본 파일 내에 ' + lang.join(', ') + ' 파일이 없음' + " | " + func.module.type + " |");

                                func.module[t] = {};

                                filesS.forEach(y => func.module[t][y.split('.')[0]] = require('../../' + path + '/' + t + '/' + y));
                            })
                        })
                    } else console.log('기본 파일이 없음.' + " | " + func.module.type + " |");

                    theStart || theFile ? func.module.error = false : '';
                    func.module.already = true;

                    ready.ready.emit(ready.events.ready, { type: func.module.type, path: path })
                } catch (e) {
                    func.module.error = e;
                    func.module.already = true;
                    ready.ready.emit(ready.events.ready, { type: func.module.type, path: path, error: e })
                }
            }
        } else {
            if (typeof func == 'function') {
                try {
                    func(files, path);
                } catch (e) {
                    console.log(path + '에서 파일을 불러오는 중에 오류가 발생했습니다.');
                    console.log(e);
                }
            } else {
                console.log('fileLoad 함수의 두번째 칸은 대개 함수 형식이여야 합니다.');
            }
        }
    })
}
