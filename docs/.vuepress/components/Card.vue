<template lang="html">
  <div class="main">
    <div v-for="item in list">
      <h3 v-if="item.title">{{item.title}}</h3>
      <div class="list">
        <a v-for="(sub, inx) in item.data" :href="sub.link" _target="blank" class="sub" :class="{nomargin: (inx+1)%3===0}">
          <div v-if="sub.img" class="cover" :style="{background: `url(${sub.img}) no-repeat`, backgroundSize: '100%'}">
            <div class="labels" v-if="sub.labels">
              <span v-for="label in sub.labels">{{label}}</span>
            </div>
          </div>
          <div v-else class="cover" :style="{background: bgColors[Math.floor(Math.random() * bgColors.length)]}">
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
        link:  'http://vue3js.cn/docs/zh'
      },
      {
        desc: '国内CDN加速版',
        img: '',
        title: 'Vue3文档',
        link:  'http://vue3js.cn/docs/'
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
        link:  '/start/'
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
  background: #fbfbfb;
  /* border: 1px solid hsla(0,0%,80%,.569); */
  border-radius:  5px;
  font-size: 24px;
  text-align: center;
  line-height: 120px;
  color: #fff;
  transition: all .2s ease-in-out;
}
.sub .cover:hover{
  box-shadow: 0 18px 32px -18px #000!important;
  transform: translateY(-3px);
}
.sub .desc{
  /* position: absolute; */
  width: 100%;
  color: #333;
  /* text-shadow: 0 2px 4px rgba(7,17,27,.5); */
  /* font-weight: 700; */
  /* background: rgba(28,31,33,.6); */
  /* bottom: 0; */
  line-height: 28px;
  padding: 5px 8px;
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
  background: rgba(0, 0, 0, .5);
  color: #fff;
  display: inline-block;
  margin-right: 5px;
  border-radius: 4px;
  zoom: .8;
}
</style>
