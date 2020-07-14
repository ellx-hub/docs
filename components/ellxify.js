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
      this.instance.$set(props);
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