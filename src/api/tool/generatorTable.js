import request from '@/utils/request'

// 查询所有非系统数据表
export function getListTableInfo(queryParams) {
    return request({
        url: '/generator/getAllTable',
        method: 'get',
        params: queryParams
    })
}

// 获取表格详细信息
export function getAllListTableInfo(queryParams) {
    return request({
        url: '/generator/getAllListTable',
        method: 'get',
        params: queryParams
    })
}

// 查询所有导入的数据表
export function listGenTable(queryParams) {
    return request({
        url: '/generator/table/list',
        method: 'get',
        params: queryParams
    })
}

// 获取导入的数据表信息
export function getGenTable(queryParams) {
    return request({
        url: '/generator/table/detail',
        method: 'get',
        params: queryParams
    })
}

// 删除导入的数据表信息
export function delGenTable(tableIds) {
    return request({
        url: '/generator/table/' + tableIds,
        method: 'delete'
    })
}

// 修改导入的数据表信息
export function modifyGenTable(dataForm) {
    return request({
        url: '/generator/table/update',
        method: 'post',
        data: dataForm
    })
}

// 添加导入的数据表信息
export function addGenTable(dataForm) {
    return request({
        url: '/generator/table/add',
        method: 'post',
        data: dataForm
    })
}

// 添加生成的数据表信息
export function genAddGenTableInfo(dataForm) {
    return request({
        url: '/generator/table/genTable',
        method: 'post',
        data: dataForm
    })
}

// 预览生成代码（uiType: element | antd）
export function previewTableCode(tableId, uiType = 'element') {
    return request({
        url: '/generator/previewCodeByGenTable/' + tableId,
        method: 'get',
        params: { uiType }
    })
}

// 按表名下载（uiType: element | antd）
export function downloadCode(tableName, uiType = 'element') {
    return request({
        url: '/generator/download/' + tableName,
        method: 'get',
        params: { uiType },
        responseType: "blob"
    })
}

// 按 gen_table 下载（uiType: element | antd）
export function downloadByGenTable(tableIds, uiType = 'element') {
    return request({
        url: '/generator/downloadByGenTable/' + tableIds,
        method: 'get',
        params: { uiType },
        responseType: "blob"
    })
}

// 清空生成数据表
export function cleanGenTable() {
    return request({
        url: '/generator/genTable/clean',
        method: 'delete'
    })
}

/** 发布菜单预览（元数据，不校验磁盘） */
export function publishMenuPreview(tableId) {
    return request({
        url: '/generator/table/publishMenuPreview/' + tableId,
        method: 'get'
    })
}

/** 幂等发布菜单（与 ZIP 下载分离） */
export function publishGenMenus(data) {
    return request({
        url: '/generator/table/publishMenus',
        method: 'post',
        data
    })
}
