const PENDING = "PENDING";
const FULFILLED = "FULFILLED";
const REJECTED = "REJECTED";

class XPromise {
    fulfilledQueue = [];
    rejectedQueue = [];
    _status = PENDING;
    _value = null;
    _reject = null;
    _resolve = null;

    constructor(fn) {
        const handleFulfilledQueue = () => {
            while (this.fulfilledQueue.length) {
                let fulfiledFn = this.fulfilledQueue.shift();
                fulfiledFn(this._value);
            }
        };
        const handleRejectedQueue = () => {
            while (this.rejectedQueue.length) {
                let rejectedFn = this.rejectedQueue.shift();
                rejectedFn(this._value);
            }
        };

        // 完成状态转变，执行回调队列中的回调函数
        this._resolve = val => {
            const fn = () => {
                if (this._status !== PENDING) {
                    return;
                }
                if (val instanceof XPromise) {
                    val.then(
                        res => {
                            this._status = FULFILLED;
                            this._value = res;
                            handleFulfilledQueue();
                        },
                        err => {
                            this._status = REJECTED;
                            this._value = err;
                            handleRejectedQueue();
                        }
                    );
                } else {
                    this._status = FULFILLED;
                    this._value = val;
                    handleFulfilledQueue();
                }
            };
            //setTimeout(fn, 0);
            fn();
        };
        // 完成状态Pending到REJECTED的转变，执行rejected队列中的回调函数
        this._reject = val => {
            const fn = () => {
                if (this._status !== PENDING) {
                    return;
                }
                this._status = REJECTED;
                this._value = val;
                handleRejectedQueue();
            };
            //setTimeout(fn, 0);
            fn();
        };

        try {
            // 处理外部传入函数执行异常
            fn(this._resolve, this._reject);
        } catch (e) {
            cc.error(e);
            return this._reject(e);
        }
    }

    public then(successFn=null, failFn=null) {
        return new XPromise((resolve, reject) => {
            // 执行成功时的回调函数
            const handleSucess = fn => {
                try {
                    if (typeof fn === "function") {
                        const res = fn(this._value);
                        if (res instanceof XPromise) {
                            res.then(resolve, reject);
                        } else {
                            resolve(res);
                        }
                    } else {
                        resolve(this._value);
                    }
                } catch (e) {
                    cc.error(e);
                    reject(e);
                }
            };
            // 执行失败时的回调函数
            const handleFail = fn => {
                try {
                    if (typeof fn === "function") {
                        const res = fn(this._value);
                        if (res instanceof XPromise) {
                            res.then(resolve, reject);
                        } else {
                            resolve(res);
                        }
                    } else {
                        reject(this._value);
                    }
                } catch (e) {
                    cc.error(e);
                    reject(e);
                }
            };
            switch (this._status) {
                case PENDING: // 异步任务尚未完成，将回调函数推入相应队列
                    this.fulfilledQueue.push(() => {
                        handleSucess(successFn);
                    });
                    this.rejectedQueue.push(() => {
                        handleFail(failFn);
                    });
                    break;
                case FULFILLED: // 异步任务成功完成，执行成功回调函数
                    handleSucess(successFn);
                    break;
                case REJECTED: // 异步任务已失败，执行失败回调函数
                    handleFail(failFn);
                    break;
                default:
                    console.log("XPromise error status:", this._status);
                    break;
            }
        });
    }

    public catch(failFn=null) {
        return this.then(null, failFn);
    }

    public finally(finalFn=null) {
        return this.then(finalFn, finalFn);
    }

    public static resolve(val) {
        if (val instanceof XPromise) {
            return val;
        } else {
            return new XPromise((resolve, reject) => {
                resolve(val);
            });
        }
    }

    public static reject(val) {
        return new XPromise((resolve, reject) => {
            reject(val);
        });
    }

    public static all(promiseArr) {
        return new XPromise((resolve, reject) => {
            const len = promiseArr.length;
            let count = 0;
            let result = [];
            if (len <= 0) {
                resolve(result);
                return;
            }
            for (let i = 0; i < len; i++) {
                promiseArr[i].then(
                    val => {
                        count++;
                        result.push[val];
                        if (count === len) {
                            resolve(result);
                        }
                    },
                    err => {
                        reject(err);
                    }
                );
            }
        });
    }

    public static race(promiseArr) {
        return new XPromise((resolve, reject) => {
            const len = promiseArr.length;
            for (let i = 0; i < len; i++) {
                promiseArr[i].then(
                    val => {
                        resolve(val);
                    },
                    err => {
                        reject(err);
                    }
                );
            }
        });
    }
}

export default XPromise;