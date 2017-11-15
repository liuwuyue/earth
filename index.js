import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
//星空
import Star from './src/star'; 
//地球
import Earth from './src/earth'; 
import globalData from './globalData.json';
import EarthSpline from './src/earthSpline';
let type = /line/.test(location.href) ? 1 : 0;
let child = null;
switch (type) {
  case 0:
    child = (
      <Earth data={globalData}></Earth>
    );
    break;
  case 1:
    let data = globalData;
    let length = globalData.length;
    let lines = [];
    for (let i = 0; i < length; i++) {
      let p = Math.floor(Math.random() * length) 
      let q = Math.floor(Math.random() * length) 
      lines.push({
        start: globalData[p],
        end: globalData[q]   
      });
    }
    child = (
      <EarthSpline data={globalData} lines={lines}></EarthSpline>
    );
    break;
}
ReactDOM.render(
  <div>
    <Star></Star>
    {child}
  </div>,
  document.querySelector('#app')  
);
