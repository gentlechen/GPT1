import ResourceLoader from "../utils/ResourceLoader";
import { MusicPath } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import DLocal from "../data/DLocal";
import AudioMgr from "../manage/AudioMgr";
import Utils from "../utils/Utils";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Monster extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    private _attackTime = 0; // 时间间隔
    private _stepTime = 0; // 当前时间
    private _isStartAttack = false; // 是否开始攻击

    private _skeleton = null;
    private _pbBlood = null;
    private _labHurt = null;
    private _bloodArr = [];

    private _totalBlood = 100; // 总血量
    private _nowBlood = 100; // 当前血量
    private _monsterAttack = 1; // 怪物攻击力
    private _initMonsterAttack = 1; // 怪物攻击力
    private _monsterSpeed = 80; // 怪物速度
    private _initMonsterSpeed = 80; // 怪物速度

    private _remote2PosY = -500; // 远程战斗目标点
    private _remote1PosY = -644; // 远程战斗目标点
    private _meleePosY = -828; // 近战斗目标点
    private _attackState = 0; // 0代表近战 1代表远程 2代表更远
    private _attackCallFunc = null; // 攻击回调
    private _battleSelf = null;
    private _monsterId = null;
    private _monsterIns = null;
    private _isBoss = false; // 是否是boss
    private _monsterRewardCount = 0; // 奖励数量
    private _allSkillEnum = {}; // 所有的技能枚举
    private _skillWithTypeMap = {};

    private _monsterSpeedPercent = 0;
    private _monsterSpeedTempPercent = 0;
    private _monsterAttackTimePercent = 0;
    private _monsterAttackPercent = 0; // 攻击力百分比
    private _initMonsterAttackTime = 0;
    private _isStop = false; // 是否暂停向前跑
    private _coolTimer = null; // 减速计时器

    private _xunyunSkillIns = null; // 眩晕技能
    private _distanceY = 0; // 距离
    private _isAddLife1 = false; // 自身血量在50%以下时回满生命，只能触发一次
    private _blastPrecent = 0; // 自爆
    private _isCanAttacked = true; // 是否能被攻击
    private _attackPercent1 = 0; // 攻击力百分比
    private _singleTreat = 0; // 单个治疗
    private _stepSingleTreatTime = 0; // 治疗冷却时间
    private _intervalSingleTreatTime = 0; // 治疗冷却时间
    private _stepGroupTreatTime = 0; // 群体治疗时间
    private _intervalGroupTreatTime = 0; // 群体治疗时间间隔
    private _groupTreat = 0; // 群体治疗
    private _continueHurtSkillAdd = 0; // 持续伤害叠加
    private _continueHurtSkillTime = 0; // 持续伤害时间
    private _skillId = 0; // 技能id
    private _intervalTimer = null;
    private _probability = 0; // 概率
    private _reduceHurtSkillAdd = 0; // 技能增幅
    private _reduceHurtSkillContinueTime = 0; // 持续时间
    private _reduceHurtSkillColdTime = 0; // 冷却时间
    private _reduceHurtStepTime = 0; // 减伤当前时间
    private _reduceHurtTimer = null; // 时间戳
    private _life3SkillAdd = 0; // 回血3 参数
    private _backLifeSkillAdd = 0; // 复活加血
    private _isReduceHeroAttackSpeed = false; // 是否减英雄攻击速度
    private _lifeAttackSkillAdd = 0; // 生命值低于50%触发攻击的增幅

    private _dundiName = "dundi";
    private _isDundi = false; // 是否遁地

    @property(sp.Skeleton)
    private monsterSkeleton: sp.Skeleton = null;
    @property(cc.ProgressBar)
    private pbBlood: cc.ProgressBar = null;

    onLoad() {
        this.getBloodAndHurt();

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
            "addSkillAttack": 9, // 触发攻击（生命在50%以下时发动一次强力远程攻击，造成150%攻击的伤害）
            "addsilvercoin": 10, // 增加我方银币数量
            "reduceEnemyMonsterSpeed": 11, // 降低敌方移动速度
            "addBulletCount": 12, // 增加子弹数量
            "control": 13, // 控制技能(持续时间)
            "addLife1": 14, // 恢复生命(通过生命值)
            "addLife2": 15, // 恢复生命(通过攻击力)
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
        }
    }

    start(): void {
        // this.node.y = 0;
        // this.clearBattleHurt();
    }

    // 加载枚举
    loadEnum() {
    }

    // 设置攻击时间间隔
    setAttackTime(attackTime) {
        this.node.pauseAllActions();
        this._attackTime = attackTime;
        this._initMonsterAttackTime = attackTime;
        this._distanceY = 0;
    }

    // 设置battle
    setBattleCtr(self, monsterId, monsterIns, isBoss, monsterRewardCount, monsterSpeed, monsterAttack) {

        GameEvent.addEventHandler(Msg.UPDATE_ENEMY_SKILL_INFO, this.updateSkillInfoFunc.bind(this), this);
        GameEvent.addEventHandler(Msg.HERO_DAMAGE_MONSTER, this.damageMonsterFunc.bind(this), this);
        this._monsterSpeedPercent = 0;
        this._monsterSpeedTempPercent = 0;
        this._monsterId = monsterId;
        this._battleSelf = self;
        this._monsterIns = monsterIns;
        this._isBoss = isBoss;
        this._monsterRewardCount = monsterRewardCount;
        this.node.name = "node";

        for (let i = 0; i < this.node.childrenCount; i++) {
            if (this.node.children[i].name != "nodeMonster" && this.node.children[i].name != "nodeBlood") {
                this.node.children[i].destroy();
            }
        }

        this._monsterSpeed = monsterSpeed;
        this._initMonsterSpeed = monsterSpeed;
        this._isStartAttack = false;
        this._isStop = false;
        this._distanceY = 0;
        this._monsterAttackPercent = 0;
        this.node.y = 0;
        this._isDundi = false;
        this._monsterAttack = monsterAttack;
        this._initMonsterAttack = monsterAttack;
        // this.monsterSkeleton.clearTracks();
        this.clearBattleHurt();
        this.targetPos();
        this.initMonsterSkill();
        this.playRun();
        let skillList = DLocal.getSkillList();
        for (let i = 0; i < skillList.length; i++) {
            let skillCfg = DLocal.GetCfgData("yingxiongjineng")[skillList[i].id];
            if (skillCfg.skill1_type == 2 && skillCfg.skill_object == 1) { // 敌方
                this.updateSkillInfoFunc(skillList[i]);
            }
        }
    }

    // 设置远程
    setAttackState(attackState, callfunc) {
        this._attackState = attackState;
        this._attackCallFunc = callfunc;
    }

    // 设置血量
    initBloodAndHurt(blood) {
        this.getBloodAndHurt();
        this._totalBlood = blood;
        this._nowBlood = blood;
        this._pbBlood.progress = 1;
    }

    // 是否开始攻击
    setStartAttack(isPause = true) {
        this._isStartAttack = isPause;
        if (isPause == true) {
            this._isCanAttacked = isPause;
            this.blastFunc();
            if (this.node.name != "node") { // 这里恢复躲避攻击的技能              
                this.node.name = "node";
            }
        }
    }

    getBlood() {
        return this._nowBlood;
    }

    // 得到血量百分比
    getBloodPrecent() {
        return this._pbBlood.progress;
    }

    setBlood(blood) {
        this._nowBlood += blood;
        if (this._nowBlood > this._totalBlood) {
            this._nowBlood = this._totalBlood;
        }
        let bloodPercent = this._nowBlood / this._totalBlood;
        this._pbBlood.progress = bloodPercent;
    }

    // 计算子弹起始位置
    targetPos() {
        let worldPos1 = this._battleSelf.nodePos1.parent.convertToWorldSpaceAR(this._battleSelf.nodePos1.position); // 世界坐标
        this._meleePosY = this.node.parent.convertToNodeSpaceAR(worldPos1).y;

        let worldPos2 = this._battleSelf.nodePos1.parent.convertToWorldSpaceAR(this._battleSelf.nodePos2.position); // 世界坐标
        this._remote1PosY = this.node.parent.convertToNodeSpaceAR(worldPos2).y;

        let worldPos3 = this._battleSelf.nodePos1.parent.convertToWorldSpaceAR(this._battleSelf.nodePos3.position); // 世界坐标
        this._remote2PosY = this.node.parent.convertToNodeSpaceAR(worldPos3).y;
    }

    // 目标位置
    getHeroTagetPos() {

        return this._meleePosY - 80;
    }

    // 受伤飘血
    playHurt(hurtNum, isCriticalHit = false) {

        if (!this._totalBlood) {
            return;
        }
        this.getBloodAndHurt();

        hurtNum = this.reduceHurtFunc(hurtNum);

        this._nowBlood -= hurtNum;
        let bloodPercent = this._nowBlood / this._totalBlood;
        this._pbBlood.progress = bloodPercent;

        if (this._isBoss == true) {
            this._battleSelf.updateBossBlood(bloodPercent);
        }
        this.backLifeFunc();
        this._battleSelf.monsterHurtNumber(this.node.position, hurtNum, isCriticalHit);
        if (this && this._nowBlood <= 0) {
            this._battleSelf.dropSilver(this.node.position, this._monsterRewardCount, this._isBoss);
            // this.monsterSkeleton.clearTracks();
            this._battleSelf.destroyMonster(this._monsterId, this._monsterIns);
        } else {
            // this.playHit();
            this.addLife1Func();
            this.resumeLife3Func();
        }
    }

    // 增加英雄对怪物的伤害
    damageMonsterFunc(data) {

        if (!this || !this.node) {
            return;
        }
        if (data.effectId == 20001) { // 雷电
            if (data.attack && data.attack > 0) {
                if (!this || !this.node) {
                    return;
                }
                this.playHurt(data.attack, data.isCriticalHit);
            }
        } else {
            this.playSkill(cc.v3(0, 0, 0), data.effectId, () => {
                if (data.attack && data.attack > 0) {
                    if (!this || !this.node) {
                        return;
                    }
                    this.playHurt(data.attack, data.isCriticalHit);
                }
            }, 1, false);
        }
    }

    // 英雄对怪物的技能
    updateSkillInfoFunc(data) {

        let heroSkillItemCfg = DLocal.GetCfgData("yingxiongjineng")[data.id];
        if (heroSkillItemCfg.skill1_cffs == 0) { // 一直存在
            if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["reduceEnemyMonsterSpeed"]) { // 集体减速

                if (data.add && data.add > 0) {
                    this._monsterSpeedPercent = heroSkillItemCfg.skill1_add;
                } else {
                    this._monsterSpeedPercent = 0;
                }
                this._monsterSpeed = this._initMonsterSpeed / (1 - (this._monsterSpeedTempPercent + this._monsterSpeedPercent) / 100);
            } else if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addAttack"]) { // 减攻击力

                if (data.add && data.add > 0) {
                    this._monsterAttackPercent += heroSkillItemCfg.skill1_add;
                } else {
                    this._monsterAttackPercent -= heroSkillItemCfg.skill1_add;
                }
                this._monsterAttack = Math.floor(this._initMonsterAttack / (1 - this._monsterAttackPercent / 100));
            }

        } else if (heroSkillItemCfg.skill1_cffs == 1 || heroSkillItemCfg.skill1_cffs == 3) { //单个
            if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["reduceEnemyMonsterSpeed"]) { // 减速
                this._monsterSpeedTempPercent = heroSkillItemCfg.skill1_add;
                this._monsterSpeed = this._initMonsterSpeed / (1 - (this._monsterSpeedTempPercent + this._monsterSpeedPercent) / 100);
                // this._isStop = true;
                if (!this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter]) {
                    this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter] = 0;
                }

                this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter]++;
                this.playSkill(cc.v3(0, 0), heroSkillItemCfg.skill1_tx, (skillid, skill) => {
                    setTimeout(() => {
                        if (this && this.node) {

                            this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter]--;
                            if (this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter] <= 0) {
                                // this._isStop = false;
                                this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter] = 0;
                            }

                            this._monsterSpeedTempPercent = 0;
                            this._monsterSpeed = this._initMonsterSpeed / (1 - this._monsterSpeedPercent / 100);
                            if (skill) {
                                skill.removeFromParent();
                                if (this._battleSelf && this._battleSelf.addSkillAnmi) {
                                    this._battleSelf.addSkillAnmi(skillid, skill);
                                }
                            }
                        }
                    }, heroSkillItemCfg.skill1_cxtime * 1000);
                });
            } else if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["control"]) { // 控制系
                // dd
                this._isStop = true;

                let isStartBattle = false;
                if (this._isStartAttack == true) {
                    this._isStartAttack = false;
                    isStartBattle = true;
                }

                if (!this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter]) {
                    this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter] = 0;
                }

                this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter]++;

                let skillPos = cc.v3(0, 0);
                if (heroSkillItemCfg.skill1_tx == 20012) { // 灵魂震荡
                    skillPos = cc.v3(0, 50);
                }
                this.playSkill(skillPos, heroSkillItemCfg.skill1_tx, (skillid, skill) => {
                    setTimeout(() => {
                        if (this && this.node) {

                            this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter]--;
                            if (this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter] <= 0) {
                                this._isStop = false;
                                if (isStartBattle == true) {
                                    this._isStartAttack = true;
                                }
                                this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter] = 0;
                            }

                            if (skill) {
                                skill.removeFromParent();
                                if (this._battleSelf && this._battleSelf.addSkillAnmi) {
                                    this._battleSelf.addSkillAnmi(skillid, skill);
                                }
                            }
                        }
                    }, heroSkillItemCfg.skill1_cxtime * 1000);
                }, 1);

            } else if (heroSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["reduceAttackSpeed"]) { // 减少怪物攻击速度

                if (!this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter]) {
                    this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter] = 0;
                }
                this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter]++;
                this._monsterAttackTimePercent = heroSkillItemCfg.skill1_add;
                this._attackTime = this._initMonsterAttackTime * (1 - this._monsterAttackTimePercent / 100);
                this.playSkill(cc.v3(0, 0, 0), heroSkillItemCfg.skill1_tx, (skillid, skill) => {
                    setTimeout(() => {
                        if (this && this.node) {
                            this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter]--;
                            if (this._skillWithTypeMap[heroSkillItemCfg.skill1_attribute_parameter] <= 0) {
                                this._attackTime = this._initMonsterAttackTime
                            }
                            if (skill) {
                                skill.removeFromParent();
                                if (this._battleSelf && this._battleSelf.addSkillAnmi) {
                                    this._battleSelf.addSkillAnmi(skillid, skill);
                                }
                            }
                        }
                    }, heroSkillItemCfg.skill1_cxtime * 1000);
                }, 1);

            }

        }
    }

    // 获得血条和伤害
    getBloodAndHurt() {
        if (!this._pbBlood) {
            this._pbBlood = this.pbBlood;
        }
    }

    //播放 技能1
    playSkill(pos, skillid, callback, zIndex = -1, isLoop = true, parent = null) {
        let skillAnmi = this._battleSelf.getSkillAnmiWithId(skillid);
        if (!skillAnmi) {
            let skillPath = "spine/skills/" + skillid;
            ResourceLoader.load(skillPath, (err, prefab: any) => {
                if (!this || !this.node) {
                    return;
                }
                if (err) {
                    console.log(err)
                    console.log(skillPath)
                    return;
                }
                let insSkill = cc.instantiate(prefab);
                insSkill.name = "skill";
                if (parent == null) {
                    insSkill.parent = this.node;
                } else {
                    insSkill.parent = parent;
                }
                insSkill.position = pos;
                if (skillid == 20010) {
                    insSkill.zIndex = -1;
                } else {
                    insSkill.zIndex = zIndex;
                }
                let skeleton = insSkill.getComponent(sp.Skeleton);
                let animName = skeleton.animation;
                skeleton.setAnimation(0, animName, isLoop);
                skeleton.setCompleteListener(() => {
                    if (isLoop == true) {
                        skeleton.setCompleteListener(() => { });
                    } else {
                        insSkill.removeFromParent();
                        if (this._battleSelf && this._battleSelf.addSkillAnmi) {
                            this._battleSelf.addSkillAnmi(skillid, insSkill);
                        }
                    }
                    if (callback) {
                        callback(skillid, insSkill);
                    }
                });
            })
        } else {
            skillAnmi.position = pos;
            if (parent == null) {
                skillAnmi.parent = this.node;
            } else {
                skillAnmi.parent = parent;
            }
            if (skillid == 20010) {
                skillAnmi.zIndex = -1;
            } else {
                skillAnmi.zIndex = zIndex;
            }
            let skeleton = skillAnmi.getComponent(sp.Skeleton);
            let animName = skeleton.animation;
            skeleton.setAnimation(0, animName, isLoop);
            skeleton.setCompleteListener(() => {
                if (isLoop == true) {
                    skeleton.setCompleteListener(() => { });
                } else {
                    skillAnmi.removeFromParent();
                    if (this._battleSelf && this._battleSelf.addSkillAnmi) {
                        this._battleSelf.addSkillAnmi(skillid, skillAnmi);
                    }
                }
                if (callback) {
                    callback(skillid, skillAnmi);
                }
            });
        }
    }

    // 获取当前伤害文本
    getHurtLable() {
        // for (let i = 0; i < this._bloodArr.length; i++) {
        //     if (this._bloodArr[i].node.active == false) {
        //         return this._bloodArr[i];
        //     }
        // }
    }

    // 清理战斗伤害
    clearBattleHurt() {
        // for (let i = 0; i < this._bloodArr.length; i++) {
        //     this._bloodArr[i].node.active = false;
        // }
    }

    //跑到攻击点
    runAttackPoint() {

        if (this._isStop == true || this._distanceY != 0 && this.node.y <= this._distanceY) {
            return;
        }
        if (this._distanceY == 0) {
            if (this._attackState == 1) { // 1代表 中程
                this._distanceY = Utils.getRandomInt(this._remote1PosY - 20, this._remote1PosY + 80);
            } else if (this._attackState == 2) { // 2代表 远程
                this._distanceY = Utils.getRandomInt(this._remote2PosY - 20, this._remote2PosY + 80);
            } else {
                this._distanceY = Utils.getRandomInt(this._meleePosY - 20, this._meleePosY + 20);
            }
        }
        this.node.y -= this._monsterSpeed / 60;
        if (this.node.y <= this._distanceY) {
            this.playAttack();
            if (this._attackCallFunc) {
                this._attackCallFunc(this._monsterAttack);
            }
            this.setStartAttack();
        }
    }

    // 站
    playStand() {
        if (!this._skeleton) {
            this._skeleton = this.monsterSkeleton;
        }

        this._skeleton.setAnimation(0, 'run', true);
        // this._skeleton.setAnimation(0, 'stand', true);
    }

    // 跑
    playRun() {
        if (!this._skeleton) {
            this._skeleton = this.monsterSkeleton;
        }

        if (this.node.name == this._dundiName) {
            this._skeleton.setAnimation(0, 'down', false);
            this._skeleton.setCompleteListener(() => {
                this._skeleton.setCompleteListener(() => { });
                this._skeleton.setAnimation(0, 'run', true);
            });
        } else {
            this._skeleton.setAnimation(0, 'run', true);
        }
    }

    // 死亡
    playDie(dieCallback = null) {
        // if (!this._skeleton) {
        //     this._skeleton = this.node.getChildByName("nodeMonster").getComponent(sp.Skeleton);
        // }
        // this._skeleton.setAnimation(0, 'die', false);
        // this._skeleton.setEndListener(() => {
        //     if (dieCallback) {
        //         dieCallback();
        //     }
        //     // this._skeleton.setCompleteListener(() => { })
        // });

        this._nowBlood = 0;
        this._battleSelf.dropSilver(this.node.position, this._monsterRewardCount, this._isBoss);
        // this.monsterSkeleton.clearTracks();
        this._battleSelf.destroyMonster(this._monsterId, this._monsterIns);

    }

    // 播放攻击
    playAttack(callback = null) {
        if (this._isBoss == true) {
            if (this._attackState == 0) { // 近战
                AudioMgr.playEffect(MusicPath.NEARBATTLE);
            } else { // 远程
                AudioMgr.playEffect(MusicPath.FARBATTLE);
            }
        }

        if (!this._skeleton) {
            this._skeleton = this.monsterSkeleton;
        }
        this._skeleton.setAnimation(0, 'atk', false);
        this._skeleton.setCompleteListener(() => {
            this._skeleton.setCompleteListener(() => { });
            if (this._isDundi == true) {
                this._skeleton.setAnimation(0, 'run1', true);
            } else {
                this._skeleton.setAnimation(0, 'run', true);
            }
        });
        if (callback) {
            callback();
        }

        // 攻击时触发技能
        if (this._continueHurtSkillAdd) {
            let isSuccess = this.getAttackSkillGL(this._probability);
            if (isSuccess) {
                this.continueHurtFunc();
            }
        }
    }

    // 受击
    playHit() {
        if (!this._skeleton) {
            this._skeleton = this.monsterSkeleton;
        }
        this._skeleton.setAnimation(0, 'hit', false);
        this._skeleton.setCompleteListener(() => {
            this._skeleton.setCompleteListener(() => { });
            this._skeleton.setAnimation(0, 'run', true);
        });
    }

    // 初始化怪物技能
    initMonsterSkill() {

        this._isAddLife1 = false;
        this._blastPrecent = 0;
        this._isCanAttacked = false;
        this._attackPercent1 = 0;
        this._singleTreat = 0;
        this._intervalSingleTreatTime = 0;
        this._groupTreat = 0;
        this._intervalGroupTreatTime = 0;
        this._continueHurtSkillAdd = 0;
        this._continueHurtSkillTime = 0;
        this._reduceHurtSkillAdd = 0;
        this._reduceHurtSkillContinueTime = 0;
        this._reduceHurtSkillColdTime = 0;
        this._life3SkillAdd = 0;
        this._isReduceHeroAttackSpeed = false;
        this._lifeAttackSkillAdd = 0;

        let monsterItemCfg = DLocal.GetCfgData("zong-guaiwu")[this._monsterId];
        if (!monsterItemCfg.gw_jnid) {
            return;
        }
        let skillItemCfg = DLocal.GetCfgData("yingxiongjineng")[monsterItemCfg.gw_jnid];
        if (!skillItemCfg) {
            return;
        }
        this._skillId = monsterItemCfg.gw_jnid;
        if (skillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addLife1"]) {// 自身血量在50%以下时回满生命，只能触发一次
            this._isAddLife1 = true;
        } else if (skillItemCfg.skill1_attribute_parameter == this._allSkillEnum["blast"]) { // 到达攻击范围后自爆对战舰造成500%攻击力的伤害
            this._blastPrecent = skillItemCfg.skill1_add / 100;
        } else if (skillItemCfg.skill1_attribute_parameter == this._allSkillEnum["dundi"]) { // 遁地
            this._isCanAttacked = false;
            this.node.name = this._dundiName;
            this._isDundi = true;
        } else if (skillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addLife2"]) { // 治疗
            if (skillItemCfg.skill1_type == 1) {
                this._singleTreat = skillItemCfg.skill1_add / 100;
                this._intervalSingleTreatTime = skillItemCfg.cold1_time;
            } else if (skillItemCfg.skill1_type == 2) {
                this._groupTreat = skillItemCfg.skill1_add / 100;
                this._intervalGroupTreatTime = skillItemCfg.cold1_time;
            }
        } else if (skillItemCfg.skill1_attribute_parameter == this._allSkillEnum["continueHurt"]) { // 灼烧 剧毒
            this._continueHurtSkillAdd = skillItemCfg.skill1_add / 100;
            this._continueHurtSkillTime = skillItemCfg.skill1_cxtime;
            this._probability = skillItemCfg.skill1_gl;
        } else if (skillItemCfg.skill1_attribute_parameter == this._allSkillEnum["reduceHurt"]) { // 钢铁之躯
            this._reduceHurtSkillAdd = skillItemCfg.skill1_add / 100;
            this._reduceHurtSkillContinueTime = skillItemCfg.skill1_cxtime * 1000;
            this._reduceHurtSkillColdTime = skillItemCfg.cold1_time
        } else if (skillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addLife3"]) { // 黄金聚合
            this._life3SkillAdd = skillItemCfg.skill1_add / 100;
        } else if (skillItemCfg.skill1_attribute_parameter == this._allSkillEnum["backLife"]) { // 复活
            this._backLifeSkillAdd = skillItemCfg.skill1_add / 100;
        } else if (skillItemCfg.skill1_attribute_parameter == this._allSkillEnum["reduceHeroAttackSpeed"]) { // 极寒光环
            this._isReduceHeroAttackSpeed = true;
            GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, { "id": skillItemCfg.jn_id, "add": -1 });
        } else if (skillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addSkillAttack"]) { // 雷枪 生命在50%以下时发动一次强力远程攻击，造成150%攻击的伤害
            this._lifeAttackSkillAdd = skillItemCfg.skill1_add / 100;
        }
    }

    // 怪物技能
    monsterSkill(data) {
        let monsterSkillItemCfg = DLocal.GetCfgData("yingxiongjineng")[data.id];
        if (monsterSkillItemCfg.skill1_cffs == 0) { // 一直存在

        } else if (monsterSkillItemCfg.skill1_cffs == 1 || monsterSkillItemCfg.skill1_cffs == 3) {
            if (monsterSkillItemCfg.skill1_attribute_parameter == this._allSkillEnum["addLife1"]) { // 自身血量在50%以下时回满生命，只能触发一次

            }
        }
    }

    // 复苏
    addLife1Func() {
        if (this._isAddLife1 == true && this._pbBlood.progress <= 0.5 && this._pbBlood.progress > 0) {
            this.playSkill(cc.v3(0, 0, 0), "10086", () => {
            }, 1, false);

            this._nowBlood = this._totalBlood;
            this._pbBlood.progress = 1;
            this._isAddLife1 = false;
        }
    }

    // 自爆
    blastFunc() {
        if (this._blastPrecent > 0) {
            this.playSkill(cc.v3(0, 0, 0), "10087", () => {
                this._nowBlood = 0;
                this._pbBlood.progress = 0;
                if (this._attackCallFunc) {
                    let monsterAttack = this._monsterAttack * (1 + this._blastPrecent);
                    this._attackCallFunc(monsterAttack);
                }
                this.playDie();
            }, 1, false);
        }
    }

    // 遁地
    escapeFunc() {

    }

    // 治疗
    treatFunc() {
        let leastBlood = 0;
        let monster = null;
        let leastClass = null;
        let monsterParent = this.node.parent;
        let len = monsterParent.childrenCount;
        for (let i = 0; i < len; i++) {
            let child = monsterParent.children[i];
            if (child) {
                let monsterClass = child.getComponent("Monster");
                if (monsterClass) {
                    let nowBlood = monsterClass.getBloodPrecent();
                    if (leastBlood == 0) {
                        leastBlood = nowBlood;
                        monster = child;
                        leastClass = monsterClass;
                    } else if (leastBlood > nowBlood) {
                        leastBlood = nowBlood;
                        monster = child;
                        leastClass = monsterClass;
                    }
                }
            }
        }
        if (leastBlood < 1) {
            this.playSkill(cc.v3(0, 0, 0), "10089", () => {
                let blood = this._monsterAttack * this._singleTreat;
                leastClass.setBlood(blood);
            }, 1, false, monster);
        }
    }

    // 群体治疗
    groupTreatFunc() {

        let monsterParent = this.node.parent;
        for (let i = 0; i < monsterParent.childrenCount; i++) {
            let child = monsterParent.children[i];
            if (child) {
                let monsterClass = child.getComponent("Monster");
                if (monsterClass) {
                    this.playSkill(cc.v3(0, 0, 0), "10090", () => {
                        let blood = this._monsterAttack * this._groupTreat;
                        monsterClass.setBlood(blood);
                    }, 1, false, child);
                }
            }
        }
    }

    // 灼烧 和剧毒
    continueHurtFunc() {
        if (this._continueHurtSkillTime == 0 || this._continueHurtSkillAdd == 0 || !this._continueHurtSkillAdd) {
            return;
        }

        let skillName = this._skillId + "";
        // this.playSkill(cc.v3(0, 0, 0), skillName, () => {
        // }, 1, false);

        let callback = () => {
            if (!this._continueHurtSkillAdd) {
                return;
            }
            let attack = this._monsterAttack * this._continueHurtSkillAdd;
            if (attack == 0) {
                console.log("------------- attack = " + attack)
            }
            if (this._battleSelf && this._battleSelf.hurtHeroUpdateBlood) {
                this._battleSelf.hurtHeroUpdateBlood(Math.floor(attack));
            }
        }
        if (this._intervalTimer) {
            clearInterval(this._intervalTimer);
            this._intervalTimer = null;
        }

        let idx = 0;
        this._intervalTimer = setInterval(() => {
            if (!this || !this.node) {
                clearInterval(this._intervalTimer);
                this._intervalTimer = null;
                return;
            }
            idx++;
            callback();
            if (this._continueHurtSkillTime <= idx) {
                clearInterval(this._intervalTimer);
                this._intervalTimer = null;
                return;
            }
        }, 1000)
    }

    // 攻击时有概率触发
    getAttackSkillGL(value) {
        let gl = Utils.getRandomInt(0, 100);
        if (gl <= value) {
            return true;
        }
        return false;
    }

    // 钢铁之躯
    reduceHurtFunc(hurtNum) {
        if (this._reduceHurtTimer) { // 减少怪物伤害
            hurtNum = hurtNum / (1 - this._reduceHurtSkillAdd);
        }
        return hurtNum;
    }

    // 黄金聚合
    resumeLife3Func() {
        if (this._life3SkillAdd != 0) { // 每次攻击回血

            this._nowBlood += this._monsterAttack * this._life3SkillAdd;
            let bloodPercent = this._nowBlood / this._totalBlood;
            this._pbBlood.progress = bloodPercent;

            if (this._isBoss == true) {
                this._battleSelf.updateBossBlood(bloodPercent);
            }
        }
    }

    // 怪物生命在50%以下时，会直接发动一次超远程攻击
    monsterLifeAttack() {
        if (this._lifeAttackSkillAdd > 0 && this._pbBlood.progress < 0.5) {

            this._stepTime = 0;
            this.playAttack();
            if (this._attackCallFunc) {
                let attack = this._monsterAttack * (1 + this._lifeAttackSkillAdd);
                this._attackCallFunc(attack);
            }
            this._lifeAttackSkillAdd = 0;
        }
    }

    // 复活加血
    backLifeFunc() {
        if (this._nowBlood <= 0 && this._backLifeSkillAdd > 0) {
            this._nowBlood = this._totalBlood * this._backLifeSkillAdd;
            this._pbBlood.progress = this._backLifeSkillAdd;
            if (this._isBoss == true) {
                this._battleSelf.updateBossBlood(this._backLifeSkillAdd);
            }
            this._backLifeSkillAdd = 0;
        }
    }


    update(dt) {
        this.runAttackPoint();
        this._stepTime += dt;
        this._stepSingleTreatTime += dt;
        this._stepGroupTreatTime += dt;
        this._reduceHurtStepTime += dt;
        if (this._isStartAttack == true && this._stepTime >= this._attackTime && this._attackTime != 0) {
            this._stepTime = 0;
            this.playAttack();
            if (this._attackCallFunc) {
                this._attackCallFunc(this._monsterAttack);
            }
        }
        if (this._intervalSingleTreatTime != 0 && this._stepSingleTreatTime >= this._intervalSingleTreatTime) {
            this._stepSingleTreatTime = 0;
            this.treatFunc();
        }
        if (this._intervalGroupTreatTime != 0 && this._stepGroupTreatTime >= this._intervalGroupTreatTime) {
            this._stepGroupTreatTime = 0;
            this.groupTreatFunc();
        }
        if (this._reduceHurtSkillColdTime != 0 && this._reduceHurtStepTime >= this._reduceHurtSkillColdTime) {
            this._reduceHurtStepTime = 0;

            if (this._reduceHurtTimer) {
                clearTimeout(this._reduceHurtTimer);
                this._reduceHurtTimer = null;
            }
            this._reduceHurtTimer = setTimeout(() => {
                this._reduceHurtTimer = null;
            }, this._reduceHurtSkillContinueTime);
        }
        this.monsterLifeAttack();
    }

    onDisable() {

        console.log("------------------ 删除怪物")
        if (this._isReduceHeroAttackSpeed == true) {
            GameEvent.dispatchEvent(Msg.UPDATE_SKILL_INFO, { "id": this._skillId, "add": 1 });
        }
        GameEvent.dispatchEvent(Msg.BATTLE_UPDATE_WAVE);

        GameEvent.removeLayerAllEvent(this);
        this.node.stopAllActions();

        this._isAddLife1 = false;
        this._blastPrecent = 0;
        this._isCanAttacked = false;
        this._attackPercent1 = 0;
        this._singleTreat = 0;
        this._intervalSingleTreatTime = 0;
        this._groupTreat = 0;
        this._intervalGroupTreatTime = 0;
        this._continueHurtSkillAdd = 0;
        this._continueHurtSkillTime = 0;
        this._reduceHurtSkillAdd = 0;
        this._reduceHurtSkillContinueTime = 0;
        this._reduceHurtSkillColdTime = 0;
        this._life3SkillAdd = 0;
        this._lifeAttackSkillAdd = 0;
        this._reduceHurtTimer = null;
        for (let i = 0; i < this.node.childrenCount; i++) {
            if (this.node.children[i].name != "nodeMonster" && this.node.children[i].name != "nodeBlood") {
                this.node.children[i].destroy();
            }
        }
    }


}


