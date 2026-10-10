//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html


// 加载和热更类型
export enum LoadingORUpdateType {
    LOADING = 0,   // 加载资源
    UPDATE = 1     // 更新界面
}

export enum MessageType {
    None, // 空白定义
    /**
     * 对request的反馈，无需回包
     */
    Response,
    /**
     * 向其他服务器请求，必定回包
     */
    Request,
    /**
     * 向其他服务器发送监控信息，无需回包
     */
    Notify,
}


export enum MusicPath {
    BGMUSIC = "music/beijingyy", // 主界面背景音乐
    CLICKMUSIC = "music/dianji", // 点击
    RISELEVEL = "music/yx-sj", // 局内英雄上阵、升级
    RISEWARSHIP = "music/zhanjian-sj", //  局内战舰升级
    RISEREFRESH = "music/juneishuaxin", //  局内刷新
    HERORISEORLOCK = "music/yx-sj", // 英雄升级，解锁
    SELLHERO = "music/yxchushou", // 出售英雄音效
    WARSHIPATTACK = "music/zhanjian-bgj", // 战舰被攻击音效
    BATTLEWIN = "music/zdsl", // 闯关胜利音效
    BATTLEFAIL = "music/zdshibai", // 闯关失败音效
    OPENBOX = "music/kaibx", // 抽卡、开启宝箱音效
    BUYGOODS = "music/jinbi-hq", // 商店购买物品音效
    BATTLE = "music/zhandoubeijing", // 战斗背景音乐

    FROZEN = "music/bingdong", // 冰冻
    PARALYSIS = "music/mabi", // 麻痹
    DEMONICCLAW = "music/emzhua", // 恶魔之爪
    MISSSILE = "music/asfeidan", // 奥术飞弹
    FIREBALL = "music/huoyan", // 炽热火球
    DECELERATE = "music/jiansu", // 减速
    TEARING = "music/maozhua", // 撕裂
    THUNDER = "music/leibao", // 雷暴
    CATFIST = "music/zhongji", // 猫拳
    LHZD = "music/lhzd3", // 灵魂震荡
    FZBL = "music/buffqianghua", // 风之壁垒

    WARRIOR = "music/yx-zsgj", // 战士声音
    MASTER = "music/yx-fsgj", // 法师声音

    NEARBATTLE = "music/gw-jzgj", // 近战
    FARBATTLE = "music/gw-ycgj", // 远程
}

// 模型枚举
export enum ModelType {
    attack = "attack",
    skillAttack = "skillAttack",
    skillAttack2 = "skillAttack2",
    walk = "walk",
    stand = "stand",

}

export enum AttributeEnum {
    MaxHP, // 最大生命值
    ATK, // 攻击
    DEF, // 防御
    RGS, // 魔防
    Armor, // 破甲
    Critical, // 暴击
    Tenacity, // 暴抗
    Hit, // 命中
    Dodge, // 闪避
}

export enum EquipPos {
    None, // 0-
    Head, // 1-头盔
    Glove, // 2-手套
    Body, // 3-衣服
    Shoe, // 4-鞋子
    Pants, // 5-裤子
    Neck, // 6-项链
    // Weapon, // 7-武器
    // Ring, // 8-戒指
}

// 表类型
export enum RewardType {
    Hero, // 英雄
    currency, // 货币
}

// 货币id
export enum CurrencyId {
    Gold = 1, // 金币
    Diamond = 2, // 钻石
    Box = 3, // 宝箱
    Mysterious = 4, // 神秘
}



