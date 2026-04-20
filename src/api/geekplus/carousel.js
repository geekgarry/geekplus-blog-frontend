import request from '@/utils/request'

// 查询首页跑马灯轮播图列表
export function listCarousel(query) {
  return request({
    url: '/geekplus/carousel/list',
    method: 'get',
    params: query
  })
}

// 查询所有图片资源
export function listAllImageSrc() {
  return request({
    url: '/geekplus/carousel/getImageList',
    method: 'get',
  })
}

// 上传图片资源
export function uploadFile(data) {
  return request({
    url: '/geekplus/carousel/uploadCarousel',
    method: 'post',
    data:data
  })
}

// 删除图片资源
export function deleteFile(params) {
  return request({
    url: '/geekplus/carousel/deleteFile',
    method: 'get',
    params:params
  })
}

// 查询首页跑马灯轮播图详细
export function getCarousel(id) {
  return request({
    url: '/geekplus/carousel/' + id,
    method: 'get'
  })
}

// 新增首页跑马灯轮播图
export function addCarousel(data) {
  return request({
    url: '/geekplus/carousel',
    method: 'post',
    data: data
  })
}

// 修改首页跑马灯轮播图
export function updateCarousel(data) {
  return request({
    url: '/geekplus/carousel',
    method: 'put',
    data: data
  })
}

// 删除首页跑马灯轮播图
export function delCarousel(id) {
  return request({
    url: '/geekplus/carousel/' + id,
    method: 'delete'
  })
}

// 导出首页跑马灯轮播图
export function exportCarousel(query) {
  return request({
    url: '/geekplus/carousel/export',
    method: 'get',
    params: query
  })
}