<template>
  <div>
    <div class="user-info-head" @click="editCropper()">
      <img
        :src="avatarUrl"
        title="点击上传头像"
        class="img-circle img-lg"
        @error="onAvatarError"
      />
    </div>
    <el-dialog :title="title" :visible.sync="open" width="800px" append-to-body @opened="modalOpened" @close="onDialogClose">
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
          <div v-else class="avatar-cropper-placeholder">加载裁剪器…</div>
        </el-col>
        <el-col :xs="24" :sm="12" :md="12" :style="{height: '350px'}">
          <div class="avatar-upload-preview">
            <img v-if="previews.url" :src="previews.url" :style="previews.img" />
            <img v-else :src="options.img || defaultAvatar" class="preview-fallback" />
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
          <el-button v-if="isBlogSiteAdmin()" size="small" @click="getAvatarList">
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

    <el-dialog :title="title" :visible.sync="displayAvatar" width="600px" append-to-body>
      <el-row :gutter="20">
        <el-col :span="6" v-for="avatarImg in allAvatarImg" :key="avatarImg">
          <div style="text-align: -webkit-center;">
            <el-image
              style="width: 100px; height: 100px;"
              :src="baseApi + avatarImg"
              fit="contain"
              :preview-src-list="localImgToWebImg(allAvatarImg)"
              lazy>
              <div slot="placeholder" class="image-slot">
                加载中<span class="dot">...</span>
              </div>
              <div slot="error" class="image-slot">加载失败</div>
            </el-image>
            <div>
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
import { VueCropper } from "vue-cropper";
import { uploadAvatar, getAvatarImageList, updateUserAvatar } from "@/api/system/user";
import { deleteFile } from "@/api/common";
import { isBlogSiteAdmin } from "@/utils/blogAdmin";

const DEFAULT_AVATAR = require("@/assets/mai.png");

function resolveAvatarUrl(raw) {
  if (!raw) return DEFAULT_AVATAR;
  const s = String(raw).trim();
  if (!s || s === "null" || s === "undefined") return DEFAULT_AVATAR;
  if (/^(data:|blob:|https?:\/\/)/i.test(s)) return s;
  if (s.indexOf(process.env.VUE_APP_BASE_API) === 0) return s;
  // 已是站点相对路径或签名 URL 路径
  if (s.charAt(0) === "/") return process.env.VUE_APP_BASE_API + s;
  return process.env.VUE_APP_BASE_API + "/" + s.replace(/^\//, "");
}

export default {
  components: { VueCropper },
  props: {
    user: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      open: false,
      displayAvatar: false,
      allAvatarImg: [],
      visible: false,
      title: "修改头像",
      defaultAvatar: DEFAULT_AVATAR,
      avatarBroken: false,
      options: {
        img: DEFAULT_AVATAR,
        autoCrop: true,
        autoCropWidth: 200,
        autoCropHeight: 200,
        fixedBox: true,
      },
      previews: {},
      baseApi: process.env.VUE_APP_BASE_API,
    };
  },
  computed: {
    avatarUrl() {
      if (this.avatarBroken) return this.defaultAvatar;
      return resolveAvatarUrl(
        (this.user && this.user.avatar) || store.getters.avatar || this.options.img
      );
    },
  },
  watch: {
    "user.avatar": {
      immediate: true,
      handler(val) {
        this.avatarBroken = false;
        this.options.img = resolveAvatarUrl(val || store.getters.avatar);
      },
    },
  },
  methods: {
    isBlogSiteAdmin,
    onAvatarError() {
      this.avatarBroken = true;
      // 裁剪器不能用坏链，回落到默认图，保证仍可重新上传
      this.options.img = this.defaultAvatar;
    },
    getAvatarList() {
      getAvatarImageList({ fileFolder: store.getters.username })
        .then((response) => {
          this.displayAvatar = true;
          this.allAvatarImg = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    localImgToWebImg(imgList) {
      return (imgList || []).map((i) => this.baseApi + i);
    },
    deleteFileByPath(pathStr) {
      this.$confirm("是否确认删除所选的文件?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => deleteFile({ filePath: pathStr }))
        .then(() => {
          this.msgSuccess("删除成功");
          this.getAvatarList();
        })
        .catch(() => {});
    },
    updateCurrentAvatarImg(avatarImg) {
      updateUserAvatar({ avatar: avatarImg }).then((response) => {
        if (response.data != undefined || response.data != null) {
          this.avatarBroken = false;
          this.options.img = resolveAvatarUrl(response.data);
          store.commit("user/SET_AVATAR", this.options.img);
        }
        this.msgSuccess(response.msg);
      });
    },
    editCropper() {
      // 坏图时用默认图打开裁剪，避免 vue-cropper 空白导致无法操作
      if (this.avatarBroken) {
        this.options.img = this.defaultAvatar;
      } else {
        this.options.img = resolveAvatarUrl(
          (this.user && this.user.avatar) || store.getters.avatar || this.options.img
        );
      }
      this.previews = {};
      this.open = true;
    },
    modalOpened() {
      this.visible = true;
    },
    onDialogClose() {
      this.visible = false;
    },
    requestUpload() {},
    rotateLeft() {
      this.$refs.cropper && this.$refs.cropper.rotateLeft();
    },
    rotateRight() {
      this.$refs.cropper && this.$refs.cropper.rotateRight();
    },
    changeScale(num) {
      this.$refs.cropper && this.$refs.cropper.changeScale(num || 1);
    },
    beforeUpload(file) {
      if (file.type.indexOf("image/") == -1) {
        this.msgError("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。");
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.avatarBroken = false;
          this.options.img = reader.result;
        };
      }
    },
    uploadImg() {
      if (!this.$refs.cropper) {
        this.msgError("请先选择或上传头像图片");
        return;
      }
      this.$refs.cropper.getCropBlob((data) => {
        let formData = new FormData();
        formData.append("avatarFile", data);
        if (this.isBlogSiteAdmin()) {
          formData.append("fileFolder", store.getters.username);
        }
        uploadAvatar(formData).then((response) => {
          this.open = false;
          this.visible = false;
          this.avatarBroken = false;
          const url = resolveAvatarUrl(response.imgUrl || (response.data && response.data.imgUrl));
          this.options.img = url;
          store.commit("user/SET_AVATAR", url);
          this.msgSuccess("修改成功");
        });
      });
    },
    realTime(data) {
      this.previews = data;
    },
    cancel() {
      this.open = false;
      this.visible = false;
    },
  },
};
</script>
<style scoped lang="scss">
.user-info-head {
  position: relative;
  display: inline-block;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f2f5;
  cursor: pointer;
  vertical-align: middle;
}
.user-info-head img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.avatar-upload-preview {
  text-align: center;
  margin: 0 auto;
  align-content: center;
}
.preview-fallback {
  max-width: 200px;
  max-height: 200px;
  border-radius: 50%;
}
.avatar-cropper-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
.user-info-head:hover:after {
  content: "+";
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
  line-height: 120px;
  border-radius: 50%;
  text-align: center;
}
</style>
