<template>
  <div class="calendar">
    <div class="header">
      <button class="switch-btn" @click="prevMonth">
        <!-- &lt; -->
        <i class="el-icon-arrow-left"></i>
      </button>
      {{ currentYear }}/{{ currentMonth }}
      <button class="switch-btn" @click="nextMonth">
        <!-- &gt; -->
        <i class="el-icon-arrow-right"></i>
      </button>
    </div>
    <div class="weekdays">
      <div v-for="(day, index) in weekdays" :key="index">{{ day }}</div>
    </div>
    <div class="days">
      <div v-for="(day, index) in days" :key="index"
        :class="{ 'today': isToday(day.date), 'other-month': !day.currentMonth }">
        {{ day.date.getDate() }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MyCalendar',
  data() {
    return {
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      currentDate: new Date(),
      currentYear: new Date().getFullYear(),
      currentMonth: new Date().getMonth() + 1, // Month is 0-indexed
    };
  },
  computed: {
    days() {
      const firstDayOfMonth = new Date(this.currentYear, this.currentMonth - 1, 1);
      const lastDayOfMonth = new Date(this.currentYear, this.currentMonth, 0);
      const daysInMonth = lastDayOfMonth.getDate();
      const firstDayOfWeek = firstDayOfMonth.getDay(); // Day of the week (0-6)

      const days = [];

      // Add days from the previous month
      for (let i = 0; i < firstDayOfWeek; i++) {
        const date = new Date(this.currentYear, this.currentMonth - 1, 1 - (firstDayOfWeek - i));
        days.push({ date: date, currentMonth: false });
      }

      // Add days from the current month
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(this.currentYear, this.currentMonth - 1, i);
        days.push({ date: date, currentMonth: true });
      }

      // Add days from the next month to fill the grid
      const remainingDays = 42 - days.length;  // Assuming a 6x7 grid
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(this.currentYear, this.currentMonth, i);
        days.push({ date: date, currentMonth: false });
      }

      return days;
    }
  },
  methods: {
    prevMonth() {
      this.currentMonth--;
      if (this.currentMonth < 1) {
        this.currentMonth = 12;
        this.currentYear--;
      }
    },
    nextMonth() {
      this.currentMonth++;
      if (this.currentMonth > 12) {
        this.currentMonth = 1;
        this.currentYear++;
      }
    },
    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    }
  },
};
</script>

<style scoped>
.calendar {
  width: 100%;
  /* Adjust as needed */
  border: 1px solid var(#ccc, --background);
  padding: 10px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header .switch-btn {
  background: none;
  outline: none;
  border: none;
  color: inherit;
  padding: 5px;
  cursor: pointer
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: bold;
  margin-bottom: 5px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
}

.days>div {
  margin: 0 5px;
  border-radius: 3px;
  padding: 5px;
}

.today {
  background-color: #0badb6;
  color: #fff;
}

.other-month {
  color: #999;
}
</style>
