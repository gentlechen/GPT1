import { MusicPath, RewardType } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import AudioMgr from "../manage/AudioMgr";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";
import UtilsMath from "../utils/UtilsMath";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIBattleResults extends UIBase {

    @property(cc.Node)
    private nodeSuccessImg: cc.Node = null;
    @property(cc.Node)
    private nodeFailImg: cc.Node = null;
    @property(cc.Node)
    private nodeSuccesssLab: cc.Node = null;
    @property(cc.Node)
    private nodeFailLab: cc.Node = null;
    @property(cc.Label)
    private labLevel: cc.Label = null;
    @property(cc.Label)
    private labChapter: cc.Label = null;
    @property(cc.Label)
    private labGoldNum: cc.Label = null;
    @property(cc.Label)
    private labDiamondNum: cc.Label = null;
    @property(cc.RichText)
    private rtExplain: cc.RichText = null;
    @property(cc.Sprite)
    private bgHero: cc.Sprite = null;
    @property(cc.Sprite)
    private imgHero: cc.Sprite = null;
    @property(cc.Label)
    private labBattle: cc.Label = null;
    @property(cc.Label)
    private labHeroNum: cc.Label = null;
    @property(cc.Node)
    private nodeHeroTitle: cc.Node = null;
    @property(cc.Node)
    private btnNextLevel: cc.Node = null;
    @property(cc.Node)
    private imgDiamond: cc.Node = null;
    @property(cc.Node)
    private bgDiamond: cc.Node = null;
    @property(cc.Node)
    private labNextLevel: cc.Node = null;


    private _isRecv = false;


    private _battleResult = false; // 战斗结果  false 是失败  true 成功
    private _levelId = 0; // 关卡id
    private _rewardList = []; // 奖励列表

    private _nextId = 0; // 下一关id

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {

        this._battleResult = argList[0];
        this._levelId = argList[1];
        this._rewardList = argList[2];

        if (this._battleResult == true) {
            this.nodeSuccessImg.active = true;
            this.nodeSuccesssLab.active = true;
            this.nodeFailImg.active = false;
            this.nodeFailLab.active = false;

            AudioMgr.playEffect(MusicPath.BATTLEWIN);
            AudioMgr.playEffect(MusicPath.BUYGOODS);
            DLocal.setFinishTaskData(20000, 1); // 主线战斗任务
            DLocal.updateAchievementCount(20000, 1); // 主线战斗任务

            this.initSuccess();
            this.guildStep();
        } else {
            this.nodeSuccessImg.active = false;
            this.nodeSuccesssLab.active = false;
            this.nodeFailImg.active = true;
            this.nodeFailLab.active = true;

            AudioMgr.playEffect(MusicPath.BATTLEFAIL);
        }

        let levelIdx = this._levelId % 1000;
        this.labLevel.string = "第" + levelIdx + "关";

        let levelChapter = Math.floor(this._levelId / 1000);
        this.labChapter.string = "第" + levelChapter + "章";

        let levelCfg = DLocal.GetCfgData("zongguanqia")[this._levelId];
        this._nextId = levelCfg.next_id;

        if (levelCfg.gq_zs != 1) {
            this.btnNextLevel.active = false;
            this.labNextLevel.active = false;
        } else {
            this.btnNextLevel.active = this._nextId != 0;
            this.labNextLevel.active = this._nextId != 0;
        }
    }

    // 初始化label
    initLab() {

    }

    // 胜利
    initSuccess() {

        this.bgHero.node.active = false;
        this.imgHero.node.active = false;
        this.nodeHeroTitle.active = false;

        this.labHeroNum.node.active = false;

        let winRate = Utils.getRandomInt(75, 94);
        let point1 = Utils.getRandomInt(0, 9);
        let point2 = Utils.getRandomInt(0, 9);
        this.rtExplain.string = "你击败了" + "<color=#ff0000>" + winRate + "." + point1 + point2 + "%</c>" + "的玩家";

        let addDiamondNum = 0;
        this.imgDiamond.active = false;
        this.bgDiamond.active = false;
        this.labDiamondNum.node.active = false;
        for (let i = 0; i < this._rewardList.length; i++) {
            if (this._rewardList[i].rewardType == RewardType.currency) {
                if (this._rewardList[i].id == 1) {
                    this.labGoldNum.string = this._rewardList[i].count;

                    let goldNum = DLocal.getGold();
                    DLocal.setGold(goldNum + this._rewardList[i].count)


                } else if (this._rewardList[i].id == 2) {

                    addDiamondNum += this._rewardList[i].count
                    this.labDiamondNum.string = "" + addDiamondNum;

                    let diamondNum = DLocal.getDiamond();
                    DLocal.setDiamond(diamondNum + this._rewardList[i].count)

                    this.bgDiamond.active = true;
                    this.imgDiamond.active = true;
                    this.labDiamondNum.node.active = true;
                }
            } else if (this._rewardList[i].rewardType == RewardType.Hero) {
                this.bgHero.node.active = true;
                this.imgHero.node.active = true;
                this.nodeHeroTitle.active = true;
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

    // 新手引导
    guildStep() {
        let isGuild = DLocal.isGuildChapter();
        if (isGuild == true) {
            let guildChapterIdx = DLocal.getGuildChapterIdx();
            // let nextId = DLocal.getGuildChapterData(guildChapterIdx).nextId;
            if (guildChapterIdx != 0) {
                UIManager.ShowForm(UIPath.UIGuild, guildChapterIdx);
            }
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

        console.log("------------ btnName = " + btnName);
        this.CloseForm();
        if (btnName == "btnNextLevel") { // 下一关

            let isGuild = DLocal.isGuildChapter();
            if (isGuild == true) {
                UIManager.ShowForm(UIPath.UIBattle, this._nextId, null, true, () => {
                    UIManager.closeOther(UIPath.UIBattle);
                    let guildChapterIdx = DLocal.getGuildChapterIdx();
                    DLocal.saveGuildChapterIdx(guildChapterIdx);
                    this.guildStep();
                });
            } else {
                UIManager.ShowForm(UIPath.UIBattle, this._nextId);
            }

        } else if (btnName == "btnBattle") {// 挑战

            UIManager.ShowForm(UIPath.UIBattle, this._levelId);
        } else if (btnName == "btnUpgrade") {// 跳转英雄界面

            GameEvent.dispatchEvent(Msg.OPEN_HERO_VIEW);

            UIManager.CloseForm(UIPath.UIBattle);
        } else if (btnName == "btnBack") {

            let isGuild = DLocal.isGuildChapter();
            if (isGuild == true) {
                let guildChapterIdx = DLocal.getGuildChapterIdx();
                DLocal.setGuildChapterIdx(guildChapterIdx + 1);
                DLocal.saveGuildChapterIdx(guildChapterIdx + 1);
                this.guildStep();
            } else {
                GameEvent.dispatchEvent(Msg.OPEN_LEVEL);
            }
            // UIManager.ShowForm(UIPath.UILevel);

            UIManager.CloseForm(UIPath.UIBattle);
            this.CloseForm();
        }
    }

    // 关闭回调
    OnClose() {

    }
}