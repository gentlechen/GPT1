import UtilsMath from "../utils/UtilsMath";

class TradplusAd {

    private bannerAd;
    private rewardedVideo; // 激励广告
    private rewardedId;
    private bannerId;

    public InitAd(){

        // this.rewardedId = "FF8A25333EBE24C161A98949A306E542"
        this.rewardedId = "5AFF107C1BEF5A3DE1272D4B7F60C98F"
        this.bannerId = "992F7CB49F9688D5BA1CA37825C4C588"
        
        if (!UtilsMath.IsAndroid() && !UtilsMath.IsIOS()) {
            return;
        }

        // cc.debug.setDisplayStats(false); // 不显示左下角的FPS等调试信息

        // 启用调试日志，仅测试时使用，上线前请注释掉
        tradplus.tradPlusService.setEnableLog(true);

        // 初始化SDK
        tradplus.tradPlusService.initSdk();
        // 启用测试模式，仅测试时使用，上线前请注释掉
        tradplus.tradPlusService.setNeedTestDevice(true);

    }

    showGDPR() {
      if (!tradplus.privacy.isFirstShowGDPR()) {
        tradplus.privacy.showUploadDataNotifyDialog();
      } else {
        console.log('User already choosen a GDPR level');
      }
    }

    // banner广告
    public BannerAd(){

		
        if (!this.bannerAd) {
            this.bannerAd = tradplus.tradPlusService.getBanner(this.bannerId);
        }
		console.log("this.bannerAd = " + this.bannerAd)

        this.bannerAd.setAdListener({
        onAdLoaded: (adSourceName) => {
            // 在广告加载完成的时候触发，adSourceName为广告源名称
            console.log("-----------BannerAd onAdLoaded")
            console.log(adSourceName)
        },

        onAdClicked: () => {
            // 在广告被点击的时候触发
            console.log("-----------BannerAd onAdClicked")
        },

        onAdLoadFailed: (adError) => {
            // 在广告加载失败的时候触发，adError包含了错误信息
            console.log("-----------BannerAd onAdLoadFailed")
            console.log(adError)
        },

        onAdImpression: () => {
            // 在广告被展示的时候触发
        },

        onAdShowFailed: (adError) => {
            // 在广告显示失败的时候触发
            // 注：这个回调仅在Android平台下会触发
            console.log("-----------BannerAd onAdShowFailed")
            console.log(adError)
        },

        onAdClosed: () => {
            // 在广告被关闭后触发
            // 注：这个回调仅在Android平台下会触发

            console.log("-----------BannerAd onAdClosed")
        },

        onBannerRefreshed: () => {
            // 在广告自动刷新时触发
            // 注：这个回调仅在Android平台下会触发
        },
        });

        // 在屏幕上方加载并显示横幅广告
        this.bannerAd.loadAd('top');
    }


    // 激励广告
    public RewardedVideo(){

        if (!this.rewardedVideo) {
            this.rewardedVideo = tradplus.tradPlusService.getRewardedVideo(
                this.rewardedId,
                true
            );
        }

        // this.rewardedVideo.entryAdScenario('')


        const customMap = {
            user_gender: 'male',
            user_level: '10',
          };
      
          // App level, for all placements.
          // tradplus.tradPlusService.initCustomMap(customMap);
          // Only for the specify placement, override the App level one.
          tradplus.tradPlusService.initPlacementCustomMap(this.rewardedId, customMap);
      
          this.rewardedVideo.setAdListener({
            onAdAllLoaded: (anyAdsLoadSucceeded) => {
              console.log(
                'onAdAllLoaded, anyAdsLoadSucceeded:',
                anyAdsLoadSucceeded
              );
            },
      
            onAdLoaded: () => {
              console.log('RewardedVideo onAdLoaded');
            },
      
            onAdClicked: () => {
              console.log('RewardedVideo onAdClicked');
            },
      
            onAdImpression: (adSourceName) => {
              console.log('RewardedVideo onAdImpression, adSourceName:', adSourceName);
            },
      
            onAdFailed: (adError) => {
              console.log('RewardedVideo onAdFailed, adError:', adError);
            },
      
            // iOS only
            onAdPlayFailed: (adError) => {
              console.log('RewardedVideo onAdPlayFailed, adError:', adError);
            },
      
            onAdClosed: () => {
              console.log('RewardedVideo onAdClosed');
            },
      
            onAdReward: (currencyName, amount) => {
              console.log(
                'onAdReward, currencyName:',
                currencyName,
                'amount:',
                amount
              );
            },
      
            // iOS only
            onAdNotReward: () => {
              console.log('RewardedVideo onAdNotReward');
            },
      
            // Android only
            onOneLayerLoaded: (adSourceName) => {
              console.log('onOneLayerLoaded, adSourceName:', adSourceName);
            },
      
            // Android only
            onOneLayerLoadFailed: (adSourceName, adError) => {
              console.log(
                'onOneLayerLoadFailed, adSourceName:',
                adSourceName,
                'adError:',
                adError
              );
            },
          });
    }

    public showAd() {
        console.log("----- this.rewardedVideo.ready = " + this.rewardedVideo.ready);
        if (this.rewardedVideo.ready) {
          console.log('Show Ad');
          this.rewardedVideo.showAd('');
        } else {
          console.log('No Ad is ready right now, please wait...');
        }
    }
    
    public OnClose() {
        if (this.rewardedVideo) this.rewardedVideo.destroyAd();
    }   
}


export default new TradplusAd();