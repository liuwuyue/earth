/**
  * @description 地球相关的交互展现 飞线
  */
import * as THREE from 'three';
import { MeshLine, MeshLineMaterial } from 'three.meshline';
import React from 'react';
import util from './util';
import './earth.less';
import world from './img/earth.jpg';
import lineBg from './img/line.png';
import hot from './img/start_alpha.png';
//视野深度
const depth = 1000;
//球体半径
const radius = 100;
//每条线的总点数
const count = 30;
//最大到10倍
const times = 6;
//步长
const step = 1;
//中心点
const center = {
  x: 0,
  y: 0,
  z: 0
};
const lineWidthMax = 0;
const lineWidthMin = .8;
const itemSize = 3;
class Earth extends React.PureComponent {
  render () {
    return (
      <div className="earth" ref={ c => this.el = c}>
        {/*地球交互相关*/}
      </div>
    );
  }
  addSphere (point, group, color) {
    return;
    let material = new THREE.MeshBasicMaterial({
      color: color || new THREE.Color(0xff0000),
    });
    let geometry = new THREE.SphereGeometry(1, 32, 32);
    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(point.x, point.y, point.z);
    group.add(mesh);
  }
  //添加立体线条
  addLines (group) {
    let material = new MeshLineMaterial({
      map: new THREE.TextureLoader().load(lineBg),
      useMap: true
    });
    this.props.lines.forEach((item, index) => {
      let t = Math.random();
      //获取起始点
      let p1 = util.lnglatToXYZ({lng: item.start.lnglat[0], lat: item.start.lnglat[1]}, radius);
      let p2 = util.lnglatToXYZ({lng: item.end.lnglat[0], lat: item.end.lnglat[1]}, radius);
      this.addSphere(p1, group, 0xff0000);
      this.addSphere({x: p1.x, y: (p2.y + p1.y) / 2, z: p2.z}, group, 0xffff00);
      this.addSphere(p2, group, 0x0000ff);
      //切分为多个点
      let curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(p1.x, p1.y, p1.z),
        new THREE.Vector3(p1.x, (p2.y + p1.y) / 2, p2.z),
        new THREE.Vector3(p2.x, p2.y, p2.z)
      );
      //缓存点
      let geometry = new THREE.Geometry();
      geometry.vertices = curve.getPoints(count);
      //构造线
      let line = new MeshLine();
      line.setGeometry(geometry, p => (1 - p) * lineWidthMax + p * lineWidthMin);
      //线条生成
      let mesh = new THREE.Mesh(line.geometry, material);
      //设置name 便于后续发现控制 ，生成动画
      mesh.name = 'line-' + index;
      //记录当前的线条位置 点数的10倍 只有 0-1之间才显示
      let size = mesh.geometry.attributes.position.count;
      let tmpCount = Math.floor(Math.random() * size * times) * itemSize;
      mesh.geometry._tmpCount = tmpCount;
      //在合理的范围之内才显示
      if (tmpCount <= size * itemSize) {
        mesh.geometry.setDrawRange(0, tmpCount);
      } else {
        mesh.geometry.setDrawRange(0, 0);
      }
      group.add(mesh);
    });
  }
  getTexture () {
    let canvas = document.createElement('canvas');
    let width = 2048;
    let height = 1024;
    let size = 30;
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    let data = this.props.data;
    //渲染纹理
    async function render () {
      let worldBg = await util.loadImg(world);
      let hotBg = await util.loadImg(hot);
      ctx.drawImage(worldBg, 0, 0, width, height);
      data.forEach((item) => {
        let lng = item.lnglat[0];
        let lat = item.lnglat[1];
        let {x, y} = util.lnglatToXY({lng, lat}, width, height);
        ctx.drawImage(hotBg, x - size / 2, y - size / 2, size, size);
      });
      let texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      return texture;
    }
    return render();
  }
  componentDidMount () {
    let camera, scene, renderer;
    let width = util.css(this.el, 'width');
    let height = util.css(this.el, 'height');
    //场景
    scene = new THREE.Scene();
    //渲染器
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
    renderer.setSize(width, height);
    //照相机
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, depth);
    camera.position.z = 380;
    //添加容器
    this.el.appendChild(renderer.domElement);
    //光照效果处理
    let light = new THREE.PointLight({
      color: new THREE.Color(0xff0000)
    });
    light.position.set(200, 200, 400);
    //添加灯光效果
    scene.add(light);
    let group = new THREE.Group();
    //加载纹理
    this.getTexture().then((texture) => {
      //地球添加
      let earthMesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 128, 128),
        new THREE.MeshLambertMaterial({
          map: texture,
          color: new THREE.Color(0xffffff)
        })
      );
      earthMesh.position.set(center.x, center.y, center.z);
      group.add(earthMesh);
      this.addLines(group);
      //group.rotation.y += Math.PI;
      scene.add(group);
      animate();
      function animate () {
        requestAnimationFrame(animate);
        group.rotation.y += 0.01;
        group.children.forEach((item) => {
          if (/line/.test(item.name)) {
            //处理line
            let size = item.geometry.attributes.position.count * itemSize;
            let tmpCount = item.geometry._tmpCount;
            if (tmpCount > size * times) {
              tmpCount = 0;
            }
            let next = tmpCount + step * itemSize;
            item.geometry._tmpCount = next;
            //延迟一段 20个点时间之后再消失
            let delay = 20 * itemSize;
            //在合理的范围之内才显示
            if (next < size + delay) {
              item.geometry.setDrawRange(0, next);
            } else {
              if (item.geometry.drawRange.count > 0) {
                //逐渐缩短 每次短一半 视觉效果上 不会消失的那么突兀
                //item.geometry.setDrawRange(0, Math.floor((item.geometry.drawRange.count / itemSize) / 2) * itemSize);
                //每次 减少10分之1 消失的效果 平滑
                let tCount =  item.geometry.drawRange.count -  Math.floor(item.geometry.attributes.position.count / 5) * itemSize;
                item.geometry.setDrawRange(0, tCount > 0 ? tCount : 0);
              }
            }
          }
        });
        renderer.render(scene, camera);
      }
    });
  }
}
export default Earth;
