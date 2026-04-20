<template>
  <div class="footer">
    <el-container>
      <el-main>
        <!-- <el-row gutter="5">
          <el-col xs="24" sm="24" md="24" lg="24" xl="24">

          </el-col>
        </el-row> -->
        <div class="footer-web-info">
          <!-- <h2>GeekPlus<span style="color:#FF6347;">'S</span> 梦极客园</h2> -->
          <p class="web-message">
            由<a
              href="/"
              target="_blank"
              >GeekPlus</a
            >提供技术支持
          </p>
          <p class="copyright" >
            版权所有(all rights reserved) © 2019-present GeekPlus
            <!-- <a href="http://beian.miit.gov.cn"
              target="_blank">苏ICP备0000000号</a> -->
          </p>
          <!-- <p>
            <span id="busuanzi_container_site_pv"
              >本站总访问量<span id="busuanzi_value_site_pv"></span>次</span
            >
          </p> -->
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import { defineComponent } from "vue";

export default {
  name: "PlusFooter",
}
</script>
<style lang="scss" scoped>
.footer {
  background-color: var(--background-1);
  color: var(--fontColor);
}

a {
  text-decoration: underline
}

p {
  padding: 0;
  margin: 0;
}

.footer-web-info {
  text-align: center;
  padding: 12px;
}

p.web-message, p.copyright {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
}
</style>
