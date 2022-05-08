import { useMouse } from 'ahooks'
import { useMemo, useRef } from 'react'
import { PvideoData, RecItem } from '../../define'

interface IProps {
  className?: string
  item: RecItem
  pvideo: PvideoData
}

export function PreviewImage({ className, item, pvideo }: IProps) {
  const ref = useRef(null)
  const mouse = useMouse(ref.current)
  const { elementW, elementH, elementX } = mouse

  let progress = 0
  let t = 0
  if (elementW && elementX && !isNaN(elementX) && !isNaN(elementW)) {
    progress = elementX / elementW
    if (progress < 0) progress = 0
    if (progress > 1) progress = 1
    t = Math.floor((item.duration || 0) * progress)
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

  const newImgWidth = elementW * colCount
  const newImgHeight = elementH * rowCount

  let startY = (indexRow - 1) * elementH
  let startX = (indexCol - 1) * elementW

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
      ref={ref}
      className={className}
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
