<template>
  <div class="gp-page container-fluid">
    <div class="gp-page__inner container comment-manage">
      <header class="gp-blog-page__hero">
        <p class="eyebrow">Comments</p>
        <h1>留言管理</h1>
        <p class="lead" v-if="isAdmin">管理全站网站留言与文章评论；可跳转前台定位到具体一条。</p>
        <p class="lead" v-else>仅展示<strong>你自己</strong>发布的网站留言与文章评论，可一键定位到前台原文。</p>
        <div class="hero-meta">
          <el-tag size="small" :type="isAdmin ? 'danger' : 'info'">{{ isAdmin ? '管理员 · 全站数据' : '普通用户 · 仅本人' }}</el-tag>
          <router-link class="back-link" to="/user/center">← 返回个人中心</router-link>
        </div>
      </header>

    <el-tabs v-model="activeName" class="comment-manage__tabs" @tab-click="handleClick">
      <!-- 网站留言 -->
      <el-tab-pane label="网站留言" name="first">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" class="comment-manage__query" label-width="68px">
          <el-form-item label="用户名" prop="name">
            <el-input v-model="queryParams.name" placeholder="留言用户" clearable size="small" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input v-model="queryParams.content" placeholder="留言内容关键词" clearable size="small" @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item v-if="isAdmin" label="是否显示" prop="isDisplay">
            <el-select v-model="queryParams.isDisplay" placeholder="显示状态" clearable size="small">
              <el-option label="不显示" :value="0" />
              <el-option label="显示" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5" v-if="isAdmin">
            <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
          </el-col>
          <el-col :span="1.5" v-if="isAdmin">
            <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport">导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <div v-loading="loading" class="site-feed">
          <div v-if="!commentList.length && !loading" class="feed-empty">暂无网站留言</div>
          <div v-for="row in commentList" :key="row.id" class="site-card">
            <div class="site-card__head">
              <div class="site-card__user">
                <span class="avatar">{{ (row.name || '?').charAt(0) }}</span>
                <div>
                  <strong>{{ row.name || '匿名' }}</strong>
                  <span class="meta">#{{ row.id }} · {{ parseTime(row.createTime) }}</span>
                </div>
              </div>
              <div class="site-card__actions">
                <el-switch
                  v-if="isAdmin"
                  v-model="row.isDisplay"
                  :active-value="1"
                  :inactive-value="0"
                  active-text="显示"
                  inactive-text="隐藏"
                  @change="handleIsDisplayChange(row)"
                />
                <el-button type="text" icon="el-icon-position" @click="goSiteComment(row)">定位留言</el-button>
                <el-button v-if="isAdmin" type="text" icon="el-icon-chat-line-round" @click="handleAddReply(row)">回复</el-button>
                <el-button type="text" icon="el-icon-edit" @click="handleUpdate(row)">修改</el-button>
                <el-button type="text" icon="el-icon-delete" class="danger" @click="handleDelete(row)">删除</el-button>
              </div>
            </div>
            <div class="site-card__content" v-html="plainContent(row.content)"></div>
            <div v-if="row.replyName" class="site-card__reply-to">回复 @{{ row.replyName }}</div>
            <div v-if="row.children && row.children.length" class="site-card__children">
              <div v-for="child in row.children" :key="child.id" class="site-card__child">
                <strong>{{ child.name }}</strong>
                <span v-if="child.replyName"> 回复 @{{ child.replyName }}：</span>
                <span v-else>：</span>
                <span v-html="plainContent(child.content)"></span>
                <a href="javascript:;" class="child-jump" @click="goSiteComment(child)">定位</a>
              </div>
            </div>
          </div>
        </div>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />
      </el-tab-pane>

      <!-- 文章留言：管理员树形全站；普通用户按文章聚合本人评论 -->
      <el-tab-pane label="文章留言" name="second">
        <el-form :model="queryArticleCommentParams" ref="queryArticleCommentForm" :inline="true" v-show="showArticleSearch" class="comment-manage__query" label-width="78px">
          <el-form-item v-if="isAdmin" label="用户名" prop="name">
            <el-input v-model="queryArticleCommentParams.name" placeholder="评论用户" clearable size="small" @keyup.enter.native="handleArticleCommentQuery" />
          </el-form-item>
          <el-form-item label="文章标题" prop="articleTitle">
            <el-input v-model="queryArticleCommentParams.articleTitle" placeholder="关联文章标题" clearable size="small" @keyup.enter.native="handleArticleCommentQuery" />
          </el-form-item>
          <el-form-item label="内容" prop="content">
            <el-input v-model="queryArticleCommentParams.content" placeholder="评论内容" clearable size="small" @keyup.enter.native="handleArticleCommentQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleArticleCommentQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetArticleCommentQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <right-toolbar :showSearch.sync="showArticleSearch" @queryTable="getArticleFeedList"></right-toolbar>
        </el-row>

        <div v-loading="articleLoading" class="xhs-feed">
          <div v-if="!articleFeedList.length && !articleLoading" class="feed-empty">暂无文章留言</div>

          <!-- 普通用户：按文章聚合 -->
          <template v-if="!isAdmin">
            <div v-for="group in articleFeedList" :key="'ag-' + group.topicId" class="xhs-card xhs-card--group">
              <a class="xhs-card__article" href="javascript:;" @click.prevent="goArticleById(group.topicId)">
                <el-image class="xhs-card__cover" :src="group.indexPicture || defaultCover" fit="cover">
                  <div slot="error" class="image-slot"><i class="el-icon-document"></i></div>
                </el-image>
                <div class="xhs-card__article-meta">
                  <el-tag size="mini" type="info">文章 #{{ group.topicId || '-' }}</el-tag>
                  <h4>{{ group.articleTitle || ('文章 ' + (group.topicId || '未知')) }}</h4>
                  <span class="hint">{{ group.comments.length }} 条我的评论 · 最近 {{ parseTime(group.latestTime) }}</span>
                </div>
              </a>
              <div class="xhs-card__body">
                <div v-for="row in group.comments" :key="'ac-' + row.id" class="xhs-card__comment">
                  <div class="xhs-card__user">
                    <span class="avatar">{{ (row.name || '?').charAt(0) }}</span>
                    <div>
                      <strong>{{ row.name || '匿名' }}</strong>
                      <span class="meta">评论 #{{ row.id }} · {{ parseTime(row.createTime) }}</span>
                    </div>
                  </div>
                  <div class="xhs-card__content" v-html="plainContent(row.content)"></div>
                  <div v-if="row.replyName" class="xhs-card__reply-to">回复 @{{ row.replyName }}</div>
                  <div class="xhs-card__ops">
                    <el-button type="text" icon="el-icon-link" @click="goArticleComment(row)">打开文章</el-button>
                    <el-button type="text" icon="el-icon-edit" @click="handleUpdateArticle(row)">修改</el-button>
                    <el-button type="text" icon="el-icon-delete" class="danger" @click="handleDeleteArticle(row)">删除</el-button>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- 管理员：全站树形（含 children） -->
          <template v-else>
            <div v-for="row in articleFeedList" :key="'ac-' + row.id" class="xhs-card">
              <a class="xhs-card__article" href="javascript:;" @click.prevent="goArticleComment(row)">
                <el-image class="xhs-card__cover" :src="row.indexPicture || defaultCover" fit="cover">
                  <div slot="error" class="image-slot"><i class="el-icon-document"></i></div>
                </el-image>
                <div class="xhs-card__article-meta">
                  <el-tag size="mini" type="info">文章 #{{ row.topicId || '-' }}</el-tag>
                  <h4>{{ row.articleTitle || ('文章 ' + (row.topicId || '未知')) }}</h4>
                  <span class="hint">点击前往该文并定位本条评论 →</span>
                </div>
              </a>
              <div class="xhs-card__body">
                <div class="xhs-card__user">
                  <span class="avatar">{{ (row.name || '?').charAt(0) }}</span>
                  <div>
                    <strong>{{ row.name || '匿名' }}</strong>
                    <span class="meta">评论 #{{ row.id }} · {{ parseTime(row.createTime) }}</span>
                  </div>
                  <el-switch
                    v-model="row.isDisplay"
                    :active-value="1"
                    :inactive-value="0"
                    @change="handleIsDisplayChangeArticle(row)"
                  />
                </div>
                <div class="xhs-card__content" v-html="plainContent(row.content)"></div>
                <div v-if="row.replyName" class="xhs-card__reply-to">回复 @{{ row.replyName }}</div>
                <div v-if="row.children && row.children.length" class="site-card__children">
                  <div v-for="child in row.children" :key="child.id" class="site-card__child">
                    <strong>{{ child.name }}</strong>
                    <span v-if="child.replyName"> 回复 @{{ child.replyName }}：</span>
                    <span v-else>：</span>
                    <span v-html="plainContent(child.content)"></span>
                    <a href="javascript:;" class="child-jump" @click="goArticleComment(child)">定位</a>
                  </div>
                </div>
                <div class="xhs-card__ops">
                  <el-button type="text" icon="el-icon-link" @click="goArticleComment(row)">打开文章</el-button>
                  <el-button type="text" icon="el-icon-chat-line-round" @click="handleAddArticleReply(row)">回复</el-button>
                  <el-button type="text" icon="el-icon-edit" @click="handleUpdateArticle(row)">修改</el-button>
                  <el-button type="text" icon="el-icon-delete" class="danger" @click="handleDeleteArticle(row)">删除</el-button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <pagination
          v-show="articleFeedTotal > 0"
          :total="articleFeedTotal"
          :page.sync="queryArticleCommentParams.pageNum"
          :limit.sync="queryArticleCommentParams.pageSize"
          @pagination="getArticleFeedList"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 网站留言：新增/修改 -->
    <el-dialog :title="title" :visible.sync="open" width="770px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="评论ID" prop="replyId">
          <span v-if="form.replyId == 0 || !form.replyId">用户留言</span>
          <el-input v-else v-model="form.replyId" placeholder="请输入回复的评论ID" />
        </el-form-item>
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="网址" prop="website">
          <el-input v-model="form.website" placeholder="请输入网址" />
        </el-form-item>
        <el-form-item label="留言内容" prop="content">
          <quill-editor v-model="form.content" :min-height="192" />
        </el-form-item>
        <el-form-item label="是否显示" prop="isDisplay">
          <el-select v-model="form.isDisplay" placeholder="请选择是否页面显示">
            <el-option label="不显示" :value="0" />
            <el-option label="显示" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 网站留言：回复 -->
    <el-dialog :title="title" :visible.sync="isAddReply" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="留言内容" prop="content">
          <quill-editor v-model="form.content" :min-height="192" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 文章留言：修改 -->
    <el-dialog :title="title" :visible.sync="openArticle" width="770px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="name">
          <el-input v-model="form.name" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="留言内容" prop="content">
          <quill-editor v-model="form.content" :min-height="192" />
        </el-form-item>
        <el-form-item label="是否显示" prop="isDisplay">
          <el-select v-model="form.isDisplay" placeholder="是否显示评论">
            <el-option label="不显示" :value="0" />
            <el-option label="显示" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormArticle">确 定</el-button>
        <el-button @click="cancelArticle">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 文章留言：回复 -->
    <el-dialog :title="title" :visible.sync="isAddReplyArticle" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="留言内容" prop="content">
          <quill-editor v-model="form.content" :min-height="192" />
        </el-form-item>
        <el-form-item label="是否显示" prop="isDisplay">
          <el-select v-model="form.isDisplay" placeholder="是否显示评论">
            <el-option label="不显示" :value="0" />
            <el-option label="显示" :value="1" />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFormArticle">确 定</el-button>
        <el-button @click="cancelArticle">取 消</el-button>
      </div>
    </el-dialog>
    </div>
  </div>
</template>

<script>
import {
  listComment, getComment, delComment, addComment, updateComment, exportComment,
  listArticleComment, getArticleComment, delArticleComment, addArticleComment, updateArticleComment
} from "@/api/geekplus/comment";
import QuillEditor from "@/components/QuillEditor";
import { isBlogSiteAdmin } from "@/utils/blogAdmin";
import { getToken } from "@/utils/auth";

export default {
  name: "CommentManage",
  components: { QuillEditor },
  data() {
    return {
      activeName: "first",
      loading: true,
      articleLoading: false,
      showSearch: true,
      showArticleSearch: true,
      total: 0,
      commentList: [],
      articleFeedList: [],
      articleFeedTotal: 0,
      title: "",
      open: false,
      openArticle: false,
      isAddReply: false,
      isAddReplyArticle: false,
      replyUserInfo: {},
      defaultCover: require("@/assets/images/cover2.jpeg"),
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        content: null,
        isDisplay: null,
        topicId: null,
        userId: null
      },
      queryArticleCommentParams: {
        pageNum: 1,
        pageSize: 10,
        name: null,
        content: null,
        articleTitle: null
      },
      form: {},
      rules: {
        name: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
        content: [{ required: true, message: "内容不能为空", trigger: "blur" }]
      }
    };
  },
  computed: {
    isAdmin() {
      return isBlogSiteAdmin();
    }
  },
  created() {
    if (!getToken()) {
      this.$message.warning("请先登录后再管理留言");
      this.$router.replace({ path: "/user", query: { method: "login", redirect: "/user/comments" } });
      return;
    }
    const tab = this.$route.query.tab;
    if (tab === "article" || tab === "second") this.activeName = "second";
    // 只请求当前 Tab，减少首屏并发
    if (this.activeName === "second") {
      this.getArticleFeedList();
    } else {
      this.getList();
    }
  },
  methods: {
    plainContent(html) {
      if (!html) return "";
      return String(html);
    },
    handleClick(tab) {
      if (tab.paneName === "second") {
        if (!this.articleFeedList.length) this.getArticleFeedList();
      } else if (tab.paneName === "first") {
        if (!this.commentList.length) this.getList();
      }
    },
    getList() {
      this.loading = true;
      this.queryParams.topicId = null;
      listComment(this.queryParams).then((response) => {
        this.commentList = this.handleTree(response.rows || [], "id");
        this.total = response.total || 0;
        this.loading = false;
      }).catch(() => {
        this.loading = false;
      });
    },
    getArticleFeedList() {
      this.articleLoading = true;
      listArticleComment(this.queryArticleCommentParams).then((response) => {
        const rows = response.rows || [];
        this.articleFeedTotal = response.total || 0;
        if (this.isAdmin) {
          this.articleFeedList = rows;
        } else {
          this.articleFeedList = this.groupArticleComments(rows);
        }
        this.articleLoading = false;
      }).catch(() => {
        this.articleLoading = false;
      });
    },
    /** 普通用户：按文章聚合，组内与组间按留言时间倒序 */
    groupArticleComments(rows) {
      const map = {};
      (rows || []).forEach((row) => {
        const key = row.topicId == null ? "unknown" : String(row.topicId);
        if (!map[key]) {
          map[key] = {
            topicId: row.topicId,
            articleTitle: row.articleTitle,
            indexPicture: row.indexPicture,
            comments: [],
            latestTime: row.createTime
          };
        }
        map[key].comments.push(row);
        const t = new Date(row.createTime || 0).getTime();
        const latest = new Date(map[key].latestTime || 0).getTime();
        if (t > latest) {
          map[key].latestTime = row.createTime;
          map[key].articleTitle = row.articleTitle || map[key].articleTitle;
          map[key].indexPicture = row.indexPicture || map[key].indexPicture;
        }
      });
      const groups = Object.keys(map).map((k) => map[k]);
      groups.forEach((g) => {
        g.comments.sort((a, b) => new Date(b.createTime || 0) - new Date(a.createTime || 0));
      });
      groups.sort((a, b) => new Date(b.latestTime || 0) - new Date(a.latestTime || 0));
      return groups;
    },
    goArticleById(topicId) {
      if (!topicId) return;
      const route = this.$router.resolve({ path: "/article/" + topicId });
      window.open(route.href, "_blank");
    },
    /** 跳转网站留言板并定位该条 */
    goSiteComment(row) {
      const id = row && row.id;
      if (!id) return;
      const route = this.$router.resolve({
        path: "/leave-word",
        query: { commentId: String(id) }
      });
      window.open(route.href, "_blank");
    },
    /** 跳转文章页并定位该条评论 */
    goArticleComment(row) {
      const topicId = row && row.topicId;
      const commentId = row && row.id;
      if (!topicId) {
        this.$message.warning("该评论未关联文章 ID，无法跳转");
        return;
      }
      const route = this.$router.resolve({
        path: "/article/" + topicId,
        query: commentId ? { commentId: String(commentId) } : {}
      });
      window.open(route.href, "_blank");
    },
    cancel() {
      this.isAddReply = false;
      this.open = false;
      this.reset();
    },
    cancelArticle() {
      this.isAddReplyArticle = false;
      this.openArticle = false;
      this.reset();
    },
    reset() {
      this.form = {
        id: null,
        replyId: null,
        name: null,
        email: null,
        website: null,
        content: null,
        topicId: null,
        topicType: null,
        createTime: null,
        userId: null,
        isDisplay: 1
      };
      this.resetForm("form");
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    handleArticleCommentQuery() {
      this.queryArticleCommentParams.pageNum = 1;
      this.getArticleFeedList();
    },
    resetArticleCommentQuery() {
      this.resetForm("queryArticleCommentForm");
      this.handleArticleCommentQuery();
    },
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加网站留言";
    },
    handleAddReply(row) {
      this.reset();
      this.replyUserInfo = { ...row };
      this.isAddReply = true;
      this.title = "回复网站留言";
    },
    handleAddArticleReply(row) {
      this.reset();
      this.replyUserInfo = { ...row };
      this.isAddReplyArticle = true;
      this.title = "回复文章留言";
    },
    handleIsDisplayChange(row) {
      const text = row.isDisplay === 1 ? "显示" : "隐藏";
      this.$confirm("确认要" + text + " #" + row.id + " 留言吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => updateComment({ id: row.id, isDisplay: row.isDisplay })).then(() => {
        this.msgSuccess(text + "成功");
      }).catch(() => {
        row.isDisplay = row.isDisplay === 1 ? 0 : 1;
      });
    },
    handleIsDisplayChangeArticle(row) {
      const text = row.isDisplay === 1 ? "显示" : "隐藏";
      this.$confirm('确认要"' + text + '" #' + row.id + " 评论吗?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => updateArticleComment({ id: row.id, isDisplay: row.isDisplay })).then(() => {
        this.msgSuccess(text + "成功");
      }).catch(() => {
        row.isDisplay = row.isDisplay === 1 ? 0 : 1;
      });
    },
    handleUpdate(row) {
      this.reset();
      getComment(row.id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = "修改网站留言";
      });
    },
    handleUpdateArticle(row) {
      this.reset();
      getArticleComment(row.id).then((response) => {
        this.form = response.data;
        this.openArticle = true;
        this.title = "修改文章留言";
      });
    },
    submitForm() {
      if (this.isAddReply === true) {
        this.$refs["form"].validate((valid) => {
          if (!valid) return;
          const replyUsrInfo = this.replyUserInfo;
          this.form.replyId = replyUsrInfo.id;
          this.form.parentId = replyUsrInfo.parentId == 0 ? replyUsrInfo.id : replyUsrInfo.parentId;
          this.form.replyName = replyUsrInfo.name;
          this.form.name = this.$store.getters.nickname || "管理员";
          this.form.email = this.form.email || "";
          this.form.website = "https://" + window.location.host;
          this.form.topicType = replyUsrInfo.topicType;
          this.form.userId = this.$store.state.user.userId;
          this.form.isDisplay = this.form.isDisplay == null ? 1 : this.form.isDisplay;
          addComment(this.form).then(() => {
            this.msgSuccess("回复成功");
            this.isAddReply = false;
            this.getList();
          });
        });
      } else {
        this.$refs["form"].validate((valid) => {
          if (!valid) return;
          if (this.form.id != null) {
            updateComment(this.form).then(() => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addComment(this.form).then(() => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        });
      }
    },
    submitFormArticle() {
      if (this.isAddReplyArticle === true) {
        this.$refs["form"].validate((valid) => {
          if (!valid) return;
          const replyUsrInfo = this.replyUserInfo;
          this.form.replyId = replyUsrInfo.id;
          this.form.parentId = replyUsrInfo.parentId == 0 ? replyUsrInfo.id : replyUsrInfo.parentId;
          this.form.replyName = replyUsrInfo.name;
          this.form.name = this.$store.getters.nickname || "管理员";
          this.form.website = "https://" + window.location.host;
          this.form.topicId = replyUsrInfo.topicId;
          this.form.topicType = replyUsrInfo.topicType;
          this.form.userId = this.$store.state.user.userId;
          this.form.isDisplay = this.form.isDisplay == null ? 1 : this.form.isDisplay;
          addArticleComment(this.form).then(() => {
            this.msgSuccess("回复成功");
            this.isAddReplyArticle = false;
            this.getArticleFeedList();
          });
        });
      } else {
        this.$refs["form"].validate((valid) => {
          if (!valid) return;
          if (this.form.id != null) {
            updateArticleComment(this.form).then(() => {
              this.msgSuccess("修改成功");
              this.openArticle = false;
              this.getArticleFeedList();
            });
          } else {
            addArticleComment(this.form).then(() => {
              this.msgSuccess("新增成功");
              this.openArticle = false;
              this.getArticleFeedList();
            });
          }
        });
      }
    },
    handleDelete(row) {
      const ids = row.id;
      this.$confirm('是否确认删除留言 #' + ids + " ?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => delComment(ids)).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      });
    },
    handleDeleteArticle(row) {
      const ids = row.id;
      this.$confirm('是否确认删除评论 #' + ids + " ?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => delArticleComment(ids)).then(() => {
        this.getArticleFeedList();
        this.msgSuccess("删除成功");
      });
    },
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm("是否确认导出网站留言?", "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => exportComment(queryParams)).then((response) => {
        this.download(response.msg);
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.gp-blog-page__hero {
  margin-bottom: 18px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--theme-color);
}

.gp-blog-page__hero h1 {
  margin: 0 0 8px;
  font-size: 1.6rem;
  color: var(--text-color-2);
}

.lead {
  margin: 0 0 10px;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.55;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.back-link {
  font-size: 13px;
  color: var(--theme-color);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.comment-manage__tabs {
  background: var(--gp-surface-bg, #fff);
  border-radius: 12px;
  padding: 8px 14px 18px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.comment-manage__query {
  margin-bottom: 8px;
}

.feed-empty {
  padding: 48px;
  text-align: center;
  color: var(--text-color-2, #94a3b8);
}

.site-feed,
.xhs-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 120px;
}

.site-card,
.xhs-card {
  border: 1px solid var(--border-color-2, #e8edf3);
  border-radius: 12px;
  background: var(--gp-surface-bg, #fff);
  overflow: hidden;
  box-shadow: 0 1px 2px var(--box-shadow, rgba(15, 23, 42, 0.04));
}

.site-card {
  padding: 14px 16px;
}

.site-card__head,
.xhs-card__user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.site-card__user,
.xhs-card__user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--theme-color, #3b82f6);
  color: var(--text-color-2, #fff);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.meta {
  display: block;
  font-size: 12px;
  color: var(--text-color-2, #94a3b8);
  margin-top: 2px;
}

.site-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
}

.site-card__content,
.xhs-card__content {
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-color, #334155);
  word-break: break-word;
}

.site-card__reply-to,
.xhs-card__reply-to {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-color-2, #64748b);
}

.site-card__children {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--gp-surface-bg, #f8fafc);
}

.site-card__child {
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 8px;
  color: var(--text-color-2, #475569);

  &:last-child {
    margin-bottom: 0;
  }
}

.child-jump {
  margin-left: 8px;
  color: var(--theme-color, #3b82f6);
  font-size: 12px;
}

.xhs-card__article {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: var(--gp-surface-bg, #f8fafc);
  border-bottom: 1px solid var(--border-color-2, #eef2f7);
  text-decoration: none;
  color: inherit;
  transition: background 0.15s ease;

  &:hover {
    background: var(--hover-background, #eef6ff);
  }
}

.xhs-card__cover {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  flex-shrink: 0;
  background: var(--gp-surface-bg, #e2e8f0);
}

.xhs-card__article-meta {
  min-width: 0;
  flex: 1;

  h4 {
    margin: 6px 0 4px;
    font-size: 15px;
    line-height: 1.4;
    color: var(--text-color, #0f172a);
  }

  .hint {
    font-size: 12px;
    color: var(--theme-color, #3b82f6);
  }
}

.xhs-card__body {
  padding: 12px 14px 10px;
}

.xhs-card__comment {
  padding: 10px 0;
  border-top: 1px dashed rgba(15, 23, 42, 0.08);

  &:first-child {
    border-top: 0;
    padding-top: 0;
  }
}

.xhs-card__ops {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.danger {
  color: var(--danger-color, #f56c6c) !important;
}

@media screen and (max-width: 768px) {
  .xhs-card__article {
    flex-direction: column;
  }

  .xhs-card__cover {
    width: 100%;
    height: 120px;
  }
}
</style>
