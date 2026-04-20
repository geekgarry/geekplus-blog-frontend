// import zhLocale from 'element-ui/lib/locale/lang/zh-TW' //引入element语言包
const tw = {
  lang: {
    en: '英文',
    es: '西班牙語',
    ja: '日本語',
    tw: '繁體中文',
    zh: '簡體中文',
    ko: '韓語'
  },
  switchLangMsg: '切換多語言成功',
  message: {
    systemNotice: '系統通知',
    operationRecord: '操作記錄',
    onlineUser: '線上用戶'
  },
  navbarTip: {
    message: '消息',
    search: '蒐索',
    screenFull: '全屏',
    elementSize: '佈局大小',
    language: '語言',
  },
  route: {
    dashboard: '首頁',
    documentation: '文檔',
    guide: '引導頁',
    permission: '權限測試頁',
    rolePermission: '角色權限',
    pagePermission: '頁面權限',
    directivePermission: '指令權限',
    icons: '圖標',
    components: '組件',
    tinymce: '富文本編輯器',
    markdown: 'Markdown',
    jsonEditor: 'JSON 編輯器',
    dndList: '列表拖拽',
    splitPane: 'Splitpane',
    avatarUpload: '頭像上傳',
    dropzone: 'Dropzone',
    sticky: 'Sticky',
    countTo: 'Count To',
    componentMixin: '小組件',
    backToTop: '返回頂部',
    dragDialog: '拖拽 Dialog',
    dragSelect: '拖拽 Select',
    dragKanban: '可拖拽看板',
    charts: '圖表',
    keyboardChart: '鍵盤圖表',
    lineChart: '折綫圖',
    mixChart: '混合圖表',
    example: '綜合實例',
    nested: '路由嵌套',
    menu1: '菜單1',
    'menu1-1': '菜單 1-1',
    'menu1-2': '菜單 1-2',
    'menu1-2-1': '菜單 1-2-1',
    'menu1-2-2': '菜單 1-2-2',
    'menu1-3': '菜單 1-3',
    menu2: '菜單 2',
    Table: 'Table',
    dynamicTable: '動態 Table',
    dragTable: '拖拽 Table',
    inlineEditTable: 'Table 內編輯',
    complexTable: '綜合 Table',
    tab: 'Tab',
    form: '表單',
    createArticle: '創建文章',
    editArticle: '編輯文章',
    articleList: '文章列表',
    errorPages: '錯誤頁面',
    page401: '401',
    page404: '404',
    errorLog: '錯誤日志',
    excel: 'Excel',
    exportExcel: '導出 Excel',
    selectExcel: '導出 已選擇項',
    mergeHeader: '導出 多級表頭',
    uploadExcel: '上傳 Excel',
    zip: 'Zip',
    pdf: 'PDF',
    exportZip: 'Export Zip',
    theme: '換膚',
    clipboardDemo: 'Clipboard',
    i18n: '國際化',
    externalLink: '外鏈',
    profile: '个人中心'
  },
  navbar: {
    layoutSettings: '佈局設定',
    document: '檔案',
    dashboard: '首頁',
    github: '項目地址',
    logOut: '退出登錄',
    profile: '个人中心',
    theme: '換膚',
    size: '布局大小',
    refreshPerms: '刷新權限',
    refresh: '刷新'
  },
  sizeOptions: [
    { label: '默認', value: 'default' },
    { label: '中等', value: 'medium' },
    { label: '小型', value: 'small' },
    { label: '迷你', value: 'mini' },
  ],
  login: {
    title: '系統登錄',
    logIn: '登錄',
    username: '賬號',
    password: '密碼',
    any: '隨便塡',
    thirdparty: '第三方登錄',
    thirdpartyTips: '本地不能模擬，請結合自己業務進行模擬！！！'
  },
  documentation: {
    documentation: '文檔',
    github: 'Github 地址'
  },
  permission: {
    addRole: '新增角色',
    editPermission: '編輯權限',
    roles: '你的權限',
    switchRoles: '切換權限',
    tips: '在某些情況下，不適合使用 v-permission。例如：Element-UI 的 el-tab 或 el-table-column 以及其它動態渲染 dom 的場景。你只能通過手動設置 v-if 來實現。',
    delete: '删除',
    confirm: '确定',
    cancel: '取消'
  },
  guide: {
    description: '引導頁對於一些第一次進入項目的人很有用，你可以簡單介紹下項目的功能。本 Demo 是基於',
    button: '打開引導'
  },
  components: {
    documentation: '文檔',
    tinymceTips: '富文本是管理後臺一个核心的功能，但同時又是一个有很多坑的地方。在選擇富文本的過程中我也走了不少的彎路，市面上常見的富文本都基本用過了，最終權衡了一下選擇了Tinymce。更詳細的富文本比較和介紹見',
    dropzoneTips: '由於我司業務有特殊需求，而且要傳七牛 所以沒用第三方，選擇了自己封裝。代碼非常的簡單，具體代碼你可以在這裏看到 @/components/Dropzone',
    stickyTips: '當頁面滾動到預設的位置會吸附在頂部',
    backToTopTips1: '頁面滾動到指定位置會在右下角出現返回頂部按鈕',
    backToTopTips2: '可自定義按鈕的樣式、show/hide、出現的高度、返回的位置 如需文字提示，可在外部使用Element的el-tooltip元素',
    imageUploadTips: '由於我在使用時它只有vue@1版本，而且和mockjs不兼容，所以自己改造了一下，如果大家要使用的話，優先還是使用官方版本。'
  },
  table: {
    dynamicTips1: '固定表頭, 按照表頭順序排序',
    dynamicTips2: '不固定表頭, 按照點擊順序排序',
    dragTips1: '默認順序',
    dragTips2: '拖拽後順序',
    title: '標題',
    importance: '重要性',
    type: '類型',
    remark: '點評',
    search: '搜索',
    add: '添加',
    export: '導出',
    reviewer: '審核人',
    id: '序號',
    date: '時間',
    author: '作者',
    readings: '閲讀數',
    status: '狀態',
    actions: '操作',
    edit: '編輯',
    publish: '發布',
    draft: '草稿',
    delete: '删除',
    cancel: '取 消',
    confirm: '确 定'
  },
  example: {
    warning: '創建和編輯頁面是不能被 keep-alive 緩存的，因為keep-alive 的 include 目前不支持根據路由來緩存，所以目前都是基於 component name 來進行緩存的。如果你想類似的實現緩存效果，可以使用 localStorage 等瀏覽器緩存方案。或者不要使用 keep-alive 的 include，直接緩存所有頁面。詳情見'
  },
  errorLog: {
    tips: '請點擊右上角bug小圖標',
    description: '現在的管理後臺基本都是spa的形式了，它增強了用戶體驗，但同時也會增加頁面出問題的可能性，可能一个小小的疏忽就導致整个頁面的死鎖。好在 Vue 官網提供了一个方法來捕獲處理異常，你可以在其中進行錯誤處理或者異常上報。',
    documentation: '文檔介紹'
  },
  excel: {
    export: '導出',
    selectedExport: '導出已選擇項',
    placeholder: '請輸入文件名(默認excel-list)'
  },
  zip: {
    export: '導出',
    placeholder: '請輸入文件名(默認file)'
  },
  pdf: {
    tips: '這裏使用   window.print() 來實現下載pdf的功能'
  },
  theme: {
    change: '換膚',
    changeColor: '編譯主題顏色',
    documentation: '換膚文檔',
    tips: 'Tips: 它區別於 navbar 上的 theme-pick, 是兩種不同的換膚方法，各自有不同的應用場景，具體請參考文檔。'
  },
  tagsView: {
    refresh: '刷新',
    close: '關閉',
    closeOthers: '關閉其它',
    closeAll: '關閉所有'
  },
  settings: {
    title: '系統布局配置',
    theme: '主題色',
    tagsView: '開啓 Tags-View',
    fixedHeader: '固定 Header',
    sidebarLogo: '側邊欄 Logo',
    leftMenuBar: '左側功能表列佈局'
  }
}

export default tw;
