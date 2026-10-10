import UtilsMath from "../utils/UtilsMath";


class NativeMgr {
    private OCClassName: string;
    private JavaClassName: string;
    private JavaArgTypeDict: Object;

    public Init() {
        this.OCClassName = "DSH";
        this.JavaClassName = "com/DSH"; // this.JavaClassName = "org/cocos2dx/javascript/AppActivity"; //谷歌
        this.JavaArgTypeDict = {
            Number: "I",
            String: "Ljava/lang/String;",
            Boolean: "Z",
            Float: "F",
        };

    }

    //调用native平台接口
    //funName:函数名
    //参数顺序列表argList=[{"Name":"Title", "Value":"xx"},{"Name":"Description", "Value":"xx"},{"Name":"URL", "Value":"xx"}]
    //returnType 返回值类型
    public CallToNative(funName, argList, returnType = "") {
        if (!UtilsMath.IsNative()) {
            console.error("CallToNative(%s) not native", funName);
            return;
        }

        if (UtilsMath.IsAndroid()) {
            return this.CallToJava(funName, argList, returnType);
        } else if (UtilsMath.IsIOS()) {
            return this.CallToOC(funName, argList);
        } else {
            console.error("CallToNative:%s error", cc.sys.os);
        }
    }

    /**
     * 调用java接口
     * javaFunName MyAPIManager.java 对应函数名
     * argList argList 函数接受的参数列表
     * returnType returnType 函数返回值类型
     */
    public CallToJava(javaFunName, argList, returnType) {
        let javaFunArgList = [];

        let javaFunSign = "(";

        let count = argList.length;
        for (let index = 0; index < count; index++) {
            let argInfo = argList[index];
            if (!argInfo.hasOwnProperty("Value")) {
                console.error("CallToJava argInfo error", argInfo);
                return;
            }
            let value = argInfo["Value"];
            let argType = Object.prototype.toString.call(value).slice("[object ".length, -1);
            let javaType = this.JavaArgTypeDict[argType];
            if (!javaType) {
                console.error("CallToJava(%s, %j) error", javaFunName, argList);
                return;
            }

            javaFunSign += javaType;
            javaFunArgList.push(value);
        }

        let returnValueType = this.JavaArgTypeDict[returnType];
        //如果有返回值
        if (returnValueType) {
            javaFunSign += ")" + returnValueType;
        } else {
            javaFunSign += ")V";
        }
        javaFunArgList.unshift(this.JavaClassName, javaFunName, javaFunSign);

        try {
            console.log("javaFunArgList CallToJava(%s)", JSON.stringify(javaFunArgList));
            return jsb.reflection.callStaticMethod.apply(this, javaFunArgList);
        } catch (error) {
            console.error("CallToJava(%s,%s,%s) error:%s", javaFunName, JSON.stringify(argList), returnType, error.stack);
        }
    }

    /**
     * 调用oc接口
     * javaFunName MyAPIManager.java 对应函数名
     * argList argList 函数接受的参数列表
     * returnType returnType 函数返回值类型
     */
    public CallToOC(ocFunName, argList) {
        let ocFunArgList = [];
        ocFunArgList.push(this.OCClassName);

        let funString = ocFunName;
        let count = argList.length;
        for (let index = 0; index < count; index++) {
            let argInfo = argList[index];
            let name = argInfo["Name"];
            let value = argInfo["Value"];

            if (!name) {
                console.error("CallToOC(%s) argInfo error", ocFunName, argInfo);
                return;
            }
            if (index) {
                funString += name + ":";
            } else {
                funString += "With" + name + ":";
            }

            ocFunArgList.push(value);
        }
        //插入函数签名
        ocFunArgList.splice(1, 0, funString);

        try {
            console.log("javaFunArgList CallToOC(%s)", JSON.stringify(ocFunArgList));
            return jsb.reflection.callStaticMethod.apply(this, ocFunArgList);
        } catch (error) {
            console.error("CallToOC(%s,%s) error:%s", ocFunName, JSON.stringify(argList), error.stack);
        }
    }
}

export default new NativeMgr();
