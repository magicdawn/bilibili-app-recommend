import { colorPrimaryValue } from '$components/ModalSettings/theme.shared'
import type { PvideoData } from '$define'
import { useMouse } from 'ahooks'
import type { ComponentProps } from 'react'
import { previewCardWrapper } from '../index.module.scss'
import { borderRadiusValue } from '../index.shared'

const S = {
  previewCardWrapper: css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    // 配合进度条, 底部不需要圆角
    border-top-left-radius: ${borderRadiusValue};
    border-top-right-radius: ${borderRadiusValue};
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  `,

  previewCardInner: css`
    width: 100%;
    height: 100%;
  `,
}

function fallbackWhenNan(...args: number[]) {
  for (const num of args) {
    if (isNaN(num)) continue
    return num
  }
  return 0
}

/**
 * previewProgress 代表进度条进度
 * previewT 代表将渲染的图片
 * 两个解耦, previewT 可以 fallback 到 `previewProgress * videoDuration`
 */

interface IProps {
  videoDuration: number
  pvideo?: PvideoData

  progress?: number
  t?: number

  // hover => listen mousemove of PreviewImage div ref
  // 如果没有移动鼠标, 后面 mousemove 无法触发, 这个时候需要从前面 mouseenter 中读取 enter cursor state
  mouseEnterRelativeX: number | undefined
}

export function PreviewImage({
  progress,
  t,
  videoDuration,
  pvideo,
  mouseEnterRelativeX,
  className,
  ...restProps
}: IProps & ComponentProps<'div'>) {
  const ref = useRef<HTMLDivElement>(null)
  const cursorState = useMouse(ref)
  const [size, setSize] = useState(() => ({ width: 0, height: 0 }))
  // console.log('cursorState:', cursorState)

  useMount(() => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setSize({ width: rect.width, height: rect.height })
  })

  const usingProgress = useMemo(() => {
    let ret = 0
    if (typeof progress === 'number') {
      ret = progress
    } else {
      const relativeX = fallbackWhenNan(cursorState.elementX, mouseEnterRelativeX || 0)
      if (size.width && relativeX && !isNaN(relativeX)) {
        ret = relativeX / size.width
      }
    }
    if (ret < 0) ret = 0
    if (ret > 1) ret = 1
    return ret
  }, [progress, cursorState.elementX, mouseEnterRelativeX, size.width])

  const usingT = useMemo(
    () => t ?? Math.floor((videoDuration || 0) * usingProgress),
    [t, videoDuration, usingProgress],
  )

  const innerProps = {
    progress: usingProgress,
    t: usingT,
    pvideo: pvideo!,
    elWidth: size.width,
    elHeight: size.height,
  }

  return (
    <div
      {...restProps}
      ref={ref}
      className={clsx(previewCardWrapper, className)}
      css={S.previewCardWrapper}
    >
      {!!(pvideo && size.width && size.height && usingProgress) && (
        <PreviewImageInner {...innerProps} />
      )}
    </div>
  )
}

function PreviewImageInner({
  t,
  progress,
  pvideo,
  elWidth,
  elHeight,
}: {
  t: number
  progress: number
  pvideo: PvideoData
  elWidth: number
  elHeight: number
}) {
  let index = useMemo(() => {
    const arr = pvideo?.index || []
    let index = findIndex(arr, t)

    if (index !== -1) {
      return index
    }

    // https://www.bilibili.com/video/av297635747
    // 没有后面的预览
    if (t > arr[arr.length - 1]) {
      index = arr.length - 1
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
      css={S.previewCardInner}
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
        style={{
          backgroundColor: colorPrimaryValue,
          height: '100%',
          width: `${progress * 100}%`,
        }}
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
