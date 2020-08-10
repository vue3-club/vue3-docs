### defineComponent

> 实现方式的 defineComponent 只是返回传递给它的对象。但是，在类型方面，返回的值具有一个合成类型的构造函数，用于手动渲染函数、 TSX 和 IDE 工具支持 

### 从一个例子开始

```js
import { defineComponent } from 'vue'

const MyComponent = defineComponent({
  data() {
    return { count: 1 }
  },
  methods: {
    increment() {
      this.count++
    }
  }
})

console.log(`MyComponent:${MyComponent}`)
```
<a href="/run/defineComponent" target="_blank">亲自试一试</a>


