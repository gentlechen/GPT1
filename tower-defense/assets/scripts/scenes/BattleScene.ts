import SceneBase from "../manage/SceneBase";



const {ccclass, property} = cc._decorator;

@ccclass
export default class BattleScene extends SceneBase {



    // onLoad () {}

    start () {
        console.log(cc.assetManager.assets)
    }

    // update (dt) {}
}
