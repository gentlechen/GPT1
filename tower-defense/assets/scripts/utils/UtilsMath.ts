// const crypto = require('crypto');

import GameLan from "../common/GameLan";


class UtilsMath {

    private numberUnit = ['', 'k', 'm', 'g',];


    /**
     * 获得一个随机整数 ：start<= randValue <= end
     * @param {Array} below
     * @return {Number}
     * @remarks {}
     */
    public RandInt(start, end) {
        return Math.floor(Math.random() * (end + 1 - start) + start);
    }

    public deepClone(obj) {
        let obj1 = JSON.stringify(obj)
        let cloneObj = JSON.parse(obj1)
        return cloneObj
    }

    public Utf8ArrayToStr(array) {
        var out, i, len, c;
        var char2, char3;

        out = "";
        len = array.length;
        i = 0;
        while (i < len) {
            c = array[i++];
            switch (c >> 4) {
                case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
                    // 0xxxxxxx
                    out += String.fromCharCode(c);
                    break;
                case 12: case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = array[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = array[i++];
                    char3 = array[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                    break;
            }
        }

        return out;
    }

    //抖动节点特效
    public ShakeNode(targetNode: cc.Node) {
        targetNode.stopAllActions();
        targetNode.angle = 0;///rotation angle
        let repeatForever = cc.repeatForever(
            cc.sequence(
                cc.delayTime(2),
                cc.rotateTo(0.1, -30),
                cc.rotateTo(0.1, 25),
                cc.rotateTo(0.1, -20),
                cc.rotateTo(0.1, 15),
                cc.rotateTo(0.1, -10),
                cc.rotateTo(0.1, 5),
                cc.rotateTo(0.1, 0)
            )
        );
        targetNode.runAction(repeatForever);
        return repeatForever;
    }

    // // 加密
    // public ShaHmac(ShaType:string, str:string, key: string){
    //     let hash = crypto.createHmac(ShaType, key)
    //     .update(str, 'utf8')
    //     .digest('hex');
    //     return hash;
    // }


    // // md5
    // public MD5(data){
    //     var md5 = crypto.createHash('md5').update(data, 'utf-8').digest('hex');
    //     return md5;
    // }

    //去色(图片)
    public GrayShader(node: cc.Node, isAllChildrenUse = false) {
        let sprite = node.getComponent(cc.Sprite);
        if (sprite) {
            sprite.setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
        }
        if (isAllChildrenUse) {
            let children = node.children;
            if (!children) return;
            for (const node of children) {
                this.GrayShader(node, isAllChildrenUse);
            }
        }
    }


    //恢复颜色（图片）
    public ResetShader(node: cc.Node, isAllChildrenUse = false) {
        let sprite = node.getComponent(cc.Sprite);
        if (sprite) {
            sprite.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
        }
        if (isAllChildrenUse) {
            let children = node.children;
            if (!children) return;
            for (const node of children) {
                this.ResetShader(node, isAllChildrenUse);
            }
        }
    }

    //是否是微信浏览器环境
    public IsWeChatBrowser() {
        var browserType = cc.sys.browserType;

        //mqqbrowser 安卓中微信浏览器标示
        if (browserType == cc.sys.BROWSER_TYPE_MOBILE_QQ) {
            return true;
        }
        //怕异常多处理wechat的判断 一般wechat是ios中微信标示
        else if (browserType == cc.sys.BROWSER_TYPE_WECHAT) {
            return true;
        }

        return false;
    }

    //是否是ios平台
    public IsIOS() {
        var browserType = cc.sys.browserType;
        if (browserType) {
            return false;
        }
        return cc.sys.os == cc.sys.OS_IOS;
    }

    //是否是安卓
    public IsAndroid() {
        var browserType = cc.sys.browserType;
        if (browserType) {
            return false;
        }
        return cc.sys.os == cc.sys.OS_ANDROID;
    }

    //是否是win
    public IsWindows() {
        var browserType = cc.sys.browserType;
        if (browserType) {
            return false;
        }
        return cc.sys.os == cc.sys.OS_WINDOWS;
    }

    //是否是浏览器
    public IsBrowser() {
        var browserType = cc.sys.browserType;
        if (browserType || cc.sys.platform == cc.sys.VIVO_GAME || cc.sys.platform == cc.sys.OPPO_GAME || cc.sys.platform == cc.sys.XIAOMI_GAME || cc.sys.platform == cc.sys.WECHAT_GAME) {
            return true;
        }
        return false;
    }

    //是否移动设备
    public IsMobile() {
        return cc.sys.isMobile;
    }
    // 获得系统语言标识
    public GetSysLanguage() {
        if (cc.sys.language == cc.sys.LANGUAGE_CHINESE) {
            return "zh";
        }
        return "en";
    }

    public IsNative() {
        if (cc.sys.isNative && cc.sys.platform != cc.sys.HUAWEI_GAME) {
            return true
        }
        return false
    }

    // 设备
    public GetDevice() {
        let device = cc.sys.os;
        if (cc.sys.isMobile) {
            device += "-mobile";
        } else if (cc.sys.isBrowser) {
            device += "-browser";
        } else {
            device += "-unknow";
        }
        return device;
    }

    // 时间戳转换
    // @param stamp: 时间戳
    // @param needDateStr: 需要的数据数组：'yMdHms'
    // @param symbolType: 间隔符，不传值默认显示“年月日时分秒”
    public getStrByTimeStamp(stamptime) {

        var time = new Date(stamptime * 1000);

        var timeObj = {};
        timeObj["y"] = time.getFullYear();
        timeObj["M"] = (time.getMonth() + 1 < 10) ? '0' + (time.getMonth() + 1) : time.getMonth() + 1;
        timeObj["d"] = (time.getDate() < 10) ? '0' + time.getDate() : time.getDate();
        timeObj["H"] = (time.getHours() < 10) ? '0' + time.getHours() : time.getHours();
        timeObj["m"] = (time.getMinutes() < 10) ? '0' + time.getMinutes() : time.getMinutes();
        timeObj["s"] = (time.getSeconds() < 10) ? '0' + time.getSeconds() : time.getSeconds();

        let dateStr = timeObj["y"] + "-" + timeObj["M"] + "-" + timeObj["d"] + " " + timeObj["H"] + ":" + timeObj["m"] + ":" + timeObj["s"];

        return dateStr;
    }

    // 显示时间 例如天之前  小时之前
    public getTimeRule(remainTime) {
        let timeStr = "";
        let dayNum = Math.floor(remainTime / 86400);
        if (dayNum > 0) {
            timeStr = dayNum + GameLan.Common_Lan["day"];
        }
        let hourNum = Math.floor(remainTime / 3600);
        if (hourNum > 0) {
            timeStr += hourNum + GameLan.Common_Lan["hour"];
        }
        let minNum = Math.floor(remainTime / 60);
        if (minNum > 0) {
            timeStr += minNum + GameLan.Common_Lan["min"];
        }
        return timeStr;
    }

    // 显示时间 天时分秒
    public getTimeDayRule(remainTime) {

        let timeStr = "";
        let dayNum = Math.floor(remainTime / 86400);
        if (dayNum > 0) {
            timeStr = dayNum + GameLan.Common_Lan["day"];
        }
        let hourNum = Math.floor((remainTime % 86400) / 3600);
        if (hourNum > 0) {
            timeStr += hourNum + GameLan.Common_Lan["hour"];
        }
        let minNum = Math.floor((remainTime % 3600) / 60);
        if (minNum > 0) {
            timeStr += minNum + GameLan.Common_Lan["min"];
        }
        let sec = remainTime % 60;
        if (sec > 0) {
            timeStr += sec + GameLan.Common_Lan["sec"];
        }

        return timeStr;
    }

    // 获得时间格式
    public getTimeForm(remainTime) {
        let timeStr = "";
        // let dayNum = Math.floor(remainTime / 86400);
        // if (dayNum < 10) {
        //     timeStr = '0' + dayNum;
        // }else{
        //     timeStr = '' + dayNum;
        // }
        let hourNum = Math.floor((remainTime % 86400) / 3600);
        if (hourNum < 10) {
            timeStr = "0" + hourNum;
        } else {
            timeStr = "" + hourNum;
        }
        let minNum = Math.floor((remainTime % 3600) / 60);
        if (minNum < 10) {
            timeStr += ":0" + minNum;
        } else {
            timeStr += ":" + minNum;
        }
        let sec = remainTime % 60;
        if (sec < 10) {
            timeStr += ":0" + sec;
        } else {
            timeStr += ":" + sec;
        }

        return timeStr;
    }

    // 获得时间格式
    public getTimeForm1(remainTime) {
        let timeStr = "";
        let dayNum = Math.floor(remainTime / 86400);
        if (dayNum < 10) {
            timeStr = '0' + dayNum;
        } else {
            timeStr = '' + dayNum;
        }
        let hourNum = Math.floor((remainTime % 86400) / 3600);
        if (hourNum < 10) {
            timeStr += ":0" + hourNum;
        } else {
            timeStr += ":" + hourNum;
        }
        let minNum = Math.floor((remainTime % 3600) / 60);
        if (minNum < 10) {
            timeStr += ":0" + minNum;
        } else {
            timeStr += ":" + minNum;
        }
        // let sec = remainTime % 60;
        // if (sec < 10) {
        //     timeStr += ":0" + sec;
        // } else {
        //     timeStr += ":" + sec;
        // }

        return timeStr;
    }

    // 数字显示转换
    public NumberUnit(_value: number) {

        let num: number = _value;
        let len = 0;
        while (num >= 100000) {
            num = num / 1000;
            len++;
        }
        num = num >> 0;
        return num + this.numberUnit[len];
    }

    /**
 * 获取起点到终点的弧度
 * @param {cc.Vec2} start 起点坐标
 * @param {cc.Vec2} end 终点坐标
 * @returns {number} 弧度
 */
    getRad(start, end) {
        let vector = cc.v2(1, 0);
        let offset_pos = cc.v2(end.x, end.y).sub(cc.v2(start.x, start.y));
        let magSqr1 = offset_pos.magSqr();
        let magSqr2 = vector.magSqr();
        if (magSqr1 === 0 || magSqr2 === 0) {
            return 0;
        }
        let angle = offset_pos.signAngle(vector);
        //cc.log('pos:', offset_pos,'rad', angle,'angle:', angle * 180 / Math.PI );
        return angle;
    }

    /**
     * 获取起点到终点的角度
     * @param {cc.Vec2} start 起点坐标
     * @param {cc.Vec2} end 终点坐标
     * @returns {number} 角度
     */
    getAngle(start, end) {
        let rad = this.getRad(start, end);
        return rad * 180 / Math.PI;
    }


}


export default new UtilsMath();