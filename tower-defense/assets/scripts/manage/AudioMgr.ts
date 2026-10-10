import ResourceLoader from "../utils/ResourceLoader";
//电子邮件puhalskijsemen@gmail.com
//源码网站 开vpn全局模式打开 http://web3incubators.com/
//电报https://t.me/gamecode999
//网页客服 http://web3incubators.com/kefu.html

import { MusicPath } from "../common/GameEnum";
import GameEvent from "../common/GameEvent";
import DLocal from "../data/DLocal";


class AudioMgr {

    // 音量
    _bgmVolume: number = 0.8;
    _sfxVolume: number = 0.8;
    // 开关
    _bgmswitch: number = 1;
    _sfxswitch: number = 1;
    _bg_music: string = "";
    _testNum = 0;

    _isLoadBgMusic = false;
    _isSound = true;
    _musicMap = {};


    initAudio() {
        let setting = DLocal.getSetting();

        this._bgmVolume = setting.bgm_volum; // 背景音量
        this._sfxVolume = setting.sfx_volum;   // 音效音量
        this._bgmswitch = setting.bgm_switch;// 背景音乐开关
        this._sfxswitch = setting.sfx_switch;  // 音效开关


        this._bg_music = MusicPath.BGMUSIC;
        this._isSound = this._sfxswitch == 1;
    }

    loadMusic(resPath: string, callback: Function = null) {
        if (this._musicMap[resPath]) {
            if (callback != null) {
                callback(this._musicMap[resPath]);
            }
        } else {
            ResourceLoader.load(resPath, cc.AudioClip, (err, res) => {
                if (err) {
                    return;
                }
                this._musicMap[resPath] = res;
                if (callback != null) {
                    callback(res);
                }
            })
        }
    }


    /**
     * 播放背景音乐
     *
     * @returns
     * @memberof AudioMgr
     */
    playMusic() {
        let setting = DLocal.getSetting();
        this._bgmswitch = setting.bgm_switch;// 背景音乐开关
        if (this._bgmswitch == 0) {
            console.log("背景音乐关闭");
            return;
        }
        var self = this;
        this.loadMusic(this._bg_music, function (audioClip) {
            console.log("播放背景音乐");
            self._isLoadBgMusic = true;
            cc.audioEngine.playMusic(audioClip, true);
        });
    }

    // 播放战斗音乐
    playBattleMusic() {
        let setting = DLocal.getSetting();
        this._bgmswitch = setting.bgm_switch;// 背景音乐开关
        if (this._bgmswitch == 0) {
            console.log("背景音乐关闭");
            return;
        }
        this.loadMusic(MusicPath.BATTLE, function (audioClip) {
            console.log("播放战斗音乐");
            cc.audioEngine.playMusic(audioClip, true);
        });
    }

    // 播放音效
    playEffect(musicPath: string) {
        let setting = DLocal.getSetting();
        this._sfxswitch = setting.sfx_switch;  // 音效开关
        if (this._sfxswitch == 0) {
            return;
        }
        this.loadMusic(musicPath, function (audioClip) {
            cc.audioEngine.playEffect(audioClip, false);
        })
    }

    /**
     * 暂停音乐
     *
     * @memberof AudioMgr
     */
    pauseMusic() {
        //cc.audioEngine.pauseMusic();
        cc.audioEngine.pauseMusic();
    }

    /**
     * 恢复音乐
     *
     * @memberof AudioMgr
     */
    resumeMusic() {
        if (this._isLoadBgMusic == true) {
            cc.audioEngine.resumeMusic();
        } else {
            this.initAudio();
            this.playMusic();
        }

    }

    /**
     * 暂停音效
     *
     * @memberof AudioMgr
     */
    pauseAllSound() {
        cc.audioEngine.pauseAllEffects();
    }

    /**
     * 恢复音乐
     *
     * @memberof AudioMgr
     */
    resumeAllSound() {
        cc.audioEngine.resumeAllEffects();
    }

    setValue(num) {
        this._testNum = num;
    }
    getValue() {
        return this._testNum;
    }
}

export default new AudioMgr();
