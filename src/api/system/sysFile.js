import request from '@/utils/request'

//查询文件列表
export function readCurrentFile(query){
    return request({
      url: '/sysFile/readCurrentFileList',
      method: 'get',
      params: query
    })
}

//删除多个选择的文件
export function deleteSelectedFiles(query){
    return request({
      url: '/sysFile/deleteSelectedFiles',
      method: 'post',
      data: query
    })
}

//删除文件或者文件夹
export function deleteFileByRecursion(query){
    return request({
      url: '/sysFile/deleteFileByRecursion',
      method: 'get',
      params: query
    })
}

//递归删除文件夹下的所有文件
export function deleteCategoryFile(query){
    return request({
      url: '/sysFile/deleteFile',
      method: 'get',
      params: query
    })
}