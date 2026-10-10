import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIMonsterInfo extends UIBase {

    @property(cc.Sprite)
    private imgMonster: cc.Sprite = null;
    @property(cc.Label)
    private labExplain: cc.Label = null;
    @property(cc.Label)
    private labMonsterName: cc.Label = null;
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
    private labSkillExplain: cc.Label = null;

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this.imgMonster.spriteFrame = argList[0];
        let monsterId = argList[1];
        let gwtjItemCfg = DLocal.GetCfgData("gwtj")[monsterId];
        this.labExplain.string = gwtjItemCfg.wbms;
        this.labMonsterName.string = gwtjItemCfg.gw_mc;
        this.labAttribute1.string = gwtjItemCfg.sml;
        this.labAttribute2.string = gwtjItemCfg.gjl;
        this.labAttribute3.string = gwtjItemCfg.gjsd;
        this.labAttribute4.string = gwtjItemCfg.ydsd;
        this.labAttribute5.string = gwtjItemCfg.gjfw;
        this.labSkillExplain.string = gwtjItemCfg.tsjn;
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

    }

    // 关闭回调
    OnClose() {

    }
}