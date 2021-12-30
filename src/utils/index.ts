import { CSSProperties } from 'react';

export function isPureNumber(num: any): boolean {
  num = +num;
  return isNaN(num) ? false : typeof num === 'number';
}
export function getDisplayStyle(testValue: boolean):CSSProperties {
  return {
    display:testValue ? 'block': 'none'
  }
}
export function setLocalStorage(key: string, val: any) {
  if (typeof val !== 'string') {
    val = JSON.stringify(val);
  }
  window.localStorage.setItem(key, val);
}
export function removeLocalStorage(key:string) {
  window.localStorage.removeItem(key);
}
export function getLocalStorage(key: string) {
  const data = window.localStorage.getItem(key) || null;
  return data ? JSON.parse(data) : null;
}
export const storage = {
  set: setLocalStorage,
  remove: removeLocalStorage,
  get: getLocalStorage,
};

