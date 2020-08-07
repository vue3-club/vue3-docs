export default {
  'nextTick-demo-1': `
  <!DOCTYPE html>
  <html>
    <head>
    <meta charset="utf-8">
    <title>nextTick</title>
    <script src="https://cdn.bootcdn.net/ajax/libs/vue/3.0.0-rc.5/vue.global.js">${"</script>"}
    </head>
    <body>
       <div id="app">
       </div>
       <script>
       const { nextTick } = Vue
       nextTick(()=>{
         alert(1)
       })
       alert(2)
      ${"</script>"}

    </body>
  </html>
          `,
  nextTick: `
  <!DOCTYPE html>
  <html>
    <head>
    <meta charset="utf-8">
    <title>nextTick</title>
    <script src="https://cdn.bootcdn.net/ajax/libs/vue/3.0.0-rc.5/vue.global.js">${"</script>"}
    </head>
    <body>
       <div id="app">
        <button @click="changeMessage('DOM updated')">{{message}}</button>
       </div>
       <script>
       const { createApp, nextTick, ref } = Vue
       const app = createApp({
         setup() {
           const message = ref('Hello!')
           const changeMessage = async newMessage => {
             message.value = newMessage
             await nextTick()
             console.log('Now DOM is updated')
           }
           return {
             message,
             changeMessage
           }
         }
       }).mount('#app')
      ${"</script>"}

    </body>
  </html>
          `,
  h: `
  <!DOCTYPE html>
  <html>
    <head>
    <meta charset="utf-8">
    <title>h()</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.0-rc.4/vue.global.js">${"</script>"}
    </head>
    <body>
       <div id="app">
       </div>
       <script>
        const App = {
          render() {
            return Vue.h('h1', {}, 'Hello Vue3js.cn')
          }
        }
        // console 结果请在控制台查看
        console.log(Vue.h('h1', {}, 'Hello Vue3js.cn'))
        Vue.createApp(App).mount('#app')
      ${"</script>"}

    </body>
  </html>
          `,
  defineComponent: `
  <!DOCTYPE html>
  <html>
    <head>
    <meta charset="utf-8">
    <title>defineComponent</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.0-rc.4/vue.global.js">${"</script>"}
    </head>
    <body>
      <p>本实例请打开控制台查看结果</p>
      <script>

      const MyComponent1 = Vue.defineComponent({
        data() {
          return {}
        },
        methods: {
        }
      })
      
      console.log(MyComponent1)

      const MyComponent2 = Vue.defineComponent(function(){
      })
      
      console.log(MyComponent2)
      ${"</script>"}

    </body>
  </html>
          `,
  start: `
  <!DOCTYPE html>
  <html>
    <head>
    <meta charset="utf-8">
    <title>从一个例子开始</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.0-rc.4/vue.global.js">${"</script>"}
    </head>
    <body>
       <div id="hello-vue">
        {{ message }}
       </div>
       <script>
       const HelloVueApp = {
        data() {
          return {
            message: 'Hello Vue!'
          }
        }
      }
      
      Vue.createApp(HelloVueApp).mount('#hello-vue')
      ${"</script>"}

    </body>
  </html>
          `,
  tree: `
  <!DOCTYPE html>
  <html>
    <head>
    <meta charset="utf-8">
    <title>Vue 测试实例</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.0-rc.4/vue.global.js">${"</script>"}
    </head>
    <body>
      <script type="text/x-template" id="item-template">
        <li>
          <div
            :class="{bold: isFolder}"
            @click="toggle"
            @dblclick="changeType">
            {{model.name}}
            <span v-if="isFolder">[{{open ? '-' : '+'}}]</span>
          </div>
          <ul v-if="isFolder" v-show="open">
            <tree-item
              class="item"
              v-for="model in model.children"
              :model="model">
            </tree-item>
            <li class="add" @click="addChild">+</li>
          </ul>
        </li>
      ${"</script>"}
      <script>
      const { reactive, computed, toRefs } = Vue
  
      const TreeItem = {
        name: 'TreeItem', // necessary for self-reference
        template: '#item-template',
        props: {
          model: Object
        },
        setup(props) {
          const state = reactive({
            open: false,
            isFolder: computed(() => {
              return props.model.children && props.model.children.length
            })
          })
  
          function toggle() {
            state.open = !state.open
          }
  
          function changeType() {
            if (!state.isFolder) {
              props.model.children = []
              addChild()
              state.open = true
            }
          }
  
          function addChild() {
            props.model.children.push({ name: 'new stuff' })
          }
  
          return {
            ...toRefs(state),
            toggle,
            changeType,
            addChild
          }
        }
      }
      ${"</script>"}
      <p>(You can double click on an item to turn it into a folder.)</p>
  
      <!-- the app root element -->
      <ul id="demo">
        <tree-item class="item" :model="treeData"></tree-item>
      </ul>
  
      <script>
      const treeData = {
        name: 'My Tree',
        children: [
          { name: 'hello' },
          { name: 'wat' },
          {
            name: 'child folder',
            children: [
              {
                name: 'child folder',
                children: [
                  { name: 'hello' },
                  { name: 'wat' }
                ]
              },
              { name: 'hello' },
              { name: 'wat' },
              {
                name: 'child folder',
                children: [
                  { name: 'hello' },
                  { name: 'wat' }
                ]
              }
            ]
          }
        ]
      }
  
      Vue.createApp({
        components: {
          TreeItem
        },
        data: () => ({
          treeData
        })
      }).mount('#demo')
      ${"</script>"}
  
      <style>
        body {
          font-family: Menlo, Consolas, monospace;
          color: #444;
        }
        .item {
          cursor: pointer;
        }
        .bold {
          font-weight: bold;
        }
        ul {
          padding-left: 1em;
          line-height: 1.5em;
          list-style-type: dot;
        }
      </style>
    </body>
  </html>
          `,
};
