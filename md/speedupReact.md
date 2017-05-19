# react渲染性能提升
- [shouldComponentUpdate](#shouldcomponentupdate)
- [react-addons](#react-addons)
- [re-render性能监测](#re-render性能监测)
- [保持展示组件纯净](#保持展示组件纯净)

## shouldComponentUpdate

在接收到新的props或者state改变时，组件将进行重绘，如果你确定组件不需要渲染新的props或者state，则将改方法的返回值置为false，避免此次重绘。注意该方法只有在存在期才有效。

什么时候调用该方法：如果你已经使用了不可变的数据结构作为state，同时组件对于相同的props及state，总会渲染出一样的DOM（称为纯净组件），则可在 shouldComponentUpdate 方法中通过比较新旧state和props，来确定其返回值。

**注意**：谨慎使用此方法来提升性能，因为使用此方法能提高重新渲染的性能时，一般也说明组件写的并不是很合理，否则带来的性能增益不会太突出。例如：
- 将不必要的更改写在state中，触发了多余的重新渲染。写state时，尽量避免写入与渲染无关的属性。
- 将应该并列的组件写成了嵌套的形式。这会导致在更改父组件中与子组件无关的state属性时，也会触发子组件的重渲染。
- 当props或者state比较庞大而render比较简单时，使用 shouldComponentUpdate 也得不偿失。

## react-addons

**react-addons-pure-render-mixin**

对于纯净的组件，可在组件中使用此扩展，可在shouldComponentUpdate()中，自动返回props和state的变化情况。

```javascript
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

class ExampleComponent extends React.Component {
  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }
  ...
}

```
**react-addons-shallow-compare**

与前一个扩展类似，只是需要手动比较props和state的变化

```javascript
import React from 'react';
import shallowCompare from 'react-addons-shallow-compare'; // ES6

class ExampleComponent extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }
  ...
}

```

注意：上述写法是对react之前的版本的兼容写法，在新的版本中，可直接使用 React.PureComponent ，它与 React.Component 唯一的不同点是，它会在 shouldComponentUpdate() 执行一次props和state的shallow comparison。

```javascript
import React from 'react';

class ExampleComponent extends React.PureComponent {
  ...
}

```


## re-render性能监测

我们将从安装React的性能工具开始。

`npm install --save-dev react-addons-perf`

然后我们可以在我们的App.js中导入它：

`import Perf from 'react-addons-perf'`

我们关心的有四种Perf功能：
- Perf.start()：开始测量性能。
- Perf.stop()
- Perf.printExclusive()：打印组件的总渲染时间。
- Perf.printWasted()：打印浪费的渲染 - 我们很快就会得到这个。

我们要开始在组件开始更新之前测量渲染时间 —— 在调用setState()之前。

然后我们可以使用生命周期方法componentDidUpdate()来停止测量并打印结果。

```javascript
componentDidUpdate() {
  Perf.stop()
  Perf.printInclusive()
  Perf.printWasted()
}

resetState() {
  Perf.start()
  this.setState({ ... })
}

```


在组件更新state后，我们可以在console中看到测量结果
![image](https://facebook.github.io/react/img/docs/perf-inclusive.png)

可以根据结果，对耗时较长的组件进行重渲染判断，减少重渲染次数和时间。

> 注： Perf.start() 不能用在 componentWillMount() 里，也不能用在 render() 里， 并且 react-addons-perf 需要在react@15.5.x版本之后才能用

## 保持展示组件纯净
在使用了redux后，rudex 掌握着 react app 的状态，大部分组件成为展示组件，通过接收props完成渲染以及重渲染，因此，这些展示组件需要保持纯净，即对相同的props，渲染的DOM是一样的。这样能够使react快速完成dom diff 比价，减少渲染时间。

下面就是一个纯净组件的例子：

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