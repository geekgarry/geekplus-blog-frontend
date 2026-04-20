<template>
    <div class="home-view" :style="{height: (windowHeight - 60) + 'px'}">
        <div class="search-overlay"></div>
        <search-panel></search-panel>
        <div class="more-tool-app">
            <div class="bottom-tab">
                <span class="tab-button" @click="openAppGallery = true">
                    <i class="el-icon-s-grid"></i>
                </span>
            </div>
        </div>
        <el-dialog :modal="true" :visible.sync="openAppGallery">
            <SlideAppMenu></SlideAppMenu>
        </el-dialog>
    </div>
</template>

<script>
import SearchPanel from '@/components/HomeSearch/SearchPanel.vue';
import SlideAppMenu from '@/components/SlideAppMenu/index.vue'

export default {
    name: 'HomeView',
    components: {
        SearchPanel,
        SlideAppMenu
    },
    data() {
        return {
            openAppGallery: false,
            windowHeight: 0,
            windowWidth: 0
        };
    },
    created() {
        this.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    },
    mounted() {
        window.onresize = () => {
            return (() => {
                this.windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight; // 高
                this.windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; // 宽
                //console.log("实时窗口宽度："+this.windowWidth)
            })();
        };
    },
    watch: {
        windowHeight(val) {

        }
    },
    methods: {

    },
};
</script>

<style lang="scss" scoped>
.home-view {
    width: 100%;
    /* height: calc(100vh - 60px); */
    position: relative;
}

.search-overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    /* background: url('../assets/images/background.png') no-repeat;
	background-size: 100% 100%;
    background-position: center; */
}

.more-tool-app {
    position: absolute;
    bottom: 33px;
    left: 0;
    right: 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.bottom-tab {
    padding: 15px;
    background: var(--translucent);
    border-radius: 4px;
}
</style>
