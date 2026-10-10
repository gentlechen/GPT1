export class ByteArray {
    endian: boolean;
    bytesBuff: any;
    bytesBuffView: DataView;
    fmt: any;
    data: any;
    position: any;
    length: any;
    
    /**
     * @param bytesBuff 请求解码的数据
     * @param endian 字节序
     */
    constructor(bytesBuff = null, endian = false) {
        this.bytesBuff = bytesBuff;
        this.bytesBuffView = null;
        if (bytesBuff) {
            this.bytesBuffView = new DataView(this.bytesBuff);
        } else {
            this.fmt = [];
            this.data = [];
        }
        this.endian = endian;
        this.position = 0;
        this.length = 0;
    }
    
    destory() {
        this.bytesBuff = null;
        this.fmt = null;
        this.data = null;
        this.bytesBuff = null;
        this.bytesBuffView = null;
    }
    
    readByte() {
        var va1 = this.bytesBuffView.getInt8(this.position);
        this.position += 1;
        return va1;
    }
    
    writeByte(b) {
        this.fmt.push('b');
        this.data.push(b);
        this.length += 1;
    }
    
    readShort() {
        var val = this.bytesBuffView.getInt16(this.position, this.endian);
        this.position += 2;
        return val;
    }
    
    writeShort(h) {
        this.fmt.push('h');
        this.data.push(h);
        this.length += 2;
    }
    
    // readLong() {
    //     var val = this.bytesBuffView.getBigUint64(this.position, this.endian);
    //     this.position += 8;
    //     return val;
    // }
    
    writeLong(d) {
        this.fmt.push("l");
        this.data.push(d);
        this.length += 8;
    }
    
    readInt() {
        var val = this.bytesBuffView.getInt32(this.position, this.endian);
        this.position += 4;
        return val;
    }
    
    writeInt(i) {
        this.fmt.push('i');
        this.data.push(i);
        this.length += 4;
    }
    
    readDouble() {
        var val = this.bytesBuffView.getFloat64(this.position, this.endian);
        this.position += 8;
        return val;
    }
    
    writeDouble(d) {
        this.fmt.push('d');
        this.data.push(d);
        this.length += 8;
    }
    
    readString() {
        var l = this.readShort();
        if (l < 1) return '';
        var u8Arr = new Uint8Array(this.bytesBuff, this.position);
        var arr = [];
        for (var i = 0; i < l; i++) {
            arr[i] = u8Arr[i];
        }
        var ret = decode(arr);
        this.position += l;
        return ret;
    }
    
    writeString(s) {
        var arr = encode(s);
        this.writeShort(arr.length);
        this.fmt.push('s');
        this.data.push(this._uintCharArrToString(arr));
        this.length += arr.length;
    }
    
    writeMultiByte(str) {
        var len = str.length;
        for (var i = 0; i < len; i++) {
            this.writeByte(str.charCodeAt(i));
        }
        this.length += len;
    }
    
    _uintCharArrToString(arr) {
        var ret = '';
        for (var i = 0; i < arr.length; i++) {
            ret += String.fromCharCode(arr[i]);
        }
        return ret;
    }
    
    getbytes() {
        if (this.bytesBuff) {
            return this.bytesBuff;
        } else {
            var buff = new ArrayBuffer(this.length);
            var buffView = new DataView(buff);
            var len = this.fmt.length;
            var dataType = '';
            var elm: any = 0;
            var index = 0;
            for (var i = 0; i < len; i++) {
                dataType = this.fmt[i];
                elm = this.data[i];
                if (dataType == 'b') {
                    buffView.setInt8(index, elm);
                    index += 1;
                } else if (dataType == 'h') {
                    buffView.setInt16(index, elm, this.endian);
                    index += 2;
                } else if (dataType == 'i') {
                    buffView.setInt32(index, elm, this.endian);
                    index += 4;
                } else if (dataType == 'd') {
                    buffView.setFloat64(index, elm, this.endian);
                    index += 8;
                } else if (dataType == "l") {
                    buffView.setInt32(index, elm, this.endian);
                    index += 8;
                    buffView.setInt32(index, elm, this.endian);
                    index += 8;
                } else if (dataType == 's') {
                    index += this._fillArryBuffWithString(elm, buff, index);
                }
            }
            return buff;
        }
    }
    
    _fillArryBuffWithString(strdata, arryBuff, offset) {
        if (!strdata) {
            return;
        }
        var len = strdata.length;
        var tempdataView = new DataView(arryBuff, offset);
        for (var i = 0; i < len; i++) {
            tempdataView.setUint8(i, strdata.charCodeAt(i));
        }
        return len;
    }
    }
    
    function decode(dotNetBytes) {
    var result = "";
    var i = 0;
    var c = 0;
    var c1 = 0;
    var c2 = 0;
    var c3 = 0;
    if (dotNetBytes.length >= 3) {
    if ((dotNetBytes[0] & 0xef) == 0xef
    && (dotNetBytes[1] & 0xbb) == 0xbb
    && (dotNetBytes[2] & 0xbf) == 0xbf) {
    i = 3;
    }
    }
    
    while (i < dotNetBytes.length) {
        c = dotNetBytes[i] & 0xff;
        if (c < 128) {
            result += String.fromCharCode(c);
            i++;
        }
        else if ((c > 191) && (c < 224)) {
            if (i + 1 >= dotNetBytes.length)
                throw "Un-expected encoding error, UTF-8 stream truncated, or incorrect";
            c2 = dotNetBytes[i + 1] & 0xff;
            result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            if (i + 2 >= dotNetBytes.length || i + 1 >= dotNetBytes.length)
                throw "Un-expected encoding error, UTF-8 stream truncated, or incorrect";
            c2 = dotNetBytes[i + 1] & 0xff;
            c3 = dotNetBytes[i + 2] & 0xff;
            result += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }
    }
    return result;
    }
    
    function encode(stringToEncode, insertBOM = false) {
    stringToEncode = stringToEncode.replace(/\r\n/g, "\n");
    var utftext = [];
    if (insertBOM == true) {
    utftext[0] = 0xef;
    utftext[1] = 0xbb;
    utftext[2] = 0xbf;
    }
    
    for (var n = 0; n < stringToEncode.length; n++) {
        var c = stringToEncode.charCodeAt(n);
        if (c < 128) {
            utftext[utftext.length] = c;
        }
        else if ((c > 127) && (c < 2048)) {
            utftext[utftext.length] = (c >> 6) | 192;
            utftext[utftext.length] = (c & 63) | 128;
        }
        else {
            utftext[utftext.length] = (c >> 12) | 224;
            utftext[utftext.length] = ((c >> 6) & 63) | 128;
            utftext[utftext.length] = (c & 63) | 128;
        }
    }
    return utftext;
}
    