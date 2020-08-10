### 概述

### 变量申明
```js
let num: number = 1
let str: string = 'hello'
```

### 函数参数类型与返回值类型
```js
function sum(a: number, b: number): number {
    return a + b
}
```
### 复合元素类型
```js
let arr: Array<number> = [1, 2, 3]
let set: Set<number> = new Set([1, 2, 2])
let map: Map<string, number> = new Map([['key1', 1], ['key2', 2]])
```
### 接口类型
```js
interface Point {
    x: number
    y: number
}
const point: Point = { x: 10, y: 20 }
```
### 类型别名
```js
type mathfunc = (a: number, b: number) => number
const product: mathfunc = (a, b) => a * b
```

### 泛型
泛型的意义在于函数的重用性，我们希望组件不仅能够支持当前的数据类型，同时也能支持未来的数据类型

**为什么不用`any`呢？**  

使用 `any` 会丢失掉一些信息，我们无法确定返回值是什么类型  
泛型可以保证入参跟返回值是相同类型的，它是一种特殊的变量，只用于表示类型而不是值

语法 `<T>(arg:T):T` 其中`T`为自定义变量，能前后对应就行

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


