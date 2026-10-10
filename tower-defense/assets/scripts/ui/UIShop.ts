import { CurrencyId, RewardType } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";
import UtilsMath from "../utils/UtilsMath";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIShop extends UIBase {

    @property(cc.Label)
    private labTenDrawCardPrice: cc.Label = null;
    @property(cc.Label)
    private labAdExplain: cc.Label = null;
    @property(cc.Label)
    private labOneDrawCardPrice: cc.Label = null;

    @property(cc.Label)
    private labAotoRefreshTime2: cc.Label = null;

    @property(cc.Label)
    private labJXRefresh: cc.Label = null;
    @property(cc.ScrollView)
    private scrollShop: cc.ScrollView = null;
    @property(cc.Label)
    private labJxHeroNameArr: cc.Label[] = [];
    @property(cc.Sprite)
    private labJxHeroArr: cc.Sprite[] = [];
    @property(cc.Sprite)
    private labJxMoneyArr: cc.Sprite[] = [];
    @property(cc.Label)
    private labJxHeroCountArr: cc.Label[] = [];
    @property(cc.Node)
    private jxSelectArr: cc.Node[] = [];
    @property(cc.Node)
    private jxBuyArr: cc.Node[] = [];
    @property(cc.Label)
    private labJxPriceArr: cc.Label[] = [];
    @property(cc.Label)
    private labJxSoldoutArr: cc.Label[] = [];

    @property(cc.SpriteFrame)
    private moneyFrame: cc.SpriteFrame[] = []; // 每日精选

    @property(cc.Sprite)
    private imgGoldRed: cc.Sprite = null; // 金币商城红点

    @property(cc.Label)
    private labGoldNumArr: cc.Label[] = []; // 金币数量
    @property(cc.Sprite)
    private imgGoldArr: cc.Sprite[] = []; // 金币图标
    @property(cc.Label)
    private labGoldPriceArr: cc.Label[] = []; // 金币价格

    @property(cc.Label)
    private labDaimonRefresh: cc.Label = null;

    @property(cc.Label)
    private labDiamondNumArr: cc.Label[] = []; // 钻石数量
    @property(cc.Sprite)
    private imgDiamondArr: cc.Sprite[] = []; // 钻石图标
    @property(cc.Label)
    private labDiamondPriceArr: cc.Label[] = []; // 金币价格
    @property(cc.Node)
    private nodeDiamondRedArr: cc.Node[] = []; // 红点图标
    @property(cc.ProgressBar)
    private diamondPbArr: cc.ProgressBar[] = []; // 红点图标
    @property(cc.Sprite)
    private bgHeroArr: cc.Sprite[] = []; // 英雄背景精选图标
    @property(cc.Node)
    private btnRecvDiamondArr: cc.Node[] = [];


    private tenDrawCardConsume = 1800; // 十连抽消耗
    private oneDrawCardConsume = 1800; // 十连抽消耗


    private _jxMaxAdNum = 5; // 每日精选看广告最大次数
    private _jxGoodsInfoList = null; // 精选商品

    private _goldGoodsList = []; // 金币商城物品
    private _diamondGoodsList = []; // 金币商城物品


    // 初始相当于onLoad
    OnInit() {

        this.initLab();
    }

    //每次显示界面被调用
    public OnShow(...argList) {

        let percent = argList[0];

        // this.guildStep();

        this.initDrawCardAdNum();

        this.zeroPointCountdown()
        this.initJXGoods(); // 初始化精选

        this.initGold(); // 金币初始化

        this.initDiamond();

        if (percent != null) {
            this.scrollShop.scrollToPercentVertical(percent, 0.2);
        }

    }

    // 初始化label
    initLab() {

        let drawCardCfg = DLocal.GetCfgData("sd-chouka");

        this.tenDrawCardConsume = drawCardCfg[3].xh_num;
        this.oneDrawCardConsume = drawCardCfg[2].xh_num;
        this.labTenDrawCardPrice.string = drawCardCfg[3].xh_num;
        this.labOneDrawCardPrice.string = drawCardCfg[2].xh_num;

    }

    // 新手引导
    guildStep() {
        let isGuild = DLocal.isGuildChapter();
        if (isGuild == true) {
            let guildChapterIdx = DLocal.getGuildChapterIdx();
            let viewName = DLocal.getGuildChapterData(guildChapterIdx).view;
            if (viewName == UIPath.UIShop) {
                GameEvent.dispatchEvent(Msg.UPDATE_GUILD_STEP);
            }
        }
    }

    // 抽卡免费次数
    initDrawCardAdNum() {
        let drawCardCfg = DLocal.GetCfgData("sd-chouka");

        let nowAdNum = DLocal.getDrawCardBoxDayNum();
        this.labAdExplain.string = "免费" + nowAdNum + "/" + drawCardCfg[1].xh_lx;
    }

    // 十连抽奖励
    tenDrawCardReward() {
        let diamondNum = DLocal.getDiamond();
        if (diamondNum >= this.tenDrawCardConsume) {

            let remainDiamind = diamondNum - this.tenDrawCardConsume;
            DLocal.setDiamond(remainDiamind);

            GameEvent.dispatchEvent(Msg.UPDATE_DIAMOND);

            let drawCardRewardList = [];

            let heroArr1 = DLocal.GetCfgFindArr("tfyingxiong", "yx_pj", 4);
            let heroIdx = Utils.getRandomInt(0, heroArr1.length - 1);
            let heroType = heroArr1[heroIdx].yx_type;

            let heroData = null;
            for (let i = 0; i < heroArr1.length; i++) {
                if (heroArr1[i].yx_type == heroType && heroArr1[i].level == 1) {
                    heroData = heroArr1[i];
                    break
                };
            }

            drawCardRewardList.push({ "id": heroData.yxid, "count": 1, "rewardType": RewardType.Hero });

            let total = 0;
            let rewardList = {};
            let gqjiangliCfg = DLocal.GetCfgData("sd-chouka");
            for (const key in gqjiangliCfg) {
                if (Object.prototype.hasOwnProperty.call(gqjiangliCfg, key)) {
                    let maxCount = total + gqjiangliCfg[key].ck_gl * 10;
                    rewardList[key] = { "max": maxCount, "min": total }
                    total = maxCount;
                }
            }

            for (let i = 0; i < 9; i++) {
                let random = Utils.getRandomInt(1, 1000);
                for (const key in rewardList) {
                    if (Object.prototype.hasOwnProperty.call(rewardList, key)) {
                        if (rewardList[key].min <= random && rewardList[key].max > random) {
                            let choukaData = gqjiangliCfg[key];
                            let heroArr = DLocal.GetCfgFindArr("tfyingxiong", "yx_pj", choukaData.yxpz);

                            let heroIdx = Utils.getRandomInt(0, heroArr.length - 1);
                            let heroType = heroArr[heroIdx].yx_type;
                            let heroCount = Utils.getRandomInt(choukaData.yxmin_num, choukaData.yxmax_num);
                            let heroData = null;

                            for (let j = 0; j < heroArr.length; j++) {

                                if (heroArr[j].yx_type == heroType && heroArr[j].level == 1) {
                                    heroData = heroArr[j];
                                    drawCardRewardList.push({ "id": heroData.yxid, "count": heroCount, "rewardType": RewardType.Hero });
                                    break
                                };
                            }
                        }
                    }
                }
            }


            UIManager.ShowForm(UIPath.UIShopDrawCard, drawCardRewardList);

        } else {
            UIManager.ShowForm(UIPath.UIFlyTip, "钻石不足");
        }
    }

    // 抽卡广告宝箱
    drawCardAd() {

        let nowAdNum = DLocal.getDrawCardBoxDayNum();
        if (nowAdNum > 0) {
            // 看广告
            DLocal.setDrawCardBoxDayNum(nowAdNum - 1);

            let weekAdNum = DLocal.getWeekSeeAdNum();
            DLocal.setWeekSeeAdNum(weekAdNum + 1);
            this.loadDiamondShop();

            let rewardList = this.drawCardAdAndOne();
            UIManager.ShowForm(UIPath.UIShopDrawCard, rewardList);

            // 记录广告次数
            let todayAdCount = DLocal.getTodayAdCount();
            DLocal.setTodayAdCount(todayAdCount + 1);
        } else {
            UIManager.ShowForm(UIPath.UIFlyTip, "广告次数不足");
        }
    }

    // 广告奖励和单抽奖励
    drawCardAdAndOne() {

        let reardList = [];


        let total = 0;
        let rewardList = {};
        let gqjiangliCfg = DLocal.GetCfgData("sd-chouka");
        for (const key in gqjiangliCfg) {
            if (Object.prototype.hasOwnProperty.call(gqjiangliCfg, key)) {
                let maxCount = total + gqjiangliCfg[key].ck_gl * 10;
                rewardList[key] = { "max": maxCount, "min": total }
                total = maxCount;
            }
        }
        let random = Utils.getRandomInt(1, 1000);
        for (const key in rewardList) {
            if (Object.prototype.hasOwnProperty.call(rewardList, key)) {
                if (rewardList[key].min <= random && rewardList[key].max > random) {
                    let choukaData = gqjiangliCfg[key];
                    let heroArr = DLocal.GetCfgFindArr("tfyingxiong", "yx_pj", choukaData.yxpz);

                    // let heroIdx = Utils.getRandomInt(0, heroArr.length - 1);
                    let heroCount = Utils.getRandomInt(choukaData.yxmin_num, choukaData.yxmax_num);

                    let heroIdx = Utils.getRandomInt(0, heroArr.length - 1);
                    let heroType = heroArr[heroIdx].yx_type;
                    let heroData = null;
                    for (let i = 0; i < heroArr.length; i++) {
                        if (heroArr[i].yx_type == heroType && heroArr[i].level == 1) {
                            heroData = heroArr[i];
                            break
                        };
                    }
                    reardList.push({ "id": heroData.yxid, "count": heroCount, "rewardType": RewardType.Hero });
                    break;
                }
            }
        }

        console.log("---------抽卡奖励----------")
        console.log(reardList)
        return reardList;
    }

    // ----------------------------- 每日精选------------------
    // 零点倒计时
    zeroPointCountdown() {

        // this._date.toLocaleTimeString();

        let remainTime = 86400 + Math.floor(new Date(new Date().toLocaleDateString()).getTime() - new Date().getTime()) / 1000;

        this.labAotoRefreshTime2.string = "刷新时间 " + UtilsMath.getTimeForm1(remainTime);

        if (remainTime <= 0) { // 刷新
            this.initJXGoods();
        }
    }


    // 每日精选商品初始化
    initJXGoods() {
        this.initJXGoodsData();

        this.loadJXGoods();

        this.labJXRefresh.string = "手动刷新" + DLocal.getJXRefreshNum() + "/" + this._jxMaxAdNum;
    }


    // 每日精选 获得商品数据
    initJXGoodsData() {

        this._jxGoodsInfoList = DLocal.getJXGoodsList();
        if (this._jxGoodsInfoList.length > 0) {
            return;
        }

        let total1 = 0;
        let total2 = 0;
        let total3 = 0;
        let total4 = 0;
        let total5 = 0;
        let total6 = 0;
        let jxGoodsList = [];
        let mrjx1Cfg = DLocal.GetCfgData("mrjx1");
        for (const key in mrjx1Cfg) {
            if (Object.prototype.hasOwnProperty.call(mrjx1Cfg, key)) {
                let maxCount1 = total1 + mrjx1Cfg[key].cw1_gl;
                let maxCount2 = total2 + mrjx1Cfg[key].cw2_gl;
                let maxCount3 = total3 + mrjx1Cfg[key].cw3_gl;
                let maxCount4 = total4 + mrjx1Cfg[key].cw4_gl;
                let maxCount5 = total5 + mrjx1Cfg[key].cw5_gl;
                let maxCount6 = total6 + mrjx1Cfg[key].cw6_gl;
                jxGoodsList.push({
                    "quality": mrjx1Cfg[key].yxpz, "max1": maxCount1, "min1": total1, "max2": maxCount2, "min2": total2, "max3": maxCount3, "min3": total3,
                    "max4": maxCount4, "min4": total4, "max5": maxCount5, "min5": total5, "max6": maxCount6, "min6": total6
                })
                total1 = maxCount1;
                total2 = maxCount2;
                total3 = maxCount3;
                total4 = maxCount4;
                total5 = maxCount5;
                total6 = maxCount6;
            }
        }

        let random1 = Utils.getRandomInt(1, 100);
        let random2 = Utils.getRandomInt(1, 100);
        let random3 = Utils.getRandomInt(1, 100);
        let random4 = Utils.getRandomInt(1, 100);
        let random5 = Utils.getRandomInt(1, 100);
        let random6 = Utils.getRandomInt(1, 100);

        let jxAddGoodsFunc = (index, j) => {
            let heroArr = DLocal.GetCfgFindArr("tfyingxiong", "yx_pj", jxGoodsList[j].quality);
            let heroIdx = Utils.getRandomInt(0, heroArr.length - 1);

            let heroType = heroArr[heroIdx].yx_type;
            let heroData = null;
            for (let i = 0; i < heroArr.length; i++) {
                if (heroArr[i].yx_type == heroType && heroArr[i].level == 1) {
                    heroData = heroArr[i];
                    break
                };
            }


            let mrix2Data = DLocal.GetCfgData("mrjx2")[jxGoodsList[j].quality];
            let heroCount = Utils.getRandomInt(mrix2Data.yxmin_num, mrix2Data.yxmax_num);
            let moneyId = 0;
            let price = 0;
            let priceRandom = Utils.getRandomInt(1, 100);
            if (0 < priceRandom && priceRandom <= mrix2Data.cxgl_01) { // 金币
                moneyId = 1; // 金币
                price = heroCount * mrix2Data.yx_dj1;
            } else { // 钻石
                moneyId = 2; // 钻石
                price = heroCount * mrix2Data.yx_dj2;
            }
            this._jxGoodsInfoList[index] = { "id": heroData.yxid, "count": heroCount, "moneyId": moneyId, "price": price, "isBuy": false };
        }


        for (let j = 0; j < jxGoodsList.length; j++) {

            let chance1 = jxGoodsList[j].max1 - jxGoodsList[j].min1;
            if (chance1 > 0 && jxGoodsList[j].max1 >= random1 && random1 >= jxGoodsList[j].min1) {

                jxAddGoodsFunc(0, j);
            }

            let chance2 = jxGoodsList[j].max2 - jxGoodsList[j].min2;
            if (chance2 > 0 && jxGoodsList[j].max2 >= random2 && random2 >= jxGoodsList[j].min2) {

                jxAddGoodsFunc(1, j);
            }

            let chance3 = jxGoodsList[j].max3 - jxGoodsList[j].min3;
            if (chance3 > 0 && jxGoodsList[j].max3 >= random3 && random3 >= jxGoodsList[j].min3) {

                jxAddGoodsFunc(2, j);
            }

            let chance4 = jxGoodsList[j].max4 - jxGoodsList[j].min4;
            if (chance4 > 0 && jxGoodsList[j].max4 >= random4 && random4 >= jxGoodsList[j].min4) {

                jxAddGoodsFunc(3, j);
            }

            let chance5 = jxGoodsList[j].max5 - jxGoodsList[j].min5;
            if (chance5 > 0 && jxGoodsList[j].max5 >= random5 && random5 >= jxGoodsList[j].min5) {

                jxAddGoodsFunc(4, j);
            }

            let chance6 = jxGoodsList[j].max6 - jxGoodsList[j].min6;
            if (chance6 > 0 && jxGoodsList[j].max6 >= random6 && random6 >= jxGoodsList[j].min6) {

                jxAddGoodsFunc(5, j);
            }
        }


        DLocal.setJXGoodsList(this._jxGoodsInfoList); // 保存每日精选数据
    }

    // 每日精选 加载商品
    loadJXGoods() {
        for (let i = 0; i < this._jxGoodsInfoList.length; i++) {
            let data = this._jxGoodsInfoList[i];
            let heroCfg = DLocal.GetCfgData("tfyingxiong")[data.id];
            if (!heroCfg) {
                continue;
            }

            this.labJxHeroNameArr[i].string = heroCfg.name;
            Utils.loadImg("ui/heroIcon/" + heroCfg.yx_type, (sp) => {
                this.labJxHeroArr[i].spriteFrame = sp;
            })

            Utils.loadImg("ui/common/sd2_bg_dilv_" + heroCfg.yx_pj, (sp) => {

                this.bgHeroArr[i].spriteFrame = sp;
            })

            this.labJxHeroCountArr[i].string = "X" + data.count;
            this.jxSelectArr[i].active = data.isBuy; // 是否已购买
            this.jxBuyArr[i].active = !data.isBuy; // 是否已购买
            this.labJxSoldoutArr[i].node.active = data.isBuy; // 是否已购买

            if (data.isBuy == false) {
                this.labJxPriceArr[i].node.active = true;

                if (i != 0) {
                    this.labJxPriceArr[i].string = data.price;
                    this.labJxMoneyArr[i].node.active = true;
                    this.labJxMoneyArr[i].spriteFrame = this.moneyFrame[data.moneyId - 1]; // 货币图片
                    this.labJxPriceArr[i].string = data.price;
                } else {
                    // this.labJxPriceArr[i].string = ;
                }
            } else {
                if (this.labJxPriceArr[i]) {
                    this.labJxPriceArr[i].node.active = false;
                }
                if (this.labJxMoneyArr[i]) {
                    this.labJxMoneyArr[i].node.active = false;
                }

            }

        }
    }
    ///------------------------- 每日精选  end

    // ------------------- 金币 start

    // 初始化金币
    initGold() {
        this.getGlodShopData();
        this.loadGoldShop();
    }

    // 获取金币商店数据
    getGlodShopData() {

        this._goldGoodsList = [];
        let goldCfg = DLocal.GetCfgData("sd-jinbizuanshi");
        for (const key in goldCfg) {
            if (Object.prototype.hasOwnProperty.call(goldCfg, key)) {
                if (goldCfg[key].wp_sd == 1) {
                    this._goldGoodsList.push(goldCfg[key]);
                }
            }
        }

    }

    // 加载金币商城数据
    loadGoldShop() {

        for (let i = 0; i < this._goldGoodsList.length; i++) {
            this.labGoldNumArr[i].string = this._goldGoodsList[i].wp_num;

            if (this._goldGoodsList[i].gmhf == 3) {

                let adNum = DLocal.getGoldAdNum();
                if (adNum == -2) {
                    adNum = this._goldGoodsList[i].mrsx;
                    DLocal.setGoldAdNum(adNum);
                }
                this.labGoldPriceArr[i].string = "免费" + adNum + "/" + this._goldGoodsList[i].mrsx;

                this.imgGoldRed.node.active = adNum > 0;
            } else {
                this.labGoldPriceArr[i].string = this._goldGoodsList[i].hf_num;
            }
        }
    }

    // ------------------- 金币 end

    // ------------------- 钻石 start
    initDiamond() {

        this.diamondTimer();
        this.getDiamondShopData();
        this.loadDiamondShop();
    }

    // 钻石倒计时
    diamondTimer() {

        let date = new Date();
        let remainTime = (8 - date.getDay()) * 86400 - Math.floor((new Date(new Date().toLocaleDateString()).getTime() - new Date().getTime()) / 1000);
        this.labDaimonRefresh.string = "刷新时间 " + UtilsMath.getTimeForm1(remainTime);
        if (remainTime <= 1) {
            this.getDiamondShopData();
            this.loadDiamondShop();
        }
    }

    // 获取钻石商店数据
    getDiamondShopData() {

        this._diamondGoodsList = [];
        let goldCfg = DLocal.GetCfgData("sd-jinbizuanshi");
        for (const key in goldCfg) {
            if (Object.prototype.hasOwnProperty.call(goldCfg, key)) {
                if (goldCfg[key].wp_sd == 2) {
                    this._diamondGoodsList.push(goldCfg[key]);
                }
            }
        }
    }

    // 加载钻石商城数据
    loadDiamondShop() {

        let diamondRecvList = DLocal.getWeekSeeAdData().recvList;
        let weekAdNum = DLocal.getWeekSeeAdNum();
        for (let i = 0; i < this._diamondGoodsList.length; i++) {
            if (this._diamondGoodsList[i].gmhf == 3) {
                let adNum = DLocal.getDiamondAdNum();
                if (adNum == -2) {
                    adNum = this._diamondGoodsList[i].mrsx;
                    DLocal.setDiamondAdNum(adNum);
                }
                this.labDiamondPriceArr[i].string = "免费" + adNum + "/" + this._diamondGoodsList[i].mrsx;
                this.nodeDiamondRedArr[i].active = adNum > 0;
            } else {
                let isRecv = false;
                for (let j = 0; j < diamondRecvList.length; j++) {
                    if (diamondRecvList[j] == i) {
                        isRecv = true;
                        break;
                    }
                }

                this.diamondPbArr[i].progress = weekAdNum / this._diamondGoodsList[i].hf_num;
                if (isRecv == false) {
                    this.btnRecvDiamondArr[i].getComponent(cc.Button).enabled = true;
                    this.nodeDiamondRedArr[i].active = weekAdNum >= this._diamondGoodsList[i].hf_num;
                    this.labDiamondPriceArr[i].string = weekAdNum + "/" + this._diamondGoodsList[i].hf_num;
                } else {
                    this.btnRecvDiamondArr[i].getComponent(cc.Button).enabled = false;
                    this.nodeDiamondRedArr[i].active = false;
                    this.labDiamondPriceArr[i].string = "已领取";
                }

            }
            this.labDiamondNumArr[i].string = this._diamondGoodsList[i].wp_num;
        }
    }

    // ------------------- 钻石 end

    // 每秒
    OnUpdateSEC() {
        this.zeroPointCountdown();
        this.diamondTimer();
    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

        console.log("---- btnName = " + btnName)
        if (btnName == "btnTenDrawCard") { // 十连抽
            this.tenDrawCardReward();
            DLocal.setFinishTaskData(30005, 10); // 抽奖任务
            DLocal.updateAchievementCount(30005, 10);
        } else if (btnName == "btnAdDrawCard") {// 看广告
            this.drawCardAd();
            this.initDrawCardAdNum();
            DLocal.setFinishTaskData(30005, 1); // 抽奖任务
            DLocal.updateAchievementCount(30005, 1);
        } else if (btnName == "btnOneDrawCard") { // 单抽

            let diamondNum = DLocal.getDiamond();
            if (diamondNum >= this.oneDrawCardConsume) {
                let remainDiamind = diamondNum - this.oneDrawCardConsume;
                DLocal.setDiamond(remainDiamind);
                GameEvent.dispatchEvent(Msg.UPDATE_DIAMOND);
                let rewardList = this.drawCardAdAndOne();
                UIManager.ShowForm(UIPath.UIShopDrawCard, rewardList);
                DLocal.setFinishTaskData(30005, 1); // 抽奖任务
                DLocal.updateAchievementCount(30005, 1);
            } else {
                UIManager.ShowForm(UIPath.UIFlyTip, "钻石不足");
            }
        } else if (btnName == "btnJXRefresh") { // 每日精选刷新
            let adNum = DLocal.getJXRefreshNum();
            if (adNum > 0) {
                adNum--;
                DLocal.setJXRefreshNum(adNum);
                DLocal.setJXGoodsList([]);
                this.initJXGoods();

                // 记录广告次数
                let todayAdCount = DLocal.getTodayAdCount();
                DLocal.setTodayAdCount(todayAdCount + 1);
            } else {
                UIManager.ShowForm(UIPath.UIFlyTip, "没有广告次数");
            }
        } else if (btnName == "btnJxBuy") {

            let index = Number(eventData);
            let data = this._jxGoodsInfoList[index];
            let goodsSF = btnNode.parent.getChildByName("imgHero" + (index + 1)).getComponent(cc.Sprite).spriteFrame;
            let callFunc = () => {
                this._jxGoodsInfoList[index].isBuy = true;
                DLocal.setJXGoodsList(this._jxGoodsInfoList); // 保存每日精选数据
                this.loadJXGoods();
                let rewardList = [];
                rewardList.push({ "id": data.id, "count": data.count, "rewardType": RewardType.Hero });
                UIManager.ShowForm(UIPath.UIReward, rewardList);
                // DLocal.addSingleHero(data.id, data.count);
                DLocal.setFinishTaskData(30000, 1); // 每日精选任务
                DLocal.updateAchievementCount(30000, 1);
            }
            if (index == 0) {
                callFunc();
            } else {
                UIManager.ShowForm(UIPath.UIConfirmBuy, data.price, goodsSF, data.moneyId, () => {
                    callFunc();
                }, true, data.id, data.count);
            }

        } else if (btnName == "btnGold") {

            let index = Number(eventData);

            if (index != 0) {
                let data = this._goldGoodsList[index];
                let goodsSF = this.imgGoldArr[index].spriteFrame;
                UIManager.ShowForm(UIPath.UIConfirmBuy, data.hf_num, goodsSF, CurrencyId.Diamond, () => {
                    console.log("-----------购买回调")

                    let goldNum = this._goldGoodsList[index].wp_num;
                    // let nowGold = DLocal.getGold();
                    // DLocal.setGold(nowGold + goldNum);
                    // GameEvent.dispatchEvent(Msg.UPDATE_GOLD);
                    this.loadGoldShop();
                    let rewardList = [];
                    rewardList.push({ "id": 1, "count": goldNum, "rewardType": RewardType.currency });
                    UIManager.ShowForm(UIPath.UIReward, rewardList);
                }, false, 0);
            } else {
                // 看广告
                let adNum = DLocal.getGoldAdNum();
                if (adNum > 0) {
                    DLocal.setGoldAdNum(adNum - 1);
                    let weekAdNum = DLocal.getWeekSeeAdNum();
                    DLocal.setWeekSeeAdNum(weekAdNum + 1);
                    this.loadDiamondShop();

                    let goldNum = this._goldGoodsList[index].wp_num;
                    // let nowGold = DLocal.getGold();
                    // DLocal.setGold(nowGold + goldNum);
                    // GameEvent.dispatchEvent(Msg.UPDATE_GOLD);
                    this.loadGoldShop();

                    let rewardList = [];
                    rewardList.push({ "id": 1, "count": goldNum, "rewardType": RewardType.currency });
                    UIManager.ShowForm(UIPath.UIReward, rewardList);

                    // 记录广告次数
                    let todayAdCount = DLocal.getTodayAdCount();
                    DLocal.setTodayAdCount(todayAdCount + 1);
                } else {
                    UIManager.ShowForm(UIPath.UIFlyTip, "广告次数不足");
                }

            }

        } else if (btnName == "btnRecvDiamond") {

            let index = Number(eventData);
            if (index == 0) {
                let adNum = DLocal.getDiamondAdNum();
                if (adNum > 0) {
                    // 看广告
                    let weekAdNum = DLocal.getWeekSeeAdNum();
                    DLocal.setWeekSeeAdNum(weekAdNum + 1);
                    this.loadDiamondShop();

                    DLocal.setDiamondAdNum(adNum - 1);
                    // let nowDiamond = DLocal.getDiamond();
                    let diamondNum = this._diamondGoodsList[index].wp_num;
                    // DLocal.setDiamond(nowDiamond + diamondNum);
                    // GameEvent.dispatchEvent(Msg.UPDATE_DIAMOND);

                    this.getDiamondShopData();
                    this.loadDiamondShop();

                    let rewardList = [];
                    rewardList.push({ "id": 2, "count": diamondNum, "rewardType": RewardType.currency });
                    UIManager.ShowForm(UIPath.UIReward, rewardList);

                    // 记录广告次数
                    let todayAdCount = DLocal.getTodayAdCount();
                    DLocal.setTodayAdCount(todayAdCount + 1);
                } else {
                    UIManager.ShowForm(UIPath.UIFlyTip, "广告次数不足");
                }
            } else {
                let adNum = DLocal.getWeekSeeAdNum();
                if (adNum >= this._diamondGoodsList[index].hf_num) {

                    // DLocal.setDiamondAdNum(adNum - 1);
                    DLocal.setWeekSeeAdData(index);

                    // let nowDiamond = DLocal.getDiamond();
                    let diamondNum = this._diamondGoodsList[index].wp_num;
                    // DLocal.setDiamond(nowDiamond + diamondNum);
                    // GameEvent.dispatchEvent(Msg.UPDATE_DIAMOND);

                    let rewardList = [];
                    rewardList.push({ "id": 2, "count": diamondNum, "rewardType": RewardType.currency });
                    UIManager.ShowForm(UIPath.UIReward, rewardList);

                    this.getDiamondShopData();
                    this.loadDiamondShop();
                } else {
                    UIManager.ShowForm(UIPath.UIFlyTip, "累计广告不足");
                }
            }
        }
    }

    // 关闭回调
    OnClose() {
    }
}