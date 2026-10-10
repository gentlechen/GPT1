/*
 * @Author: your name
 * @Date: 2021-07-02 10:57:11
 * @LastEditTime: 2021-07-08 13:41:22
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \BasePro\assets\scripts\utils\NotiveUtils.ts
 */
import UIManager from "../manage/UIManager";

class NotiveUtils {

        /**
     * 对话框
     *
     * @param {内容} str
     * @param {Function} [sureFunc=null]
     * @param {Function} [cancelFunc=null]
     * @memberof Utils
     */
    public Dialogue(str, sureFunc:Function = null, cancelFunc:Function = null){
        UIManager.ShowForm("UIPromptBox", str, sureFunc, cancelFunc);
    }
    
    /**
     * 显示物品详情
     *
     * @param {cc.Node} node  点击的node
     * @param {number} itemId  物品id
     * @param {cc.Vec2} pos  物品详情界面位置
     * @memberof UtilsMgr
     */
    public ShowGoodsInfoView(node: cc.Node, itemId: number, pos: cc.Vec2 = cc.v2(0,0)){
        let isGoods = true;
        node.off(cc.Node.EventType.TOUCH_START);
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            //UtilsMgr.OpenItmeInfoView(6, cc.v2(0, -300));
            UIManager.ShowForm("UIItemInfo", itemId, pos, node, isGoods);
        })
        node.on(cc.Node.EventType.SIZE_CHANGED, function (event) {
            UIManager.CloseForm("UIItemInfo");
        })
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            UIManager.CloseForm("UIItemInfo");
        })
    }
    
    /**
     * 显示物品详情
     *
     * @param {cc.Node} node  点击的node
     * @param {number} content  内容
     * @param {cc.Vec2} pos  物品详情界面位置
     * @memberof UtilsMgr
     */
    public ShowTipInfoView(node: cc.Node, content: string, setHeight = null, pos: cc.Vec2 = cc.v2(0,0)){
        let isGoods = false;
        node.off(cc.Node.EventType.TOUCH_START);
        node.off(cc.Node.EventType.TOUCH_CANCEL);
        node.off(cc.Node.EventType.TOUCH_END);
        node.on(cc.Node.EventType.TOUCH_START, function (event) {
            //UtilsMgr.OpenItmeInfoView(6, cc.v2(0, -300));
            UIManager.ShowForm("UIItemInfo", content, pos, node, isGoods, setHeight);
        })
        node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            UIManager.CloseForm("UIItemInfo");
        })
        node.on(cc.Node.EventType.TOUCH_END, function (event) {
            UIManager.CloseForm("UIItemInfo");
        })
    }

}

export default new NotiveUtils();