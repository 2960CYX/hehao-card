<script setup lang="ts">
import {
  CARD_FOOTNOTE,
  CARD_MESSAGE,
  CARD_SUBTITLE,
  CARD_TITLE,
  HOLDER_NAME,
  HOLDER_SIGN_SCALE,
  ISSUER_NAME,
  LAYOUT
} from '../cardSpec'
import { holderSignatureUrl } from '../composables/useHolderSignature'
import { ref } from 'vue'

defineProps<{ serial: string; issuedAt: string }>()

const px = (n: number) => `${n}px`

/** 签名图缺失时不显示（不会报错，那一栏就是空的） */
const showHolderSign = ref(true)

const sigIssuerStyle = {
  left: px(LAYOUT.sigIssuer.x),
  top: px(LAYOUT.sigIssuer.y),
  width: px(LAYOUT.sigIssuer.w),
  height: px(LAYOUT.sigIssuer.h)
}

const sigHolderStyle = {
  left: px(LAYOUT.sigHolder.x),
  top: px(LAYOUT.sigHolder.y),
  width: px(LAYOUT.sigHolder.w),
  height: px(LAYOUT.sigHolder.h)
}
</script>

<template>
  <div class="mk-card">
    <div class="card-frame">
      <div class="card-paper">
        <div class="card-shine" />

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

        <div class="mk-rule" :style="{ top: px(LAYOUT.ruleY) }"><i>♥</i></div>

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
          <span class="mk-message-deco" aria-hidden="true">♥</span>
          <span>{{ CARD_MESSAGE }}</span>
          <span class="mk-message-deco" aria-hidden="true">♥</span>
        </p>

        <!-- 签名栏一：她现场手写 -->
        <div class="mk-sig" :style="sigIssuerStyle">
          <span class="mk-sig-label" :style="{ fontSize: px(LAYOUT.sigLabelSize) }">签发人签名</span>
          <span class="mk-sig-ghost">在此签名</span>
        </div>

        <!-- 签名栏二：预先印上去的持卡人签名 -->
        <div class="mk-sig" :style="sigHolderStyle">
          <span class="mk-sig-label" :style="{ fontSize: px(LAYOUT.sigLabelSize) }">持卡人签名</span>
          <img
            v-if="showHolderSign"
            class="mk-sig-img"
            :src="holderSignatureUrl"
            alt=""
            :style="{ transform: `scale(${HOLDER_SIGN_SCALE})` }"
            @error="showHolderSign = false"
          />
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

.mk-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 0 solid rgba(173, 91, 116, 0.45);
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
  background: linear-gradient(180deg, #fff4df 0%, #e3aa96 30%, #a85a76 52%, #f7d7c0 72%, #93435f 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 1px 0.6px rgba(117, 65, 82, 0.34));
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
  color: rgba(117, 91, 102, 0.72);
}

.mk-rule {
  position: absolute;
  left: 26px;
  right: 26px;
  height: 0;
  border-top: 1px dashed rgba(173, 91, 116, 0.45);
}

.mk-rule i {
  position: absolute;
  left: 50%;
  top: -5px;
  transform: translateX(-50%);
  font-style: normal;
  font-size: 9px;
  line-height: 1;
  color: #c46b85;
  background: #fff8f2;
  padding: 0 3px;
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
  color: rgba(117, 91, 102, 0.78);
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
  color: rgba(117, 91, 102, 0.82);
}

.mk-holder-name {
  line-height: 1;
  font-weight: 700;
  color: #2b1d25;
}

.mk-dotrule {
  position: absolute;
  left: 26px;
  right: 26px;
  height: 0;
  border-top: 1px dotted rgba(117, 91, 102, 0.5);
}

.mk-message {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  line-height: 1;
  font-family: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
  font-weight: 700;
  letter-spacing: 3px;
  text-indent: 3px;
  color: #2b1d25;
}

.mk-message-deco {
  font-size: 0.4em;
  line-height: 1;
  color: #c46b85;
  text-indent: 0;
}

.mk-sig {
  position: absolute;
  border-radius: 10px;
  border: 1px dashed rgba(117, 91, 102, 0.5);
}

.mk-sig-label {
  position: absolute;
  left: 9px;
  top: 7px;
  line-height: 1;
  font-weight: 500;
  color: rgba(117, 91, 102, 0.78);
}

.mk-sig-ghost {
  position: absolute;
  left: 0;
  right: 0;
  top: 46%;
  text-align: center;
  font-size: 12px;
  letter-spacing: 0.3em;
  color: rgba(117, 91, 102, 0.32);
}

/* 预印签名：等比放进签名栏的书写区 */
.mk-sig-img {
  position: absolute;
  left: 8px;
  top: 22px;
  width: calc(100% - 16px);
  height: calc(100% - 30px);
  object-fit: contain;
  object-position: center;
  /* multiply 让预印签名和导出的合成图效果一致 */
  mix-blend-mode: multiply;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
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
  color: rgba(117, 91, 102, 0.8);
}

.mk-meta-right {
  font-weight: 700;
  color: #9e4e6b;
}

.mk-foot {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0;
  text-align: center;
  line-height: 1;
  font-weight: 500;
  color: rgba(117, 91, 102, 0.62);
}
</style>
