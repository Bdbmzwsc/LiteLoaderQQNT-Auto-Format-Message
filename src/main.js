let tempDisable = false;
function checkChinese (str) {
    var reg = new RegExp("[\\u4E00-\\u9FFF]","g");
    var reg_ = new RegExp("[\u3002\uff1b\uff0c\uff1a\u201c\u201d\uff08\uff09\u3001\uff1f\u300a\u300b\uff01\u3010\u3011\uffe5]","g");
    return reg.test(str) || reg_.test(str);
}

function formatMessage(text) {
    var isChinese = checkChinese(text[0]);
    for (let i = 1; i < text.length; i++) {
        if (text[i] == "^"){
            text = remove(text, i);
            isChinese = checkChinese(text[i]);
            continue;
        }
        if (text[i] === " "){
            i++;
            isChinese = checkChinese(text[i]);
            continue;
        }
        const nowIsChinese = checkChinese(text[i]);
        if (nowIsChinese !== isChinese)
            text = insert(text, " ", i);
        isChinese=nowIsChinese;
    }
    return text;
}

function insert(str,flg,sn){
    var start = str.substr(0,sn);
    var end = str.substr(sn,str.length);
      var newstr = start+flg+end;
    return newstr;
}
function remove(str, sn){
    var start = str.substr(0,sn);
    var end = str.substr(sn+1,str.length);
    var newstr = start+end;
    return newstr;
}

function onBrowserWindowCreated(window) {
    const events = window.webContents._events;
    function patch(ipcFunc) { // Adapted from https://github.com/MisaLiu/LiteLoaderQQNT-Pangu/blob/7d1b393319df2f42e7b9b42a9471463b28c04bca/src/hook.ts#L18
        if (!ipcFunc || typeof ipcFunc !== "function") {
            log("Invalid ipcFunc:", ipcFunc);
            return ipcFunc;
        }
        async function patched(...args) {
            const channel = args[2];
            const data = args[3]?.[1];
            if (tempDisable || channel.startsWith("LiteLoader.") || !data || !(data instanceof Array)) {
                return ipcFunc.apply(this, args);
            }
            const [command, ...payload] = data;
            if (command === "nodeIKernelMsgService/sendMsg") {
                const elements = payload[0]?.msgElements;
                if (elements?.length) {
                    for (const element of elements) {
                        if (element.elementType !== 1 || element.textElement.atType !== 0) {
                            // Do not purify non-text elements or at elements
                            continue;
                        }
                        const textEl = element.textElement;
                        textEl.content = await formatMessage(textEl.content);
                    }
                }
                args[3][1] = [command, ...payload];
            }
            return ipcFunc.apply(this, args);
        }
        return patched;
    }
    if (events["-ipc-message"]?.[0]) {
        events["-ipc-message"][0] = patch(events["-ipc-message"][0]);
    } else {
        events["-ipc-message"] = patch(events["-ipc-message"]);
    }
}


module.exports = {
    onBrowserWindowCreated,
};
