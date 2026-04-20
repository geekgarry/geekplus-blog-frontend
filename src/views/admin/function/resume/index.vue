<template>
  <div class="wrapper" id="resumeapp" >
    <div class="sidebar-wrapper">
      <div class="profile-container">
        <img class="profile" src="/wheat.png" alt="GeekPlus" />
        <h1 class="name">{{resumeInfo.realName==null?'GarryChan':resumeInfo.realName}}</h1>
        <h3 class="tagline">{{resumeInfo.gender=='0'?'女':resumeInfo.gender=='1'?'男':'未知'}}&nbsp;&nbsp;&nbsp;&nbsp;{{resumeInfo.nation==null?'未知':resumeInfo.nation}}</h3>
        <h3 class="tagline">{{resumeInfo.jobIntention==null?'Full Stack Developer':resumeInfo.jobIntention}}</h3>
      </div>
      <!--//profile-container-->

      <div class="contact-container container-block">
        <ul class="list-unstyled contact-list">
          <li class="email"><i class="fas fa-envelope"></i><a href="mailto:geekgarry@hotmail.com" target="_blank">{{resumeInfo.contactEmail==null?'geekgarry@hotmail.com':resumeInfo.contactEmail}}</a></li>
          <li class="phone"><i class="fas fa-phone"></i><a :href="'tel:'+resumeInfo.contactPhone" target="_blank">{{resumeInfo.contactPhone==null?'13******98':resumeInfo.contactPhone}}</a></li>
          <li class="website"><i class="fas fa-globe"></i><a :href="'https://'+window.location.host" target="_blank">{{ window.location.host }}</a></li>
          <!-- <li class="linkedin"><i class="fab fa-linkedin-in"></i><a :href="https://www.linkedin.com/in/garry-chan-889215157/" target="_blank">GarryPlus</a></li> -->
          <li class="github"><i class="fab fa-github"></i><a :href="'https://github.com/geekgarry'" target="_blank">GarryPlus</a></li>
          <li class="github"><i class="fa fa-graduation-cap"></i><a :href="'https://blog.csdn.net/waiter456'" target="_blank">CSDN</a></li>
          <!-- <li class="twitter"><i class="fab fa-weibo"></i><a href="https://www.weibo.com/u/5373856458" target="_blank">@GeekCPP</a></li> -->
        </ul>
      </div>
      <!--//contact-container-->
      <div class="education-container container-block">
        <h2 class="container-block-title">教育</h2>
        <div class="item">
          <h4 class="degree">{{resumeInfo.unSpecializedSubject==null?'网络工程':resumeInfo.unSpecializedSubject}}</h4>
          <h5 class="meta">{{resumeInfo.universityName==null?'University':resumeInfo.universityName}}</h5>
          <div class="time">{{resumeInfo.universityStudyTime==null?'2015 ~ 2019':resumeInfo.universityStudyTime}}</div>
          <div>{{resumeInfo.unMainCoursesStudy==null?'计算机网络原理':resumeInfo.unMainCoursesStudy}}</div>
        </div>
        <!--//item-->
        <div class="item">
          <h4 class="degree">计算机相关</h4>
          <h5 class="meta">Postgraduate entrance examination</h5>
          <div class="time">Forever </div>
        </div>
        <!--//item-->
      </div>
      <!--//selfEvaluation-container-->
      <div class="universal-container container-block">
        <h2 class="container-block-title">自我评价</h2>
        <div>{{resumeInfo.selfEvaluation==null?'热爱技术，热爱学习，有抗压能力，喜欢创新！':resumeInfo.selfEvaluation}}</div>
      </div>
      <!--//selfEvaluation-container-->
      <div class="universal-container container-block">
        <h2 class="container-block-title">其他技能</h2>
        <div>{{resumeInfo.professionSkill==null?'pr，unity':resumeInfo.professionSkill}}</div>
        <div>{{resumeInfo.officeSkill==null?'Word，PowerPoint，Excel':resumeInfo.officeSkill}}</div>
      </div>
      <div class="languages-container container-block">
        <h2 class="container-block-title">语言</h2>
        <ul class="list-unstyled interests-list">
          <li>{{resumeInfo.masterLanguage==null?'中文(Chinese)':resumeInfo.masterLanguage}} <span class="lang-desc">(Native)</span></li>
          <li>英文(English) <span class="lang-desc">(Learning)</span></li>
        </ul>
      </div>
      <!--//interests-->

      <div class="interests-container container-block">
        <h2 class="container-block-title">我的兴趣</h2>
        <ul class="list-unstyled interests-list">
          <li>运动健身</li>
          <li>羽毛球</li>
          <li>看电影</li>
          <li>电子产品</li>
          <li>YouTube</li>
        </ul>
      </div>
      <!--//interests-->

    </div>
    <!--//sidebar-wrapper-->

    <div class="main-wrapper">

      <section class="section summary-section">
        <h2 class="section-title"><span class="icon-holder"><i class="fas fa-user"></i></span>关于我</h2>
        <br>
        <div class="summary">
          <p>{{resumeInfo.personalIntroduce==null?'个人简介':resumeInfo.personalIntroduce}}</p>
        </div>
        <!--//summary-->
      </section>
      <!--//section-->

      <section class="section experiences-section">
        <h2 class="section-title"><span class="icon-holder"><i class="fas fa-briefcase"></i></span>我的经历</h2>
        <span v-for="(listWork,index) in resumeInfo.listWork" :key="index">
          <div class="item">
            <div class="meta">
              <div class="upper-row">
                <h3 class="job-title">{{listWork.workPosition}}&nbsp;&nbsp;<span style="color:#64afb4">({{listWork.workType=='0'?'实习':'工作'}})</span></h3>
                <div class="time">{{listWork.workTime}}</div>
              </div>
              <!--//upper-row-->
              <div class="company">{{listWork.workCompany}}</div>
            </div>
              <!--//meta-->
            <div class="details">
              <p>{{listWork.workIntroduce}}</p>
            </div>
            <!--//details-->
          </div>
        </span>

      </section>
      <!--//section-->
      <section class="section projects-section">
        <h2 class="section-title"><span class="icon-holder"><i class="fas fa-archive"></i></span>项目(经历)</h2>
        <div class="intro">
          <!--//intro-->
          <p>下面是一些我自己在大学期间和工作时期独立完成和与团队合作完成的一些项目以及一些个人作品!其中有关于Android与Java后端的全栈开发,还有单片机,物联网上位机开发,与硬件进行通信!还有.Net网站的开发,C#WIndows程序的开发,也做过一次C++程序的开发。</p>
        </div>
        <span v-for="(listProject,index) in resumeInfo.listProject" :key="index">
          <div class="item">
            <div class="project-title"><a href="#">{{listProject.projectName}}</a>&nbsp;&nbsp;&nbsp;&nbsp;{{listProject.projectTime}}&nbsp;&nbsp;&nbsp;</div>
            <div><span style="color:rgba(106,95,247,0.73)">使用技术：</span><span style="color:#7dd45c">{{listProject.usingTechnology}}</span></div>
            <span class="project-tagline">{{listProject.projectContent}}</span>
          </div>
        </span>
        <!--//item-->
      </section>
      <!--//section-->

      <section class="skills-section section">
        <h2 class="section-title"><span class="icon-holder"><i class="fas fa-rocket"></i></span>专业技能 &amp; 掌握</h2>
        <div class="skillset" v-for="(listTech,index) in resumeInfo.listTech" :key="index">
          <div class="item">
            <h3 class="level-title">{{listTech.technologyName}}</h3>
            <div class="progress level-bar">
              <div class="progress-bar theme-progress-bar" role="progressbar" :style="'width:'+ listTech.technologyScore+'%'" :aria-valuenow="listTech.technologyScore" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>


        </div>
      </section>
      <!--//skills-section-->

    </div>
    <!--//main-body-->
    <div class="botttom_wrapper"></div>
  </div>
</template>

<script>

export default {
    name: 'ResumeTemplate',
    data() {
        return {
          realName: 'ggg',
          resumeInfo: {}
        };
    },
    computed: {
      msg() {
        console.log("msg==");
        return '789456';
      }
    },
    watch: {
      'message' () {
        console.log("监视器调用");
      }
    },
    methods: {
      conOut() {
        console.log("调用输出",
          this.msg);
      }
    },
    mounted() {
      let that=this;
      console.log("挂载完成生命周期+获取简历信息：");
      window.addEventListener("message",function(e){
        const data=e.data;
        that.resumeInfo=e.data;
        /* console.log("下面是简历信息：")
        console.log(JSON.stringify(data)); */
      })
    },
};
</script>
