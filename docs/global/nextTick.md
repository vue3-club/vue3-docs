
### nextTick

> 定义: 在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM

看完是不是有一堆问号？我们从中找出来产生问号的关键词
- 下次 DOM 更新循环结束之后? 
- 执行延迟回调? 
- 更新后的 DOM?

我们从上面三个疑问大胆猜想一下
- vue 更新DOM是有策略的，不是同步更新
- nextTick 可以接收一个函数做为入参
- nextTick 后能拿到最新的数据

好了，我们问题都抛出来了，先来看一下如何使用

```js
import { createApp, nextTick } from 'vue'
const app = createApp({
  setup() {
    const message = ref('Hello!')
    const changeMessage = async newMessage => {
      message.value = newMessage
      // 这里获取DOM的value是旧值
      await nextTick()
      // nextTick 后获取DOM的value是更新后的值
      console.log('Now DOM is updated')
    }
  }
})
```
<a href="/run/nextTick" target="_blank">亲自试一试</a>

那么 `nextTick` 是怎么做到的呢？为了后面的内容更好理解，这里我们得从 `js` 的执行机制说起 

### JS执行机制 
我们都知道 `JS` 是单线程语言，即指某一时间内只能干一件事，有的同学可能会问，为什么 `JS` 不能是多线程呢？多线程就能同一时间内干多件事情了

是否多线程这个取决于语言的用途，一个很简单的例子，如果同一时间，一个添加了 `DOM`，一个删除了 `DOM`, 这个时候语言就不知道是该添还是该删了，所以从应用场景来看 `JS` 只能是单线程

单线程就意味着我们所有的任务都需要排队，后面的任务必须等待前面的任务完成才能执行，如果前面的任务耗时很长，一些从用户角度上不需要等待的任务就会一直等待，这个从体验角度上来讲是不可接受的，所以`JS`中就出现了异步的概念

**概念**
- 同步 在主线程上排队执行的任务，只有前一个任务执行完毕，才能执行后一个任务
- 异步 不进入主线程、而进入"任务队列"（task queue）的任务，只有"任务队列"通知主线程，某个异步任务可以执行了，该任务才会进入主线程执行

#### 运行机制

- （1）所有同步任务都在主线程上执行，形成一个执行栈（execution context stack）。

- （2）主线程之外，还存在一个"任务队列"（task queue）。只要异步任务有了运行结果，就在"任务队列"之中放置一个事件。

- （3）一旦"执行栈"中的所有同步任务执行完毕，系统就会读取"任务队列"，看看里面有哪些事件。那些对应的异步任务，于是结束等待状态，进入执行栈，开始执行。

- （4）主线程不断重复上面的第三步

 ![image.png](https://static.vue-js.com/83308f80-d881-11ea-ae44-f5d67be454e7.png)

### nextTick

现在我们回来`vue`中的`nextTick`

实现很简单，完全是基于语言执行机制实现，直接创建一个异步任务，那么`nextTick`自然就达到在同步任务后执行的目的

```js
const p = Promise.resolve()
export function nextTick(fn?: () => void): Promise<void> {
  return fn ? p.then(fn) : p
}
```
<a href="/run/nextTick-demo-1.html" target="_blank">亲自试一试</a>

看到这里，有的同学可能又会问，前面我们猜想的 `DOM` 更新也是异步任务，那他们的这个执行顺序如何保证呢？

别急，在源码中`nextTick`还有几个兄弟函数，我们接着往下看

#### queueJob and queuePostFlushCb
`queueJob` 维护job列队，有去重逻辑，保证任务的唯一性，每次调用去执行 `queueFlush`
`queuePostFlushCb` 维护cb列队，被调用的时候去重，每次调用去执行 `queueFlush`
```js
const queue: (Job | null)[] = []
export function queueJob(job: Job) {
  // 去重 
  if (!queue.includes(job)) {
    queue.push(job)
    queueFlush()
  }
}

export function queuePostFlushCb(cb: Function | Function[]) {
  if (!isArray(cb)) {
    postFlushCbs.push(cb)
  } else {
    postFlushCbs.push(...cb)
  }
  queueFlush()
}
```

#### queueFlush
开启异步任务(nextTick)处理 `flushJobs`
```js
function queueFlush() {
  // 避免重复调用flushJobs
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    nextTick(flushJobs)
  }
}
```

#### flushJobs
处理列队，先对列队进行排序，执行`queue`中的`job`，处理完后再处理`postFlushCbs`, 如果队列没有被清空会递归调用`flushJobs`清空队列
```js
function flushJobs(seen?: CountMap) {
  isFlushPending = false
  isFlushing = true
  let job
  if (__DEV__) {
    seen = seen || new Map()
  }

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child so its render effect will have smaller
  //    priority number)
  // 2. If a component is unmounted during a parent component's update,
  //    its update can be skipped.
  // Jobs can never be null before flush starts, since they are only invalidated
  // during execution of another flushed job.
  queue.sort((a, b) => getId(a!) - getId(b!))

  while ((job = queue.shift()) !== undefined) {
    if (job === null) {
      continue
    }
    if (__DEV__) {
      checkRecursiveUpdates(seen!, job)
    }
    callWithErrorHandling(job, null, ErrorCodes.SCHEDULER)
  }
  flushPostFlushCbs(seen)
  isFlushing = false
  // some postFlushCb queued jobs!
  // keep flushing until it drains.
  if (queue.length || postFlushCbs.length) {
    flushJobs(seen)
  }
}
```

好了，实现全在上面了，好像还没有解开我们的疑问，我们需要搞清楚 `queueJob` 及 `queuePostFlushCb` 是怎么被调用的

```js
//  renderer.ts
function createDevEffectOptions(
  instance: ComponentInternalInstance
): ReactiveEffectOptions {
  return {
    scheduler: queueJob,
    onTrack: instance.rtc ? e => invokeArrayFns(instance.rtc!, e) : void 0,
    onTrigger: instance.rtg ? e => invokeArrayFns(instance.rtg!, e) : void 0
  }
}

// effect.ts
const run = (effect: ReactiveEffect) => {
  ...

  if (effect.options.scheduler) {
    effect.options.scheduler(effect)
  } else {
    effect()
  }
}
```

看到这里有没有恍然大悟的感觉？原来当响应式对象发生改变后，执行 `effect` 如果有 `scheduler` 这个参数，会执行这个 `scheduler` 函数，并且把 `effect` 当做参数传入

绕口了，简单点就是 `queueJob(effect)`，嗯，清楚了，这也是数据发生改变后页面不会立即更新的原因

[effect传送门](/reactivity/effect)

### 为什么要nextTick

一个例子让大家明白，如果没有 `nextTick`  更新机制，那么 `num` 每次更新值都会触发视图更新，有了`nextTick`机制，只需要更新一次，所以为什么有`nextTick`存在，相信大家心里已经有答案了。 

```js
{{num}}
for(let i=0; i<100000; i++){
	num = i
}
```
### 总结
`nextTick` 是 `vue` 中的更新策略，也是性能优化手段，基于`JS`执行机制实现

`vue` 中我们改变数据时不会立即触发视图，如果需要实时获取到最新的`DOM`，这个时候可以手动调用 `nextTick`


