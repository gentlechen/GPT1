import ResourceLoader from "../utils/ResourceLoader";
import { UIPath } from "../common/UIPath";



class DLocal {

    private _setting = null;
    private _level = 1;
    private _allConfig = null;  // 所有的配置表
    private _configNameList = [];  // 所有的配置表的名字
    private _allConfigData = {}; // 所有的数据表
    private _configFinishNum = 0;   // 加载表格完成数量
    private _preLoadAtlas = {}; // 预加载的图集
    private _jobCardData = {}; // 处理后的数据表
    private _dynamicRes = {};  // 动态加载的资源
    private _loadingRes = {};  // 正在动态加载的资源
    private _clearTimer = null; // 清理定时器
    private _finishFunc = null; // 完成

    private _saveMusicConfigKey = "musicConfigKey"; // 音乐配置
    private _saveHeroKey = "saveHeroKey2"; // 拥有的英雄key
    private _saveLevelKey = "saveLevelKey1"; // 当前关卡key
    private _saveGoldKey = "saveGoldKey"; // 当前金币key
    private _saveDiamondKey = "saveDiamondKey"; // 当前金币key
    private _saveLevelRewardKey = "saveLevelRewardKey"; // 关卡奖励key
    private _saveDrawCardBoxKey = "saveDrawCardBoxKey"; // 每日抽卡宝箱广告次数key
    private _saveJXAdNumKey = "saveJXAdNumKey"; // 每日精选广告次数key
    private _saveJXGoodsListKey = "saveJXGoodsListKey2"; // 每日精选商品列表key
    private _saveGoldAdNumKey = "saveGoldAdNumKey"; // 金币广告次数key
    private _saveDiamondAdNumKey = "saveDiamondAdNumKey"; // 金币广告次数key
    private _saveSeeAdNumKey = "saveSeeAdNumKey"; // 看广告次数key
    private _saveCopySLNumKey = "saveCopySLNumKey"; // 每日副本试炼次数key
    private _saveLimitHeroKey = "saveLimitHeroKey"; // 限制英雄key
    private _saveLimitHeroSelectIdxKey = "saveLimitHeroSelectIdxKey"; // 限制英雄key
    private _saveNowHangUpTimeKey = "saveNowHangUpTimeKey"; // 当前挂机时间key
    private _saveQuickHangUpAdCountKey = "saveQuickHangUpAdCountKey"; // 快速挂机广告次数key
    private _saveAdBoxKey = "saveAdBoxKey"; // 广告宝箱
    private _saveRecvBoxDay = "saveRecvBoxDay"; // 领取宝箱第几天
    private _saveEverySignInDay = "saveEverySignInDay"; // 每日签到
    private _saveMainBoxKey = "saveMainBoxKey"; // 主线宝箱
    private _saveQuickHangUpTotalCount = "saveQuickHangUpTotalCount"; // 快速挂机总次数
    private _saveNowDayLevel = "saveNowDayLevel"; // 快速挂机总次数
    private _saveGuildChapterKey = "saveGuildChapter"; // 新手引导章节
    private _saveShopDiamondDataKey = "saveShopDiamondDataKey"; // 钻石商城领取信息
    private _saveCopyLevelKey = "saveCopyLevelKey"; // 副本章节
    private _saveTaskBoxKey = "saveTaskBoxKey"; // 任务宝箱
    private _saveTaskRecvKey = "saveTaskRecvKey"; // 任务领取列表
    private _saveTaskDataKey = "saveTaskDataKey"; // 任务数据列表
    private _saveAchievementTaskDataKey = "saveAchievementTaskDataKey"; // 成就任务数据
    private _saveRecvTaskData = "saveRecvTaskDataKey"; // 领取任务
    private _saveAchievementRecvTaskDataKey = "_saveAchievementRecvTaskDataKey"; // 成就领取任务

    private _heroList = []; // 英雄列表
    private _gameLevel = 10001; // 游戏普通关卡
    private _gameEliteLevel = 11001; // 游戏精英关卡
    private _gameDifficulty = 12001; // 游戏困难关卡
    private _goldNum = 8000; // 金币数量
    private _diamondNum = 2000; // 钻石数量
    private _recordLevelRewardMap = {}; // 记录关卡奖励

    private _seeAdNum = 0; // 看广告次数

    private _limitSecectIdx = 0; // 当前使用哪个挡位限制
    private _limitHeroMap = {}; // 所有的限制英雄
    private _mainBoxMap = {};// 主线宝箱领取数据

    private _warshipBaseBlood = 3000; // 战舰基础血量
    private _battleSuspend = false; // 战斗是否暂停

    private _skillList = [];
    private _guildList = {}; // 引导数据
    private _nowGuildChapterMap = {}; // 新手引导当前章节
    private _guildChapterIdx = 1; // 当前章节
    private _copyLeveLMap = {};
    private _allLevelMap = {}; // 所有的关卡数据
    private _allLevelList = {}; // 所有的关卡数据
    private _allOneLevelHeroList = []; // 所有的一级英雄


    InitData() {
        this._setting = {
            bgm_volum: 1,     // 音乐音量
            sfx_volum: 1,       // 音效音量
            bgm_switch: 1,    // 音乐开关
            sfx_switch: 1,      // 音效开关           
        }

        this.loadSetting();
        this.initGuildData();
        this.initGuildChapter();
        // this.TimingClearRes();
        this.initCopyChapter();
        this.initHeroList();
        this.initLevelData();
        this.initGold();
        this.initDiamond();
        this.initLevelReward();
        this.initLimitHero();
        this.initLimitHeroSelectIdx();
        this.initHangUpTime();
        this.initMainBox();

    }

    loadSetting() {

        let setData = cc.sys.localStorage.getItem(this._saveMusicConfigKey);
        var storagestr = null;
        if (setData) {
            storagestr = JSON.parse(setData);
        }


        if (storagestr != null) {
            for (var key in storagestr) {
                this._setting[key] = storagestr[key];
            }
        }
        var level = cc.sys.localStorage.getItem("level");
        if (level != null) {
            this._level = Number(level);
        }

    }

    // 获得音乐配置
    getMusicConfig() {
        return this._setting;
    }

    // 设置音乐配置
    setMusicConfig(misicConfig) {
        this._setting = misicConfig;
        cc.sys.localStorage.setItem(this._saveMusicConfigKey, JSON.stringify(this._setting));
    }

    // 初始化配置表
    public InitConfig(finishFunc) {

        this._finishFunc = finishFunc;
        this._configFinishNum = 0 // 初始化完成数量0
        // let beginTime = Date.now() / 1000
        if (this._allConfig) {
            console.error("配置表已经加载完成")
            return
        }

        // console.log("----------------内存之前  ")
        // console.log(cc.assetManager.assets)
        ResourceLoader.load("dataconfig/allconfig", (err: Error, zipData: any) => {

            // let time1 = Date.now() / 1000
            //解析
            JSZip.loadAsync(zipData["_buffer"]).then((zip) => {
                // let time2 = Date.now()/1000
                // console.log("config  时间2 = ", time2 - beginTime)
                this._allConfig = zip;

                cc.assetManager.releaseAsset(zipData);
                zipData = null;
                // zipData.decRef();
                // console.log(zipData["_buffer"])
                this.LoadConfigData();
            });
        });
    }

    // 加载配置表
    private LoadConfigData() {

        if (this._allConfig == null) {
            return;
        }
        let wholePath = "fileList.json";
        this._allConfig.file(wholePath).async("text").then((data) => {
            //string转成json格式
            let fileList = (JSON.parse(data)).fileList;
            let totalCount = fileList.length;
            for (let i = 0; i < fileList.length; i++) {
                let fileName = fileList[i] + ".json"
                this._allConfig.file(fileName).async("text").then((data) => {
                    //string转成json格式
                    let fileJson = JSON.parse(data);
                    this._allConfigData[fileList[i]] = fileJson
                    this._configFinishNum += 1;
                    if (this._configFinishNum == totalCount) {
                        if (this._finishFunc) {
                            this._finishFunc();
                        }
                    }
                })
            }
        })
    }

    // 添加预加载的图集
    public AddPreloadAtlas(uiPath, atlas) {
        this._preLoadAtlas[uiPath] = atlas;

    }

    // 得到预加载的图集
    public GetPreloadAtlas() {
        return this._preLoadAtlas;
    }

    // 缓存动态加载的
    public AddDynamicRes(uiPath, dynamicRes, prefab) {
        if (!this._dynamicRes[uiPath]) {
            prefab.addRef();
            this._dynamicRes[uiPath] = { "instance": dynamicRes, "prefab": prefab, "index": 1 };
        }
    }

    public AddResIndex(uiPath) {

        if (this._dynamicRes[uiPath]) {
            this._dynamicRes[uiPath]["index"]++;
        }
    }

    // 获得动态缓存
    public GetDynamicRes(uiPath) {

        if (this._dynamicRes[uiPath]) {
            return this._dynamicRes[uiPath];
        }
        return null;
    }

    // 定时清理动态资源
    private TimingClearRes() {

        if (!this._clearTimer) {
            this._clearTimer = setInterval(() => {
                for (const key in this._dynamicRes) {
                    if (this._dynamicRes[key]) {
                        if (this._dynamicRes[key]["index"] <= 0) {
                            this._dynamicRes[key]["prefab"].decRef();
                            if (this._dynamicRes[key]["instance"] && this._dynamicRes[key]["instance"]._prefab) {
                                this._dynamicRes[key]["instance"].destroy();
                            }
                            delete this._dynamicRes[key];
                        }
                    }
                }
            }, 360000);
        }
    }

    // 正在加载的资源
    public IsLoadingRes(uiPath) {
        return this._loadingRes[uiPath];
    }

    // 设置正在加载的资源
    public SetLoadingRes(uiPath) {
        this._loadingRes[uiPath] = uiPath;
    }

    // 设置正在加载的资源
    public ClearLoadingRes(uiPath) {
        delete this._loadingRes[uiPath];
    }

    // 清理预加载预制
    public ClearPreloadAtlas() {
        for (const key in this._preLoadAtlas) {
            if (Object.prototype.hasOwnProperty.call(this._preLoadAtlas, key)) {
                this._preLoadAtlas[key].decRef();
            }
        }
        this._preLoadAtlas = {};

    }

    // 配置表是否加载完成
    public IsConfigFinish() {
        return this._configFinishNum == this._configNameList.length
    }

    // 外部调用
    // configName 表名
    public GetCfgData(configName: string) {
        return this._allConfigData[configName];
    }

    // 添加配置表
    public AddCfgData(key: string, value) {
        this._allConfigData[key] = value;
    }

    // 获取别的参数
    // configName 表名
    // param 需要查找的参数名
    // value 值
    public GetCfgFindArr(configName: string, param: string, value) {

        let tempCfgArr = [];
        let cfg = this._allConfigData[configName];
        for (const key in cfg) {
            if (Object.prototype.hasOwnProperty.call(cfg, key)) {
                if (cfg[key][param] == value) {
                    tempCfgArr.push(cfg[key]);
                }
            }
        }

        return tempCfgArr;
    }

    // 获取别的参数
    // configName 表名
    // param1 需要查找的参数名
    // value1 值
    // param2 需要查找的参数名
    // value2 值
    public GetCfgFindValue(configName: string, param1: string, value1, param2: string, value2) {

        let cfg = this._allConfigData[configName];
        for (const key in cfg) {
            if (Object.prototype.hasOwnProperty.call(cfg, key)) {
                if (cfg[key][param1] == value1 && cfg[key][param2] == value2) {
                    return cfg[key];
                }
            }
        }

        return undefined;
    }

    // 获取别的参数
    // configName 表名
    // param1 需要查找的参数名
    // value1 值
    // param2 需要查找的参数名
    // value2 值
    public GetCfgFindList(configName: string, param1: string, value1, param2: string = null, value2 = null) {

        let list = [];
        let cfg = this._allConfigData[configName];
        for (const key in cfg) {
            if (Object.prototype.hasOwnProperty.call(cfg, key)) {
                if (param2 && value2) {
                    if (cfg[key][param1] == value1 && cfg[key][param2] == value2) {
                        list.push(cfg[key]);
                    }
                } else {
                    if (cfg[key][param1] == value1) {
                        list.push(cfg[key]);
                    }
                }
            }
        }
        return list;
    }

    getSetting() {
        return this._setting;
    }


    // 保存拥有的英雄数据
    setSaveHaveheroData(heroList) {
        this._heroList = heroList;
        cc.sys.localStorage.setItem(this._saveHeroKey, JSON.stringify(heroList));
    }

    // 添加单个英雄
    addSingleHero(heroId, heroNum) {

        let isHave = false;
        let addHeroType = this.GetCfgData("tfyingxiong")[heroId].yx_type;
        for (let i = 0; i < this._heroList.length; i++) {
            let haveHeroType = this.GetCfgData("tfyingxiong")[this._heroList[i].id].yx_type;
            if (addHeroType == haveHeroType) {
                this._heroList[i].count += heroNum;
                isHave = true;
                break;
            }
        }
        if (isHave == false) {
            this._heroList.push({ "id": heroId, "count": heroNum });
        }
        let heroQuality = this.GetCfgData("tfyingxiong")[heroId].yx_pj;
        if (heroQuality == 1) { // 绿色品质
            this.setFinishTaskData(30001, heroNum);
            this.updateAchievementCount(30001, heroNum);
        } else if (heroQuality == 2) { // 蓝色品质
            this.setFinishTaskData(30002, heroNum);
            this.updateAchievementCount(30002, heroNum);
        } else if (heroQuality == 3) { // 紫色品质
            this.setFinishTaskData(30003, heroNum);
            this.updateAchievementCount(30003, heroNum);
        } else if (heroQuality == 4) { // 橙色品质
            this.updateAchievementCount(30004, heroNum);
        }
        cc.sys.localStorage.setItem(this._saveHeroKey, JSON.stringify(this._heroList));
    }

    // 初始化英雄列表
    initHeroList() {
        let haveHeroData = cc.sys.localStorage.getItem(this._saveHeroKey);
        if (haveHeroData) {
            this._heroList = JSON.parse(haveHeroData);
        } else {
            // 测试
            this._heroList.push({ "id": 101001, "count": 10 })
            this._heroList.push({ "id": 105001, "count": 0 })
            this._heroList.push({ "id": 107001, "count": 0 })
            this._heroList.push({ "id": 108001, "count": 0 })
            this._heroList.push({ "id": 109001, "count": 0 })
            this._heroList.push({ "id": 110001, "count": 0 })
        }

    }

    // 所有的一级英雄
    getAllOneLevelHero() {
        if (this._allOneLevelHeroList.length == 0) {
            let cfg = this._allConfigData["tfyingxiong"];
            for (const key in cfg) {
                if (cfg[key].level == 1) {
                    this._allOneLevelHeroList.push(cfg[key]);
                }
            }
        }
        return this._allOneLevelHeroList;
    }

    // 获取英雄列表
    getHeroList() {
        return this._heroList;
    }

    // 保存当前关卡数据
    setSaveLevelData(gameLevel) {
        if (this._gameLevel < gameLevel) {
            this._gameLevel = gameLevel;
            let levelMap = { "Ordinary": this._gameLevel, "Elite": this._gameEliteLevel, "Difficulty": this._gameDifficulty }
            cc.sys.localStorage.setItem(this._saveLevelKey, JSON.stringify(levelMap));
            this.setCopyChapter(gameLevel);
        }
    }

    // 精英关卡
    setSaveEliteLevel(eliteLevel) {
        if (this._gameEliteLevel < eliteLevel) {
            this._gameEliteLevel = eliteLevel;
            let levelMap = { "Ordinary": this._gameLevel, "Elite": this._gameEliteLevel, "Difficulty": this._gameDifficulty }
            cc.sys.localStorage.setItem(this._saveLevelKey, JSON.stringify(levelMap));
        }
    }

    // 困难关卡
    setSaveDifficultyLevel(difficultyLevel) {
        if (this._gameDifficulty < difficultyLevel) {
            this._gameDifficulty = difficultyLevel;
            let levelMap = { "Ordinary": this._gameLevel, "Elite": this._gameEliteLevel, "Difficulty": this._gameDifficulty }
            cc.sys.localStorage.setItem(this._saveLevelKey, JSON.stringify(levelMap));
        }
    }

    // 得到当前关卡
    initLevelData() {
        let levelMap = cc.sys.localStorage.getItem(this._saveLevelKey); // 当前关卡
        if (levelMap) {
            let levelData = JSON.parse(levelMap);
            if (levelData.Ordinary) {
                this._gameLevel = levelData.Ordinary;
            }
            if (levelData.Elite) {
                this._gameEliteLevel = levelData.Elite;
            }
            if (levelData.Difficulty) {
                this._gameDifficulty = levelData.Difficulty;
            }
        }
    }

    // 得到当前关卡
    getLevelData() {
        return this._gameLevel;
    }
    // 精英关卡
    getEliteLevel() {
        return this._gameEliteLevel;
    }
    // 困难关卡
    getDifficultyLevel() {
        return this._gameDifficulty;
    }

    // 初始化金币
    initGold() {
        let goldNum = cc.sys.localStorage.getItem(this._saveGoldKey); // 当前金币
        if (goldNum) {
            this._goldNum = Number(goldNum);
        }
    }

    // 获取金币
    getGold() {
        return this._goldNum;
    }

    // 设置金币
    setGold(gold) {
        if (this._goldNum < gold) { //增加金币任务
            this.setFinishTaskData(10000, gold - this._goldNum);
            this.updateAchievementCount(10000, gold - this._goldNum);
        }
        this._goldNum = gold;
        cc.sys.localStorage.setItem(this._saveGoldKey, gold);
    }

    // 初始化钻石
    initDiamond() {
        let diamondNum = cc.sys.localStorage.getItem(this._saveDiamondKey); // 当前钻石
        if (diamondNum) {
            this._diamondNum = Number(diamondNum);
        }
    }

    // 获取钻石
    getDiamond() {
        return this._diamondNum;
    }

    // 设置钻石
    setDiamond(diamond) {
        if (this._diamondNum < diamond) {
            this.setFinishTaskData(10001, diamond - this._diamondNum);
            this.updateAchievementCount(10001, diamond - this._diamondNum);
        }
        this._diamondNum = diamond;
        cc.sys.localStorage.setItem(this._saveDiamondKey, diamond);
    }

    // 初始化关卡通过
    initLevelReward() {
        let levelRewardMap = cc.sys.localStorage.getItem(this._saveLevelRewardKey); // 关卡奖励
        if (levelRewardMap) {
            this._recordLevelRewardMap = JSON.parse(levelRewardMap);
        }
    }

    // 记录关卡通过
    setAllLevelReward(levelId) {
        if (!this._recordLevelRewardMap[levelId]) {
            this._recordLevelRewardMap[levelId] = 1;
            cc.sys.localStorage.setItem(this._saveLevelRewardKey, JSON.stringify(this._recordLevelRewardMap));
        }
    }

    // 得到关卡通过
    getLevelReward(levelId) {
        if (this._recordLevelRewardMap[levelId]) {
            return this._recordLevelRewardMap[levelId];
        }
        return 0;
    }

    // 通过总关卡id获取关卡总星级
    getTotalStarWithLevel(totalLevel) {

        let totalStar = 0;
        for (const key in this._recordLevelRewardMap) {
            if (key) {
                let tempTotalLevel = Math.floor(Number(key) / 1000);
                if (tempTotalLevel == totalLevel) {
                    totalStar += this._recordLevelRewardMap[key];
                }
            }
        }
        return totalStar;
    }

    // 获取抽卡宝箱每日免费次数
    getDrawCardBoxDayNum() {
        let adNum = this.GetCfgData("sd-chouka")[1].xh_lx;
        let boxDayAdNum = cc.sys.localStorage.getItem(this._saveDrawCardBoxKey); // 关卡奖励
        if (boxDayAdNum) {
            let data = JSON.parse(boxDayAdNum);
            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();

            if (data["yday"] == yday && data["month"] == month) {
                adNum = data["adNum"];
            }
        }

        return adNum;
    }

    // 设置抽卡宝箱每日免费次数
    setDrawCardBoxDayNum(adNum) {

        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();

        let drawCardData = { "month": month, "yday": yday, "adNum": adNum }
        cc.sys.localStorage.setItem(this._saveDrawCardBoxKey, JSON.stringify(drawCardData));
    }

    // 每日精选刷新次数
    getJXRefreshNum() {
        let adNum = 5;
        let boxDayAdNum = cc.sys.localStorage.getItem(this._saveJXAdNumKey); // 关卡奖励
        if (boxDayAdNum) {
            let data = JSON.parse(boxDayAdNum);
            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();

            if (data["yday"] == yday && data["month"] == month) {
                adNum = data["adNum"];
            }
        }

        return adNum;
    }

    // 每日精选刷新次数
    setJXRefreshNum(adNum) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();

        let drawCardData = { "month": month, "yday": yday, "adNum": adNum }
        cc.sys.localStorage.setItem(this._saveJXAdNumKey, JSON.stringify(drawCardData));
    }

    // 获取每日精选商品
    getJXGoodsList() {
        let goodsStr = cc.sys.localStorage.getItem(this._saveJXGoodsListKey);
        if (goodsStr) {
            let data = JSON.parse(goodsStr);

            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();

            if (data["yday"] == yday && data["month"] == month) {
                return data["goodsList"];
            }
        }

        return [];
    }

    // 设置每日精选商品
    setJXGoodsList(goodsList) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();

        let goodsData = { "month": month, "yday": yday, "goodsList": goodsList }
        cc.sys.localStorage.setItem(this._saveJXGoodsListKey, JSON.stringify(goodsData));
    }

    // 金币每天看广告次数 刷新
    getGoldAdNum() {
        let goodsStr = cc.sys.localStorage.getItem(this._saveGoldAdNumKey);
        if (goodsStr) {
            let data = JSON.parse(goodsStr);

            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();

            if (data["yday"] == yday && data["month"] == month) {
                return data["adNum"];
            }
        }
        // -2代表最大次数
        return -2;
    }

    // 设置每日精选商品
    setGoldAdNum(adNum) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();

        let goodsData = { "month": month, "yday": yday, "adNum": adNum }
        cc.sys.localStorage.setItem(this._saveGoldAdNumKey, JSON.stringify(goodsData));
    }

    // 钻石每天看广告次数 刷新
    getDiamondAdNum() {
        let goodsStr = cc.sys.localStorage.getItem(this._saveDiamondAdNumKey);
        if (goodsStr) {
            let data = JSON.parse(goodsStr);
            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();
            if (data["yday"] == yday && data["month"] == month) {
                return data["adNum"];
            }
        }
        // -2代表最大次数
        return -2;
    }

    // 设置每日精选商品
    setDiamondAdNum(adNum) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();
        let goodsData = { "month": month, "yday": yday, "adNum": adNum }
        cc.sys.localStorage.setItem(this._saveDiamondAdNumKey, JSON.stringify(goodsData));
    }

    getWeek() {
        var totalDays = 0;
        let now = new Date();
        let years = now.getFullYear()
        if (years < 1000)
            years += 1900
        var days = new Array(12);
        days[0] = 31;
        days[2] = 31;
        days[3] = 30;
        days[4] = 31;
        days[5] = 30;
        days[6] = 31;
        days[7] = 31;
        days[8] = 30;
        days[9] = 31;
        days[10] = 30;
        days[11] = 31;
        //判断是否为闰年，针对2月的天数进行计算
        if (Math.round(now.getFullYear() / 4) == now.getFullYear() / 4) {
            days[1] = 29
        } else {
            days[1] = 28
        }
        if (now.getMonth() == 0) {
            totalDays = totalDays + now.getDate();
        } else {
            var curMonth = now.getMonth();
            for (var count = 1; count <= curMonth; count++) {
                totalDays = totalDays + days[count - 1];
            }
            totalDays = totalDays + now.getDate();
        }
        //得到第几周
        var week = Math.round(totalDays / 7);
        return week;
    }

    // 看广告次数
    // _seeAdNum
    getWeekSeeAdNum() {
        let goodsStr = cc.sys.localStorage.getItem(this._saveSeeAdNumKey);
        if (goodsStr) {
            let data = JSON.parse(goodsStr);
            let week = this.getWeek();
            if (data["week"] == week) {
                return data["adNum"];
            }
        }
        return 0;
    }

    // 获取钻石领取
    getWeekSeeAdData() {
        let week = this.getWeek();
        let goodsStr = cc.sys.localStorage.getItem(this._saveShopDiamondDataKey);
        if (goodsStr) {
            let data = JSON.parse(goodsStr);
            if (data["week"] == week) {
                return data;
            }
        }
        return { "week": week, "recvList": [] };
    }

    // 获取钻石领取
    setWeekSeeAdData(diamondId) {
        let week = this.getWeek();
        let data = this.getWeekSeeAdData();
        if (data["week"] == week) {
            let isRecv = false;
            let rewardList = data.recvList;
            for (let i = 0; i < rewardList.length; i++) {
                if (rewardList[i] == diamondId) {
                    isRecv = true;
                    break;
                }
            }
            if (isRecv == false) {
                rewardList.push(diamondId);
                let saveData = { "week": week, "recvList": rewardList };
                cc.sys.localStorage.setItem(this._saveShopDiamondDataKey, JSON.stringify(saveData));
            }
        } else {
            let rewardList = [];
            rewardList.push(diamondId);
            let saveData = { "week": week, "recvList": rewardList };
            cc.sys.localStorage.setItem(this._saveShopDiamondDataKey, JSON.stringify(saveData));
        }
    }

    // 看广告次数
    setWeekSeeAdNum(adNum) {
        let isRecv = false;
        let week = this.getWeek();
        let weekSeeAdData = cc.sys.localStorage.getItem(this._saveSeeAdNumKey);
        if (weekSeeAdData) {
            let data = JSON.parse(weekSeeAdData);
            if (data.week == week) {
                isRecv = data.isRecv;
            }
        }
        let goodsData = { "week": week, "adNum": adNum, "isRecv": isRecv };
        cc.sys.localStorage.setItem(this._saveSeeAdNumKey, JSON.stringify(goodsData));
    }

    // 每日试炼副本次数
    getCopySLNum() {
        let goodsStr = cc.sys.localStorage.getItem(this._saveCopySLNumKey);
        if (goodsStr) {
            let data = JSON.parse(goodsStr);

            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();

            if (data["yday"] == yday && data["month"] == month) {
                return data["copyNum"];
            }
        }
        return 2;
    }

    // 每日试炼副本次数
    setCopySLNum(adNum) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();
        let goodsData = { "month": month, "yday": yday, "copyNum": adNum }

        let copyNum = this.getCopySLNum();
        if (copyNum > adNum) {
            this.setFinishTaskData(20001, copyNum - adNum); // 副本任务
        }
        cc.sys.localStorage.setItem(this._saveCopySLNumKey, JSON.stringify(goodsData));
    }

    // 每日副本关卡数
    setNowDayLevel(day) {
        // dd _saveNowDayLevel
    }

    // 初始化限制英雄
    initLimitHero() {
        let goodsStr = cc.sys.localStorage.getItem(this._saveLimitHeroKey);
        if (goodsStr) {
            this._limitHeroMap = JSON.parse(goodsStr);
        } else {
            this._limitHeroMap = {};
        }

    }

    // 英雄界面 记录限制出战的英雄
    getLimitHeroMap() {

        let nowLimitList = this._limitHeroMap[this._limitSecectIdx];
        if (nowLimitList) {
            for (let i = 0; i < nowLimitList.length; i++) {
                let heroType1 = this.GetCfgData("tfyingxiong")[nowLimitList[i].id].yx_type
                for (let j = 0; j < this._heroList.length; j++) {
                    let heroType2 = this.GetCfgData("tfyingxiong")[this._heroList[j].id].yx_type
                    if (heroType1 == heroType2 && (nowLimitList[i].id != this._heroList[j].id || nowLimitList[i].count != this._heroList[j].count)) {
                        this._limitHeroMap[this._limitSecectIdx][i] = this._heroList[j];
                    }
                }
            }
        }


        return this._limitHeroMap;
    }

    // 获取限制英雄
    getNowLimitHeroList() {

        let nowLimitList = this._limitHeroMap[this._limitSecectIdx];
        if (nowLimitList) {
            for (let i = 0; i < nowLimitList.length; i++) {
                let heroType1 = this.GetCfgData("tfyingxiong")[nowLimitList[i].id].yx_type
                for (let j = 0; j < this._heroList.length; j++) {
                    let heroType2 = this.GetCfgData("tfyingxiong")[this._heroList[j].id].yx_type
                    if (heroType1 == heroType2 && (nowLimitList[i].id != this._heroList[j].id || nowLimitList[i].count != this._heroList[j].count)) {
                        this._limitHeroMap[this._limitSecectIdx][i] = this._heroList[j];
                    }
                }
            }
        }

        if (this._limitHeroMap[this._limitSecectIdx]) {
            return this._limitHeroMap[this._limitSecectIdx];
        }
        return [];
    }

    // 英雄界面 记录限制出战的英雄
    setLimitHeroMap(limitHeroMap) {

        this._limitHeroMap = limitHeroMap;
        cc.sys.localStorage.setItem(this._saveLimitHeroKey, JSON.stringify(limitHeroMap));
    }

    // 初始化被限制的英雄
    initLimitHeroSelectIdx() {
        let selectIdx = cc.sys.localStorage.getItem(this._saveLimitHeroSelectIdxKey);
        if (selectIdx) {
            this._limitSecectIdx = Number(selectIdx);
        } else {
            this._limitSecectIdx = 0;
        }
    }

    // 英雄界面被限制哪个挡位
    setLimitHeroSelectIdx(index) {
        this._limitSecectIdx = index
        cc.sys.localStorage.setItem(this._saveLimitHeroSelectIdxKey, index);
    }

    getLimitHeroSelectIdx() {
        return this._limitSecectIdx;
    }

    // 初始化挂机奖励时间
    initHangUpTime() {
        let hangupData = this.getNowHangupTime();
        let isSave = false;
        if (!hangupData.time) { // 当前挂机时间
            isSave = true
            hangupData.time = Math.floor(Date.now() / 1000);
        }
        if (!hangupData.goldTime) { // 金币剩余时间
            hangupData.goldTime = Math.floor(Date.now() / 1000);
        }
        if (!hangupData.diamondTime) { // 钻石剩余时间
            hangupData.diamondTime = Math.floor(Date.now() / 1000);
        }
        if (!hangupData.heroTime1) { // 绿色英雄
            hangupData.heroTime1 = Math.floor(Date.now() / 1000);
        }

        if (!hangupData.heroTime2) {// 蓝色英雄
            hangupData.heroTime2 = Math.floor(Date.now() / 1000);
        }

        if (!hangupData.heroTime3) { // 紫色英雄
            hangupData.heroTime3 = Math.floor(Date.now() / 1000);
        }
        if (!hangupData.heroTime4) { // 橙色英雄
            hangupData.heroTime4 = Math.floor(Date.now() / 1000);
        }
        if (isSave == true) {
            this.setNowHangupTime(hangupData);
        }

    }

    // 本次挂机时间
    getNowHangupTime() {

        let goodsStr = cc.sys.localStorage.getItem(this._saveNowHangUpTimeKey);
        if (goodsStr) {
            return JSON.parse(goodsStr);
        } else {
            return {};
        }
    }

    // 本次挂机时间
    setNowHangupTime(data) {
        cc.sys.localStorage.setItem(this._saveNowHangUpTimeKey, JSON.stringify(data));
    }

    // 快速挂机广告次数
    setQuickHangupAdCount(adCount) {

        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();

        let adData = { "month": month, "yday": yday, "adCount": adCount }
        cc.sys.localStorage.setItem(this._saveQuickHangUpAdCountKey, JSON.stringify(adData));
    }

    // 快速挂机广告次数
    getQuickHangupAdCount() {
        let adData = cc.sys.localStorage.getItem(this._saveQuickHangUpAdCountKey);
        if (adData) {
            let data = JSON.parse(adData);
            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();

            if (data["yday"] == yday && data["month"] == month) {
                return data["adCount"];
            } else {
                return 6;// 每日5次看广告  1次免费
            }
        } else {
            return 6; // 每日5次看广告  1次免费
        }
    }


    // 快速挂机总次数
    setQuickHangupTotalCount(adCount) {
        cc.sys.localStorage.setItem(this._saveQuickHangUpTotalCount, adCount);
    }

    // 快速挂机总次数
    getQuickHangupTotalCount() {
        let totalCount = cc.sys.localStorage.getItem(this._saveQuickHangUpTotalCount);
        if (totalCount) {
            return Number(totalCount);
        } else {
            return 0;
        }
    }

    // 今日看广告次数
    getTodayAdCount() {
        let goodsStr = cc.sys.localStorage.getItem(this._saveAdBoxKey);
        if (goodsStr) {
            let data = JSON.parse(goodsStr);
            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();
            if (data["yday"] == yday && data["month"] == month) {
                return data["adCount"];
            }
        }
        return 0;
    }

    // 今日看广告次数
    setTodayAdCount(adNum) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();
        let goodsData = { "month": month, "yday": yday, "adCount": adNum }
        cc.sys.localStorage.setItem(this._saveAdBoxKey, JSON.stringify(goodsData));
    }

    // 广告宝箱领取奖励第几天
    getAdBoxRecvDay() {
        let signData = cc.sys.localStorage.getItem(this._saveRecvBoxDay);
        if (signData) {
            return JSON.parse(signData);;
        } else {
            return {};
        }
    }

    // 设置广告宝箱领取奖励第几天
    setAdBoxRecvDay(signDay) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();
        let data = { "month": month, "yday": yday, "signDay": signDay }
        cc.sys.localStorage.setItem(this._saveRecvBoxDay, JSON.stringify(data));
    }

    // 每日签到 签到第几天
    getSignInDay() {
        let signData = cc.sys.localStorage.getItem(this._saveEverySignInDay);
        if (signData) {
            return JSON.parse(signData);
        } else {
            return { "month": 0, "yday": 0, "signDay": 0 };
        }
    }

    // 每日签到
    setSignInDay(signDay) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();
        let data = { "month": month, "yday": yday, "signDay": signDay }
        cc.sys.localStorage.setItem(this._saveEverySignInDay, JSON.stringify(data));
    }

    // 主线宝箱领取数据
    initMainBox() {
        let mainBoxData = cc.sys.localStorage.getItem(this._saveMainBoxKey);
        if (mainBoxData) {
            this._mainBoxMap = JSON.parse(mainBoxData);
        } else {
            this._mainBoxMap = {};
        }
    }

    // 主线宝箱领取数据  
    // mainBoxId 主线宝箱id
    getMainBoxStateWithId(chapterIdx, difficultyIdx, mainBoxId) {
        if (!this._mainBoxMap[chapterIdx] || !this._mainBoxMap[chapterIdx][difficultyIdx]) {
            return;
        }
        return this._mainBoxMap[chapterIdx][difficultyIdx][mainBoxId];
    }

    // 主线宝箱领取数据  
    setMainBoxStateWithId(chapterIdx, difficultyIdx, mainBoxId) {
        if (!this._mainBoxMap[chapterIdx]) {
            this._mainBoxMap[chapterIdx] = {};
        }
        if (!this._mainBoxMap[chapterIdx][difficultyIdx]) {
            this._mainBoxMap[chapterIdx][difficultyIdx] = {};
        }
        this._mainBoxMap[chapterIdx][difficultyIdx][mainBoxId] = 1;
        cc.sys.localStorage.setItem(this._saveMainBoxKey, JSON.stringify(this._mainBoxMap));
    }

    // 获得战舰血量
    getWarshipBaseBlood() {
        return this._warshipBaseBlood;
    }

    // 设置战斗是否暂停
    setBattleState(isBattle) {
        this._battleSuspend = isBattle;
    }

    // 获取战斗状态
    getBattleState() {
        return this._battleSuspend;
    }

    // 添加持续技能临时列表
    addSkillList(skillData) {
        let isAdd = true;
        for (let i = 0; i < this._skillList.length; i++) {
            if (skillData.id == this._skillList[i].id) {
                isAdd = false;
                break;
            };
        }
        if (isAdd == true) {
            this._skillList.push(skillData);
        }
    }

    // 删除持续技能列表
    deleteSkill(skillId) {
        for (let i = 0; i < this._skillList.length; i++) {
            if (skillId == this._skillList[i].id) {
                this._skillList.splice(i, 1);
                break;
            };
        }
    }

    // 删除所有的技能
    deleteAllSkill() {
        this._skillList = [];
    }

    // 获取技能
    getSkillList() {
        return this._skillList;
    }

    // 引导数据
    initGuildData() {
        this._guildList = {
            "1": { "view": UIPath.UIBattle, "nextId": 2, "battleId": 10001, "ringPath": "", "arrowPath": "", "handPath": "", "str": "舰长大人您醒啦？我们已经成功抵达海边了。马上就能修复好战舰离开这里了。" },
            "2": { "view": UIPath.UIBattle, "nextId": 3, "battleId": 10001, "ringPath": "", "arrowPath": "", "handPath": "", "str": "不好！有怪物发现了我们的踪迹，还好怪物数量不多，请舰长大人立刻出手击退他们！" },
            "3": { "view": UIPath.UIBattle, "nextId": 4, "battleId": 10001, "ringPath": "ct/nodeDown/nodeHeroCard/bgHeroCard2", "arrowPath": "", "handPath": "", "str": "点击召唤休眠中的英雄出战。" },
            "4": { "view": UIPath.UIBattle, "nextId": 5, "battleId": 10001, "ringPath": "ct/nodeDown/btnUnLock", "arrowPath": "", "handPath": "", "str": "击杀怪物后怪物会掉落银币，银币可以用来升级战舰后会解锁更多英雄出战的位置。" },
            "5": { "view": UIPath.UIBattle, "nextId": 6, "battleId": 10001, "ringPath": "ct/nodeDown/btnRefresh", "arrowPath": "", "handPath": "", "str": "银币还能用来刷新召唤的英雄，如果召唤相同的英雄，将会提高英雄的力量。" },
            "6": { "view": UIPath.UIBattle, "nextId": 7, "battleId": 10001, "ringPath": "ct/nodeDown/nodeMoney/bgIcon", "arrowPath": "", "handPath": "", "str": "舰长大人可以在这里查看我们拥有的银币数量。银币是战略物资，请您小心使用哦~" },
            "7": { "view": UIPath.UIBattle, "nextId": 8, "battleId": 10001, "ringPath": "ct/nodeDown/nodeBase/btnHeroClick", "arrowPath": "", "handPath": "", "str": "舰长大人可以点击英雄以查看英雄信息，了解英雄的属性和技能。" },
            "8": { "view": UIPath.UIBattleHeroInfo, "nextId": 9, "battleId": 10001, "ringPath": "ct/btnDelete", "arrowPath": "ct/btnDelete", "handPath": "", "str": "战舰上位置不够的时候可以点击出售按钮出售英雄获得空位。" },
            "9": { "view": UIPath.UIBattleHeroInfo, "nextId": 10, "battleId": 10001, "ringPath": "ct/btnClose", "arrowPath": "", "handPath": "", "str": "点击关闭按钮后关闭英雄信息界面。" },
            "10": { "view": UIPath.UIBattleResults, "nextId": 11, "battleId": 10001, "ringPath": "", "arrowPath": "", "handPath": "", "str": "在舰长大人的领导下，战舰顺利地完成了充能，我们终于可以启航啦！" },
            "11": { "view": UIPath.UIBattleResults, "nextId": 12, "battleId": 10001, "ringPath": "", "arrowPath": "", "handPath": "", "str": "怪物身上掉落了一些战利品，我们能用它们交易到能强化我们力量的物品呢。" },
            "12": { "view": UIPath.UIBattleResults, "nextId": 13, "battleId": 10001, "ringPath": "ct/nodeImg/nodeSuccessImg/btnNextLevel", "arrowPath": "", "handPath": "ct/nodeImg/nodeSuccessImg/btnNextLevel", "str": "请您收好它们，然后我们一起继续前行吧！" },
            "13": { "view": UIPath.UIBattle, "nextId": 14, "battleId": 10002, "ringPath": "", "arrowPath": "", "handPath": "", "str": "不好了舰长大人，前方检测到高能波动。我们可能惊动了这里的首领级怪物。" },
            "14": { "view": UIPath.UIBattle, "nextId": 15, "battleId": 10002, "ringPath": "", "arrowPath": "", "handPath": "", "str": "趁着首领级怪物还未来袭，请舰长大人全力提升英雄强度，以应对将要到来的危机。" },
            "15": { "view": UIPath.UIBattle, "nextId": 16, "battleId": 10001, "ringPath": "ct/nodeDown/nodeHeroCard/bgHeroCard2", "arrowPath": "", "handPath": "", "str": "点击召唤休眠中的英雄出战。" },
            "16": { "view": UIPath.UIBattleResults, "nextId": 17, "battleId": 10002, "ringPath": "", "arrowPath": "", "handPath": "", "str": "恭喜舰长大人成功击败了第一只首领级怪物，虽然这只是个开始，但我们会一直陪着您走下去的。" },
            "17": { "view": UIPath.UIBattleResults, "nextId": 18, "battleId": 10002, "ringPath": "ct/nodeImg/nodeSuccessImg/btnNextLevel", "arrowPath": "", "handPath": "ct/nodeImg/nodeSuccessImg/btnNextLevel", "str": "准备好了吗舰长大人，我们要继续出发啦~" },
            "18": { "view": UIPath.UIBattle, "nextId": 19, "battleId": 10003, "ringPath": "", "arrowPath": "", "handPath": "", "str": "报告！前方发现了丧魂怪，这些怪物可以远距离袭击我们的战舰，舰长大人可要小心了！" },
            "19": { "view": UIPath.UIBattle, "nextId": 20, "battleId": 10001, "ringPath": "ct/nodeDown/nodeHeroCard/bgHeroCard2", "arrowPath": "", "handPath": "", "str": "点击召唤休眠中的英雄出战。" },
            "20": { "view": UIPath.UIBattleResults, "nextId": 21, "battleId": 10003, "ringPath": "ct/nodeImg/nodeSuccessImg/btnBack", "arrowPath": "", "handPath": "ct/nodeImg/nodeSuccessImg/btnBack", "str": "怪物越来越强大了呢。舰长大人，我们去招募一些新的伙伴加入战斗吧~" },
            "21": { "view": UIPath.UITop, "nextId": 22, "battleId": 0, "ringPath": "ct/nodedown/node3/imgShop", "arrowPath": "ct/nodedown/node3/imgShop", "handPath": "", "str": "点击底部图标进入商店界面。" },
            "22": { "view": UIPath.UIShop, "nextId": 23, "battleId": 0, "ringPath": "ct/scrollShop/view/content/nodeshop1/nodebox1/btnTenDrawCard", "arrowPath": "", "handPath": "ct/scrollShop/view/content/nodeshop1/nodebox1/btnTenDrawCard", "str": "" },
            "23": { "view": UIPath.UIShopDrawCard, "nextId": 24, "battleId": 0, "ringPath": "ct/btnClose", "arrowPath": "", "handPath": "ct/btnClose", "str": "" },
            "24": { "view": UIPath.UITop, "nextId": 25, "battleId": 0, "ringPath": "ct/nodedown/node3/imgHero", "arrowPath": "", "handPath": "ct/nodedown/node3/imgHero", "str": "我们获得了新的伙伴！也有伙伴攒够了力量能够变强了，舰长大人一起去看看吧！" },
            "25": { "view": UIPath.UIHeroMain, "nextId": 26, "battleId": 0, "ringPath": "ct/scrollHero/view/content/itemHeroCard0/bgHero", "arrowPath": "", "handPath": "ct/scrollHero/view/content/itemHeroCard0/bgHero", "str": "" },
            "26": { "view": UIPath.UIHeroInfo, "nextId": 27, "battleId": 0, "ringPath": "ct/nodeImg/btnHeroUpdate", "arrowPath": "", "handPath": "ct/nodeImg/btnHeroUpdate", "str": "" },
            "27": { "view": UIPath.UIHeroMain, "nextId": 28, "battleId": 0, "ringPath": "", "arrowPath": "", "handPath": "", "str": "太棒了！伙伴的实力得到了提升，这下我们的整体实力就更强了呢。" },
            "28": { "view": UIPath.UIHeroMain, "nextId": 0, "battleId": 0, "ringPath": "", "arrowPath": "", "handPath": "", "str": "我所了解的已经全部告诉您啦，接下来还请舰长大人继续探索呀。" },
        }

        this.initGuildChapter();
    }

    // 获得章节数据
    getGuildChapterData(nowGuildChapter) {
        return this._guildList[nowGuildChapter];
    }

    // 初始化新手引导
    initGuildChapter() {
        let guildChapterData = cc.sys.localStorage.getItem(this._saveGuildChapterKey);
        if (guildChapterData) {
            this._guildChapterIdx = Number(guildChapterData);
        } else {
            this._guildChapterIdx = 1;
        }
    }

    // 判断章节是否完成
    isGuildChapter() {
        if (this._guildChapterIdx >= 28) {
            return false;
        }
        return true;
    }

    // 获得当前章节
    getGuildChapterIdx() {
        return this._guildChapterIdx;
    }

    // 设置当前章节
    setGuildChapterIdx(guildChapter) {
        this._guildChapterIdx = guildChapter;
    }

    // 保存章节
    saveGuildChapterIdx(guildChapter) {
        if (guildChapter == 23) {
            guildChapter = 24;
        }
        if (guildChapter == 13 || guildChapter == 18 || guildChapter == 21 || guildChapter == 24 || guildChapter == 28) {
            cc.sys.localStorage.setItem(this._saveGuildChapterKey, guildChapter);
        }
    }

    // 初始副本章节
    initCopyChapter() {
        let copyLevelData = cc.sys.localStorage.getItem(this._saveCopyLevelKey);
        if (copyLevelData) {
            let data = JSON.parse(copyLevelData);
            let nowDate = new Date();
            let day = nowDate.getDate();
            let month = nowDate.getMonth();
            let nowTime = month * 100 + day;
            if (data.date != 0 && data.date != nowTime) {
                this._copyLeveLMap = data;
                this._copyLeveLMap["yesterday"] = this._copyLeveLMap["day"];
                this._copyLeveLMap["date"] = nowTime;
            } else {
                this._copyLeveLMap = { "yesterday": 10004, "day": 0, "date": 0 };
            }
        } else {
            this._copyLeveLMap = { "yesterday": 10004, "day": 0, "date": 0 };
        }
    }

    // 设置副本章节
    setCopyChapter(nowLevel) {

        let nowDate = new Date();
        let day = nowDate.getDate();
        let month = nowDate.getMonth();
        let nowTime = month * 100 + day;
        if (this._copyLeveLMap["date"] == nowTime) {
            this._copyLeveLMap["day"] = nowLevel;
        } else {
            if (this._copyLeveLMap["day"] == 0) {
                this._copyLeveLMap["yesterday"] = 1004;
            } else {
                this._copyLeveLMap["yesterday"] = this._copyLeveLMap["day"];
            }
            this._copyLeveLMap["day"] = nowLevel;
            this._copyLeveLMap["date"] = nowTime;
        }
        cc.sys.localStorage.setItem(this._saveCopyLevelKey, JSON.stringify(this._copyLeveLMap));
    }

    getCopyChapter() {
        return this._copyLeveLMap["yesterday"];
    }

    // 每日任务宝箱领取数量
    getTaskBoxNum() {
        let boxNum = 0;
        let boxDayAdNum = cc.sys.localStorage.getItem(this._saveTaskBoxKey); // 关卡奖励
        if (boxDayAdNum) {
            let data = JSON.parse(boxDayAdNum);
            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();

            if (data["yday"] == yday && data["month"] == month) {
                boxNum = data["boxNum"];
            }
        }

        return boxNum;
    }

    // 每日任务宝箱领取数量
    setTaskBoxNum(boxNum) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();

        let drawCardData = { "month": month, "yday": yday, "boxNum": boxNum }
        cc.sys.localStorage.setItem(this._saveTaskBoxKey, JSON.stringify(drawCardData));
    }

    // 每日任务领取数据
    getTaskRecv() {
        let taskMap = {};
        let boxDayAdNum = cc.sys.localStorage.getItem(this._saveTaskRecvKey); // 每日任务领取数据
        if (boxDayAdNum) {
            let data = JSON.parse(boxDayAdNum);
            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();
            if (data["yday"] == yday && data["month"] == month) {
                taskMap = data["taskMap"];
            }
        }
        if (!taskMap[1001] || !taskMap[1001].count) { // 登录直接领取奖励
            taskMap[1001] = {};
            taskMap[1001]["count"] = 1;
        }
        return taskMap;
    }
    // 每日任务领取数据
    setTaskRecv(taskMap) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();
        let drawCardData = { "month": month, "yday": yday, "taskMap": taskMap }
        cc.sys.localStorage.setItem(this._saveTaskRecvKey, JSON.stringify(drawCardData));
    }

    // 设置完成任务数据
    setFinishTaskData(taskType, addNum) {
        let taskMap = this.getTaskRecv();
        if (taskMap[taskType]) {
            taskMap[taskType].count += addNum;
        } else {
            taskMap[taskType] = {};
            taskMap[taskType].count = addNum;
        }
        this.setTaskRecv(taskMap);
    }

    getRecvTaskData() {
        let taskMap = {};
        let boxDayAdNum = cc.sys.localStorage.getItem(this._saveRecvTaskData); // 每日任务领取数据
        if (boxDayAdNum) {
            let data = JSON.parse(boxDayAdNum);
            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();
            if (data["yday"] == yday && data["month"] == month) {
                taskMap = data["taskRecv"];
            }
        }
        return taskMap;
    }

    setRecvTaskData(taskMap) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();
        let drawCardData = { "month": month, "yday": yday, "taskRecv": taskMap }
        cc.sys.localStorage.setItem(this._saveRecvTaskData, JSON.stringify(drawCardData));
    }

    // 设置任务状态
    setTaskState(taskId, taskState) {
        let taskMap = this.getRecvTaskData();
        if (taskMap[taskId]) {
            taskMap[taskId] = taskState;
        } else {
            taskMap[taskId] = taskState;
        }
        this.setRecvTaskData(taskMap);
    }

    // 每日任务数据
    getEveryTaskData() {
        let taskList = [];
        let boxDayAdNum = cc.sys.localStorage.getItem(this._saveTaskDataKey); // 每日任务领取数据
        if (boxDayAdNum) {
            let data = JSON.parse(boxDayAdNum);
            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();

            if (data["yday"] == yday && data["month"] == month) {
                taskList = data["taskList"];
            }
        }
        return taskList;
    }

    // 每日任务数据
    setEveryTaskData(taskList) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();
        let drawCardData = { "month": month, "yday": yday, "taskList": taskList }
        cc.sys.localStorage.setItem(this._saveTaskDataKey, JSON.stringify(drawCardData));
    }

    // 成就领取数据
    getAchievementTaskRecv() {
        let taskMap = {};
        let boxDayAdNum = cc.sys.localStorage.getItem(this._saveAchievementTaskDataKey); // 每日任务领取数据
        if (boxDayAdNum) {
            let data = JSON.parse(boxDayAdNum);
            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();

            if (data["yday"] == yday && data["month"] == month) {
                taskMap = data["taskMap"];
            }
        }
        return taskMap;
    }
    // 成就领取数据
    setAchievementTaskRecv(taskMap) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();
        let drawCardData = { "month": month, "yday": yday, "taskMap": taskMap }
        cc.sys.localStorage.setItem(this._saveAchievementTaskDataKey, JSON.stringify(drawCardData));
    }

    getAchievementRecvTaskData() {
        let taskMap = {};
        let boxDayAdNum = cc.sys.localStorage.getItem(this._saveAchievementRecvTaskDataKey); // 每日任务领取数据
        if (boxDayAdNum) {
            let data = JSON.parse(boxDayAdNum);
            var d = new Date();
            let yday = d.getDate();
            let month = d.getMonth();
            if (data["yday"] == yday && data["month"] == month) {
                taskMap = data["achievementTaskRecv"];
            }
        }
        return taskMap;
    }

    setAchievementRecvTaskData(taskMap) {
        var d = new Date();
        let yday = d.getDate();
        let month = d.getMonth();
        let drawCardData = { "month": month, "yday": yday, "achievementTaskRecv": taskMap }
        cc.sys.localStorage.setItem(this._saveAchievementRecvTaskDataKey, JSON.stringify(drawCardData));
    }

    // 成就数据状态
    setAchievementState(taskId, taskState) {
        let taskMap = this.getAchievementRecvTaskData();
        if (taskMap[taskId]) {
            taskMap[taskId] = taskState;
        } else {
            taskMap[taskId] = taskState;
        }
        this.setAchievementRecvTaskData(taskMap);
    }

    // 更新成就数量
    updateAchievementCount(taskType, count, isAdd = true) {
        let taskMap = this.getAchievementTaskRecv();
        if (taskMap[taskType]) {
            if (isAdd == true) {
                taskMap[taskType].count += count;
            } else {
                taskMap[taskType].count = count;
            }
        } else {
            taskMap[taskType] = {};
            taskMap[taskType].count = 0
        }
        this.setAchievementTaskRecv(taskMap);
    }

    // 初始化所有关卡数据
    initAllLevelData() {
        this._allLevelList = {};
        this._allLevelMap = {};
        let zongguanqiaCfg = this.GetCfgData("zongguanqia");
        for (const key in zongguanqiaCfg) {
            if (zongguanqiaCfg[key] && zongguanqiaCfg[key].gq_zs == 1) {
                let num = Number(key);
                let ordinary = num;
                let elite = num + 1000;
                let difficulty = num + 2000;
                this._allLevelMap[key] = { "ordinary": ordinary, "elite": elite, "difficulty": difficulty };

                let chapterIdx = Math.floor(ordinary / 10000);
                if (!this._allLevelList[chapterIdx]) {
                    this._allLevelList[chapterIdx] = [];
                }
                this._allLevelList[chapterIdx].push({ "ordinary": ordinary, "elite": elite, "difficulty": difficulty });
            }
        }
    }

    // 得到所有的关卡
    getAllLevelMap() {
        return this._allLevelMap;
    }

    // 得到所有的关卡
    getAllLevelList(chapterIdx) {
        return this._allLevelList[chapterIdx];
    }

    // 清理缓存
    clearLocalCache() {
        cc.sys.localStorage.removeItem(this._saveMusicConfigKey);
        cc.sys.localStorage.removeItem(this._saveHeroKey);
        cc.sys.localStorage.removeItem(this._saveLevelKey);
        cc.sys.localStorage.removeItem(this._saveGoldKey);
        cc.sys.localStorage.removeItem(this._saveDiamondKey);
        cc.sys.localStorage.removeItem(this._saveLevelRewardKey);
        cc.sys.localStorage.removeItem(this._saveDrawCardBoxKey);
        cc.sys.localStorage.removeItem(this._saveJXAdNumKey);
        cc.sys.localStorage.removeItem(this._saveJXGoodsListKey);
        cc.sys.localStorage.removeItem(this._saveGoldAdNumKey);
        cc.sys.localStorage.removeItem(this._saveDiamondAdNumKey);
        cc.sys.localStorage.removeItem(this._saveSeeAdNumKey);
        cc.sys.localStorage.removeItem(this._saveCopySLNumKey);
        cc.sys.localStorage.removeItem(this._saveLimitHeroKey);
        cc.sys.localStorage.removeItem(this._saveLimitHeroSelectIdxKey);
        cc.sys.localStorage.removeItem(this._saveNowHangUpTimeKey);
        cc.sys.localStorage.removeItem(this._saveQuickHangUpAdCountKey);
        cc.sys.localStorage.removeItem(this._saveAdBoxKey);
        cc.sys.localStorage.removeItem(this._saveRecvBoxDay);
        cc.sys.localStorage.removeItem(this._saveEverySignInDay);
        cc.sys.localStorage.removeItem(this._saveMainBoxKey);
        cc.sys.localStorage.removeItem(this._saveGuildChapterKey);
        cc.sys.localStorage.removeItem(this._saveQuickHangUpTotalCount);
        cc.sys.localStorage.removeItem(this._saveCopyLevelKey);
    }
}

export default new DLocal();
