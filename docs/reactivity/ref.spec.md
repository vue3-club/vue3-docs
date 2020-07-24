### ref.spec

> 接受一个参数值并返回一个响应式且可改变的 ref 对象。ref 对象拥有一个指向内部值的单一属性 .value。

```js
const count = ref(0)
console.log(count.value) // 0

count.value++
console.log(count.value) // 1
```

如果传入 `ref` 的是一个对象，将调用 `reactive` 方法进行深层响应转换

更多文档: [https://vue3js.cn/vue-composition-api/#reactive](https://vue3js.cn/vue-composition-api/#reactive)

### 正文

1. 返回值是一个带有 `value` 对象, 并且是可以响应的 
```js
it('should hold a value', () => {
  const a = ref(1)
  expect(a.value).toBe(1)
  a.value = 2
  expect(a.value).toBe(2)
})

it('should be reactive', () => {
  const a = ref(1)
  let dummy
  let calls = 0
  effect(() => {
    calls++
    dummy = a.value
  })
  expect(calls).toBe(1)
  expect(dummy).toBe(1)
  a.value = 2
  expect(calls).toBe(2)
  expect(dummy).toBe(2)
  // same value should not trigger
  a.value = 2
  expect(calls).toBe(2)
  expect(dummy).toBe(2)
})

```

2. 嵌套的属性可以响应

```js
it('should make nested properties reactive', () => {
  const a = ref({
    count: 1
  })
  let dummy
  effect(() => {
    dummy = a.value.count
  })
  expect(dummy).toBe(1)
  a.value.count = 2
  expect(dummy).toBe(2)
})
```

3. 传递空值也可以响应
```js
it('should work without initial value', () => {
  const a = ref()
  let dummy
  effect(() => {
    dummy = a.value
  })
  expect(dummy).toBe(undefined)
  a.value = 2
  expect(dummy).toBe(2)
})
```

4. `ref` 在 `reactive` 中会被转换成原始值，而非 `ref`
```js
it('should work like a normal property when nested in a reactive object', () => {
  const a = ref(1)
  const obj = reactive({
    a,
    b: {
      c: a
    }
  })

  let dummy1: number
  let dummy2: number

  effect(() => {
    dummy1 = obj.a
    dummy2 = obj.b.c
  })

  const assertDummiesEqualTo = (val: number) =>
    [dummy1, dummy2].forEach(dummy => expect(dummy).toBe(val))

  assertDummiesEqualTo(1)
  a.value++
  assertDummiesEqualTo(2)
  obj.a++
  assertDummiesEqualTo(3)
  obj.b.c++
  assertDummiesEqualTo(4)
})
```

5. `ref` 嵌套时会自动 unwrap, 访问 b.value 相当于 b.value.value
```js
it('should unwrap nested ref in types', () => {
  const a = ref(0)
  const b = ref(a)

  expect(typeof (b.value + 1)).toBe('number')
})

it('should unwrap nested values in types', () => {
  const a = {
    b: ref(0)
  }

  const c = ref(a)

  expect(typeof (c.value.b + 1)).toBe('number')
})

it('should NOT unwrap ref types nested inside arrays', () => {
  const arr = ref([1, ref(1)]).value
  ;(arr[0] as number)++
  ;(arr[1] as Ref<number>).value++

  const arr2 = ref([1, new Map<string, any>(), ref('1')]).value
  const value = arr2[0]
  if (isRef(value)) {
    value + 'foo'
  } else if (typeof value === 'number') {
    value + 1
  } else {
    // should narrow down to Map type
    // and not contain any Ref type
    value.has('foo')
  }
})
```

6. 会检测传递 `ref` 的值类型 ，如果是引用类型就 `reactive` ，不是直接返回结果 
```js
it('should keep tuple types', () => {
  const tuple: [number, string, { a: number }, () => number, Ref<number>] = [
    0,
    '1',
    { a: 1 },
    () => 0,
    ref(0)
  ]
  const tupleRef = ref(tuple)

  tupleRef.value[0]++
  expect(tupleRef.value[0]).toBe(1)
  tupleRef.value[1] += '1'
  expect(tupleRef.value[1]).toBe('11')
  tupleRef.value[2].a++
  expect(tupleRef.value[2].a).toBe(2)
  expect(tupleRef.value[3]()).toBe(0)
  tupleRef.value[4].value++
  expect(tupleRef.value[4].value).toBe(1)
})

it('should keep symbols', () => {
  const customSymbol = Symbol()
  const obj = {
    [Symbol.asyncIterator]: { a: 1 },
    [Symbol.unscopables]: { b: '1' },
    [customSymbol]: { c: [1, 2, 3] }
  }

  const objRef = ref(obj)

  expect(objRef.value[Symbol.asyncIterator]).toBe(obj[Symbol.asyncIterator])
  expect(objRef.value[Symbol.unscopables]).toBe(obj[Symbol.unscopables])
  expect(objRef.value[customSymbol]).toStrictEqual(obj[customSymbol])
})
```

7. `unref` 可以将 `ref` 还原成原始值
```js
test('unref', () => {
  expect(unref(1)).toBe(1)
  expect(unref(ref(1))).toBe(1)
})
```

8. `shallowRef` 不会发生响应，替换掉整个对象会触发响应 
```js
test('shallowRef', () => {
  const sref = shallowRef({ a: 1 })
  expect(isReactive(sref.value)).toBe(false)

  let dummy
  effect(() => {
    dummy = sref.value.a
  })
  expect(dummy).toBe(1)

  sref.value = { a: 2 }
  expect(isReactive(sref.value)).toBe(false)
  expect(dummy).toBe(2)
})



```

9. `shallowRef` 可以强制触发更新
```js
test('shallowRef force trigger', () => {
  const sref = shallowRef({ a: 1 })
  let dummy
  effect(() => {
    dummy = sref.value.a
  })
  expect(dummy).toBe(1)

  sref.value.a = 2
  expect(dummy).toBe(1) // should not trigger yet

  // force trigger
  triggerRef(sref)
  expect(dummy).toBe(2)
})
```

10. `isRef` 可以检测各种类型是否是 `ref`
```js
test('isRef', () => {
  expect(isRef(ref(1))).toBe(true)
  expect(isRef(computed(() => 1))).toBe(true)

  expect(isRef(0)).toBe(false)
  expect(isRef(1)).toBe(false)
  // an object that looks like a ref isn't necessarily a ref
  expect(isRef({ value: 0 })).toBe(false)
})
```

11. 支持自定义 `ref`, 自由控制 `track`, `trigger` 时间 
```js
test('customRef', () => {
  let value = 1
  let _trigger: () => void

  const custom = customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue: number) {
      value = newValue
      _trigger = trigger
    }
  }))

  expect(isRef(custom)).toBe(true)

  let dummy
  effect(() => {
    dummy = custom.value
  })
  expect(dummy).toBe(1)

  custom.value = 2
  // should not trigger yet
  expect(dummy).toBe(1)

  _trigger!()
  expect(dummy).toBe(2)
})
```