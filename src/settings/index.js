const fileLoad = require("../function/function/fileLoad");
const setting = require("../function/function/form/start");

module.exports = setting('세팅');

if (!module.exports.already) {
    fileLoad({ path: 'settings/settings' }, { func: 'start', module: module.exports });
}
