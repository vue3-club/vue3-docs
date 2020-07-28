<template lang="html">
  <div>
    <div class="example">
      <div class="codemirror">
        <codemirror ref="cmEditor" v-model="code" :options="cmOption" />
      </div>
      <div class="run">
        @Vue3js.cn
        <button @click="run">运行一下</button>
      </div>
      <div class="result">
        <h3>result:</h3>
        <div id="iframe"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import dedent from 'dedent'
  import { codemirror } from 'vue-codemirror'
  // base style
  import 'codemirror/lib/codemirror.css'
  // theme css
  import 'codemirror/theme/base16-dark.css'
  // language
  import 'codemirror/mode/vue/vue.js'
  // active-line.js
  import 'codemirror/addon/selection/active-line.js'
  // styleSelectedText
  import 'codemirror/addon/selection/mark-selection.js'
  import 'codemirror/addon/search/searchcursor.js'
  // highlightSelectionMatches
  import 'codemirror/addon/scroll/annotatescrollbar.js'
  import 'codemirror/addon/search/matchesonscrollbar.js'
  import 'codemirror/addon/search/searchcursor.js'
  import 'codemirror/addon/search/match-highlighter.js'
  // keyMap
  import 'codemirror/mode/clike/clike.js'
  import 'codemirror/addon/edit/matchbrackets.js'
  import 'codemirror/addon/comment/comment.js'
  import 'codemirror/addon/dialog/dialog.js'
  import 'codemirror/addon/dialog/dialog.css'
  import 'codemirror/addon/search/searchcursor.js'
  import 'codemirror/addon/search/search.js'
  import 'codemirror/keymap/sublime.js'
  // foldGutter
  import 'codemirror/addon/fold/foldgutter.css'
  import 'codemirror/addon/fold/brace-fold.js'
  import 'codemirror/addon/fold/comment-fold.js'
  import 'codemirror/addon/fold/foldcode.js'
  import 'codemirror/addon/fold/foldgutter.js'
  import 'codemirror/addon/fold/indent-fold.js'
  import 'codemirror/addon/fold/markdown-fold.js'
  import 'codemirror/addon/fold/xml-fold.js'

export default {
  components: {
    codemirror
  },
  name: "Run",
  props: {},
  computed: {
    codemirror() {
      return this.$refs.cmEditor.codemirror;
    }
  },
  data() {
    return {
        code: `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Vue 测试实例</title>
<script src="https://doc.vue-js.com/js/vue.js">${'<\/script>'}
</head>
<body>
<div id="app">
  <p>{{ message }}</p>
</div>
<script>
new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue.js!'
  }
})
${'<\/script>'}
</body>
</html>
        `,
        cmOption: {
          tabSize: 4,
          foldGutter: true,
          styleActiveLine: true,
          lineNumbers: true,
          line: true,
          keyMap: "sublime",
          mode: 'text/html',
          htmlMode: true,
          theme: 'base16-dark'
        }
    };
  },
  mounted() {
    this.run()
  },
  methods: {
    run() {
      let text = this.codemirror.getValue();
      let patternHtml = /<html[^>]*>((.|[\n\r])*)<\/html>/im;
      let patternHead = /<head[^>]*>((.|[\n\r])*)<\/head>/im;
      let array_matches_head = patternHead.exec(text);
      let patternBody = /<body[^>]*>((.|[\n\r])*)<\/body>/im;

      let array_matches_body = patternBody.exec(text);
      let basepath_flag = 1;
      let basepath = "";
      if (array_matches_head) {
        text = text.replace("<head>", "<head>" + basepath);
      } else if (patternHtml) {
        text = text.replace("<html>", "<head>" + basepath + "</head>");
      } else if (array_matches_body) {
        text = text.replace("<body>", "<body>" + basepath);
      } else {
        text = basepath + text;
      }
      let ifr = document.createElement("iframe");
      ifr.setAttribute("frameborder", "0");
      ifr.setAttribute("id", "iframeResult");
      document.getElementById("iframe").innerHTML = "";
      document.getElementById("iframe").appendChild(ifr);

      let ifrw = ifr.contentWindow
        ? ifr.contentWindow
        : ifr.contentDocument.document
        ? ifr.contentDocument.document
        : ifr.contentDocument;
      ifrw.document.open();
      ifrw.document.write(text);
      ifrw.document.close();
    }
  }
};
</script>

<style >
.theme-default-content:not(.custom) {
  max-width: 60%;
}
.CodeMirror {
  border: 1px solid #eee;
  height: auto;
}

.CodeMirror-scroll {
  height: auto;
  overflow-y: hidden;
  overflow-x: auto;
}
</style>
<style scoped>
* {
  box-sizing: border-box;
}
.run {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}
.run button {
  outline: none;
  cursor: pointer;
  padding: 10px 15px;
  background: #4caf50;
  border-radius: 3px;
  color: #fff;
  border: none;
}
.example {
  height: 70vh;
}
.codemirror,
.result {
  margin: 0;
  overflow: auto;
  padding-top: 0;
  background: #f9f9f9;
  border: 1px solid #e8e8e8;
}

.result {
  display: block;
  padding: 1rem;
  line-height: 1.6;
  word-break: break-all;
  word-wrap: break-word;
  border-radius: 8px;
}
.result h3{
  margin: 0;
}
</style>
