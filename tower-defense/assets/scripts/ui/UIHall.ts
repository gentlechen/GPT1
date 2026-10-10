import { RewardType } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIHall extends UIBase {


    @property(cc.Label)
    private labTitle: cc.Label = null;
    @property(cc.Label)
    private labHightLevel: cc.Label = null;
    @property(cc.Node)
    private bgAction1: cc.Node = null;
    @property(cc.Node)
    private bgAction2: cc.Node = null;
    @property(cc.Toggle)
    private tgFunc: cc.Toggle = null;
    @property(cc.Node)
    private nodeFunc: cc.Node = null;
    @property(cc.Label)
    private labConsumeTip: cc.Label = null;
    @property(cc.Node)
    private content: cc.Node = null;
    @property(cc.ProgressBar)
    private pgTask: cc.ProgressBar = null;
    @property(cc.Node)
    private boxItem: cc.Node = null; // 宝箱item
    @property(cc.Node)
    private nodeDifficulty: cc.Node = null; // 难度

    private _chapterBox = {}; // 每个章节
    private _chapterIdx = 1; // 当前章节
    private _difficultyIdx = 1; // 难度

    // 初始相当于onLoad
    OnInit() {
        this.boxItem.removeFromParent();
        this.initLevelTable();
    }

    //每次显示界面被调用
    public OnShow(...argList) {

        GameEvent.addEventHandler(Msg.UPDATE_BATTLE_END, this.updateLevelCallback.bind(this), this);
        GameEvent.addEventHandler(Msg.OPEN_LEVEL, this.openLevelCallback.bind(this), this);
        this.bgAction1.y = 0;
        this.bgAction2.y = 1336;

        this._chapterIdx = Math.floor(DLocal.getLevelData() / 10000);
        this.initLevel();

        let isGuild = DLocal.isGuildChapter();
        if (isGuild == true) {
            // 是否开启新手引导
            let guildChapterId = DLocal.getGuildChapterIdx();
            if (guildChapterId > 0) {
                let guildData = DLocal.getGuildChapterData(guildChapterId);
                if (guildData.battleId > 0) {
                    UIManager.ShowForm(UIPath.UIBattle, guildData.battleId, false, true, () => {
                        UIManager.ShowForm(UIPath.UIGuild, guildChapterId);
                    });
                    UIManager.ShowForm(UIPath.UITop);
                } else if (guildChapterId == 21 || guildChapterId == 24) {
                    UIManager.ShowForm(UIPath.UITop, () => {
                        UIManager.ShowForm(UIPath.UIGuild, guildChapterId);
                    });
                } else {
                    UIManager.ShowForm(UIPath.UITop);
                }
            }
        } else {
            UIManager.ShowForm(UIPath.UITop);
        }
        this.tgFunc.isChecked = true;
        this.loadFunc(false);
        let callbackFunc = argList[0];
        if (callbackFunc) {
            callbackFunc();
        }
    }

    // 初始化文本
    initLab() {

    }

    // 初始化关卡数据
    initLevel() {
        let allLevelList = DLocal.getAllLevelList(this._chapterIdx);
        if (!this._chapterBox[this._chapterIdx][this._difficultyIdx]) {
            this._chapterBox[this._chapterIdx][this._difficultyIdx] = [];
        }
        let boxList = this._chapterBox[this._chapterIdx][this._difficultyIdx];
        let boxNum = boxList.length;


        let firstLevelId = 0;
        let lastLevelId = 0;
        let nowLevelId = 0
        if (this._difficultyIdx == 1) { // 普通
            nowLevelId = DLocal.getLevelData();
            firstLevelId = allLevelList[0].ordinary;
            lastLevelId = allLevelList[allLevelList.length - 1].ordinary;
        } else if (this._difficultyIdx == 2) { // 精英
            nowLevelId = DLocal.getEliteLevel();
            firstLevelId = allLevelList[0].elite;
            lastLevelId = allLevelList[allLevelList.length - 1].elite;
        } else if (this._difficultyIdx == 3) { // 困难
            nowLevelId = DLocal.getDifficultyLevel();
            firstLevelId = allLevelList[0].difficulty;
            lastLevelId = allLevelList[allLevelList.length - 1].difficulty;
        }
        if (lastLevelId < nowLevelId) {
            nowLevelId = lastLevelId;
        } else {
            if (firstLevelId > nowLevelId) {
                nowLevelId = firstLevelId;
            }
        }
        let index = nowLevelId - firstLevelId;
        let zongguanqiaCfg = DLocal.GetCfgData("zongguanqia")[nowLevelId];
        this.labTitle.string = zongguanqiaCfg.zhangjie;

        this.labHightLevel.string = zongguanqiaCfg.gqmc;
        let interval = 180;
        let boxLen = boxNum * interval;
        let totalLen = 0;
        if (boxLen < 480) {
            totalLen = 640;
        } else {
            totalLen = boxLen + 160;
        }
        let pgTotalLength = boxLen - 5;
        this.content.width = totalLen;
        this.pgTask.node.width = boxLen;
        this.pgTask.totalLength = pgTotalLength;

        for (let i = 0; i < boxNum; i++) {

            let name = "box_" + i;
            let prefab = this.content.getChildByName(name);
            if (!prefab) {
                prefab = cc.instantiate(this.boxItem);
                prefab.name = name;
                this.content.addChild(prefab);
            }

            let x = (i + 1) * interval + 90;
            prefab.position = cc.v3(x, 8);
            let boxItem = prefab.getChildByName("btnBox1");
            let boxCfg = DLocal.GetCfgData("zhuxian-baoxiang")[boxList[i].id];
            let zongguanqiaCfg1 = DLocal.GetCfgData("zongguanqia")[boxCfg.kq_tj];

            let labName = boxItem.getChildByName("labTask").getComponent(cc.Label);

            boxItem.getComponent(cc.Button).clickEvents[0].customEventData = "" + i;
            if (DLocal.getLevelReward(boxCfg.kq_tj)) {
                labName.node.color = cc.color(255, 255, 255);
            } else {
                labName.node.color = cc.color(255, 0, 0);
            }
            labName.string = zongguanqiaCfg1.gqmc;
            let imgbox1 = boxItem.getChildByName("imgbox1");
            let imgbox2 = boxItem.getChildByName("imgbox2");
            let nowMainboxSate = DLocal.getMainBoxStateWithId(this._chapterIdx, this._difficultyIdx, boxList[i].id);
            if (nowMainboxSate) {
                imgbox2.active = true;
                imgbox1.active = false;
            } else {
                imgbox2.active = false;
                imgbox1.active = true;
            }
        }
        this.pgTask.progress = index / (boxNum * 5);
    }

    // 更新主界面
    updateLevelCallback() {
        this._chapterIdx = Math.floor(DLocal.getLevelData() / 10000);
        this.initLevel();
    }

    // 初始化关卡表
    initLevelTable() {

        let boxCfg = DLocal.GetCfgData("zhuxian-baoxiang");
        for (const key in boxCfg) {
            if (Object.prototype.hasOwnProperty.call(boxCfg, key)) {
                let chapterIdx = Math.floor(boxCfg[key].kq_tj / 10000);
                let difficultyIdx = Math.floor(boxCfg[key].kq_tj / 1000) % 10 + 1;
                if (!this._chapterBox[chapterIdx]) {
                    this._chapterBox[chapterIdx] = {};
                }
                if (!this._chapterBox[chapterIdx][difficultyIdx]) {
                    this._chapterBox[chapterIdx][difficultyIdx] = [];
                }
                this._chapterBox[chapterIdx][difficultyIdx].push({ "id": boxCfg[key].id, "state": false });
            }
        }
    }

    // 加载收缩
    loadFunc(isBool) {

        if (isBool == true) {
            this.nodeFunc.width = 260;
        } else {
            this.nodeFunc.width = 600;
        }
    }

    // 章节数量
    getChapterCount() {
        let index = 0;
        for (const key in this._chapterBox) {
            if (Object.prototype.hasOwnProperty.call(this._chapterBox, key)) {
                index++;
            }
        }
        return index;
    }

    // 宝箱领取
    boxRecvWithIdx(index) {
        let nowLevel = DLocal.getLevelData();
        if (this._difficultyIdx == 2) {
            nowLevel = DLocal.getEliteLevel();
        } else if (this._difficultyIdx == 3) {
            nowLevel = DLocal.getDifficultyLevel();
        }


        let rewardList = [];
        let mainBoxId = this._chapterBox[this._chapterIdx][this._difficultyIdx][index].id;
        let mainBoxCfg = DLocal.GetCfgData("zhuxian-baoxiang")[mainBoxId];
        let bxc_id = mainBoxCfg.bxc_id;
        let bxm_id = mainBoxCfg.bxm_id;

        if (mainBoxCfg.kq_tj >= nowLevel) {
            UIManager.ShowForm(UIPath.UIFlyTip, "未通过对应关卡");
            return;
        }
        let nowMainboxSate = DLocal.getMainBoxStateWithId(this._chapterIdx, this._difficultyIdx, mainBoxId);
        if (nowMainboxSate) {
            return;
        }

        DLocal.setMainBoxStateWithId(this._chapterIdx, this._difficultyIdx, mainBoxId);

        let allOneLevelHeroList = DLocal.getAllOneLevelHero();
        for (let i = bxc_id; i <= bxm_id; i++) {
            let boxCfg = DLocal.GetCfgData("baoxiang-zx")[i];
            let heroCount = Utils.getRandomInt(boxCfg.yxmin_num, boxCfg.yxmax_num);
            let equalQualityHeroList = [];
            for (let j = 0; j < allOneLevelHeroList.length; j++) {
                if (allOneLevelHeroList[j].yx_pj == boxCfg.yxpz) {
                    equalQualityHeroList.push(allOneLevelHeroList[j]);
                }
            }
            let heroIdx = Utils.getRandomInt(0, equalQualityHeroList.length - 1);
            rewardList.push({ "id": equalQualityHeroList[heroIdx].yxid, "count": heroCount, "rewardType": RewardType.Hero });

            if (i == bxm_id) {
                if (boxCfg.gd_jb != 0) {
                    rewardList.push({ "id": 1, "count": boxCfg.gd_jb, "rewardType": RewardType.currency });
                }

                if (boxCfg.gd_zs != 0) {
                    rewardList.push({ "id": 2, "count": boxCfg.gd_zs, "rewardType": RewardType.currency });
                }
            }
        }

        this.initLevel();

        // 展示奖励(后面有资源在做)
        UIManager.ShowForm(UIPath.UIReward, rewardList);
    }

    // 章鱼动画
    mapAction(dt) {

        this.bgAction1.y -= 0.7;
        this.bgAction2.y -= 0.7;
        if (this.bgAction1.y <= -1336) {
            this.bgAction1.y = 1336;
        }
        if (this.bgAction2.y <= -1336) {
            this.bgAction2.y = 1336;
        }
    }

    // 打开章节界面
    openLevelCallback() {
        UIManager.ShowForm(UIPath.UILevel, this._chapterIdx);
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {
        this.mapAction(dt);
    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {
        if (btnName == "btnLeft") {
            if (this._chapterIdx > 1) {
                this._chapterIdx--;
                this.initLevel();
            } else {
                UIManager.ShowForm(UIPath.UIFlyTip, "已经是第一章节");
            }
        } else if (btnName == "btnRight") {
            let maxLevel = Math.floor(DLocal.getLevelData() / 10000);
            if (this._chapterIdx < maxLevel) {
                this._chapterIdx++;
                this.initLevel();
            } else {
                UIManager.ShowForm(UIPath.UIFlyTip, "已经是最新章节");
            }

        } else if (btnName == "btnBox1") {

            this.boxRecvWithIdx(eventData);
        } else if (btnName == "btnBox2") {
            this.boxRecvWithIdx(eventData);
        } else if (btnName == "btnBox3") {
            this.boxRecvWithIdx(eventData);
        } else if (btnName == "btnEnterLevel") {

            UIManager.ShowForm(UIPath.UILevel, this._chapterIdx);
        } else if (btnName == "btnHangUp") { // 挂机

            UIManager.ShowForm(UIPath.UIHangup);
        } else if (btnName == "btnBox") {

            UIManager.ShowForm(UIPath.UIBox);
        } else if (btnName == "btnSign") {

            UIManager.ShowForm(UIPath.UISignIn);
        } else if (btnName == "btnSet") {

            UIManager.ShowForm(UIPath.UISet);
        } else if (btnName == "btnCardDrawing") {

            GameEvent.dispatchEvent(Msg.OPEN_DRAW_CARD);

        } else if (btnName == "tgFunc") {
            let isBool = !this.tgFunc.isChecked;
            this.loadFunc(isBool);
        } else if (btnName == "btnTask") {

            UIManager.ShowForm(UIPath.UITask);
        } else if (btnName == "tgOrdinary") {
            this._difficultyIdx = 1;
            this.initLevel();
        } else if (btnName == "tgElite") {
            this._difficultyIdx = 2;
            this.initLevel();
        } else if (btnName == "tgDifficulty") {
            this._difficultyIdx = 3;
            this.initLevel();
        } else if (btnName == "btnDifficulty") {
            let isShow = this.nodeDifficulty.active;
            this.nodeDifficulty.active = !isShow;
        } else if (btnName == "btnHandbook") {
            UIManager.ShowForm(UIPath.UIHandbook);
        }

    }

    // 关闭回调
    OnClose() {

    }
}