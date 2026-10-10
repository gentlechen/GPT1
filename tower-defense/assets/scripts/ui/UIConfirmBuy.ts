import { CurrencyId, MusicPath } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import AudioMgr from "../manage/AudioMgr";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIConfirmBuy extends UIBase {

    @property(cc.Label)
    private labCost: cc.Label = null;
    @property(cc.Sprite)
    private bgGoods: cc.Sprite = null;
    @property(cc.Sprite)
    private imgGoods: cc.Sprite = null;
    @property(cc.ProgressBar)
    private pbHeroNum: cc.ProgressBar = null;
    @property(cc.Sprite)
    private imgHeroQuality: cc.Sprite = null;
    @property(cc.Sprite)
    private bar: cc.Sprite = null;
    @property(cc.Sprite)
    private imgMoney: cc.Sprite = null;
    @property(cc.Label)
    private labHeroNum: cc.Label = null;
    @property(cc.Label)
    private labLevel: cc.Label = null;
    @property(cc.Label)
    private labHeropb: cc.Label = null;


    @property(cc.SpriteFrame)
    private moneyArr: cc.SpriteFrame[] = [];
    private _buycallFunc = null;

    private _moneyId = 1; // 货币id
    private _costNum = 0; // 消耗数量

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    // 参数1 消耗数量
    // 参数2 奖励图片
    // 参数3 货币id
    // 参数4 购买回调
    public OnShow(...argList) {

        this.labCost.string = argList[0];
        this.imgGoods.spriteFrame = argList[1];
        this.imgMoney.spriteFrame = this.moneyArr[argList[2] - 1];
        this._buycallFunc = argList[3];
        // this._buycallFunc = argList[4];
        this._moneyId = argList[2];
        this._costNum = argList[0];

        let heroId = argList[5];

        this.bgGoods.node.active = argList[4];
        this.pbHeroNum.node.active = argList[4];
        this.imgHeroQuality.node.active = argList[4];
        this.labHeroNum.node.active = argList[4];
        this.labLevel.node.active = argList[4];
        this.labHeropb.node.active = argList[4];
        if (argList[4] == true) { // 英雄

            let heroData = { "id": heroId, "count": 0 };
            let heroCfg = DLocal.GetCfgData("tfyingxiong")[heroId];
            let haveHeroList = DLocal.getHeroList();
            for (let i = 0; i < haveHeroList.length; i++) {
                let heroCfg1 = DLocal.GetCfgData("tfyingxiong")[haveHeroList[i].id];
                if (heroCfg1.yx_type == heroCfg.yx_type) {
                    heroData = haveHeroList[i];
                    break;
                }
            }
            let heroCfg2 = DLocal.GetCfgData("tfyingxiong")[heroData.id];
            Utils.loadImg("ui/common/sd2_bg_dilv_" + heroCfg2.yx_pj, (sp) => {
                this.bgGoods.spriteFrame = sp;
            })
            Utils.loadImg("ui/hero/bgHeroQulity" + heroCfg2.yx_pj, (sp) => {
                this.imgHeroQuality.spriteFrame = sp;
            })
            Utils.loadImg("ui/hero/imgPregress" + heroCfg2.yx_pj, (sp) => {
                this.bar.spriteFrame = sp;
            })
            this.labHeroNum.string = "X" + argList[6];;
            this.labLevel.string = heroCfg2.level;
            this.labHeropb.string = heroData.count + "/" + heroCfg2.unlock_sp;
            this.pbHeroNum.progress = heroData.count / heroCfg2.unlock_sp;
        }
    }

    // 初始化label
    initLab() {

    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

        if (btnName == "btnBuy") {

            if (this._moneyId == CurrencyId.Gold) {
                let nowGold = DLocal.getGold();

                if (nowGold >= this._costNum) {

                    if (this._buycallFunc) {
                        DLocal.setGold(nowGold - this._costNum);
                        GameEvent.dispatchEvent(Msg.UPDATE_GOLD);
                        this._buycallFunc();

                        AudioMgr.playEffect(MusicPath.BUYGOODS);
                    }
                } else {
                    AudioMgr.playEffect(MusicPath.CLICKMUSIC);
                    UIManager.ShowForm(UIPath.UIFlyTip, "金币不足");
                }
            } else if (this._moneyId == CurrencyId.Diamond) {
                let nowGold = DLocal.getDiamond();

                if (nowGold >= this._costNum) {
                    if (this._buycallFunc) {
                        DLocal.setDiamond(nowGold - this._costNum);
                        GameEvent.dispatchEvent(Msg.UPDATE_DIAMOND);
                        this._buycallFunc();
                        AudioMgr.playEffect(MusicPath.BUYGOODS);
                    }

                } else {
                    AudioMgr.playEffect(MusicPath.CLICKMUSIC);
                    UIManager.ShowForm(UIPath.UIFlyTip, "钻石不足");
                }
            }

            this.CloseForm();
        }


    }

    // 关闭回调
    OnClose() {

    }
}