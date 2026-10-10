import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import AudioMgr from "../manage/AudioMgr";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UISet extends UIBase {

    @property(cc.Label)
    private labVolume: cc.Label = null; // 音量开关
    @property(cc.Label)
    private labShock: cc.Label = null; // 音乐开关
    @property(cc.EditBox)
    private editBoxReward: cc.EditBox = null; // 兑换码
    @property(cc.Toggle)
    private tgVolume: cc.Toggle = null; // 音量开关
    @property(cc.Toggle)
    private tgShock: cc.Toggle = null; // 音乐开关

    private _musicConfig = null; // 音乐配置
    private _exchangeReward = {};


    // 初始相当于onLoad
    OnInit() {
        this._exchangeReward = {
            "1": 1, // 金币
            "2": 2, // 钻石
        }
    }
    //每次显示界面被调用
    public OnShow(...argList) {

        this.editBoxReward.string = "";
        this.initUI();
    }
    // 初始化label
    initLab() {

    }


    // 初始化UI
    initUI() {

        if (!this._musicConfig) {
            this._musicConfig = DLocal.getMusicConfig();
        }

        this.tgVolume.isChecked = this._musicConfig.bgm_switch == 1;
        if (this._musicConfig.bgm_switch == 1) { // 声音开启
            this.labVolume.string = "开启"
        } else {
            this.labVolume.string = "关闭"
        }

        this.tgShock.isChecked = this._musicConfig.sfx_switch == 1;
        if (this._musicConfig.sfx_switch == 1) { // 音乐开关
            this.labShock.string = "开启"
        } else {
            this.labShock.string = "关闭"
        }
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

        if (btnName == "tgVolume") { // 音量
            let isChecked = this.tgVolume.isChecked;
            if (isChecked == true) {
                this._musicConfig.bgm_switch = 1;
                AudioMgr.resumeMusic();
            } else {
                this._musicConfig.bgm_switch = 0;
                AudioMgr.pauseMusic();
            }
            DLocal.setMusicConfig(this._musicConfig);
            this.initUI();

        } else if (btnName == "tgShock") { // 音乐

            let isChecked = this.tgShock.isChecked;
            if (isChecked == true) {
                this._musicConfig.sfx_switch = 1;
            } else {
                this._musicConfig.sfx_switch = 0;
            }
            DLocal.setMusicConfig(this._musicConfig);
            this.initUI();

        } else if (btnName == "btnExchangeReward") { // 兑换奖励
            let str = this.editBoxReward.string;
            if (str == "") {
                UIManager.ShowForm(UIPath.UIFlyTip, "请输入正确的兑换码");
                return;
            }
            let pmList = str.split(",");
            if (!pmList[0] || !this._exchangeReward[pmList[0]] || !pmList[1] || !Number(pmList[1])) {
                UIManager.ShowForm(UIPath.UIFlyTip, "请输入正确的兑换码");
                return;
            }

            if (pmList[0] == "1") { // 金币
                let goldCount = DLocal.getGold();
                goldCount += Number(pmList[1]);
                DLocal.setGold(goldCount);

                GameEvent.dispatchEvent(Msg.UPDATE_GOLD);

                UIManager.ShowForm(UIPath.UIFlyTip, "兑换成功");
            } else if (pmList[0] == "2") {
                let goldCount = DLocal.getDiamond();
                goldCount += Number(pmList[1]);
                DLocal.setDiamond(goldCount);

                GameEvent.dispatchEvent(Msg.UPDATE_DIAMOND);
                UIManager.ShowForm(UIPath.UIFlyTip, "兑换成功");
            }


        } else if (btnName == "btnClear") { // 清理存档

            DLocal.clearLocalCache();
            cc.game.end();
        }
    }

    // 关闭回调
    OnClose() {

    }
}