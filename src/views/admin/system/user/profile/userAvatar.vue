<template>
  <div class="gp-avatar">
    <!-- 个人中心圆形头像：与裁剪预览同尺寸同形态，避免「方框裁 / 圆图显」错位感 -->
    <button type="button" class="gp-avatar__trigger" @click="editCropper" :title="'点击更换头像'">
      <img
        :src="avatarUrl"
        alt="头像"
        class="gp-avatar__img"
        width="120"
        height="120"
        decoding="async"
        @error="onAvatarError"
      />
      <span class="gp-avatar__mask">
        <i class="el-icon-camera" />
        <em>更换</em>
      </span>
    </button>

    <el-dialog
      :title="title"
      :visible.sync="open"
      custom-class="gp-avatar-dialog"
      :width="dialogWidth"
      append-to-body
      @opened="modalOpened"
      @close="onDialogClose"
    >
      <div class="gp-avatar-editor">
        <p class="gp-avatar-editor__hint">
          打开时底图自动贴合裁切框（正方形四边贴合，非正方形至少两边紧贴）；可继续缩放、拖动与调整选区。提交后圆形展示。
        </p>

        <div class="gp-avatar-editor__body">
          <!--
            初始 cover 贴合裁切框（两边紧贴）；之后允许自由放大缩小。
            centerBox：拖动/缩小时选区不超出图片。
          -->
          <div class="gp-avatar-editor__crop">
            <vue-cropper
              v-if="visible"
              ref="cropper"
              :img="options.img"
              :info="false"
              :auto-crop="options.autoCrop"
              :auto-crop-width="options.autoCropWidth"
              :auto-crop-height="options.autoCropHeight"
              :fixed="options.fixed"
              :fixed-number="options.fixedNumber"
              :fixed-box="false"
              :center-box="true"
              :can-move="true"
              :can-move-box="true"
              :can-scale="true"
              :original="false"
              :high="false"
              :enlarge="1"
              :output-size="0.92"
              :output-type="'jpeg'"
              mode="cover"
              :max-img-size="960"
              @realTime="onCropRealTime"
              @img-load="onCropperImgLoad"
            />
            <div v-else class="gp-avatar-editor__loading">加载裁剪器…</div>
          </div>

          <!-- 圆形预览：节流 getCropData，与选区像素一致（CSS transform 预览易错位） -->
          <aside class="gp-avatar-editor__aside">
            <div class="gp-avatar-editor__preview-label">圆形预览</div>
            <div class="gp-avatar-editor__preview gp-avatar-editor__preview--lg">
              <img
                :src="cropPreviewUrl || options.img || defaultAvatar"
                class="gp-avatar-editor__preview-img"
                alt="预览"
              />
            </div>
            <div class="gp-avatar-editor__preview gp-avatar-editor__preview--sm">
              <img
                :src="cropPreviewUrl || options.img || defaultAvatar"
                class="gp-avatar-editor__preview-img"
                alt="小预览"
              />
            </div>
            <p class="gp-avatar-editor__preview-caption">与裁切选区同步</p>
          </aside>
        </div>

        <div class="gp-avatar-editor__toolbar">
          <div class="gp-avatar-editor__toolbar-left">
            <el-upload action="#" :http-request="requestUpload" :show-file-list="false" :before-upload="beforeUpload">
              <el-button size="small" icon="el-icon-upload2">选择图片</el-button>
            </el-upload>
            <el-button
              v-if="isBlogSiteAdmin()"
              size="small"
              icon="el-icon-folder-opened"
              @click="getAvatarList"
            >浏览图库</el-button>
            <div class="gp-avatar-editor__scale">
              <el-button size="small" icon="el-icon-plus" title="放大" @click="changeScale(1)" />
              <el-button size="small" icon="el-icon-minus" title="缩小" @click="changeScale(-1)" />
              <el-button size="small" icon="el-icon-refresh-left" title="左转" @click="rotateLeft" />
              <el-button size="small" icon="el-icon-refresh-right" title="右转" @click="rotateRight" />
            </div>
          </div>
          <div class="gp-avatar-editor__toolbar-right">
            <el-button size="small" @click="cancel">取 消</el-button>
            <el-button type="primary" size="small" :loading="uploading" @click="uploadImg">提 交</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog
      title="头像图库"
      :visible.sync="displayAvatar"
      custom-class="gp-avatar-gallery-dialog"
      :width="galleryWidth"
      append-to-body
    >
      <div v-if="!allAvatarImg.length" class="gp-avatar-gallery__empty">暂无历史头像</div>
      <div v-else class="gp-avatar-gallery">
        <div
          v-for="avatarImg in allAvatarImg"
          :key="avatarImg"
          class="gp-avatar-gallery__item"
        >
          <el-image
            class="gp-avatar-gallery__img"
            :src="baseApi + avatarImg"
            fit="cover"
            :preview-src-list="localImgToWebImg(allAvatarImg)"
            lazy
          >
            <div slot="placeholder" class="image-slot">加载中…</div>
            <div slot="error" class="image-slot">加载失败</div>
          </el-image>
          <div class="gp-avatar-gallery__actions">
            <el-tooltip content="删除" placement="top">
              <el-button type="danger" icon="el-icon-delete" circle size="mini" @click="deleteFileByPath(avatarImg)" />
            </el-tooltip>
            <el-tooltip content="选用" placement="top">
              <el-button type="success" icon="el-icon-check" circle size="mini" @click="updateCurrentAvatarImg(avatarImg)" />
            </el-tooltip>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="displayAvatar = false">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import store from "@/store";
import { VueCropper } from "vue-cropper";
import { uploadAvatar, getAvatarImageList, updateUserAvatar } from "@/api/system/user";
import { deleteFile, deleteFileList } from "@/api/common";
import { isBlogSiteAdmin } from "@/utils/blogAdmin";

const DEFAULT_AVATAR = require("@/assets/mai.jpg");
/** 裁剪框初始边长（1:1）；展示为圆形，与个人中心头像同形 */
const CROP_BOX_PX = 200;

function resolveAvatarUrl(raw) {
  if (!raw) return DEFAULT_AVATAR;
  const s = String(raw).trim();
  if (!s || s === "null" || s === "undefined") return DEFAULT_AVATAR;
  if (/^(data:|blob:|https?:\/\/)/i.test(s)) return s;
  if (s.indexOf(process.env.VUE_APP_BASE_API) === 0) return s;
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
      uploading: false,
      title: "修改头像",
      defaultAvatar: DEFAULT_AVATAR,
      avatarBroken: false,
      /** 选区导出的 dataURL，圆形预览与提交范围一致 */
      cropPreviewUrl: "",
      _previewTimer: null,
      _previewSeq: 0,
      options: {
        img: DEFAULT_AVATAR,
        autoCrop: true,
        autoCropWidth: CROP_BOX_PX,
        autoCropHeight: CROP_BOX_PX,
        fixed: true,
        fixedNumber: [1, 1],
        fixedBox: false,
      },
      baseApi: process.env.VUE_APP_BASE_API,
      viewportW: typeof window !== "undefined" ? window.innerWidth : 1024,
    };
  },
  computed: {
    avatarUrl() {
      if (this.avatarBroken) return this.defaultAvatar;
      // 优先 Vuex：上传后 Navbar 已更新；props.user 可能仍是进页时的旧值
      return resolveAvatarUrl(
        store.getters.avatar || (this.user && this.user.avatar) || this.options.img
      );
    },
    dialogWidth() {
      return this.viewportW < 768 ? "94%" : this.viewportW < 1100 ? "720px" : "800px";
    },
    galleryWidth() {
      return this.viewportW < 768 ? "94%" : "560px";
    },
  },
  watch: {
    "user.avatar": {
      immediate: true,
      handler(val) {
        // Vuex 优先，避免进页后 props 滞后盖掉已提交的新头像
        const next = store.getters.avatar || val;
        if (!next) return;
        this.avatarBroken = false;
        this.options.img = resolveAvatarUrl(next);
      },
    },
    // 其它入口改头像时，本组件圆形预览同步
    "$store.state.user.avatar"(val) {
      if (!val) return;
      this.avatarBroken = false;
      this.options.img = resolveAvatarUrl(val);
    },
  },
  mounted() {
    this._onResize = () => {
      this.viewportW = window.innerWidth;
    };
    window.addEventListener("resize", this._onResize, { passive: true });
  },
  beforeDestroy() {
    if (this._onResize) window.removeEventListener("resize", this._onResize);
    if (this._previewTimer) clearTimeout(this._previewTimer);
  },
  methods: {
    isBlogSiteAdmin,
    onAvatarError() {
      this.avatarBroken = true;
      this.options.img = this.defaultAvatar;
    },
    getAvatarList() {
      getAvatarImageList({ fileFolder: store.getters.username })
        .then((response) => {
          this.displayAvatar = true;
          this.allAvatarImg = response.data || [];
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
    /**
     * 头像提交成功后：写 Vuex + 通知个人中心合并 props.user，保证全页即时一致
     */
    applyAvatarSuccess(rawUrl) {
      const url = resolveAvatarUrl(rawUrl);
      this.avatarBroken = false;
      this.options.img = url;
      store.commit("user/SET_AVATAR", url);
      this.$emit("updated", { avatar: url });
      return url;
    },
    updateCurrentAvatarImg(avatarImg) {
      updateUserAvatar({ avatar: avatarImg }).then((response) => {
        const raw = response.data != null ? response.data : avatarImg;
        this.applyAvatarSuccess(raw);
        this.msgSuccess(response.msg);
        this.displayAvatar = false;
      });
    },
    editCropper() {
      if (this.avatarBroken) {
        this.options.img = this.defaultAvatar;
      } else {
        this.options.img = resolveAvatarUrl(
          store.getters.avatar || (this.user && this.user.avatar) || this.options.img
        );
      }
      this.cropPreviewUrl = "";
      // 预热图片缓存，缩短弹窗内 cropper 解码等待
      try {
        const warm = new Image();
        warm.decoding = "async";
        warm.src = this.options.img;
      } catch (e) { /* ignore */ }
      this.open = true;
    },
    modalOpened() {
      this.visible = true;
      this.$nextTick(() => this.scheduleCropPreview(0));
    },
    onDialogClose() {
      this.visible = false;
      this.uploading = false;
      this.cropPreviewUrl = "";
      if (this._previewTimer) clearTimeout(this._previewTimer);
    },
    requestUpload() {},
    rotateLeft() {
      const c = this.$refs.cropper;
      if (!c) return;
      c.rotateLeft();
      this.$nextTick(() => this.fitImageCoverCropBox());
    },
    rotateRight() {
      const c = this.$refs.cropper;
      if (!c) return;
      c.rotateRight();
      this.$nextTick(() => this.fitImageCoverCropBox());
    },
    changeScale(num) {
      // 允许自由放大/缩小；centerBox 会限制缩到选区露空
      this.$refs.cropper && this.$refs.cropper.changeScale(num || 1);
    },
    onCropperImgLoad(status) {
      if (status !== "success") return;
      this.$nextTick(() => {
        setTimeout(() => {
          this.fitImageCoverCropBox();
          this.scheduleCropPreview(0);
        }, 40);
      });
    },
    /**
     * 初次打开/旋转后：cover 贴合裁切框。
     * - 正方形：四边正好贴合
     * - 竖图/横图：至少有两边紧贴选区（另一边可超出，由遮罩压暗）
     * 之后用户仍可继续放大，不在此限制上限。
     */
    fitImageCoverCropBox() {
      const c = this.$refs.cropper;
      if (!c || !(c.trueWidth > 0) || !(c.cropW > 0)) return;

      const rot = ((c.rotate % 4) + 4) % 4;
      const swapped = rot === 1 || rot === 3;
      const layoutW = swapped ? c.trueHeight : c.trueWidth;
      const layoutH = swapped ? c.trueWidth : c.trueHeight;

      // cover：取较大缩放，保证裁切框被铺满、至少两边紧贴
      const coverScale = Math.max(c.cropW / layoutW, c.cropH / layoutH);
      c.scale = coverScale;

      const showW = layoutW * coverScale;
      const showH = layoutH * coverScale;
      // 相对裁切框居中
      const targetX1 = c.cropOffsertX + (c.cropW - showW) / 2;
      const targetY1 = c.cropOffsertY + (c.cropH - showH) / 2;

      const tw = c.trueWidth;
      const th = c.trueHeight;
      const imgW = tw * coverScale;
      const imgH = th * coverScale;

      if (!swapped) {
        c.x = targetX1 - (tw * (1 - coverScale)) / 2;
        c.y = targetY1 - (th * (1 - coverScale)) / 2;
      } else {
        c.x = targetX1 - (tw * (1 - coverScale)) / 2 - (imgW - imgH) / 2;
        c.y = targetY1 - (th * (1 - coverScale)) / 2 - (imgH - imgW) / 2;
      }

      if (typeof c.moveCrop === "function") {
        try {
          c.moveCrop(null, true);
        } catch (e) { /* ignore */ }
      }
      if (typeof c.showPreview === "function") c.showPreview();
    },
    /**
     * 本地大图先压到长边 ≤ maxEdge，加快 cropper 加载与交互
     */
    compressImageFile(file, maxEdge = 960) {
      return new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          let { width, height } = img;
          const edge = Math.max(width, height);
          if (edge <= maxEdge) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
            return;
          }
          const ratio = maxEdge / edge;
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });
    },
    beforeUpload(file) {
      if (file.type.indexOf("image/") === -1) {
        this.msgError("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。");
        return false;
      }
      this.compressImageFile(file).then((dataUrl) => {
        if (!dataUrl) {
          this.msgError("图片读取失败，请重试");
          return;
        }
        this.avatarBroken = false;
        this.cropPreviewUrl = "";
        this.options.img = dataUrl;
        this.scheduleCropPreview(80);
      });
      return false;
    },
    uploadImg() {
      if (!this.$refs.cropper) {
        this.msgError("请先选择或上传头像图片");
        return;
      }
      this.uploading = true;
      this.$refs.cropper.getCropBlob((data) => {
        let formData = new FormData();
        formData.append("avatarFile", data, "avatar.jpg");
        if (this.isBlogSiteAdmin()) {
          formData.append("fileFolder", store.getters.username);
        }
        uploadAvatar(formData)
          .then((response) => {
            this.open = false;
            this.visible = false;
            const raw = response.imgUrl || (response.data && response.data.imgUrl);
            deleteFileList([this.options.img]);
            this.applyAvatarSuccess(raw);
            this.msgSuccess("修改成功");
          })
          .catch(() => {})
          .then(() => {
            this.uploading = false;
          });
      });
    },
    /** realTime 只当信号；节流导出选区预览 */
    onCropRealTime() {
      this.scheduleCropPreview(120);
    },
    scheduleCropPreview(delay) {
      if (this._previewTimer) clearTimeout(this._previewTimer);
      this._previewTimer = setTimeout(() => this.refreshCropPreview(), delay == null ? 120 : delay);
    },
    refreshCropPreview() {
      const cropper = this.$refs.cropper;
      if (!cropper || typeof cropper.getCropData !== "function") return;
      const seq = ++this._previewSeq;
      try {
        cropper.getCropData((data) => {
          // 丢弃过期回调，避免拖动时预览抖动错位
          if (seq !== this._previewSeq) return;
          if (data) this.cropPreviewUrl = data;
        });
      } catch (e) {
        // cropper 未就绪时忽略
      }
    },
    cancel() {
      this.open = false;
      this.visible = false;
    },
  },
};
</script>

<style scoped lang="scss">
.gp-avatar {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
}

.gp-avatar__trigger {
  position: relative;
  display: block;
  width: 120px;
  height: 120px;
  padding: 0;
  border: 3px solid var(--border-color-2, #d4cfc8);
  border-radius: 50%;
  overflow: hidden;
  background: var(--background-1, #efece7);
  cursor: pointer;
  box-shadow: var(--gp-surface-shadow, 0 2px 14px rgba(44, 42, 40, 0.06));
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.gp-avatar__trigger:hover,
.gp-avatar__trigger:focus {
  border-color: var(--theme-color, #5f7d80);
  box-shadow: var(--gp-surface-shadow-hover, 0 8px 22px rgba(44, 42, 40, 0.1));
  outline: none;
}

.gp-avatar__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.gp-avatar__mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: #faf9f7;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 12px;
  line-height: 1.2;
}

.gp-avatar__mask i {
  font-size: 22px;
}

.gp-avatar__mask em {
  font-style: normal;
}

.gp-avatar__trigger:hover .gp-avatar__mask,
.gp-avatar__trigger:focus .gp-avatar__mask {
  opacity: 1;
}

.gp-avatar-editor__hint {
  margin: 0 0 12px;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-color, #4f4c48);
  background: var(--theme-color-muted, rgba(95, 125, 128, 0.14));
  border-radius: var(--gp-border-radius-base, 4px);
  border: 1px solid var(--border-color, #ebe6e0);
}

.gp-avatar-editor__body {
  display: flex;
  gap: 20px;
  align-items: stretch;
  min-height: 280px;
}

.gp-avatar-editor__crop {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  min-height: 280px;
  height: 320px;
  border-radius: var(--gp-border-radius-base, 4px);
  overflow: hidden;
  isolation: isolate;
  border: 1px solid var(--border-color-2, #d4cfc8);
  /* 马赛克棋盘底（透明图常见背景），不要用实色盖住 */
  background-color: #e8e8e8;
  background-image:
    linear-gradient(45deg, #cfcfcf 25%, transparent 25%),
    linear-gradient(-45deg, #cfcfcf 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #cfcfcf 75%),
    linear-gradient(-45deg, transparent 75%, #cfcfcf 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0;
}

.gp-avatar-editor__loading {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted-1-color, #8a8580);
}

.gp-avatar-editor__aside {
  flex: 0 0 148px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 12px 8px;
  background: var(--background-1, #efece7);
  border: 1px solid var(--border-color, #ebe6e0);
  border-radius: var(--gp-border-radius-base, 4px);
}

.gp-avatar-editor__preview-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-color-2, #1f1e1d);
}

/* 圆形预览：直接展示 getCropData 方图，圆角裁切，与选区一致 */
.gp-avatar-editor__preview {
  position: relative;
  box-sizing: border-box;
  border-radius: 50%;
  overflow: hidden;
  background: var(--background-origin, #fff);
  border: 2px solid var(--border-color-2, #d4cfc8);
  box-shadow: var(--gp-surface-shadow, 0 2px 10px rgba(0, 0, 0, 0.08));
  flex-shrink: 0;
}

.gp-avatar-editor__preview--lg {
  width: 120px;
  height: 120px;
}

.gp-avatar-editor__preview--sm {
  width: 48px;
  height: 48px;
}

.gp-avatar-editor__preview-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.gp-avatar-editor__preview-caption {
  margin: 0;
  font-size: 11px;
  color: var(--muted-1-color, #8a8580);
}

.gp-avatar-editor__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid var(--border-color, #ebe6e0);
}

.gp-avatar-editor__toolbar-left,
.gp-avatar-editor__toolbar-right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

/* 缩放/旋转钮彼此留空隙（不用 button-group 贴边） */
.gp-avatar-editor__scale {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.gp-avatar-editor__scale .el-button {
  margin-left: 0;
}

.gp-avatar-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: 14px;
}

.gp-avatar-gallery__empty {
  text-align: center;
  padding: 32px;
  color: var(--muted-1-color, #8a8580);
}

.gp-avatar-gallery__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.gp-avatar-gallery__img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border-color-2, #d4cfc8);
}

.gp-avatar-gallery__actions {
  display: flex;
  gap: 6px;
}

@media (max-width: 767px) {
  .gp-avatar-editor__body {
    flex-direction: column;
    min-height: 0;
  }

  .gp-avatar-editor__crop {
    height: 240px;
    min-height: 220px;
  }

  .gp-avatar-editor__aside {
    flex: none;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    gap: 12px 20px;
  }

  .gp-avatar-editor__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .gp-avatar-editor__toolbar-left,
  .gp-avatar-editor__toolbar-right {
    justify-content: center;
  }

  .gp-avatar-editor__toolbar-right .el-button {
    flex: 1;
  }
}
</style>

<!-- 弹窗挂 body，需非 scoped -->
<style lang="scss">
.gp-avatar-dialog {
  max-width: 96vw;
  margin-top: 6vh !important;

  .el-dialog__body {
    padding: 12px 18px 18px;
  }

  .el-dialog__header {
    padding: 14px 18px 8px;
  }

  /*
   * 恢复可见底图 + 半透明遮罩 + 马赛克；
   * 「不超出」靠 scale 上限钳制，不再用 opacity 藏溢出。
   */
  .gp-avatar-editor__crop {
    overflow: hidden !important;

    .vue-cropper {
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      background: transparent !important;
    }

    .cropper-box {
      overflow: hidden !important;
      opacity: 1 !important;
    }

    .cropper-modal {
      background: rgba(0, 0, 0, 0.35) !important;
      opacity: 1 !important;
    }

    .cropper-view-box {
      outline: 1px solid rgba(255, 255, 255, 0.9);
    }
  }
}

.gp-avatar-gallery-dialog {
  max-width: 96vw;

  .el-dialog__body {
    max-height: 60vh;
    overflow: auto;
  }
}

@media (max-width: 767px) {
  .gp-avatar-dialog {
    margin-top: 4vh !important;

    .el-dialog__body {
      padding: 10px 12px 14px;
    }
  }
}
</style>
