import * as THREE from 'three';
const util = {
  //获取宽高
  css (el, property) {
    let style = window.getComputedStyle(el);
    return parseInt(style[property]);
  },
  /**
    * @description lng, lat 经纬度 获取球面坐标
    *   r: 球体半径
    */
  lnglatToXYZ ({lng, lat}, r) {
    var phi = (90 - lat) * Math.PI / 180;
    var theta = -1 * lng * Math.PI / 180;
    return {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.cos(phi),
      z: r * Math.sin(phi) * Math.sin(theta)
    };
  },
  //经纬度转平面坐标
  lnglatToXY ({lng, lat}, width, height) {
    let x = (lng - (-180)) / 360 * width;
    let y = Math.abs((lat - 90) / 180) * height;
    return {
      x,y
    };
  },
  loadImg (src) {
    return new Promise((resolve, reject) => {
      let img = new Image(); 
      img.src = src;
      img.onload = () => {
        resolve(img); 
      };
    }); 
  }
};
export default util;
