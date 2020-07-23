
### Proxy

> 定义: 用于定义基本操作的自定义行为

由于`proxy`修改的是程序默认形为，就形同于在编程语言层面上做修改，属于元编程(`meta` `programming`)

**元编程（英语：Metaprogramming**，又译超编程，是指某类计算机程序的编写，这类计算机程序编写或者操纵其它程序（或者自身）作为它们的数据，或者在运行时完成部分本应在编译时完成的工作

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
这段程序每执行一次能帮我们生成一个名为program的文件，文件内容为1024行`echo`，如果我们手动来写1024行代码，显然就很低效

元编程优点：与手工编写全部代码相比，程序员可以获得更高的工作效率，或者给与程序更大的灵活度去处理新的情形而无需重新编译

`proxy`音译为代理，在操作目标对象前架设一层代理，将所有本该我们手动编写的程序交由代理来处理，通俗点可以理解为生活的代购，中介服务，所有的行为都不会直接触达目标对象

### 语法
```js
/
* target 要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理
* handler 一个通常以函数作为属性的对象，用来定制拦截行为
*/  
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

### Handler 对象常用的方法

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

#### handler.get

get我们在上面例子已经体验过了，这里再详细介绍一下，方法用于代理目标对象的属性读取操作

授受三个参数 `get(target, propKey, ?receiver) `
- target 目标对象
- propkey 属性名
- receiver Proxy实例本身

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

### 可撤消的Proxy

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

### Proxy的应用场景

`Proxy`的应用范围很广，下方列举几个典型的应用场景
- **校验器**   

想要一个`number`，拿回来的却是`string`，头大不大？下面我们使用`Proxy`实现一个逻辑分离的数据格式验证器，嗯，真香!

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



- **防止对象的内部属性(私有属性)被外部读写**

在日常编写代码的过程中，我们想定义一些私有属性，通常是在团队中进行约定，大家按照约定在变量名之前添加下划线 _ 或者其它格式来表明这是一个私有属性，但我们不能保证他能真私‘私有化’，下方示例使用Proxy轻松实现私有属性拦截

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
    return Reflect.get(target, propkey, value, proxy)
  }
})

proxy.name // vuejs
proxy._id // Uncaught Error: _id is restricted
proxy._id = '1025' // Uncaught Error: _id is restricted
```

`Proxy`的使用场景还有很多很多，这里也不再一一列举，只要你需要在某一个动作的生命周期内做一些特定的处理，那么`Proxy`都是适合你的

### Proxy 与 Object.defineProperty
在 `Proxy` 出现之前，`JavaScript` 中就提供过 `Object.defineProperty`，允许对对象的 `getter/setter` 进行拦截  

大家熟悉的Vue框架双向绑定的实现也由`defineProperty`重构为`Proxy`，那么两者的区别在究竟在哪里呢？

请看下面这张图，图中所示的都是`defineProperty`现存的问题，而`Proxy`均已完美支持

 ![image.png](https://static.vue-js.com/5289d760-c675-11ea-ae44-f5d67be454e7.png)

### 兼容
除了IE，其它浏览器最新版本均已支持

![image.png](https://static.vue-js.com/9a145b00-c675-11ea-ae44-f5d67be454e7.png)

参考:
- [https://zh.wikipedia.org/wiki/](https://zh.wikipedia.org/wiki/)
- [https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [https://es6.ruanyifeng.com/#docs/proxy#Proxy-revocable](https://es6.ruanyifeng.com/#docs/proxy#Proxy-revocable) 
- [https://juejin.im/post/5e78d908f265da57340267f7#heading-2](https://juejin.im/post/5e78d908f265da57340267f7#heading-2)