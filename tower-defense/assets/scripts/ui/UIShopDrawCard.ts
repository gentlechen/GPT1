import { MusicPath } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import AudioMgr from "../manage/AudioMgr";
import UIBase from "../manage/UIBase";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIShopDrawCard extends UIBase {

    @property(cc.Node)
    private nodeReward: cc.Node = null;
    @property(cc.Node)
    private btnClose: cc.Node = null;
    @property(cc.Node)
    private imgRewardTitle: cc.Node = null;
    @property(sp.Skeleton)
    private spDrawCard: sp.Skeleton = null;

    private _rewardList = [];
    private _signlePosY = 0; // 单抽位置
    private _guildTimer = null;

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this._rewardList = argList[0];
        for (let i = 0; i < this._rewardList.length; i++) {
            let data = this._rewardList[i];
            DLocal.addSingleHero(data.id, data.count);
        }
        this.btnClose.active = false;
        this.imgRewardTitle.active = false;
        this.reAllReward();
        this.playCardAction();
        let isGuild = DLocal.isGuildChapter();
        if (isGuild == true) {
            GameEvent.dispatchEvent(Msg.UPDATE_CLOSE_GUILD_MASK);
        }
        AudioMgr.playEffect(MusicPath.OPENBOX);
    }


    // 初始化label
    initLab() {

    }

    // 重置所有的奖励
    reAllReward() {
        for (let i = 0; i < this.nodeReward.childrenCount; i++) {
            this.nodeReward.children[i].active = false;
        }
    }

    // 播放卡牌动画
    playCardAction() {
        this.btnClose.active = false;
        this.spDrawCard.node.active = true;
        this.spDrawCard.setAnimation(0, 'animation', false);
        this.spDrawCard.setCompleteListener(() => {
            // this.spDrawCard.setAnimation(0, 'stand', true);
            // this.spDrawCard.setCompleteListener(() => { })
            this.spDrawCard.node.active = false;
            this.btnClose.active = true;

            this.imgRewardTitle.active = true;
            if (this._rewardList.length > 1) {
                this.loadTenCard();
            } else {
                this.singleCard();
            }
            if (this._guildTimer) {
                clearTimeout(this._guildTimer);
                this._guildTimer = null;
            }

            let isGuild = DLocal.isGuildChapter();
            if (isGuild) {
                this._guildTimer = setTimeout(() => {
                    if (!this || !this.node) {
                        return;
                    }
                    let guildChapterIdx = DLocal.getGuildChapterIdx();
                    this.guildNextStep(guildChapterIdx);
                    DLocal.saveGuildChapterIdx(guildChapterIdx + 1);
                }, 400);
            }
        });
    }

    // 加载卡牌动画 十连抽
    loadTenCard() {

        let nowY = 0;
        let initY = 0;
        let heroCardHeight = 196;
        let heroCardWidth = 187;
        let children = this.nodeReward.children[0];
        let childrenCount = this.nodeReward.childrenCount;
        console.log("---------- childrenCount = " + childrenCount);
        console.log("---------- this._rewardList.length = " + this._rewardList.length);
        console.log(this._rewardList);
        for (let i = 0; i < this._rewardList.length; i++) {

            let item = null;
            if (i >= childrenCount) {
                item = cc.instantiate(children);
                item.parent = this.nodeReward;
            } else {
                item = this.nodeReward.children[i];
            }
            item.active = true;
            let row = Math.ceil((i + 1) / 3); // 行
            let col = i % 3; // 列
            nowY = initY - (row - 1) * heroCardHeight;
            item.y = nowY;
            if (this._rewardList.length - 1 == i) {
                item.x = 0;
            } else {
                item.x = col * heroCardWidth - heroCardWidth * 1;
            }

            let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._rewardList[i].id];
            Utils.loadImg("ui/common/sd2_bg_dilv_" + heroItemCfg.yx_pj, (sp) => {
                item.getChildByName("bgHero").getComponent(cc.Sprite).spriteFrame = sp;
            })
            Utils.loadImg("ui/heroIcon/" + heroItemCfg.yx_type, (sp) => {
                item.getChildByName("imgHero").getComponent(cc.Sprite).spriteFrame = sp;
            })
            item.getChildByName("labHeroNum").getComponent(cc.Label).string = "X" + this._rewardList[i].count;
        }

    }

    // 单抽
    singleCard() {

        let item = this.nodeReward.children[0];
        item.active = true;
        let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._rewardList[0].id];
        Utils.loadImg("ui/common/sd2_bg_dilv_" + heroItemCfg.yx_pj, (sp) => {

            item.getChildByName("bgHero").getComponent(cc.Sprite).spriteFrame = sp;
        })
        Utils.loadImg("ui/heroIcon/" + heroItemCfg.yx_type, (sp) => {

            item.getChildByName("imgHero").getComponent(cc.Sprite).spriteFrame = sp;
        })

        item.getChildByName("labHeroNum").getComponent(cc.Label).string = "X" + this._rewardList[0].count;

        if (this._signlePosY == 0) {
            let worldPos = this.nodeReward.convertToWorldSpaceAR(item.position); // 世界坐标
            this._signlePosY = this.node.convertToNodeSpaceAR(worldPos).y;
        }
        // item.position = point;
        item.x = 0;
        item.y = -this._signlePosY + 100;
    }

    // 新手引导
    guildNextStep(stepIdx) {
        let isGuild = DLocal.isGuildChapter();
        if (isGuild == true) {
            let guildChapterIdx = DLocal.getGuildChapterIdx();
            if (guildChapterIdx == stepIdx) {
                GameEvent.dispatchEvent(Msg.UPDATE_GUILD_STEP);
            }
        }
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

    }

    // 关闭回调
    OnClose() {
        let isGuild = DLocal.isGuildChapter();
        if (isGuild == true) {
            let guildChapterIdx = DLocal.getGuildChapterIdx();
            this.guildNextStep(guildChapterIdx);
        }
    }
}