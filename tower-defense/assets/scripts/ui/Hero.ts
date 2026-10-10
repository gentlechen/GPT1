import { MusicPath } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import DLocal from "../data/DLocal";
import AudioMgr from "../manage/AudioMgr";
import Utils from "../utils/Utils";
import Monster from "./Monster";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Hero extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    @property(cc.Node)
    private nodeEffect: cc.Node = null;

    @property(sp.Skeleton)
    private heroSpine: sp.Skeleton = null;

    private _attackInitTime1 = 0; // 初始化时间间隔
    private _attackTime = 0; // 时间间隔
    private _stepTime = 0; // 当前时间
    private _bulleSpeed = 15; // 子弹速度
    private _checkBulletStep = 0; // 检测碰撞
    private _checkBoundaryStep = 0; // 边界检测

    private _skillNode = null;
    private _monsterNode = null;
    private _insSkill = null;
    private _nowMonster = null; // 瞄准怪物
    private _startMonsterPos = null;
    private _action = null;

    private _heroId = 0; // 英雄id

    private _heroHp = 1; // 英雄血量
    private _heroAttack = 1; // 英雄攻击力
    private _heroInitAttack = 1; // 英雄攻击力
    private _battleSelf = null; // battle控制
    private _isStartAttack = false; // 是否开始攻击

    private _bulleArr = []; // 子弹数组

    private _bulleName = "heroBulle";
    private _initAttack = 0; // 初始攻击力
    private _heroType = 0;

    private _monsterTimer = null;

    private _skillCffs1 = 0; // 技能1 方式
    private _skillAttribute1 = 0; // 技能参数
    private _allSkillEnum = {}; // 所有的技能枚举
    private _bjgl = 0; // 暴击率
    private _bjsh = 0; // 暴击率伤害
    private _bjgl1 = 0; // 暴击率
    private _bjsh1 = 0; // 暴击率伤害
    private _skillGL1 = 0; // 技能1概率
    private _skillAdd1 = 0; // 百分比
    private _skillPercent1; // 自然数
    private _skillEffectId1 = 0; // 技能1
    private _speedGrowthRate1 = 0; // 攻击速度增幅
    private _reduceColdPresent1 = 0; // 减少冷却百分比
    private _nowSkillColdTime1 = 0; // 技能当前冷却时间
    private _skillColdTime1 = 0; // 技能冷却时间
    private _initSkillColdTime1 = 0; // 初始化技能冷却时间
    private _skillCxtime1 = 0; // 技能1效果持续时间
    private _skillType = 0; // 技能类型
    private _skillId1 = 0; // 技能id


    private _skillCffs2 = 0; // 技能1 方式
    private _skillAttribute2 = 0; // 技能参数
    private _skillGL2 = 0; // 技能1概率
    private _skillAdd2 = 0; // 百分比
    private _skillPercent2; // 自然数
    private _skillEffectId2 = 0; // 技能1
    private _speedGrowthRate2 = 0; // 攻击速度增幅
    private _reduceColdPresent2 = 0; // 减少冷却百分比
    private _nowSkillColdTime2 = 0; // 技能当前冷却时间
    private _skillColdTime2 = 0; // 技能冷却时间
    private _initSkillColdTime2 = 0; // 初始化技能冷却时间
    private _skillCxtime2 = 0; // 技能1效果持续时间
    private _skillId2 = 0; // 技能id
    private _skillType2 = 0; // 技能类型

    private _shieldValue = 0; // 护盾值
    private _shieldTimer1 = null; // 定时器
    private _shieldTimer2 = null; // 定时器
    private _attackPrecent = 0; // 增加攻击力百分比
    private _riseSkillPrecent = 0; // 提升技能百分比
    private _bulletId = 0; // 子弹id

    private _composeSkill1 = 0; // 组合技能1
    private _composeSkill2 = 0; // 组合技能2
    private _shieldAddBloodTimer1 = null; // 护盾加血定时器
    private _shieldAddBloodTimer2 = null; // 护盾加血定时器

    onLoad() {

        this._allSkillEnum = {
            "noEffect": 0, // 无技能效果
            "addAttack": 1, // 增加攻击力
            "addAttackAlways": 2, // 增加攻击力（持续时间）
            "addAttackSpeed": 3, // 增加攻击速度（自己）
            "addBaoji": 4, // 增加暴击概率
            "addBaojiHurt": 5, // 增加暴击伤害
            "addLifeLimit": 6, // 增加生命上限
            "reduceHurt": 7, // 减少伤害
            "reduceColdTime": 8, // 减少冷却时间
            "addSkillAttack": 9, // 增加我方技能冷却
            "addsilvercoin": 10, // 增加我方银币数量
            "reduceEnemyMonsterSpeed": 11, // 降低敌方移动速度
            "addBulletCount": 12, // 增加子弹数量
            "control": 13, // 控制技能(持续时间)
            "addLife1": 14, // 恢复生命(通过生命值)怪物
            "addLife2": 15, // 恢复生命(通过攻击力)怪物
            "backLife": 16, // 复活
            "Shield": 17, // 护盾(持续时间)
            "reduceAttackSpeed": 18, // 减少攻击速度 （敌方）
            "blast": 19, // 自爆
            "dundi": 20, // 遁地
            "continueHurt": 21, // 持续伤害（燃烧，中毒等）
            "reducePhysicsHurt": 22, // 减少物理伤害
            "riseSkillHurt": 23, // 提升技能伤害
            "addLife3": 24, // 黄金聚合
            "reduceHeroAttackSpeed": 25, // 减英雄攻击速度
            "skillTriggerBlood": 33, // 释放技能触发，持续治疗
        }
    }

    // 是否开始攻击
    setStartAttack(isPause = true) {
        this._isStartAttack = isPause;
    }

    // 设置攻击时间间隔
    setAttackTime(attackTime) {
        this._attackTime = attackTime;
        this._stepTime = this._attackTime
        this._attackInitTime1 = this._attackTime
    }

    // 设置英雄血量和攻击力
    setHeroBloodAndAttack(blood, attack) {
        this._heroHp = blood;
        this._heroAttack = attack;
        this._heroInitAttack = attack;
        this._initAttack = attack;
    }

    // 跟据星级设置英雄战斗力
    setBattleWithStar(starNum) {

        let starCfg = DLocal.GetCfgData("zd-juneishengxing")[starNum];
        if (starCfg) {
            this._heroAttack = Math.floor(this._initAttack * (100 + starCfg.yxjc_atk) / 100);
            this._heroInitAttack = this._heroAttack;
            if (starNum == 5) {
                this.initFullStar();
            }
        }
    }

    // 设置battle
    setBattleCtr(self, heroType, heroId) {
        this._battleSelf = self;
        this._heroType = heroType;
        this._heroId = heroId;
        this._riseSkillPrecent = 0;
        if (this._monsterTimer) {
            clearTimeout(this._monsterTimer);
            this._monsterTimer = null;
        }
        GameEvent.addEventHandler(Msg.UPDATE_SKILL_INFO, this.updateSkillInfoFunc.bind(this), this);

        let heroCfg = DLocal.GetCfgData("tfyingxiong")[heroId];
        this._bulletId = heroCfg.yx_zy_icon;
        this.initSkill1();
        this.initSkill2(1);
        let skillList = DLocal.getSkillList();
        for (let i = 0; i < skillList.length; i++) {
            if (this._skillId1 != skillList[i].id && skillList[i].id != this._skillId2) {
                let skillCfg = DLocal.GetCfgData("yingxiongjineng")[skillList[i].id];
                if (skillCfg.skill1_type == 2 && skillCfg.skill_object == 2) { // 我方
                    this.updateSkillInfoFunc(skillList[i]);
                }
            }
        }
    }

    getHeroType() {
        return this._heroType;
    }

    // 站
    playStand() {
        // if (!this._skeleton) {
        //     this._skeleton = this.getComponent(sp.Skeleton);
        // }
        // this._skeleton.setAnimation(0, 'stand', true);
    }

    // 播放攻击
    playAttack() {

        // if (!this._skeleton) {
        //     this._skeleton = this.getComponent(sp.Skeleton);
        // }
        // this._skeleton.setAnimation(0, 'attack');
        // this._skeleton.setCompleteListener(() => {
        //     this._skeleton.setAnimation(0, 'stand', true);
        //     this._skeleton.setCompleteListener(() => { })
        // });
    }

    // 播放普攻
    playHeroGeneralAttack() {
        this.heroSpine.setAnimation(0, 'jn1', false);
        this.heroSpine.setCompleteListener(() => {
            this.heroSpine.setCompleteListener(() => { });
            this.heroSpine.setAnimation(0, 'animation', true);
        });
    }

    // 播放技能  比如抬手
    playHeroAttack() {
        this.heroSpine.setAnimation(0, 'jn2', false);
        this.heroSpine.setCompleteListener(() => {
            this.heroSpine.setCompleteListener(() => { });
            this.heroSpine.setAnimation(0, 'animation', true);
        });
    }

    // 设置技能父节点以及怪物父节点
    setSkillAndMonsterNode(skillNode, monsterNode) {
        this._skillNode = skillNode;
        this._monsterNode = monsterNode;
    }

    // 计算子弹起始位置
    calculateBulleStart() {
        let worldPos = this.node.parent.convertToWorldSpaceAR(this.node.position); // 世界坐标
        let point = this._skillNode.convertToNodeSpaceAR(worldPos);
        return point;
    }

    // 获取怪物位置
    getMonsterPos() {
        let monsterArr = this._monsterNode.children;
        if (monsterArr.length > 0) {
            let randon = this.getNearHeroIndex();
            if (randon != -1) {
                let worldPos = monsterArr[randon].parent.convertToWorldSpaceAR(monsterArr[randon].position); // 世界坐标
                let point = this._skillNode.convertToNodeSpaceAR(worldPos);
                this._nowMonster = monsterArr[randon];
                return point;
            } else {
                return;
            }
        }
        return;
    }

    // 计算哪个位置最靠近
    getNearHeroIndex() {
        let farthestHero = null;
        let nearHeroIdx = -1;
        let monsterArr = this._monsterNode.children;
        if (monsterArr.length > 0) {
            for (let i = 0; i < monsterArr.length; i++) {
                if (monsterArr[i].name == "node") {
                    if (!farthestHero) {
                        nearHeroIdx = i;
                        farthestHero = monsterArr[i];
                    } else {
                        if (farthestHero.y > monsterArr[i].y) {
                            nearHeroIdx = i;
                            farthestHero = monsterArr[i];
                        }
                    }
                }
            }
        }
        return nearHeroIdx;
    }

    // 场上是否有怪物
    isHaveMonster() {
        if (!this._monsterNode || !this._monsterNode.children) {
            return false;
        }
        return this._monsterNode.children.length > 0;
    }

    // 发射子弹攻击
    createBulleMonster(nodeSkill, pos1, pos2) {

        // 子弹封装
        let bulleFunc = (insSkill) => {
            this._insSkill = insSkill;
            insSkill.parent = nodeSkill;
            // insSkill.position = monster.position;
            insSkill.position = pos1;

            let theangle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
            let theta = theangle * 180 / Math.PI;  //角度
            insSkill.angle = theta - 90;

            let cosx = this._bulleSpeed * Math.cos(theangle);// 邻边 / 斜边
            let siny = this._bulleSpeed * Math.sin(theangle);// 对边 / 斜边
            this._bulleArr.push({ "bulle": insSkill, "x": cosx, "y": siny });
        }

        // 单颗子弹
        let singleBulle = () => {
            let insSkill = this._battleSelf.getBullet(this._bulletId);
            if (insSkill) {

                let paralysis = insSkill.getComponent(cc.ParticleSystem);
                if (paralysis) {
                    paralysis.resetSystem();
                } else {
                    let skeleton = insSkill.getComponent(sp.Skeleton);
                    if (skeleton) {
                        skeleton.setAnimation(0, skeleton.animation, false);
                    }
                }

                bulleFunc(insSkill);
            } else {
                let skillPath = "spine/bullets/" + this._bulletId;
                cc.resources.load(skillPath, (err, prefab: any) => {
                    if (err) {
                        return;
                    }
                    let insSkill = cc.instantiate(prefab);
                    bulleFunc(insSkill);
                })
            }
        }
        if (this._skillCffs1 == 1 && this._skillAttribute1 == this._allSkillEnum["addBulletCount"] && this.getAttackSkillGL1() == true) { // 攻击时触发
            for (let i = 0; i < this._skillPercent1; i++) {
                if (i == 0) {
                    singleBulle();
                } else {
                    setTimeout(() => {
                        if (this && this.node) {
                            singleBulle();
                        }
                    }, i * 100);
                }
            }
        } else if (this._skillCffs2 == 1 && this._skillAttribute2 == this._allSkillEnum["addBulletCount"] && this.getAttackSkillGL2() == true) { // 攻击时触发
            for (let i = 0; i < this._skillPercent1; i++) {
                if (i == 0) {
                    singleBulle();
                } else {
                    setTimeout(() => {
                        if (this && this.node) {
                            singleBulle();
                        }
                    }, i * 100);
                }
            }
        } else {
            singleBulle();
        }
    }

    // 英雄打击怪物
    heroAttackMonster() {

        this._startMonsterPos = this.getMonsterPos();
        if (this._startMonsterPos) {
            let bulleStartPos = this.calculateBulleStart();
            let heroCfg = DLocal.GetCfgData("tfyingxiong")[this._heroId];
            if (heroCfg.yx_zy == 1) { // 战士
                AudioMgr.playEffect(MusicPath.WARRIOR);
            } else if (heroCfg.yx_zy == 3) { // 法师
                AudioMgr.playEffect(MusicPath.MASTER);
            }

            this.playHeroGeneralAttack();
            this.createBulleMonster(this._skillNode, bulleStartPos, this._startMonsterPos);
        }
    }

    // 检测子弹是否击中怪物
    checkBulletHitMonster() {

        let skillFunc = (i, j, attackValue) => {
            if (this._monsterNode.childrenCount <= 0) {
                return;
            }
            let monsterClass = this._monsterNode.children[j].getComponent(Monster);
            if (!monsterClass) {
                return;
            }
            // 移除子弹和怪物
            this._bulleArr[i].bulle.removeFromParent();
            this._battleSelf.recoveryBullet(this._bulletId, this._bulleArr[i].bulle);

            this._bulleArr.splice(i, 1);
            let nowAttack = this.getCriticalHit(this._bjgl, this._bjsh, attackValue);
            if (nowAttack > attackValue) {
                if (monsterClass) {
                    monsterClass.playHurt(nowAttack, true); // 暴击
                }
            } else {
                if (monsterClass) {
                    monsterClass.playHurt(nowAttack, false); // 没有暴击
                }
            }
        }
        for (let i = 0; i < this._bulleArr.length; i++) {
            for (let j = this._monsterNode.children.length - 1; j >= 0; j--) {
                if (this._bulleArr[i] && this._bulleArr[i].bulle && this._monsterNode.children[j].name != "dundi") {
                    let distance = this.getDistance(this._bulleArr[i].bulle.position, this._monsterNode.children[j].position);
                    if (distance <= 4700) {
                        if (this._skillCffs1 == 1 && this._skillAttribute1 == this._allSkillEnum["addAttack"] && this.getAttackSkillGL1() == true) { // 攻击时触发

                            this.playSkill1Music();
                            this.playSkill(this._monsterNode.children[j].position, this._skillEffectId1, () => {
                                let attackValue = this._heroAttack * (1 + this._skillAdd1 / 100) + this._skillPercent1;
                                let rateAttack = 0;
                                if (this._riseSkillPrecent > 0) {
                                    rateAttack = attackValue * (this._riseSkillPrecent + 1);
                                } else {
                                    rateAttack = attackValue;
                                }
                                skillFunc(i, j, rateAttack);
                            });
                        } else if (this._skillCffs1 == 1 && this._skillAttribute1 == this._allSkillEnum["reduceEnemyMonsterSpeed"] && this.getAttackSkillGL1() == true) {

                            this.playSkill1Music();
                            let monsterClass = this._monsterNode.children[j].getComponent(Monster);
                            if (monsterClass) {
                                monsterClass.updateSkillInfoFunc({ "id": this._skillId1 });
                            }
                            skillFunc(i, j, this._heroAttack);
                        } else if (this._skillCffs1 == 1 && this._skillAttribute1 == this._allSkillEnum["control"] && this.getAttackSkillGL1() == true) { //控制 （冰冻 眩晕）

                            this.playSkill1Music();
                            let monsterClass = this._monsterNode.children[j].getComponent(Monster);
                            if (monsterClass) {
                                monsterClass.updateSkillInfoFunc({ "id": this._skillId1 });
                            }
                            skillFunc(i, j, this._heroAttack);
                        } else if (this._skillCffs1 == 1 && this._skillAttribute1 == this._allSkillEnum["addBulletCount"]) {

                            this.playSkill1Music();
                            this.playSkill(this._monsterNode.children[j].position, this._skillEffectId1, () => {
                                skillFunc(i, j, this._heroAttack);
                            });
                        } else if (this._skillCffs2 == 1 && this._skillAttribute2 == this._allSkillEnum["addAttack"] && this.getAttackSkillGL2() == true) { // 攻击时触发

                            this.playSkill2Music();
                            this.playSkill(this._monsterNode.children[j].position, this._skillEffectId2, () => {

                                let attackValue = this._heroAttack * (1 + this._skillAdd2 / 100) + this._skillPercent2;
                                let rateAttack = 0;
                                if (this._riseSkillPrecent > 0) {
                                    rateAttack = attackValue * (this._riseSkillPrecent + 1);
                                } else {
                                    rateAttack = attackValue;
                                }
                                skillFunc(i, j, rateAttack);
                            });
                        } else if (this._skillCffs2 == 1 && this._skillAttribute2 == this._allSkillEnum["reduceEnemyMonsterSpeed"] && this.getAttackSkillGL2() == true) {

                            this.playSkill2Music();
                            let monsterClass = this._monsterNode.children[j].getComponent(Monster);
                            if (monsterClass) {
                                monsterClass.updateSkillInfoFunc({ "id": this._skillId2 });
                            }
                            skillFunc(i, j, this._heroAttack);
                        } else if (this._skillCffs2 == 1 && this._skillAttribute2 == this._allSkillEnum["control"] && this.getAttackSkillGL2() == true) { //控制 （冰冻 眩晕）

                            this.playSkill2Music();
                            let monsterClass = this._monsterNode.children[j].getComponent(Monster);
                            if (monsterClass) {
                                monsterClass.updateSkillInfoFunc({ "id": this._skillId2 });
                            }
                            skillFunc(i, j, this._heroAttack);
                        } else if (this._skillCffs2 == 1 && this._skillAttribute2 == this._allSkillEnum["addBulletCount"]) {

                            this.playSkill2Music();
                            this.playSkill(this._monsterNode.children[j].position, this._skillEffectId2, () => {
                                skillFunc(i, j, this._heroAttack);
                            });
                        }
                        else {
                            skillFunc(i, j, this._heroAttack);
                        }
                        break
                    }
                }
            }
        }
    }

    // 技能1声音
    playSkill1Music() {
        if (this._skillEffectId1 == 10001) {
            AudioMgr.playEffect(MusicPath.FROZEN); // 冰冻
        } else if (this._skillEffectId1 == 10002) {
            AudioMgr.playEffect(MusicPath.PARALYSIS); // 麻痹
        } else if (this._skillEffectId1 == 10003) {
            AudioMgr.playEffect(MusicPath.DEMONICCLAW); // 恶魔之爪
        } else if (this._skillEffectId1 == 10004) {
            AudioMgr.playEffect(MusicPath.MISSSILE); // 奥术飞弹
        } else if (this._skillEffectId1 == 10005) {
            AudioMgr.playEffect(MusicPath.FIREBALL); // 炽热火球
        } else if (this._skillEffectId1 == 10006) {
            AudioMgr.playEffect(MusicPath.DECELERATE); // 移速降低
        } else if (this._skillEffectId1 == 10007) {
            AudioMgr.playEffect(MusicPath.TEARING); // 撕裂
        } else if (this._skillEffectId1 == 20010) {
            AudioMgr.playEffect(MusicPath.FROZEN); // 冰冻
        } else if (this._skillEffectId1 == 20001) {
            AudioMgr.playEffect(MusicPath.THUNDER); // 雷暴
        } else if (this._skillEffectId1 == 20008) {
            AudioMgr.playEffect(MusicPath.FIREBALL); // 爆裂火焰
        } else if (this._skillEffectId1 == 20009) {
            AudioMgr.playEffect(MusicPath.CATFIST); // 猫猫拳
        } else if (this._skillEffectId1 == 20012) {
            AudioMgr.playEffect(MusicPath.LHZD); // 灵魂震荡
        } else if (this._skillEffectId1 == 20011) {
            AudioMgr.playEffect(MusicPath.FZBL); // 风之壁垒
        }
    }
    // 技能2声音
    playSkill2Music() {
        if (this._skillEffectId2 == 10001) {
            AudioMgr.playEffect(MusicPath.FROZEN); // 冰冻
        } else if (this._skillEffectId2 == 10002) {
            AudioMgr.playEffect(MusicPath.PARALYSIS); // 麻痹
        } else if (this._skillEffectId2 == 10003) {
            AudioMgr.playEffect(MusicPath.DEMONICCLAW); // 恶魔之爪
        } else if (this._skillEffectId2 == 10004) {
            AudioMgr.playEffect(MusicPath.MISSSILE); // 奥术飞弹
        } else if (this._skillEffectId2 == 10005) {
            AudioMgr.playEffect(MusicPath.FIREBALL); // 炽热火球
        } else if (this._skillEffectId2 == 10006) {
            AudioMgr.playEffect(MusicPath.DECELERATE); // 移速降低
        } else if (this._skillEffectId2 == 10007) {
            AudioMgr.playEffect(MusicPath.TEARING); // 撕裂
        } else if (this._skillEffectId2 == 20010) {
            AudioMgr.playEffect(MusicPath.FROZEN); // 冰冻
        } else if (this._skillEffectId2 == 20001) {
            AudioMgr.playEffect(MusicPath.THUNDER); // 雷暴
        } else if (this._skillEffectId2 == 20008) {
            AudioMgr.playEffect(MusicPath.FIREBALL); // 爆裂火焰
        } else if (this._skillEffectId2 == 20009) {
            AudioMgr.playEffect(MusicPath.CATFIST); // 猫猫拳
        } else if (this._skillEffectId2 == 20012) {
            AudioMgr.playEffect(MusicPath.LHZD); // 灵魂震荡
        } else if (this._skillEffectId2 == 20011) {
            AudioMgr.playEffect(MusicPath.FZBL); // 风之壁垒
        }
    }

    // 检测子弹是否出界限
    checkBulleBoundary() {
        for (let i = 0; i < this._bulleArr.length; i++) {
            if (this._bulleArr[i].bulle.x > cc.winSize.width / 2 || this._bulleArr[i].bulle.x < -cc.winSize.width / 2 || this._bulleArr[i].bulle.y > 0) {

                this._bulleArr[i].bulle.removeFromParent();
                this._battleSelf.recoveryBullet(this._bulletId, this._bulleArr[i].bulle);
                this._bulleArr.splice(i, 1);

                this.checkBulleBoundary();
                break;
            }
        }
    }

    // 距离
    getDistance(startPos, endPos) {
        // var pos = cc.v2(startPos.x - endPos.x, startPos.y - endPos.y);
        // var dis = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
        // return dis;
        return (startPos.x - endPos.x) * (startPos.x - endPos.x) + (startPos.y - endPos.y) * (startPos.y - endPos.y)
    }


    // 移除英雄的子弹
    removeHeroAllBulle() {
        for (let i = 0; i < this._bulleArr.length; i++) {
            this._bulleArr[i].bulle.removeFromParent();
            this._battleSelf.recoveryBullet(this._bulletId, this._bulleArr[i].bulle);
            this._bulleArr.splice(i, 1);

            this.removeHeroAllBulle();
            break;
        }
    }

    // 初始化技能1
    initSkill1() {
        let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._heroId];

        this._bjgl = heroItemCfg.yx_bjgl;
        this._bjsh = heroItemCfg.yx_bjsh;
        this._speedGrowthRate1 = 0;
        this._reduceColdPresent1 = 0;
        this._skillId1 = heroItemCfg.jn1_id;
        this._composeSkill1 = heroItemCfg.zhjn1;
        this._composeSkill2 = heroItemCfg.zhjn2;
        // this._skillId1 = 10074;

        if (this._skillId1 != 0) {

            let heroSkillItemCfg = DLocal.GetCfgData("yingxiongjineng")[this._skillId1];
            // let heroSkillItemCfg = DLocal.GetCfgData("yingxiongjineng")[heroItemCfg.jn1_id];
            this._skillCffs1 = heroSkillItemCfg.skill1_cffs;
            this._skillGL1 = heroSkillItemCfg.skill1_gl;
            this._skillAdd1 = heroSkillItemCfg.skill1_add;
            this._skillEffectId1 = heroSkillItemCfg.skill1_tx;
            this._skillPercent1 = heroSkillItemCfg.skill1_percent;
            this._skillColdTime1 = heroSkillItemCfg.cold1_time;
            this._nowSkillColdTime1 = this._skillColdTime1;
            this._initSkillColdTime1 = heroSkillItemCfg.cold1_time;
            this._skillAttribute1 = heroSkillItemCfg.skill1_attribute_parameter;
            this._skillType = heroSkillItemCfg.skill1_type;
            this._skillId1 = heroSkillItemCfg.jn_id;
            this._skillCxtime1 = heroSkillItemCfg.skill1_cxtime;

            if (this._skillCffs1 == 0) {// 无条件限制 (一直在)
                if (heroSkillItemCfg.skill1_type == 1) { // 单体技能

                    if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addBaoji"]) { // 增加暴击率
                        this._bjgl += heroSkillItemCfg.skill1_add;
                    } else if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addBaojiHurt"]) { // 增加暴击伤害                     
                        this._bjsh += heroSkillItemCfg.skill1_add;
                    } else if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addAttackSpeed"]) { // 增加攻击速度
                        this._speedGrowthRate1 += heroSkillItemCfg.skill1_add / 100;
                        this._attackTime = this._attackInitTime1 / (1 + this._speedGrowthRate1);
                    } else if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["reduceColdTime"]) { // 减少我方技能冷却
                        this._reduceColdPresent1 += heroSkillItemCfg.skill1_add / 100
                        this._skillColdTime1 = this._initSkillColdTime1 * (1 + this._reduceColdPresent1);
                    }
                } else if (heroSkillItemCfg.skill1_type == 2) { // 群体技能

                    let skillData = { "id": heroSkillItemCfg.jn_id, "add": 1 };
                    if (heroSkillItemCfg.skill_object == 1) { // 敌方      
                        GameEvent.dispatchEvent(Msg.UPDATE_ENEMY_SKILL_INFO, skillData);
                    } else if (heroSkillItemCfg.skill_object == 2) { // 我方
                        GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, skillData);
                    }
                    this.playSkill(cc.v3(0, -30), this._skillEffectId1, () => {
                    }, true, this.nodeEffect);
                    DLocal.addSkillList(skillData);
                }
            }
        }
    }

    // 技能2
    initSkill2(star) {

        let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._heroId];
        if (star != 5) {
            this._skillId2 = heroItemCfg.yx_jnid01;
        } else {
            this._skillId2 = heroItemCfg.yx_jnid02;
        }
        this._composeSkill1 = heroItemCfg.zhjn1;
        this._composeSkill2 = heroItemCfg.zhjn2;

        let heroSkillItemCfg = DLocal.GetCfgData("yingxiongjineng")[this._skillId2];
        this._skillCffs2 = heroSkillItemCfg.skill1_cffs;
        this._skillGL2 = heroSkillItemCfg.skill1_gl;
        this._skillAdd2 = heroSkillItemCfg.skill1_add;
        this._skillEffectId2 = heroSkillItemCfg.skill1_tx;
        this._skillPercent2 = heroSkillItemCfg.skill1_percent;
        this._skillColdTime2 = heroSkillItemCfg.cold1_time;
        this._nowSkillColdTime2 = this._skillColdTime2;
        this._initSkillColdTime2 = heroSkillItemCfg.cold1_time;
        this._skillAttribute2 = heroSkillItemCfg.skill1_attribute_parameter;
        this._skillType2 = heroSkillItemCfg.skill1_type;
        this._skillCxtime2 = heroSkillItemCfg.skill1_cxtime;

        if (this._skillCffs2 == 0) {// 无条件限制 (一直在)

            let star1Add = 0;
            if (star == 5) {
                let heroSkillItemCfg1 = DLocal.GetCfgData("yingxiongjineng")[heroItemCfg.yx_jnid01];
                star1Add = heroSkillItemCfg1.skill1_add;
            }
            if (heroSkillItemCfg.skill1_type == 1) { // 单体技能
                if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addBaoji"]) { // 增加暴击率
                    this._bjgl -= star1Add;
                    this._bjgl += heroSkillItemCfg.skill1_add;
                } else if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addBaojiHurt"]) { // 增加暴击伤害
                    this._bjsh -= star1Add;
                    this._bjsh += heroSkillItemCfg.skill1_add;
                } else if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addAttackSpeed"]) { // 增加攻击速度

                    this._attackTime = this._attackInitTime1 / (1 + this._speedGrowthRate1 + heroSkillItemCfg.skill1_add / 100);
                } else if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["reduceColdTime"]) { // 减少我方技能冷却

                    this._skillColdTime2 = this._initSkillColdTime2 * (1 + this._reduceColdPresent1 + heroSkillItemCfg.skill1_add / 100);
                }
            } else if (heroSkillItemCfg.skill1_type == 2) { // 群体技能

                let skillData = { "id": heroSkillItemCfg.jn_id, "add": 1 };
                if (heroSkillItemCfg.skill_object == 1) { // 敌方
                    if (star == 5) {
                        GameEvent.dispatchEvent(Msg.UPDATE_ENEMY_SKILL_INFO, { "id": heroItemCfg.yx_jnid01, "add": -1 });
                    }
                    GameEvent.dispatchEvent(Msg.UPDATE_ENEMY_SKILL_INFO, skillData);
                } else if (heroSkillItemCfg.skill_object == 2) { // 我方
                    if (star == 5) {
                        GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, { "id": heroItemCfg.yx_jnid01, "add": -1 });
                    }
                    GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, skillData);
                }

                this.playSkill(cc.v3(0, -30), this._skillEffectId2, () => {

                }, true, this.nodeEffect);

                DLocal.addSkillList(skillData);

                if (star == 5) {
                    DLocal.deleteSkill(heroItemCfg.yx_jnid01);
                }
            }
        }
    }

    // 技能满星
    initFullStar() {
        let heroItemCfg = DLocal.GetCfgData("tfyingxiong")[this._heroId];

        let skillId1 = heroItemCfg.yx_jnid01;
        let skillId2 = heroItemCfg.yx_jnid02;
        let heroSkillItemCfg1 = DLocal.GetCfgData("yingxiongjineng")[skillId1];
        let heroSkillItemCfg2 = DLocal.GetCfgData("yingxiongjineng")[skillId2];

        this._skillCffs2 = this._skillCffs2 - heroSkillItemCfg1.skill1_cffs + heroSkillItemCfg2.skill1_cffs;
        this._skillGL2 = this._skillGL2 - heroSkillItemCfg1.skill1_gl + heroSkillItemCfg2.skill1_gl;
        this._skillAdd2 = this._skillAdd2 - heroSkillItemCfg1.skill1_add + heroSkillItemCfg2.skill1_add;
        this._skillEffectId2 = this._skillEffectId2 - heroSkillItemCfg1.skill1_tx + heroSkillItemCfg2.skill1_tx;
        this._skillPercent2 = this._skillPercent2 - heroSkillItemCfg1.skill1_percent + heroSkillItemCfg2.skill1_percent;
        this._skillColdTime2 = this._skillColdTime2 - heroSkillItemCfg1.cold1_time + heroSkillItemCfg2.cold1_time;
        this._nowSkillColdTime2 = this._skillColdTime2;
        this._initSkillColdTime2 = this._skillColdTime2;
        this._skillAttribute2 = this._skillAttribute2 - heroSkillItemCfg1.skill1_attribute_parameter + heroSkillItemCfg2.skill1_attribute_parameter;
        this._skillType2 = this._skillType2 - heroSkillItemCfg1.skill1_type + heroSkillItemCfg2.skill1_type;
        this._skillCxtime2 = this._skillCxtime2 - heroSkillItemCfg1.skill1_cxtime + heroSkillItemCfg2.skill1_cxtime;


        if (this._skillCffs2 == 0) {// 无条件限制 (一直在)
            let star1Add = heroSkillItemCfg1.skill1_add;
            if (heroSkillItemCfg2.skill1_type == 1) { // 单体技能
                if (heroSkillItemCfg2.skill1_attribute_parameter == this._allSkillEnum["addBaoji"]) { // 增加暴击率
                    this._bjgl -= star1Add;
                    this._bjgl += heroSkillItemCfg2.skill1_add;
                } else if (heroSkillItemCfg2.skill1_attribute_parameter == this._allSkillEnum["addBaojiHurt"]) { // 增加暴击伤害
                    this._bjsh -= star1Add;
                    this._bjsh += heroSkillItemCfg2.skill1_add;
                } else if (heroSkillItemCfg2.skill1_attribute_parameter == this._allSkillEnum["addAttackSpeed"]) { // 增加攻击速度
                    this._attackTime = this._attackInitTime1 / (1 + this._speedGrowthRate1 + heroSkillItemCfg2.skill1_add / 100);
                } else if (heroSkillItemCfg2.skill1_attribute_parameter == this._allSkillEnum["reduceColdTime"]) { // 减少我方技能冷却
                    this._skillColdTime2 = this._initSkillColdTime2 * (1 + this._reduceColdPresent1 + heroSkillItemCfg2.skill1_add / 100);
                }
            } else if (heroSkillItemCfg2.skill1_type == 2) { // 群体技能
                let skillData = { "id": heroSkillItemCfg2.jn_id, "add": 1 };
                if (heroSkillItemCfg2.skill_object == 1) { // 敌方
                    GameEvent.dispatchEvent(Msg.UPDATE_ENEMY_SKILL_INFO, { "id": skillId1, "add": -1 });
                    GameEvent.dispatchEvent(Msg.UPDATE_ENEMY_SKILL_INFO, skillData);
                } else if (heroSkillItemCfg2.skill_object == 2) { // 我方
                    GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, { "id": skillId1, "add": -1 });
                    GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, skillData);
                }
                this.playSkill(cc.v3(0, -30), this._skillEffectId2, () => {
                }, true, this.nodeEffect);
                DLocal.addSkillList(skillData);

                DLocal.deleteSkill(heroItemCfg.yx_jnid01);
            }
        }
    }


    // 删除英雄 去除整体增幅技能
    deleteHero() {

        let heroSkillItemCfg1 = DLocal.GetCfgData("yingxiongjineng")[this._skillId1];
        if (heroSkillItemCfg1 && heroSkillItemCfg1.skill1_type == 2) { // 群体
            if (heroSkillItemCfg1.skill1_cffs == 0) { // 一直存在
                GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, { "id": this._skillId1, "add": -1 });
                DLocal.deleteSkill(this._skillId1);
            }
        }
        let heroSkillItemCfg2 = DLocal.GetCfgData("yingxiongjineng")[this._skillId2];
        if (heroSkillItemCfg2 && heroSkillItemCfg2.skill1_type == 2) { // 群体
            if (heroSkillItemCfg2.skill1_cffs == 0) { // 一直存在
                if (heroSkillItemCfg2.skill_object == 2) { // 我方
                    GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, { "id": this._skillId2, "add": -1 });
                } else {
                    let skillData = { "id": this._skillId2, "add": -1 };
                    GameEvent.dispatchEvent(Msg.UPDATE_ENEMY_SKILL_INFO, skillData);
                }
                DLocal.deleteSkill(this._skillId2);
            }
        }
    }

    // 群体技能(默认都是有持续性)
    updateSkillInfoFunc(paramData) {
        let dataCfg = DLocal.GetCfgData("yingxiongjineng")[paramData.id];
        if (dataCfg["skill1_attribute_parameter"] == this._allSkillEnum["addBaoji"]) {
            if (paramData.add > 0) {
                this._bjgl = this._bjgl + dataCfg.skill1_add;
            } else {
                this._bjgl = this._bjgl - dataCfg.skill1_add;
            }
        } else if (dataCfg["skill1_attribute_parameter"] == this._allSkillEnum["addBaojiHurt"]) {
            if (paramData.add > 0) {
                this._bjsh = this._bjsh + dataCfg.skill1_add;
            } else {
                this._bjsh = this._bjsh - dataCfg.skill1_add;
            }
        } else if (dataCfg["skill1_attribute_parameter"] == this._allSkillEnum["addAttackSpeed"]) {
            if (paramData.add > 0) {
                this._speedGrowthRate1 += dataCfg.skill1_add / 100;
            } else {
                this._speedGrowthRate1 -= dataCfg.skill1_add / 100;
            }
            this._attackTime = Number((this._attackInitTime1 / (1 + this._speedGrowthRate1)).toFixed(2));
        } else if (dataCfg["skill1_attribute_parameter"] == this._allSkillEnum["reduceColdTime"]) {

            if (paramData.add > 0) {
                this._reduceColdPresent1 += dataCfg.skill1_add / 100;
            } else {
                this._reduceColdPresent1 -= dataCfg.skill1_add / 100;
            }
            this._skillColdTime1 = this._initSkillColdTime1 * (1 + this._reduceColdPresent1);
            this._skillColdTime2 = this._initSkillColdTime2 * (1 + this._reduceColdPresent1);
            if (this._skillColdTime1 != 0) {
                this._skillColdTime1 = Number((this._skillColdTime1).toFixed(2));
            }
            if (this._skillColdTime2 != 0) {
                this._skillColdTime2 = Number((this._skillColdTime2).toFixed(2));
            }
        } else if (dataCfg["skill1_attribute_parameter"] == this._allSkillEnum["addAttack"]) {
            if (paramData.add > 0) {
                this._attackPrecent += dataCfg.skill1_add / 100;
            } else {
                this._attackPrecent -= dataCfg.skill1_add / 100;
            }
            this._heroAttack = Math.floor(this._heroInitAttack * (1 + this._attackPrecent) + this._skillPercent1);
        } else if (dataCfg["skill1_attribute_parameter"] == this._allSkillEnum["riseSkillHurt"]) { // 提升技能伤害
            if (paramData.add > 0) {
                this._riseSkillPrecent += dataCfg.skill1_add / 100;
            } else {
                this._riseSkillPrecent -= dataCfg.skill1_add / 100;
            }
        } else if (dataCfg["skill1_attribute_parameter"] == this._allSkillEnum["reduceAttackSpeed"]) { // 降低战舰上所有英雄40%的攻击速度
            if (paramData.add > 0) {
                this._attackTime += this._attackTime * dataCfg.skill1_add / 100;
            } else {
                this._attackTime -= this._attackTime * dataCfg.skill1_add / 100;
            }
        } else if (dataCfg["skill1_attribute_parameter"] == this._allSkillEnum["reduceHeroAttackSpeed"]) { // 降低战舰上所有英雄40%的攻击速度
            if (paramData.add > 0) {
                this._attackTime += this._attackTime * dataCfg.skill1_add / 100;
            } else {
                this._attackTime -= this._attackTime * dataCfg.skill1_add / 100;
            }
        }
    }

    // 暴击伤害计算
    // bjgl 英雄基础暴击率
    // bjsh 英雄基础暴击伤害
    getCriticalHit(bjgl, bjsh, attack) {
        let random = Utils.getRandomInt(0, 100);
        if (random < bjgl) {
            return attack * bjsh / 100;
        }
        return attack;
    }

    // 攻击时有概率触发
    getAttackSkillGL1() {
        if (this._skillCffs1 == 1) {// 攻击时有概率触发
            let gl = Utils.getRandomInt(0, 100);
            if (gl <= this._skillGL1) {
                return true;
            }
        }
        return false;
    }

    // 攻击时有概率触发
    getAttackSkillGL2() {
        if (this._skillCffs2 == 1) {// 攻击时有概率触发
            let gl = Utils.getRandomInt(0, 100);
            if (gl <= this._skillGL2) {
                return true;
            }
        }
        return false;
    }

    //播放 技能1
    playSkill(pos, skillid, callback, isLoop = false, skillparent = null, zIndex = 0) {

        let skillAnmi = this._battleSelf.getSkillAnmiWithId(skillid);
        if (!skillAnmi) {
            let skillPath = "spine/skills/" + skillid;
            cc.resources.load(skillPath, (err, prefab: any) => {
                if (err) {
                    console.error(err)
                    console.error(skillPath)
                    return;
                }
                let insSkill = cc.instantiate(prefab);
                if (skillparent) {
                    insSkill.parent = skillparent;
                } else {
                    insSkill.parent = this._skillNode;
                }
                insSkill.zIndex = zIndex;
                insSkill.position = pos;

                let skeleton = insSkill.getComponent(sp.Skeleton);
                let animName = skeleton.animation;
                skeleton.setAnimation(0, animName, isLoop);
                if (isLoop == false) {
                    skeleton.setCompleteListener(() => {
                        insSkill.removeFromParent();
                        this._battleSelf.addSkillAnmi(skillid, insSkill);
                    });
                }
            })
        } else {
            skillAnmi.position = pos;
            if (skillparent) {
                skillAnmi.parent = skillparent;
            } else {
                skillAnmi.parent = this._skillNode;
            }

            let skeleton = skillAnmi.getComponent(sp.Skeleton);
            let animName = skeleton.animation;

            skeleton.setAnimation(0, animName, isLoop);
            if (isLoop == false) {
                skeleton.setCompleteListener(() => {
                    skillAnmi.removeFromParent();
                    this._battleSelf.addSkillAnmi(skillid, skillAnmi);
                });
            }
        }

        if (callback) {
            callback();
        }
    }

    // 冷却时间触发
    coolingSkill1() {
        let monster = this.getMonster();
        if (!monster) {
            return;
        }
        this.playHeroAttack();
        if (this._skillType == 1) { // 单个
            if (this._skillAttribute1 == this._allSkillEnum["addAttack"]) { // 攻击力没有持续性
                let monsterClass = monster.getComponent(Monster);
                let attackValue = this._heroAttack * (1 + this._skillAdd1 / 100) + this._skillPercent1;
                let nowAttack = this.getCriticalHit(this._bjgl, this._bjsh, attackValue);
                let isCriticalHit = nowAttack > attackValue;
                let rateAttack = 0;
                if (this._riseSkillPrecent > 0) {
                    rateAttack = nowAttack * (this._riseSkillPrecent + 1);
                } else {
                    rateAttack = nowAttack;
                }
                if (monsterClass && monsterClass.damageMonsterFunc) {
                    monsterClass.damageMonsterFunc({ "effectId": this._skillEffectId1, "attack": rateAttack, "isCriticalHit": isCriticalHit })
                }
                this.playSkill1Music();

            } else if (this._skillAttribute1 == this._allSkillEnum["reduceAttackSpeed"]) { // 减少攻击速度

                if (this._skillEffectId1 == 20010) {
                    AudioMgr.playEffect(MusicPath.FROZEN); // 寒意
                }
                let monsterClass = monster.getComponent(Monster);
                let skillData = { "id": this._skillId1, "add": 1 };
                if (monsterClass && monsterClass.updateSkillInfoFunc) {
                    monsterClass.updateSkillInfoFunc(skillData);
                }

                this.playSkill1Music();
            } else if (this._skillAttribute1 == this._allSkillEnum["Shield"]) { // 护盾特效

                let shieldValue = this._heroAttack * (1 + this._skillAdd1 / 100) + this._skillPercent1;
                this._battleSelf.addShield({ "skillId": this._skillId1, "shield": shieldValue });

                if (this._shieldTimer1) {
                    clearTimeout(this._shieldTimer1);
                    this._shieldTimer1 = null;
                }
                this._shieldTimer1 = setTimeout(() => {
                    if (!this || !this.node) {
                        return;
                    }
                    this._battleSelf.deleteShield();
                    this._shieldTimer1 = null;
                }, this._skillCxtime1 * 1000);

                if (this._composeSkill1 != 0) { // 触发技能
                    let heroSkillItemCfg = DLocal.GetCfgData("yingxiongjineng")[this._composeSkill1];
                    if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["skillTriggerBlood"]) { // 添加回血
                        if (this._shieldAddBloodTimer1) {
                            clearInterval(this._shieldAddBloodTimer1);
                            this._shieldAddBloodTimer1 = null;
                        }
                        let idx = 1;
                        let bloodValue = this._heroAttack * heroSkillItemCfg.skill1_add / 100;
                        this._shieldAddBloodTimer1 = setInterval(() => {
                            if (!this || !this.node) {
                                if (this._shieldAddBloodTimer1) {
                                    clearInterval(this._shieldAddBloodTimer1);
                                    this._shieldAddBloodTimer1 = null;
                                }
                                return;
                            }
                            if (idx > heroSkillItemCfg.skill1_cxtime) {
                                if (this._shieldAddBloodTimer1) {
                                    clearInterval(this._shieldAddBloodTimer1);
                                    this._shieldAddBloodTimer1 = null;
                                }
                                return;
                            }
                            this._battleSelf.backBlood(bloodValue);
                            idx++;
                        }, 1000);
                    }
                }

                this.playSkill1Music();
            }
        } else if (this._skillType == 2) { // 群体

            // 这里播放一个英雄抬手动画
            if (this._skillAttribute1 == this._allSkillEnum["addAttack"]) { // 增加攻击力 英雄对怪物的全体伤害
                let attackValue = this._heroAttack * (1 + this._skillAdd1 / 100) + this._skillPercent1;
                let nowAttack = this.getCriticalHit(this._bjgl, this._bjsh, attackValue);
                let isCriticalHit = nowAttack > attackValue;
                let rateAttack = 0;
                if (this._riseSkillPrecent > 0) {
                    rateAttack = nowAttack * (this._riseSkillPrecent + 1);
                } else {
                    rateAttack = nowAttack;
                }
                if (20001 == this._skillEffectId1) { // 雷电
                    this.playSkill(cc.v3(0, -300), this._skillEffectId1, () => {
                        GameEvent.dispatchEvent(Msg.HERO_DAMAGE_MONSTER, { "effectId": this._skillEffectId1, "attack": rateAttack, "isCriticalHit": isCriticalHit });
                    });
                } else {
                    GameEvent.dispatchEvent(Msg.HERO_DAMAGE_MONSTER, { "effectId": this._skillEffectId1, "attack": rateAttack, "isCriticalHit": isCriticalHit });
                }

                this.playSkill1Music();
            } else {
                if (20012 == this._skillEffectId1) { // 全场眩晕
                    let skillId = this._skillEffectId1 + "_1";
                    let skillY = -300;
                    this.playSkill(cc.v3(0, skillY), skillId, () => {
                    });
                }
                let skillData = { "id": this._skillId1, "add": 1 };
                GameEvent.dispatchEvent(Msg.UPDATE_ENEMY_SKILL_INFO, skillData);

                this.playSkill1Music();
            }

        }
    }

    // 冷却时间触发
    coolingSkill2() {
        let monster = this.getMonster();
        if (!monster) {
            return;
        }
        this.playHeroAttack();
        if (this._skillType2 == 1) { // 单个

            if (this._skillAttribute2 == this._allSkillEnum["addAttack"]) { // 攻击力没有持续性
                let monsterClass = monster.getComponent(Monster);
                let attackValue = this._heroAttack * (1 + this._skillAdd2 / 100) + this._skillPercent2;
                let nowAttack = this.getCriticalHit(this._bjgl, this._bjsh, attackValue);
                let isCriticalHit = nowAttack > attackValue;

                let rateAttack = 0;
                if (this._riseSkillPrecent > 0) {
                    rateAttack = nowAttack * (this._riseSkillPrecent + 1);
                } else {
                    rateAttack = nowAttack;
                }
                if (monsterClass && monsterClass.damageMonsterFunc) {
                    monsterClass.damageMonsterFunc({ "effectId": this._skillEffectId2, "attack": rateAttack, "isCriticalHit": isCriticalHit });
                }

                this.playSkill2Music();
            } else if (this._skillAttribute2 == this._allSkillEnum["reduceAttackSpeed"]) { // 减少攻击速度
                let monsterClass = monster.getComponent(Monster);
                let skillData = { "id": this._skillId2, "add": 1 };
                if (monsterClass && monsterClass.updateSkillInfoFunc) {
                    monsterClass.updateSkillInfoFunc(skillData);
                }

                this.playSkill2Music();
            } else if (this._skillAttribute2 == this._allSkillEnum["Shield"]) { // 护盾特效
                let shieldValue = this._heroAttack * (1 + this._skillAdd2 / 100) + this._skillPercent2;
                this._battleSelf.addShield({ "skillId": this._skillId2, "shield": shieldValue });
                if (this._shieldTimer2) {
                    clearTimeout(this._shieldTimer2);
                    this._shieldTimer2 = null;
                }
                this._shieldTimer2 = setTimeout(() => {
                    if (!this || !this.node) {
                        return;
                    }
                    this._shieldTimer2 = null;
                    this._battleSelf.deleteShield();
                }, this._skillCxtime2 * 1000);

                if (this._composeSkill2 != 0) { // 触发技能
                    let heroSkillItemCfg = DLocal.GetCfgData("yingxiongjineng")[this._composeSkill2];
                    if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["skillTriggerBlood"]) { // 添加回血
                        if (this._shieldAddBloodTimer2) {
                            clearInterval(this._shieldAddBloodTimer2);
                            this._shieldAddBloodTimer2 = null;
                        }
                        let idx = 1;
                        let bloodValue = this._heroAttack * heroSkillItemCfg.skill1_add / 100;
                        this._shieldAddBloodTimer2 = setInterval(() => {
                            if (!this || !this.node) {
                                if (this._shieldAddBloodTimer2) {
                                    clearInterval(this._shieldAddBloodTimer2);
                                    this._shieldAddBloodTimer2 = null;
                                }
                                return;
                            }
                            if (idx > heroSkillItemCfg.skill1_cxtime) {
                                if (this._shieldAddBloodTimer2) {
                                    clearInterval(this._shieldAddBloodTimer2);
                                    this._shieldAddBloodTimer2 = null;
                                }
                                return;
                            }
                            this._battleSelf.backBlood(bloodValue);
                            idx++;
                        }, 1000);
                    }
                }

                this.playSkill2Music();
            }
        } else if (this._skillType2 == 2) { // 群体

            let height = cc.winSize.height;
            // 这里播放一个英雄抬手动画
            if (this._skillAttribute2 == this._allSkillEnum["addAttack"]) { // 增加攻击力 英雄对怪物的全体伤害

                let attackValue = this._heroAttack * (1 + this._skillAdd2 / 100) + this._skillPercent2;
                let nowAttack = this.getCriticalHit(this._bjgl, this._bjsh, attackValue);
                let isCriticalHit = nowAttack > attackValue;

                let rateAttack = 0;
                if (this._riseSkillPrecent > 0) {
                    rateAttack = nowAttack * (this._riseSkillPrecent + 1);
                } else {
                    rateAttack = nowAttack;
                }
                if (20001 == this._skillEffectId2) { // 雷电
                    this.playSkill(cc.v3(0, -(height - 500) / 2), this._skillEffectId2, () => {
                        GameEvent.dispatchEvent(Msg.HERO_DAMAGE_MONSTER, { "effectId": this._skillEffectId2, "attack": rateAttack, "isCriticalHit": isCriticalHit });
                    });
                } else {
                    GameEvent.dispatchEvent(Msg.HERO_DAMAGE_MONSTER, { "effectId": this._skillEffectId2, "attack": rateAttack, "isCriticalHit": isCriticalHit });
                }

                this.playSkill2Music();
            } else {
                if (20012 == this._skillEffectId2) {
                    let skillId = this._skillEffectId2 + "_1";
                    let skillY = -(height - 500) / 2;
                    this.playSkill(cc.v3(0, skillY), skillId, () => {

                    });
                }
                let skillData = { "id": this._skillId2, "add": 1 };
                GameEvent.dispatchEvent(Msg.UPDATE_ENEMY_SKILL_INFO, skillData);

                this.playSkill2Music();
            }
        }

    }

    // 获取怪物
    getMonster() {
        let monsterArr = this._monsterNode.children;
        if (monsterArr.length > 0) {
            let randon = this.getNearHeroIndex();
            if (randon == -1) {
                return;
            }
            return monsterArr[randon];
        }
        return;
    }

    // 得到英雄id
    getHeroId() {
        return this._heroId;
    }

    // 攻击力
    getAttack() {
        return this._heroAttack;
    }

    // 攻击速度
    getAttackSpeed() {
        return this._attackTime;
    }

    // 技能冷却
    getSkillCooling() {
        return this._skillColdTime2;
    }

    update(dt) {

        this._stepTime += dt;
        this._nowSkillColdTime1 += dt;
        this._nowSkillColdTime2 += dt;
        for (let i = 0; i < this._bulleArr.length; i++) {
            if (this._bulleArr[i]["bulle"]) {
                if (this._bulleArr[i]["bulle"].name) {
                    this._bulleArr[i]["bulle"].x += this._bulleArr[i].x;
                    this._bulleArr[i]["bulle"].y += this._bulleArr[i].y;
                } else {
                    console.log(this._bulleArr[i])
                    this._bulleArr.splice(i, 1);
                }
            }
        }
        this._checkBoundaryStep += dt;
        if (this._checkBoundaryStep > 1) {
            this._checkBoundaryStep = 0;
            this.checkBulleBoundary();
        }
        this._checkBulletStep += dt;
        if (this._checkBulletStep >= 0.1) {
            this._checkBulletStep = 0
            this.checkBulletHitMonster();
        }
        if (this.isHaveMonster() != true) {
            return;
        }
        if (this._stepTime >= this._attackTime && this._attackTime != 0) {
            this._stepTime = 0;
            // this.playAttack();
            this.heroAttackMonster();
        }
        if (this._skillCffs1 == 3 && this._skillColdTime1 != 0 && this._nowSkillColdTime1 >= this._skillColdTime1) {
            this._nowSkillColdTime1 = 0;
            this.coolingSkill1();
        }
        if (this._skillCffs2 == 3 && this._skillColdTime2 != 0 && this._nowSkillColdTime2 >= this._skillColdTime2) {
            this._nowSkillColdTime2 = 0;
            this.coolingSkill2();
        }
    }

    onDisable() {
        GameEvent.removeLayerAllEvent(this);
        this.nodeEffect.removeAllChildren();
        this.removeHeroAllBulle();

    }
}
