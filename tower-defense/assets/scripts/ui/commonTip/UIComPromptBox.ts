

import { TipsType } from "../../common/GameEnum";
import GameLan from "../../common/GameLan";
import { ImgPath } from "../../common/ImgPath";
import DLocal from "../../data/DLocal";
import UIBase from "../../manage/UIBase";
import Utils from "../../utils/Utils";

const {ccclass, property} = cc._decorator;


@ccclass
export default class UIComPromptBox extends UIBase {

    @property(cc.Label)
    labTitle: cc.Label = null;
    @property(cc.Label)
    labCancel: cc.Label = null;
    @property(cc.Label)
    labSure: cc.Label = null;
    @property(cc.Label)
    labContent: cc.Label = null;
    @property(cc.Node)
    nodeBuyTip: cc.Node = null;
    @property(cc.Label)
    labBuyExplain: cc.Label = null;
    @property(cc.Label)
    labExplain1: cc.Label = null;
    @property(cc.Label)
    labPrice: cc.Label = null;
    @property(cc.Sprite)
    imgMoney: cc.Sprite = null;

    private _allParam;

    // 初始相当于onLoad
    OnInit () {
        
        this.labTitle.string = GameLan.Common_Lan["tip1"];
        this.labCancel.string = GameLan.Common_Lan["cancel"];
        this.labSure.string = GameLan.Common_Lan["sure"];
    }

    //每次显示界面被调用
    public OnShow(...argList) {

 /*       argList = {
            "tipsType" : // 提示类型
            "goodsId" : // 物品id
            "cancelFunc" : // 取消回调
            "sureFunc" : // 确认回调
            "str": 说明文本
        }*/

        this._allParam = argList[0];
        
        if (this._allParam.tipsType == TipsType.Buy) { // 参数1提示类型  参数2物品信息id

            this.labContent.node.active = false;
            this.nodeBuyTip.active = true;
            
            let goodsInfoData = DLocal.GetCfgData("goodsinfo")[this._allParam.goodsId];
            this.labExplain1.string = GameLan.shop_Lan["iscost"];
            this.labPrice.string = goodsInfoData.Price;
            this.labBuyExplain.string = GameLan.Common_Lan["buy"] + " " + goodsInfoData.Title;

            Utils.LoadRes(ImgPath.itemAtlas, this, (atlas)=>{
                
                let uniformData = DLocal.GetCfgData("uniformitem")[goodsInfoData.CostUniformId];
                let iconName = uniformData.Icon.replace("_png", "");
                this.imgMoney.spriteFrame = atlas.getSpriteFrame(iconName);
            }, cc.SpriteAtlas)

        } else if(this._allParam.tipsType == TipsType.Common) {  // 参数1提示类型  参数2提示信息
            this.labContent.node.active = true;
            this.nodeBuyTip.active = false;
            this.labContent.string = this._allParam.str;
        }
    }
    

    // 每秒
    OnUpdateSEC(){

    }

    // 每帧
    OnUpdate(dt){

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData){

        if (btnName == "btnCancel") {
            if (this._allParam.cancelFunc) {
                this._allParam.cancelFunc();
            }
            this.OnClose_Click();
        } else if (btnName == "btnSure") {
            if (this._allParam.sureFunc) {
                this._allParam.sureFunc();
            }
        }
    }

    // 关闭回调
    OnClose(){

    }

    // 销毁界面被调用
    OnDestroy() {}
}