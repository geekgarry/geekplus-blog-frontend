<template>
  <div>
    <el-upload
      v-show="false"
      ref="uploadImageFileRef"
      id="uploadImageFile"
      action="#"
      :multiple="true"
      :show-file-list="false"
      :file-list="fileList"
      :limit="9"
      accept=".jpg,.jpeg,.png,.bmp,.gif,.JPG,.JPEG,.PNG,.BMP,.GIF,.heic,.HEIC"
      :on-success="handleSuccess"
      :on-error="handleError"
      :before-upload="handleBeforeUpload"
      :on-exceed="handleExceed"
      :on-change="handleChange"
      :http-request="uploadImageFileEvent"
    >
      <el-tooltip content="选取一个图片" placement="top">
        <el-button type="primary">选取图片</el-button>
      </el-tooltip>
    </el-upload>
    <el-upload
      v-show="false"
      ref="uploadFileRef"
      id="uploadFile"
      action="#"
      :multiple="true"
      :show-file-list="false"
      :file-list="fileList"
      :limit="9"
      accept=".pdf,.doc,.docx,.zip,.rar,.tar,.7z,.PDF,.DOC,.DOCX,.ZIP,.RAR,.TAR,.7Z"
      :on-success="handleSuccessFile"
      :on-error="handleErrorFile"
      :before-upload="handleBeforeUploadFile"
      :on-exceed="handleExceedFile"
      :on-change="handleChangeFile"
      :http-request="uploadFileEvent"
    >
      <el-tooltip content="选取一个文件" placement="top">
        <el-button type="primary">选取文件</el-button>
      </el-tooltip>
    </el-upload>
    <div class="editor" id="quill-editor" ref="editor"
      :style="styles"></div>
    <!-- <quill-editor
      class="editor"
      ref="editor"
      id="quill-editor"
      :options="options"
      @blur="onEditorBlur($event)"
      @focus="onEditorFocus($event)"
      @ready="onEditorReady($event)"
      @change="onEditorChange($event)"
    >
    </quill-editor> -->
  </div>
</template>

<script>
// import hljs from 'highlight.js';
// import "highlight.js/styles/default.css";
// import 'highlight.js/styles/monokai-sublime.css';
// import 'highlight.js/styles/vs2015.css';
// import 'highlight.js/styles/stackoverflow-light.css'// 导入高亮主题样式
import Quill from "quill";
// import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
// import "quill/dist/quill.bubble.css";
// import ImageDrop from 'quill-image-drop-module';
// Quill.register('modules/imageDrop', ImageDrop);

//视频处理
const BlockEmbed = Quill.import("blots/block/embed");
class VideoBlot extends BlockEmbed {
  static create(value) {
    let node = super.create();
    node.setAttribute("src", value.url);
    node.setAttribute("controls", value.controls);
    node.setAttribute("width", value.width);
    node.setAttribute("height", value.height);
    node.setAttribute("webkit-playsinline", true);
    node.setAttribute("playsinline", true);
    node.setAttribute("x5-playsinline", true);
    return node;
  }

  static value(node) {
    return {
      url: node.getAttribute("src"),
      controls: node.getAttribute("controls"),
      width: node.getAttribute("width"),
      height: node.getAttribute("height"),
    };
  }
}

VideoBlot.blotName = "simpleVideo";
VideoBlot.tagName = "video";
Quill.register(VideoBlot);
// 调整上传图片大小
import ImageResize from "quill-image-resize-module";
Quill.register("modules/imageResize", ImageResize);
let Link = Quill.import('formats/link')
class FileBlot extends Link {
  // 继承Link Blot
  static create(value) {
    let node = undefined
    if (value && !value.href) {
      // 适应原本的Link Blot
      node = super.create(value)
    } else {
      // 自定义Link Blot
      node = super.create(value.href)
      // node.setAttribute('download', value.innerText);  // 左键点击即下载
      node.innerText = value.innerText
      node.download = value.innerText
    }
    return node
  }
}
FileBlot.blotName = 'link'
FileBlot.tagName = 'A'
Quill.register(FileBlot)
let fontList = ['songti', 'SimSun', 'SimHei', 'Microsoft-YaHei', 'KaiTi', 'FangSong'].concat(Quill.import('formats/font').whitelist)
import { uploadFileForArticle, deleteFile, deleteFileList } from "@/api/common";
export default {
  name: "QuillEditor",
  components: {
    Quill,
  },
  props: {
    /* 编辑器的内容 */
    value: {
      type: String,
      default: "",
    },
    /* 高度 */
    height: {
      type: Number,
      default: null,
    },
    /* 最小高度 */
    minHeight: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      Quill: null,
      currentValue: "",
      // 富文本编辑器配置
      options: {
        theme: "snow",
        bounds: document.querySelector(".editor"),
        debug: "warn",
        useBR: false,
        modules: {
          history: {
            delay: 2000,
            maxStack: 500,
            userOnly: true
          },
          // 工具栏配置
          toolbar: {
            container: [
              ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
              ["blockquote", "code-block"], // 引用  代码块
              [{ header: 1 }, { header: 2 }], // 1、2 级标题
              [{ list: "ordered" }, { list: "bullet" }], // 有序、无序列表
              [{ script: "sub" }, { script: "super" }], // 上标/下标
              [{ indent: "-1" }, { indent: "+1" }], // 缩进
              [{ direction: "rtl" }], // 文本方向
              [{ size: ["small", false, "large", "huge"] }], // 字体大小
              [{ header: [1, 2, 3, 4, 5, 6] }], // 标题
              [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
              [{ font: fontList }], // 字体种类
              [{ align: [] }], // 对齐方式
              ["clean"], // 清除文本格式
              ["link", "image", "video", "upload"], // 链接、图片、视频
              ["table"] // "formula" 需要KaTex
            ],
            handlers: {
              image: function (value) {
                if (value) {
                  // value === true
                  document.querySelector("#uploadImageFile input").click();
                } else {
                  this.Quill.format("image", false);
                }
              },
              upload: function (value) {
                if (value) {
                  // value === true
                  document.querySelector("#uploadFile input").click();
                }
              }
            },
          },
          table: true,
          clipboard: {
            matchVisual: false
          },
          // 调整图片大小
          imageResize: {
            displayStyles: {
              backgroundColor: "black",
              border: "none",
              color: "white",
            },
            modules: ["Resize", "DisplaySize", "Toolbar"],
          },
          syntax: {
            hljs: (() => {
              return this.hljs;
            })()
            // highlight: text => {
            //   return this.hljs.highlightAuto(text).value; // 这里就是代码高亮需要配置的地方
            // }
          }
        },
        placeholder: '请输入内容',
        readOnly: false,
      },
      fileList: [],
      webProtocol: window.location.protocol, //取得网站的协议头部
      baseHost: window.location.host, //取得网站的地址
      baseApi: process.env.VUE_APP_BASE_API, //这里就是网站自身跨域的/api
      allImageList: [],
      deltaValue: {}
    };
  },
  computed: {
    styles() {
      let style = {};
      if (this.minHeight) {
        style.minHeight = `${this.minHeight}px`;
      }
      if (this.height) {
        style.height = `${this.height}px`;
      }
      return style;
    },
  },
  watch: {
    value: {
      handler(val) {
        if (val !== this.currentValue) {
          this.currentValue = val === null ? "" : val;
          if (this.Quill) {
            this.Quill.clipboard.dangerouslyPasteHTML(this.currentValue);//v2.0之后
            // this.Quill.pasteHTML(this.currentValue);//v1版本支持
          }
        }
      },
      immediate: true,
    }
  },
  mounted() {
    this.init();
    this.$nextTick(() => {
      this.setTitleConfig();
    });
  },
  beforeDestroy() {
    this.Quill = null;
  },
  methods: {
    init() {
      const editor = this.$refs.editor;
      this.Quill = new Quill(editor, this.options);
      this.Quill.clipboard.dangerouslyPasteHTML(this.currentValue);//v2.0之后
      // this.Quill.pasteHTML(this.currentValue);//v1版本支持
      // const delta = this.Quill.clipboard.convert(this.currentValue);
      // this.Quill.setContents(delta) //大概这样子，你是什么版本
      this.Quill.on("text-change", (delta, oldDelta, source) => {
        //this.$refs.editor.children[0].innerHTML;
        const html = this.Quill.getSemanticHTML();
        const text = this.Quill.getText();
        // const delta1 = this.Quill.getContents();
        // this.deltaValue = delta1;
        const quill = this.Quill;
        this.currentValue = html;
        this.$emit("input", html);
        this.$emit("on-change", { html, text, quill });
        // 如果不使用html，则使用delta插入，需要定义一个类似currentValue的delta对象，存储每次文本变化时的数据
        //this.$emit("on-text-change", delta, oldDelta, source);
      });
      // Mark model as touched if editor lost focus
      this.Quill.on("selection-change", (range, oldRange, source) => {
        if (!range) {
          //代表失去焦点事件
          this.$emit("onEditorBlur", range, oldRange, source);
          // this.$emit("blur", this.Quill);
          //console.log("失去焦点")
          //this.onEditorBlur();
        } else {
          this.$emit("onEditorFocus", this.Quill);
          //console.log("得到焦点")
        }
      });
      // this.Quill.on("selection-change", (range, oldRange, source) => {
      //   this.$emit("on-selection-change", range, oldRange, source);
      // });
      this.Quill.on("editor-change", (eventName, ...args) => {
        this.$emit("on-editor-change", eventName, ...args);
      });
      window.addEventListener(
        "paste",
        (evt) => {
          if (
            evt.clipboardData &&
            evt.clipboardData.files &&
            evt.clipboardData.files.length
          ) {
            evt.preventDefault();
            [].forEach.call(evt.clipboardData.files, (file) => {
              if (!file.type.match(/^image\/(gif|jpe?g|a?png|bmp|webp)/i)) {
                return;
              }
              const formData = new FormData();
              formData.append("file", file);
              this.uploadImageFileToFile(formData);
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
              //       this.$message({
              //         message: res.data.message,
              //         type: "warning",
              //       });
              //     }
              //   });
            });
          }
        },
        false
      );
    },
    //设置工具栏中文提示
    setTitleConfig() {
      // toolbar标题
      const titleConfig = [
        { Choice: ".ql-insertMetric", title: "跳转配置" },
        { Choice: ".ql-bold", title: "加粗" },
        { Choice: ".ql-italic", title: "斜体" },
        { Choice: ".ql-underline", title: "下划线" },
        { Choice: ".ql-header", title: "段落格式" },
        { Choice: ".ql-strike", title: "删除线" },
        { Choice: ".ql-blockquote", title: "块引用" },
        { Choice: ".ql-code", title: "插入代码" },
        { Choice: ".ql-code-block", title: "插入代码段" },
        { Choice: ".ql-font", title: "字体" },
        { Choice: ".ql-size", title: "字体大小" },
        { Choice: '.ql-list[value="ordered"]', title: "编号列表" },
        { Choice: '.ql-list[value="bullet"]', title: "项目列表" },
        { Choice: ".ql-direction", title: "文本方向" },
        { Choice: '.ql-header[value="1"]', title: "h1" },
        { Choice: '.ql-header[value="2"]', title: "h2" },
        { Choice: ".ql-align", title: "对齐方式" },
        { Choice: ".ql-color", title: "字体颜色" },
        { Choice: ".ql-background", title: "背景颜色" },
        { Choice: ".ql-image", title: "图像" },
        { Choice: ".ql-video", title: "视频" },
        { Choice: ".ql-link", title: "添加链接" },
        { Choice: ".ql-formula", title: "插入公式" },
        { Choice: ".ql-clean", title: "清除字体格式" },
        { Choice: '.ql-script[value="sub"]', title: "下标" },
        { Choice: '.ql-script[value="super"]', title: "上标" },
        { Choice: '.ql-indent[value="-1"]', title: "向左缩进" },
        { Choice: '.ql-indent[value="+1"]', title: "向右缩进" },
        { Choice: ".ql-header .ql-picker-label", title: "标题大小" },
        {
          Choice: '.ql-header .ql-picker-item[data-value="1"]',
          title: "标题一",
        },
        {
          Choice: '.ql-header .ql-picker-item[data-value="2"]',
          title: "标题二",
        },
        {
          Choice: '.ql-header .ql-picker-item[data-value="3"]',
          title: "标题三",
        },
        {
          Choice: '.ql-header .ql-picker-item[data-value="4"]',
          title: "标题四",
        },
        {
          Choice: '.ql-header .ql-picker-item[data-value="5"]',
          title: "标题五",
        },
        {
          Choice: '.ql-header .ql-picker-item[data-value="6"]',
          title: "标题六",
        },
        { Choice: ".ql-header .ql-picker-item:last-child", title: "标准" },
        {
          Choice: '.ql-size .ql-picker-item[data-value="small"]',
          title: "小号",
        },
        {
          Choice: '.ql-size .ql-picker-item[data-value="large"]',
          title: "大号",
        },
        {
          Choice: '.ql-size .ql-picker-item[data-value="huge"]',
          title: "超大号",
        },
        { Choice: ".ql-size .ql-picker-item:nth-child(2)", title: "标准" },
        { Choice: ".ql-align .ql-picker-item:first-child", title: "居左对齐" },
        {
          Choice: '.ql-align .ql-picker-item[data-value="center"]',
          title: "居中对齐",
        },
        {
          Choice: '.ql-align .ql-picker-item[data-value="right"]',
          title: "居右对齐",
        },
        {
          Choice: '.ql-align .ql-picker-item[data-value="justify"]',
          title: "两端对齐",
        },
      ];
      for (const item of titleConfig) {
        const tip = document.querySelector(".editor " + item.Choice);
        if (!tip) continue;
        tip.setAttribute("title", item.title);
      }
    },
    // 失去焦点触发事件
    onEditorBlur() {
      // console.log("失去焦点！！！");
      //所有编辑框中获取的图片文件,编辑框失去焦点时编辑框的所有的图片
      let allMyWebImageArray= new Array();
      //删除的图片
      let deleteImages = [];
      //在修改后的所有图片
      let allTempImageList=new Array();
      //获取编辑框中的所有图片文件
      let imageArray = document.querySelectorAll(".ql-editor img");
      if (imageArray.length != 0) {
        imageArray.forEach((item) => {
          // allTempImageArray.push({ filePath: item.src });
          //var reg=RegExp(/xxxx.xxx/) match(reg)
          // search("")!=-1 includes("xxxx.xxx")==true
          //如果包含我们固定的本站域名，也就是管理系统所在的网站的全域名xxx.xxx.com
          if (item.src.indexOf(this.baseHost) != -1) {
            allMyWebImageArray.push({ filePath: this.getReplaceUrl(item.src) });
          }else if(!this.isUrlSimpleValid(item.src)){
            //判断如果没有包含我们固定的网站，又不符合一个文件资源url时，这里就是指item.src为/xxx/xxx/xxx.png
            allMyWebImageArray.push({ filePath: this.getReplaceUrl(item.src) });
            item.src = this.getServerUrl(item.src);
          }
        });
      }
      // 开始判断所有照片文件集是否为0，比较所有照片文件数组和编辑框失去焦点时的所有照片文件数组
      // 如果在所有照片文件集里有，而失去焦点时获取的照片文件集没有，则得到一个需要删除的文件集，反之则没有
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
    // 获得焦点触发事件
    onEditorFocus() {
      //console.log("得到焦点！！！")
      //编辑框获得焦点后，重新计算获得所有照片数组
      let tempImageArray = new Array();
      let imageArray = document.querySelectorAll(".ql-editor img");
      if (imageArray.length!=0) {
        imageArray.forEach((item) => {
          // tempImageArray.push({ filePath: item.src });
          var reg = RegExp(this.baseHost);
          //indexOf("") search("") includes("xxxx.xxx")
          //如果包含我们固定的本站域名，也就是管理系统所在的网站的全域名xxx.xxx.com
          if (item.src.match(reg)) {
            tempImageArray.push({ filePath: this.getReplaceUrl(item.src) });
          }else if(!this.isUrlSimpleValid(item.src)){
            //判断如果没有包含我们固定的网站，又不符合一个文件资源url时，这里就是指item.src为/xxx/xxx/xxx.png
            tempImageArray.push({ filePath: this.getReplaceUrl(item.src) });
            item.src = this.getServerUrl(item.src);
          }
        });
      }
      this.allImageList = tempImageArray;
    },
    //删除操作
    removeFileList(imgs) {
      //let filePath={filePaths:JSON.stringify(imgs)};
      if(imgs.length==1){
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
      }else if(imgs.length>1) {
        var imgPath=imgs[0].filePath;
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
    // 上传成功
    handleSuccess() {
      this.$refs.uploadImageFileRef.clearFiles();
      this.$message({
        message: "上传成功",
        type: "success",
      });
    },
    // 上传成功
    handleSuccessFile() {
      this.$refs.uploadFileRef.clearFiles();
      this.$message({
        message: "上传成功",
        type: "success",
      });
    },
    // 上传失败
    handleError() {
      this.$message({
        message: "上传失败",
        type: "error",
      });
    },
    // 上传失败
    handleErrorFile() {
      this.$message({
        message: "上传失败",
        type: "error",
      });
    },
    // 上传文件之前
    handleBeforeUpload(file) {
      const fileType = file.name.substring(file.name.lastIndexOf(".") + 1);
      const fileTypeList = [
        "jpg",
        "jpeg",
        "png",
        "bmp",
        "gif",
        "JPG",
        "JPEG",
        "PNG",
        "BMP",
        "GIF",
        "heic",
        "HEIC",
      ];
      if (!fileTypeList.includes(fileType)) {
        this.$message({
          message: "上传文件只能是常用图片格式",
          type: "error",
        });
        this.fileList = [];
        return false;
      }
      return true;
    },
    // 上传文件之前
    handleBeforeUploadFile(file) {
      const fileType = file.name.substring(file.name.lastIndexOf(".") + 1);
      const fileTypeList = [
        "pdf",
        "doc",
        "docx",
        "zip",
        "rar",
        "tar",
        "7z",
        "PDF",
        "DOC",
        "DOCX",
        "ZIP",
        "RAR",
        "TAR",
        "7Z"
      ];
      if (!fileTypeList.includes(fileType)) {
        this.$message({
          message: "上传文件只能是常用图片格式",
          type: "error",
        });
        this.fileList = [];
        return false;
      }
      return true;
    },
    // 上传文件数超过限制
    handleExceed() {
      this.$message({
        message: "最大上传文件个数为1",
        type: "error",
        showClose: true,
      });
    },
    // 上传文件数超过限制
    handleExceedFile() {
      this.$message({
        message: "最大上传文件个数为1",
        type: "error",
        showClose: true,
      });
    },
    // 文件状态改变时
    handleChange(file, fileList) {
      //console.log(file.status+file.raw)
      //console.log(fileList)
      //这一步会把上传的文件封装到fileList
      if (file.status === "ready") {
        //this.fileList.push(file.raw)
        this.fileList = fileList;
      }
    },
    // 文件状态改变时
    handleChangeFile(file, fileList) {
      //console.log(file.status+file.raw)
      //console.log(fileList)
      //这一步会把上传的文件封装到fileList
      if (file.status === "ready") {
        //this.fileList.push(file.raw)
        this.fileList = fileList;
      }
    },
    //自定义上传图片文件
    uploadImageFileEvent(file) {
      //this.formData.append("file", file.file);
      //console.log(file.file, "上传图片文件");
      //const imageUrl = 上传七牛云后返回来的一串在线链接
      let formData = new FormData();
      formData.append("file", file.file); //this.fileList[0].raw);//拿到存在fileList的文件存放到formData中
      //下面数据是我自己设置的数据,可自行添加数据到formData(使用键值对方式存储)
      // 解析上传的文件
      //let file = this.fileList[0]
      //console.log(file)
      this.uploadImageFileToFile(formData);
    },
    //自定义上传文件
    uploadFileEvent(file) {
      //this.formData.append("file", file.file);
      //console.log(file.file, "上传图片文件");
      //const imageUrl = 上传七牛云后返回来的一串在线链接
      let formData = new FormData();
      formData.append("file", file.file); //this.fileList[0].raw);//拿到存在fileList的文件存放到formData中
      //下面数据是我自己设置的数据,可自行添加数据到formData(使用键值对方式存储)
      // 解析上传的文件
      //let file = this.fileList[0]
      //console.log(file)
      this.uploadFileToFile(formData);
    },
    //上传图片文件
    uploadImageFileToFile(formData) {
      uploadFileForArticle(formData)
        .then((response) => {
          //console.log(response);
          const serverUrl = response.url;
          const fileUrl = this.getServerUrl(serverUrl);
          var uploadSuccess = {};
          // this.$message({
          //   message: "上传" + response.msg,
          //   type: "success",
          // });
          // 获取光标所在位置
          //let quill = this.$refs.editor.quill;
          // 获取光标所在位置
          let length = this.Quill.getSelection().index; //光标位置
          // 插入图片地址
          this.Quill.insertEmbed(length, "image", fileUrl);
          this.Quill.insertText(length + 1, "\r\n", true);
          // 光标后移一位
          this.Quill.setSelection(length + 2);
          // this.content += url
          uploadSuccess = { filePath: serverUrl };
          this.allImageList.push(uploadSuccess);
          this.$refs.uploadImageFileRef.clearFiles();
        })
        .catch((error) => {
          //console.log(error);
          this.$message({
            message: error.msg,
            type: "error",
            showClose: true,
          });
        });
    },
    //上传资源文件
    uploadFileToFile(formData) {
      uploadFileForArticle(formData)
        .then((response) => {
          //console.log(response);
          const serverUrl = response.url;
          const fileUrl = this.getServerUrl(serverUrl);
          // var uploadSuccess = {};
          const originalFileName = response.originalFileName;
          // this.$message({
          //   message: "上传" + response.msg,
          //   type: "success",
          // });
          // 获取光标所在位置
          //let quill = this.$refs.editor.quill;
          // 获取光标所在位置
          let length = this.Quill.getSelection().index; //光标位置
          // 插入图片地址
          //this.Quill.insertEmbed(length, "image", imageUrl);
          this.Quill.insertEmbed(length, 'link', { href: fileUrl, innerText: originalFileName })
          // this.Quill.insertText(length, "\r\n",true);
          // 光标后移一位
          this.Quill.setSelection(length + 1);
          // this.content += url
          // uploadSuccess = { filePath: serverUrl };
          // this.allImageList.push(uploadSuccess);
          this.$refs.uploadFileRef.clearFiles();
        })
        .catch((error) => {
          //console.log(error);
          this.$message({
            message: error.msg,
            type: "error",
            showClose: true,
          });
        });
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
};
</script>

<style>
.ql-container.ql-snow {
  line-height: normal !important;
  font-size: 14px;
  height: 440px !important;
}
.editor,
.ql-toolbar {
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}
.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "请输入链接地址:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}

/*加上height和滚动属性就可以，滚动条样式是系统默认样式，可能不同*/
.ql-snow .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options {
  border-color: #ccc;
  height: 125px !important;
  overflow: auto;
}
.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "请输入视频地址:";
}

.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: "14px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
  content: "10px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
  content: "18px";
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
  content: "32px";
}

.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "标题1";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "标题2";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "标题3";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "标题4";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
  content: "标题5";
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
  content: "标题6";
}

.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: "标准字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
  content: "衬线字体";
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
  content: "等宽字体";
}
.ql-toolbar button.ql-upload{
  background-image: url("@/assets/images/icons/upload.svg") !important;
  background-size: 18px 18px !important;
  background-position: center center !important;
  background-repeat:no-repeat !important;
}
</style>
