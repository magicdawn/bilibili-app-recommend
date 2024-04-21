import { useSettingsSnapshot } from '$modules/settings'
import { getAvatarSrc } from '$utility/image'
import { Avatar } from 'antd'
import type { MouseEventHandler } from 'react'
import styles from '../index.module.scss'
import type { IVideoCardData } from '../process/normalize'
import { DESC_SEPARATOR } from '../process/normalize'

export function VideoCardBottom({
  cardData,
  handleVideoLinkClick,
}: {
  cardData: IVideoCardData
  handleVideoLinkClick?: MouseEventHandler
}) {
  const { styleNewCardStyle } = useSettingsSnapshot()

  const {
    // video
    goto,
    href,
    title,
    titleRender,
    desc,
    pubdateDisplay,
    pubdateDisplayTitle,
    recommendReason,
    // author
    authorName,
    authorFace,
    authorMid,
    // adpater specific
    appBadge,
    appBadgeDesc,
  } = cardData

  const isNormalVideo = goto === 'av'

  // fallback to href
  const authorHref = authorMid ? `https://space.bilibili.com/${authorMid}` : href

  // firsr-line: title
  // second-line: desc = (author-name + date)
  let descTitle = desc
  if (authorName && (pubdateDisplay || pubdateDisplayTitle)) {
    descTitle = `${authorName} · ${pubdateDisplayTitle || pubdateDisplay}`
  }

  // fix https://greasyfork.org/zh-CN/scripts/479861-bilibili-%E9%A1%B5%E9%9D%A2%E5%87%80%E5%8C%96%E5%A4%A7%E5%B8%88/discussions/238294
  const descInnerSpans = desc ? (
    <>
      <span className='bili-video-card__info--author'>{desc}</span>
    </>
  ) : (
    <>
      <span className='bili-video-card__info--author'>{authorName}</span>
      {pubdateDisplay && (
        <span className='bili-video-card__info--date'>{DESC_SEPARATOR + pubdateDisplay}</span>
      )}
    </>
  )

  const descCss = css`
    margin-top: 4px;
    color: var(--text3);
    font-size: var(--subtitle-font-size);
  `

  return (
    <>
      {/* old, same as bilibili default */}
      {!styleNewCardStyle && (
        <div className='bili-video-card__info __scale-disable'>
          <div className='bili-video-card__info--right'>
            <a
              href={href}
              target='_blank'
              data-mod='partition_recommend'
              data-idx='content'
              data-ext='click'
              onClick={handleVideoLinkClick}
            >
              <h3 className='bili-video-card__info--tit' title={title}>
                {titleRender ?? title}
              </h3>
            </a>
            <p className='bili-video-card__info--bottom'>
              {isNormalVideo ? (
                <a
                  className='bili-video-card__info--owner'
                  href={authorHref}
                  target='_blank'
                  title={descTitle}
                >
                  {recommendReason ? (
                    <span className={styles.recommendReason}>{recommendReason}</span>
                  ) : (
                    <svg className='bili-video-card__info--owner__up'>
                      <use href='#widget-up'></use>
                    </svg>
                  )}
                  {descInnerSpans}
                </a>
              ) : appBadge || appBadgeDesc ? (
                <a className='bili-video-card__info--owner' href={href} target='_blank'>
                  <span className={styles.badge}>{appBadge || ''}</span>
                  <span className={styles.bangumiDesc}>{appBadgeDesc || ''}</span>
                </a>
              ) : null}
            </p>
          </div>
        </div>
      )}

      {/* new, not so crowded */}
      {styleNewCardStyle && (
        <div
          css={css`
            display: flex;
            margin-top: 15px;
          `}
        >
          <a href={authorHref} target='_blank' onClick={handleVideoLinkClick}>
            {authorFace ? (
              <Avatar src={getAvatarSrc(authorFace)} />
            ) : (
              <Avatar>{authorName?.[0] || appBadgeDesc?.[0] || ''}</Avatar>
            )}
          </a>

          <div
            css={css`
              flex: 1;
              margin-left: 10px;
              overflow: hidden;
            `}
          >
            <h3
              className='bili-video-card__info--tit'
              title={title}
              css={css`
                .bili-video-card &.bili-video-card__info--tit {
                  padding-right: 0;
                  height: auto;
                  max-height: calc(2 * var(--title-line-height));
                }
              `}
            >
              <a
                href={href}
                target='_blank'
                rel='noopener'
                css={css`
                  .bili-video-card .bili-video-card__info--tit > a& {
                    font-family: inherit;
                    font-weight: initial;
                  }
                `}
              >
                {titleRender ?? title}
              </a>
            </h3>

            {isNormalVideo ? (
              <>
                <div>
                  <a
                    className='bili-video-card__info--owner'
                    href={authorHref}
                    target='_blank'
                    title={descTitle}
                    css={descCss}
                  >
                    {descInnerSpans}
                  </a>
                </div>
                {recommendReason && (
                  <div
                    className={styles.recommendReason}
                    css={css`
                      margin-top: 2px;
                      padding-left: 0;
                      max-width: 100%;
                    `}
                  >
                    {recommendReason}
                  </div>
                )}
              </>
            ) : appBadge || appBadgeDesc ? (
              <a className='bili-video-card__info--owner' css={descCss} href={href} target='_blank'>
                {!!appBadge && <span className={styles.badge}>{appBadge}</span>}
                {!!appBadgeDesc && <span className={styles.bangumiDesc}>{appBadgeDesc}</span>}
              </a>
            ) : null}
          </div>
        </div>
      )}
    </>
  )
}
