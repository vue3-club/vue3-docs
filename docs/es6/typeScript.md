### 初次见面
官方对其只用了一句话来描述
> TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. Any browser. Any host. Any OS. Open source.

大致意思为，TypeScript 是开源的，TypeScript 是 JavaScript 的类型的**超集**，它可以编译成纯 JavaScript。编译出来的 JavaScript 可以运行在任何浏览器上。TypeScript 编译工具可以运行在任何服务器和任何系统上

* 问题1: 什么是超集  

**超集是集合论的术语**   
说到超集，不得不说另一个，子集，怎么理解这两个概念呢，举个例子

如果一个集合A里面的的所有元素集合B里面都存在，那么我们可以理解集合B是集合A的超集，反之集合A为集合B的子集

现在我们就能理解为 `Typescript` 里包含了 `Javascript` 的所有特性，这也意味着我们可以将`.js`后缀直接命名为`.ts`文件跑到`TypeScript`的编绎系统中

### Typescript 解决了什么问题

**一个事物的诞生一定会有其存在的价值**

那么 `Typescript` 的价值是什么呢？

回答这个问题之前，我们有必要先来了解一下 `Typescript` 的工作理念

本质上是在 `JavaScript` 上增加一套**静态类型系统**（编译时进行类型分析），强调静态类型系统是为了和运行时的类型检查机制做区分，`TypeScript` 的代码最终会被编译为 `JavaScript`

我们再回到问题本身，缩小一下范围，`Typescript` 创造的价值大部分是在开发时体现的(编译时)，而非运行时，如

- 强大的编辑器智能提示 (研发效率，开发体验)
- 代码可读性增强 (团队协作，开发体验)
- 编译时类型检查 (业务稳健，前端项目中Top10 的错误类型低级的类型错误占比达到70%)

### 正文

本篇文章作为 `Vue3` 源码系列前置篇章之一，`Typescript` 的科普文，主要目的为了大家在面对 `Vue3` 源码时不会显得那么不知所措，下来将介绍一些 `Typescript` 的基本使用

### 变量申明

#### 基本类型
```js
let isDone: boolean = false
let num: number = 1
let str: string = 'vue3js.cn'
let arr: number[] = [1, 2, 3] 
let arr2: Array<number> = [1, 2, 3] // 泛型数组
let obj: object = {}
let u: undefined = undefined;
let n: null = null;
```

#### 类型补充

- 枚举 `Enum`

使用枚举类型可以为一组数值赋予友好的名字
```js
enum LogLevel {
  info = 'info',
  warn = 'warn',
  error = 'error',
}
```

- 元组 `Tuple` 

允许数组各元素的类型不必相同。 比如，你可以定义一对值分别为 string和number类型的元组

```js
// Declare a tuple type
let x: [string, number];
// Initialize it
x = ['hello', 10]; // OK
// Initialize it incorrectly
x = [10, 'hello']; // Error
```

- 任意值 `Any` 

表示任意类型，通常用于不确定内容的类型，比如来自用户输入或第三方代码库

```js
let notSure: any = 4;
notSure = "maybe a string instead";
notSure = false; // okay, definitely a boolean
```
- 空值 `Void` 

与 any 相反，通常用于函数，表示没有返回值

```js
function warnUser(): void {
    console.log("This is my warning message");
}
```

- 接口 `interface` 

类型契约，跟我们平常调服务端接口要先定义字段一个理

如下例子 point 跟 Point 类型必须一致，多一个少一个也是不被允许的
```js
interface Point {
    x: number
    y: number
    z?: number
    readonly l: number
}
const point: Point = { x: 10, y: 20, z: 30, l: 40 }
const point2: Point = { x: '10', y: 20, z: 30, l: 40 } // Error 
const point3: Point = { x: 10, y: 20, z: 30 } // Error 
const point4: Point = { x: 10, y: 20, z: 30, l: 40, m: 50 } // Error 
 
```

可选与只读 ? 表示可选参， readonly 表示只读

```js
const point5: Point = { x: 10, y: 20, l: 40 } // 正常
point5.l = 50 // error
```

### 函数参数类型与返回值类型

```js
function sum(a: number, b: number): number {
    return a + b
}
```

配合 `interface` 使用 

```js
interface Point {
    x: number
    y: number
}

function sum({ x,  y}: Point): number {
    return x + y
}

sum({x:1, y:2}) // 3
```

### 泛型
泛型的意义在于函数的重用性，设计原则希望组件不仅能够支持当前的数据类型，同时也能支持未来的数据类型

* 比如

根据业务最初的设计函数 `identity` 入参为`String` 
```js
function identity(arg: String){
	return arg
}
console.log(identity('100'))
```

业务迭代过程参数需要支持 `Number`
```js
function identity(arg: String){
	return arg
}
console.log(identity(100)) // Argument of type '100' is not assignable to parameter of type 'String'.
```

#### **为什么不用`any`呢？**  

使用 `any` 会丢失掉一些信息，我们无法确定返回值是什么类型  
泛型可以保证入参跟返回值是相同类型的，它是一种特殊的变量，只用于表示类型而不是值

语法 `<T>(arg:T):T` 其中`T`为自定义变量

```js
const hello : string = "Hello vue!"
function say<T>(arg: T): T {
    return arg;
}
console.log(say(hello)) // Hello vue! 
```

#### 泛型约束
我们使用同样的例子，加了一个`console`，但是很不幸运，报错了，因为泛型无法保证每种类型都有`.length` 属性

```js
const hello : string = "Hello vue!"
function say<T>(arg: T): T {
	console.log(arg.length) // Property 'length' does not exist on type 'T'.
    return arg;
}
console.log(say(hello)) // Hello vue! 
```

从这里我们也又看出来一个跟`any`不同的地方，如果我们想要在约束层面上就结束战斗，我们需要定义一个接口来描述约束条件

```js
interface Lengthwise {
    length: number;
}

function say<T extends Lengthwise>(arg: T): T {
	console.log(arg.length)
    return arg;
}
console.log(say(1))  // Argument of type '1' is not assignable to parameter of type 'Lengthwise'.
console.log(say({value: 'hello vue!', length: 10})) // { value: 'hello vue!', length: 10 } 
```

### 交叉类型

交叉类型(Intersection Types)，将多个类型合并为一个类型

```js
interface foo {
    x: number
}
interface bar {
    b: number
}
type intersection = foo & bar
const result: intersection = {
    x: 10,
    b: 20
}
const result1: intersection = {
    x: 10
}  // error
```

### 联合类型

联合类型(Union Types)，表示一个值可以是几种类型之一。 我们用竖线 | 分隔每个类型，所以 number | string | boolean表示一个值可以是 number， string，或 boolean

```js
type arg = string | number | boolean
const foo = (arg: arg):any =>{ 
    console.log(arg)
}
foo(1)
foo('2')
foo(true)
```

### 函数重载

函数重载（Function Overloading）, 允许创建数项名称相同但输入输出类型或个数不同的子程序，可以简单理解为一个函数可以执行多项任务的能力

例我们有一个`add`函数，它可以接收`string`类型的参数进行拼接，也可以接收`number`类型的参数进行相加

```js
function add (arg1: string, arg2: string): string
function add (arg1: number, arg2: number): number

// 实现
function add <T,U>(arg1: T, arg2: U) {
  // 在实现上我们要注意严格判断两个参数的类型是否相等，而不能简单的写一个 arg1 + arg2
  if (typeof arg1 === 'string' && typeof arg2 === 'string') {
    return arg1 + arg2
  } else if (typeof arg1 === 'number' && typeof arg2 === 'number') {
    return arg1 + arg2
  }
}

add(1, 2) // 3
add('1','2') //'12'
```

### 总结

通过本篇文章，相信大家对`Typescript`不会再感到陌生了

下面我们来看看在`Vue`源码`Typescript`是如何书写的，这里我们以`defineComponent`函数为例，大家可以通过这个实例，再结合文章的内容，去理解，加深`Typescript`的认识

```js
// overload 1: direct setup function
export function defineComponent<Props, RawBindings = object>(
  setup: (
    props: Readonly<Props>,
    ctx: SetupContext
  ) => RawBindings | RenderFunction
): {
  new (): ComponentPublicInstance<
    Props,
    RawBindings,
    {},
    {},
    {},
    // public props
    VNodeProps & Props
  >
} & FunctionalComponent<Props>

// defineComponent一共有四个重载，这里省略三个

// implementation, close to no-op
export function defineComponent(options: unknown) {
  return isFunction(options) ? { setup: options } : options
}

```
