import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIHeroMain extends UIBase {

    @property(cc.Node)
    private bgAction1: cc.Node = null;
    @property(cc.Node)
    private bgAction2: cc.Node = null;

    @property(cc.ScrollView)
    private scrollHero: cc.ScrollView = null;

    @property(cc.Node)
    private itemHeroCard: cc.Node = null;
    @property(cc.Node)
    private itemHeroLimit: cc.Node = null;
    @property(cc.Node)
    private itemHeroTitle1: cc.Node = null;
    @property(cc.Node)
    private itemHeroTitle2: cc.Node = null;
    @property(cc.Node)
    private itemHeroTitle3: cc.Node = null;
    // @property(cc.Toggle)
    // private tgWayArr: cc.Toggle[] = [];


    @property(cc.Node)
    private content: cc.Node = null;

    private _limitIndex = 0; // 限制第一个

    private _haveNoLimitHero = []; // 拥有没有被限制的英雄
    private _haveLimitHero = []; // 被限制的英雄
    private _haveLockHero = []; // 没有解锁的英雄

    private _isShowOperate = false; // 显示操作按钮

    private _limitMin = 9; // 小于6个英雄不限制
    private _guildTimer = null;

    // 初始相当于onLoad
    OnInit() {
    }

    //每次显示界面被调用
    public OnShow(...argList) {

        GameEvent.addEventHandler(Msg.UPDATE_HERO, this.updateHero.bind(this), this);
        GameEvent.addEventHandler(Msg.DELETE_BATTLE_HERO, this.updateLimitHeroFunc.bind(this), this);

        this._limitIndex = DLocal.getLimitHeroSelectIdx();
        this.bgAction1.y = 0;
        this.bgAction2.y = 1336;
        // this.tgWayArr[this._limitIndex].isChecked = true;
        this._isShowOperate = false;
        this.getHaveHero();
        this.loadHero();
        this.showAllOperate();
        if (this._guildTimer) {
            clearTimeout(this._guildTimer);
            this._guildTimer = null;
        }
        this._guildTimer = setTimeout(() => {
            if (!this || !this.node) {
                return;
            }
            let guildChapterIdx = DLocal.getGuildChapterIdx();
            this.guildStep(guildChapterIdx);
        }, 400);

    }

    // 初始化label
    initLab() {

    }

    // 更新英雄
    updateHero() {

        this.getHaveHero();
        this.loadHero();
    }

    // 更新限制英雄
    updateLimitHeroFunc(heroId) {
        this.heroAddLimit(heroId);
    }

    // 获取英雄数据
    getHaveHero() {

        this._haveLimitHero = [];
        this._haveNoLimitHero = [];
        this._haveLockHero = [];

        let haveHeroList = DLocal.getHeroList();
        let limitHeroMap = DLocal.getLimitHeroMap();
        let heroCfg = DLocal.GetCfgData("tfyingxiong");

        let heroTypeMap = {}
        for (let i = 0; i < haveHeroList.length; i++) {
            let heroType = heroCfg[haveHeroList[i].id].yx_type;
            heroTypeMap[heroType] = haveHeroList[i];
        }

        let limitHeroTypeMap = {};

        if (haveHeroList.length > this._limitMin) { // 小于6个不做限制
            let limitHeroList = limitHeroMap[this._limitIndex];
            if (limitHeroList) {
                for (let i = 0; i < limitHeroList.length; i++) {
                    let heroType = heroCfg[limitHeroList[i].id].yx_type;
                    limitHeroTypeMap[heroType] = limitHeroList[i];
                }
            }
        }

        for (const key in heroCfg) {
            if (Object.prototype.hasOwnProperty.call(heroCfg, key)) {
                if (heroCfg[key].level == 0) {
                    if (heroTypeMap[heroCfg[key].yx_type]) {
                        if (limitHeroTypeMap[heroCfg[key].yx_type]) {
                            this._haveLimitHero.push(heroTypeMap[heroCfg[key].yx_type]);
                        } else {
                            this._haveNoLimitHero.push(heroTypeMap[heroCfg[key].yx_type]);
                        }
                    } else {
                        this._haveLockHero.push({ "id": heroCfg[key].yxid, "count": 0 });
                    }
                }
            }
        }
    }

    // 计算战舰血量
    getWarshipBlood() {
        let allHeroBlood = 0;
        let haveHeroList = DLocal.getHeroList();
        for (let i = 0; i < haveHeroList.length; i++) {
            let heroId = haveHeroList[i].id;
            allHeroBlood += DLocal.GetCfgData("tfyingxiong")[heroId].yx_hp;
        }
        return allHeroBlood;
    }

    // 加载英雄数据
    loadHero() {
        // this._haveLimitHero = [];
        // this._haveNoLimitHero = [];
        // this._haveLockHero = [];

        let nowY = 0; // 当前Y的高度

        for (let i = 0; i < this.content.childrenCount; i++) {
            this.content.children[i].active = false;
        }

        let haveHeroList = DLocal.getHeroList();

        let heroCardHeight = 220;
        let heroCardWidth = 160;
        let scrollWidth = 320;

        // 标题1
        let itemTitle1 = this.content.getChildByName("itemHeroTitle1");
        if (!itemTitle1) {
            itemTitle1 = cc.instantiate(this.itemHeroTitle1);
            itemTitle1.parent = this.content;
        }
        itemTitle1.active = true;
        itemTitle1.y = nowY;
        nowY -= 120;
        itemTitle1.getChildByName("labUnlockHero").getComponent(cc.Label).string = "已上阵英雄：" + this._haveNoLimitHero.length + "/" + haveHeroList.length;

        let allHero = this.getWarshipBlood();
        let totalBlood = allHero + DLocal.getWarshipBaseBlood();
        itemTitle1.getChildByName("labBloodHelp").getComponent(cc.Label).string = "HP:" + totalBlood;
        let bloodExplain = "战舰基础生命：" + DLocal.getWarshipBaseBlood() + "\n英雄加成生命：" + allHero;
        Utils.ShowTipInfoView(itemTitle1.getChildByName("imgQuestion"), bloodExplain)
        nowY -= 15;
        let initY = nowY;
        for (let i = 0; i < this._haveNoLimitHero.length; i++) {
            let heroCardName = "itemHeroCard" + i;
            let heroCard = this.content.getChildByName(heroCardName);
            if (!heroCard) {
                heroCard = cc.instantiate(this.itemHeroCard);
                heroCard.name = heroCardName;
                heroCard.parent = this.content;
            }
            let row = Math.ceil((i + 1) / 4); // 行
            let col = i % 4; // 列

            heroCard.active = true;
            nowY = initY - (row - 1) * heroCardHeight;
            heroCard.y = nowY;
            heroCard.x = col * heroCardWidth - scrollWidth;

            let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._haveNoLimitHero[i].id];
            heroCard.getChildByName("labHeroName").getComponent(cc.Label).string = heroItemCfg.name;

            let heroQuality = heroItemCfg.yx_pj;

            Utils.loadImg("ui/hero/bghero" + heroQuality, (sp) => {

                heroCard.getChildByName("bgHero").getComponent(cc.Sprite).spriteFrame = sp;
            })
            Utils.loadImg("ui/hero/bgHeroQulity" + heroQuality, (sp) => {

                heroCard.getChildByName("imgHeroQuality").getComponent(cc.Sprite).spriteFrame = sp;
            })
            Utils.loadImg("ui/hero/bgHeroQulity" + heroQuality, (sp) => {

                heroCard.getChildByName("bgHeroProfession").getComponent(cc.Sprite).spriteFrame = sp;
            })
            Utils.loadImg("ui/hero/imgProfession" + heroItemCfg.yx_zy, (sp) => {

                heroCard.getChildByName("imgHeroProfession").getComponent(cc.Sprite).spriteFrame = sp;
            })
            Utils.loadImg("ui/hero/imgPregress" + heroQuality, (sp) => {

                heroCard.getChildByName("pbHeroNum").getChildByName("bar").getComponent(cc.Sprite).spriteFrame = sp;
            })

            let heroType = heroItemCfg.yx_type;
            Utils.loadImg("ui/heroIcon/" + heroType, (sp) => {

                heroCard.getChildByName("imgHero").getComponent(cc.Sprite).spriteFrame = sp;
            })

            heroCard.getChildByName("labHeroLv").getComponent(cc.Label).string = heroItemCfg.level;
            heroCard.getChildByName("labHeroProgress").getComponent(cc.Label).string = this._haveNoLimitHero[i].count + "/" + heroItemCfg.unlock_sp;
            heroCard.getChildByName("pbHeroNum").getComponent(cc.ProgressBar).progress = this._haveNoLimitHero[i].count / heroItemCfg.unlock_sp;

            heroCard.getChildByName("btnHero").getComponent(cc.Button).clickEvents[0].customEventData = this._haveNoLimitHero[i].id;
            heroCard.getChildByName("btnOperate").getComponent(cc.Button).clickEvents[0].customEventData = this._haveNoLimitHero[i].id;

        }
        nowY -= heroCardHeight;

        // 标题2
        let itemTitle2 = this.content.getChildByName("itemHeroTitle2");
        if (!itemTitle2) {
            itemTitle2 = cc.instantiate(this.itemHeroTitle2);
            itemTitle2.parent = this.content;
        }
        itemTitle2.y = nowY;
        itemTitle2.active = true;

        let limitTotal = haveHeroList.length - this._limitMin;
        if (limitTotal < 0) {
            limitTotal = 0;
        }

        let totalLimitList = [];
        if (limitTotal == 0) {
            itemTitle2.getChildByName("labUnlockHero").getComponent(cc.Label).string = "限制出战：" + limitTotal;
        } else {

            let limitHeroMap = DLocal.getLimitHeroMap();

            let limitHeroList = limitHeroMap[this._limitIndex];
            if (!limitHeroList) {
                limitHeroList = [];
            }

            totalLimitList = limitHeroList;
            itemTitle2.getChildByName("labUnlockHero").getComponent(cc.Label).string = "限制出战：" + limitHeroList.length + "/" + limitTotal;

            setTimeout(() => {
                if (this && itemTitle2) {
                    itemTitle2.getChildByName("tgcontainerDisable").getChildByName("tgWay" + (this._limitIndex + 1)).getComponent(cc.Toggle).check();
                }
            }, 300);

        }
        // totalLimitList.push({});

        nowY -= 75;

        let isChecked = itemTitle2.getChildByName("tgDisableHero").getComponent(cc.Toggle).isChecked;
        if (isChecked == false) {
            let initY1 = nowY;
            for (let i = 0; i < totalLimitList.length + 1; i++) {
                if (totalLimitList[i]) {
                    let heroCardName = "itemLimitHeroCard" + i;
                    let heroCard = this.content.getChildByName(heroCardName);
                    if (!heroCard) {
                        heroCard = cc.instantiate(this.itemHeroCard);
                        heroCard.name = heroCardName;
                        heroCard.parent = this.content;
                    }

                    let row = Math.ceil((i + 1) / 4); // 行
                    let col = i % 4; // 列

                    heroCard.active = true;
                    nowY = initY1 - (row - 1) * heroCardHeight;
                    heroCard.y = nowY;
                    heroCard.x = col * heroCardWidth - scrollWidth;

                    let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[totalLimitList[i].id];
                    heroCard.getChildByName("labHeroName").getComponent(cc.Label).string = heroItemCfg.name;

                    let heroQuality = heroItemCfg.yx_pj;

                    Utils.loadImg("ui/hero/bghero" + heroQuality, (sp) => {

                        heroCard.getChildByName("bgHero").getComponent(cc.Sprite).spriteFrame = sp;
                    })
                    Utils.loadImg("ui/hero/bgHeroQulity" + heroQuality, (sp) => {

                        heroCard.getChildByName("imgHeroQuality").getComponent(cc.Sprite).spriteFrame = sp;
                    })
                    Utils.loadImg("ui/hero/bgHeroQulity" + heroQuality, (sp) => {

                        heroCard.getChildByName("bgHeroProfession").getComponent(cc.Sprite).spriteFrame = sp;
                    })
                    Utils.loadImg("ui/hero/imgProfession" + heroItemCfg.yx_zy, (sp) => {

                        heroCard.getChildByName("imgHeroProfession").getComponent(cc.Sprite).spriteFrame = sp;
                    })
                    Utils.loadImg("ui/hero/imgPregress" + heroQuality, (sp) => {

                        heroCard.getChildByName("pbHeroNum").getChildByName("bar").getComponent(cc.Sprite).spriteFrame = sp;
                    })

                    let heroType = heroItemCfg.yx_type;
                    Utils.loadImg("ui/heroIcon/" + heroType, (sp) => {

                        heroCard.getChildByName("imgHero").getComponent(cc.Sprite).spriteFrame = sp;
                    })

                    heroCard.getChildByName("labHeroLv").getComponent(cc.Label).string = heroItemCfg.level;
                    heroCard.getChildByName("labHeroProgress").getComponent(cc.Label).string = totalLimitList[i].count + "/" + heroItemCfg.unlock_sp;
                    heroCard.getChildByName("pbHeroNum").getComponent(cc.ProgressBar).progress = totalLimitList[i].count / heroItemCfg.unlock_sp;

                    heroCard.getChildByName("btnHero").getComponent(cc.Button).clickEvents[0].customEventData = totalLimitList[i].id;
                    heroCard.getChildByName("btnOperate").getComponent(cc.Button).clickEvents[0].customEventData = totalLimitList[i].id;
                } else {

                    // 空的限制出战
                    let itemHeroLimit = this.content.getChildByName("itemHeroLimit");
                    if (!itemHeroLimit) {
                        itemHeroLimit = cc.instantiate(this.itemHeroLimit);
                        itemHeroLimit.parent = this.content;
                    }

                    let row = Math.ceil((i + 1) / 4); // 行
                    let col = i % 4; // 列

                    itemHeroLimit.active = true;
                    nowY = initY1 - (row - 1) * heroCardHeight;
                    itemHeroLimit.y = nowY;
                    itemHeroLimit.x = col * heroCardWidth - scrollWidth;
                }
            }
            nowY -= heroCardHeight;
        }


        // 标题3
        let itemTitle3 = this.content.getChildByName("itemHeroTitle3");
        if (!itemTitle3) {
            itemTitle3 = cc.instantiate(this.itemHeroTitle3);
            itemTitle3.parent = this.content;
        }
        itemTitle3.y = nowY;
        itemTitle3.active = true;

        nowY -= 80;

        let initY2 = nowY;
        for (let i = 0; i < this._haveLockHero.length; i++) {
            let heroCardName = "itemLockHeroCard" + i;
            let heroCard = this.content.getChildByName(heroCardName);
            if (!heroCard) {
                heroCard = cc.instantiate(this.itemHeroCard);
                heroCard.name = heroCardName;
                heroCard.parent = this.content;
            }
            let row = Math.ceil((i + 1) / 4); // 行
            let col = i % 4; // 列

            heroCard.active = true;
            nowY = initY2 - (row - 1) * heroCardHeight;
            heroCard.y = nowY;
            heroCard.x = col * heroCardWidth - scrollWidth;

            let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._haveLockHero[i].id];
            heroCard.getChildByName("labHeroName").getComponent(cc.Label).string = heroItemCfg.name;

            let heroQuality = heroItemCfg.yx_pj;

            Utils.loadImg("ui/hero/bghero" + heroQuality, (sp) => {
                heroCard.getChildByName("bgHero").getComponent(cc.Sprite).spriteFrame = sp;
            })
            Utils.loadImg("ui/hero/bgHeroQulity" + heroQuality, (sp) => {
                heroCard.getChildByName("imgHeroQuality").getComponent(cc.Sprite).spriteFrame = sp;
            })
            Utils.loadImg("ui/hero/bgHeroQulity" + heroQuality, (sp) => {

                heroCard.getChildByName("bgHeroProfession").getComponent(cc.Sprite).spriteFrame = sp;
            })
            Utils.loadImg("ui/hero/imgProfession" + heroItemCfg.yx_zy, (sp) => {

                heroCard.getChildByName("imgHeroProfession").getComponent(cc.Sprite).spriteFrame = sp;
            })
            Utils.loadImg("ui/hero/imgPregress" + heroQuality, (sp) => {
                heroCard.getChildByName("pbHeroNum").getChildByName("bar").getComponent(cc.Sprite).spriteFrame = sp;
            })

            let heroType = heroItemCfg.yx_type;
            Utils.loadImg("ui/heroIcon/" + heroType, (sp) => {
                heroCard.getChildByName("imgHero").getComponent(cc.Sprite).spriteFrame = sp;
            })

            heroCard.getChildByName("labHeroLv").getComponent(cc.Label).string = heroItemCfg.level;
            heroCard.getChildByName("labHeroProgress").getComponent(cc.Label).string = this._haveLockHero[i].count + "/" + heroItemCfg.unlock_sp;
            heroCard.getChildByName("pbHeroNum").getComponent(cc.ProgressBar).progress = this._haveLockHero[i].count / heroItemCfg.unlock_sp;

            heroCard.getChildByName("imgMask").active = true;
            heroCard.getChildByName("btnHero").getComponent(cc.Button).clickEvents[0].customEventData = this._haveLockHero[i].id;

        }

        nowY -= heroCardHeight;

        this.content.height = Math.abs(nowY);
    }

    // 显示所有的操作按钮
    showAllOperate() {

        for (let i = 0; i < this._haveNoLimitHero.length; i++) {
            let heroCardName = "itemHeroCard" + i;
            let heroCard = this.content.getChildByName(heroCardName);
            heroCard.getChildByName("btnOperate").active = this._isShowOperate;
        }

        for (let i = 0; i < this._haveLimitHero.length; i++) {
            let heroCardName = "itemLimitHeroCard" + i;
            let heroCard = this.content.getChildByName(heroCardName);

            heroCard.getChildByName("btnOperate").active = this._isShowOperate;
        }
    }

    // 把出战移动到限制出战 或者 把限制出战移动到出战
    heroAddLimit(heroId) {
        let limitHeroMap = DLocal.getLimitHeroMap();

        let index = -1;
        if (!limitHeroMap[this._limitIndex]) {
            limitHeroMap[this._limitIndex] = [];
        }
        for (let i = 0; i < limitHeroMap[this._limitIndex].length; i++) {
            if (limitHeroMap[this._limitIndex][i].id == heroId) {
                index = i;
                break;
            }
        }

        if (index != -1) {

            limitHeroMap[this._limitIndex].splice(index, 1);
            DLocal.setLimitHeroMap(limitHeroMap);
        } else {

            let haveHeroList = DLocal.getHeroList();
            if (!limitHeroMap[this._limitIndex]) {
                limitHeroMap[this._limitIndex] = [];
            }
            if (haveHeroList.length - this._limitMin == 0) {
                UIManager.ShowForm(UIPath.UIFlyTip, "不能添加限制");
                return;
            }
            else if (haveHeroList.length - this._limitMin <= limitHeroMap[this._limitIndex].length) {
                UIManager.ShowForm(UIPath.UIFlyTip, "限制已满");
                return;
            }

            for (let i = 0; i < haveHeroList.length; i++) {
                if (haveHeroList[i].id == heroId) {
                    limitHeroMap[this._limitIndex].push(haveHeroList[i]);
                    DLocal.setLimitHeroMap(limitHeroMap);
                    break;
                }
            }
        }
        this.getHaveHero();
        this.loadHero();
    }

    // 新手引导
    guildStep(stepIdx) {
        let isGuild = DLocal.isGuildChapter();
        if (isGuild == true) {
            let guildChapterIdx = DLocal.getGuildChapterIdx();
            if (guildChapterIdx == stepIdx) {
                GameEvent.dispatchEvent(Msg.UPDATE_GUILD_STEP);
            }
        }
    }

    // 章鱼动画
    mapAction() {

        this.bgAction1.y -= 0.7;
        this.bgAction2.y -= 0.7;
        if (this.bgAction1.y <= -1336) {
            this.bgAction1.y = 1336;
        }
        if (this.bgAction2.y <= -1336) {
            this.bgAction2.y = 1336;
        }
    }


    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {
        this.mapAction();
    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {
        console.log("--------- btnName = " + btnName)

        if (btnName == "btnOperate") { // 操作按钮
            // this._isShowOperate = false;

            this.heroAddLimit(Number(eventData));
            this.showAllOperate();

        } else if (btnName == "btnAddLimit") { // 限制按钮

            this._isShowOperate = !this._isShowOperate;
            this.showAllOperate();

        } else if (btnName == "tgWay1") {
            this._limitIndex = 0;
            DLocal.setLimitHeroSelectIdx(this._limitIndex);
            this.getHaveHero();
            this.loadHero();

            this._isShowOperate = false;
            this.showAllOperate();
        } else if (btnName == "tgWay2") {
            this._limitIndex = 1;
            DLocal.setLimitHeroSelectIdx(this._limitIndex);

            this.getHaveHero();
            this.loadHero();

            this._isShowOperate = false;
            this.showAllOperate();
        } else if (btnName == "tgWay3") {
            this._limitIndex = 2;
            DLocal.setLimitHeroSelectIdx(this._limitIndex);
            this.getHaveHero();
            this.loadHero();

            this._isShowOperate = false;
            this.showAllOperate();
        } else if (btnName == "tgWay4") {
            this._limitIndex = 3;
            DLocal.setLimitHeroSelectIdx(this._limitIndex);

            this.getHaveHero();
            this.loadHero();

            this._isShowOperate = false;
            this.showAllOperate();
        } else if (btnName == "tgWay5") {
            this._limitIndex = 4;
            DLocal.setLimitHeroSelectIdx(this._limitIndex);
            this.getHaveHero();
            this.loadHero();

            this._isShowOperate = false;
            this.showAllOperate();
        } else if (btnName == "tgDisableHero") {
            this.getHaveHero();
            this.loadHero();
        } else if (btnName == "btnHero") {

            UIManager.ShowForm(UIPath.UIHeroInfo, Number(eventData), this._limitIndex);
        }
    }


    // 关闭回调
    OnClose() {
    }
}