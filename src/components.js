import { cmpId } from "./consts";
import edjsHTML from "editorjs-to-html";

const edjsParser = edjsHTML();

// TODO: Parser text alignment, custom colors

export default (editor, opts = {}) => {
  const domc = editor.DomComponents;

  domc.addType(cmpId, {
    model: {
      defaults: opts.props({
        editorJsOutputData: {},
        editorJsActive: false,
        droppable: false,
        traits: [],
        ...opts.richTextComponent,
      }),

      init() {
        this.on("change:status", this.onToggle);
        this.afterInit();
      },

      afterInit() {},

      onToggle(model, status) {
        if (status === "") {
          model.saveEditorJsData();
          model.set('editorJsActive', false)
        }
      },

      initEditorJs(el) {
        if (el) {
          const { editorjs } = this;
          editorjs && editorjs.destroy();
          this.editorjs = null;

          const w = editor.Canvas.getWindow();

          const config = {
            tools: {
              textAlign: {
                class: w.AlignmentBlockTune,
                config: {
                  default: "left",
                  blocks: {
                    header: "center",
                  },
                },
              },
              header: {
                class: w.Header,
                inlineToolbar: true,
                shortcut: "CMD+SHIFT+H",
                tunes: ["textAlign"],
              },
              paragraph: {
                class: w.Paragraph,
                inlineToolbar: true,
                shortcut: "CMD+SHIFT+P",
                tunes: ["textAlign"],
              },
              list: {
                class: w.NestedList,
                inlineToolbar: true,
                shortcut: "CMD+SHIFT+L",
                config: {
                  defaultStyle: "unordered",
                },
              },
              checklist: {
                class: w.Checklist,
                shortcut: "CMD+SHIFT+C",
                inlineToolbar: true,
              },
              image: w.SimpleImage,
              embed: w.Embed,
              code: {
                class: w.CodeTool,
                shortcut: "CMD+SHIFT+B",
              },
              table: {
                class: w.Table,
                shortcut: "CMD+SHIFT+T",
              },
              underline: {
                class: w.Underline,
                shortcut: "CMD+U",
              },
              strikethrough: {
                class: w.Strikethrough,
                shortcut: "CMD+T"
              },
              Color: {
                class: w.ColorPlugin,
                config: {
                  defaultColor: "#FF1300",
                  type: "text",
                },
              },
              Marker: {
                class: w.ColorPlugin,
                config: {
                  defaultColor: "#FFBF00",
                  type: "marker",
                  icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`,
                },
              },
              inlineCode: {
                class: w.InlineCode,
                shortcut: "CMD+SHIFT+I",
              },
            },
          };
          const newEditor = new w.EditorJS({
            holder: el,
            data: this.get("editorJsOutputData"),
            ...config,
          });
          this.editorjs = newEditor;
          return newEditor;
        }
        return null;
      },

      closeToolbars() {
        const { editorjs } = this;
        if (editorjs) {
          editorjs.inlineToolbar.close();
          editorjs.toolbar.close();
        }
      },

      saveEditorJsData() {
        const { editorjs } = this;
        this.closeToolbars();
        editorjs &&
          editorjs
            .save()
            .then((editorJsOutputData) => {
              this.set({ editorJsOutputData });
              this.set("content", "");
              this.set("content", edjsParser.parse(editorJsOutputData));
            })
            .catch((error) => {
              console.log("Saving failed: ", error);
            });
      },
    },
    view: {
      events: {
        dblclick: "onActivate",
      },

      onActivate(ev) {
        ev?.stopPropagation();
        const { el, model } = this;
        !model.get('editorJsActive') && model.initEditorJs(el);
        model.set('editorJsActive', true);
      },
    },
  });
};
