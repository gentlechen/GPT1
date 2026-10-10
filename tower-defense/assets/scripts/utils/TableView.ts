// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import UtilsMath from "./UtilsMath";

const { ccclass, property } = cc._decorator;

@ccclass
export class TableView extends cc.Component {

    @property({ // item template to instantiate other items
        type: cc.Prefab,
        tooltip: "item"
    })
    private prefabCell: cc.Prefab = null;

    @property({
        type: cc.ScrollView,
        tooltip: "滚动视图组件"
    })
    private scrollView: cc.ScrollView = null;

    // @property({
    //     type: cc.Integer,
    //     tooltip: "cell的高度"
    // })
    private prefabCellHeight: number = 0;

    // @property({
    //     type: cc.Integer,
    //     tooltip: "cell的宽度"
    // })
    private prefabCellWidth: number = 0;

    @property({
        type: cc.Integer,
        tooltip: "一行item的个数"
    })
    private aLineNum: number = 1;

    @property({
        type: cc.Integer,
        tooltip: "前后两个cell之间的间隔"
    })
    private beforeAfterInterval: number = 0;

    @property({
        type: cc.Integer,
        tooltip: "左右两个cell之间的间隔"
    })
    private aboutInterVal: number = 10;

    // @property({
    //     type: "",
    //     tooltip: "cell上挂的脚本的名字"
    // })
    private cellScriptName = "";

    _content: cc.Node = null;
    _dataArr: [];
    _dataObj: null;
    _totalCount: number = 0;
    _bufferZone: number = 0;
    _spawnCount: number = 0;
    _itemList: cc.Node[] = [];
    _lastContentPosY: number = 0;
    _lastContentPosX: number = 0;
    _curOffset: number = null;
    _cellHeightAddSpacing: number = 0;
    _resetAllItemPos: boolean = false;
    _scrollWidth: number = 0;
    _scrollHeight: number = 0;
    _aColNum: number = 0; // 列的数量
    _originalOffset: cc.Vec2; // 最初的位置

    loadConfig() {
        this._content = this.scrollView.content;
        this._scrollWidth = this.scrollView.node.width;
        this._scrollHeight = this.scrollView.node.height;
        this._originalOffset = cc.v2(0, 0);

        this.cellScriptName = this.prefabCell.name;
        this.prefabCellHeight = this.prefabCell.data.height;
        this.prefabCellWidth = this.prefabCell.data.width;

        if (this.scrollView.vertical) {
            this._bufferZone = this._scrollHeight;
            this._cellHeightAddSpacing = this.prefabCellHeight + this.beforeAfterInterval;
        }
        else if (this.scrollView.horizontal) {
            this._bufferZone = this._scrollWidth;
            this._cellHeightAddSpacing = this.prefabCellWidth + this.beforeAfterInterval;
        }

        // if ((UtilsMath.IsBrowser() == true || UtilsMath.IsWindows() == true) && this._content.config) {
        if (UtilsMath.IsBrowser() == true || UtilsMath.IsWindows() == true) {

            if (this._content.config) {
                this._content._renderFlag |= cc.RenderFlow.FLAG_CHILDREN_BATCH_RENDER;
            } else {
                // console.error("error " + this.scrollView.name + " not set content config");
            }
        }
    }


    init(dataArr, self, dataObj = null, callback = null, isBotton = false) {

        this.loadConfig();

        this._itemList = [];
        if (isBotton == false) {
            this.scrollView.scrollToTop();
        } else {
            this.scrollView.scrollToBottom();
        }
        if (this.scrollView.bounceDuration > 0.1) {
            this.scrollView.bounceDuration = 0.1; // 回弹持续的时间
        }

        // this._content.removeAllChildren();
        this._dataArr = dataArr;
        this._dataObj = dataObj;
        this._totalCount = this._dataArr.length;


        if (this.scrollView.vertical) { // 真实的行高

            for (let i = 0; i < this._content.childrenCount; i++) {
                for (let j = 0; j < this.aLineNum; j++) {
                    if (this._content.children[i].children[j]) {
                        this._content.children[i].children[j].active = false;
                    }
                }
            }
        } else if (this.scrollView.horizontal) {
            this._aColNum = Math.ceil(this._totalCount / this.aLineNum);

            for (let i = 0; i < this._content.childrenCount; i++) {
                this._content.children[i].active = false;
            }
        }

        if (this._totalCount == 0) {
            return;
        }

        this._spawnCount = (Math.ceil(this._bufferZone / this._cellHeightAddSpacing) + 2) * this.aLineNum;
        if (this._spawnCount > this._totalCount) {
            this._spawnCount = this._totalCount;
        }

        if (this.scrollView.vertical) {
            this._content.height = Math.ceil(this._totalCount / this.aLineNum) * this._cellHeightAddSpacing// + this.spacing; // get total _content height
            if (this._content.height < this._bufferZone) {
                this._content.height = this._bufferZone;
            }
        } else if (this.scrollView.horizontal) {
            this._content.width = this._totalCount * this._cellHeightAddSpacing// + this.spacing; // get total content width
            if (this._content.width < this._bufferZone) {
                this._content.width = this._bufferZone;
            }
        }
        var recordRowNum = -1;
        var rowNode = undefined;

        let leftMargin = (this._scrollWidth - this.prefabCellWidth * this.aLineNum - this.aboutInterVal * (this.aLineNum - 1)) / 2; // 左间距

        if (self.AddDynamicRes) {
            self.AddDynamicRes(null, this.prefabCell)
        }

        if (this.scrollView.vertical) {


            this.scrollView.vertical = false;
            let idx = 0;
            let loadItemCallback = () => {

                if (this._spawnCount <= idx) {
                    if (callback) {
                        callback();
                    }
                    this.scrollView.vertical = true;
                    return;
                }
                let rowNum = Math.floor(idx / this.aLineNum);  // 行
                let colNum = idx % this.aLineNum; // 列
                if (recordRowNum != rowNum) {
                    recordRowNum = rowNum;
                    let itemName = "" + recordRowNum;
                    rowNode = this._content.getChildByName(itemName);
                    if (!rowNode) {
                        rowNode = new cc.Node();
                        rowNode.width = this._scrollWidth;
                        rowNode.height = this.prefabCellHeight;
                        rowNode.name = itemName;
                        this._content.addChild(rowNode);
                    }

                    if (this._content.anchorY == 1) {
                        rowNode.y = -this._cellHeightAddSpacing * (rowNum + 1);
                    } else {
                        rowNode.y = this._cellHeightAddSpacing * rowNum;
                    }
                    this._itemList.push(rowNode);
                }

                let item = rowNode.children[colNum];
                if (!item) {
                    item = cc.instantiate(this.prefabCell);
                    if (rowNode != undefined) {
                        rowNode.addChild(item);
                    }
                } else {
                    item.active = true;
                }
                item["index"] = idx;

                let itemX = 0;
                itemX = leftMargin + (this.prefabCellWidth + this.aboutInterVal) * colNum + this.prefabCellWidth / 2 - this._scrollWidth / 2;
                item.setPosition(itemX, this.prefabCellHeight * 0.5);

                item.getComponent(this.cellScriptName).updateCell(idx + 1, this._totalCount, this._dataArr[idx], this._dataObj);

                idx++;
                setTimeout(() => {
                    if (this && this.node) {
                        loadItemCallback();
                    }
                }, 60);
            }
            loadItemCallback();

        } else if (this.scrollView.horizontal) {

            let idx = 0;
            this.scrollView.horizontal = false;
            let loadItemCallback = () => {
                if (this._spawnCount <= idx) {
                    if (callback) {
                        callback();
                    }
                    this.scrollView.horizontal = true;
                    return;
                }
                let item = this._content.children[idx];
                if (!item) {
                    item = cc.instantiate(this.prefabCell);
                    item["index"] = idx;
                    this._content.addChild(item);
                }
                item.active = true;
                item["index"] = idx;
                let anchorY = item.anchorY;
                item.x = this._cellHeightAddSpacing * (idx + 0.5);
                item.y = (anchorY - 0.5) * this.prefabCellHeight;
                item.getComponent(this.cellScriptName).updateCell(idx + 1, this._totalCount, this._dataArr[idx], this._dataObj);
                this._itemList.push(item);

                idx++;
                setTimeout(() => {
                    if (this && this.node) {
                        loadItemCallback();
                    }
                }, 90);
            }
            loadItemCallback();

        }
    }

    //刷新数据
    reload(dataArr, dataObj = null) {

        this._dataArr = dataArr;
        if (dataObj) {
            this._dataObj = dataObj;
        }

        this._totalCount = this._dataArr.length;

        if (this.scrollView.vertical) { // 真实的行高

            for (let i = 0; i < this._content.childrenCount; i++) {
                for (let j = 0; j < this.aLineNum; j++) {
                    if (this._content.children[i].children[j]) {
                        this._content.children[i].children[j].active = false;
                    }
                }
            }
        } else if (this.scrollView.horizontal) {
            this._aColNum = Math.ceil(this._totalCount / this.aLineNum);
            for (let i = 0; i < this._content.childrenCount; i++) {
                this._content.children[i].active = false;
            }
        }



        this._spawnCount = (Math.ceil(this._bufferZone / this._cellHeightAddSpacing) + 2) * this.aLineNum;
        if (this._spawnCount > this._totalCount) {
            this._spawnCount = this._totalCount;
        }
        if (this.scrollView.vertical) {
            this._content.height = Math.ceil(this._totalCount / this.aLineNum) * this._cellHeightAddSpacing// + this.spacing; // get total _content height
            if (this._content.height < this._bufferZone) {
                this._content.height = this._bufferZone;
            }
        } else if (this.scrollView.horizontal) {
            this._content.width = this._totalCount * this._cellHeightAddSpacing// + this.spacing; // get total content width
            if (this._content.width < this._bufferZone) {
                this._content.width = this._bufferZone;
            }
        }
        var recordRowNum = -1;
        var rowNode = undefined;

        let leftMargin = (this._scrollWidth - this.prefabCellWidth * this.aLineNum - this.aboutInterVal * (this.aLineNum - 1)) / 2; // 左间距

        let original = this.scrollView.getScrollOffset();

        if (this.scrollView.vertical) {
            let rowNum = Math.ceil(original.y / this._cellHeightAddSpacing - 1);
            if (rowNum < 1) {
                rowNum = 1;
            }
            let idx = 0;
            let startIdx = (rowNum - 1) * this.aLineNum;
            for (let i = startIdx; i < this._spawnCount + startIdx; i++) {
                let rowNum = Math.floor(i / this.aLineNum);  // 行
                let colNum = i % this.aLineNum; // 列
                if (recordRowNum != rowNum) {
                    recordRowNum = rowNum;
                    rowNode = this._itemList[idx];
                    idx++;
                    if (this._content.anchorY == 1) {
                        rowNode.y = -this._cellHeightAddSpacing * (rowNum + 1);
                    } else {
                        rowNode.y = this._cellHeightAddSpacing * rowNum;
                    }

                    for (let j = 0; j < rowNode.childrenCount; j++) {
                        rowNode.children[j].active = false;
                    }
                }
                let item = rowNode.children[colNum];
                item["index"] = i;
                if (this._dataArr[i]) {
                    let itemX = leftMargin + (this.prefabCellWidth + this.aboutInterVal) * colNum + this.prefabCellWidth / 2 - this._scrollWidth / 2;
                    item.setPosition(itemX, this.prefabCellHeight * 0.5);
                    item.getComponent(this.cellScriptName).updateCell(i + 1, this._totalCount, this._dataArr[i], this._dataObj);
                    item.active = true;
                }
            }
        }
        else if (this.scrollView.horizontal) {
            let rowNum = Math.ceil(Math.abs(original.x / this._cellHeightAddSpacing) - 1);
            if (rowNum < 1) {
                rowNum = 1;
            }
            let idx = 0;
            let startIdx = (rowNum - 1) * this.aLineNum;
            for (let i = startIdx; i < this._spawnCount + startIdx; i++) {
                let item = this._itemList[idx];
                item["index"] = i;
                idx++;
                let anchorY = item.anchorY;
                item.x = this._cellHeightAddSpacing * (i + 0.5);
                item.y = (anchorY - 0.5) * this.prefabCellHeight;
                item.getComponent(this.cellScriptName).updateCell(i + 1, this._totalCount, this._dataArr[i], this._dataObj);
                item.active = true;
            }
        }
    }

    getPositionInView(item) { // get item position in scrollview's node space
        if (!item) {
            return;
        }
        let worldPos = item.parent.convertToWorldSpaceAR(item.position);
        //子界面在滑动界面的坐标
        let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    }


    // 得到最小item
    getMinItem() {
        var minItem = undefined;
        for (let i = 0; i < this._itemList.length; i++) {
            if (minItem == undefined) {
                minItem = this._itemList[i];
            } else {
                if (this.scrollView.vertical) {
                    if (minItem.y > this._itemList[i].y) {
                        minItem = this._itemList[i];
                    }
                } else if (this.scrollView.horizontal) {
                    if (minItem.x > this._itemList[i].x) {
                        minItem = this._itemList[i];
                    }
                }
            }
        }
        return minItem;
    }

    // 得到最大item
    getMaxItem() {
        var maxItem = undefined;
        for (let i = 0; i < this._itemList.length; i++) {
            if (maxItem == undefined) {
                maxItem = this._itemList[i];
            } else {
                if (this.scrollView.vertical) {
                    if (maxItem.y < this._itemList[i].y) {
                        maxItem = this._itemList[i];
                    }
                } else if (this.scrollView.horizontal) {
                    if (maxItem.x < this._itemList[i].x) {
                        maxItem = this._itemList[i];
                    }
                }

            }
        }
        return maxItem;
    }


    // 向上更新
    upItemPosY() {
        let minItem = this.getMinItem();
        let maxItem = this.getMaxItem();
        if (this.scrollView.vertical) {
            if (this._content.anchorY == 1) {
                let minIdx = maxItem.children[0].index - this.aLineNum;
                if (minIdx < 0) {
                    return;
                }
                let pos = this.getPositionInView(minItem);
                let minY = -(this._scrollHeight + this._cellHeightAddSpacing);
                if (pos.y < minY) {
                    minItem.y = maxItem.y + this._cellHeightAddSpacing;
                    for (let i = 0; i < minItem.childrenCount; i++) {
                        let idx = maxItem.children[0].index + i - this.aLineNum;
                        if (this._dataArr[idx] != undefined) {
                            if (idx != minItem.children[i].index) {
                                minItem.children[i].active = true;
                                minItem.children[i].index = idx;
                                minItem.children[i].getComponent(this.cellScriptName).updateCell(idx + 1, this._totalCount, this._dataArr[idx], this._dataObj);
                            }
                        } else {
                            minItem.children[i].index = idx;
                            minItem.children[i].active = false;
                        }
                    }
                    this.upItemPosY();
                }
            } else {
                let maxIdx = maxItem.children[0].index + this.aLineNum;
                if (maxIdx >= this._totalCount) {
                    return;
                }
                let pos = this.getPositionInView(minItem);
                let minY = -this._cellHeightAddSpacing;
                if (pos.y < minY) {
                    minItem.y = maxItem.y + this._cellHeightAddSpacing;
                    for (let i = 0; i < minItem.childrenCount; i++) {
                        let idx = maxItem.children[0].index + i + this.aLineNum;
                        if (this._dataArr[idx] != undefined) {
                            if (idx != minItem.children[i].index) {
                                minItem.children[i].active = true;
                                minItem.children[i].index = idx;
                                minItem.children[i].getComponent(this.cellScriptName).updateCell(idx + 1, this._totalCount, this._dataArr[idx], this._dataObj);
                            }
                        } else {
                            minItem.children[i].index = idx;
                            minItem.children[i].active = false;
                        }
                    }
                    this.upItemPosY();
                }
            }
        } else if (this.scrollView.horizontal) {
            let pos = this.getPositionInView(minItem);
            let minY = -this._cellHeightAddSpacing;
            if (pos.x < minY) {

                let idx = maxItem.index + 1;

                if (this._dataArr[idx] != undefined) {
                    minItem.active = true;
                    minItem.getComponent(this.cellScriptName).updateCell(idx + 1, this._totalCount, this._dataArr[idx], this._dataObj);
                } else {
                    return;
                }
                minItem.index = idx;
                minItem.x = maxItem.x + this._cellHeightAddSpacing;
                this.upItemPosY();
            }
        }
    }

    // 向下更新
    downItemPosY() {

        let minItem = this.getMinItem();
        let maxItem = this.getMaxItem();

        if (this.scrollView.vertical) {
            if (this._content.anchorY == 1) {
                let maxIdx = minItem.children[0].index + this.aLineNum;
                if (maxIdx >= this._totalCount) {
                    return;
                }
                let pos = this.getPositionInView(maxItem);
                if (pos.y > this._cellHeightAddSpacing) {
                    maxItem.y = minItem.y - this._cellHeightAddSpacing;
                    for (let i = 0; i < maxItem.childrenCount; i++) {
                        let idx = minItem.children[0].index + i + this.aLineNum;
                        if (this._dataArr[idx] != undefined) {
                            if (maxItem.children[i].index != idx) {
                                maxItem.children[i].index = idx;
                                maxItem.children[i].active = true;

                                maxItem.children[i].getComponent(this.cellScriptName).updateCell(idx + 1, this._totalCount, this._dataArr[idx], this._dataObj);
                            }
                        } else {
                            maxItem.children[i].index = idx;
                            maxItem.children[i].active = false;
                        }

                    }
                    this.downItemPosY();
                }
            } else {
                let minIdx = minItem.children[0].index - this.aLineNum;
                if (minIdx < 0) {
                    return;
                }
                let pos = this.getPositionInView(minItem);
                if (pos.y > -this._cellHeightAddSpacing) {
                    maxItem.y = minItem.y - this._cellHeightAddSpacing;
                    for (let i = 0; i < maxItem.childrenCount; i++) {
                        let idx = minItem.children[0].index + i - this.aLineNum;
                        if (this._dataArr[idx] != undefined) {
                            if (maxItem.children[i].index != idx) {
                                maxItem.children[i].index = idx;
                                maxItem.children[i].active = true;
                                maxItem.children[i].getComponent(this.cellScriptName).updateCell(idx + 1, this._totalCount, this._dataArr[idx], this._dataObj);
                            }
                        } else {
                            maxItem.children[i].index = idx;
                            maxItem.children[i].active = false;
                        }
                    }
                    this.downItemPosY();
                }
            }
        } else if (this.scrollView.horizontal) {
            let maxPos = this.getPositionInView(maxItem);
            let maxX = (1 - this.scrollView.node.anchorX) * this._scrollWidth + this._cellHeightAddSpacing;
            if (maxPos.x > maxX) {
                let idx = minItem.index;
                if (this._dataArr[idx - 1] != undefined) {
                    maxItem.getComponent(this.cellScriptName).updateCell(idx, this._totalCount, this._dataArr[idx - 1], this._dataObj);
                } else {
                    return
                }

                if (!this._dataArr[idx - 1]) {
                    maxItem.active = false;
                } else {
                    maxItem.active = true;
                }
                maxItem.index = idx - 1;
                maxItem.x = minItem.x - this._cellHeightAddSpacing;
                this.downItemPosY();
            }
        }
    }

    update(dt) {
        //没有滑动变化
        if (this.scrollView.content.y == this._lastContentPosY && this.scrollView.vertical ||
            this.scrollView.content.x == this._lastContentPosX && this.scrollView.horizontal) {

            return;
        }

        if (this._dataArr && this._dataArr.length == 0) {
            return;
        }

        let isDown: boolean = true;
        if (this.scrollView.vertical) {
            isDown = this.scrollView.content.y > this._lastContentPosY;
            this._lastContentPosY = this.scrollView.content.y;
        } else if (this.scrollView.horizontal) {
            isDown = this.scrollView.content.x > this._lastContentPosX;
            this._lastContentPosX = this.scrollView.content.x;
        }


        // 更新lastContentPosY
        var offset = 0
        if (this._curOffset == null) {
            if (this.scrollView.vertical) {
                this._curOffset = this.scrollView.content.y;
            } else if (this.scrollView.horizontal) {
                this._curOffset = this.scrollView.content.x;
            }
            return;
        } else {
            if (this.scrollView.vertical) {
                offset = this._curOffset - this.scrollView.content.y;
                if (Math.abs(offset) >= 10) {
                    this._curOffset = null;
                } else {
                    return;
                }
            } else if (this.scrollView.horizontal) {
                offset = this._curOffset - this.scrollView.content.x;
                if (Math.abs(offset) >= 10) {
                    this._curOffset = null;
                } else {
                    return;
                }
            }

        }

        if (!this._content) {
            return;
        }
        if (isDown == true) {
            this.downItemPosY();

        } else {
            this.upItemPosY();
        }

    }

    // 设置滚到相应位置
    public ScrollTo(index: number, time) {

        if (this._dataArr.length == 0) {
            return;
        }
        let offsetPos = cc.v2(0, 0);
        let maxScrollOffset = this.scrollView.getMaxScrollOffset();
        if (this.scrollView.vertical) {
            let y = 0;
            if (this._content.anchorY == 1) {
                y = this._cellHeightAddSpacing * index;
                if (maxScrollOffset.y < y) {
                    y = maxScrollOffset.y;
                }
            } else if (this._content.anchorY == 0) {
                y = this._cellHeightAddSpacing * index;
                if (maxScrollOffset.y < Math.abs(y)) {
                    y = maxScrollOffset.y;
                }
            }
            offsetPos.y = y;
        } else if (this.scrollView.horizontal) {

        }
        this.scrollView.scrollToOffset(offsetPos, time);
    }

    // 设置滚动位置
    public scrollPos(posY, time) {
        if (this._dataArr.length == 0) {
            return;
        }
        let offsetPos = cc.v2(0, 0);
        let maxScrollOffset = this.scrollView.getMaxScrollOffset();
        if (this.scrollView.vertical) {
            let y = posY;
            if (this._content.anchorY == 1) {
                if (maxScrollOffset.y < y) {
                    y = maxScrollOffset.y;
                }
            } else if (this._content.anchorY == 0) {
                if (maxScrollOffset.y < Math.abs(y)) {
                    y = maxScrollOffset.y;
                }
            }
            offsetPos.y = y;
        } else if (this.scrollView.horizontal) {

        }
        this.scrollView.scrollToOffset(offsetPos, time);
    }
}
