import request from 'axios'

// 'https://app.bilibili.com/x/feed/index?build=1&mobi_app=android&idx=' +
//           (Date.now() / 1000).toFixed(0) +
//           (setting.accessKey ? '&access_key=' + setting.accessKey : ''),

export async function recommend() {
  const res = await request.get('https://app.bilibili.com/x/feed/index', {
    params: {
      build: '1',
      mobi_app: 'android',
      idx: (Date.now() / 1000).toFixed(0),
      // access_key:
    },
  })

  const json = res.data
  return json
}
