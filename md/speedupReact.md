- shouldComponentUpdate
- react-addons-pure-render-mixin
- react-addons-shallow-compare
- react-addons-perf

展示组件尽量保持纯净

```javascript
import React from 'react';
import PropTypes from 'prop-types'

const CourseCard = ({ value }) => (
  <div>{value}</div>
)

CourseCard.propTypes = {
  value: PropTypes.object.isRequired,
};

export default CourseCard;

```

图片懒加载组件
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

// BlurImg.css
.canvas {
  width: 100% !important;
  height: 100% !important;
}

```