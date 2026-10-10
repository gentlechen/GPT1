import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UITop extends UIBase {

    @property(cc.Label)
    private labGold: cc.Label = null;
    @property(cc.Label)
    private labDiamonds: cc.Label = null;

    @property(cc.Node)
    private imgCheck: cc.Node = null;
    @property(cc.Node)
    private bottomArr: cc.Node[] = [];
    @property(cc.Node)
    private labArr: cc.Node[] = [];

    private _changeing = false;

    // 初始相当于onLoad
    OnInit() {
        GameEvent.addEventHandler(Msg.UPDATE_GOLD, this.updateGold.bind(this), this);
        GameEvent.addEventHandler(Msg.UPDATE_DIAMOND, this.updateDiamind.bind(this), this);
        GameEvent.addEventHandler(Msg.OPEN_HERO_VIEW, this.openHeroView.bind(this), this);
        GameEvent.addEventHandler(Msg.OPEN_DRAW_CARD, this.openDrawCard.bind(this), this);
        GameEvent.addEventHandler(Msg.OPEN_MAIN_VIEW, this.openMain.bind(this), this);
        GameEvent.addEventHandler(Msg.OPEN_COPY, this.openCopyView.bind(this), this);
    }

    //每次显示界面被调用
    public OnShow(...argList) {

        let guildCallback = argList[0];
        if (guildCallback) {
            guildCallback();
        }
        this.updateGold();
        this.updateDiamind();

        this.changeBtnWithIdx(2);
    }

    // 初始化label
    initLab() {

    }

    // 更新金币
    updateGold() {
        this.labGold.string = Utils.NumerDeal(DLocal.getGold());
    }

    // 更新钻石
    updateDiamind() {
        this.labDiamonds.string = Utils.NumerDeal(DLocal.getDiamond());
    }

    // 打开英雄界面
    openHeroView() {
        this.changeBtnWithIdx(1);
        UIManager.ShowForm(UIPath.UIHeroMain);
    }

    // 打开副本界面
    openCopyView() {
        this.changeBtnWithIdx(3);
        UIManager.ShowForm(UIPath.UICopyMain);
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 打开抽卡界面
    openDrawCard() {
        this.changeBtnWithIdx(0);
        UIManager.ShowForm(UIPath.UIShop, 1);
        setTimeout(() => {
            this.closeOtherView(UIPath.UIShop);
        }, 300);
    }

    // 打开主界面
    openMain() {
        this.changeBtnWithIdx(2);
        this.closeOtherView("");
    }

    // 底部切换按钮
    changeBtnWithIdx(index) {
        for (let i = 0; i < this.bottomArr.length; i++) {
            if (i == index) {
                this.imgCheck.x = this.bottomArr[i].x;
                this.bottomArr[i].y = 110;
            } else {
                this.bottomArr[i].y = 72;
            }
        }

        for (let i = 0; i < this.labArr.length; i++) {
            this.labArr[i].active = false;
        }
        this.labArr[index].active = true;
    }

    // 除了当前界面 关闭其他的界面
    closeOtherView(uiPath) {

        if (uiPath != UIPath.UICopyMain) {
            UIManager.CloseForm(UIPath.UICopyMain);
        }
        if (uiPath != UIPath.UIShop) {
            UIManager.CloseForm(UIPath.UIShop);
        }
        if (uiPath != UIPath.UIHeroMain) {
            UIManager.CloseForm(UIPath.UIHeroMain);
        }
        if (uiPath != UIPath.UIEndless) {
            UIManager.CloseForm(UIPath.UIEndless);
        }

        this._changeing = false;
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

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {
        if (this._changeing == true) {
            return;
        }
        this._changeing = true;
        if (btnName == "btnShop") {
            this.changeBtnWithIdx(eventData);
            UIManager.ShowForm(UIPath.UIShop);
            setTimeout(() => {
                this.closeOtherView(UIPath.UIShop);
                let guildChapterIdx = DLocal.getGuildChapterIdx();
                this.guildStep(guildChapterIdx);
            }, 300);

        } else if (btnName == "btnHero") {
            this.changeBtnWithIdx(eventData);
            UIManager.ShowForm(UIPath.UIHeroMain);
            setTimeout(() => {
                this.closeOtherView(UIPath.UIHeroMain);
            }, 300);
        } else if (btnName == "btnMain") {
            this.changeBtnWithIdx(eventData);
            this.closeOtherView("");
        } else if (btnName == "btnCopy") {
            this.changeBtnWithIdx(eventData);
            UIManager.ShowForm(UIPath.UICopyMain);
            setTimeout(() => {
                this.closeOtherView(UIPath.UICopyMain);
            }, 300);

        } else if (btnName == "btnEndless") {
            this.changeBtnWithIdx(eventData);
            UIManager.ShowForm(UIPath.UIEndless);
            setTimeout(() => {
                this.closeOtherView(UIPath.UIEndless); // 先按全部关闭
            }, 300);
        } else if (btnName == "btnGold") { // 添加金币
            this.changeBtnWithIdx(eventData);
            UIManager.ShowForm(UIPath.UIShop, 0.3);
            setTimeout(() => {
                this.closeOtherView(UIPath.UIShop);
            }, 300);
        } else if (btnName == "btnGold" || btnName == "btnDiamonds") { //添加钻石
            this.changeBtnWithIdx(eventData);
            UIManager.ShowForm(UIPath.UIShop, 0);
            setTimeout(() => {
                this.closeOtherView(UIPath.UIShop);
            }, 300);
        }
    }
    // 关闭回调
    OnClose() {

    }
}