<template>
    <div class="animateNum">
        <div class="box">
            <div :class="{col_1:true,test:true,testenter:testShow}" ref="testref">
                <div class="top">{{animateNtData.title.top}}</div>
                <div class="bottom">
                    {{animateNtData.title.bottom1}}
                    
                    <div >{{animateNtData.title.bottom2}}</div>
                </div>
            </div>
            <div :class="{col_2:true,test:true,testenter:testShow2}" ref="testref2">
                <p>{{animateNtData.data[0].name}}</p>
                <div>
                    {{animateNtData.data[0].num}}家
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    export default{
        name:'animateNumTxt',
        props:{
            animateNtData:Object,
        },
        data(){
            return{
               testShow:false,
               testShow2:false, 
            }
        },
       
        methods:{
            handleScroll(){
                this.currentScroll = window.pageYOffset//表示当前滚动的位置
                console.log(this.currentScroll,'curr')
                if(this.currentScroll > this.$refs.testref.offsetTop - 100){//当前滚动位置到达testref的时候，显示div（100作为调整用）
                    this.testShow = true;
                    
                }
                if(this.currentScroll > this.$refs.testref2.offsetTop - 100){
                    this.testShow2 = true;
                }
            }
        },
         mounted(){
            window.addEventListener('scroll',this.handleScroll);//？监听浏览器滚动条滚动
        
        },
    }
</script>
<style scoped>
    .animateNum{
        /* background-image: url('@/assets/images/cover.png'); */
        width: 100%;
        min-width: 1200px;
        height:610px ;
    }
    .box{
        width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-wrap: wrap;
    }
    .box div{
        font-size: 20px;
        color: #fff;
    }
    .col_1{
        width: 394px;
        height: 305px;
        padding-left: 20px;
        border-bottom: 1px solid #8cc0f3;
        position:relative;
        
    }
    .col_1 .top{
        padding-left: 40px;
        padding-top: 100px;
        font-size: 16px;
    }
    .col_1 .bottom{
        font-size: 40px;
        color: #fff;
        font-weight: bold;
        padding-left: 40px;
        padding-top: 20px;
        
    }
    .col_1 .bottom>div{
        padding-top: 20px;
         font-size: 40px;
         font-weight: bold;
    }
    .col_2{
        width: 335px;
        height: 305px;
        padding-left: 85px;
        border-bottom: 1px solid #8cc0f3;
        position:relative;
    }
    .col_2>p,.col_3>p{
        padding-top: 100px;

    }
    .col_2>div,.col_3>div{
        padding-top: 35px;
        font-size: 64px;
        font-weight: bold;
    }
    .col_3{
         width: 290px;
        height: 305px;
        padding-left: 85px;
    }
    .col_4{
         width: 394px;
        height: 305px;
        padding-left: 20px;
    }
    .col_5{
         width: 335px;
        height: 305px;
        padding-left: 85px;
    }
    .col_6{
         width: 290px;
        height: 305px;
        padding-left: 70px;
    }
    p{
        margin: 0;
        font-size: 16px;
        color: #FFF;
        font-family: '思源黑体';
    }

    /* 滚动条滚到定值时的动画 */
    /* 动画 */
    .testenter{
        transform: translateY(0) !important;
        opacity: 1!important;
        transition: all 0.8s ease;
    }
    .test{
        transform: translateY(20px);
        opacity: 0;
    }
</style>