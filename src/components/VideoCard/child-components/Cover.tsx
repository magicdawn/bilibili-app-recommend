import { isFirefox, isSafari } from '$platform'
import { shuffle } from 'lodash'
import type { ComponentProps } from 'react'
import { Img } from 'react-image'

type ImgProps = ComponentProps<'img'>

type IProps = {
  src: string
} & Pick<ImgProps, 'alt' | 'style' | 'className'>

export const CoverImg = memo(function (props: IProps) {
  const { src, ...imgProps } = props

  const srcList = useMemo(() => {
    const _s = '@672w_378h_1c_!web-home-common-cover'
    const suffixs = [!isSafari && `${_s}.avif`, `${_s}.webp`, _s].filter(Boolean)
    return suffixs
      .map((suffix) => {
        return shuffle([0, 1, 2]).map((domainNum) => {
          const _src = src.replace(new RegExp(String.raw`https://i\d\.`), `https://i${domainNum}.`)
          return `${_src}${suffix}`
        })
      })
      .flat()
  }, [src, isSafari])

  // in firefox, alt text is visible during loading
  const alt = isFirefox ? undefined : imgProps.alt

  const _pictureEl = (
    <picture {...imgProps}>
      {!isSafari && (
        <source srcSet={`${src}@672w_378h_1c_!web-home-common-cover.avif`} type='image/avif' />
      )}
      <source srcSet={`${src}@672w_378h_1c_!web-home-common-cover.webp`} type='image/webp' />
      <img src={`${src}@672w_378h_1c_!web-home-common-cover`} loading='lazy' alt={alt} />
    </picture>
  )

  /**
   * 使用 react-image Img 并不能改善卡住的情况, 需要 useImage + 超时
   * 但这对于加载一张图片来说未免也太重了吧~
   * 给 avatar 加上参数后貌似 cover 这里情况好多了
   */
  const _rcImgEl = <Img src={srcList} {...imgProps} alt={alt} />

  return _pictureEl
})
