import { UIPath } from "../common/UIPath";
import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import UIManager from "../manage/UIManager";
import { TableView } from "../utils/TableView";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UILevel extends UIBase {

    @property(TableView)
    private tableviewMap: TableView = null;
    @property(cc.ScrollView)
    private scrollMap: cc.ScrollView = null;
    @property(cc.Node)
    private content: cc.Node = null;
    @property(cc.SpriteAtlas)
    private levelAtlas: cc.SpriteAtlas = null;

    private _chapterArr = [];
    private _index = 0;
    private _nowLevel = 0;
    private _nowItemIdx = 0;
    private _isinitTableView = false;

    // 初始相当于onLoad
    OnInit() {

    }

    //每次显示界面被调用
    public OnShow(...argList) {

        this._chapterArr = [];
        let itemData = [];
        let chapterIdx = argList[0];
        let levelList = DLocal.getAllLevelList(chapterIdx);
        for (let i = 0; i < levelList.length; i++) {
            itemData.push(levelList[i]["ordinary"]);
            if (i % 5 == 4 || i == levelList.length - 1) {
                this._chapterArr.push(itemData);
                itemData = [];
            }
        }

        // this.scrollMap.scrollToOffset(cc.v2(0, 0));
        this.tableviewMap.init(this._chapterArr, this, { "atlas": this.levelAtlas }, () => {
            setTimeout(() => {
                if (!this || !this.node) {
                    return;
                }
                let len = this._chapterArr.length - 1;
                let firstLevelId = this._chapterArr[0][0];
                let lastLevelId = this._chapterArr[len][4];
                this._nowLevel = DLocal.getLevelData();
                if (this._nowLevel < firstLevelId) {
                    this._nowLevel = firstLevelId;
                } else if (this._nowLevel > lastLevelId) {
                    this._nowLevel = lastLevelId;
                }
                let num = this._nowLevel - firstLevelId;
                let levelY = (this._chapterArr.length - 1 - num / 5) * 800;
                this.tableviewMap.scrollPos(levelY, 0.1);
            }, 200);
        }, true);

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
        if (btnName == "btnQuickBattle") {
            UIManager.ShowForm(UIPath.UIChapterInfo, this._nowLevel);
        }
    }

    // 关闭回调
    OnClose() {

    }
}