module.exports = {
  title: "Vue3.0 JS",
  description: "下一代web开发方式，更快，更轻，易维护，更多的原生支持",
  //   base: '/slamdunk-the-vue3/',
  head: [
    ["link", { rel: "icon", href: "/onepunch.jpeg" }],
    [
      "meta",
      {
        name: "keywords",
        content:
          "vue3中文, vue3js文档, vue3资料, vue3 vue-composition-api, vuecli,vue-cli,vue-cli文档,vue-cli学习,vue文档,vue中文,vue学习,前端开发,vue框架,vue社区",
      },
    ],
    [
      "script",
      { src: "https://hm.baidu.com/hm.js?db1f163122162bcdb6d04f76b5c1df17" },
    ],
  ],
  themeConfig: {
    repo: "vueClub/vue3doc",
    // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
    // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
    repoLabel: "Github",

    // 以下为可选的编辑链接选项

    // 假如你的文档仓库和项目本身不在一个仓库：
    docsRepo: "vueClub/vue3doc",
    docsDir: "docs",
    docsBranch: "master",
    // 默认是 false, 设置为 true 来启用
    editLinks: true,
    // 默认为 "Edit this page"
    editLinkText: "帮助我们改善此页面！",
    // displayAllHeaders: true,
    sidebar: [
      {
        title: "阅前必读",
        collapsable: false,
        children: [["start/", "写在最前面"]],
      },
      {
        title: "前置知识",
        collapsable: false,
        children: [
          ["es6/", "Proxy"],
          ["es6/dataStructure", "Set、Map、WeakSet、WeakMap"],
          ["es6/typeScript", "typeScript语法"],
          ["es6/spec", "spec语法"],
        ],
      },
      {
        title: "全局Api",
        collapsable: false,
        children: [
          ["global/", "global"],
        ],
      },
      {
        title: "响应式系统",
        collapsable: false,
        sidebarDepth: 2,
        children: [
          ["reactivity/", "整体概览"],
          ["reactivity/reactive", "reactive"],
          ["reactivity/reactive.spec", "reactive.spec"],
          ["reactivity/ref", "ref"],
          ["reactivity/ref.spec", "ref.spec"],
          ["reactivity/baseHandlers", "baseHandlers"],
          ["reactivity/effect", "effect"],
          ["reactivity/effect.spec", "effect.spec"],
          ["reactivity/computed", "computed"],
          ["reactivity/computed.spec", "computed.spec"],
        ],
      },
      {
        title: "编绎模块",
        collapsable: false,
        children: [
          ["compiler/", "compiler"],
        ],
      },
      {
        title: "Runtime",
        collapsable: false,
        children: [
          ["runtime/", "runtime"],
        ],
      },
    ],
  },
  markdown: {
    lineNumbers: true,
  },
};
