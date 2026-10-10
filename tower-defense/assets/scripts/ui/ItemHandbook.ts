import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import ItemBase from "../manage/ItemBase";
import UIManager from "../manage/UIManager";
import Utils from "../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class ItemHandbook extends ItemBase {

    @property(cc.Node)
    private nodeMonster: cc.Node = null;
    @property(cc.Node)
    private itemArr: cc.Node[] = [];
    @property(cc.Sprite)
    private imgMonsterArr: cc.Sprite[] = [];
    @property(cc.Node)
    private labMarkArr: cc.Node[] = [];
    @property(cc.Button)
    private btnMonsterInfoArr: cc.Button[] = [];
    @property(cc.Label)
    private labTitle: cc.Label = null;

    private _atlas = null;

    // 初始相当于onLoad
    OnInit() {

    }


    // 初始化label
    initLab() {

    }

    updateCell(index, totalCount, dataList, passParam) {
        this._atlas = passParam.atlas;
        if (dataList.itemType == 1) {
            this.nodeMonster.active = false;
            this.labTitle.node.active = true;
            let chapterIdx = Utils.convertToChinese(dataList.cxzj);
            this.labTitle.string = "第" + chapterIdx + "章" + " ‧ " + dataList.name;
        } else if (dataList.itemType == 2) {
            this.nodeMonster.active = true;
            this.labTitle.node.active = false;
            let monsterList = dataList.data;
            for (let i = 0; i < this.itemArr.length; i++) {
                this.labMarkArr[i].active = false;
                if (monsterList[i]) {
                    this.itemArr[i].active = true;
                    let gwtjCfg = DLocal.GetCfgData("gwtj")[monsterList[i]];
                    if (passParam.atlas.getSpriteFrame(gwtjCfg.icon)) {
                        this.imgMonsterArr[i].node.active = true;
                        this.imgMonsterArr[i].spriteFrame = passParam.atlas.getSpriteFrame(gwtjCfg.icon);
                        this.btnMonsterInfoArr[i].clickEvents[0].customEventData = monsterList[i];
                        this.btnMonsterInfoArr[i].node.active = true;
                    } else {
                        this.labMarkArr[i].active = true;
                        this.imgMonsterArr[i].node.active = false;
                        this.btnMonsterInfoArr[i].node.active = false;
                    }
                } else {
                    this.itemArr[i].active = false;
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
        if (btnName == "btnMonsterInfo") {
            let gwtjCfg = DLocal.GetCfgData("gwtj")[eventData];
            let iconSprite = this._atlas.getSpriteFrame(gwtjCfg.icon);
            UIManager.ShowForm(UIPath.UIMonsterInfo, iconSprite, eventData);
        }
    }

}