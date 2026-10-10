/*
 *@description: 界面名称：场景基类
 *@author: hrc
 *@date: 2020-04-07 18:51:00
*/

import AudioMgr from "./AudioMgr";
import { MusicPath } from "../common/GameEnum";
import Utils from "../utils/Utils";

enum LayerLvEnum {
    UI = 3,
    SceneEffect,
    Guide,
    Battle,
    Top,
    fitMask,
}


const { ccclass, property } = cc._decorator;
@ccclass
export default class SceneBase extends cc.Component {

    @property(cc.Prefab)
    private battleLayer: cc.Prefab = null;

    @property(cc.Prefab)
    private uiLayer: cc.Prefab = null;

    @property(cc.Prefab)
    private guideLayer: cc.Prefab = null;

    @property(cc.Prefab)
    private topLayer: cc.Prefab = null;

    private _uiLayerNode = null; // UI层
    private _guideLayerNode = null; // 引导层
    private _battleLayerNode = null; // 战斗层
    private _topLayerNode = null; // 引导层

    private _perSec = 0; // 每一帧累加时间
    private _clickBtnTime = 0;

    public _allDynamicPrefabs = [];  // 收集动态加载的资源、

    //创建界面被调用一次
    onLoad() {

        // 设置分辨率
        this.ScreenAdaptation();
        // 初始化数据
        this.InitBaseData();
        // UI层
        this.InitLayer();
        // 引导处理
        this.JudgeGuideLogic();
        // 场景中重写
        this.OnInit();
    }

    // 显示资源
    start() {
        this.OnShow();
    }

    // 初始化数据
    private InitBaseData() {

    }


    // 显示资源
    public OnShow() {

    }

    // 屏幕适配
    private ScreenAdaptation() {
        let Canvas = this.node.getComponent(cc.Canvas);
        let size = cc.view.getFrameSize();
        if (size.width / size.height > 750 / 1334) {
            Canvas.fitHeight = true;
            Canvas.fitWidth = false;
        } else {
            Canvas.fitHeight = false;
            Canvas.fitWidth = true;
        }
    }

    // 初始化场景层相关
    private InitLayer() {
        // 适配苹果X
        let safe = cc.sys.getSafeAreaRect();
        //-----------可选层---------------
        // safe = cc.rect(0.00, 90, 751.55, 1287.03);


        // ui层
        if (this.uiLayer) {
            this._uiLayerNode = cc.instantiate(this.uiLayer);
            this.node.addChild(this._uiLayerNode, LayerLvEnum.UI);


            console.log("------------ safe2 = ")
            console.log(safe)
            //适配苹果X
            this._uiLayerNode.getComponent(cc.Widget).top = safe.y;
            let fixmask = this._uiLayerNode.getChildByName("FixMask");
            fixmask.height = safe.y;

            if (safe.y > 0) {
                fixmask.zIndex = LayerLvEnum.fitMask;
                fixmask.getComponent(cc.Widget).top = -safe.y;
            }

        }

        // 引导层
        if (this.guideLayer) {
            this._guideLayerNode = cc.instantiate(this.guideLayer);
            this.node.addChild(this._guideLayerNode, LayerLvEnum.Guide);

            //适配苹果X
            this._guideLayerNode.getComponent(cc.Widget).top = safe.y;
        }

        // 战斗层
        if (this.battleLayer) {
            this._battleLayerNode = cc.instantiate(this.battleLayer);
            this.node.addChild(this._battleLayerNode, LayerLvEnum.Battle);
        }

        // 最高层
        if (this.topLayer) {
            this._topLayerNode = cc.instantiate(this.topLayer);
            this.node.addChild(this._topLayerNode, LayerLvEnum.Battle);
        }
    }

    // 引导相关-------------------------------------------
    // 判断是否开启引导的相关逻辑
    public JudgeGuideLogic() {
        this.IsOpenGuide(false);
    }

    // 是否开启引导
    public IsOpenGuide(bool: boolean) {
        this._guideLayerNode.active = bool;
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

    // 界面关闭前清理界面中动态加载资源
    private ClearDynamicRes() {

        for (let i = 0; i < this._allDynamicPrefabs.length; i++) {
            if (this._allDynamicPrefabs[i] && this._allDynamicPrefabs[i]["instance"]) {
                this._allDynamicPrefabs[i]["instance"].destroy();
            }
            if (this._allDynamicPrefabs[i] && this._allDynamicPrefabs[i]["prefab"]) {
                this._allDynamicPrefabs[i]["prefab"].decRef();
            }
        }
        this._allDynamicPrefabs = [];

    }

    public AddDynamicRes(instance, prefab) {
        let index = this._allDynamicPrefabs.length;
        this._allDynamicPrefabs[index] = {
            "instance": instance,
            "prefab": prefab,
        };
    }

    // 获取战斗层
    public getBattleLayer() {
        return this._battleLayerNode;
    }

    // 获取新手引导层
    public getGuideLayer() {
        return this._guideLayerNode;
    }

    // 获取最高层
    public getTopLayer() {
        return this._topLayerNode;
    }

    // 摧毁界面
    onDestroy() {
        this.OnDestroy()
        //cc.loader.release(this.node.name);     
    }

    onDisable() {
        this.ClearDynamicRes()
    }

    // 子类重写摧毁回调
    public OnDestroy() {
    }


    //（需要子类重写）定时回调
    public OnUpdate(passSecond) { }

    //（需要子类重写）秒级定时回调
    public OnUpdateSEC() { }

    // 关闭界面
    public OnClose_Click(isClickMusic = true) {
        try {
            this.OnClose();
            if (isClickMusic) {
                AudioMgr.playEffect(MusicPath.CLICKMUSIC); // 点击音乐
            }

        } catch (error) {
            console.log("OnClick_Close:{0}", error.stack);
        }
    }

    // 子类重写初始化
    public OnInit() {
    }

    // 子类重写关闭回调
    public OnClose() {

    }

    // button 控件点击回调
    public OnClose_Btn(eventTouch, eventData) {
        try {
            let nowTime = Date.now();
            if (this._clickBtnTime > nowTime - 50) {
                //按钮点击限制
                return;
            }
            this._clickBtnTime = nowTime;

            let btnNode = eventTouch.currentTarget;
            let btnName = btnNode.name;
            this.OnClick(btnName, btnNode, eventData);

            AudioMgr.playEffect(MusicPath.CLICKMUSIC);
        } catch (error) {
            console.log("OnClick_BtnWnd:{0}", error.stack);
        }
    }

    // 复选按钮 
    public OnClick_Toggle(toggle, eventData) {
        try {
            let btnNode = toggle.node || toggle.currentTarget;
            let btnName = btnNode.name;
            this.OnClick(btnName, btnNode, eventData);

            AudioMgr.playEffect(MusicPath.CLICKMUSIC);
        } catch (error) {
            console.log("OnClick_Toggle:{0}", error.stack);
        }
    }


    //控件点击回调
    public OnClick_BtnWnd(eventTouch, eventData) {
        // try {
        let nowTime = Date.now();
        if (this._clickBtnTime > nowTime - 50) {
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