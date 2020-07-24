### reactivie 整体概览

先看一眼官方对 `reactivie` 的定义

> This package is inlined into Global & Browser ESM builds of user-facing renderers (e.g. @vue/runtime-dom), but also published as a package that can be used standalone. The standalone build should not be used alongside a pre-bundled build of a user-facing renderer, as they will have different internal storage for reactivity connections. A user-facing renderer should re-export all APIs from this package.

大概意思是说这个包是内嵌到vue的渲染器中(@vue/runtime-dom)，但是它也可以单独发布或者被第三方引用，需要注意的是如果你是提供给第三方渲染器使用，其内部可能已经实现了响应机制，可能出现兼容问题

**为了后面阅读大家更容易阅读，开始之前我们需要理解各个文件之间的关系及用途**

下方为整个`reactive`的文件结构

```js
.
├── LICENSE
├── README.md
├── __tests__  // 单元测试目录
│   ├── collections
│   │   ├── Map.spec.ts
│   │   ├── Set.spec.ts
│   │   ├── WeakMap.spec.ts
│   │   └── WeakSet.spec.ts
│   ├── computed.spec.ts
│   ├── effect.spec.ts
│   ├── reactive.spec.ts
│   ├── reactiveArray.spec.ts
│   ├── readonly.spec.ts
│   └── ref.spec.ts
├── api-extractor.json
├── index.js
├── package.json
└── src
    ├── baseHandlers.ts // 基本类型的处理器
    ├── collectionHandlers.ts  // Set Map WeakSet WeckMap的处理器
    ├── computed.ts // 计算属性，同Vue2
    ├── effect.ts // reactive 核心，处理依赖收集，依赖更新
    ├── index.ts
    ├── operations.ts // 定义依赖收集，依赖更新的类型
    ├── reactive.ts // reactive 入口，内部主要以Proxy实现
    └── ref.ts // reactive 的变种方法，Proxy处理不了值类型的响应，Ref来处理
```

还为大家提供了整个 `reactive` 的流程图

**整体流程** 

<p>
    <img  src="https://static.vue-js.com/c2344a60-cd86-11ea-ae44-f5d67be454e7.png" width="80%">
</p>

### 建议顺序阅读

* [/reactivity/reactive](reactive) 
* [/reactivity/baseHandlers](baseHandlers)  
* [/reactivity/effect](effect)  
* [/reactivity/ref](ref)   
* [/reactivity/computed](computed) 

<!-- **reactive 流程**
<p>
    <img  src="https://static.vue-js.com/0969ba10-cd90-11ea-ae44-f5d67be454e7.png" width="50%">
</p>

**ref 流程**
<p>
    <img  src="https://static.vue-js.com/244c65c0-cd91-11ea-ae44-f5d67be454e7.png" width="100%">
</p> -->
