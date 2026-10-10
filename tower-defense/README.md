# 塔防英雄：微信小游戏学习项目

使用 Cocos Creator **2.4.15** 打开本目录，启动场景为 `assets/resources/scenes/HallScene.fire`。

微信 AppID 为 `wx2cc441afbc7bf78c`。已关闭 main/resources 的远程选项，清空旧资源服务器地址。

已将 333 个 Label 和 1 个 RichText 改成系统字体，移出约 6.77 MB 的艺黑字体。详细修改文件见「字體修改清單.txt」。游戏代码与其他配置保持不变。

重新构建前请预览各界面，检查字体变化引起的换行或截断。微信构建输出路径使用无中文路径，例如 `D:/CocosBuild/TowerDefense`。用微信开发者工具导入包含 game.js、game.json 和 project.config.json 的构建目录。

已验证序列化文件、字体引用和非目标文件完整性；尚未运行 Creator 预览、微信构建或真机测试。当前没有分包或微信广告适配，构建后仍需检查包体积。
