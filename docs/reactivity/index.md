### reactivie 整体概览



前面又说到过，开始之前我们要理清楚各个文件之间的关系及作用，那么在我们即将要开始进入`reactive`之前，我们也来理一下整个`reactive`的文件结构

```
.
├── LICENSE
├── README.md
├── __tests__  // 单元测试目录
│   ├── collections
│   │   ├── Map.spec.ts
│   │   ├── Set.spec.ts
│   │   ├── WeakMap.spec.ts
│   │   └── WeakSet.spec.ts
│   ├── computed.spec.ts
│   ├── effect.spec.ts
│   ├── reactive.spec.ts
│   ├── reactiveArray.spec.ts
│   ├── readonly.spec.ts
│   └── ref.spec.ts
├── api-extractor.json
├── index.js
├── package.json
└── src
    ├── baseHandlers.ts
    ├── collectionHandlers.ts
    ├── computed.ts
    ├── effect.ts
    ├── index.ts
    ├── operations.ts
    ├── reactive.ts
    └── ref.ts
```