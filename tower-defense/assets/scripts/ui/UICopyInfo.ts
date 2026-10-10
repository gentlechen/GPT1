import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UICopyInfo extends UIBase {

    @property(cc.Label)
    private labFreeNum: cc.Label = null;

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {



        this.updateCopyNum();
    }

    // 初始化label
    initLab() {

    }

    // 更新副本次数
    updateCopyNum() {
        let copyNum = DLocal.getCopySLNum();
        this.labFreeNum.string = "免费次数：" + copyNum + "/2";
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {
        if (btnName == "btnExplain") { // 说明按钮

        } else if (btnName == "btnBattle") { // 挑战按钮
            let copyNum = DLocal.getCopySLNum();
            if (copyNum > 0) {
                // DLocal.setCopySLNum(copyNum - 1);
                let levelId = DLocal.getCopyChapter();
                // GameEvent.dispatchEvent(Msg.UPDATE_COPY_COUNT);
                UIManager.ShowForm(UIPath.UIBattle, levelId, true);
                this.CloseForm();
            } else {
                UIManager.ShowForm(UIPath.UIFlyTip, "挑战次数不足");
            }
        }
    }

    // 关闭回调
    OnClose() {

    }
}