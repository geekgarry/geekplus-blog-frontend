<template>
  <div class="resume-form-editor space-y-6 p-4 md:p-6 bg-white rounded-xl shadow-sm border border-gray-100">
    <el-collapse v-model="activeCollapse">
      <!-- AI 一键生成 -->
      <el-collapse-item name="ai">
        <template slot="title">
          <span class="section-title section-title--ai">
            <i class="el-icon-magic-stick"></i> AI 一键生成简历
          </span>
        </template>
        <div class="section-body section-body--ai">
          <el-input
            v-model="aiPrompt"
            type="textarea"
            :rows="4"
            placeholder="请输入您的基本信息、工作经历、技能等，AI 将自动为您生成结构化的简历内容。例如：我叫张三，电话138xxxx，3年前端开发经验，曾在腾讯做过React项目..."
          />
          <el-button
            type="primary"
            class="mt-3 ai-generate-btn"
            :loading="isGenerating"
            @click="handleGenerateFullResume"
          >
            <i v-if="!isGenerating" class="el-icon-magic-stick"></i>
            {{ isGenerating ? 'AI 正在努力生成中...' : '立即生成' }}
          </el-button>
          <div class="mt-4">
            <label class="field-label">或上传旧简历文件（PDF、DOC、DOCX、图片）</label>
            <div class="flex items-center gap-3 flex-wrap mt-2">
              <input
                ref="fileInput"
                type="file"
                class="hidden-file-input"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                @change="handleResumeFileUpload"
              />
              <el-button size="small" @click="triggerFilePick">
                <i class="el-icon-upload2"></i> 选择文件
              </el-button>
              <span v-if="uploadedFile" class="uploaded-file-name">
                {{ uploadedFile.name }}
                <el-button type="text" class="text-red" @click="removeUploadedFile">
                  <i class="el-icon-close"></i>
                </el-button>
              </span>
            </div>
            <p v-if="uploadedFile" class="file-hint text-xs text-gray-500 mt-1">
              文件已保存在本地；若后端暂不支持解析附件，仍会使用上方文字说明生成。
            </p>
          </div>
        </div>
      </el-collapse-item>

      <!-- 基本信息 -->
      <el-collapse-item name="basics">
        <template slot="title">
          <span class="section-title">基本信息</span>
        </template>
        <div class="section-body">
          <el-row :gutter="16" class="mb-4">
            <el-col :xs="24" :sm="6" class="avatar-col">
              <div
                class="avatar-box"
                @click="onAvatarBoxClick"
              >
                <img v-if="resumeData.basics.avatar" :src="resumeData.basics.avatar" alt="头像" class="avatar-img" />
                <template v-else>
                  <i class="el-icon-upload2 avatar-placeholder-icon"></i>
                  <span class="text-xs text-gray-500">上传头像</span>
                </template>
                <div v-if="resumeData.basics.avatar" class="avatar-overlay" @click.stop="removeAvatar">
                  <i class="el-icon-delete"></i>
                </div>
              </div>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                class="hidden-file-input"
                @change="handleAvatarUpload"
              />
            </el-col>
            <el-col :xs="24" :sm="18">
              <el-row :gutter="12">
                <el-col :xs="24" :sm="12">
                  <label class="field-label">姓名</label>
                  <el-input :value="resumeData.basics.name" @input="updateBasics('name', $event)" />
                </el-col>
                <el-col :xs="24" :sm="12">
                  <label class="field-label">性别 <span class="optional">（选填）</span></label>
                  <el-input
                    :value="basicsGender"
                    placeholder="如：男 / 女"
                    @input="updateBasics('gender', $event)"
                  />
                </el-col>
                <el-col :xs="24" :sm="12">
                  <label class="field-label">年龄 <span class="optional">（选填）</span></label>
                  <el-input
                    :value="basicsAge"
                    placeholder="如：29岁"
                    @input="updateBasics('age', $event)"
                  />
                </el-col>
                <el-col :xs="24" :sm="12">
                  <label class="field-label">电话</label>
                  <el-input :value="resumeData.basics.phone" @input="updateBasics('phone', $event)" />
                </el-col>
                <el-col :xs="24" :sm="12">
                  <label class="field-label">工作经验 <span class="optional">（选填）</span></label>
                  <el-input
                    :value="basicsWorkYears"
                    placeholder="如：3年 / 无工作经验"
                    @input="updateBasics('workYears', $event)"
                  />
                </el-col>
                <el-col :xs="24" :sm="12">
                  <label class="field-label">常住地 <span class="optional">（选填）</span></label>
                  <el-input
                    :value="basicsResidence"
                    placeholder="如：江苏省苏州市"
                    @input="updateBasics('residence', $event)"
                  />
                </el-col>
                <el-col :span="24">
                  <label class="field-label">邮箱</label>
                  <el-input :value="resumeData.basics.email" @input="updateBasics('email', $event)" />
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <div class="relative-block">
            <label class="field-label">个人介绍</label>
            <el-input
              type="textarea"
              :rows="4"
              :value="resumeData.basics.summary"
              placeholder="简短介绍您的核心优势和职业目标..."
              @input="updateBasics('summary', $event)"
            />
            <el-button
              size="mini"
              class="ai-polish-btn"
              :loading="aiLoadingKey === 'summary'"
              @click="handleAiOptimize(resumeData.basics.summary, 'summary', function (val) { updateBasics('summary', val); }, 'summary')"
            >
              <i class="el-icon-magic-stick"></i>
              {{ aiLoadingKey === 'summary' ? '优化中...' : 'AI 润色' }}
            </el-button>
          </div>
        </div>
      </el-collapse-item>

      <!-- 求职意向 -->
      <el-collapse-item v-if="hasBlock('jobIntention')" name="jobIntention">
        <template slot="title">
          <span class="section-title">求职意向</span>
        </template>
        <div class="section-body">
          <el-row :gutter="12">
            <el-col :xs="24" :sm="8">
              <label class="field-label">目标职业</label>
              <el-input
                :value="jobTargetJob"
                placeholder="如：前端开发工程师"
                @input="updateJobIntention('targetJob', $event)"
              />
            </el-col>
            <el-col :xs="24" :sm="8">
              <label class="field-label">意向城市</label>
              <el-input
                :value="jobTargetCity"
                placeholder="如：北京、上海"
                @input="updateJobIntention('targetCity', $event)"
              />
            </el-col>
            <el-col :xs="24" :sm="8">
              <label class="field-label">期望薪资</label>
              <el-input
                :value="jobExpectedSalary"
                placeholder="如：15k-20k"
                @input="updateJobIntention('expectedSalary', $event)"
              />
            </el-col>
          </el-row>
        </div>
      </el-collapse-item>

      <!-- 教育经历 -->
      <el-collapse-item name="education">
        <template slot="title">
          <span class="section-title">
            教育经历
            <span class="section-sub">(支持拖拽排序)</span>
          </span>
        </template>
        <div class="section-body">
          <div class="list-toolbar">
            <el-button type="text" @click="addEducation">
              <i class="el-icon-plus"></i> 添加
            </el-button>
          </div>
          <draggable v-model="educationList" handle=".drag-handle" animation="150" @end="onEducationDragEnd">
            <transition-group type="transition" name="flip-list" tag="div">
              <div
                v-for="(edu, index) in educationList"
                :key="edu.id"
                class="list-item-card"
                :class="{ 'is-hidden': edu.isHidden }"
              >
                <div class="list-item-actions">
                  <i class="el-icon-rank drag-handle"></i>
                  <el-button type="text" size="mini" title="上移" :disabled="index === 0" @click="moveListItem('education', index, 'up')">
                    <i class="el-icon-top"></i>
                  </el-button>
                  <el-button type="text" size="mini" title="下移" :disabled="index === educationList.length - 1" @click="moveListItem('education', index, 'down')">
                    <i class="el-icon-bottom"></i>
                  </el-button>
                  <el-button type="text" size="mini" :title="edu.isHidden ? '显示' : '隐藏'" @click="toggleListHidden('education', index)">
                    <i :class="edu.isHidden ? 'el-icon-circle-close' : 'el-icon-view'"></i>
                  </el-button>
                  <el-button type="text" size="mini" class="text-red" @click="removeListItem('education', edu.id)">
                    <i class="el-icon-delete"></i>
                  </el-button>
                </div>
                <el-row :gutter="12" class="list-item-fields">
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="edu.school"
                      placeholder="学校名称"
                      @input="updateListField('education', index, 'school', $event)"
                    />
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="edu.degree"
                      placeholder="学历/专业"
                      @input="updateListField('education', index, 'degree', $event)"
                    />
                  </el-col>
                  <el-col :span="24">
                    <el-input
                      :value="edu.year"
                      placeholder="时间 (如 2018.09 - 2022.06)"
                      @input="updateListField('education', index, 'year', $event)"
                    />
                  </el-col>
                </el-row>
              </div>
            </transition-group>
          </draggable>
        </div>
      </el-collapse-item>

      <!-- 工作经历 -->
      <el-collapse-item name="work">
        <template slot="title">
          <span class="section-title">
            工作经历
            <span class="section-sub">(支持拖拽排序)</span>
          </span>
        </template>
        <div class="section-body">
          <div class="list-toolbar">
            <el-button type="text" @click="addWork">
              <i class="el-icon-plus"></i> 添加
            </el-button>
          </div>
          <draggable v-model="workList" handle=".drag-handle" animation="150">
            <transition-group type="transition" name="flip-list" tag="div">
              <div
                v-for="(w, index) in workList"
                :key="w.id"
                class="list-item-card"
                :class="{ 'is-hidden': w.isHidden }"
              >
                <div class="list-item-actions">
                  <i class="el-icon-rank drag-handle"></i>
                  <el-button type="text" size="mini" :disabled="index === 0" @click="moveListItem('work', index, 'up')">
                    <i class="el-icon-top"></i>
                  </el-button>
                  <el-button type="text" size="mini" :disabled="index === workList.length - 1" @click="moveListItem('work', index, 'down')">
                    <i class="el-icon-bottom"></i>
                  </el-button>
                  <el-button type="text" size="mini" @click="toggleListHidden('work', index)">
                    <i :class="w.isHidden ? 'el-icon-circle-close' : 'el-icon-view'"></i>
                  </el-button>
                  <el-button type="text" size="mini" class="text-red" @click="removeListItem('work', w.id)">
                    <i class="el-icon-delete"></i>
                  </el-button>
                </div>
                <el-row :gutter="12" class="list-item-fields">
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="w.company"
                      placeholder="公司名称"
                      @input="updateListField('work', index, 'company', $event)"
                    />
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="w.position"
                      placeholder="担任职位"
                      @input="updateListField('work', index, 'position', $event)"
                    />
                  </el-col>
                  <el-col :span="24">
                    <el-input
                      :value="w.duration"
                      placeholder="时间 (如 2022.07 - 至今)"
                      @input="updateListField('work', index, 'duration', $event)"
                    />
                  </el-col>
                  <el-col :span="24">
                    <div class="relative-block">
                      <el-input
                        type="textarea"
                        :rows="5"
                        :value="w.description"
                        placeholder="工作内容描述（建议分点列出）"
                        :disabled="w.isHidden"
                        @input="updateListField('work', index, 'description', $event)"
                      />
                      <el-button
                        size="mini"
                        class="ai-polish-btn"
                        :loading="aiLoadingKey === 'work_' + w.id"
                        :disabled="w.isHidden"
                        @click="handleAiOptimize(w.description, 'work', function (val) { updateListField('work', index, 'description', val); }, 'work_' + w.id)"
                      >
                        <i class="el-icon-magic-stick"></i>
                        {{ aiLoadingKey === 'work_' + w.id ? '优化中...' : 'AI 润色' }}
                      </el-button>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </transition-group>
          </draggable>
        </div>
      </el-collapse-item>

      <!-- 项目经验 -->
      <el-collapse-item name="projects">
        <template slot="title">
          <span class="section-title">
            项目经验
            <span class="section-sub">(支持拖拽排序)</span>
          </span>
        </template>
        <div class="section-body">
          <div class="list-toolbar">
            <el-button type="text" @click="addProject">
              <i class="el-icon-plus"></i> 添加
            </el-button>
          </div>
          <draggable v-model="projectsList" handle=".drag-handle" animation="150">
            <transition-group type="transition" name="flip-list" tag="div">
              <div
                v-for="(p, index) in projectsList"
                :key="p.id"
                class="list-item-card"
                :class="{ 'is-hidden': p.isHidden }"
              >
                <div class="list-item-actions">
                  <i class="el-icon-rank drag-handle"></i>
                  <el-button type="text" size="mini" :disabled="index === 0" @click="moveListItem('projects', index, 'up')">
                    <i class="el-icon-top"></i>
                  </el-button>
                  <el-button type="text" size="mini" :disabled="index === projectsList.length - 1" @click="moveListItem('projects', index, 'down')">
                    <i class="el-icon-bottom"></i>
                  </el-button>
                  <el-button type="text" size="mini" @click="toggleListHidden('projects', index)">
                    <i :class="p.isHidden ? 'el-icon-circle-close' : 'el-icon-view'"></i>
                  </el-button>
                  <el-button type="text" size="mini" class="text-red" @click="removeListItem('projects', p.id)">
                    <i class="el-icon-delete"></i>
                  </el-button>
                </div>
                <el-row :gutter="12" class="list-item-fields">
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="p.name"
                      placeholder="项目名称"
                      @input="updateListField('projects', index, 'name', $event)"
                    />
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="p.role"
                      placeholder="担任角色"
                      @input="updateListField('projects', index, 'role', $event)"
                    />
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="p.technologies"
                      placeholder="使用技术"
                      @input="updateListField('projects', index, 'technologies', $event)"
                    />
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="p.duration"
                      placeholder="时间"
                      @input="updateListField('projects', index, 'duration', $event)"
                    />
                  </el-col>
                  <el-col :span="24">
                    <div class="relative-block">
                      <el-input
                        type="textarea"
                        :rows="6"
                        :value="p.description"
                        placeholder="项目描述及个人职责"
                        :disabled="p.isHidden"
                        @input="updateListField('projects', index, 'description', $event)"
                      />
                      <el-button
                        size="mini"
                        class="ai-polish-btn"
                        :loading="aiLoadingKey === 'proj_' + p.id"
                        :disabled="p.isHidden"
                        @click="handleAiOptimize(p.description, 'project', function (val) { updateListField('projects', index, 'description', val); }, 'proj_' + p.id)"
                      >
                        <i class="el-icon-magic-stick"></i>
                        {{ aiLoadingKey === 'proj_' + p.id ? '优化中...' : 'AI 润色' }}
                      </el-button>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </transition-group>
          </draggable>
        </div>
      </el-collapse-item>

      <!-- 获奖情况 -->
      <el-collapse-item v-if="hasBlock('awards')" name="awards">
        <template slot="title">
          <span class="section-title">
            获奖情况
            <span class="section-sub">(支持拖拽排序)</span>
          </span>
        </template>
        <div class="section-body">
          <div class="list-toolbar">
            <el-button type="text" @click="addAward">
              <i class="el-icon-plus"></i> 添加
            </el-button>
          </div>
          <draggable v-model="awardsList" handle=".drag-handle" animation="150">
            <transition-group type="transition" name="flip-list" tag="div">
              <div
                v-for="(award, index) in awardsList"
                :key="award.id"
                class="list-item-card"
                :class="{ 'is-hidden': award.isHidden }"
              >
                <div class="list-item-actions">
                  <i class="el-icon-rank drag-handle"></i>
                  <el-button type="text" size="mini" :disabled="index === 0" @click="moveListItem('awards', index, 'up')">
                    <i class="el-icon-top"></i>
                  </el-button>
                  <el-button type="text" size="mini" :disabled="index === awardsList.length - 1" @click="moveListItem('awards', index, 'down')">
                    <i class="el-icon-bottom"></i>
                  </el-button>
                  <el-button type="text" size="mini" @click="toggleListHidden('awards', index)">
                    <i :class="award.isHidden ? 'el-icon-circle-close' : 'el-icon-view'"></i>
                  </el-button>
                  <el-button type="text" size="mini" class="text-red" @click="removeListItem('awards', award.id)">
                    <i class="el-icon-delete"></i>
                  </el-button>
                </div>
                <el-row :gutter="12" class="list-item-fields">
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="award.name"
                      placeholder="奖项名称"
                      @input="updateListField('awards', index, 'name', $event)"
                    />
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="award.date"
                      placeholder="获奖时间"
                      @input="updateListField('awards', index, 'date', $event)"
                    />
                  </el-col>
                  <el-col :span="24">
                    <el-input
                      :value="award.description"
                      placeholder="奖项描述/级别 (选填)"
                      @input="updateListField('awards', index, 'description', $event)"
                    />
                  </el-col>
                </el-row>
              </div>
            </transition-group>
          </draggable>
        </div>
      </el-collapse-item>

      <!-- 资格证书 -->
      <el-collapse-item v-if="hasBlock('certifications')" name="certifications">
        <template slot="title">
          <span class="section-title">
            资格证书
            <span class="section-sub">(支持拖拽排序)</span>
          </span>
        </template>
        <div class="section-body">
          <div class="list-toolbar">
            <el-button type="text" @click="addCertification">
              <i class="el-icon-plus"></i> 添加
            </el-button>
          </div>
          <draggable v-model="certificationsList" handle=".drag-handle" animation="150">
            <transition-group type="transition" name="flip-list" tag="div">
              <div
                v-for="(cert, index) in certificationsList"
                :key="cert.id"
                class="list-item-card"
                :class="{ 'is-hidden': cert.isHidden }"
              >
                <div class="list-item-actions">
                  <i class="el-icon-rank drag-handle"></i>
                  <el-button type="text" size="mini" :disabled="index === 0" @click="moveListItem('certifications', index, 'up')">
                    <i class="el-icon-top"></i>
                  </el-button>
                  <el-button type="text" size="mini" :disabled="index === certificationsList.length - 1" @click="moveListItem('certifications', index, 'down')">
                    <i class="el-icon-bottom"></i>
                  </el-button>
                  <el-button type="text" size="mini" @click="toggleListHidden('certifications', index)">
                    <i :class="cert.isHidden ? 'el-icon-circle-close' : 'el-icon-view'"></i>
                  </el-button>
                  <el-button type="text" size="mini" class="text-red" @click="removeListItem('certifications', cert.id)">
                    <i class="el-icon-delete"></i>
                  </el-button>
                </div>
                <el-row :gutter="12" class="list-item-fields">
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="cert.name"
                      placeholder="证书名称"
                      @input="updateListField('certifications', index, 'name', $event)"
                    />
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="certIssuer(cert)"
                      placeholder="颁发机构"
                      @input="updateListField('certifications', index, 'issuer', $event)"
                    />
                  </el-col>
                  <el-col :span="24">
                    <el-input
                      :value="cert.date"
                      placeholder="获得时间"
                      @input="updateListField('certifications', index, 'date', $event)"
                    />
                  </el-col>
                </el-row>
              </div>
            </transition-group>
          </draggable>
        </div>
      </el-collapse-item>

      <!-- 作品集 -->
      <el-collapse-item v-if="hasBlock('portfolio')" name="portfolio">
        <template slot="title">
          <span class="section-title">
            作品集
            <span class="section-sub">(支持拖拽排序)</span>
          </span>
        </template>
        <div class="section-body">
          <div class="list-toolbar">
            <el-button type="text" @click="addPortfolio">
              <i class="el-icon-plus"></i> 添加
            </el-button>
          </div>
          <draggable v-model="portfolioList" handle=".drag-handle" animation="150">
            <transition-group type="transition" name="flip-list" tag="div">
              <div
                v-for="(item, index) in portfolioList"
                :key="item.id"
                class="list-item-card"
                :class="{ 'is-hidden': item.isHidden }"
              >
                <div class="list-item-actions">
                  <i class="el-icon-rank drag-handle"></i>
                  <el-button type="text" size="mini" :disabled="index === 0" @click="moveListItem('portfolio', index, 'up')">
                    <i class="el-icon-top"></i>
                  </el-button>
                  <el-button type="text" size="mini" :disabled="index === portfolioList.length - 1" @click="moveListItem('portfolio', index, 'down')">
                    <i class="el-icon-bottom"></i>
                  </el-button>
                  <el-button type="text" size="mini" @click="toggleListHidden('portfolio', index)">
                    <i :class="item.isHidden ? 'el-icon-circle-close' : 'el-icon-view'"></i>
                  </el-button>
                  <el-button type="text" size="mini" class="text-red" @click="removeListItem('portfolio', item.id)">
                    <i class="el-icon-delete"></i>
                  </el-button>
                </div>
                <el-row :gutter="12" class="list-item-fields">
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="item.title"
                      placeholder="作品名称"
                      @input="updateListField('portfolio', index, 'title', $event)"
                    />
                  </el-col>
                  <el-col :xs="24" :sm="12">
                    <el-input
                      :value="item.link"
                      placeholder="作品链接 (URL)"
                      @input="updateListField('portfolio', index, 'link', $event)"
                    />
                  </el-col>
                  <el-col :span="24">
                    <el-input
                      :value="item.description"
                      placeholder="作品简述 (选填)"
                      @input="updateListField('portfolio', index, 'description', $event)"
                    />
                  </el-col>
                </el-row>
              </div>
            </transition-group>
          </draggable>
        </div>
      </el-collapse-item>

      <!-- 技能与爱好 -->
      <el-collapse-item name="skills">
        <template slot="title">
          <span class="section-title">技能与爱好</span>
        </template>
        <div class="section-body">
          <label class="field-label">专业技能 (建议分点列出)</label>
          <el-input
            type="textarea"
            :rows="4"
            :value="resumeData.skills"
            placeholder="1. 熟练掌握 HTML/CSS/JavaScript..."
            @input="updateRootField('skills', $event)"
          />
          <label class="field-label mt-4">兴趣爱好</label>
          <el-input
            :value="resumeData.hobbies"
            placeholder="如：阅读、摄影、开源贡献"
            @input="updateRootField('hobbies', $event)"
          />
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { generateResumeAI } from '@/api/resume';
import { createEmptyResumeData } from './types';
import { createResumeId } from './export/idUtils';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

const OPTIMIZE_LABELS = {
  summary: '个人介绍',
  work: '工作经历描述',
  project: '项目经历描述',
};

export default {
  name: 'ResumeFormEditor',
  components: { draggable },
  props: {
    value: { type: Object, default: null },
    data: { type: Object, default: null },
    template: { type: Object, default: null },
  },
  data() {
    return {
      activeCollapse: ['ai'],
      aiPrompt: '',
      uploadedFile: null,
      isGenerating: false,
      aiLoadingKey: null,
    };
  },
  computed: {
    resumeData() {
      const src = this.value != null ? this.value : this.data;
      if (src && typeof src === 'object') {
        return src;
      }
      return createEmptyResumeData();
    },
    basicsGender() {
      const b = this.resumeData.basics;
      return b && b.gender ? b.gender : '';
    },
    basicsAge() {
      const b = this.resumeData.basics;
      return b && b.age ? b.age : '';
    },
    basicsWorkYears() {
      const b = this.resumeData.basics;
      return b && b.workYears ? b.workYears : '';
    },
    basicsResidence() {
      const b = this.resumeData.basics;
      return b && b.residence ? b.residence : '';
    },
    jobTargetJob() {
      const j = this.resumeData.jobIntention;
      return j && j.targetJob ? j.targetJob : '';
    },
    jobTargetCity() {
      const j = this.resumeData.jobIntention;
      return j && j.targetCity ? j.targetCity : '';
    },
    jobExpectedSalary() {
      const j = this.resumeData.jobIntention;
      return j && j.expectedSalary ? j.expectedSalary : '';
    },
    educationList: {
      get() {
        return this.resumeData.education || [];
      },
      set(list) {
        this.patch({ education: list });
      },
    },
    workList: {
      get() {
        return this.resumeData.work || [];
      },
      set(list) {
        this.patch({ work: list });
      },
    },
    projectsList: {
      get() {
        return this.resumeData.projects || [];
      },
      set(list) {
        this.patch({ projects: list });
      },
    },
    awardsList: {
      get() {
        return this.resumeData.awards || [];
      },
      set(list) {
        this.patch({ awards: list });
      },
    },
    certificationsList: {
      get() {
        return this.resumeData.certifications || [];
      },
      set(list) {
        this.patch({ certifications: list });
      },
    },
    portfolioList: {
      get() {
        return this.resumeData.portfolio || [];
      },
      set(list) {
        this.patch({ portfolio: list });
      },
    },
  },
  methods: {
    certIssuer(cert) {
      return cert && cert.issuer ? cert.issuer : '';
    },
    emitUpdate(next) {
      this.$emit('input', next);
      this.$emit('change', next);
    },
    patch(partial) {
      const next = {
        ...this.resumeData,
        ...partial,
      };
      if (partial.basics) {
        next.basics = { ...this.resumeData.basics, ...partial.basics };
      }
      if (partial.jobIntention) {
        next.jobIntention = {
          ...(this.resumeData.jobIntention || createEmptyResumeData().jobIntention),
          ...partial.jobIntention,
        };
      }
      this.emitUpdate(next);
    },
    updateBasics(field, val) {
      this.patch({
        basics: { ...this.resumeData.basics, [field]: val },
      });
    },
    updateJobIntention(field, val) {
      const base = this.resumeData.jobIntention || createEmptyResumeData().jobIntention;
      this.patch({
        jobIntention: { ...base, [field]: val },
      });
    },
    updateRootField(field, val) {
      this.patch({ [field]: val });
    },
    updateListField(listKey, index, field, val) {
      const list = (this.resumeData[listKey] || []).slice();
      if (!list[index]) return;
      list[index] = { ...list[index], [field]: val };
      this.patch({ [listKey]: list });
    },
    moveListItem(listKey, index, direction) {
      const list = (this.resumeData[listKey] || []).slice();
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return;
      const tmp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = tmp;
      this.patch({ [listKey]: list });
    },
    toggleListHidden(listKey, index) {
      const list = (this.resumeData[listKey] || []).slice();
      if (!list[index]) return;
      list[index] = { ...list[index], isHidden: !list[index].isHidden };
      this.patch({ [listKey]: list });
    },
    removeListItem(listKey, id) {
      const list = (this.resumeData[listKey] || []).filter((item) => item.id !== id);
      this.patch({ [listKey]: list });
    },
    onEducationDragEnd() {
      /* v-model setter already emits */
    },
    addEducation() {
      this.patch({
        education: [
          ...(this.resumeData.education || []),
          { id: createResumeId(), school: '', degree: '', year: '', isHidden: false },
        ],
      });
    },
    addWork() {
      this.patch({
        work: [
          ...(this.resumeData.work || []),
          {
            id: createResumeId(),
            company: '',
            position: '',
            duration: '',
            description: '',
            isHidden: false,
          },
        ],
      });
    },
    addProject() {
      this.patch({
        projects: [
          ...(this.resumeData.projects || []),
          {
            id: createResumeId(),
            name: '',
            role: '',
            technologies: '',
            duration: '',
            description: '',
            isHidden: false,
          },
        ],
      });
    },
    addAward() {
      this.patch({
        awards: [
          ...(this.resumeData.awards || []),
          { id: createResumeId(), name: '', date: '', description: '', isHidden: false },
        ],
      });
    },
    addCertification() {
      this.patch({
        certifications: [
          ...(this.resumeData.certifications || []),
          {
            id: createResumeId(),
            name: '',
            issuer: '',
            date: '',
            description: '',
            isHidden: false,
          },
        ],
      });
    },
    addPortfolio() {
      this.patch({
        portfolio: [
          ...(this.resumeData.portfolio || []),
          { id: createResumeId(), title: '', link: '', description: '', isHidden: false },
        ],
      });
    },
    hasBlock(blockType) {
      const tpl = this.template;
      if (!tpl || !tpl.layoutData) return true;
      const layout = tpl.layoutData;
      const mainBlocks = layout.mainBlocks || [];
      const sidebarBlocks = layout.sidebarBlocks || [];
      const blocks = layout.blocks || [];
      const match = (b) => b.type === blockType;
      return mainBlocks.some(match) || sidebarBlocks.some(match) || blocks.some(match);
    },
    onAvatarBoxClick() {
      if (!this.resumeData.basics.avatar && this.$refs.avatarInput) {
        this.$refs.avatarInput.click();
      }
    },
    handleAvatarUpload(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        this.updateBasics('avatar', reader.result);
      };
      reader.readAsDataURL(file);
    },
    removeAvatar() {
      this.updateBasics('avatar', '');
      if (this.$refs.avatarInput) {
        this.$refs.avatarInput.value = '';
      }
    },
    triggerFilePick() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.click();
      }
    },
    handleResumeFileUpload(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (ALLOWED_FILE_TYPES.indexOf(file.type) === -1) {
        this.$message.warning('只支持 PDF、DOC、DOCX、JPG、PNG 格式的文件');
        e.target.value = '';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this.$message.warning('文件大小不能超过10MB');
        e.target.value = '';
        return;
      }
      this.uploadedFile = file;
    },
    removeUploadedFile() {
      this.uploadedFile = null;
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    extractAiPayload(res) {
      if (res == null) return null;
      if (typeof res === 'string') return res;
      if (typeof res.data === 'string' || (typeof res.data === 'object' && res.data !== null)) {
        return res.data;
      }
      if (typeof res.msg === 'string' && res.code === 200) {
        return res.msg;
      }
      return res;
    },
    tryParseResumeJson(text) {
      if (typeof text !== 'string') return null;
      const trimmed = text.trim();
      if (!trimmed) return null;
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') return parsed;
      } catch (err) {
        const start = trimmed.indexOf('{');
        const end = trimmed.lastIndexOf('}');
        if (start !== -1 && end > start) {
          try {
            const parsed = JSON.parse(trimmed.slice(start, end + 1));
            if (parsed && typeof parsed === 'object') return parsed;
          } catch (innerErr) {
            /* ignore */
          }
        }
      }
      return null;
    },
    normalizeListItems(list) {
      if (!Array.isArray(list)) return list;
      return list.map((item) => ({
        ...item,
        id: item.id || createResumeId(),
        isHidden: !!item.isHidden,
      }));
    },
    mergeAiIntoResume(current, generated) {
      if (!generated || typeof generated !== 'object') {
        return current;
      }
      const merged = {
        ...current,
        ...generated,
        basics: {
          ...current.basics,
          ...(generated.basics || {}),
        },
        jobIntention: {
          ...(current.jobIntention || createEmptyResumeData().jobIntention),
          ...(generated.jobIntention || {}),
        },
        skills: generated.skills != null ? generated.skills : current.skills,
        hobbies: generated.hobbies != null ? generated.hobbies : current.hobbies,
      };
      if (generated.education) merged.education = this.normalizeListItems(generated.education);
      if (generated.work) merged.work = this.normalizeListItems(generated.work);
      if (generated.projects) merged.projects = this.normalizeListItems(generated.projects);
      if (generated.awards) merged.awards = this.normalizeListItems(generated.awards);
      if (generated.certifications) {
        merged.certifications = this.normalizeListItems(generated.certifications);
      }
      if (generated.portfolio) merged.portfolio = this.normalizeListItems(generated.portfolio);
      return merged;
    },
    applyAiGenerateResult(raw) {
      const payload = this.extractAiPayload(raw);
      if (payload == null || payload === '') {
        this.$message.error('AI 未返回有效内容');
        return;
      }
      if (typeof payload === 'object') {
        this.emitUpdate(this.mergeAiIntoResume(this.resumeData, payload));
        this.$message.success('简历生成成功！');
        return;
      }
      const parsed = this.tryParseResumeJson(payload);
      if (parsed) {
        this.emitUpdate(this.mergeAiIntoResume(this.resumeData, parsed));
        this.$message.success('简历生成成功！');
        return;
      }
      this.emitUpdate({
        ...this.resumeData,
        basics: { ...this.resumeData.basics, summary: String(payload) },
      });
      this.$message.success('简历生成成功！');
    },
    buildGeneratePrompt() {
      let prompt = this.aiPrompt.trim();
      if (this.uploadedFile) {
        const note = `[用户已上传简历文件: ${this.uploadedFile.name}，请结合下方文字说明生成结构化 JSON 简历数据]`;
        prompt = prompt ? `${note}\n${prompt}` : note;
      }
      return prompt;
    },
    async handleGenerateFullResume() {
      if (!this.aiPrompt.trim() && !this.uploadedFile) {
        this.$message.warning('请输入基本信息或上传简历文件');
        return;
      }
      this.isGenerating = true;
      try {
        const prompt = this.buildGeneratePrompt();
        const templateKey =
          this.template && this.template.id ? this.template.id : undefined;
        const res = await generateResumeAI({
          action: 'generate',
          prompt,
          resumeData: this.resumeData,
          templateKey,
        });
        this.applyAiGenerateResult(res);
      } catch (err) {
        const msg =
          err && err.message ? err.message : '生成失败，请重试';
        this.$message.error(msg);
      } finally {
        this.isGenerating = false;
      }
    },
    async handleAiOptimize(text, type, callback, loadingKey) {
      const content = (text || '').trim();
      if (!content) {
        this.$message.warning('请先填写内容再使用 AI 润色');
        return;
      }
      this.aiLoadingKey = loadingKey;
      const label = OPTIMIZE_LABELS[type] || '内容';
      try {
        const res = await generateResumeAI({
          action: 'optimize',
          prompt: `请优化以下${label}，保持事实不变、语言更专业简洁：\n${content}`,
          resumeData: this.resumeData,
        });
        const payload = this.extractAiPayload(res);
        const optimized =
          typeof payload === 'string'
            ? payload
            : payload && typeof payload.text === 'string'
            ? payload.text
            : payload && payload.basics && payload.basics.summary
            ? payload.basics.summary
            : null;
        if (optimized) {
          callback(optimized);
        } else {
          this.$message.error('AI 润色未返回有效内容');
        }
      } catch (err) {
        const msg =
          err && err.message ? err.message : 'AI 润色失败，请稍后重试';
        this.$message.error(msg);
      } finally {
        this.aiLoadingKey = null;
      }
    },
  },
};
</script>

<style scoped>
.resume-form-editor {
  max-width: 100%;
}

.resume-form-editor /deep/ .el-collapse-item__header {
  font-weight: 600;
  padding-left: 12px;
}

.resume-form-editor /deep/ .el-collapse-item__content {
  padding: 12px 16px 16px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #303133;
}

.section-title--ai {
  color: #6b21a8;
}

.section-title--ai i {
  margin-right: 6px;
}

.section-sub {
  font-size: 11px;
  font-weight: 400;
  color: #909399;
  margin-left: 8px;
}

.section-body--ai {
  border-top: 1px solid #f3e8ff;
}

.ai-generate-btn {
  background-color: #7c3aed;
  border-color: #7c3aed;
}

.field-label {
  display: block;
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
}

.field-label .optional,
.optional {
  color: #c0c4cc;
  font-weight: 400;
}

.hidden-file-input {
  display: none;
}

.avatar-col {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.avatar-box {
  width: 96px;
  height: 128px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background: #f5f7fa;
}

.avatar-box:hover {
  background: #eef1f6;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder-icon {
  font-size: 28px;
  color: #c0c4cc;
  margin-bottom: 4px;
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-box:hover .avatar-overlay {
  opacity: 1;
}

.relative-block {
  position: relative;
}

.ai-polish-btn {
  position: absolute;
  right: 8px;
  bottom: 8px;
  background: #f3e8ff;
  color: #6b21a8;
  border: none;
}

.list-toolbar {
  display: flex;
  justify-content: flex-end;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.list-item-card {
  position: relative;
  margin-bottom: 16px;
  padding: 12px 12px 12px 8px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
  transition: opacity 0.2s, border-color 0.2s;
}

.list-item-card.is-hidden {
  opacity: 0.65;
  background: #f0f0f0;
}

.list-item-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 2px;
  margin-bottom: 8px;
}

.drag-handle {
  cursor: grab;
  color: #909399;
  margin-right: auto;
  padding: 4px 8px;
  font-size: 16px;
}

.drag-handle:active {
  cursor: grabbing;
}

.list-item-fields {
  padding-left: 4px;
}

.text-red {
  color: #f56c6c;
}

.uploaded-file-name {
  font-size: 13px;
  color: #606266;
}

.mt-3 {
  margin-top: 12px;
}

.mt-4 {
  margin-top: 16px;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.gap-3 {
  gap: 12px;
}

.flex-wrap {
  flex-wrap: wrap;
}

.text-xs {
  font-size: 12px;
}

.text-gray-500 {
  color: #909399;
}

.flip-list-move {
  transition: transform 0.15s;
}
</style>
