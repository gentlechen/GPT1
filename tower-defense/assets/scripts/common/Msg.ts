/*
 * @Author: your name
 * @Date: 2021-06-28 11:23:50
 * @LastEditTime: 2021-07-08 17:55:43
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \BasePro\assets\scripts\https\Msg.ts
 */

class Msg {
    // 热更事件 ------- begin------
    HOT_UPDATE_START = "hot_update_start" // 热更开始
    HOT_UPDATE_NEW_APK = "hot_update_NewApk"; // 换包
    HOT_UPDATE_PROGRESS = "hot_update_Progress"; // 更新进度
    HOT_UPDATE_RETRY = "hot_update_Retry"; // 更新失败重试
    HOT_UPDATE_LOGIN = "hot_update_login"; // 打开登陆界面
    // 热更事件 ------- end------

    BATTLE_UPDATE_WAVE = "battle_update_wave"; // 更新怪物波数
    BATTLE_DROP_SILVER = "battle_drop_silver"; // 掉落银币

    LEVEL_SELECT = "level_select"; // 关卡选择

    UPDATE_GOLD = "update_gold"; // 更新金币
    UPDATE_DIAMOND = "update_diamond"; // 更新钻石

    UPDATE_HERO = "update_hero"; // 更新英雄
    UPDATE_LIMIT_HERO = "update_limit_hero"; // 更新限制英雄
    OPEN_HERO_VIEW = "open_hero_view"; // 打开英雄界面
    UPDATE_COPY_COUNT = "update_copy_count"; // 更新副本次数

    OPEN_DRAW_CARD = "open_draw_card"; // 打开抽卡界面

    UPDATE_BATTLE_END = "update_battle_end"; // 战斗结束通知
    DELETE_BATTLE_HERO = "delete_battle_hero"; // 删除上阵英雄

    OPEN_MAIN_VIEW = "open_main_view"; // 打开主界面

    UPDATE_SKILL_INFO = "update_skill_info"; // 更新技能信息

    UPDATE_ENEMY_SKILL_INFO = "update_enemy_skill_info"; // 更新敌方技能
    HERO_DAMAGE_MONSTER = "hero_damage_monster";  // 英雄对怪物的伤害
    UPDATE_MONSTER_START = "update_monster_start";  // 通知怪物开始战斗

    UPDATE_GUILD_STEP = "update_guild_step"; // 更新下一步新手引导
    UPDATE_CLOSE_GUILD = "update_close_guild"; // 关闭引导

    NOTICE_CREATE_MONSTER = "notice_create_monster"; // 通知生成怪物

    UPDATE_CLOSE_GUILD_MASK = "update_close_guild_mask"; // 关闭mask

    UPDATE_CLOSE_LOADING = "update_close_loading"; // 关闭loading界面

    OPEN_COPY = "open_copy"; // 打开副本
    UPDATE_TASK = "update_task"; // 更新任务
    UPDATE_ACHIEVEMENT = "update_achievement"; // 成就

    OPEN_LEVEL = "open_level"; // 打开章节
}

export default new Msg();

