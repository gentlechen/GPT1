import ResourceLoader from "../utils/ResourceLoader";

import { MusicPath, RewardType } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import AudioMgr from "../manage/AudioMgr";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";
import Hero from "./Hero";
import Monster from "./Monster";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIBattle extends UIBase {

    @property(cc.Label)
    private labUnLockCost: cc.Label = null;
    @property(cc.Label)
    private labRefreshCost: cc.Label = null;
    @property(cc.Label)
    private labGold: cc.Label = null;
    @property(cc.Label)
    private labPlayerHp: cc.Label = null;
    @property(cc.Label)
    private labLevelName: cc.Label = null;

    @property(cc.Prefab)
    private silvercoin: cc.Prefab = null;
    @property(cc.Prefab)
    private monsterDie: cc.Prefab = null;
    @property(cc.Node)
    private labMonsterHurt: cc.Node = null;
    @property(cc.Node)
    private nodeSilver: cc.Node = null;
    @property(cc.Node)
    private nodeMonsterBirth: cc.Node = null;
    @property(cc.Node)
    private nodeSkill: cc.Node = null;
    @property(cc.ProgressBar)
    private pbPlayer: cc.ProgressBar = null;
    @property(cc.Node)
    private nodeShield: cc.Node = null;
    @property(cc.Label)
    private labShield: cc.Label = null;
    @property(cc.Node)
    private nodeBoss: cc.Node = null;
    @property(cc.ProgressBar)
    private pbBoss: cc.ProgressBar = null;
    @property(cc.Label)
    private labTitle: cc.Label = null;
    @property(cc.Label)
    private labWarshipHurt: cc.Label = null;
    @property(cc.Node)
    private nodePos1: cc.Node = null;
    @property(cc.Node)
    private nodePos2: cc.Node = null;
    @property(cc.Node)
    private nodePos3: cc.Node = null;
    @property(sp.Skeleton)
    private spWarship: sp.Skeleton = null;
    @property(cc.LabelAtlas)
    private generalAtlas: cc.LabelAtlas = null;
    @property(cc.LabelAtlas)
    private criticalAtlas: cc.LabelAtlas = null;
    @property(cc.Node)
    private nodeBloodAction: cc.Node = null;
    @property(cc.Node)
    private nodeDown: cc.Node = null;
    @property(cc.Node)
    private nodeWarship: cc.Node = null;
    @property(cc.Node)
    private nodeFetter: cc.Node = null;

    @property(cc.Sprite)
    private bgHeroCardArr: cc.Sprite[] = [];
    @property(cc.Sprite)
    private heroCardArr: cc.Sprite[] = [];
    @property(cc.Node)
    private lockArr: cc.Node[] = [];
    @property(cc.Node)
    private heroAnimArr: cc.Node[] = [];
    @property(cc.Sprite)
    private heroStarArr: cc.Sprite[] = []; // 英雄星级
    @property(cc.Node)
    private heroClickArr: cc.Node[] = []; // 上阵英雄的点击事件

    private _unlockIndex = 0; // 解锁等级
    private _nowGameLevel = 1001; // 当前游戏关卡
    private _haveHeroList = []; // 拥有的英雄数据
    private _selectHero = []; // 可以选择英雄
    private _battleHeroMap = {}; // 上阵英雄
    private _isSlow = false;
    private _waveIdx = 0; // 第几波怪物
    private _waveLoadingIdx = 0; // 加载的第几波
    private _victoryWaveIdx = 0; // 胜利波数

    private _monsterBattleArr = {}; // 上阵怪物
    private _monsterLowerArr = {}; // 下阵怪物

    private _HeroBattleArr = []; // 上阵英雄
    private _heroLowerArr = []; // 下阵英雄

    private _bulleLowerArr = {}; // 下阵子弹

    private _silverArr = []; // 怪物掉落的银币
    private _monsterAnmiArr = []; // 怪物死亡动画
    private _monsterHurtArr = []; // 怪物飘伤害

    private _heroAllBlood = 0; // 所有玩家血量
    private _playerNowBlood = 0; // 当前玩家血量
    private _monsterPosArr = [-182, -130, -78, -26, 27, 79, 131, 184];
    private _delayTimer = null; // 怪物延迟计时器

    private _monsterZIndex = 300; // 怪物层级

    private _silverNum = 0; // 拥有的银币数量
    private _refreshConsume = 0; // 刷新所消耗
    private _nowWarshipLevel = 1; // 战舰等级
    private _warshipConsume = 0; // 战舰消耗

    private _isCopyBattle = false; // 是否是副本战斗
    private _heroStarMap = {};// 英雄星级
    private _maxStar = 5; // 最大星星
    private _isBattleEnd = false; // 是否战斗结束

    private _transmitArr = [];
    private _battleHeroList = [];
    private _shieldValue = 0; // 护盾加成
    private _skillAnmiMap = {}; // 技能列表
    private _heroWork = null; // 上阵特效
    private _heroUpGrade = null; // 升级特效
    private _fzblAnmi1 = null; // 风之壁垒特效1
    private _fzblAnmi2 = null; // 风之壁垒特效2
    private _settlementTimer = null; // 结算定时器
    private _bossBulletId = 1; // boss子弹id
    private _monsterBulletId = 1; // 怪物子弹id
    private _warshipHurtList = []; // 战舰伤害列表
    private _fetterMap = {}; // 羁绊Map


    // 初始相当于onLoad
    OnInit() {
        // GameEvent.addEventHandler(Msg.BATTLE_UPDATE_WAVE, this.updateMonsterWaveFunc.bind(this), this);
        // GameEvent.addEventHandler(Msg.BATTLE_DROP_SILVER, this.updateDropSilverFunc.bind(this), this);
    }

    //每次显示界面被调用
    public OnShow(...argList) {
        console.log("[BattleTrace] battle initialization", argList);

        AudioMgr.playBattleMusic();
        this._fetterMap = {};
        this._isBattleEnd = false; // 战斗是否结束
        this._heroStarMap = {}; // 英雄身的星级
        GameEvent.addEventHandler(Msg.BATTLE_UPDATE_WAVE, this.updateMonsterWaveFunc.bind(this), this);
        GameEvent.addEventHandler(Msg.DELETE_BATTLE_HERO, this.deleteBattleHeroFunc.bind(this), this);
        GameEvent.addEventHandler(Msg.UPDATE_MONSTER_START, this.updateMonsterStartFunc.bind(this), this);
        GameEvent.addEventHandler(Msg.NOTICE_CREATE_MONSTER, this.updateMonsterStartFunc.bind(this), this);

        this.deleteAllSkill();
        this.removeWarshipHurt();
        this._waveIdx = 0;
        this._waveLoadingIdx = 0;

        let isGuild = argList[2]; // 是否新手引导
        let guildCallback = argList[3]; // 新手引导
        if (!argList[1]) { // 是否为副本
            this._isCopyBattle = false;
        } else {
            this._isCopyBattle = true;
        }

        this._monsterBattleArr = {};

        let monsterArr = [];
        for (let i = 0; i < this.nodeMonsterBirth.childrenCount; i++) {
            if (this.nodeMonsterBirth.children[i]) {
                monsterArr.push(this.nodeMonsterBirth.children[i]);
            }
        }
        for (let i = 0; i < monsterArr.length; i++) {
            if (monsterArr[i]) {
                monsterArr[i].destroy();
            }
        }

        let skillArr = [];
        for (let i = 0; i < this.nodeSkill.childrenCount; i++) {
            if (this.nodeSkill.children[i]) {
                skillArr.push(this.nodeSkill.children[i]);
            }
        }
        for (let i = 0; i < skillArr.length; i++) {
            if (skillArr[i]) {
                skillArr[i].destroy();
            }
        }
        this.deleteAllHero();
        this.deleteSkillFetter();

        DLocal.deleteAllSkill();
        for (let i = 0; i < this.heroStarArr.length; i++) {
            this.heroStarArr[i].node.active = false;
            this.heroClickArr[i].active = false;
        }
        this._unlockIndex = 0;
        if (this._delayTimer) {
            clearTimeout(this._delayTimer);
            this._delayTimer = null;
        }
        this.setRandomHero();

        this._shieldValue = 0;
        this._battleHeroMap = {};
        this._battleHeroList = [];
        this.pbPlayer.progress = 1;
        this._nowGameLevel = argList[0];

        this.loadShield();

        this.getHaveHeroData();
        this.initHeroStand(this._unlockIndex);

        this.initRefreshAndUp();
        this.initPlayerBlood();

        console.log("---------------- 路口33")
        if (!isGuild || isGuild == false) {
            this.waveMonsterWithTime(); // 生成怪物
        }

        this.updateHeroConsumeColor();
        this.updateAirshipConsumeColor();

        this.updateWaveCount();

        this.randomHeroSelect();
        console.log("[BattleTrace] battle initialization completed", this._nowGameLevel);
        if (guildCallback) {
            // UIBase activates ct after OnShow returns; start the guide next frame.
            this.scheduleOnce(() => {
                if (cc.isValid(this.node) && this.node.activeInHierarchy) guildCallback();
            }, 0);
        }


        this.hideBossBlood();

        let levelCfg = DLocal.GetCfgData("zongguanqia")[this._nowGameLevel];
        this.labLevelName.string = levelCfg.gqmc;
    }

    // 获取拥有的英雄数据
    getHaveHeroData() {
        // this._nowGameLevel = DLocal.getLevelData(); // 保存关卡

        let allHero = DLocal.getHeroList();
        this._haveHeroList = [];
        let nowLimitHero = DLocal.getNowLimitHeroList();
        for (let i = 0; i < allHero.length; i++) {
            let isLimit = false;
            for (let j = 0; j < nowLimitHero.length; j++) {
                if (allHero[i].id == nowLimitHero[j].id) {
                    isLimit = true;
                    break;
                }
            }
            if (isLimit != true) {
                this._haveHeroList.push(allHero[i]);
            }
        }
    }

    // 添加玩家英雄数据
    addHaveHero(heroId) {
        if (!this._haveHeroList) {
            this._haveHeroList = [];
        }
        let isHave = false;
        for (let i = 0; i < this._haveHeroList.length; i++) {
            if (this._haveHeroList[i]["id"] == heroId) {
                isHave = true;
                break;
            }
        }
        if (isHave == false) {
            this._haveHeroList.push({ "id": heroId, "count": 0 });
        }
    }

    // 通过解锁第几个去加载对应的底座数据
    initHeroStand(index) {
        for (let i = 0; i < this.heroAnimArr.length; i++) {
            if (index >= i) {
                this.heroAnimArr[i].active = false;
                this.lockArr[i].active = false;
            } else {
                this.heroAnimArr[i].active = false;
                this.lockArr[i].active = true;
            }
            for (let j = 0; j < this.heroAnimArr[i].childrenCount; j++) {
                if (this.heroAnimArr[i].children[j]) {
                    this.heroAnimArr[i].children[j].destroy();
                }
            }
        }
    }

    // 计算当前玩家血量
    initPlayerBlood() {

        let allHero = DLocal.getHeroList();
        let allHeroBlood = 0;
        for (let i = 0; i < allHero.length; i++) {
            let heroId = allHero[i].id;
            allHeroBlood += DLocal.GetCfgData("tfyingxiong")[heroId].yx_hp;
        }
        this._playerNowBlood = DLocal.getWarshipBaseBlood() + allHeroBlood;
        this._heroAllBlood = this._playerNowBlood;
        this.updateBlood();
    }

    // 通过上阵英雄增加血量
    addPlayerBlood(heroId) {

        for (let i = 0; i < this._haveHeroList.length; i++) {
            if (this._haveHeroList[i].id == heroId) {
                this._playerNowBlood += DLocal.GetCfgData("tfyingxiong")[heroId].yx_hp * 0.5;
                return;
            }
        }
    }

    // 计算总血量
    getTotalBlood() {
        // this._heroAllBlood = 3000; // 战舰基础值
        // for (let i = 0; i < this._haveHeroList.length; i++) {
        //     let heroId = this._haveHeroList[i].id;

        //     this._heroAllBlood += DLocal.GetCfgData("tfyingxiong")[heroId].yx_hp;
        //     // if (this._battleHeroMap[heroId]) {
        //     //     this._heroAllBlood += DLocal.GetCfgData("tfyingxiong")[heroId].yx_hp;
        //     // } else {
        //     //     this._heroAllBlood += DLocal.GetCfgData("tfyingxiong")[heroId].yx_hp * 0.5;
        //     // }
        // }
        // this._heroAllBlood += this._warshipBlood;

    }

    // 更新血条
    updateBlood() {
        let nowBlood = Math.ceil(this._playerNowBlood);
        let percent = nowBlood / this._heroAllBlood;
        this.labPlayerHp.string = "HP:" + nowBlood;
        this.pbPlayer.progress = percent;
    }

    // 飘血伤害
    setWarshipHurt(blood) {
        let labWarship = null;
        if (this._warshipHurtList.length > 0) {
            let nodeWarship = this._warshipHurtList.pop();
            labWarship = nodeWarship.getComponent(cc.Label);
        } else {
            let nodeWarship = cc.instantiate(this.labWarshipHurt.node);
            labWarship = nodeWarship.getComponent(cc.Label);
        }
        labWarship.node.parent = this.nodeWarship;
        labWarship.string = "-" + blood;
        labWarship.node.position = cc.v3(0, 0);
        cc.tween(labWarship.node)
            .to(0.15, { opacity: 255 })
            .by(0.4, { position: cc.v3(0, 50, 10) })
            .to(0.6, { opacity: 0 })
            .call(() => {
                if (!this || !this.node) {
                    return;
                }
                if (labWarship) {
                    this._warshipHurtList.push(labWarship);
                    labWarship.node.removeFromParent();
                }
            })
            .start()
    }

    // 移除战舰上飘的伤害
    removeWarshipHurt() {
        for (let i = 0; i < this.nodeWarship.childrenCount; i++) {
            let item = this.nodeWarship.children[i];
            cc.Tween.stopAllByTarget(item);
            this._warshipHurtList.push(item);
        }
        for (let i = 0; i < this._warshipHurtList.length; i++) {
            if (this._warshipHurtList[i].parent) {
                this._warshipHurtList[i].removeFromParent();
            }
        }
    }

    // 上阵英雄引起血量变化
    goBattleHeroUpdateBloodWithId(heroId) {
        // this.addPlayerBlood(heroId);
        this.getTotalBlood();
        this.updateBlood();
    }

    // 怪物伤害英雄更新血条
    hurtHeroUpdateBlood(hurt) {

        this.setWarshipHurt(hurt);
        this._playerNowBlood -= hurt;
        // this.getTotalBlood();
        this.updateBlood();
        if (this._playerNowBlood <= 0) {
            console.log("-------------- 英雄死亡");

            this._isBattleEnd = true;
            if (this._isCopyBattle == false) {
                UIManager.ShowForm(UIPath.UIBattleResults, false, this._nowGameLevel, []);
            } else {
                UIManager.ShowForm(UIPath.UIBattleCopyResults, false, []);
            }
            UIManager.CloseForm(UIPath.UIBattleHeroInfo);
            UIManager.CloseForm(UIPath.UIBattleQuit);

            let monsterArr = [];
            for (let i = 0; i < this.nodeMonsterBirth.childrenCount; i++) {
                if (this.nodeMonsterBirth.children[i]) {
                    monsterArr.push(this.nodeMonsterBirth.children[i]);
                }
            }
            for (let i = 0; i < monsterArr.length; i++) {
                if (monsterArr[i]) {
                    monsterArr[i].destroy();
                }
            }

            let skillArr = [];
            for (let i = 0; i < this.nodeSkill.childrenCount; i++) {
                if (this.nodeSkill.children[i]) {
                    skillArr.push(this.nodeSkill.children[i]);
                }
            }
            for (let i = 0; i < skillArr.length; i++) {
                if (skillArr[i]) {
                    skillArr[i].destroy();
                }
            }
            this._monsterBattleArr = {};

            if (this._delayTimer) {
                clearTimeout(this._delayTimer);
                this._delayTimer = null;
            }
            let levelCfg = DLocal.GetCfgData("zongguanqia")[this._nowGameLevel]; // 第几章节数据
            let totalWaveCount = levelCfg.gq_id_last - levelCfg.gq_id_first + 2;
            this._waveIdx = totalWaveCount;
        }
    }

    // 失败清理所有的怪物


    // 当前波数
    updateWaveCount() {
        this.labTitle.string = "波数\n" + this._waveIdx;
    }

    // 显示boss血条
    showBossBlood() {
        this.nodeBoss.active = true;
        this.pbBoss.progress = 1;
    }

    // 隐藏boss血条
    hideBossBlood() {
        this.nodeBoss.active = false;
    }

    // 更新boss血条
    updateBossBlood(bossBloodPrecent) {
        if (this.nodeBoss.active != true) {
            this.nodeBoss.active = true;
        }
        this.pbBoss.progress = bossBloodPrecent;
    }

    // 打开当前位置
    openNowPos(index) {
        if (this.heroAnimArr.length <= index) {
            return;
        }
        this.heroAnimArr[index].active = false;
        this.lockArr[index].active = false;
    }

    // 随机英雄
    randomHero(heroArr) {

        let nowRandomArr = [];
        for (let i = 0; i < this._haveHeroList.length; i++) {
            let heroId = this._haveHeroList[i].id;
            if (!heroArr[heroId]) {
                let heroCfg1 = DLocal.GetCfgData("tfyingxiong")[heroId];
                if (this._heroStarMap[heroCfg1.yx_type] && this._heroStarMap[heroCfg1.yx_type] == this._maxStar) {
                } else {
                    nowRandomArr.push(heroId);
                }
            }
        }
        let idx = Utils.getRandomInt(0, nowRandomArr.length - 1);
        let heroId = nowRandomArr[idx];

        let heroCfg = DLocal.GetCfgData("tfyingxiong")[heroId];
        return heroCfg;

    }

    // 随机出可选英雄
    randomHeroSelect() {

        this._selectHero = [];
        let heroArr = {};
        for (let i = 0; i < this.heroCardArr.length; i++) {
            let heroCfg = this.randomHero(heroArr);
            let heroType = heroCfg.yx_type;
            this.heroCardArr[i].node.active = true;
            this._selectHero.push(heroCfg.yxid)
            heroArr[heroCfg.yxid] = true;
            Utils.LoadRes("ui/heroIcon/x" + heroType, this, (spriteFrame: any) => {
                this.heroCardArr[i].spriteFrame = spriteFrame;
            }, cc.SpriteFrame);

            Utils.loadImg("ui/common/sd2_bg_dilv_" + heroCfg.yx_pj, (spriteFrame: any) => {
                this.bgHeroCardArr[i].spriteFrame = spriteFrame;
            });
        }
    }

    // 重置随机英雄
    setRandomHero() {
        this._selectHero = [];

        for (let i = 0; i < this.heroCardArr.length; i++) {
            this.heroCardArr[i].spriteFrame = null;

            Utils.loadImg("ui/common/sd2_bg_di3", (spriteFrame: any) => {
                this.bgHeroCardArr[i].spriteFrame = spriteFrame;
            });
        }
    }

    // 重置可选择的英雄
    resetSelectHero() {
        for (let i = 0; i < this.heroCardArr.length; i++) {
            this.heroCardArr[i].node.active = false;
        }
    }

    // 获取当前上阵位置
    getHeroPosWithHeroId(heroId) {
        if (this._battleHeroMap[heroId]) {
            return this._battleHeroMap[heroId];
        }
        for (let i = 0; i < this.heroAnimArr.length; i++) {
            if (this._unlockIndex >= i && this.heroAnimArr[i].active == false) {
                return this.heroAnimArr[i];
            }
        }
        UIManager.ShowForm(UIPath.UIFlyTip, "没有站位");
    }

    // 设置英雄星级和战斗力
    setHeroStarAndBattle(heroType, heroId) {
        for (let i = 0; i < this.heroAnimArr.length; i++) {
            if (this.heroAnimArr[i].childrenCount > 0) {
                let hero = this.heroAnimArr[i].children[0].getComponent("Hero");
                if (hero.getHeroType() == heroType) {

                    let star = this._heroStarMap[heroType];
                    if (!star) {
                        star = 0;
                    }
                    star++;

                    this._heroStarMap[heroType] = star;
                    hero.setBattleWithStar(star);
                    if (this.heroStarArr[i].node.active != true) {
                        this.heroStarArr[i].node.active = true;
                    }
                    if (this.heroClickArr[i].active != true) {
                        this.heroClickArr[i].active = true;
                        this.heroClickArr[i].getComponent(cc.Button).clickEvents[0].customEventData = heroId;
                    }

                    Utils.loadImg("ui/battle/yxxx_icon_star" + star, (spriteframe) => {
                        this.heroStarArr[i].spriteFrame = spriteframe;
                    })
                    break;
                }
            }
        }
    }

    // 加载上阵英雄
    loadHeroWithHeroId(heroId, posNode, loadCallback) {

        let heroCfg = DLocal.GetCfgData("tfyingxiong")[heroId];
        let resPath = "spine/hero/" + heroCfg.yx_type;
        if (posNode.children.length <= 0) {
            let createHeroFunc = () => {
                Utils.LoadPrefab(resPath, this, (prefab: any) => {
                    // posNode.removeAllChildren();
                    prefab.parent = posNode;
                    let hero = prefab.getComponent("Hero");
                    hero.playStand();
                    hero.setAttackTime(heroCfg.cost_time);
                    hero.setBattleCtr(this, heroCfg.yx_type, heroCfg.yxid);
                    hero.setHeroBloodAndAttack(heroCfg.yx_hp, heroCfg.yx_attack1);
                    hero.setSkillAndMonsterNode(this.nodeSkill, this.nodeMonsterBirth);
                    this.setHeroStarAndBattle(heroCfg.yx_type, heroCfg.yxid);
                    hero.setStartAttack();

                    if (loadCallback) {
                        loadCallback();
                    }
                });
            }
            posNode.active = true;
            if (!this._heroWork) {
                Utils.LoadPrefab("spine/other/heroWork", this, (insSkill: any) => {
                    this._heroWork = insSkill;
                    insSkill.parent = posNode.parent;
                    insSkill.position = cc.v3(posNode.x + 5, posNode.y + 8);
                    let skeleton = insSkill.getComponent(sp.Skeleton);
                    skeleton.timeScale = 1.5;
                    let animName = skeleton.animation;
                    skeleton.setAnimation(0, animName, false);
                    skeleton.setCompleteListener(() => {
                        insSkill.removeFromParent();
                    });

                    if (createHeroFunc) {
                        createHeroFunc();
                    }
                });
            } else {
                this._heroWork.parent = posNode.parent;
                let skeleton = this._heroWork.getComponent(sp.Skeleton);
                skeleton.timeScale = 1.5;
                let animName = skeleton.animation;
                this._heroWork.position = cc.v3(posNode.x + 5, posNode.y + 8);
                skeleton.setAnimation(0, animName, false);
                skeleton.setCompleteListener(() => {
                    this._heroWork.removeFromParent();
                });
                if (createHeroFunc) {
                    createHeroFunc();
                }
            }
        } else {
            // 加载星星
            console.log("------------- 升级星星")
            if (!this._heroUpGrade) {
                Utils.LoadPrefab("spine/other/heroUpGrade", this, (insSkill: any) => {
                    this._heroUpGrade = insSkill;
                    insSkill.parent = posNode;
                    let skeleton = insSkill.getComponent(sp.Skeleton);
                    let animName = skeleton.animation;
                    skeleton.setAnimation(0, animName, false);
                    skeleton.setCompleteListener(() => {
                        insSkill.removeFromParent();
                    });
                });
            } else {
                this._heroUpGrade.parent = posNode;
                let skeleton = this._heroUpGrade.getComponent(sp.Skeleton);
                let animName = skeleton.animation;
                skeleton.setAnimation(0, animName, false);
                skeleton.setCompleteListener(() => {
                    this._heroUpGrade.removeFromParent();
                });
            }
            if (this._heroStarMap[heroId]) {
                let star = this._heroStarMap[heroId];
                this._heroStarMap[heroId] = (star + 1);
            } else {
                this._heroStarMap[heroId] = 1;
            }
            if (this._maxStar < this._heroStarMap[heroId]) {
                this._heroStarMap[heroId] = this._maxStar;
            }
            this.setHeroStarAndBattle(heroCfg.yx_type, heroCfg.yxid);
        }

    }

    // 创建怪物
    creatorWaveMonster() {
        this.createMonster();

        this.updateWaveCount();
    }

    // 根据出怪时间间隔
    waveMonsterWithTime() {
        let levelCfg = DLocal.GetCfgData("zongguanqia")[this._nowGameLevel]; // 第几章节数据
        let firstWave = levelCfg.gq_id_first; // 第一波
        let lastWave = levelCfg.gq_id_last; // 最后一波

        if (this._waveIdx == 0) {
            this.hideBossBlood();
        }
        if (this._isBattleEnd == true) {
            return;
        }

        if ((lastWave - firstWave + 1) <= this._waveIdx) {
            return;
        }
        console.log("---------------- 路口1")
        let levelId = firstWave + this._waveIdx;
        let waveCfg = DLocal.GetCfgData("guanqia")[levelId]; // 第几波
        if (waveCfg.cg_jiange == 0) {
            this.creatorWaveMonster();
            this.waveMonsterWithTime();
        } else {

            if (!this._delayTimer) {
                this._delayTimer = setTimeout(() => {
                    if (!this || !this.node) {
                        return;
                    }
                    if (this._isBattleEnd == true) {
                        return;
                    }
                    this._delayTimer = null;
                    this.creatorWaveMonster();
                    this.waveMonsterWithTime();

                }, waveCfg.cg_jiange * 1000);
            }
        }

    }

    // 移除生成的怪物
    destroyMonster(monsterid, monster) {

        monster.removeFromParent();
        if (!this._monsterBattleArr[monsterid]) {
            return;
        }
        for (let i = 0; i < this._monsterBattleArr[monsterid].length; i++) {

            if (this._monsterBattleArr[monsterid][i] == monster) {
                this._monsterBattleArr[monsterid].splice(i, 0);
                break;
            }
        }
        if (!this._monsterLowerArr[monsterid]) {
            this._monsterLowerArr[monsterid] = [];
        }
        this._monsterLowerArr[monsterid].push(monster);
    }

    // 生成怪物
    createMonster() {
        let totalLevelCfg = DLocal.GetCfgData("zongguanqia")[this._nowGameLevel];
        let firstWave = totalLevelCfg.gq_id_first; // 第一波
        let lastWave = totalLevelCfg.gq_id_last; // 最后一波
        let waveFunc = (nowWaveCount) => {
            let levelCfg = DLocal.GetCfgData("guanqia")[nowWaveCount];
            if (nowWaveCount < lastWave || levelCfg.guanqia == 1) { // 小怪物
                let monsterCount2 = Utils.getRandomInt(levelCfg.guai02_min, levelCfg.guai02_max);
                let monsterCount1 = Utils.getRandomInt(levelCfg.guai01_min, levelCfg.guai01_max);
                this.monster(levelCfg.guai01_id, levelCfg.guai01_gjjg, monsterCount1, levelCfg.guai01_atk_fw, levelCfg.guai01_hp, levelCfg.guai01_atk, levelCfg.add01_num, levelCfg.guai01_ys, () => {
                    this.monster(levelCfg.guai02_id, levelCfg.guai02_gjjg, monsterCount2, levelCfg.guai02_atk_fw, levelCfg.guai02_hp, levelCfg.guai02_atk, levelCfg.add02_num, levelCfg.guai02_ys);
                    this._waveLoadingIdx++;
                });
                this._waveIdx++;
            } else if (nowWaveCount == lastWave) { // boss

                if (levelCfg.guai01_id) {
                    let monsterCount1 = Utils.getRandomInt(levelCfg.guai01_min, levelCfg.guai01_max);
                    this.monster(levelCfg.guai01_id, levelCfg.guai01_gjjg, monsterCount1, levelCfg.guai01_atk_fw, levelCfg.guai01_hp, levelCfg.guai01_atk, levelCfg.add01_num, levelCfg.guai01_ys, () => {
                        this.monster(levelCfg.boss_id, levelCfg.boss_gjjg, 1, levelCfg.boss_atk_fw, levelCfg.boss_hp, levelCfg.boss_atk, levelCfg.add03_num, levelCfg.boss_ys, () => {
                            this.showBossBlood();
                            this._waveLoadingIdx++;
                        }, true);
                    });
                }
                if (levelCfg.guai02_id) {
                    let monsterCount2 = Utils.getRandomInt(levelCfg.guai02_min, levelCfg.guai02_max);
                    this.monster(levelCfg.guai02_id, levelCfg.guai02_gjjg, monsterCount2, levelCfg.guai02_atk_fw, levelCfg.guai02_hp, levelCfg.guai02_atk, levelCfg.add02_num, levelCfg.guai02_ys);
                }
                this._waveIdx++;
            }
        }
        let startLevelId = firstWave + this._waveIdx;
        waveFunc(startLevelId);
    }

    monster(monsterid, attackTime, monsterCount, attackState, monsterHp, monsterAttack, monsterRewardCount, monsterSpeed, finishFunc = null, isBoss = false) {
        let resPath = "spine/monster/" + monsterid;
        let loadCount = monsterCount;

        let monsterBulletId = 0;
        if (isBoss == true) {
            monsterBulletId = this._bossBulletId;
        } else {
            monsterBulletId = this._monsterBulletId;
        }
        let skillPath = "spine/bullets/" + monsterBulletId;
        let initMonsterFunc = (insMonster) => {
            if (!this._monsterBattleArr[monsterid]) {
                this._monsterBattleArr[monsterid] = [];
            }
            this._monsterBattleArr[monsterid].push(insMonster);

            let randonX = Utils.getRandomInt(-192, 192);
            this._monsterZIndex--;
            insMonster.zIndex = this._monsterZIndex;
            insMonster.parent = this.nodeMonsterBirth;
            insMonster.x = randonX;
            let monster = insMonster.getComponent("Monster");
            monster.playStand();
            monster.setBattleCtr(this, monsterid, insMonster, isBoss, monsterRewardCount, monsterSpeed, monsterAttack);
            monster.setAttackTime(attackTime);
            monster.initBloodAndHurt(monsterHp);
            monster.setAttackState(attackState, (nowMonsterAttack) => {

                if (attackState == 0) {// 近战
                    monster.playAttack(() => {
                        this.playwarShip("hit");
                        if (this.getTotalShieldBlood() > 0) {
                            this.setShieldBlood(nowMonsterAttack);
                        } else {
                            this.hurtHeroUpdateBlood(nowMonsterAttack);
                        }
                    });
                } else {
                    if (this._bulleLowerArr[monsterBulletId] && this._bulleLowerArr[monsterBulletId].length > 0) {
                        let insSkill = this.getBullet(monsterBulletId);
                        let heroTargetPos = monster.getHeroTagetPos();
                        this.monsterHit(insSkill, insMonster, nowMonsterAttack, heroTargetPos);
                    } else {
                        ResourceLoader.load(skillPath, (err, prefab: any) => {
                            if (err) {
                                console.error(skillPath)
                                console.error(err)
                                return;
                            }
                            let insSkill = cc.instantiate(prefab);
                            let heroTargetPos = monster.getHeroTagetPos();
                            this.monsterHit(insSkill, insMonster, nowMonsterAttack, heroTargetPos);
                        })
                    }
                }
            });
            loadCount--;
            if (loadCount > 0) {

                let delayTime = Utils.getRandomInt(700, 1400); // 怪物间隔
                setTimeout(() => {
                    if (!this || !this.node) {
                        return;
                    }
                    loadMonsterFunc();
                }, delayTime);
            } else {
                if (finishFunc) {
                    finishFunc();
                }
            };
        }

        let loadMonsterFunc = () => {
            let monsterArr = this._monsterLowerArr[monsterid];
            if (monsterArr && monsterArr.length > 0) {
                let insMonster = monsterArr.pop();
                this.createTransmit((transmit) => {
                    initMonsterFunc(insMonster);
                    transmit.position = insMonster.position;
                })

            } else {
                ResourceLoader.load(resPath, (err, prefab: any) => {
                    if (err) {
                        console.log(resPath)
                        console.log(err)
                        return
                    }
                    let insMonster = cc.instantiate(prefab);
                    this.createTransmit((transmit) => {
                        initMonsterFunc(insMonster);
                        transmit.position = insMonster.position;
                    })
                });
            }
        }
        loadMonsterFunc();
    }

    // 生成传送阵
    createTransmit(callback) {

        if (this._transmitArr.length > 0) {
            let insMonster = this._transmitArr.pop();

            // insMonster.position = pos;
            insMonster.name = "transmit"
            insMonster.parent = this.nodeSilver;
            let skeleton = insMonster.getChildByName("nodeMonster").getComponent(sp.Skeleton);
            skeleton.setAnimation(0, 'animation', false);
            skeleton.setCompleteListener(() => {
                insMonster.removeFromParent();
                this._transmitArr.push(insMonster);
            });
            if (callback) {
                callback(insMonster);
            }

        } else {
            ResourceLoader.load("spine/other/transmit", (err, prefab: any) => {

                if (err) {
                    console.log(err)
                    return
                }
                let insMonster = cc.instantiate(prefab);
                // insMonster.position = pos;
                insMonster.name = "transmit"
                insMonster.parent = this.nodeSilver;
                let skeleton = insMonster.getChildByName("nodeMonster").getComponent(sp.Skeleton);
                skeleton.setAnimation(0, 'animation', false);
                skeleton.setCompleteListener(() => {
                    insMonster.removeFromParent();
                    this._transmitArr.push(insMonster);
                });

                if (callback) {
                    callback(insMonster);
                }
            });
        }
    }

    // 怪物攻击运动以及表现
    monsterHit(insSkill, insMonster, monsterAttack, heroTargetPos) {
        if (this._playerNowBlood <= 0) {
            return;
        }
        insSkill.parent = this.nodeSkill;
        // insSkill.position = monster.position;
        insSkill.position = insMonster.position;
        insSkill.angle = 0;
        let targetEndPos = heroTargetPos;
        let time = (insMonster.y - targetEndPos) / 300;
        cc.tween(insSkill)
            .to(time, { position: cc.v3(insMonster.x, targetEndPos) })
            .call(() => {
                if (!this || !this.node) {
                    return;
                }
                this.playwarShip("hit");
                // insSkill.destroy();
                insSkill.removeFromParent();
                this.recoveryBullet(insSkill.name, insSkill);
                if (this.getTotalShieldBlood() > 0) {
                    this.setShieldBlood(monsterAttack);
                } else {
                    this.hurtHeroUpdateBlood(monsterAttack);
                }
                AudioMgr.playEffect(MusicPath.WARSHIPATTACK);
            })
            .start();
    }

    // 更新怪物波数
    updateMonsterWaveFunc() {
        if (this._isBattleEnd == true) {
            return;
        }
        let levelCfg = DLocal.GetCfgData("zongguanqia")[this._nowGameLevel]; // 第几章节数据
        let totalWaveCount = levelCfg.gq_id_last - levelCfg.gq_id_first + 1;
        if (this._waveLoadingIdx < this._waveIdx || this.nodeMonsterBirth.childrenCount > 0) {

            console.log(this.nodeMonsterBirth.childrenCount);
            for (let i = 0; i < this.nodeMonsterBirth.childrenCount; i++) {
                console.log(this.nodeMonsterBirth.children[i].name);
            }
            console.log("没有加载完");
            return;
        }
        if (this._waveIdx >= totalWaveCount) {
            console.log("---------------胜利-------------")

            // this._waveIdx = 0;
            this.initRefreshAndUp();
            this._isBattleEnd = true;
            UIManager.CloseForm(UIPath.UIBattleHeroInfo);
            UIManager.CloseForm(UIPath.UIBattleQuit);

            if (this._settlementTimer) {
                clearTimeout(this._settlementTimer);
                this._settlementTimer = null;
            }
            if (this._isCopyBattle == false) { // 不是副本战斗
                this._settlementTimer = setTimeout(() => {
                    if (!this || !this.node) {
                        return;
                    }
                    this._settlementTimer = null;
                    let view = UIManager.isOpenViewByName(UIPath.UIBattleResults);
                    if (view) {
                        return;
                    }
                    let rewardList = this.calculateReward();
                    UIManager.ShowForm(UIPath.UIBattleResults, true, this._nowGameLevel, rewardList);
                    DLocal.setAllLevelReward(this._nowGameLevel);
                    this._nowGameLevel = levelCfg.next_id;
                    if (this._nowGameLevel) {
                        let levelType = DLocal.GetCfgData("zongguanqia")[this._nowGameLevel].gq_zs;
                        if (levelType == 1) { // 普通
                            DLocal.setSaveLevelData(this._nowGameLevel);
                        } else if (levelType == 2) { // 精英
                            DLocal.setSaveEliteLevel(this._nowGameLevel);
                        } else if (levelType == 3) { // 困难
                            DLocal.setSaveDifficultyLevel(this._nowGameLevel);
                        }
                    }
                }, 2600);
            } else { // 副本战斗
                let view = UIManager.isOpenViewByName(UIPath.UIBattleCopyResults);
                if (view) {
                    return;
                }
                let rewardList = this.copyReward();
                let copyNum = DLocal.getCopySLNum();
                if (copyNum > 0) {
                    DLocal.setCopySLNum(copyNum - 1);
                }
                GameEvent.dispatchEvent(Msg.UPDATE_COPY_COUNT);
                this._settlementTimer = setTimeout(() => {
                    if (!this || !this.node) {
                        return;
                    }
                    let view = UIManager.isOpenViewByName(UIPath.UIBattleCopyResults);
                    if (view) {
                        return;
                    }
                    this._settlementTimer = null;
                    UIManager.ShowForm(UIPath.UIBattleCopyResults, true, rewardList);
                }, 2600);

            }
            if (this._delayTimer) {
                clearTimeout(this._delayTimer);
                this._delayTimer = null;
            }
        } else {
            if (this._delayTimer) {
                clearTimeout(this._delayTimer);
                this._delayTimer = null;
            }
            console.log("---------------- 路口2")
            this.creatorWaveMonster();
            this.waveMonsterWithTime();
        }
    }

    // 回收子弹
    recoveryBullet(bulleId, insbulle) {
        if (!this._bulleLowerArr[bulleId]) {
            this._bulleLowerArr[bulleId] = [];
        }
        this._bulleLowerArr[bulleId].push(insbulle);
    }

    // 获取子弹
    getBullet(bulleId) {
        if (!this._bulleLowerArr[bulleId] || this._bulleLowerArr[bulleId].length == 0) {
            return;
        }
        return this._bulleLowerArr[bulleId].pop();
    }

    // 计算过关奖励（普通战斗）
    calculateReward() {

        let rewardList = [];
        let isRecv = DLocal.getLevelReward(this._nowGameLevel);
        let zongguanqiaCfg = DLocal.GetCfgData("zongguanqia")[this._nowGameLevel];
        rewardList.push({ "id": zongguanqiaCfg.cg_type, "count": zongguanqiaCfg.cg_num, "rewardType": RewardType.currency });
        if (!isRecv) {
            rewardList.push({ "id": zongguanqiaCfg.st_type, "count": zongguanqiaCfg.st_num, "rewardType": RewardType.currency });
        }
        let total = 0;
        let changeList = [];
        let gqjiangliCfg = DLocal.GetCfgData("gqjiangli");
        for (let i = zongguanqiaCfg.zxjl_cid; i <= zongguanqiaCfg.zxjl_mid; i++) {
            let maxCount = total + gqjiangliCfg[i].cgqz * 10;
            changeList.push({ "id": i, "max": maxCount, "min": total })
            total = maxCount;
        }
        let allOneLevelHeroList = DLocal.getAllOneLevelHero();
        for (let z = 0; z < zongguanqiaCfg.sy_type2; z++) {
            let random = Utils.getRandomInt(1, 1000);
            for (let i = 0; i < changeList.length; i++) {
                if (changeList[i].min <= random && changeList[i].max > random) {
                    let levelRewardCfg = gqjiangliCfg[changeList[i].id];
                    let heroCount = Utils.getRandomInt(levelRewardCfg.yxmin_num, levelRewardCfg.yxmax_num);
                    let equalQualityHeroList = [];
                    for (let j = 0; j < allOneLevelHeroList.length; j++) {
                        if (allOneLevelHeroList[j].yx_pj == levelRewardCfg.yxpj) {
                            equalQualityHeroList.push(allOneLevelHeroList[j]);
                        }
                    }
                    let heroIdx = Utils.getRandomInt(0, equalQualityHeroList.length - 1);
                    rewardList.push({ "id": equalQualityHeroList[heroIdx].yxid, "count": heroCount, "rewardType": RewardType.Hero });
                    break;
                }
            }
        }
        return rewardList;
    }

    // 过关奖励 （副本）
    copyReward() {

        let rewardList = [];

        let zongguanqiaCfg = DLocal.GetCfgData("zongguanqia")[this._nowGameLevel];
        rewardList.push({ "id": zongguanqiaCfg.fb_cgjl1, "count": zongguanqiaCfg.god_num, "rewardType": RewardType.currency });
        rewardList.push({ "id": zongguanqiaCfg.fb_cgjl2, "count": zongguanqiaCfg.zs_num, "rewardType": RewardType.currency });

        let total = 0;
        let changeList = [];
        let gqjiangliCfg = DLocal.GetCfgData("gqjiangli");
        for (let i = zongguanqiaCfg.fbjl_cid; i <= zongguanqiaCfg.fbjl_mid; i++) {
            let maxCount = total + gqjiangliCfg[i].cgqz * 10;
            changeList.push({ "id": i, "max": maxCount, "min": total })
            total = maxCount;
        }
        let allOneLevelHeroList = DLocal.getAllOneLevelHero();
        for (let z = 0; z < zongguanqiaCfg.fb_cgjl3_num; z++) {
            let random = Utils.getRandomInt(1, 1000);
            for (let i = 0; i < changeList.length; i++) {
                if (changeList[i].min <= random && changeList[i].max > random) {
                    let levelRewardCfg = gqjiangliCfg[changeList[i].id];
                    let heroCount = Utils.getRandomInt(levelRewardCfg.yxmin_num, levelRewardCfg.yxmax_num);
                    let equalQualityHeroList = [];
                    for (let j = 0; j < allOneLevelHeroList.length; j++) {
                        if (allOneLevelHeroList[j].yx_pj == levelRewardCfg.yxpj) {
                            equalQualityHeroList.push(allOneLevelHeroList[j]);
                        }
                    }
                    let heroIdx = Utils.getRandomInt(0, equalQualityHeroList.length - 1);
                    rewardList.push({ "id": equalQualityHeroList[heroIdx].yxid, "count": heroCount, "rewardType": RewardType.Hero });
                    break;
                }
            }
        }
        return rewardList;
    }

    // 初始刷新和升级消耗
    initRefreshAndUp() {
        let zhandouCfg = DLocal.GetCfgData("zhandou");
        this._silverNum = zhandouCfg[1].gold_cs;
        this._refreshConsume = zhandouCfg[1].gold_csxh;
        this._nowWarshipLevel = 1; // 战舰等级
        this._warshipConsume = zhandouCfg[1].jzsj_xh;
        this.labUnLockCost.string = zhandouCfg[1].jzsj_xh;
        this.labRefreshCost.string = "" + this._refreshConsume;
        this.updateSliver();
    }

    // 更新战斗中获取的银币
    updateSliver() {
        this.labGold.string = "" + this._silverNum;
    }

    // 英雄刷新 添加消耗
    addHeroRefreshConsume() {
        let zhandouCfg = DLocal.GetCfgData("zhandou");
        let dataCfg = zhandouCfg[1];
        if (this._refreshConsume + dataCfg.gold_xhdz <= dataCfg.gold_xhmax) {
            this._refreshConsume += dataCfg.gold_xhdz;
        }
    }

    //英雄刷新 刷新消耗
    isHeroRefreshConsume() {
        if (this._refreshConsume > this._silverNum) {
            return false;
        }
        return true;
    }

    // 更新英雄刷新消耗字体颜色
    updateHeroConsumeColor() {
        let isHeroRefresh1 = this.isHeroRefreshConsume();
        if (isHeroRefresh1 == true) {
            this.labRefreshCost.node.color = cc.color(255, 255, 255);
        } else {
            this.labRefreshCost.node.color = cc.color(255, 0, 0);
        }
    }

    // 更新战舰升级消耗字体颜色
    updateAirshipConsumeColor() {
        let isCanConsume = this.isUpgradeConsume();
        if (isCanConsume == true) {
            this.labUnLockCost.node.color = cc.color(255, 255, 255);
        } else {
            this.labUnLockCost.node.color = cc.color(255, 0, 0);
        }
    }

    // 判断战舰消耗是否足够的银币
    isUpgradeConsume() {
        if (this._warshipConsume > this._silverNum) {
            return false;
        }
        return true;
    }

    // 判断是否满级
    isAirshipFullLevel() {
        let zhandouCfg = DLocal.GetCfgData("zhandou");
        let dataCfg = zhandouCfg[this._nowWarshipLevel];
        if (dataCfg.jzsj_xh != 0) {
            return false;
        } else {
            return true;
        }
    }

    // 战舰升级消耗
    addAirshipConsume() {

        this._nowWarshipLevel++;
        let zhandouCfg = DLocal.GetCfgData("zhandou");
        let dataCfg = zhandouCfg[this._nowWarshipLevel];
        if (dataCfg.jzsj_xh != 0) {
            this._warshipConsume = dataCfg.jzsj_xh;
        }
    }

    // 英雄飘伤害
    monsterHurtNumber(hurtPos, hurtNum, isCriticalHit) {
        // labMonsterHurt
        let damageCount = Math.floor(hurtNum);
        let nodeHurt = this._monsterHurtArr.pop();
        if (nodeHurt) {
            nodeHurt.position = hurtPos;
            this.monsterHurtAction(nodeHurt, damageCount, isCriticalHit);
        } else {
            let nodeHurt = cc.instantiate(this.labMonsterHurt);
            // silverNode.removeFromParent();
            nodeHurt.parent = this.nodeSilver;
            nodeHurt.zIndex = 100;
            nodeHurt.position = hurtPos;

            this.monsterHurtAction(nodeHurt, damageCount, isCriticalHit);
        }

    }

    // 怪物飘血动画
    monsterHurtAction(nodeHurt, hurtNum, isCriticalHit) {
        let labHurt = nodeHurt.getChildByName("labHurt").getComponent(cc.Label);
        nodeHurt.active = true;
        labHurt.string = hurtNum;
        labHurt.node.pauseAllActions();
        let signHit = nodeHurt.getChildByName("imgCriticalhit");
        if (isCriticalHit == true) {
            nodeHurt.scale = 1.3;
            labHurt.font = this.criticalAtlas;

            // let count = 0;
            // let numFunc = (num) => {
            //     count++;
            //     let remainNum = Math.floor(num / 10);
            //     if (remainNum > 0) {
            //         numFunc(remainNum);
            //     }
            // }
            // numFunc(hurtNum);
            // signHit.x = -(count * 10.5 + 10);
            signHit.active = true;
        } else {
            nodeHurt.scale = 1;
            signHit.active = false;
            labHurt.font = this.generalAtlas;
        }

        cc.tween(nodeHurt)
            .to(0.15, { opacity: 255 })
            .by(0.4, { position: cc.v3(0, 50, 10) })
            .to(0.6, { opacity: 0 })
            .call(() => {
                if (!this || !this.node) {
                    return;
                }
                if (nodeHurt) {
                    this._monsterHurtArr.push(nodeHurt);
                    nodeHurt.active = false;
                }
            })
            .start()
    }

    // 打怪掉落银币
    dropSilver(silverPos, silverNum, isBoss) {
        // 银币动画
        let silverNode = this._silverArr.pop();
        if (!silverNode) {
            silverNode = cc.instantiate(this.silvercoin);
        }
        silverNode.parent = this.nodeSilver;
        silverNode.position = silverPos;
        let skeleton = silverNode.getComponent(sp.Skeleton);
        let animName = skeleton.animation;
        skeleton.setAnimation(0, animName, false);

        skeleton.setCompleteListener(() => {
            silverNode.removeFromParent();
            this._silverArr.push(silverNode);
        });
        // 怪物死亡动画
        let monsterAnmiNode = this._monsterAnmiArr.pop();
        if (!monsterAnmiNode) {
            monsterAnmiNode = cc.instantiate(this.monsterDie);
        }
        monsterAnmiNode.parent = this.nodeSilver;
        monsterAnmiNode.position = silverPos;
        let monsterSkeleton = monsterAnmiNode.getComponent(sp.Skeleton);
        let monsterAnimName = "";
        if (isBoss == true) {
            monsterAnimName = "animation2";
            monsterSkeleton.timeScale = 0.4;
        } else {
            monsterAnimName = "animation";
            monsterSkeleton.timeScale = 1;
        }
        monsterSkeleton.setAnimation(0, monsterAnimName, false);
        monsterSkeleton.setCompleteListener(() => {
            monsterAnmiNode.removeFromParent();
            this._monsterAnmiArr.push(monsterAnmiNode);
        });
        this._silverNum += silverNum;
        this.updateSliver();
        this.updateHeroConsumeColor();
        this.updateAirshipConsumeColor();
    }

    // 删除英雄
    deleteBattleHeroFunc(heroId) {

        let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[heroId];
        this._heroStarMap[heroItemCfg.yx_type] = 0;
        let parent = this._battleHeroMap[heroId];
        if (parent) {
            parent.children[0].getComponent("Hero").deleteHero();
            for (let i = 0; i < parent.childrenCount; i++) {
                parent.children[i].removeFromParent();
            }
        }
        for (let i = 0; i < this.heroAnimArr.length; i++) {
            if (this.heroAnimArr[i].childrenCount == 0) {
                this.heroAnimArr[i].active = false;
                this.heroStarArr[i].node.active = false;
                this.heroClickArr[i].active = false;
            }
        }
        this._battleHeroMap[heroId] = null;
        this.deleteSkillFetter(heroId);
        this.updateSkillFetter(false);
    }

    // 通过类型获得星星
    getStarWithHeroType(heroType) {
        return this._heroStarMap[heroType];
    }

    // 播放风之护盾
    playFZBL() {
        if (!this._fzblAnmi1) {
            Utils.LoadPrefab("spine/other/bloodAction", this, (insSkill: any) => {
                this._fzblAnmi1 = insSkill;
                insSkill.parent = this.nodeBloodAction;
                let skeleton = insSkill.getComponent(sp.Skeleton);
                let animName = skeleton.animation;
                skeleton.setAnimation(0, animName, true);
            });
        } else {
            if (!this._fzblAnmi1.parent) {
                this._fzblAnmi1.parent = this.nodeBloodAction;
            }
            let skeleton = this._fzblAnmi1.getComponent(sp.Skeleton);
            let animName = skeleton.animation;
            skeleton.setAnimation(0, animName, true);
        }

        if (!this._fzblAnmi2) {
            Utils.LoadPrefab("spine/skills/20011", this, (insSkill: any) => {
                this._fzblAnmi2 = insSkill;
                this._fzblAnmi2.scale = 1.25;
                insSkill.parent = this.nodeDown;
                insSkill.zIndex = 10;
                let skeleton = insSkill.getComponent(sp.Skeleton);
                let animName = skeleton.animation;
                skeleton.setAnimation(0, animName, true);
                insSkill.y = 210;
            });
        } else {

            if (!this._fzblAnmi2.parent) {
                this._fzblAnmi2.parent = this.nodeDown;
            }
            this._fzblAnmi2.zIndex = 10;
            let skeleton = this._fzblAnmi2.getComponent(sp.Skeleton);
            let animName = skeleton.animation;
            skeleton.setAnimation(0, animName, true);
            this._fzblAnmi2.y = 210;
        }
    }

    // 添加护盾加成
    addShield(data) {
        this._shieldValue = data.shield;
        // this.playwarShip("fzbl");
        // 风之壁垒
        this.playFZBL();
        this.loadShield();
    }

    // 删除护盾加成
    deleteShield() {
        this._shieldValue = 0;
        if (this._fzblAnmi1) {
            this._fzblAnmi1.getComponent(sp.Skeleton).clearTracks();
            this._fzblAnmi1.removeFromParent();
        }
        if (this._fzblAnmi2) {
            this._fzblAnmi2.getComponent(sp.Skeleton).clearTracks();
            this._fzblAnmi2.removeFromParent();
        }
        this.loadShield();
    }

    // 获得护盾血量加成
    getTotalShieldBlood() {
        return this._shieldValue;
    }

    // 扣的当前血量
    setShieldBlood(hurtValue) {
        this._shieldValue -= hurtValue;
        let shieldValue = this.getTotalShieldBlood();
        if (shieldValue > 0) {
            this.loadShield();
        } else {
            this.deleteShield();
        }
    }

    // 加载护盾值
    loadShield() {
        let shieldValue = this.getTotalShieldBlood();
        if (shieldValue > 0) {
            this.nodeShield.active = true;
            this.labShield.string = "" + shieldValue;
        } else {
            this.nodeShield.active = false;
        }
    }

    // 回血
    backBlood(blood) {
        this._playerNowBlood += blood;
        if (this._playerNowBlood > this._heroAllBlood) {
            this._playerNowBlood = this._heroAllBlood;
        }
        let nowBlood = Math.ceil(this._playerNowBlood);
        let percent = nowBlood / this._heroAllBlood;
        this.labPlayerHp.string = "HP:" + nowBlood;
        this.pbPlayer.progress = percent;
    }

    // 战舰动画
    playwarShip(animName) {
        this.spWarship.setAnimation(0, animName, false);
        // if ("wait" != animName) {
        //     this.spWarship.setCompleteListener(() => {
        //         this.spWarship.setAnimation(0, 'wait', false);
        //     });
        // }
    }

    // 通过技能id 获得技能特效
    getSkillAnmiWithId(skillid) {
        let allSkillAnmi = this._skillAnmiMap[skillid];
        if (allSkillAnmi && allSkillAnmi.length > 0) {
            for (let i = 0; i < allSkillAnmi.length; i++) {
                if (allSkillAnmi[i]) {
                    if (allSkillAnmi[i].parent == null && allSkillAnmi[i].name != "") {
                        let skillAnmi = allSkillAnmi[i];
                        allSkillAnmi.splice(i, 1);
                        return skillAnmi;
                    } else {
                        if (allSkillAnmi[i].name == "") {
                            allSkillAnmi.splice(i, 1);
                        }
                    }
                }
            }
        }
        return null;
    }

    // 把技能特效加到缓存
    addSkillAnmi(skillid, insSkill) {
        if (!this._skillAnmiMap[skillid]) {
            this._skillAnmiMap[skillid] = [];
        }
        this._skillAnmiMap[skillid].push(insSkill);
    }

    // 删除所有英雄
    deleteAllHero() {
        for (let i = 0; i < this.heroAnimArr.length; i++) {
            let item = this.heroAnimArr[i];
            for (let j = 0; j < item.childrenCount; j++) {
                item.children[j].destroy();
            }
        }
    }

    // 通知开始生成怪物
    updateMonsterStartFunc() {
        this.waveMonsterWithTime(); // 生成怪物
    }

    // 添加技能羁绊
    updateSkillFetter(isAddSkill = true) {
        let equalQualityMap = {};
        for (const key in this._battleHeroMap) {
            if (this._battleHeroMap[key]) {
                let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[key];
                if (equalQualityMap[heroItemCfg.yx_zy]) {
                    equalQualityMap[heroItemCfg.yx_zy] += 1;
                } else {
                    equalQualityMap[heroItemCfg.yx_zy] = 1;
                }
            }
        }

        for (const key in equalQualityMap) {
            let count = equalQualityMap[key];
            if (count && count >= 3) {
                let quality = Number(key);
                let yxjibanCfg = DLocal.GetCfgData("yxjiban");
                for (const id in yxjibanCfg) {
                    let skillItemCfg = yxjibanCfg[id];
                    if (skillItemCfg.zy_id == quality) {
                        let skillId = 0;
                        let iconId = 0;

                        if (count >= 5 && skillItemCfg.jh_sxsl == 5) {
                            skillId = skillItemCfg.jb_id;
                            iconId = skillItemCfg.jb_icon;
                        } else if (count >= 3 && count < 5 && skillItemCfg.jh_sxsl == 3) {
                            skillId = skillItemCfg.jb_id;
                            iconId = skillItemCfg.jb_icon;
                        }
                        if (iconId != 0) {
                            if (!this._fetterMap[quality] || this._fetterMap[quality] != skillId) {
                                if (this._fetterMap[quality] != skillId) {
                                    let skillName = this._fetterMap[quality] + "";
                                    let firstSkill = this.nodeFetter.getChildByName(skillName);
                                    if (firstSkill) {
                                        firstSkill.removeFromParent();

                                        let lastSkillId = this._fetterMap[quality];
                                        let heroSkillItemCfg = DLocal.GetCfgData("yingxiongjineng")[lastSkillId];
                                        if (heroSkillItemCfg.skill1_type == 2 && heroSkillItemCfg.skill_object == 2) {
                                            if (isAddSkill == true) {
                                                GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, { "id": lastSkillId, "add": -1 });
                                            }
                                        }
                                    }
                                }

                                this._fetterMap[quality] = skillId;
                                Utils.LoadPrefab("prefabs/fetter/" + iconId, this, (insSkill: any) => {
                                    insSkill.x = this.nodeFetter.childrenCount * 60;
                                    insSkill.parent = this.nodeFetter;
                                    insSkill.name = skillId + "";
                                    Utils.ShowTipInfoView(insSkill, skillItemCfg.jiban_xgms);
                                });
                                let heroSkillItemCfg = DLocal.GetCfgData("yingxiongjineng")[skillId];
                                if (heroSkillItemCfg.skill1_type == 2 && heroSkillItemCfg.skill_object == 2) {
                                    if (isAddSkill == true) {
                                        GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, { "id": skillId, "add": 1 });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 删除技能羁绊
    deleteSkillFetter(heroId = 0) {
        if (heroId != 0) {
            let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[heroId];
            let skillId = this._fetterMap[heroItemCfg.yx_zy];
            if (!skillId) {
                return;
            }
            let skillIns = this.nodeFetter.getChildByName(skillId + "");
            if (skillIns) {
                skillIns.removeFromParent();
            }
            this._fetterMap[heroItemCfg.yx_zy] = 0;
            for (let i = 0; i < this.nodeFetter.childrenCount; i++) {
                this.nodeFetter.children[i].x = i * 60;
            }
            let heroSkillItemCfg = DLocal.GetCfgData("yingxiongjineng")[skillId];
            if (heroSkillItemCfg.skill1_type == 2 && heroSkillItemCfg.skill_object == 2) {
                GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, { "id": skillId, "add": -1 });
            }
        } else {
            let skillArr = [];
            for (let i = 0; i < this.nodeFetter.childrenCount; i++) {
                skillArr.push(this.nodeFetter.children[i]);
            }
            for (let i = 0; i < skillArr.length; i++) {
                let skillId = skillArr[i].name;
                skillArr[i].removeFromParent();
                let heroSkillItemCfg = DLocal.GetCfgData("yingxiongjineng")[skillId];
                if (heroSkillItemCfg.skill1_type == 2 && heroSkillItemCfg.skill_object == 2) {
                    GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, { "id": skillId, "add": -1 });
                }
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

        if (btnName == "btnRefresh") {
            let isHeroRefresh = this.isHeroRefreshConsume();
            if (isHeroRefresh == true) {
                this.guildStep(5); // 新手引导
                this._silverNum -= this._refreshConsume;
                this.updateSliver();
                this.randomHeroSelect();
                this.addHeroRefreshConsume();
                this.labRefreshCost.string = "" + this._refreshConsume;
                this.updateHeroConsumeColor();
                this.updateAirshipConsumeColor();

                AudioMgr.playEffect(MusicPath.RISEREFRESH);
            } else {
                UIManager.ShowForm(UIPath.UIFlyTip, "银币不足");
            }
        } else if (btnName == "btnUnLock") {
            if (!this.isAirshipFullLevel()) {
                if (this.isUpgradeConsume()) {
                    this.guildStep(4); // 新手引导
                    this._silverNum -= this._warshipConsume;
                    this.updateSliver();
                    this._unlockIndex++;
                    this.openNowPos(this._unlockIndex);
                    this.addAirshipConsume();
                    this.labUnLockCost.string = "" + this._warshipConsume;
                    this.updateHeroConsumeColor();
                    this.updateAirshipConsumeColor();

                    AudioMgr.playEffect(MusicPath.RISEWARSHIP);
                } else {
                    UIManager.ShowForm(UIPath.UIFlyTip, "银币不足");
                }
            } else {
                UIManager.ShowForm(UIPath.UIFlyTip, "战舰满级");
            }
        } else if (btnName == "btnHeroCard1") {
            let heroid = this._selectHero[0];
            let posNode = this.getHeroPosWithHeroId(heroid);
            if (posNode) {
                this._battleHeroMap[heroid] = posNode;
                this.loadHeroWithHeroId(heroid, posNode, () => {
                    this.updateSkillFetter();
                });
                this.resetSelectHero();
                this.goBattleHeroUpdateBloodWithId(heroid);
                this.setRandomHero();

                AudioMgr.playEffect(MusicPath.RISELEVEL);
            }

        } else if (btnName == "btnHeroCard2") {
            let heroid = this._selectHero[1];
            let posNode = this.getHeroPosWithHeroId(heroid);
            if (posNode) {

                let guildChapterIdx = DLocal.getGuildChapterIdx();
                this.guildStep(guildChapterIdx); // 新手引导
                this._battleHeroMap[heroid] = posNode;
                this.loadHeroWithHeroId(heroid, posNode, () => {
                    this.updateSkillFetter();
                });
                this.resetSelectHero();
                this.goBattleHeroUpdateBloodWithId(heroid);
                this.setRandomHero();

                AudioMgr.playEffect(MusicPath.RISELEVEL);
            }
        } else if (btnName == "btnHeroCard3") {
            let heroid = this._selectHero[2];
            let posNode = this.getHeroPosWithHeroId(heroid);
            if (posNode) {
                this._battleHeroMap[heroid] = posNode;
                this.loadHeroWithHeroId(heroid, posNode, () => {
                    this.updateSkillFetter();
                });

                this.resetSelectHero();
                this.goBattleHeroUpdateBloodWithId(heroid);
                this.setRandomHero();

                AudioMgr.playEffect(MusicPath.RISELEVEL);
            }
        } else if (btnName == "btnHeroClick") {
            if (!eventData) {
                return;
            }
            let heroId = Number(eventData);

            for (let i = 0; i < this.heroAnimArr.length; i++) {
                if (this.heroAnimArr[i] && this.heroAnimArr[i].childrenCount > 0) {
                    let hero = this.heroAnimArr[i].children[0].getComponent("Hero");
                    if (hero.getHeroId() == heroId) {
                        let heroType = DLocal.GetCfgData("tfyingxiong")[eventData].yx_type;
                        let star = this._heroStarMap[heroType];
                        let attack = hero.getAttack();
                        let attackSpeed = hero.getAttackSpeed();
                        let skillCooling = hero.getSkillCooling();
                        UIManager.ShowForm(UIPath.UIBattleHeroInfo, eventData, star, attack, attackSpeed, skillCooling, () => {
                            this.guildStep(7); // 新手引导
                        });
                        break;
                    }
                }
            }
        } else if (btnName == "btnSuspend") {

            let isGuild = DLocal.isGuildChapter();
            if (isGuild == false) {
                UIManager.ShowForm(UIPath.UIBattleQuit);
            } else {
                UIManager.ShowForm(UIPath.UIFlyTip, "通过1-3过开启");
            }
        }
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

    // 删除所有技能和金币
    deleteAllSkill() {
        // 移除没有删除的资源
        for (let i = 0; i < this.nodeSilver.childrenCount; i++) {
            let child = this.nodeSilver.children[i];
            console.log("------------- child.name = " + child.name);
            if (child.name == "silvercoin") {
                child.destroy();
                // child.removeFromParent();
                // this._silverArr.push(child);
            } else if (child.name == "nodeHurt") {
                if (child.active == true) {
                    child.active = false;
                }
            } else if (child.name == "monsterDie") {
                child.destroy();
                // child.removeFromParent();
                // this._monsterAnmiArr.push(child);
            } else if (child.name == "transmit") {
                child.destroy();
            }
        }
    }


    // 关闭回调
    OnClose() {
        if (this._delayTimer) {
            clearTimeout(this._delayTimer);
            this._delayTimer = null;
        }
        if (this._fzblAnmi1) {
            this._fzblAnmi1.removeFromParent();
        }
        if (this._fzblAnmi2) {
            this._fzblAnmi2.removeFromParent();
        }
        this.removeWarshipHurt();
        GameEvent.dispatchEvent(Msg.UPDATE_BATTLE_END);
        this.deleteAllHero();

        this.deleteAllSkill();
        AudioMgr.playMusic();
    }
}