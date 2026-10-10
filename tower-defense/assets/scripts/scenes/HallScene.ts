import ResourceLoader from "../utils/ResourceLoader";
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
        // Load sequentially: the original two shared-index chains could finish
        // early or call showHall several times when downloads completed out of order.
        DLocal.InitConfig(() => {
            ResourceLoader.prepareBattle((err) => {
                if (err) {
                    console.error("[BattleTrace] startup stopped: animations unavailable", err);
                    return;
                }
                const views = [UIPath.UIBattle, UIPath.UIGuild, UIPath.UIShop,
                    UIPath.UIHeroMain, UIPath.UIHeroInfo, UIPath.UISignIn,
                    UIPath.UIBattleHeroInfo, UIPath.UIBox, UIPath.UIHangup, UIPath.UISet];
                const loadNext = (index: number) => {
                    if (index >= views.length) { this.showHall(); return; }
                    UIManager.preLoadDynamicView(views[index], (viewError) => {
                        if (viewError) {
                            console.error("[BattleTrace] startup stopped:", views[index], viewError);
                            return;
                        }
                        loadNext(index + 1);
                    });
                };
                loadNext(0);
            });
        });
    }

    private showHall() {
        if (this._finishLoadIdx) return;
        this._finishLoadIdx = 1;
        DLocal.initAllLevelData();
        AudioMgr.playMusic();
        UIManager.ShowForm(UIPath.UIHall, () => {
            GameEvent.dispatchEvent(Msg.UPDATE_CLOSE_LOADING);
        });
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