import { ModalSettings } from '$components/ModalSettings'
import { IconPark } from '$icon-park'
import { css } from '$libs'
import { HEADER_HEIGHT } from '$platform'
import { settings, useSettingsSnapshot } from '$settings'
import { useCallback, useRef, useState } from 'react'
import { useSticky } from 'react-use-sticky'
import { proxy, useSnapshot } from 'valtio'
import { AccessKeyManage } from './AccessKeyManage'
import { CollapseBtn, CollapseBtnRef } from './CollapseBtn'
import { ModalFeed } from './ModalFeed'

const configStyles = {
  btn: css`
    padding: 0;
    width: 31px;
    height: 31px;
    border-radius: 50%;
  `,
  icon: css`
    svg {
      width: 14px;
      height: 14px;
    }
  `,
}

export const state = proxy({
  showMore: settings.initialShowMore,
})

export const useHeaderState = function () {
  return useSnapshot(state)
}

const onSeeMore = () => {
  state.showMore = true
}
const onModalFeedHide = () => {
  state.showMore = false
}

export function RecHeader({ onRefresh }: { onRefresh: () => void | Promise<void> }) {
  const { accessKey, pureRecommend, usePcDesktopApi } = useSettingsSnapshot()
  const collapseBtnRef = useRef<CollapseBtnRef>(null)

  const { showMore } = useSnapshot(state)

  const [modalConfigVisible, setModalConfigVisible] = useState(false)
  const showModalConfig = useCallback(() => {
    setModalConfigVisible(true)
  }, [])
  const hideModalConfig = useCallback(() => {
    setModalConfigVisible(false)
  }, [])

  const [stickyRef, sticky] = useSticky<HTMLDivElement>()

  return (
    <>
      <div
        ref={stickyRef}
        className='area-header'
        css={[
          css`
            margin-bottom: 0;
            height: 50px;
          `,
          pureRecommend &&
            css`
              position: sticky;
              top: ${HEADER_HEIGHT}px;
              z-index: 1000;
            `,
          pureRecommend &&
            sticky &&
            css`
              background-color: var(--bg1_float);
              box-shadow: 0 2px 4px rgb(0 0 0 / 8%);
            `,
        ]}
      >
        <div className='left'>
          <a id='影视' className='the-world area-anchor' data-id='25'></a>
          <svg className='icon'>
            <use xlinkHref='#channel-cinephile'></use>
          </svg>
          <a className='title' href='#'>
            <span>推荐</span>
          </a>
        </div>

        <div className='right'>
          {!usePcDesktopApi &&
            (!accessKey ? (
              <AccessKeyManage />
            ) : (
              <CollapseBtn ref={collapseBtnRef}>
                <AccessKeyManage />
              </CollapseBtn>
            ))}

          <button className='primary-btn' css={configStyles.btn} onClick={showModalConfig}>
            <IconPark name='Config' css={configStyles.icon} />
          </button>

          <button className='primary-btn roll-btn' onClick={onRefresh}>
            <svg style={{ transform: 'rotate(0deg)' }}>
              <use xlinkHref='#widget-roll'></use>
            </svg>
            <span>换一换</span>
          </button>

          {!pureRecommend && (
            <button className='primary-btn see-more' onClick={onSeeMore}>
              <span>查看更多</span>
              <svg>
                <use xlinkHref='#widget-arrow'></use>
              </svg>
            </button>
          )}
        </div>
      </div>

      <ModalFeed show={showMore} onHide={onModalFeedHide} />
      <ModalSettings show={modalConfigVisible} onHide={hideModalConfig} />
    </>
  )
}
