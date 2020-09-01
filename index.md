---
title: Ellx documentation
---

<style>
  p a, #app ul a {
    text-decoration: underline;
  }
  
  table {
    width: 100%;
    margin-bottom: 4rem;
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
Ellx is an in-browser IDE with built in reactive engine which allows users to create complex programs, publish documentation and deploy production-ready code as serverless functions. Ellx features a reactive spreadsheet which allows to inspect JavaScript objects, maps and arrays in two dimensions and in real time which makes development experience easier than ever, as well as drawing insights from data. Many developers are used to tediously repeating the cycle of

- update code
- open browser/console/terminal
- inspect their data with debugger or else (which may involve a few extra clicks to get to the piece they actually need)

Ellx aims to simplify that process. It is also great for sketching, trying out new libraries or combining different pieces of code, be it external APIs, libraries, user code or even microservices written in a different language. 

Ellx reactive expressions have all the expressive power of JavaScript with a few extensions like [operator overloading](#operator-overloading) and [mixing sync and async operations](#sync-async).

In future Ellx spreadsheets will not only serve as an inspection tool but also as program entrypoints which will be deployed as serverless functions.

## Project structure

Ellx project is the file system-like abstraction which consists of files and folders which can be copied/renamed/removed as one could expect. There are two types of projects:

- **Cloud.** Created at https://ellx.io
- **Local.** Served with Ellx resource server locally. See local file server [section](#local-file-server) for details.

Cloud projects are created public by default but can be set to private on the user profile page (`https://ellx.io/*username*`). Beware that only subsequent writes to project files will be made as private since other users' projects could be referring to previously public project.

Projects can be forked, deleted and published. Published project is available at `{username}-{project}.ellx.app`. `index.md` is the default entry point for a project which gets published and can be found as a preview at `https://ellx.io/{user}/{project}`.

Note that folders are created with trailing slash `/`.

#### Namespaces
Ellx namespace consists of three files located in the same folder with the same name ending with `.ellx` (sheet), `.js` (script) and `.md` (layout). 

Any named export of a script is available in both sheet and layout within the same namespace. E.g.

```js
// index.js
export const test = 42;

// index.md
Test is { test }
```

Will render: "Test is { test }"

Any node defined in a sheet is available in layout and will override export with the same name in the script.

```js
// index.js
export const test2 = 43;

// index.ellx
test2 = 44

// index.md
Test2 is { test2 }
```

Will render: "Test2 is { test2 }"

Use Alt-1/2/3 to switch between namespace `.md`, `.js` and `.ellx` respectively.

### Spreadsheets

Reactive spreadsheets are core to Ellx platform. They can be seen as a powerful debugger where one can see live output of user and library code. In nearest future spreadsheets will be exported as serverless functions so they will be used as API entrypoints.

#### Addressing scheme
Ellx semantic model is only slightly different from the classical Excel spreadsheet. In a lot of ways you will find it intuitive and familiar, so let's outline here the main differences.

Ellx cells don't use the Excel addressing scheme i.e. A11, $D$4 etc. Instead, all calculation graph nodes - cells that are referenced in other formulas - should be given a name.

| Expression  | Value     |
|:------------| ---------:|
| `i = 3`     | { i = 3 } |
| `j = 5`     | { j = 5 } |
| `k = i + j` | { k = i + j } |

Cells in the spreadsheet entered without an *=* sign (not named) are not part of the calculation graph and cannot be referenced in formulas.

If you start a formula with an *=* sign, but don't name it, a generated name will be assigned:

| Expression  | Value     |
|:------------| ---------:|
| `= Math.sqrt(j * j + i * i)` | { $1 = Math.sqrt(j * j + i * i) } |
| `$1`     | { $1 } |

#### Working with arrays

A node of the calculation graph can be any JS object, including a function, a map or an array. Maps (JS objects) and arrays may be expanded in 2d using Shift-Alt-Down/Right shortcuts.

Use Shift-Alt-Z/X to toggle left/top labels.

| Expression  | Value     |
|:------------| ---------:|
| `r1 = range(10)` | { r1 = range(10) } |
| `m1 = r1.map(r => [r, r*r])`     | { m1 = r1.map(r => [r, r*r]) } |

Use Shift-Alt-Down Arrow to expand object down:

```js
[0, 0]
[1, 1]
[2, 4]
[3, 9]
[4, 16]
[5, 25]
[6, 36]
[7, 49]
[8, 64]
[9, 81]
```

Shift-Alt-Right Arrow will expand each value to it's own cell:

```js
0   0
1   1
2   4
3   9
4   16
5   25
6   36
7   49
8   64
9   81
```

If original formula is updated expanded array will of course change reactively.

#### Standard library

Besides `range` that you've seen before spreadsheet has a few other built-in functions:

##### require
`require(url)` Import script.

| Expression  | Value     |
|:------------| ---------:|
| `leftpad = require('https://cdn.pika.dev/leftpad').default` | { leftpad = require('https://cdn.pika.dev/leftpad').default } |
| `= leftpad('111', 4)` | { leftpad('111', 4) } |

##### range
`range(n)` Returns array containing sequence size *n*.

| Expression  | Value     |
|:------------| ---------:|
| `r50 = range(50)` | { r50 = range(50) } |

##### sum

`sum(arr)` Return sum of all elements of array *arr*.

| Expression  | Value     |
|:------------| ---------:|
| `rsum = sum(r50)` | {rsum = sum(r50) } |

##### race

`race(...args)` Will return quickest result among async *args*.

| Expression  | Value     |
|:------------| ---------:|
| `(x => x * x)(race([delay(10, () => -1)(), delay(1, () => 5)()]))` | { (x => x * x)(race([delay(10, () => -1)(), delay(1, () => 5)()])) } |

##### delay
`delay(ms, val)` will return value *val* after *ms* milliseconds.

| Expression  | Value     |
|:------------| ---------:|
| `delVal = rangeInput()` | { delVal = rangeInput() } 
| `delMs = rangeInput()` | { delMs = rangeInput() } 
| `delA = delay(ms * 10, delVal)` | { delA = delay(delMs * 10, delVal) }
| `= sum(range(delA))` | { sum(range(delA)) }

#### Component API

Ellx exposes 5 methods describing how user components should update and render inside a sheet. They are:

- update
Update is called whenever any input props are changed. It recieves new props as its only argument.

```js
update(props) {
    this.myLogicUpdatingProps(props);
}
```

- output
Node value which can be used by other nodes. It must be an async generator returning a promise resolving to a new value.

```js
  async *output() {
    while (true) {
      yield this.value;
      this.value = await new Promise(resolve => resolve(this.calcNewValue()));
    }
  }
```

- render
Render method recieves DOM node of a spreadsheet cell it should render to. This method is useful whenever user component has to render not just the `output` value. E.g. range input you can find in this (document)[#delay].

```js
render(cell) {
    cell.appendChild(this.myNode);
}
```

- stale Stale is called when component's props become stale. If the `stale` handler is missing, in this situation the component is destroyed and re-created again when resolved props become available. If this behavior is not desired, implement the `stale` handler. It may be empty, or it may signal to the component to re-render in a stale state, or return something different in `output`.

```js
stale() {
}
```

- dispose
Dispose is called before the node is destroyed.

```js
dispose() {
    this.cleanUp();
}
```

Note that all of these methods are optional. Definition of the component must be added to the `__EllxMeta__.component` property of the object passed to the spreadsheet.

"Ellxify" is a utility wrapper function which binds user component to the spreadsheet. The most basic example of `ellxify` is standard library's `make` method which does just this:

```js
export const make = component 
  => props
  => ({ ...props, __EllxMeta__: { component } });
```

Here's an example of ellxify which renders Svelte component to a cell and binds prop `value` to the node value:

```js
import {
  bind,
  binding_callbacks,
}
from 'svelte/internal';

const ellxify = Component => class {
  constructor(props, { initState }) {
    this.value = initState;
    this.target = document.createElement("div");
    this.emit = null;

    this.instance = new Component({
        target: this.target,
        props: {
            value: this.value,
            ...props
        }
    });
    binding_callbacks.push(() => bind(this.instance, "value", value => this.emit && this.emit(value)));
  }

  update(props) {
      this.instance.$set({ ...props, stale: false });
  }
  
  stale() {
    // this way component instance will be able to handle
    // stale state
    this.update({ stale: true });
  }

  dispose() {
      this.instance.$destroy();
  }

  async *output() {
    while (true) {
      yield this.value;
      this.value = await new Promise(resolve => this.emit = resolve);
    }
  }

  render(node) {
      node.appendChild(this.target);
  }
};


export default (component, props) => ({ ...props, __EllxMeta__: { component: ellxify(component) }});
```

#### Mixing sync/async

Ellx is designed to simplify complex system integration tasks, which are often asynchronous by nature. If a result of any intermediate expression is a Promise it will be automatically waited for in the most efficient fashion: parallel calculations will still run in parallel.

| Expression             | Value                 |
|:-----------------------------------------------| ----------------------:|
| `x = rangeInput()`                             | { x = rangeInput() } |
| `ms = 1000 * (1 + range(3))`                   | { ms = 1000 * (1 + range(3)) } |
| `expr = ms.map(ms => delay(ms,  ms + x)` | { expr = ms.map(ms => delay(ms, ms + x)) } |
| `expr*expr`                                   | { expr*expr }

#### Operator overloading

Ellx formulas actually support an extension of JavaScript grammar, implementing operator overloading technique known as "transpilation at first evaluation". By looking at the type and constructor of operators' arguments at first evaluation Ellx is able to transiple the original formula on the fly to implement special treatment.

You can add operator overloading support to any existing class by adding `__EllxMeta__` property to it's prototype.

Here we load the patch for Math.js's Complex and Matrix classes (defined in [/matyunya/docs/index.js](/matyunya/docs/index.js)).

| Expression              | Value                  |
|:----------------------- | ----------------------:|
| `meta = {operator: { binary: { '+': (l, r) => l + r }}}` | { meta = {operator: { binary: { '+': (l, r) => l + r }}} }
| `m = require('https://cdn.pika.dev/mathjs/v6')`| { m = require('https://cdn.pika.dev/mathjs/v6') }
| `math = patchMathJS(m)` | { math = patchMathJS(m) }
| `a = rangeInput()`      | { a = rangeInput() }
| `{ r = range(a) }`      | { r = range(a) }          
| `rnorm = math.matrix(r) * r` | { rnorm = math.matrix(r) * r } 
| `c = math.complex('1+2i')`   | { c = math.complex('1+2i') }


### Scripts

Scripts are regular javascript files with `.js` extension. All of script's exports are available in the same namespace's layout and spreadsheet but can also be imported from other files and projects.

#### Imports
You can load any 3rd party external module published in ES2015 module format using a built-in require function, using dynamic import under the hood. You can use direct URL imports from any npm registry (like [pika.dev](https://www.pika.dev/cdn) or [unpkg.com](https://unpkg.com)).

##### Import npm packages
To import an npm package use import statement as usual:

```js
import * as d3 from "d3";
```

##### Local imports
To import a file from the same project

```js
import test from '/same-project-some-dir/script.js';
```

##### Import ellx project
To import a file from any ellx project append it with `~`

```js
import docs from '~matyunya/docs/index.js';
```

### Layouts

Layouts are markdown files with `.md` extension. Their main purpose is to serve as project's live documentation akin to storybook or any other web notebook. Ellx uses [remark](https://github.com/remarkjs/remark) to render markdown. 

#### Reactive expressions

Ellx layouts handles anything put between curly braces `{}` as a reactive expression.

```html
{ myNode = 5 }<br>
{ user = { login: "login", password: "password" } }
{ val = rangeInput() }
{val}<br>
{ range(10) }
```

will output

{ myNode = 5 }<br>
{ user = { login: "login", password: "password" } }
{ val = rangeInput() }
{val}<br>
{ range(10) }


#### Math formulas
[KaTeX](https://github.com/KaTeX/KaTeX) syntax is supported:

Lift($L$) can be determined by Lift Coefficient ($C_L$) like the following equation.

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
Ellx uses prism.js for code highlighting. Wrap code snippet in three ticks (\`)

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

or single tick for inline code block (`like this`).

#### YAML configuration
[Frontmatter-style](https://jekyllrb.com/docs/front-matter/) configuration is already supported although it has a single setting at the moment. 

```html
---
template: path-to-md-template # Not supported yet
title: project-title # Override project title displayed in published version
nav: true|false # Toggles sidebar navigation in publishing
---
```

## Ellx CLI

At the moment Ellx CLI comes with only one but very big feature, that is local development.

First you need to install `ellx` package globally:
```html
$ npm i -g @ellx/cli
or
$ yarn global add @ellx/cli
```

Then navigate to the directory you'd like to access in ellx and run

```html
$ ellx -u your-username
```

This will run local file server on port 3002 by default.

After that you can navigate to your local project via user menu on the top left of any page ("Ellx CLI connect") or by navigating straight to [https://ellx.io/external/localhost~3002](https://ellx.io/external/localhost~3002).

## Publishing

Ellx allow to export `index.md` namespace as a static page either as a direct HTML file download or publishing project to `{username}-{project}.ellx.app`. It normally takes about 2~3 minutes for the page to become available.

This document itself was generated with Ellx, you can fork and play with it [here](https://ellx.io/matyunya/docs).

## Sync with Github

In order to get the most out of Ellx we provide integration with Github as a Pro tier feature. It enables syncing public or private Github repositories with Ellx projects using Github actions.

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

Note that this action will trigger sync whenever there's a new commit to `master` or `release/**` branches. Refer to [official documentation](https://docs.github.com/en/actions) to learn about other kinds of triggers and other options.

## Deploy sheet

...coming soon
