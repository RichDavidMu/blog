---
title: useSelector是如何触发更新的以及手写一个简单的useSelector
date: 2022-02-15 18:04:00
index_img: https://d33wubrfki0l68.cloudfront.net/0834d0215db51e91525a25acf97433051f280f2f/c30f5/img/redux.svg
tags: [redux]
categories: [源码解读]
---
## 概述
`useSelector`是`react-redux@7`中加入的hook，可以在不使用`connect()`的情况下将函数组件连接到redux，这样代码写起来会更加清晰，更加方便。

使用起来也很简单，我们写一个简单的加减数组件来看一下
```typescript
// index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, Reducer } from 'redux';
import { Provider } from 'react-redux';
import Sub from './sub';

export interface StoreState {
  count: number
}
export interface StoreAction {
  type: 'change'
  payload: StoreState
}

const reducer: Reducer<StoreState, StoreAction> = (state, action) => ({ ...state, ...action.payload });
const store = createStore(reducer, { count: 0 });

function App() {
  return (
    <Provider store={store}>
      <Sub />
    </Provider>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));

```
``` typescript
// Sub.tsx
import React from 'react';
import { StoreState, StoreAction } from './index';
import { useDispatch, useSelector } from 'react-redux';

export default function Sub() {
  const count = useSelector<StoreState, number>((state) => state.count);
  const dispatch = useDispatch<StoreAction>();
  const customEqalityCount = useSelector<StoreState, number>((state) => state.count, (a, b) => a > b);
  
  return (
    <div>
      <div>{count}</div>
      <div onClick={() => dispatch(
        {
          type: 'change',
          payload: { count: count + 1 },
        },
      )}>
        点击增加
      </div>
      <div onClick={() => dispatch(
        {
          type: 'change',
          payload: { count: count - 1 },
        },
      )}>
        点击减少
      </div>
      <div>{customEqalityCount}</div>
    </div>
  );
}
```
在`index.tsx`中创建了一个`store`，丢到`Provider`中，在子组件中使用`useSelector`获取`store`中最新的state, `useDispatch`更新`store`中的state，这样一个简单的加减数功能就完成了，注意在`Sub`中第二个`useSelector`使用了两个参数，向它传递了一个新旧`count`比较函数，只有该函数返回`false`的时候才会触发更新。在这里我传了一个`(a, b) => a > b`，意味着该值只能减少不能增加。

可以在[sandbox](https://codesandbox.io/s/sad-violet-65vrz?file=/src/App.tsx)里玩下试试

## 原理浅析
其实原理也不复杂，使用了`useContext`的特性，但看过源码后，发现直接想的一些细节很妙。
我们可以先想一下，实现一个`useSelector`有哪些问题需要解决：
+ 如何获取`store`
+ 如何知道`store`中的`state`已经变了
+ 如何触发组件re-render
+ 如何记录变化前的`state`
+ 如何返回用户希望拿到的`state`

第一个问题最简单，直接使用`useContext`就可以拿到。怎么知道`state`已经变了呢，这里我一开始有个误区，以为直接把`store`放到`useEffect`的依赖里，他只要一变，我就用`store.getState()`重新获取。可问题是`store`会变吗，答案是不会，`stor`e是一个对象，只要`store`通过`createStore()`创建，这个对象的引用就不会变。

那么如何解决呢，答案就在谜面上，在`store.subscribe()`里订阅就可以了，我们可以在回调函数中比较变化前后的`state`，去触发更新。

OK，如何触发组件re-render呢，这个也比较简单，用 `useState` 或 `useReducer` 记录一个无意义的状态，在需要重新渲染的时候，改变它就可以了。

如何记录变化前后的`state`呢，可以用`useState` `useReducer`吗，当然不可以，我们记录之前的`state`是为了与现在的`state`进行比较，从而决定是否触发组件更新，使用这两个api可能引起额外的非必要更新，那能记录状态且不会触发re-render的api只有`useRef`了。

如何返回用户想要的state呢，哈哈哈，自定义hook是个函数呀，直接返回就完事了。

## 手写一个简单的useSelector
原理差不多搞清楚了之后，我们就可以来试着模拟一个useSelector，实践一下。*注：以下实现简化了源码中的很多细节*

首先，我们需要有一个context
```typescript
// context.ts
import { createContext } from "react";
import { AnyAction, Store } from "redux";

const StoreContext = createContext<Store<any, AnyAction>>(null as any);
export default StoreContext;
```

有了context就可以写provider跟useDispatch了
```typescript
// Provider.tsx
import React from 'react';
import { AnyAction, Store, Action } from 'redux';
import StoreContext from './context';

interface ProviderParams<T extends Action = AnyAction, S = any> {
  store: Store<S, T>,
  children: JSX.Element
}

export default function Provider
<T extends Action = AnyAction>({ store, children }: ProviderParams<T>) {
  // @ts-ignore
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

// useDispatch.ts
import { useContext } from 'react';
import { Action, Dispatch } from 'redux';
import StoreContext from './context';

export default function useDispatch<T extends Action>(): Dispatch<T> {
  const store = useContext(StoreContext);
  return store.dispatch;
}
```

然后就可以将最开始index.tsx的代码改一下，引用我们自己文件。
```typescript
// index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, Reducer } from 'redux';
import Provider from './Provider';
import Sub from './sub';
// ...
```
我们在这里创建store，通过context传下去。
接下来就可写useSelector了
```typescript
import {
  useContext, useEffect, useReducer, useRef,
} from 'react';
import StoreContext from './context';

type EqualityFn<T> = (a: T, b: T) => boolean;

export default function useSelector<T, Selected extends unknown>(
  selector: (state: T) => Selected,
  equalityFn?: EqualityFn<Selected>,
): Selected {
  const store = useContext(StoreContext);
  const [, forceRender] = useReducer((s) => s + 1, 0);

  const latestStoreState = useRef<T>(store.getState());
  const latestSelectedState = useRef<Selected>(selector(latestStoreState.current));

  useEffect(() => {
    function checkUpdate() {
      const newState = store.getState();
      if (newState === latestStoreState) return;

      const newSelectedState = selector(newState);
      if (!equalityFn) equalityFn = (a, b) => a === b;

      if (!equalityFn(newSelectedState, latestSelectedState.current)) {
        latestSelectedState.current = newSelectedState;
        latestStoreState.current = newState;
        forceRender();
      }
    }
    const unsubscribe = store.subscribe(checkUpdate);
    return () => unsubscribe();
  }, [store]);

  return latestSelectedState.current;
}
```
最后改下sub.tsx中的代码，引用我们自己的文件
```typescript
import React from 'react';
import { StoreState, StoreAction } from './index';
import useDispatch from './useDispatch';
import useSelector from './useSelector';
//...
```
可以在[sandbox](https://codesandbox.io/s/blissful-fire-g00xj?file=/src/index.tsx:0-606)中试一下，效果跟之前是一样的

## 尾巴
上面的原理是借鉴了`react-redux@7`中的实现，使用一个forceUpdate去触发re-render，但在`@8-beta`中，useSelector直接使用了React18提供的`useSyncExternalStore`api去做这件事，关于这个api可以在[这里](https://www.zhihu.com/question/502917860)了解一下。

## 参考
[How useSelector can trigger an update only when we want it to](https://medium.com/async/how-useselector-can-trigger-an-update-only-when-we-want-it-to-a8d92306f559)

[React Redux Doc: Hooks](https://react-redux.js.org/api/hooks)

[react-redux](https://github.com/reduxjs/react-redux)

[redux](https://github.com/reduxjs/redux)