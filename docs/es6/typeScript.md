### 基本语法

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

console.log(num, str, arr, set, map, sum(1, 2), product(2, 3), point)
```