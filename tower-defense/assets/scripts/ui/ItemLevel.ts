
import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import ItemBase from "../manage/ItemBase";
import UIManager from "../manage/UIManager";
import UtilsMath from "../utils/UtilsMath";



const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemChapter extends ItemBase {

    @property(cc.Sprite)
    imgLevelBaseArr: cc.Sprite[] = [];
    @property(cc.Node)
    difficultyArr: cc.Node[] = [];
    @property(cc.Node)
    finishArr: cc.Node[] = [];
    @property(cc.Node)
    openArr: cc.Node[] = [];
    @property(cc.Node)
    closeArr: cc.Node[] = [];
    @property(cc.Label)
    labLevelArr: cc.Label[] = [];

    private _nowLevel = 0;
    private _dataList = [];

    OnInit() {

    }

    updateCell(index, totalCount, dataList, passParam) {

        this._dataList = dataList;
        this.node.parent.zIndex = 100 - index;
        this._nowLevel = DLocal.getLevelData();

        for (let i = 0; i < this.finishArr.length; i++) {
            this.finishArr[i].parent.active = false;
        }
        for (let i = 0; i < dataList.length; i++) {

            this.labLevelArr[i].string = ((index - 1) * 5 + i + 1) + "";
            if (this.finishArr[i]) {
                this.finishArr[i].parent.active = true;
            }
            if (dataList[i] < this._nowLevel) {
                this.finishArr[i].active = true;
                this.openArr[i].active = false;
                this.closeArr[i].active = false;

                let eliteId = dataList[i] + 1000;
                let difficultyId = dataList[i] + 2000;
                if (DLocal.getLevelReward(eliteId)) {
                    this.imgLevelBaseArr[i].spriteFrame = passParam["atlas"].getSpriteFrame("btn_gk2");
                } else {
                    this.imgLevelBaseArr[i].spriteFrame = passParam["atlas"].getSpriteFrame("btn_gk");
                }
                if (DLocal.getLevelReward(difficultyId)) {
                    this.difficultyArr[i].active = true;
                } else {
                    this.difficultyArr[i].active = false;
                }

            } else if (dataList[i] == this._nowLevel) {
                this.finishArr[i].active = false;
                this.openArr[i].active = true;
                this.closeArr[i].active = false;
            } else {
                this.finishArr[i].active = false;
                this.openArr[i].active = false;
                this.closeArr[i].active = true;
            }
        }

    }

    // 点击回调
    public OnClick(btnName, btnNode, eventData) {
        if (btnName == "btnLevel") {
            let idx = eventData - 1;
            if (this.finishArr[idx].active == true) {

                UIManager.ShowForm(UIPath.UIChapterInfo, this._dataList[idx]);
            } else if (this.openArr[idx].active == true) {
                UIManager.ShowForm(UIPath.UIChapterInfo, this._dataList[idx]);
            } else if (this.closeArr[idx].active == true) {
                UIManager.ShowForm(UIPath.UIFlyTip, "上一关卡没有完成");
            }
        }
    }
}
