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
    private bgReward1Goods: cc.Sprite = null;
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
    private btnGo: cc.Node = null;
    @property(cc.Node)
    private btnRecv1: cc.Node = null;
    @property(cc.Sprite)
    private imgStar: cc.Sprite = null;

    private _taskId = 0;
    private _taskMap = {}; // 所有已完成的任务
    private _goType = 0; // 前往类型
    private _itemColor = null;

    // 初始相当于onLoad
    OnInit() {

    }

    // 初始化label
    initLab() {

    }

    updateCell(index, totalCount, taskId, passParam) {
        this._taskMap = passParam["data"];
        let taskRecvData = passParam["recvData"];
        this._taskId = taskId;
        let taskItemCfg = DLocal.GetCfgData("mrrenwu")[taskId];
        this._goType = taskItemCfg.sj_lx;
        if (!this._itemColor) {
            this._itemColor = {
                "1": cc.color(48, 153, 17),
                "2": cc.color(17, 93, 153),
                "3": cc.color(153, 17, 126),
                "4": cc.color(186, 108, 10),
            }
        }

        let path = "";
        if (taskItemCfg.jl_lb == 1) {
            path = "ui/common/jb_jb";
        } else {
            path = "ui/common/jb_zs";
        }
        Utils.LoadRes(path, this, (spriteFrame) => {
            this.imgReward1Goods.spriteFrame = spriteFrame;
        }, cc.SpriteFrame)

        let bgPath = "ui/common/sd2_bg_dilv_" + taskItemCfg.rw_pz;
        Utils.LoadRes(bgPath, this, (spriteFrame) => {
            this.bgReward1Goods.spriteFrame = spriteFrame;
        }, cc.SpriteFrame)
        this.imgStar.spriteFrame = passParam["atlas"].getSpriteFrame("star_" + taskItemCfg.rw_pz);

        this.labReward1Num.string = taskItemCfg.jl_num;
        this.labTaskExplain.string = taskItemCfg.re_bt;
        this.labTaskExplain.node.color = this._itemColor[taskItemCfg.rw_pz];

        this.btnRecv.active = false;
        this.btnReceived.active = false;
        this.btnGo.active = false;
        this.btnRecv1.active = false;
        if (this._taskMap[this._goType]) {
            if (this._taskMap[this._goType].count >= taskItemCfg.xq_cs) {
                this.pbTask.progress = 1;
                this.labTaskProgress.string = taskItemCfg.xq_cs + "/" + taskItemCfg.xq_cs;

                let state = taskRecvData[this._taskId];
                if (state == 1) { //2代表二次领取 1 代表领取任务 0代表没有领取任务
                    this.btnRecv1.active = true;
                } else if (state == 2) {
                    this.btnReceived.active = true;
                } else {
                    this.btnRecv.active = true;
                }
            } else {
                this.pbTask.progress = this._taskMap[this._goType].count / taskItemCfg.xq_cs;
                this.labTaskProgress.string = this._taskMap[this._goType].count + "/" + taskItemCfg.xq_cs;
                this.btnGo.active = true;
            }
        } else {
            this.pbTask.progress = 0;
            this.labTaskProgress.string = 0 + "/" + taskItemCfg.xq_cs;
            this.btnGo.active = true;
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
        let taskItemCfg = DLocal.GetCfgData("mrrenwu")[taskId];
        if (taskItemCfg.jl_lb == 1) {
            rewardList.push({ "id": 1, "count": taskItemCfg.jl_num, "rewardType": RewardType.currency });
        } else {
            rewardList.push({ "id": 2, "count": taskItemCfg.jl_num, "rewardType": RewardType.currency });
        }
        UIManager.ShowForm(UIPath.UIReward, rewardList);
    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {
        if (btnName == "btnRecv") { // 领取
            DLocal.setTaskState(this._taskId, 1);
            this.updateReward(this._taskId);
            GameEvent.dispatchEvent(Msg.UPDATE_TASK);

        } else if (btnName == "btnRecv1") { // 通过广告领取奖励
            DLocal.setTaskState(this._taskId, 2);
            let adCount = DLocal.getWeekSeeAdNum();
            DLocal.setWeekSeeAdNum(adCount + 1);
            let adCount1 = DLocal.getTodayAdCount();
            DLocal.setTodayAdCount(adCount1 + 1);
            this.updateReward(this._taskId);

            GameEvent.dispatchEvent(Msg.UPDATE_TASK);
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