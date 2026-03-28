<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24">
        <el-page-header @back="goBack" content="发布文章"></el-page-header>
      </el-col>
    </el-row>
    <el-divider></el-divider>
    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
      <!-- <el-form-item label="作者ID，用户ID" prop="authorId">
              <el-input
                v-model="form.authorId"
                placeholder="请输入作者ID，用户ID"
              />
            </el-form-item> -->
      <el-form-item label="文章标题" prop="articleTitle">
        <el-input v-model="form.articleTitle" placeholder="请输入文章标题" />
      </el-form-item>
      <!-- v-if="$common.isEmpty($store.state.user.username)" -->
      <el-form-item label="作者名称" prop="authorName" >
        <el-input v-model="form.authorName" placeholder="请输入作者名称，用户名" />
      </el-form-item>
      <el-form-item label="文章内容" prop="articleContent">
        <div style="margin: 0 0 10px 0">
          <el-radio-group v-model="editorNo" size="small">
            <el-radio-button label="1">TinyEditor</el-radio-button>
            <el-radio-button label="2">Joditor</el-radio-button>
            <el-radio-button label="3">QuillEditor</el-radio-button>
          </el-radio-group>
        </div>
        <tiny-editor v-if="editorNo == 1" v-model="form.articleContent" :article-title="form.articleTitle" />
        <jodit-editor v-else-if="editorNo == 2" v-model="form.articleContent" />
        <quill-editor v-else v-model="form.articleContent" :min-height="192" @onEditorBlur="onEditorBlur"
          @onEditorFocus="onEditorFocus" />
        <!-- <froala-editor v-else v-model="form.articleContent" /> -->
      </el-form-item>
      <el-form-item label="文章类型" prop="articleCategory">
        <!-- <el-tree :data="getTreeListCategory(listCategory)" v-model="form.articleCategory" ref="treeCategory" show-checkbox
              node-key="id"
              :default-checked-keys="[form.articleCategory]"
              :check-on-click-node="true"
              @check-change="handleCheckChange"
              @check="treeCheck"
              :props="defaultProps" aria-placeholder="请选择文章类型" >
              </el-tree> -->
        <el-select v-model="form.articleCategory" placeholder="请选择" clearable>
          <!-- <el-option-group
                  v-for="group in listCategory"
                  :key="group.categoryName"
                  :label="group.categoryName">
                </el-option-group> -->
          <el-option v-for="(item, index) in listCategory" :key="index" :label="item.categoryName" :value="item.id">
          </el-option>
        </el-select>
        <!-- <el-input v-model="form.articleCategory" placeholder="请输入文章类型" /> -->
      </el-form-item>
      <el-form-item label="文章标签">
        <el-select multiple v-model="formArticleTagIds" @change="changeArticleTag" collapse-tags placeholder="请选择一个标签"
          clearable>
          <el-option v-for="(item, index) in listArticleTag" :key="index" :label="item.tagName"
            :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="是否显示" prop="isDisplay">
        <!-- <el-input v-model="form.workVisible" placeholder="请输入0（展示在简历中）或1（不展示）" :disabled="onlyRead" /> -->
        <el-select v-model="form.isDisplay" placeholder="请选择是否页面显示" :disabled="onlyRead">
          <el-option label="不显示" value="0" />
          <el-option label="显示" value="1" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="文章点赞数量" prop="likeCount">
              <el-input v-model="form.likeCount" placeholder="请输入文章点赞数量" />
            </el-form-item>
            <el-form-item label="文章浏览数量" prop="viewCount">
              <el-input v-model="form.viewCount" placeholder="请输入文章浏览数量" />
            </el-form-item> -->
    </el-form>
    <div type="flex" justify="center" align="middle">
      <!-- <el-container> -->
      <el-button type="primary" @click="submitForm">确 认</el-button>
      <!-- <el-button type="primary" @click="getHtmlVal">内 容</el-button> -->
      <el-button @click="resetAll">清 空</el-button>
      <!-- </el-container> -->
    </div>
    <gp-dialog :title="title" :width="280" :height="180" :content="dialog_content" footer="footer" cancelText="取消"
      okText="确认" switchFullscreen @close="onClose" @cancel="onCancel" @ok="onConfirm" center="center" :top="50"
      :loading="loading" :visible="dialog_visible">
      <template #title>
        <p class="u-title">提示</p>
      </template>
      <p>发布文章成功</p>
    </gp-dialog>

    <!-- 添加或修改文章对话框 -->
    <el-dialog :title="publishSuccessTitle" :visible.sync="publishSuccessVisible" width="666px" append-to-body>
      <publish-success :articleId="publishSuccessId"></publish-success>
    </el-dialog>
  </div>
</template>
<script>
import { listSubParentCategory, listSubCategory } from "@/api/geekplus/category";
import { listTags, getTagByArticleId, addArticleMapTag, deleteGpArticleMapTag } from "@/api/geekplus/articletags";
import { listArticles, getArticles, delArticles, addArticles, updateArticles, exportArticles,
  readAllFileList, getAllImageList } from "@/api/geekplus/articles";
import { deleteFile, deleteFileList } from "@/api/common";
import TinyEditor from "@/components/TinyMCE"
// import QuillEditor from "@/components/QuillEditor";
import JoditEditor from "@/components/JoditEditor";
import GpDialog from '@/components/GpDialog'
// import FroalaEditor from "@/components/FroalaEditor";
import PublishSuccess from "@/views/admin/geekplus/writearticle/success.vue"

export default {
  name: "WriteArticle",
  components: {
    TinyEditor,
    // QuillEditor,
    JoditEditor,
    GpDialog,
    // FroalaEditor,
    PublishSuccess
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 文章表格数据
      articlesList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        authorName: null,
        authorId: null,
        articleTitle: null,
        articleContent: null,
        articleCategory: null,
        likeCount: null,
        viewCount: null,
      },
      // 表单参数
      form: {
        authorName: null,
        authorId: null,
        articleTitle: null,
        articleContent: '',
        articleCategory: null,
        isDisplay: null
      },
      // 表单校验
      rules: {
        articleTitle: [
          { required: true, message: '请输入文章标题', trigger: 'blur' },
          { min: 6, max: 100, message: '长度在 6 到 45 个字符', trigger: 'blur' }
        ],
        authorName: [
          { required: true, message: '请输入文章作者', trigger: 'blur' }
        ],
        articleContent: [
          { required: true, message: '请写入文章内容', trigger: 'change' },
          { min: 100, message: '字数不少于100', trigger: 'blur' }
        ],
        articleCategory: [
          { required: true, message: '请选择一个文章所属主题', trigger: 'change' }
        ],
        isDisplay: [
          { required: true, message: '请选择是否显示', trigger: 'change' }
        ],
      },
      listCategory: [], //子菜单列表
      listArticleTag: [], //标签列表
      onlyRead: false,
      defaultProps: {
        children: "children",
        label: "label",
        disabled: null,
        isLeaf: null,
      },
      articleTagIds: [],
      formArticleTagIds: [],
      selectAll: false,
      allImageList: [],
      displayFileFolder: false,
      fileFolderTitle: "",
      fileFolderList: [],
      fileImageList: [],
      displayAllImage: false,
      baseHost: window.location.host,
      baseApi: process.env.VUE_APP_BASE_API,
      baseFrontWebApi: "/geekplus-api",//这里用到的基础/api前缀是为前端的/api，所以必须和/api(env里的VUE_APP_BASE_API)一致
      resetTinyEditor: false,
      // jcontent: "", //编辑器正文内容
      switchEditor: true,
      editorNo: 1,
      dialog_visible: false,
      dialog_content: '',
      publishSuccessVisible: false,
      publishSuccessTitle: "",
      publishSuccessId: 0,
    };
  },
  created() {
    this.form.authorId = this.userId;
    this.form.authorName = this.nickname;
    if (this.articleId) {
      this.getUpdateArticle();
    }
    this.getListCategory();
    this.getListArticleTag();
  },
  watch: {
    $route(to, from) {
      if(to.path.includes('/writeArticle')){
        this.form.authorId = this.userId;
        this.form.authorName = this.nickname;
        if (this.articleId) {
          this.getUpdateArticle();
        }
      }
    }
  },
  computed: {
    articleId() {
      return this.$route.query.articleId;
    },
    userId() {
      return this.$store.getters.userId;
    },
    nickname() {
      return this.$store.getters.nickname;
    }
  },
  methods: {
    // 表单重置
    reset() {
      this.form = {
        id: null,
        authorName: null,
        authorId: null,
        articleTitle: null,
        articleContent: '',
        articleCategory: null,
        isDisplay: null,
        likeCount: null,
        viewCount: null,
        createTime: null,
        updateTime: null,
      };
      this.resetForm("form");
    },
    /** 修改按钮操作 */
    getUpdateArticle() {
      this.reset();
      this.articleTagIds = [];
      var qParams = { articleId: this.articleId };
      getArticles(this.articleId).then((response) => {
        this.form = response.data;
        getTagByArticleId(qParams).then((response) => {
          //console.log(response.data)
          let articleTag = response.data;
          let mapTags = articleTag.map((item) => {
            return item.id;
          }); // 生成数组
          // console.log(mapTags)
          this.formArticleTagIds = mapTags;
          this.articleTagIds = mapTags;
          // console.log(this.form.articleTagIds)
        });
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateArticles(this.form).then((response) => {
              this.msgSuccess("文章修改成功");
              //this.getList();
              //this.articleTagId=[];
              // console.log(this.formArticleTagIds)
              // console.log(this.articleTagIds)
              this.publishSuccessId = this.form.id;
              this.addAndRemoveArticleTag(this.form.id, this.formArticleTagIds);
              //this.resetAll();
            });
          } else {
            // this.form.authorId = this.$store.state.user.userId;
            // this.form.authorName="";
            addArticles(this.form).then((response) => {
              var articleId = response.articleId;
              //console.log(articleId);
              this.msgSuccess("文章新增成功");
              //this.getList();
              // console.log(this.formArticleTagIds)
              // console.log(this.articleTagIds)
              this.publishSuccessId = articleId;
              this.addAndRemoveArticleTag(articleId, this.formArticleTagIds);
            })
          }
        }
      });
    },
    addAndRemoveArticleTag(articleId, articleTagIds) {
      if (this.articleTagIds == undefined || this.articleTagIds.length == 0) {
        this.addMapTagForArticle(articleId, articleTagIds)
      } else {
        // 差集 通过两个数组的比较差值，以数据库中的为基准查询比较差值为删除的数据
        var deleteData = this.articleTagIds.filter(item => !articleTagIds.includes(item))
        // console.log(deleteData)
        // 通过两个数组的比较差值，以表单中的为基准查询比较差值为添加的数据
        var addData = articleTagIds.filter(item => !this.articleTagIds.includes(item))
        // console.log(addData)
        // let allRoleIds = this.roleIds.filter((item) => {
        //   return this.form.roleIds.every((e) => e != item);
        //   //return tempImageList.indexOf(item) === -1
        // });
        //大于0，开始执行删除
        if (deleteData.length > 0) {
          this.deleteMapTagForArticle(articleId, deleteData);
        }
        //大于0，开始执行添加
        if (addData.length > 0) {
          this.addMapTagForArticle(articleId, addData);
        }
      }
      this.resetAll();
      this.goToSuccess(articleId);
    },
    addMapTagForArticle(articleId, articleTagIds) {
      if (articleTagIds.length > 0 || articleTagIds != []) {
        articleTagIds.forEach((item) => {
          let dataForm = { articleId: articleId, articleTag: item };
          addArticleMapTag(dataForm).then((response) => {
            this.msgSuccess("标签修改或新增成功");
          });
        });
      }
    },
    deleteMapTagForArticle(articleId, articleTagIds) {
      if (articleTagIds.length > 0 || articleTagIds != []) {
        articleTagIds.forEach((item) => {
          let queryParams = { articleId: articleId, articleTag: item };
          deleteGpArticleMapTag(queryParams)
            .then((response) => {
              this.msgSuccess(response.msg);
            })
            .catch((error) => {
              this.msgError(error.msg);
            });
        });
      }
    },
    getListCategory() {
      listSubCategory()
        .then((response) => {
          this.listCategory = response.data;
        })
        .catch((error) => {
          this.msgError(error.msg);
        });
    },
    getListArticleTag() {
      var params = { pageNum: 1, pageSize: 999 };
      listTags(params)
        .then((response) => {
          //console.log(response.rows);
          this.listArticleTag = response.rows;
        })
        .catch((error) => {
          this.msgError(error.msg);
        });
    },
    changeArticleTag(val) {
      if (this.selectAll) {
        this.selectAll = false;
        if (val.indexOf("全选") > -1) {
          this.formArticleTagIds = val.filter((p) => p != "全选");
        } else {
          this.formArticleTagIds = [];
        }
      } else {
        if (val.indexOf("全选") > -1) {
          this.formArticleTagIds = ["全选", ...this.listArticleTag];
          this.selectAll = true;
        } else {
          if (val.length === this.listArticleTag.length) {
            this.formArticleTagIds = ["全选", ...this.listArticleTag];
            this.selectAll = true;
          } else {
            this.formArticleTagIds = val;
          }
        }
      }
      // console.log(this.formArticleTagIds);
    },
    goBack() {
      //this.$router.back();
      const newLink = this.$router.push("/admin/geekplus/articles");
      //window.open(newLink.href,'_blank');
      //console.log('go back');
    },
    resetAll() {
      this.reset();
      this.form.articleContent = '';
      this.formArticleTagIds = [];
      this.$router.replace({ path: '/admin/geekplus/writeArticle', query: {} });
    },
    getHtmlVal() {
      //console.log(this.form.articleContent);
    },
    // 失去焦点触发事件
    onEditorBlur() {
      //所有的我的网站图片
      let allMyWebImageArray = new Array();
      //console.log("失去焦点！！！");
      //初始的所有的图片
      let allTempImageArray = [];
      //this.allImageList = [];
      //删除的图片
      let deleteImages = [];
      //在修改后的所有图片
      let allTempImageList = new Array();
      let imageArray = document.querySelectorAll(".ql-editor img");
      if (imageArray.length != 0) {
        imageArray.forEach((item) => {
          //allTempImageArray.push({ filePath: this.getServerFilePath(item.src) });
          // var reg = RegExp(/xxxx.xxx/)
          //indexOf("") search("") includes("xxxx.xxx")
          // if (item.src.match(reg)) {}
          allMyWebImageArray.push({ filePath: this.getServerFilePath(item.src) });
        });
      }
      if (this.allImageList.length != 0) {
        deleteImages = this.allImageList.filter((item) => {
          return allMyWebImageArray.every((e) => e.filePath != item.filePath);
          //return allTempImageArray.indexOf(item) === -1
        });
        // console.log(allTempImageArray);
        // console.log(this.allImageList);
        // console.log(deleteImages);
        if (deleteImages.length > 0) {
          this.removeFileList(deleteImages);
        }
        allTempImageList = this.allImageList.filter((item) => {
          return deleteImages.every((e) => e.filePath != item.filePath);
        });
        // console.log(deleteImages);
        // console.log(allTempImageList);
      }
      //this.allImageList = allMyWebImageArray;//allTempImageArray;
      //this.allImageList = allTempImageList;
      // console.log(this.allImageList)
    },
    // 获得焦点触发事件
    onEditorFocus() {
      //console.log("得到焦点！！！")
      let tempImageArray = new Array();
      let imageArray = document.querySelectorAll(".ql-editor img");
      if (imageArray.length != 0) {
        imageArray.forEach((item) => {
          //tempImageArray.push({ filePath: this.getServerFilePath(item.src) });
          // var reg = RegExp(/xxxx.xxx/)
          //indexOf("") search("") includes("xxxx.xxx")
          // if (item.src.match(reg)) {}
          tempImageArray.push({ filePath: this.getServerFilePath(item.src) });
        });
      }
      this.allImageList = tempImageArray;
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
    getServerFilePath(filePath) {
      return filePath.replace(this.baseFrontWebApi, "");
    },
    //发布成功对话框
    async goToSuccess(articleId) {
      this.publishSuccessTitle = "发布成功";
      this.publishSuccessVisible = true;
      // await new Promise(function(resovle){
      //   setTimeout(resovle, 3000);
      // })
      // window.location.href = "/publishSuccess?articleId=" + articleId;
    },
    onDialog(content) { // 调用Dialog弹出对话框
      this.dialog_content = '发布文章成功'
      this.dialog_visible = true
    },
    onClose() { // 关闭dialog
      this.dialog_visible = false
    },
    onCancel() { // “取消”按钮回调
      this.dialog_visible = false
    },
    onConfirm() { // “确定”按钮回调
      this.dialog_visible = false
    }
  },
}
</script>
