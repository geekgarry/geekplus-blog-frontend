<template>
  <Editor
    id="tinymce"
    name="tinymce"
    v-model="content"
    :init="init"
    model-events="change keydown blur focus paste"
  ></Editor>
  <!-- @blur="focusOutEditor"
  @focus="focusOnEditor" -->
</template>

<script>
import tinymce from "tinymce";
import Editor from "@tinymce/tinymce-vue";
import "tinymce/themes/silver/theme";
import "tinymce/plugins/image";
import "tinymce/plugins/link";
import "tinymce/plugins/code";
import "tinymce/plugins/table";
import "tinymce/plugins/lists";
import "tinymce/plugins/wordcount";
import "tinymce/icons/default/icons";
import "tinymce/themes/silver";
import "tinymce/plugins/media";
import "tinymce/plugins/contextmenu";
import "tinymce/plugins/colorpicker";
import "tinymce/plugins/textcolor";
import "tinymce/plugins/preview";
import "tinymce/plugins/advlist";
import "tinymce/plugins/codesample";
import "tinymce/plugins/hr";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/textpattern";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/autolink";
import "tinymce/plugins/directionality";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/template";
import "tinymce/plugins/charmap";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/imagetools";
import "tinymce/plugins/autosave";
import "tinymce/plugins/save";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/paste";
import "tinymce/plugins/print";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/bbcode";
import "tinymce/plugins/tabfocus";
import "tinymce/plugins/toc";
import "tinymce/plugins/fullpage";
import "tinymce/plugins/importcss";
import "tinymce/plugins/legacyoutput";
import "tinymce/plugins/emoticons";
import "tinymce/plugins/anchor";
// 扩展插件
import "/public/tinymce/plugins/formatpainter";
import "/public/tinymce/plugins/lineheight";
import "/public/tinymce/plugins/letterspacing";
import "/public/tinymce/plugins/layout";
import "/public/tinymce/plugins/upfile";
import "/public/tinymce/plugins/attachment";
import "/public/tinymce/plugins/importword";
import "/public/tinymce/plugins/indent2em";

import { uploadFileForArticle, deleteFile, deleteFileList } from "@/api/common";
export default {
  name: "TinyEditor",
  components: { Editor },
  props: {
    value: {
      type: String,
      default: "",
    },
    resetValue: {
      type: Boolean,
      default: false,
    },
    articleTitle: {
      type: String,
      default: "",
    }
  },
  data() {
    let self = this  // 加上这一句就OK了
    return {
      content: this.value,
      //fileList: [],
      allImageList: [],
      allMyWebImageSize: -1,
      webProtocol: window.location.protocol, //取得网站的协议头部
      baseHost: window.location.host, //取得网站的地址
      baseApi: process.env.VUE_APP_BASE_API,
      init: {
        language_url: "/tinymce/langs/zh_CN.js", // 语言包位置，因为放在public下所以可以省略public
        selector: "#tinymce", //tinymce的id
        // auto_focus: 'element1',
        language: "zh_CN", //语言类型
        skin_url: "/tinymce/skins/ui/oxide",
        height: 680, //编辑器高度
        min_height: 380,
        // min_width: 700,
        highlight_on_focus: true,
        // contextmenu_never_use_native: true,//5.0.1
        draggable_modal: true,
        //inline: true,
        // content_style: "p {margin: 2px 0;}",
        init_instance_callback: (editor) => {
          // 更改元素为Div
          //editor.execCommand("mceInsertContent", false, "<p></p>");
        },
        browser_spellcheck: true, // 拼写检查
        // elementpath: false, //禁用编辑器底部的状态栏
        // statusbar: false, // 隐藏编辑器底部的状态栏
        // menubar: false, //最顶部文字信息
        // mobile: {
        //   menubar: true,
        //   plugins: ["autosave", "lists", "autolink"],
        //   toolbar: ["undo", "bold", "italic", "styleselect"],
        // },
        // mode: "textareas",
        placeholder: "在此处书写...",
        // forced_root_block: '', // 删除在tinymce中自动添加的p标签
        // force_br_newlines : true,
        // force_p_newlines : false,
        preview_styles: "font-size color",
        invalid_styles: {
          "*": "color font-size", //全局无效样式
          a: "background", // 链接禁用背景样式
        },
        charmap_append: [
          [0x2615, 'morning coffee'],
          [0x2600, 'sun'],
          [0x2601, 'cloud'],
        ],
        plugins:
          "image link code codesample table lists wordcount autosave save autolink insertdatetime upfile attachment " +
          "preview media fullscreen quickbars print template paste visualchars emoticons textpattern formatpainter legacyoutput " +
          "searchreplace toc charmap", //就可以增加上面引入的插件，加入下面这一行就可以在toolbar栏显示相应插件。
        branding: false, //是否禁用“Powered by TinyMCE”
        toolbar: [
          {
            name: "restoredraft",
            items: ["restoredraft", "save", "paste"]
          },
          {
            name: "history",
            items: ["undo", "redo"],
          },
          {
            name: "styles",
            items: ["styleselect", "visualchars", "insertdatetime"],
          },
          {
            name: "code",
            items: ["codesample"],
          },
          {
            name: "formatting",
            items: ["bold", "italic", "underline", "strikethrough", "removeformat"],
          },
          {
            name: "fonts",
            items: ["fontselect", "fontsizeselect", "formatpainter"],
          },
          {
            name: "colors",
            items: ["forecolor", "backcolor"],
          },
          // {
          //   name:"file",
          //   items: ["insertfile"]
          // },
          {
            name: "link",
            items: ["link", "image", "media", "attachment"],//, "upfile"
          },
          {
            name: "alignment",
            items: ["alignleft", "aligncenter", "alignright", "alignjustify"],
          },
          {
            name: "indentation",
            items: ["outdent", "indent"],
          },
          {
            name: "blockquote",
            items: ["blockquote", "anchor", "searchreplace"],
          },
          {
            name: "table",
            items: ["table"],
          },
          {
            name: "lists",
            items: ["numlist", "bullist"],
          },
          {
            name: "tools",
            items: ["preview", "print", "emoticons", "fullscreen"],
          },
        ],
        //toolbar: "undo redo | fontselect fontsizeselect link autolink lineheight | forecolor backcolor | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | image imagetools | code | h1 h2 h3 h4 h5 blockquote table numlist bullist outdent indent preview fullscreen", //工具栏
        // toolbar_groups: {
        //     formatting: {
        //     icon: 'bold',
        //     tooltip: 'Formatting',
        //     items: 'bold italic underline | superscript subscript'
        //     }
        // },
        // content_style: '.left { text-align: left; } ' +
        //   'img.left { float: left; } ' +
        //   'table.left { float: left; } ' +
        //   '.right { text-align: right; } ' +
        //   'img.right { float: right; } ' +
        //   'table.right { float: right; } ' +
        //   '.center { text-align: center; } ' +
        //   'img.center { display: block; margin: 0 auto; } ' +
        //   'table.center { display: block; margin: 0 auto; } ' +
        //   '.full { text-align: justify; } ' +
        //   'img.full { display: block; margin: 0 auto; } ' +
        //   'table.full { display: block; margin: 0 auto; } ' +
        //   '.bold { font-weight: bold; } ' +
        //   '.italic { font-style: italic; } ' +
        //   '.underline { text-decoration: underline; } ' +
        //   '.tablerow1 { background-color: #D3D3D3; }',
        // formats: {
        //   alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img,audio,video', classes: 'left' },
        //   aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img,audio,video', classes: 'center' },
        //   alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img,audio,video', classes: 'right' },
        //   alignfull: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img,audio,video', classes: 'full' },
        //   bold: { inline: 'span', classes: 'bold' },
        //   italic: { inline: 'span', classes: 'italic' },
        //   underline: { inline: 'span', classes: 'underline', exact: true },
        //   strikethrough: { inline: 'del' },
        //   customformat: { inline: 'span', styles: { color: '#00ff00', fontSize: '20px' }, attributes: { title: 'My custom format'} , classes: 'example1'}
        // },
        // style_formats: [
        //   { title: 'Custom format', format: 'customformat' },
        //   { title: 'Align left', format: 'alignleft' },
        //   { title: 'Align center', format: 'aligncenter' },
        //   { title: 'Align right', format: 'alignright' },
        //   { title: 'Align full', format: 'alignfull' },
        //   { title: 'Bold text', inline: 'strong' },
        //   { title: 'Red text', inline: 'span', styles: { color: '#ff0000' } },
        //   { title: 'Red header', block: 'h1', styles: { color: '#ff0000' } },
        //   { title: 'Badge', inline: 'span', styles: { display: 'inline-block', border: '1px solid #2276d2', 'border-radius': '5px', padding: '2px 5px', margin: '0 2px', color: '#2276d2' } },
        //   { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' },
        //   { title: 'Image formats' },
        //   { title: 'Image Left', selector: 'img', styles: { 'float': 'left', 'margin': '0 10px 0 10px' } },
        //   { title: 'Image Right', selector: 'img', styles: { 'float': 'right', 'margin': '0 0 10px 10px' } },
        // ],
        emoticons_database_url: '/tinymce/plugins/emoticons/js/emojis.js',
        //attachment_max_size: 100 * 1024 * 1024,
        toolbar_mode: "sliding",
        toolbar_sticky: true,
        paste_data_images: true, // 允许粘贴图像
        paste_enable_default_filters: false,
        paste_merge_formats: true,
        smart_paste: false,  // note: default value for smart_paste is true
        image_file_types: "jpeg,jpg,jpe,jfi,jfif,png,gif,bmp,svg,webp,heif,heifs,heic,heics,avci,avcs,avif,avifs",
        image_caption: true,
        // 关键配置：禁用相对路径转换
        relative_urls: false,
        remove_script_host: false,
        convert_urls: false,
        //自定义上传文件，文件选择函数
        file_picker_callback: function (callback, value, meta) {
          //文件分类
          var filetype = ".pdf, .txt, .zip, .rar, .7z, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .mp3, .mp4, .avi, .mov, "+
              ".3gp, .flv, .f4v, .mpg, .mpeg, .m2p, .mkv, .wav .ape, .aac, .flac";
          //后端接收上传文件的地址
          //var upurl = '/demo/upfile.php';
          //为不同插件指定文件类型及后端地址
          switch (meta.filetype) {
            // case 'image':
            //   filetype = '.jpg, .jpeg, .png, .gif';
            //   upurl = 'upimg.php';
            //   break;
            case 'media':
              filetype = '.mp3, .mp4, .avi, .mov, .3gp, .flv, .f4v, .mpg, .mpeg, .m2p, .mkv, .wav .ape, .flac';
              //self.uploadFileEvent(filetype)
              //callback("/", { text: 'myMedia' });
              break;
            case 'file':
              filetype = '.pdf, .txt, .zip, .rar, .7z, .doc, .docx, .xls, .xlsx, .ppt, .pptx';
              //self.uploadFileEvent(filetype)
              //callback("/", { text: 'myFile' });
              break;
            default:
              break;
          }
          //模拟出一个input用于添加本地文件
          var input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', filetype);
          input.click();
          input.onchange = function () {
            var file = this.files[0];
            //this.formData.append("file", file.file);
            //console.log(file.file, "上传图片文件");
            //const imageUrl = 上传七牛云后返回来的一串在线链接
            let formData = new FormData();
            formData.append("file", file); //this.fileList[0].raw);//拿到存在fileList的文件存放到formData中
            //下面数据是我自己设置的数据,可自行添加数据到formData(使用键值对方式存储)
            // 解析上传的文件
            //let file = this.fileList[0]
            //console.log(file)
            self.uploadFileToFile(formData).then((res) => {
              callback(res.fileUrl, { text: res.fileName });
            })
          }
        },
        file_picker_types: 'file media',//'file image media'
        paste_preprocess: function (plugin, args) {
          //console.log("粘贴预处理内容：" + args.content);
        },
        paste_postprocess: function (plugin, args) {
          // console.log("粘贴的内容：");
          // console.log(args)
          //args.node.setAttribute('id', 'hello');
        },
        images_upload_handler: (blobInfo, success, failure, progress) => {
          this.uploadImageFile(blobInfo, success, failure);
        },
        // file_picker_callback: function(callback, value, meta) {
        //   // Provide file and text for the link dialog
        //   if (meta.filetype == 'file') {
        //     callback('mypage.html', {text: 'My text'});
        //   }

        //   // Provide image and alt text for the image dialog
        //   if (meta.filetype == 'image') {
        //     callback('myimage.jpg', {alt: 'My alt text'});
        //   }

        //   // Provide alternative source and posted for the media dialog
        //   if (meta.filetype == 'media') {
        //     callback('movie.mp4', {source2: 'alt.ogg', poster: 'image.jpg'});
        //   }
        // },
        //file_picker_callback: "",
        fontsize_formats:
          "8px 10px 12px 14px 16px 18px 24px 36px 48px 56px 72px",
        font_formats:
          "微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;",
        // lineheight_formats: '1 1.1 1.2 1.3 1.4 1.5 2',
        // link_list: [
        // { title: '预置链接1', value: 'http://www.tinymce.com' },
        // { title: '预置链接2', value: 'http://tinymce.ax-z.cn' }
        // ],
        // image_list: [
        // { title: '预置图片1', value: 'https://www.tiny.cloud/images/glyph-tinymce@2x.png' },
        // { title: '预置图片2', value: 'https://www.baidu.com/img/bd_logo1.png' }
        // ],
        // image_class_list: [
        // { title: 'None', value: '' }
        // // { title: 'Some class', value: 'class-name' }
        // ],
        tabfocus_elements: ":prev,:next",
        // importcss_append: true,
        textpattern_patterns: [
          { start: "*", end: "*", format: "italic" },
          { start: "**", end: "**", format: "bold" },
          { start: "#", format: "h1" },
          { start: "##", format: "h2" },
          { start: "###", format: "h3" },
          { start: "####", format: "h4" },
          { start: "#####", format: "h5" },
          { start: "######", format: "h6" },
          { start: "1. ", cmd: "InsertOrderedList" },
          { start: "* ", cmd: "InsertUnorderedList" },
          { start: "- ", cmd: "InsertUnorderedList" },
        ],
        setup: (editor) => {
          editor.on("blur", function () {
            /**
             **本来设想是直接使用编辑器本身的绑定事件来实现需求，
             **后面发现移动端上没有触发编辑器上的blur事件
             **下面的操作没有触发
             **/
            //self.focusOutEditor();
            // console.log("离开焦点")
          });
          editor.on("focus", function () {
            /**
             **本来设想是直接使用编辑器本身的绑定事件来实现需求，
             **后面发现移动端上没有触发编辑器上的blur事件
             **下面的操作没有触发
             **/
            //self.focusOnEditor();
            // console.log("聚焦焦点")
          });
          editor.on("paste", function (e) {
            if (
              e.clipboardData &&
              e.clipboardData.files &&
              e.clipboardData.files.length
            ) {
              e.preventDefault();
              [].forEach.call(e.clipboardData.files, (file) => {
                //console.log("图片类型：" + file.type)
                if (!file.type.match(/^image\/(gif|jpe?g|a?png|svg|webp|bmp|vnd\\.microsoft\\.icon)/i)) {
                  return;
                }
                const formData = new FormData();
                formData.append("file", file);
                let resultFileUrl = self.uploadFileToFile(formData);
                var imgAlt = self.articleTitle;
                //console.log(imgAlt)
                resultFileUrl.then(res => {
                  //console.log(res);
                  //self.insertHtmlAtCaret('<img src="' + res + '" alt="hhhhhh" >');
                  tinymce.activeEditor.execCommand('mceInsertContent', false, '<img src="' + res.fileUrl + '" alt="' + imgAlt + '" >');
                  //editor.insertContent('<img src="' + res + '" alt="'+imgAlt+'" >');
                })
                // this.$axios
                //   .post(`${process.env.VUE_APP_BASE_API}/file/upload`, formData)
                //   .then((res) => {
                //     console.log(res);
                //     if (res.data.code == 200) {
                //       console.log(res.data.data.src);
                //       let length = this.Quill.getSelection().index; //光标位置
                //       // 插入图片地址
                //       this.Quill.insertEmbed(length, "image", res.data.data.url);
                //       // 光标后移一位
                //       this.Quill.setSelection(length + 1);
                //     } else {
                //     }
                //   });
              });
            }
            // // console.log("打印粘贴内容")
            // // console.log(e)
            // if (!(e.clipboardData && e.clipboardData.items)) {
            //   return;
            // }
            // let items = e.clipboardData && e.clipboardData.items;
            // // if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length){
            // // }
            // //阻止默认行为即不让剪贴板内容在div中显示出来
            // e.preventDefault();
            // for (var i = 0, len = items.length; i < len; i++) {
            //   var item = items[i];
            //   if (item.kind === "string") {
            //     item.getAsString(function (str) {
            //       //tinymce.activeEditor.execCommand('mceInsertContent', false, str);
            //       editor.insertContent(str);
            //     })
            //   } else if (item.kind === "file") {
            //     var blob = item.getAsFile();
            //     //console.log(blob);
            //     if (blob.size === 0) {
            //       return;
            //     }
            //     var formData = new FormData();
            //     formData.append("file", blob);
            //     let resultFileUrl = self.uploadFileToFile(formData);
            //     var imgAlt=self.articleTitle;
            //     //console.log(imgAlt)
            //     resultFileUrl.then(res=> {
            //       //console.log(res);
            //       //self.insertHtmlAtCaret('<img src="' + res.fileUrl + '" alt="hhhhhh" >');
            //       tinymce.activeEditor.execCommand('mceInsertContent', false, '<img src="' + res.fileUrl + '" alt="'+imgAlt+'" >');
            //       //editor.insertContent('<img src="' + res.fileUrl + '" alt="'+imgAlt+'" >');
            //     })
            //     // editor.insertContent(
            //     // '<img src="'+imgUrl+'" alt="图片" >'
            //     // );
            //   }
            // }
          })
          // 自定义toolbar按钮，需要在toolbar添加
          editor.ui.registry.addButton("testBtn", {
            text: `按钮文字`,
            tooltip: "按钮提示",
            onAction: () =>
              editor.insertContent(
                '<a href="/" target="_blank">test text</a>'
              ),
          });
        },
      },
    };
  },
  //   init: {
  //     setup: (Editor) => {
  //       // 初次化编辑器
  //       Editor.on("init", () => {
  //         Editor.setContent(this.value);
  //       });
  //     },
  //   },
  watch: {
    value(newValue) {
      //if (this.tinymce.value !== newValue) this.tinymce.value = newValue;
      //用户vue绑定回显
      // if (this.isInit) {
      // this.isInit = false;
      //this.getContent();
      // this.$nextTick(() => {
      // const editor = tinymce.get("tinymce");
      //// editor.activeEditor.getContent()
      // editor.setContent(newValue);
      // this.content = editor.getContent();
      // console.log(editor.getContent())
      // });
      // }
      this.content = newValue;
    },
    content(newValue) {
      this.$emit("input", newValue);
    },
  },
  //获取焦点光标到最后面keepLastIndex (obj, window) {if (window.getSelection) { //ie11 10 9 ff safariobj.focus(); //解决ff不获取焦点无法定位问题var range = window.getSelection(); //创建rangerange.selectAllChildren(obj); //range 选择obj下所有子内容range.collapseToEnd(); //光标移至最后} else if (document.selection) { //ie10 9 8 7 6 5var range = document.selection.createRange(); //创建选择对象range.moveToElementText(obj); //range定位到objrange.collapse(false); //光标移至最后range.select();}}
  mounted() {
    // tinymce.setup((editor) => {
    // });
    tinymce.init({});
    //let imageArray = tinymce.dom.DomQuery("img").toArray();
    this.$nextTick(() => {
      //document.addEventListener("paste", function (e) {
      //let items = (event.clipboardData || window.clipboardData).items;
      //});
      //   this.keepLastIndex(
      //     ifra.contentWindow.document.getElementById("tinymce")
      //   );
    });
  },
  methods: {
    // file_picker_callback: function(callback, value, meta) {
    //     // Provide file and text for the link dialog
    //     if (meta.filetype == 'file') {
    //         callback('mypage.html', {text: 'My text'});
    //     }
    //     // Provide image and alt text for the image dialog
    //     if (meta.filetype == 'image') {
    //         callback('myimage.jpg', {alt: 'My alt text'});
    //     }
    //     // Provide alternative source and posted for the media dialog
    //     if (meta.filetype == 'media') {
    //         callback('movie.mp4', {source2: 'alt.ogg', poster: 'image.jpg'});
    //     }
    // },
    getContent() {
      var cnt = tinymce.editors["tinymce"].getContent();
      // console.log(cnt);
    },
    ///编辑框失去焦点事件
    focusOutEditor() {
      // console.log("失去焦点");
      //当前网页内编辑框中的所有图片，也就是失去焦点时的所有的图片
      let allMyWebImageArray = new Array();
      //删除的图片
      let deleteImages = [];
      //在修改后的所有图片
      let allTempImageList = new Array();
      //document.querySelectorAll("p img").length;
      //获取编辑框中所有的图片
      let imagesList = tinymce.activeEditor.getBody().querySelectorAll("img");
      if (imagesList.length != 0) {
        imagesList.forEach((item) => {
          //allTempImageArray.push({ filePath: item.src });
          var reg = RegExp(this.baseHost)
          //indexOf("") search("") includes("xxxx.xxx")
          //如果包含我们固定的本站域名，也就是管理系统所在的网站的全域名xxx.xxx.com
          if (item.src.match(reg)) {
            allMyWebImageArray.push({ filePath: this.getReplaceUrl(item.src) });
          }else if(!this.isUrlSimpleValid(item.src)){
            //判断如果没有包含我们固定的网站，又不符合一个文件资源url时，这里就是指item.src为/xxx/xxx/xxx.png
            allMyWebImageArray.push({ filePath: this.getReplaceUrl(item.src) });
          }
        });
      }
      //比较，每次上传后添加的所有照片数组或编辑重新获得编辑框所有的照片数组与失去焦点后重新计算的所有照片
      if (this.allImageList.length != 0) {
        deleteImages = this.allImageList.filter((item) => {
          return allMyWebImageArray.every((e) => e.filePath != item.filePath);
          //return allTempImageArray.indexOf(item) === -1
        });
        if (deleteImages.length > 0) {
          this.removeFileList(deleteImages);
        }
        allTempImageList = this.allImageList.filter((item) => {
          return deleteImages.every((e) => e.filePath != item.filePath);
        });
      }
    },
    //编辑框获得焦点事件
    focusOnEditor() {
      // console.log("得到焦点");
      // 1. 将 Array 数组转化为 Set 对象
      //const set = new Set(this.list)
      // 2. 调用 Set 对象的 delete 方法，移除对应的元素
      //set.delete(this.kw)
      // 3. 调用 Set 对象的 add 方法，向 Set 中添加元素
      //set.add(this.kw)
      // 4. 将 Set 对象转化为 Array 数组
      //this.list= Array.from(set)

      //编辑框获得焦点后，重新计算获得所有照片数组
      let tempImageArray = new Array();
      let imageArray = tinymce.activeEditor.getBody().querySelectorAll("img");
      if (imageArray.length != 0) {
        imageArray.forEach((item) => {
          //tempImageArray.push({ filePath: item.src });
          var reg = RegExp(this.baseHost)
          //indexOf("") search("") includes("xxxx.xxx")
          //如果包含我们固定的本站域名，也就是管理系统所在的网站的全域名xxx.xxx.com
          if (item.src.match(reg)) {
            tempImageArray.push({ filePath: this.getReplaceUrl(item.src) });
          }else if(!this.isUrlSimpleValid(item.src)){
            //判断如果没有包含我们固定的网站，又不符合一个文件资源url时，这里就是指item.src为/xxx/xxx/xxx.png
            tempImageArray.push({ filePath: this.getReplaceUrl(item.src) });
          }
        });
      }
      this.allImageList = tempImageArray;
    },
    //自定义上传函数
    uploadImageFile(blobInfo, success, failure, progress) {
      let formData = new FormData();
      formData.append("file", blobInfo.blob());
      uploadFileForArticle(formData)
        .then((response) => {
          //console.log(response);
          const fileUrl = response.url;
          var uploadSuccess = {};
          // 获取返回的图片路径，固定格式为：{location:url}
          success(fileUrl);//返回最后的完整上传文件的URL包括网站地址
          uploadSuccess = { filePath: fileUrl };
          //每次上传一个图片文件
          this.allImageList.push(uploadSuccess);
        })
        .catch((error) => {
          //console.log(error);
          failure("Invalid JSON: " + error);
          this.$message({
            message: error,
            type: "error",
            showClose: true,
          });
        });
    },
    //通用上传事件
    async uploadFileToFile(formData) {
      return uploadFileForArticle(formData)
        .then((response) => {
          //console.log(response);
          // const serverUrl = response.url;
          const fileUrl = response.url;
          // var uploadSuccess = {};
          const originalFileName = response.originalFileName;
          // uploadSuccess = { filePath: serverUrl };
          // this.allImageList.push(uploadSuccess);
          // this.$refs.uploadFileRef.clearFiles();
          var responseBody = { fileUrl: fileUrl, fileName: originalFileName };
          return responseBody;
        })
        .catch((error) => {
          //console.log(error);
          this.$message({
            message: error,
            type: "error",
            showClose: true,
          });
        });
    },
    //删除操作
    removeFileList(imgs) {
      //let filePath={filePaths:JSON.stringify(imgs)};
      if (imgs.length == 1) {
        deleteFileList(imgs)
          .then((response) => {
            this.$message({
              message: response.msg,
              type: "success",
            });
          })
          .catch((error) => {
            this.$message({
              message: error,
              type: "error",
              duration: 4000,
            });
          });
      } else if (imgs.length > 1) {
        var imgPath = imgs[0].filePath;
        deleteFile(imgPath)
          .then((response) => {
            this.$message({
              message: response.msg,
              type: "success",
            });
          })
          .catch((error) => {
            this.$message({
              message: error,
              type: "error",
              duration: 4000,
            });
          });
      }
    },
    //插入元素方法
    insertHtmlAtCaret(childElement) {
      var selection, range;
      if (window.getSelection) { // IE11 and non-IE
        selection = window.getSelection();
        if (selection.getRangeAt && selection.rangeCount) {
          range = selection.getRangeAt(0);
          range.deleteContents();
          var el = document.createElement("div");
          el.appendChild(childElement);
          // document.createDocumentFragment() 创建一个新的空白的文档片段
          var frag = document.createDocumentFragment(), node, lastNode;
          while ((node = el.firstChild)) {
            lastNode = frag.appendChild(node);
          }
          range.insertNode(frag);
          if (lastNode) {
            range = range.cloneRange();
            range.setStartAfter(lastNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      } else if (document.selection && document.selection.type != "Control") { // IE < 9
        //document.selection.createRange().pasteHTML(html);
      }
    },
    //替换文件资源网址
    getReplaceUrl(url){
      return url.replace(this.webProtocol+"//"+this.baseHost, "");
    },
    //拼接文件资源网址
    getServerUrl(url){
      return this.webProtocol+"//"+this.baseHost+url;
    },
    //检测是否是网址URL的样式结构，并没有详细检测是否规范化，例如www.fff，/file/xx/xx.img等也会被认为是一个url
    isValidUrl(url) {
      // const regex = /^(?:https?:\/\/|ftp:\/\/)?[^\.]+\.[^\s\/$.?#].[^\s]*$/;//判断http和ftp
      const regex = /^(?:https?:\/\/)?[^\.]+\.[^\s\/$.?#].[^\s]*$/;
      return regex.test(url);
    },
    //检测网址，只是基本判断是否符合一个规范网址url的结构，和上面不同，这里网址里只要有类似xxx.com等结构都符合
    isUrlSimpleValid(url) {
      var regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
      return regex.test(url);
    },
    //匹配url，获取匹配到的一级域名
    matchTLD(domain) {
      const tldRegex = /[^.]+\.[^.]+$/;
      const match = domain.match(tldRegex);
      return match ? match[0] : null;
    }
  },
  destroyed() { },
};
</script>

<style>
</style>
