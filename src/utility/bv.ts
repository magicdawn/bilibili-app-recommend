/**
 * https://socialsisteryi.github.io/bilibili-API-collect/docs/other/bvid_desc.html#typescript
 */

export class BvCode {
  private static TABEL = 'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF' // 码表
  private static TR: Record<string, number> = {} // 反查码表
  private static S = [11, 10, 3, 8, 4, 6] // 位置编码表
  private static XOR = 177451812 // 固定异或值
  private static ADD = 8728348608 // 固定加法值

  // init()
  static {
    // 初始化反查码表
    const len = this.TABEL.length
    for (let i = 0; i < len; i++) {
      this.TR[this.TABEL[i]] = i
    }
  }

  static av2bv(av: number): string {
    const x_ = (av ^ this.XOR) + this.ADD
    // eslint-disable-next-line no-sparse-arrays
    const r = ['B', 'V', '1', , , '4', , '1', , '7']
    for (let i = 0; i < 6; i++) {
      r[this.S[i]] = this.TABEL[Math.floor(x_ / 58 ** i) % 58]
    }
    return r.join('')
  }

  static bv2av(bv: string): number {
    let r = 0
    for (let i = 0; i < 6; i++) {
      r += this.TR[bv[this.S[i]]] * 58 ** i
    }
    return (r - this.ADD) ^ this.XOR
  }
}

// BvCode.init()

// console.log(BvCode.av2bv(170001))
// console.log(BvCode.bv2av('BV17x411w7KC'))
