
import { RewardType } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";

const { ccclass, property } = cc._decorator;

// 新手引导
@ccclass
export default class UIGuild extends UIBase {

    @property(cc.Mask)
    private mask: cc.Mask = null;
    @property(cc.Node)
    private nodeBlock: cc.Node = null;
    @property(cc.Node)
    private btnNext: cc.Node = null;
    @property(cc.Node)
    private imgHero: cc.Node = null;
    @property(cc.Node)
    private bgInfo: cc.Node = null;
    @property(cc.Label)
    private labContent: cc.Label = null;
    @property(cc.Node)
    private imgFinger: cc.Node = null;
    @property(cc.Node)
    private imgArrow: cc.Node = null;
    @property(cc.Node)
    private btnBack: cc.Node = null;
    @property(cc.Node)
    private nodeStr: cc.Node = null;
    @property(cc.Node)
    private btnReward: cc.Node = null;
    @property(sp.Skeleton)
    private lightRing: sp.Skeleton = null;

    private _guildChapter = 0; // 当前引导章节
    private _nextGuildChapter = 0; // 下一章节id

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {

        GameEvent.addEventHandler(Msg.UPDATE_GUILD_STEP, this.updateGuildStepFunc.bind(this), this);
        GameEvent.addEventHandler(Msg.UPDATE_CLOSE_GUILD, this.updateCloseFunc.bind(this), this);
        GameEvent.addEventHandler(Msg.UPDATE_CLOSE_GUILD_MASK, this.updateCloseMask.bind(this), this);
        this._guildChapter = argList[0];
        this.initUI();
    }

    // 初始化
    initUI() {
        this.mask.enabled = false;
        this.imgHero.active = false;
        this.bgInfo.active = false;
        this.labContent.node.active = false;
        this.imgFinger.active = false;
        this.imgArrow.active = false;
        this.btnBack.active = false;
        this.lightRing.node.active = false;
        this.btnNext.active = false;
        this.btnReward.active = false;
        this.nodeStr.y = 0;

        // if (DLocal.isGuildChapter(this._guildChapter)) {
        //     this.OnClose_Click();
        //     return;
        // }
        if (this._guildChapter == 8) {
            this.nodeStr.y = -300;
        }
        let guildData = DLocal.getGuildChapterData(this._guildChapter);
        if (!guildData) {
            this.CloseForm();
            return;
        }

        if (guildData.str) {
            this.imgHero.active = true;
            this.bgInfo.active = true;
            this.labContent.node.active = true;
            this.labContent.string = guildData.str;
            this.btnBack.active = true;
            this.btnNext.active = true;
        }

        this._nextGuildChapter = guildData.nextId;
        if (guildData.ringPath) {
            this.lightRing.node.active = true;

            let viewClass = UIManager.getViewClass(guildData.view);
            if (!viewClass) {
                this.CloseForm();
            }
            let pathArr = (guildData.ringPath).split("/");
            if (pathArr.length == 0) {
                return;
            }
            let targetNode = null;
            let index = 0;
            let getTargetNode = (rootNode) => {
                if (index >= pathArr.length) {
                    return;
                }
                targetNode = rootNode.getChildByName(pathArr[index]);
                index++;
                getTargetNode(targetNode);
            }
            if (!viewClass) {
                return;
            }
            getTargetNode(viewClass.node);
            let targetPos = this.calculateTargetPos(viewClass, targetNode);

            let animationName = this.lightRing.animation
            this.lightRing.setAnimation(0, animationName, true);
            this.lightRing.node.position = targetPos;
            this.mask.node.position = targetPos;
            this.mask.enabled = true;
            this.btnNext.active = false;
        }
        if (guildData.arrowPath) {

            let viewClass = UIManager.getViewClass(guildData.view);
            if (!viewClass) {
                this.CloseForm();
            }
            let pathArr = (guildData.arrowPath).split("/");
            if (pathArr.length == 0) {
                return;
            }
            let targetNode = null;
            let index = 0;
            let getTargetNode = (rootNode) => {
                if (index >= pathArr.length) {
                    return;
                }
                targetNode = rootNode.getChildByName(pathArr[index]);
                index++;
                getTargetNode(targetNode);
            }
            // console.log("----------------- viewClass.name " + viewClass.name)
            if (!viewClass) {
                return;
            }
            getTargetNode(viewClass.node);
            let targetPos = this.calculateTargetPos(viewClass, targetNode);
            targetPos.y += 60;
            this.imgArrow.active = true;
            this.imgArrow.position = targetPos;
        }
        if (guildData.handPath) {

            let viewClass = UIManager.getViewClass(guildData.view);
            if (!viewClass) {
                this.CloseForm();
            }
            let pathArr = (guildData.handPath).split("/");
            if (pathArr.length == 0) {
                return;
            }
            let targetNode = null;
            let index = 0;
            let getTargetNode = (rootNode) => {
                if (index >= pathArr.length) {
                    return;
                }
                targetNode = rootNode.getChildByName(pathArr[index]);
                index++;
                getTargetNode(targetNode);
            }
            if (!viewClass) {
                return;
            }
            getTargetNode(viewClass.node);
            let targetPos = this.calculateTargetPos(viewClass, targetNode);
            this.imgFinger.active = true;
            this.mask.node.position = targetPos;
            targetPos.x += 100;
            this.imgFinger.position = targetPos;
            this.mask.enabled = true;

        }
        if (this._guildChapter == 6 || this._guildChapter == 8) { // 查看银币
            this.btnNext.active = true;
        }
        if (this._guildChapter == 28) { // 最后一关
            this.btnReward.active = true;
            this.btnNext.active = false;
        }
    }

    // 初始化label
    initLab() {
    }

    updateGuildStepFunc() {
        this.nextStep();

        if (this._guildChapter != 0) {
            DLocal.setGuildChapterIdx(this._guildChapter);
        }
    }

    // 引导下一步
    nextStep() {

        if (this._nextGuildChapter == 0 || this._guildChapter == 15 || this._guildChapter == 19) {
            GameEvent.dispatchEvent(Msg.NOTICE_CREATE_MONSTER);
            this._guildChapter = this._nextGuildChapter;
            DLocal.setGuildChapterIdx(this._guildChapter);
            this.OnClose_Click();
            return;
        }
        this._guildChapter = this._nextGuildChapter;
        this.initUI();
        DLocal.setGuildChapterIdx(this._guildChapter);
    }

    // 计算位置
    calculateTargetPos(targetClass, targetNode) {
        let worldPos = targetNode.parent.convertToWorldSpaceAR(targetNode.position); // 世界坐标
        let point = targetClass.node.convertToNodeSpaceAR(worldPos);
        return point;
    }

    updateCloseFunc() {
        if (this._guildChapter == 9 || this._guildChapter == 15) {// 开始生成怪物
            GameEvent.dispatchEvent(Msg.NOTICE_CREATE_MONSTER);
        }
        if (this._nextGuildChapter != 0) {
            this._guildChapter = this._nextGuildChapter;
        }

        DLocal.setGuildChapterIdx(this._guildChapter);
        this.CloseForm();
    }

    // 关闭mask
    updateCloseMask() {
        this.mask.enabled = false;
        this.lightRing.node.active = false;
        this.imgFinger.active = false;
    }

    // 每秒
    OnUpdateSEC() {
    }

    // 每帧
    OnUpdate(dt) {
    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {
        console.log(btnName)

        if (btnName == "btnBack") { // 返回
            this.nextStep();
        } else if (btnName == "btnNext") { // 下一步
            this.nextStep();
        } else if (btnName == "btnClick") { // 点击

        } else if (btnName == "btnReward") { // 领取奖励

            let rewardList = [];
            let rewardCfg = DLocal.GetCfgData("xsyd-jiangli");
            for (const key in rewardCfg) {
                if (rewardCfg[key]) {
                    rewardList.push({ "id": rewardCfg[key].yx_id, "count": rewardCfg[key].yx_num, "rewardType": RewardType.Hero });
                }
            }
            UIManager.ShowForm(UIPath.UIReward, rewardList, () => {
                GameEvent.dispatchEvent(Msg.UPDATE_HERO);
            });
            DLocal.saveGuildChapterIdx(28);

            this.CloseForm();
        }

        if (this._guildChapter != 0) {
            console.log("------- this._guildChapter = " + this._guildChapter)
            DLocal.setGuildChapterIdx(this._guildChapter);
        }
    }

    // 关闭回调
    OnClose() {
        if (this._nextGuildChapter != 0) {
            this._guildChapter = this._nextGuildChapter;
        }

        DLocal.setGuildChapterIdx(this._guildChapter);
    }
}