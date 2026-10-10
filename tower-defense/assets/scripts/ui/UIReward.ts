import { MusicPath, RewardType } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import DLocal from "../data/DLocal";
import AudioMgr from "../manage/AudioMgr";
import UIBase from "../manage/UIBase";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIReward extends UIBase {

    @property(cc.Node)
    private nodeHero: cc.Node = null;
    @property(cc.Node)
    private nodeMoney: cc.Node = null;

    @property(cc.Node)
    private content: cc.Node = null;

    private _rewardList = null;
    private _callback = null;

    // 初始相当于onLoad
    OnInit() {
        this.nodeHero.removeFromParent();
        this.nodeMoney.removeFromParent();
    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this._rewardList = argList[0];
        this._callback = argList[1];

        AudioMgr.playEffect(MusicPath.BUYGOODS);
        this.initUI();
        this.setReward();
    }

    // 初始化label
    initUI() {

        for (let i = 0; i < this.content.childrenCount; i++) {
            this.content.children[i].active = false;
        }

        let scrollWidth = 235;
        let itemWidth = 155;
        let itemHigth = 150;
        let moneyIdx = 0;
        let heroIdx = 0;
        let allItemHight = 0;
        for (let i = 0; i < this._rewardList.length; i++) {

            let item = null;
            if (this._rewardList[i].rewardType == RewardType.currency) {

                item = this.content.getChildByName("money" + moneyIdx);
                if (item == null) {
                    item = cc.instantiate(this.nodeMoney);
                    item.parent = this.content;
                }
                moneyIdx++;
                Utils.loadImg("ui/reward/" + this._rewardList[i].id, (sp) => {
                    item.getChildByName("imgMoney").getComponent(cc.Sprite).spriteFrame = sp;
                })
                item.getChildByName("labMoneyNum").getComponent(cc.Label).string = "X" + this._rewardList[i].count;
            } else if (this._rewardList[i].rewardType == RewardType.Hero) {
                item = this.content.getChildByName("hero" + heroIdx);
                if (item == null) {
                    item = cc.instantiate(this.nodeHero);
                    item.parent = this.content;
                }
                heroIdx++;
                let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._rewardList[i].id];
                Utils.loadImg("ui/common/sd2_bg_dilv_" + heroItemCfg.yx_pj, (sp) => {
                    item.getChildByName("bgHero").getComponent(cc.Sprite).spriteFrame = sp;
                })
                Utils.loadImg("ui/heroIcon/" + heroItemCfg.yx_type, (sp) => {
                    item.getChildByName("imgHero").getComponent(cc.Sprite).spriteFrame = sp;
                })
                item.getChildByName("labHeroNum").getComponent(cc.Label).string = "X" + this._rewardList[i].count;
            }

            let row = Math.ceil((i + 1) / 3); // 行
            let col = i % 3; // 列
            let x = col * itemWidth - scrollWidth + 16;
            let y = -(row - 1) * itemHigth - 5;
            allItemHight = -row * itemHigth - 5;
            item.position = cc.v3(x, y);

            item.active = true;
        }

        if (Math.abs(allItemHight) > 390) {
            this.content.height = Math.abs(allItemHight);
        } else {
            this.content.height = 390;
        }
    }

    // 设置奖励
    setReward() {

        for (let i = 0; i < this._rewardList.length; i++) {
            if (this._rewardList[i].rewardType == RewardType.currency) {
                if (this._rewardList[i].id == 1) { // 金币
                    let goldNum = DLocal.getGold();
                    goldNum += this._rewardList[i].count;
                    DLocal.setGold(goldNum);
                } else if (this._rewardList[i].id == 2) { // 钻石
                    let diamondNum = DLocal.getDiamond();
                    diamondNum += this._rewardList[i].count;
                    DLocal.setDiamond(diamondNum);
                }
            } else if (this._rewardList[i].rewardType == RewardType.Hero) {
                DLocal.addSingleHero(this._rewardList[i].id, this._rewardList[i].count);
            }
        }

        GameEvent.dispatchEvent(Msg.UPDATE_DIAMOND);
        GameEvent.dispatchEvent(Msg.UPDATE_GOLD);
        // GameEvent.dispatchEvent(Msg.OPEN_HERO_VIEW);
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
        if (this._callback) {
            this._callback();
        }
    }
}