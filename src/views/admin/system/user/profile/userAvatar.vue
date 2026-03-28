<template>
  <div>
    <div class="user-info-head" @click="editCropper()"><img v-bind:src="options.img" title="点击上传头像" class="img-circle img-lg" /></div>
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body @opened="modalOpened">
      <el-row>
        <el-col :xs="24" :sm="12" :md="12" :style="{height: '350px'}">
          <vue-cropper
            ref="cropper"
            :img="options.img"
            :info="true"
            :autoCrop="options.autoCrop"
            :autoCropWidth="options.autoCropWidth"
            :autoCropHeight="options.autoCropHeight"
            :fixedBox="options.fixedBox"
            @realTime="realTime"
            v-if="visible"
          />
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :style="{height: '350px'}">
          <div class="avatar-upload-preview">
            <img :src="previews.url" :style="previews.img" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :md="2" :sm="2" :xs="2">
          <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
            <el-button size="small">
              上传
              <i class="el-icon-upload el-icon--right"></i>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="{span: 3, offset: 1}" :sm="{span: 3, offset: 1}" :xs="{span: 3, offset: 1}">
          <el-button size="small" @click="getAvatarList">
            浏览
            <i class="el-icon-folder-opened"></i>
          </el-button>
        </el-col>
        <el-col :lg="{span: 1, offset: 2}" :md="2" :sm="2" :xs="2">
          <el-button icon="el-icon-plus" size="small" @click="changeScale(1)"></el-button>
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2" :sm="2" :xs="2">
          <el-button icon="el-icon-minus" size="small" @click="changeScale(-1)"></el-button>
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2" :sm="2" :xs="2">
          <el-button icon="el-icon-refresh-left" size="small" @click="rotateLeft()"></el-button>
        </el-col>
        <el-col :lg="{span: 1, offset: 1}" :md="2" :sm="2" :xs="2">
          <el-button icon="el-icon-refresh-right" size="small" @click="rotateRight()"></el-button>
        </el-col>
        <el-col :lg="{span: 2, offset: 6}" :md="2" :sm="2" :xs="2">
          <el-button type="primary" size="small" @click="uploadImg()">提 交</el-button>
        </el-col>
        <el-col :lg="{span: 2}" :md="2" :sm="2" :xs="2">
          <el-button type="danger" size="small" @click="cancel">取 消</el-button>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 显示所有头像的对话框 -->
    <el-dialog :title="title" :visible.sync="displayAvatar" width="600px" append-to-body>
      <el-row :gutter="20" >
        <el-col :span="6" v-for="avatarImg in allAvatarImg" :key="avatarImg">
          <div style="text-align: -webkit-center;">
            <!-- <el-image
              style="width: 100px; height: 100px"
              :src="carouselImg"
              :fit="fit"></el-image> -->
            <el-image
              style="width: 100px; height: 100px; "
              :src="baseApi+avatarImg"
              fit="contain"
              :preview-src-list="localImgToWebImg(allAvatarImg)"
              lazy >
              <div slot="placeholder" class="image-slot">
                加载中<span class="dot">...</span>
              </div>
            </el-image>
            <div style="">
              <el-tooltip content="点击删除头像" placement="top">
                <el-button @click="deleteFileByPath(avatarImg)" type="danger" icon="el-icon-delete" circle></el-button>
              </el-tooltip>
              <el-tooltip content="选择当前头像" placement="top">
                <el-button @click="updateCurrentAvatarImg(avatarImg)" type="success" icon="el-icon-check" circle></el-button>
              </el-tooltip>
            </div>
          </div>
        </el-col>
      </el-row>
      <span slot="footer" class="dialog-footer">
        <el-button @click="displayAvatar = false">取 消</el-button>
        <el-button type="primary" @click="displayAvatar = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import store from "@/store";
import { checkRole } from "@/utils/permission";
import { VueCropper } from "vue-cropper";
import { uploadAvatar, getAvatarImageList, updateUserAvatar } from "@/api/system/user";
import {deleteFile} from "@/api/common"

export default {
  components: { VueCropper },
  props: {
    user: {
      type: Object
    }
  },
  data() {
    return {
      // 是否显示弹出层
      open: false,
      displayAvatar: false,
      allAvatarImg: [],
      // 是否显示cropper
      visible: false,
      // 弹出层标题
      title: "修改头像",
      options: {
        img: store.getters.avatar, //裁剪图片的地址
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 200, // 默认生成截图框宽度
        autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: true // 固定截图框大小 不允许改变
      },
      previews: {},
      baseHost: window.location.host,
      baseApi: process.env.VUE_APP_BASE_API,
    };
  },
  methods: {
    getAvatarList(){
      let queryParams = { fileFolder: store.getters.username };
      getAvatarImageList(queryParams).then((response)=>{
        this.displayAvatar=true;
        this.allAvatarImg=response.data;//this.localImgToWebImg(response.data);
        //console.log(response);
      }).catch((error)=>{
        console.log(error);
      })
      //this.msgSuccess("在线浏览选择头像")
    },
    // 把服务器获取的图片路径拼接成公网地址，因为跨域代理后访问后端资源需要带上跨域设置的那个API前缀头
    // 如果单独再设置了后端资源跨域代理，则可以不用如此，这里这样是为了防止没有设置后端资源的跨域代理
    // 后端资源的跨域代理请看vue.config.js，看设置了API跨域代理之外，是否还有一个资源代理
    localImgToWebImg(imgList) {
      var len = imgList.length;
      let resultArr = new Array();
      for (var i = 0; i < len; i++) {
        // let imgInfo={
        //   originalUrl:imgList[i],
        //   imgUrl: process.env.VUE_APP_BASE_API+imgList[i]
        // };
        resultArr.push(this.baseApi + imgList[i]);
        //resultArr.push(imgInfo);
        //this.list.push(temp);
      }
      return resultArr;
    },
    //删除文件
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
        this.getAvatarList();
      })
    },
    //更新当前的头像
    updateCurrentAvatarImg(avatarImg){
      var queryForm={avatar: avatarImg}
      updateUserAvatar(queryForm).then((response) => {
        if(response.data!=undefined || response.data!= null){
          this.options.img = process.env.VUE_APP_BASE_API + response.data;
          store.commit('user/SET_AVATAR', this.options.img);
        }
        this.msgSuccess(response.msg);
      })
    },
    // 编辑头像
    editCropper() {
      this.open = true;
    },
    // 打开弹出层结束时的回调
    modalOpened() {
      this.visible = true;
    },
    // 覆盖默认的上传行为
    requestUpload() {
    },
    // 向左旋转
    rotateLeft() {
      this.$refs.cropper.rotateLeft();
    },
    // 向右旋转
    rotateRight() {
      this.$refs.cropper.rotateRight();
    },
    // 图片缩放
    changeScale(num) {
      num = num || 1;
      this.$refs.cropper.changeScale(num);
    },
    // 上传预处理
    beforeUpload(file) {
      if (file.type.indexOf("image/") == -1) {
        this.msgError("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。");
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.options.img = reader.result;
        };
      }
    },
    // 上传图片 profile/avatar/2023/07/04/53ad67d8-f67c-4053-86c3-1f4aecd720c4.jpeg
    uploadImg() {
      this.$refs.cropper.getCropBlob(data => {
        let formData = new FormData();
        formData.append("avatarFile", data);
        formData.append("fileFolder", store.getters.username);
        uploadAvatar(formData).then(response => {
          this.open = false;
          this.options.img = process.env.VUE_APP_BASE_API + response.imgUrl;
          store.commit('user/SET_AVATAR', this.options.img);
          this.msgSuccess("修改成功");
          this.visible = false;
        });
      });
    },
    // 实时预览
    realTime(data) {
      this.previews = data;
    },
    cancel(){
      this.open=false;
    }
  }
};
</script>
<style scoped lang="scss">
.user-info-head {
  position: relative;
  display: inline-block;
}
.avatar-upload-preview{
  text-align: center;
  margin: 0 auto;
  align-content: center;
}
.user-info-head:hover:after {
  content: '+';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
}
</style>
