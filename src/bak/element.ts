//页面元素助手，包含克隆的一个未初始化版块和创建、设置页面元素的简单封装

export const mainDiv = document
  .querySelector<HTMLDivElement>('#bili_douga')
  ?.cloneNode(true) as HTMLElement

export function getLoadingDiv(target?: string) {
  return _c({
    nodeType: 'div',
    style:
      target == 'recommend'
        ? 'padding:0;width:100%;height:unset;text-align: center;'
        : 'text-align: center;',
    className: target == 'recommend' ? 'load-state spread-module' : 'load-state',
    innerHTML: '<span className="loading">正在加载...</span>',
  })
}

export type Config = {
  nodeType?: string
  innerHTML?: string
  childs?: Array<HTMLElement | Config | string>
  parent?: HTMLElement
  style?: string
  className?: string
  [key: string]: any
}

export function _c(config: Config | Config[]) {
  if (config instanceof Array) return config.map((item) => _c(item))
  const item = document.createElement(config.nodeType!)
  return _s(item, config)
}

export function _s(item: HTMLElement, config: Config) {
  for (const i in config) {
    if (i == 'nodeType') continue

    if (i == 'childs' && config.childs instanceof Array) {
      config.childs.forEach((child) => {
        if (child instanceof HTMLElement) item.appendChild(child)
        else if (typeof child == 'string') item.insertAdjacentHTML('beforeend', child)
        else item.appendChild(_c(child))
      })
    }

    //
    else if (i == 'parent') {
      config.parent?.appendChild(item)
    }

    //
    else if (config[i] instanceof Object && item[i]) {
      Object.entries(config[i]).forEach(([k, v]) => {
        item[i][k] = v
      })
    } else {
      item[i] = config[i]
    }
  }

  return item
}

export let isNew = 0
export function setIsNew(val: number) {
  isNew = val
}
