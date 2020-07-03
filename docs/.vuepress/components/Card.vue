<template lang="html">
  <div class="main">
    <div v-for="item in list">
      <h3>{{item.title}}</h3>
      <div class="list">
        <div v-for="sub in item.data" class="sub" :style="{background: `url(${sub.img}) no-repeat`, backgroundSize: '100%'}">
          <div class="title">{{sub.title}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const list = [
  {
    title: '官方推荐库',
    data: [
      {
        desc: '',
        img: 'http://static.vue-js.com/feef6400-bc18-11ea-9a81-55f6f6d89e24.png',
        title: 'Vue Router'
      },
      {
        desc: '',
        img: 'http://static.vue-js.com/cbdf2fa0-bc18-11ea-9a81-55f6f6d89e24.png',
        title: 'Vuex'
      },
      {
        desc: '',
        img: 'http://static.vue-js.com/2c3c6020-bc19-11ea-9a81-55f6f6d89e24.png',
        title: 'Axios'
      },
    ]
  }
]
export default {
  name: 'Card',
  props: {

  },
  computed: {

  },
  data(){
    return {
      list
    }
  },
  methods: {

  }
}
</script>

<style scoped>
.main{
  width: 100%;
}
.list{
  display: flex;
}
.sub{
  flex: 0 0 30%;
  height: 200px;
  background-size: 100%;
}
</style>
