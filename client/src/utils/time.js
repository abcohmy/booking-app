
/*
    d.toIsoString() => UTC
    getHours() => 本地時間
    getUTCHours() => UTC
    Data => 沒標Z為本地，有標Z為UTC，整數則為timestamp(自 1970-01-01 00:00:00 UTC 開始的毫秒數)
*/

/*
//呈現UTC時間
function formatForInput(datetimeStr){
    //轉成Date物件 => 給JS無法解析的字串會回傳Invalid Date
    const d = new Date(datetimeStr);

    //檢查是否合法 先查距離1970/1/1的毫秒數，若是非法DATE回傳null
    if (isNaN(d.getTime())) return '';
    //toISOString轉 String'YYYY-MM-DDTHH:mm:ss.sssZ', 取前16個數字
    return d.toISOString.slice(0, 16); // 注意：這是UTC，可能顯示錯
}
*/

function formatToLocalDatetimeInput(datetimeStr){
    const d = new Date(datetimeStr);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatForDisplay(datetimeStr){
    try {
        const d = new Date(datetimeStr);
        if (isNaN(d.getTime())) return '日期無效';
        return d.toLocaleDateString('zh-TW', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
        }); 
    } catch (e) {
        return '日期解析錯誤';
    }
}

function toISOStringOrNull(localDatetimeStr){
    const d = new Date(localDatetimeStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
}


//default只推薦用一個函數, 包起來反而太長
export {formatToLocalDatetimeInput, formatForDisplay, toISOStringOrNull};