


import GameEvent from "../common/GameEvent";
import Msg from "../common/Msg";
import Utils from "../utils/Utils";


class MessageMgr {

    public MessageProcess(eventName, data) {

        console.log("-------- eventName = " + eventName)
        console.log(data)

        // // 数据处理
        // if (eventName == Msg.SERVERINFO) { // 服务器信息
        //     LoginData.SetServerTimeNOwWithLogin(data);
        // }


        GameEvent.dispatchEvent(eventName, data);
    }
}
export default new MessageMgr();
