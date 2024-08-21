import UAParser from 'ua-parser-js'

const parsed = UAParser()

// os
export const isMac = parsed.os.name?.toLowerCase() === 'mac os'

// browser
export const isSafari = parsed.browser.name?.toLowerCase() === 'safari'
export const isFirefox = parsed.browser.name?.toLowerCase() === 'firefox'
export const isEdge = parsed.browser.name?.toLowerCase() === 'edge'
