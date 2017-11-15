import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
//星空
import Star from './src/star'; 
//地球
import Earth from './src/earth'; 
import globalData from './globalData.json';
console.log(globalData);
ReactDOM.render(

  <div>
    <Star></Star>
    <Earth data={globalData}></Earth>
  </div>,
  document.querySelector('#app')  
);
