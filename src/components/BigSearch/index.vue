<template>
  <el-dialog :visible.sync="searchDialogVisible" width="90%" center custom-class="search-dialog"
    :close-on-click-modal="false" :close-on-press-escape="true" @close="handleClose">
    <div class="search-container">
      <el-input v-model="searchText" placeholder="输入关键词以搜索" prefix-icon="el-icon-search" class="search-input"
        @keyup.enter="performSearch"></el-input>
    </div>

    <div v-if="searchResults.length === 0" class="no-results">没有搜索结果</div>

    <div v-else class="search-results">
      <!-- Display search results here -->
      <div v-for="(result, index) in searchResults" :key="index" class="result-item">
        {{ result }}
      </div>
    </div>

    <div class="dialog-actions">
      <el-button @click="moveUp"><i class="el-icon-arrow-up"></i></el-button>
      <el-button @click="moveDown"><i class="el-icon-arrow-down"></i></el-button>
      <span>选择</span>
      <el-button @click="confirmSelection"><i class="el-icon-arrow-left"></i> 确认</el-button>
      <el-button type="primary" @click="handleClose">ESC 关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      searchDialogVisible: false,
      searchText: "",
      searchResults: [], // Array to store search results
      selectedIndex: -1, // Index of the selected search result
    };
  },
  methods: {
    openSearchDialog() {
      this.searchDialogVisible = true;
      // Focus on the input field when the dialog opens
      this.$nextTick(() => {
        this.$refs.searchInput.focus();
      });
    },
    handleClose() {
      this.searchDialogVisible = false;
      this.searchText = "";
      this.searchResults = [];
      this.selectedIndex = -1;
    },
    performSearch() {
      // Replace this with your actual search logic
      if (this.searchText) {
        // Simulate search results - replace with your API call or search function
        this.searchResults = [
          `Result 1 for ${this.searchText}`,
          `Result 2 for ${this.searchText}`,
          `Result 3 for ${this.searchText}`,
        ];
        this.selectedIndex = 0;
      } else {
        this.searchResults = [];
        this.selectedIndex = -1;
      }
    },

    moveUp() {
      if (this.selectedIndex > 0) {
        this.selectedIndex--;
      }
    },
    moveDown() {
      if (this.selectedIndex < this.searchResults.length - 1) {
        this.selectedIndex++;
      }
    },

    confirmSelection() {
      if (this.selectedIndex > -1) {
        console.log("Selected:", this.searchResults[this.selectedIndex]);
        // Perform action with selected item
        this.handleClose(); // Close the dialog
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.search-dialog {
  background-color: #303133;
}

.search-dialog .el-dialog__header {
  display: none;
}

.search-container {
  padding: 20px;
  background-color: #303133;
}

.search-input {
  width: 100%;
  border: 2px solid #42b983;
  /* Example - customize border color */
  border-radius: 5px;
}

.search-input .el-input__inner {
  background-color: #303133;
  color: #dcdfe6;
}

.search-input .el-input__prefix {
  color: #42b983;
}

.search-results {
  padding: 10px;
  max-height: 200px;
  /* Set a maximum height for the results */
  overflow-y: auto;
  border-bottom: 1px solid #eee;
  /* Divider line */
}

.result-item {
  padding: 5px;
  cursor: pointer;
  /* Indicate clickable results */
}

.result-item.selected {
  background-color: #e0f2f7;
  /* Highlight selected item */
}

.dialog-actions {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-results {
  padding: 10px;
  text-align: center;
  color: #999;
}
</style>
