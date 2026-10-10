import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import AppStart from "../manage/AppStart";
import AudioMgr from "../manage/AudioMgr";
import SceneBase from "../manage/SceneBase";
import UIManager from "../manage/UIManager";

const { ccclass, property } = cc._decorator;


@ccclass
export default class HallScene extends SceneBase {

    private _finishLoadIdx = 0;

    // 初始相当于onLoad
    OnInit() {

        UIManager.ShowForm(UIPath.UILoading, () => {
            let appStartIns = AppStart.getInstance();
            appStartIns.UpdateBeforeInit();
            this.loadJsonTable();
        });
    }

    // 加载json配置表
    loadJsonTable() {

        DLocal.InitConfig(() => {
            this._finishLoadIdx++;
            this.showHall();
        })
        let loadArr = [UIPath.UIShop, UIPath.UIHeroMain, UIPath.UIHeroInfo, UIPath.UISignIn, UIPath.UIBattleHeroInfo, UIPath.UIBox, UIPath.UIHangup, UIPath.UISignIn, UIPath.UISet, UIPath.UIHangup];
        let loadIdx = 0;
        let loadBack = () => {
            if (loadIdx >= loadArr.length) {
                this._finishLoadIdx++;
                this.showHall();
                return;
            }
            UIManager.preLoadDynamicView(loadArr[loadIdx], () => {
                loadIdx++;
                loadBack();
            });
        }
        loadBack();
        loadBack();
    }

    private showHall() {
        console.log("------------- this._finishLoadIdx = " + this._finishLoadIdx)
        if (this._finishLoadIdx >= 3) {
            DLocal.initAllLevelData();
            AudioMgr.playMusic(); // 音乐
            UIManager.ShowForm(UIPath.UIHall, () => {
                GameEvent.dispatchEvent(Msg.UPDATE_CLOSE_LOADING);
            });
        }
    }

    //每次显示界面被调用
    public OnShow(...argList) {

    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

    }

    // 关闭回调
    OnClose() {

    }
}