import { RewardType } from "../common/GameEnum";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";
import UtilsMath from "../utils/UtilsMath";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIChapterInfo extends UIBase {

    @property(cc.Label)
    private labTitle: cc.Label = null;
    @property(cc.Label)
    private labLevel: cc.Label = null;
    @property(cc.Label)
    private labGoldNum: cc.Label = null;
    @property(cc.Label)
    private labDiamondStar1: cc.Label = null;
    @property(cc.Label)
    private labSweep: cc.Label = null;
    @property(cc.Label)
    private labBattle: cc.Label = null;
    @property(cc.Node)
    private btnSweep: cc.Node = null;
    @property(cc.Toggle)
    private tgOrdinary: cc.Toggle = null;
    @property(cc.Node)
    private imgFinishArr: cc.Node[] = [];
    @property(cc.Node)
    private heroCardArr: cc.Node[] = [];

    private _levelId = 0; // 关卡id
    private _star = 0; // 几星
    private _selectLevel = 0; // 选中关卡
    private _eliteId = 0; // 精英id
    private _difficultyId = 0; // 困难

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {

        this._levelId = argList[0];
        this._selectLevel = this._levelId;
        this._eliteId = this._levelId + 1000;
        this._difficultyId = this._levelId + 2000;
        // this._star = DLocal.getLevelReward(this._levelId);
        this.initLab(this._levelId);
        this.tgOrdinary.check();
        // this.btnSweep.x = -153;
        // this.btnBattle.x = 163;
    }

    // 初始化label
    initLab(nowLevelId) {

        let levelItemCfg = DLocal.GetCfgData("zongguanqia")[nowLevelId];
        this.labTitle.string = levelItemCfg.zhangjie;
        this.labLevel.string = levelItemCfg.gqmc;
        this.labGoldNum.string = levelItemCfg.cg_num;

        let isRecv = DLocal.getLevelReward(nowLevelId) != 0;
        this.imgFinishArr[0].active = isRecv;
        this.labDiamondStar1.node.active = !isRecv;
        if (isRecv == false) {
            this.labDiamondStar1.string = levelItemCfg.st_num;
        }

        for (let i = 0; i < this.heroCardArr.length; i++) {
            this.heroCardArr[i].active = false;
        }
        let posX = -159;
        if (nowLevelId == this._levelId) {
            this.heroCardArr[0].active = true;
            this.heroCardArr[1].active = true;
            this.heroCardArr[0].x = posX;
            this.heroCardArr[1].x = posX + 105;
        } else if (nowLevelId == this._eliteId) {
            this.heroCardArr[0].active = true;
            this.heroCardArr[1].active = true;
            this.heroCardArr[2].active = true;
            this.heroCardArr[0].x = posX;
            this.heroCardArr[1].x = posX + 105;
            this.heroCardArr[2].x = posX + 105 * 2;
        } else if (nowLevelId == this._difficultyId) {
            this.heroCardArr[3].active = true;
            this.heroCardArr[1].active = true;
            this.heroCardArr[2].active = true;
            this.heroCardArr[1].x = posX;
            this.heroCardArr[2].x = posX + 105;
            this.heroCardArr[3].x = posX + 105 * 2;
        }
    }

    // 计算过关奖励（普通战斗）
    calculateReward() {

        let rewardList = [];
        let isRecv = DLocal.getLevelReward(this._selectLevel);
        let zongguanqiaCfg = DLocal.GetCfgData("zongguanqia")[this._selectLevel];
        rewardList.push({ "id": zongguanqiaCfg.cg_type, "count": zongguanqiaCfg.cg_num, "rewardType": RewardType.currency });
        if (!isRecv) {
            rewardList.push({ "id": zongguanqiaCfg.st_type, "count": zongguanqiaCfg.st_num, "rewardType": RewardType.currency });
        }
        let total = 0;
        let changeList = [];
        let gqjiangliCfg = DLocal.GetCfgData("gqjiangli");
        for (let i = zongguanqiaCfg.zxjl_cid; i <= zongguanqiaCfg.zxjl_mid; i++) {
            let maxCount = total + gqjiangliCfg[i].cgqz * 10;
            changeList.push({ "id": i, "max": maxCount, "min": total })
            total = maxCount;
        }
        let allOneLevelHeroList = DLocal.getAllOneLevelHero();
        for (let z = 0; z < zongguanqiaCfg.sy_type2; z++) {
            let random = Utils.getRandomInt(1, 1000);
            for (let i = 0; i < changeList.length; i++) {
                if (changeList[i].min <= random && changeList[i].max > random) {
                    let levelRewardCfg = gqjiangliCfg[changeList[i].id];
                    let heroCount = Utils.getRandomInt(levelRewardCfg.yxmin_num, levelRewardCfg.yxmax_num);
                    let equalQualityHeroList = [];
                    for (let j = 0; j < allOneLevelHeroList.length; j++) {
                        if (allOneLevelHeroList[j].yx_pj == levelRewardCfg.yxpj) {
                            equalQualityHeroList.push(allOneLevelHeroList[j]);
                        }
                    }
                    let heroIdx = Utils.getRandomInt(0, equalQualityHeroList.length - 1);
                    rewardList.push({ "id": equalQualityHeroList[heroIdx].yxid, "count": heroCount, "rewardType": RewardType.Hero });
                    break;
                }
            }
        }
        return rewardList;
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {
        if (btnName == "btnBattle") { // 战斗
            this.CloseForm();
            UIManager.ShowForm(UIPath.UIBattle, this._selectLevel);
            UIManager.CloseForm(UIPath.UILevel);
        } else if (btnName == "btnSweep") {
            // 扫荡
            if (DLocal.getLevelReward(this._selectLevel)) {
                let rewardList = this.calculateReward(); //奖励
                UIManager.ShowForm(UIPath.UIBattleResults, true, this._selectLevel, rewardList, 3, true);
                DLocal.setFinishTaskData(20002, 1); // 扫荡主线任务
                DLocal.updateAchievementCount(20002, 1);
            } else {
                UIManager.ShowForm(UIPath.UIFlyTip, "首次通关当前难度后才可扫荡");
            }

            // UIManager.CloseForm(UIPath.UILevel);
            // this.CloseForm();

        } else if (btnName == "tgOrdinary") {
            this._selectLevel = this._levelId;
            this.initLab(this._selectLevel);
        } else if (btnName == "tgElite") {
            if (DLocal.getEliteLevel() < this._eliteId) {
                this.tgOrdinary.check();
                UIManager.ShowForm(UIPath.UIFlyTip, "未通关上一关精英难度关卡");
                return;
            }
            this._selectLevel = this._eliteId;
            this.initLab(this._selectLevel);
        } else if (btnName == "tgDifficulty") {
            if (DLocal.getDifficultyLevel() < this._difficultyId) {
                this.tgOrdinary.check();
                UIManager.ShowForm(UIPath.UIFlyTip, "未通关上一关困难难度关卡");
                return;
            }
            this._selectLevel = this._difficultyId;
            this.initLab(this._selectLevel);
        }
    }

    // 关闭回调
    OnClose() {

    }
}