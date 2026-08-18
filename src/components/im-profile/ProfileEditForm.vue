<template>
  <div class="im-profile-edit">
    <div class="im-profile-edit__avatar-block">
      <img class="im-profile-edit__avatar" :src="previewAvatar" alt="" @error="onAvatarErr" />
      <div>
        <el-button size="mini" type="primary" plain :loading="uploading" @click="pickAvatar">更换头像</el-button>
        <p class="im-profile-edit__tip">支持 jpg / png，建议正方形</p>
        <input ref="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden
          @change="onAvatarFile" />
      </div>
    </div>

    <el-form ref="form" class="im-profile-edit__form" :model="form" :rules="rules" label-position="top" size="small">
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="form.nickname" maxlength="30" show-word-limit placeholder="对外显示的名称" />
      </el-form-item>
      <el-form-item label="登录名">
        <el-input :value="form.username" disabled />
      </el-form-item>
      <el-form-item label="手机" prop="phoneNumber">
        <el-input v-model="form.phoneNumber" maxlength="11" placeholder="手机号码" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" maxlength="50" placeholder="邮箱" />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="form.gender">
          <el-radio :label="0">男</el-radio>
          <el-radio :label="1">女</el-radio>
          <el-radio :label="2">保密</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="个性签名" prop="remark">
        <el-input v-model="form.remark" type="textarea" :rows="3" maxlength="200" show-word-limit
          placeholder="一句话介绍自己" />
      </el-form-item>
      <div class="im-profile-edit__actions">
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
        <el-button @click="$emit('cancel')">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script>
import { getUserProfile, updateUserProfile, uploadAvatar } from '@/api/system/user'
import { resolveAvatarUrl, DEFAULT_AVATAR } from '@/components/RealtimeChat/avatar'
import { isBlogSiteAdmin } from "@/utils/blogAdmin";
import PlusCropper from 'plus-cropper'
import { base64ToBlob } from '@/utils/gputil.js'
import { deleteFile } from '@/api/geekplus/geekplus';
import { deleteFileList } from '@/api/common';

export default {
  name: 'ImProfileEditForm',
  data() {
    return {
      saving: false,
      uploading: false,
      broken: false,
      localAvatar: '',
      form: {
        userId: undefined,
        username: '',
        nickname: '',
        phoneNumber: '',
        email: '',
        gender: 2,
        remark: '',
        avatar: ''
      },
      rules: {
        nickname: [{ required: true, message: '请填写昵称', trigger: 'blur' }],
        email: [
          { required: true, message: '请填写邮箱', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
        ],
        phoneNumber: [
          { required: true, message: '请填写手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    previewAvatar() {
      if (this.broken) return DEFAULT_AVATAR
      return resolveAvatarUrl(this.localAvatar || this.form.avatar)
    }
  },
  created() {
    this.load()
  },
  methods: {
    onAvatarErr() {
      this.broken = true
    },
    async load() {
      try {
        const res = await getUserProfile()
        const data = (res && res.data) || res || {}
        const u = data.sysUser || data.user || data
        this.form = {
          userId: u.userId,
          username: u.username || '',
          nickname: u.nickname || '',
          phoneNumber: u.phoneNumber || u.phonenumber || '',
          email: u.email || '',
          gender: u.gender != null ? Number(u.gender) : 2,
          remark: u.remark || '',
          avatar: u.avatar || ''
        }
        this.localAvatar = this.form.avatar
        this.broken = false
      } catch (e) {
        this.$message && this.$message.error('加载资料失败')
      }
    },
    pickAvatar() {
      if (this.$refs.file) {
        this.$refs.file.value = ''
        this.$refs.file.click()
      }
    },
    async onAvatarFile(e) {
      const file = e && e.target && e.target.files && e.target.files[0]
      if (!file) return
      if (file.size > 2 * 1024 * 1024) {
        this.$message && this.$message.warning('头像请小于 2MB')
        return
      }
      const tempURL = URL.createObjectURL(file);
      // 显示裁剪框，传入配置选项
      PlusCropper.show({
        imageSrc: tempURL,
        // ... 其他选项
        cropAreaWidth: 200,
        cropAreaHeight: 200
      });
      // 设置裁剪回调函数
      PlusCropper.onCrop(async (croppedImageDataURL) => {
        //console.log("Plus裁剪后的图片数据：", croppedImageDataURL);
        // 可以在这里将裁剪后的图片数据上传到服务器或者进行其他操作
        URL.revokeObjectURL(tempURL);
        const tempFile = base64ToBlob(croppedImageDataURL);
        this.uploading = true
        try {
          const fd = new FormData()
          fd.append('avatarFile', tempFile)
          if(isBlogSiteAdmin()) {
            fd.append('fileFolder', this.$store.getters.username)
          }
          const res = await uploadAvatar(fd)
          const url =
            (res && (res.imgUrl || res.url)) ||
            (res && res.data && (res.data.imgUrl || res.data.url)) ||
            ''
          if (url) {
            await deleteFileList([this.form.avatar])
            this.form.avatar = url
            this.localAvatar = url
            this.broken = false
            this.$store.commit('user/SET_AVATAR', url)
            this.$message && this.$message.success('头像已更新')
          } else {
            throw new Error('empty')
          }
        } catch (err) {
          this.$message && this.$message.error('头像上传失败')
        } finally {
          this.uploading = false
        }
      });
    },
    submit() {
      this.$refs.form.validate(async (ok) => {
        if (!ok) return
        this.saving = true
        try {
          await updateUserProfile({ ...this.form })
          this.$store.commit('user/SET_NICKNAME', this.form.nickname)
          if (this.form.avatar) this.$store.commit('user/SET_AVATAR', this.form.avatar)
          this.$message && this.$message.success('资料已保存')
          this.$emit('saved', { ...this.form })
        } catch (e) {
          // 部分后端会强制重新登录
          const msg = (e && e.message) || '保存失败'
          this.$message && this.$message.warning(msg)
        } finally {
          this.saving = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.im-profile-edit {
  max-width: 520px;
  margin: 0 auto;
  padding: 8px 4px 24px;
}

.im-profile-edit__avatar-block {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 14px;
  background: var(--gp-surface-bg, #fff);
}

.im-profile-edit__avatar {
  width: 72px;
  height: 72px;
  border-radius: 14px;
  object-fit: cover;
  background: var(--background-2, #edf1f2);
}

.im-profile-edit__tip {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--muted-1-color, #999);
}

.im-profile-edit__form {
  padding: 16px;
  border-radius: 14px;
  background: var(--gp-surface-bg, #fff);
}

.im-profile-edit__actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}

@media (max-width: 720px) {
  .im-profile-edit {
    padding: 4px 0 20px;
  }
}
</style>
