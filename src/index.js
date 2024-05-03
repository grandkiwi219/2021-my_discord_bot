const ready = require("./ready");
const fileLoad = require("./function/function/fileLoad");

console.log("시작 설정 중...");

fileLoad({ path: "/", lang: ["normal file"] }, async (files, path) => {
    let load = await files.filter(r => !ready.start.location.includes(r) && !ready.lock.includes(r));

    ready.size.total = load.length;

    load.forEach(r => require("." + path + "/" + r));
});


ready.ready.on(ready.events.execute, async () => {
        try {
            await fileLoad();
            console.log("프로그램을 실행합니다.");
        } catch (e) {
            console.log("프로그램 실행 도중에 오류가 발생했습니다.");
            console.log(e);
        }
});


ready.ready.on(ready.events.ready, (type) => {
    if (ready.already) return;

    if (type.error) {
        console.log(type.type + " 설정 중 오류 발생.");
        ready.size.current += 1;
        ready.catch.error.push(type.type);
        return console.log(type.error);
    }

    console.log(type.type + " 설정 완료.");
    ready.size.current += 1;

    if (ready.size.current >= ready.size.total) {
        if (ready.catch.error.length >= 1) {
            console.log(ready.catch.error.join(', ') + ' 파일에 문제가 생겨 프로그램을 실행 할 수 없습니다.');
        } else {
            ready.ready.emit(ready.events.execute);
            ready.already = true;
        }
    }
});
