### h() 

看到这个函数你可能会有些许困惑，为什么叫`h`呢？代表着什么呢？

`h` 其实代表的是 [hyperscript](https://github.com/hyperhype/hyperscript) 。它是 HTML 的一部分，表示的是超文本标记语言，当我们正在处理一个脚本的时候，在虚拟 DOM 节点中去使用它进行替换已成为一种惯例。这个定义同时也被运用到其他的框架文档中

**Hyperscript 它本身表示的是 "生成描述 HTML 结构的脚本"**

好了，了解了什么是 `h`，现在我们来看官方对他的一个定义

> 定义: 返回一个“虚拟节点” ，通常缩写为 VNode: 一个普通对象，其中包含向 Vue 描述它应该在页面上呈现哪种节点的信息，包括对任何子节点的描述。用于手动编写render

### 语法
```js
// type only
h('div')

// type + props
h('div', {})

// type + omit props + children
// Omit props does NOT support named slots
h('div', []) // array
h('div', 'foo') // text
h('div', h('br')) // vnode
h(Component, () => {}) // default slot

// type + props + children
h('div', {}, []) // array
h('div', {}, 'foo') // text
h('div', {}, h('br')) // vnode
h(Component, {}, () => {}) // default slot
h(Component, {}, {}) // named slots

// named slots without props requires explicit `null` to avoid ambiguity
h(Component, null, {})
```
#### 举个栗子

```js
const App = {
    render() {
      return Vue.h('h1', {}, 'Hello Vue3js.cn')
    }
}
Vue.createApp(App).mount('#app')
```
<a href="/run/h.html" target="_blank">亲自试一试</a>

### 都干了些啥 

`h` 接收三个参数
- type 元素的类型
- propsOrChildren 数据对象, 这里主要表示(props, attrs, dom props, class 和 style)
- children 子节点
```js
export function h(type: any, propsOrChildren?: any, children?: any): VNode {
  if (arguments.length === 2) {
    if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
      // single vnode without props
      if (isVNode(propsOrChildren)) {
        return createVNode(type, null, [propsOrChildren])
      }
      // props without children
      return createVNode(type, propsOrChildren)
    } else {
      // omit props
      return createVNode(type, null, propsOrChildren)
    }
  } else {
    if (isVNode(children)) {
      children = [children]
    }
    return createVNode(type, propsOrChildren, children)
  }
}
```
`_createVNode` 做的事情也很简单

```js
function _createVNode(
  type: VNodeTypes | ClassComponent | typeof NULL_DYNAMIC_COMPONENT,
  props: (Data & VNodeProps) | null = null,
  children: unknown = null,
  // 更新标志
  patchFlag: number = 0,
  // 自定义属性
  dynamicProps: string[] | null = null,
  // 是否是动态节点，(v-if v-for)
  isBlockNode = false 
): VNode {
  // type必传参数
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    if (__DEV__ && !type) {
      warn(`Invalid vnode type when creating vnode: ${type}.`)
    }
    type = Comment
  }

  // Class 类型的type标准化
  // class component normalization.
  if (isFunction(type) && '__vccOpts' in type) {
    type = type.__vccOpts
  }

  // class & style normalization.
  if (props) {
    // props 如果是响应式，clone 一个副本
    if (isProxy(props) || InternalObjectKey in props) {
      props = extend({}, props)
    }
    let { class: klass, style } = props

    // 标准化class, 支持 string , array, object 三种形式
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }

    // 标准化style, 支持 array ,object 两种形式 
    if (isObject(style)) {
      // reactive state objects need to be cloned since they are likely to be
      // mutated
      if (isProxy(style) && !isArray(style)) {
        style = extend({}, style)
      }
      props.style = normalizeStyle(style)
    }
  }

  // encode the vnode type information into a bitmap
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : __FEATURE_SUSPENSE__ && isSuspense(type)
      ? ShapeFlags.SUSPENSE
      : isTeleport(type)
        ? ShapeFlags.TELEPORT
        : isObject(type)
          ? ShapeFlags.STATEFUL_COMPONENT
          : isFunction(type)
            ? ShapeFlags.FUNCTIONAL_COMPONENT
            : 0

  if (__DEV__ && shapeFlag & ShapeFlags.STATEFUL_COMPONENT && isProxy(type)) {
    type = toRaw(type)
    warn(
      `Vue received a Component which was made a reactive object. This can ` +
        `lead to unnecessary performance overhead, and should be avoided by ` +
        `marking the component with \`markRaw\` or using \`shallowRef\` ` +
        `instead of \`ref\`.`,
      `\nComponent that was made reactive: `,
      type
    )
  }

  // 构造 VNode 模型
  const vnode: VNode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    children: null,
    component: null,
    suspense: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null
  }

  normalizeChildren(vnode, children)

  // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.

  // patchFlag 标志存在表示节点需要更新，组件节点一直存在 patchFlag，因为即使不需要更新，它需要将实例持久化到下一个 vnode，以便以后可以正确卸载它
  if (
    shouldTrack > 0 &&
    !isBlockNode &&
    currentBlock &&
    // the EVENTS flag is only for hydration and if it is the only flag, the
    // vnode should not be considered dynamic due to handler caching.
    patchFlag !== PatchFlags.HYDRATE_EVENTS &&
    (patchFlag > 0 ||
      shapeFlag & ShapeFlags.SUSPENSE ||
      shapeFlag & ShapeFlags.TELEPORT ||
      shapeFlag & ShapeFlags.STATEFUL_COMPONENT ||
      shapeFlag & ShapeFlags.FUNCTIONAL_COMPONENT)
  ) {
    // 压入 VNode 栈
    currentBlock.push(vnode)
  }

  return vnode
}
```

### 总结

到这里，`h` 函数已经全部看完了，我们现在知道 `h` 叫法的由来，其函数内部逻辑只做参数检查，真正的主角是 `_createVNode` 

`_createVNode` 做的事情有

1. 标准化 `props` `class`
2. 给 `VNode` 打上编码标记
3. 创建 `VNode`
4. 标准化子节点

有的同学可能会有疑问🤔️，`VNode` 最后是怎么转换成真实的 `DOM` 呢?

这边有单独拉出来讲，请点[VNode]()





