/*
 * @Author: your name
 * @Date: 2021-07-01 17:32:08
 * @LastEditTime: 2021-07-02 12:02:19
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \BasePro\assets\scripts\func\commonTip\GeneralTipView.ts
 */
import UIBase from "../../manage/UIBase";

const {ccclass, property} = cc._decorator;


@ccclass
export default class UIGeneralTip extends UIBase {


    // 初始相当于onLoad
    OnInit () {
    
    }

    //每次显示界面被调用
    public OnShow(...argList) {
        console.log(cc.assetManager.assets)
    }

    // 每秒
    OnUpdateSEC(){

    }

    // 每帧
    OnUpdate(dt){

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData){

    }

    // 关闭回调
    OnClose(){

    }
}