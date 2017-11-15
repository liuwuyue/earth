/**
  * @description 星空相关的交互展现
  */
import * as THREE from 'three';
import React from 'react';
import './star.less';
import light from './img/light_alpha.png';
import util from './util';
//视野深度
const size = 1000;
//星星个数
const total = 5000;
const name = 'particle';
//闪烁 变化的步长
const step = 0.03;
//流行滑动的步长
const fallingStep = 0.02;
//变化的范围
const range = 6;
const minScale = 4;
const maxScale = 12;
class Star extends React.PureComponent {
  render () {
    return (
      <div className="star" ref={ c => this.el = c}>
        {/*星空相关的*/}
      </div>
    );
  }
  componentDidMount () {
    let camera, scene, renderer;
    //获取容器宽 高
    let width = util.css(this.el, 'width');
    let height = util.css(this.el, 'height');

    //初始化照相机
    camera = new THREE.PerspectiveCamera(45, width / height, 1, size);
    camera.position.z = size;

    //初始化场景
    scene = new THREE.Scene();
    //渲染器
    //renderer = new THREE.WebGLRenderer({alpha: true});
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0x000000));
    renderer.setSize(width, height);
    this.el.appendChild(renderer.domElement);

    let spriteMap = new THREE.TextureLoader().load(light);
    let material = new THREE.SpriteMaterial({
      map: spriteMap,
      color: 0xffffff
    });
    let group = new THREE.Group();
    let spriteStatus = {};
    for (let i = 0; i < total; i++) {
      let p = point();
      let sprite = new THREE.Sprite(material);
      sprite.position.set(p.x, p.y, p.z);
      sprite.name = i;
      let t = Math.random();
      let scale = computeScale(t);
      sprite.scale.set(scale, scale, scale);
      spriteStatus[i] = {
        //流星
        falling: Math.random() > 0.999,
        t: t,
        direction: Math.random() > 0.5 ? 1 : -1,
        p0: p,
        p2: point()
      };
      group.add(sprite);
    }
    scene.add(group);
    animate();
    function animate () {
      requestAnimationFrame(animate);
      group.children.forEach((item) => {
        let p = spriteStatus[item.name];
        let {t, p0, p2} = p;
        if (!p.falling) {
          //非流星 闪烁效果
          let scale = computeScale(t);
          item.scale.set(scale, scale, scale);
        } else {
          let p1 = {
            x: p0.x,
            y: p0.y,
            z: p2.z
          };
          item.position.x = Math.pow((1 - t), 2) * p0.x + 2 * t * (1 - t) * p1.x + t * t * p2.x,
          item.position.y = Math.pow((1 - t), 2) * p0.y + 2 * t * (1 - t) * p1.y + t * t * p2.y,
          item.position.z =Math.pow((1 - t), 2) * p0.z + 2 * t * (1 - t) * p1.z + t * t * p2.z
          item.scale.set(maxScale, maxScale, maxScale);
        }
        if (t > 1) {
          p.direction = -1;
          if (p.falling) {
            p.p0 = point();
            p.p2 = point();
          }
        } else if (t < 0) {
          p.direction = 1;
          if (p.falling) {
            p.p0 = point();
            p.p2 = point();
          }
        }
        p.t += p.direction * (p.falling ? fallingStep : step);
      });
      renderer.render(scene, camera);
    }
  }
}
function computeScale (t) {
  return  (1 - t) * minScale + t * maxScale;
}
function point () {
  return {
    x: (Math.random() - 0.5) * size,
    y: (Math.random() - 0.5) * size,
    z: Math.random() * size * .8
  };
}
export default Star;
