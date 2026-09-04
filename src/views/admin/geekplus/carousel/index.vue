<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="110px">
      <!-- <el-form-item label="跑马轮播图地址" prop="carouselImg">
        <el-input
          v-model="queryParams.carouselImg"
          placeholder="请输入跑马轮播图地址"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="轮播图标题" prop="carouselTitle">
        <el-input
          v-model="queryParams.carouselTitle"
          placeholder="请输入轮播图标题"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="轮播图信息" prop="carouselInfo">
        <el-input
          v-model="queryParams.carouselInfo"
          placeholder="请输入轮播图信息"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <!-- <el-form-item label="跑马灯轮播图链接地址" prop="carouselLink">
        <el-input
          v-model="queryParams.carouselLink"
          placeholder="请输入跑马灯轮播图链接地址"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="是否展示" prop="isDisplay">
        <el-select v-model="queryParams.isDisplay" placeholder="请选择是否首页展示" clearable size="small">
          <el-option label="不展示" value="0" />
          <el-option label="展示" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
        >导出</el-button>
      </el-col>
	  <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="carouselList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" fixed />
      <el-table-column label="ID" align="center" width="40" prop="id" />
      <el-table-column label="轮播图地址" align="center" show-overflow-tooltip prop="carouselImg" />
      <el-table-column label="轮播图标题" align="center" show-overflow-tooltip prop="carouselTitle" />
      <el-table-column label="轮播图信息" align="center" show-overflow-tooltip prop="carouselInfo" />
      <el-table-column label="轮播图链接" align="center" show-overflow-tooltip prop="carouselLink" />
      <el-table-column label="首页展示" align="center" width="130" prop="isDisplay">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isDisplay"
            active-value="1"
            inactive-value="0"
            @change="handleIsDisplayChange(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="130" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改首页跑马灯轮播图对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="轮播图展示" prop="carouselImg">
          <el-image
              style="width: 100px; height: 100px; "
              :src="form.carouselImg"
              fit="contain"
              :preview-src-list="[form.carouselImg]"
              lazy >
              <div slot="placeholder" class="image-slot">
                加载中<span class="dot">...</span>
              </div>
          </el-image>
        </el-form-item>
        <el-form-item label="轮播图地址" prop="carouselImg">
          <el-input v-model="form.carouselImg" placeholder="请输入跑马轮播图地址" />
          <el-col :span="7">
            <el-upload
              ref="uploadRef"
              action="#"
              :multiple="true"
              :show-file-list="true"
              :file-list="fileList"
              accept=".jpg,.jpeg,.png,.bmp,.gif,.JPG,.JPEG,.PNG,.BMP,.GIF"
              :on-success="handleSuccess"
              :on-error="handleError"
              :before-upload="handleBeforeUpload"
              :limit="1"
              :on-exceed="handleExceed"
              :on-change="handleChange"
              :auto-upload="false"
              :http-request="uploadFile"
              >
              <el-tooltip content="选取一个图片" placement="top">
                <el-button type="primary">选取图片</el-button>
              </el-tooltip>
            </el-upload>
          </el-col>
          <el-col :span="7">
            <el-tooltip content="确认提交上传" placement="top">
              <el-button type="primary" @click="submitUploadImage">上传图片</el-button>
            </el-tooltip>
          </el-col>
          <el-col :span="7">
            <el-tooltip content="浏览并选择图片" placement="top">
                    <el-button type="primary" @click="openFilePick">浏览图片</el-button>
            </el-tooltip>

          </el-col>
        </el-form-item>
        <el-form-item label="轮播图标题" prop="carouselTitle">
          <el-input v-model="form.carouselTitle" placeholder="请输入跑马灯轮播图标题" />
        </el-form-item>
        <el-form-item label="轮播图信息" prop="carouselInfo">
          <el-input v-model="form.carouselInfo" placeholder="请输入跑马灯轮播信息" />
        </el-form-item>
        <el-form-item label="轮播图链接" prop="carouselLink">
          <el-input v-model="form.carouselLink" placeholder="请输入跑马灯轮播图链接地址" />
        </el-form-item>
        <el-form-item label="是否展示" prop="isDisplay">
          <el-switch
            v-model="form.isDisplay"
            active-value="1"
            inactive-value="0"
            active-text="展示"
            inactive-text="隐藏"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <file-pick-modal
      :visible="displayAllImage"
      kind="image"
      initial-path="/upload"
      title="选择轮播图"
      @cancel="displayAllImage = false"
      @pick="onPickFile"
    />
  </div>
</template>

<script>
import { listCarousel, getCarousel, delCarousel, addCarousel, updateCarousel,
  exportCarousel, uploadFile, deleteFile } from "@/api/geekplus/carousel";
import FilePickModal from "@/components/FilePickModal";
import { fileUrlFromRow } from "@/utils/fileUrl";

export default {
  name: "Carousel",
  components: {
    FilePickModal
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
      // 首页跑马灯轮播图表格数据
      carouselList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        carouselImg: null,
        carouselTitle: null,
        carouselInfo: null,
        carouselLink: null,
        isDisplay: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      },
      onlyread:false,
      displayAllImage:false,
      allCarouselImg:[],
      fileList: [],
      // 实际开发中actionUrl为后台API 比如`${location.origin}/demo/apis/test/api/upload`
      //actionUrl: '/function/carousel/uploadCarousel',
      ruleForm: {
        pass: ''
      },
      baseHost:window.location.host,
      baseApi:process.env.VUE_APP_BASE_API
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询首页跑马灯轮播图列表 */
    getList() {
      this.loading = true;
      listCarousel(this.queryParams).then(response => {
        this.carouselList = (response.rows || []).map(row => ({
          ...row,
          isDisplay: String(row.isDisplay == null ? "0" : row.isDisplay)
        }));
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
        carouselImg: null,
        carouselTitle: null,
        carouselInfo: null,
        carouselLink: null,
        isDisplay: "1",
        createTime: null,
        updateTime: null
      };
      this.resetForm("form");
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加首页跑马灯轮播图";
    },
    //显示图片资源列表对话框，然后开始请求图片资源
    openFilePick() {
      this.displayAllImage = true;
    },
    onPickFile(row) {
      const url = fileUrlFromRow(row);
      if (!url) {
        this.$message.warning('无法解析文件地址');
        return;
      }
      this.form.carouselImg = url;
      this.displayAllImage = false;
      this.$message.success('已回填');
    },
    //把服务器获取的图片路径拼接成公网地址
    localImgToWebImg(imgList){
      var len=imgList.length;
      let resultArr=new Array();
      for(var i=0;i<len;i++){
        // let imgInfo={
        //   originalUrl:imgList[i],
        //   imgUrl: process.env.VUE_APP_BASE_API+imgList[i]
        // };
        resultArr.push(this.baseApi+imgList[i]);
        //resultArr.push(imgInfo);
        //this.list.push(temp);
      }
      return resultArr;
    },
    //点击选择获取图片地址
    getImgUrl(imgUrl){
      this.form.carouselImg=imgUrl;
      this.displayAllImage=false;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getCarousel(id).then(response => {
        this.form = response.data;
        this.form.isDisplay = String(this.form.isDisplay == null ? "1" : this.form.isDisplay);
        this.open = true;
        this.title = "修改首页跑马灯轮播图";
      });
    },
    handleIsDisplayChange(row) {
      const text = row.isDisplay === "1" ? "展示" : "隐藏";
      this.$confirm('确认要"' + text + '""' + (row.carouselTitle || row.id) + '"吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return updateCarousel(row);
      }).then(() => {
        this.msgSuccess(text + "成功");
      }).catch(function () {
        row.isDisplay = row.isDisplay === "1" ? "0" : "1";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateCarousel(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addCarousel(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除首页跑马灯轮播图编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return delCarousel(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有首页跑马灯轮播图数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return exportCarousel(queryParams);
        }).then(response => {
          this.download(response.msg);
        })
    },
    // 上传成功
    handleSuccess() {
      this.$refs.uploadRef.clearFiles()
      this.$message({
        message: '上传成功',
        type: 'success'
      })
    },
    // 上传失败
    handleError() {
      this.$message({
        message: '上传失败',
        type: 'error'
      })
    },
    // 上传文件之前
    handleBeforeUpload(file) {
      const fileType = file.name.substring(file.name.lastIndexOf('.') + 1)
      const fileTypeList = ['jpg','jpeg','png','bmp','gif','JPG','JPEG','PNG','BMP','GIF']
      if (!fileTypeList.includes(fileType)) {
        this.$message({
          message: '上传文件只能是常用图片格式',
          type: 'error'
        })
        this.fileList = []
        return false
      }
      return true
    },
    // 上传文件数超过限制
    handleExceed() {
      this.$message({
        message: '最大上传文件个数为1',
        type: 'error'
      })
    },
    // 文件状态改变时
    handleChange(file,fileList) {
      //console.log(file.status+file.raw)
      //console.log(fileList)
      //这一步会把上传的文件封装到fileList
      if (file.status === 'ready') {
        //this.fileList.push(file.raw)
        this.fileList = fileList;
      }
    },
    //自定义上传文件
    uploadFile (file) {
      //this.formData.append("file", file.file);
      // console.log(file.file, "sb2");
    },
    submitUploadImage(){
      //console.log(this.ruleForm.pass)
      // if (this.ruleForm.pass === '111111') {
      //   this.$refs.uploadRef.submit()
      //   this.dialogVisible = false
      // } else {
      //   this.$message({
      //     message: '请输入正确的密码',
      //     type: 'error'
      //   })
      //   this.dialogVisible = false
      //   this.$refs.uploadRef.clearFiles()
      // }
      let formData = new FormData();
      formData.append("file", this.fileList[0].raw);//拿到存在fileList的文件存放到formData中
       //下面数据是我自己设置的数据,可自行添加数据到formData(使用键值对方式存储)
      // 解析上传的文件
      //let file = this.fileList[0]
      //console.log(file)
      uploadFile(formData).then((response)=>{
        //console.log(response)
        this.$message({
          message: "上传"+response.msg,
          type: 'success'
        });
        this.$refs.uploadRef.clearFiles()
      }).catch((error)=>{
        //console.log(error)
        this.$message({
          message: error,
          type: 'error'
        });
      })
    },
    deleteFileByPath(pathStr){
      //let filePath = pathStr.replace(process.env.VUE_APP_BASE_API, '');
      let filePath = pathStr;
      this.$confirm('是否确认删除所选的文件?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function(){
        deleteFile({filePath:filePath}).then((response)=>{
          //console.log(response);
          //this.msgSuccess(response.msg)
        })
      }).then(()=>{
        this.msgSuccess("删除成功");
        //console.log(error);
        this.displayImageList();
      })
    }
  }
};
</script>
