# Sth about css
- [背景与颜色的使用](#背景与颜色的使用)
- [超链接](#超链接)
- [元素边框的设置](#元素边框的设置)
- [position属性](#position属性)
- [内联块状元素](#内联块状元素)
- [水平居中](#水平居中)
- [垂直居中](#垂直居中)
- [隐性改变display类型](#隐性改变display类型)
- [宽度自适应](#宽度自适应)
- [flex布局详解](#flex布局详解)


## 背景与颜色的使用
颜色的表示方法
十六进制表示：#ffffff
rgb函数表示：rgb(255,255,255)
rgb百分比：  rgb(20%,50%,100%)

1. 背景颜色与背景图片的设置

bakcground-color(背景颜色属性)
语法：background-color:<color> | transparent(透明)

2. background-image(背景图片的应用)

语法：background-image:url(文件位置) | none
注：可以在段落中设置背景图片，使某一段产生背景效果

3. background-repeat（背景图片并排方式）

语法：bakcground-repeat:repeat | repeat-x | repeat-y | no-repeat

设置值说明
repeat 默认值
repeat-x 以x轴并排延伸
repeat-y 以y轴并排延伸
no-repeat 不并排方式处理

4. background-attachment(固定背景图片)

语法：background-attachment:scroll | fixed(固定不变)
注意：主要用在body标记内，用来控制整个html窗口的背景。

5. background-position（背景图片的位置）

语法：background-position:[<百分比> | <长度单位>] | [top | center | bottom] || [left | center | right]

- 百分比方法设置：
background-position:x% y%
x%表示水平位置，即向右缩的百分比。
y%表示水平位置，即向下缩的百分比。

- 长度单位设置：
background-position: x y
例：background-position:250px 50px

- 以关键字设置：
background-position:right top
或
background-positoin:center  == background-position:bottom

## 超链接

设置anchor网页链接属性的颜色
语法说明
- a:link 尚未链接过的文字
- a:visited 已经链接过的文字
- a:active 当单击时的颜色
- a:hover 移到文字上方时的颜色

- 同时设置以上四种状态为同一色(LoVe HAte)

> 例：a：link {color:#00ff00}
    a：visited {color:#ff0000}
    a：hover {color:#800080;font-family:楷体; font-weight:bold;
          font-style:italic;font-size:16pt}
    a：active {color:#0000ff}


## 元素边框的设置
border-width边框宽度
语法：border-width:thin | middum | thick | <长度单位>
            (细)  (中等)   (粗)

> 注意：和margin一样，同样有四种设置方法来设置上、右、下、左边框的宽度。它也可以单边设置，其语法为:border-top-width、border-right-width、border-bottom-width、border-left-width

border-color边框色彩
语法：border-color:<color>注意：和margin一样，同样有四种设置方法来设置。它也同样可以单
边设置border-top-color、border-right-color、border-bottom-color、border-left-color.

border-style边框样式

语法：border-style:none | dotted…见下表
none 无线
dotted 小点虚线
dashed 大点虚线
solid 实线
double 双直线
groove 3d凹线
ridge 3d凸起线
inset 3d框入线
outset 3d隆起线


> 注意：和margin一样，同样有四种设置方法来设置。它也同样可以单边设置border-top-style、border-right-style、border-bottom-style、border-left-style.
快速设置border属性（即同时设置宽度、颜色、类型）

## position属性
语法：position:absolute | relative | static | fix

设置值说明
absolute
以网页左上角为原点，使用绝对坐标，要与top，left结合
relative
以当前位置为原点，相对坐标，也要与top，left结合
static
默认位置

>例：position:absolute;top:0;left:0

## 内联块状元素

内联块状元素（inline-block）就是同时具备内联元素、块状元素的特点，代码display:inline-block就是将元素设置为内联块状元素。(css2.1新增)，img、input标签就是这种内联块状标签。

inline-block元素特点：
- 和其他元素都在一行上；
- 元素的高度、宽度、行高以及顶和底边距都可设置。

## 水平居中

1. 行内元素

给父元素设置 text-align:center

2. 定宽块状元素

- 未设置float并且postion不为absolute，可设置“左右margin”值为“auto”来实现居中的
- 设置了float或者postion为absolute，需父元素设置position:relative; 子元素设置 position:absolute; top: 50%; margin-left: [-50%子元素宽度];

3. 不定宽块状元素方法
- 父元素设置position:relative; 子元素设置 position:absolute; top: 50%; transform: translateX(-50%);
- 父元素display: flex; justify-content: center;

## 垂直居中

1. 父元素高度确定的单行文本

设置父元素的 height 和 line-height高度一致来实现的

2. 子元素是高度确定的块级元素

父元素设置position:relative; 子元素设置 position:absolute; top:50%; margin-top: [-50%子元素高度];

3. 子元素是高度不确定的块级元素
- 父元素设置position:relative; 子元素设置 position:absolute; top:50%; 者transform: translateX(-50%);
- 父元素display: flex; align-items: center;


## 隐性改变display类型

有一个有趣的现象就是当为元素（不论之前是什么类型元素，display:none 除外）设置以下 2 个句之一：
- position : absolute
- float : left 或 float:right
元素会自动变为以 display:inline-block 的方式显示，当然就可以设置元素的 width 和 height 了且默认宽度不占满父元素。

## 宽度自适应效果

实现左右栏宽度固定，中间栏宽度自适应

- 利用position:absolute
1. 设置左右栏position为absolute，left、right分别为0，然后top全都设置为0，这点别忘了！！！
2. 设置中间栏margin为margin: 0 200px;
具体代码如下

此方法的缺点在于必须设置top值，否则右边栏会掉到下面一行。

- 利用float
1. 左右栏分别设置float为left和right。
2. 设置margin: 200px 0;

此方法的确定在于：必须将自适应的元素摆在其他元素后面。另外：不足在于：中间主体存在克星，clear:both属性。如果要使用此方法，需避免明显的clear样式。
- 利用flex
1. 父元素设置，display: flex;
2. 需要自适应的子元素设置flex: 1; margin: 200px 0;

> 博客中有宽度自适应的demo

## flex布局详解

一个设有「display:flex」或「display:inline-flex」的元素是一个伸缩容器，伸缩容器的子元素被称为为伸缩项目，这些子元素使用伸缩布局模型来排版。
与布局计算偏向使用书写模式方向的块布局与行内布局不同，伸缩布局偏向使用伸缩流方向。为了让描述伸缩布局变得更容易，本章节定义一系列相对于伸缩流的术语。「flex-flow」的值决定了这些术语如何对应到物理方向（顶／右／底／左）、物理轴（垂直／水平）、物理大小（宽度／高度）。

伸缩容器 ―「display」值「flex」与「inline-flex」

「flex」 这个值让元素产生块级伸缩容器盒。
「inline-flex」 这个值让元素产生行内级伸缩容器盒。

flex-flow

flex-flow是用来伸缩行换行，flex-flow属性是同时设定“flex-direction(伸缩流的方向)”和“flex-wrap（伸缩行换行）”属性的缩写

flex-direction

flex-direction属性可以用来设定伸缩容器的主轴的方向，这也决定了用户代理配置伸缩项目的方向。主要适用于伸缩容器，主要包括以下几个值：
row

flex-direction的默认值，表示伸缩容器的主轴与当前书写模式的行内轴（文字布局的主要主向）。主轴起点与主轴终点方向分别等同于当前书写模式的始与结方向

row-reverse

表示的是除了主轴起点与主轴终点方向交换以外同row属性值的作用

column

表示的是伸缩容器的主轴与当前书写模式的块轴（块布局的主要方向）同向。主轴起点与主轴终点方向分别等同于当前书写模式的前与后方向。简单的可以理解为列布局

column-reverse

表示的是除了主轴起点与主轴终点方向交换以外同“column”的属性值作用

flex-wrap

flex-wrap属性主要用来控制伸缩容器是单行还是多行，也决定了侧轴方向一新的一行的堆放方向。主要适用于伸缩容器，主要包括以下几个值：

nowrap

flex-wrap的默认值，表示的是伸缩容器为单行。侧轴起点方向等同于当前书写模式的起点或前/头在侧轴的那一边，而侧轴终点方向是侧轴起点的相反方向

wrap

表示的是伸缩容器为多行。侧轴起点方向等同于当前书写模式的起眯或前/头在侧轴的那一边，而侧轴终点方向是侧轴起点的相反方向。

wrap-reverse

除了侧轴起点与侧轴终点方向交换以外同wrap所起作用相同
侧轴对齐伸缩项目——align-items

“align-items”属性允许您调整伸缩项目在侧轴的对齐方式，主要包括以下几个值：

- flex-start/baseline：伸缩项目在侧轴起点边的外边距紧靠住该行在侧轴起点的边。
- flex-end：伸缩项目在侧轴终点边的外边距靠住该行在侧轴终点的边。
- center：伸缩项目的外边距盒在该行的侧轴上居中放置。（如果伸缩行的尺寸小于伸缩项目，则伸缩项目会向两个方向溢出相同的量）。
- stretch：伸缩项目拉伸，填满整个侧轴

主轴对齐伸缩项目——justify-content

这个属性主要用来设置伸缩项目沿主轴的对齐方式，从而调整伸缩项目之间的间距。设置了这个属性，在主轴方向上设置的任何margin都不会起作用。其值主要有

- flex-start：伸缩项目向一行的起始位置靠齐。该行的第一个伸缩项目在主轴起点边的外边距与该行在主轴起点的边对齐，同时所有后续的伸缩项目与其前一个项目对齐。

- flex-end：伸缩项目向一行的结束位置靠齐。该行的最后一个伸缩项目在主轴终点边的外边距与该行在主轴终点的边对齐，同时所有前面的伸缩项目与其后一个项目对齐。

- center：伸缩项目向一行的中间位置靠齐。该行的伸缩项目将相互对齐并在行中居中对齐，同时第一个项目与该行的在主轴起点的边的距离等同与最后一个项目与该行在主轴终点的边的距离（如果剩余空间是负数，则保持两端溢出的长度相等）。

- space-between：伸缩项目会平均地分布在一行里。如果剩余空间是负数，或该行只有一个伸缩项目，则此值等效于「flex-start」。在其它情况下，第一个项目在主轴起点边的外边距会与该行在主轴起点的边对齐，同时最后一个项目在主轴终点边的外边距与该行在主轴终点的边对齐，而剩下的伸缩项目在确保两两之间的空白空间相等下平均分布。

- space-around: 每个项目两端都有空间


改变元素布局的顺序

通过“order”属性来修改伸缩项目的布局顺序（在不调整结构前提之下）

默认情况之下，所有的伸缩项目的顺序组都是“0”。我们可以很容易的给每个伸缩项目设置不同的顺序值。更高的值会排在后面，而原来的HTML结构并不会有任何变化。
使你的元素具有弹性

Flexbox最强大的特性是能够通过“flex-flow”属性设置伸缩项目的流动方向，或者可以通过“flex”属性设置一个子元素可用的空间。flex的取值可以有三个部分

flex: [flex-grow] [flex-shrink] [flex-basis]
如flex:1 200px;

- flex-grow：此属性值为正数值，用来设置扩展比率，也就是剩余空间是正值的时候此伸缩项目相对于伸缩容器里其他伸缩项目能分配到空间比例。若省略则会被设置为“1”。
- flex-shrink：此属性值为正数值，用来设置收缩比率，也就是剩余空间是负值的时候此伸缩项目相对于伸缩容器里其他伸缩项目能收缩的空间比例。若省略则会被设置为“1”，在收缩的时候收缩比率会以伸缩基准值加权。
- flex-basis：与width属性使用相同的值，可以用来设置flex-basis长写并指定伸缩基准值，也就是根据可伸缩比率计算 出剩余空间的分布之前，伸缩项目主轴长度的起始数值。若在flex缩写省略了此属性设置，则flex-basis的指定值是“0”，若flex-basis的指定值是“auto”，则伸缩基准值的指定值是元素主轴长度属性的值。

多行flxbox(flex-flow:row wrap)和伸缩长度flex（如:flex:1 0 7rem）以及媒体查询，实现了一个完美的效果。在不同视窗宽度下，伸缩项目在伸缩容器中可以平滑的进行变化。

flex:auto”时，伸缩容器中的伸缩项目（相当于flex: 1 1 auto）将使用其大小根据任何width/height或者min-width/min-height设定，它将扩展占用一个比例的任何自由空间可用，但在没有额外的自由空间将缩小以适应其内容。
flex:initial”(相当于flex:0 1 auto)，你会看到，当有多余的空间时，第三个子元素安容器大小不再增加，但仍然需要收缩。

在使用flexbox之前将页面所有元素（比如：nav、header、footer等）设置成“display:block”，在支持flexbox的 浏览器会将内容自动伸缩，以适应整个设备的宽度。在不识别flexbox的浏览器中会按顺序整块的排列，但并不会影响你的阅读。

伸缩项目的默认最小长度

为了让伸缩项目有合理的最小长度，本规范为 CSS 2.1 定义的「min-width」与「min-height」属性增加一个新的「auto」值作为这些属性的初始值。[CSS21]

名称：   min-width, min-height
新值：   auto
新初始值：   auto
新计算值：   指定的百分比率或绝对长度或关键字