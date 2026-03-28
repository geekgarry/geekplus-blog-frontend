<template>
  <div class="container">
    <ul class="items-list">
      <li v-for="item in displayedItems" :key="item" class="item" v-html="item"></li>
    </ul>

    <ul class="page">
      <li class="page__btn" :class="{ 'active': (currentPage != 1) }" @click="currentPage--"><span
          class="material-icons"><i class="el-icon-arrow-left"></i></span></li>

      <li class="page__numbers" @click="currentPage = 1" v-if="currentPage > 3"> {{ pages[0] }}</li>
      <li class="page__dots" v-if="currentPage > 3">...</li>

      <li class="page__numbers" v-for="pageNumber in displayedPages" :key="pageNumber" @click="currentPage = pageNumber"
        :class="{ 'active': (currentPage === (pageNumber)) }">{{ pageNumber }}</li>

      <li class="page__dots" v-if="currentPage < pages.length - 2">...</li>
      <li class="page__numbers" @click="currentPage = pages.length" v-if="currentPage < pages.length - 2">
        {{ pages[pages.length - 1] }}</li>

      <li class="page__btn" :class="{ 'active': (currentPage < pages.length) }" @click="currentPage++"><span
          class="material-icons"><i class="el-icon-arrow-right"></i></span></li>
    </ul>
  </div>
</template>
<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "SlideAppMenu",
  components: {},
  props: {},
  data() {
    return {
      items: [],
      currentPage: 1,
      perPage: 10,
      pages: [],
      icon: [
        "invert_colors",
        "label",
        "lock",
        "lock_open",
        "extension",
        "favorite",
        "home",
        "info",
        "language",
        "pets",
        "print",
        "receipt",
        "schedule",
        "search",
        "shopping_cart",
        "star_rate",
        "support",
        "thumb_up",
        "turned_in",
        "visibility",
        "work",
        "warning",
        "album",
        "loop",
        "mic",
        "videocam",
        "call",
        "business",
        "chat",
        "email",
        "location_on",
        "rss_feed",
        "vpn_key",
        "block",
        "content_copy",
        "content_cut",
        "link",
        "send",
        "save",
        "weekend",
        "access_alarm",
        "battery_full",
        "bluetooth",
        "devices",
        "sd_storage",
        "usb",
        "storage",
        "attach_money",
        "highlight",
        "insert_chart",
        "publish",
        "cloud",
        "attachment",
        "folder",
        "computer",
        "headset",
        "keyboard_arrow_down",
        "keyboard_arrow_left",
        "keyboard_arrow_up",
        "keyboard_arrow_right",
        "mouse",
        "audiotrack",
        "bedtime",
        "brush",
        "camera_alt",
        "color_lens",
        "colorize",
        "edit",
        "flash_on",
        "photo",
        "directions_bus",
        "flight",
        "fastfood",
        "layers",
        "local_cafe",
        "local_offer",
        "local_parking",
        "map",
        "restaurant",
        "apps",
        "check",
        "close",
        "more",
        "ac_unit",
        "spa",
        "smoking_rooms",
        "architecture",
        "cake",
        "luggage",
        "mood",
        "person",
        "school",
        "share",
        "sports_esports",
        "build",
        "code",
        "delete",
        "eco",
        "explore",
        "exit_to_app"
      ]
    };
  },
  // create the array of items
  created() {
    this.getItems();
  },
  computed: {
    // display the items per page
    displayedItems() {
      return this.pagination(this.items);
    },
    displayedPages() {
      // if currentPage is page 1
      if (this.currentPage === 1) {
        return this.pages.slice(this.currentPage - 1, this.currentPage + 4);
      }
      // if currentPage is the last page
      else if (this.currentPage === this.pages.length) {
        return this.pages.slice(this.currentPage - 5, this.currentPage + 1);
      }
      // if currentPage is between 4-7
      else if (this.currentPage >= 4 && this.currentPage <= 7) {
        return this.pages.slice(this.currentPage - 2, this.currentPage + 1);
      }
      // if currentPage more than 7
      else if (this.currentPage > 7) {
        return this.pages.slice(this.currentPage - 4, this.currentPage + 1);
      }
      // if currentPage less than 4
      else {
        return this.pages.slice(this.currentPage - 2, this.currentPage + 3);
      }
    }
  },
  watch: {
    //how many pages to display
    items() {
      this.setPages();
    }
  },
  methods: {
    // get the 100 items list
    getItems() {
      for (var i = 0; i < 100; i++) {
        let template = `<span class="material-icons">${this.icon[i]}</span>
                <p>${i + 1}</p>`;
        this.items.push(template);
      }
    },
    // separate items per page.
    // Ex: Page 2 -> from item 11 to 20
    pagination(items) {
      let currentPage = this.currentPage;
      let perPage = this.perPage;

      let start = currentPage * perPage - perPage;
      let end = currentPage * perPage;

      return items.slice(start, end);
    },

    // generate number of pages
    setPages() {
      // N of items (100) / 10 items per page
      let numberOfPages = Math.ceil(this.items.length / this.perPage);

      //generate 10 pages (100 / 10)
      for (var i = 1; i <= numberOfPages; i++) {
        this.pages.push(i);
      }
    }
  }
});
</script>

<style lang="scss" scoped>
*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}

.container {
  box-sizing: border-box;
  font-size: 14px;
  overflow-y: scroll;
  font-family: "Poppins", sans-serif;
  letter-spacing: 0.6px;
  line-height: 1.4;
  -webkit-user-select: none;
  user-select: none;
  backface-visibility: hidden;
  -webkit-font-smoothing: subpixel-antialiased;
  /* min-height: 100vh; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: var(--background-origin);
  color: var(--font-color);
}

ul {
  list-style-type: none;
}

.items-list {
  max-width: 90vw;
  margin: 2rem;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-gap: 3rem;
  justify-content: center;
  align-content: center;
}

@media only screen and (max-width: 600px) {
  .items-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.item {
  width: 5rem;
  height: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--font-color);
  cursor: pointer;
}

.item span {
  background: var(--background-v1,#ffffff);
  box-shadow: 0 0.8rem 2rem rgba(90, 97, 129, 0.05);
  border-radius: 0.6rem;
  padding: 2rem;
  font-size: 3rem;
  transition: all 0.3s ease;
}

.item:hover span {
  transform: scale(1.2);
  color: var(--theme-color);
}

.item p {
  font-size: 1.2rem;
  margin-top: 1rem;
  color: var(--fontColor);
}

.page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  margin: 10px;
  border-radius: 4px;
  background: var(--color-background,#ffffff);
  box-shadow: 0 0.8rem 2rem rgba(90, 97, 129, 0.05);
  flex-direction: row;
  flex-wrap: wrap;
}

.page__numbers,
.page__btn,
.page__dots {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.4rem;
  font-size: 0.8rem;
  cursor: pointer;
}

.page__dots {
  width: 2rem;
  height: 2rem;
  color: var(--fontColor);
  cursor: initial;
}

.page__numbers {
  width: 2rem;
  height: 2rem;
  border-radius: 0.4rem;
}

.page__numbers:hover {
  color: var(--theme-color);
}

.page__numbers.active {
  color: #ffffff;
  background: var(--theme-color);
  font-weight: 600;
  border: 1px solid var(--theme-color);
}

.page__btn {
  color: var(--fontColor);
  pointer-events: none;
}

.page__btn.active {
  color: var(--fontColor);
  pointer-events: initial;
}

.page__btn.active:hover {
  color: var(--theme-color);
}
</style>
