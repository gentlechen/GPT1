// This literal remains searchable even when JavaScript identifiers are minified.
console.warn("[TowerBuild] TF-WX-FIX03-20261010");

/** Creator 2.4: route the original resource paths to local asset bundles.
 * Cocos handles WeChat subpackage downloads via loadBundle (no resource server).
 */
export default class ResourceLoader {
    private static pending: { [name: string]: Array<(err: Error, bundle?: cc.AssetManager.Bundle) => void> } = {};

    static load(path: string, typeOrCallback: any, callback?: any): void {
        const done = callback || typeOrCallback;
        const name = /^(music|musics)\//.test(path) ? "gameaudio"
            : /^spine\//.test(path) ? "gameart" : "resources";
        this.getReadyBundle(name, (err, bundle) => {
            if (err) { done(err, null); return; }
            const onLoaded = (loadError: Error, asset: any) => {
                if (loadError) console.error("[BattleTrace] resource failed", name, path, loadError);
                else if (path === "prefabs/battle/UIBattle") console.log("[BattleTrace] battle prefab loaded");
                done(loadError, asset);
            };
            if (path === "prefabs/battle/UIBattle") console.log("[BattleTrace] loading battle prefab", name);
            if (callback) bundle.load(path, typeOrCallback, onLoaded);
            else bundle.load(path, onLoaded);
        });
    }

    /** Keep the first tutorial battle behind a readiness barrier. */
    static prepareBattle(done: (err?: Error) => void): void {
        this.getBundle("gameart", (err, bundle) => {
            if (err) { done(err); return; }
            bundle.loadDir("spine", cc.Prefab, (loadError: Error) => {
                if (loadError) { done(loadError); return; }
                console.log("[BattleTrace] battle animations ready");
                done();
            });
        });
    }

    /** resources contains references redirected to higher-priority gameart.
     * A registered resources bundle alone is not sufficient to parse its prefabs.
     * Cocos 2.4 requires the dependency bundle to be explicitly loaded first.
     */
    private static getReadyBundle(name: string, done: (err: Error, bundle?: cc.AssetManager.Bundle) => void): void {
        if (name !== "resources") { this.getBundle(name, done); return; }
        this.getBundle("gameart", (err) => {
            if (err) { done(err); return; }
            this.getBundle("resources", done);
        });
    }

    private static getBundle(name: string, done: (err: Error, bundle?: cc.AssetManager.Bundle) => void): void {
        if (this.pending[name]) { this.pending[name].push(done); return; }
        const cached = cc.assetManager.getBundle(name);
        if (cached) { done(null, cached); return; }
        this.pending[name] = [done];
        cc.assetManager.loadBundle(name, (err, bundle) => {
            const waiting = this.pending[name];
            delete this.pending[name];
            if (err) console.error("[ResourceLoader] bundle failed:", name, err);
            waiting.forEach(fn => fn(err, bundle));
        });
    }
}
