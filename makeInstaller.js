const path = require('path')
const fs = require('fs')
let version = JSON.parse(fs.readFileSync(path.join(__dirname,"package.json"),"utf8")).version.replace(/-alpha\./g,".1").replace(/-beta\./g,".2").replace(/-rc\./g,".3");
const appName = path.join(__dirname,`out/dotSwitch-darwin-x64/dotSwitch.app`)
var opts = {
    appPath: appName,
    out:path.join(__dirname,"out/make/"),
    name:`dotSwitch-${version}`,
    icon:path.join(__dirname,"icon.icns"),
    overwrite:true,
    debug:true,
};
var createDMG = require('electron-installer-dmg');
createDMG(opts, function done (err) {
    if (err) {
        console.log(err);
    }
    console.log('mac打包成功')
})