<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="queryParams.nickName" placeholder="请输入昵称" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="真实姓名" prop="realName">
        <el-input v-model="queryParams.realName" placeholder="请输入真实姓名" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-input v-model="queryParams.gender" placeholder="请输入性别" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="联系电话" prop="contactPhone">
        <el-input v-model="queryParams.contactPhone" placeholder="请输入联系电话" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="邮箱" prop="contactEmail">
        <el-input v-model="queryParams.contactEmail" placeholder="请输入邮箱" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="求职意向" prop="jobIntention">
        <el-input v-model="queryParams.jobIntention" placeholder="请输入求职意向" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="大学名称" prop="universityName">
        <el-input v-model="queryParams.universityName" placeholder="请输入大学名称" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="学习专业" prop="unSpecializedSubject">
        <el-input v-model="queryParams.unSpecializedSubject" placeholder="请输入学习专业" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="掌握语言" prop="masterLanguage">
        <el-input v-model="queryParams.masterLanguage" placeholder="请输入掌握语言" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="办公技能" prop="officeSkill">
        <el-input v-model="queryParams.officeSkill" placeholder="请输入办公技能" clearable size="small"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="学历" prop="education">
        <el-select placeholder="请选择学历" v-model="queryParams.education">
          <el-option label="初中" value="初中"></el-option>
          <el-option label="高中" value="高中"></el-option>
          <el-option label="本科" value="本科"></el-option>
          <el-option label="硕士" value="硕士"></el-option>
          <el-option label="博士" value="博士"></el-option>
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

    <el-table v-loading="resumeListLoading" :data="resumeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="70" align="center" />
      <!--      <el-table-column label="民族" align="center" prop="id" />-->
      <el-table-column label="昵称" align="center" width="120" prop="nickName" />
      <el-table-column label="真实姓名" align="center" width="130" prop="realName" />
      <el-table-column label="性别" align="center" width="60" prop="gender">
        <template slot-scope="scope">
          <span v-if="scope.row.gender == '0'">女</span>
          <span v-if="scope.row.gender == '1'">男</span>
          <span v-if="scope.row.gender == null || scope.row.gender == ''">未知</span>
        </template>
      </el-table-column>
      <el-table-column label="个人简介" align="center" prop="personalIntroduce" :show-overflow-tooltip="true" />
      <el-table-column label="居住地址" align="center" prop="liveAddressNow" :show-overflow-tooltip="true" />
      <el-table-column label="生日" align="center" prop="birthDay" width="150">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.birthDay, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" align="center" prop="contactPhone" :show-overflow-tooltip="true" />
      <el-table-column label="邮箱" align="center" prop="contactEmail" :show-overflow-tooltip="true" />
      <el-table-column label="求职意向" align="center" prop="jobIntention" :show-overflow-tooltip="true" />
      <el-table-column label="头像" align="center" prop="headPic" show-overflow-tooltip />
      <el-table-column label="大学名称" align="center" prop="universityName" width="222" />
      <el-table-column label="教育时间" align="center" prop="universityStudyTime" width="200" />
      <el-table-column label="大学所学专业" align="center" prop="unSpecializedSubject" width="155"
        :show-overflow-tooltip="true" />
      <el-table-column label="大学主要学习课程" align="center" prop="unMainCoursesStudy" :show-overflow-tooltip="true" />
      <el-table-column label="自我评价" align="center" prop="selfEvaluation" :show-overflow-tooltip="true" />
      <el-table-column label="掌握语言" align="center" prop="masterLanguage" width="100" />
      <el-table-column label="专业技能" align="center" prop="professionSkill" :show-overflow-tooltip="true" />
      <el-table-column label="办公技能" align="center" prop="officeSkill" :show-overflow-tooltip="true" />
      <el-table-column label="学历" align="center" prop="education" width="101" :show-overflow-tooltip="true" />
      <el-table-column label="民族" align="center" prop="nation" width="101" />
      <el-table-column label="身高" align="center" prop="height" width="122">
        <template slot-scope="scope">
          <span>{{ scope.row.height }}(公分)</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="160" fixed="right">
        <template slot-scope="scope">
          <el-button circle type="primary" icon="el-icon-view" @click="viewResumeDetail(scope.row)"></el-button>
          <el-button circle type="info" icon="el-icon-edit" @click="handleUpdate(scope.row)"></el-button>
          <el-button circle type="danger" icon="el-icon-delete" @click="handleDelete(scope.row)"></el-button>
          <el-button type="success" icon="el-icon-check" @click="listWork(scope.row)">工作经验</el-button>
          <el-button type="success" icon="el-icon-check" @click="listProject(scope.row)">项目经验</el-button>
          <el-button type="success" icon="el-icon-check" @click="listTechnology(scope.row)">技术技能</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改简历信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.gender" placeholder="请选择性别">
            <el-option label="男" value="1"></el-option>
            <el-option label="女" value="0"></el-option>
            <el-option label="未知" value=""></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="个人简介" prop="personalIntroduce">
          <el-input type="textarea" v-model="form.personalIntroduce" placeholder="请输入个人简介" />
        </el-form-item>
        <el-form-item label="居住地址" prop="liveAddressNow">
          <el-input v-model="form.liveAddressNow" placeholder="请输入居住地址" />
        </el-form-item>
        <el-form-item label="生日" prop="birthDay">
          <el-date-picker clearable size="small" style="width: 200px" v-model="form.birthDay" type="date"
            value-format="yyyy-MM-dd" placeholder="选择生日">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input type="number" v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="contactEmail">
          <el-input v-model="form.contactEmail" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="求职意向" prop="jobIntention">
          <el-input v-model="form.jobIntention" placeholder="请输入求职意向" />
        </el-form-item>
        <el-form-item label="头像" prop="headPic">
          <el-input v-model="form.headPic" style="display: none;" placeholder="请输入头像" />
          <el-upload accept=".jpg,.jpeg,.png,.gif,.bmp,.JPG,.JPEG,.PNG,.GIF,.BMP" :headers="upload.headers"
            :action="upload.url" :before-upload="beforeUpload" :on-success="handleFileSuccess"
            :on-error="handleFileError" :show-file-list="false" :multiple="false">
            <img v-if="form.headPic" :src="form.headPic" class="avatar">
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
        <el-form-item label="大学名称" prop="universityName">
          <el-input v-model="form.universityName" placeholder="请输入大学名称" />
        </el-form-item>
        <el-form-item label="学习时间" prop="universityStudyTime">
          <!--          <el-input v-model="form.universityStudyTime" placeholder="请输入大学期间" />-->
          <el-date-picker v-model="form.universityStudyTime" type="daterange" value-format='yyyy-MM-dd'
            :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
            align="right">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="学习专业" prop="unSpecializedSubject">
          <el-input type="text" v-model="form.unSpecializedSubject" placeholder="请输入大学所学专业" />
        </el-form-item>
        <el-form-item label="学习课程" prop="unMainCoursesStudy">
          <el-input type="textarea" v-model="form.unMainCoursesStudy" placeholder="请输入大学主要学习课程" />
        </el-form-item>
        <el-form-item label="自我评价" prop="selfEvaluation">
          <el-input type="textarea" v-model="form.selfEvaluation" placeholder="请输入自我评价" />
        </el-form-item>
        <el-form-item label="掌握语言" prop="masterLanguage">
          <el-input v-model="form.masterLanguage" placeholder="请输入掌握语言" />
        </el-form-item>
        <el-form-item label="专业技能" prop="professionSkill">
          <el-input v-model="form.professionSkill" placeholder="请输入专业技能" />
        </el-form-item>
        <el-form-item label="办公技能" prop="officeSkill">
          <el-input v-model="form.officeSkill" placeholder="请输入办公技能" />
        </el-form-item>
        <el-form-item label="学历" prop="education">
          <el-input v-model="form.education" placeholder="请输入学历" />
        </el-form-item>
        <el-form-item label="民族" prop="nation">
          <el-select v-model="form.nation" placeholder="请选择民族">
            <el-option v-for="mz in nations" :key="mz.id" :label="mz.name" :value="mz.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="身高" prop="height">
          <el-input v-model="form.height" placeholder="请输入身高（公分）" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <!--技术技能list-->
    <el-dialog :title="title" :visible.sync="techlistopen" width="600px" append-to-body>
      <el-button-group>
        <el-button type="primary" icon="el-icon-plus" @click="handleTechAdd()">添加技术技能</el-button>
      </el-button-group>
      <el-divider></el-divider>
      <el-table v-loading="loading" :data="technologyList" @selection-change="handleSelectionChange">
        <!--        <el-table-column type="selection" width="55" align="center" />-->
        <!--        <el-table-column label="关联的简历表id" align="center" prop="id" />-->
        <el-table-column label="掌握的技术" align="center" prop="technologyName" />
        <el-table-column label="掌握情况" align="center" prop="technologyScore" />
        <!--        <el-table-column label="关联的简历表id" align="center" prop="resumeId" />-->
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="200">
          <template slot-scope="scope">
            <el-button size="small" type="info" icon="el-icon-edit" @click="handleTechUpdate(scope.row)">修改</el-button>
            <el-button size="small" type="danger" icon="el-icon-delete"
              @click="handleTechDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="totalTech" :page.sync="queryParamsTech.pageNum"
        :limit.sync="queryParamsTech.pageSize" @pagination="getTechList(queryParamsTech.resumeId)" />
    </el-dialog>
    <!-- 添加或修改技术技能对话框 -->
    <el-dialog :title="title" :visible.sync="techopen" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="掌握技术" prop="technologyName">
          <el-input v-model="form.technologyName" placeholder="请输入掌握技术" />
        </el-form-item>
        <el-form-item label="掌握情况" prop="technologyScore">
          <el-input-number v-model="form.technologyScore" :min="1" :max="100" label="技术掌握情况，0-100"></el-input-number>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitTechForm">确 定</el-button>
        <el-button @click="techcancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--项目经验的列表-->
    <el-dialog :title="title" :visible.sync="projectlistopen" width="777px" append-to-body>
      <el-button-group><el-button icon="el-icon-plus" type="primary"
          @click="handleProjectAdd">添加</el-button></el-button-group>
      <el-divider></el-divider>
      <el-table v-loading="loading" :data="projectExperienceList" @selection-change="handleSelectionChange">
        <!--        <el-table-column type="selection" width="55" align="center" />-->
        <!--        <el-table-column label="id" align="center" prop="id" />-->
        <el-table-column label="项目名称" align="center" prop="projectName" width="111" :show-overflow-tooltip="true" />
        <el-table-column label="项目时间" align="center" prop="projectTime" width="181" :show-overflow-tooltip="true" />
        <el-table-column label="项目内容" align="center" prop="projectContent" width="222" :show-overflow-tooltip="true" />
        <el-table-column label="使用技术" align="center" prop="usingTechnology" width="121" :show-overflow-tooltip="true" />
        <el-table-column label="经验展示" align="center" width="100" show-overflow-tooltip prop="isDisplay">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.isDisplay" :active-value="1" :inactive-value="0"
              @change="projectIsDisplayChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <!--        <el-table-column label="关联的简历表id" align="center" prop="resumeId" />-->
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="170">
          <template slot-scope="scope">
            <el-button size="small" type="primary" icon="el-icon-view" @click="handleProjectView(scope.row)"
              circle></el-button>
            <el-button size="small" type="info" icon="el-icon-edit" @click="handleProjectUpdate(scope.row)"
              circle></el-button>
            <el-button size="small" type="danger" icon="el-icon-delete" @click="handleProjectDelete(scope.row)"
              circle></el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="totalProj" :page.sync="queryParamsProj.pageNum"
        :limit.sync="queryParamsProj.pageSize" @pagination="getProjectList(queryParamsProj.resumeId)" />
    </el-dialog>
    <!-- 添加或修改项目经验对话框 -->
    <el-dialog :title="title" :visible.sync="projectopen" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="项目时间" prop="projectTime">
          <el-date-picker :disabled="onlyread" v-model="form.projectTime" type="daterange" value-format='yyyy-MM-dd'
            :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
            align="right">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="form.projectName" placeholder="请输入项目名称" :disabled="onlyread" />
        </el-form-item>
        <el-form-item label="使用技术" prop="usingTechnology">
          <el-input v-model="form.usingTechnology" placeholder="请输入使用技术" :disabled="onlyread" />
        </el-form-item>
        <el-form-item label="项目内容" prop="projectContent">
          <el-input type="textarea" v-model="form.projectContent" placeholder="请输入项目内容简介" :disabled="onlyread" />
        </el-form-item>
        <el-form-item label="优先级" prop="priorityId">
          <el-input v-model="form.priorityId" placeholder="请输入优先级顺序(1-10000)" :disabled="onlyread" />
        </el-form-item>
        <el-form-item label="是否展示">
          <el-select v-model="form.isDisplay" placeholder="请选择是否展示这个项目" :disabled="onlyread">
            <el-option label="不展示" :value='0' />
            <el-option label="展示" :value='1' />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="!onlyread" type="primary" @click="submitProjectForm">确 定</el-button>
        <el-button @click="projectcancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--工作经验的列表-->
    <el-dialog :title="title" :visible.sync="worklistopen" width="770px" append-to-body>
      <el-button-group><el-button type="primary" icon="el-icon-plus"
          @click="handleWorkAdd">添加</el-button></el-button-group>
      <el-divider></el-divider>
      <el-table v-loading="loading" :data="workExperienceList" @selection-change="handleSelectionChange">
        <!--        <el-table-column type="selection" width="55" align="center" />-->
        <!--        <el-table-column label="id" align="center" prop="id" />-->
        <el-table-column label="工作时间" align="center" prop="workTime" width="200">
          <template slot-scope="scope">
            <span>{{ scope.row.workTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="公司" align="center" prop="workCompany" width="150" :show-overflow-tooltip="true" />
        <el-table-column label="工作职位" align="center" prop="workPosition" :show-overflow-tooltip="true" />
        <el-table-column label="工作内容简介" align="center" prop="workIntroduce" :show-overflow-tooltip="true" />
        <el-table-column label="工作显示" align="center" width="100" show-overflow-tooltip prop="workVisible">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.workVisible" :active-value="1" :inactive-value="0"
              @change="workIsDisplayChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="工作类型" align="center" prop="workType" width="80">
          <template slot-scope="scope">
            <span v-if="scope.row.workType === 0" style="color:#13ce66">实习</span>
            <span v-if="scope.row.workType === 1" style="color:#13ce66">工作</span>
          </template>
        </el-table-column>
        <!--        <el-table-column label="关联的简历表id" align="center" prop="resumeId" />-->
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" min-width="140" fixed="right">
          <template slot-scope="scope">
            <el-button size="small" type="primary" icon="el-icon-view" @click="handleWorkView(scope.row)"
              circle></el-button>
            <el-button size="small" type="info" icon="el-icon-edit" @click="handleWorkUpdate(scope.row)"
              circle></el-button>
            <el-button size="small" type="danger" icon="el-icon-delete" @click="handleWorkDelete(scope.row)"
              circle></el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total > 0" :total="totalWork" :page.sync="queryParamsWork.pageNum"
        :limit.sync="queryParamsWork.pageSize" @pagination="getWorkList(queryParamsWork.resumeId)" />
    </el-dialog>
    <!-- 添加或修改工作经验对话框 -->
    <el-dialog :title="title" :visible.sync="workopen" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="工作时间" prop="workTime">
          <el-date-picker :disabled="onlyread" v-model="form.workTime" type="daterange" value-format='yyyy-MM-dd'
            :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
            align="right">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="公司" prop="workCompany">
          <el-input v-model="form.workCompany" placeholder="请输入公司" :disabled="onlyread" />
        </el-form-item>
        <el-form-item label="工作职位" prop="workPosition">
          <el-input v-model="form.workPosition" placeholder="请输入工作职位" :disabled="onlyread" />
        </el-form-item>
        <el-form-item label="工作内容简介" prop="workIntroduce">
          <el-input type="textarea" :rows="3" v-model="form.workIntroduce" placeholder="请输入工作内容简介"
            :disabled="onlyread" />
        </el-form-item>
        <el-form-item label="工作类型">
          <el-select v-model="form.workType" placeholder="请选择工作类型" :disabled="onlyread">
            <el-option label="实习" :value='0' />
            <el-option label="工作" :value='1' />
          </el-select>
        </el-form-item>
        <!--        <el-form-item label="关联的简历表id" prop="resumeId">-->
        <!--          <el-input v-model="form.resumeId" placeholder="请输入关联的简历表id" />-->
        <!--        </el-form-item>-->
        <el-form-item label="优先级" prop="priorityId">
          <el-input v-model="form.priorityId" placeholder="请输入优先级顺序(1-10000)" :disabled="onlyread" />
        </el-form-item>
        <el-form-item label="是否展示">
          <el-select v-model="form.workVisible" placeholder="请选择是否展示这份工作" :disabled="onlyread">
            <el-option label="不展示" :value='0' />
            <el-option label="展示" :value='1' />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button v-if="!onlyread" type="primary" @click="submitWorkForm">确 定</el-button>
        <el-button @click="workcancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-dialog :title="title" :visible.sync="resumeopen" width="678px" append-to-body>
      <div>
        <iframe @load="iframeDelivery" :src="resumeUrl" frameborder="0"
          style="width:100%;min-height:600px; padding: 5px;" ref="iframeResume" id="iframeResume"></iframe>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="info" @click="downloadWord">下载Word</el-button>
        <el-button type="info" @click="downloadHtml">下载HTML</el-button>
        <el-button type="primary" @click="printResume">打 印</el-button>
        <el-button @click="resumecancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listResume, getResume, delResume, addResume, updateResume, exportResume, getPersonalResume } from "@/api/function/resume/resume";
import {
  listExperience, getExperience, delExperience, addExperience, updateExperience, exportExperience,
  listProjectExperience, getProjectExperience, delProjectExperience, addProjectExperience, updateProjectExperience, exportProjectExperience
} from "@/api/function/resume/experience";
import { listTechnology, getTechnology, delTechnology, addTechnology, updateTechnology, exportTechnology } from "@/api/function/resume/technology";
import { getToken } from "@/utils/auth";
import FileSaver from 'file-saver';
export default {
  name: "ResumeManage",
  components: {
  },
  data() {
    return {
      // 遮罩层
      resumeListLoading: true,
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
      totalTech: 0,
      totalWork: 0,
      totalProj: 0,
      // 【请填写功能名称】表格数据
      resumeList: [],
      technologyList: [],
      workExperienceList: [],
      projectExperienceList: [],
      //简历详细信息
      resumeInfo: {},
      iframeWinResume: null,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      techopen: false,
      techlistopen: false,
      projectlistopen: false,
      projectopen: false,
      worklistopen: false,
      workopen: false,
      resumeopen: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        nickName: null,
        realName: null,
        gender: null,
        personalIntroduce: null,
        liveAddressNow: null,
        birthDay: null,
        contactPhone: null,
        contactEmail: null,
        jobIntention: null,
        headPic: null,
        universityName: null,
        universityStudyTime: null,
        unSpecializedSubject: null,
        unMainCoursesStudy: null,
        selfEvaluation: null,
        masterLanguage: null,
        professionSkill: null,
        officeSkill: null,
        education: null,
        nation: null,
        height: null,
        resumeId: null
      },
      queryParamsTech: {
        pageNum: 1,
        pageSize: 10,
        resumeId: null
      },
      queryParamsWork: {
        pageNum: 1,
        pageSize: 10,
        resumeId: null
      },
      queryParamsProj: {
        pageNum: 1,
        pageSize: 10,
        resumeId: null
      },
      resumeUrl: "/resume/resume.html",
      resumeId: null,
      onlyread: false,
      realName: null,
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        realName: [
          { required: true, message: "真实姓名不能为空", trigger: "blur" }
        ],
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }]
      },
      nations: [{ "id": "01", "name": "汉族" }, { "id": "02", "name": "蒙古族" }, { "id": "03", "name": "回族" },
      { "id": "04", "name": "藏族" }, { "id": "05", "name": "维吾尔族" }, { "id": "06", "name": "苗族" },
      { "id": "07", "name": "彝族" }, { "id": "08", "name": "壮族" }, { "id": "09", "name": "布依族" },
      { "id": "10", "name": "朝鲜族" }, { "id": "11", "name": "满族" }, { "id": "12", "name": "侗族" },
      { "id": "13", "name": "瑶族" }, { "id": "14", "name": "白族" }, { "id": "15", "name": "土家族" },
      { "id": "16", "name": "哈尼族" }, { "id": "17", "name": "哈萨克族" }, { "id": "18", "name": "傣族" },
      { "id": "19", "name": "黎族" }, { "id": "20", "name": "傈僳族" }, { "id": "21", "name": "佤族" },
      { "id": "22", "name": "畲族" }, { "id": "23", "name": "高山族" }, { "id": "24", "name": "拉祜族" },
      { "id": "25", "name": "水族" }, { "id": "26", "name": "东乡族" }, { "id": "27", "name": "纳西族" },
      { "id": "28", "name": "景颇族" }, { "id": "29", "name": "柯尔克孜族" }, { "id": "30", "name": "土族" },
      { "id": "31", "name": "达斡尔族" }, { "id": "32", "name": "仫佬族" }, { "id": "33", "name": "羌族" },
      { "id": "34", "name": "布朗族" }, { "id": "35", "name": "撒拉族" }, { "id": "36", "name": "毛难族" },
      { "id": "37", "name": "仡佬族" }, { "id": "38", "name": "锡伯族" }, { "id": "39", "name": "阿昌族" },
      { "id": "40", "name": "普米族" }, { "id": "41", "name": "塔吉克族" }, { "id": "42", "name": "怒族" },
      { "id": "43", "name": "乌孜别克族" }, { "id": "44", "name": "俄罗斯族" }, { "id": "45", "name": "鄂温克族" },
      { "id": "46", "name": "崩龙族" }, { "id": "47", "name": "保安族" }, { "id": "48", "name": "裕固族" },
      { "id": "49", "name": "京族" }, { "id": "50", "name": "塔塔尔族" }, { "id": "51", "name": "独龙族" },
      { "id": "52", "name": "鄂伦春族" }, { "id": "53", "name": "赫哲族" }, { "id": "54", "name": "门巴族" },
      { "id": "55", "name": "珞巴族" }, { "id": "56", "name": "基诺族" }],
      // 导入参数
      upload: {
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        headers: {
          Authorization: "Bearer " + getToken()
        },
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + "/system/file/fileUpload"
      },
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    // 这里就拿到了iframe的对象
    // console.log(this.$refs.iframeResume)
    // // 这里就拿到了iframe的window对象
    // console.log(this.$refs.iframeResume.contentWindow)
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.resumeListLoading = true;
      listResume(this.queryParams).then(response => {
        this.resumeList = response.rows;
        this.total = response.total;
        this.resumeListLoading = false;
      });
    },
    getTechList(id) {
      this.loading = true;
      this.queryParamsTech.resumeId = id;
      listTechnology(this.queryParamsTech).then(response => {
        this.technologyList = response.rows;
        this.totalTech = response.total;
        this.loading = false;
      });
    },
    getWorkList(id) {
      this.loading = true;
      this.queryParamsWork.resumeId = id;
      listExperience(this.queryParamsWork).then(response => {
        this.workExperienceList = response.rows;
        this.totalWork = response.total;
        this.loading = false;
      });
    },
    getProjectList(id) {
      this.loading = true;
      this.queryParamsProj.resumeId = id;
      listProjectExperience(this.queryParamsProj).then(response => {
        this.projectExperienceList = response.rows;
        this.totalProj = response.total;
        this.loading = false;
      });
    },
    //时间格式化
    dateFormat: function (date) {
      var t = new Date(date);//row 表示一行数据, updateTime 表示要格式化的字段名称
      return t.getFullYear() + "-" + this.dateIfAddZero(t.getMonth() + 1) + "-" + this.dateIfAddZero(t.getDate());
    },
    dateIfAddZero: function (time) {
      return time < 10 ? '0' + time : time
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 取消按钮
    workcancel() {
      this.workopen = false;
      this.reset();
    },
    // 取消按钮
    projectcancel() {
      this.projectopen = false;
      this.reset();
    },
    // 取消按钮
    techcancel() {
      this.techopen = false;
      this.reset();
    },
    resumecancel() {
      this.resumeopen = false;
    },
    //打印简历，可以pdf格式保存
    printResume() {
      document.getElementById('iframeResume').contentWindow.resumePrint();
    },
    downloadHtml() {
      let that = this;
      let html = that.iframeWinResume.documentElement.outerHTML;
      let blob = new Blob([html]);
      //通过后台返回 的word文件流设置文件名并下载
      //let blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8'}); //application/vnd.openxmlformats-officedocument.wordprocessingml.document这里表示doc类型
      //var file=new File(`${that.realName}的简历.html`, that.iframeWinResume, {type: "text/html;charset=utf-8"});
      let s = FileSaver.saveAs(blob, `${that.realName}的简历.html`, "utf-8");
      //console.log('s stream',html);
    },
    downloadWord() {
      let that = this;
      let html = that.iframeWinResume.documentElement.outerHTML;
      //通过后台返回 的word文件流设置文件名并下载
      let blob = new Blob([html], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8' }); //application/vnd.openxmlformats-officedocument.wordprocessingml.document这里表示doc类型
      //var file=new File(`${that.realName}的简历.html`, that.iframeWinResume, {type: "text/html;charset=utf-8"});
      let s = FileSaver.saveAs(blob, `${that.realName}的简历.doc`, "utf-8");
      //console.log('s stream',html);
    },
    // 表单重置
    reset() {
      this.onlyread = false;
      this.form = {
        id: null,
        nickName: null,
        realName: null,
        gender: null,
        personalIntroduce: null,
        liveAddressNow: null,
        birthDay: null,
        contactPhone: null,
        contactEmail: null,
        jobIntention: null,
        headPic: null,
        universityName: null,
        universityStudyTime: null,
        unSpecializedSubject: null,
        unMainCoursesStudy: null,
        selfEvaluation: null,
        masterLanguage: null,
        professionSkill: null,
        officeSkill: null,
        education: null,
        nation: null,
        height: null,
        workTime: null,
        workCompany: null,
        workPosition: null,
        workIntroduce: null,
        workType: null,
        workVisible: null,
        resumeId: null,
        technologyName: null,
        technologyScore: null,
        projectName: null,
        projectTime: null,
        projectContent: null,
        usingTechnology: null,
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
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加个人简历信息";
    },
    /**查看技术技能列表*/
    listTechnology(row) {
      this.reset();
      this.resumeId = row.id;
      this.getTechList(row.id);
      this.techlistopen = true;
      this.title = "技术技能";
    },
    /** 新增按钮操作 */
    handleTechAdd() {
      this.reset();
      this.techopen = true;
      this.title = "添加技术技能";
    },
    /** 修改按钮操作 */
    handleTechUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTechnology(id).then(response => {
        this.form = response.data;
        this.techopen = true;
        this.title = "修改技术技能";
      });
    },
    /**查看项目经验列表*/
    listProject(row) {
      this.reset();
      this.resumeId = row.id;
      this.getProjectList(row.id);
      this.projectlistopen = true;
      this.title = "项目经验";
    },
    /** 新增按钮操作 */
    handleProjectAdd() {
      this.reset();
      this.projectopen = true;
      this.title = "添加项目经验";
    },
    // 项目经验显示修改
    projectIsDisplayChange(row) {
      let text = row.isDisplay === 1 ? "显示" : "隐藏";
      this.$confirm('确认要"' + text + '""' + row.id + '"号项目经验吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        let form = { id: row.id, isDisplay: row.isDisplay }
        updateProjectExperience(form).then(response => {});
      }).then(() => {
        this.msgSuccess(text + "成功");
      }).catch(function () {
        row.isDisplay = row.isDisplay === 1 ? 0 : 1;
      });
    },
    /** 修改按钮操作 */
    handleProjectUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getProjectExperience(id).then(response => {
        this.form = response.data;
        this.form.projectTime = (this.form.projectTime || '').split('~');
        this.projectopen = true;
        this.title = "修改项目经验";
      });
    },
    // 工作经历显示修改
    workIsDisplayChange(row) {
      let text = row.workVisible === 1 ? "显示" : "隐藏";
      this.$confirm('确认要"' + text + '""' + row.id + '"号项目经验吗?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        let form = { id: row.id, workVisible: row.workVisible }
        updateExperience(form).then(response => {});
      }).then(() => {
        this.msgSuccess(text + "成功");
      }).catch(function () {
        row.workVisible = row.workVisible === 1 ? 0 : 1;
      });
    },
    handleProjectView(row) {
      this.reset();
      const id = row.id || this.ids
      getProjectExperience(id).then(response => {
        this.onlyread = true;
        this.form = response.data;
        this.form.projectTime = (this.form.projectTime || '').split('~');
        this.projectopen = true;
        this.title = "修改项目经验";
      });
    },
    /**查看工作经验列表*/
    listWork(row) {
      this.reset();
      this.resumeId = row.id;
      this.getWorkList(row.id);
      this.worklistopen = true;
      this.title = "工作经验";
    },
    /** 新增按钮操作 */
    handleWorkAdd() {
      this.reset();
      this.workopen = true;
      this.title = "添加工作经验";
    },
    /** 修改按钮操作 */
    handleWorkUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getExperience(id).then(response => {
        this.form = response.data;
        this.form.workTime = (this.form.workTime || '').split('~');
        this.workopen = true;
        this.title = "修改工作经验";
      });
    },
    handleWorkView(row) {
      this.reset();
      const id = row.id || this.ids
      getExperience(id).then(response => {
        this.onlyread = true;
        this.form = response.data;
        this.form.workTime = (this.form.workTime || '').split('~');
        this.workopen = true;
        this.title = "查看工作经验";
      });
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getResume(id).then(response => {
        this.form = response.data;
        this.form.universityStudyTime = (this.form.universityStudyTime || '').split('~');
        this.open = true;
        this.title = "修改个人简历信息";
      });
    },
    viewResumeDetail(row) {
      this.realName = row.realName;
      this.queryParams.resumeId = row.id;
      getPersonalResume(this.queryParams).then(res => {
        this.resumeInfo = res.data;
        this.projectExperienceList = this.resumeInfo.listProject
        this.resumeInfo.listProject = this.resortKey(this.projectExperienceList, 'priorityId')
        //获取简历所有的信息
        //console.log(res.data)
      });
      this.resumeopen = true;
      this.title = "我的简历";
      // document.getElementById("iframeResume").onload = function() {
      //   // contentWindow is set!
      //   this.iframeWinResume=this.$refs.iframeResume.contentWindow;
      // };
      //this.iframeWinResume.postMessage(this.resumeInfo,"*");
      //console.log("简历："+resume);
    },
    //正序
    sortKey(array, key) {
      return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : (x > y) ? 1 : 0)
      })
    },
    //倒序
    resortKey(array, key) {
      return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return ((x > y) ? -1 : (x < y) ? 1 : 0)
      })
    },
    //iframe加载时调用的加载事件，只有等这个事件加载完成后才能使用一系列iframe中的事件
    iframeDelivery() {
      this.iframeWinResume = this.$refs.iframeResume.contentWindow.document;
      //console.log("iframe：");
      //获取iframe的document对象
      //console.log(this.iframeWinResume);
      this.$refs.iframeResume.contentWindow.postMessage(this.resumeInfo, "*");
      //console.log("简历：");
      //获取简历所有的信息
      //console.log(this.resumeInfo);
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            this.form.universityStudyTime = this.dateFormat(this.form.universityStudyTime[0]) + "~" + this.dateFormat(this.form.universityStudyTime[1]);
            updateResume(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            this.form.universityStudyTime = this.dateFormat(this.form.universityStudyTime[0]) + "~" + this.dateFormat(this.form.universityStudyTime[1]);
            addResume(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 提交按钮 */
    submitTechForm() {
      this.$refs["form"].validate(valid => {
        this.form.resumeId = this.resumeId;
        if (valid) {
          if (this.form.id != null) {
            updateTechnology(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.techopen = false;
              this.getTechList();
            });
          } else {
            addTechnology(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.techopen = false;
              this.getTechList();
            });
          }
        }
      });
    },
    /** 提交按钮 */
    submitProjectForm() {
      this.$refs["form"].validate(valid => {
        this.form.resumeId = this.resumeId;
        if (valid) {
          if (this.form.id != null) {
            this.form.projectTime = this.dateFormat(this.form.projectTime[0]) + "~" + this.dateFormat(this.form.projectTime[1]);
            updateProjectExperience(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.projectopen = false;
              this.getProjectList();
            });
          } else {
            this.form.projectTime = this.dateFormat(this.form.projectTime[0]) + "~" + this.dateFormat(this.form.projectTime[1]);
            addProjectExperience(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.projectopen = false;
              this.getProjectList();
            });
          }
        }
      });
    },
    /** 提交按钮 */
    submitWorkForm() {
      this.$refs["form"].validate(valid => {
        this.form.resumeId = this.resumeId;
        if (valid) {
          if (this.form.id != null) {
            this.form.workTime = this.dateFormat(this.form.workTime[0]) + "~" + this.dateFormat(this.form.workTime[1]);
            updateExperience(this.form).then(response => {
              this.msgSuccess("修改成功");
              this.workopen = false;
              this.getWorkList();
            });
          } else {
            this.form.workTime = this.dateFormat(this.form.workTime[0]) + "~" + this.dateFormat(this.form.workTime[1]);
            addExperience(this.form).then(response => {
              this.msgSuccess("新增成功");
              this.workopen = false;
              this.getWorkList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除所选的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delResume(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      })
    },
    /** 删除按钮操作 */
    handleTechDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除所选的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delTechnology(ids);
      }).then(() => {
        this.getTechList();
        this.msgSuccess("删除成功");
      })
    },
    /** 删除按钮操作 */
    handleWorkDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除所选的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delExperience(ids);
      }).then(() => {
        this.getWorkList();
        this.msgSuccess("删除成功");
      })
    },
    /** 删除按钮操作 */
    handleProjectDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除所选的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delProjectExperience(ids);
      }).then(() => {
        this.getProjectList();
        this.msgSuccess("删除成功");
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportResume(queryParams);
      }).then(response => {
        this.download(response.msg);
      })
    },
    // 简历头像图片上传预处理
    beforeUpload(file) {
      // if (file.type.indexOf("image/") == -1) {
      //   this.msgError("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。");
      //   return false;
      // }
      return new Promise((resolve, reject) => {
        let isLt4M = file.size / 1024 / 1024 < 4 // 判定图片大小是否小于4MB
        // console.log(file) // 压缩到400KB,这里的400就是要压缩的大小,可自定义
        if (!isLt4M) { //当大于2MB的时候进行压缩
          imageConversion.compressAccurately(file, 200).then(res => { // console.log(res)
            resolve(res)
          })
        } else {
          resolve()
        }
      })
    },
    // 简历头像图片【上传成功】回调函数
    handleFileSuccess(response, file, fileList) {
      // this.tmpFile.url = process.env.VUE_APP_BASE_API + response.url;
      // this.tmpFile.fileUrl = response.url;
      // this.tmpFile.fileName = file.name;
      // this.tmpFile.size = file.size;
      // this.form.headPic.push(this.tmpFile);
      // this.tmpFile = {};
      this.form.headPic = process.env.VUE_APP_BASE_API + response.url;
    },
    //简历头像上传错误回调
    handleFileError(err, file, fileList) {
      this.$message(err);
    }
  }
};
</script>
