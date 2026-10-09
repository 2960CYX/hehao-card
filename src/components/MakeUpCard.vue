<script setup lang="ts">
import { CARD_SUBTITLE, CARD_TITLE, HOLDER_NAME, ISSUER_NAME, LAYOUT, TERMS } from '../cardSpec'

defineProps<{ serial: string; issuedAt: string }>()

const px = (n: number) => `${n}px`
</script>

<template>
  <div class="mk-card">
    <div class="card-frame">
      <div class="card-paper">
        <div class="card-shine" />
        <div class="mk-heart" aria-hidden="true">♥</div>

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

        <div
          v-for="(term, i) in TERMS"
          :key="term.no"
          class="mk-term"
          :style="{ top: px(LAYOUT.termsTop + i * LAYOUT.termStep) }"
        >
          <span
            class="mk-term-no"
            :style="{
              top: px(LAYOUT.termBadgeCY - LAYOUT.termBadgeR),
              width: px(LAYOUT.termBadgeR * 2),
              height: px(LAYOUT.termBadgeR * 2),
              fontSize: px(LAYOUT.termNoSize)
            }"
          >
            {{ term.no }}
          </span>
          <span
            class="mk-term-title"
            :style="{ top: px(LAYOUT.termTitleTop), fontSize: px(LAYOUT.termTitleSize) }"
          >
            {{ term.title }}
          </span>
          <span
            class="mk-term-body"
            :style="{
              top: px(LAYOUT.termBodyTop),
              fontSize: px(LAYOUT.termBodySize),
              lineHeight: px(LAYOUT.termBodyLineH)
            }"
          >
            {{ term.text }}
          </span>
        </div>

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
          本卡最终解释权归宝宝所有 ♥
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

.mk-heart {
  position: absolute;
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);
  font-size: 250px;
  line-height: 1;
  color: rgba(200, 16, 46, 0.05);
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
  letter-spacing: 1.6px;
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

.mk-term {
  position: absolute;
  left: 26px;
  right: 26px;
  height: 58px;
}

.mk-term-no {
  position: absolute;
  left: 0;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 0.9px solid rgba(169, 124, 21, 0.75);
  background: rgba(212, 175, 55, 0.16);
  color: #a97c15;
  font-weight: 700;
  line-height: 1;
}

.mk-term-title {
  position: absolute;
  left: 31px;
  line-height: 1;
  font-weight: 700;
  color: #2a2118;
}

.mk-term-body {
  position: absolute;
  left: 31px;
  right: 0;
  font-weight: 400;
  color: #6a5946;
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
