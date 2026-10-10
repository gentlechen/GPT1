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
export default class UIHeroInfo extends UIBase {


    @property(cc.Label)
    private labTitle: cc.Label = null;
    @property(cc.Label)
    private labHeroName: cc.Label = null;
    @property(cc.Label)
    private labSkills: cc.Label = null;
    @property(cc.Label)
    private labAttackType: cc.Label = null;
    @property(cc.Label)
    private labHeroPiece: cc.Label = null;
    @property(cc.Label)
    private labGoldNum: cc.Label = null;
    @property(cc.Label)
    private labHeroLv: cc.Label = null;
    @property(cc.Label)
    private labAttack1: cc.Label = null;
    @property(cc.Label)
    private labSpeed1: cc.Label = null;
    @property(cc.Label)
    private labCooling1: cc.Label = null;
    @property(cc.Label)
    private labLift1: cc.Label = null;
    @property(cc.Label)
    private labHeroLv2: cc.Label = null;
    @property(cc.Label)
    private labAttack2: cc.Label = null;
    @property(cc.Label)
    private labSpeed2: cc.Label = null;
    @property(cc.Label)
    private labCooling2: cc.Label = null;
    @property(cc.Label)
    private labLift2: cc.Label = null;
    @property(cc.Label)
    private labSkillExplain1: cc.Label = null;
    @property(cc.Label)
    private labSkillExplain2: cc.Label = null;
    @property(cc.Label)
    private labLvArr: cc.Label[] = [];
    @property(cc.Label)
    private labLvExplainArr: cc.Label[] = [];

    @property(cc.Sprite)
    private bgProfession: cc.Sprite = null;
    @property(cc.Sprite)
    private imgProfession: cc.Sprite = null;
    @property(cc.Sprite)
    private imgAttribute: cc.Sprite = null;
    @property(cc.Sprite)
    private bar: cc.Sprite = null;
    @property(cc.Sprite)
    private imgHero: cc.Sprite = null;
    @property(cc.ProgressBar)
    private pbHeroUpgrade: cc.ProgressBar = null;

    @property(cc.Node)
    private nodeHeroAttribute: cc.Node = null;
    @property(cc.Node)
    private nodePreview: cc.Node = null;
    @property(cc.Node)
    private nodeDisable: cc.Node = null;
    @property(cc.Node)
    private nodeBattle: cc.Node = null;
    @property(cc.Node)
    private nodeLock: cc.Node = null;
    @property(cc.Label)
    private labHeroNowLv: cc.Label = null;

    private _heroId = 0; // 英雄id
    private _heroProfession = null;
    private _attackType = null;
    private _selectIdx = 0; // 选择第几个
    private _heroNum = 0; // 当前拥有的英雄数量
    private _upgradeArr = {}; // 等级

    // 初始相当于onLoad
    OnInit() {
        this._heroProfession = {
            "1": "战士",
            "2": "射手",
            "3": "法师",
            "4": "异灵",
            "5": "辅助",
        }

        this._attackType = {
            "0": "无法攻击",
            "1": "普通",
            "2": "穿刺",
            "3": "魔法",
        }

        this._upgradeArr = {
            "1": [4, 8, 12, 16, 20],
            "2": [3, 6, 10, 14, 18],
            "3": [3, 6, 9, 12, 16],
            "4": [3, 6, 9, 12, 15],
        }
    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this._heroId = argList[0];
        this._selectIdx = argList[1];

        let guildChapterIdx = DLocal.getGuildChapterIdx();
        this.guildStep(guildChapterIdx);
        this.initLab();
        this.initUI();
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


    // 初始化label
    initLab() {
        let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._heroId];

        this.labTitle.string = heroItemCfg.name;
        this.labHeroName.string = this._heroProfession[heroItemCfg.yx_zy];
        this.labSkills.string = "定位：" + heroItemCfg.yx_location;
        this.labAttackType.string = "攻击类型\n" + this._attackType[heroItemCfg.attack_type];

        this.labGoldNum.string = heroItemCfg.unlock_jb;

        this.labHeroNowLv.string = heroItemCfg.level;
        this.labHeroLv.string = "英雄等级：" + heroItemCfg.level;
        this.labAttack1.string = "攻击力：" + heroItemCfg.yx_attack1;
        this.labSpeed1.string = "攻击速度：" + heroItemCfg.cost_time + "s/次";

        let heroNextid = heroItemCfg.next_id;
        let skillItemCfg = null;
        skillItemCfg = DLocal.GetCfgData("yingxiongjineng")[heroItemCfg.yx_jnid01];
        this.labCooling1.string = "技能冷却：" + skillItemCfg.cold1_time;
        this.labLift1.string = "生命上限：" + heroItemCfg.yx_hp;

        // 下一级
        if (heroNextid != 0) {
            let heroItemCfg2 = DLocal.GetCfgData("tfyingxiong")[heroItemCfg.next_id];
            this.labHeroLv2.string = "下一级";
            this.labAttack2.string = "攻击力：" + heroItemCfg2.yx_attack1;
            this.labSpeed2.string = "攻击速度：" + heroItemCfg2.cost_time + "s/次";

            let heroNextid2 = heroItemCfg2.next_id;
            let skillItemCfg2 = null;
            skillItemCfg2 = DLocal.GetCfgData("yingxiongjineng")[heroItemCfg2.yx_jnid01];

            this.labCooling2.string = "技能冷却：" + skillItemCfg2.cold1_time;
            this.labLift2.string = "生命上限：" + heroItemCfg2.yx_hp;
        }


        let skill1ItemCfg = DLocal.GetCfgData("yingxiongjineng")[heroItemCfg.yx_jnid01];
        let skill2ItemCfg = DLocal.GetCfgData("yingxiongjineng")[heroItemCfg.yx_jnid02];
        this.labSkillExplain1.string = skill1ItemCfg.description;
        this.labSkillExplain2.string = skill2ItemCfg.description;

        let index = 0;
        let heroCfg = DLocal.GetCfgData("tfyingxiong");
        let upgradeArr = this._upgradeArr[heroItemCfg.yx_pj]
        for (const key in heroCfg) {
            if (Object.prototype.hasOwnProperty.call(heroCfg, key)) {
                if (heroCfg[key].yx_type == heroItemCfg.yx_type) {
                    for (let j = 0; j < upgradeArr.length; j++) {
                        if (upgradeArr[j] == heroCfg[key].level) {
                            this.labLvExplainArr[index].string = "" + heroCfg[key].yx_jn01;
                            this.labLvArr[index].string = heroCfg[key].level;
                            index++;
                        }
                    }
                }
            }
        }

    }

    // 初始化UI
    initUI() {

        let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._heroId];

        let isHave = false; // 是否拥有
        let heroNum = 0;
        let haveHeroList = DLocal.getHeroList();
        for (let i = 0; i < haveHeroList.length; i++) {
            if (haveHeroList[i].id == this._heroId) {
                isHave = true;
                heroNum = haveHeroList[i].count;
                break;
            }
        }

        this._heroNum = heroNum;
        this.labHeroPiece.string = heroNum + "/" + heroItemCfg.unlock_sp;
        this.pbHeroUpgrade.progress = heroNum / heroItemCfg.unlock_sp;


        let heroQuality = heroItemCfg.yx_pj;
        Utils.loadImg("ui/hero/bgHeroQulity" + heroQuality, (sp) => {
            this.bgProfession.spriteFrame = sp;
        })

        let heroProfession = heroItemCfg.yx_zy;
        Utils.loadImg("ui/hero/imgProfession" + heroProfession, (sp) => {
            this.imgProfession.spriteFrame = sp;
        })

        Utils.loadImg("ui/hero/bgHeroQulity" + heroQuality, (sp) => {
            this.imgAttribute.spriteFrame = sp;
        })

        Utils.loadImg("ui/hero/imgPregress" + heroQuality, (sp) => {
            this.bar.spriteFrame = sp;
        })

        let heroType = heroItemCfg.yx_type;
        Utils.loadImg("ui/heroIcon/x" + heroType, (sp) => {
            this.imgHero.spriteFrame = sp;
        })

        this.nodeDisable.active = false;
        this.nodeBattle.active = false;
        this.nodeLock.active = false;

        // 判断是否拥有
        let isLimitHero = false;
        let limitHeroMap = DLocal.getLimitHeroMap();
        let limitHeroList = limitHeroMap[this._selectIdx];
        if (limitHeroList) {
            for (let i = 0; i < limitHeroList.length; i++) {
                if (limitHeroList[i].id == this._heroId) {
                    isLimitHero = true;
                    break;
                }
            }
        }
        if (isHave == true) {
            if (isLimitHero == false) {
                this.nodeDisable.active = true;
            } else {
                this.nodeBattle.active = true;
            }
        } else {
            if (isLimitHero == false) {
                this.nodeLock.active = true;
            } else {
                this.nodeDisable.active = true;
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
        if (btnName == "tgHeroAttribute") {
            this.nodeHeroAttribute.active = true;
            this.nodePreview.active = false;
        } else if (btnName == "tgHeroPreview") {
            this.nodeHeroAttribute.active = false;
            this.nodePreview.active = true;
        } else if (btnName == "btnHeroUpdate") {

            let guildChapterIdx = DLocal.getGuildChapterIdx();
            this.guildStep(guildChapterIdx);


            if (this.nodeDisable.active == true || this.nodeBattle.active == true) {

                AudioMgr.playEffect(MusicPath.HERORISEORLOCK);
                let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._heroId];
                if (this._heroNum < heroItemCfg.unlock_sp) {
                    UIManager.ShowForm(UIPath.UIFlyTip, "英雄不足");
                    return;
                }
                let nowGold = DLocal.getGold();
                if (heroItemCfg.unlock_jb > nowGold) {
                    UIManager.ShowForm(UIPath.UIFlyTip, "金币不足");
                    return;
                }
                let haveHeroList = DLocal.getHeroList();
                for (let i = 0; i < haveHeroList.length; i++) {
                    if (haveHeroList[i].id == this._heroId) {
                        haveHeroList[i].count -= heroItemCfg.unlock_sp;
                        if (heroItemCfg.next_id) {
                            this._heroId = heroItemCfg.next_id;
                            haveHeroList[i].id = heroItemCfg.next_id;
                        }
                        break;
                    }
                }
                DLocal.setSaveHaveheroData(haveHeroList);
                DLocal.setGold(nowGold - heroItemCfg.unlock_jb);
                GameEvent.dispatchEvent(Msg.UPDATE_HERO);
                GameEvent.dispatchEvent(Msg.UPDATE_GOLD);

                // this.CloseForm();

                this.initLab();
                this.initUI();

            } else if (this.nodeLock.active == true) {
                UIManager.ShowForm(UIPath.UIFlyTip, "未解锁");
            }
        } else if (btnName == "btnDisable") {
            GameEvent.dispatchEvent(Msg.DELETE_BATTLE_HERO, this._heroId);
            this.CloseForm();
        } else if (btnName == "btnBattle") {
            GameEvent.dispatchEvent(Msg.DELETE_BATTLE_HERO, this._heroId);
            this.CloseForm();
        }
    }

    // 关闭回调
    OnClose() {

    }
}