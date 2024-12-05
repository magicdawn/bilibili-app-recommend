import { isSafari } from '$ua'
import { css } from '@emotion/react'
import type { ComponentProps } from 'react'

type IProps = {
  src: string
  avif?: boolean
  webp?: boolean
  imgProps?: ComponentProps<'img'>
} & ComponentProps<'picture'>

export function Picture({ src, avif, webp, imgProps, ...props }: IProps) {
  // safari avif 花屏
  avif ??= !isSafari
  webp ??= true

  return (
    <picture
      css={css`
        width: 100%;
        height: 100%;
        object-fit: cover;
      `}
      {...props}
    >
      {avif && <source srcSet={`${src}.avif`} type='image/avif' />}
      {webp && <source srcSet={`${src}.webp`} type='image/webp' />}
      <img
        src={src}
        loading='lazy'
        css={css`
          display: block;
          width: 100%;
          height: 100%;
          object-fit: inherit;
        `}
        {...imgProps}
      />
    </picture>
  )
}
