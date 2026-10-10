/*
 * @Author: your name
 * @Date: 2021-06-28 13:18:16
 * @LastEditTime: 2021-07-16 17:56:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \BasePro\assets\scripts\Config.ts
 */
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html


export default {
    PLATFORM: 10000,
    IsInsideDebug: false, //是否是内部调试
    IsHotUpdate: true, // 是否热更
    NetServerList: null,

    // NetPath: "http://192.168.1.148:8080//gm/gmNotice!listGames?world_id=90001", // 服务器列表地址 密阳
    NetPath: "http://192.168.1.138:8080//gm/gmNotice!listGames?world_id=40002", // 服务器列表地址（104）
    // NetPath: "http://192.168.1.120:5277//gm/user!gamelist?world_id=30001&open_id=10166", // 服务器列表地址



    IosAppAddress: {//IOS新包地址(一般是APP商店连接)
        10000: "https://app.myeodgames.com/Idle_test/android_test.apk",
    },
    AndroidAppAddress: {
        10000: "https://app.myeodgames.com/Idle_test/android_test.apk",
    },


    //转职能力值图标
    JobAbilityIcon: [
        'ability_icon_shengcun',
        'ability_icon_shuchu',
        'ability_icon_fuzhu',
        'ability_icon_jianyi',
    ],

    //对应能力名
    JobAbilityName: ['生存', '输出', '辅助', '应变'],
}

