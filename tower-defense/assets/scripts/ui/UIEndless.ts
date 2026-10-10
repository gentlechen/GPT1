import UIBase from "../manage/UIBase";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UICopyEndless extends UIBase {

    @property(cc.Node)
    private bgAction1: cc.Node = null;
    @property(cc.Node)
    private bgAction2: cc.Node = null;

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {

    }

    // 初始化label
    initLab() {

    }

    // 章鱼动画
    mapAction() {

        this.bgAction1.y -= 0.7;
        this.bgAction2.y -= 0.7;
        if (this.bgAction1.y <= -1336) {
            this.bgAction1.y = 1336;
        }
        if (this.bgAction2.y <= -1336) {
            this.bgAction2.y = 1336;
        }
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {
        this.mapAction();
    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

    }

    // 关闭回调
    OnClose() {

    }
}