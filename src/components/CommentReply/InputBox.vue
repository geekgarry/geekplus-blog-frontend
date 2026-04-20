<template>
    <div class="send-leave-word">
        <el-row :gutter="10" justify="center" v-if="!hasLogin">
            <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
                <el-input class="mb-10" placeholder="请输入昵称*" v-model="inputContent.name" clearable>
                </el-input>
            </el-col>
            <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
                <el-input class="mb-10" placeholder="请输入邮箱" v-model="inputContent.email" clearable>
                </el-input>
            </el-col>
            <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
                <el-input class="mb-10" placeholder="请输入网址" v-model="inputContent.website" clearable>
                </el-input>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <el-input class="mb-10" ref="replyContentRef" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }"
                    placeholder="请输入留言或评论内容*" v-model="inputContent.content">
                </el-input>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span="24">
                <div style="text-align: center;">
                    <span class="send-comment__btn" :class="{ disabled: disabled }" @click="sendMessage">发布评论</span>
                    <!-- <el-button type="primary" size="small" @click="sendMessage">发送</el-button> -->
                </div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "InputBox",
    props: {
        parentId: {
            type: Number,
            default: null
        },
        replyId: {
            type: Number,
            default: null
        },
        replyName: {
            type: String,
            default: null
        },
        contentFocus: {
            type: Boolean,
            default: false
        },
        hasLogin: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            inputContent: {
                name: null,
                email: null,
                website: null,
                content: null,
                parentId: this.parentId,
                replyId: this.replyId,
                replyName: this.replyName,
            }
        }
    },
    created() {

    },
    mounted() {
        if (this.contentFocus) {
            this.$refs.replyContentRef.focus();
        }
    },
    computed: {
        disabled() {
            return (this.hasLogin || !this.isEmptyString(this.inputContent.name)) && !this.isEmptyString(this.inputContent.content) ? false : true;
        }
    },
    methods: {
        sendMessage() {
            if (!this.disabled) {
                this.$emit("publishComment", this.inputContent);
                this.inputContent = {
                    name: null,
                    email: null,
                    website: null,
                    content: null,
                    parentId: this.parentId,
                    replyId: this.replyId,
                    replyName: this.replyName,
                };
            }
        },
        isEmptyString(str) {
            // 方法1: 检查是否为空字符串或者null/undefined
            if (!str || str.length === 0) {
                return true;
            }
            return false;
        }
    }
}
</script>
<style lang="scss" scoped>
.send-leave-word {
    transition: all 0.5s ease;
}

.send-comment__btn {
    display: inline-block;
    padding: 6px 14px;
    font-size: 12px;
    color: var(--theme-color);
    border: 1px solid var(--theme-color);
    border-radius: 4px;
    cursor: pointer;
}

.send-comment__btn.disabled {
    filter: opacity(60%);
}
</style>
