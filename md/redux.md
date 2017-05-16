# 介绍
## 1. 动机

1. 随着 JavaScript 单页应用开发日趋复杂，JavaScript 需要管理比任何时候都要多的 state （状态），包括服务器响应、缓存数据、本地生成尚未持久化到服务器的数据，也包括 UI 状态，如激活的路由，被选中的标签，是否显示加载动效或者分页器等等。
2. 当初的目标是创建一个状态管理库，来提供最简化 API，但同时做到行为的完全可预测，因此才得以实现日志打印，热加载，时间旅行，同构应用，录制和重放，而不需要任何开发参与。

## 2. 核心概念
1. Redux 基本思想：
> - 可使用普通对象来描述应用的state：`{num: 1}`
> - 要想更新 state 中的数据，你需要发起一个 action，Action 就是一个普通 JavaScript 对象,用来描述发生了什么：`{ type: 'CHANGE_NUM', result: 2 }`
> - reducer函数把 action 和 state 串起来： `(oldState, action) => newState`——`({num: 1}, { type: 'CHANGE_NUM', result: 2 }) => {num: 2}`

## 3. redux三个原则：
> - 单一数据源：整个应用的 state 被储存在一棵 object tree 中，并且这个 object tree 只存在于唯一一个 store 中。
> - 惟一改变 state 的方法就是触发 action，action是一个用于描述已发生事件的普通对象。
> - 为了描述 action 如何改变 state tree ，你需要编写纯函数 reducers来执行修改。

# 基础
## 1. Action
1. Action

Action是把数据从应用传到 store 的有效载荷。它是 store 数据的唯一来源。一般来说你会通过 `store.dispatch()` 将 action 传到 store。
```
const CHANGE_NUM = 'CHANGE_NUM'
{
  type: CHANGE_NUM,
  result: 2,
}
```

> Action 本质上是 JavaScript 普通对象。我们约定，action 内必须使用一个字符串类型的 type 字段来表示将要执行的动作。多数情况下，type 会被定义成字符串常量。当应用规模越来越大时，建议使用单独的模块或文件来存放 action。

2. Action 创建函数

在 Redux 中的action创建函数只是简单的返回一个 action:
```javascript
function changeNum(result) {
  return {
    type: CHANGE_NUM,
    result
  }
}
```
> 这样做将使action创建函数更容易被移植和测试。

## 2. Reducer
Action 只是描述了有事情发生了这一事实，并没有指明应用如何更新state。而这正是 reducer 要做的事情。

reducer 就是一个纯函数，接收旧的 state 和 action，返回新的 state。

```
(previousState, action) => newState
```

> state 范式化：开发复杂的应用时，不可避免会有一些数据相互引用。建议你尽可能地把 state范式化。把所有数据放到一个对象里，每个数据以ID为主键，不同实体或列表间通过 ID 相互引用数据。把应用的 state 想像成数据库。这种方法在[ normalizr ](https://github.com/paularmstrong/normalizr) 文档里有详细阐述。

保持 reducer 纯净非常重要。永远不要在 reducer 里做这些操作：
- 修改传入参数；
- 执行有副作用的操作，如API请求和路由跳转；
- 调用非纯函数，如 Date.now() 或 Math.random()。


```javascript
function numApp(state = { num: 1 }, action) {
  switch (action.type) {
    case CHANGE_NUM:
      return Object.assign({}, state, {
        num: action.result,
      })
    default:
      return state
  }
}
```

1. 不要修改 state。 使用 Object.assign() 新建了一个副本。不能这样使用 Object.assign(state, { num: action.result })，因为它会改变第一个参数的值。你必须把第一个参数设置为空对象。你也可以开启对ES7提案对象展开运算符的支持, 从而使用 { ...state, ...newState } 达到相同的目的。

2. 在 default 情况下返回旧的 state。遇到未知的 action 时，一定要返回旧的 state。

如果状态很庞大，可以拆分多个子reducer，每个 reducer 只负责管理全局 state 中它负责的一部分。每个 reducer 的 state 参数都不同，分别对应它管理的那部分 state 数据

最后所有的子reducer可以用combineReducers()合并，combineReducers 接收一个对象，生成一个函数，这个函数来调用你的一系列reducer，每个 reducer 根据它们的 key 来筛选出 state 中的一部分数据并处理，然后这个生成的函数再将所有reducer的结果合并成一个大的对象。

```javascript
const app = combineReducers({
  num,
  person,
})
```
## 3. Store
Store 有以下职责：

- 维持应用的 state；
- 提供 getState() 方法获取 state；
- 提供 dispatch(action) 方法更新 state；
- 通过 subscribe(listener) 注册监听器;
- 通过 subscribe(listener) 返回的函数注销监听器。

根据已有的 reducer 来创建 store : `let store = createStore(app)`

完整例子：

```javascript
import {createStore} from 'redux'
//action函数
const CHANGE_NUM = 'CHANGE_NUM'
function changeNum(result) {
  return {
    type: CHANGE_NUM,
    result
  }
}

//reducer函数
function numApp(state = { num: 1 }, action) {
  switch (action.type) {
    case CHANGE_NUM:
      return Object.assign({}, state, {
        num: action.result,
      })
    default:
      return state
  }
}

// store

let store = createStore(numApp)

console.log(store.getState())

// 每次 state 更新时，打印日志
// subscribe()返回一个函数用来注销监听器
let unsubscribe = store.subscribe(() =>
  console.log(store.getState())
)

// 发起一系列 action
store.dispatch(changeNum(1))
store.dispatch(changeNum(2))
store.dispatch(changeNum(3))

unsubscribe() // 注销监听器

store.dispatch(changeNum(3))
```


## 4. redux & react
react更多的是view层，每个组件本身是通过props和state的更新来更新组件。state是各个组件内部的属性，外部无法较好的访问和控制。所以 redux 对 react app 状态的控制是通过 props 完成的。

1. 将store注入组件

使用指定的 react-redux 组件 <Provider> 可以让所有组件都可以访问 store，而不必显式地传递它。

因为store的state是整个app的，当前组件并不一定都需要。不显式传递的好处是，组件可以需要什么state，就拿什么。

```javascript
//index.js

import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import numApp from './reducers'
import App from './components/App'

let store = createStore(numApp)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

```

根组件想获取到store，可使用 react-redux 的 connect() 方法来生成。

- 使用 connect() 前，需要先定义 mapStateToProps这个函数来指定如何把当前 state 映射到展示组件的 props 中。

```
const mapStateToProps = (state) => {
  return {
    num:  state.num,
  }
}
```
- 同时定义 mapDispatchToProps() 方法接收 dispatch() 方法并返回期望注入到展示组件的 props 中的回调方法

```javascript
const mapDispatchToProps = (dispatch) => {
  return {
    changeNum: (result) => {
      dispatch(changeNum(result))
    }
  }
}
```

- 最后，使用 connect()传入这两个函数。

```javascript
import { connect } from 'react-redux'

export default connect(mapStateToProps, mapDispatchToProps)(App);
```

> 注：一般只需要在渲染根组件时使用即可，这样做可以保证数据流从上至下的一致性。

# 高级

## 1. 异步Action

* 当调用异步 API 时，有两个非常关键的时刻：发起请求的时刻，和接收到响应的时刻（也可能是超时）。
* 而dispatch一个action返回普通对象时，state会立即改变，所以在使用异步api时，我们需要去写异步dispatch流程。
* 更好的操作是我们在组件中仍然像触发同步action一样去调用action生成函数，将异步的操作写在action生成函数中。
* 通过引入 redux-thunk，action 创建函数除了返回 action 对象外还可以返回函数。这时，这个 action 创建函数就成为了 thunk。
* 当dispatch某个thunk函数时，这个函数会被 Redux Thunk middleware 执行。
* 此时这个函数并不需要保持纯净；它还可以带有副作用，包括执行异步 API 请求。这个函数还可以 dispatch action，就像 dispatch 前面定义的同步 action 一样。

## 2. Middleware

Redux middleware提供的是位于 action 被发起之后，到达 reducer 之前的扩展点。 你可以利用 Redux middleware 来进行日志记录、创建崩溃报告、调用异步接口或者路由等等。

通过一个例子理解Middleware
记录日志：记录每次触发的action以及state变化。

1. 尝试手动记录

```javascript
let action = changeNum(2)

console.log('dispatching', action)
store.dispatch(action)
console.log('next state', store.getState())
```

2. 封装成函数

```javascript
function dispatchWithLog(store, action) {
    console.log('dispatching', action)
    store.dispatch(action)
    console.log('next state', store.getState())
}

// 然后用它替换原本的dispatch
dispatchAndLog(store, changeNum(2))
```
3. 尝试直接改变dispatch的行为

```javascript
let next = store.dispatch
store.dispatch = function dispatchWithLog(action) {
    console.log('dispatching', action)
    next(action)
    console.log('next state', store.getState())
}

```
> 到此，每次触发一个action都会有记录

4. 尝试将dispatch增强函数封装起来

```javascript
function enhanceDispatchWithLog(store) {
    let next = store.dispatch
    return function dispatchWithLog(action) {
        console.log('dispatching', action)
        let result = next(action)
        console.log('next state', store.getState())
        return result
    }
}

// 改变dispatch的行为
const dispatchWithLog = enhanceDispatchWithLog(store)
// 触发一个action
dispatchWithLog(changeNum(2))

```
> 到此，完成了一个dispatch的改造函数。此时出现了另一个问题，我们还想给dispatch添加其他功能，应该怎么办呢

5. dispatch添加额外功能

> 比如我们想在dispatch函数里，添加自定义的callback，以便我们在每次触发action时，可以调用callback函数。

```javascript
const callback = () => { //do something... }

function enhanceDispatchWithCallback(store) {
    let next = store.dispatch
    return function dispatchWithCallback(action) {
        let result = next(action)
        callback()
        return result
    }
}

const dispatchWithCallback = enhanceDispatchWithCallback(store)

dispatchWithCallback(changeNum(2))

```

> 到此我们又改造了一个dispatch函数。但是上述的改造是一个替换过程，即连续多个dispatch的改造只有最后一个会生效。因此新的需求又来了 —— 如何让dispatch函数同时具有以上两个增强功能呢

5. middleware的级联

> 想要实现这个需求，我们需要将每次dispatch增强函数改造后的dispatch（在此称为next），传进下一个改造函数，使得每次增强前，dispatch都已经具备了之前增强功能

```javascript

function enhanceDispatchWithLog(store) {
    // let next = store.dispatch
    return function newDispatch(next) {
        return function dispatchWithLog(action) {
            console.log('dispatching', action)
            let result = next(action)
            console.log('next state', store.getState())
            return result
        }
    }
}


const callback = () => { //do something... }
function enhanceDispatchWithCallback(store) {
    // let next = store.dispatch
    return function newDispatch(next) {
        return function dispatchWithCallback(action) {
            let result = next(action)
            callback()
            return result
        }
    }
}

// 上面就是middleware的普遍实现，middleware 接收了一个名为 next 的 dispatch 函数，并返回一个新的 dispatch 函数，返回的函数会被作为下一个 middleware 的 next()，以此类推。  接着把它们写成箭头函数的形式

const enhanceDispatchWithLog = store => next => action => {
    console.log('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    return result
}


// 第二个middleware需要先把callback包起来

const wrapDispatchCallback = (callback) => {
    return store => next => action => {
        let result = next(action)
        if (callback && typeof callback === 'function') callback()
        return result
    }
}

const callback = () => { //do something... }

// 最终middleware如下：
const enhanceDispatchWithCallback = wrapDispatchCallback(callback)


// 现在在写一个函数实现middleware的级联, 其目的为：传入原始store和middlewares，返回改造过dispatch方法的store

const applyMiddleware = function(store, ...middlewares) {
    let dispatch = store.dispatch
    middlewares.reverse().forEach((middleware) => {
        dispatch = middleware(store)(dispatch)
    })

    return Object.assign({}, store, { dispatch })
}
```

> 为了保证只能应用 一次middleware，applyMiddleware将作用在createStore() 上而不是 store 本身。因此他的输入输出由(store, middlewares) => { return store }， 改为 (...middlewares) => createStore => { return createStore }

```javascript
const applyMiddleware = (...middlewares) => createStore => {
    return (store) => {
        const createdStore = createStore(store)
        let dispatch = createdStore.dispatch
        middlewares.reverse().forEach((middleware) => {
            dispatch = middlewares(createdStore)(dispatch)
        })
        return Object.assign({}, createdStore, { dispatch })
    }
}

```
