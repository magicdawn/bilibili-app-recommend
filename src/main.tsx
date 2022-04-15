import React from 'react'
import { render } from 'react-dom'
import $ from 'jquery'
import './esbuild-inject.ts'
import { SectionRecommend } from './components/section'
import sleep from 'delay'

main()
export default async function main() {
  while (!$('.bili-layout > section.bili-grid').length) {
    await sleep(50)
  }

  const firstSection = $('.bili-layout > section.bili-grid').eq(0)
  const recommendSection = $('<section></section>')
  recommendSection.insertAfter(firstSection)

  const container = recommendSection[0]
  render(<SectionRecommend />, container)
}
