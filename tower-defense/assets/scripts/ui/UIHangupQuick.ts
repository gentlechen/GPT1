import { RewardType } from "../common/GameEnum";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIHangupQuick extends UIBase {

    // @property(cc.Label)
    // private labDiamondNum: cc.Label = null;
    // @property(cc.Label)
    // private labGoldNum: cc.Label = null;
    // @property(cc.Label)
    // private labHeroNum1: cc.Label = null;
    // @property(cc.Label)
    // private labHeroNum2: cc.Label = null;
    // @property(cc.Label)
    // private labHeroNum3: cc.Label = null;
    // @property(cc.Label)
    // private labHeroNum4: cc.Label = null;
    @property(cc.Label)
    private labRemainNum: cc.Label = null;
    @property(cc.Node)
    private labRecv: cc.Node = null;
    @property(cc.Node)
    private labFreeRecv: cc.Node = null;
    @property(cc.Node)
    private sd_img_ad: cc.Node = null;

    private _hangupCfg = null;
    private _hangupData = {};
    private _rewardHeroMap = {};
    private _hangupTime = 14400;

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this.initUI();
    }

    // 初始化label
    initLab() {

    }

    // 初始化UI
    initUI() {
        this._hangupData["goldNum"] = 0;
        this._hangupData["diamondNum"] = 0;
        this._hangupData["heroNum1"] = 0;
        this._hangupData["heroNum2"] = 0;
        this._hangupData["heroNum3"] = 0;
        this._hangupData["heroNum4"] = 0;

        let remainTime = this._hangupTime;
        this._hangupCfg = DLocal.GetCfgData("guaji");

        let goldNum = Math.floor(remainTime / this._hangupCfg[1].jl_dlsj);
        let diamondNum = Math.floor(remainTime / this._hangupCfg[2].jl_dlsj);
        let heroTime1Num = Math.floor(remainTime / this._hangupCfg[3].jl_dlsj);
        let heroTime2Num = Math.floor(remainTime / this._hangupCfg[4].jl_dlsj);
        let heroTime3Num = Math.floor(remainTime / this._hangupCfg[5].jl_dlsj);
        let heroTime4Num = Math.floor(remainTime / this._hangupCfg[6].jl_dlsj);
        if (goldNum > 0) {
            let count = 0;
            for (let i = 0; i < goldNum; i++) {
                count += Utils.getRandomInt(this._hangupCfg[1].yxmin_num, this._hangupCfg[1].yxmax_num);
            }
            this._hangupData["goldNum"] += count;
        }
        if (diamondNum > 0) {
            let count = 0;
            for (let i = 0; i < diamondNum; i++) {
                count += Utils.getRandomInt(this._hangupCfg[2].yxmin_num, this._hangupCfg[2].yxmax_num);
            }
            this._hangupData["diamondNum"] += count;
        }
        if (heroTime1Num > 0) {
            let count = 0;
            let nowCount = 0;
            if (!this._rewardHeroMap[1]) {
                this._rewardHeroMap[1] = [];
            } else {
                this._rewardHeroMap[1] = [];
            }
            for (let i = 0; i < heroTime1Num; i++) {
                nowCount = Utils.getRandomInt(this._hangupCfg[3].yxmin_num, this._hangupCfg[3].yxmax_num);
                count += nowCount;
                this._rewardHeroMap[1].push(nowCount);
            }
            this._hangupData["heroNum1"] += count;
        }
        if (heroTime2Num > 0) {
            let count = 0;
            let nowCount = 0;
            if (!this._rewardHeroMap[2]) {
                this._rewardHeroMap[2] = [];
            } else {
                this._rewardHeroMap[2] = [];
            }
            for (let i = 0; i < heroTime2Num; i++) {
                nowCount = Utils.getRandomInt(this._hangupCfg[4].yxmin_num, this._hangupCfg[4].yxmax_num);
                count += nowCount;
                this._rewardHeroMap[2].push(nowCount);
            }
            this._hangupData["heroNum2"] += count;
        }
        if (heroTime3Num > 0) {
            let count = 0;
            let nowCount = 0;
            if (!this._rewardHeroMap[3]) {
                this._rewardHeroMap[3] = [];
            } else {
                this._rewardHeroMap[3] = [];
            }
            for (let i = 0; i < heroTime3Num; i++) {
                nowCount = Utils.getRandomInt(this._hangupCfg[5].yxmin_num, this._hangupCfg[5].yxmax_num);
                count += nowCount;
                this._rewardHeroMap[3].push(nowCount);
            }
            this._hangupData["heroNum3"] += count;
        }
        if (heroTime4Num > 0) {
            let count = 0;
            let nowCount = 0;
            if (!this._rewardHeroMap[4]) {
                this._rewardHeroMap[4] = [];
            } else {
                this._rewardHeroMap[4] = [];
            }
            for (let i = 0; i < heroTime4Num; i++) {
                nowCount = Utils.getRandomInt(this._hangupCfg[6].yxmin_num, this._hangupCfg[6].yxmax_num);
                count += nowCount;
                this._rewardHeroMap[4].push(nowCount);
            }
            this._hangupData["heroNum4"] += count;
        }
        let adCount = DLocal.getQuickHangupAdCount();
        if (adCount == 6) {
            this.labFreeRecv.active = true;
            this.labRecv.active = false;
            this.sd_img_ad.active = false
        } else {
            this.labFreeRecv.active = false;
            this.labRecv.active = true;
            this.sd_img_ad.active = true
        }
        this.labRemainNum.string = "今日剩余" + adCount + "次";
    }

    getHeroRewardWithType(nowHeroType, heroCount) {
        let heroArr = DLocal.GetCfgFindArr("tfyingxiong", "yx_pj", nowHeroType);
        let heroIdx = Utils.getRandomInt(0, heroArr.length - 1);
        let heroType = heroArr[heroIdx].yx_type;
        let heroData = null;
        for (let j = 0; j < heroArr.length; j++) {
            if (heroArr[j].yx_type == heroType && heroArr[j].level == 1) {
                heroData = heroArr[j];
                return { "id": heroData.yxid, "count": heroCount, "rewardType": RewardType.Hero };
            };
        }
    }

    // 设置奖励以及数量
    getReward() {
        let rewardList = [];
        if (this._hangupData["goldNum"] > 0) {
            rewardList.push({ "id": 1, "count": this._hangupData["goldNum"], "rewardType": RewardType.currency })
        }
        if (this._hangupData["diamondNum"] > 0) {
            rewardList.push({ "id": 2, "count": this._hangupData["diamondNum"], "rewardType": RewardType.currency })
        }
        for (const key in this._rewardHeroMap) {
            let heroCountList = this._rewardHeroMap[key];
            if (heroCountList) {
                for (let i = 0; i < heroCountList.length; i++) {
                    let isExist = false;
                    let rewardData = this.getHeroRewardWithType(key, heroCountList[i]);
                    for (let j = 0; j < rewardList.length; j++) {
                        if (rewardList[j].id == rewardData.id) {
                            rewardList[j].count += rewardData.count;
                            isExist = true;
                            break;
                        }
                    }
                    if (isExist == false) {
                        rewardList.push(rewardData);
                    }
                }
            }
        }
        let totalCount = DLocal.getQuickHangupTotalCount();
        totalCount++;
        DLocal.setQuickHangupTotalCount(totalCount);
        if (totalCount % 3 == 0) {
            let heroArr = DLocal.GetCfgFindArr("tfyingxiong", "yx_pj", 3);
            let heroIdx = Utils.getRandomInt(0, heroArr.length - 1);
            let heroType = heroArr[heroIdx].yx_type;
            let heroData = null;
            for (let j = 0; j < heroArr.length; j++) {
                if (heroArr[j].yx_type == heroType && heroArr[j].level == 1) {
                    heroData = heroArr[j];
                    let count = Utils.getRandomInt(this._hangupCfg[5].yxmin_num, this._hangupCfg[5].yxmax_num);
                    rewardList.push({ "id": heroData.yxid, "count": count, "rewardType": RewardType.Hero });
                    break
                };
            }
        }
        if (totalCount % 42 == 0) {
            let heroArr = DLocal.GetCfgFindArr("tfyingxiong", "yx_pj", 4);
            let heroIdx = Utils.getRandomInt(0, heroArr.length - 1);
            let heroType = heroArr[heroIdx].yx_type;
            let heroData = null;
            for (let j = 0; j < heroArr.length; j++) {
                if (heroArr[j].yx_type == heroType && heroArr[j].level == 1) {
                    heroData = heroArr[j];
                    let count = Utils.getRandomInt(this._hangupCfg[6].yxmin_num, this._hangupCfg[6].yxmax_num);
                    rewardList.push({ "id": heroData.yxid, "count": count, "rewardType": RewardType.Hero });
                    break
                };
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
        if (btnName == "btnAd") {
            let adCount = DLocal.getQuickHangupAdCount();
            if (adCount <= 0) {
                UIManager.ShowForm(UIPath.UIFlyTip, "广告次数用完");
            } else {
                DLocal.setFinishTaskData(10004, 1); // 增加快速挂机任务
                DLocal.setFinishTaskData(10002, this._hangupTime);
                DLocal.updateAchievementCount(10002, this._hangupTime);
                DLocal.updateAchievementCount(10004, 1);

                let rewardList = this.getReward();
                DLocal.setQuickHangupAdCount(adCount - 1);
                let weekAdNum = DLocal.getWeekSeeAdNum(); // 钻石看广告次数
                DLocal.setWeekSeeAdNum(weekAdNum + 1);
                // 记录广告次数
                let todayAdCount = DLocal.getTodayAdCount();
                DLocal.setTodayAdCount(todayAdCount + 1);
                UIManager.ShowForm(UIPath.UIReward, rewardList);
                this.CloseForm();
            }
        }
    }

    // 关闭回调
    OnClose() {
        UIManager.ShowForm(UIPath.UIHangup);
    }
}