module.exports = {
  reject: [
    'axios',

    // https://ant.design/changelog-cn#5211 external antd 后, default Button 没有边框,
    // 缺少 .ant-btn-variant-outlined.ant-btn-color-default { border-color: #d9d9d9; } 样式
    // 仅 external 情况下会有, 无相关 issue
    'antd',

    'typescript',

    // https://github.com/pmndrs/valtio/issues/980
    'valtio',
  ],
}
