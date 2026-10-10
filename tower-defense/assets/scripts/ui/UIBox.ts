
import { MusicPath, RewardType } from "../common/GameEnum";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import AudioMgr from "../manage/AudioMgr";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIBox extends UIBase {


    @property(cc.Node)
    private imgSelectArr: cc.Node[] = [];

    @property(cc.ProgressBar)
    private pgAd: cc.ProgressBar = null;

    private _finishAdCount = 10; // 广告次数

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
        let adCount = DLocal.getTodayAdCount();
        let percent = adCount / this._finishAdCount;
        this.pgAd.progress = percent;

        let signData = DLocal.getAdBoxRecvDay();
        // this.imgSelectArr[]
        let signDay = signData.signDay; // 签到第几天
        let month = signData.month; // 第几个月
        let yday = signData.yday;   // 第几天

        var d = new Date();
        let nowyday = d.getDate();
        let nowmonth = d.getMonth();

        if (!signDay) {
            for (let i = 0; i < this.imgSelectArr.length; i++) {
                this.imgSelectArr[i].active = false;
            }
        } else {
            if (month == nowmonth && yday == nowyday) {
                for (let i = 0; i < this.imgSelectArr.length; i++) {
                    if (signDay > i) {
                        this.imgSelectArr[i].active = true;
                    } else {
                        this.imgSelectArr[i].active = false;
                    }
                }
            } else { // 今日没有领取
                let day = signDay + 1;
                if (day > 7) {
                    day = 0;
                }

                for (let i = 0; i < this.imgSelectArr.length; i++) {
                    if (day > i) {
                        this.imgSelectArr[i].active = true;
                    } else {
                        this.imgSelectArr[i].active = false;
                    }
                }
            }
        }
    }

    // 奖励
    getReward() {

        let signData = DLocal.getAdBoxRecvDay();
        let signDay = signData.signDay; // 签到第几天

        let rewardDay = 0;
        if (signDay) {

            rewardDay = signDay + 1;
            if (rewardDay > 7) {
                rewardDay = 0;
            }
        }

        rewardDay++;
        DLocal.setAdBoxRecvDay(rewardDay);

        let adBoxCfg = DLocal.GetCfgData("baoxiang-gg")[rewardDay];

        let rewardList = [];
        for (let i = adBoxCfg.bx_cid; i < adBoxCfg.bx_mid; i++) {
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
                        rewardList.push({ "id": heroData.yxid, "count": heroCount, "rewardType": RewardType.Hero });
                        break
                    };
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
        if (btnName == "btnRecvReward") { // 领取奖励
            var d = new Date();
            let nowyday = d.getDate();
            let nowmonth = d.getMonth();

            let signData = DLocal.getAdBoxRecvDay();
            let month = signData.month; // 第几个月
            let yday = signData.yday;   // 第几天
            if (nowyday == yday && nowmonth == month) {
                UIManager.ShowForm(UIPath.UIFlyTip, "今日已领取");
                return;
            }

            let adCount = DLocal.getTodayAdCount();
            if (adCount < this._finishAdCount) {
                UIManager.ShowForm(UIPath.UIFlyTip, "观看次数不足");
                return;
            }
            AudioMgr.playEffect(MusicPath.OPENBOX);

            let rewardList = this.getReward();
            UIManager.ShowForm(UIPath.UIReward, rewardList);
            this.CloseForm();
        }
    }

    // 关闭回调
    OnClose() {

    }
}