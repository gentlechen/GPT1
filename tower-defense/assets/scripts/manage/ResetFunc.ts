

import { MusicPath } from "../common/GameEnum";
import AudioMgr from "./AudioMgr";
import Config from "../Config";



//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html

export class ResetFunc {

    public LOGIN_LAN = null;

    private static instance: ResetFunc;
    public static getInstance(): ResetFunc
    {
        if(this.instance == null)
        {
            this.instance = new ResetFunc();
            this.instance.Init();
        }
        return this.instance;
    }

    private Init(){
        if (Config.IsInsideDebug) {
            console.log = function log() {};
        }

        // this.reButton();
        this.reStringFunc();
    }

    // 重写按钮
    private reButton(){
        // 按钮事件
        var Super = function(){};
        Super.prototype = cc.Button.prototype;
        //实例化原型
        Super.prototype._onTouchEnded = function (t) {
            if (this.interactable && this.enabledInHierarchy) {

                //cc.hb.audioMgr.playEffect("click", false);//播放按钮Button音频
                //console.log("测试 点击");
                //AudioMgr.playEffect(MusicPath.CLICKMUSIC);

                if (this._pressed) {
                    cc.Component.EventHandler.emitEvents(this.clickEvents, t);
                    this.node.emit("click", this);
                }
                this._pressed = !1;
                this._updateState();
                t.stopPropagation();
            }
        };

        Super.prototype._onTouchCancel = function () {
            if (!this.interactable || !this.enabledInHierarchy) return;
        
            this._pressed = false;
            this._updateState();
        
            //console.log("测试 点击取消");
            //this.scheduleOnce(function(){
                //gcc.audioMgr.playClickedBgm();
            //},0.05);
        };

        Super.prototype._onTouchBegan = function (event) {
            if (!this.interactable || !this.enabledInHierarchy) return;
            this._pressed = true;
            this._updateState();
            event.stopPropagation();
        };
    }

    // 重写字符串功能
    private reStringFunc(){
        // 字符串
        var stringSuper = function(){};
        stringSuper.prototype = String.prototype;
        stringSuper.prototype.format = function (args) {
            if (arguments.length > 0) {
                var result = this;
                if (arguments.length == 1 && typeof (args) == "object") {
                    for (var key in args) {
                        var reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, args[key]);
                    }
                }
                else {
                    for (var i = 0; i < arguments.length; i++) {
                        if (arguments[i] == undefined) {
                            return "";
                        }
                        else {
                            var reg = new RegExp("({[" + i + "]})", "g");
                            result = result.replace(reg, arguments[i]);
                        }
                    }
                }
                return result;
            }
            else {
                return this;
            }
        };
    }
}
  
