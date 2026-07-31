<template>
  <!-- 莫兰迪色块配对：轻量网页小游戏 -->
  <div class="mm">
    <div class="mm__head">
      <h3 class="mm__title">雾色记忆</h3>
      <p class="mm__desc">翻开两张同色卡片配对。低饱和莫兰迪色，练一练眼睛的放松感。</p>
      <div class="mm__meta">
        <span>步数 {{ moves }}</span>
        <span>配对 {{ matchedPairs }}/{{ pairCount }}</span>
        <button type="button" class="gp-btn gp-btn--text" @click="reset">再来一局</button>
      </div>
    </div>
    <div class="mm__grid" :class="{ 'is-won': won }">
      <button
        v-for="card in cards"
        :key="card.id"
        type="button"
        class="mm__card"
        :class="{ 'is-flipped': card.flipped || card.matched, 'is-matched': card.matched }"
        :disabled="card.matched || lock"
        @click="flip(card)"
      >
        <span class="mm__face mm__face--back" aria-hidden="true"></span>
        <span class="mm__face mm__face--front" :style="{ background: card.color }" aria-hidden="true"></span>
      </button>
    </div>
    <p v-if="won" class="mm__win">完成了。雾色配得好，眼睛也舒服一点。</p>
  </div>
</template>

<script>
const PALETTE = [
  '#8a9a8c', '#9a8f86', '#7a8f9a', '#a89a8e',
  '#8e9a9e', '#9e8e8a', '#86948a', '#948a92'
]

function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default {
  name: 'MorandiMemory',
  data() {
    return {
      cards: [],
      first: null,
      lock: false,
      moves: 0,
      matchedPairs: 0,
      won: false,
      pairCount: 6
    }
  },
  created() {
    this.reset()
  },
  methods: {
    reset() {
      const colors = shuffle(PALETTE).slice(0, this.pairCount)
      const deck = shuffle(colors.concat(colors)).map((color, i) => ({
        id: i + '-' + color,
        color,
        flipped: false,
        matched: false
      }))
      this.cards = deck
      this.first = null
      this.lock = false
      this.moves = 0
      this.matchedPairs = 0
      this.won = false
    },
    flip(card) {
      if (this.lock || card.flipped || card.matched) return
      card.flipped = true
      if (!this.first) {
        this.first = card
        return
      }
      this.moves += 1
      const a = this.first
      const b = card
      this.first = null
      if (a.color === b.color) {
        a.matched = true
        b.matched = true
        this.matchedPairs += 1
        if (this.matchedPairs >= this.pairCount) {
          this.won = true
        }
      } else {
        this.lock = true
        setTimeout(() => {
          a.flipped = false
          b.flipped = false
          this.lock = false
        }, 520)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.mm {
  margin-top: 28px;
  padding: 22px 20px 24px;
  border-radius: 14px;
  background: linear-gradient(160deg, rgba(154, 175, 177, 0.12), rgba(196, 184, 174, 0.16));
  border: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.06));
}

.mm__title {
  margin: 0 0 6px;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-color-2);
  letter-spacing: 0.04em;
}

.mm__desc {
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--muted-1-color, #8a8580);
}

.mm__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--text-color, #5c5854);
}

.mm__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  perspective: 800px;
}

@media (max-width: 520px) {
  .mm__grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.mm__card {
  position: relative;
  aspect-ratio: 1;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  transform-style: preserve-3d;
  transition: transform 0.35s ease;
}

.mm__card.is-flipped {
  transform: rotateY(180deg);
}

.mm__card.is-matched {
  cursor: default;
  opacity: 0.92;
}

.mm__face {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.mm__face--back {
  background: var(--background-1, #faf8f5);
  border: 1px solid var(--gp-surface-border, rgba(58, 56, 53, 0.08));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.35);
}

.mm__face--back::after {
  content: '';
  position: absolute;
  inset: 22%;
  border-radius: 50%;
  background: var(--theme-color-muted, rgba(110, 139, 142, 0.2));
}

.mm__face--front {
  transform: rotateY(180deg);
  box-shadow: 0 4px 12px rgba(58, 56, 53, 0.08);
}

.mm__win {
  margin: 14px 0 0;
  text-align: center;
  font-size: 14px;
  color: var(--theme-color, #6e8b8e);
}

.mm__grid.is-won .mm__card.is-matched .mm__face--front {
  filter: saturate(0.95) brightness(1.02);
}
</style>
