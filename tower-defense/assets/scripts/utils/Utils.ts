import ResourceLoader from "./ResourceLoader";

import myMD5 = require("./md5");
import UIManager from "../manage/UIManager";
import AudioMgr from "../manage/AudioMgr";
import DLocal from "../data/DLocal";
import { UIPath } from "../common/UIPath";
import { ImgPath } from "../common/ImgPath";
import GameLan from "../common/GameLan";


cc.game.on(cc.game.EVENT_HIDE, () => {
    console.log('切到后台 sound');
    // if (AudioMgr._bgmswitch == 1) {
    //     AudioMgr.pauseMusic();
    // }
    // if (AudioMgr._sfxswitch == 1) {
    //     AudioMgr.pauseAllSound();
    // }
});
cc.game.on(cc.game.EVENT_SHOW, () => {
    console.log('切回前台  sound');

    // if (AudioMgr._bgmswitch == 1) {
    //     AudioMgr.resumeMusic();
    // }
    // if (AudioMgr._sfxswitch == 1) {
    //     AudioMgr.resumeAllSound();
    // }
});

class Utils {

    private static logName: string;

    /**
     * 场景切换
     *
     * @param {string} sceneName 场景名
     * @memberof Utils
     */
    LoadScene(sceneName: string) {
        //cc.director.loadScene(sceneName);
        cc.resources.loadScene(sceneName, (err, sceneAsset) => cc.director.runScene(sceneAsset));
    }

    // md5 加密
    MD5(content: string | number[]) {
        return myMD5(content)
    }

    // 随机数
    getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 动态加载普通预制（有做资源释放）
     *
     * @param {资源路径} resPath
     * @param {界面中的this} self
     * @param {回调} callback
     */
    LoadPrefab(resPath: string, self, callback: Function) {

        if (DLocal.IsLoadingRes(resPath)) {
            return;
        }
        DLocal.SetLoadingRes(resPath);
        if (DLocal.GetDynamicRes(resPath)) {
            let resData = DLocal.GetDynamicRes(resPath);
            DLocal.ClearLoadingRes(resPath);
            if (self.AddResQuote) {
                self.AddResQuote(resPath)
            }
            DLocal.AddResIndex(resPath);
            if (resData.instance && resData.instance._prefab == null) {
                resData.instance = cc.instantiate(resData["prefab"]);
            }

            callback(resData.instance);

            return;
        }
        ResourceLoader.load(resPath,
            (err, prefab) => {

                DLocal.ClearLoadingRes(resPath);
                if (err) {
                    console.error("加载失败 ：" + resPath);
                    console.error(err);
                    return;
                }

                let layer = cc.instantiate(prefab);

                DLocal.AddDynamicRes(resPath, layer, prefab);
                if (self.AddResQuote) {
                    self.AddResQuote(resPath)
                }

                if (layer) {
                    callback(layer);
                }
            }
        )
    }

    /**
     * 动态加载资源
     *
     * @param {资源路径} resPath
     * @param {资源类型 可以填空} resType 
     * @param {回调} callback
     */
    LoadRes(resPath: string, self, callback: Function, resType = null) {

        if (resPath.indexOf('.')) {
            let resArr = resPath.split('.');
            resPath = resArr[0];
            if (resType == null) {
                resType = this.getAssetsTypeSuffix(resArr[1]);
            }
        }


        if (DLocal.GetPreloadAtlas()[resPath]) {

            callback(DLocal.GetPreloadAtlas()[resPath]);
        } else {

            if (DLocal.IsLoadingRes(resPath)) {
                return;
            }
            DLocal.SetLoadingRes(resPath);

            if (DLocal.GetDynamicRes(resPath)) {

                console.log("-------------- 缓存1")
                DLocal.ClearLoadingRes(resPath);
                if (self.AddResQuote) {
                    self.AddResQuote(resPath)
                }
                DLocal.AddResIndex(resPath);
                let resData = DLocal.GetDynamicRes(resPath);
                callback(resData.prefab);

                return;
            }

            ResourceLoader.load(resPath, resType,
                (err, data) => {

                    DLocal.ClearLoadingRes(resPath);
                    if (err) {
                        console.error("加载失败 ：" + resPath);
                        console.error(err);
                        return;
                    }

                    DLocal.AddDynamicRes(resPath, null, data);
                    if (self.AddResQuote) {
                        self.AddResQuote(resPath)
                    }
                    if (callback) {
                        callback(data);
                    }

                    // cc.assetManager.releaseAsset(data);
                }
            )
        }

    }

    // 动态加载图片
    loadImg(resPath: string, callback) {

        ResourceLoader.load(resPath, cc.SpriteFrame,
            (err, spriteFrame) => {
                if (err) {
                    console.log(err);
                }
                if (callback) {
                    callback(spriteFrame);
                }
            }
        )
    }

    public getAssetsTypeSuffix(suffix) {
        switch (suffix) {
            case "jpg":
            case "png":
                return cc.SpriteFrame;
            case "plist":
                return cc.SpriteAtlas;
            case "mp3":
                return cc.AudioClip;
            case "atlas":
                return sp.SkeletonData;
            case "prefab":
                return cc.Prefab;
        }
    }


    /**
     * 动态加载远程文件
     *
     * @param {string} resPath
     * @param {*} resType
     * @param {Function} callback
     * @memberof Utils
     */
    public LoadRemoteRes(resPath: string, callback: Function, resType = null) {
        cc.assetManager.loadRemote(resPath, resType,
            (err, data) => {
                if (err) {
                    console.error("加载失败 ：" + resPath);
                    console.error(err);
                    return;
                }
                callback(data);


            }
        )
    }

    // http请求
    public HttpRequestGET(url: string, callback: Function) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) { // 接收完毕
                if (xhr.status >= 200 && xhr.status < 400) {// 响应中的数字状态码：表示为有效响应，成功的请求
                    var response = xhr.responseText; // 对文本请求的响应
                    if (response) {
                        var responseJson = JSON.parse(response); // 解析完的json 文件再返回 回调函数
                        callback(responseJson);
                    } else {
                        callback(false);
                    }
                } else {
                    callback(false);
                }
            }
        }

        xhr.open("GET", url, false); // param: 1,使用的HTTP方法， 2，请求的url, 3,异步吗？
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");  //告诉服务器如何解析我的内容
        xhr.send();

    }



    // 飘窗提示
    public FlyTip(explainStr) {
        UIManager.ShowForm(UIPath.UIFlyTip, explainStr);
    }

    // 只加载头像和数量
    public LoadHeadAndNum(HeadItem: cc.Node, uniformId, numValue: number = 0) {
        this.LoadRes(ImgPath.playerIconAtlas, this, (atlas) => {

            let iconName = DLocal.GetCfgData("uniformitem")[uniformId].Icon.replace("_png", "");
            // imgHead.spriteFrame = atlas.getSpriteFrame(iconName)
            HeadItem.getChildByName("imgHead").getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(iconName);

            let item = HeadItem.getChildByName("labNum");
            if (numValue != 0) {

                item.getComponent(cc.Label).string = numValue + "";
                item.active = true;
            } else {
                item.active = false;
            }
        }, cc.SpriteAtlas)
    }


    /**品质对应文字 */
    // public GetQualityName(quality: number): string {
    //     let str = '';
    // switch (quality) {
    //     case QualityBorder.White:
    //         str = '';
    //         break;
    //     case QualityBorder.Green:
    //         str = GameLan.quality_Lan["green"];
    //         break;
    //     case QualityBorder.Blue:
    //         str = GameLan.quality_Lan["blue"];
    //         break;
    //     case QualityBorder.BluePlus:
    //         str = GameLan.quality_Lan["blueplus"];
    //         break;
    //     case QualityBorder.Purple:
    //         str = GameLan.quality_Lan["purple"];
    //         break;
    //     case QualityBorder.PurplePlus:
    //         str = GameLan.quality_Lan["purpleplus"];
    //         break;
    //     case QualityBorder.Orange:
    //         str = GameLan.quality_Lan["orange"];
    //         break;
    //     case QualityBorder.OrangePlus:
    //         str = GameLan.quality_Lan["orangeplus"];
    //         break;
    //     case QualityBorder.Red:
    //         str = GameLan.quality_Lan["red"];
    //         break;
    //     case QualityBorder.RedPlus:
    //         str = GameLan.quality_Lan["redplus"];
    //         break;
    //     case QualityBorder.WhiteGold:
    //         str = GameLan.quality_Lan["whitegold"];
    //         break;
    //     case QualityBorder.WhiteGoldPlus:
    //         str = GameLan.quality_Lan["whitegoldplus"];
    //         break;
    //     case QualityBorder.WhiteGoldPlusTwoStar:
    //         str = GameLan.quality_Lan["whitegoldplustwostar"];
    //         break;
    //     case QualityBorder.WhiteGoldPlusThreeStar:
    //         str = GameLan.quality_Lan["whitegoldplusthreestar"];
    //         break;
    //     case QualityBorder.WhiteGoldPlusFourStar:
    //         str = GameLan.quality_Lan["whitegoldplusfourstar"];
    //         break;
    //     case QualityBorder.WhiteGoldPlusFiveStar:
    //         str = GameLan.quality_Lan["whitegoldplusfivestar"];
    //         break;
    // }
    // return str;
    // }

    // 数字显示
    public NumerDeal(count) {
        var description = "" + count;
        if (count >= 1000000000) {
            var num = Math.floor(count / 100000000);
            description = (num / 10) + 'b';
        }
        else if (count >= 1000000) {
            var num = Math.floor(count / 100000);
            description = (num / 10) + 'm';
        }
        else if (count >= 1000) {
            var num = Math.floor(count / 100);
            description = (num / 10) + 'k';
        }


        return description;
    }

    // 把1、2、3转换为一、二、三
    public convertToChinese(num: Number) {
        let chinessArr = ["十", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

        let numStr = num.toString();
        let len = num.toString().length;
        let c_num = [];

        for (let i = 0; i < len; i++) {

            c_num.push(chinessArr[Number(numStr[i])]);
        }

        return c_num.join('');
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

    // 是否是微信小游戏
    public IsWeChatGame() {
        if (cc.sys.platform == cc.sys.WECHAT_GAME) {
            return true;
        }
        return false;
    }

    /**
 * 显示物品详情
 *
 * @param {cc.Node} node  点击的node
 * @param {number} content  内容
 * @param {cc.Vec2} pos  物品详情界面位置
 * @memberof UtilsMgr
 */
    public ShowTipInfoView(node: cc.Node, content: string, setHeight = null, pos: cc.Vec2 = cc.v2(0, 0)) {
        let isGoods = false;
        node.off(cc.Node.EventType.TOUCH_START);
        node.off(cc.Node.EventType.TOUCH_CANCEL);
        node.off(cc.Node.EventType.TOUCH_END);

        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            //UtilsMgr.OpenItmeInfoView(6, cc.v2(0, -300));
            UIManager.ShowForm(UIPath.UIItemInfo, content, pos, node, isGoods, setHeight);
        })
        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            UIManager.CloseForm(UIPath.UIItemInfo);
        })
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            UIManager.CloseForm(UIPath.UIItemInfo);
        })
        node.on(cc.Node.EventType.CHILD_REMOVED, function (event) {
            console.log("------------------关闭")
            UIManager.CloseForm(UIPath.UIItemInfo);
        })

    }
}

export default new Utils();