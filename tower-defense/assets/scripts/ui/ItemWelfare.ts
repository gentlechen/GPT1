import { RewardType } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import ItemBase from "../manage/ItemBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class ItemTask extends ItemBase {

    @property(cc.Sprite)
    private imgReward1Goods: cc.Sprite = null;
    @property(cc.Label)
    private labReward1Num: cc.Label = null;
    @property(cc.ProgressBar)
    private pbTask: cc.ProgressBar = null;
    @property(cc.Label)
    private labTaskProgress: cc.Label = null;
    @property(cc.Label)
    private labTaskExplain: cc.Label = null;
    @property(cc.Node)
    private btnRecv: cc.Node = null;
    @property(cc.Node)
    private btnReceived: cc.Node = null;
    @property(cc.Node)
    private btnNoFinish: cc.Node = null;

    private _taskId = 0;
    private _taskMap = {}; // 所有已完成的任务
    private _goType = 0; // 前往类型

    // 初始相当于onLoad
    OnInit() {

    }

    // 初始化label
    initLab() {

    }

    updateCell(index, totalCount, taskId, passParam) {
        this._taskMap = passParam;
        this._taskId = taskId;

        let taskItemCfg = DLocal.GetCfgData("leijifuli")[taskId];
        this._goType = taskItemCfg.sj_lx;

        let path = "";
        this.imgReward1Goods.node.scale = 1;
        if (taskItemCfg.jl_lb == 1) {
            path = "ui/common/jb_jb";
        } else if (taskItemCfg.jl_lb == 2) {
            path = "ui/common/jb_zs";
        } else if (taskItemCfg.jl_lb == 4 || taskItemCfg.jl_lb == 5) {
            path = "ui/hangup/bx4_hd_cheng";
            this.imgReward1Goods.node.scale = 0.6;
        }
        Utils.LoadRes(path, this, (spriteFrame) => {
            this.imgReward1Goods.spriteFrame = spriteFrame;
        }, cc.SpriteFrame)


        this.labReward1Num.string = taskItemCfg.jl_num;
        this.labTaskExplain.string = taskItemCfg.re_bt;

        this.btnNoFinish.active = false;
        this.btnRecv.active = false;
        this.btnReceived.active = false;
        if (passParam[this._goType]) {
            if (passParam[this._goType].count >= taskItemCfg.jl_cs) {
                this.pbTask.progress = 1;
                this.labTaskProgress.string = taskItemCfg.jl_cs + "/" + taskItemCfg.jl_cs;

                let taskRecvStateData = DLocal.getAchievementRecvTaskData();
                let state = taskRecvStateData[taskId];
                if (state == 1) { //1 代表领取任务 0代表没有领取任务
                    this.btnReceived.active = true;
                } else {
                    this.btnRecv.active = true;
                }
            } else {
                this.pbTask.progress = passParam[this._goType].count / taskItemCfg.jl_cs;
                this.labTaskProgress.string = passParam[this._goType].count + "/" + taskItemCfg.jl_cs;
                this.btnNoFinish.active = true;
            }
        } else {
            this.pbTask.progress = 0;
            this.labTaskProgress.string = 0 + "/" + taskItemCfg.jl_cs;
            this.btnNoFinish.active = true;
        }
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 奖励
    updateReward(taskId) {
        let rewardList = [];
        let taskItemCfg = DLocal.GetCfgData("leijifuli")[taskId];
        if (taskItemCfg.jl_lb == 1) {
            rewardList.push({ "id": 1, "count": taskItemCfg.jl_num, "rewardType": RewardType.currency });
        } else if (taskItemCfg.jl_lb == 2) {
            rewardList.push({ "id": 2, "count": taskItemCfg.jl_num, "rewardType": RewardType.currency });
        } else if (taskItemCfg.jl_lb == 4) {
            let heroArr = DLocal.GetCfgFindArr("tfyingxiong", "yx_pj", 4);
            let heroIdx = Utils.getRandomInt(0, heroArr.length - 1);
            let heroType = heroArr[heroIdx].yx_type;
            let heroData = null;
            for (let j = 0; j < heroArr.length; j++) {
                if (heroArr[j].yx_type == heroType && heroArr[j].level == 1) {
                    heroData = heroArr[j];
                    rewardList.push({ "id": heroData.yxid, "count": taskItemCfg.jl_num, "rewardType": RewardType.Hero });
                    break
                };
            }
        }
        UIManager.ShowForm(UIPath.UIReward, rewardList);
    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {
        if (btnName == "btnRecv") { // 领取
            DLocal.setAchievementState(this._taskId, 1);
            this.updateReward(this._taskId);
            GameEvent.dispatchEvent(Msg.UPDATE_ACHIEVEMENT);
        } else if (btnName == "btnGo") { // 前往
            if (this._goType == 10003) { // 完成今日签到
                UIManager.ShowForm(UIPath.UISignIn);
            } else if (this._goType == 10000) { //获取金币
                UIManager.ShowForm(UIPath.UIShop, 0.3);
            } else if (this._goType == 10001) { //获取钻石
                UIManager.ShowForm(UIPath.UIShop, 0);
            } else if (this._goType == 10002) { //挂机收益
                UIManager.ShowForm(UIPath.UIHangup);
            } else if (this._goType == 10004) { //快速挂机
                UIManager.ShowForm(UIPath.UIHangupQuick);
            } else if (this._goType == 30000 || this._goType == 30001 || this._goType == 30002 || this._goType == 30003) { //每日精选或者获得英雄
                UIManager.ShowForm(UIPath.UIShop, 0.7);
            } else if (this._goType == 30005) { //今日累计抽奖
                UIManager.ShowForm(UIPath.UIShop, 1);
            } else if (this._goType == 20000 || this._goType == 20002) { //主线战斗或者扫荡主线
                // UIManager.ShowForm(UIPath.UILevel);
                GameEvent.dispatchEvent(Msg.OPEN_LEVEL);
                let level = DLocal.getLevelData() - 1;
                if (level < 1001) {
                    level = 1001;
                }
                setTimeout(() => {
                    if (this && this.node) {
                        UIManager.ShowForm(UIPath.UIChapterInfo, level);
                    }
                }, 200);

            } else if (this._goType == 20001) { //副本战斗
                GameEvent.dispatchEvent(Msg.OPEN_COPY);
            }

            UIManager.CloseForm(UIPath.UITask);
        }
    }

}