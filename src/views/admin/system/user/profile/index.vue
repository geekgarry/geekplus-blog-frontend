<template>
  <div class="app-container gp-profile">
    <el-row :gutter="20" class="gp-profile__row">
      <!-- 左侧：身份卡 -->
      <el-col :xs="24" :sm="24" :md="8" :lg="7" class="gp-profile__aside">
        <el-card shadow="never" class="gp-profile-card gp-profile-card--identity">
          <div class="gp-profile-identity">
            <userAvatar :user="user" @updated="onProfileUpdated" />
            <h2 class="gp-profile-identity__name">{{ user.nickname || user.username || "—" }}</h2>
            <p class="gp-profile-identity__handle" v-if="user.username">@{{ user.username }}</p>
            <div v-if="roleGroup" class="gp-profile-identity__roles">
              <el-tag
                v-for="(role, idx) in roleTags"
                :key="idx"
                size="small"
                class="gp-profile-identity__role"
              >{{ role }}</el-tag>
            </div>
          </div>

          <ul class="gp-profile-meta">
            <li class="gp-profile-meta__item" v-if="user.phoneNumber">
              <span class="gp-profile-meta__label"><i class="el-icon-phone-outline" />手机</span>
              <span class="gp-profile-meta__value">{{ user.phoneNumber }}</span>
            </li>
            <li class="gp-profile-meta__item" v-if="user.email">
              <span class="gp-profile-meta__label"><i class="el-icon-message" />邮箱</span>
              <span class="gp-profile-meta__value" :title="user.email">{{ user.email }}</span>
            </li>
            <li class="gp-profile-meta__item" v-if="user.deptId && user.sysDept">
              <span class="gp-profile-meta__label"><i class="el-icon-office-building" />部门</span>
              <span class="gp-profile-meta__value">{{ user.sysDept.deptName }}</span>
            </li>
            <li class="gp-profile-meta__item" v-if="user.remark">
              <span class="gp-profile-meta__label"><i class="el-icon-document" />备注</span>
              <span class="gp-profile-meta__value">{{ user.remark }}</span>
            </li>
            <li class="gp-profile-meta__item" v-if="user.createTime">
              <span class="gp-profile-meta__label"><i class="el-icon-time" />创建</span>
              <span class="gp-profile-meta__value">{{ dateFormat(user.createTime) }}</span>
            </li>
          </ul>
        </el-card>
      </el-col>

      <!-- 右侧：资料表单 -->
      <el-col :xs="24" :sm="24" :md="16" :lg="17" class="gp-profile__main">
        <el-card shadow="never" class="gp-profile-card gp-profile-card--form">
          <div slot="header" class="gp-profile-card__header">
            <span>基本资料</span>
            <span class="gp-profile-card__sub">修改密码后需重新登录；基本资料保存后即时生效</span>
          </div>
          <el-tabs v-model="activeTab" class="gp-profile-tabs">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="user" @updated="onProfileUpdated" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd :user="user" />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userAvatar from "./userAvatar";
import userInfo from "./userInfo";
import resetPwd from "./resetPwd";
import { getUserProfile } from "@/api/system/user";

export default {
  name: "Profile",
  components: { userAvatar, userInfo, resetPwd },
  data() {
    return {
      user: {},
      roleGroup: "",
      postGroup: {},
      activeTab: "userinfo",
    };
  },
  computed: {
    /** 角色字符串拆成 tag 列表 */
    roleTags() {
      if (!this.roleGroup) return [];
      return String(this.roleGroup)
        .split(/[,，]/)
        .map((s) => s.trim())
        .filter(Boolean);
    },
  },
  created() {
    this.getUser();
  },
  methods: {
    getUser() {
      getUserProfile().then((response) => {
        this.user = response.data || {};
        this.roleGroup = this.getRoleName(response.data && response.data.sysRoleList);
      });
    },
    getRoleName(roleList) {
      if (!roleList || !roleList.length) return "";
      return roleList.map((role) => role.roleName).filter(Boolean).join("，");
    },
    /** 基本资料保存成功：合并到本页 user，刷新身份卡展示 */
    onProfileUpdated(payload) {
      if (!payload) return;
      this.user = { ...this.user, ...payload };
    },
  },
};
</script>

<style scoped lang="scss">
.gp-profile {
  max-width: 1200px;
  margin: 0 auto;
}

.gp-profile__row {
  align-items: flex-start;
}

.gp-profile-card {
  border: 1px solid var(--border-color, #ebe6e0);
  border-radius: var(--gp-surface-radius-sm, 10px);
  background: var(--background-origin, #fff);
  margin-bottom: 16px;

  ::v-deep .el-card__header {
    border-bottom: 1px solid var(--border-color, #ebe6e0);
    padding: 14px 18px;
    background: transparent;
  }

  ::v-deep .el-card__body {
    padding: 18px 20px 22px;
  }
}

.gp-profile-card__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 16px;
  font-weight: 600;
  color: var(--text-color-2, #1f1e1d);
}

.gp-profile-card__sub {
  font-size: 12px;
  font-weight: 400;
  color: var(--muted-1-color, #8a8580);
}

.gp-profile-identity {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 0 16px;
  border-bottom: 1px solid var(--border-color, #ebe6e0);
  margin-bottom: 4px;
}

.gp-profile-identity__name {
  margin: 14px 0 4px;
  font-size: 20px;
  font-weight: 650;
  line-height: 1.3;
  color: var(--text-color-2, #1f1e1d);
  word-break: break-word;
}

.gp-profile-identity__handle {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--muted-1-color, #8a8580);
}

.gp-profile-identity__roles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.gp-profile-meta {
  list-style: none;
  margin: 0;
  padding: 8px 0 0;
}

.gp-profile-meta__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px dashed var(--border-color, #ebe6e0);
  font-size: 13px;
  line-height: 1.45;

  &:last-child {
    border-bottom: 0;
  }
}

.gp-profile-meta__label {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted-1-color, #8a8580);
  white-space: nowrap;

  i {
    font-size: 14px;
    color: var(--theme-color, #5f7d80);
  }
}

.gp-profile-meta__value {
  flex: 1 1 auto;
  text-align: right;
  color: var(--text-color-2, #1f1e1d);
  word-break: break-all;
}

.gp-profile-tabs {
  ::v-deep .el-tabs__header {
    margin-bottom: 18px;
  }

  ::v-deep .el-tabs__item {
    color: var(--text-color, #4f4c48);
  }

  ::v-deep .el-tabs__item.is-active {
    color: var(--theme-color, #5f7d80);
    font-weight: 600;
  }
}

@media (max-width: 991px) {
  .gp-profile-card--identity {
    margin-bottom: 12px;
  }
}

@media (max-width: 767px) {
  /* .gp-profile {
    padding-left: 0;
    padding-right: 0;
  } */

  .gp-profile-card {
    ::v-deep .el-card__body {
      padding: 14px 14px 18px;
    }
  }

  .gp-profile-identity__name {
    font-size: 18px;
  }

  .gp-profile-meta__item {
    flex-direction: column;
    gap: 4px;
  }

  .gp-profile-meta__value {
    text-align: left;
  }
}
</style>
