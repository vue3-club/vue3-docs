###  Set、Map、WeakSet、WeakMap

如果要用一句来描述，我们可以说
**Set是一种叫做集合的数据结构，Map是一种叫做字典的数据结构**

那什么是集合？什么又是字典呢？

- 集合

> 集合，是由一堆无序的、相关联的，且不重复的内存结构【数学中称为元素】组成的组合

- 字典

> 字典（dictionary）是一些元素的集合。每个元素有一个称作key 的域，不同元素的key 各不相同

那么集合和字典又有什么区别呢？

- 共同点：集合、字典都可以存储不重复的值
- 不同点：集合是以[值，值]的形式存储元素，字典是以[键，值]的形式存储

## 背景

大多数主流编程语言都有多种内置的数据集合。例如`Python`拥有列表（`list`）、元组（`tuple`）和字典（`dictionary`）,Java有列表（`list`）、集合（`set`)、队列（`queue`）

然而  `JavaScript` 直到`ES6`的发布之前，只拥有数组（`array`）和对象（`object`）这两个内建的数据集合

在 `ES6` 之前,我们通常使用内置的 `Object` 模拟Map

但是这样模拟出来的`map`会有一些缺陷，如下:

1. `Object`的属性键是`String`或`Symbol`，这限制了它们作为不同数据类型的键/值对集合的能力
2. `Object`不是设计来作为一种数据集合，因此没有直接有效的方法来确定对象具有多少属性

## Set

> 定义: `Set` 对象允许你存储任何类型的唯一值，无论是原始值或者是对象引用，`Set`对象是值的集合，你可以按照插入的顺序迭代它的元素。 `Set`中的元素只会出现一次，即 `Set` 中的元素是唯一的

`Set`本身是一个构造函数，用来生成 `Set` 数据结构

### 基本使用

- 语法  
`new Set([iterable])` 接收一个数组（或者具有 iterable 接口的其他数据结构）, 返回一个新的`Set`对象

```js
const set = new Set([1,2,1,2])
console.log(set) // {1,2} 
```
上面代码可以看出 `Set` 是可以去除数组中的重复元素

### 属性及方法

**属性**
- size: 返回集合中所包含的元素的数量
```js
console.log(new Set([1,2,1,2]).size) // 2
```
**操作方法**
- add(value): 向集合中添加一个新的项
- delete(value): 从集合中删除一个值
- has(value): 如果值在集合中存在，返回ture, 否则返回false
- clear(): 移除集合中的所有项

```js
let set = new Set()
set.add(1)
set.add(2)
set.add(2)
set.add(3)
console.log(set) // {1,2,3}
set.has(2) // true
set.delete(2)  
set.has(2) // false
set.clear() 
```

**遍历方法**
- keys(): 返回键名的遍历器
- values(): 返回键值的遍历器
- entries(): 返回键值对的遍历器
- forEach(): 使用回调函数遍历每个成员

```js
let set = new Set([1,2,3,4])

// 由于set只有键值，没有键名，所以keys() values()行为完全一致
console.log(Array.from(set.keys())) // [1,2,3,4]
console.log(Array.from(set.values())) // [1,2,3,4]
console.log(Array.from(set.entries())) //  [[1,1],[2,2],[3,3],[4,4]]

set.forEach((item) => { console.log(item)}) // 1,2,3,4

```

### 应用场景
因为 `Set` 结构的值是唯一的，我们可以很轻松的实现以下
```js
// 数组去重
let arr = [1, 1, 2, 3];
let unique = [... new Set(arr)];

let a = new Set([1, 2, 3]);
let b = new Set([4, 3, 2]);
    
// 并集
let union = [...new Set([...a, ...b])]; // [1,2,3,4]
    
// 交集
let intersect = [...new Set([...a].filter(x => b.has(x)))]; [2,3]
    
// 差集
let difference = Array.from(new Set([...a].filter(x => !b.has(x)))); [1]
```

## WeakSet

> WeakSet 对象是一些对象值的集合, 并且其中的每个对象值都只能出现一次。在WeakSet的集合中是唯一的

`WeakSet` 的出现主要解决弱引用对象存储的场景, 其结构与`Set`类似

与`Set`的区别
- 与Set相比，WeakSet 只能是对象的集合，而不能是任何类型的任意值
- WeakSet集合中对象的引用为弱引用。 如果没有其他的对WeakSet中对象的引用，那么这些对象会被当成垃圾回收掉。 这也意味着WeakSet中没有存储当前对象的列表。 正因为这样，WeakSet 是不可枚举的

`WeakSet` 的属性跟操作方法与 `Set` 一致，不同的是 `WeakSet` 没有遍历方法，因为其成员都是弱引用，弱引用随时都会消失，遍历机制无法保证成员的存在

**上面一直有提到弱引用，那弱引用到底是指什么呢？**

> 弱引用是指不能确保其引用的对象不会被垃圾回收器回收的引用，换句话说就是可能在任意时间被回收

## Map

> Map 对象保存键值对，并且能够记住键的原始插入顺序。任何值(对象或者原始值) 都可以作为一个键或一个值。一个Map对象在迭代时会根据对象中元素的插入顺序来进行 — 一个  for...of 循环在每次迭代后会返回一个形式为[key，value]的数组

### 基本使用
- 语法  

`new Map([iterable])` `Iterable` 可以是一个数组或者其他 `iterable` 对象，其元素为键值对(两个元素的数组，例如: [[ 1, 'one' ],[ 2, 'two' ]])。 每个键值对都会添加到新的 `Map`

```js
let map = new Map()
map.set('name', 'vuejs.cn');
console.log(map.get('name'))
```
### 属性及方法

基本跟 `Set` 类似，同样具有如下方法
**属性**
- size: 返回 Map 结构的元素总数
```js
let map = new Map()
map.set('name', 'vuejs.cn');
console.log(map.size) // 1

console.log(new Map([['name','vue3js.cn'], ['age','18']]).size) // 2
```
**操作方法**
- set(key, value): 向 Map 中加入或更新键值对
- get(key): 读取 key 对用的值，如果没有，返回 undefined
- has(key): 某个键是否在 Map 对象中，在返回 true 否则返回 false
- delete(key): 删除某个键，返回 true, 如果删除失败返回 false
- clear(): 删除所有元素

```js
let map = new Map()
map.set('name','vue3js.cn')
map.set('age','18')
console.log(map) // Map {"name" => "vuejs.cn", "age" => "18"}
map.get('name') // vue3js.cn 
map.has('name') // true
map.delete('name')  
map.has(name) // false
map.clear() // Map {} 
```
**遍历方法**
- keys()：返回键名的遍历器
- values()：返回键值的遍历器
- entries()：返回所有成员的遍历器
- forEach()：遍历 Map 的所有成员

```js
let map = new Map()
map.set('name','vue3js.cn')
map.set('age','18')

console.log([...map.keys()])  // ["name", "age"]
console.log([...map.values()])  // ["vue3js.cn", "18"]
console.log([...map.entries()]) // [['name','vue3js.cn'], ['age','18']]

// name vuejs.cn
// age 18
map.forEach((value, key) => { console.log(key, value)}) 
```

### 应用场景
`Map` 会保留所有元素的顺序, 是在基于可迭代的基础上构建的，如果考虑到元素迭代或顺序保留或键值类型丰富的情况下都可以使用，下面摘抄自 `vue3` 源码中依赖收集的核心实现

```js
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
    ...
  }
```

## WeakMap

> WeakMap 对象是一组键/值对的集合，其中的键是弱引用的。其键必须是对象，而值可以是任意的

与`Map`的区别
- Map 的键可以是任意类型，WeakMap 的键只能是对象类型 
- WeakMap 键名所指向的对象，不计入垃圾回收机制

`WeakMap` 的属性跟操作方法与 `Map` 一致，同 `WeakSet` 一样，因为是弱引用，所以 `WeakSet` 也没有遍历方法

## 类型的转换

- `Map` 转为 `Array`
```js
// 解构
const map = new Map([[1, 1], [2, 2], [3, 3]])
console.log([...map])	// [[1, 1], [2, 2], [3, 3]]

// Array.from()
const map = new Map([[1, 1], [2, 2], [3, 3]])
console.log(Array.from(map))	// [[1, 1], [2, 2], [3, 3]]
```
- `Array` 转为 `Map`
```js
const map = new Map([[1, 1], [2, 2], [3, 3]])
console.log(map)	// Map {1 => 1, 2 => 2, 3 => 3}
```
- `Map` 转为 `Object`
```js
// 非字符串键名会被转换为字符串
function mapToObj(map) {
    let obj = Object.create(null)
    for (let [key, value] of map) {
        obj[key] = value
    }
    return obj
}
const map = new Map().set('name', 'vue3js.cn').set('age', '18')
mapToObj(map)  // {name: "vue3js.cn", age: "18"}
```
- `Object` 转为 `Map`
```js
let obj = {"a":1, "b":2};
let map = new Map(Object.entries(obj))
```

## 总结
- Set、Map、WeakSet、WeakMap、都是一种集合的数据结构
- Set、WeakSet 是[值,值]的集合，且具有唯一性 
- Map 和 WeakMap 是一种[键,值]的集合，Map 的键可以是任意类型，WeakMap 的键只能是对象类型
- Set 和 Map 有遍历方法，WeakSet 和 WeakMap 属于弱引用不可遍历

### 参考
- [https://zh.wikipedia.org/wiki/%E5%BC%B1%E5%BC%95%E7%94%A8](https://zh.wikipedia.org/wiki/%E5%BC%B1%E5%BC%95%E7%94%A8)
- [https://developer.mozilla.org/](https://developer.mozilla.org/)  
- [https://es6.ruanyifeng.com/](https://es6.ruanyifeng.com/)


