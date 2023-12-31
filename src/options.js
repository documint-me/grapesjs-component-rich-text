import { cmpId } from "./consts";

export default {
  blocks: [cmpId],
  // default options
  // Object to extend the default block, eg. `{ label: '', ... }`
  // Pass a falsy value to avoid adding the block
  richTextBlock: {},

  // Customize the component props. The final object should be returned
  // from the function.
  /**
  eg. Here an example of how you would customize component's traits
  `props => {
      props.traits = props.traits.map(trait => {
        if (trait.name == 'strings') {
          trait.label = 'Custom <b>trait<b/> label';
        }
        // this trait will be removed
        if (trait.name == 'theme') return;
        return trait;
      }).filter(i => i);
      return props;
  }`
 */
  props: (i) => i,
  // Component props
  richTextComponent: {},
};
