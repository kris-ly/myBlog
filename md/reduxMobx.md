## 一个简单例子

**分别用redux和mobx实现计时器**

1. redux实现:

```javascript
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { render } from 'react-dom';
import {createStore, bindActionCreators} from 'redux'
import { Provider, connect } from 'react-redux'

const initialState = {
  timer: 0,
}

const RESET = 'RESET'
const TICK = 'TICK'

// 定义reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case RESET: return {
      timer: 0,
    }
    case TICK: return {
      timer: state.timer + 1,
    }
    default: return state;
  }
}
// 定义action函数
function resetAction() {
  return {
    type: RESET,
  }
}

function tickAction() {
  return {
    type: TICK,
  }
}
// 构造store

var store = createStore(reducer)

class TimerView extends React.Component {
    componentDidMount() {
      window.setInterval(() => {
        this.props.dispatch(tickAction())
      }, 1000);
    }

    onReset = () => {
        this.props.dispatch(resetAction())
    }

    render() {
        return (<button onClick={this.onReset}>
                Seconds passed: {this.props.timer}
            </button>);
    }
};

const mapStateToProps = (state) => ({
  timer: state.timer,
})

// connect component with store
const TimerComponent = connect(mapStateToProps)(TimerView)

// 利用提供的Provider包裹 component

ReactDOM.render(<Provider store={store}>
<TimerComponent dispatch={store.dispatch} />
</Provider>, document.body);
```

mobx实现:
```javascript
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { observable, autorun, action } from 'mobx'
import { render } from 'react-dom';
import {observer} from 'mobx-react';

// 定义状态并使其可观察，定义状态更改的方法

class AppState {
  @observable timer = 0;
  reset() {
    this.timer = 0;
  }
  tick() {
    this.timer += 1;
  }
}

var appState = new AppState()

// 创建可响应状态的视图
@observer
class TimerView extends React.Component {
    render() {
        return (<button onClick={this.onReset.bind(this)}>
                Seconds passed: {this.props.appState.timer}
            </button>);
    }

    onReset () {
        this.props.appState.reset();
    }
};

ReactDOM.render(<TimerView appState={appState} />, document.body);


// 变更状态

setInterval(() => {
  appState.tick()
}, 1000);

```

mobx优点：清爽直接，简单易懂。


## 拥抱mobx

### 概念与原则

相同点：
- mobx也拥有redux的主要概念：state, action（可选）
- MobX 也支持单向数据流，也就是动作改变状态，而状态的改变会更新所有受影响的视图。

不同点：
- mobx对state的改变可以通过action，也可以直接使用`state.key = newValue`的形式，非常方便。
- 一个应用中可以分开设置多个state
- mobx拥有Derivations(衍生)的概念，MobX 区分了两种类型的衍生:

> 1. Computed values(计算值) - 它们是永远可以使用纯函数(pure function)从当前可观察状态中衍生出的值。
> 2. Reactions(反应) - Reactions 是当状态改变时需要自动发生的副作用。需要有一个桥梁来连接命令式编程(imperative programming)和响应式编程(reactive programming)。或者说得更明确一些，它们最终都需要实现I / O 操作。

示例：

```javascript
import {observable, autorun} from 'mobx';

var todoStore = observable({
    /* 一些观察的状态 */
    todos: [],

    /* computed推导值 */
    get completedCount() {
        return this.todos.filter(todo => todo.completed).length;
    }
});

/* 观察状态改变的函数 */
autorun(function() {
    console.log("Completed %d of %d items",
        todoStore.completedCount,
        todoStore.todos.length
    );
});

/* ..以及一些改变状态的动作 */
todoStore.todos[0] = {
    title: "Take a walk",
    completed: false
};
// -> 同步打印 'Completed 0 of 1 items'

todoStore.todos[0].completed = true;
// -> 同步打印 'Completed 1 of 1 items'

```

### 重要API:

**一、observable**

用法：
- observable(value)
- @observable classProperty = value


Observable 值可以是JS基本数据类型、引用类型、普通对象、类实例、数组和映射。 匹配类型应用了以下转换规则，但可以通过使用调节器进行微调。请参见下文。

一些建议:

- 要创建“键是动态”的对象时使用 Observable Map！对象上只有初始化时便存在的属性会转换成可观察的，尽管新添加的属性可以通过使用 extendObservable 转换成可观察的。
- 要想使用 @observable 装饰器，首先要确保 在你的编译器(babel 或者 typescript)中 装饰器是启用的。

1. observable

```javascript
const map = observable.map({ key: 'value1'});
autorun(() => console.log(JSON.stringify(map)))
map.set('key', 'value2');
// -> 打印 {"key":"value2"}

map.set('newKey', 'newValue')
// -> 打印 {"key":"value2","newKey":"newValue"}



/* 对比map
const person = observable({
    firstName: "Clive Staples",
    lastName: "Lewis"
});
autorun(() => console.log(JSON.stringify(person)))

person.firstName = "C.S.";
// -> 打印 {"firstName":"C.S.","la'stName":"Lewis"}

person.middleName = "foo";
// -> 不打印
*/
```

2. @observable （装饰器）

```javascript
import {observable} from "mobx";

class OrderLine {
    @observable price = 0;
    @observable amount = 1;

    @computed get total() {
        return this.price * this.amount;
    }
}

```

3. @computed

如果已经启用 decorators 的话，可以在任意类属性的 getter 上使用 @computed 装饰器来声明式的创建计算属性。
```javascript
import {observable, computed} from "mobx";

class OrderLine {
    @observable price = 0;
    @observable amount = 1;

    constructor(price) {
        this.price = price;
    }

    @computed get total() {
        return this.price * this.amount;
    }
}
```
----
**二、autorun**

当你想创建一个响应式函数，而该函数本身永远不会有观察者时,可以使用 mobx.autorun。 通常，当你需要从反应式代码桥接到命令式代码的情况，例如打印日志、持久化或者更新UI的代码。 当使用 autorun 时，所提供的函数总是立即被触发一次，然后每次它的依赖关系改变时会再次被触发。

用法：var disposer = autorun([function])
返回的 disposer 是一个函数，调用disposer 可解绑autorun

高级用法：
可以通过调用 reaction 的disposer的 onError 处理方法来覆盖 Reactions 的默认日志行为。 示例:

```javascript
const age = observable(10)
const dispose = autorun(() => {
    if (age.get() < 0)
        throw new Error("Age should not be negative")
    console.log("Age", age.get())
})

age.set(18)  // 输出: Age 18
age.set(-10) // 输出: Age should not be negative
age.set(5)   // 已恢复; 输出: Age 5

dispose.onError(e => {
    window.alert("Please enter a valid age")
})
```
> 一个全局的 onError 处理方法可以通过 extras.onReactionError(handler) 来设置。这在测试或监控中很有用。

----

**三、@observer**

1. 常规用法

mobx怎么跟react相结合呢？当state发生变化时，对应的组件怎么动态更新呢？这就需要observer了

observer 函数/装饰器可以用来将 React 组件转变成响应式组件。 它用 mobx.autorun 包装了组件的 render 函数以确保任何组件渲染中使用的数据变化时都可以强制刷新组件。 observer 是由单独的 mobx-react 包提供的。

```javascript
import {observer} from "mobx-react";

var timerData = observable({
    secondsPassed: 0
});

setInterval(() => {
    timerData.secondsPassed++;
}, 1000);

@observer class Timer extends React.Component {
    render() {
        return (<span>Seconds passed: { this.props.timerData.secondsPassed } </span> )
    }
};

React.render(<Timer timerData={timerData} />, document.body);

// 下面写法不管用，因为需要传递的是observable数据的引用而不是里面的值

// React.render(<Timer timerData={timerData.secondsPassed} />, document.body)
```

2. 可观察的局部组件状态

就像普通类一样，你可以通过使用 @observable 装饰器在React组件上引入可观察属性。 这意味着你可以在组件中拥有功能同样强大的本地状态(local state)，而不需要通过 React 的冗长和强制性的 setState 机制来管理。 响应式状态会被 render 提取调用，但不会调用其它 React 的生命周期方法，除了 componentWillUpdate 和 componentDidUpdate 。 如果你需要用到其他 React 生命周期方法 ，只需使用基于 state 的常规 React API 即可。

```javascript
import {observer} from "mobx-react"
import {observable} from "mobx"

@observer class Timer extends React.Component {
    @observable secondsPassed = 0

    componentWillMount() {
        setInterval(() => {
            this.secondsPassed++
        }, 1000)
    }

    render() {
        return (<span>Seconds passed: { this.secondsPassed } </span> )
    }
})

React.render(<Timer />, document.body)
```

3. componentWillReact (生命周期钩子)

React 组件通常在新的堆栈上渲染，这使得通常很难弄清楚是什么导致组件的重新渲染。 当使用 mobx-react 时可以定义一个新的生命周期钩子函数 componentWillReact(一语双关)。当组件因为它观察的数据发生了改变，它会安排重新渲染，这个时候 componentWillReact 会被触发。这使得它很容易追溯渲染并找到导致渲染的操作(action)。
```javascript
import {observer} from "mobx-react";

@observer class TodoView extends React.Component {
    componentWillReact() {
        console.log("I will re-render, since the todo has changed!");
    }

    render() {
        return <div>this.props.todo.title</div>;
    }
}
```

- componentWillReact 不接收参数
- componentWillReact 初始化渲染前不会触发 (使用 - - componentWillMount 替代)
- componentWillReact 对于 mobx-react@4+, 当接收新的 props 时并在 setState 调用后会触发此钩子

4. 何时使用 observer?

**简单来说: 所有渲染 observable 数据的组件， [why ?](https://github.com/mobxjs/mobx/issues/101/)**

如果你不想将组件标记为 observer，例如为了减少通用组件包的依赖，请确保只传递普通数据。

使用 @observer 的话，不再需要从渲染目的上来区分是“智能组件”还是“无脑”组件。 在组件的事件处理、发起请求等方面，它也是一个很好的分离关注点。 当所有组件它们自己的依赖项有变化时，组件自己会响应更新。 而它的计算开销是可以忽略的，并且它会确保不管何时,只要当你开始使用 observable 数据时，组件都将会响应它的变化。

----

四、action

 使用MobX你可以在代码中显式地标记出动作所在的位置。 动作可以有助于更好的组织代码。

1. 绑定的动作

action 装饰器/函数遵循 javascript 中标准的绑定规则。 但是，Mobx 3引入了 action.bound 来自动地将动作绑定到目标对象。 注意，与 action 不同的是，(@)action.bound 不需要一个name参数，名称将始终基于动作绑定的属性。

示例:
```javascript
class Ticker {
    @observable this.tick = 0

    @action.bound
    increment() {
        this.tick++ // 'this' 永远都是正确的
    }
}

const ticker = new Ticker()
setInterval(ticker.increment, 1000)
```

或
```javascript
const ticker = observable({
    tick: 1,
    // 写法1
    increment: action.bound(function() {
        this.tick++ // 绑定 'this'
    })
    //写法2，箭头函数自动绑定this
    increment = () => {
        this.tick++
    })
})

setInterval(ticker.increment, 1000)
```

### 可观察类型
1. 对象

如果把一个普通的 JavaScript 对象传递给 observable 方法，对象的所有属性都将被拷贝至一个克隆对象并将克隆对象转变成可观察的。

**记住一些事情:**

- 当通过 observable 传递对象时，只有在把对象转变 observable 时存在的属性才会是可观察的。 稍后添加到对象的属性不会变为可观察的，除非使用 extendObservable。
----

2. 数组

将数组转变为可观察后，所以数组中的所有(未来的)值都会是可观察的。

由于 ES5 中的原生数组的局限性，observable.array 会创建一个人造数组(类数组对象)来代替真正的数组。而Array.isArray(observable([])) 也将返回 false。可使用observable([]).slice()方法将其转为数组。
除了所有内置函数，observable 数组还可以使用下面的好东西:

- intercept(interceptor) - 可以用来在任何变化作用于数组前将其拦截。参见 observe & intercept
- observe(listener, fireImmediately? = false) - 监听数组的变化。回调函数将接收表示数组拼接或数组更改的参数，它符合 ES7 提议。它返回一个清理函数以用来停止监听器。
- clear() - 从数组中删除所有项。
- replace(newItems) - 用新项替换数组中所有已存在的项。
- find(predicate: (item, index, array) => boolean, thisArg?, fromIndex?) - 基本上等同于 ES7 的 Array.find 提议，除了多了一个 fromIndex 参数。
- findIndex(predicate: (item, index, array) => boolean, thisArg?, fromIndex?) - 基本上等同于 ES7 的 Array.findIndex 提议，除了多了一个 fromIndex 参数。
- remove(value) - 通过值从数组中移除一个单个的项。如果项被找到并移除的话，返回 true 。
- peek() - 和 slice() 类似， 返回一个有所有值的数组并且数组可以放心的传递给其它库。

3. map

和对象类似，可以使用 observable.array(values?) 或者将数组传给 observable，可以将数组转变为可观察的。

**重要：**
mobx并不会对某些变化产生你想要的反应，你需要了解 [MobX 会对什么作出反应?]( http://cn.mobx.js.org/best/react.html)

### store设计

store (存储) ，顾名思义，记录数据。那么什么样的数据需要划分出一个store呢，

1. 一个划分标准可以是状态变化的粒度。

比如要实现一个todolist，最小的粒度即一条todo, todo有任务内容（需要做什么）和任务状态（任务是否已完成），首先我们需要为一条todo，创建一个store。

然后粒度再扩大，一个todolist，是n条todo的集合，集合可以删除todo，可以完成todo，可以添加todo。因此这个todolist的集合需要创建一个store。

到此为止，所有粒度的状态变化都已包括，一个实现的例子如下：

```javascript
import React, { Component } from 'react';
import { observable, autorun, action } from 'mobx'
import { render } from 'react-dom';
import {observer} from 'mobx-react';

class Todo {
  @observable task;
  @observable isCompleted = false;

  constructor(task) {
    this.task = task;
  }
}

class Todos {
  @observable todos = [];
  Todo;
  constructor(Todo) {
    this.Todo = Todo;
  }
  add(task) {
    this.todos.push(new this.Todo(task))
  }
}

@observer class TODOS extends React.Component {
    state = {
      val: '',
    }
    render() {
      const { store } = this.props
        return (
          <div>
          <input
            type={'text'}
            value={this.state.val}
            onChange={(e) => {
              this.setState({
                val: e.target.value,
              })
            }}
            onBlur={() => {
              if (!this.state.val) return
              store.add(this.state.val)
              this.setState({
                val: '',
              })
            }}
          />
          {store.todos.map((todo, idx) => (
            <TODO
              key={idx}
              todo={todo}
            />
          ))}

          </div>
        )
    }
}

@observer class TODO extends React.Component {
  render() {
    const { todo } = this.props
    return (
      <div>
        <input
          type={'checkbox'}
          checked={todo.isCompleted}
          onChange={() => {
            todo.isCompleted = !todo.isCompleted;
          }}
        />
        <span
          style={todo.isCompleted ? {color: '#aaa', textDecoration: 'line-through'} : {color: '#000'}}
        >{todo.task}</span>
      </div>
    )
  }
}



render(<TODOS store={new Todos(Todo)} />, document.body);
```

2. 另一个划分标准跟业务场景有关

- 比如需要单独创建store来记录全局状态：登录状态，用户信息，UI状态等
- 比如SPA，可针对每个路由页面划分一个store，来记录当前页面的状态

编写异步 Actions (动作)

> 针对mobx的strict mode。

```javascript
mobx.useStrict(true)

class Store {
    @observable data = []
    @observable state = "resolved" // pending | resolved | rejected

    @action
    getData() {
        this.state = "pending"
        fetchData().then(
            data => {
                runInAction(() => {
                    this.data = data
                    this.state = "resolved"
                }
            },
            error => {
                runInAction(() => {
                    this.state = "rejected"
                }
            }
        )
    }
}
```

### 状态变化的监听

除了之前说到的auto可以监听状态变化外，还有reaction，autorun 的变种，对于如何追踪 observable 赋予了更细粒度的控制。

用法: `reaction(() => data, data => { sideEffect }, options?)`

第一个参数(数据 函数)是返回想追踪的数据，第二个函数(效果 函数)是对追踪数据变化时的处理。

```javascript
const data = observable({
    name: "kris",
    age: 11,
})

const reaction1 = reaction(
    () => data.title,
    title: { console.log(`reaction 1: ${ title}`)},
)

data.name = 'xiaoming'
//输出：
// reaction 1: xiaoming

data.age = 12
// 无输出

reaction1() // 解除跟踪

data.name = 'xiaobai'
// 无输出

```
### mobx 和 redux 的对比

1. redux

目前redux的社区比较庞大，各种工具和中间件都比较完善。

优点：
- 在团队协作的项目中，有利用流程的规范。
- 单向数据流，并且store的改变有迹可循，便于调试
- 对时间穿梭有需求的，redux能满足。

缺点：
- 新人上手慢，难以理解其与react的结合
- 状态改变流程繁琐
- 存在滥用的情况，即不考虑数据的具体应用场景，一律使用redux来保存各种数据

2. mobx

作为后起之秀，一改redux的思想，开始被越来越多的团队使用

优点：
- 容易理解和上手
- 状态管理变得简单和可扩展，提高开发效率
- 可建立多个store分开管理

缺点：
- 由于状态改变的灵活性，也给调试带来了难度
- 用法虽简单，但是坑不少，
- 用法很灵活，所以写法就很多，在团队开发中，需建立起统一的规范。

总的来说，react的状态管理一直以来都是一个问题。

之前redux的推出，为我们提供了一个思路，但在使用过程中，还是会遇到一些不顺手或者麻烦的地方。mobx的出现，又为我们提供了一个全新的解决思路，更易使用和理解。

至于在具体项目中使用redux还是mobx呢，可根据其各自优缺点进行选择。