### effect.spec

文档直通车: [https://vue3js.cn/vue-composition-api/#reactive](https://vue3js.cn/vue-composition-api/#reactive)


1. 定义一个对象original，reactive后返回observed，得到结果两个对象的引用不能相同，observed是可响应的，original不可响应，observed得值跟original相同，从这几个特点来看，我们很容易联想到proxy，对proxy还不熟悉同学可以点[proxy](proxy)

```js
  test('Object', () => {
    const original = { foo: 1 }
    const observed = reactive(original)
    expect(observed).not.toBe(original)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(original)).toBe(false)
    // get
    expect(observed.foo).toBe(1)
    // has
    expect('foo' in observed).toBe(true)
    // ownKeys
    expect(Object.keys(observed)).toEqual(['foo'])
  })
```

2. 原型

```js
  test('proto', () => {
    const obj = {}
    const reactiveObj = reactive(obj)
    expect(isReactive(reactiveObj)).toBe(true)
    // read prop of reactiveObject will cause reactiveObj[prop] to be reactive
    // @ts-ignore
    const prototype = reactiveObj['__proto__']
    const otherObj = { data: ['a'] }
    expect(isReactive(otherObj)).toBe(false)
    const reactiveOther = reactive(otherObj)
    expect(isReactive(reactiveOther)).toBe(true)
    expect(reactiveOther.data[0]).toBe('a')
  })
```

3. 定义一个嵌套对象, reactive后嵌套的属性也可以响应 
```js
  test('nested reactives', () => {
    const original = {
      nested: {
        foo: 1
      },
      array: [{ bar: 2 }]
    }
    const observed = reactive(original)
    expect(isReactive(observed.nested)).toBe(true)
    expect(isReactive(observed.array)).toBe(true)
    expect(isReactive(observed.array[0])).toBe(true)
  })
```

4. 观察的对象的变更会同步到原始对象 

```js
  test('observed value should proxy mutations to original (Object)', () => {
    const original: any = { foo: 1 }
    const observed = reactive(original)
    // set
    observed.bar = 1
    expect(observed.bar).toBe(1)
    expect(original.bar).toBe(1)
    // delete
    delete observed.foo
    expect('foo' in observed).toBe(false)
    expect('foo' in original).toBe(false)
  })
```

5. 给observed设置一个未被观察的值可以响应，看过vue2.x的同学应该都清楚，这个在vue2.x中是不可响应的

```js  
test('setting a property with an unobserved value should wrap with reactive', () => {
  const observed = reactive<{ foo?: object }>({})
  const raw = {}
  observed.foo = raw
  expect(observed.foo).not.toBe(raw)
  expect(isReactive(observed.foo)).toBe(true)
})
```

6. 观察一个已经被observed的observe应该直接返回该observe

```js
test('observing already observed value should return same Proxy', () => {
  const original = { foo: 1 }
  const observed = reactive(original)
  const observed2 = reactive(observed)
  expect(observed2).toBe(observed)
})
```

7. 重复观察相同的原始对象直接返回相同的proxy对象 
```js 
test('observing the same value multiple times should return same Proxy', () => {
  const original = { foo: 1 }
  const observed = reactive(original)
  const observed2 = reactive(original)
  expect(observed2).toBe(observed)
})
```

8. 不会污染原始对象
```js 
test('should not pollute original object with Proxies', () => {
  const original: any = { foo: 1 }
  const original2 = { bar: 2 }
  const observed = reactive(original)
  const observed2 = reactive(original2)
  observed.bar = observed2
  expect(observed.bar).toBe(observed2)
  expect(original.bar).toBe(original2)
})
```

9. 通过`toRaw api`可以返回被观察对象的原始对象

```js
test('unwrap', () => {
  const original = { foo: 1 }
  const observed = reactive(original)
  expect(toRaw(observed)).toBe(original)
  expect(toRaw(original)).toBe(original)
})
```

10. 

```js  
test('should not unwrap Ref<T>', () => {
  const observedNumberRef = reactive(ref(1))
  const observedObjectRef = reactive(ref({ foo: 1 }))

  expect(isRef(observedNumberRef)).toBe(true)
  expect(isRef(observedObjectRef)).toBe(true)
})
```

11.  

```js 
test('should unwrap computed refs', () => {
  // readonly
  const a = computed(() => 1)
  // writable
  const b = computed({
    get: () => 1,
    set: () => {}
  })
  const obj = reactive({ a, b })
  // check type
  obj.a + 1
  obj.b + 1
  expect(typeof obj.a).toBe(`number`)
  expect(typeof obj.b).toBe(`number`)
})
```

12. 不能直接被观察的类型 
```js 
test('non-observable values', () => {
  const assertValue = (value: any) => {
    reactive(value)
    expect(
      `value cannot be made reactive: ${String(value)}`
    ).toHaveBeenWarnedLast()
  }

  // number
  assertValue(1)
  // string
  assertValue('foo')
  // boolean
  assertValue(false)
  // null
  assertValue(null)
  // undefined
  assertValue(undefined)
  // symbol
  const s = Symbol()
  assertValue(s)

  // built-ins should work and return same value
  const p = Promise.resolve()
  expect(reactive(p)).toBe(p)
  const r = new RegExp('')
  expect(reactive(r)).toBe(r)
  const d = new Date()
  expect(reactive(d)).toBe(d)
})
```

13. `markRaw` 可以给将要被观察的数据打上标记，标记原始数据不可被观察 

```js
test('markRaw', () => {
  const obj = reactive({
    foo: { a: 1 },
    bar: markRaw({ b: 2 })
  })
  expect(isReactive(obj.foo)).toBe(true)
  expect(isReactive(obj.bar)).toBe(false)
})
```

14. 被freeze的数据不可观察 
```js
test('should not observe frozen objects', () => {
  const obj = reactive({
    foo: Object.freeze({ a: 1 })
  })
  expect(isReactive(obj.foo)).toBe(false)
})
```

### shallowReactive

> 只为某个对象的私有（第一层）属性创建浅层的响应式代理，不会对“属性的属性”做深层次、递归地响应式代理
1. 属性的属性不会被观察 
```js 
test('should not make non-reactive properties reactive', () => {
  const props = shallowReactive({ n: { foo: 1 } })
  expect(isReactive(props.n)).toBe(false)
})
```

2. `shallowReactive`后的`proxy`的属性再次被`reactive`可以被观察 
```js 
test('should keep reactive properties reactive', () => {
  const props: any = shallowReactive({ n: reactive({ foo: 1 }) })
  props.n = reactive({ foo: 2 })
  expect(isReactive(props.n)).toBe(true)
})
```

3. `iterating` 不能被观察 
```js
test('should not observe when iterating', () => {
  const shallowSet = shallowReactive(new Set())
  const a = {}
  shallowSet.add(a)

  const spreadA = [...shallowSet][0]
  expect(isReactive(spreadA)).toBe(false)
})
```

4. `get` 到的某个属性不能被观察

```js 
test('should not get reactive entry', () => {
  const shallowMap = shallowReactive(new Map())
  const a = {}
  const key = 'a'

  shallowMap.set(key, a)

  expect(isReactive(shallowMap.get(key))).toBe(false)
})
```

5. `foreach` 不能被观察 
```js
test('should not get reactive on foreach', () => {
  const shallowSet = shallowReactive(new Set())
  const a = {}
  shallowSet.add(a)

  shallowSet.forEach(x => expect(isReactive(x)).toBe(false))
})
```