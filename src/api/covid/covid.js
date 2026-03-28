import request from '@/utils/request'

//获取疫情数据
export function getcovid() {
    return request({
      url: '/covid/getAllData',
      method: 'get',
    })
}

//获取世界疫情数据
export function getWorldCovid() {
    return request({
      url: '/covid/getCovid19Foreign',
      method: 'get',
    })
}