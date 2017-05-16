刷知乎时，偶然看过网站的图片，先会展示一个高斯模糊的图片，当图片滑动到视口时，才会加载原始图片。[直达链接](https://www.zhihu.com/question/35159928)

觉得这种懒加载效果还挺炫酷，下来之后自己试着写了一个图片懒加载的组件。

### 原理剖析

- 每个图片对应两张图片资源，一个尺寸很小的图片和一个原始图片，两张图片的的宽高比相同。(至少对应两张图片资源，有可能会根据不同设备存在两张原始图片的尺寸)

- 首先渲染要显示图像的div。 使用图像的宽高比去设置为div的宽高。 因此，当图像被加载到最终位置时，它们防止页面跳动。
- 加载一个小版本的图像。加载图像后，将在利用canvas绘制出模糊的效果。
- 然后，在主图像滚动到视口时（可以设置一定滚动偏移），开始加载了主图像，加载结束， 替换掉div和画布被隐藏。

> 知乎采用前后端同构的方式，返回的数据会同时返回每张图片的尺寸时，这样能够在渲染时直接设置div的大小。但很多情况我们并不能得到图片尺寸的数据，下面的实现就是针对这种情况

### 实现
```javascript
// BlurImg.js

import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import StackBlur from 'stackblur-canvas'
import s from './BlurImg.css';

class blurImg extends React.Component {
  static propTypes = {
    originSrc: PropTypes.string.isRequired, //真实图片地址
    blurSrc: PropTypes.string.isRequired, //真实图片对应小图地址
    isShow: PropTypes.bool.isRequired, // 是否展示真实图片，父组件控制
  };

  static imgLoad(src, resFunc) { //加载图片的静态方法
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = src;
      image.onload = () => {
        if (image.complete) resolve(image)
        reject(image)
      }
      image.onerror = () => { reject(image) }
    })
      .then((img) => {
        resFunc(img)
      })
  }

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }
  componentDidMount() {
    const { blurSrc } = this.props
    blurImg.imgLoad(blurSrc, (img) => {
      const imgH = img.height
      const imgW = img.width
      const heightPercent = (imgH / imgW * 100).toFixed(2) // div根据图片大小占位
      this.wrapper.style.height = `${heightPercent}%`
      StackBlur.image(img, this.canvas, 10); // 借助StackBlur达到高斯模糊效果
    })
  }

  componentWillReceiveProps(np) {
    if (np.isShow && !this.props.isShow) { // 需要展示真实图片时
      const { originSrc } = this.props
      blurImg.imgLoad(originSrc, (img) => {
        img.style.width = '100%';
        this.wrapper.replaceWith(img)
      })
    }
  }

  render() {
    return (
      <div
        className={s.container}
        ref={ref => { this.wrapper = ref }}
      >
        <canvas
          className={s.canvas}
          height={0}
          ref={ref => { this.canvas = ref }}
        />
      </div>
    );
  }
}

export default blurImg;
```
```css
/* BlurImg.css */
.canvas {
  width: 100% !important; /*保证canvas绘出的模糊图片充满div*/
  height: 100% !important;
}
```