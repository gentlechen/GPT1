import { RewardType } from "../common/GameEnum";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIHangup extends UIBase {

    @property(cc.ProgressBar)
    private pbReward: cc.ProgressBar = null;
    @property(cc.Label)
    private labDiamondNum: cc.Label = null;
    @property(cc.Label)
    private labGoldNum: cc.Label = null;
    @property(cc.Label)
    private labHeroNum1: cc.Label = null;
    @property(cc.Label)
    private labHeroNum2: cc.Label = null;
    @property(cc.Label)
    private labHeroNum3: cc.Label = null;
    @property(cc.Label)
    private labHeroNum4: cc.Label = null;

    private _hangupData = null;
    private _hangupCfg = null;
    private _rewardHeroMap = {};
    private _isSaveData = false;

    private _lastGoldNum = 0;
    private _lastDiamondNum = 0;
    private _lastHeroTime1Num = 0;
    private _lastHeroTime2Num = 0;
    private _lastHeroTime3Num = 0;
    private _lastHeroTime4Num = 0;
    private _nowGoldNum = 0;
    private _nowDiamondNum = 0;
    private _nowHeroTime1Num = 0;
    private _nowHeroTime2Num = 0;
    private _nowHeroTime3Num = 0;
    private _nowHeroTime4Num = 0;


    private _hangupProfit = 0; // 挂机收益时间

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this.initRewardTime();
    }

    // 初始化label
    initLab() {

    }

    // 当前时间进度
    initRewardTime() {

        if (!this._hangupData) {
            this._hangupData = DLocal.getNowHangupTime();
        }
        if (!this._hangupCfg) {
            this._hangupCfg = DLocal.GetCfgData("guaji");
        }

        let remainTime = Math.floor(Date.now() / 1000) - this._hangupData.time;
        if (remainTime > 43200) {
            remainTime = 43200;
        }
        this._hangupProfit = remainTime;
        let percent = remainTime / 43200;
        this.pbReward.progress = percent;

        let maxTime = this._hangupData.time + remainTime;

        let goldtime = maxTime - this._hangupData.goldTime;
        let diamondTime = maxTime - this._hangupData.diamondTime;
        let heroTime1 = maxTime - this._hangupData.heroTime1;
        let heroTime2 = maxTime - this._hangupData.heroTime2;
        let heroTime3 = maxTime - this._hangupData.heroTime3;
        let heroTime4 = maxTime - this._hangupData.heroTime4;

        let goldNum = Math.floor(goldtime / this._hangupCfg[1].jl_dlsj);
        let diamondNum = Math.floor(diamondTime / this._hangupCfg[2].jl_dlsj);
        let heroTime1Num = Math.floor(heroTime1 / this._hangupCfg[3].jl_dlsj);
        let heroTime2Num = Math.floor(heroTime2 / this._hangupCfg[4].jl_dlsj);
        let heroTime3Num = Math.floor(heroTime3 / this._hangupCfg[5].jl_dlsj);
        let heroTime4Num = Math.floor(heroTime4 / this._hangupCfg[6].jl_dlsj);

        if (goldNum != this._lastGoldNum) {
            let count = 0;
            for (let i = 0; i < goldNum; i++) {
                count += Utils.getRandomInt(this._hangupCfg[1].yxmin_num, this._hangupCfg[1].yxmax_num);
            }
            this._lastGoldNum = goldNum;
            this._nowGoldNum = count;
        }
        if (diamondNum != this._lastDiamondNum) {
            let count = 0;
            for (let i = 0; i < diamondNum; i++) {
                count += Utils.getRandomInt(this._hangupCfg[2].yxmin_num, this._hangupCfg[2].yxmax_num);
            }
            this._lastDiamondNum = diamondNum;
            this._nowDiamondNum = count;
        }

        if (heroTime1Num != this._lastHeroTime1Num) {
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
            this._lastHeroTime1Num = heroTime1Num;
            this._nowHeroTime1Num = count;
        }

        if (heroTime2Num != this._lastHeroTime2Num) {
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
            this._lastHeroTime2Num = heroTime2Num;
            this._nowHeroTime2Num = count;
        }

        if (heroTime3Num != this._lastHeroTime3Num) {
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
            this._lastHeroTime3Num = heroTime3Num;
            this._nowHeroTime3Num = count;
        }

        if (heroTime4Num != this._lastHeroTime4Num) {
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
            this._lastHeroTime4Num = heroTime4Num;
            this._nowHeroTime4Num = count;
        }


        this.labGoldNum.string = "X" + this._nowGoldNum;
        this.labDiamondNum.string = "X" + this._nowDiamondNum;
        this.labHeroNum1.string = "X" + this._nowHeroTime1Num;
        this.labHeroNum2.string = "X" + this._nowHeroTime2Num;
        this.labHeroNum3.string = "X" + this._nowHeroTime3Num;
        this.labHeroNum4.string = "X" + this._nowHeroTime4Num;
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
        if (this._nowGoldNum > 0) {
            rewardList.push({ "id": 1, "count": this._nowGoldNum, "rewardType": RewardType.currency })
        }
        if (this._nowDiamondNum > 0) {
            rewardList.push({ "id": 2, "count": this._nowDiamondNum, "rewardType": RewardType.currency })
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
        return rewardList;
    }

    // 重置领取奖励的时间
    reRewardTime() {

        let nowTime = Math.floor(Date.now() / 1000);
        let isSave = false;
        if (this._nowGoldNum > 0) {
            this._hangupData.goldTime = nowTime;
            isSave = true;
        }
        if (this._nowDiamondNum > 0) {
            this._hangupData.diamondTime = nowTime;
            isSave = true;
        }
        if (this._nowHeroTime1Num > 0) {
            this._hangupData.heroTime1 = nowTime;
            isSave = true;
        }
        if (this._nowHeroTime2Num > 0) {
            this._hangupData.heroTime2 = nowTime;
            isSave = true;
        }
        if (this._nowHeroTime3Num > 0) {
            this._hangupData.heroTime3 = nowTime;
            isSave = true;
        }
        if (this._nowHeroTime4Num > 0) {
            this._hangupData.heroTime4 = nowTime;
            isSave = true;
        }

        if (isSave == true) {
            this._hangupData.time = nowTime;
            DLocal.setNowHangupTime(this._hangupData);
        }
    }

    // 每秒
    OnUpdateSEC() {
        this.initRewardTime();
    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

        if (btnName == "btnQuickHangup") {
            UIManager.ShowForm(UIPath.UIHangupQuick);
            this.CloseForm();
        } else if (btnName == "btnRecv") {
            let rewardList = this.getReward();
            if (rewardList.length == 0) {
                UIManager.ShowForm(UIPath.UIFlyTip, "没有可领取的奖励");
            } else {
                DLocal.setFinishTaskData(10002, this._hangupProfit);
                DLocal.updateAchievementCount(10002, this._hangupProfit);
                this.reRewardTime();
                UIManager.ShowForm(UIPath.UIReward, rewardList, () => {
                    UIManager.ShowForm(UIPath.UIHangupQuick);
                });
                this.CloseForm();
            }
        }
    }

    // 关闭回调
    OnClose() {

    }
}