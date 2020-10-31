export { default as rangeInput } from "~ellx-hub/lib/components/Slider";
export { default as input } from "~ellx-hub/lib/components/Input";
export { default as pretty } from "~ellx-hub/lib/components/Pretty";

export const test = 42;
export const test2 = 43;

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
