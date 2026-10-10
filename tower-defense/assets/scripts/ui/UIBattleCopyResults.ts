import { MusicPath, RewardType } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import AudioMgr from "../manage/AudioMgr";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIBattleCopyResults extends UIBase {


    @property(cc.Node)
    private nodeSuccessImg: cc.Node = null;
    @property(cc.Node)
    private nodeFailImg: cc.Node = null;
    @property(cc.Node)
    private nodeSuccesssLab: cc.Node = null;
    @property(cc.Node)
    private nodeFailLab: cc.Node = null;
    @property(cc.Label)
    private labFreeNum: cc.Label = null;
    @property(cc.Label)
    private labGoldNum: cc.Label = null;
    @property(cc.Label)
    private labDiamondNum: cc.Label = null;
    @property(cc.Label)
    private labHeroNum: cc.Label = null;
    @property(cc.Sprite)
    private imgHero: cc.Sprite = null;
    @property(cc.Sprite)
    private bgHero: cc.Sprite = null;

    private isWin = false; // 是否胜利
    private _rewardList = [];// 胜利奖励

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this.isWin = argList[0];
        this._rewardList = argList[1];


        if (this.isWin == true) {
            this.nodeSuccessImg.active = true;
            this.nodeFailImg.active = false;
            this.nodeSuccesssLab.active = true;
            this.nodeFailLab.active = false;

            AudioMgr.playEffect(MusicPath.BATTLEWIN);
            AudioMgr.playEffect(MusicPath.BUYGOODS);

            DLocal.updateAchievementCount(20001, 1);
            this.initWinReward();
        } else {
            this.nodeSuccessImg.active = false;
            this.nodeFailImg.active = true;
            this.nodeSuccesssLab.active = false;
            this.nodeFailLab.active = true;

            AudioMgr.playEffect(MusicPath.BATTLEFAIL);
        }

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

    // 胜利奖励
    initWinReward() {

        for (let i = 0; i < this._rewardList.length; i++) {
            if (this._rewardList[i].rewardType == RewardType.currency) {
                if (this._rewardList[i].id == 1) {
                    this.labGoldNum.string = this._rewardList[i].count;

                    let goldNum = DLocal.getGold();
                    DLocal.setGold(goldNum + this._rewardList[i].count)
                } else if (this._rewardList[i].id == 2) {
                    this.labDiamondNum.string = this._rewardList[i].count;

                    let diamondNum = DLocal.getDiamond();
                    DLocal.setDiamond(diamondNum + this._rewardList[i].count)
                }
            } else if (this._rewardList[i].rewardType == RewardType.Hero) {
                // this.bgHero.node.active = true;
                this.imgHero.node.active = true;
                this.labHeroNum.node.active = true;


                let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._rewardList[i].id];
                let heroType = heroItemCfg.yx_type;
                Utils.loadImg("ui/heroIcon/" + heroType, (sp) => {
                    this.imgHero.spriteFrame = sp;
                })
                Utils.loadImg("ui/common/sd2_bg_dilv_" + heroItemCfg.yx_pj, (sp) => {

                    this.bgHero.spriteFrame = sp;
                })
                this.labHeroNum.string = "X" + this._rewardList[i].count;

                DLocal.addSingleHero(this._rewardList[i].id, this._rewardList[i].count);
            }
        }

        GameEvent.dispatchEvent(Msg.UPDATE_DIAMOND);
        GameEvent.dispatchEvent(Msg.UPDATE_GOLD);
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {
        if (btnName == "btnBattle") {

            let copyNum = DLocal.getCopySLNum();
            if (copyNum > 0) {
                // DLocal.setCopySLNum(copyNum - 1);
                let levelId = DLocal.getCopyChapter();
                UIManager.ShowForm(UIPath.UIBattle, levelId, true);
            } else {
                UIManager.ShowForm(UIPath.UIFlyTip, "挑战次数不足");
            }
        } else if (btnName == "btnUpgrade") {

            GameEvent.dispatchEvent(Msg.OPEN_HERO_VIEW);
            UIManager.CloseForm(UIPath.UIBattle);
            this.CloseForm();
        } else if (btnName == "btnBack") {
            UIManager.CloseForm(UIPath.UIBattle);
            this.CloseForm();
        }
    }

    // 关闭回调
    OnClose() {

    }
}