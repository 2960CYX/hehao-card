<script setup lang="ts">
import {
  CARD_FOOTNOTE,
  CARD_H,
  CARD_MESSAGE,
  CARD_SUBTITLE,
  CARD_TITLE,
  CARD_W,
  HOLDER_NAME,
  ISSUER_NAME,
  LAYOUT
} from '../cardSpec'

defineProps<{ serial: string; issuedAt: string }>()

const px = (n: number) => `${n}px`

/** 与 Canvas 导出图完全相同的爱心曲线（保证屏幕和保存的图长得一模一样） */
const heartPath = (() => {
  const { cx, cy, size } = LAYOUT.heart
  const s = size / 2
  const p = (x: number, y: number) => `${(cx + x * s).toFixed(2)} ${(cy + y * s).toFixed(2)}`
  return [
    `M ${p(0, 0.78)}`,
    `C ${p(-1.55, -0.32)} ${p(-0.56, -1.28)} ${p(0, -0.42)}`,
    `C ${p(0.56, -1.28)} ${p(1.55, -0.32)} ${p(0, 0.78)}`,
    'Z'
  ].join(' ')
})()
</script>

<template>
  <div class="mk-card">
    <div class="card-frame">
      <div class="card-paper">
        <div class="card-shine" />

        <svg
          class="mk-heart-svg"
          :viewBox="`0 0 ${CARD_W} ${CARD_H}`"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mkHeartStroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#f7e29a" />
              <stop offset="0.5" stop-color="#d4af37" />
              <stop offset="1" stop-color="#a97c15" />
            </linearGradient>
            <linearGradient id="mkHeartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="rgba(225,29,72,0.11)" />
              <stop offset="1" stop-color="rgba(200,16,46,0.045)" />
            </linearGradient>
          </defs>
          <path
            :d="heartPath"
            fill="url(#mkHeartFill)"
            stroke="url(#mkHeartStroke)"
            stroke-width="1.6"
          />
        </svg>

        <span class="mk-corner tl" />
        <span class="mk-corner tr" />
        <span class="mk-corner bl" />
        <span class="mk-corner br" />

        <h1
          class="mk-title"
          :style="{ top: px(LAYOUT.titleTop), fontSize: px(LAYOUT.titleSize) }"
        >
          {{ CARD_TITLE }}
        </h1>

        <p
          class="mk-subtitle"
          :style="{ top: px(LAYOUT.subtitleTop), fontSize: px(LAYOUT.subtitleSize) }"
        >
          {{ CARD_SUBTITLE }}
        </p>

        <div class="mk-rule" :style="{ top: px(LAYOUT.ruleY) }"><i /></div>

        <p class="mk-serial" :style="{ top: px(LAYOUT.serialTop), fontSize: px(LAYOUT.serialSize) }">
          NO. {{ serial }}
        </p>

        <div class="mk-holder" :style="{ top: px(LAYOUT.holderTop) }">
          <span class="mk-holder-label" :style="{ fontSize: px(LAYOUT.holderLabelSize) }">持卡人</span>
          <span class="mk-holder-name" :style="{ fontSize: px(LAYOUT.holderSize) }">{{ HOLDER_NAME }}</span>
        </div>
        <div class="mk-dotrule" :style="{ top: px(LAYOUT.holderRuleY) }" />

        <p
          class="mk-message"
          :style="{ top: px(LAYOUT.messageTop), fontSize: px(LAYOUT.messageSize) }"
        >
          {{ CARD_MESSAGE }}
        </p>

        <div
          class="mk-sig"
          :style="{
            left: px(LAYOUT.sigBox.x),
            top: px(LAYOUT.sigBox.y),
            width: px(LAYOUT.sigBox.w),
            height: px(LAYOUT.sigBox.h)
          }"
        >
          <span class="mk-sig-label" :style="{ fontSize: px(LAYOUT.sigLabelSize) }">
            签发人签名 / SIGNATURE
          </span>
          <span class="mk-sig-ghost">在此签名</span>
        </div>

        <p class="mk-meta" :style="{ top: px(LAYOUT.metaTop), fontSize: px(LAYOUT.metaSize) }">
          <span>签发日期 {{ issuedAt }}</span>
          <span class="mk-meta-right">签发人 {{ ISSUER_NAME }}</span>
        </p>

        <p class="mk-foot" :style="{ top: px(LAYOUT.footTop), fontSize: px(LAYOUT.footSize) }">
          {{ CARD_FOOTNOTE }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mk-card {
  width: 100%;
  height: 100%;
}

.mk-heart-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.mk-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 0 solid rgba(169, 124, 21, 0.45);
  pointer-events: none;
}

.mk-corner.tl {
  left: 15px;
  top: 15px;
  border-left-width: 1px;
  border-top-width: 1px;
}

.mk-corner.tr {
  right: 15px;
  top: 15px;
  border-right-width: 1px;
  border-top-width: 1px;
}

.mk-corner.bl {
  left: 15px;
  bottom: 15px;
  border-left-width: 1px;
  border-bottom-width: 1px;
}

.mk-corner.br {
  right: 15px;
  bottom: 15px;
  border-right-width: 1px;
  border-bottom-width: 1px;
}

.mk-title {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0;
  text-align: center;
  line-height: 1;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
  font-weight: 700;
  letter-spacing: 4px;
  text-indent: 4px;
  background: linear-gradient(180deg, #fff6cf 0%, #e6c86a 30%, #b98f16 52%, #f7e7ae 72%, #a97c15 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 1px 0.6px rgba(120, 86, 20, 0.34));
}

.mk-subtitle {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0;
  text-align: center;
  line-height: 1;
  font-weight: 600;
  letter-spacing: 2.4px;
  text-indent: 2.4px;
  color: rgba(107, 92, 70, 0.72);
}

.mk-rule {
  position: absolute;
  left: 26px;
  right: 26px;
  height: 0;
  border-top: 1px dashed rgba(169, 124, 21, 0.45);
}

.mk-rule i {
  position: absolute;
  left: 50%;
  top: -2.7px;
  width: 5.4px;
  height: 5.4px;
  margin-left: -2.7px;
  transform: rotate(45deg);
  background: #e8c96a;
  box-shadow: 0 0 0 0.6px rgba(169, 124, 21, 0.6);
}

.mk-serial {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0;
  text-align: center;
  line-height: 1;
  font-weight: 600;
  letter-spacing: 1.4px;
  text-indent: 1.4px;
  color: rgba(107, 92, 70, 0.78);
}

.mk-holder {
  position: absolute;
  left: 26px;
  right: 26px;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.mk-holder-label {
  line-height: 1;
  font-weight: 500;
  color: rgba(107, 92, 70, 0.82);
}

.mk-holder-name {
  line-height: 1;
  font-weight: 700;
  color: #2a2118;
}

.mk-dotrule {
  position: absolute;
  left: 26px;
  right: 26px;
  height: 0;
  border-top: 1px dotted rgba(140, 116, 80, 0.5);
}

.mk-message {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0;
  text-align: center;
  line-height: 1;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
  font-weight: 700;
  letter-spacing: 3px;
  text-indent: 3px;
  color: #2a2118;
}

.mk-sig {
  position: absolute;
  border-radius: 10px;
  border: 1px dashed rgba(140, 116, 80, 0.55);
}

.mk-sig-label {
  position: absolute;
  left: 9px;
  top: 7px;
  line-height: 1;
  font-weight: 500;
  color: rgba(140, 116, 80, 0.78);
}

.mk-sig-ghost {
  position: absolute;
  left: 0;
  right: 0;
  top: 46%;
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.3em;
  color: rgba(140, 116, 80, 0.32);
}

.mk-meta {
  position: absolute;
  left: 26px;
  right: 26px;
  margin: 0;
  display: flex;
  justify-content: space-between;
  line-height: 1;
  font-weight: 500;
  color: rgba(107, 92, 70, 0.8);
}

.mk-meta-right {
  font-weight: 700;
  color: #a97c15;
}

.mk-foot {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0;
  text-align: center;
  line-height: 1;
  font-weight: 500;
  color: rgba(107, 92, 70, 0.62);
}
</style>
