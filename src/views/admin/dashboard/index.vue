<template>
  <div class="dashboard-container home">
    <el-row :gutter="20">
      <el-col :sm="24" :lg="24">
        <blockquote class="text-warning" style="font-size: 14px">
          <h2>
            <el-link href="/" type="info" target="_blank"
              >极客普拉斯</el-link
            >
          </h2>
          <el-button class="mobile" type="primary" icon="el-icon-document"
            ><el-link
              target="_blank"
              type="info"
              href="#"
              >XXXX</el-link
            ></el-button
          >
          <br />
          <el-link
            href="/"
            type="primary"
            target="_blank"
            >###</el-link
          >
          <br />
          极客普拉斯
          <br />
          <el-link
            href="/"
            type="primary"
            target="_blank"
            >###</el-link
          >
          <br />
          极客普拉斯后端
          <el-link
            href="https://github.com/geekgarry/geekplus-admin-springboot-api"
            type="primary"
            target="_blank"
            >>☛☛点我进入☚☚</el-link
          >
          &nbsp;&nbsp;&nbsp; 极客普拉斯前端
          <el-link
            href="https://github.com/geekgarry/geekplus-admin-vue-ui"
            type="primary"
            target="_blank"
            >>☛☛点我进入☚☚</el-link
          ><br />
          <h4 class="text-danger">极客普拉斯</h4>
        </blockquote>

        <hr />
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :sm="12" :lg="12" :md="12" style="padding-left: 20px">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>中国地图</span>
            <el-button style="float: right; padding: 3px 0" type="text"
              >清除</el-button
            >
          </div>
          <!-- <el-calendar v-model="dateValue" >
          </el-calendar> -->
          <div
            class="chinaMap"
            ref="chinaMap"
            style="width: 500px; height: 300px"
          ></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="12" :lg="12" style="padding-left: 20px">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>二维码生成</span>
            <el-button style="float: right; padding: 3px 0" type="text"
              >清空</el-button
            >
          </div>
          <!-- <el-calendar v-model="dateValue" >
          </el-calendar> -->
          <div>
            <el-form
              status-icon
              ref="qrCodeForm"
              class="demo-ruleForm"
            >
              <el-form-item prop="qrCodeText">
                <el-input
                  placeholder="请输入要生成的文本"
                  v-model="qrCodeText"
                  @keyup.enter.native="getQRCodeImg"
                  class="input-with-select"
                >
                  <!-- <el-select v-model="select" slot="prepend" placeholder="请选择">
                    <el-option label="" value="1"></el-option>
                    <el-option label="" value="2"></el-option>
                    <el-option label="" value="3"></el-option>
                  </el-select> -->
                  <el-button
                    slot="append"
                    icon="el-icon-s-promotion"
                    @click="getQRCodeImg"
                    >生成</el-button
                  >
                </el-input>
              </el-form-item>
            </el-form>
          </div>
          <div class="block" style="text-align:center;">
            <el-image
              :src="qrCodeImg"
              :preview-src-list="[qrCodeImg]"
            >
              <div slot="error" class="image-slot">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :sm="24" :lg="12" style="padding-left: 20px">
        <h2>GeekPlusAdmin管理框架</h2>
        <p>
          一直想做一款后台管理系统，看了很多优秀的开源项目但是发现没有合适自己的。于是利用空闲休息时间开始自己写一套后台系统。如此有了极客普拉斯管理系统。他可以用于所有的Web应用程序，如网站管理后台等等，当然，您也可以对它进行代码修改定制操作。所有前端后台代码封装过后十分精简易上手，出错概率低。同时支持移动客户端访问。会陆续更新下去！。
        </p>
        <p>
          <b>当前版本:</b> <span>v{{ version }}</span>
        </p>
        <p>
          <el-tag type="danger">&yen;免费开源</el-tag>
        </p>
        <p>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-cloudy"
            plain
            @click="
              goTarget('https://github.com/geekgarry/geekplus-admin-vue-ui')
            "
            >访问Github</el-button
          >
          <el-button
            size="mini"
            icon="el-icon-s-home"
            plain
            @click="goTarget('/')"
            >访问主页</el-button
          >
        </p>
      </el-col>

      <el-col :sm="24" :lg="12" style="padding-left: 50px">
        <el-row>
          <el-col :span="12">
            <h2>技术选型</h2>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            <h4>后端技术</h4>
            <ul>
              <li>SpringBoot</li>
              <li>Shiro</li>
              <li>Redis</li>
              <li>MyBatis</li>
              <li>Druid</li>
              <li>Fastjson</li>
              <li>...</li>
            </ul>
          </el-col>
          <el-col :span="6">
            <h4>前端技术</h4>
            <ul>
              <li>Vue</li>
              <li>Vuex</li>
              <li>Element-ui</li>
              <li>Axios</li>
              <li>Sass</li>
              <li>Quill</li>
              <li>...</li>
            </ul>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-divider />
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <div slot="header" class="clearfix">
            <span>系统公告</span>
          </div>
          <div class="body">
            <!-- <el-table :data="noticeList">
              <el-table-column align="center" label="公告" prop="noticeContent" />
            </el-table> -->
            <span v-for="(item, index) in noticeList" :key="index">
              <p>
                <i class="el-icon-s-promotion"></i
                ><el-link :href="item.noticeUrl" target="_blank">{{
                  item.noticeTitle
                }}</el-link>
              </p>
              <span v-html="item.noticeContent"></span>
              <el-divider />
            </span>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <div slot="header" class="clearfix">
            <span>更新日志</span>
          </div>
          <el-collapse accordion>
            <el-collapse-item title="v1.0.0 - 2020-11-18">
              <ol>
                <li>阻止任意文件下载漏洞</li>
                <li>代码生成支持上传控件</li>
                <li>新增图片上传组件</li>
                <li>调整默认首页</li>
                <li>升级druid到最新版本v1.2.2</li>
                <li>mapperLocations配置支持分隔符</li>
                <li>权限信息调整</li>
                <li>调整sql默认时间</li>
                <li>解决代码生成没有bit类型的问题</li>
                <li>升级pagehelper到最新版1.3.0</li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="v0.0.9 - 2020-10-10">
              <ol>
                <li>升级springboot版本到2.1.17 提升安全性</li>
                <li>升级oshi到最新版本v5.2.5</li>
                <li>升级druid到最新版本v1.2.1</li>
                <li>升级jjwt到版本0.9.1</li>
                <li>升级fastjson到最新版1.2.74</li>
                <li>修改sass为node-sass，避免el-icon图标乱码</li>
                <li>代码生成支持同步数据库</li>
                <li>代码生成支持富文本控件</li>
                <li>代码生成页面时不忽略remark属性</li>
                <li>代码生成添加select必填选项</li>
                <li>Excel导出类型NUMERIC支持精度浮点类型</li>
                <li>Excel导出targetAttr优化获取值，防止get方法不规范</li>
                <li>Excel注解支持自动统计数据总和</li>
                <li>Excel注解支持设置BigDecimal精度&舍入规则</li>
                <li>菜单&数据权限新增（展开/折叠 全选/全不选 父子联动）</li>
                <li>允许用户分配到部门父节点</li>
                <li>菜单新增是否缓存keep-alive</li>
                <li>表格操作列间距调整</li>
                <li>限制系统内置参数不允许删除</li>
                <li>富文本组件优化，支持自定义高度&图片冲突问题</li>
                <li>富文本工具栏样式对齐</li>
                <li>导入excel整形值校验优化</li>
                <li>修复页签关闭所有时固定标签路由不刷新问题</li>
                <li>表单构建布局型组件新增按钮</li>
                <li>左侧菜单文字过长显示省略号</li>
                <li>修正根节点为子部门时，树状结构显示问题</li>
                <li>修正调用目标字符串最大长度</li>
                <li>修正菜单提示信息错误</li>
                <li>修正定时任务执行一次权限标识</li>
                <li>修正数据库字符串类型nvarchar</li>
                <li>优化递归子节点</li>
                <li>优化数据权限判断</li>
                <li>其他细节优化</li>
              </ol>
            </el-collapse-item>

            <el-collapse-item title="v1.0.0 - 2019-10-08">
              <ol>
                <li>极客普拉斯前后端分离系统正式发布</li>
              </ol>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="update-log">
          <div slot="header" class="clearfix">
            <span>捐赠支持</span>
          </div>
          <div class="body">
            <p>
              <i class="el-icon-s-promotion"></i> 官网：<el-link
                href="/"
                target="_blank"
                >梦极客园</el-link
              >
            </p>
            <!-- <img
              src="/"
              alt="donate"
              width="50%"
            />
            <img
              src="/"
              alt="donate"
              width="50%"
            />
            <span style="display: inline-block; height: 30px; line-height: 30px"
              >你可以请作者喝杯奶茶表示鼓励和支持</span
            > -->
          </div>
        </el-card>
      </el-col>
    </el-row>
    <!-- <div class="dashboard-text">name: {{ nickName }}</div> -->
  </div>
</template>

<script>
import '@/assets/echarts/map/js/china';
import * as echarts from 'echarts';

import { listNotice, getNotice } from "@/api/system/notice";
import { getViewCount } from "@/api/system/log/operlog";
import { getQRCodeImg } from "@/api/common"
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'nickName'
    ])
  },
  data() {
    return {
      version: '1.1.1',
      noticeList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
      },
      dateValue: new Date(),
      qrCodeRules: {
        qrCodeText: [
          { required: true, message: '请输入', trigger: 'blur' },
        ],
      },
      qrCodeText: '',
      qrCodeImg: '',
      webViewData: [
        { name: "北京", value: 17 },
        { name: '天津', value: 12 },
        { name: '上海', value: 15 },
        { name: '重庆', value: 15 },
        { name: '河北', value: 15 },
        { name: '河南', value: 15 },
        { name: '云南', value: 5 },
        { name: '辽宁', value: 15 },
        { name: '黑龙江', value: 15 },
        { name: '湖南', value: 2 },
        { name: '安徽', value: 15 },
        { name: '山东', value: 15 },
        { name: '新疆', value: 3 },
        { name: '江苏', value: 3 },
        { name: '浙江', value: 9 },
        { name: '江西', value: 15 },
        { name: '湖北', value: 4 },
        { name: '广西', value: 4 },
        { name: '甘肃', value: 10 },
        { name: '山西', value: 15 },
        { name: '内蒙古', value: 15 },
        { name: '陕西', value: 9 },
        { name: '吉林', value: 8 },
        { name: '福建', value: 9 },
        { name: '贵州', value: 9 },
        { name: '广东', value: 8 },
        { name: '青海', value: 3 },
        { name: '西藏', value: 9 },
        { name: '四川', value: 0 },
        { name: '宁夏', value: 15 },
        { name: '海南', value: 7 },
        { name: '台湾', value: 4 },
        { name: '香港', value: 4 },
        { name: '澳门', value: 3 }
      ]
    }
  },
  created() {
    this.getNoticeList();
    //this.init()
  },
  async mounted() {
    await this.getSysOperLog();
    //this.initCharts()
  },
  methods: {
    getNoticeList() {
      listNotice(this.queryParams).then((res) => {
        this.noticeList = res.rows
      })
    },
    getWebViewList(res){
      this.webViewData=res.data;
      this.initCharts();
    },
    async getSysOperLog(){
      let _this=this;
      await getViewCount().then(_this.getWebViewList)
    },
    getQRCodeImg() {
      getQRCodeImg(this.qrCodeText).then((res) => {
        this.qrCodeImg = "data:image/gif;base64," + res.data;
        //console.log(res.data);
      });
    },
    initCharts() {
      let mapcharts = echarts.init(this.$refs.chinaMap);
      //窗口尺寸改变
      window.addEventListener("resize", function () {
        mapcharts.resize();
      })

      // 绘制图表
      mapcharts.setOption({
        series: [{
          type: 'map',
          map: 'china',
          layoutCenter: ['40%', '50%'], // 地图布局中心点
          layoutSize: 270,
          label: {
            show: true,
            color: '#ffffff',
            fontSize: 10,
          },
          itemStyle: {
            areaColor: '#eee',
            borderColor: '#24dafe',
          },
          roam: true,
          zoom: 1.2,
          emphasis: {
            label: {
              color: '#fff',
              fontSize: 12,
              fontWeight: 'bold'
            },
            itemStyle: {
              areaColor: 'none',
              borderColor: '#77ebff',
              borderWidth: 2
            }
          },
          data: this.webViewData
        }],
        visualMap: [{
          type: 'piecewise',
          show: true,
          pieces: [
            { min: 0, max: 50 },
            { min: 50, max: 100 },
            { min: 100, max: 1000 },
            { min: 1000, max: 5000 },
            { min: 5000, max: 10000 },
            { min: 10000}
          ],
          textStyle: {
            color: '#828994'
          },
          itemWidth: 64, // 每个图元的宽度
          itemHeight: 12,
          top: "top",
          right: "0",
          inRange: {
            borderRadius: 4,
            color: [
              '#84bbff',
              '#70b4ff',
              '#61a7ff',
              '#4d90f2',
              '#3988f7',
              '#2e81f5'
            ]
          },
        }],
        tooltip: {
          trigger: 'item',  //数据项图形触发
          backgroundColor: "#222121",
          borderWidth: 0,
          formatter: '地区：{b}<br/>数据：{c}'
        },
        toolbox: {
          show: true,
          orient: 'vertical',
          left: 'right',
          bottom: '0',
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.home {
  blockquote {
    padding: 10px 20px;
    margin: 0 0 20px;
    font-size: 17.5px;
    border-left: 5px solid var(--borderColor, #eee);
  }
  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid var(--borderColor, #eee);
  }
  .col-item {
    margin-bottom: 20px;
  }

  ul {
    padding: 0;
    margin: 0;
  }

  font-family: "open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 13px;
  color: #676a6c;
  overflow-x: hidden;

  ul {
    list-style-type: none;
  }

  h4 {
    margin-top: 0px;
  }

  h2 {
    margin-top: 10px;
    font-size: 26px;
    font-weight: 100;
  }

  p {
    margin-top: 10px;

    b {
      font-weight: 700;
    }
  }

  .update-log {
    ol {
      display: block;
      list-style-type: decimal;
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0;
      margin-inline-end: 0;
      padding-inline-start: 40px;
    }
  }
}
</style>
