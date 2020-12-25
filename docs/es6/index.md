
# ES6的代理模式 | Proxy

> 定义: 用于定义基本操作的自定义行为

`proxy`修改的是程序默认形为，就形同于在编程语言层面上做修改，属于元编程(`meta` `programming`)

- **元编程（英语：Metaprogramming**，又译超编程，是指某类计算机程序的编写，这类计算机程序编写或者操纵其它程序（或者自身）作为它们的数据，或者在运行时完成部分本应在编译时完成的工作

一段代码来理解元编程
```bash
#!/bin/bash
# metaprogram
echo '#!/bin/bash' >program
for ((I=1; I<=1024; I++)) do
    echo "echo $I" >>program
done
chmod +x program
```
这段程序每执行一次能帮我们生成一个名为program的文件，文件内容为1024行`echo`，如果我们手动来写1024行代码，效率显然低效

**元编程优点**：与手工编写全部代码相比，程序员可以获得更高的工作效率，或者给与程序更大的灵活度去处理新的情形而无需重新编译

`proxy` 译为代理，可以理解为在操作目标对象前架设一层代理，将所有本该我们手动编写的程序交由代理来处理，生活中也有许许多多的“proxy”, 如代购，中介，因为他们所有的行为都不会直接触达到目标对象

## 正文

本篇文章作为 `Vue3` 源码系列前置篇章之一，`Proxy` 的科普文，跟`Vue3`并没有绝对关系，但是当你静下心读完了前置篇章，再去读后续的源码系列，感受定会截然不同

前置篇章包含
- 为什么要学习源码
- 认识Typescript 
- 理解函数式编程
- 搞明白Proxy
- 摸清楚Set、Map、WeakSet、WeakMap

下来将介绍 `Proxy` 的基本使用

## 语法

- target 要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理
- handler 一个通常以函数作为属性的对象，用来定制拦截行为

```js

const proxy = new Proxy(target, handle)
```

举个例子
```js
const origin = {}
const obj = new Proxy(origin, {
  get: function (target, propKey, receiver) {
		return '10'
  }
});

obj.a // 10
obj.b // 10
origin.a // undefined
origin.b // undefined
```
上方代码我们给一个空对象的get架设了一层代理，所有`get`操作都会直接返回我们定制的数字10，需要注意的是，代理只会对`proxy`对象生效，如上方的`origin`就没有任何效果

## Handler 对象常用的方法

| 方法 | 描述 |
|  ----  | ----  |
| handler.has() | in 操作符的捕捉器。|
| handler.get() | 属性读取操作的捕捉器。| 
| handler.set() | 属性设置操作的捕捉器。| 
| handler.deleteProperty() | delete 操作符的捕捉器。| 
| handler.ownKeys() | Object.getOwnPropertyNames 方法和 Object.getOwnPropertySymbols 方法的捕捉器。| 
| handler.apply() | 函数调用操作的捕捉器。| 
| handler.construct() | new 操作符的捕捉器|   


下面挑`handler.get`重点讲一下，其它方法的使用也都大同小异，不同的是参数的区别

### handler.get

`get`我们在上面例子已经体验过了，现在详细介绍一下，用于代理目标对象的属性读取操作

授受三个参数 `get(target, propKey, ?receiver) `
- target 目标对象
- propkey 属性名
- receiver Proxy 实例本身

**举个例子**
```js
const person = {
  like: "vuejs"
}

const obj = new Proxy(person, {
  get: function(target, propKey) {
    if (propKey in target) {
      return target[propKey];
    } else {
      throw new ReferenceError("Prop name \"" + propKey + "\" does not exist.");
    }
  }
})

obj.like // vuejs
obj.test // Uncaught ReferenceError: Prop name "test" does not exist.
```
上面的代码表示在读取代理目标的值时，如果有值则直接返回，没有值就抛出一个自定义的错误

**注意:** 
- 如果要访问的目标属性是不可写以及不可配置的，则返回的值必须与该目标属性的值相同
- 如果要访问的目标属性没有配置访问方法，即get方法是undefined的，则返回值必须为undefined

如下面的例子
```js
const obj = {};
Object.defineProperty(obj, "a", { 
  configurable: false, 
  enumerable: false, 
  value: 10, 
  writable: false 
})

const p = new Proxy(obj, {
  get: function(target, prop) {
    return 20;
  }
})

p.a // Uncaught TypeError: 'get' on proxy: property 'a' is a read-only and non-configurable..
```

## 可撤消的Proxy

`proxy`有一个唯一的静态方法，`Proxy.revocable(target, handler) `

`Proxy.revocable()`方法可以用来创建一个可撤销的代理对象

该方法的返回值是一个对象，其结构为： `{"proxy": proxy, "revoke": revoke}`

- proxy
表示新生成的代理对象本身，和用一般方式 new Proxy(target, handler) 创建的代理对象没什么不同，只是它可以被撤销掉。
- revoke
撤销方法，调用的时候不需要加任何参数，就可以撤销掉和它一起生成的那个代理对象。

该方法常用于完全封闭对目标对象的访问, 如下示例
```js
const target = { name: 'vuejs'}
const {proxy, revoke} = Proxy.revocable(target, handler)
proxy.name // 正常取值输出 vuejs
revoke() // 取值完成对proxy进行封闭，撤消代理
proxy.name // TypeError: Revoked
```

## Proxy的应用场景

`Proxy`的应用范围很广，下方列举几个典型的应用场景

###  **校验器**   

想要一个`number`，拿回来的却是`string`，惊不惊喜？意不意外？下面我们使用`Proxy`实现一个逻辑分离的数据格式验证器  

嗯，真香!

```js
const target = {
  _id: '1024',
  name:  'vuejs'
}

const validators = {  
    name(val) {
        return typeof val === 'string';
    },
    _id(val) {
        return typeof val === 'number' && val > 1024;
    }
}

const createValidator = (target, validator) => {
  return new Proxy(target, {
    _validator: validator,
    set(target, propkey, value, proxy){
      let validator = this._validator[propkey](value)
      if(validator){
        return Reflect.set(target, propkey, value, proxy)
      }else {
        throw Error(`Cannot set ${propkey} to ${value}. Invalid type.`)
      }
    }
  })
}

const proxy = createValidator(target, validators)

proxy.name = 'vue-js.com' // vue-js.com
proxy.name = 10086 // Uncaught Error: Cannot set name to 10086. Invalid type.
proxy._id = 1025 // 1025
proxy._id = 22  // Uncaught Error: Cannot set _id to 22. Invalid type 

```

### 私有属性

在日常编写代码的过程中，我们想定义一些私有属性，通常是在团队中进行约定，大家按照约定在变量名之前添加下划线 _ 或者其它格式来表明这是一个私有属性，但我们不能保证他能真私‘私有化’，下面使用Proxy轻松实现私有属性拦截

```js
const target = {
  _id: '1024',
  name:  'vuejs'
}

const proxy = new Proxy(target, {
  get(target, propkey, proxy){
    if(propkey[0] === '_'){
      throw Error(`${propkey} is restricted`)
    }
    return Reflect.get(target, propkey, proxy)
  },
  set(target, propkey, value, proxy){
    if(propkey[0] === '_'){
      throw Error(`${propkey} is restricted`)
    }
    return Reflect.set(target, propkey, value, proxy)
  }
})

proxy.name // vuejs
proxy._id // Uncaught Error: _id is restricted
proxy._id = '1025' // Uncaught Error: _id is restricted
```

`Proxy` 使用场景还有很多很多，不再一一列举，如果你需要在某一个动作的生命周期内做一些特定的处理，那么`Proxy` 都是适合的

## 为什么要用Proxy重构

在 `Proxy` 之前，`JavaScript` 中就提供过 `Object.defineProperty`，允许对对象的 `getter/setter` 进行拦截  

Vue3.0之前的双向绑定是由 `defineProperty` 实现, 在3.0重构为 `Proxy`，那么两者的区别究竟在哪里呢？

首先我们再来回顾一下它的定义

> Object.defineProperty() 方法会直接在一个**对象上**定义一个**新属性**，或者修改一个对象的现有属性，并返回此对象

上面给两个词划了重点，**对象上**，**属性**，我们可以理解为是针对对象上的某一个属性做处理的

**语法**

- obj 要定义属性的对象
- prop 要定义或修改的属性的名称或 Symbol
- descriptor 要定义或修改的属性描述符

```js
Object.defineProperty(obj, prop, descriptor)
```

举个例子
```js
const obj = {}
Object.defineProperty(obj, "a", {
  value : 1,
  writable : false, // 是否可写 
  configurable : false, // 是否可配置
  enumerable : false // 是否可枚举
})

// 上面给了三个false, 下面的相关操作就很容易理解了
obj.a = 2 // 无效
delete obj.a // 无效
for(key in obj){
  console.log(key) // 无效 
}
```

### **Vue中的defineProperty**

Vue3之前的双向绑定都是通过 `defineProperty` 的 `getter,setter` 来实现的，我们先来体验一下 `getter,setter`
```js
const obj = {};
Object.defineProperty(obj, 'a', {
  set(val) {
    console.log(`开始设置新值: ${val}`)
  },
  get() { 
    console.log(`开始读取属性`)
    return 1; 
  },
  writable : true
})

obj.a = 2 // 开始设置新值: 2
obj.a // 开始获取属性 
```

看到这里，我相信有些同学已经想到了实现双向绑定背后的流程了，其实很简单嘛，只要我们观察到对象属性的变更，再去通知更新视图就好了

我们摘抄一段 Vue 源码中的核心实现验证一下，这一部分一笔代过，不是本文重点
```js
  // 源码位置：https://github.com/vuejs/vue/blob/ef56410a2c/src/core/observer/index.js#L135
  // ...
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      // ...
      if (Dep.target) {
        // 收集依赖
        dep.depend()
      }
      return value
    },
    set: function reactiveSetter (newVal) {
      // ...
      // 通知视图更新
      dep.notify()
    }
  })
```

### **对象新增属性为什么不更新**

这个问题用过Vue的同学应该有超过95%比例遇到过
```js
data  () {
  return  {
    obj: {
      a: 1
    }
  }
}

methods: {
  update () {
    this.obj.b = 2
  }
}
```

上面的伪代码，当我们执行 `update` 更新 `obj` 时，我们预期视图是要随之更新的，实际是并不会

这个其实很好理解，我们先要明白 `vue` 中 `data init` 的时机，`data init` 是在生命周期 `created` 之前的操作，会对 `data`  绑定一个观察者 `Observer`，之后 `data` 中的字段更新都会通知依赖收集器`Dep`触发视图更新

然后我们回到 `defineProperty` 本身，是对**对象上的属性**做操作，而非对象本身

一句话来说就是，在 `Observer data` 时，新增属性并不存在，自然就不会有 `getter, setter`，也就解释了为什么新增视图不更新，解决有很多种，`Vue` 提供的全局`$set` 本质也是给新增的属性手动 `observer`

```js
// 源码位置 https://github.com/vuejs/vue/blob/dev/src/core/observer/index.js#L201
function set (target: Array<any> | Object, key: any, val: any): any {
  // ....
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}
```

### 数组变异

> 由于 JavaScript 的限制，Vue 不能检测以下数组的变动： 当你利用索引直接设置一个数组项时，例如：vm.items[indexOfItem] = newValue

先来看一段代码

```js
var vm = new Vue({
  data: {
    items: ['1', '2', '3']
  }
})
vm.items[1] = '4' // 视图并未更新
```
文档已经做出了解释，但并不是`defineProperty`的锅，而是尤大在设计上对性能的权衡，下面这段代码可以验证
```js
function defineReactive(data, key, val) {
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
      get: function defineGet() {
        console.log(`get key: ${key} val: ${val}`);
        return val;
      },
      set: function defineSet(newVal) {
        console.log(`set key: ${key} val: ${newVal}`);
        val = newVal;
      }
  })
}

function observe(data) {
  Object.keys(data).forEach(function(key) {
    defineReactive(data, key, data[key]);
  })
}

let test = [1, 2, 3];

observe(test);

test[0] = 4 // set key: 0 val: 4
```

虽然说索引变更不是 `defineProperty` 的锅，但新增索引的确是 `defineProperty` 做不到的，所以就有了数组的变异方法

能看到这里，大概也能猜到内部实现了，还是跟`$set`一样，手动 `observer`，下面我们验证一下

```js
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

methodsToPatch.forEach(function (method) {
  // 缓存原生数组
  const original = arrayProto[method]
  // def使用Object.defineProperty重新定义属性
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args) // 调用原生数组的方法

    const ob = this.__ob__  // ob就是observe实例observe才能响应式
    let inserted
    switch (method) {
      // push和unshift方法会增加数组的索引，但是新增的索引位需要手动observe的
      case 'push':
      case 'unshift':
        inserted = args
        break
      // 同理，splice的第三个参数，为新增的值，也需要手动observe
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 其余的方法都是在原有的索引上更新，初始化的时候已经observe过了
    if (inserted) ob.observeArray(inserted)
    // dep通知所有的订阅者触发回调
    ob.dep.notify()
    return result
  })
})
```
### 对比
一个优秀的开源框架本身就是一个不断打碎重朔的过程，上面做了些许铺垫，现在我们简要总结一下

- `Proxy` 作为新标准将受到浏览器厂商重点持续的性能优化

- `Proxy` 能观察的类型比 `defineProperty` 更丰富

- `Proxy` 不兼容IE，也没有 `polyfill`, `defineProperty` 能支持到IE9

- `Object.definedProperty` 是劫持对象的属性，新增元素需要再次 `definedProperty`。而 `Proxy` 劫持的是整个对象，不需要做特殊处理  

- 使用 `defineProperty` 时，我们修改原来的 `obj` 对象就可以触发拦截，而使用 `proxy`，就必须修改代理对象，即 `Proxy` 的实例才可以触发拦截



## 参考文献
- [https://zh.wikipedia.org/wiki/](https://zh.wikipedia.org/wiki/)
- [https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [https://es6.ruanyifeng.com/#docs/proxy#Proxy-revocable](https://es6.ruanyifeng.com/#docs/proxy#Proxy-revocable) 
- [https://youngzhang08.github.io/](https://youngzhang08.github.io/)