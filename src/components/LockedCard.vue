<script setup lang="ts">
/** 卡片背面：锁定状态 */
</script>

<template>
  <div class="lock-card" style="width: 100%; height: 100%">
    <div class="card-frame">
      <div class="card-paper">
        <div class="card-shine" />
        <div class="lock-heart" aria-hidden="true">♥</div>

        <p class="lock-topline">MAKE-UP PASS</p>

        <div class="lock-ring">
          <svg width="46" height="52" viewBox="0 0 46 52" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="lkGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#ffe9d0" />
                <stop offset=".5" stop-color="#d8899c" />
                <stop offset="1" stop-color="#9e4e6b" />
              </linearGradient>
              <linearGradient id="lkBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#f2c5b7" />
                <stop offset="1" stop-color="#b76d83" />
              </linearGradient>
            </defs>
            <path
              class="lock-shackle"
              d="M13 23v-7.5C13 9.6 17.5 5 23 5s10 4.6 10 10.5V23"
              stroke="url(#lkGold)"
              stroke-width="3.6"
              stroke-linecap="round"
            />
            <rect
              x="7"
              y="21.5"
              width="32"
              height="26"
              rx="7"
              fill="url(#lkBody)"
              stroke="url(#lkGold)"
              stroke-width="1.6"
            />
            <circle cx="23" cy="31.5" r="3.4" fill="#3a2405" />
            <rect x="21.4" y="32.8" width="3.2" height="8.4" rx="1.6" fill="#3a2405" />
          </svg>
        </div>

        <p class="lock-title">卡片已锁定</p>
        <p class="lock-sub">先确认这张卡送给谁</p>
        <span class="lock-badge">🔒 LOCKED · 待署名</span>

        <div class="lock-foot">
          <span>NO. ✱✱✱✱-✱✱✱✱</span>
          <span>持卡人：？？？</span>
        </div>

        <div class="lock-dots">• • •</div>
      </div>
    </div>
  </div>
</template>
