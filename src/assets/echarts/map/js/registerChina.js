/**
 * 用与业务相同的 echarts ESM 实例注册中国地图。
 * 旧 china.js 为 UMD，生产打包里 require('echarts') 常拿不到 registerMap
 *（拿到的是 { default: echarts } 之类），导致地图未注册、图表空白。
 */
import * as echarts from 'echarts';
import chinaGeoJson from '../json/china.json';
export function registerChinaMap() {
  if (!echarts || typeof echarts.registerMap !== 'function') {
    console.error('[china-map] echarts.registerMap 不可用');
    return false;
  }
  // 已注册则跳过，避免重复
  if (typeof echarts.getMap === 'function' && echarts.getMap('china')) {
    return true;
  }
  echarts.registerMap('china', chinaGeoJson);
  return true;
}

registerChinaMap();

export default echarts;
