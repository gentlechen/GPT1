import DLocal from "../data/DLocal";
import Utils from "../utils/Utils";


class FrameMgr{

    private _framePrefab = null; // 通用的icon

    // 加载通用icon
    public GetCommonFrameWithData(data, callback){
        if (this._framePrefab == null) {
            Utils.LoadRes("prefabs/items/CommonItem", this, (prefab)=>{
                this._framePrefab = prefab;
                let comItem = cc.instantiate(prefab);
                this.LoadFrame(comItem, data);

                if (callback) {
                    callback(comItem)
                }

            }, cc.Prefab)
        }else{
            let comItem = cc.instantiate(this._framePrefab);
            this.LoadFrame(comItem, data);

            if (callback) {
                callback(comItem)
            }
        }

    }

    // 加载数据
    private LoadFrame(frameInstant, data){

        let scripts = frameInstant.getComponent("CommonItem");

        let uniformitemData = DLocal.GetCfgData("uniformitem")[data.uniformId];
        console.log("------ uniformitemData.Type = " + uniformitemData.Type);
        if (uniformitemData.Type == "Item" || uniformitemData.Type == "Gold" || uniformitemData.Type == "Crystal") {
            
            Utils.LoadRes("ui/icon/itemAtlas", this, (atlas)=>{
                
                let iconName = uniformitemData.Icon.replace("_png", "")
                let imgFrameName = "iconbg" + uniformitemData.QualityBorder;
                
                console.log("iconName = " + iconName);
                console.log("imgFrameName = " + imgFrameName);
                let icon = atlas.getSpriteFrame(iconName);
                let frame = atlas.getSpriteFrame(imgFrameName);

                let sign = null;
                if (uniformitemData.PropSelectId && uniformitemData.PropSelectId != "") {
                    console.log(atlas);
                    sign = atlas.getSpriteFrame("img_dailyTip");
                }
                scripts.LoadGoodsInfo(frame, icon, data.count, sign);

            }, cc.SpriteAtlas)
        } else {
            
        }
        
    }
}

export default new FrameMgr();