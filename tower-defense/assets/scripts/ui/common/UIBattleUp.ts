import GameLan from "../../common/GameLan";
// import RoleData from "../../data/RoleData";
import UIBase from "../../manage/UIBase";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIBattleUp extends UIBase {

    @property(cc.Label)
    private labBattleTitle: cc.Label = null;
    @property(cc.Label)
    private labBattleValue: cc.Label = null;

    private _totalBattle = 0;
    private _nowBattle = 0; // 当前战力
    private _addBattle = 0; // 增加的战力
    private _countDown = 3; // 倒计时
    private _isStartCountDown = false; // 是否开始倒计时
    // 初始相当于onLoad
    OnInit() {

        this.labBattleTitle.string = GameLan.Common_Lan["fightingCapacity"];
    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this._isStartCountDown = false;
        this._countDown = 3;
        this._nowBattle = argList[0];
        this.labBattleValue.string = argList[0];

        // let attrArr = RoleData.calAttrByJobId(argList[1].cardId, argList[1].level);
        // this._totalBattle = RoleData.calPower(attrArr);

    }

    // 每秒
    OnUpdateSEC() {
        if (this._isStartCountDown == true) {
            this._countDown--;

            if (this._countDown < 0) {
                return;
            } else if (this._countDown == 0) {
                this.CloseForm();
            }
        }
    }

    // 每帧
    OnUpdate(dt) {

        this._addBattle = this._addBattle + 5;
        if ((this._nowBattle + this._addBattle) <= this._totalBattle) {
            this.labBattleValue.string = (this._nowBattle + this._addBattle) + "";
        } else {
            if (this._isStartCountDown == false) {
                this._isStartCountDown = true;

                this.labBattleValue.string = this._totalBattle + "";
            }
        }

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {

    }

    // 关闭回调
    OnClose() {

    }

    // 销毁界面被调用
    OnDestroy() { }
}