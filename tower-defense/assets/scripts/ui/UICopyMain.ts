import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UICopyMain extends UIBase {

    @property(cc.Label)
    private labExperienceFreeNum: cc.Label = null;
    @property(cc.Node)
    private bgAction1: cc.Node = null;
    @property(cc.Node)
    private bgAction2: cc.Node = null;

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this.bgAction1.y = 0;
        this.bgAction2.y = 1336;

        GameEvent.addEventHandler(Msg.UPDATE_COPY_COUNT, this.updateCopyNum.bind(this), this);

        this.updateCopyNum();
    }

    // 初始化label
    initLab() {

    }

    // 更新副本次数
    updateCopyNum() {
        let copyNum = DLocal.getCopySLNum();
        this.labExperienceFreeNum.string = "免费次数：" + copyNum + "/2";
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
        if (btnName == "btnExperienceCopy") {
            UIManager.ShowForm(UIPath.UICopyInfo);
        }
    }

    // 关闭回调
    OnClose() {

    }
}