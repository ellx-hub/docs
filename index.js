export { rangeInput } from '/components/index.js';

export const test = 42;
export const test2 = 43;

const Plot = (spec) => class {
  constructor(props) {
    this.update(props);
  }

  update({ values }) {
    this.spec = { ...spec, data: { name: 'source', values } };
    if (this.view) this.view.data('source', values).run();
  }

  async render(target) {
    const result = await vegaEmbed(target, this.spec);
    this.view = result.view;
  }

  dispose() {
    if (this.view) this.view.finalize();
  }
}

export const plot = props => ({...props, __EllxMeta__: { component: Plot(schema) }});

export const testValues = [
  {a: 'A', b: 28}, {a: 'B', b: 55}, {a: 'C', b: 43},
  {a: 'D', b: 91}, {a: 'E', b: 81}, {a: 'F', b: 53},
  {a: 'G', b: 19}, {a: 'H', b: 87}, {a: 'I', b: 52}
];

export function patchMathJS(math) {
  const meta = {
    operator: {
      binary: {
        '+': (lhs, rhs) => math.add(lhs, rhs),
        '-': (lhs, rhs) => math.subtract(lhs, rhs),
        '*': (lhs, rhs) => math.multiply(lhs, rhs),
        '/': (lhs, rhs) => math.divide(lhs, rhs),
      },
      unary: {
        '-': lhs => math.unaryMinus(lhs),
        '+': lhs => math.unaryPlus(lhs),
        '~': lhs => math.conj(lhs)
      }
    }
  }
  if (!('__EllxMeta__' in math.Complex.prototype)) Object.defineProperty(math.Complex.prototype, '__EllxMeta__', { value: meta });
  if (!('__EllxMeta__' in math.Matrix.prototype)) Object.defineProperty(math.Matrix.prototype, '__EllxMeta__', { value: meta })

  return math;
}