import { RewardType } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import { TableView } from "../utils/TableView";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UITask extends UIBase {

    @property(cc.Node)
    private rewardBoxArr: cc.Node[] = [];
    @property(cc.Node)
    private nodeTask: cc.Node = null;
    @property(cc.Node)
    private nodeWelfare: cc.Node = null;
    @property(cc.Toggle)
    private tgTask: cc.Toggle = null;
    @property(cc.Toggle)
    private tgWelfare1: cc.Toggle = null;
    @property(TableView)
    private tableviewMap: TableView = null;
    @property(TableView)
    private tableviewWelfare: TableView = null;
    @property(cc.ScrollView)
    private welfareScroll: cc.ScrollView = null;
    @property(cc.SpriteAtlas)
    private taskAtlas: cc.SpriteAtlas = null;

    private _achievementMap = null; // 成就奖励
    private _selectIdx = 1; // 选中

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {

        GameEvent.addEventHandler(Msg.UPDATE_TASK, this.loadEveryDay.bind(this), this);
        GameEvent.addEventHandler(Msg.UPDATE_ACHIEVEMENT, this.updateAchievementData.bind(this), this);

        this._achievementMap = null;
        this.loadBox();
        this.loadEveryDay();
        this.setHeroTask();
        this.tgTask.check();
        this.nodeTask.active = true;
        this.nodeWelfare.active = false;
    }

    // 初始化label
    initLab() {

    }

    // 初始化宝箱
    loadBox() {
        let taskBoxNum = DLocal.getTaskBoxNum();
        for (let i = 0; i < this.rewardBoxArr.length; i++) {
            this.rewardBoxArr[i].active = taskBoxNum > i;
        }
    }

    // 每日任务
    loadEveryDay() {

        let taskArr = DLocal.getEveryTaskData();
        if (taskArr.length > 0) {
            let taskCountData = DLocal.getTaskRecv();
            let taskRecvData = DLocal.getRecvTaskData();
            taskArr.sort((itemA, itemB) => {
                if (!itemA || !itemB) {
                    return 0;
                }
                let taskCfgA = DLocal.GetCfgData("mrrenwu")[itemA];
                let taskCfgB = DLocal.GetCfgData("mrrenwu")[itemB];
                if (!taskCountData[taskCfgA.sj_lx]) {
                    taskCountData[taskCfgA.sj_lx] = {};
                    taskCountData[taskCfgA.sj_lx].count = 0;
                }
                if (!taskCountData[taskCfgB.sj_lx]) {
                    taskCountData[taskCfgB.sj_lx] = {};
                    taskCountData[taskCfgB.sj_lx].count = 0;
                }
                if (taskRecvData[itemA] == 2 && taskRecvData[itemB] == 2) {
                    if (taskCfgA.id > taskCfgB.id) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (taskRecvData[itemA] != 2 && taskRecvData[itemB] == 2) {
                    return -1;
                } else if (taskRecvData[itemA] == 2 && taskRecvData[itemB] != 2) {
                    return 1;
                } else {
                    if (taskCountData[taskCfgA.sj_lx].count >= taskCfgA.xq_cs && taskCountData[taskCfgB.sj_lx].count < taskCfgB.xq_cs) {
                        return -1;
                    } else if (taskCountData[taskCfgA.sj_lx].count < taskCfgA.xq_cs && taskCountData[taskCfgB.sj_lx].count >= taskCfgB.xq_cs) {
                        return 1;
                    } else {
                        if (taskCfgA.id > taskCfgB.id) {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                }
            })

            this.tableviewMap.init(taskArr, this, { "recvData": taskRecvData, "data": taskCountData, "atlas": this.taskAtlas });
            return;
        }
        let randomArr = [];
        let taskCfg = DLocal.GetCfgData("mrrenwu");
        for (const key in taskCfg) {
            if (taskCfg[key]) {
                if (taskCfg[key].rw_zl == 1) {
                    taskArr.push(key);
                } else {
                    randomArr.push(key);
                }
            }
        }
        for (let i = 0; i < 6; i++) {
            let idx = Utils.getRandomInt(0, randomArr.length);
            taskArr.push(randomArr[idx]);
            randomArr.splice(idx, 1);
        }
        taskArr.sort((itemA, itemB) => {
            let taskCfgA = DLocal.GetCfgData("mrrenwu")[itemA];
            let taskCfgB = DLocal.GetCfgData("mrrenwu")[itemB];
            if (taskCfgA.id > taskCfgB.id) {
                return 1;
            } else {
                return -1;
            }
        })
        DLocal.setEveryTaskData(taskArr);
        let taskCountData = DLocal.getTaskRecv();
        let taskRecvData = DLocal.getRecvTaskData();
        this.tableviewMap.init(taskArr, this, { "data": taskCountData, "recvData": taskRecvData, "atlas": this.taskAtlas });
    }

    // 每日任务 获取宝箱奖励
    getReward() {
        let goldNum = 0;
        let diamondNum = 0;
        let rewardList = [];
        let taskCfg = DLocal.GetCfgData("mrrenwu");
        for (let i = taskCfg[1].bx_cid; i < taskCfg[1].bx_mid; i++) {
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

            if (boxCfg.gd_jb != 0 && goldNum == 0) {
                goldNum = boxCfg.gd_jb;
                rewardList.push({ "id": 1, "count": boxCfg.gd_jb, "rewardType": RewardType.currency });
            }
            if (boxCfg.gd_zs != 0 && diamondNum == 0) {
                diamondNum = boxCfg.gd_zs
                rewardList.push({ "id": 2, "count": boxCfg.gd_zs, "rewardType": RewardType.currency });
            }
        }

        return rewardList;
    }

    // 设置英雄数量
    setHeroTask() {
        let heroCount1 = 0;
        let heroCount2 = 0;
        let heroList = DLocal.getHeroList();
        for (let i = 0; i < heroList.length; i++) {
            let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[heroList[i].id];
            if (heroItemCfg.level >= 3) {
                heroCount1++;
                if (heroItemCfg.level >= 6) {
                    heroCount2++;
                }
            }
        }
        DLocal.updateAchievementCount(30006, heroCount1, false);
        DLocal.updateAchievementCount(30007, heroCount2, false);
    }

    // 成就奖励 数据处理
    loadAchievement() {
        if (!this._achievementMap) {
            this._achievementMap = {};
            let taskCfg = DLocal.GetCfgData("leijifuli");
            for (const key in taskCfg) {
                if (taskCfg[key] && taskCfg[key].rw_lx == 1) { // 资源
                    if (!this._achievementMap[taskCfg[key].rw_lx]) {
                        this._achievementMap[taskCfg[key].rw_lx] = [];
                    }
                    this._achievementMap[taskCfg[key].rw_lx].push(key);
                } else if (taskCfg[key] && taskCfg[key].rw_lx == 2) { // 战斗
                    if (!this._achievementMap[taskCfg[key].rw_lx]) {
                        this._achievementMap[taskCfg[key].rw_lx] = [];
                    }
                    this._achievementMap[taskCfg[key].rw_lx].push(key);
                } else if (taskCfg[key] && taskCfg[key].rw_lx == 3) { // 英雄
                    if (!this._achievementMap[taskCfg[key].rw_lx]) {
                        this._achievementMap[taskCfg[key].rw_lx] = [];
                    }
                    this._achievementMap[taskCfg[key].rw_lx].push(key);
                } else if (taskCfg[key] && taskCfg[key].rw_lx == 4) { // 其他
                    if (!this._achievementMap[taskCfg[key].rw_lx]) {
                        this._achievementMap[taskCfg[key].rw_lx] = [];
                    }
                    this._achievementMap[taskCfg[key].rw_lx].push(key);
                }
            }
            this.sortAchievementFunc(1);
            this.sortAchievementFunc(2);
            this.sortAchievementFunc(3);
            // this.sortAchievementFunc(4);
        }
        this.loadAchievementReward(1);
    }

    // 排序成就奖励
    sortAchievementFunc(index) {
        let achievementRecvTaskState = DLocal.getAchievementRecvTaskData();
        let taskRecvData = DLocal.getAchievementTaskRecv();
        this._achievementMap[index].sort((itemA, itemB) => {
            let taskCfgA = DLocal.GetCfgData("leijifuli")[itemA];
            let taskCfgB = DLocal.GetCfgData("leijifuli")[itemB];
            if (achievementRecvTaskState[itemA] && achievementRecvTaskState[itemB]) {
                if (taskCfgA.id > taskCfgB.id) {
                    return -1;
                } else {
                    return 1;
                }
            } else if (achievementRecvTaskState[itemA] == 1 && achievementRecvTaskState[itemB] != 1) {
                return 1;
            } else if (achievementRecvTaskState[itemA] != 1 && achievementRecvTaskState[itemB] == 1) {
                return -1;
            } else {
                if (!taskRecvData[taskCfgA.sj_lx]) {
                    taskRecvData[taskCfgA.sj_lx] = {};
                    taskRecvData[taskCfgA.sj_lx].count = 0;
                }
                if (!taskRecvData[taskCfgB.sj_lx]) {
                    taskRecvData[taskCfgB.sj_lx] = {};
                    taskRecvData[taskCfgB.sj_lx].count = 0;
                }
                if (taskCfgA.jl_cs <= taskRecvData[taskCfgA.sj_lx].count && taskCfgB.jl_cs <= taskRecvData[taskCfgB.sj_lx].count) {
                    if (taskCfgA.id > taskCfgB.id) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else if (taskCfgA.jl_cs <= taskRecvData[taskCfgA.sj_lx].count && taskCfgB.jl_cs > taskRecvData[taskCfgB.sj_lx].count) {
                    return -1;
                } else if (taskCfgA.jl_cs > taskRecvData[taskCfgA.sj_lx].count && taskCfgB.jl_cs <= taskRecvData[taskCfgB.sj_lx].count) {
                    return 1;
                } else {
                    if (taskCfgA.id > taskCfgB.id) {
                        return -1;
                    } else {
                        return 1;
                    }
                }
            }
        });

    }

    // 加载成就奖励数据
    loadAchievementReward(dataType) {
        let taskData = DLocal.getAchievementTaskRecv();
        this.tableviewWelfare.init(this._achievementMap[dataType], this, taskData)
    }

    // 更新当前成就数据
    updateAchievementData() {
        this.sortAchievementFunc(this._selectIdx);
        let taskData = DLocal.getAchievementTaskRecv();
        this.tableviewWelfare.init(this._achievementMap[this._selectIdx], this, taskData)
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

        if (btnName == "btnBoxAd") {
            // 领取宝箱奖励
            let taskBoxNum = DLocal.getTaskBoxNum();
            if (taskBoxNum >= 3) {
                UIManager.ShowForm(UIPath.UIFlyTip, "今日已领取");
                return;
            }
            let rewardList = this.getReward();
            UIManager.ShowForm(UIPath.UIReward, rewardList);
            DLocal.setTaskBoxNum(taskBoxNum + 1);

            this.loadBox();
        } else if (btnName == "tgTask") {

            this.nodeTask.active = true;
            this.nodeWelfare.active = false;
        } else if (btnName == "tgTotal") {
            this.tgWelfare1.check();
            this.loadAchievement();
            this.nodeTask.active = false;
            this.nodeWelfare.active = true;
        } else if (btnName == "tgWelfare1") {
            this._selectIdx = 1;
            this.welfareScroll.scrollToTop(0.1);
            this.loadAchievementReward(2);
        } else if (btnName == "tgWelfare2") {
            this._selectIdx = 2;
            this.welfareScroll.scrollToTop(0.1);
            this.loadAchievementReward(1);
        } else if (btnName == "tgWelfare3") {
            this._selectIdx = 3;
            this.welfareScroll.scrollToTop(0.1);
            this.loadAchievementReward(3);
        } else if (btnName == "tgWelfare4") {
            this._selectIdx = 4;
            this.welfareScroll.scrollToTop(0.1);
            this.loadAchievementReward(4);
        }
    }

    // 关闭回调
    OnClose() {

    }
}