/** Creator 2.4: route the original resource paths to local asset bundles.
 * Cocos handles WeChat subpackage downloads via loadBundle (no resource server).
 */
export default class ResourceLoader {
    private static pending: { [name: string]: Array<(err: Error, bundle?: cc.AssetManager.Bundle) => void> } = {};

    static load(path: string, typeOrCallback: any, callback?: any): void {
        const done = callback || typeOrCallback;
        const name = /^(music|musics)\//.test(path) ? "gameaudio"
            : /^spine\//.test(path) ? "gameart" : "resources";
        this.getBundle(name, (err, bundle) => {
            if (err) { done(err, null); return; }
            if (callback) bundle.load(path, typeOrCallback, callback);
            else bundle.load(path, typeOrCallback);
        });
    }

    private static getBundle(name: string, done: (err: Error, bundle?: cc.AssetManager.Bundle) => void): void {
        const cached = cc.assetManager.getBundle(name);
        if (cached) { done(null, cached); return; }
        if (this.pending[name]) { this.pending[name].push(done); return; }
        this.pending[name] = [done];
        cc.assetManager.loadBundle(name, (err, bundle) => {
            const waiting = this.pending[name];
            delete this.pending[name];
            if (err) console.error("[ResourceLoader] bundle failed:", name, err);
            waiting.forEach(fn => fn(err, bundle));
        });
    }
}
