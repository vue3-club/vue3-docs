### effect.spec

`effect` 作为 `reactive` 的核心，重要程序不可言喻，主要负责监听响应式数据的变化，触发监听函数的执行逻辑，两句话就能描述清楚的概念，单测文件就长达700多行，下面让我们一起来看详细用例 

文档直通车: [https://vue3js.cn/vue-composition-api/#reactive](https://vue3js.cn/vue-composition-api/#reactive)

1. 传递给`effect`的方法，会立即执行一次 

```js
it('should run the passed function once (wrapped by a effect)', () => {
  const fnSpy = jest.fn(() => {})
  effect(fnSpy)
  expect(fnSpy).toHaveBeenCalledTimes(1)
})
```

2. 在 `effect` 执行将 `observe` 对基本类型赋值，`observe` 进行改变时，将反应到基本类型上
```js
it('should observe basic properties', () => {
  let dummy
  const counter = reactive({ num: 0 })
  effect(() => (dummy = counter.num))

  expect(dummy).toBe(0)
  counter.num = 7
  expect(dummy).toBe(7)
})
```

3. 同上，不过我们从这个单测就能看出来`effect` 中是有 `cache` 存在的
```js
it('should observe multiple properties', () => {
  let dummy
  const counter = reactive({ num1: 0, num2: 0 })
  effect(() => (dummy = counter.num1 + counter.num1 + counter.num2))

  expect(dummy).toBe(0)
  counter.num1 = counter.num2 = 7
  expect(dummy).toBe(21)
})
```

4. 在多个 `effect` 中处理 `observe`，当 `observe` 发生改变时，将同步到多个 `effect`
```js
it('should handle multiple effects', () => {
  let dummy1, dummy2
  const counter = reactive({ num: 0 })
  effect(() => (dummy1 = counter.num))
  effect(() => (dummy2 = counter.num))

  expect(dummy1).toBe(0)
  expect(dummy2).toBe(0)
  counter.num++
  expect(dummy1).toBe(1)
  expect(dummy2).toBe(1)
})
```

5. 嵌套的 `observe` 做出改变时，也会产生响应
```js
it('should observe nested properties', () => {
  let dummy
  const counter = reactive({ nested: { num: 0 } })
  effect(() => (dummy = counter.nested.num))

  expect(dummy).toBe(0)
  counter.nested.num = 8
  expect(dummy).toBe(8)
})
```

6. 在 `effect` 执行将 `observe` 对基本类型赋值，`observe` 进行删除操作时，将反应到基本类型上 
```js
it('should observe delete operations', () => {
  let dummy
  const obj = reactive({ prop: 'value' })
  effect(() => (dummy = obj.prop))

  expect(dummy).toBe('value')
  delete obj.prop
  expect(dummy).toBe(undefined)
})
```

7. 在 `effect` 执行将 `observe` `in` 操作，`observe` 进行删除操作时，将反应到基本类型上
```js
it('should observe has operations', () => {
  let dummy
  const obj = reactive<{ prop: string | number }>({ prop: 'value' })
  effect(() => (dummy = 'prop' in obj))

  expect(dummy).toBe(true)
  delete obj.prop
  expect(dummy).toBe(false)
  obj.prop = 12
  expect(dummy).toBe(true)
})
```

8. 对 `prototype` 的操作也能响应
```js
it('should observe properties on the prototype chain', () => {
  let dummy
  const counter = reactive({ num: 0 })
  const parentCounter = reactive({ num: 2 })
  Object.setPrototypeOf(counter, parentCounter)
  effect(() => (dummy = counter.num))

  expect(dummy).toBe(0)
  delete counter.num
  expect(dummy).toBe(2)
  parentCounter.num = 4
  expect(dummy).toBe(4)
  counter.num = 3
  expect(dummy).toBe(3)
})
```

9.
```js
it('should observe inherited property accessors', () => {
  let dummy, parentDummy, hiddenValue: any
  const obj = reactive<{ prop?: number }>({})
  const parent = reactive({
    set prop(value) {
      hiddenValue = value
    },
    get prop() {
      return hiddenValue
    }
  })
  Object.setPrototypeOf(obj, parent)
  effect(() => (dummy = obj.prop))
  effect(() => (parentDummy = parent.prop))

  expect(dummy).toBe(undefined)
  expect(parentDummy).toBe(undefined)
  obj.prop = 4
  expect(dummy).toBe(4)
  // this doesn't work, should it?
  // expect(parentDummy).toBe(4)
  parent.prop = 2
  expect(dummy).toBe(2)
  expect(parentDummy).toBe(2)
})
```

10. 对 `function` 的操作也能响应
```js
it('should observe function call chains', () => {
  let dummy
  const counter = reactive({ num: 0 })
  effect(() => (dummy = getNum()))

  function getNum() {
    return counter.num
  }

  expect(dummy).toBe(0)
  counter.num = 2
  expect(dummy).toBe(2)
})
```

11. 对 `iteration` 响应
```js
it('should observe iteration', () => {
  let dummy
  const list = reactive(['Hello'])
  effect(() => (dummy = list.join(' ')))

  expect(dummy).toBe('Hello')
  list.push('World!')
  expect(dummy).toBe('Hello World!')
  list.shift()
  expect(dummy).toBe('World!')
})
```

12. 数组隐式的变化可以响应
```js
it('should observe implicit array length changes', () => {
  let dummy
  const list = reactive(['Hello'])
  effect(() => (dummy = list.join(' ')))

  expect(dummy).toBe('Hello')
  list[1] = 'World!'
  expect(dummy).toBe('Hello World!')
  list[3] = 'Hello!'
  expect(dummy).toBe('Hello World!  Hello!')
})

it('should observe sparse array mutations', () => {
  let dummy
  const list = reactive<string[]>([])
  list[1] = 'World!'
  effect(() => (dummy = list.join(' ')))

  expect(dummy).toBe(' World!')
  list[0] = 'Hello'
  expect(dummy).toBe('Hello World!')
  list.pop()
  expect(dummy).toBe('Hello')
})
```

13. 计算操作可以被响应
```js
it('should observe enumeration', () => {
  let dummy = 0
  const numbers = reactive<Record<string, number>>({ num1: 3 })
  effect(() => {
    dummy = 0
    for (let key in numbers) {
      dummy += numbers[key]
    }
  })

  expect(dummy).toBe(3)
  numbers.num2 = 4
  expect(dummy).toBe(7)
  delete numbers.num1
  expect(dummy).toBe(4)
})
```

14. `Symbol` 类型可以响应
```js
it('should observe symbol keyed properties', () => {
  const key = Symbol('symbol keyed prop')
  let dummy, hasDummy
  const obj = reactive({ [key]: 'value' })
  effect(() => (dummy = obj[key]))
  effect(() => (hasDummy = key in obj))

  expect(dummy).toBe('value')
  expect(hasDummy).toBe(true)
  obj[key] = 'newValue'
  expect(dummy).toBe('newValue')
  delete obj[key]
  expect(dummy).toBe(undefined)
  expect(hasDummy).toBe(false)
})
```

15. `well-known symbol` 不能被观察 
```js
it('should not observe well-known symbol keyed properties', () => {
  const key = Symbol.isConcatSpreadable
  let dummy
  const array: any = reactive([])
  effect(() => (dummy = array[key]))

  expect(array[key]).toBe(undefined)
  expect(dummy).toBe(undefined)
  array[key] = true
  expect(array[key]).toBe(true)
  expect(dummy).toBe(undefined)
})
```

16. `function` 的变更可以响应 
```js
it('should observe function valued properties', () => {
  const oldFunc = () => {}
  const newFunc = () => {}

  let dummy
  const obj = reactive({ func: oldFunc })
  effect(() => (dummy = obj.func))

  expect(dummy).toBe(oldFunc)
  obj.func = newFunc
  expect(dummy).toBe(newFunc)
})
```

17. `this` 会被响应
```js
it('should observe chained getters relying on this', () => {
  const obj = reactive({
    a: 1,
    get b() {
      return this.a
    }
  })

  let dummy
  effect(() => (dummy = obj.b))
  expect(dummy).toBe(1)
  obj.a++
  expect(dummy).toBe(2)
})

it('should observe methods relying on this', () => {
  const obj = reactive({
    a: 1,
    b() {
      return this.a
    }
  })

  let dummy
  effect(() => (dummy = obj.b()))
  expect(dummy).toBe(1)
  obj.a++
  expect(dummy).toBe(2)
})
```

18.  
```js
it('should not observe set operations without a value change', () => {
  let hasDummy, getDummy
  const obj = reactive({ prop: 'value' })

  const getSpy = jest.fn(() => (getDummy = obj.prop))
  const hasSpy = jest.fn(() => (hasDummy = 'prop' in obj))
  effect(getSpy)
  effect(hasSpy)

  expect(getDummy).toBe('value')
  expect(hasDummy).toBe(true)
  obj.prop = 'value'
  expect(getSpy).toHaveBeenCalledTimes(1)
  expect(hasSpy).toHaveBeenCalledTimes(1)
  expect(getDummy).toBe('value')
  expect(hasDummy).toBe(true)
})
```

19. 改变原始对象不产生响应
```js 
it('should not observe raw mutations', () => {
  let dummy
  const obj = reactive<{ prop?: string }>({})
  effect(() => (dummy = toRaw(obj).prop))

  expect(dummy).toBe(undefined)
  obj.prop = 'value'
  expect(dummy).toBe(undefined)
})

it('should not be triggered by raw mutations', () => {
  let dummy
  const obj = reactive<{ prop?: string }>({})
  effect(() => (dummy = obj.prop))

  expect(dummy).toBe(undefined)
  toRaw(obj).prop = 'value'
  expect(dummy).toBe(undefined)
})

it('should not be triggered by inherited raw setters', () => {
  let dummy, parentDummy, hiddenValue: any
  const obj = reactive<{ prop?: number }>({})
  const parent = reactive({
    set prop(value) {
      hiddenValue = value
    },
    get prop() {
      return hiddenValue
    }
  })
  Object.setPrototypeOf(obj, parent)
  effect(() => (dummy = obj.prop))
  effect(() => (parentDummy = parent.prop))

  expect(dummy).toBe(undefined)
  expect(parentDummy).toBe(undefined)
  toRaw(obj).prop = 4
  expect(dummy).toBe(undefined)
  expect(parentDummy).toBe(undefined)
})
```

20. 可以避免隐性递归导致的无限循环
```js 
it('should avoid implicit infinite recursive loops with itself', () => {
  const counter = reactive({ num: 0 })

  const counterSpy = jest.fn(() => counter.num++)
  effect(counterSpy)
  expect(counter.num).toBe(1)
  expect(counterSpy).toHaveBeenCalledTimes(1)
  counter.num = 4
  expect(counter.num).toBe(5)
  expect(counterSpy).toHaveBeenCalledTimes(2)
})

it('should avoid infinite loops with other effects', () => {
  const nums = reactive({ num1: 0, num2: 1 })

  const spy1 = jest.fn(() => (nums.num1 = nums.num2))
  const spy2 = jest.fn(() => (nums.num2 = nums.num1))
  effect(spy1)
  effect(spy2)
  expect(nums.num1).toBe(1)
  expect(nums.num2).toBe(1)
  expect(spy1).toHaveBeenCalledTimes(1)
  expect(spy2).toHaveBeenCalledTimes(1)
  nums.num2 = 4
  expect(nums.num1).toBe(4)
  expect(nums.num2).toBe(4)
  expect(spy1).toHaveBeenCalledTimes(2)
  expect(spy2).toHaveBeenCalledTimes(2)
  nums.num1 = 10
  expect(nums.num1).toBe(10)
  expect(nums.num2).toBe(10)
  expect(spy1).toHaveBeenCalledTimes(3)
  expect(spy2).toHaveBeenCalledTimes(3)
})
```

21. 可以显式递归调用
```js
it('should allow explicitly recursive raw function loops', () => {
  const counter = reactive({ num: 0 })
  const numSpy = jest.fn(() => {
    counter.num++
    if (counter.num < 10) {
      numSpy()
    }
  })
  effect(numSpy)
  expect(counter.num).toEqual(10)
  expect(numSpy).toHaveBeenCalledTimes(10)
})
```

22. 每次返回的都是新函数
```js
it('should return a new reactive version of the function', () => {
  function greet() {
    return 'Hello World'
  }
  const effect1 = effect(greet)
  const effect2 = effect(greet)
  expect(typeof effect1).toBe('function')
  expect(typeof effect2).toBe('function')
  expect(effect1).not.toBe(greet)
  expect(effect1).not.toBe(effect2)
})
```

23. 当结果未发生变动时不做处理，发生改变时应该产生响应
```js
it('should discover new branches while running automatically', () => {
  let dummy
  const obj = reactive({ prop: 'value', run: false })

  const conditionalSpy = jest.fn(() => {
    dummy = obj.run ? obj.prop : 'other'
  })
  effect(conditionalSpy)

  expect(dummy).toBe('other')
  expect(conditionalSpy).toHaveBeenCalledTimes(1)
  obj.prop = 'Hi'
  expect(dummy).toBe('other')
  expect(conditionalSpy).toHaveBeenCalledTimes(1)
  obj.run = true
  expect(dummy).toBe('Hi')
  expect(conditionalSpy).toHaveBeenCalledTimes(2)
  obj.prop = 'World'
  expect(dummy).toBe('World')
  expect(conditionalSpy).toHaveBeenCalledTimes(3)
})

it('should discover new branches when running manually', () => {
  let dummy
  let run = false
  const obj = reactive({ prop: 'value' })
  const runner = effect(() => {
    dummy = run ? obj.prop : 'other'
  })

  expect(dummy).toBe('other')
  runner()
  expect(dummy).toBe('other')
  run = true
  runner()
  expect(dummy).toBe('value')
  obj.prop = 'World'
  expect(dummy).toBe('World')
})

it('should not be triggered by mutating a property, which is used in an inactive branch', () => {
  let dummy
  const obj = reactive({ prop: 'value', run: true })

  const conditionalSpy = jest.fn(() => {
    dummy = obj.run ? obj.prop : 'other'
  })
  effect(conditionalSpy)

  expect(dummy).toBe('value')
  expect(conditionalSpy).toHaveBeenCalledTimes(1)
  obj.run = false
  expect(dummy).toBe('other')
  expect(conditionalSpy).toHaveBeenCalledTimes(2)
  obj.prop = 'value2'
  expect(dummy).toBe('other')
  expect(conditionalSpy).toHaveBeenCalledTimes(2)
})
```

24. 每次返回的是一个新函数，原始对象是同一个
```js
it('should not double wrap if the passed function is a effect', () => {
  const runner = effect(() => {})
  const otherRunner = effect(runner)
  expect(runner).not.toBe(otherRunner)
  expect(runner.raw).toBe(otherRunner.raw)
})
```

25. 单一的改变只会执行一次
```js
it('should not run multiple times for a single mutation', () => {
  let dummy
  const obj = reactive<Record<string, number>>({})
  const fnSpy = jest.fn(() => {
    for (const key in obj) {
      dummy = obj[key]
    }
    dummy = obj.prop
  })
  effect(fnSpy)

  expect(fnSpy).toHaveBeenCalledTimes(1)
  obj.prop = 16
  expect(dummy).toBe(16)
  expect(fnSpy).toHaveBeenCalledTimes(2)
})
```

26. `effect` 可以嵌套 
```js
it('should allow nested effects', () => {
  const nums = reactive({ num1: 0, num2: 1, num3: 2 })
  const dummy: any = {}

  const childSpy = jest.fn(() => (dummy.num1 = nums.num1))
  const childeffect = effect(childSpy)
  const parentSpy = jest.fn(() => {
    dummy.num2 = nums.num2
    childeffect()
    dummy.num3 = nums.num3
  })
  effect(parentSpy)

  expect(dummy).toEqual({ num1: 0, num2: 1, num3: 2 })
  expect(parentSpy).toHaveBeenCalledTimes(1)
  expect(childSpy).toHaveBeenCalledTimes(2)
  // this should only call the childeffect
  nums.num1 = 4
  expect(dummy).toEqual({ num1: 4, num2: 1, num3: 2 })
  expect(parentSpy).toHaveBeenCalledTimes(1)
  expect(childSpy).toHaveBeenCalledTimes(3)
  // this calls the parenteffect, which calls the childeffect once
  nums.num2 = 10
  expect(dummy).toEqual({ num1: 4, num2: 10, num3: 2 })
  expect(parentSpy).toHaveBeenCalledTimes(2)
  expect(childSpy).toHaveBeenCalledTimes(4)
  // this calls the parenteffect, which calls the childeffect once
  nums.num3 = 7
  expect(dummy).toEqual({ num1: 4, num2: 10, num3: 7 })
  expect(parentSpy).toHaveBeenCalledTimes(3)
  expect(childSpy).toHaveBeenCalledTimes(5)
})
```

27. `JSON` 方法可以响应 
```js  
it('should observe json methods', () => {
  let dummy = <Record<string, number>>{}
  const obj = reactive<Record<string, number>>({})
  effect(() => {
    dummy = JSON.parse(JSON.stringify(obj))
  })
  obj.a = 1
  expect(dummy.a).toBe(1)
})
```

28. `Class` 方法调用可以观察
```js
it('should observe class method invocations', () => {
  class Model {
    count: number
    constructor() {
      this.count = 0
    }
    inc() {
      this.count++
    }
  }
  const model = reactive(new Model())
  let dummy
  effect(() => {
    dummy = model.count
  })
  expect(dummy).toBe(0)
  model.inc()
  expect(dummy).toBe(1)
})
```

29. 传入参数 `lazy`, 不会立即执行, 支持 `lazy` 调用 
```js
it('lazy', () => {
  const obj = reactive({ foo: 1 })
  let dummy
  const runner = effect(() => (dummy = obj.foo), { lazy: true })
  expect(dummy).toBe(undefined)

  expect(runner()).toBe(1)
  expect(dummy).toBe(1)
  obj.foo = 2
  expect(dummy).toBe(2)
})
```

30. 传入参数 `scheduler`, 支持自定义调度
```js
it('scheduler', () => {
  let runner: any, dummy
  const scheduler = jest.fn(_runner => {
    runner = _runner
  })
  const obj = reactive({ foo: 1 })
  effect(
    () => {
      dummy = obj.foo
    },
    { scheduler }
  )
  expect(scheduler).not.toHaveBeenCalled()
  expect(dummy).toBe(1)
  // should be called on first trigger
  obj.foo++
  expect(scheduler).toHaveBeenCalledTimes(1)
  // should not run yet
  expect(dummy).toBe(1)
  // manually run
  runner()
  // should have run
  expect(dummy).toBe(2)
})
```

31. `observer` 的每次响应都会被 `track`
```js
it('events: onTrack', () => {
  let events: DebuggerEvent[] = []
  let dummy
  const onTrack = jest.fn((e: DebuggerEvent) => {
    events.push(e)
  })
  const obj = reactive({ foo: 1, bar: 2 })
  const runner = effect(
    () => {
      dummy = obj.foo
      dummy = 'bar' in obj
      dummy = Object.keys(obj)
    },
    { onTrack }
  )
  expect(dummy).toEqual(['foo', 'bar'])
  expect(onTrack).toHaveBeenCalledTimes(3)
  expect(events).toEqual([
    {
      effect: runner,
      target: toRaw(obj),
      type: TrackOpTypes.GET,
      key: 'foo'
    },
    {
      effect: runner,
      target: toRaw(obj),
      type: TrackOpTypes.HAS,
      key: 'bar'
    },
    {
      effect: runner,
      target: toRaw(obj),
      type: TrackOpTypes.ITERATE,
      key: ITERATE_KEY
    }
  ])
})
```

32. `observer` 的每次响应会触发 `trigger`
```js
it('events: onTrigger', () => {
  let events: DebuggerEvent[] = []
  let dummy
  const onTrigger = jest.fn((e: DebuggerEvent) => {
    events.push(e)
  })
  const obj = reactive({ foo: 1 })
  const runner = effect(
    () => {
      dummy = obj.foo
    },
    { onTrigger }
  )

  obj.foo++
  expect(dummy).toBe(2)
  expect(onTrigger).toHaveBeenCalledTimes(1)
  expect(events[0]).toEqual({
    effect: runner,
    target: toRaw(obj),
    type: TriggerOpTypes.SET,
    key: 'foo',
    oldValue: 1,
    newValue: 2
  })

  delete obj.foo
  expect(dummy).toBeUndefined()
  expect(onTrigger).toHaveBeenCalledTimes(2)
  expect(events[1]).toEqual({
    effect: runner,
    target: toRaw(obj),
    type: TriggerOpTypes.DELETE,
    key: 'foo',
    oldValue: 2
  })
})
```

33. `observer` 支持 `stop`，`stop` 后支持手动调用
```js
it('stop', () => {
  let dummy
  const obj = reactive({ prop: 1 })
  const runner = effect(() => {
    dummy = obj.prop
  })
  obj.prop = 2
  expect(dummy).toBe(2)
  stop(runner)
  obj.prop = 3
  expect(dummy).toBe(2)

  // stopped effect should still be manually callable
  runner()
  expect(dummy).toBe(3)
})

it('stop: a stopped effect is nested in a normal effect', () => {
  let dummy
  const obj = reactive({ prop: 1 })
  const runner = effect(() => {
    dummy = obj.prop
  })
  stop(runner)
  obj.prop = 2
  expect(dummy).toBe(1)

  // observed value in inner stopped effect
  // will track outer effect as an dependency
  effect(() => {
    runner()
  })
  expect(dummy).toBe(2)

  // notify outer effect to run
  obj.prop = 3
  expect(dummy).toBe(3)
})
```

34. `effect` 被 `stop` 后，`scheduler` 不会再响应
```js
it('stop with scheduler', () => {
  let dummy
  const obj = reactive({ prop: 1 })
  const queue: (() => void)[] = []
  const runner = effect(
    () => {
      dummy = obj.prop
    },
    {
      scheduler: e => queue.push(e)
    }
  )
  obj.prop = 2
  expect(dummy).toBe(1)
  expect(queue.length).toBe(1)
  stop(runner)

  // a scheduled effect should not execute anymore after stopped
  queue.forEach(e => e())
  expect(dummy).toBe(1)
})
```

35. 支持 `stop` 回调
```js
it('events: onStop', () => {
  const onStop = jest.fn()
  const runner = effect(() => {}, {
    onStop
  })

  stop(runner)
  expect(onStop).toHaveBeenCalled()
})
```

36. 标记为原始数据的不能响应
```js
it('markRaw', () => {
  const obj = reactive({
    foo: markRaw({
      prop: 0
    })
  })
  let dummy
  effect(() => {
    dummy = obj.foo.prop
  })
  expect(dummy).toBe(0)
  obj.foo.prop++
  expect(dummy).toBe(0)
  obj.foo = { prop: 1 }
  expect(dummy).toBe(1)
})
```

37. 当新值和旧值都是 NaN 时，不会 `trigger`
```js
it('should not be trigger when the value and the old value both are NaN', () => {
  const obj = reactive({
    foo: NaN
  })
  const fnSpy = jest.fn(() => obj.foo)
  effect(fnSpy)
  obj.foo = NaN
  expect(fnSpy).toHaveBeenCalledTimes(1)
})
```

38. 当数组长度设置为0时，会触发所有 `effect`
```js
it('should trigger all effects when array length is set 0', () => {
  const observed: any = reactive([1])
  let dummy, record
  effect(() => {
    dummy = observed.length
  })
  effect(() => {
    record = observed[0]
  })
  expect(dummy).toBe(1)
  expect(record).toBe(1)

  observed[1] = 2
  expect(observed[1]).toBe(2)

  observed.unshift(3)
  expect(dummy).toBe(3)
  expect(record).toBe(3)

  observed.length = 0
  expect(dummy).toBe(0)
  expect(record).toBeUndefined()
})
```