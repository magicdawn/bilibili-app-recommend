import { ModalConfig } from '$components/ModalConfig'
import { css } from '$libs'
import { config, useConfigSnapshot } from '$settings'
import Config from '@icon-park/react/lib/icons/Config'
import { useCallback, useRef, useState } from 'react'
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
  showMore: config.initialShowMore,
})

export const useHeaderState = function () {
  return useSnapshot(state)
}

export function RecHeader({ onRefresh }: { onRefresh: () => void | Promise<void> }) {
  const { accessKey } = useConfigSnapshot()
  const collapseBtnRef = useRef<CollapseBtnRef>(null)

  const { showMore } = useSnapshot(state)
  const onSeeMore = useCallback(() => {
    state.showMore = true
  }, [])
  const onModalFeedHide = useCallback(() => {
    state.showMore = false
  }, [])

  const [modalConfigVisible, setModalConfigVisible] = useState(false)
  const showModalConfig = useCallback(() => {
    setModalConfigVisible(true)
  }, [])
  const hideModalConfig = useCallback(() => {
    setModalConfigVisible(false)
  }, [])

  return (
    <>
      <div className='area-header'>
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
          <button className='primary-btn' css={configStyles.btn} onClick={showModalConfig}>
            <Config theme='outline' size='24' fill='#333' css={configStyles.icon} />
          </button>

          {!accessKey ? (
            <AccessKeyManage />
          ) : (
            <CollapseBtn ref={collapseBtnRef}>
              <AccessKeyManage />
            </CollapseBtn>
          )}

          <button className='primary-btn roll-btn' onClick={onRefresh}>
            <svg style={{ transform: 'rotate(0deg)' }}>
              <use xlinkHref='#widget-roll'></use>
            </svg>
            <span>换一换</span>
          </button>

          <button className='primary-btn see-more' onClick={onSeeMore}>
            <span>查看更多</span>
            <svg>
              <use xlinkHref='#widget-arrow'></use>
            </svg>
          </button>
        </div>
      </div>

      <ModalFeed show={showMore} onHide={onModalFeedHide} />
      <ModalConfig show={modalConfigVisible} onHide={hideModalConfig} />
    </>
  )
}
