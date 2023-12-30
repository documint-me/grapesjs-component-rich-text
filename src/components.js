import { cmpId } from "./consts";
import edjsHTML from "editorjs-to-html";

const edjsParser = edjsHTML();

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
              header: {
                class: w.Header,
                inlineToolbar: true,
                shortcut: "CMD+SHIFT+H",
                config: {
                  placeholder: "Start typing here..."
                },
              },
              paragraph: {
                class: w.Paragraph,
                inlineToolbar: true,
                shortcut: "CMD+SHIFT+P",
                config: {
                  placeholder: "Start typing here...",
                  preserveBlank: true,
                },
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
              delimiter: w.Delimiter,
              image: w.SimpleImage,
              embed: w.Embed,
              code: {
                class: w.CodeTool,
                config: {
                  placeholder: "Start typing here..."
                },
                shortcut: "CMD+SHIFT+B",
              },
              underline: {
                class: w.Underline,
                shortcut: "CMD+U",
              },
              strikethrough: {
                class: w.Strikethrough,
                shortcut: "CMD+T"
              },
              Marker: {
                class: w.Marker,
                shortcut: 'CMD+SHIFT+M',
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
