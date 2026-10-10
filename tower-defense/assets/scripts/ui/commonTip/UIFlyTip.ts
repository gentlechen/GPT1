/*
 * @Author: your name
 * @Date: 2021-07-02 12:00:23
 * @LastEditTime: 2021-07-08 11:21:23
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \BasePro\assets\scripts\func\commonTip\UIFlyTip.ts
 */
import UIBase from "../../manage/UIBase";



const {ccclass, property} = cc._decorator;

@ccclass
export default class UIFlyTip extends UIBase {

    @property(cc.Node)
    flyList: cc.Node[] = [];

    stepTime = 0;
    timeInterval = 0.5;
    _recordTime = 0;
    _data = [];
    private _startPosY = 0;
    private _endPosY = 360;
    private _timeInterval = 0.2 // 时间间隔
    private _totalTime = 0;  // 累计时间
    

    onLoad () {
    }



    public OnShow(argList){
        this.SetExplain(argList);
    }

    public SetExplain(str){

        if (str) {
            this._data.push(str);
        }
              
        // this.playFlyAction();
    }

    private playFlyAction(){
        
        let index = this.GetItemIdx();
        if (index != null && this._data.length > 0) {
            this.TipAction(index);
        }
    }

    // 获取当前没有用的
    private GetItemIdx(){
        for (let i = 0; i < this.flyList.length; i++) {
            if (this.flyList[i].active == false) {
                return i;
            }            
        }
        return;
    }

    private CloseFunc(){
        for (let i = 0; i < this.flyList.length; i++) {
            if (this.flyList[i].active == true) {
                return;
            }            
        }
        this.CloseForm();
    }

    private TipAction(index){
        let labContent = this.flyList[index].getChildByName("labcontent")
        labContent.getComponent(cc.Label).string = this._data.shift();

        labContent.on(cc.Node.EventType.SIZE_CHANGED, ()=>{
            this.flyList[index].width = labContent.width + 180

        })

        this.flyList[index].active = true;
        var movBy=cc.moveBy(1.2,cc.v2(0, this._endPosY));
        var time = cc.delayTime(0.5);
        var fade = cc.fadeOut(0.5);//2秒淡出
        var fun = cc.callFunc(function(){
            this.flyList[index].position = cc.v2(0,this._startPosY);
            this.flyList[index].opacity = 255;
            this.flyList[index].active = false;  
            //if (this._data.length > 0) {
                // this.playFlyAction();
            //} 

            // this.CloseFunc();
        }.bind(this));
        var seq1 = cc.sequence([movBy, time, fade, fun]);
        this.flyList[index].runAction(seq1);
    }

    OnUpdate(dt){
        this._totalTime += dt;
        if(this._totalTime > this._timeInterval){
            if(this._data.length > 0){
                this.playFlyAction();
            }           
            this._totalTime = 0;
        }
    }
}
