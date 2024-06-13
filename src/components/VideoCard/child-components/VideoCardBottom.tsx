/**
 * take care of these
 * https://greasyfork.org/zh-CN/scripts/479861-bilibili-%E9%A1%B5%E9%9D%A2%E5%87%80%E5%8C%96%E5%A4%A7%E5%B8%88/discussions/238294
 */

import { flexCenterStyle } from '$common/emotion-css'
import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import { isLive, isRanking, type RecItemType } from '$define'
import { EApiType } from '$define/index.shared'
import { LiveIcon } from '$modules/icon'
import { ELiveStatus } from '$modules/rec-services/live/live-enum'
import { useSettingsSnapshot } from '$modules/settings'
import { getAvatarSrc } from '$utility/image'
import type { TheCssType } from '$utility/type'
import { Avatar } from 'antd'
import { size } from 'polished'
import { type MouseEventHandler } from 'react'
import { Case, Switch } from 'react-if'
import styles from '../index.module.scss'
import type { IVideoCardData } from '../process/normalize'
import { DESC_SEPARATOR } from '../process/normalize'

// .bili-video-card__info--owner
const descOwnerCss = css`
  margin-top: 4px;
  color: var(--text3);
  font-size: var(--subtitle-font-size);

  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
`

// .bili-video-card__info--date
// same as .bili-video-card__info--date, but the date class is for date
const descSuffixCss = css`
  margin-left: 4px;
  line-height: var(--subtitle-line-height);
`

export function VideoCardBottom({
  item,
  cardData,
  handleVideoLinkClick,
}: {
  item: RecItemType
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

    pubdateDisplay,
    pubdateDisplayForTitleAttr,
    recommendReason,

    // author
    authorName,
    authorFace,
    authorMid,

    // adpater specific
    appBadge,
    appBadgeDesc,
    rankingDesc,
    liveDesc,
  } = cardData

  const isNormalVideo = goto === 'av'

  // fallback to href
  const authorHref = authorMid ? `https://space.bilibili.com/${authorMid}` : href

  const streaming = item.api === EApiType.Live && item.live_status === ELiveStatus.Streaming

  const avatarExtraCss: TheCssType = [
    css`
      ${flexCenterStyle}
      padding: 1px;
      border: 1px solid transparent;
      border-radius: 50%;
      position: relative;
    `,
    streaming &&
      css`
        border-color: ${colorPrimaryValue};
      `,
  ]

  /**
   * avatar + line1: title
   *          line2: desc =
   *                      when normal video => `author-name + date`
   *          line3: recommend-reason
   */

  let descTitleAttr: string | undefined
  if (isNormalVideo) {
    if (authorName || pubdateDisplay || pubdateDisplayForTitleAttr) {
      descTitleAttr = [
        //
        authorName,
        pubdateDisplayForTitleAttr || pubdateDisplay,
      ]
        .filter(Boolean)
        .join(' · ')
    }
  }

  return styleNewCardStyle ? renderNewCardStyle() : renderBiliDeafault()

  /**
   * 带头像, 更分散(recommend-reason 单独一行)
   */
  function renderNewCardStyle() {
    return (
      <div
        css={css`
          display: flex;
          margin-top: 15px;
          column-gap: 5px;
        `}
      >
        {/* avatar */}
        {!!authorMid && (
          <a href={authorHref} target='_blank'>
            <span css={avatarExtraCss}>
              {authorFace ? (
                <Avatar src={getAvatarSrc(authorFace)} />
              ) : (
                <Avatar>{authorName?.[0] || appBadgeDesc?.[0] || ''}</Avatar>
              )}
              {streaming && (
                <LiveIcon
                  {...size(12)}
                  active
                  css={css`
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    background-color: ${colorPrimaryValue};
                    border-radius: 50%;
                  `}
                />
              )}
            </span>
          </a>
        )}

        {/* title + desc */}
        <div
          css={css`
            flex: 1;
            overflow: hidden;
            margin-left: 5px;
          `}
        >
          {/* title */}
          <h3
            className='bili-video-card__info--tit'
            title={title}
            css={css`
              h3& {
                text-indent: 0;
              }

              text-indent: 0;
              .bili-video-card &.bili-video-card__info--tit {
                padding-right: 0;
                height: auto;
                max-height: calc(2 * var(--title-line-height));
              }
            `}
          >
            <a
              onClick={handleVideoLinkClick}
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

          {/* desc */}
          {renderDesc()}
        </div>
      </div>
    )
  }

  /**
   * old, same as bilibili default
   */
  function renderBiliDeafault() {
    return (
      <div className='bili-video-card__info __scale-disable'>
        <div className='bili-video-card__info--right'>
          <a onClick={handleVideoLinkClick} href={href} target='_blank'>
            <h3 className='bili-video-card__info--tit' title={title}>
              {titleRender ?? title}
            </h3>
          </a>
          <p className='bili-video-card__info--bottom'>{renderDesc()}</p>
        </div>
      </div>
    )
  }

  function renderDesc() {
    if (isNormalVideo) {
      const innerSpans = (
        <>
          <span className='bili-video-card__info--author'>{authorName}</span>
          {pubdateDisplay && (
            <span className='bili-video-card__info--date'>{DESC_SEPARATOR + pubdateDisplay}</span>
          )}
        </>
      )

      if (styleNewCardStyle) {
        return (
          <>
            <div>
              <a
                className='bili-video-card__info--owner'
                href={authorHref}
                target='_blank'
                title={descTitleAttr}
                css={descOwnerCss}
              >
                {innerSpans}
              </a>
            </div>
            {!!recommendReason && (
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
        )
      } else {
        return (
          <>
            <a
              className='bili-video-card__info--owner'
              href={authorHref}
              target='_blank'
              title={descTitleAttr}
            >
              {recommendReason ? (
                <span className={styles.recommendReason}>{recommendReason}</span>
              ) : (
                <svg className='bili-video-card__info--owner__up'>
                  <use href='#widget-up'></use>
                </svg>
              )}
              {innerSpans}
            </a>
          </>
        )
      }
    }

    // 其他歪瓜
    return (
      <Switch>
        <Case condition={appBadge || appBadgeDesc}>
          <a
            className='bili-video-card__info--owner'
            css={descOwnerCss}
            href={href}
            target='_blank'
          >
            {!!appBadge && <span className={styles.badge}>{appBadge}</span>}
            {!!appBadgeDesc && <span className={styles.bangumiDesc}>{appBadgeDesc}</span>}
          </a>
        </Case>

        <Case condition={isRanking(item) && rankingDesc}>
          <div css={descOwnerCss}>{rankingDesc}</div>
        </Case>

        <Case condition={isLive(item)}>
          <a
            css={[
              descOwnerCss,
              css`
                display: -webkit-box;
                -webkit-box-orient: vertical;
                -webkit-line-clamp: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
              `,
            ]}
            href={authorHref}
            target='_blank'
            title={(authorName || '') + (liveDesc || '')}
          >
            <span>{authorName}</span>
            {liveDesc && <span css={descSuffixCss}>{liveDesc}</span>}
          </a>
        </Case>
      </Switch>
    )
  }
}
