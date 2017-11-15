/**
  * @description 地球相关的交互展现
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
const count = 20;
//步长
const step = 2;
//中心点
const center = {
  x: 0,
  y: 0,
  z: 0
};
const lineWidthMax = .8;
const lineWidthMin = 0;
const itemSize = 3;
class Earth extends React.PureComponent {
  render () {
    return (
      <div className="earth" ref={ c => this.el = c}>
        {/*地球交互相关*/}
      </div>
    );
  }
  //添加立体线条
  addLines (group) {
    let material = new MeshLineMaterial({
      map: new THREE.TextureLoader().load(lineBg),
      useMap: true
    });
    this.props.data.forEach((item, index) => {
      let lng = item.lnglat[0];
      let lat = item.lnglat[1];
      let t = Math.random();
      let max = radius + Math.random() * radius / 5;
      //获取起始点
      let p1 = util.lnglatToXYZ({lng, lat}, radius);
      let p2 = util.lnglatToXYZ({lng, lat}, max);
      //切分为多个点
      let curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(p1.x, p1.y, p1.z),
        new THREE.Vector3(p2.x, p2.y, p2.z)
      ]);
      //缓存点
      let geometry = new THREE.Geometry();
      geometry.vertices = curve.getPoints(count);
      //够造线
      let line = new MeshLine();
      line.setGeometry(geometry, (p) => (1 - p) * lineWidthMax + p * lineWidthMin);
      //线条生成
      let mesh = new THREE.Mesh(line.geometry, material);
      //设置name 便于后续发现控制 ，生成动画
      mesh.name = 'line-' + index;
      //记录当前的线条位置
      let _count = Math.floor(t * mesh.geometry.attributes.position.count);
      mesh.geometry.setDrawRange(0, _count * itemSize);
      //记录变化方向
      mesh._direction = Math.random() > 0.5 ? 1 : -1;
      group.add(mesh);
    });
  }
  getTexture () {
    let canvas = document.createElement('canvas');
    let width = 2048;
    let height = 1024;
    let size = 40;
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
      scene.add(group);
      animate();
      function animate () {
        requestAnimationFrame(animate);
        group.rotation.y += 0.01;
        //group.rotation.x += 0.001;
        group.children.forEach((item) => {
          if (/line/.test(item.name)) {
            //处理line
            let size = item.geometry.attributes.position.count;
            let tmpCount = item.geometry.drawRange.count;
            if (tmpCount > size * itemSize) {
              item._direction = -1;
            } else if (tmpCount <= 0) {
              item._direction = 1;
            }
            let tmpStep = Math.ceil(Math.random() * step);
            let next = tmpCount + item._direction * tmpStep * itemSize;
            item.geometry.setDrawRange(0, next);
          }
        });
        renderer.render(scene, camera);
      }
    });
  }
}
export default Earth;
