import React from 'react'
import { createRoot } from 'react-dom/client'
import $ from 'jquery'
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
  const root = createRoot(container)
  root.render(<SectionRecommend />)
}
