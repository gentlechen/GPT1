import AudioMgr from "./AudioMgr";
import { MusicPath } from "../common/GameEnum";


const { ccclass, property } = cc._decorator;

@ccclass
export default class ChildBase extends cc.Component {

    private _clickBtnTime = 0; // 每次点击时间
    private _perSec = 0; // 每一帧累加时间

    // 加载创建
    onLoad() {

        // 子类中重写
        this.OnInit();
    }

    public OnInit() {

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

    //（需要子类重写）定时回调
    public OnUpdate(passSecond) { }

    //（需要子类重写）秒级定时回调
    public OnUpdateSEC() { }


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

        //     console.log(this.name + "OnClick_BtnWnd:{0}", error.stack);
        // }
    }

    // 点击回调
    public OnClick(btnName, btnNode, eventData) {

    }
}
