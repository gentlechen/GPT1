import NativeMgr from "./NativeMgr";
// import TradplusAd from "./TradplusAd";


class SDKMgr {

    private bannerAd = null;

    public InitSdk(){
        NativeMgr.Init();

        // TradplusAd.InitAd();
    }

    //激励广告
    public VideoAd(){

        NativeMgr.CallToNative("playRewardAd", []); 
    }

    public BannerAd(){

        NativeMgr.CallToNative("playBannerAd", []); 
    }

}


export default new SDKMgr();


