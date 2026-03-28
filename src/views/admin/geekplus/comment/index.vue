<template>
  <div class="app-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="网站用户留言" name="first">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="回复ID" prop="replyId">
            <el-input v-model="queryParams.replyId" placeholder="请输入回复的评论ID" clearable size="small"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="用户名" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入用户名" clearable size="small"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="queryParams.email" placeholder="请输入邮箱" clearable size="small"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item label="网址" prop="website">
            <el-input v-model="queryParams.website" placeholder="请输入网址" clearable size="small"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <!-- <el-form-item label="评论所属的文章或主题ID" prop="topicId">
            <el-input
              v-model="queryParams.topicId"
              placeholder="请输入评论所属的文章或主题ID"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="评论的主题类型" prop="topicType">
            <el-select v-model="queryParams.topicType" placeholder="请选择评论的主题类型" clearable size="small">
              <el-option label="请选择字典生成" value="" />
            </el-select>
          </el-form-item> -->
          <el-form-item label="是否显示" prop="isDisplay">
            <!-- <el-input v-model="form.workVisible" placeholder="请输入0（展示在简历中）或1（不展示）" :disabled="onlyRead" /> -->
            <el-select
              v-model="queryParams.isDisplay"
              placeholder="请选择是否页面显示"
              :disabled="onlyRead"
            >
              <el-option label="不显示" :value="0" />
              <el-option label="显示" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="用户ID" prop="userId">
            <el-input v-model="queryParams.userId" placeholder="请输入评论的用户ID" clearable size="small"
              @keyup.enter.native="handleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-main>
          <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
              <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
              <!-- <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-plus"
                  @click="handleAddReply"
                  v-hasPermi="['function:comment:add']"
                >回复</el-button> -->
            </el-col>
            <el-col :span="1.5">
              <el-button size="mini" type="primary" icon="el-icon-plus" :disabled="single"
                @click="handleAddReply">回复</el-button>
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
        </el-main>

        <el-table v-loading="loading" :data="commentList" @selection-change="handleSelectionChange" row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="评论表ID" align="center" prop="id" width="120" show-overflow-tooltip />
          <!-- <el-table-column label="回复的评论ID" align="center" prop="replyId" /> -->
          <el-table-column label="评论类别" align="center" prop="parentId" width="100" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-if="scope.row.parentId == '0'" style="color:#8B0000">用户留言</span>
              <span v-else-if="scope.row.parentId != '0' && scope.row.userId == 'sysUser:1'" style="color:#0093b9">博主留言</span>
              <span v-else style="color:#13ce66">用户回复</span>
            </template>
          </el-table-column>
          <el-table-column label="用户名" align="center" prop="name" width="120" show-overflow-tooltip />
          <el-table-column label="回复用户" align="center" prop="replyName" width="120" show-overflow-tooltip />
          <el-table-column label="邮箱" align="center" prop="email" width="130" show-overflow-tooltip />
          <el-table-column label="网址" align="center" prop="website" width="120" show-overflow-tooltip />
          <el-table-column label="评论内容" align="center" min-width="150" show-overflow-tooltip prop="content" />
          <!-- <el-table-column label="评论所属的文章或主题ID" align="center" prop="topicId" /> -->
          <el-table-column label="是否显示" align="center" width="100" show-overflow-tooltip prop="isDisplay">
            <template slot-scope="scope">
              <!-- <span v-if="scope.row.isDisplay == '0'" style="color: #8b0000">待上架</span>
                <span v-if="scope.row.isDisplay == '1'" style="color: #13ce66">展示中</span> -->
              <el-switch v-model="scope.row.isDisplay" :active-value="1" :inactive-value="0"
                @change="handleIsDisplayChange(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <!-- <el-table-column label="点赞数" align="center" prop="likeCount" /> -->
          <!-- <el-table-column label="主题类型" align="center" prop="topicType" /> -->
          <!-- <el-table-column label="评论的用户ID" align="center" prop="userId" /> -->
          <el-table-column label="操作" align="center" fixed="right" width="120" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-plus" @click="handleAddReply(scope.row)">回复</el-button>
              <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
              <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
          @pagination="getList" />

        <!-- 添加或修改用户评论回复留言对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="770px" append-to-body>
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="评论ID" prop="replyId">
              <span v-if="form.replyId == 0">用户留言</span>
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
            <el-form-item label="留言评论内容" prop="content">
              <quill-editor v-model="form.content" :min-height="192" />
            </el-form-item>
            <el-form-item label="评论所属的文章或主题ID" prop="topicId">
              <el-input v-model="form.topicId" placeholder="请输入评论所属的文章或主题ID" />
            </el-form-item>
            <el-form-item label="是否显示" prop="isDisplay">
              <!-- <el-input v-model="form.workVisible" placeholder="请输入0（展示在简历中）或1（不展示）" :disabled="onlyRead" /> -->
              <el-select
                v-model="form.isDisplay"
                placeholder="请选择是否页面显示"
                :disabled="onlyRead"
              >
                <el-option label="不显示" :value="0" />
                <el-option label="显示" :value="1" />
              </el-select>
            </el-form-item>
            <!-- <el-form-item label="评论的主题类型" prop="topicType">
              <el-select v-model="form.topicType" placeholder="请选择评论的主题类型">
                <el-option label="请选择字典生成" value="" />
              </el-select>
            </el-form-item> -->
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="form.userId" placeholder="请输入用户ID" />
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>
        <!-- 回复留言对话框 -->
        <el-dialog :title="title" :visible.sync="isAddReply" width="500px" append-to-body>
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <!-- <el-form-item label="回复的评论ID" prop="replyId">
              <el-input v-model="form.replyId" placeholder="请输入回复的评论ID" />
            </el-form-item>
            <el-form-item label="用户名" prop="name">
              <el-input v-model="form.name" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="网址" prop="website">
              <el-input v-model="form.website" placeholder="请输入网址" />
            </el-form-item> -->
            <el-form-item label="留言评论内容" prop="content">
              <quill-editor v-model="form.content" :min-height="192" />
            </el-form-item>
            <!-- <el-form-item label="评论所属的文章或主题ID" prop="topicId">
              <el-input v-model="form.topicId" placeholder="请输入评论所属的文章或主题ID" />
            </el-form-item>
            <el-form-item label="评论的主题类型" prop="topicType">
              <el-select v-model="form.topicType" placeholder="请选择评论的主题类型">
                <el-option label="请选择字典生成" value="" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="form.userId" placeholder="请输入用户ID" />
            </el-form-item> -->
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>
      </el-tab-pane>
      <!--********************************文章用户留言**************************************-->
      <!--*****************************el-tab-pane切换**************************************-->
      <el-tab-pane label="文章用户留言" name="second">
        <el-form :model="queryArticleParams" ref="queryForm" :inline="true" v-show="showArticleSearch"
          label-width="68px">
          <el-form-item label="作者/用户" label-width="120" prop="authorName">
            <el-input v-model="queryArticleParams.authorName" placeholder="请输入作者名称/用户名" clearable size="small"
              @keyup.enter.native="handleArticleQuery" />
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
            <el-input v-model="queryArticleParams.articleTitle" placeholder="请输入文章标题" clearable size="small"
              @keyup.enter.native="handleArticleQuery" />
          </el-form-item>
          <el-form-item label="所属分类" prop="articleCategory">
            <!-- <el-input
              v-model="queryParams.articleCategory"
              placeholder="请输入文章类型"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            /> -->
            <el-select v-model="queryArticleParams.articleCategory" placeholder="请选择" clearable
              @keyup.enter.native="handleArticleQuery">
              <!-- <el-option-group
                  v-for="group in listCategory"
                  :key="group.categoryName"
                  :label="group.categoryName">
                </el-option-group> -->
              <el-option v-for="(item, index) in listCategory" :key="index" :label="item.categoryName" :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="点赞数" prop="likeCount">
            <el-input v-model="queryArticleParams.likeCount" placeholder="请输入文章点赞数量" clearable size="small"
              @keyup.enter.native="handleArticleQuery" />
          </el-form-item>
          <el-form-item label="浏览量" prop="viewCount">
            <el-input v-model="queryArticleParams.viewCount" placeholder="请输入文章浏览数量" clearable size="small"
              @keyup.enter.native="handleArticleQuery" />
          </el-form-item>
          <el-form-item>
            <el-button type="cyan" icon="el-icon-search" size="mini" @click="handleArticleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetArticleQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-table v-loading="articleLoading" :data="articlesList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" fixed align="center" />
          <el-table-column label="文章表ID" width="90" show-overflow-tooltip align="center" prop="id" />
          <el-table-column label="作者/用户" width="90" show-overflow-tooltip align="center" prop="authorName" />
          <el-table-column label="作者ID" width="90" align="center" prop="authorId" />
          <el-table-column label="文章标题" min-width="150" show-overflow-tooltip align="center" prop="articleTitle" />
          <!-- <el-table-column label="文章内容" align="center" width="130" show-overflow-tooltip prop="articleContent" /> -->
          <el-table-column label="内容摘要" align="center" width="150" show-overflow-tooltip prop="abstractText">
            <template slot-scope="scope">
              <span v-if="scope.row.abstractText != ''">{{
                scope.row.abstractText
              }}</span>
              <el-image v-else style="width: auto; height: 10px" lazy="true" :src="scope.row.indexPicture"
                :preview-src-list="[scope.row.indexPicture]">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column label="文章类型" align="center" width="100" show-overflow-tooltip prop="articleCategory">
            <template slot-scope="scope">
              <span v-for="item in listCategory" :key="item.id" style="color: #5e2bd3">
                <i v-if="scope.row.articleCategory == item.id">{{
                  item.categoryName
                }}</i>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="页面显示" align="center" width="100" show-overflow-tooltip prop="isDisplay">
            <template slot-scope="scope">
              <span v-if="scope.row.isDisplay == '0'" style="color: #8b0000">不显示</span>
              <span v-if="scope.row.isDisplay == '1'" style="color: #13ce66">显示</span>
            </template>
          </el-table-column>
          <el-table-column label="点赞数量" width="100" show-overflow-tooltip align="center" prop="likeCount" />
          <el-table-column label="浏览数量" width="100" show-overflow-tooltip align="center" prop="viewCount" />
          <el-table-column label="操作" align="center" fixed="right" width="135" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button size="mini" type="text" icon="el-icon-view"
                @click="handleQueryArticleComments(scope.row)">查看留言</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="articlesTotal > 0" :total="articlesTotal" :page.sync="queryArticleParams.pageNum"
          :limit.sync="queryArticleParams.pageSize" @pagination="getListArticle" />

        <!-- 添加或修改文章评论留言对话框 -->
        <el-dialog :title="title" :visible.sync="userArticleCommentOpen" width="900px" append-to-body>
          <el-table v-loading="loading" :data="articleCommentList" @selection-change="handleSelectionChange"
            row-key="id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column label="评论表ID" align="center" prop="id"  width="100" show-overflow-tooltip />
            <!-- <el-table-column label="回复的评论ID" align="center" prop="replyId" /> -->
            <el-table-column label="评论类别" align="center" prop="parentId" width="120" show-overflow-tooltip>
              <template slot-scope="scope">
                <span v-if="scope.row.parentId == '0'" style="color:#8B0000">用户留言</span>
                <span v-else-if="scope.row.parentId != '0' && scope.row.userId == 'sysUser:1'"
                  style="color:#0093b9">博主留言</span>
                <span v-else style="color:#13ce66">用户回复</span>
              </template>
            </el-table-column>
            <el-table-column label="用户名" align="center" prop="name" width="110" show-overflow-tooltip />
            <el-table-column label="回复用户" align="center" prop="replyName" width="110" show-overflow-tooltip />
            <el-table-column label="邮箱" align="center" prop="email" width="120" show-overflow-tooltip />
            <el-table-column label="网址" align="center" prop="website" width="120" show-overflow-tooltip />
            <el-table-column label="评论内容" align="center" show-overflow-tooltip prop="content" />
            <!-- <el-table-column label="评论所属的文章或主题ID" align="center" prop="topicId" /> -->
            <el-table-column label="是否显示" align="center" width="100" show-overflow-tooltip prop="isDisplay">
              <template slot-scope="scope">
                <!-- <span v-if="scope.row.isDisplay == '0'" style="color: #8b0000">待上架</span>
                <span v-if="scope.row.isDisplay == '1'" style="color: #13ce66">展示中</span> -->
                <el-switch v-model="scope.row.isDisplay" :active-value="1" :inactive-value="0"
                  @change="handleIsDisplayChangeArticle(scope.row)"></el-switch>
              </template>
            </el-table-column>
            <!-- <el-table-column label="点赞数" align="center" prop="likeCount" /> -->
            <!-- <el-table-column label="主题类型" align="center" prop="topicType" /> -->
            <!-- <el-table-column label="评论的用户ID" align="center" prop="userId" /> -->
            <el-table-column label="操作" align="center" fixed="right" width="120" class-name="small-padding fixed-width">
              <template slot-scope="scope">
                <el-button size="mini" type="text" icon="el-icon-plus"
                  @click="handleAddArticleReply(scope.row)">回复</el-button>
                <el-button size="mini" type="text" icon="el-icon-edit"
                  @click="handleUpdateArticle(scope.row)">修改</el-button>
                <el-button size="mini" type="text" icon="el-icon-delete"
                  @click="handleDeleteArticle(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <pagination v-show="articleCommentTotal > 0" :total="articleCommentTotal" :page.sync="queryParams.pageNum"
            :limit.sync="queryParams.pageSize" @pagination="getArticleCommentList" />
        </el-dialog>

        <!-- 添加或修改用户文章评论回复留言对话框 -->
        <el-dialog :title="title" :visible.sync="openArticle" width="770px" append-to-body>
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="评论ID" prop="replyId">
              <span v-if="form.replyId == 0">用户留言</span>
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
            <el-form-item label="留言评论" prop="content">
              <quill-editor v-model="form.content" :min-height="192" />
            </el-form-item>
            <!-- <el-form-item label="文章或主题ID" prop="topicId">
              <el-input v-model="form.topicId" placeholder="请输入评论所属的文章或主题ID" />
            </el-form-item> -->
            <!-- <el-form-item label="评论的主题类型" prop="topicType">
              <el-select v-model="form.topicType" placeholder="请选择评论的主题类型">
                <el-option label="请选择字典生成" value="" />
              </el-select>
            </el-form-item> -->
            <!-- <el-form-item label="用户ID" prop="userId">
              <el-input v-model="form.userId" placeholder="请输入用户ID" />
            </el-form-item> -->
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitFormArticle">确 定</el-button>
            <el-button @click="cancelArticle">取 消</el-button>
          </div>
        </el-dialog>

        <!-- 文章回复留言对话框 -->
        <el-dialog :title="title" :visible.sync="isAddReplyArticle" width="500px" append-to-body>
          <el-form ref="form" :model="form" :rules="rules" label-width="80px">
            <!-- <el-form-item label="回复的评论ID" prop="replyId">
              <el-input v-model="form.replyId" placeholder="请输入回复的评论ID" />
            </el-form-item>
            <el-form-item label="用户名" prop="name">
              <el-input v-model="form.name" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
            <el-form-item label="网址" prop="website">
              <el-input v-model="form.website" placeholder="请输入网址" />
            </el-form-item> -->
            <el-form-item label="留言评论" prop="content">
              <quill-editor v-model="form.content" :min-height="192" />
            </el-form-item>
            <!-- <el-form-item label="评论所属的文章或主题ID" prop="topicId">
              <el-input v-model="form.topicId" placeholder="请输入评论所属的文章或主题ID" />
            </el-form-item>
            <el-form-item label="评论的主题类型" prop="topicType">
              <el-select v-model="form.topicType" placeholder="请选择评论的主题类型">
                <el-option label="请选择字典生成" value="" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="form.userId" placeholder="请输入用户ID" />
            </el-form-item> -->
            <el-form-item label="是否显示" prop="isDisplay">
              <!-- <el-input v-model="form.workVisible" placeholder="请输入0（展示在简历中）或1（不展示）" :disabled="onlyRead" /> -->
              <el-select
                v-model="form.isDisplay"
                placeholder="是否显示评论"
                :disabled="onlyRead"
              >
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
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {
  listComment, getComment, delComment, addComment, updateComment, exportComment,
  listArticleComment, getArticleComment, delArticleComment, addArticleComment, updateArticleComment, exportArticleComment
} from "@/api/geekplus/comment";
import { listArticles } from "@/api/geekplus/articles"
import { listSubParentCategory, listSubCategory, } from "@/api/geekplus/category";

export default {
  name: "Comment",
  components: {
  },
  data() {
    return {
      activeName: 'first',
      // 遮罩层
      loading: true,
      articleLoading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 显示文章搜索条件
      showArticleSearch: true,
      // 总条数
      total: 0,
      //单个文章留言数
      articleCommentTotal: 0,
      // 用户评论回复留言表格数据
      commentList: [],
      // 单个文章用户评论回复留言表格数据
      articleCommentList: [],
      onlyRead: false,//只读
      // 总条数
      articlesTotal: 0,
      articlesList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      openArticle: false,
      // 显示用户评论弹出层
      userArticleCommentOpen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        replyId: null,
        name: null,
        email: null,
        website: null,
        content: null,
        topicId: null,
        topicType: null,
        userId: null
      },
      // 文章查询参数
      queryArticleParams: {
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
        name: [
          { required: true, message: "用户名不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "内容不能为空", trigger: "blur" }
        ],
      },
      isAddReply: false,//默认显示添加的表单
      isAddReplyArticle: false,//默认显示添加的表单
      replyUserInfo: {},
      listCategory: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    handleClick(tab, event) {
      // console.log(tab, event);
      if (tab.paneName == 'second') {
        //console.log("second");
        this.getListCategory();
        this.getListArticle();
      } else {
        //this.getList();
        this.loading = false;
      }
    },
    /** 查询所有文章列表 */
    getListArticle() {
      this.articleLoading = true;
      listArticles(this.queryArticleParams).then((response) => {
        this.articlesList = response.rows;
        this.articlesTotal = response.total;
        this.articleLoading = false;
      });
    },
    /** 查询网站给我留言用户评论回复留言列表 */
    getList() {
      this.loading = true;
      //this.queryParams.topicId=null或者this.queryParams.topicId=0，都是可以查询网站用户留言
      //每次查询前为null
      this.queryParams.topicId=null;
      listComment(this.queryParams).then(response => {
        this.commentList = this.handleTree(response.rows, "id");
        this.total = response.total;
        this.loading = false;
      });
    },
    countParentId(list) {
      list.filter(item => {
        return item.parentId === 0
      })
    },
    // 取消按钮
    cancel() {
      //显示被回复评论隐藏的表单
      this.isAddReply = false;
      this.open = false;
      this.reset();
    },
    // 取消按钮
    cancelArticle() {
      //显示被回复评论隐藏的表单
      this.isAddReplyArticle = false;
      this.openArticle = false;
      this.reset();
    },
    // 表单重置
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
        userId: null
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
    //文章查询
    /** 搜索按钮操作 */
    handleArticleQuery() {
      this.queryArticleParams.pageNum = 1;
      this.getListArticle();
    },
    /** 重置按钮操作 */
    resetArticleQuery() {
      this.resetForm("queryArticleForm");
      this.handleArticleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加用户评论回复留言";
    },
    //调用回复评论的对话框，网站给我留言模块
    handleAddReply(row) {
      this.reset();
      const id = row.id || this.ids
      getComment(id).then(response => {
        this.replyUserInfo = response.data;
        //隐藏回复评论的表单
        this.isAddReply = true;
        this.title = "回复用户留言评论";
      });
    },
    //调用回复文章评论的对话框，文章留言评论模块
    handleAddArticleReply(row) {
      this.reset();
      const id = row.id || this.ids
      this.isAddReplyArticle = true;
      this.title = "回复用户文章留言评论";
      getArticleComment(id).then(response => {
        this.replyUserInfo = response.data;
        //隐藏回复评论的表单
        this.isAddReplyArticle = true;
        this.title = "回复用户文章留言评论";
      });
    },
    // 留言评论审核显示状态，网站给我留言页面
    handleIsDisplayChange(row) {
      var text = row.isDisplay === 1 ? "显示" : "隐藏";
      this.$confirm("确认要" + text + row.id + "号留言/评论吗?", "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          const dataParam = {id: row.id, isDisplay: row.isDisplay}
          return updateComment(dataParam);
        }).then(() => {
          this.msgSuccess(text + "成功");
        }).catch(function() {
          row.isDisplay = row.isDisplay === 1 ? 0 : 1;
      });
    },
    // 留言评论审核显示状态，文章留言评论页面
    handleIsDisplayChangeArticle(row) {
      var text = row.isDisplay === 1 ? "显示" : "隐藏";
      this.$confirm('确认要"' + text + row.id + '"留言/评论吗?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          const dataParam = {id: row.id, isDisplay: row.isDisplay}
          return updateArticleComment(dataParam);
        }).then(() => {
          this.msgSuccess(text + "成功");
        }).catch(function() {
          row.isDisplay = row.isDisplay === 1 ? 0 : 1;
      });
    },
    /** 修改网站给我留言页面按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getComment(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改用户评论回复留言";
      });
    },
    /** 修改文章评论按钮操作 */
    handleUpdateArticle(row) {
      this.reset();
      const id = row.id || this.ids
      getArticleComment(id).then(response => {
        this.form = response.data;
        this.openArticle = true;
        this.title = "修改用户文章评论回复留言";
      });
    },
    /** 提交按钮，网站给我留言页面 */
    submitForm() {
      if (this.isAddReply === true) {
        this.$refs["form"].validate(valid => {
          if (valid) {
            let replyUsrInfo = this.replyUserInfo;
            //console.log(replyUsrInfo)
            this.form.replyId = replyUsrInfo.id;
            this.form.parentId = (replyUsrInfo.parentId == 0 ? replyUsrInfo.id : replyUsrInfo.parentId);
            this.form.replyName = replyUsrInfo.name;
            this.form.name = "普拉斯";
            this.form.email = "geekgarry@hotmail.com";
            this.form.website = "https://"+window.location.host;
            // this.form.topicId = replyUsrInfo.topicId;//网站中给我留言，这里就没有文章主题ID
            this.form.topicType = replyUsrInfo.topicType;
            this.form.userId = this.$store.state.user.userId
            addComment(this.form).then(response => {
              this.msgSuccess("回复成功");
              this.isAddReply = false;
              this.getList();
            });
          }
        });
      } else {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != null) {
              updateComment(this.form).then(response => {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              });
            } else {
              addComment(this.form).then(response => {
                this.msgSuccess("新增留言评论");
                this.open = false;
                this.getList();
              });
            }
          }
        });
      }
    },
    /** 提交按钮，文章底部留言评论 */
    submitFormArticle() {
      if (this.isAddReplyArticle === true) {
        this.$refs["form"].validate(valid => {
          if (valid) {
            let replyUsrInfo = this.replyUserInfo;
            //console.log(replyUsrInfo)
            this.form.replyId = replyUsrInfo.id;
            this.form.parentId = (replyUsrInfo.parentId == 0 ? replyUsrInfo.id : replyUsrInfo.parentId);
            this.form.replyName = replyUsrInfo.name;
            this.form.name = "普拉斯";
            this.form.email = "geekgarry@hotmail.com";
            this.form.website = "https://"+window.location.host;
            this.form.topicId = replyUsrInfo.topicId;
            this.form.topicType = replyUsrInfo.topicType;
            this.form.userId = this.$store.state.user.userId
            addArticleComment(this.form).then(response => {
              this.msgSuccess("回复成功");
              this.isAddReplyArticle = false;
              this.getArticleCommentList();
            });
          }
        });
      } else {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != null) {
              updateArticleComment(this.form).then(response => {
                this.msgSuccess("修改成功");
                this.openArticle = false;
                this.getArticleCommentList();
              });
            } else {
              addArticleComment(this.form).then(response => {
                this.msgSuccess("新增留言评论");
                this.openArticle = false;
                this.getArticleCommentList();
              });
            }
          }
        });
      }
    },
    /** 删除按钮操作，网站给我留言页面 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除用户评论回复留言编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delComment(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 删除文章评论按钮操作，文章底部留言评论 */
    handleDeleteArticle(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除用户评论回复留言编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delArticleComment(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有用户评论回复留言数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportComment(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    //获取文章分类目录
    getListCategory() {
      listSubCategory()
        .then((response) => {
          this.listCategory = response.data;
        })
        .catch((error) => {
          this.msgError(error.msg);
        });
    },
    /* 打开查询文章所有留言评论弹出窗口 */
    handleQueryArticleComments(rowInfo) {
      this.userArticleCommentOpen = true;
      this.title = "文章留言 - " + rowInfo.articleTitle;
      this.queryParams.topicId = rowInfo.id;
      if (rowInfo.id == null || rowInfo.id == '') {
        this.queryParams.topicId = null;
      }
      this.getArticleCommentList();
    },
    /* 查询文章的留言评论列表 */
    getArticleCommentList() {
      this.loading = true;
      listArticleComment(this.queryParams).then(response => {
        this.articleCommentList = this.handleTree(response.rows, "id");
        this.articleCommentTotal = response.total;
        this.loading = false;
      });
    }
  }
};
</script>
