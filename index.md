---
title: Ellx documentation
---

<style>
  p a, #app ul a {
    text-decoration: underline;
  }

  table {
    width: 100%;
    margin-bottom: 2rem;
  }

  blockquote {
    font-family: monospace;
  }

  p code {
    background: lavender;
    border-radius: 3px;
    padding: 0.1rem;
    font-size: 12px;
  }

  #md p {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  .mode-dark p code {
    background: gray;
  }

  table code {
    font-size: 12px;
  }
</style>

# Introduction to Ellx

## Overview
Ellx takes the pain out of using spreadsheets and notebooks at scale.

It embraces the concept of [exploratory programming](https://en.wikipedia.org/wiki/Exploratory_programming), i.e. your code is evaluated as you write it, which is the defining paradigm of notebooks and spreadsheets.

At the same time, all your code remains testable, source-controlled, with business logic separated from presentation.

Ellx harnesses the full exploratory power of a spreadsheet, where you can easily draw associative insights from your data presented in a tabular form, and design reactive data flows.

It runs 100% locally in your browser, which means it is very responsive, and you won't have to install anything else.

It is a perfect tool to explore new libraries and APIs, quickly bootstrap a prototype of your application, and ultimately deploy it in production as an independent website, or (soon) as a serverless microservice.

Ellx is arming you with tools to set up a proper production release process for your projects, with dependencies management and CI/CD.

No compromises are made as to what you can achieve with it. It is all up to your imagination!

## Project structure

Ellx project is a collection of files and folders you can see in the project explorer on the left. Click on `(…)` next to an item (or right-click the item) to see a list of available actions. Also <kbd>Ctrl+Shift+P</kbd> opens a *command palette*.

Project files are backed by AWS S3. Ellx servers are only keeping the metadata.

You can also use your local file system as a backend. In this case, you need to run the [Ellx CLI](https://github.com/ellxoft/ellx-cli) to serve your project locally.

At the moment a project can be either public (read-write for the owner and read-only for everyone else) or private (only accessible by the owner). Private is the default.

You can make your project public by clicking on the red lock sign next to it on your profile page (`https://ellx.io/{username}`).

[Explore](https://ellx.io/explore) other users' projects, and *fork* them to make changes.

To create a folder inside your project terminate a new item's name with a slash (`/`). Alternatively, you can directly create a nested file by naming it, for example, `folder/nested.js`

#### Namespaces
Projects can contain files of any type, however, the following filename extensions are treated specially:

- `.js :` JavaScript module
- `.ellx :` spreadsheet
- `.md :` markdown layout

Files with these extensions, sharing the same name and located in the same folder, constitute a single namespace:
- Any named export of a script is available in both sheet and layout within the same namespace
- Any node defined in the sheet is available in the layout and vice versa.

In general, the name resolution works as follows:
- check if *name* is a [built-in function](#built-in-functions)
- look for a node in the same document (`.ellx` if referenced from a sheet or `.md` if referenced from a layout)
- look for a node in the sibling document (`.md` if referenced from a sheet or `.ellx` if referenced from a layout)
- look for the named export in the script within the same namespace
- look for a globally defined symbol (in the `window` object)
- throw a `{name} not defined` error

Check out examples in the following sections.

Use Alt-1/2/3 to switch between namespace `.js`, `.ellx`, and `.md` respectively.

### Scripts
Unlike classical notebooks, most of the code is gathered in plain javascript files, which are independently testable and easy to share between projects.

`.js` files are standard ES6 modules, which means you can `import` and `export` stuff.

To import a module from the same project, use relative or absolute paths (relative to the root of the project), e.g.
```
import foo from './folder/foo.js';
import { default as bar } from '../anotherFolder/bar.js';
import * as baz from '/fileAtProjectRoot.js';
```
To import a module from another project (including another user's project) add a tilde (`~`) in front of the file's full path, including user and project name, e.g.
```
import slider from '~ellx-hub/lib/components/Slider';
import { plot } from '~ellx-hub/plot';
```
Note that, like in NodeJS, Ellx tries to automatically append `.js` and `/index.js` to resolve imports without extensions.

Out of the box you can also import `.svelte` (Svelte components), `.jsx` (React components), `.vue` (Vue components: *coming soon*), `.css`, `.json`, and `.glsl` (WebGL shaders) files, like with most modern web bundlers.

Keep an eye on [~ellx-hub](https://ellx.io/ellx-hub) user: it is Ellx official open-source collection of components and utilities.

Please, contribute! Open an issue if you find one. Submit a pull request if you have a fix or an improvement!

##### NPM modules
You can directly import any NPM module published in UMD or ESM format, e.g.
```
import * as tf from '@tensorflow/tfjs@2.5';
```
Ellx is currently using [JSDelivr](https://www.jsdelivr.com) CDN to serve NPM modules.

You can also `import` from arbitrary URLs, e.g.
```
import gauss_legendre from 'https://cdn.skypack.dev/gauss_legendre';
```
We actually encourage you to try using [Skypack](https://cdn.skypack.dev) for your NPM dependencies. It is currently less stable than JSDelivr but serves the modules directly in ESM format, which allows Ellx to collect dependencies statically.

##### Exports
All symbols you export from a `.js` file are (obviously) available to be imported by other modules (including from other projects), but can also be used within the same namespace in formulas on the spreadsheet or in the markdown layout interpolations delimited with curly braces, e.g.

```js
// index.js
export const test = 42;

// index.md
Test is { test }
```

will render
>Test is { test }

### Spreadsheets

Spreadsheets are core to the Ellx platform. If the scripts are *"flesh and bones"* of your application, then the spreadsheets are its *"nervous system"*.

Use them to
- fetch and analyze your data
- implement reactive logic to define, visualize, and debug the data processing flow
- `require` dynamic dependencies

A spreadsheet is also a sort of "back-of-the-napkin" calculation space - a piece of "checkered paper" where you can explore your data in a convenient tabular form.

#### Addressing scheme
Ellx semantic model is slightly different from the classical Excel spreadsheet. However, you will find it intuitive and familiar in a lot of ways. Let's outline here the main differences.

Ellx cells don't use the Excel addressing scheme i.e. A11, $D$4, etc. Instead, all calculation graph nodes - cells that are referenced in other formulas - should be given a name.

| Expression  | Value     |
|:------------| ---------:|
| `i = 33`     | { i = 33 } |
| `j = 56`     | { j = 56 } |
| `k = i + j` | { k = i + j } |

Cells in the spreadsheet entered without an *=* sign (not named) are not part of the calculation graph and cannot be referenced in formulas.

If you start a formula with an *=* sign, but don't name it, a generated name will be assigned:

| Expression  | Value     |
|:------------| ---------:|
| `= Math.sqrt(j * j + i * i)` | { $1 = Math.sqrt(j * j + i * i) } |
| `$1`     | { $1 } |

The right-hand side expression can be (almost) any valid [JS expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators) which can include object and array literals, as well as arrow functions, but cannot include any block statements.

Symbols referenced in formulas are resolved following the algorithm described in the [Namespaces](#namespaces) section, e.g.
```js
// index.js
export const test2 = 'I am defined in the script';

// index.ellx
test2 = 'I am defined in the sheet'

// index.md
{ test2.toUpperCase() }
```

will render:
>{ test2.toUpperCase() }

#### Working with arrays and objects

A node of the calculation graph can be any JS object, including functions, objects, or arrays. JS objects and arrays may be expanded in 2d using <kbd>Shift-Alt-Down/Right</kbd> shortcuts.

| Expression  | Value     |
|:------------| ---------:|
| `r1 = range(4)` | { r1 = range(4) } |
| `m1 = r1.map(x => ({ x, 'x^2': x * x }))` | { m1 = r1.map(x => ({ x, 'x^2': x * x })) } |

Use <kbd>Shift-Alt-Down</kbd> to expand the array vertically:

```js
{x: 0, x^2: 0}
{x: 1, x^2: 1}
{x: 2, x^2: 4}
{x: 3, x^2: 9}
```

<kbd>Shift-Alt-Right</kbd> will expand each value to it's own cell:

```js
x   x^2
0   0
1   1
2   4
3   9
```
Use <kbd>Shift-Alt-Z/X</kbd> to toggle left/top labels.

#### Built-in functions

Besides `range` that you've seen before spreadsheet has few other built-in functions:

##### require
`require(dependency)` Import a dynamic dependency.

`dependency` can be a URL or an NPM package name. You can also `require` other scripts from _the same_ project.

| Expression  | Value     |
|:------------| ---------:|
| `leftpad = require('leftpad')` | { leftpad = require('leftpad') } |
| `= leftpad('111', 4)` | { leftpad('111', 4) } |

##### range
`range(n)` Returns an array `[0..n-1]`

| Expression  | Value     |
|:------------| ---------:|
| `r20 = range(20)` | { r20 = range(20) } |

##### sum

`sum(iterable)` Return sum of all elements of an *iterable*.

Supports [async transform](#async-transform) and [operator overloading](#operator-overloading) for the elements of the `iterable`.

| Expression  | Value     |
|:------------| ---------:|
| `rsum = sum(r20)` | {rsum = sum(r20) } |

##### race

`race(...args)` Will return quickest result among async *args*.

| Expression  | Value     |
|:------------| ---------:|
| `(x => x * x)(race([delay(10, () => -1)(), delay(1, () => 5)()]))` | { (x => x * x)(race([delay(10, () => -1)(), delay(1, () => 5)()])) } |

##### delay
`delay(ms, val)` will resolve to *val* after *ms* milliseconds.

| Expression  | Value     |
|:------------| ---------:|
| `value = rangeInput()` | { value = rangeInput() }
| `delayedValue = delay(1000, value)` | { delayedValue = delay(1000, value) }
| `= sum(range(delayedValue))` | { sum(range(delayedValue)) }

#### Async transform

Ellx is designed to simplify complex system integration tasks, which are often asynchronous by nature. If a result of any intermediate expression within a formula is a Promise (or an iterator) it will be automatically resolved (iterated to the end) in the most efficient fashion: calculations that can be run in parallel will still run in parallel.

| Expression | Value |
|:-----------| -----------:|
| `strings = ['first', 'second', 'third']` | { strings = ['first', 'second', 'third'] } |
| `dsec = rangeInput()` | { dsec = rangeInput() } |
| `delayed = strings.map((s, i) => delay((i + 1) * dsec * 10, s))` | { delayed = strings.map((s, i) => delay((i + 1) * dsec * 10, s)) } |
| `delayed.map(s => s.toUpperCase())` | { delayed.map(s => s.toUpperCase()) }

Ellx implements a *just-in-time* transpilation mechanism when evaluating formulas, so if the intermediate expressions are actually synchronous, there will be no performance penalty.

#### Operator overloading

The same *"transpilation at first evaluation"* mechanism is what allows Ellx to enrich the Javascript grammar with the long-missing operator overloading support on the fly.

Arithmetic and logical operators are applied element-wise to JS built-in objects and arrays, e.g.
```js
(x => x * x)(range(5))
```
returns
>{ (x => x * x)(range(5)) }.

You can add operator overloading support to any existing class by adding `__EllxMeta__` property to its prototype, e.g.
```js
import * as tf from '@tensorflow/tfjs';

tf.Tensor.prototype.__EllxMeta__ =   {
  operator: {
    binary: {
      '+': (lhs, rhs) => tf.add(lhs, rhs),
      '-': (lhs, rhs) => tf.sub(lhs, rhs),
      '*': (lhs, rhs) => tf.mul(lhs, rhs),
      '/': (lhs, rhs) => tf.div(lhs, rhs),
      '<': (lhs, rhs) => tf.less(lhs, rhs),
      '<=': (lhs, rhs) => tf.lessEqual(lhs, rhs),
      '>': (lhs, rhs) => tf.greater(lhs, rhs),
      '>=': (lhs, rhs) => tf.greaterEqual(lhs, rhs),
    },
    unary: {
      '!': rhs => tf.logicalNot(rhs),
      '-': rhs => tf.neg(rhs),
      '+': rhs => rhs,
    }
  }
};
```

### Layouts

Layouts are the *"skin"* of your application. Build an interactive storybook, documentation, or a dashboard for your project, using simple classical markdown syntax.

Ellx uses [remark](https://github.com/remarkjs/remark) to render markdown.

#### Reactive expressions

Ellx layouts parse expressions between curly braces `{ [node =] expr }` as reactive formulas, in exactly the same way as formulas on the spreadsheet, e.g.

```
My IP address is { myIp = fetch('https://ipinfo.io/ip').text().trim() }
{ myIp.split('.').map(x => String.fromCodePoint(+x + 0x1f400)).join('') }
```

will output

> My IP address is { myIp = fetch('https://ipinfo.io/ip').text().trim() }
{ myIp.split('.').map(x => String.fromCodePoint(+x + 0x1f400)).join('') }

#### Math formulas
[KaTeX](https://github.com/KaTeX/KaTeX) syntax is supported:

Lift ($L$) can be determined by Lift Coefficient ($C_L$) like the following equation.

```js
$$
L = \frac{1}{2} \rho v^2 S C_L
$$
```
will produce

$$
L = \frac{1}{2} \rho v^2 S C_L
$$


#### Code highlighting
Ellx uses [prism.js](https://prismjs.com) for code highlighting. Wrap a code snippet in three ticks (\`)

<pre class="text-black px-4  bg-gray-100 dark:bg-gray-300">```[js|html|css]?
function sum(a, b) {
  return a + b;
}
```</pre>

will output
```js
function sum(a, b) {
  return a + b;
}
```

or single tick for inline code block `like this`.

#### YAML configuration
[Frontmatter-style](https://jekyllrb.com/docs/front-matter/) configuration is already supported although with only a few options at the moment.

```html
---
title: project-title # Override project title displayed in the published version
nav: true|false # Toggles sidebar navigation in publishing
---
```
You can also embed any HTML markup directly into your layout, for example, styles.


### Component API

You might have noticed how certain nodes are rendered as plain text while others as graphic components.

Components are special Ellx nodes that can maintain an internal state. This is the most powerful feature of Ellx, elevating it from a fancy spreadsheet to basically a fully functional application framework.

When building reactive systems, it is crucial to enforce the referential transparency of all node expressions, i.e., given the same inputs, formulas should always output the same results. Otherwise, you are doomed to debug nasty surprised.

However, in complex open systems, the inputs may come from outside, e.g. user input, and caching logic may need to be customized as well.

This is where components come into play. A component is simply defined by its *props* and its constructor. If a formula returns an object with `__EllxMeta__: { component: [Function] }` property, then it is an Ellx component, and the following logic is applied:

- If the node does **not** already hold a component, a new component is created as `new component(props, options)`, where `props` is the result of the formula itself, and `options` are explained below.
- If the node already holds a component that has been previously created by the **same** constructor `component`, then its `update(props)` method is called.
- If the node already holds a component that has been previously created by a different constructor (in a strict `===` sense), then the previous component is destroyed and a new one is created as in the first case.

For example,
```js
// index.js
class Hello {
  constructor(props, { output }) {
    this.output = output;
    this.count = 0;
    this.update(props);
  }
  update(props) {
    this.output(`Hello ${props.name}! (updated ${this.count++} times)`);
  }
}

export const hello = name => ({
  name,
  __EllxMeta__: { component: Hello }
});

export { default as input } from "~ellx-hub/lib/components/Input";

// index.md
{ name = input({ value: 'Ellx' }) }
{ hello(name) }
```

{ name = input({ value: 'Ellx' }) }

>{ hello(name) }

Ellx component API consists of only 5 lifecycle hooks that a component may implement, and all of them are optional except the constructor.

```
constructor(props, { output })
```
Ellx calls the component's constructor (`__EllxMeta__.component`) with 2 parameters: the result of the formula, representing the component's `props`, and an `options` object which at the moment contains only one useful field: the `output(value)` callback.

The component can call `output(value)` to push any `value` back into the Ellx reactive graph any time during its lifetime. The `value` will replace the calculated `props` in the graph, and will propagate to the node's dependents.

This is very useful for implementing components collecting user input, such as most of the UI components in [Ellx standard library](https://ellx.io/ellx-hub/lib).
The `Hello` component example above does precisely this on each props `update`.

Note that if your component wishes to use this mechanism, it is imperative to call `output(value)` from within the `constructor` at least for the first time. If the first value is not yet ready you should output a `Promise` or an iterator.

If the `constructor` does not call `output(value)` synchronously, the node would keep the calculated `props` as its value.
```
update(props)
```

While the constructor is called only when the component is first created, its `update` method is called every time the node is recalculated to produce the new `props`, and its result is passed to `update` as its only argument.

This is precisely what allows components to maintain an internal state through node recalculations.

```
stale()
```
If a component does not implement the `stale` hook, it will be destroyed if its props become *stale*, e.g. as a result of an async calculation which has not yet resolved, and re-created again when resolved props become available.

Implementing the `stale` hook allows the component to treat these situations gracefully, for instance, by rendering a *spinner* and/or choosing to output a previously calculated value to node dependents.

```
render(target)
```
This argument to the `render` hook is the DOM node, where the component is supposed to render itself in the context of a spreadsheet or a layout.

However, components have full access to the DOM of the project's sandboxed iframe and may append themselves directly to the `document` or `head` if they choose so, without even necessarily implementing the `render` hook.

```
dispose()
```
`dispose` is called before the component is destroyed:
- when the node is removed
- when an error is thrown upstream
- when the props become stale and the `stale` handler is not implemented
- when the node formula returns a different component constructor or no constructor in `__EllxMeta__`

## Ellx standard library
The [standard library project](https://ellx.io/ellx-hub/lib) is the official open-source collection of Ellx components and utilities.

Among other things it provides tools to wrap any existing [React](https://ellx.io/ellx-hub/lib/utils/react.js), [Svelte](https://ellx.io/ellx-hub/lib/utils/svelte.js), and Vue (*coming soon*) components, using the component API, e.g.

```js
// index.js
// Tiny wrapper over svelte-json-tree
export { default as pretty } from "~ellx-hub/lib/components/Pretty";

// index.md
{ pretty(m1) }
```
{ pretty(m1) }

## Ellx CLI
You can use Ellx to work on your local files directly. This is precisely how you would reap all the benefits of source control and [Github integration](#sync-with-github).

First, you need to install the [Ellx CLI](https://github.com/ellxoft/ellx-cli) package globally:
```html
$ npm i -g @ellx/cli
or
$ yarn global add @ellx/cli
```

Navigate to the directory you'd like to access in Ellx and run

```html
$ ellx -u your-username
```

This will run the local file server on port 3002 by default.

After that, you can navigate to your local project via the user menu on the top left of any page ("Ellx CLI connect") or by navigating straight to [https://ellx.io/external/localhost~3002](https://ellx.io/external/localhost~3002).

## Publishing

A project can be published as a stand-alone independent website: perfect for documentation, finished interactive reports and dashboards, or generative art installations.

The `index.md` file at the project's root is the default entry point for a published project. You can check how it is going to look like at the project preview page `https://ellx.io/{username}/{project}`.

You can either export and download it as an HTML file, or publish it at `https://{username}-{project}.ellx.app` from the project's context menu.

It normally takes about 2~3 minutes for the page to become available.

This document itself was generated with Ellx, you can fork and play with it [here](https://ellx.io/ellx-hub/docs/index.md).

## Sync with Github

Ellx provides integration with Github as a Pro tier feature. It enables syncing public or private Github repositories with Ellx projects using Github actions.

All you have to do is create a workflow file at `.github/workflows/my-action.yml`

```
on:
  push:
    branches:
      - master
      - 'release/**'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: ellxoft/ellx-sync@master
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

Note that this action will trigger sync whenever there's a new commit to `master` or `release/**` branches. Refer to [Github documentation](https://docs.github.com/en/actions) to learn about other kinds of triggers and other options.

Ellx uses the repo's `GITHUB_TOKEN` to set the `ellx-sync/{branch}` tag, thus authenticating the repo owner.

The contents of the corresponding branch are then uploaded to Ellx cloud as `https://ellx.io/{github-username)/{repo-name}@{version}`.

`@{version}` is only added for `release/{version}` branches.

If the repository is private on Github, the corresponding Ellx project will be made private as well. Idem for public repositories.
