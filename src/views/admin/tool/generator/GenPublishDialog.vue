<template>
  <el-dialog
    title="发布为后台菜单"
    :visible.sync="visible"
    width="560px"
    append-to-body
    @open="onOpen"
  >
    <!-- 与 ZIP 解耦：仅写 sys_menu；代码需先下载 ZIP 合并到工程 -->
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="请先下载 ZIP 并合并代码到前后端工程，再发布菜单。"
      style="margin-bottom: 12px"
    />
    <el-form ref="form" :model="form" :rules="rules" label-width="100px" size="small">
      <el-form-item label="挂载父菜单" prop="parentMenuId">
        <treeselect
          v-model="form.parentMenuId"
          :options="menuOptions"
          :normalizer="normalizer"
          :show-count="true"
          placeholder="选择父菜单"
        />
      </el-form-item>
      <el-form-item label="菜单名称">
        <el-input v-model="form.menuName" />
      </el-form-item>
      <el-form-item label="路由 path">
        <el-input v-model="form.path" />
      </el-form-item>
      <el-form-item label="图标">
        <el-input v-model="form.icon" />
      </el-form-item>
      <el-form-item label="授权角色">
        <el-select v-model="form.roleIds" multiple filterable clearable placeholder="可选" style="width: 100%">
          <el-option v-for="r in roleOptions" :key="r.roleId" :label="r.roleName" :value="r.roleId" />
        </el-select>
      </el-form-item>
      <el-form-item label="组件路径">
        <span class="gp-publish-meta">{{ preview.component || '-' }}</span>
      </el-form-item>
      <el-form-item label="权限前缀">
        <span class="gp-publish-meta">{{ preview.permissionPrefix || '-' }}</span>
      </el-form-item>
      <el-form-item v-if="preview.alreadyPublished" label="幂等提示">
        <el-tag type="warning" size="small">已存在菜单 ID {{ preview.existingMainMenuId }}，发布将不重复插入</el-tag>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button size="small" @click="visible = false">取消</el-button>
      <el-button type="primary" size="small" :loading="publishing" @click="handlePublish">发布菜单</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { publishMenuPreview, publishGenMenus } from '@/api/tool/generatorTable'
import { getAllMenuListTree } from '@/api/system/menu'
import { listAllRole } from '@/api/system/role'

export default {
  name: 'GenPublishDialog',
  data() {
    return {
      visible: false,
      currentRow: null,
      publishing: false,
      menuOptions: [],
      roleOptions: [],
      preview: {},
      form: {
        parentMenuId: 3,
        menuName: '',
        path: '',
        icon: 'table',
        roleIds: []
      },
      rules: {
        parentMenuId: [{ required: true, message: '请选择父菜单', trigger: 'change' }]
      }
    }
  },
  methods: {
    open(row) {
      this.currentRow = row
      this.visible = true
    },
    onOpen() {
      if (!this.currentRow) return
      this.loadMenuTree()
      this.loadRoles()
      publishMenuPreview(this.currentRow.tableId).then(res => {
        this.preview = res.data || {}
        this.form.menuName = this.preview.suggestedMenuName || ''
        this.form.path = this.preview.suggestedPath || ''
        this.form.icon = 'table'
      })
    },
    normalizer(node) {
      if (node.children && !node.children.length) delete node.children
      return { id: node.menuId, label: node.menuName, children: node.children }
    },
    loadMenuTree() {
      getAllMenuListTree().then(res => { this.menuOptions = res.data || [] })
    },
    loadRoles() {
      listAllRole().then(res => { this.roleOptions = res.rows || res.data || [] })
    },
    handlePublish() {
      if (!this.currentRow) return
      this.$refs.form.validate(valid => {
        if (!valid) return
        this.publishing = true
        publishGenMenus({
          tableId: this.currentRow.tableId,
          parentMenuId: this.form.parentMenuId,
          menuName: this.form.menuName,
          path: this.form.path,
          icon: this.form.icon,
          roleIds: this.form.roleIds
        }).then(res => {
          const data = res.data || {}
          let msg = data.message || '操作完成'
          if (!data.alreadyPublished) {
            msg += '；请重新登录或刷新权限后访问新菜单'
          }
          this.msgSuccess(msg)
          this.visible = false
        }).finally(() => { this.publishing = false })
      })
    }
  }
}
</script>

<style scoped>
.gp-publish-meta {
  font-size: 13px;
  color: #606266;
}
</style>
