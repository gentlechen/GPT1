import { AttributeEnum } from "../../common/GameEnum";
import GameLan from "../../common/GameLan";
import { UIPath } from "../../common/UIPath";
import DLocal from "../../data/DLocal";
import UIBase from "../../manage/UIBase";
import UIManager from "../../manage/UIManager";
import Utils from "../../utils/Utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIEquipInfo extends UIBase {

    @property(cc.Node)
    private bgInfo: cc.Node = null;
    @property(cc.Sprite)
    private frameHero: cc.Sprite = null;
    @property(cc.Sprite)
    private imgIcon: cc.Sprite = null;
    @property(cc.Label)
    private labName: cc.Label = null;
    @property(cc.Label)
    private labEquipType: cc.Label = null;
    @property(cc.Node)
    private lineArr: cc.Node[] = [];
    @property(cc.Label)
    private labBattle: cc.Label = null;
    @property(cc.Label)
    private labaseTitle: cc.Label = null;
    @property(cc.Node)
    private nodeBaseItem: cc.Node = null;
    @property(cc.Label)
    private labRefineTitle: cc.Label = null;
    @property(cc.Node)
    private nodeRefineItem: cc.Node = null;
    @property(cc.Node)
    private layoutBase: cc.Node = null;
    @property(cc.Node)
    private layoutRefine: cc.Node = null;
    @property(cc.Node)
    private nodeRefine: cc.Node = null;
    @property(cc.Label)
    private labCompose: cc.Label = null;
    @property(cc.Label)
    private labReplace: cc.Label = null;
    @property(cc.Label)
    private labSell: cc.Label = null;
    @property(cc.Label)
    private labExplainClose: cc.Label = null;
    @property(cc.Label)
    private labExplain: cc.Label = null;

    @property(cc.Node)
    private nodeHead: cc.Node = null;
    @property(cc.Node)
    private nodeBattle: cc.Node = null;
    @property(cc.Node)
    private nodeBaseAttribute: cc.Node = null;
    @property(cc.Node)
    private nodeAllOperation: cc.Node = null;


    private _equipData = null; // 装备数据
    private _equipConcisesData = null; // 洗炼数据

    private _baseItemNum = 0; // 基础属性数量
    private _baptizeItemNum = 0; // 洗炼属性数量
    private _heroIndex = 0; // 第几个角色
    // this._heroIndex

    // 初始相当于onLoad
    OnInit() {

        this.labCompose.string = GameLan.Common_Lan["synthetic"]
        this.labReplace.string = GameLan.Common_Lan["replace"]
        this.labSell.string = GameLan.Common_Lan["sell"]
        this.labExplainClose.string = GameLan.Common_Lan["closeExplain1"]
    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this._equipData = argList[0]
        this._equipConcisesData = argList[1];
        this._heroIndex = argList[2];

        this.LoadHeadInfo()

        this.LoadBaseAttribute();

        this.LoadConcise();

        this.setLocation();
    }

    // 加载装备图片
    private LoadHeadInfo() {

        let uniformitemCfg = DLocal.GetCfgData("uniformitem")[this._equipData.equipId];
        let equipCfg = DLocal.GetCfgData("equip")[this._equipData.equipId];
        Utils.LoadRes("ui/icon/equipAndGode", this, (atlas) => {

            this.imgIcon.spriteFrame = atlas.getSpriteFrame(uniformitemCfg.Icon.replace("_png", ""))
            let frameName = "iconbg" + uniformitemCfg.QualityBorder
            this.frameHero.spriteFrame = atlas.getSpriteFrame(frameName)

        }, cc.SpriteAtlas)

        this.labName.string = uniformitemCfg.Name;
        this.labExplain.string = uniformitemCfg.Description;
        this.labEquipType.string = GameLan.role_Lan[this._equipData.pos];

        this.labBattle.string = this.GetBattleValue(equipCfg) + "";

        this.labaseTitle.string = GameLan.role_Lan["baseAttribute"];


    }

    // 计算战力
    private GetBattleValue(equipCfg) {
        // let battleArr = {};
        // let attrTypeList = equipCfg.AttrTypeList.split(";")
        // let attrValueList = equipCfg.AttrValueList.split(";")
        // for (let i = 0; i < attrTypeList.length; i++) {
        //     battleArr[attrTypeList[i]] = attrValueList[i];
        // }

        // return RoleData.CalculteBattle(battleArr);
    }

    // 基础属性
    private LoadBaseAttribute() {
        let equipCfg = DLocal.GetCfgData("equip")[this._equipData.equipId];
        let attributeTypeList = equipCfg.AttrTypeList.split(";")
        let attributeValueList = equipCfg.AttrValueList.split(";")
        let perAttrTypeList = equipCfg.PerAttrTypeList.split(";")

        if (attributeTypeList != "") {
            this._baseItemNum = attributeTypeList.length
        }
        if (perAttrTypeList != "") {
            this._baseItemNum += perAttrTypeList.length
        }

        for (let i = 0; i < this.layoutBase.childrenCount; i++) {
            this.layoutBase.children[i].active = false;
        }
        Utils.LoadRes("ui/icon/attrIcon", this, (atlas) => {

            if (attributeTypeList != "") {
                for (let i = 0; i < attributeTypeList.length; i++) {
                    let itemBase = null;
                    if (this.layoutBase.childrenCount > i) {
                        itemBase = this.layoutBase.children[i];
                        itemBase.active = true;
                    } else {
                        itemBase = cc.instantiate(this.nodeBaseItem);
                        this.layoutBase.addChild(itemBase);
                    }

                    itemBase.getChildByName("imgBaseIcon").getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(attributeTypeList[i]);
                    itemBase.getChildByName("labbaseName").getComponent(cc.Label).string = GameLan.Common_Lan["Attribute_" + attributeTypeList[i]];
                    itemBase.getChildByName("labbaseAttribute").getComponent(cc.Label).string = attributeValueList[i];
                }
            }


            if (perAttrTypeList != "" && attributeTypeList != "") {
                for (let i = 0; i < perAttrTypeList.length; i++) {
                    let itemBase = null;
                    if (this.layoutBase.childrenCount > i + attributeTypeList.length) {
                        itemBase = this.layoutBase.children[i];
                        itemBase.active = true;
                    } else {
                        itemBase = cc.instantiate(this.nodeBaseItem);
                        this.layoutBase.addChild(itemBase);
                    }

                    itemBase.getChildByName("imgBaseIcon").getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(perAttrTypeList[i]);
                    itemBase.getChildByName("labbaseName").getComponent(cc.Label).string = GameLan.Common_Lan["Attribute_" + perAttrTypeList[i]];
                    itemBase.getChildByName("labbaseAttribute").getComponent(cc.Label).string = '+ ' + perAttrTypeList[i] / 10 + '%';

                }
            }

        }, cc.SpriteAtlas)

    }

    // 洗练属性
    private LoadConcise() {
        // washRefineAttribute
        this.labRefineTitle.string = GameLan.role_Lan["washRefineAttribute"] + GameLan.equipConciseLv_Lan[this._equipConcisesData.level];

        let itemNum = this._equipConcisesData.attrTypeList.length;

        this._baptizeItemNum = itemNum;

        if (itemNum == 0) {
            this.nodeRefine.active = false;
            return;
        } else {
            this.nodeRefine.active = true;
        }

        for (let i = 0; i < this.layoutRefine.childrenCount; i++) {
            this.layoutRefine.children[i].active = false;
        }
        Utils.LoadRes("ui/icon/attrIcon", this, (atlas) => {

            for (let i = 0; i < itemNum; i++) {
                // if (this._equipConcisesData.attrValueList[i] == 0) {
                //     continue;
                // }
                let itemConcise = null;
                if (this.layoutRefine.childrenCount > i) {
                    itemConcise = this.layoutRefine.children[i];
                    itemConcise.active = true;
                } else {
                    itemConcise = cc.instantiate(this.nodeRefineItem);
                    this.layoutRefine.addChild(itemConcise);
                }
                // GameLan.attrNameArr // 等级合成
                itemConcise.getChildByName("imgAttribute").getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame(AttributeEnum[this._equipConcisesData.attrTypeList[i]]);
                // itemConcise.getChildByName("labAttribute").getComponent(cc.Label).string = GameLan.Common_Lan["Attribute_" + perAttrTypeList[i]];

                itemConcise.getChildByName("labAttribute").getComponent(cc.Label).string = GameLan.attrNameArr[this._equipConcisesData.level] + GameLan.Common_Lan["Attribute_" + AttributeEnum[this._equipConcisesData.attrTypeList[i]]] + "+" + this._equipConcisesData.attrValueList[i];
            }
        }, cc.SpriteAtlas)


    }

    // 设置位置
    private setLocation() {

        for (let i = 0; i < this.lineArr.length; i++) {
            this.lineArr[i].active = false;
        }

        let idx = 0;
        let nowPosY = -15;
        this.nodeHead.y = nowPosY;

        this.lineArr[idx].active = true;
        nowPosY -= this.nodeHead.height;
        this.lineArr[idx].y = nowPosY;

        nowPosY -= 5;
        this.nodeBattle.y = nowPosY

        nowPosY -= (this.nodeBattle.height + 5);
        idx++;
        this.lineArr[idx].y = nowPosY;
        this.lineArr[idx].active = true;

        nowPosY -= 10;
        this.nodeBaseAttribute.y = nowPosY;

        nowPosY = nowPosY - 50 - this._baseItemNum * this.nodeBaseItem.height

        if (this.nodeRefine.active == true) {
            idx++;
            this.lineArr[idx].y = nowPosY;
            this.lineArr[idx].active = true;

            nowPosY -= 5;
            this.nodeRefine.y = nowPosY;

            nowPosY = nowPosY - 50 - this._baptizeItemNum * this.nodeRefineItem.height;
        }

        idx++;
        this.lineArr[idx].y = nowPosY;
        this.lineArr[idx].active = true;

        nowPosY -= 5;
        this.labExplain.node.y = nowPosY;

        nowPosY -= this.labExplain.node.height - 5;
        this.nodeAllOperation.y = nowPosY;


        this.labExplainClose.node.y = nowPosY - this.nodeAllOperation.height - 16;

        // nowPosY -= this.nodeAllOperation.height;
        this.bgInfo.height = Math.abs(nowPosY - this.nodeAllOperation.height - 10);


    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {
        // UIRoleChangeEquip

        if (btnName == "btnReplace") {
            UIManager.ShowForm(UIPath.UIRoleChangeEquip, this._equipData.pos, this._heroIndex);
        }
    }

    // 关闭回调
    OnClose() {

    }

    // 销毁界面被调用
    OnDestroy() { }
}