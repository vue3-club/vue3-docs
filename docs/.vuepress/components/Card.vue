<template lang="html">
  <div class="main">
    <div v-for="item in list">
      <h3 v-if="item.title">{{item.title}}</h3>
      <div class="list">
        <a v-for="(sub, inx) in item.data" :href="sub.link" target="_blank" class="sub" :class="{nomargin: (inx+1)%3===0}">
          <div v-if="sub.img" class="cover" :style="{background: `url(${sub.img}) no-repeat`, backgroundSize: '100%'}">
            <div class="labels" v-if="sub.labels">
              <span v-for="label in sub.labels">{{label}}</span>
            </div>
          </div>
          <!-- <div v-else class="cover" :style="{background: bgColors[Math.floor(Math.random() * bgColors.length)]}"> -->
          <div v-else class="cover" >
            {{sub.title}}
            <div class="labels" v-if="sub.labels">
              <span v-for="label in sub.labels">{{label}}</span>
            </div>
          </div>
          <div class="desc">{{sub.desc}}</div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
const list = [
  {
    data: [
      {
        desc: 'Vue3中文文档，国内CDN加速版',
        img: '',
        title: 'Vue3中文文档',
        link:  'http://vue3js.cn/docs/zh',
        labels: ['新上', 'CDN'],
      },
      {
        desc: '国内CDN加速版',
        img: '',
        title: 'Vue3文档',
        link:  'http://vue3js.cn/docs/',
        labels: ['新上', 'CDN'],
      },
      {
        desc: 'Vue3设计理念，动机与目的，上手必读',
        img: '',
        title: 'Vue3设计理念',
        link:  'http://vue3js.cn/vue-composition/'
      },
      {
        desc: 'Vue3 Api 参考',
        img: '',
        title: 'Vue3 Api',
        link:  'http://vue3js.cn/vue-composition-api/'
      },
      {
        desc: 'Vue 模板转换器',
        img: '',
        title: 'Vue-template-explorer',
        link:  'http://vue3js.cn/vue-template-explorer/'
      },
      {
        desc: '',
        img: '',
        title: 'Vue3源码解析筹备中',
        link:  '/start/',
        labels: ['进行中', '诚邀加入我们'],
      },
    ]
  },
  {
    title: '配套项目',
    data: [
      {
        desc: '看文档看文档看文档，重要的事情说三遍',
        img: '',
        title: 'Vue文档',
        link:  'https://doc.vue-js.com/v2/api/'
      },
      {
        desc: 'Vue Router 是 Vue.js 官方的路由管理器。它和 Vue.js 的核心深度集成，让构建单页面应用变得易如反掌',
        img: '',
        title: 'Vue Router',
        link:  'https://router.vuejs.org/zh/'
      },
      {
        desc: 'Vue复杂数据管理的最好方式',
        img: '',
        title: 'Vuex',
        link: 'https://vuex.vuejs.org/zh/guide/'
      },
      {
        desc: '易用、简洁且高效的http库, 在Vue项目大量使用, 使用Promise管理异步，告别传统callback方式',
        img: '',
        title: 'Axios',
        link: 'https://github.com/axios/axios'
      },
      {
        desc: '🛠️ Vue.js 开发的标准工具',
        img: '',
        title: 'Vue Cli',
        link: 'https://cli.vuejs.org/zh/'
      },
      {
        desc: '基于 Vue 前端开发框架的静态站点生成工具, SEO必备良器',
        img: '',
        title: 'Nuxt',
        link: 'https://www.nuxtjs.cn/'
      },
      {
        desc: 'VuePress静态站点搭建首选',
        img: '',
        title: 'VuePress',
        link: 'https://vue-js.com/vuepress/zh/'
      },
      {
        desc: '逐行剖析 Vue.js 源码九大模块，逐个击破',
        img: '',
        title: 'Vue源码导读',
        link:  'https://vue-js.com/learn-vue/'
      },
    ]
  },
  {
    title: '支持Vue3组件库',
    data: [
      {
        desc: 'ant-design-vue 是 Ant Design 的 Vue 实现，组件的风格与 Ant Design 保持同步, 目前支持 Vue 3.0 的 2.0.0 测试版 已发布',
        img: '',
        title: 'Ant-design-vue',
        labels: ['PC端', 'Ant-design'],
        link: 'https://antdv.com/docs/vue/introduce-cn/'
      },
      {
        desc: 'Vant 是有赞前端团队开源的移动端组件库，于 2016 年开源，已持续维护 4 年时间。目前 Vant 已完成了对 Vue 3.0 的适配工作，并发布了 Vant 3.0 Beta 版本',
        img: '',
        title: 'Vant 3.0',
        labels: ['移动端'],
        link: 'https://vant-contrib.gitee.io/vant/next'
      },
      {
        desc: 'elementui风格的组件库，Vue3.0 重构版, 没有明确发布计划，目前还在紧急开发中',
        img: '',
        title: 'Element-plus',
        labels: ['移动端'],
        link: 'https://element-plus.org/#/zh-CN/component/installation'
      }
    ]
  },
  {
    title: '开源UI库',
    data: [
      {
        desc: '饿了么出品的Vue2的web UI工具套件',
        img: '',
        title: 'Element',
        labels: ['PC端', 'TB风格'],
        link: 'https://element.eleme.io/#/'
      },
      {
        desc: '基于Vue和WeUI的移动组件库',
        img: '',
        title: 'Vux',
        labels: ['移动端', '微信风格'],
        link: 'https://github.com/airyland/vux'
      },
      {
        desc: '基于Vuejs的开源 UI 组件库',
        img: '',
        title: 'iview',
        labels: ['移动端'],
        link: 'https://github.com/iview/iview'
      },
      {
        desc: '三端样式一致的响应式 UI 库',
        img: '',
        title: 'Muse-ui',
        labels: ['响应式', '多端'],
        link: 'https://muse-ui.org/'
      },
      {
        desc: '通过Vue Material和Vue 2建立精美的app应用',
        img: '',
        title: 'Vue-material',
        labels: ['Material风格'],
        link: 'http://vuematerial.materializecss.cn/'
      },
      {
        desc: '应用于Vuejs2的Twitter的Bootstrap 4组件',
        img: '',
        title: 'Bootstrap-vue',
        labels: ['Bootstrap风格', '情怀'],
        link: 'https://bootstrap-vue.org/'
      },
      {
        desc: '为移动而生的Vue JS 2组件框架',
        img: '',
        title: 'Vuetify',
        labels: ['移动端'],
        link: 'https://vuetifyjs.com/zh-Hans/getting-started/quick-start/'
      }
    ]
  },
  {
    title: 'Vue3实战项目',
    data: [
      {
        desc: '基于ant-design-vue,typescript,vue3.0,vite实现的 vue3 风格的后台管理系统',
        img: '',
        title: 'vue-vben-admin',
        link: 'https://github.com/anncwb/vue-vben-admin'
      },
      {
        desc: '基于vue3.0的开源admin项目，同时支持电脑，手机，平板，🔥🔥🔥默认分支使用vue3.x+antdv开发，master分支使用的是vue2.x+element开发',
        img: '',
        title: 'vue-admin-beautiful',
        link: 'https://github.com/chuzhixin/vue-admin-beautiful'
      },
      {
        desc: '基于 Vue3.0 Composition Api 快速构建实战项目',
        img: '',
        title: 'vue-cli',
        link: 'https://github.com/Wscats/vue-cli'
      },
      {
        desc: 'Vue3 + TypeScript开发的电影预告片webAPP，可以查看正在热映与即将上映的电影信息和短片',
        img: '',
        title: 'movie-trailer',
        link: 'https://github.com/lhz960904/movie-trailer'
      }
    ]
  },
  {
    title: '优秀实战项目',
    data: [
      {
        desc: '基于 vue2 + vuex 构建一个具有 45 个页面的大型单页面应用',
        img: '',
        title: 'Vue饿了么',
        link: 'https://github.com/bailicangdu/vue2-elm'
      },
      {
        desc: 'vue管理后台模板',
        img: '',
        title: 'vue-element-admin',
        link: 'https://github.com/PanJiaChen/vue-element-admin'
      },
      {
        desc: 'Vue饿了么配套的管理后台',
        img: '',
        title: 'vue2-manage',
        link: 'https://github.com/bailicangdu/vue2-manage'
      },
      {
        desc: '基于Vue的个人音频流媒体服务',
        img: '',
        title: 'koel',
        link: 'https://github.com/koel/koel'
      },
      {
        desc: '高仿网易云音乐的webapp',
        img: '',
        title: 'NeteaseCloudWebApp',
        link: 'https://github.com/javaSwing/NeteaseCloudWebApp'
      },
      {
        desc: '全栈式开发bilibili首页',
        img: '',
        title: 'bilibili-vue',
        link: 'https://github.com/lybenson/bilibili-vue'
      },
    ]
  }
]
const bgColors = ['#81348e', '#3eaf7c',  '#92af3e', '#af7e3e', '#af593e',  '#3ea8af', '#af3e3e']
export default {
  name: 'Card',
  props: {

  },
  computed: {

  },
  data(){
    return {
      list,
      bgColors
    }
  },
  methods: {

  }
}
</script>

<style scoped>
*{
  box-sizing: border-box;
}
.main{
  width: 100%;
}
.list{
  display: flex;
  /* justify-content: space-around; */
  flex-wrap: wrap;
}
.sub{
  flex: 0 0 32%;
  /* height: 200px; */
  position: relative;
  
  cursor: pointer;
  margin-right: 2%;
  margin-bottom: 2%;
}
@media (max-width: 750px) { 
  .sub{
    flex: 0 0 100%;
  }
}
.sub.nomargin{
  margin-right: 0;
}
.sub .cover{
  position: relative;
  height: 120px;
  background: #fbfbfb !important;
  /* border: 1px solid hsla(0,0%,80%,.569); */
  border-radius: 5px;
  font-size: 24px;
  text-align: center;
  line-height: 120px;
  color: #000;
  transition: all .2s ease-in-out;
  font-weight: 200;
  border: 1px solid #f1f1f1;
}
.sub .cover:hover{
  box-shadow: 0 18px 32px -18px #000!important;
  transform: translateY(-3px);
}
.sub .desc{
  width: 100%;
  color: #9c9c9c;
  line-height: 28px;
  padding: 5px 8px;
  font-weight: 400;
}
.sub .labels{
  position: absolute;
  bottom: 0;
  display: flex;
  line-height: 16px;
  font-size: 12px;
  padding: 5px;
}
.sub .labels span{
  padding: 3px 5px;
  background: #4CAF50;
  color: #fff;
  display: inline-block;
  margin-right: 5px;
  border-radius: 4px;
  zoom: .8;
  font-weight: 500;
}
</style>
