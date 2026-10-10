import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import UIBase from "../manage/UIBase";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UILoading extends UIBase {

    @property(cc.Label)
    private labProgress: cc.Label = null;
    @property(cc.ProgressBar)
    private pbLoading: cc.ProgressBar = null;

    private _progress = 0;
    private _isFinish = false; // 是否完成

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this._isFinish = false;
        GameEvent.addEventHandler(Msg.UPDATE_CLOSE_LOADING, this.updateFinishFunc.bind(this), this);

        let callback = argList[0];
        if (callback) {
            callback();
        }
    }

    // 初始化label
    initLab() {

    }

    updateFinishFunc() {
        this._isFinish = true;
    }

    // 每秒
    OnUpdateSEC() {
    }

    // 每帧
    OnUpdate(dt) {
        if (this._progress < 90) {
            this._progress += 1;
            this.labProgress.string = this._progress + "%";
            this.pbLoading.progress = this._progress / 100;
        } else {
            if (this._isFinish == true) {
                this._progress = 100;
                this.labProgress.string = this._progress + "%";
                this.pbLoading.progress = this._progress / 100;
                this.CloseForm();
            }
        }
    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

    }

    // 关闭回调
    OnClose() {

    }
}