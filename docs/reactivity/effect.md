### effect

`effect` 作为 `reactive` 的核心，主要负责收集依赖，更新依赖

如果你还没看过 `reactive` , 建议点[这里](/reactivity/reactive)

文档直通车: [https://vue3js.cn/vue-composition-api/#reactive](https://vue3js.cn/vue-composition-api/#reactive)

### 正文

我们还是选择先从定义看起

`effect` 接收两个参数
- `fn` 回调函数
- `options` 参数 

```js

export interface ReactiveEffectOptions {
  lazy?: boolean //  是否延迟触发 effect
  computed?: boolean // 是否为计算属性
  scheduler?: (job: ReactiveEffect) => void // 调度函数
  onTrack?: (event: DebuggerEvent) => void // 追踪时触发
  onTrigger?: (event: DebuggerEvent) => void // 触发回调时触发
  onStop?: () => void // 停止监听时触发
}

export function effect<T = any>(
  fn: () => T,
  options: ReactiveEffectOptions = EMPTY_OBJ
): ReactiveEffect<T> {
  // 如果已经是 `effect` 先重置为原始对象
  if (isEffect(fn)) {
    fn = fn.raw
  }

  // 创建`effect`
  const effect = createReactiveEffect(fn, options)

  // 如果没有传入 lazy 则直接执行一次 `effect`
  if (!options.lazy) {
    effect()
  }
  return effect
}
```

入口很简单，我们继续看一下 `effect` 是怎么创建的，如果下面这些你觉得相对难理解，建议先去看一遍[单元测试](/reactivity/effect.spec)，单元测试会助你快速了解整个单元的目的 

```js
function createReactiveEffect<T = any>(
  fn: (...args: any[]) => T,
  options: ReactiveEffectOptions
): ReactiveEffect<T> {
  const effect = function reactiveEffect(...args: unknown[]): unknown {

    // 没有激活，说明我们调用了effect stop 函数，
    if (!effect.active) {
      // 如果没有调度者，直接返回，否则直接执行fn
      return options.scheduler ? undefined : fn(...args)
    }

    // 判断effectStack中有没有effect, 如果在则不处理
    if (!effectStack.includes(effect)) {
      // 清除effect依赖，定义在下方
      cleanup(effect)
      try {
        // 开始重新收集依赖
        enableTracking()
        // 压入Stack
        effectStack.push(effect)
        // 将activeEffect当前effect 
        activeEffect = effect
        return fn(...args)
      } finally {
        // 完成后将effect弹出
        effectStack.pop()
        // 重置依赖
        resetTracking()
        // 重置activeEffect 
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  } as ReactiveEffect
  effect.id = uid++ // 自增id, effect唯一标识
  effect._isEffect = true  // 是否是effect
  effect.active = true // 是否激活 
  effect.raw = fn // 挂载原始对象
  effect.deps = []  // 当前 effect 的dep 数组
  effect.options = options // 传入的options，在effect有解释的那个字段
  return effect
}

const effectStack: ReactiveEffect[] = []

// 每次 effect 运行都会重新收集依赖, deps 是 effect 的依赖数组, 需要全部清空
function cleanup(effect: ReactiveEffect) {
  const { deps } = effect
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect)
    }
    deps.length = 0
  }
}
```

看到这里应该会有一个问题了？`effect` 是如何收集及触发依赖的呢？现在我们回想一下在[reactive](/reactivity/reactive)高频出现的两个函数

- track 收集依赖(get操作)
- trigger 触发依赖(触发更新后执行监听函数之前触发)

### track

```js
/**
 * @description: 
 * @param {target} 目标对象 
 * @param {type} 收集的类型,  函数的定义在下方 
 * @param {key} 触发 track 的 object 的 key 
 */
export function track(target: object, type: TrackOpTypes, key: unknown) {
  // activeEffect为空代表没有依赖，直接return
  if (!shouldTrack || activeEffect === undefined) {
    return
  }

  // targetMap 依赖管理中心，用于收集依赖和触发依赖
  // 检查targetMap中有没有当前target
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    // 没有则新建一个
    targetMap.set(target, (depsMap = new Map()))
  }

  // deps 来收集依赖函数，当监听的 key 值发生变化时，触发 dep 中的依赖函数
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
    // 开发环境会触发onTrack, 仅用于调试
    if (__DEV__ && activeEffect.options.onTrack) {
      activeEffect.options.onTrack({
        effect: activeEffect,
        target,
        type,
        key
      })
    }
  }
}

//  get、 has、 iterate 三种类型的读取对象会触发 track
export const enum TrackOpTypes {
  GET = 'get',
  HAS = 'has',
  ITERATE = 'iterate'
}
```

### trigger

```js
export function trigger(
  target: object,
  type: TriggerOpTypes, 
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  const depsMap = targetMap.get(target)
  // 依赖管理中没有, 代表没有收集过依赖，直接返回
  if (!depsMap) {
    // never been tracked
    return
  }

  // 对依赖进行分类
  // effects 代表普通依赖，
  // computedRunners 为计算属性依赖 
  // 都是 Set 结构，避免重复收集
  const effects = new Set<ReactiveEffect>()
  const computedRunners = new Set<ReactiveEffect>()
  const add = (effectsToAdd: Set<ReactiveEffect> | undefined) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        // 避免重复收集
        if (effect !== activeEffect || !shouldTrack) {
          // 计算属性依赖
          if (effect.options.computed) {
            computedRunners.add(effect)
          } else {
            // 普通属性依赖
            effects.add(effect)
          }
        } else {
          // the effect mutated its own dependency during its execution.
          // this can be caused by operations like foo.value++
          // do not trigger or we end in an infinite loop
        }
      })
    }
  }

  if (type === TriggerOpTypes.CLEAR) {
    // collection being cleared
    // trigger all effects for target
    depsMap.forEach(add)
  } else if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= (newValue as number)) {
        add(dep)
      }
    })
  } else {
    // schedule runs for SET | ADD | DELETE
    if (key !== void 0) {
      add(depsMap.get(key))
    }
    // also run for iteration key on ADD | DELETE | Map.SET
    const isAddOrDelete =
      type === TriggerOpTypes.ADD ||
      (type === TriggerOpTypes.DELETE && !isArray(target))
    if (
      isAddOrDelete ||
      (type === TriggerOpTypes.SET && target instanceof Map)
    ) {
      add(depsMap.get(isArray(target) ? 'length' : ITERATE_KEY))
    }
    if (isAddOrDelete && target instanceof Map) {
      add(depsMap.get(MAP_KEY_ITERATE_KEY))
    }
  }

  const run = (effect: ReactiveEffect) => {
    if (__DEV__ && effect.options.onTrigger) {
      effect.options.onTrigger({
        effect,
        target,
        key,
        type,
        newValue,
        oldValue,
        oldTarget
      })
    }

    // 如果 scheduler 存在则调用 scheduler，计算属性拥有 scheduler
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  }

  // Important: computed effects must be run first so that computed getters
  // can be invalidated before any normal effects that depend on them are run.
  // 触发依赖函数
  computedRunners.forEach(run)
  effects.forEach(run)
}
``` 



