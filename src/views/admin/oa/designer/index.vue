<template>
  <div class="designer" :class="{ 'is-compact': isCompact }">
    <!-- 顶部工具栏：窄屏自动换行 -->
    <div class="toolbar">
      <div class="toolbar-meta">
        <el-input
          v-model="processName"
          placeholder="请输入流程名称"
          class="toolbar-field toolbar-field--name"
          size="small"
          @input="onProcessNameInput"
        />
        <el-tooltip
          effect="dark"
          placement="bottom"
          :content="processKeyLocked
            ? '已保存后不可修改 processKey（须与 BPMN process id 一致）'
            : '建议：业务英文 + _process，如 purchase_process；输入名称可自动生成'"
        >
          <el-input
            v-model="processKey"
            placeholder="process_key"
            class="toolbar-field toolbar-field--key"
            size="small"
            :disabled="processKeyLocked"
            @change="onProcessKeyChange"
          />
        </el-tooltip>
        <el-select v-model="processMeta.category" placeholder="流程分类" clearable class="toolbar-field toolbar-field--cat" size="small">
          <el-option label="行政人事" value="HR" />
          <el-option label="财务报销" value="FINANCE" />
          <el-option label="采购合同" value="PROCUREMENT" />
          <el-option label="通用审批" value="GENERAL" />
        </el-select>
        <el-tag :type="isEdit ? 'warning' : 'success'" size="small">
          {{ isEdit ? '编辑模式' : '新建模式' }}
        </el-tag>
        <el-tag v-if="autoSaved" type="info" size="small">
          ✓ 已自动保存
        </el-tag>
      </div>
      <div class="toolbar-actions">
        <!-- 撤销/重做 -->
        <el-button-group class="toolbar-group">
          <el-button size="small" @click="undo" :disabled="!canUndo" title="撤销 (Ctrl+Z)">
            <i class="el-icon-refresh-left" style="transform:scaleX(-1)"></i><span class="btn-text"> 撤销</span>
          </el-button>
          <el-button size="small" @click="redo" :disabled="!canRedo" title="前进 (Ctrl+Y)">
            <i class="el-icon-refresh-left"></i><span class="btn-text"> 重做</span>
          </el-button>
        </el-button-group>

        <!-- 复制粘贴 -->
        <el-button-group class="toolbar-group">
          <el-button size="small" @click="copyElement" :disabled="!currentElement" title="复制 (Ctrl+C)">
            <i class="el-icon-document-copy"></i><span class="btn-text"> 复制</span>
          </el-button>
          <el-button size="small" @click="pasteElement" :disabled="!hasClipboard" title="粘贴 (Ctrl+V)">
            <i class="el-icon-document-add"></i><span class="btn-text"> 粘贴</span>
          </el-button>
          <el-button size="small" @click="deleteElement" :disabled="!currentElement || isStartOrEnd" title="删除 (Delete)">
            <i class="el-icon-delete"></i><span class="btn-text"> 删除</span>
          </el-button>
        </el-button-group>

        <el-button size="small" @click="zoomIn" title="放大">
          <i class="el-icon-zoom-in"></i>
        </el-button>
        <el-button size="small" @click="zoomOut" title="缩小">
          <i class="el-icon-zoom-out"></i>
        </el-button>
        <el-button size="small" @click="fitView" title="适应画布">
          <i class="el-icon-full-screen"></i>
        </el-button>
        <el-button size="small" @click="toggleGrid" :type="showGrid ? 'primary' : ''" title="显示网格">
          <i class="el-icon-s-grid"></i>
        </el-button>
        <el-button size="small" @click="refresh" title="刷新">
          <i class="el-icon-refresh"></i>
        </el-button>

        <el-button size="small" @click="saveDraft" :loading="saving">
          <i class="el-icon-folder-opened"></i><span class="btn-text"> 保存草稿</span>
        </el-button>
        <el-button size="small" @click="openSourceViewer">
          <i class="el-icon-view"></i><span class="btn-text"> 查看源码</span>
        </el-button>
        <el-dropdown size="small" split-button @click="exportXml" @command="onExportCommand" class="toolbar-export">
          <i class="el-icon-download"></i><span class="btn-text"> 下载</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="bpmn">BPMN XML（.bpmn）</el-dropdown-item>
            <el-dropdown-item command="svg">流程图 SVG</el-dropdown-item>
            <el-dropdown-item command="json">节点配置 JSON</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <!-- 隐藏画布右下角 bpmn.io 标识；偏好写入 localStorage，详情页查看器同样生效 -->
        <span class="bpmn-brand-switch" title="控制画布 bpmn.io 品牌标识；开源协议仍建议保留署名">
          <span class="bpmn-brand-switch__label">品牌</span>
          <el-switch
            v-model="showBpmnBrand"
            @change="applyBpmnBrand"
          />
        </span>
        <el-button type="primary" size="small" @click="publish" :loading="publishing">
          <i class="el-icon-video-play"></i><span class="btn-text"> 发布</span>
        </el-button>
        <el-button size="small" @click="$router.push('/oa/process')">
          <i class="el-icon-back"></i><span class="btn-text"> 返回</span>
        </el-button>
      </div>
    </div>

    <div class="designer-workspace">
      <!-- 左：节点面板；< md 时改为左侧抽屉 -->
      <div
        class="designer-side designer-side--left"
        :class="{ 'is-open': leftPanelOpen }"
      >
        <el-card shadow="hover" style="height:100%;overflow-y:auto" :body-style="{padding:'10px'}">
          <div slot="header" class="panel-header">
            <span>📦 任务节点</span>
            <el-button
              v-if="isCompact"
              type="text"
              icon="el-icon-close"
              class="side-close-btn"
              @click="closeSidePanels"
            />
          </div>
          <div class="palette">
            <div v-for="item in paletteItems" :key="item.type"
                  class="palette-item" draggable="true"
                  @dragstart="onDragStart($event, item.type)"
                  @click="addNode(item.type)">
              <span class="palette-icon">{{ item.icon }}</span>
              <span class="palette-label">{{ item.label }}</span>
            </div>
          </div>

          <el-divider content-position="left" style="margin:12px 0">网关</el-divider>
          <div class="palette">
            <div v-for="item in gatewayItems" :key="item.type"
                  class="palette-item" draggable="true"
                  @dragstart="onDragStart($event, item.type)"
                  @click="addNode(item.type)">
              <span class="palette-icon">{{ item.icon }}</span>
              <span class="palette-label">{{ item.label }}</span>
            </div>
          </div>

          <el-divider content-position="left" style="margin:12px 0">事件</el-divider>
          <div class="palette">
            <div v-for="item in eventItems" :key="item.type"
                  class="palette-item" draggable="true"
                  @dragstart="onDragStart($event, item.type)"
                  @click="addNode(item.type)">
              <span class="palette-icon">{{ item.icon }}</span>
              <span class="palette-label">{{ item.label }}</span>
            </div>
          </div>

          <el-divider content-position="left" style="margin:12px 0">常用模板</el-divider>
          <div class="template-list">
            <div v-for="tpl in quickTemplates" :key="tpl.key"
                  class="template-item" @click="loadTemplate(tpl.key)">
              <i :class="tpl.icon"></i> {{ tpl.name }}
            </div>
          </div>
        </el-card>
      </div>

      <!-- 中：画布（< md 下占满；节点/属性抽屉滑出） -->
      <section class="designer-canvas-wrap">
        <div class="compact-panel-toggles">
          <el-button size="mini" icon="el-icon-s-grid" @click="openLeftPanel">节点</el-button>
          <el-button size="mini" icon="el-icon-setting" @click="openRightPanel">属性</el-button>
        </div>
        <el-card shadow="hover" class="canvas-card" :body-style="{ padding: '0', height: '100%', position: 'relative' }">
          <div slot="header" class="canvas-header">
            <span>🎨 流程画布 <small class="canvas-guide">拖动节点移动；选中后拖右侧箭头连线</small></span>
            <el-tag size="small" type="info">{{ elementCount }} 个节点</el-tag>
          </div>
          <div ref="canvas" class="canvas-container"
                :class="{ 'show-grid': showGrid }"
                @drop="onDrop"
                @dragover="onDragOver"
                @dragenter.prevent />
        </el-card>
      </section>

      <!-- 右：属性面板；compact 时改为右侧抽屉 -->
      <div
        class="designer-side designer-side--right"
        :class="{ 'is-open': rightPanelOpen }"
      >
        <el-card shadow="hover" style="height:100%;overflow-y:auto">
          <div slot="header" class="panel-header">
            <template v-if="currentElement">
              <span>
                ⚙️ 节点属性
                <el-tag size="mini" type="warning" style="margin-left:8px">
                  {{ getElementTypeName(currentElement.type) }}
                </el-tag>
              </span>
            </template>
            <template v-else>
              <span>
                📋 流程属性
                <el-tag size="mini" type="info" style="margin-left:8px">基本信息</el-tag>
              </span>
            </template>
            <el-button
              v-if="isCompact"
              type="text"
              icon="el-icon-close"
              class="side-close-btn"
              @click="closeSidePanels"
            />
          </div>

          <!-- 未选中节点：流程级配置 -->
          <el-form
            v-if="!currentElement"
            ref="processForm"
            :model="processFormModel"
            label-width="120px"
            size="small"
            class="process-props-form"
          >
            <el-divider content-position="left">基本信息</el-divider>
            <el-form-item label="流程名称" required>
              <el-input
                v-model="processName"
                placeholder="请输入流程名称"
                @input="onProcessNameInput"
              />
            </el-form-item>
            <el-form-item label="processKey" required>
              <el-input
                v-model="processKey"
                placeholder="如 purchase_process"
                :disabled="processKeyLocked"
                @change="onProcessKeyChange"
              />
              <span class="tip-sub">
                {{ processKeyLocked
                  ? '已保存后不可修改，须与 BPMN process id 一致'
                  : '建议：业务英文 + _process；输入名称可自动生成' }}
              </span>
            </el-form-item>
            <el-form-item label="流程分类">
              <el-select v-model="processMeta.category" placeholder="请选择分类" clearable style="width:100%">
                <el-option label="行政人事" value="HR" />
                <el-option label="财务报销" value="FINANCE" />
                <el-option label="采购合同" value="PROCUREMENT" />
                <el-option label="通用审批" value="GENERAL" />
              </el-select>
            </el-form-item>
            <el-form-item label="表单 Key">
              <el-input v-model="processMeta.formKey" placeholder="可选，如 leave_form" />
            </el-form-item>
            <el-form-item label="流程描述">
              <el-input
                v-model="processMeta.description"
                type="textarea"
                :rows="3"
                placeholder="简要说明流程用途与适用场景"
              />
            </el-form-item>

            <el-divider content-position="left">发起表单设计</el-divider>
            <form-schema-editor v-model="processMeta.formSchema" />

            <el-divider content-position="left">状态</el-divider>
            <el-form-item label="编辑模式">
              <el-tag :type="isEdit ? 'warning' : 'success'" size="small">
                {{ isEdit ? '编辑已有流程' : '新建流程' }}
              </el-tag>
            </el-form-item>
            <el-form-item v-if="processId" label="业务 ID">
              <el-input :value="processId" disabled />
            </el-form-item>

            <el-alert
              type="info"
              :closable="false"
              show-icon
              title="点击画布上的节点可配置审批人、条件等节点属性；点击空白处返回本面板"
              style="margin-top:8px"
            />
          </el-form>

          <el-form v-else ref="nodeForm" :model="nodeConfig" label-width="120px" size="small">

            <!-- 基础信息 -->
            <el-divider content-position="left">基础信息</el-divider>
            <el-form-item label="节点ID">
              <el-input v-model="nodeConfig.id" disabled />
            </el-form-item>
            <!-- <el-form-item label="流程类型">
              <el-input v-model="nodeConfig.processKey" disabled />
            </el-form-item> -->
            <el-form-item label="节点名称">
              <el-input v-model="nodeConfig.name" @change="updateNodeName" placeholder="请输入节点名称" />
            </el-form-item>
            <el-form-item label="节点描述">
              <el-input v-model="nodeConfig.documentation" type="textarea" :rows="2" placeholder="可选备注" />
            </el-form-item>

            <!-- 审批人配置（仅 userTask） -->
            <template v-if="isUserTask">
              <el-divider content-position="left">审批人配置</el-divider>

              <el-form-item label="审批人类型">
                <el-select v-model="nodeConfig.assigneeType" style="width:100%">
                  <el-option label="指定用户" value="USER" />
                  <el-option label="按角色" value="ROLE" />
                  <el-option label="指定部门成员" value="DEPT" />
                  <el-option label="部门负责人" value="DEPT_LEADER" />
                  <el-option label="直属上级" value="DIRECT_LEADER" />
                  <el-option label="发起人自办" value="INITIATOR" />
                  <el-option label="脚本计算" value="SCRIPT" />
                </el-select>
              </el-form-item>

              <el-form-item label="指定用户" v-if="nodeConfig.assigneeType === 'USER'">
                <el-select v-model="nodeConfig.assigneeUsers" multiple filterable style="width:100%">
                  <el-option v-for="u in allUsers" :key="u.id"
                              :label="u.realName + '(' + u.username + ')'" :value="String(u.id)" />
                </el-select>
              </el-form-item>

              <el-form-item label="指定部门" v-if="nodeConfig.assigneeType === 'DEPT'">
                <el-select v-model="nodeConfig.assigneeDepts" multiple filterable style="width:100%" placeholder="选择部门">
                  <el-option v-for="d in allDepts" :key="d.id" :label="d.name" :value="String(d.id)" />
                </el-select>
              </el-form-item>

              <el-form-item label="选择角色" v-if="nodeConfig.assigneeType === 'ROLE'">
                <el-select v-model="nodeConfig.assigneeRoles" multiple style="width:100%">
                  <el-option v-for="r in allRoles" :key="r.code"
                              :label="r.name" :value="r.code" />
                </el-select>
              </el-form-item>

              <el-form-item label="上级层级" v-if="nodeConfig.assigneeType === 'DIRECT_LEADER'">
                <el-input-number v-model="nodeConfig.leaderLevel" :min="1" :max="10" /> 级
              </el-form-item>

              <el-form-item label="审批人脚本" v-if="nodeConfig.assigneeType === 'SCRIPT'">
                <el-input
                  v-model="nodeConfig.scriptContent"
                  type="textarea"
                  :rows="3"
                  placeholder="javascript，可用 initiatorId/deptId，返回用户ID或逗号分隔字符串"
                />
              </el-form-item>

              <el-form-item label="会签规则">
                <el-radio-group v-model="nodeConfig.approvalMode" size="small">
                  <el-radio-button label="SINGLE">单人审批</el-radio-button>
                  <el-radio-button label="MULTI">会签(全部)</el-radio-button>
                  <el-radio-button label="ANY">或签(任一)</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="通过比例" v-if="nodeConfig.approvalMode === 'MULTI'">
                <el-slider v-model="nodeConfig.passRate" :min="1" :max="100" show-input :show-stops="false" />
              </el-form-item>

              <el-divider content-position="left">驳回策略</el-divider>

              <el-form-item label="驳回方式">
                <el-select v-model="nodeConfig.rejectStrategy" style="width:100%">
                  <el-option label="退回上一节点" value="BACK_PREVIOUS" />
                  <el-option label="退回发起人" value="BACK_START" />
                  <el-option label="退回指定节点" value="BACK_SPECIFIED" />
                  <el-option label="直接结束流程" value="END" />
                  <el-option label="不允许驳回" value="NO_REJECT" />
                </el-select>
              </el-form-item>

              <el-form-item label="目标节点ID" v-if="nodeConfig.rejectStrategy === 'BACK_SPECIFIED'">
                <el-input v-model="nodeConfig.rejectTargetNode" placeholder="如 Task_1" />
              </el-form-item>

              <el-form-item label="超时设置">
                <el-input-number v-model="nodeConfig.timeoutHours" :min="0" :max="720" /> 小时
                <br><span class="tip-sub">0表示不超时</span>
              </el-form-item>

              <el-form-item label="超时操作">
                <el-select v-model="nodeConfig.timeoutAction" style="width:100%">
                  <el-option label="自动通过" value="AUTO_APPROVE" />
                  <el-option label="自动驳回" value="AUTO_REJECT" />
                  <el-option label="发送催办" value="NOTIFY" />
                  <el-option label="仅记录" value="NONE" />
                </el-select>
              </el-form-item>

              <el-form-item label="催办次数">
                <el-input-number v-model="nodeConfig.remindCount" :min="0" :max="10" />
                <br><span class="tip-sub">超时前催办次数</span>
              </el-form-item>
            </template>

            <!-- ServiceTask / ScriptTask：API 与脚本嵌入 -->
            <template v-if="isServiceOrScriptTask">
              <el-divider content-position="left">服务任务配置</el-divider>
              <el-form-item label="任务类型">
                <el-radio-group v-model="nodeConfig.serviceType">
                  <el-radio label="HTTP_API">HTTP API</el-radio>
                  <el-radio label="SCRIPT">代码脚本</el-radio>
                </el-radio-group>
                <div class="tip-sub">预留：后续可扩展 AI_AGENT 等编排类型</div>
              </el-form-item>

              <template v-if="nodeConfig.serviceType === 'HTTP_API'">
                <el-form-item label="请求方法">
                  <el-select v-model="nodeConfig.httpMethod" style="width:100%">
                    <el-option label="GET" value="GET" />
                    <el-option label="POST" value="POST" />
                    <el-option label="PUT" value="PUT" />
                    <el-option label="DELETE" value="DELETE" />
                    <el-option label="PATCH" value="PATCH" />
                  </el-select>
                </el-form-item>
                <el-form-item label="API 地址">
                  <el-input v-model="nodeConfig.apiUrl" placeholder="https://api.example.com/hook/${processKey}" />
                  <div class="tip-sub">支持 ${变量名} 引用流程变量</div>
                </el-form-item>
                <el-form-item label="请求头 JSON">
                  <el-input v-model="nodeConfig.headersJson" type="textarea" :rows="2"
                            placeholder='{"Authorization":"Bearer xxx","Content-Type":"application/json"}' />
                </el-form-item>
                <el-form-item label="请求体模板">
                  <el-input v-model="nodeConfig.bodyTemplate" type="textarea" :rows="4"
                            placeholder='{"days":${days},"title":"${title}"}' />
                </el-form-item>
              </template>

              <template v-else>
                <el-form-item label="脚本语言">
                  <el-select v-model="nodeConfig.scriptLanguage" style="width:100%">
                    <el-option label="JavaScript" value="javascript" />
                    <el-option label="Groovy" value="groovy" />
                  </el-select>
                </el-form-item>
                <el-form-item label="脚本内容">
                  <el-input v-model="nodeConfig.scriptContent" type="textarea" :rows="6"
                            placeholder="// 可用 vars / 流程变量&#10;vars.approvedAmount = (vars.amount || 0) * 0.9;&#10;'ok';" />
                </el-form-item>
              </template>

              <el-form-item label="结果变量">
                <el-input v-model="nodeConfig.resultVariable" placeholder="serviceResult" />
              </el-form-item>

              <el-form-item label="模拟变量">
                <el-input v-model="serviceTestSampleJson" type="textarea" :rows="2"
                          placeholder='{"days":3,"amount":1000,"title":"测试"}' />
              </el-form-item>
              <el-form-item>
                <el-button type="warning" size="small" :loading="serviceTesting" @click="testServiceTaskConfig">
                  <i class="el-icon-video-play"></i> 测试执行
                </el-button>
              </el-form-item>
              <el-form-item v-if="serviceTestResult" label="测试结果">
                <pre class="test-result">{{ serviceTestResult }}</pre>
              </el-form-item>
            </template>

            <!-- 条件属于 BPMN 连线，而不是网关节点本身 -->
            <template v-if="isSequenceFlow">
              <el-divider content-position="left">条件配置</el-divider>
              <el-form-item label="分支名称">
                <el-input v-model="nodeConfig.name" @change="updateNodeName" placeholder="如：金额大于 5000" />
              </el-form-item>
              <el-form-item label="条件表达式">
                <el-input v-model="nodeConfig.conditionExpression" type="textarea" :rows="3"
                          placeholder="如：${days <= 3} 或 ${amount > 5000}" />
              </el-form-item>
              <div class="condition-help">
                <el-alert type="info" :closable="false" show-icon>
                  <template slot="title">
                    常用条件示例：<br>
                    • 天数判断：${days &lt;= 3}<br>
                    • 金额判断：${amount &gt; 5000}<br>
                    • 角色判断：${role &equals; 'MANAGER'}<br>
                    • 多条件：${days &gt; 3 && amount &gt; 10000}
                  </template>
                </el-alert>
              </div>
            </template>

            <!-- 开始/结束事件 -->
            <template v-if="isStartEvent || isEndEvent">
              <el-divider content-position="left">事件配置</el-divider>
              <el-form-item label="事件类型">
                <el-select v-if="isStartEvent" v-model="nodeConfig.eventType" style="width:100%">
                  <el-option label="普通开始" value="none" />
                  <el-option label="定时开始" value="timer" />
                  <el-option label="消息开始" value="message" />
                </el-select>
                <el-select v-if="isEndEvent" v-model="nodeConfig.eventType" style="width:100%">
                  <el-option label="普通结束" value="none" />
                  <el-option label="错误结束" value="error" />
                  <el-option label="取消结束" value="cancel" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="nodeConfig.eventType === 'timer'" label="定时表达式">
                <el-input v-model="nodeConfig.timerExpression" placeholder="如: R3/PT10H" />
                <br><span class="tip-sub">ISO 8601 格式</span>
              </el-form-item>
            </template>

            <el-button type="primary" size="small" style="width:100%;margin-top:16px"
                        @click="saveNodeConfig" :loading="savingNode">
              <i class="el-icon-check"></i> 保存节点配置
            </el-button>
            <el-button size="small" style="width:100%;margin-top:8px"
                        @click="deleteElement" :disabled="isStartOrEnd" type="danger">
              <i class="el-icon-delete"></i> 删除此节点
            </el-button>
          </el-form>
        </el-card>
      </div>

      <div
        v-if="isCompact && (leftPanelOpen || rightPanelOpen)"
        class="designer-side-mask"
        @click="closeSidePanels"
      />
    </div>

    <!-- BPMN 源码查看弹窗 -->
    <el-dialog
      :visible.sync="sourceViewerVisible"
      title="流程源码"
      width="80%"
      top="5vh"
      append-to-body
      class="source-viewer-dialog"
    >
      <el-tabs v-model="sourceViewerTab">
        <el-tab-pane label="BPMN XML" name="bpmn">
          <el-input
            type="textarea"
            :rows="22"
            v-model="sourceViewerBpmn"
            readonly
            class="source-code"
          />
        </el-tab-pane>
        <el-tab-pane label="节点配置 JSON" name="nodes">
          <el-input
            type="textarea"
            :rows="22"
            v-model="sourceViewerNodes"
            readonly
            class="source-code"
          />
        </el-tab-pane>
        <el-tab-pane label="表单 Schema" name="form">
          <el-input
            type="textarea"
            :rows="22"
            :value="processMeta.formSchema || '{}'"
            readonly
            class="source-code"
          />
        </el-tab-pane>
      </el-tabs>
      <div slot="footer">
        <el-button size="small" @click="copySourceViewer">复制当前页</el-button>
        <el-button size="small" type="primary" @click="downloadCurrentSource">下载当前页</el-button>
        <el-button size="small" @click="sourceViewerVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import BpmnModeler from 'bpmn-js/lib/Modeler'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import { saveDraft, publish as pubApi, getDetail, getBpmn, testServiceTask, createFromTemplate } from '@/api/oa/designer'
import { loadOaUserOptions, loadOaDeptOptions, loadOaRoleOptions } from '@/api/oa/org'
import FormSchemaEditor from '../components/FormSchemaEditor.vue'
import { isOaBpmnBrandVisible, applyOaBpmnBrand } from '@/utils/oaBpmnBrand'

/** Element UI md 断点：小于 992 时侧栏收起为左右抽屉 */
const DESIGNER_COMPACT_MQ = '(max-width: 991px)'

// 基础 BPMN 模板 - 简洁格式
const BASE_BPMN = '<?xml version="1.0" encoding="UTF-8"?>' +
'<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
'xmlns:di="http://www.omg.org/spec/DD/20100524/DI" ' +
'id="Definitions_1" targetNamespace="http://oa.com">' +
'<bpmn:process id="Process_1" name="新流程" isExecutable="true">' +
'<bpmn:startEvent id="StartEvent_1" name="开始"/>' +
'<bpmn:endEvent id="EndEvent_1" name="结束"/>' +
'<bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="EndEvent_1"/>' +
'</bpmn:process>' +
'<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
'<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">' +
'<bpmndi:BPMNShape id="BPMNShape_StartEvent_1" bpmnElement="StartEvent_1">' +
'<dc:Bounds x="150" y="100" width="36" height="36"/>' +
'</bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="BPMNShape_EndEvent_1" bpmnElement="EndEvent_1">' +
'<dc:Bounds x="350" y="100" width="36" height="36"/>' +
'</bpmndi:BPMNShape>' +
'<bpmndi:BPMNEdge id="BPMNEdge_Flow_1" bpmnElement="Flow_1">' +
'<di:waypoint x="186" y="118"/>' +
'<di:waypoint x="350" y="118"/>' +
'</bpmndi:BPMNEdge>' +
'</bpmndi:BPMNPlane>' +
'</bpmndi:BPMNDiagram>' +
'</bpmn:definitions>'

// 快捷模板 - 请假审批
const LEAVE_TEMPLATE = '<?xml version="1.0" encoding="UTF-8"?>' +
'<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
'xmlns:di="http://www.omg.org/spec/DD/20100524/DI" ' +
'xmlns:flowable="http://flowable.org/bpmn" ' +
'targetNamespace="http://oa.com">' +
'<process id="leave_process" name="请假审批流程" isExecutable="true">' +
'<startEvent id="StartEvent_1"/>' +
'<userTask id="Task_1" name="直属领导审批" flowable:assigneeType="DIRECT_LEADER"/>' +
'<exclusiveGateway id="Gateway_1" name="天数判断"/>' +
'<userTask id="Task_2" name="部门经理审批"/>' +
'<userTask id="Task_3" name="总经理审批"/>' +
'<endEvent id="EndEvent_1"/>' +
'<sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>' +
'<sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gateway_1"/>' +
'<sequenceFlow id="Flow_3" name="≤3天" sourceRef="Gateway_1" targetRef="EndEvent_1">' +
'<conditionExpression>${days &lt;= 3}</conditionExpression></sequenceFlow>' +
'<sequenceFlow id="Flow_4" name=">3天" sourceRef="Gateway_1" targetRef="Task_2">' +
'<conditionExpression>${days &gt; 3}</conditionExpression></sequenceFlow>' +
'<sequenceFlow id="Flow_5" sourceRef="Task_2" targetRef="Task_3"/>' +
'<sequenceFlow id="Flow_6" sourceRef="Task_3" targetRef="EndEvent_1"/>' +
'</process>' +
'<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
'<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="leave_process">' +
'<bpmndi:BPMNShape id="Leave_Start_di" bpmnElement="StartEvent_1"><dc:Bounds x="100" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="Leave_Task1_di" bpmnElement="Task_1"><dc:Bounds x="190" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="Leave_Gateway_di" bpmnElement="Gateway_1"><dc:Bounds x="360" y="150" width="50" height="50"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="Leave_Task2_di" bpmnElement="Task_2"><dc:Bounds x="470" y="250" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="Leave_Task3_di" bpmnElement="Task_3"><dc:Bounds x="640" y="250" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="Leave_End_di" bpmnElement="EndEvent_1"><dc:Bounds x="820" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNEdge id="Leave_Flow1_di" bpmnElement="Flow_1"><di:waypoint x="136" y="178"/><di:waypoint x="190" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="Leave_Flow2_di" bpmnElement="Flow_2"><di:waypoint x="300" y="175"/><di:waypoint x="360" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="Leave_Flow3_di" bpmnElement="Flow_3"><di:waypoint x="410" y="175"/><di:waypoint x="820" y="178"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="Leave_Flow4_di" bpmnElement="Flow_4"><di:waypoint x="385" y="200"/><di:waypoint x="525" y="250"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="Leave_Flow5_di" bpmnElement="Flow_5"><di:waypoint x="580" y="290"/><di:waypoint x="640" y="290"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="Leave_Flow6_di" bpmnElement="Flow_6"><di:waypoint x="750" y="290"/><di:waypoint x="838" y="196"/></bpmndi:BPMNEdge>' +
'</bpmndi:BPMNPlane>' +
'</bpmndi:BPMNDiagram>' +
'</definitions>'

// 快捷模板 - 报销审批
const EXPENSE_TEMPLATE = '<?xml version="1.0" encoding="UTF-8"?>' +
'<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
'xmlns:di="http://www.omg.org/spec/DD/20100524/DI" ' +
'xmlns:flowable="http://flowable.org/bpmn" ' +
'targetNamespace="http://oa.com">' +
'<process id="expense_process" name="报销审批流程" isExecutable="true">' +
'<startEvent id="StartEvent_1"/>' +
'<userTask id="Task_1" name="部门审批"/>' +
'<exclusiveGateway id="Gateway_1" name="金额判断"/>' +
'<userTask id="Task_2" name="财务审批"/>' +
'<userTask id="Task_3" name="总经理审批"/>' +
'<endEvent id="EndEvent_1"/>' +
'<sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>' +
'<sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gateway_1"/>' +
'<sequenceFlow id="Flow_3" name="≤5000" sourceRef="Gateway_1" targetRef="Task_2">' +
'<conditionExpression>${amount &lt;= 5000}</conditionExpression></sequenceFlow>' +
'<sequenceFlow id="Flow_4" name=">5000" sourceRef="Gateway_1" targetRef="Task_3">' +
'<conditionExpression>${amount &gt; 5000}</conditionExpression></sequenceFlow>' +
'<sequenceFlow id="Flow_5" sourceRef="Task_2" targetRef="EndEvent_1"/>' +
'<sequenceFlow id="Flow_6" sourceRef="Task_3" targetRef="EndEvent_1"/>' +
'</process>' +
'<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
'<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="expense_process">' +
'<bpmndi:BPMNShape id="Expense_Start_di" bpmnElement="StartEvent_1"><dc:Bounds x="100" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="Expense_Task1_di" bpmnElement="Task_1"><dc:Bounds x="190" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="Expense_Gateway_di" bpmnElement="Gateway_1"><dc:Bounds x="360" y="150" width="50" height="50"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="Expense_Task2_di" bpmnElement="Task_2"><dc:Bounds x="470" y="250" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="Expense_Task3_di" bpmnElement="Task_3"><dc:Bounds x="640" y="250" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="Expense_End_di" bpmnElement="EndEvent_1"><dc:Bounds x="820" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNEdge id="Expense_Flow1_di" bpmnElement="Flow_1"><di:waypoint x="136" y="178"/><di:waypoint x="190" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="Expense_Flow2_di" bpmnElement="Flow_2"><di:waypoint x="300" y="175"/><di:waypoint x="360" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="Expense_Flow3_di" bpmnElement="Flow_3"><di:waypoint x="385" y="200"/><di:waypoint x="525" y="250"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="Expense_Flow4_di" bpmnElement="Flow_4"><di:waypoint x="410" y="175"/><di:waypoint x="640" y="290"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="Expense_Flow5_di" bpmnElement="Flow_5"><di:waypoint x="580" y="290"/><di:waypoint x="820" y="178"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="Expense_Flow6_di" bpmnElement="Flow_6"><di:waypoint x="750" y="290"/><di:waypoint x="820" y="178"/></bpmndi:BPMNEdge>' +
'</bpmndi:BPMNPlane>' +
'</bpmndi:BPMNDiagram>' +
'</definitions>'

// 快捷模板 - 采购审批
const PURCHASE_TEMPLATE = '<?xml version="1.0" encoding="UTF-8"?>' +
'<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
'xmlns:di="http://www.omg.org/spec/DD/20100524/DI" ' +
'xmlns:flowable="http://flowable.org/bpmn" ' +
'targetNamespace="http://oa.com">' +
'<process id="purchase_process" name="采购审批流程" isExecutable="true">' +
'<startEvent id="StartEvent_1"/>' +
'<userTask id="Task_1" name="部门审批"/>' +
'<exclusiveGateway id="Gateway_1" name="金额判断"/>' +
'<userTask id="Task_2" name="采购负责人审批"/>' +
'<userTask id="Task_3" name="总经理审批"/>' +
'<endEvent id="EndEvent_1"/>' +
'<sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>' +
'<sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gateway_1"/>' +
'<sequenceFlow id="Flow_3" name="≤10000" sourceRef="Gateway_1" targetRef="Task_2">' +
'<conditionExpression>${amount &lt;= 10000}</conditionExpression></sequenceFlow>' +
'<sequenceFlow id="Flow_4" name=">10000" sourceRef="Gateway_1" targetRef="Task_3">' +
'<conditionExpression>${amount &gt; 10000}</conditionExpression></sequenceFlow>' +
'<sequenceFlow id="Flow_5" sourceRef="Task_2" targetRef="EndEvent_1"/>' +
'<sequenceFlow id="Flow_6" sourceRef="Task_3" targetRef="EndEvent_1"/>' +
'</process>' +
'<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
'<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="purchase_process">' +
'<bpmndi:BPMNShape id="P_Start" bpmnElement="StartEvent_1"><dc:Bounds x="100" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="P_Task1" bpmnElement="Task_1"><dc:Bounds x="190" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="P_Gw" bpmnElement="Gateway_1"><dc:Bounds x="360" y="150" width="50" height="50"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="P_Task2" bpmnElement="Task_2"><dc:Bounds x="470" y="250" width="120" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="P_Task3" bpmnElement="Task_3"><dc:Bounds x="640" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="P_End" bpmnElement="EndEvent_1"><dc:Bounds x="820" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNEdge id="P_F1" bpmnElement="Flow_1"><di:waypoint x="136" y="178"/><di:waypoint x="190" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="P_F2" bpmnElement="Flow_2"><di:waypoint x="300" y="175"/><di:waypoint x="360" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="P_F3" bpmnElement="Flow_3"><di:waypoint x="385" y="200"/><di:waypoint x="530" y="250"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="P_F4" bpmnElement="Flow_4"><di:waypoint x="410" y="175"/><di:waypoint x="640" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="P_F5" bpmnElement="Flow_5"><di:waypoint x="590" y="290"/><di:waypoint x="838" y="196"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="P_F6" bpmnElement="Flow_6"><di:waypoint x="750" y="175"/><di:waypoint x="820" y="178"/></bpmndi:BPMNEdge>' +
'</bpmndi:BPMNPlane></bpmndi:BPMNDiagram></definitions>'

// 快捷模板 - 合同审批
const CONTRACT_TEMPLATE = '<?xml version="1.0" encoding="UTF-8"?>' +
'<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
'xmlns:di="http://www.omg.org/spec/DD/20100524/DI" ' +
'xmlns:flowable="http://flowable.org/bpmn" ' +
'targetNamespace="http://oa.com">' +
'<process id="contract_process" name="合同审批流程" isExecutable="true">' +
'<startEvent id="StartEvent_1"/>' +
'<userTask id="Task_1" name="法务审核"/>' +
'<userTask id="Task_2" name="财务确认"/>' +
'<userTask id="Task_3" name="总经理审批"/>' +
'<endEvent id="EndEvent_1"/>' +
'<sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>' +
'<sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Task_2"/>' +
'<sequenceFlow id="Flow_3" sourceRef="Task_2" targetRef="Task_3"/>' +
'<sequenceFlow id="Flow_4" sourceRef="Task_3" targetRef="EndEvent_1"/>' +
'</process>' +
'<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
'<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="contract_process">' +
'<bpmndi:BPMNShape id="C_Start" bpmnElement="StartEvent_1"><dc:Bounds x="100" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="C_Task1" bpmnElement="Task_1"><dc:Bounds x="200" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="C_Task2" bpmnElement="Task_2"><dc:Bounds x="370" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="C_Task3" bpmnElement="Task_3"><dc:Bounds x="540" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="C_End" bpmnElement="EndEvent_1"><dc:Bounds x="720" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNEdge id="C_F1" bpmnElement="Flow_1"><di:waypoint x="136" y="178"/><di:waypoint x="200" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="C_F2" bpmnElement="Flow_2"><di:waypoint x="310" y="175"/><di:waypoint x="370" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="C_F3" bpmnElement="Flow_3"><di:waypoint x="480" y="175"/><di:waypoint x="540" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="C_F4" bpmnElement="Flow_4"><di:waypoint x="650" y="175"/><di:waypoint x="720" y="178"/></bpmndi:BPMNEdge>' +
'</bpmndi:BPMNPlane></bpmndi:BPMNDiagram></definitions>'

// 快捷模板 - 出差审批
const TRAVEL_TEMPLATE = '<?xml version="1.0" encoding="UTF-8"?>' +
'<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
'xmlns:di="http://www.omg.org/spec/DD/20100524/DI" ' +
'xmlns:flowable="http://flowable.org/bpmn" ' +
'targetNamespace="http://oa.com">' +
'<process id="travel_process" name="出差审批流程" isExecutable="true">' +
'<startEvent id="StartEvent_1"/>' +
'<userTask id="Task_1" name="直属领导审批"/>' +
'<exclusiveGateway id="Gateway_1" name="天数判断"/>' +
'<userTask id="Task_2" name="部门经理审批"/>' +
'<userTask id="Task_3" name="财务备案"/>' +
'<endEvent id="EndEvent_1"/>' +
'<sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>' +
'<sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Gateway_1"/>' +
'<sequenceFlow id="Flow_3" name="≤2天" sourceRef="Gateway_1" targetRef="Task_3">' +
'<conditionExpression>${days &lt;= 2}</conditionExpression></sequenceFlow>' +
'<sequenceFlow id="Flow_4" name=">2天" sourceRef="Gateway_1" targetRef="Task_2">' +
'<conditionExpression>${days &gt; 2}</conditionExpression></sequenceFlow>' +
'<sequenceFlow id="Flow_5" sourceRef="Task_2" targetRef="Task_3"/>' +
'<sequenceFlow id="Flow_6" sourceRef="Task_3" targetRef="EndEvent_1"/>' +
'</process>' +
'<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
'<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="travel_process">' +
'<bpmndi:BPMNShape id="T_Start" bpmnElement="StartEvent_1"><dc:Bounds x="100" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="T_Task1" bpmnElement="Task_1"><dc:Bounds x="190" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="T_Gw" bpmnElement="Gateway_1"><dc:Bounds x="360" y="150" width="50" height="50"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="T_Task2" bpmnElement="Task_2"><dc:Bounds x="470" y="250" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="T_Task3" bpmnElement="Task_3"><dc:Bounds x="640" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="T_End" bpmnElement="EndEvent_1"><dc:Bounds x="820" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNEdge id="T_F1" bpmnElement="Flow_1"><di:waypoint x="136" y="178"/><di:waypoint x="190" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="T_F2" bpmnElement="Flow_2"><di:waypoint x="300" y="175"/><di:waypoint x="360" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="T_F3" bpmnElement="Flow_3"><di:waypoint x="410" y="175"/><di:waypoint x="640" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="T_F4" bpmnElement="Flow_4"><di:waypoint x="385" y="200"/><di:waypoint x="525" y="250"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="T_F5" bpmnElement="Flow_5"><di:waypoint x="580" y="290"/><di:waypoint x="695" y="215"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="T_F6" bpmnElement="Flow_6"><di:waypoint x="750" y="175"/><di:waypoint x="820" y="178"/></bpmndi:BPMNEdge>' +
'</bpmndi:BPMNPlane></bpmndi:BPMNDiagram></definitions>'

// 快捷模板 - 调岗/离职审批
const TRANSFER_TEMPLATE = '<?xml version="1.0" encoding="UTF-8"?>' +
'<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
'xmlns:di="http://www.omg.org/spec/DD/20100524/DI" ' +
'xmlns:flowable="http://flowable.org/bpmn" ' +
'targetNamespace="http://oa.com">' +
'<process id="transfer_process" name="调岗离职审批流程" isExecutable="true">' +
'<startEvent id="StartEvent_1"/>' +
'<userTask id="Task_1" name="原部门审批"/>' +
'<userTask id="Task_2" name="人事审批"/>' +
'<userTask id="Task_3" name="总经理审批"/>' +
'<endEvent id="EndEvent_1"/>' +
'<sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1"/>' +
'<sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="Task_2"/>' +
'<sequenceFlow id="Flow_3" sourceRef="Task_2" targetRef="Task_3"/>' +
'<sequenceFlow id="Flow_4" sourceRef="Task_3" targetRef="EndEvent_1"/>' +
'</process>' +
'<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
'<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="transfer_process">' +
'<bpmndi:BPMNShape id="X_Start" bpmnElement="StartEvent_1"><dc:Bounds x="100" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="X_Task1" bpmnElement="Task_1"><dc:Bounds x="200" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="X_Task2" bpmnElement="Task_2"><dc:Bounds x="370" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="X_Task3" bpmnElement="Task_3"><dc:Bounds x="540" y="135" width="110" height="80"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNShape id="X_End" bpmnElement="EndEvent_1"><dc:Bounds x="720" y="160" width="36" height="36"/></bpmndi:BPMNShape>' +
'<bpmndi:BPMNEdge id="X_F1" bpmnElement="Flow_1"><di:waypoint x="136" y="178"/><di:waypoint x="200" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="X_F2" bpmnElement="Flow_2"><di:waypoint x="310" y="175"/><di:waypoint x="370" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="X_F3" bpmnElement="Flow_3"><di:waypoint x="480" y="175"/><di:waypoint x="540" y="175"/></bpmndi:BPMNEdge>' +
'<bpmndi:BPMNEdge id="X_F4" bpmnElement="Flow_4"><di:waypoint x="650" y="175"/><di:waypoint x="720" y="178"/></bpmndi:BPMNEdge>' +
'</bpmndi:BPMNPlane></bpmndi:BPMNDiagram></definitions>'

const QUICK_TEMPLATES = {
  leave: LEAVE_TEMPLATE,
  expense: EXPENSE_TEMPLATE,
  purchase: PURCHASE_TEMPLATE,
  contract: CONTRACT_TEMPLATE,
  travel: TRAVEL_TEMPLATE,
  transfer: TRANSFER_TEMPLATE
}

/** 中文业务名 → process_key 前缀，遵循 {业务}_process 约定 */
const PROCESS_KEY_KEYWORDS = [
  ['请假', 'leave'],
  ['离职', 'resign'],
  ['入职', 'onboard'],
  ['报销', 'expense'],
  ['采购', 'purchase'],
  ['出差', 'travel'],
  ['用章', 'seal'],
  ['合同', 'contract'],
  ['加班', 'overtime'],
  ['调休', 'comp_off'],
  ['转正', 'regularize'],
  ['调岗', 'transfer'],
  ['付款', 'payment'],
  ['开票', 'invoice']
]

const TEMPLATE_META = {
  leave: { name: '请假审批流程', processKey: 'leave_process', category: 'HR' },
  expense: { name: '报销审批流程', processKey: 'expense_process', category: 'FINANCE' },
  purchase: { name: '采购审批流程', processKey: 'purchase_process', category: 'PROCUREMENT' },
  contract: { name: '合同审批流程', processKey: 'contract_process', category: 'GENERAL' },
  travel: { name: '出差审批流程', processKey: 'travel_process', category: 'HR' },
  transfer: { name: '调岗离职审批流程', processKey: 'transfer_process', category: 'HR' }
}

/** 各模板默认节点审批人配置 */
const TEMPLATE_NODE_DEFAULTS = {
  leave: {
    Task_1: { assigneeType: 'DIRECT_LEADER', leaderLevel: 1 },
    Task_2: { assigneeType: 'DEPT_LEADER' },
    Task_3: { assigneeType: 'ROLE', assigneeRoles: ['GENERAL_MANAGER'] }
  },
  expense: {
    Task_1: { assigneeType: 'DEPT_LEADER' },
    Task_2: { assigneeType: 'ROLE', assigneeRoles: ['FINANCE'] },
    Task_3: { assigneeType: 'ROLE', assigneeRoles: ['GENERAL_MANAGER'] }
  },
  purchase: {
    Task_1: { assigneeType: 'DEPT_LEADER' },
    Task_2: { assigneeType: 'ROLE', assigneeRoles: ['DEPT_MANAGER'] },
    Task_3: { assigneeType: 'ROLE', assigneeRoles: ['GENERAL_MANAGER'] }
  },
  contract: {
    Task_1: { assigneeType: 'ROLE', assigneeRoles: ['HR'] },
    Task_2: { assigneeType: 'ROLE', assigneeRoles: ['FINANCE'] },
    Task_3: { assigneeType: 'ROLE', assigneeRoles: ['GENERAL_MANAGER'] }
  },
  travel: {
    Task_1: { assigneeType: 'DIRECT_LEADER', leaderLevel: 1 },
    Task_2: { assigneeType: 'DEPT_LEADER' },
    Task_3: { assigneeType: 'ROLE', assigneeRoles: ['FINANCE'] }
  },
  transfer: {
    Task_1: { assigneeType: 'DEPT_LEADER' },
    Task_2: { assigneeType: 'ROLE', assigneeRoles: ['HR'] },
    Task_3: { assigneeType: 'ROLE', assigneeRoles: ['GENERAL_MANAGER'] }
  }
}

const PROCESS_KEY_PATTERN = /^[a-z][a-z0-9_]*_process$/

function generateProcessKey(name) {
  const text = (name || '').trim()
  if (!text) return ''
  for (const [cn, en] of PROCESS_KEY_KEYWORDS) {
    if (text.includes(cn)) return `${en}_process`
  }
  const slug = text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  if (/^[a-z][a-z0-9_]*$/.test(slug) && slug.length >= 2) {
    return slug.endsWith('_process') ? slug : `${slug}_process`
  }
  return `custom_process_${Date.now().toString(36)}`
}

function extractProcessKeyFromXml(xml) {
  if (!xml) return ''
  const match = xml.match(/<bpmn:process\s[^>]*\bid=["']([^"']+)["']|<process\s[^>]*\bid=["']([^"']+)["']/)
  return (match && (match[1] || match[2]) || '').trim()
}

export default {
  name: 'OaDesigner',
  components: { FormSchemaEditor },
  props: {
    id: { type: String, default: null }
  },
  data() {
    return {
      modeler: null,
      saving: false,
      publishing: false,
      savingNode: false,
      /** 业务表主键，保存草稿后回写，避免新建后无法继续编辑 */
      processId: null,
      processName: '',
      /** 与 BPMN <process id>、库表 process_key 保持一致 */
      processKey: '',
      // processKeyLocked是
      processKeyLocked: false,
      processKeyManual: false,
      processMeta: { category: '', description: '', formKey: '', formSchema: '' },
      currentElement: null,
      autoSaved: false,
      lastSavedXml: '',
      clipboardElement: null,
      hasClipboard: false,
      showGrid: false,
      // 默认隐藏 bpmn.io 品牌；仅 localStorage=1 时显示
      showBpmnBrand: isOaBpmnBrandVisible(),
      // < md：左右面板改为抽屉；首屏按 matchMedia 初始化，避免先桌面后跳变
      isCompact: typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(max-width: 991px)').matches,
      leftPanelOpen: false,
      rightPanelOpen: false,
      canUndo: false,
      canRedo: false,
      elementCount: 0,
      nodeConfig: {
        id: '', name: '', documentation: '',
        assigneeType: 'DIRECT_LEADER', assigneeUsers: [], assigneeRoles: [],
        leaderLevel: 1, approvalMode: 'SINGLE', passRate: 100,
        rejectStrategy: 'BACK_PREVIOUS', rejectTargetNode: '', assigneeDepts: [],
        timeoutHours: 48, timeoutAction: 'NOTIFY', remindCount: 3,
        conditionExpression: '', isDefault: false,
        eventType: 'none', timerExpression: '',
        serviceType: 'HTTP_API', apiUrl: '', httpMethod: 'POST',
        headersJson: '', bodyTemplate: '', scriptContent: '',
        scriptLanguage: 'javascript', resultVariable: 'serviceResult'
      },
      allUsers: [],
      allRoles: [],
      allDepts: [],
      nodeConfigs: {},
      serviceTesting: false,
      serviceTestResult: '',
      serviceTestSampleJson: '{"days":3,"amount":1000,"title":"测试"}',
      sourceViewerVisible: false,
      sourceViewerTab: 'bpmn',
      sourceViewerBpmn: '',
      sourceViewerNodes: '',
      quickTemplates: [
        { key: 'leave', name: '请假审批', icon: 'el-icon-date' },
        { key: 'expense', name: '报销审批', icon: 'el-icon-money' },
        { key: 'purchase', name: '采购审批', icon: 'el-icon-shopping-cart-2' },
        { key: 'contract', name: '合同审批', icon: 'el-icon-document' },
        { key: 'travel', name: '出差审批', icon: 'el-icon-location-outline' },
        { key: 'transfer', name: '调岗/离职', icon: 'el-icon-sort' }
      ],
      paletteItems: [
        { type: 'userTask', icon: '👤', label: '审批节点' },
        { type: 'serviceTask', icon: '⚙️', label: '服务任务' },
        { type: 'scriptTask', icon: '📜', label: '脚本任务' },
        { type: 'manualTask', icon: '✋', label: '手动任务' }
      ],
      gatewayItems: [
        { type: 'exclusiveGateway', icon: '◆', label: '排他网关' },
        { type: 'parallelGateway', icon: '⧉', label: '并行网关' },
        { type: 'inclusiveGateway', icon: '◇', label: '包容网关' }
      ],
      eventItems: [
        { type: 'startEvent', icon: '●', label: '开始事件' },
        { type: 'endEvent', icon: '■', label: '结束事件' },
        { type: 'boundaryTimer', icon: '⏰', label: '定时边界' }
      ],
      autoSaveTimer: null
    }
  },
  computed: {
    isEdit() { return !!this.processId },
    /** 供流程属性表单绑定（与顶部工具栏共用同一数据源） */
    processFormModel() {
      return {
        name: this.processName,
        processKey: this.processKey,
        ...this.processMeta
      }
    },
    isUserTask() { return this.currentElement && this.currentElement.type === 'bpmn:UserTask' },
    isServiceTask() { return this.currentElement && this.currentElement.type === 'bpmn:ServiceTask' },
    isScriptTask() { return this.currentElement && this.currentElement.type === 'bpmn:ScriptTask' },
    isServiceOrScriptTask() { return this.isServiceTask || this.isScriptTask },
    isGateway() {
      if (!this.currentElement) return false
      return ['bpmn:ExclusiveGateway', 'bpmn:ParallelGateway', 'bpmn:InclusiveGateway'].includes(this.currentElement.type)
    },
    isSequenceFlow() { return this.currentElement && this.currentElement.type === 'bpmn:SequenceFlow' },
    isStartEvent() { return this.currentElement && this.currentElement.type === 'bpmn:StartEvent' },
    isEndEvent() { return this.currentElement && this.currentElement.type === 'bpmn:EndEvent' },
    isStartOrEnd() {
      if (!this.currentElement) return false
      return this.currentElement.type === 'bpmn:StartEvent' || this.currentElement.type === 'bpmn:EndEvent'
    }
  },
  async created() {
    this.processId = this.id != null && this.id !== '' ? String(this.id) : null
    this.processKeyLocked = !!this.processId
    await this.loadUsers()
    await this.loadRoles()
    await this.loadDepts()
  },
  async mounted() {
    // 进入设计器即同步品牌开关到 body（详情页 Viewer 共用 hide-bpmn-brand）
    this.applyBpmnBrand(this.showBpmnBrand, false)
    this.bindCompactMq()
    // $refs 仅在 mounted 后可用；此前初始化会导致 BPMN 画布无法创建。
    await this.initModeler()
    if (this.processId) await this.loadProcess()
    else if (this.$route.query.template) this.loadTemplate(this.$route.query.template, false)
    else {
      // 空白新建：先写入合法唯一 key，避免默认 Process_1 无法通过校验
      this.processKey = `custom_process_${Date.now().toString(36)}`
      this.syncProcessKeyToBpmn(this.processKey)
    }
    this.startAutoSave()
    // 监听键盘快捷键
    window.addEventListener('keydown', this.handleKeydown)
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeydown)
    this.unbindCompactMq()
    this.unbindCanvasResizeObserver()
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }
  },
  methods: {
    /** 监听 < md，侧栏切抽屉布局 */
    bindCompactMq() {
      if (typeof window === 'undefined' || !window.matchMedia) return
      this._compactMq = window.matchMedia(DESIGNER_COMPACT_MQ)
      this._onCompactMq = () => {
        const compact = !!this._compactMq.matches
        this.isCompact = compact
        if (!compact) {
          this.leftPanelOpen = false
          this.rightPanelOpen = false
        }
        this.$nextTick(() => this.notifyCanvasResized(true))
      }
      this._onCompactMq()
      if (this._compactMq.addEventListener) this._compactMq.addEventListener('change', this._onCompactMq)
      else this._compactMq.addListener(this._onCompactMq)
    },
    unbindCompactMq() {
      if (!this._compactMq || !this._onCompactMq) return
      if (this._compactMq.removeEventListener) this._compactMq.removeEventListener('change', this._onCompactMq)
      else this._compactMq.removeListener(this._onCompactMq)
      this._compactMq = null
      this._onCompactMq = null
    },
    /**
     * 容器尺寸变化后通知 bpmn-js 重算视口
     * @param {boolean} fit 是否同时 fit-viewport（初始化/断点切换时用；日常 resize 只 resized）
     */
    notifyCanvasResized(fit = false) {
      if (!this.modeler) return
      try {
        this.ensurePaletteFitsCanvas()
        const canvas = this.modeler.get('canvas')
        if (canvas && typeof canvas.resized === 'function') canvas.resized()
        // canvas.resized 会触发 palette._layoutChanged，高画布会被收成单列，需再强制两列
        this.forcePaletteTwoColumn()
        if (fit) this.fitView()
      } catch (e) { /* ignore */ }
    },
    /**
     * 强制内置工具栏保持两列。
     * bpmn-js 规则：画布足够高时 _needsCollapse=false → 单列；桌面吃满视口后会变单列，这里覆盖为始终两列。
     */
    forcePaletteTwoColumn() {
      if (!this.modeler) return
      try {
        const palette = this.modeler.get('palette')
        if (!palette || typeof palette._toggleState !== 'function') return
        palette._toggleState({ open: true, twoColumn: true })
      } catch (e) { /* ignore */ }
    },
    /**
     * 窄屏：按 .djs-palette 实测高度抬高 CSS 变量，保证工具栏底边完整。
     * 桌面：吃满视口，清掉强制 min，避免整页比窗口还高（见 docs/oa/01）
     */
    ensurePaletteFitsCanvas() {
      const root = this.$el
      const canvasEl = this.$refs.canvas
      if (!root || !canvasEl) return
      if (!this.isCompact) {
        root.style.removeProperty('--oa-canvas-body-min')
        root.style.removeProperty('--oa-canvas-card-min')
        return
      }
      const palette = canvasEl.querySelector('.djs-palette')
      const PALETTE_BOTTOM = 32
      const SAFETY = 28
      const FALLBACK_BODY = 588
      let bodyMin = FALLBACK_BODY
      if (palette) {
        const ph = Math.ceil(palette.getBoundingClientRect().height || palette.offsetHeight || 0)
        if (ph > 0) bodyMin = Math.max(FALLBACK_BODY, ph + PALETTE_BOTTOM + SAFETY)
      }
      const cardMin = bodyMin + 52
      root.style.setProperty('--oa-canvas-body-min', `${bodyMin}px`)
      root.style.setProperty('--oa-canvas-card-min', `${cardMin}px`)
    },
    bindCanvasResizeObserver() {
      this.unbindCanvasResizeObserver()
      const el = this.$refs.canvas
      if (!el || typeof ResizeObserver === 'undefined') return
      // 防抖：布局抖动时不要连续触发
      let timer = null
      this._canvasRo = new ResizeObserver(() => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => this.notifyCanvasResized(false), 80)
      })
      this._canvasRo.observe(el)
    },
    unbindCanvasResizeObserver() {
      if (this._canvasRo) {
        this._canvasRo.disconnect()
        this._canvasRo = null
      }
    },
    openLeftPanel() {
      this.rightPanelOpen = false
      this.leftPanelOpen = true
    },
    openRightPanel() {
      this.leftPanelOpen = false
      this.rightPanelOpen = true
    },
    closeSidePanels() {
      this.leftPanelOpen = false
      this.rightPanelOpen = false
    },

    onProcessNameInput() {
      if (this.processKeyLocked || this.processKeyManual) return
      const key = generateProcessKey(this.processName)
      if (key) {
        this.processKey = key
        this.syncProcessKeyToBpmn(key)
      }
    },

    onProcessKeyChange() {
      if (this.processKeyLocked) return
      this.processKeyManual = true
      const key = (this.processKey || '').trim().toLowerCase()
      this.processKey = key
      if (!this.validateProcessKey(key)) {
        this.$message.warning('processKey 须为小写字母开头，且以 _process 结尾，如 purchase_process')
        return
      }
      this.syncProcessKeyToBpmn(key)
    },

    validateProcessKey(key) {
      return PROCESS_KEY_PATTERN.test(key || '')
    },

    /** 将 processKey 写回 BPMN process id，保证与后端 resolveProcessKey 一致 */
    syncProcessKeyToBpmn(processKey) {
      if (!this.modeler || !processKey) return
      try {
        const modeling = this.modeler.get('modeling')
        const canvas = this.modeler.get('canvas')
        const root = canvas.getRootElement()
        if (root && root.businessObject && root.businessObject.$type === 'bpmn:Process') {
          const props = { id: processKey }
          if (this.processName) props.name = this.processName
          modeling.updateProperties(root, props)
          return
        }
        const registry = this.modeler.get('elementRegistry')
        const processEl = registry.find(e => e.type === 'bpmn:Process')
        if (processEl) {
          const props = { id: processKey }
          if (this.processName) props.name = this.processName
          modeling.updateProperties(processEl, props)
        }
      } catch (e) {
        console.warn('同步 processKey 到 BPMN 失败:', e)
      }
    },

    readProcessKeyFromModeler() {
      if (!this.modeler) return ''
      try {
        const root = this.modeler.get('canvas').getRootElement()
        if (root && root.businessObject && root.businessObject.$type === 'bpmn:Process') {
          return root.businessObject.id || ''
        }
        const processEl = this.modeler.get('elementRegistry').find(e => e.type === 'bpmn:Process')
        return (processEl && processEl.businessObject && processEl.businessObject.id) || ''
      } catch (e) {
        return ''
      }
    },

    buildSavePayload(xml) {
      return {
        id: this.processId || undefined,
        name: this.processName,
        processKey: this.processKey,
        ...this.processMeta,
        bpmnXml: xml,
        nodeConfigs: this.buildNodeConfigs()
      }
    },

    /** 保存成功后回写业务 id，并切换到编辑路由，避免重复插入草稿 */
    async applySavedEntity(entity) {
      if (!entity || entity.id == null) return
      // 必须用字符串，避免雪花 ID 超过 Number.MAX_SAFE_INTEGER 被截断
      const newId = String(entity.id)
      this.processId = newId
      if (entity.processKey) this.processKey = entity.processKey
      this.processKeyLocked = true
      if (String(this.$route.params.id || '') !== newId) {
        await this.$router.replace({ name: 'OaDesignerEdit', params: { id: newId } }).catch(() => {})
      }
    },

    async initModeler() {
      try {
        this.modeler = new BpmnModeler({
          container: this.$refs.canvas,
          additionalModules: [],
          // 绑定到画布容器，避免在右侧属性表单按 Delete 时删掉流程图
          keyboard: { bindTo: this.$refs.canvas }
        })

        // 以 selection.changed 为准同步右侧面板。
        // 不要同时监听 element.click + canvas.click：点击节点时两者都会触发，
        // canvas.click 会立刻把 currentElement 清掉，导致流程/节点属性无法切换。
        this.modeler.on('selection.changed', ({ newSelection }) => {
          this.syncSelectionToPanel(newSelection)
        })

        // 监听元素变化，更新撤销/重做状态
        this.modeler.on('commandStack.changed', () => {
          this.updateUndoRedoState()
          this.updateElementCount()
        })

        // 导入初始 BPMN；即使历史草稿或浏览器缓存的 XML 损坏，也退回 bpmn-js 的官方空白图。
        try {
          await this.modeler.importXML(BASE_BPMN)
        } catch (importError) {
          console.warn('初始 BPMN 导入失败，已使用安全空白画布：', importError)
          await this.modeler.createDiagram()
          this.ensureEndEvent()
        }
        this.fitView()
        this.updateElementCount()
        this.checkLocalDraft()
        // 高度链就绪后再观察尺寸，避免 djs-container 停在内容高度
        this.$nextTick(() => {
          this.bindCanvasResizeObserver()
          this.ensurePaletteFitsCanvas()
          this.notifyCanvasResized(true)
          // palette 首次布局 / 高度稳定后再锁两列
          requestAnimationFrame(() => {
            this.ensurePaletteFitsCanvas()
            this.forcePaletteTwoColumn()
          })
        })
      } catch (e) {
        console.error('初始化设计器失败:', e)
        this.$message.error('流程图加载失败，请刷新页面重试')
      }
    },

    ensureEndEvent() {
      const registry = this.modeler.get('elementRegistry')
      if (registry.filter(e => e.type === 'bpmn:EndEvent').length) return
      const start = registry.filter(e => e.type === 'bpmn:StartEvent')[0]
      const elementFactory = this.modeler.get('elementFactory')
      const modeling = this.modeler.get('modeling')
      const canvas = this.modeler.get('canvas')
      const end = elementFactory.createShape({ type: 'bpmn:EndEvent' })
      modeling.createShape(end, { x: 360, y: 120 }, canvas.getRootElement())
      modeling.updateProperties(end, { name: '结束' })
      if (start) modeling.connect(start, end, { type: 'bpmn:SequenceFlow' })
    },

    /** 输入框内按键不触发画布快捷键 */
    isTypingTarget(e) {
      const el = e.target
      if (!el) return false
      const tag = (el.tagName || '').toLowerCase()
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
      if (el.isContentEditable) return true
      return !!(el.closest && el.closest('.el-input, .el-textarea, .el-select, .el-message-box'))
    },

    isProcessRoot(element) {
      if (!element) return false
      return element.type === 'bpmn:Process'
        || element.type === 'bpmn:Collaboration'
        || element.type === 'bpmn:Participant'
    },

    /** 可自动连线的图形节点（排除连线/根节点/坐标非法的元素） */
    isConnectableShape(element) {
      if (!element || this.isProcessRoot(element)) return false
      if (element.waypoints || element.type === 'bpmn:SequenceFlow') return false
      if (element.type === 'bpmn:EndEvent' || element.type === 'label') return false
      return Number.isFinite(element.x) && Number.isFinite(element.y)
    },

    syncSelectionToPanel(selectionList) {
      const element = (selectionList && selectionList[0]) || null
      if (element && !element.labelTarget && !this.isProcessRoot(element)) {
        this.currentElement = element
        this.loadNodeConfig(element)
        // 窄屏选中节点时自动滑出属性抽屉，便于立刻改配置
        if (this.isCompact) this.openRightPanel()
      } else {
        this.currentElement = null
      }
    },

    clearCanvasSelection() {
      if (!this.modeler) {
        this.currentElement = null
        return
      }
      try {
        const selection = this.modeler.get('selection')
        // diagram-js Selection 无 deselectAll，应使用 select([])
        // selection.changed 会同步把 currentElement 置空
        if (selection && typeof selection.select === 'function') {
          selection.select([])
        } else {
          this.currentElement = null
        }
      } catch (err) {
        this.currentElement = null
      }
    },

    /** 浏览器坐标 → 画布坐标；非法时回退默认点，避免 setTranslate(NaN) */
    clientToDiagramPoint(clientX, clientY) {
      const fallback = { x: 280, y: 180 }
      if (!this.modeler || !this.$refs.canvas) return fallback
      try {
        const canvas = this.modeler.get('canvas')
        const viewbox = canvas.viewbox()
        const rect = this.$refs.canvas.getBoundingClientRect()
        const scale = viewbox && viewbox.scale > 0 ? viewbox.scale : 1
        const x = (clientX - rect.left) / scale + (viewbox.x || 0)
        const y = (clientY - rect.top) / scale + (viewbox.y || 0)
        if (!Number.isFinite(x) || !Number.isFinite(y)) return fallback
        return { x: Math.round(x), y: Math.round(y) }
      } catch (e) {
        return fallback
      }
    },

    normalizePosition(position) {
      const fallback = { x: 280, y: 180 }
      if (!position) return fallback
      const x = Number(position.x)
      const y = Number(position.y)
      if (!Number.isFinite(x) || !Number.isFinite(y)) return fallback
      return { x, y }
    },

    handleKeydown(e) {
      if (this.isTypingTarget(e)) return

      // Ctrl+Z: 撤销
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault()
        this.undo()
      }
      // Ctrl+Y: 重做
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault()
        this.redo()
      }
      // Ctrl+S: 保存草稿
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        this.saveDraft()
      }
      // Ctrl+C: 复制
      if (e.ctrlKey && e.key === 'c' && this.currentElement) {
        e.preventDefault()
        this.copyElement()
      }
      // Ctrl+V: 粘贴
      if (e.ctrlKey && e.key === 'v') {
        e.preventDefault()
        this.pasteElement()
      }
      // Delete / Backspace：仅删除可删节点，禁止删流程根
      if ((e.key === 'Delete' || e.key === 'Backspace')
        && this.currentElement
        && !this.isStartOrEnd
        && !this.isProcessRoot(this.currentElement)) {
        e.preventDefault()
        this.deleteElement()
      }
      // Escape: 取消选中
      if (e.key === 'Escape') {
        this.clearCanvasSelection()
      }
    },

    updateUndoRedoState() {
      const commandStack = this.modeler.get('commandStack')
      this.canUndo = commandStack.canUndo()
      this.canRedo = commandStack.canRedo()
    },

    updateElementCount() {
      const elementRegistry = this.modeler.get('elementRegistry')
      // 只统计可见流程节点（任务/事件/网关等），排除 process 根、连线、label
      const shapes = elementRegistry.filter(e => {
        if (!e || e.labelTarget) return false
        const t = e.type || ''
        if (t === 'label' || t === 'bpmn:TextAnnotation') return false
        if (t === 'bpmn:Process' || t === 'bpmn:Collaboration' || t === 'bpmn:Participant') return false
        if (t === 'bpmn:SequenceFlow' || t === 'bpmn:MessageFlow' || t === 'bpmn:Association') return false
        if (t === 'bpmn:Group' || t === 'bpmn:Category' || t === 'bpmn:CategoryValue') return false
        return t.indexOf('bpmn:') === 0
      })
      this.elementCount = shapes.length
    },

    undo() {
      if (this.canUndo) {
        this.modeler.get('commandStack').undo()
      }
    },

    redo() {
      if (this.canRedo) {
        this.modeler.get('commandStack').redo()
      }
    },

    copyElement() {
      if (!this.currentElement) return
      this.clipboardElement = JSON.parse(JSON.stringify(this.nodeConfig))
      this.hasClipboard = true
      this.$message.success('已复制节点配置，可按 Ctrl+V 粘贴')
    },

    pasteElement() {
      if (!this.hasClipboard || !this.currentElement) return
      const config = { ...this.clipboardElement, id: this.currentElement.id }
      this.nodeConfig = config
      this.saveNodeConfig()
      this.$message.success('已粘贴节点配置')
    },

    deleteElement() {
      if (!this.currentElement || this.isStartOrEnd || this.isProcessRoot(this.currentElement)) {
        this.$message.warning('开始/结束节点或流程根不能删除')
        return
      }
      const modeling = this.modeler.get('modeling')
      const element = this.currentElement
      const elementId = element.id
      const connections = [
        ...(element.incoming || []),
        ...(element.outgoing || [])
      ]
      connections.forEach(conn => {
        if (conn && conn.type === 'bpmn:SequenceFlow') {
          try {
            modeling.removeConnection(conn)
          } catch (e) {
            // 忽略已删除的连接
          }
        }
      })
      try {
        if (element.type === 'bpmn:SequenceFlow') modeling.removeConnection(element)
        else modeling.removeShape(element)
        this.$delete(this.nodeConfigs, elementId)
        this.clearCanvasSelection()
        this.$message.success('已删除，可按 Ctrl+Z 恢复')
      } catch (e) {
        console.warn('删除节点失败，可能已被删除：', e)
        this.clearCanvasSelection()
      }
    },

    onDragStart(event, type) {
      event.dataTransfer.setData('nodeType', type)
      event.dataTransfer.effectAllowed = 'copy'
    },

    onDragOver(event) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    },

    onDrop(event) {
      event.preventDefault()
      const type = event.dataTransfer.getData('nodeType')
      if (!type || !this.modeler) return
      this.addNode(type, this.clientToDiagramPoint(event.clientX, event.clientY))
    },

    addNode(type, position) {
      if (!this.modeler) return
      const elementFactory = this.modeler.get('elementFactory')
      const modeling = this.modeler.get('modeling')
      const canvas = this.modeler.get('canvas')
      const root = canvas.getRootElement()
      const pos = this.normalizePosition(position)

      const nameMap = {
        userTask: '审批节点', serviceTask: '服务任务', scriptTask: '脚本任务',
        manualTask: '手动任务', exclusiveGateway: '条件判断', parallelGateway: '并行网关',
        inclusiveGateway: '包容网关', startEvent: '开始', endEvent: '结束', boundaryTimer: '定时边界'
      }

      if (type === 'startEvent' && this.modeler.get('elementRegistry').filter(e => e.type === 'bpmn:StartEvent').length) {
        return this.$message.warning('一个流程只能有一个开始事件')
      }
      if (type === 'endEvent' && this.modeler.get('elementRegistry').filter(e => e.type === 'bpmn:EndEvent').length) {
        return this.$message.warning('一个流程只能有一个结束事件')
      }
      const bpmnType = type === 'boundaryTimer' ? 'bpmn:BoundaryEvent' : 'bpmn:' + type.charAt(0).toUpperCase() + type.slice(1)
      const previous = this.isConnectableShape(this.currentElement) ? this.currentElement : null
      // 若从一个已连到结束节点的节点继续添加，将新节点插入原连线中，
      // 避免保留「开始→结束」的直通路径而绕过审批。
      const tailConnection = previous && previous.outgoing && previous.outgoing.length === 1 &&
        previous.outgoing[0].target && previous.outgoing[0].target.type === 'bpmn:EndEvent'
        ? previous.outgoing[0] : null
      const tailTarget = tailConnection && tailConnection.target
      const shape = elementFactory.createShape({
        // 必须由 elementFactory 创建 moddle businessObject；传入普通对象会使
        // bpmn-js DrilldownOverlay 在命令事件中读取不到 businessObject.id。
        type: bpmnType
      })

      try {
        modeling.createShape(shape, pos, root)
        modeling.updateProperties(shape, { name: nameMap[type] || type })
        // 从当前节点继续添加时自动连线，常规审批无需再手工画第一条线。
        if (previous && previous !== shape && type !== 'startEvent' && type !== 'boundaryTimer') {
          try {
            if (tailConnection) modeling.removeConnection(tailConnection)
            modeling.connect(previous, shape, { type: 'bpmn:SequenceFlow' })
            if (tailTarget && Number.isFinite(tailTarget.x) && Number.isFinite(tailTarget.y)) {
              modeling.connect(shape, tailTarget, { type: 'bpmn:SequenceFlow' })
            }
          } catch (e) { /* 非法组合由 BPMN 编辑器保持原状 */ }
        }
      } catch (e) {
        console.error('添加节点失败:', e)
        return this.$message.error('添加节点失败，请重试')
      }

      // 选中新节点 → selection.changed 同步右侧「节点属性」面板
      this.$nextTick(() => {
        try {
          this.modeler.get('selection').select(shape)
        } catch (e) {
          this.currentElement = shape
          this.loadNodeConfig(shape)
          if (this.isCompact) this.openRightPanel()
        }
        // 窄屏点选添加后收起节点抽屉，让出画布
        if (this.isCompact) this.leftPanelOpen = false
      })
    },

    loadNodeConfig(element) {
      const id = element.id
      const isService = element.type === 'bpmn:ServiceTask' || element.type === 'bpmn:ScriptTask'
      if (this.nodeConfigs[id]) {
        this.nodeConfig = { ...this.nodeConfigs[id] }
      } else {
        this.nodeConfig = {
          id, name: element.businessObject?.name || '',
          documentation: element.businessObject?.documentation?.[0]?.text || '',
          assigneeType: 'DIRECT_LEADER', assigneeUsers: [], assigneeRoles: [],
          leaderLevel: 1, approvalMode: 'SINGLE', passRate: 100,
          rejectStrategy: 'BACK_PREVIOUS', rejectTargetNode: '', assigneeDepts: [],
          timeoutHours: 48, timeoutAction: 'NOTIFY', remindCount: 3,
          conditionExpression: element.businessObject?.conditionExpression?.body || '', isDefault: false,
          eventType: 'none', timerExpression: '',
          serviceType: element.type === 'bpmn:ScriptTask' ? 'SCRIPT' : 'HTTP_API',
          apiUrl: '', httpMethod: 'POST', headersJson: '', bodyTemplate: '',
          scriptContent: '', scriptLanguage: 'javascript', resultVariable: 'serviceResult'
        }
      }
      if (isService && !this.nodeConfig.serviceType) {
        this.nodeConfig.serviceType = element.type === 'bpmn:ScriptTask' ? 'SCRIPT' : 'HTTP_API'
      }
      this.serviceTestResult = ''
    },

    saveNodeConfig() {
      if (!this.nodeConfig.id) return
      this.savingNode = true
      try {
        // 更新节点名称
        if (this.currentElement) {
          const modeling = this.modeler.get('modeling')
          modeling.updateLabel(this.currentElement, this.nodeConfig.name)
          if (this.isSequenceFlow) {
            const expression = this.nodeConfig.conditionExpression
              ? this.modeler.get('moddle').create('bpmn:FormalExpression', { body: this.nodeConfig.conditionExpression })
              : undefined
            modeling.updateProperties(this.currentElement, { conditionExpression: expression })
          } else {
            this.$set(this.nodeConfigs, this.nodeConfig.id, { ...this.nodeConfig })
          }
        }
        this.$message.success('节点配置已保存')
      } finally {
        this.savingNode = false
      }
    },

    buildNodeConfigs() {
      const registry = this.modeler.get('elementRegistry')
      return Object.values(this.nodeConfigs).filter(config => {
        const el = registry.get(config.id)
        if (!el) return false
        return ['bpmn:UserTask', 'bpmn:ServiceTask', 'bpmn:ScriptTask'].includes(el.type)
      }).map((config, index) => {
        const el = registry.get(config.id)
        const type = el.type
        const nodeType = type === 'bpmn:ServiceTask' ? 'SERVICE_TASK'
          : (type === 'bpmn:ScriptTask' ? 'SCRIPT_TASK' : 'USER_TASK')
        return {
          nodeId: config.id,
          nodeName: config.name,
          nodeType,
          serviceType: config.serviceType || (nodeType === 'SCRIPT_TASK' ? 'SCRIPT' : 'HTTP_API'),
          apiUrl: config.apiUrl || '',
          httpMethod: config.httpMethod || 'POST',
          headersJson: config.headersJson || '',
          bodyTemplate: config.bodyTemplate || '',
          scriptLanguage: config.scriptLanguage || 'javascript',
          resultVariable: config.resultVariable || 'serviceResult',
          assigneeType: config.assigneeType,
          assigneeUsers: (config.assigneeUsers || []).join(','),
          assigneeRoles: (config.assigneeRoles || []).join(','),
          assigneeDepts: Array.isArray(config.assigneeDepts)
            ? config.assigneeDepts.join(',')
            : (config.assigneeDepts || ''),
          leaderLevel: config.leaderLevel,
          approvalMode: config.approvalMode,
          passRate: config.passRate != null ? config.passRate : 100,
          rejectStrategy: config.rejectStrategy,
          rejectTargetNode: config.rejectTargetNode || '',
          timeoutHours: config.timeoutHours,
          timeoutAction: config.timeoutAction || 'NOTIFY',
          remindCount: config.remindCount != null ? config.remindCount : 0,
          conditionExpression: config.conditionExpression,
          scriptContent: config.scriptContent || config.documentation || '',
          sort: index
        }
      })
    },

    validateProcess() {
      const registry = this.modeler.get('elementRegistry')
      const elements = registry.filter(e => !e.labelTarget && e.businessObject)
      const starts = elements.filter(e => e.type === 'bpmn:StartEvent')
      const ends = elements.filter(e => e.type === 'bpmn:EndEvent')
      const tasks = elements.filter(e => e.type === 'bpmn:UserTask')
      const serviceTasks = elements.filter(e =>
        e.type === 'bpmn:ServiceTask' || e.type === 'bpmn:ScriptTask')
      if (starts.length !== 1 || ends.length !== 1) return '流程必须且只能包含一个开始事件和一个结束事件'
      if (!tasks.length && !serviceTasks.length) return '请至少配置一个审批节点或服务任务'
      if (!starts[0].outgoing.length || !ends[0].incoming.length) return '开始和结束事件必须连接到流程中'
      const unconnected = [...tasks, ...serviceTasks].find(task => !task.incoming.length || !task.outgoing.length)
      if (unconnected) return `节点「${unconnected.businessObject.name || unconnected.id}」未完整连线`
      const unconfigured = tasks.find(task => !this.nodeConfigs[task.id])
      if (unconfigured) return `请保存审批节点「${unconfigured.businessObject.name || unconfigured.id}」的配置`
      const unconfiguredSvc = serviceTasks.find(task => !this.nodeConfigs[task.id])
      if (unconfiguredSvc) return `请保存服务任务「${unconfiguredSvc.businessObject.name || unconfiguredSvc.id}」的配置`
      return ''
    },

    updateNodeName() {
      if (!this.currentElement) return
      const modeling = this.modeler.get('modeling')
      modeling.updateLabel(this.currentElement, this.nodeConfig.name)
    },

    getElementTypeName(type) {
      const map = {
        'bpmn:UserTask': '审批节点',
        'bpmn:ServiceTask': '服务任务',
        'bpmn:ScriptTask': '脚本任务',
        'bpmn:ManualTask': '手动任务',
        'bpmn:ExclusiveGateway': '排他网关',
        'bpmn:ParallelGateway': '并行网关',
        'bpmn:InclusiveGateway': '包容网关',
        'bpmn:StartEvent': '开始事件',
        'bpmn:EndEvent': '结束事件',
        'bpmn:BoundaryTimer': '定时边界'
      }
      return map[type] || type
    },

    zoomIn() {
      const zoomScroll = this.modeler.get('zoomScroll')
      zoomScroll.zoom(1.2)
    },
    zoomOut() {
      const zoomScroll = this.modeler.get('zoomScroll')
      zoomScroll.zoom(0.8)
    },
    fitView() {
      if (!this.modeler) return
      try {
        // 留一点边距，矮画布时节点不易贴边被裁
        this.modeler.get('canvas').zoom('fit-viewport', 'auto')
      } catch (e) {
        try { this.modeler.get('canvas').zoom('fit-viewport') } catch (e2) { /* ignore */ }
      }
    },
    toggleGrid() {
      this.showGrid = !this.showGrid
      const canvas = this.modeler.get('canvas')
      // bpmn-js 没有内置网格，可以添加自定义模块
      this.$message.info(this.showGrid ? '已开启网格' : '已关闭网格')
    },
    refresh() {
      // 刷新画布, 重新加载流程
      this.initModeler()
      if (this.processId) this.loadProcess()
      else if (this.$route.query.template) this.loadTemplate(this.$route.query.template, false)
      else {
        // 空白新建：先写入合法唯一 key，避免默认 Process_1 无法通过校验
        this.processKey = `custom_process_${Date.now().toString(36)}`
        this.syncProcessKeyToBpmn(this.processKey)
      }
    },
    async exportXml() {
      try {
        const { xml } = await this.modeler.saveXML({ format: true })
        this.downloadBlob(xml, (this.processName || this.processKey || 'process') + '.bpmn', 'application/xml')
        this.$message.success('已下载 BPMN 源码')
      } catch (e) {
        this.$message.error('导出失败: ' + e.message)
      }
    },
    async openSourceViewer() {
      try {
        const { xml } = await this.modeler.saveXML({ format: true })
        this.sourceViewerBpmn = xml
        this.sourceViewerNodes = JSON.stringify({
          processKey: this.processKey,
          processName: this.processName,
          ...this.processMeta,
          nodeConfigs: this.buildNodeConfigs()
        }, null, 2)
        this.sourceViewerTab = 'bpmn'
        this.sourceViewerVisible = true
      } catch (e) {
        this.$message.error('读取源码失败: ' + e.message)
      }
    },
    copySourceViewer() {
      const text = this.sourceViewerTab === 'bpmn'
        ? this.sourceViewerBpmn
        : (this.sourceViewerTab === 'nodes' ? this.sourceViewerNodes : (this.processMeta.formSchema || '{}'))
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => this.$message.success('已复制'))
          .catch(() => this.fallbackCopy(text))
      } else {
        this.fallbackCopy(text)
      }
    },
    fallbackCopy(text) {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      this.$message.success('已复制')
    },
    downloadCurrentSource() {
      if (this.sourceViewerTab === 'bpmn') {
        this.downloadBlob(this.sourceViewerBpmn, (this.processName || 'process') + '.bpmn', 'application/xml')
      } else if (this.sourceViewerTab === 'nodes') {
        this.downloadBlob(this.sourceViewerNodes, (this.processName || 'process') + '-nodes.json', 'application/json')
      } else {
        this.downloadBlob(this.processMeta.formSchema || '{}', (this.processName || 'process') + '-form.json', 'application/json')
      }
    },
    /**
     * 同步 bpmn.io 品牌显隐到 body + localStorage
     * @param {boolean} show el-switch 传入的值
     * @param {boolean} notify 是否 toast（初始化静默）
     */
    applyBpmnBrand(show, notify = true) {
      this.showBpmnBrand = applyOaBpmnBrand(show)
      if (notify) {
        this.$message.info(this.showBpmnBrand ? '已显示 bpmn.io 品牌标识' : '已隐藏品牌标识（注意开源协议署名要求）')
      }
    },
    async testServiceTaskConfig() {
      let sampleVariables = {}
      try {
        sampleVariables = this.serviceTestSampleJson
          ? JSON.parse(this.serviceTestSampleJson)
          : {}
      } catch (e) {
        return this.$message.error('模拟变量必须是 JSON 对象')
      }
      this.serviceTesting = true
      this.serviceTestResult = ''
      try {
        const res = await testServiceTask({
          serviceType: this.nodeConfig.serviceType,
          apiUrl: this.nodeConfig.apiUrl,
          httpMethod: this.nodeConfig.httpMethod,
          headersJson: this.nodeConfig.headersJson,
          bodyTemplate: this.nodeConfig.bodyTemplate,
          scriptContent: this.nodeConfig.scriptContent,
          scriptLanguage: this.nodeConfig.scriptLanguage,
          sampleVariables
        })
        this.serviceTestResult = JSON.stringify(res.data || res, null, 2)
        if (res.data && res.data.success === false) {
          this.$message.warning('测试执行完成，但业务结果为失败')
        } else {
          this.$message.success('测试完成')
        }
      } catch (e) {
        this.serviceTestResult = e.response?.data?.message || e.message
        this.$message.error('测试失败')
      } finally {
        this.serviceTesting = false
      }
    },

    async exportSvg() {
      try {
        const { svg } = await this.modeler.saveSVG()
        this.downloadBlob(svg, (this.processName || this.processKey || 'process') + '.svg', 'image/svg+xml')
        this.$message.success('已下载流程图 SVG')
      } catch (e) {
        this.$message.error('导出 SVG 失败: ' + e.message)
      }
    },
    exportNodeConfigs() {
      try {
        const payload = {
          processKey: this.processKey,
          processName: this.processName,
          ...this.processMeta,
          nodeConfigs: this.buildNodeConfigs()
        }
        this.downloadBlob(
          JSON.stringify(payload, null, 2),
          (this.processName || this.processKey || 'process') + '-nodes.json',
          'application/json'
        )
        this.$message.success('已下载节点配置 JSON')
      } catch (e) {
        this.$message.error('导出节点配置失败: ' + e.message)
      }
    },
    onExportCommand(cmd) {
      if (cmd === 'bpmn') this.exportXml()
      else if (cmd === 'svg') this.exportSvg()
      else if (cmd === 'json') this.exportNodeConfigs()
    },
    downloadBlob(content, filename, mime) {
      const blob = new Blob([content], { type: mime || 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },

    async loadUsers() {
      try {
        this.allUsers = await loadOaUserOptions()
      } catch (e) {
        console.error('加载用户失败:', e)
        this.allUsers = []
      }
    },
    async loadRoles() {
      try {
        this.allRoles = await loadOaRoleOptions()
      } catch (e) {
        console.error('加载角色失败:', e)
        this.allRoles = []
      }
    },
    async loadDepts() {
      try {
        this.allDepts = await loadOaDeptOptions()
      } catch (e) {
        this.allDepts = []
      }
    },

    async loadProcess() {
      try {
        const res = await getDetail(this.processId)
        const detail = res.data || {}
        this.processName = detail.name
        this.processKey = detail.processKey || ''
        this.processKeyLocked = true
        this.processKeyManual = true
        this.processMeta = {
          category: detail.category || '',
          description: detail.description || '',
          formKey: detail.formKey || '',
          formSchema: detail.formSchema || ''
        }
        this.nodeConfigs = (detail.nodeConfigs || []).reduce((configs, item) => {
          configs[item.nodeId] = {
            id: item.nodeId,
            name: item.nodeName,
            documentation: '',
            assigneeType: item.assigneeType || 'DIRECT_LEADER',
            assigneeUsers: item.assigneeUsers ? item.assigneeUsers.split(',') : [],
            assigneeRoles: item.assigneeRoles ? item.assigneeRoles.split(',') : [],
            leaderLevel: item.leaderLevel || 1,
            approvalMode: item.approvalMode || 'SINGLE',
            passRate: item.passRate != null ? item.passRate : 100,
            rejectStrategy: item.rejectStrategy || 'BACK_PREVIOUS',
            rejectTargetNode: item.rejectTargetNode || '',
            assigneeDepts: item.assigneeDepts ? String(item.assigneeDepts).split(',').filter(Boolean) : [],
            timeoutHours: item.timeoutHours || 0,
            timeoutAction: item.timeoutAction === 'AUTO_PASS' ? 'AUTO_APPROVE' : (item.timeoutAction || 'NOTIFY'),
            remindCount: item.remindCount != null ? item.remindCount : 0,
            conditionExpression: item.conditionExpression || '',
            serviceType: item.serviceType || (item.nodeType === 'SCRIPT_TASK' ? 'SCRIPT' : 'HTTP_API'),
            apiUrl: item.apiUrl || '',
            httpMethod: item.httpMethod || 'POST',
            headersJson: item.headersJson || '',
            bodyTemplate: item.bodyTemplate || '',
            scriptContent: item.scriptContent || '',
            scriptLanguage: item.scriptLanguage || 'javascript',
            resultVariable: item.resultVariable || 'serviceResult'
          }
          return configs
        }, {})
        const bpmnRes = await getBpmn(this.processId)
        const xml = typeof bpmnRes === 'string' ? bpmnRes : (bpmnRes.data || bpmnRes)
        if (!this.processKey) {
          this.processKey = extractProcessKeyFromXml(xml) || this.readProcessKeyFromModeler()
        }
        this.$nextTick(() => {
          this.modeler.importXML(xml).then(() => {
            this.fitView()
            this.updateElementCount()
          }).catch(err => {
            console.error('加载流程失败:', err)
            this.$message.error('加载流程失败')
          })
        })
      } catch (e) {
        this.$message.error('加载流程失败: ' + e.message)
      }
    },

    async loadTemplate(templateKey, confirm = true) {
      let xml = QUICK_TEMPLATES[templateKey]
      if (!xml) {
        try {
          const name = this.$route.query.name || templateKey
          const res = await createFromTemplate(templateKey, { name })
          const data = res && res.data
          if (typeof data === 'string') {
            xml = data
          } else if (data && typeof data === 'object') {
            xml = data.bpmnXml || data.xml || data.bpmn || ''
          }
        } catch (e) {
          this.$message.warning('模板不存在')
          return
        }
        if (!xml || typeof xml !== 'string') {
          this.$message.warning('模板不存在')
          return
        }
      }

      const load = () => {
          if (!this.modeler) return
          this.modeler.importXML(xml)
            .then(() => {
              this.fitView()
              const meta = TEMPLATE_META[templateKey] || {}
              this.processName = this.$route.query.name || meta.name || '新流程'
              this.processKey = meta.processKey || extractProcessKeyFromXml(xml) || generateProcessKey(this.processName)
              this.processKeyManual = true
              if (!this.processId) this.processKeyLocked = false
              if (meta.category) this.processMeta.category = meta.category
              this.nodeConfigs = {}
              const defaults = TEMPLATE_NODE_DEFAULTS[templateKey] || {}
              // 模板中的审批节点带上可直接发布的默认审批策略，管理员可在右侧继续调整。
              this.modeler.get('elementRegistry').filter(e => e.type === 'bpmn:UserTask').forEach(task => {
                const nodeDefault = defaults[task.id] || {}
                this.$set(this.nodeConfigs, task.id, {
                  id: task.id,
                  name: task.businessObject.name,
                  documentation: '',
                  assigneeType: nodeDefault.assigneeType || 'DIRECT_LEADER',
                  assigneeUsers: nodeDefault.assigneeUsers || [],
                  assigneeRoles: nodeDefault.assigneeRoles || [],
                  leaderLevel: nodeDefault.leaderLevel || 1,
                  approvalMode: nodeDefault.approvalMode || 'SINGLE',
                  passRate: 100,
                  rejectStrategy: 'BACK_PREVIOUS',
                  rejectTargetNode: '',
                  assigneeDepts: [],
                  timeoutHours: 48,
                  timeoutAction: 'NOTIFY',
                  remindCount: 3,
                  conditionExpression: '',
                  isDefault: false,
                  eventType: 'none',
                  timerExpression: ''
                })
              })
              this.updateElementCount()
              this.$message.success('模板已加载（processKey: ' + this.processKey + '）')
            })
            .catch(err => {
              console.error('模板加载失败:', err)
              this.$message.error('模板加载失败，请重试')
            })
      }
      if (confirm) this.$confirm('加载模板将清空当前画布，是否继续？', '加载模板', { type: 'warning' }).then(load).catch(() => {})
      else load()
    },

    // 本地草稿检查
    checkLocalDraft() {
      if (!this.modeler || this.processId) return

      const draftKey = 'bpmn_draft_new'
      const draft = localStorage.getItem(draftKey)
      if (draft) {
        try {
          const data = JSON.parse(draft)
          this.$confirm('发现本地草稿，是否恢复？', '恢复草稿', { type: 'info' })
            .then(() => {
              if (!this.modeler) return
              this.modeler.importXML(data.xml)
                .then(() => {
                  this.fitView()
                  this.processName = data.name || ''
                  this.processKey = data.processKey || extractProcessKeyFromXml(data.xml) || generateProcessKey(data.name)
                  this.processKeyManual = !!data.processKey
                  this.processMeta = data.processMeta || this.processMeta
                  this.nodeConfigs = data.nodeConfigs || {}
                  this.updateElementCount()
                  this.$message.success('草稿已恢复')
                })
                .catch(err => {
                  console.error('恢复草稿失败:', err)
                  this.$message.error('恢复草稿失败')
                  localStorage.removeItem(draftKey)
                })
            })
            .catch(() => {
              localStorage.removeItem(draftKey)
            })
        } catch (e) {
          localStorage.removeItem(draftKey)
        }
      }
    },

    // 自动保存
    startAutoSave() {
      this.autoSaveTimer = setInterval(() => {
        this.autoSaveToLocal()
      }, 60000) // 每60秒自动保存
    },

    async autoSaveToLocal() {
      if (!this.processName || this.processId) return

      try {
        const { xml } = await this.modeler.saveXML({ format: true })
        const draft = {
          xml,
          name: this.processName,
          processKey: this.processKey,
          processMeta: this.processMeta,
          nodeConfigs: this.nodeConfigs,
          saveTime: Date.now()
        }
        localStorage.setItem('bpmn_draft_new', JSON.stringify(draft))
        this.lastSavedXml = xml
        this.autoSaved = true
        setTimeout(() => { this.autoSaved = false }, 3000)
      } catch (e) {
        console.error('自动保存失败:', e)
      }
    },

    checkAutoSave() {
      // 检测是否有未保存的更改
      this.modeler.saveXML({ format: true }).then(({ xml }) => {
        // 可以在这里添加比较逻辑
      })
    },

    async saveDraft() {
      if (!this.processName) return this.$message.warning('请输入流程名称')
      if (!this.processKey) {
        this.processKey = generateProcessKey(this.processName)
      }
      if (!this.validateProcessKey(this.processKey)) {
        return this.$message.warning('请填写合法的 processKey（如 purchase_process）')
      }
      this.saving = true
      try {
        this.syncProcessKeyToBpmn(this.processKey)
        const { xml } = await this.modeler.saveXML({ format: true })
        const saveRes = await saveDraft(this.buildSavePayload(xml))
        await this.applySavedEntity(saveRes.data)
        localStorage.removeItem('bpmn_draft_new')
        this.$message.success('草稿保存成功')
        this.lastSavedXml = xml
      } catch (e) {
        this.$message.error('保存失败: ' + (e.response?.data?.message || e.message))
      } finally {
        this.saving = false
      }
    },

    async publish() {
      if (!this.processName) return this.$message.warning('请输入流程名称')
      if (!this.processKey) {
        this.processKey = generateProcessKey(this.processName)
      }
      if (!this.validateProcessKey(this.processKey)) {
        return this.$message.warning('请填写合法的 processKey（如 purchase_process）')
      }
      const validationError = this.validateProcess()
      if (validationError) return this.$message.warning(validationError)
      this.publishing = true
      try {
        this.syncProcessKeyToBpmn(this.processKey)
        const { xml } = await this.modeler.saveXML({ format: true })
        const saveRes = await saveDraft(this.buildSavePayload(xml))
        await this.applySavedEntity(saveRes.data)
        await pubApi(this.processId)
        localStorage.removeItem('bpmn_draft_new')
        this.$message.success('流程发布成功！现在可以在「发起审批」中使用了')
        this.$router.push('/oa/process').catch(() => {})
      } catch (e) {
        this.$message.error('发布失败: ' + (e.response?.data?.message || e.message))
      } finally {
        this.publishing = false
      }
    }
  }
}
</script>

<style scoped>
/* 桌面默认：整页高度与窗口对齐（扣顶栏 Tags）；三栏 flex 填满剩余区 */
.designer {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  background: var(--gp-page-wash, var(--background-color, #f5f7fa));
  color: var(--text-color-2, #303133);
  box-sizing: border-box;
  height: calc(100vh - 84px);
  max-height: calc(100vh - 84px);
  min-height: 0;
  overflow: hidden;
}

.toolbar {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 12px;
  background: var(--background-origin, #fff);
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid var(--border-color, transparent);
}

.toolbar-meta,
.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.toolbar-actions {
  justify-content: flex-end;
  margin-left: auto;
}

.toolbar-field--name { width: 160px; }
.toolbar-field--key { width: 150px; }
.toolbar-field--cat { width: 110px; }

.toolbar-group {
  margin-right: 0;
}

.designer-workspace {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  gap: 12px;
  position: relative;
}

.designer-side {
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
  align-self: stretch;
}

.designer-side >>> .el-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.designer-side >>> .el-card__body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.designer-side--left {
  flex: 0 0 200px;
  width: 200px;
}

.designer-side--right {
  flex: 0 0 360px;
  width: 360px;
  max-width: 40%;
}

.designer-canvas-wrap {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
}

.canvas-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.canvas-card >>> .el-card__header {
  flex-shrink: 0;
  padding: 10px 12px;
}

.canvas-card >>> .el-card__body {
  flex: 1;
  min-height: 0;
  position: relative;
  padding: 0 !important;
  height: auto !important;
  overflow: hidden;
}

.compact-panel-toggles {
  display: none;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.designer-side-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background: rgba(0, 0, 0, 0.35);
}

.bpmn-brand-switch {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  vertical-align: middle;
}

.bpmn-brand-switch__label {
  font-size: 13px;
  color: var(--text-color, #606266);
  white-space: nowrap;
}

.panel-header {
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.side-close-btn {
  padding: 0 4px;
  font-size: 16px;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.canvas-container {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  min-height: 0;
  border: 1px solid #e4e7ed;
  border-radius: 0 0 4px 4px;
  background: #fff;
  overflow: hidden;
}

.canvas-container.show-grid {
  background-color: #fff;
  background-image: linear-gradient(#edf1f7 1px, transparent 1px), linear-gradient(90deg, #edf1f7 1px, transparent 1px);
  background-size: 20px 20px;
}

.canvas-guide {
  color: var(--text-color, #909399);
  font-weight: normal;
  font-size: 12px;
  margin-left: 8px;
}

.palette {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.palette-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: grab;
  border-radius: 6px;
  transition: all 0.2s;
  background: var(--background-2, #fafafa);
  border: 1px solid transparent;
}

.palette-item:hover {
  background: #ecf5ff;
  border-color: var(--theme-color, #409eff);
}

.palette-icon {
  font-size: 18px;
  margin-right: 10px;
  width: 24px;
  text-align: center;
}

.palette-label {
  font-size: 13px;
  color: var(--text-color, #606266);
}

.process-props-form {
  padding: 0 4px 12px;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.template-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: var(--theme-color, #409eff);
  transition: all 0.2s;
}

.template-item:hover {
  background: #ecf5ff;
  padding-left: 16px;
}

.empty-tip {
  text-align: center;
  color: var(--text-color, #909399);
  padding: 60px 0;
}

.empty-tip i {
  font-size: 48px;
  display: block;
  margin-bottom: 12px;
}

.tip-sub {
  font-size: 12px;
  color: var(--text-color, #909399);
  margin-top: 4px;
  display: block;
}

.condition-help {
  margin-top: 8px;
  font-size: 12px;
}

/* Element md：<992px 改为「随内容撑开」+ 抽屉；桌面仍吃满视口 */
@media (max-width: 991px) {
  .designer {
    padding: 8px;
    height: auto;
    max-height: none;
    min-height: 0;
    overflow: visible;
  }

  .toolbar-field--name,
  .toolbar-field--key {
    width: 120px;
  }

  .toolbar-field--cat {
    width: 100px;
  }

  .btn-text {
    display: none;
  }

  .compact-panel-toggles {
    display: flex;
  }

  .canvas-guide {
    display: none;
  }

  .designer-workspace {
    display: block;
    flex: 0 0 auto;
    min-height: var(--oa-canvas-card-min, 640px);
    height: auto;
  }

  .designer-canvas-wrap {
    height: auto;
    min-height: var(--oa-canvas-card-min, 640px);
  }

  .canvas-card {
    height: auto;
    min-height: var(--oa-canvas-card-min, 640px);
  }

  .canvas-card >>> .el-card__body {
    min-height: var(--oa-canvas-body-min, 588px);
  }

  .canvas-container {
    min-height: var(--oa-canvas-body-min, 588px);
  }

  .designer-side {
    position: fixed;
    top: 84px;
    bottom: 0;
    z-index: 2001;
    width: min(320px, 88vw);
    max-width: none;
    flex: none;
    height: auto;
    min-height: 0;
    transition: transform 0.28s ease;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }

  .designer-side--left {
    left: 0;
    width: min(300px, 86vw);
    transform: translateX(-105%);
  }

  .designer-side--left.is-open {
    transform: translateX(0);
  }

  .designer-side--right {
    right: 0;
    left: auto;
    width: min(360px, 92vw);
    max-width: none;
    transform: translateX(105%);
  }

  .designer-side--right.is-open {
    transform: translateX(0);
  }
}

@media (max-width: 576px) {
  .toolbar-meta {
    width: 100%;
  }

  .toolbar-actions {
    width: 100%;
    margin-left: 0;
    justify-content: flex-start;
  }

  .toolbar-field--name,
  .toolbar-field--key,
  .toolbar-field--cat {
    flex: 1 1 40%;
    width: auto;
    min-width: 0;
  }
}
</style>

<!-- bpmn-js 工具箱挂载在画布内部，需非 scoped / deep 才能覆盖默认 top 定位 -->
<style>
/* 仅窄屏设计器需要 app-main 滚动；桌面 .designer 已锁视口高度 */
.app-main:has(.designer.is-compact) {
  overflow-y: auto !important;
  overflow-x: hidden;
}

/* 强制 bpmn 容器吃满绝对定位的 .canvas-container，避免只剩图元内容高度 */
.designer .canvas-container .bjs-container,
.designer .canvas-container .djs-container {
  width: 100% !important;
  height: 100% !important;
}

.designer .canvas-container .djs-palette {
  /* 左下角；宽度对齐 diagram-js 两列（.two-column.open ≈ 94px） */
  position: absolute !important;
  left: 20px !important;
  top: auto !important;
  bottom: 32px !important;
  width: 94px !important;
  min-width: 94px !important;
  box-sizing: border-box;
  z-index: 10;
}

/* 始终按两列展开时的宽度，避免被单列样式压窄 */
.designer .canvas-container .djs-palette.open,
.designer .canvas-container .djs-palette.two-column.open {
  width: 94px !important;
}

.designer .canvas-container .djs-palette .djs-palette-entries {
  width: 100%;
}

/* 窄屏：画布若仍偏矮，palette 内部可滚，但不改为单列 */
@media (max-width: 991px) {
  .designer .canvas-container .djs-palette {
    max-height: calc(100% - 40px);
    overflow-x: hidden;
    overflow-y: auto;
  }
}

/* bpmn.io 品牌标识：body.hide-bpmn-brand 时隐藏 */
body.hide-bpmn-brand .bjs-powered-by,
body.hide-bpmn-brand .bjs-powered-by-lightbox {
  display: none !important;
}

.test-result {
  margin: 0;
  max-height: 220px;
  overflow: auto;
  padding: 8px;
  background: #1e1e1e;
  color: #d4d4d4;
  font-size: 12px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.source-code textarea {
  font-family: Menlo, Monaco, Consolas, monospace !important;
  font-size: 12px !important;
  line-height: 1.5 !important;
}
</style>
