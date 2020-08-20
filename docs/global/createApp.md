### CreateApp

> 顾名思义，CreateApp 作为 vue 的启动函数，返回一个应用实例

### 从一个例子开始

```js
const HelloVueApp = {
  data() {
    return {
      message: 'Hello Vue!'
    }
  }
}

Vue.createApp(HelloVueApp).mount('#hello-vue')
```
<a href="/run/start.html" target="_blank">亲自试一试</a>

那么 `createApp` 里面都干了什么呢？我们接着往下看

```js
export const createApp = ((...args) => {
  const app = ensureRenderer().createApp(...args)

  if (__DEV__) {
    injectNativeTagCheck(app)
  }

  const { mount } = app
  app.mount = (containerOrSelector: Element | string): any => {
    const container = normalizeContainer(containerOrSelector)
    if (!container) return
    const component = app._component
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML
    }
    // clear content before mounting
    container.innerHTML = ''
    const proxy = mount(container)
    container.removeAttribute('v-cloak')
    return proxy
  }

  return app
}) as CreateAppFunction<Element>
```

我们可以看到重点在于 `ensureRenderer` ，

```js
const rendererOptions = {
  patchProp,  // 处理 props 属性 
  ...nodeOps // 处理 DOM 节点操作
}

// lazy create the renderer - this makes core renderer logic tree-shakable
// in case the user only imports reactivity utilities from Vue.
let renderer: Renderer | HydrationRenderer

let enabledHydration = false

function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}
```
调用 `createRenderer`

```js
export function createRenderer<
  HostNode = RendererNode,
  HostElement = RendererElement
>(options: RendererOptions<HostNode, HostElement>) {
  return baseCreateRenderer<HostNode, HostElement>(options)
}
```
调用 `baseCreateRenderer`, `baseCreateRenderer` 这个函数简直可以用庞大来形容，`vnode` `diff` `patch`均在这个方法中实现，回头我们再来细看实现，现在我们只需要关心他最后返回的什么

```js
function baseCreateRenderer(
  options: RendererOptions,
  createHydrationFns?: typeof createHydrationFunctions
): any {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    cloneNode: hostCloneNode,
    insertStaticContent: hostInsertStaticContent
  } = options

  // ....此处省略两千行，我们先不管

  return {
    render,
    hydrate,
    createApp: createAppAPI(render, hydrate)
  }
}

```

从源码中我们看到 `baseCreateRenderer` 最终返回 `render` `hydrate` `createApp` 3个函数, 但在 `createApp` 这个函数中我们本质上只需要返回 `createApp` 这个函数就好，这里返回了3个，说明其它两个会在别处用到，具体哪里能用到，后面我们再回头看

接着将生成的 `render` 传给 `createAppAPI` 这个真正的 `createApp` 方法，`hydrate` 为可选参数，`ssr` 的场景下会用到，这边我们也先跳过

看了 `baseCreateRenderer` 这个函数，再看 `createAppAPI` 就会觉得太轻松了。。。毕竟不是一个量级的

`createAppAPI` 首先判断

```js
export function createAppAPI<HostElement>(
  render: RootRenderFunction,
  hydrate?: RootHydrateFunction
): CreateAppFunction<HostElement> {
  return function createApp(rootComponent, rootProps = null) {
    if (rootProps != null && !isObject(rootProps)) {
      __DEV__ && warn(`root props passed to app.mount() must be an object.`)
      rootProps = null
    }

    // 创建默认APP配置
    const context = createAppContext()
    const installedPlugins = new Set()

    let isMounted = false

    const app: App = {
      _component: rootComponent as Component,
      _props: rootProps,
      _container: null,
      _context: context,

      get config() {
        return context.config
      },

      set config(v) {
        if (__DEV__) {
          warn(
            `app.config cannot be replaced. Modify individual options instead.`
          )
        }
      },

      // 都是一些眼熟的方法
      use() {},
      mixin() {},
      component() {},
      directive() {},

      // mount 我们拎出来讲
      mount() {},
      unmount() {},
      // ...
    }

    return app
  }
}
```

`createAppContext` 实现 

```js
export function createAppContext(): AppContext {
  return {
    config: {
      isNativeTag: NO,
      devtools: true,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      isCustomElement: NO,
      errorHandler: undefined,
      warnHandler: undefined
    },
    mixins: [],
    components: {},
    directives: {},
    provides: Object.create(null)
  }
}
```

到这里，整个`createApp` 流程就结束了，在整个环节中，我们故意忽略了很多细节，不过不重要 ，这个篇幅我们只需要`createApp`在主流程做了什么了就好

你可能会有很多疑问，比如:

模板是怎么编绎的?  
生命周期是怎么挂载的?    
组件是怎么注册的?   
响应式怎么做到的?

我们先记着，后面有篇幅单独拎出来

