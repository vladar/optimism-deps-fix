# Optimism bugfix repro and benchmark

When `resultCacheMaxSize` is set, [optimism](https://github.com/benjamn/optimism/) doesn't clear some data in `depsByKeys`.

This repo contains a simple repro for the issue.
It also contains potential fix (see [patch](./patches/optimism+0.16.1.patch)) + memory benchmark with and without the fix.

The benchmark has `resultCacheMaxSize` set to `100` and writes a list of 10 items to cache 1000 times.
Items are never repeated, i.e. 10000 items are written in total (with 1000 root-level fields).

```js
const result = {
  data: {
    __typename: "Query",
    myList: [
      { __typename: "ListEntry", id: "1", title: "Title1" },
      { __typename: "ListEntry", id: "2", title: "Title2" },
      // ... up to 10
    ],
  },
};
```

- Issue: https://github.com/benjamn/optimism/issues/497
- Proposed fix: https://github.com/benjamn/optimism/pull/498

# Run benchmark

```
yarn
yarn bench
```

On my machine outputs:

```
{
  withFix: { jsHeapAvg: 10748806.4 },
  withoutFix: { jsHeapAvg: 11712492.8 }
}

Version with the fix has 8.2% smaller JS heap
```
