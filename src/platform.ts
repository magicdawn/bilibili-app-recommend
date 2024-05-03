import UAParser from 'ua-parser-js'

export const uaParseResult = UAParser()

// os
export const isMac = uaParseResult.os.name?.toLowerCase() === 'mac os'

// browser
export const isSafari = uaParseResult.browser.name?.toLowerCase() === 'safari'
export const isFirefox = uaParseResult.browser.name?.toLowerCase() === 'firefox'
