###  parse.spec

`parse` 顾名思义，解析的意思，在这里指的是将 `Dom` 解析成 `Ast` 格式的数据，我们先来看一下测试结果

```js
Test Suites: 1 passed, 1 total
Tests:       135 passed, 135 total
Snapshots:   79 passed, 79 total
Time:        5.892s, estimated 6s
```
从结果中我们看到一共 `Tests` (单元) 135个，`Snapshots`(快照) 79个，还是蛮多的`case`，那么究竟都是哪些呢？下面我们先简单给分个类，大致如下:

1. 对于文本解析的描述
2. 对于插值解析的描述，即指 {{message}} 这种
3. 对于注释解析的描述
4. 对于元素解析的描述
5. 对于编码解析的描述
6. 对于空格解析的描述

### 文本解析



```js
import { ParserOptions } from '../src/options'
import { baseParse, TextModes } from '../src/parse'
import { ErrorCodes } from '../src/errors'
import {
  CommentNode,
  ElementNode,
  ElementTypes,
  Namespaces,
  NodeTypes,
  Position,
  TextNode,
  InterpolationNode
} from '../src/ast'
```

