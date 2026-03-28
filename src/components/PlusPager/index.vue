<template>
  <div class="navigation_pager" v-if="total != 0 && total > pageSize">
    <ul class="pagination">
      <li class="page-prev" :class="{ disabled: pageNum == 1 }">
        <a href="javascript:;" @click="getCurrentPage(pageNum - 1)" aria-label="Previous">
          <!-- &laquo; -->
          <i class="el-icon-arrow-left"></i>
        </a>
      </li>
      <li v-for="(pageNumber, index) in totalPages" :key="index" class="page-number" @click="getCurrentPage(pageNumber)" :class="{ active: pageNum == pageNumber }" v-if="totalPages <= pagerLimit">
        <a href="javascript:void(0);">
          {{ pageNumber }}
        </a>
      </li>
      <li class="page-number" @click="getCurrentPage(1)" :class="{ active: pageNum == 1 }" v-if="totalPages > pagerLimit && pageNum >= pagerLimit - 1">
        <a href="javascript:void(0);">
          1
        </a>
      </li>
      <template v-if="totalPages > pagerLimit" v-for="(pageNumber, index) in totalPages">
        <li class="page-number" :key="index" @click="getCurrentPage(pageNumber)" v-if="pageNum < pagerLimit-1 && pageNumber <= pagerLimit-1" :class="{ active: pageNum == pageNumber }">
          <a href="javascript:void(0);">{{ pageNumber }}
          </a>
        </li>
        <li class="page-number" :key="index" @click="getCurrentPage(pageNumber)" v-if="pageNum >= pagerLimit-1 && pageNum <= totalPages - pagerLimit + 2  && pageNumber >= pageNum - ((pagerLimit - 2) / 2) && pageNumber <= pageNum + (pagerLimit - 2) / 2" :class="{ active: pageNum == pageNumber }">
          <a href="javascript:void(0);">{{ pageNumber }}
          </a>
        </li>
        <li class="page-number" :key="index" @click="getCurrentPage(pageNumber)" v-if="pageNum <= totalPages && pageNum > totalPages - pagerLimit +2 && pageNumber > totalPages - (pagerLimit - 1) && pageNumber <= totalPages" :class="{ active: pageNum == pageNumber }">
          <a href="javascript:void(0);">{{ pageNumber }}</a>
        </li>
      </template>
      <li class="page-number" @click="getCurrentPage(totalPages)" :class="{ active: pageNum == totalPages }" v-if="totalPages > pagerLimit && pageNum + pagerLimit - 2 <= totalPages">
        <a href="javascript:void(0);">
          {{ totalPages }}
        </a>
      </li>
      <li class="page-next" :class="{ disabled: pageNum == totalPages }">
        <a href="javascript:;" @click="getCurrentPage(pageNum + 1)" aria-label="Next">
          <!-- &raquo; -->
          <i class="el-icon-arrow-right"></i>
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "PlusPager",
  props: {
    pagerCount: {
      type: Number,
      default: 5
    },
    total: {
      type: Number,
      default: 200
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 10
    },
    // layout: {
    //   type: String,
    //   default: "total, sizes, prev, pager, next, jumper",
    // },
    // background: {
    //   type: Boolean,
    //   default: true,
    // },
    // autoScroll: {
    //   type: Boolean,
    //   default: true,
    // },
    // hidden: {
    //   type: Boolean,
    //   default: false,
    // },
  },
  data() {
    return {
    };
  },
  computed: {
    pagerLimit() {
      if(!this.isOdd(this.pagerCount)) {
        return this.pagerCount+1;
      }
      return this.pagerCount;
    },
    pageNum() {
      return this.page;
    },
    pageSize() {
      return this.limit;
    },
    totalPages() {
      return Math.ceil(this.total / this.pageSize);
    }
  },
  mounted() {
  },
  methods: {
    getCurrentPage(num) {
      this.$emit('update:page', num);
      this.$emit("pagination");
    },
    /* 是否为奇数 */
    isOdd(number) {
      return (number & 1) !== 0;
    }
  }
};
</script>

<style lang="scss" scoped>
.navigation_pager {
  padding: 2px 5px;
}

.pagination {
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  list-style: none;
  display: inline-block;
  vertical-align: middle;
  font-size: 0;
  padding: 0;
  margin: 0;
}

.pagination>li {
  display: inline-block;
  margin: 0 5px;
  font-size: 13px;
  min-width: 30px;
  height: 28px;
  line-height: 28px;
  vertical-align: middle;
  cursor: pointer;
  box-sizing: border-box;
  text-align: center;
  border-radius: 2px;
  overflow: hidden;
  color: var(--fontColor, #333333);
  background: var(--background-2, #fefefe);
}

.pagination>.page-prev.disabled,
.pagination>.page-next.disabled {
  position: relative;
  z-index: 1;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.1);
  /* 内阴影 */
  cursor: not-allowed;
  pointer-events: unset;
}
.pagination>.page-prev.disabled::before,
.pagination>.page-next.disabled::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  background: var(--disabled-background, rgba(255, 255, 255, 0.7));
  /* 透明度可以根据需要调整 */
  filter: grayscale(100%);
}
.pagination>li.page-prev>a,
.pagination>li.page-next>a {
  display: block;
  text-decoration: none;
}
.pagination>li.page-number>a {
  display: inline-block;
  text-decoration: none;
}

.pagination>li.page-number.active {
  color: #fff !important;
  cursor: default;
  background: var(--theme-color, #33b7a1);
}

/* .pagination>.page-number>a:focus{} */
.pagination>li.page-number:hover {
  cursor: pointer;
  color: var(--theme-color, #18b8a8);
}
</style>
