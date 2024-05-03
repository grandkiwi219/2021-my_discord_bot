const fileLoad = require("./function/fileLoad");
const setting = require("./function/form/start");

module.exports = setting('함수');

if (!module.exports.already) {
    fileLoad({ path: 'function/function' }, { func: 'start', module: module.exports });
}
