import { HOLDER_SIGNATURE_FILE } from '../cardSpec'

/**
 * 预先印在卡片上的「持卡人签名」。
 * 图片放在 public/holder-sign.png，用 public/sign.html 那个小工具采集。
 * 文件不存在时不会报错，只是那一栏留空。
 */
export const holderSignatureUrl = `${import.meta.env.BASE_URL}${HOLDER_SIGNATURE_FILE}`

let cached: HTMLImageElement | null = null
let pending: Promise<HTMLImageElement | null> | null = null

/** 载入并缓存签名图（Canvas 合成导出时需要） */
export function loadHolderSignature(): Promise<HTMLImageElement | null> {
  if (cached) return Promise.resolve(cached)
  if (pending) return pending

  pending = new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      cached = img
      resolve(img)
    }
    img.onerror = () => resolve(null)
    img.src = holderSignatureUrl
  })
  return pending
}
