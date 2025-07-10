
/*
    d.toIsoString() => UTC
    getHours() => 本地時間
    getUTCHours() => UTC
    Data => 沒標Z為本地，有標Z為UTC，整數則為timestamp(自 1970-01-01 00:00:00 UTC 開始的毫秒數)
*/

function formatToLocalDatetimeInput(datetimeStr){
    //轉成Date物件 => 給JS無法解析的字串會回傳Invalid Date
    const d = new Date(datetimeStr);
    //檢查是否合法 先查距離1970/1/1的毫秒數，若是非法DATE回傳null
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

function roundToHalfHour(datetimeStr) {
  const d = new Date(datetimeStr);
  d.setSeconds(0);
  d.setMilliseconds(0);
  const minutes = d.getMinutes();
  if (minutes < 30) {
    d.setMinutes(0);
  } else {
    d.setMinutes(30);
  }

  return d;

}


//default只推薦用一個函數, 包起來反而太長
export {formatToLocalDatetimeInput, formatForDisplay, toISOStringOrNull, roundToHalfHour};