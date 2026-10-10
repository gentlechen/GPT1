import AudioMgr from "./AudioMgr";
import { MusicPath } from "../common/GameEnum";
import UIManager from "./UIManager";
import GameEvent from "../common/GameEvent";
import DLocal from "../data/DLocal";
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html

//界面层级枚举
var ZorderLvEnum = cc.Enum({
    //置底界面层(UIFightTower)
    ZorderLv0: 0,

    //聊天层(UIChat)
    ZorderLv1: 1,

    //玩家头像层(UIPlayer)
    ZorderLv2: 2,

    //通用背景层(UIResource)
    ZorderLv3: 3,

    //布阵层
    ZorderLv4: 4,

    //主场景工具层(UIMenu)
    ZorderLv5: 5,

    //正常界面层(多数界面)
    ZorderLv6: 6,

    //置顶层(3级界面使用到,UICardPackFragSale)
    ZorderLv7: 7,

    //模态层,消息提示层(UIMessage)
    ZorderLv8: 8,

    //debugTool界面
    ZorderLv9: 9
});

//界面动画枚举
var ActionEnum = cc.Enum({
    Action0: 0,  // 直接出现
    Action1: 1,  // 淡入淡出
    Action2: 2,  // 弹框
})

const { ccclass, property } = cc._decorator;

@ccclass
export default class UIBase extends cc.Component {

    @property({
        tooltip: "界面层级",
        type: ZorderLvEnum
    })
    public zorderLv = ZorderLvEnum.ZorderLv1; // 默认层级

    @property({
        tooltip: "界面动画 \n  Action0:0 直接显示\n  Action1: 淡入淡出 \n Action2: 弹框",
        type: ActionEnum
    })
    private actionLv = ActionEnum.Action0; // 默认动画

    private defaultAnimSpeed = 0.15; // 界面的动画时间
    private _perSec = 0; // 每一帧累加时间
    private _clickBtnTime = 0; // 每次点击时间
    private _argList = null;  // 参数
    private _layerPath = null;  // 界面路径

    private InitBTNodeScale: number = 0;
    private InitBTNodePos: cc.Vec3 = cc.v3(0, 0, 0);
    private InitBTNodeOpacity: number = 0;

    public _allDynamicPrefabs = {};  // 界面中收集动态加载的资源
    public _recordQuoteMap = {};  // 这个界面引用的资源

    private _recordTg = null;

    // 加载创建
    onLoad() {
        // let CT = this.node.getChildByName("bg") as cc.Node;
        // if (CT) {
        //     this.InitBTNodeScale = CT.scale;
        //     this.InitBTNodePos = CT.position;
        //     this.InitBTNodeOpacity = CT.opacity;
        // }

        let layer = this.node.getChildByName("ct")
        if (layer) {

            this.InitBTNodeScale = layer.scale;
            this.InitBTNodePos = layer.position;
            this.InitBTNodeOpacity = layer.opacity;

            // layer.opacity = 0;
            if (ActionEnum.Action2 == this.actionLv) {
                layer.active = true;
            } else {
                layer.active = false;
            }
        }

        // 子类中重写
        this.OnInit();
    }

    // 显示界面
    public ShowForm(uiName: string, data: any, layerPath: string) {

        this.node.opacity = 255;
        this._layerPath = layerPath;
        let parent = cc.find("Canvas/UILayer");


        if (!parent) {
            console.error("uiLayer is no exist");
            return;
        }
        if (this.node.parent == parent) {
            this.node.removeFromParent(false);
        }
        if (this.node.name != uiName) {
            this.node.name = uiName;
        }
        parent.addChild(this.node, this.zorderLv);

        if (data == null) {
            this.OnShow();
        } else {
            this.OnShow.apply(this, data);
        }

        let CT = this.node.getChildByName("bg");
        if (this.actionLv == ActionEnum.Action2) {
            CT = this.node;
        }

        if (CT) {
            this.LayerAction(CT, this.actionLv, () => {
                let layer = this.node.getChildByName("ct");
                if (layer && layer.active != true) {
                    layer.active = true;
                    //     setTimeout(() => { // 动画延迟10毫秒

                    //         layer.active = true;
                    //         // if (layer.isValid) {
                    //         //     layer.runAction(cc.fadeTo(0.3, 255))
                    //         // }
                    //     }, 10);
                }

            })
        } else {
            let layer = this.node.getChildByName("ct");


            if (layer && layer.active != true) {

                layer.active = true;
                //     setTimeout(() => { // 动画延迟10毫秒

                //         layer.active = true;
                //         // if (layer.isValid) {
                //         //     layer.runAction(cc.fadeTo(0.3, 255))
                //         // }
                //     }, 10);
            }
        }
    }

    // 界面动画
    private LayerAction(layer, actionType, callback) {

        if (!layer) {
            return;
        }
        layer.stopAllActions();

        layer.scale = this.InitBTNodeScale;
        layer.position = this.InitBTNodePos;
        layer.opacity = this.InitBTNodeOpacity;

        let seq = null;
        if (actionType == ActionEnum.Action0) {
            callback()
            return;

        } else if (actionType == ActionEnum.Action1) {
            seq = cc.fadeTo(this.defaultAnimSpeed, this.InitBTNodeOpacity)
        } else if (actionType == ActionEnum.Action2) {  // 视频弹框

            layer.scale = 0.3;
            let scalingSeq = cc.sequence(
                cc.scaleTo(0.2, 1.2),
                cc.scaleTo(0.2, 1.0));
            seq = cc.spawn(cc.fadeIn(0.2), scalingSeq);

            // let ct = this.node.getChildByName("ct")
            // if (ct) {
            //     ct.scale = 0.2;
            //     let seqct = cc.spawn(cc.fadeTo(this.defaultAnimSpeed, this.InitBTNodeOpacity), cc.scaleTo(this.defaultAnimSpeed, this.InitBTNodeScale));
            //     ct.runAction(seqct);
            // }
        }

        if (seq) {
            layer.runAction(cc.sequence(seq, cc.callFunc(callback)));
        }

    }

    // 单独设置层级
    public SetLayer(nLayer: number) {
        this.node.zIndex = nLayer;
    }

    // 移除界面
    private DeleteLayer() {
        this.node.removeFromParent(true);
        UIManager.ClearCache(this._layerPath);
    }

    // 关闭界面
    public CloseForm() {


        GameEvent.removeLayerAllEvent(this); // 关闭消息通知
        // this.ClearDynamicRes();
        console.log("Close the interface %s", this.node.name);

        // let seq = null;
        // let mainNode = this.node.getChildByName("ct");
        let mainNode = this.node;
        if (mainNode) {
            if (this.actionLv == ActionEnum.Action0) {

                this.OnClose();

                this.DeleteLayer();
                return;
            }
            else if (this.actionLv == ActionEnum.Action1) {
                this.CloseViewAction();
            }
            else if (this.actionLv == ActionEnum.Action2) {
                this.OnClose();

                let cbFadeOut = cc.callFunc(() => {
                    this.DeleteLayer();
                })
                let seq1 = cc.sequence(cc.spawn(cc.fadeTo(this.defaultAnimSpeed, 0), cc.scaleTo(this.defaultAnimSpeed, .2)), cbFadeOut);
                // let seq2 = cc.sequence(cc.spawn(cc.fadeTo(this.defaultAnimSpeed, 0), cc.scaleTo(this.defaultAnimSpeed, .2)), cbFadeOut);

                // let bg = this.node.getChildByName("bg");
                // if(bg){
                //     bg.runAction(seq1);
                // }

                // if (mainNode) {
                //     mainNode.runAction(seq2);
                // }else{
                //     this.CloseViewAction();
                // }
                mainNode.runAction(seq1);
            }


        } else {
            this.CloseViewAction();
        }

    }

    // 界面关闭动画
    private CloseViewAction() {

        this.OnClose();
        // let fadeOut = cc.fadeOut(0.3);
        // let callfunc = cc.callFunc(()=>{          
        //     if(UIManager._isClearCache == true){
        //         this.node.destroy();
        //     }else{
        //         this.node.removeFromParent(true);
        //     }

        // });

        // this.node.runAction(cc.sequence(fadeOut, callfunc));

        this.DeleteLayer();
    }

    onDisable() {
        // this.ClearDynamicRes()
    }

    // 界面关闭前清理界面中动态加载资源
    private ClearDynamicRes() {
        for (const key in this._recordQuoteMap) {
            if (Object.prototype.hasOwnProperty.call(this._recordQuoteMap, key)) {
                DLocal.GetDynamicRes(key)["index"] -= this._recordQuoteMap[key]["index"];

                if (DLocal.GetDynamicRes(key)["index"] <= 0) {
                    DLocal.GetDynamicRes(key)["index"] = 0;
                }
            }
        }
        this._recordQuoteMap = {};
    }


    public AddResQuote(uiPath) {
        if (this._recordQuoteMap[uiPath]) {

            this._recordQuoteMap[uiPath]["index"]++;
        }
        else {
            this._recordQuoteMap[uiPath] = {}
            this._recordQuoteMap[uiPath]["index"] = 1;
        }
    }


    // 每帧更新
    update(dt) {
        this.OnUpdate(dt);
        this._perSec += dt;
        if (this._perSec >= 1) {
            this._perSec = 0
            this.OnUpdateSEC();
        }
    }

    // // 弹出来界面的动画
    // popupWindow(node: cc.Node, cb?: Function) {
    // 	node.scale = 0;
    // 	node.runAction(
    // 		cc.sequence(
    // 			cc.scaleTo(0.5, 1).easing(cc.easeBackOut()),
    // 			cc.callFunc(() => {
    // 				if (cb) {
    // 					cb();
    // 				}
    // 			})
    // 		)
    // 	);
    // }

    // // 关闭界面
    // deleteWindow(){
    //     this.destroyCallBack()
    //     this.node.destroy();
    // }

    // 摧毁界面
    onDestroy() {
        console.log("--------------- 摧毁界面 name = " + this.name)
        this.OnDestroy();

        this.ClearDynamicRes()

        // UIManager.ClearCache(this._layerPath);
        //cc.loader.release(this.node.name);     
    }

    // 子类重写摧毁回调
    public OnDestroy() {
    }

    // 子类重写初始化
    public OnInit() {
    }

    // （需要子类重写）开始显示
    public OnShow(...argList) {
    }

    // 子类重写关闭回调
    public OnClose() {
    }

    //（需要子类重写）定时回调
    public OnUpdate(passSecond) { }

    //（需要子类重写）秒级定时回调
    public OnUpdateSEC() { }

    // 关闭界面
    public OnClose_Click(isClickMusic = true) {
        // try {
        this.CloseForm();
        if (isClickMusic) {
            AudioMgr.playEffect(MusicPath.CLICKMUSIC); // 点击音乐
        }

        // } catch (error) {
        //     console.log(this.name + " OnClick_Close:{0}", error.stack);
        // }
    }

    // 复选按钮 
    public OnClick_Toggle(toggle, eventData) {
        // try {
        let btnNode = toggle.node || toggle.currentTarget;
        let btnName = btnNode.name;

        // if (this._recordTg == btnNode) {
        //     return;
        // }

        this._recordTg = btnNode;
        this.OnClick(btnName, btnNode, eventData);

        AudioMgr.playEffect(MusicPath.CLICKMUSIC);
        // } catch (error) {
        //     console.log(this.name + " OnClick_Toggle:{0}", error.stack);
        // }
    }

    //控件点击回调
    public OnClick_BtnWnd(eventTouch, eventData) {
        // try {
        let nowTime = Date.now();
        if (this._clickBtnTime > nowTime - 100) {
            //按钮点击限制
            return;
        }
        this._clickBtnTime = nowTime;
        let btnNode = eventTouch.currentTarget;
        let btnName = btnNode.name;
        this.OnClick(btnName, btnNode, eventData);

        if (eventData != "music") {
            AudioMgr.playEffect(MusicPath.CLICKMUSIC);
        }
        // } catch (error) {
        //     console.log("OnClick_BtnWnd:{0}", error.stack);
        // }
    }


    // 点击回调
    public OnClick(btnName, btnNode, eventData) {

    }
}
