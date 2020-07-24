### computed.spec

> 传入一个 getter 函数，返回一个默认不可手动修改的 ref 对象。

```js
const count = ref(1)
const plusOne = computed(() => count.value + 1)

console.log(plusOne.value) // 2

plusOne.value++ // 错误！
```

> 或者传入一个拥有 get 和 set 函数的对象，创建一个可手动修改的计算状态。
```js
const count = ref(1)
const plusOne = computed({
  get: () => count.value + 1,
  set: (val) => {
    count.value = val - 1
  },
})

plusOne.value = 1
console.log(count.value) // 0
```

更多文档: [https://vue3js.cn/vue-composition-api/#computed](https://vue3js.cn/vue-composition-api/#computed)

### 正文

1. 每次返回的是最新的值
```js
it('should return updated value', () => {
  const value = reactive<{ foo?: number }>({})
  const cValue = computed(() => value.foo)
  expect(cValue.value).toBe(undefined)
  value.foo = 1
  expect(cValue.value).toBe(1)
})
```

2. 计算属性默认是 `lazy` 不会立即执行, 取的值未发生变化不会执行 
```js
it('should compute lazily', () => {
  const value = reactive<{ foo?: number }>({})
  const getter = jest.fn(() => value.foo)
  const cValue = computed(getter)

  // lazy
  expect(getter).not.toHaveBeenCalled()

  expect(cValue.value).toBe(undefined)
  expect(getter).toHaveBeenCalledTimes(1)

  // should not compute again
  cValue.value
  expect(getter).toHaveBeenCalledTimes(1)

  // should not compute until needed
  value.foo = 1
  expect(getter).toHaveBeenCalledTimes(1)

  // now it should compute
  expect(cValue.value).toBe(1)
  expect(getter).toHaveBeenCalledTimes(2)

  // should not compute again
  cValue.value
  expect(getter).toHaveBeenCalledTimes(2)
})
```

3. 如果有`effect`是依赖 `computed` 结果的，当它改变时，`effect` 也会执行 
```js
it('should trigger effect', () => {
  const value = reactive<{ foo?: number }>({})
  const cValue = computed(() => value.foo)
  let dummy
  effect(() => {
    dummy = cValue.value
  })
  expect(dummy).toBe(undefined)
  value.foo = 1
  expect(dummy).toBe(1)
})
```

4. `computed` 之间可以相互依赖 
```js
it('should work when chained', () => {
  const value = reactive({ foo: 0 })
  const c1 = computed(() => value.foo)
  const c2 = computed(() => c1.value + 1)
  expect(c2.value).toBe(1)
  expect(c1.value).toBe(0)
  value.foo++
  expect(c2.value).toBe(2)
  expect(c1.value).toBe(1)
})
```

5. 参照3,4条
```js
it('should trigger effect when chained', () => {
  const value = reactive({ foo: 0 })
  const getter1 = jest.fn(() => value.foo)
  const getter2 = jest.fn(() => {
    return c1.value + 1
  })
  const c1 = computed(getter1)
  const c2 = computed(getter2)

  let dummy
  effect(() => {
    dummy = c2.value
  })
  expect(dummy).toBe(1)
  expect(getter1).toHaveBeenCalledTimes(1)
  expect(getter2).toHaveBeenCalledTimes(1)
  value.foo++
  expect(dummy).toBe(2)
  // should not result in duplicate calls
  expect(getter1).toHaveBeenCalledTimes(2)
  expect(getter2).toHaveBeenCalledTimes(2)
})

it('should trigger effect when chained (mixed invocations)', () => {
  const value = reactive({ foo: 0 })
  const getter1 = jest.fn(() => value.foo)
  const getter2 = jest.fn(() => {
    return c1.value + 1
  })
  const c1 = computed(getter1)
  const c2 = computed(getter2)

  let dummy
  effect(() => {
    dummy = c1.value + c2.value
  })
  expect(dummy).toBe(1)

  expect(getter1).toHaveBeenCalledTimes(1)
  expect(getter2).toHaveBeenCalledTimes(1)
  value.foo++
  expect(dummy).toBe(3)
  // should not result in duplicate calls
  expect(getter1).toHaveBeenCalledTimes(2)
  expect(getter2).toHaveBeenCalledTimes(2)
})
```

6. `computed` 可以 `stop`, `stop` 后不再响应
```js
it('should no longer update when stopped', () => {
  const value = reactive<{ foo?: number }>({})
  const cValue = computed(() => value.foo)
  let dummy
  effect(() => {
    dummy = cValue.value
  })
  expect(dummy).toBe(undefined)
  value.foo = 1
  expect(dummy).toBe(1)
  stop(cValue.effect)
  value.foo = 2
  expect(dummy).toBe(1)
})
```

7. 支持自定义 `setter` , `setter` 会触发 `effect`
```js
it('should support setter', () => {
  const n = ref(1)
  const plusOne = computed({
    get: () => n.value + 1,
    set: val => {
      n.value = val - 1
    }
  })

  expect(plusOne.value).toBe(2)
  n.value++
  expect(plusOne.value).toBe(3)

  plusOne.value = 0
  expect(n.value).toBe(-1)
})

it('should trigger effect w/ setter', () => {
  const n = ref(1)
  const plusOne = computed({
    get: () => n.value + 1,
    set: val => {
      n.value = val - 1
    }
  })

  let dummy
  effect(() => {
    dummy = n.value
  })
  expect(dummy).toBe(1)

  plusOne.value = 0
  expect(dummy).toBe(-1)
})
```

8. 默认是只读对象，修改会抛出错误 
```js
it('should warn if trying to set a readonly computed', () => {
  const n = ref(1)
  const plusOne = computed(() => n.value + 1)
  ;(plusOne as WritableComputedRef<number>).value++ // Type cast to prevent TS from preventing the error

  expect(
    'Write operation failed: computed value is readonly'
  ).toHaveBeenWarnedLast()
})
```