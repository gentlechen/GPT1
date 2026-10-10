
import { CurrencyId, RewardType } from "../common/GameEnum";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UISignIn extends UIBase {

    @property(cc.Label)
    private labReward1: cc.Label = null;
    @property(cc.Label)
    private labReward2: cc.Label = null;
    @property(cc.Label)
    private labRewardExplain3_3: cc.Label = null;
    @property(cc.Label)
    private labReward4: cc.Label = null;
    @property(cc.Label)
    private labReward5: cc.Label = null;
    @property(cc.Label)
    private labRewardExplain6_3: cc.Label = null;

    @property(cc.Node)
    private bgMaskArr: cc.Node[] = [];
    @property(cc.Node)
    private imgSelectArr: cc.Node[] = [];
    @property(cc.Node)
    private btnSignInArr: cc.Node[] = [];
    @property(cc.Node)
    private imgBuyArr: cc.Node[] = [];

    private _day1Reward = "";
    private _day2Reward = "";
    private _day3Reward = "";
    private _day4Reward = "";
    private _day5Reward = "";
    private _day6Reward = "";
    private _day7Reward = "";

    private _signDay = 0; // 第几天

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

        let signInCfg = DLocal.GetCfgData("mrqiandao");

        this._day1Reward = signInCfg[1].qdjl_num;
        this._day2Reward = signInCfg[2].qdjl_num;
        this._day3Reward = signInCfg[3].qdjl_num;
        this._day4Reward = signInCfg[4].qdjl_num;
        this._day5Reward = signInCfg[5].qdjl_num;
        this._day6Reward = signInCfg[6].qdjl_num;
        this._day7Reward = signInCfg[7].qdjl_num;

        this.labReward1.string = this._day1Reward;
        this.labReward2.string = this._day2Reward;
        this.labRewardExplain3_3.string = "中型宝箱X" + this._day3Reward;
        this.labReward4.string = this._day4Reward;
        this.labReward5.string = this._day6Reward;
        this.labRewardExplain6_3.string = "中型宝箱X" + this._day5Reward;

        let signInData = DLocal.getSignInDay();
        let signDay = signInData.signDay; // 签到第几天
        let month = signInData.month; // 第几个月
        let yday = signInData.yday;   // 第几天


        this._signDay = signDay % 7;

        var d = new Date();
        let nowyday = d.getDate();
        let nowmonth = d.getMonth();

        let nowDay = this._signDay;
        if (month == nowmonth && yday == nowyday) {
            nowDay--;
        }

        for (let i = 0; i < this.imgSelectArr.length; i++) {
            if (nowDay > i) {
                this.imgSelectArr[i].active = true;
                this.bgMaskArr[i].active = true;
                this.btnSignInArr[i].active = false;
                this.imgBuyArr[i].active = false;
            } else if (nowDay == i) {
                if (month == nowmonth && yday == nowyday) {
                    this.imgSelectArr[i].active = true;
                    this.bgMaskArr[i].active = true;
                    this.btnSignInArr[i].active = false;
                    this.imgBuyArr[i].active = false;
                } else {
                    this.imgSelectArr[i].active = false;
                    this.bgMaskArr[i].active = false;
                    this.btnSignInArr[i].active = true;
                    this.imgBuyArr[i].active = true;
                }
            } else {
                this.imgSelectArr[i].active = false;
                this.bgMaskArr[i].active = false;
                this.btnSignInArr[i].active = false;
                this.imgBuyArr[i].active = false;
            }
        }

    }

    // 设置奖励
    getReward(rewardId) {
        let rewardList = [];
        let signInItemCfg = DLocal.GetCfgData("mrqiandao")[rewardId];
        if (signInItemCfg.qdjl_id == CurrencyId.Gold || signInItemCfg.qdjl_id == CurrencyId.Diamond) {
            rewardList.push({ "id": signInItemCfg.qdjl_id, "count": signInItemCfg.qdjl_num, "rewardType": RewardType.currency })

        } else if (signInItemCfg.qdjl_id == CurrencyId.Box) {

            for (let i = signInItemCfg.bx_cid; i < signInItemCfg.bx_mid; i++) {
                let boxCfg = DLocal.GetCfgData("baoxiang-gl")[i];

                let probability = Utils.getRandomInt(0, 100);
                if (probability <= boxCfg.cx_gl) {
                    let heroArr = DLocal.GetCfgFindArr("tfyingxiong", "yx_pj", boxCfg.yxpz);

                    let heroIdx = Utils.getRandomInt(0, heroArr.length - 1);
                    let heroType = heroArr[heroIdx].yx_type;
                    let heroCount = Utils.getRandomInt(boxCfg.yxmin_num, boxCfg.yxmax_num);
                    let heroData = null;
                    for (let j = 0; j < heroArr.length; j++) {

                        if (heroArr[j].yx_type == heroType && heroArr[j].level == 1) {
                            heroData = heroArr[j];
                            rewardList.push({ "id": heroData.yxid, "count": heroCount, "rewardType": RewardType.Hero }); // 英雄
                            break
                        };
                    }

                    if (boxCfg.gd_jb != 0) { // 金币
                        rewardList.push({ "id": 1, "count": boxCfg.gd_jb, "rewardType": RewardType.currency })
                    }
                    if (boxCfg.gd_zs != 0) { // 钻石
                        rewardList.push({ "id": 2, "count": boxCfg.gd_zs, "rewardType": RewardType.currency })
                    }
                }

            }
        } else if (signInItemCfg.qdjl_id == CurrencyId.Mysterious) {


            let heroArr = DLocal.GetCfgFindArr("tfyingxiong", "yx_pj", 4);

            let heroIdx = Utils.getRandomInt(0, heroArr.length - 1);
            let heroType = heroArr[heroIdx].yx_type;
            let heroData = null;

            for (let j = 0; j < heroArr.length; j++) {
                if (heroArr[j].yx_type == heroType && heroArr[j].level == 1) {
                    heroData = heroArr[j];
                    rewardList.push({ "id": heroData.yxid, "count": 1, "rewardType": RewardType.Hero });
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
        if (btnName == "btnSignIn") {
            console.log("----- eventData = " + eventData)

            this._signDay++;
            DLocal.setSignInDay(this._signDay);
            DLocal.setFinishTaskData(10003, 1);
            DLocal.updateAchievementCount(10003, 1);

            let rewardList = this.getReward(eventData);
            UIManager.ShowForm(UIPath.UIReward, rewardList);
            this.CloseForm();
        }
    }

    // 关闭回调
    OnClose() {

    }
}