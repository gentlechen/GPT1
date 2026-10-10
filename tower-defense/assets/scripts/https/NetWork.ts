
import GameEvent from "../common/GameEvent";
import UIManager from "../manage/UIManager";
import { ByteArray } from "../lib/ByteArray";
import { MessageType } from "../common/GameEnum";
import { UIPath } from "../common/UIPath";
import MessageMgr from "./MessageMgr";




const {ccclass, property} = cc._decorator;

@ccclass
class NetWork {

    private _webSocket: WebSocket = null;
    private _httpUrl: string = "";
    private _headbeatTimer = null;
    private _successFunc = null;
    private _reConnectTimeInterval = 1000;
    private _reconnectNum = 0;
    private _maxReconnectNum = 3;
    private requestid: number = Date.now() % 20000; // 请求id
    private _ReConnentInterval = 0
    private _repeatTimer = null // 计时器
    private _repeatIndex = 0 ;// 重复次数
    //大包
    private bigPack = [];
    
    // 初始化链接
    public InitWebSocket(host: string, port: string, successFunc: Function){
        console.log("InitWebSocket host={0} post={1}", host, port);
        // 心跳包暂时去了
        //this.OnReload();

        this._successFunc = successFunc;
        this._httpUrl = "ws://"+ host +":" + port;
        this.ConnectNetWork();
    }

    // 重置
    public OnReload(){
        // GameEvent.addEventHandler(Msg.COM_MSG_HEARTBEAT, this.heartbeatCallback, this);// 重试
        //
    }

    // 连接网络
    public ConnectNetWork(){
        if (this._webSocket) {
            if (this._webSocket.readyState == 0 || this._webSocket.readyState == 2) { // 在登陆状态
                console.log("--------- 网络连接状态好")
                return;
            }
        }

        // 暂时去了心跳包
        // if (this._headbeatTimer != null) {
        //     clearInterval(this._headbeatTimer);
        // }
        // this._headbeatTimer = setInterval(this.UpdateHeartbeat.bind(this), this._reConnectTimeInterval);

        this.DisConnect();

        console.log("开始连接:{0}", this._httpUrl);
        this._webSocket = new WebSocket(this._httpUrl);
        this._webSocket.binaryType = 'arraybuffer';
        this._webSocket.onclose = this.OnSocketClose.bind(this);//网络断开 如wifi切换4g
        this._webSocket.onerror = this.OnSocketError.bind(this);
        this._webSocket.onmessage = this.OnSocketMessage.bind(this); 
        this._webSocket.onopen = this.OnSocketOpen.bind(this);
    }

    private OnSocketClose(event: CloseEvent){
        // 关闭socket
        //当连接的WebSocket对象想要关闭或者协议根本不能使用，并且当前的_readyState是State::CLOSING，这个函数被调用
        console.log("ws is closed ");

        this.OnWebSocketEvent("OnSocketClose", event);
        // this.ReConnent();

    }
    private OnSocketError(event: Event){
        // 发生错误
        /*
        1、客户端连接失败；
        2、客户端的request连接不能与服务器建立handshake
        3. 在此调用之后，协议不能使用 ，并且当前_readyState is State::CONNECTING.
        */
        this.OnWebSocketEvent("OnSocketError", event);

        this.SetReConnent(3);

    }
    private OnSocketMessage(message: MessageEvent){
        // 收到消息
        //UIManager.CloseForm("UIWait");
        // let data = JSON.parse(message["data"]);
        // console.log("Recv ", data["MsgID"], data);
        // if (data["MsgID"]) {
        //     Message.MessageProcess(data);
        // }

        let head = {
            messageType: 0,
            srcType: 0,
            srcId: 0,
            descType: 0,
            descId: 0,
            size: 0,
            idx: 0,
            event: '',
            sequence: 0,
            errcode: 0, // response时才有意义
          };

        let byte = new ByteArray(message.data);

        head.messageType = byte.readByte();
        head.srcType = byte.readByte();
        head.srcId = (byte.readInt() << 32) + byte.readInt();
        head.descType = byte.readByte();
        head.descId = (byte.readInt() << 32) + byte.readInt();
        head.size = byte.readShort();
        head.idx = byte.readShort();
        head.event = byte.readString().toLocaleLowerCase();
        head.sequence = byte.readShort();
        head.errcode = byte.readShort();
        let strBody = byte.readString();

        // 大数据包分包判断
        if (head.size > 1) {
            this.bigPack[head.idx] = strBody;
            if (this.bigPack.length == head.size) {
                let bigStrBody = '';
                for (let i = 0; i < head.size; i++) {
                    bigStrBody = bigStrBody + this.bigPack[i];
                }
                strBody = bigStrBody;
                this.bigPack = [];
            } else {
                //消息没接收完，返回等待接收完整
                return;
            }
        }

        let body;
        if(head.errcode){
            body = {"Msg":strBody};
        }
        else{

            body = JSON.parse(strBody);
        }
        

        MessageMgr.MessageProcess(head.event, body);
    }
    private OnSocketOpen(event: Event){
        //当客户端和服务器完成握手连接后，此函数被调用，意味着WebSocket连接准备好了发送数据。
        //当客户端和WebSocket服务器连接成功后，会触发onOpen消息。ws是所连接的WebSocket对象
        console.log("websocket 连接成功");

        this.Send("base.serverinfo", {});
        
        this._maxReconnectNum = 0;
        // UIManager.CloseForm("UIWait");
        if (this._successFunc) {
            this._successFunc();

            this._successFunc = null;
        }
    }

    // 关闭连接网络
    public DisConnect(){
        // 账号登出
        if (this._webSocket) {
            this._webSocket.close(); // 通知服务器关闭连接, 不等待返回， 直接清空sock
            this._webSocket = null;
            console.log("Disconnect(" + this._httpUrl + ")" );
        
        }
    }

    // 重连
    public ReConnent(){

        if(this._ReConnentInterval + 20000 > Date.now()){
            return;
        }

        this._ReConnentInterval = Date.now(); // 间隔2秒才能请求一次重连
        this._reconnectNum = 0;
        this.DisConnect();
        if (this._webSocket) {
            return;
        }
        this.ConnectNetWork();
    }
    
    // 延迟出发重连
    public DelayReConnent(){
        setTimeout(() => {
            if (this.Isopen()) {

            }else{
                this.ReConnent(); 
            }
            
        }, 3000);
    }

    // 设置重连次数
    private SetReConnent(repeatIdx: number){
        if (this._repeatTimer == null) {
            this._repeatTimer = setInterval(()=>{
                if (this.Isopen()) {
                    clearInterval(this._repeatTimer);
                    this._repeatTimer = null
                    this._repeatIndex = 0
                }else{
                    console.log("------ this._repeatIndex = " + this._repeatIndex);
                    if(this._repeatIndex < repeatIdx){
                        this.ReConnent(); 
                        this._repeatIndex ++;
                    }else{
                        this._repeatIndex = 0
                        clearInterval(this._repeatTimer);
                        this._repeatTimer = null
                    }

                }
            }, 5000)
        }
    }

    Isopen() {
        return (null != this._webSocket ? this._webSocket.readyState == WebSocket.OPEN : false);
    }

    // // 发送(暂时没用)
    // public SendOld(msgId: number, data:Object = {}){
    //     //UIManager.ShowForm("UIWait");
    //     if (this._webSocket && this._webSocket.readyState === 1) {
    //         data["MsgID"] = msgId;
    //         this._webSocket.send(JSON.stringify(data));
    //         let key = "Send message " + msgId;
    //         console.log(key, data);
    //         return;
    //     }else {
    //         console.log("网络断开");
    //         // 触发重连

    //         this.DelayReConnent()
    //     }
    // }

    // 外部调用
    /**
     * @description: 
     * @param {string} event        //数据类型
     * @param {any} message         //消息体
     * @return {*}
     */
    public Send(event: string, message: any){

        if (this._webSocket && this._webSocket.readyState === 1) {
            
            console.log("network send " + event);
            console.log(message);
            this.requestid ++;
            this.Write(MessageType.Request, event, this.requestid, message);
        }else{
            // 触发重连
            this.DelayReConnent()

            UIManager.ShowForm(UIPath.UIFlyTip, "网络断开连接");
        }
        
    }

    // 写入包
    private Write(messageType: number, event: string, sequence: number, message: any){
        // 创建ByteArray对象

        let byte = new ByteArray();
        byte.writeByte(messageType); //消息类型
        byte.writeShort(sequence); //消息序列号
        byte.writeString(event); //数据类型
        byte.writeString(JSON.stringify(message)); //消息体
        //发送数据
        this._webSocket.send(byte.getbytes());

    }

    // 心跳包
    public UpdateHeartbeat(){
        if (this._maxReconnectNum > 3) {
            return;
        }
        this._reconnectNum += 1;
        if (this._reconnectNum == 15) {
            UIManager.ShowForm("UIWait");
        }else if (this._reconnectNum > 30) {
            this._maxReconnectNum +=1;
            this.ReConnent();
            return;
        }

        // if (this._reconnectNum / 10 == 1 || this._reconnectNum / 10 == 2 || this._reconnectNum / 10 == 3) {
        //     this.Send(Msg.COM_MSG_HEARTBEAT, {});
        // }

        if (this._reconnectNum == 10) {
            // this.Send(Msg.COM_MSG_HEARTBEAT, {});
        }
    }

    public heartbeatCallback(){
        this._reconnectNum = 0;
        console.log("收到心跳包");
    }

    // 事件处理
    public OnWebSocketEvent(eventName, event){
        console.log("---------- eventName = ", eventName);
        switch(eventName){
            case "OnSocketClose":
                UIManager.ShowForm(UIPath.UIFlyTip, "网络断开连接");
                console.error("网络断开连接");
            case "OnSocketError":
                console.error("网络连接错误");
            default:
                break;
        }
    }
}

export default new NetWork();
