import { MusicPath } from "../common/GameEnum";
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
export default class UIBattleHeroInfo extends UIBase {

    @property(cc.Label)
    private labHeroName: cc.Label = null;
    @property(cc.Label)
    private labHeroLv: cc.Label = null;
    @property(cc.Sprite)
    private bgHero: cc.Sprite = null;
    @property(cc.Sprite)
    private imgHero: cc.Sprite = null;
    @property(cc.Sprite)
    private imgHeroQuality: cc.Sprite = null;
    @property(cc.Sprite)
    private imgStar: cc.Sprite = null;

    @property(cc.Label)
    private labDeletePrice: cc.Label = null;

    @property(cc.Label)
    private labAttribute1: cc.Label = null;
    @property(cc.Label)
    private labAttribute2: cc.Label = null;
    @property(cc.Label)
    private labAttribute3: cc.Label = null;
    @property(cc.Label)
    private labAttribute4: cc.Label = null;
    @property(cc.Label)
    private labAttribute5: cc.Label = null;
    @property(cc.Label)
    private labAttribute6: cc.Label = null;

    private _heroId = 0; // 英雄id
    private _starLv = 0; // 星级
    private _attack = 0; // 攻击力
    private _attackSpeed = 0; // 攻击速度
    private _skillCooling = 0; // 技能冷却

    private _heroAttackType = {};

    // 初始相当于onLoad
    OnInit() {
        this._heroAttackType = { "0": "无法攻击", "1": "普通", "2": "穿刺", "3": "魔法" }
    }

    //每次显示界面被调用
    public OnShow(...argList) {

        this._heroId = argList[0];
        this._starLv = argList[1];
        this._attack = argList[2];
        this._attackSpeed = argList[3];
        this._skillCooling = argList[4];
        let guildCallback = argList[5];
        if (guildCallback) {
            guildCallback();
        }

        this.initUI();
    }

    // 初始化label
    initLab() {

    }

    // 初始化UI
    initUI() {

        let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._heroId];
        this.labHeroName.string = heroItemCfg.name;
        this.labHeroLv.string = heroItemCfg.level;

        let heroQuality = heroItemCfg.yx_pj;
        Utils.loadImg("ui/hero/bghero" + heroQuality, (sp) => {
            this.bgHero.spriteFrame = sp;
        })
        Utils.loadImg("ui/hero/bgHeroQulity" + heroQuality, (sp) => {
            this.imgHeroQuality.spriteFrame = sp;
        })
        let heroType = heroItemCfg.yx_type;
        Utils.loadImg("ui/heroIcon/" + heroType, (sp) => {
            this.imgHero.spriteFrame = sp;
        })
        Utils.loadImg("ui/battle/yxxx_icon_star" + this._starLv, (sp) => {
            this.imgStar.spriteFrame = sp;
        })

        this.labDeletePrice.string = "0"; // 先按0

        this.labAttribute1.string = this._attack + "";
        this.labAttribute2.string = this._heroAttackType[heroItemCfg.attack_type];
        this.labAttribute3.string = this._attackSpeed + "s/次";

        let skillId = heroItemCfg.yx_jnid01;
        let skillItemCfg1 = DLocal.GetCfgData("yingxiongjineng")[skillId];

        let skillItemCfg2 = DLocal.GetCfgData("yingxiongjineng")[heroItemCfg.yx_jnid02];
        this.labAttribute4.string = this._skillCooling + "s";

        this.labAttribute5.string = skillItemCfg1.description;
        this.labAttribute6.string = skillItemCfg2.description;
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

        if (btnName == "btnDelete") {
            AudioMgr.playEffect(MusicPath.SELLHERO);
            let isGuild = DLocal.isGuildChapter();
            if (isGuild == true) {
                UIManager.ShowForm(UIPath.UIFlyTip, "引导过程中不许下阵");
                return;
            }
            GameEvent.dispatchEvent(Msg.DELETE_BATTLE_HERO, this._heroId);
            this.CloseForm();
        }
    }

    // 关闭回调
    OnClose() {
        GameEvent.dispatchEvent(Msg.UPDATE_CLOSE_GUILD);
    }
}