<template>
  <div class="container-fluid">
    <div class="container">
      <el-main>
        <el-row :gutter="10">
          <el-col :xs="24" :sm="24" :md="24" :lg="{ span: 14, offset: 5 }" :xl="{ span: 12, offset: 6 }">
            <div class="write-container">
              <div class="write-heading">
                <h3 class="text-center">用户投稿</h3>
              </div>
              <div class="write-body">
                <el-form ref="articleData" :model="articleData" label-width="60px">
                  <el-form-item label="标题">
                    <el-input type="text" v-model="articleData.name"></el-input>
                  </el-form-item>
                  <el-form-item label="作者">
                    <el-input type="text" v-model="articleData.authorName"></el-input>
                  </el-form-item>
                  <el-form-item label="分类">
                    <el-select placeholder="请选择分类" v-model="articleData.articleCategory"
                      @change="getSelect(articleData.articleCategory)">
                      <el-option-group v-for="(item, index) in listCategory" :key="index" :label="item.categoryName">
                        <el-option v-for="(subitem, subindex) in item.children" :key="subindex" :value="subitem.id">
                          {{ subitem.categoryName }}
                        </el-option>
                      </el-option-group>
                    </el-select>
                  </el-form-item>
                  <el-form-item label="内容">
                    <quill-editor v-model="articleContent"></quill-editor>
                    <!-- <quill-editor
                        class="gpeditor"
                        ref="gpTextEditor"
                        name="gpTextEditor"
                        v-model="articleContent"
                        :options="editorOption"
                        @blur="onEditorBlur($event)"
                        @focus="onEditorFocus($event)"
                        @ready="onEditorReady($event)"
                        @change="onEditorChange($event)"
                      >
                      </quill-editor> -->
                  </el-form-item>
                </el-form>
              </div>
              <div class="write-footer">
                <div class="text-center">
                  <el-button type="primary" @click="userWriteArticles">投稿</el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-main>
    </div>
  </div>
</template>

<script>
import QuillEditor from "@/components/QuillEditor";
import {
  listSubParentCategory,
  listSubCategory,
  userWriteGpArticles,
  uploadAllFile,
  deleteFile,
} from "@/api/geekplus/geekplus";
export default {
  components: {
    QuillEditor
  },
  data() {
    return {
      keywords: "",
      articleContent: "",//双向绑定数据内容富文本编辑器的内容
      articleData: {
        articleTitle: "",
        authorName: "",
        articleCategory: "",
        articleContent: "",
      }, //用户提交的文章信息
      listCategory: [],
    };
  },
  created() {
    // setTimeout(()=>{},1000);
    this.getCategory();
    //console.log(Object.assign({}, [...this.listCategory]));
    // document.addEventListener("keydown", (e) => {
    //   let key = window.event.keyCode;
    //   if (key == 13 && !this.keywords!='') {
    //     // 13是enter键的键盘码 如果等于13 就调用click的登录方法
    //     this.searchResult();
    //   }
    // });
  },
  beforeMount() { },
  mounted() { },
  methods: {
    getCategory() {
      let that = this;
      listSubParentCategory()
        .then((response) => {
          let tempData = response.data;
          //   console.log("开始");
          //   console.log([...tempData]); //拷贝一个数组,&nbsp;打印此刻的瞬时状态
          //   console.log(tempData[0].children);
          //   console.log("结束");
          that.listCategory = tempData;
          //console.log(that.listCategory);
        })
        .catch((error) => {
          this.$message({
            message: error.msg || error,
            duration: 3000,
            type: "error"
          });
        });
    },
    userWriteArticles() {
      this.articleData.articleContent = this.articleContent;
      if (
        this.articleData.articleTitle == "" ||
        this.articleData.authorName == "" ||
        this.articleData.articleCategory == "" ||
        this.articleContent == ""
      ) {
        this.$message({
          message: "内容不能为空！请重新输入",
          duration: 3000,
          type: "error"
        });
      } else {
        //this.onEditorBlur();
        userWriteGpArticles(this.articleData)
          .then((res) => {
            if (res.code === 200) {
              this.$message({
                message: '投稿成功！',
                duration: 3000,
                type: "info"
              });
              this.resetForm();
            }
            // this.allImageList=[];
          })
          .catch((error) => {
            this.$message({
              message: error.msg || error,
              duration: 3000,
              type: "error"
            });
          });
      }
    },
    //重置所有输入框数据
    resetForm() {
      this.articleData = {};
      this.articleContent = "";
    },
    searchResult() {
      if (this.keywords !== "") {
        //this.$router.push("/search?keayword="+this.keywords);
        this.$router.push({
          path: "/search",
          query: { keyword: this.keywords },
        });
      }

      this.keywords = "";
    },
    getSelect(th) {
      //console.log(th);
    },
  },
};
</script>

<style lang="scss" scoped>
.write-container {
  margin: 0 auto;
  background: var(--background-1);
  color: var(--fontColor, #333333);
  padding: 6px;
  border-radius: 4px;
}

/** ::v-deep  */
/*.ql-snow.ql-toolbar button.ql-upload{
  background-image: url("./../../assets/icon/svg/upload.svg") !important;
  background-size: 18px 18px !important;
  background-position: center center !important;
  background-repeat:no-repeat !important;
}*/
/*.quill-editor {
  .ql-container.ql-snow {
    line-height: normal !important;
    font-size: 14px;
    height: 400px !important;
  }
  /*加上height和滚动属性就可以，滚动条样式是系统默认样式，可能不同*/
/* .ql-snow .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options {
    border-color: #ccc;
    height: 125px;
    overflow: auto;
  } */
/*.ql-snow .ql-tooltip[data-mode="link"]::before {
    content: "请输入链接地址:";
  }
  .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
    border-right: 0px;
    content: "保存";
    padding-right: 0px;
  }

  .ql-snow .ql-tooltip[data-mode="video"]::before {
    content: "请输入视频地址:";
  }

  .ql-snow .ql-picker.ql-size .ql-picker-label::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item::before {
    content: "14px";
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="small"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before {
    content: "10px";
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="large"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before {
    content: "18px";
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="huge"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before {
    content: "32px";
  }

  .ql-snow .ql-picker.ql-header .ql-picker-label::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item::before {
    content: "文本";
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
    content: "标题1";
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
    content: "标题2";
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
    content: "标题3";
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
    content: "标题4";
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="5"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="5"]::before {
    content: "标题5";
  }
  .ql-snow .ql-picker.ql-header .ql-picker-label[data-value="6"]::before,
  .ql-snow .ql-picker.ql-header .ql-picker-item[data-value="6"]::before {
    content: "标题6";
  }

  .ql-snow .ql-picker.ql-font .ql-picker-label::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item::before {
    content: "标准字体";
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
    content: "衬线字体";
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
    content: "等宽字体";
  }
}*/
</style>
