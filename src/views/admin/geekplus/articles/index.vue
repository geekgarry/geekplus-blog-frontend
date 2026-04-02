<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="作者/用户" label-width="120" prop="authorName">
        <el-input
          v-model="queryParams.authorName"
          placeholder="请输入作者名称/用户名"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="作者/用户ID" prop="authorId">
        <el-input
          v-model="queryParams.authorId"
          placeholder="请输入作者/用户ID"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="文章标题" prop="articleTitle">
        <el-input
          v-model="queryParams.articleTitle"
          placeholder="请输入文章标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="文章类型" prop="articleCategory">
        <!-- <el-input
          v-model="queryParams.articleCategory"
          placeholder="请输入文章类型"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        /> -->
        <el-select
            v-model="queryParams.articleCategory"
            placeholder="请选择"
            clearable
            @keyup.enter.native="handleQuery"
          >
            <!-- <el-option-group
              v-for="group in listCategory"
              :key="group.categoryName"
              :label="group.categoryName">
            </el-option-group> -->
            <el-option
              v-for="(item, index) in listCategory"
              :key="index"
              :label="item.categoryName"
              :value="item.id"
            >
            </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="文章状态" prop="isDisplay">
        <el-select
            v-model="queryParams.isDisplay"
            placeholder="请选择"
            clearable
            @keyup.enter.native="handleQuery"
          >
            <!-- <el-option-group
              v-for="group in listCategory"
              :key="group.categoryName"
              :label="group.categoryName">
            </el-option-group> -->
            <el-option
              label="待上架"
              value="0"
            >
            </el-option>
            <el-option
              label="展示中"
              value="1"
            >
            </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="点赞数" prop="likeCount">
        <el-input
          v-model="queryParams.likeCount"
          placeholder="请输入文章点赞数量"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="浏览量" prop="viewCount">
        <el-input
          v-model="queryParams.viewCount"
          placeholder="请输入文章浏览数量"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="cyan"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery"
          >重置</el-button
        >
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          icon="el-icon-plus"
          size="mini"
          @click="handlePublish"
          >发布</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-document"
          size="mini"
          @click="imageRepository"
          >资源库</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        :showSearch.sync="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="articlesList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" fixed align="center" />
      <el-table-column
        label="文章表ID"
        width="90"
        show-overflow-tooltip
        align="center"
        prop="id"
      />
      <el-table-column
        label="作者/用户"
        width="90"
        show-overflow-tooltip
        align="center"
        prop="authorName"
      />
      <el-table-column
        label="作者ID"
        width="90"
        align="center"
        prop="authorId"
      />
      <el-table-column
        label="文章标题"
        show-overflow-tooltip
        align="center"
        prop="articleTitle"
      />
      <el-table-column
        label="文章封面图片"
        align="center"
        width="120"
        show-overflow-tooltip
        prop="indexPicture"
      >
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.indexPicture"
            :src="scope.row.indexPicture"
            style="width: 50px; height: 50px;"
            lazy="true"
            :preview-src-list="[scope.row.indexPicture]"
          />
        </template>
      </el-table-column>
      <!-- <el-table-column label="文章内容" align="center" width="130" show-overflow-tooltip prop="articleContent" /> -->
      <el-table-column
        label="内容摘要"
        align="center"
        show-overflow-tooltip
        prop="abstractText"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.abstractText != ''">{{
            scope.row.abstractText
          }}</span>
          <el-image
            v-else
            style="width: auto; height: 10px"
            lazy="true"
            :src="scope.row.indexPicture"
            :preview-src-list="[scope.row.indexPicture]"
          >
          </el-image>
        </template>
      </el-table-column>
      <el-table-column
        label="文章类型"
        align="center"
        width="120"
        show-overflow-tooltip
        prop="articleCategory"
      >
        <template slot-scope="scope">
          <span
            v-for="item in listCategory"
            :key="item.id"
            style="color: #5e2bd3"
          >
            <i v-if="scope.row.articleCategory == item.id">{{
              item.categoryName
            }}</i>
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="文章展示"
        align="center"
        width="100"
        show-overflow-tooltip
        prop="isDisplay"
      >
        <template slot-scope="scope">
          <!-- <span v-if="scope.row.isDisplay == '0'" style="color: #8b0000">待上架</span>
          <span v-if="scope.row.isDisplay == '1'" style="color: #13ce66">展示中</span> -->
          <el-switch
            v-model="scope.row.isDisplay"
            active-value="1"
            inactive-value="0"
            @change="handleIsDisplayChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column
        label="点赞数量"
        width="100"
        show-overflow-tooltip
        align="center"
        prop="likeCount"
      />
      <el-table-column
        label="浏览数量"
        width="100"
        show-overflow-tooltip
        align="center"
        prop="viewCount"
      />
      <el-table-column
        label="操作"
        align="center"
        fixed="right"
        width="135"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            >修改1</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="goToWrite(scope.row)"
            >修改2</el-button
          >
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改文章对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="777px" append-to-body>
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
        <el-form-item label="作者名称" prop="authorName">
          <el-input
            v-model="form.authorName"
            placeholder="请输入作者名称，用户名"
          />
        </el-form-item>
        <el-form-item label="文章内容" prop="articleContent">
          <quill-editor
            v-model="form.articleContent"
            :min-height="192"
            @onEditorBlur="onEditorBlur"
            @onEditorFocus="onEditorFocus"
          ></quill-editor>
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
          <el-select
            v-model="form.articleCategory"
            placeholder="请选择"
            clearable
          >
            <!-- <el-option-group
              v-for="group in listCategory"
              :key="group.categoryName"
              :label="group.categoryName">
            </el-option-group> -->
            <el-option
              v-for="(item, index) in listCategory"
              :key="index"
              :label="item.categoryName"
              :value="item.id"
            >
            </el-option>
          </el-select>
          <!-- <el-input v-model="form.articleCategory" placeholder="请输入文章类型" /> -->
        </el-form-item>
        <el-form-item label="文章标签">
          <el-select
            multiple
            v-model="formArticleTagIds"
            @change="changeArticleTag"
            collapse-tags
            placeholder="请选择一个标签"
            clearable
          >
            <el-option
              v-for="(item, index) in listArticleTag"
              :key="index"
              :label="item.tagName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文章封面" prop="indexPicture">
          <el-image :src="form.indexPicture" style="width: 100px; height: 100px; margin-bottom: 10px;" v-if="form.indexPicture" />
          <el-input v-model="form.indexPicture" placeholder="请输入文章封面图片URL地址" />
          <span style="color: #9099a4; font-size: 12px;">文章封面图片URL地址（可选）</span>
          <span style="color: #9099a4; font-size: 12px;">（如果文章内容中有图片，且没有封面图片，则默认使用文章内容中的第一张图片作为封面图片）</span>
        </el-form-item>
        <el-form-item label="是否显示" prop="isDisplay">
          <!-- <el-input v-model="form.workVisible" placeholder="请输入0（展示在简历中）或1（不展示）" :disabled="onlyread" /> -->
          <el-select
            v-model="form.isDisplay"
            placeholder="请选择是否页面显示"
            :disabled="onlyread"
          >
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
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 图片资料库对话框 -->
    <el-dialog
      :title="fileFolderTitle"
      :visible.sync="displayFileFolder"
      width="600px"
      append-to-body
    >
      <!-- <el-row :gutter="20">
        <el-col :span="6">
          <el-container>
            <el-main type="flex" justify="center" align="middle">
              <div>
                <el-tooltip content="返回主资源库" placement="top">
                  <el-button
                    type="text"
                    round
                    icon="el-icon-s-home"
                    @click="getFileFolderList()"
                    >返回</el-button
                  >
                </el-tooltip>
              </div>
              <div>
                <el-tooltip content="返回上一级" placement="bottom">
                  <el-button
                    type="text"
                    round
                    icon="el-icon-back"
                    @click="backFileFolderList(backArticleFolder)"
                    >返回</el-button
                  >
                </el-tooltip>
              </div>
            </el-main>
          </el-container>
        </el-col>
        <el-col :span="6" v-for="(item, index) in fileFolderList" :key="index">
          <el-container>
            <el-main type="flex" justify="center" align="middle">
              <div type="flex" justify="center" align="middle">
                <span>{{ item.fileName }}</span>
              </div>
              <el-tooltip
                v-if="item.type == 'folder'"
                content="进入当前文件夹"
                placement="top"
              >
                <el-button
                  v-if="item.type == 'folder'"
                  type="text"
                  icon="el-icon-folder-opened"
                  @click="getFileFolderList(item)"
                ></el-button>
              </el-tooltip>
              <i v-if="item.type == 'folder'" class="el-icon-folder" @click="getFileFolderList(item.fileName)"></i>
              <i v-else class="el-icon-picture"></i>
              <div type="flex" justify="center" align="middle">
                <el-tooltip
                  v-if="item.type == 'folder'"
                  content="浏览文件夹中的图片"
                  placement="bottom"
                >
                  <el-button
                    @click="displayImageList(item)"
                    type="success"
                    icon="el-icon-picture"
                    circle
                  ></el-button>
                </el-tooltip>
              </div>
            </el-main>
          </el-container>
          <div style="text-align: -webkit-center">
            <el-image
              style="width: 100px; height: 100px"
              :src="carouselImg"
              :fit="fit"></el-image>
          </div>
        </el-col>
      </el-row> -->
      <file-manager></file-manager>
      <span slot="footer" class="dialog-footer">
        <el-button @click="displayFileFolder = false;">取 消</el-button>
        <el-button type="primary" @click="displayFileFolder = false;"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 显示所有图片的对话框 -->
    <el-dialog
      :title="fileFolderTitle"
      :visible.sync="displayAllImage"
      width="630px"
      append-to-body
    >
      <el-row :gutter="20">
        <el-col :span="6" v-for="(item, index) in fileImageList" :key="index">
          <div type="flex" justify="center" align="middle">
            <!-- <el-image
              style="width: 100px; height: 100px"
              :src="carouselImg"
              :fit="fit"></el-image> -->
            <el-image
              style="width: 100px; height: 100px"
              :src="'https://' + baseHost + baseApi + item"
              fit="contain"
              :preview-src-list="localImgToWebImg(fileImageList)"
              lazy
            >
              <div slot="placeholder" class="image-slot">
                加载中<span class="dot">...</span>
              </div>
            </el-image>
            <div style="">
              <el-tooltip content="点击删除文件" placement="top">
                <el-button
                  @click="deleteFileByPath(item)"
                  type="danger"
                  icon="el-icon-delete"
                  circle
                ></el-button>
              </el-tooltip>
              <!-- <el-tooltip content="选择当前文件" placement="top">
                <el-button @click="getImgUrl(item)" type="success" icon="el-icon-check" circle></el-button>
              </el-tooltip> -->
            </div>
          </div>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="displayAllImage = false;">取 消</el-button>
        <el-button type="primary" @click="displayAllImage = false;"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listSubParentCategory,
  listSubCategory,
} from "@/api/geekplus/category";
import {
  listTags,
  getTagByArticleId,
  addArticleMapTag,
  deleteGpArticleMapTag,
} from "@/api/geekplus/articletags";
import {
  listArticles,
  getArticles,
  delArticles,
  addArticles,
  updateArticles,
  changeArticleStatus,
  exportArticles,
  readAllFileList,
  getAllImageList,
} from "@/api/geekplus/articles";
import FileManager from "@/views/admin/system/file/index.vue";

export default {
  name: "Articles",
  components: {
    FileManager
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
      form: {},
      // 表单校验
      rules: {
        articleTitle: [
            { required: true, message: '请输入文章标题', trigger: 'blur' },
            { min: 6, max: 50, message: '长度在 6 到 45 个字符', trigger: 'blur' }
          ],
        authorName: [
            { required: true, message: '请输入文章作者', trigger: 'blur' }
          ],
        articleContent: [
            { required: true, message: '请写入问哈那个内容', trigger: 'change' },
            { min: 100, message: '字数不少于150', trigger: 'blur' }
          ],
        articleCategory: [
            { required: true, message: '请选择一个问哈那个主题', trigger: 'change' }
          ],
        isDisplay: [
            { required: true, message: '请选择是否显示', trigger: 'change' }
          ],
      },
      listCategory: [], //子菜单列表
      listArticleTag: [], //标签列表
      onlyread: false,
      defaultProps: {
        children: "children",
        label: "label",
        disabled: null,
        isLeaf: null,
      },
      articleTagIds: [],
      formArticleTagIds:[],
      selectAll: false,
      allImageList: [],
      displayFileFolder: false,
      fileFolderTitle: "",
      fileFolderList: [],
      fileImageList: [],
      displayAllImage: false,
      baseHost: window.location.host,
      baseApi: process.env.VUE_APP_BASE_API,
      articleFolder: {},
      backArticleFolder: [],
    };
  },
  created() {
    this.getList();
    this.getListCategory();
    this.getListArticleTag();
    // this.listSeparatorPath([2343534534]);
  },
  methods: {
    // 失去焦点触发事件
    onEditorBlur() {
      //console.log("失去焦点！！！");
      let tempImageList = [];
      //this.allImageList = [];
      let deleteImages = [];
      let length = document.querySelectorAll(".ql-editor img").length;
      if (length) {
        let images = document.querySelectorAll(".ql-editor img");
        images.forEach((item) => {
          tempImageList.push({ filePath: this.getServerFilePath(item.src) });
        });
      }
      deleteImages = this.allImageList.filter((item) => {
        return tempImageList.every((e) => e.filePath != item.filePath);
        //return tempImageList.indexOf(item) === -1
      });
      // console.log(tempImageList);
      // console.log(this.allImageList);
      // console.log(deleteImages);
      if (deleteImages.length > 0) {
        this.removeFileList(deleteImages);
      }
      let allTempImg = this.allImageList.filter((item) => {
        return deleteImages.every((e) => e.filePath != item.filePath);
      });
      // console.log(deleteImages);
      // console.log(allTempImg);
      this.allImageList = allTempImg;
    },
    onEditorFocus(){
      //console.log("得到焦点！！！")
    },
    getServerFilePath(filePath) {
      return filePath.replace(
        "https://www.geekplus.xyz" + process.env.VUE_APP_BASE_API,
        ""
      );
    },
    getTreeListCategory(list) {
      let result = [];
      for (var i = 0; i < list.length; i++) {
        let citem = {
          children: [],
        };
        citem.disabled = true;
        citem.label = list[i].categoryName;
        citem.isLeaf = false;
        for (var j = 0; j < list[i].children.length; j++) {
          let tempitem = list[i].children[j];
          let subitem = {
            children: [],
          };
          subitem.disabled = false;
          subitem.label = tempitem.categoryName;
          subitem.isLeaf = true;
          citem.children.push(subitem);
        }
        result.push(citem);
      }
      //console.log(result);
      return result;
    },
    handleCheckChange(data, checked, indeterminate) {
      //console.log(data, checked, indeterminate);
      // this.listCategory.forEach(item =>{
      //   item.disabled=true;
      // })
    },
    treeCheck: function (node, list) {
      //node 该节点所对应的对象、list 树目前的选中状态对象
      //选中事件在选中后执行，当lis中有两个选中时，使用setCheckedKeys方法，选中一个节点
      if (list.checkedKeys.length == 2) {
        //单选实现
        this.$refs.treeCategory.setCheckedKeys([node.PHY_ID]);
      }
    },
    /** 查询文章列表 */
    getList() {
      this.loading = true;
      listArticles(this.queryParams).then((response) => {
        this.articlesList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        authorName: null,
        authorId: null,
        articleTitle: null,
        articleContent: null,
        articleCategory: null,
        likeCount: null,
        viewCount: null,
        createTime: null,
        updateTime: null,
      };
      this.resetForm("form");
    },
    // 文章状态修改
    handleIsDisplayChange(row) {
      let text = row.isDisplay === "1" ? "上架" : "下架";
      this.$confirm('确认要"' + text + '""' + row.id + '"号文章吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          // let dataForm = {userId: row.userId, status: row.status}
          return changeArticleStatus(row.id, row.isDisplay);
        }).then(() => {
          this.msgSuccess(text + "成功");
        }).catch(function() {
          row.isDisplay = row.isDisplay === "1" ? "0" : "1";
        });
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length !== 1;
      this.multiple = !selection.length;
    },
    //文件资源库
    imageRepository() {
      this.displayFileFolder = true;
      this.fileFolderTitle = "文件资源库";
    },
    //获取文件夹列表
    getFileFolderList(folder) {
      var queryFolderPath;
      var folderName;
      if (folder == null || folder == ""){
        queryFolderPath='';
        folderName='';
        this.backArticleFolder=[];
        this.backArticleFolder.push({filePath:'',fileName:''});
      }else{
        //更新本次articleFolder的值为最新
        this.articleFolder.filePath=folder.filePath;
        this.articleFolder.fileName=folder.fileName;
        queryFolderPath=folder.filePath;
        folderName=folder.fileName;
        //把本次articleFolder的值push给backArticleFolder
        this.backArticleFolder.push({filePath:folder.filePath,fileName:folder.fileName});
      }
      this.fileFolderTitle = "系统资源库" + folderName;
      let params = { folder: queryFolderPath };
      readAllFileList(params).then((response) => {
        //console.log(response.data);
        this.fileFolderList = response.data;
      });
    },
    //路径返回，路径数组依次递减实现返回上一级
    backFileFolderList(list){
      var i=list.length-2
      i=i-1;
      this.fileFolderTitle = "系统资源库" + list[i].fileName;
      let params = { folder: list[i].filePath };
      //if(i>=0 ){
        readAllFileList(params).then((response) => {
              //console.log(response.data);
          this.fileFolderList = response.data;
        });
      //}
    },
    //显示图片资源列表对话框，然后开始请求图片资源
    displayImageList(fileFolder) {
      this.articleFolder=fileFolder;
      // this.backArticleFolder = fileFolder.filePath;
      //var filePath = this.listSeparatorPath(tempFolder);
      this.fileFolderTitle = "浏览图片库-" + fileFolder.fileName;
      let queryParams = { fileFolder: fileFolder.filePath };
      getAllImageList(queryParams)
        .then((response) => {
          //console.log(response.data)
          this.displayAllImage = true;
          this.fileImageList = response.data; //this.localImgToWebImg(response.data);
          //console.log(response);
        })
        .catch((error) => {
          //console.log(error);
          this.msgError(error.msg);
        });
    },
    //数组转字符串
    listSeparatorPath(listPath) {
      var len = listPath.length;
      let resultStr = "";
      for(var i = 0; i < len; i++) {
        if(listPath[i] != "") {
          var tempFile = listPath[i] + "/";
          if(i == len - 1) {
            tempFile = listPath[i];
          }
          resultStr += tempFile;
        }
      }
      console.log(resultStr);
      return resultStr;
    },
    //把服务器获取的图片路径拼接成公网地址
    localImgToWebImg(imgList) {
      var len = imgList.length;
      let resultArr = new Array();
      for (var i = 0; i < len; i++) {
        // let imgInfo={
        //   originalUrl:imgList[i],
        //   imgUrl:"https://www.geekplus.xyz"+process.env.VUE_APP_BASE_API+imgList[i]
        // };
        resultArr.push("https://" + this.baseHost + this.baseApi + imgList[i]);
        //resultArr.push(imgInfo);
        //this.list.push(temp);
      }
      return resultArr;
    },
    deleteFileByPath(pathStr) {
      //let filePath = pathStr.replace("https://www.geekplus.xyz"+process.env.VUE_APP_BASE_API, '');
      let filePath = pathStr;
      this.$confirm("是否确认删除所选的文件?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          deleteFile({ filePath: filePath }).then((response) => {
            //console.log(response);
            //this.msgSuccess(response.msg)
          });
        })
        .then(() => {
          this.msgSuccess("删除成功");
          //console.log(error);
          this.displayImageList(this.articleFolder);
        });
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.articleTagId = [];
      this.open = true;
      this.title = "添加文章";
    },
    handlePublish() {
      this.$router.push("/admin/geekplus/writeArticle");
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.articleTagId = [];
      const id = row.id || this.ids;
      var qparams = { articleId: id };
      getTagByArticleId(qparams).then((response) => {
        //console.log(response.data)
        let articleTag = response.data;
        let mapTags = articleTag.map((item) => {
          return item.id;
        }); // 生成数组
        this.formArticleTagIds=mapTags;
        this.articleTagIds=mapTags;
      });
      getArticles(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改文章";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.id != null) {
            updateArticles(this.form).then((response) => {
              this.msgSuccess("文章修改成功");
              // console.log(this.formArticleTagIds)
              // console.log(this.articleTagIds)
              this.addAndRemoveArticleTag(this.form.id, this.formArticleTagIds);
              this.open = false;
              this.getList();
              //this.articleTagId=[];
            });
          } else {
            this.form.authorId = this.$store.state.user.userId;
            //this.form.authorName="";
            this.onEditorBlur();
            addArticles(this.form).then((response) => {
              var articleId = response.articleId;
              //console.log(articleId);
              this.msgSuccess("文章新增成功");
              // console.log(this.formArticleTagIds)
              // console.log(this.articleTagIds)
              this.addAndRemoveArticleTag(articleId, this.formArticleTagIds);
              this.open = false;
              this.getList();
            });
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
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除文章编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return delArticles(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出所有文章数据项?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(function () {
          return exportArticles(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        });
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
      // console.log(this.articleTagId);
    },
    goToWrite(articleInfo){
      // const newLink = this.$router.resolve({path:"/admin/geekplus/writeArticle",query:{articleId:articleInfo.id}});
      //window.open(newLink.href,'_blank');
      this.$router.push({path:"/admin/geekplus/writeArticle",query:{articleId:articleInfo.id}})
    }
  },
};
</script>
