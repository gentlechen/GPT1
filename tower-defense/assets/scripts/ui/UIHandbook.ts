import DLocal from "../data/DLocal";
import UIBase from "../manage/UIBase";
import { TableView } from "../utils/TableView";

const { ccclass, property } = cc._decorator;


@ccclass
export default class UIHandbook extends UIBase {

    @property(TableView)
    private monsterTableView: TableView = null;
    @property(cc.SpriteAtlas)
    private handbookAtlas: cc.SpriteAtlas = null;

    private _monsterList = [];
    private _bossList = [];

    // 初始相当于onLoad
    OnInit() {
        this.getMonsterAndBossData();
    }

    //每次显示界面被调用
    public OnShow(...argList) {
        this.updateHandbook("tgMonster");
    }

    // 初始化label
    initLab() {

    }

    // 获取怪物和boss数据
    getMonsterAndBossData() {
        let tempMonsterList = [];
        let tempBossList = [];
        let monsterCfg = DLocal.GetCfgData("gwtj");
        for (const key in monsterCfg) {
            if (monsterCfg[key]) {
                if (monsterCfg[key].gwlx == 1) { // 1 普通怪物
                    tempMonsterList.push({ "id": key, "cxzj": monsterCfg[key].cxzj });
                } else if (monsterCfg[key].gwlx == 2) { // 2 boss
                    tempBossList.push({ "id": key, "cxzj": monsterCfg[key].cxzj });
                }
            }
        }
        tempMonsterList.sort((itmeA, itemB) => {
            if (itmeA.cxzj > itemB.cxzj) {
                return 1;
            } else if (itmeA.cxzj < itemB.cxzj) {
                return -1;
            } else {
                if (itmeA.id > itemB.id) {
                    return 1;
                } else {
                    return -1;
                }
            }
        })
        tempBossList.sort((itmeA, itemB) => {
            if (itmeA.cxzj > itemB.cxzj) {
                return 1;
            } else if (itmeA.cxzj < itemB.cxzj) {
                return -1;
            } else {
                if (itmeA.id > itemB.id) {
                    return 1;
                } else {
                    return -1;
                }
            }
        })
        let itemList = [];
        let recordCXZJ = 0;
        for (let i = 0; i < tempMonsterList.length; i++) {
            if (tempMonsterList[i].cxzj != recordCXZJ) {
                if (itemList.length > 0) {
                    this._monsterList.push({ "itemType": 2, "cxzj": recordCXZJ, "data": itemList })
                    itemList = [];
                }
                recordCXZJ = tempMonsterList[i].cxzj;
                let name = DLocal.GetCfgData("gwtj")[tempMonsterList[i].id].zjmc;
                this._monsterList.push({ "itemType": 1, "cxzj": recordCXZJ, "name": name })
            }
            itemList.push(tempMonsterList[i].id);
            if (itemList.length == 3 || i == tempMonsterList.length - 1) {
                this._monsterList.push({ "itemType": 2, "cxzj": recordCXZJ, "data": itemList });
                itemList = [];
            }
        }
        let itemList1 = [];
        let recordCXZJ1 = 0;
        for (let i = 0; i < tempBossList.length; i++) {
            if (tempBossList[i].cxzj != recordCXZJ1) {
                if (itemList1.length > 0) {
                    this._bossList.push({ "itemType": 2, "cxzj": recordCXZJ1, "data": itemList1 })
                    itemList1 = [];
                }
                recordCXZJ1 = tempBossList[i].cxzj;
                let name = DLocal.GetCfgData("gwtj")[tempBossList[i].id].zjmc;
                this._bossList.push({ "itemType": 1, "cxzj": recordCXZJ1, "name": name })
            }
            itemList1.push(tempBossList[i].id);
            if (itemList1.length == 3 || i == tempBossList.length - 1) {
                this._bossList.push({ "itemType": 2, "cxzj": recordCXZJ1, "data": itemList1 });
                itemList1 = [];
            }
        }
    }

    // 更新图鉴
    updateHandbook(btnName) {
        let data = [];
        if (btnName == "tgMonster") {
            data = this._monsterList;
        } else if (btnName == "tgBoss") {
            data = this._bossList;
        }
        this.monsterTableView.init(data, this, { "atlas": this.handbookAtlas })
    }

    // 每秒
    OnUpdateSEC() {

    }

    // 每帧
    OnUpdate(dt) {

    }

    // 按钮回调
    OnClick(btnName, btnNode, eventData) {
        if (btnName == "tgMonster") {
            this.updateHandbook(btnName);
        } else if (btnName == "tgBoss") {
            this.updateHandbook(btnName);
        }
    }

    // 关闭回调
    OnClose() {

    }
}