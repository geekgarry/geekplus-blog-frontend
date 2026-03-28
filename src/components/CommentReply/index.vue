<template>
  <div class="comment__reply-container">
    <div class="first-comment-input" v-if="!isArticle" :style="{borderRadius: borderRadius}">
      <InputBox :hasLogin="hasLogin" @publishComment="sendCommentMsg" ref="commentInputRef"></InputBox>
    </div>
    <div class="comments-container" :style="{borderRadius: borderRadius}">
      <div class="comment__reply-info">
        <i class="el-icon-chat-line-round"></i><span class="comment-count">共有 {{ total || countRecursiveArr(comments) }} 条留言</span>
      </div>
      <div class="top-comment-input" v-if="isArticle">
        <InputBox :hasLogin="hasLogin" @publishComment="sendCommentMsg" ref="commentInputRef"></InputBox>
      </div>
      <div class="comment-message-list">
        <div class="comment-message" v-for="(item, index) in comments" :key="index">
          <div class="main-message">
            <a class="user-logo"><img alt="GeekPlus" :src="UserLogo"></a>
            <div class="message-wrapper">
              <div class="message-meta">
                <a class="user-name">{{ item.name }}</a>
              </div>
              <div class="message-content" v-if="checkHtml(item.content)" v-html="item.content"></div>
              <div class="message-content" v-else v-text="item.content"></div>
              <div class="message-footer">
                <span class="message-time">{{ dateTimeAgo(item.createTime) }}</span>
                <a class="msg-reply-btn" href="javascript:void(0)" @click="openReplyBox(index.toString())">回复</a>
              </div>
              <div v-if="String(index) === replyBoxIndex" class="reply-input-box">
                <InputBox :hasLogin="hasLogin" @publishComment="sendCommentMsg" :parentId="item.id" :replyId="item.id" :replyName="item.name"
                  :contentFocus="String(index) === replyBoxIndex" ref="commentInputRef"></InputBox>
              </div>
            </div>
          </div>
          <div v-if="item.children" class="sub-comment-message">
            <!-- <sub-reply-message  v-on:sendUserCommentStatus="getUserCommentStatus" :replyMessage="item.children"></sub-reply-message> -->
            <div class="main-message" v-for="(subItem, subIndex) in item.children" :key="subIndex">
              <a class="user-logo"><img alt="GeekPlus" :src="subItem.userId == 'sysUser:1' ? GpLogo : UserLogo"></a>
              <div class="message-wrapper">
                <div class="message-meta">
                  <a class="user-name">{{ subItem.name }}</a>
                  <span>回复 <a><strong class="reply-user">@{{ subItem.replyName }}</strong></a>:</span>
                </div>
                <div class="message-content" v-if="checkHtml(subItem.content)" v-html="subItem.content"></div>
                <div class="message-content" v-else v-text="subItem.content"></div>
                <div class="message-footer">
                  <span class="message-time">{{ dateTimeAgo(subItem.createTime) }}</span>
                  <a class="msg-reply-btn" href="javascript:void(0)"
                    @click="openReplyBox(index + '-' + subIndex)">回复</a>
                </div>
                <div v-if="String(index + '-' + subIndex) === replyBoxIndex" class="reply-input-box">
                  <InputBox :hasLogin="hasLogin" @publishComment="sendCommentMsg" :parentId="item.id" :replyId="subItem.id"
                    :replyName="subItem.name" :contentFocus="String(index + '-' + subIndex) === replyBoxIndex"
                    ref="commentInputRef"></InputBox>
                </div>
              </div>
            </div>
          </div>
          <div class="bottom-divider"></div>
        </div>
      </div>
    </div>
    <div class="bottom-page-container"></div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import InputBox from "./InputBox.vue";

export default defineComponent({
  name: "CommentReply",
  emits: [],
  components: {
    InputBox
  },
  props: {
    comments: {
      type: Array,
      default() {
        return [
          {
            createTime: "2023-06-06 19:02:44",
            id: 42,
            replyId: 0,
            name: "尘鸟飞书",
            email: "cnfs@flybook.com",
            website: "www.flybook.com",
            content: "感觉还不错，做的挺好的！",
            topicId: null,
            topicType: null,
            userId: null,
            parentId: 0,
            replyName: null,
            replyCount: null,
            children: [
              {
                createTime: "2024-09-10 09:02:07",
                id: 43,
                replyId: 42,
                name: "geek",
                email: "geek@geek.com",
                website: "geek@geek.com",
                content: "我觉得也很不错！",
                topicId: null,
                topicType: null,
                userId: null,
                parentId: 42,
                replyName: "尘鸟飞书",
                replyCount: null,
                children: null,
                likeCount: 0,
                isDisplay: null
              }
            ],
            likeCount: 0,
            isDisplay: null
          },
          {
            createTime: "2023-04-21 10:26:52",
            id: 41,
            replyId: 0,
            name: "海加尔金鹰",
            email: "hjljy@outlook.com",
            website: "www.hjljy.cn",
            content: "格子壁纸挺不错的",
            topicId: null,
            topicType: null,
            userId: null,
            parentId: 0,
            replyName: null,
            replyCount: null,
            children: [
              {
                createTime: "2024-09-27 01:26:23",
                id: 56,
                replyId: 41,
                name: "普拉斯",
                email: "geekgarry@hotmail.com",
                website: "yourblog.com",
                content: "<p>谢谢💗爱心🧡爱心🫰</p>",
                topicId: null,
                topicType: null,
                userId: "sysUser:12",
                parentId: 41,
                replyName: "海加尔金鹰",
                replyCount: null,
                children: null,
                likeCount: 0,
                isDisplay: null
              },
              {
                createTime: "2024-09-27 02:36:40",
                id: 59,
                replyId: 56,
                name: "测试",
                email: "",
                website: "",
                content: "开心😄",
                topicId: null,
                topicType: null,
                userId: null,
                parentId: 41,
                replyName: "普拉斯",
                replyCount: null,
                children: null,
                likeCount: 0,
                isDisplay: null
              }
            ],
            likeCount: 0,
            isDisplay: null
          }
        ]
      }
    },
    total: {
      type: Number,
      default: 0
    },
    /* isArticle为当前留言评论类型是否文章，默认为false，为true时则为文章留言评论布局，当为false时表示为全站留言布局 */
    isArticle: {
      type: Boolean,
      default() {
        return false;
      }
    },
    /* topicId为当前主题或文章的ID，根据此ID查询该主题或文章所有的留言评论，当为0或空时表示为全站留言 */
    topicId: {
      type: String,
      default() {
        return null
      }
    },
    hasLogin: {
      type: Boolean,
      default: false
    },
    borderRadius: {
      type: Number,
      default: 0,
    }
  },
  data() {
    return {
      UserLogo: require("@/assets/mai.png"),
      GpLogo: require("@/assets/logo.png"),
      replyBoxIndex: '-1',
      //网站直接留言
      commentMessage: {},
      commentsTotal: 0,
      defaultPageNum: 1,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        replyId: null,
        name: null,
        email: null,
        website: null,
        content: null,
        topicId: null,
        topicType: null,
        userId: null,
        parentId: 0,
      },
      leaveMessage: this.comments
    }
  },
  created() {

  },
  mounted() {

  },
  methods: {
    openReplyBox(index) {
      this.replyBoxIndex = this.replyBoxIndex === index ? null : index;
    },
    closeReplyBox() {
      this.replyBoxIndex = '-1';
    },
    sendCommentMsg(data) {
      // this.commentMessage = data;
      // const commentMsg = {
      //   name: data.name,
      //   email: data.email,
      //   website: data.website,
      //   content: data.content,
      //   replyId: data.replyId,
      //   replyName: data.replyName,
      // }
      // if(this.isEmptyString(data.parentId)) {
      //   this.leaveMessage.push(data);
      // }else {
      //   this.leaveMessage[data.parentId].children.push(data);
      // }
      this.$emit("comment", data);
    },
    reachBottom(e) {
      console.log(e)
    },
    isEmptyString(str) {
      // 方法1: 检查是否为空字符串或者null/undefined
      if (!str || str.length === 0) {
        return true;
      }
      return false;
    },
    countRecursiveArr(arr) {
      let count = 0;

      function countHelper(arr) {
        arr.forEach(item => {
          count++;
          if (item.children && Array.isArray(item.children)) {
            countHelper(item.children);
          }
        });
      }
      countHelper(arr);
      return count;
    }
  }
});
</script>

<style lang="scss" scoped>
.comment__reply-container {
  color: var(--fontColor);
  /* box-shadow: 0 0 10px var(--box-shadow, rgba(0, 0, 0, 0.2)); */
}

.first-comment-input {
  width: 100%;
  margin-bottom: 10px;
  background: var(--background-1, #ffffff);
  padding: 6px;
}

.comments-container {
  width: 100%;
  height: auto;
  /* float: left;
  margin-bottom: 10px; */
  /* text-align: center; */
  background: var(--background-1, #ffffff);
  /* border: 1px solid var(--color-border-1,s #dddedd); */
  padding: 6px;
  /* 顺势针安排上右下左 css里都是这样的*/
}

.comment__reply-info {
  padding: 5px 0;
  text-align: center;
  font-size: 16px;
}

.comment-count {
  margin-left: 5px;
}

.top-comment-input {
  padding: 5px 0 10px;
}

.comment-message {
  width: 100%;
  margin: 5px auto 0;
  /* border-bottom: 1px solid #e8e8e8;
  background: #c5c5c533; */
}

.bottom-divider {
  padding-bottom: 6px;
  margin-left: 1em;
  border-bottom: 1px solid var(--border-color);
}

.main-message {
  display: flex;
  flex-direction: row;
  padding: 10px 0 5px 0;
}

.user-logo {
  display: block;
  height: fit-content;
  padding: 5px;
}

.user-logo img {
  display: block;
  margin: 0 auto;
  width: 2.5em;
  height: 2.5em;
  border-radius: 50%;
}

.user-logo img.reply-user-avatar {
  display: block;
  margin: 0 auto;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
}

.message-wrapper {
  /* border-top: 1px solid #88c3b6; */
  flex: 1 1 auto;
  width: auto;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal;
  word-break: break-word;
  margin-left: 5px;
}

.message-wrapper .message-meta {
  text-decoration: none;
  font-size: 0.9em;
}

.message-meta .user-name {
  font-size: 13px;
}

.message-wrapper .message-meta>a {
  text-decoration: none;
  padding: 2px 5px 2px 0;
  color: var(--font-color,#999);
  font-weight: 400;
}

.message-wrapper .message-meta>span {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal;
}

.message-wrapper .message-meta>span a {
  text-decoration: none;
  padding: 2px 5px 2px 0;
  color: var(--plus-grey-9,#999);
}

.message-wrapper .message-time {
  padding-right: 10px;
}

.message-wrapper .message-content {
  font-size: 15px;
  padding-top: 3px;
  padding-bottom: 3px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal;
}

.message-wrapper .message-content .reply-user {
  font-size: 0.8em;
  color: var(--theme-color, #7dacb8);
}

.message-wrapper .message-content>p {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: normal;
  height: auto;
  padding: 0;
  margin: 0;
}

.message-wrapper .message-footer {
  padding-top: 4px;
  font-size: 13px;
}

.message-wrapper .message-footer a {
  text-decoration: none;
  color: var(--fontColor, #bdbdbd);
}

.sub-comment-message {
  /* 16px or 1em */
  margin-left: 16px;
  /* border-radius: 4px;
  border-top: 1px solid var(--border-color, #c0c9cbb3);
  background-color: var(--color-background, #FDFCFF); */
}

@media screen and (min-width: 768px){
  .sub-comment-message {
    margin-left: 26px;
  }
}

.sub-comment-message .main-message {
  padding: 8px 0 8px 0;
}

.sub-comment-message .user-logo img {
  display: block;
  margin: 0 auto;
  width: 1.5em;
  height: 1.5em;
  border-radius: 50%;
}

.reply-input-box {
  padding: 10px 5px 5px 5px;
  transition: all .5s linear;
}
</style>
