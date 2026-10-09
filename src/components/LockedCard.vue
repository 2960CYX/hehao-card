<script setup lang="ts">
/** 卡片背面：锁定状态 */
</script>

<template>
  <div class="lock-card" style="width: 100%; height: 100%">
    <div class="card-frame">
      <div class="card-paper">
        <div class="card-shine" />
        <div class="lock-heart" aria-hidden="true">♥</div>

        <p class="lock-topline">ULTIMATE MAKE-UP PASS</p>

        <div class="lock-ring">
          <svg width="46" height="52" viewBox="0 0 46 52" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="lkGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#fff3c4" />
                <stop offset=".5" stop-color="#d4af37" />
                <stop offset="1" stop-color="#a97c15" />
              </linearGradient>
              <linearGradient id="lkBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#f7e3a1" />
                <stop offset="1" stop-color="#c9a227" />
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
        <p class="lock-sub">请先通过身份验证</p>
        <span class="lock-badge">🔒 LOCKED · 需验证身份</span>

        <div class="lock-foot">
          <span>NO. ✱✱✱✱-✱✱✱✱</span>
          <span>签发人：？？？</span>
        </div>

        <div class="lock-dots">• • •</div>
      </div>
    </div>
  </div>
</template>
