<template lang="html">
  <div>
    <div class="title">
      @Vue3js.cn
      <button @click="run">运行一下</button>
    </div>
    <div class="example">
      <div class="codemirror">
        <codemirror ref="cmEditor" v-model="code" :options="cmOption" />
      </div>
      <div class="result">
        <h3>result:</h3>
        <div id="iframe"></div>
      </div>
    </div>
  </div>
</template>

<script>
import { codemirror } from "vue-codemirror";
// base style
import "codemirror/lib/codemirror.css";
// theme css
import "codemirror/theme/base16-dark.css";
// language
import "codemirror/mode/vue/vue.js";
// active-line.js
import "codemirror/addon/selection/active-line.js";
// styleSelectedText
import "codemirror/addon/selection/mark-selection.js";
import "codemirror/addon/search/searchcursor.js";
// highlightSelectionMatches
import "codemirror/addon/scroll/annotatescrollbar.js";
import "codemirror/addon/search/matchesonscrollbar.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/match-highlighter.js";
// keyMap
import "codemirror/mode/clike/clike.js";
import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/addon/comment/comment.js";
import "codemirror/addon/dialog/dialog.js";
import "codemirror/addon/dialog/dialog.css";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/search.js";
import "codemirror/keymap/sublime.js";
// foldGutter
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/addon/fold/brace-fold.js";
import "codemirror/addon/fold/comment-fold.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/fold/foldgutter.js";
import "codemirror/addon/fold/indent-fold.js";
import "codemirror/addon/fold/markdown-fold.js";
import "codemirror/addon/fold/xml-fold.js";

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
      code: `<!DOCTYPE html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<title>Vue 测试33实例 - 菜鸟教程(runoob.com)</title>\n<script src=\"https://cdnjs.cloudflare.com/ajax/libs/vue/2.2.2/vue.min.js\"></script>\n</head>\n<body>\n<div id=\"app\">\n  <p>原始字符串: {{ message }}</p>\n  <p>计算后反转字符串: {{ reversedMessage }}</p>\n</div>\n\n<script>\nlet vm = new Vue({\n  el: '#app',\n  data: {\n    message: 'Runoob!'\n  },\n  computed: {\n    // 计算属性的 getter\n    reversedMessage: function () {\n      return this.message.split('').reverse().join('')\n    }\n  }\n})\n</script>\n</body>\n</html>`,
      cmOption: {
        tabSize: 4,
        foldGutter: true,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        keyMap: "sublime",
        mode: "text/x-vue",
        theme: "base16-dark",
        extraKeys: {
          F11(cm) {
            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
          },
          Esc(cm) {
            if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
          }
        }
      }
    };
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
  max-width: 70%;
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
.title {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
}
.title button {
  padding: 10px 15px;
  background: #4caf50;
  border-radius: 3px;
  color: #fff;
  border: none;
}
.example {
  display: flex;
  height: 70vh;
  background: #f7f7f7;
  padding: 30px;
  border-radius: 15px;
}
.codemirror,
.result {
  width: 50%;
  height: 100%;
  margin: 0;
  overflow: auto;
  padding-top: 0;
}

.result {
  display: block;
  padding: 1rem;
  line-height: 1.6;
  word-break: break-all;
  word-wrap: break-word;
}
.result h3{
  margin: 0;
}
</style>
