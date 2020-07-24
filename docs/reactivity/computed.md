### computed

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

计算属性，可能会依赖其他 `reactive` 的值，同时会延迟和缓存计算值

```js
export function computed<T>(
  getterOrOptions: ComputedGetter<T> | WritableComputedOptions<T>
) {
  let getter: ComputedGetter<T>
  let setter: ComputedSetter<T>

  // 如果传入是 function 说明是只读 computed
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions
    setter = __DEV__
      ? () => {
          console.warn('Write operation failed: computed value is readonly')
        }
      : NOOP
  } else {
    // 不是方法说明是自定义的 getter setter 
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  let dirty = true
  let value: T
  let computed: ComputedRef<T>

  // 创建 effect, 我们在看 effect 源码时知道了传入 lazy 代表不会立即执行，computed 表明 computed 上游依赖改变的时候，会优先 trigger runner effect, scheduler 表示 effect trigger 的时候会调用 scheduler 而不是直接调用 effect
  const runner = effect(getter, {
    lazy: true,
    // mark effect as computed so that it gets priority during trigger
    computed: true,
    scheduler: () => {
      // 在触发更新时把dirty置为true, 不会立即更新 
      if (!dirty) {
        dirty = true
        trigger(computed, TriggerOpTypes.SET, 'value')
      }
    }
  })

  // 构造一个 computed 返回
  computed = {
    __v_isRef: true,
    // expose effect so computed can be stopped
    effect: runner,
    get value() {
      // dirty为ture, get操作时，执行effect获取最新值
      // 
      if (dirty) {
        value = runner()
        dirty = false
      }
      // dirty为false, 表示值未更新，直接返回 
      track(computed, TrackOpTypes.GET, 'value')
      return value
    },
    set value(newValue: T) {
      setter(newValue)
    }
  } as any
  return computed
}
```