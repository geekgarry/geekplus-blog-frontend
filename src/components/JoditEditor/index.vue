<template>
  <textarea
    id="joditeditor"
    ref="editorRef"
    v-model="content"
    name="editor"
  ></textarea>
</template>
<script>
import "jodit/es2021/jodit.min.css";
import { Jodit } from "jodit";
import { uploadFileForArticle, deleteFile, deleteFileList } from "@/api/common";

export default {
  name: "JoditEditor",
  props: {
    value: { type: String, default: "" },
    buttons: { type: Array, default: null },
    extraButtons: { type: Array, default: null },
    // config: { type: Object, default: () => ({}) },
    content: "",
  },
  data: () => ({
    editor: null,
    // jcontent: "", //编辑器正文内容
    config: {
      //更多配置项请参考jodit官网
      zIndex: 10,
      //theme: "dark",
      language: "zh_cn",
      i18n: {
        //将语言版本设置为中文后仍然还有部分显示的英文改为中文，左面的key为页面上显示的英文，value则是需要对应显示的中文，目前支持19种语言
        zh_cn: {
          //简体中文
          top: "上",
          right: "右",
          bottom: "下",
          left: "左",
          Title: "标题",
          Link: "链接",
          "Line height": "行高",
          Alternative: "描述",
          "Alternative text": "描述",
          "Lower Alpha": "小写英文字母",
          "Lower Greek": "小写希腊字母",
          "Lower Roman": "小写罗马数字",
          "Upper Alpha": "大写英文字母",
          "Upper Roman": "大写罗马数字",
        },
        zh_tw: {
          //中文繁体
          Link: "鏈接",
        },
      },
      width: "auto",
      height: 770,
      minHeight: 400,
      toolbarStickyOffset: 0,
      // toolbarSticky: false, //工具栏设置sticky
      saveModeInCookie: true,
      saveHeightInStorage: true,
      // saveModeInStorage: true,
      toolbarAdaptive: true,
      image: {
        //图片相关配置
        editSrc: true,
        editStyle: true,
        useImageEditor: true,
      },
      link: {
        noFollowCheckbox: true,
        modeClassName: "",
      },
      // buttons:"source,bold,italic,underline,strikethrough,eraser,superscript,subscript,ul,ol,indent,outdent,left,font,fontsize,paragraph,brush,lineHeight,image,file,video,copyformat,selectall,hr,table,link,symbols,undo,redo,fullsize,preview",
      controls: {
        font: {
          list: Jodit.atom({
          //左侧key为电脑上对应字体的名称，右侧value是在编辑器字体下拉列表中展示的名称
            "Microsoft YaHei": "微软雅黑",
            KaiTi: "楷体",
            方正喵呜体: "方正喵呜体",
            "思源宋体 Heavy": "思源宋体",
            SimHei: "黑体",
            NSimSun: "新宋体",
            华文行楷: "华文行楷",
          }),
        },
      },
      hotkeys: {
        redo: 'ctrl+z',
        undo: 'ctrl+y,ctrl+shift+z',
        indent: 'ctrl+]',
        outdent: 'ctrl+[',
        bold: 'ctrl+b',
        italic: 'ctrl+i',
        removeFormat: 'ctrl+shift+m',
        insertOrderedList: 'ctrl+shift+7',
        insertUnorderedList: 'ctrl+shift+8',
        openSearchDialog: 'ctrl+f',
        openReplaceDialog: 'ctrl+r',
      },
      createAttributes: {
        blockquote: {//可以设置style，也可以设置class
          style: `
          display: block;
          padding: 5px;
          margin: 0 0 6px;
          border-left: 5px solid #dddfe4;
          background: #eef0f4;
          color: rgba(0, 0, 0, 0.5);
          overflow: auto;
          word-break: break-word !important;`,
          class:'blockquote-box'//在css中编写类名对应的样式
        },
      },
      useNativeTooltip: false,
      useInputsPlaceholder: true,
      usePopupForSpecialCharacters:true,
      useSearch:true,
      uploader: {
        url: "/api/uploads", //上传地址
        // insertImageAsBase64URI: true,
        imagesExtensions: ['jpg', 'JPG', 'png', 'PNG', 'jpeg', 'JPEG', 'gif', 'GIF','svg','SVG', 'webp'],
        isSuccess(res) {
          return res;
        },
        defaultHandlerSuccess(data) {
          //此处参数的值默认是接口返回的data值
          console.log("defaultHandlerSuccess", data);
          data.forEach((item) => {
            this.s.insertImage(item.url); //将图片插入编辑器中，不可省略
          });
        },
        defaultHandlerError(err) {
          console.log("defaultHandlerError", err);
          this.jodit.events.fire("errorMessage", err);
        },
        error(err) {
          console.log("error", err);
          this.jodit.events.fire("errorMessage", "文件上传失败");
        },
      },
    },
  }),
  computed: {
    editorConfig() {
      const config = { ...this.config };
      if (this.buttons) {
        config.buttons = this.buttons;
        config.buttonsMD = this.buttons;
        config.buttonsSM = this.buttons;
        config.buttonsXS = this.buttons;
      }
      if (this.extraButtons) config.extraButtons = this.extraButtons;
      return config;
    },
  },
  watch: {
    value(newValue) {
      if (this.editor.value !== newValue) this.editor.value = newValue;
    },
  },
  mounted() {
    // Jodit.plugins.add('stat', function (editor) {
    //     const statusbar = document.createElement('div');
    //     statusbar.style.backgroundColor = '#f8f8f8';
    //     statusbar.style.color = 'red';
    //     statusbar.style.fontSize = '11px';
    //     statusbar.style.padding = '1px 4px';

    //     function calcStat() {
    //         var text = Jodit.modules.Helpers.trim(editor.editor.innerText),
    //             wordCount = text.split(/[\s\n\r\t]+/).filter(function (value) {
    //                 return value;
    //             }).length,
    //             charCount = text.replace(/[\s\n\r\t]+/, '').length;


    //         statusbar.innerText = 'words: ' + wordCount + ' chars: ' + charCount;
    //     }

    //     editor.events
    //         .on('change afterInit', editor.async.debounce(calcStat, 100))
    //         .on('afterInit', function () {
    //             editor.container.appendChild(statusbar);
    //         });
    // });
    this.editor = Jodit.make("#joditeditor", this.editorConfig);
    // this.editor.value = "<p>start</p>";
    this.editor.value = this.value;
    this.editor.events.on("change", (newValue) =>
      this.$emit("input", newValue)
    );
    this.editor.events.on('blur', param => {
      this.focusOutEditor();
    });
    this.editor.events.on('focus', param => {
      this.focusOnEditor();
    });
  },
  methods:{
    focusOutEditor(){
      //console.log("失去焦点");
    },
    focusOnEditor(){
      //console.log("得到焦点");
    }
  },
  beforeDestroy() {
    this.editor.destruct();
  },
};
</script>
<style scoped lang="scss">
.jodit-container:not(.jodit_inline) {
  color: rgb(25, 25, 25);
}
</style>
