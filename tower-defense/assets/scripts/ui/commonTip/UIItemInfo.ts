import UIBase from "../../manage/UIBase";



const { ccclass, property } = cc._decorator;

@ccclass
export default class UIItemInfo extends UIBase {

    @property(cc.Label)
    private lab_item_info: cc.Label = null;

    private _windowSize = null;
    private _moveUp = 4;
    private _bgHeight = 0;
    private _bgWidth = 0;

    //创建界面被调用一次

    public OnInit() {
        this._windowSize = cc.view.getVisibleSize();
        this._bgHeight = this.node.getChildByName("bg_main").height;
        this._bgWidth = this.node.getChildByName("bg_main").width;
        this.node.opacity = 0
    }

    //每次显示界面被调用
    public OnShow(...argList) {
        let itemid = argList[0];
        let pos = argList[1];
        let iconNode = argList[2];
        let isGoods = argList[3];
        // let setHeight = argList[4];
        let content = "";
        if (isGoods == true) {
            // let itemData = BagMgr.Query(itemid);
            // content = itemData.name + "\n" + itemData.des;
        } else {
            content = itemid;
        }
        // if (setHeight) {
        //     this._bgHeight = setHeight;
        //     this.node.getChildByName("bg_main").height = setHeight;
        //     this.lab_item_info.node.y = setHeight - 10;
        // }
        this.lab_item_info.lineHeight = 32;
        this.lab_item_info.string = content;


        this.lab_item_info.node.on(cc.Node.EventType.SIZE_CHANGED, (event) => {
            console.log(this.lab_item_info.node.height)
            console.log(this.node.getChildByName("bg_main").height)
            this.node.getChildByName("bg_main").height = this.lab_item_info.node.height + 20;
        })
        // this.lab_item_info._updateRenderData(true)
        if (pos.x != 0 || pos.y != 0) {
            this.node.position = pos;
        } else {
            let iconNodeParent = iconNode.parent;
            let starWorldPos = iconNodeParent.convertToWorldSpaceAR(iconNode.position);

            let originalHigh = 1334;
            let originalWidth = 750;
            let actualHigh = this._windowSize.height;
            let size = this._windowSize.width / originalWidth;
            let actualWidth = size * originalWidth;
            if (starWorldPos.x > this._windowSize.width / 2) {
                let needHeight = starWorldPos.y + this._moveUp + this._bgHeight + iconNode.height / 2;
                let fromLeft = starWorldPos.x - this._bgWidth - this._windowSize.width / 2;
                if (fromLeft < - actualWidth / 2) {
                    fromLeft = -actualWidth / 2 + 6;
                }
                this.node.x = fromLeft;
                if (needHeight < this._windowSize.height) {
                    this.node.y = starWorldPos.y + this._moveUp + iconNode.height / 2 - this._windowSize.height / 2;
                } else {
                    this.node.y = starWorldPos.y - this._bgHeight - this._moveUp - iconNode.height / 2 - this._windowSize.height / 2;
                }
            } else {
                let needHeight = starWorldPos.y + this._moveUp + this._bgHeight + iconNode.height / 2;
                let fromRight = starWorldPos.x - this._windowSize.width / 2;
                if (fromRight + this._bgWidth > actualWidth / 2) {
                    fromRight = actualWidth / 2 - this._bgWidth - 6;
                }
                this.node.x = fromRight;
                if (needHeight < this._windowSize.height) {
                    this.node.y = starWorldPos.y + this._moveUp + iconNode.height / 2 - this._windowSize.height / 2;
                } else {
                    this.node.y = starWorldPos.y - this._bgHeight - this._moveUp - iconNode.height / 2 - this._windowSize.height / 2;
                }
            }
        }
        this.node.opacity = 255

    }

    //--------------子类重载接口---------------

    //准备显示界面被调用 在界面动作之前
    public OnReadyShow() { }

    //每次关闭界面被调用
    public OnClose() {
        this.node.opacity = 0
    }

    //销毁界面被调用
    public OnDestroy() { }

    //定时回调
    public OnUpdate(passSecond) { }

    //秒级定时回调
    public OnUpdateSEC() { }

    //切换账号
    public OnReload() { }

    //控件被点击
    public OnClick(btnName: string, btnNode: cc.Node, eventData = null) {
        console.log(btnName);
    }
}
