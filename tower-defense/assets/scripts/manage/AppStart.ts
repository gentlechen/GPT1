/*
 * @Author: your name
 * @Date: 2021-06-28 11:24:01
 * @LastEditTime: 2021-07-08 18:19:09
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \BasePro\assets\scripts\manage\AppStart.ts
 */
import { ResetFunc } from "./ResetFunc";
import AudioMgr from "./AudioMgr";
//import * as pako from "../gzip/pako.js";
import GameLan from "../common/GameLan";
import Utils from "../utils/Utils";
import DLocal from "../data/DLocal";
import Config from "../Config";
import SDKMgr from "../sdk/SDKMgr";



export default class AppStart {

    private static _install = null;

    public static getInstance() {
        if (this._install == null) {
            this._install = new AppStart();
        }
        return this._install;
    }

    // 检测热更之前初始化
    public UpdateBeforeInit() {

        // cc.view.enableAntiAlias(false); // 关闭锯齿
        cc.macro.ENABLE_CULLING = false; // 禁用引擎的culling
        cc.macro.ENABLE_MULTI_TOUCH = false; // 关闭多点触摸
        //设置游戏帧率
        // cc.game.setFrameRate(30);

        // 重写一些引擎函数
        ResetFunc.getInstance();
        this.InitData(); // 初始化本地数据
        // 初始化网络
        // this.InitNetWork();
        // 音乐初始化
        this.setMusic();
        // 语言包初始化
        GameLan.initLan();
        // 初始化sdk
        SDKMgr.InitSdk()
    }

    // 数据管理初始化
    private InitData() {
        DLocal.InitData();

        if (Utils.IsWeChatGame()) {
            wx.setKeepScreenOn({ // 不会黑屏
                keepScreenOn: true
            });
        }

    }

    // 界面显示
    public Show() {


    }

    // 网络连接
    private InitNetWork() {

        Utils.HttpRequestGET(Config.NetPath, (data) => {
            Config.NetServerList = data;
        })
    }

    // 热更之后初始化
    public UpdateAfterInit() {
        // 数据表初始化
        this.OnLoadTable();
    }


    //音乐
    setMusic() {
        AudioMgr.initAudio();
    }

    // 加载表格数据
    public OnLoadTable() {


        // let url = cc.url.raw("resources/configs/excel_to_txt.bin");
        // Utils.LoadRemoteRes(url, (data)=>{
        //     var byteArray = new Uint8Array(data["_buffer"]);
        //     let configdata:string = UtilsMath.Utf8ArrayToStr(pako.ungzip(byteArray));
        //     let nametab = configdata.split("☠");
        //     for (const key in nametab) {
        //         const element = nametab[key];
        //         let fileList = element.split("※");
        //         SysDataMgr.SaveTable(fileList[0], fileList[1])
        //         // this.allTableDataDict[kv[0]] = { Data: {text: kv[1]}, KeyNameList: null };  //兼容旧代码！！！有空要优化。
        //     }

        //     setTimeout(() => {
        //         cc.assetManager.releaseAsset(data);
        //     }, 100);
        // });
    }

}
