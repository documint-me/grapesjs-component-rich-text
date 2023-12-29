import { cmpId } from "./consts";
import edjsHTML from 'editorjs-to-html';

const edjsParser = edjsHTML();

// TODO: Parser text alignment, styling(table, fonts), editor management

export default (editor, opts = {}) => {
  const domc = editor.DomComponents;

  domc.addType(cmpId, {
    model: {
      defaults: opts.props({
        editorJsOutputData: {},
        droppable: false,
        traits: [],
        content: "Double click to add text",
        ...opts.richTextComponent,
      }),

      init() {
        this.on("change:editorJsOutputData", this.onChangeEditorJsOutputData)
        this.afterInit();
      },

      afterInit() {},

      onChangeEditorJsOutputData() {
        this.set('content', edjsParser.parse(this.get('editorJsOutputData')));
      },

      getEditorJs(el) {
        const { editorjs } = this;
        if (!editorjs && el) {
          const w = editor.Canvas.getWindow();

          this.components('');
          const config = {
            tools: {
              textVariant: w.TextVariantTune,
              textAlign: {
                class: w.AlignmentBlockTune,
                config:{
                  default: "left",
                  blocks: {
                    header: 'center',
                  }
                },
              },
              header: {
                class: w.Header,
                inlineToolbar: true,
                shortcut: 'CMD+SHIFT+H',
                tunes: ['textAlign', 'textVariant']
              },
              paragraph: {
                class: w.Paragraph,
                inlineToolbar: true,
                tunes: ['textAlign', 'textVariant']
              },
              delimiter: w.Delimiter,
              list: {
                class: w.NestedList,
                inlineToolbar: true,
                config: {
                  defaultStyle: 'unordered'
                },
              },
              checklist: {
                class: w.Checklist,
                inlineToolbar: true,
              },
              image: w.SimpleImage,
              embed: w.Embed,
              code: w.CodeTool,
              table: {
                class: w.Table,
              },
              underline: w.Underline,
              Color: {
                class: w.ColorPlugin,
                config: {
                    colorCollections: ['#EC7878','#9C27B0','#673AB7','#3F51B5','#0070FF','#03A9F4','#00BCD4','#4CAF50','#8BC34A','#CDDC39', '#FFF'],
                    defaultColor: '#FF1300',
                    type: 'text', 
                    customPicker: true 
                }     
              },
              Marker: {
                class: w.ColorPlugin,
                config: {
                    defaultColor: '#FFBF00',
                    type: 'marker',
                    icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`,
                    customPicker: true 
                  }       
              },
              inlineCode: {
                class: w.InlineCode,
                shortcut: 'CMD+SHIFT+I',
              },
            },
          };
          const newEditor = new w.EditorJS({ 
            holder: el,
            data: this.get('editorJsOutputData'),
            ...config
          });
          this.editorjs = newEditor;
          return newEditor;
        }
        return editorjs
      },

      saveEditorJsData() {
        const editorjs = this.getEditorJs();
        editorjs && editorjs.save().then((editorJsOutputData) => {
          editorjs && editorjs.destroy();
          this.editorjs = null;
          this.set({ editorJsOutputData })
        }).catch((error) => {
          console.log('Saving failed: ', error)
        });
      }
    },
    view: {
      events: {
        dblclick: 'onActivate',
      },

      init({ model }) {
        this.listenTo(model, 'change:status', this.onToggle);
      },

      onActivate(ev) {
        ev?.stopPropagation();
        const { el, model } = this;
        model.getEditorJs(el);
      },

      onToggle(model, status) {
        if (status !== 'selected') {
          model.saveEditorJsData();
        }
      }
    }
  });
};
