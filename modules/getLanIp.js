const {execSync} = require('child_process')
const getIfconfigCmd = 'ifconfig en0 inet';

const getLanIp = () => {
    try {
        const result = execSync(getIfconfigCmd).toString()
        const ipReg = /192.168.\d{1,3}.\d{1,3}/g;
        let lanIp = '';
        if (ipReg.test(result)) {
            const r = result.match(ipReg)
            lanIp = r[0]
        }
        return lanIp;
    } catch (e) {
        console.error(e);
    }
}

module.exports = getLanIp;