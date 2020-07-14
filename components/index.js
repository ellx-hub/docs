import e from './ellxify.js';
import Range from './Range.svelte';

const el = (component, props) => ({ ...props, __EllxMeta__: { component: ellxify(component) }});

export const rangeInput = (value) => e(Range, { value });
