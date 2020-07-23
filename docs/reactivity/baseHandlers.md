### BaseHandlers 

这里照顾一下新同学，科普一下 `handler`，音译为处理器，我们也可以理解为处理器，在[Proxy]()这篇文章中我们了解到 `Proxy(target, handlers)` 接收两个参数，`target` 为目标对象，`handlers` 就是针对我们对 `target` 操作的一系列行为同时做一些处理

### 正文

在 `basehandlers` 中包含了四种 `handler` 

- mutableHandlers 可变处理
- readonlyHandlers 只读处理
- shallowReactiveHandlers 浅观察处理（只观察目标对象的第一层属性）
- shallowReadonlyHandlers 浅观察 && 只读处理 

其中 `readonlyHandlers` `shallowReactiveHandlers` `shallowReadonlyHandlers` 都是 `mutableHandlers` 的变形版本，这里我们主要针对 `mutableHandlers` 展开   

**mutableHandlers**

我们还是选择从定义看起

```js
export const mutableHandlers: ProxyHandler<object> = {
  get, // 用于拦截对象的读取属性操作
  set, // 用于拦截对象的设置属性操作
  deleteProperty, // 用于拦截对象的删除属性操作
  has, // 检查一个对象是否拥有某个属性
  ownKeys // 针对 getOwnPropertyNames,  getOwnPropertySymbols, keys 的代理方法
}
```

get set 代码量稍微多点，我们先来点轻松的

```js
/**
 * @description: 用于拦截对象的删除属性操作 
 * @param {target} 目标对象 
 * @param {key} 键值 
 * @return {Boolean}
 */
function deleteProperty(target: object, key: string | symbol): boolean {
  // hasOwn 的实现放下方了，检查一个对象是否包含当前key
  const hadKey = hasOwn(target, key)
  const oldValue = (target as any)[key]
  // Reflect 作用在于完成目标对象的默认，这里即指删除
  const result = Reflect.deleteProperty(target, key)

  // 如果该值被成功删除则调用 trigger, 
  // trigger 为 effect 里的方法，effect 为 reactive 的核心, 后面会讲到
  if (result && hadKey) {
    trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
  }

  return result
}
/**
 * @description: 检查一个对象是否拥有某个属性 
 * @param {target} 目标对象 
 * @param {key} 键值 
 * @return {Boolean}
 */
function has(target: object, key: string | symbol): boolean {
  const result = Reflect.has(target, key)
  // track 也为 effect 里的方法，effect 为 reactive 的核心, 后面会讲到 
  track(target, TrackOpTypes.HAS, key)
  return result
}

// 返回一个由目标对象自身的属性键组成的数组
function ownKeys(target: object): (string | number | symbol)[] {
  track(target, TrackOpTypes.ITERATE, ITERATE_KEY)
  return Reflect.ownKeys(target)
}

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (
  val: object,
  key: string | symbol
): key is keyof typeof val => hasOwnProperty.call(val, key)
```

接下来再来看`set`  `get`方法

- `set`

```js
const set = /*#__PURE__*/ createSetter()
/**
 * @description: 拦截对象的设置属性操作 
 * @param {shallow} 是否是浅观察 
 */
function createSetter(shallow = false) {
  /**
   * @description: 
   * @param {target} 目标对象
   * @param {key} 设置的属性的名称
   * @param {value} 要改变的属性值 
   * @param {receiver} 如果遇到 setter，receiver则为setter调用时的this值 
   */
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    const oldValue = (target as any)[key]

    // 如果模式不是浅观察
    if (!shallow) {
      value = toRaw(value)
      // 并且目标对象不是数组，旧值是ref，新值不是ref，则直接赋值，注意这里提到ref，这里不展开讲，后面详细讲
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value
        return true
      }
    } else {
      // in shallow mode, objects are set as-is regardless of reactive or not
    }

    // 检查对象是否有这个属性
    const hadKey = hasOwn(target, key)
    // 赋值
    const result = Reflect.set(target, key, value, receiver)
    // don't trigger if target is something up in the prototype chain of original
    if (target === toRaw(receiver)) {
      if (!hadKey) {
        // 如是不存在则trigger ADD
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        // 存在则trigger SET
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return result
  }
}

```

- `get`

```js

const get = /*#__PURE__*/ createGetter()
/**
 * @description: 用于拦截对象的读取属性操作
 * @param {isReadonly} 是否只读 
 * @param {shallow} 是否浅观察  
 */
function createGetter(isReadonly = false, shallow = false) {
  /**
   * @description: 
   * @param {target} 目标对象
   * @param {key} 需要获取的值的键值
   * @param {receiver} 如果遇到 setter，receiver则为setter调用时的this值 
   */
  return function get(target: object, key: string | symbol, receiver: object) {
    //  ReactiveFlags 是在reactive中声明的枚举值，如果key是枚举值则直接返回对应的布尔值
    if (key === ReactiveFlags.isReactive) {
      return !isReadonly
    } else if (key === ReactiveFlags.isReadonly) {
      return isReadonly
    } else if (key === ReactiveFlags.raw) {  // 如果key是raw 则直接返回目标对象
      return target
    }

    const targetIsArray = isArray(target)

    // 如果目标对象是数组并且 key 属于三个方法之一 ['includes', 'indexOf', 'lastIndexOf']，即触发了这三个操作之一
    if (targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }
    const res = Reflect.get(target, key, receiver)

    // 如果 key 是 symbol 内置方法，或者访问的是原型对象，直接返回结果，不收集依赖
    if (isSymbol(key) && builtInSymbols.has(key) || key === '__proto__') {
      return res
    }
    
    // 如果是浅观察并且不为只读则调用 track Get, 并返回结果
    if (shallow) {
      !isReadonly && track(target, TrackOpTypes.GET, key)
      return res
    }

    // 如果get的结果是ref
    if (isRef(res)) {
      // 目标对象为数组并且不为只读调用 track Get, 并返回结果 
      if (targetIsArray) {
        !isReadonly && track(target, TrackOpTypes.GET, key)
        return res
      } else {
        // ref unwrapping, only for Objects, not for Arrays.
        return res.value
      }
    }

    // 目标对象不为只读则调用 track Get
    !isReadonly && track(target, TrackOpTypes.GET, key)

    // 由于 proxy 只能代理一层，所以 target[key] 的值如果是对象，就继续对其进行代理
    return isObject(res)
      ? isReadonly
        ? // need to lazy access readonly and reactive here to avoid
          // circular dependency
          readonly(res)
        : reactive(res)
      : res
  }
}

const arrayInstrumentations: Record<string, Function> = {}
;['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
  arrayInstrumentations[key] = function(...args: any[]): any {
    const arr = toRaw(this) as any
    for (let i = 0, l = (this as any).length; i < l; i++) {
      track(arr, TrackOpTypes.GET, i + '')
    }
    // we run the method using the original args first (which may be reactive)
    const res = arr[key](...args)
    if (res === -1 || res === false) {
      // if that didn't work, run it again using raw values.
      return arr[key](...args.map(toRaw))
    } else {
      return res
    }
  }
})
```

### 结语

到这里 `baseHandlers` 整个就差不多就讲完，我们会发现里面频繁的调用的几个函数

- track 依赖收集
- trigger 触发依赖

这两个函数为 `effect` 里的方法，`effect` 为 `reactive` 的核心, 详情可以点[这里](/reactivity/effect)
