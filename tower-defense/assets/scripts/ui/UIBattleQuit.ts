import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIBattleQuit extends UIBase {


    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {
    }

    // 初始化label
    initLab() {

    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

        if (btnName == "btnClose" || btnName == "btnContinue") {

            this.CloseForm();
        } else if (btnName == "btnQuit") {


            GameEvent.dispatchEvent(Msg.OPEN_MAIN_VIEW);
            UIManager.closeOther();

            this.CloseForm();
        }
    }

    // 关闭回调
    OnClose() {

    }
}