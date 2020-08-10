### 全局概览

正式进入源码之前，我们可以先来了解一下整个 `Vue3` 源码的架构，以及用到了哪些工具

进入源码目录执行 `tree -aI ".git*|.vscode" -C -L 1` 获取整个目录

```js
├── .circleci // CI 配置目录
├── .ls-lint.yml // 文件命名规范
├── .prettierrc // 代码格式化 prettier 的配置文件
├── CHANGELOG.md  // 更新日志
├── LICENSE
├── README.md
├── api-extractor.json // TypeScript 的API提取和分析工具
├── jest.config.js  //  测试框架 jest 的配置文件
├── node_modules
├── package-lock.json
├── package.json
├── packages // Vue源代码目录
├── rollup.config.js  // 模块打包器 rollup 的配置文件
├── scripts
├── test-dts // TypeScript 声明文件
├── tsconfig.json // TypeScript 配置文件
└── yarn.lock
```

上面用到的一些工具大家有兴趣可以自行查阅相关资料，在这里我们只重点关注 `package` 目录，整个结构如下

```js
.
├── compiler-core // 顾名思义，核心中的核心，抽象语法树和渲染桥接实现
├── compiler-dom // Dom的实现
├── compiler-sfc // Vue单文件组件(.vue)的实现
├── compiler-ssr
├── global.d.ts
├── reactivity
├── runtime-core
├── runtime-dom
├── runtime-test
├── server-renderer // 服务端渲染实现
├── shared  // package 之间共享的工具库
├── size-check
├── template-explorer
└── vue
```

### Runtime 跟 CompileTime

通过结构我们可以看到 `package` 中最重要的模块有5个，分别为

- compiler-core
- compiler-dom 
- runtime-core
- runtime-dom
- reactivity

不难发现 `core`, `dom` 分别出现了两次，那么 `compiler` `runtime` 它们之间又有什么区别呢？

`compile time` 我们可以理解为程序编绎时，是指我们写好的源代码在被编译成为目标文件这段时间，但我们可以通俗的看成是我们写好的源代码在被转换成为最终可执行的文件这段时间，在这里可以理解为我们将`.vue`文件编绎成浏览器能识别的`.html`文件的一些工作，

`run time` 可以理解为程序运行时，即是程序被编译了之后，打开程序并运行它直到程序关闭的这段时间的系列处理

### 模块关系图

```js
                      +---------------------+    +----------------------+
                      |                     |    |                      |
        +------------>|  @vue/compiler-dom  +--->|  @vue/compiler-core  |
        |             |                     |    |                      |
   +----+----+        +---------------------+    +----------------------+
   |         |
   |   vue   |
   |         |
   +----+----+        +---------------------+    +----------------------+    +-------------------+
        |             |                     |    |                      |    |                   |
        +------------>|  @vue/runtime-dom   +--->|  @vue/runtime-core   +--->|  @vue/reactivity  |
                      |                     |    |                      |    |                   |
                      +---------------------+    +----------------------+    +-------------------+
```
