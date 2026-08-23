/**
 * 表单构建「整页」预设：查询列表页等（对齐后台 app-container 习惯）。
 * 返回 drawingList 字段数组（深拷贝由调用方完成）。
 */
export function createListPageDrawing(idGlobalStart) {
  let id = idGlobalStart || 100
  const nextId = () => {
    id += 1
    return id
  }
  const fields = [
    {
      layout: 'colFormItem',
      label: '关键词',
      tag: 'el-input',
      tagIcon: 'input',
      placeholder: '请输入关键词',
      defaultValue: undefined,
      span: 8,
      labelWidth: null,
      style: { width: '100%' },
      clearable: true,
      prepend: '',
      append: '',
      'prefix-icon': '',
      'suffix-icon': '',
      maxlength: null,
      'show-word-limit': false,
      readonly: false,
      disabled: false,
      required: false,
      regList: [],
      changeTag: true,
      formId: nextId(),
      renderKey: Date.now(),
      vModel: 'keyword',
    },
    {
      layout: 'colFormItem',
      label: '状态',
      tag: 'el-select',
      tagIcon: 'select',
      placeholder: '请选择状态',
      defaultValue: undefined,
      span: 8,
      labelWidth: null,
      style: { width: '100%' },
      clearable: true,
      disabled: false,
      required: false,
      filterable: false,
      multiple: false,
      options: [
        { label: '正常', value: '0' },
        { label: '停用', value: '1' },
      ],
      regList: [],
      changeTag: true,
      formId: nextId(),
      renderKey: Date.now() + 1,
      vModel: 'status',
    },
    {
      layout: 'colFormItem',
      label: '',
      tag: 'el-button',
      tagIcon: 'button',
      span: 8,
      default: '搜索',
      type: 'primary',
      icon: 'el-icon-search',
      size: 'small',
      disabled: false,
      changeTag: true,
      formId: nextId(),
      renderKey: Date.now() + 2,
      // 列表页按钮：导出时挂查询方法名
      btnAction: 'handleQuery',
    },
    {
      layout: 'colFormItem',
      label: '数据表格',
      tag: 'el-table',
      tagIcon: 'table',
      span: 24,
      labelWidth: 0,
      changeTag: false,
      formId: nextId(),
      renderKey: Date.now() + 3,
      vModel: 'tableData',
      dataKey: 'tableData',
      border: true,
      stripe: true,
      size: 'small',
      columns: [
        { label: '编号', prop: 'id', width: '80', align: 'center' },
        { label: '名称', prop: 'name', minWidth: '140' },
        { label: '状态', prop: 'status', width: '100', align: 'center' },
        { label: '创建时间', prop: 'createTime', minWidth: '160' },
      ],
      showPagination: true,
      pageKey: 'pageNum',
      sizeKey: 'pageSize',
      totalKey: 'total',
    },
  ]
  return {
    fields,
    idGlobal: id,
    formConfPatch: {
      formBtns: false,
      labelWidth: 80,
      gutter: 12,
      size: 'small',
      pageMode: 'list',
      listApiComment: 'TODO: 替换为真实列表接口，如 listXxx(this.queryParams)',
    },
  }
}

export const FORM_PAGE_PRESETS = [
  {
    id: 'list-query',
    name: '查询列表页',
    desc: '查询表单 + 数据表格 + 分页方法骨架',
  },
]
