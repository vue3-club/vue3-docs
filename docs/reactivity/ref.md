### ref

> 接受一个参数值并返回一个响应式且可改变的 ref 对象。ref 对象拥有一个指向内部值的单一属性 .value。

```js
const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```

更多文档: [https://vue3js.cn/vue-composition-api/#reactive](https://vue3js.cn/vue-composition-api/#reactive)

### 正文

`ref` 跟 `reactive` 都是响应系统的核心方法，作为整个系统的入口  

可以将 `ref` 看成 `reactive` 的一个变形版本，这是由于 `reactive` 内部采用 [Proxy](/es6/) 来实现，而  `Proxy` 只接受对象作为入参，这才有了 `ref` 来解决值类型的数据响应，如果传入 `ref` 的是一个对象，内部也会调用 `reactive` 方法进行深层响应转换 

### Ref 是如何创建的

我们还是先从定义抓起，`ref` 接收一个可选的 `unknown` 做为入参，接着直接调用 `createRef`

`createRef` 先判断 `value` 是否已经是一个 `ref`, 如果是则直接返回，如果不是接着判断是不是浅观察，如果是浅观察直接构造一个 `ref` 返回，不是则将 `rawValue` 转换成 `reactive` 再构造一个 `ref` 返回 

```js
export function ref(value?: unknown) {
  return createRef(value)
}

/**
 * @description: 
 * @param {rawValue} 原始值 
 * @param {shallow} 是否是浅观察 
 */
function createRef(rawValue: unknown, shallow = false) {
  // 如果已经是ref直接返回
  if (isRef(rawValue)) {
    return rawValue
  }

  // 如果是浅观察直接观察，不是则将 rawValue 转换成 reactive ,
  // reactive 的定义在下方 
  let value = shallow ? rawValue : convert(rawValue)

  // ref 的结构
  const r = {
    // ref 标识
    __v_isRef: true,
    get value() {
      // 依赖收集
      track(r, TrackOpTypes.GET, 'value')
      return value
    },
    set value(newVal) {
      if (hasChanged(toRaw(newVal), rawValue)) {
        rawValue = newVal
        value = shallow ? newVal : convert(newVal)
        // 触发依赖
        trigger(
          r,
          TriggerOpTypes.SET,
          'value',
          __DEV__ ? { newValue: newVal } : void 0
        )
      }
    }
  }
  return r
}

// 如是是对象则调用 reactive, 否则直接返回 
const convert = <T extends unknown>(val: T): T =>
  isObject(val) ? reactive(val) : val
```