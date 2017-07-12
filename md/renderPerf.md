# 渲染性能

- [渲染性能概述](#渲染性能概述)
- [优化JavaScript执行](#优化javaScript执行)
- [缩小样式计算的范围并降低其复杂性](#缩小样式计算的范围并降低其复杂性)
- [避免大型&复杂的布局和布局抖动](#避免大型&复杂的布局和布局抖动)
- [简化绘制的复杂度&减小绘制区域](#简化绘制的复杂度&减小绘制区域)
- [坚持仅合成器的属性和管理层计数](#坚持仅合成器的属性和管理层计数)
- [使输入处理程序去除抖动](#使输入处理程序去除抖动)

## 渲染性能概述

### 1. 60fps 与设备刷新率
用户与网站进行交互。
目前大多数设备的屏幕刷新率为 60 次/秒。因此，如果在页面中有一个动画或渐变效果，或者用户正在滚动页面，那么浏览器渲染动画或页面的每一帧的速率也需要跟设备屏幕的刷新率保持一致。

其中每个帧的预算时间仅比 16 毫秒多一点 (1 秒/ 60 = 16.66 毫秒)。但实际上，浏览器有整理工作要做，因此您的所有工作需要在 10 毫秒内完成。如果无法符合此预算，帧率将下降，并且内容会在屏幕上抖动。 此现象通常称为卡顿，会对用户体验产生负面影响。

### 2. 像素管道


```
JavaScript --> 样式计算 -->布局 -->绘制 -->合成
```
- JavaScript。一般来说，我们会使用 JavaScript 来实现一些视觉变化的效果。比如用 jQuery 的 animate 函数做一个动画、对一个数据集进行排序或者往页面里添加一些 DOM 元素等。当然，除了 JavaScript，还有其他一些常用方法也可以实现视觉变化效果，比如：CSS Animations、Transitions 和 Web Animation API。
- 样式计算。此过程是根据匹配选择器（例如 .headline 或 .nav > .nav__item）计算出哪些元素应用哪些 CSS 规则的过程。从中知道规则之后，将应用规则并计算每个元素的最终样式。
- 布局。在知道对一个元素应用哪些规则之后，浏览器即可开始计算它要占据的空间大小及其在屏幕的位置。网页的布局模式意味着一个元素可能影响其他元素，例如 <body> 元素的宽度一般会影响其子元素的宽度以及树中各处的节点，因此对于浏览器来说，布局过程是经常发生的。
- 绘制。绘制是填充像素的过程。它涉及绘出文本、颜色、图像、边框和阴影，基本上包括元素的每个可视部分。绘制一般是在多个表面（通常称为层）上完成的。
- 合成。由于页面的各部分可能被绘制到多层，由此它们需要按正确顺序绘制到屏幕上，以便正确渲染页面。对于与另一元素重叠的元素来说，这点特别重要，因为一个错误可能使一个元素错误地出现在另一个元素的上层。


不一定每帧都总是会经过管道每个部分的处理

- 修改元素的“layout”属性，也就是改变了元素的几何属性（例如宽度、高度、左侧或顶部位置等），那么浏览器将必须检查所有其他元素，然后“自动重排”页面。
- 如果您修改“paint only”属性（例如背景图片、文字颜色或阴影等），即不会影响页面布局的属性，则浏览器会跳过布局，但仍将执行绘制。
- 如果您更改一个既不要布局也不要绘制的属性，则浏览器将跳到只执行合成。

## 优化JavaScript执行

JavaScript 经常会触发视觉变化。有时是直接通过样式操作，有时是会产生视觉变化的计算，例如搜索数据或将其排序。时机不当或长时间运行的 JavaScript 可能是导致性能问题的常见原因。您应当设法尽可能减少其影响。

### 1. 使用 requestAnimationFrame 来实现视觉变化
当屏幕正在发生视觉变化时，您希望在适合浏览器的时间执行您的工作，也就是正好在帧的开头。保证 JavaScript 在帧开始时运行的唯一方式是使用 requestAnimationFrame。
```javascript
/**
 * If run as a requestAnimationFrame callback, this
 * will be run at the start of the frame.
 */
function updateScreen(time) {
  // Make visual updates here.
}

requestAnimationFrame(updateScreen);
```
框架或示例可能使用 setTimeout 或 setInterval 来执行动画之类的视觉变化，但这种做法的问题是，回调将在帧中的某个时点运行，可能刚好在末尾，而这可能经常会使我们丢失帧，导致卡顿。

### 2. 降低复杂性或使用 Web Worker

JavaScript 在浏览器的主线程上运行，恰好与样式计算、布局以及许多情况下的绘制一起运行。如果 JavaScript 运行时间过长，就会阻塞这些其他工作，可能导致帧丢失。

因此，您要妥善处理 JavaScript 何时运行以及运行多久。例如，如果在滚动之类的动画中，最好是想办法使 JavaScript 保持在 3-4 毫秒的范围内。
在许多情况下，可以将纯计算工作移到 Web Worker，例如，如果它不需要 DOM 访问权限。数据操作或遍历（例如排序或搜索）往往很适合这种模型，加载和模型生成也是如此。

```javascript
var dataSortWorker = new Worker("sort-worker.js");
dataSortWorker.postMesssage(dataToSort);

// The main thread is now free to continue working on other things...

dataSortWorker.addEventListener('message', function(evt) {
   var sortedData = evt.data;
   // Update data on screen...
});
```

并非所有工作都适合此模型：Web Worker 没有 DOM 访问权限。如果您的工作必须在主线程上执行，请考虑一种批量方法，将大型任务分割为微任务，每个微任务所占时间不超过几毫秒，并且在每帧的 requestAnimationFrame 处理程序内运行。
```javascript
var taskList = breakBigTaskIntoMicroTasks(monsterTaskList);
requestAnimationFrame(processTaskList);

function processTaskList(taskStartTime) {
  var taskFinishTime;

  do {
    // Assume the next task is pushed onto a stack.
    var nextTask = taskList.pop();

    // Process nextTask.
    processTask(nextTask);

    // Go again if there’s enough time to do the next task.
    taskFinishTime = window.performance.now();
  } while (taskFinishTime - taskStartTime < 3);

  if (taskList.length > 0)
    requestAnimationFrame(processTaskList);

}
```

此方法会产生 UX 和 UI 后果，您将需要使用进度或活动指示器来确保用户知道任务正在被处理。在任何情况下，此方法都不会占用应用的主线程，从而有助于主线程始终对用户交互作出快速响应。


## 缩小样式计算的范围并降低其复杂性

计算样式的第一部分是创建一组匹配选择器，这实质上是浏览器计算出给指定元素应用哪些类、伪选择器和 ID。

第二部分涉及从匹配选择器中获取所有样式规则，并计算出此元素的最终样式。在 Blink（Chrome 和 Opera 的渲染引擎）中，这些过程的开销至少在目前是大致相同的：

> 用于计算某元素计算样式的时间中大约有 50% 用来匹配选择器，而另一半时间用于从匹配的规则中构建 RenderStyle（计算样式的表示）。

### 1. 降低选择器的复杂性

在最简单的情况下，您在 CSS 中引用只有一个类的元素：
```css
.title {
  /* styles */
}
```
但是，随着项目的增长，将可能产生更复杂的 CSS，最终您的选择器可能变成这样：
```css
.box:nth-last-child(-n+1) .title {
  /* styles */
}
```
为了知道是否需要应用样式，浏览器实际上必须询问“这是否为有 title 类的元素，其父元素恰好是负第 N 个子元素加上 1 个带 box 类的元素？”计算此结果可能需要大量时间，具体取决于所用的选择器和相应的浏览器。选择器的预期行为可以更改为一个类：
```css
.final-box-title {
  /* styles */
}
```
您可能对该类的名称有疑问，但此工作对于浏览器而言要简单得多。在上一版本中，为了知道（例如）该元素是否为其类型的最后一个，浏览器首先必须知道关于其他元素的所有情况，以及其后面是否有任何元素会是第 N 个最后子元素，因为其类匹配，这可能比简单地将选择器与元素匹配的开销要大得多。

### 2. 使用块、元素、修饰符

[BEM（块、元素、修饰符）](https://bem.info/)之类的编码方法实际上纳入了上述选择器匹配的性能优势，因为它建议所有元素都有单个类，并且在需要层次结构时也纳入了类的名称：

.list { }
.list__list-item { }
如果需要一些修饰符，像在上面我们想为最后一个子元素做一些特别的东西，就可以按如下方式添加：

.list__list-item--last-child {}
如果您在寻找一种好方法来组织您的 CSS，则 BEM 真的是个很好的起点，不仅从结构的角度如此，还因为样式查找得到了简化。

BEM参考: [BEM思想之彻底弄清BEM语法](https://www.w3cplus.com/css/mindbemding-getting-your-head-round-bem-syntax.html)

## 避免大型&复杂的布局和布局抖动

布局是浏览器计算各元素几何信息的过程：元素的大小以及在页面中的位置。 根据所用的 CSS、元素的内容或父级元素，每个元素都将有显式或隐含的大小信息。此过程在 Chrome、Opera、Safari 和 Internet Explorer 中称为布局 (Layout)。 在 Firefox 中称为自动重排 (Reflow)，但实际上其过程是一样的。

与样式计算相似，布局开销的直接考虑因素如下：

1. 需要布局的元素数量。
2. 这些布局的复杂性。

### 1. 尽可能避免布局操作
当您更改样式时，浏览器会检查任何更改是否需要计算布局，以及是否需要更新渲染树。对“几何属性”（如宽度、高度、左侧或顶部）的更改都需要布局计算。
```css
.box {
  width: 20px;
  height: 20px;
}

/**
 * Changing width and height
 * triggers layout.
 */
.box--expanded {
  width: 200px;
  height: 350px;
}
```
布局几乎总是作用到整个文档。 如果有大量元素，将需要很长时间来算出所有元素的位置和尺寸。

注：想要一个有关哪些 CSS 属性会触发布局、绘制或合成的确切列表？请查看 [CSS 触发器](https://csstriggers.com/)。

### 2. 使用 flexbox 而不是较早的布局模型

现在，对于相同数量的元素和相同的视觉外观，flex布局的时间要少得多。务必记住，对于某些情况，可能无法选择 Flexbox，因为它没有浮动那么受支持。

在任何情况下，不管是否选择 Flexbox，都应当在应用的高压力点期间尝试完全避免触发布局！

### 3. 避免强制同步布局

在 JavaScript 运行时，来自上一帧的所有旧布局值是已知的，并且可供您查询。因此，如果（例如）您要在帧的开头写出一个元素（让我们称其为“框”）的高度，可能编写一些如下代码：
```javascript
// Schedule our function to run at the start of the frame.
requestAnimationFrame(logBoxHeight);

function logBoxHeight() {
  // Gets the height of the box in pixels and logs it out.
  console.log(box.offsetHeight);
}
```
如果在请求此框的高度之前，已更改其样式，就会出现问题：
```javascript
function logBoxHeight() {

  box.classList.add('super-big');

  // Gets the height of the box in pixels
  // and logs it out.
  console.log(box.offsetHeight);
}
```
现在，为了回答高度问题，浏览器必须先应用样式更改（由于增加了 super-big 类），然后运行布局。这时它才能返回正确的高度。这是不必要的，并且可能是开销很大的工作。

因此，始终应先批量读取样式并执行（浏览器可以使用上一帧的布局值），然后执行任何写操作：

正确完成时，以上函数应为：
```javascript
function logBoxHeight() {
  // Gets the height of the box in pixels
  // and logs it out.
  console.log(box.offsetHeight);

  box.classList.add('super-big');
}
```
大部分情况下，并不需要应用样式然后查询值；使用上一帧的值就足够了。与浏览器同步（或比其提前）运行样式计算和布局可能成为瓶颈，并且您一般不想做这种设计。

### 4. 避免布局抖动

有一种方式会使强制同步布局甚至更糟：接二连三地执行大量这种布局。看看这个代码：
```javascript
function resizeAllParagraphsToMatchBlockWidth() {

  // Puts the browser into a read-write-read-write cycle.
  for (var i = 0; i < paragraphs.length; i++) {
    paragraphs[i].style.width = box.offsetWidth + 'px';
  }
}
```
此代码循环处理一组段落，并设置每个段落的宽度以匹配一个称为“box”的元素的宽度。这看起来没有害处，但问题是循环的每次迭代读取一个样式值 (box.offsetWidth)，然后立即使用此值来更新段落的宽度 (paragraphs[i].style.width)。在循环的下次迭代时，浏览器必须考虑样式已更改这一事实，因为 offsetWidth 是上次请求的（在上一次迭代中），因此它必须应用样式更改，然后运行布局。每次迭代都将出现此问题！

此示例的修正方法还是先读取值，然后写入值：
```javascript
// Read.
var width = box.offsetWidth;

function resizeAllParagraphsToMatchBlockWidth() {
  for (var i = 0; i < paragraphs.length; i++) {
    // Now write.
    paragraphs[i].style.width = width + 'px';
  }
}
```

实际上，我们应该尽量避免对大量DOM进行直接操作，如无法避免，应当查看 [FastDOM](https://github.com/wilsonpage/fastdom)，它会自动为您批处理读取和写入。

## 简化绘制的复杂度&减小绘制区域

绘制是填充像素的过程，像素最终合成到用户的屏幕上。 它往往是管道中运行时间最长的任务，应尽可能避免此任务。

### 1. 触发布局与绘制
如果您触发布局，则总是会触发绘制，因为更改任何元素的几何属性意味着其像素需要修正！

js --> style --> layout --> paint -> composite

如果更改非几何属性，例如背景、文本或阴影，也可能触发绘制。在这些情况下，不需要布局，并且管道将如下所示：

js --> style --> ~~layout~~ --> paint -> composite

### 2. 提升移动或淡出的元素

绘制并非总是绘制到内存中的单个图像。事实上，在必要时浏览器可以绘制到多个图像或合成器层。

此方法的优点是，定期重绘的或通过变形在屏幕上移动的元素，可以在不影响其他元素的情况下进行处理

创建新层的最佳方式是使用 will-change CSS 属性。此方法在 Chrome、Opera 和 Firefox 上有效，并且通过 transform 的值将创建一个新的合成器层：
```css
.moving-element {
  will-change: transform;
}
```
对于不支持 will-change 但受益于层创建的浏览器，例如 Safari 和 Mobile Safari，需要使用（滥用）3D 变形来强制创建一个新层：
```css
.moving-element {
  transform: translateZ(0);
}
```

但需要注意的是：不要创建太多层，因为每层都需要内存和管理开销。有关此主题的更多信息，请参考坚持仅合成器的属性和管理层计数部分。

**如果您已将一个元素提升到一个新层，可使用 DevTools 确认这样做已给您带来性能优势。请勿在不分析的情况下提升元素。**

### 3. 减少绘制区域
然而有时，虽然提升元素，却仍需要绘制工作。绘制问题的一个大挑战是，浏览器将两个需要绘制的区域联合在一起，而这可能导致整个屏幕重绘。因此，举例而言，如果页面顶层有一个固定标头，而在屏幕底部还有正在绘制的元素，则整个屏幕可能最终要重绘。

减少绘制区域往往是编排您的动画和变换，使其不过多重叠，或设法避免对页面的某些部分设置动画。

## 坚持仅合成器的属性和管理层计数

合成是将页面的已绘制部分放在一起以在屏幕上显示的过程。

此方面有两个关键因素影响页面的性能：需要管理的合成器层数量，以及您用于动画的属性。

### 1. 使用 transform 和 opacity 属性更改来实现动画

性能最佳的像素管道版本会避免布局和绘制，只需要合成更改：

js --> style --> ~~layout~~ --> ~~paint~~ -> composite

为了实现此目标，需要坚持更改可以由合成器单独处理的属性。目前只有两个属性符合条件：transforms 和 opacity

### 2. 提升您打算设置动画的元素

正如我们在“降低绘制的复杂性并减少绘制区域”一节所述，应当将您打算设置动画的元素（在合理范围内，不要过度！）提升到其自己的层：
```css
.moving-element {
  will-change: transform;
}
```
这可以提前警示浏览器即将出现更改，根据您打算更改的元素，浏览器可能可以预先安排，如创建合成器层。
> 警告：如无必要，请勿提升元素。

## 使输入处理程序去除抖动

输入处理程序可能是应用出现性能问题的原因，因为它们可能阻止帧完成，并且可能导致额外（且不必要）的布局工作。

### 1. 避免长时间运行输入处理程序

在最快的情况下，当用户与页面交互时，页面的合成器线程可以获取用户的触摸输入并直接使内容移动。这不需要主线程执行任务，主线程执行的是 JavaScript、布局、样式或绘制。

但是，如果您附加一个输入处理程序，例如 touchstart、touchmove 或 touchend，则合成器线程必须等待此处理程序执行完成，因为您可能选择调用 preventDefault() 并且会阻止触摸滚动发生。即使没有调用 preventDefault()，合成器也必须等待，这样用户滚动会被阻止，这就可能导致卡顿和漏掉帧。

总之，要确保您运行的任何输入处理程序应快速执行，并且允许合成器执行其工作。

### 2. 使滚动处理程序去除抖动

上面两个问题的解决方法相同：始终应使下一个 requestAnimationFrame 回调的视觉更改去除抖动：
```javascript
function onScroll (evt) {

  // Store the scroll value for laterz.
  lastScrollY = window.scrollY;

  // Prevent multiple rAF callbacks.
  if (scheduledAnimationFrame)
    return;

  scheduledAnimationFrame = true;
  requestAnimationFrame(readAndUpdatePage);
}

window.addEventListener('scroll', onScroll);
```
这样做还有一个好处是使输入处理程序轻量化，效果非常好，因为现在您不用去阻止计算开销很大的代码的操作，例如滚动或触摸！

