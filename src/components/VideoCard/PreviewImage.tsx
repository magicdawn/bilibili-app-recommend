import { PvideoData, RecItem } from '$define'
import { cx } from '$libs'
import { useMouse } from 'ahooks'
import { useMemo, useRef } from 'react'
import styles from './index.module.less'

interface IProps {
  className?: string
  videoDuration: number
  pvideo?: PvideoData

  // hover => listen mousemove of PreviewImage div ref
  // 如果没有移动鼠标, 后面 mousemove 无法触发, 这个时候需要从前面 mouseenter 中读取 enterCursorState
  enterCursorState: { width: number; height: number; relativeX: number }
}

function fallbackWhenNan(val: number, fallback: number) {
  return isNaN(val) ? fallback : val
}

export function PreviewImage({ className, videoDuration, pvideo, enterCursorState }: IProps) {
  const ref = useRef<HTMLDivElement>(null)
  const cursorState = useMouse(ref)

  const innerProps = {
    videoDuration,
    pvideo: pvideo!,
    cursorState,
    elWidth: fallbackWhenNan(cursorState.elementW, enterCursorState.width),
    elHeight: fallbackWhenNan(cursorState.elementH, enterCursorState.height),
    relativeX: fallbackWhenNan(cursorState.elementX, enterCursorState.relativeX),
  }

  return (
    <div ref={ref} className={cx(styles.previewCardWrapper, className)}>
      {pvideo ? <PreviewImageInner {...innerProps} /> : false}
    </div>
  )
}

function PreviewImageInner({
  videoDuration,
  pvideo,
  elWidth,
  elHeight,
  relativeX,
}: {
  videoDuration: number
  pvideo: PvideoData
  elWidth: number
  elHeight: number
  relativeX: number
}) {
  let progress = 0
  let t = 0
  if (elWidth && relativeX && !isNaN(relativeX) && !isNaN(elWidth)) {
    progress = relativeX / elWidth
    if (progress < 0) progress = 0
    if (progress > 1) progress = 1
    t = Math.floor((videoDuration || 0) * progress)
  }

  let index = useMemo(() => {
    const arr = pvideo?.index || []
    let index = findIndex(arr, t)

    if (index !== -1) {
      return index
    }

    // https://www.bilibili.com/video/av297635747
    // 没有后面的预览
    if (t > arr[arr.length - 1]) {
      index = Math.floor(arr.length * progress) - 1
      if (index < 0) index = 0
      return index
    }

    return 0
  }, [pvideo, t])

  const { img_x_len: colCount, img_y_len: rowCount, img_x_size: w, img_y_size: h } = pvideo
  const countPerPreview = rowCount * colCount

  index = index + 1 // 1 based
  const snapshotIndex = Math.floor(index / countPerPreview) // 0 based, 第几张
  const indexInSnapshot = index - snapshotIndex * countPerPreview // 这一张的第几个, 1 based

  const snapshotUrl = pvideo.image?.[snapshotIndex] || ''

  const indexRow = Math.floor(indexInSnapshot / colCount) + 1 // 1 based
  const indexCol = indexInSnapshot - (indexRow - 1) * colCount // 1 based

  // 缩放比例:
  // 从原始图片(rawWidth * rawHeight) 的 (startX, startY)点 中抠出 w*h
  // 缩放到 elementW * elementH, 放入 background 中
  // see https://stackoverflow.com/questions/50301190/how-to-scale-css-sprites-when-used-as-background-image

  const newImgWidth = elWidth * colCount
  const newImgHeight = elHeight * rowCount

  const startY = (indexRow - 1) * elHeight
  const startX = (indexCol - 1) * elWidth

  // console.log({
  //   t,
  //   indexRow,
  //   indexCol,
  //   img: pvideo.image,
  //   // elementW,
  //   // elementH,
  //   // startX,
  //   // startY,
  // })

  return (
    <div
      className={styles.previewCardInner}
      style={{
        backgroundColor: 'black', // 防止加载过程中闪屏
        backgroundImage: `url(${snapshotUrl})`,
        backgroundPosition: `-${startX}px -${startY}px`,
        backgroundSize: `${newImgWidth}px ${newImgHeight}px`,
      }}
    >
      <SimplePregressBar progress={progress} />
    </div>
  )
}

function SimplePregressBar({ progress }: { progress: number }) {
  // console.log('[SimplePregressBar] progress=%s', progress)

  return (
    <div
      className='track'
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: '#eee',
        width: '100%',
        height: 2,
      }}
    >
      <div
        className='bar'
        style={{ backgroundColor: '#fa6a9d', height: '100%', width: `${progress * 100}%` }}
      />
    </div>
  )
}

function findIndex(arr: number[], target: number): number {
  // O(n)
  // let index = arr.findIndex((val, index, arr) => {
  //   const nextVal = arr[index + 1]
  //   if (val <= target && target < nextVal) {
  //     return true
  //   } else {
  //     return false
  //   }
  // })

  let l = 0
  let r = arr.length - 1
  let possible = -1

  while (l <= r) {
    const mid = Math.floor((l + r) / 2)
    const mv = arr[mid]

    if (target === mv) {
      return mid
    }

    if (mv < target) {
      l = mid + 1
      possible = mid
    }
    // target < mv
    else {
      r = mid - 1
    }
  }

  if (possible === -1) return -1

  const v = arr[possible]
  const v1 = arr[possible + 1] ?? 0
  if (v < target && target < v1) {
    return possible
  } else {
    return -1
  }
}
