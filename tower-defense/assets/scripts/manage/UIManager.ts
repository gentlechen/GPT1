import ResourceLoader from "../utils/ResourceLoader";
/*
 * @Author: your name
 * @Date: 2021-06-28 11:24:01
 * @LastEditTime: 2021-07-09 10:43:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \BasePro\assets\scripts\manage\UIManager.ts
 */

import { UIPath } from "../common/UIPath";



class UIManager {

    private data = {};
    private loadedLayerDict = {};

    // private _uiPath = "prefab/";
    private _creatingList = [];
    private _timer = null;
    private _preLoadView = {};

    // public _isClearCache = false; // 是否清理缓存

    // 打开界面/
    public ShowForm(...argList) {
        let uiPath = argList.shift();
        let uiArr = uiPath.split("/");
        let layerName = uiArr[uiArr.length - 1];

        // this.data = argList;
        if (argList && argList.length >= 1) {
            // if(this.data[uiPath] == null){
            //     this.data[uiPath] = [];
            // }
            // this.data[uiPath].push(argList[0]) 
            this.data[uiPath] = argList
        }

        // let layerPath = this._uiPath + uiPath;
        let layerPath = uiPath;
        if (this._creatingList[layerPath]) {
            console.log("creating interface " + uiPath);
            return;
        }
        this._creatingList[layerPath] = "value";
        if (this.loadedLayerDict.hasOwnProperty(layerPath)) {
            let instance = this.loadedLayerDict[layerPath]["instance"];
            if (instance) {
                let prefab = this.loadedLayerDict[layerPath]["prefab"];
                this.LoadFinish(instance, layerPath, layerName, prefab);
            } else {
                this.LoadDynamicView(layerPath, layerName, this.LoadFinish.bind(this));
            }
        } else {
            this.LoadDynamicView(layerPath, layerName, this.LoadFinish.bind(this));
        }

        // this.OpenTimerClearCache();
    }

    private LoadFinish(instance, layerPath, layerName, prefab = null) {
        if (prefab) {
            if (!this.loadedLayerDict[layerPath]) {
                prefab.addRef();
                this.loadedLayerDict[layerPath] = { "instance": instance, "prefab": prefab, "index": 1 };
            } else {
                this.loadedLayerDict[layerPath]["index"]++;
            }
        } else {

            if (!this.loadedLayerDict[layerPath]) {
                this.loadedLayerDict[layerPath] = { "instance": instance };
            }
        }
        let baseCom = instance.getComponent(layerName);
        if (baseCom == null) {
            console.error("The %s class has no ", layerName)
        }
        if (baseCom.OnShow) {
            // if(this.data[layerPath] && this.data[layerPath].length > 0){
            if (this.data[layerPath]) {
                let layerData = this.data[layerPath]
                this.data[layerPath] = null
                baseCom.ShowForm(layerName, layerData, layerPath);
            } else {
                baseCom.ShowForm(layerName, null, layerPath);
            }

            console.log("Create %s", layerName);
        } else {
            console.error("The %s class has no Show function", layerName)
        }
        delete this._creatingList[layerPath];
    }

    // 开启计时器清理缓存
    private OpenTimerClearCache() {
        if (!this._timer) {
            this._timer = setInterval(() => {
                for (const key in this.loadedLayerDict) {
                    if (Object.prototype.hasOwnProperty.call(this.loadedLayerDict, key)) {
                        if (this.loadedLayerDict[key]["index"] <= 0) {
                            this.loadedLayerDict[key]["prefab"].decRef();
                            this.loadedLayerDict[key]["instance"].destroy();
                            delete this.loadedLayerDict[key];
                            delete this._preLoadView[key];
                        }

                    }
                }
            }, 360000);
        }
    }

    // 清理缓存
    public ClearCache(layerPath: string) {
        if (this.loadedLayerDict[layerPath] == null) {
            return;
        }

        if (this.loadedLayerDict[layerPath]["index"] > 0) {
            this.loadedLayerDict[layerPath]["index"]--;
        }
        // this.loadedLayerDict[layerPath]["prefab"].decRef();
        // this.loadedLayerDict[layerPath]["prefab"] = null;
        // this.loadedLayerDict[layerPath]["instance"] = null;
        // delete this.loadedLayerDict[layerPath];

    }

    // 关闭界面
    public CloseForm(layerName) {
        // let layerPath = this._uiPath + layerName;
        let layerPath = layerName;
        if (this.loadedLayerDict.hasOwnProperty(layerPath)) {
            let prefab = this.loadedLayerDict[layerPath]["instance"];
            let prefabsPathList = layerName.split("/")
            let num = prefabsPathList.length
            let prefabsName = prefabsPathList[num - 1]
            let baseCom = prefab.getComponent(prefabsName);
            baseCom.CloseForm(layerName);

            // delete this.loadedLayerDict[layerPath];
        } else {
            console.log("No interface %s was created", layerName);
        }
    }


    /**
     * 动态加载界面（不是界面别调用）
     *
     * @param {资源路径} resPath
     * @param {回调} callback
     */
    LoadDynamicView(resPath: string, uiName: string, callback: Function) {

        if (this._preLoadView[resPath]) {
            let prefab = this._preLoadView[resPath];
            let layer = cc.instantiate(prefab);
            if (layer) {
                callback(layer, resPath, uiName, prefab);
            }
        } else {
            ResourceLoader.load(resPath,
                (err, prefab) => {
                    if (err) {
                        console.error("加载失败 ：" + resPath);
                        console.error(err);
                        return;
                    }
                    let layer = cc.instantiate(prefab);
                    if (layer) {
                        callback(layer, resPath, uiName, prefab);
                    }
                }
            )
        }
    }

    // 资源预加载(可以外部调用)
    preLoadDynamicView(resPath: string, callback) {

        ResourceLoader.load(resPath,
            (err, prefab) => {
                if (err) {
                    console.error("加载失败 ：" + resPath);
                    console.error(err);
                    return;
                }
                this._preLoadView[resPath] = prefab;
                if (callback) {
                    callback();
                }
            }
        )
    }

    // 界面等级大于等于3
    // 关闭其他界面
    closeOther(viewName = "") {
        let parent = cc.find("Canvas/UILayer");
        let deletePathArr = [];
        let childCount = parent.childrenCount;
        for (let i = 0; i < childCount; i++) {
            let nowViewName = parent.children[i].name;
            let classc = parent.children[i].getComponent(nowViewName);
            if (viewName != UIPath[nowViewName] && classc) {
                let zorderLv = classc.zorderLv;
                if (zorderLv >= 3) {
                    let uiPath = UIPath[nowViewName];
                    deletePathArr.push(uiPath);
                }
            }
        }
        for (let i = 0; i < deletePathArr.length; i++) {
            this.CloseForm(deletePathArr[i]);
        }
    }

    // 清理所有缓存
    clearAllCache() {
        for (const key in this.loadedLayerDict) {
            if (Object.prototype.hasOwnProperty.call(this.loadedLayerDict, key)) {
                this.loadedLayerDict[key]["prefab"].decRef();
                this.loadedLayerDict[key]["instance"].destroy();
                delete this.loadedLayerDict[key];
                delete this._preLoadView[key];
            }
        }
    }

    // 获得界面的类
    public getViewClass(layerName) {
        let layerPath = layerName;
        if (this.loadedLayerDict.hasOwnProperty(layerPath)) {
            let prefab = this.loadedLayerDict[layerPath]["instance"];
            let prefabsPathList = layerName.split("/")
            let num = prefabsPathList.length
            let prefabsName = prefabsPathList[num - 1]
            let baseCom = prefab.getComponent(prefabsName);
            return baseCom;
        } else {
            return null;
        }
    }

    // 判断是否打开界面
    public isOpenViewByName(viewPath) {
        let viewList = viewPath.split('/');
        let len = viewList.length;
        let viewName = viewList[len - 1];
        let parent = cc.find("Canvas/UILayer");
        let viewPrefab = parent.getChildByName(viewName);
        return viewPrefab;
    }
}

export default new UIManager();