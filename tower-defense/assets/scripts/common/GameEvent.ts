




class GameEvent {

    TEST_MESSAGE: string = "TEST_MESSAGE";
    TEST_MESSAGE1: string = "TEST_MESSAGE1";
    TEST_MESSAGE2: string = "TEST_MESSAGE2";

    MSG_LOGIN = "login" // 通知登陆
    MSG_UPDATE_NEW_APK = "updateNewApk"; // 换包
    MSG_UPDATE_HOT = "updateHot"; // 热更
    MSG_UPDATE_PROGRESS = "updateProgress"; // 更新进度
    MSG_UPDATE_RETRY = "updateRetry"; // 更新失败重试
    MSG_SHOW_LOADING = "loading"; // 显示loading界面


    private handlers = {};

    initMessageProtocol() {
        this.handlers = {};

    }


    dispatchEvent(event: any, data: any = null) {
        event = "" + event;
        if (this.handlers[event] && this.handlers[event].length) {
            console.log("HANDLER " + event);

            let handlersNum = this.handlers[event].length;
            for (let i = 0; i < handlersNum; i++) {
                if (this.handlers[event][i] && this.handlers[event][i].callback) {
                    this.handlers[event][i].callback(data)
                }
            }
            let handlersNum1 = this.handlers[event].length;
            for (let i = 0; i < handlersNum1; i++) {
                if (this.handlers[event][i] == null) {
                    this.handlers[event].splice(i, 1);
                }
            }
        }
        else {
            console.log("NO HANDLER " + event);
        }
    }

    addEventHandler(event: any, callback: Function, target: any) {
        event = "" + event;
        let isAdd = false;
        if (this.handlers[event]) {
            for (let i = 0; i < this.handlers[event].length; i++) {
                var element = this.handlers[event][i];
                if (element) {
                    if (element.target == target) {
                        isAdd = true;
                        this.handlers[event][i] = { callback: callback, target: target };
                        break;
                    }

                }
            }
        }
        if (isAdd == false) {
            if (this.handlers[event]) {
                this.handlers[event].push({ callback: callback, target: target });
            } else {
                this.handlers[event] = [];
                this.handlers[event].push({ callback: callback, target: target });
            }
        }
    }

    removeEventHandler(event: string, target: any) {
        // console.log("removeEvent: " + event);
        if (this.handlers[event]) {
            for (let i = 0; i < this.handlers[event].length; i++) {
                var element = this.handlers[event][i];
                if (element && element.target == target) {
                    this.handlers[event].splice(i, 1);
                    break;
                }
            }
        }
    }

    // 移除这个界面的所有消息
    removeLayerAllEvent(target: any) {

        for (const key in this.handlers) {
            if (Object.prototype.hasOwnProperty.call(this.handlers, key)) {
                let msgList = this.handlers[key];
                if (msgList.length == 0) {
                    delete this.handlers[key];
                } else {
                    for (let i = 0; i < msgList.length; i++) {
                        if (msgList[i] && msgList[i].target == target) {
                            msgList[i] = null;
                            // msgList.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }
    }

    GetHand() {
        return this.handlers;
    }
}


export default new GameEvent();
