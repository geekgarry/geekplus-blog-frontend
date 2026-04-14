<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="歌曲名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入歌曲名称" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="歌曲专辑" prop="artist">
        <el-input v-model="queryParams.artist" placeholder="请输入歌曲专辑" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="歌曲地址" prop="url">
        <el-input v-model="queryParams.url" placeholder="请输入歌曲地址" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="歌曲封面" prop="cover">
        <el-input v-model="queryParams.cover" placeholder="请输入歌曲封面" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="是否显示" prop="isDisplay">
        <el-select v-model="queryParams.isDisplay" placeholder="请选择" clearable @keyup.enter.native="handleQuery">
          <el-option label="隐藏" value="0">
          </el-option>
          <el-option label="显示" value="1">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single"
          @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple"
          @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="主键ID" align="center" prop="id" width="60" show-overflow-tooltip /> -->
      <el-table-column label="歌曲名称" align="center" prop="name" width="110" show-overflow-tooltip />
      <el-table-column label="歌曲专辑" align="center" prop="artist" width="110" show-overflow-tooltip />
      <el-table-column label="歌曲地址" align="center" prop="url" width="120" show-overflow-tooltip />
      <el-table-column label="歌曲封面" align="center" prop="cover" width="120" show-overflow-tooltip />
      <el-table-column label="是否显示" align="center" prop="isDisplay" width="120" show-overflow-tooltip>
        <template slot-scope="scope">
          <el-switch v-model="scope.row.isDisplay" active-value="1" inactive-value="0"
            @change="handleIsDisplayChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="100" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ dateFormat(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" prop="updateTime" width="100" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{ dateFormat(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right" width="125" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">
            修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改数据对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="780px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="歌曲名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入歌曲名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="歌者专辑" prop="artist">
              <el-input v-model="form.artist" placeholder="请输入歌者专辑" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="歌曲地址" prop="url">
              <el-row>
                <el-col :span="18"><el-input v-model="form.url" placeholder="请输入歌曲地址"></el-input></el-col>
                <el-col :span="6" v-if="form.url"><a :href="form.url" target="_blank">下载</a></el-col>
              </el-row>
              <audio controls="" name="gpMusic" v-if="form.url">
                <source :src="form.url" type="audio/mpeg">
              </audio>
              <el-row>
                <el-col :span="7">
                  <el-upload ref="uploadRef" action="#" :multiple="true" :show-file-list="true" :file-list="fileList"
                    accept=".mp3,.aac,.wav,.wma,.cda,.flac,.m4a,.mid,.mka,.mp2,.mpa,.mpc,.ape,.ofr,.ogg,.ra,.wv,.tta,.ac3,.dts"
                    :on-success="handleSuccess" :on-error="handleError" :before-upload="handleBeforeUpload" :limit="1"
                    :on-exceed="handleExceed" :on-change="handleChange" :auto-upload="false" :http-request="uploadFile">
                    <el-tooltip content="选取一个文件" placement="top">
                      <el-button type="primary">选取文件</el-button>
                    </el-tooltip>
                  </el-upload>
                </el-col>
                <el-col :span="7">
                  <el-tooltip content="确认提交上传" placement="top">
                    <el-button type="primary" @click="submitUploadFile">上传文件</el-button>
                  </el-tooltip>
                </el-col>
                <el-col :span="7">
                  <el-tooltip content="浏览并选择文件" placement="top">
                    <el-button type="primary" @click="displayMusicFileList">浏览文件</el-button>
                  </el-tooltip>
                </el-col>
              </el-row>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="歌曲封面" prop="cover">
              <el-input v-model="form.cover" placeholder="请输入歌曲封面" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="歌曲歌词" prop="lrc">
              <el-input v-model="form.lrc" placeholder="请输入歌曲歌词" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="歌曲顺序" prop="orderId">
              <el-input-number v-model="form.orderId" @change="handleOrderIdChange" :min="0"
                aria-placeholder="请输入歌曲顺序"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示歌曲" prop="isDisplay">
              <el-select v-model="form.isDisplay" placeholder="请选择" clearable>
                <el-option label="隐藏" value="0">
                </el-option>
                <el-option label="显示" value="1">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="24">
                      <el-form-item label="">
                        <el-radio-group v-model="">
                          <el-radio :key="" :label="" >radio1</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-col> -->
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 显示所有文件的对话框 -->
    <el-dialog :title="title" :visible.sync="displayAllMusic" width="600px" append-to-body>
      <!-- <el-row :gutter="20">
        <el-col :span="6" v-for="(gpMusic, index) in allGpMusic" :key="index">
          <div style="text-align: -webkit-center;border:1px dashed #57c98e; margin-bottom: 10px;
          height: 130px; display: flex; flex-wrap: nowrap; align-items: center;
          justify-content: space-between; flex-direction: column;">
            <audio :id="index + 'music'" name="media" :src="gpMusic.fileUrl">
              <span>不支持音频</span>
            </audio>
            <el-button :id="index + 'playMusic'" round @click="playMusicEvent(index)">播放</el-button>
            <div>
              <span>{{ gpMusic.fileName }}</span>
              <span>{{ gpMusic.fileUrl }}</span>
            </div>
            <div style="">
              <el-tooltip content="点击删除文件" placement="top">
                <el-button @click="deleteFileByPath(gpMusic.filePath)" type="danger" icon="el-icon-delete"
                  circle></el-button>
              </el-tooltip>
              <el-tooltip content="选择当前文件" placement="top">
                <el-button @click="getGpMusicUrl(gpMusic.fileUrl)" type="success" icon="el-icon-check"
                  circle></el-button>
              </el-tooltip>
            </div>
          </div>
        </el-col>
      </el-row> -->
      <file-manager initial-path="/upload/music" @select-file="getGpMusicUrl"></file-manager>
      <span slot="footer" class="dialog-footer">
        <el-button @click="displayAllMusic = false">取 消</el-button>
        <el-button type="primary" @click="displayAllMusic = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { readMusicFile, listGpMusic, getGpMusic, delGpMusic, addGpMusic, updateGpMusic, uploadMusicFile, exportGpMusic } from "@/api/geekplus/gpMusic";
//通用文件操作
import { readCurrentFile, deleteSelectedFiles, deleteFileByRecursion, deleteCategoryFile } from "@/api/system/sysFile";
import FileManager from "@/views/admin/system/file/index.vue";

export default {
  name: "GpMusic",
  components: { FileManager },
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
      // 数据列表
      list: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 类型数据字典
      statusOptions: [],
      // 状态数据字典
      typeOptions: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: undefined,
        name: undefined,
        artist: undefined,
        url: undefined,
        cover: undefined,
        lrc: undefined,
        createTime: undefined,
        updateTime: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        id: [
          { required: true, message: "主键ID不能为空", trigger: "change" }
        ],
        name: [
          { required: true, message: "歌曲名称不能为空", trigger: "blur" }
        ],
        artist: [
          { required: true, message: "歌曲专辑不能为空", trigger: "blur" }
        ],
        url: [
          { required: true, message: "歌曲地址不能为空", trigger: "blur" }
        ],
        cover: [
          { required: true, message: "歌曲封面不能为空", trigger: "blur" }
        ],
        // lrc: [
        //   { required: true, message: "歌曲歌词不能为空", trigger: "blur" }
        // ],
      },
      fileList: [],
      displayAllMusic: false,
      allGpMusic: [],
      baseHost: window.location.host,
      baseApi: process.env.VUE_APP_BASE_API,
      playStatusText: [],
      playStatusIcon: 'el-icon-video-pause',
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 分页查询数据列表 */
    getList() {
      this.loading = true;
      listGpMusic(this.queryParams).then(response => {
        this.list = response.rows;
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
        id: undefined,
        name: undefined,
        artist: undefined,
        url: undefined,
        cover: undefined,
        lrc: undefined,
        createTime: undefined,
        updateTime: undefined,
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
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加数据信息";
    },
    // 歌曲状态是否显示
    handleIsDisplayChange(row) {
      let text = row.isDisplay === "1" ? "显示" : "隐藏";
      this.$confirm('确认要"' + text + '""' + row.name + '"吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        // let dataForm = {userId: row.userId, status: row.status}
        return updateGpMusic(row);
      }).then(() => {
        this.msgSuccess(text + "成功");
      }).catch(function () {
        row.isDisplay = row.isDisplay === "1" ? "0" : "1";
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids[0]
      getGpMusic({ id: id }).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改数据信息";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateGpMusic(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addGpMusic(this.form).then(response => {
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
      const ids = row.id || this.ids
      this.$confirm('是否确认删除列表编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delGpMusic(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有列表数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return 'export' + GpMusic(queryParams);
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
      const fileTypeList = ["mp3", "aac", "wav", "wma", "cda", "flac", "m4a", "mid", "mka", "mp2", "mpa", "mpc", "ape", "ofr", "ogg", "ra", "wv", "tta", "ac3", "dts"]
      if (!fileTypeList.includes(fileType)) {
        this.$message({
          message: '上传文件只能是常用音频格式',
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
    handleChange(file, fileList) {
      console.log(file.status + file.raw)
      console.log(fileList)
      //这一步会把上传的文件封装到fileList
      if (file.status === 'ready') {
        //this.fileList.push(file.raw)
        this.fileList = fileList;
      }
    },
    //自定义上传文件
    uploadFile(file) {
      //this.formData.append("file", file.file);
      // console.log(file.file, "sb2");
    },
    submitUploadFile() {
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
      formData.append("file", this.fileList[0].raw); //拿到存在fileList的文件存放到formData中
      //下面数据是我自己设置的数据,可自行添加数据到formData(使用键值对方式存储)
      // 解析上传的文件
      //let file = this.fileList[0]
      //console.log(file)
      uploadMusicFile(formData).then((response) => {
        //console.log(response)
        this.$message({
          message: "上传" + response.msg,
          type: 'success'
        });
        this.$refs.uploadRef.clearFiles()
        this.form.name = response.originalFileName;
        this.form.artist = response.originalFileName;
        this.form.url = response.url;
        this.form.cover = "https://127.0.0.1/imgs/mai.png";
      }).catch((error) => {
        //console.log(error)
        this.$message({
          message: error,
          type: 'error'
        });
      })
    },
    //显示所有音乐文件，然后请求系统的资源
    displayMusicFileList() {
      this.displayAllMusic = true;
    },
    //系统路径转为网络地址，采取拼接前缀网络地址
    convertMusicUrl(musicList) {
      var len = musicList.length;
      let resultArr = new Array();
      for (var i = 0; i < len; i++) {
        let musicInfo = {
          fileName: musicList[i].fileName,
          fileUrl: this.baseApi + musicList[i].fileUrl,
          filePath: musicList[i].filePath,
          fileSize: musicList[i].fileSize,
          fileType: musicList[i].fileType,
          freeSpace: musicList[i].freeSpace,
          totalSpace: musicList[i].totalSpace,
          createTime: musicList[i].createTime,
        };
        //this.playStatusText.push("播放");
        //resultArr.push("https://"+this.baseHost+this.baseApi+'/profile'+musicList[i].fileName);
        resultArr.push(musicInfo);
      }
      return resultArr;
    },
    //播放音乐事件
    playMusicEvent(index) {
      // this.playStatusIcon="el-icon-video-play";
      // this.playStatusText[index]="停止";
      //console.log(document.getElementById(index+"playMusic").innerText);
      if (document.getElementById(index + "playMusic").innerText == "播放") {
        document.getElementById(index + "playMusic").innerText = "停止";
        document.getElementById(index + "music").play();
      } else {
        document.getElementById(index + "playMusic").innerText = "播放";
        document.getElementById(index + "music").pause();
      }
    },
    //删除文件
    deleteFileByPath(pathStr) {
      let folder = { filePath: pathStr };
      this.$confirm('是否确认删除所选的文件?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        deleteFileByRecursion(folder).then((response) => {
          //console.log(response);
          //this.msgSuccess(response.msg)
        })
      }).then(() => {
        this.msgSuccess("删除成功");
        //console.log(error);
        this.displayImageList();
      })
    },
    //选取当前的音乐文件
    getGpMusicUrl(files) {
      this.form.url = files[0].fullPath;
      this.displayAllMusic = false;
    },
    handleOrderIdChange(val) {

    }
  }
};
</script>
