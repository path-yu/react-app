export function parseTime(time: number | string | Date, cFormat?: string) {
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
  let date: Date;
  if (typeof time === 'object') {
    date = time;
  } else if (typeof time === 'number') {
    date = new Date(time);
  } else {
    if (('' + time).length === 10) {
      time = parseInt(time) * 1000;
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  type dateKey = 'y' | 'm' | 'd' | 'h' | 'i' | 's' | 'a';
  const time_str = format.replace(
    /{(y|m|d|h|i|s|a)+}/g,
    (result, key: string) => {
      let value = formatObj[key as dateKey];
      let res: string = value.toString();
      if (key === 'a') {
        return ['一', '二', '三', '四', '五', '六', '日'][value - 1];
      }
      if (result.length > 0 && value < 10) {
        res = '0' + value;
      }
      return res || '0';
    }
  );
  return time_str;
}
export function formateTime(time: number, cFormat?: string): string {
  const d = new Date(time);
  const now = Date.now();
  const diff = (now - d.getTime()) / 1000;
  if (diff < 30) {
    return '刚刚';
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前';
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前';
  } else if (diff < 3600 * 24 * 2) {
    return '1天前';
  }
  if (cFormat) {
    return parseTime(time, cFormat);
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    );
  }
}
