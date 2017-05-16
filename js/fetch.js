function generateParamsString(params, url) { // 参数拼接
  const newParams = Object.assign({}, params, {
    t: (new Date()).getTime(),
  })
  const string = Object.keys(newParams).reduce((memo, key) =>
    `${memo}${key}=${newParams[key]}&`
  , '').slice(0, -1)

  if (url) return `${url}${url.indexOf('?') !== -1 ? '&' : '?'}${string}`
  return string
}

function enhancedFetch(url, params, isPost) {
  if (isPost) { // fetch post请求
    const body = generateParamsString(params);
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      credentials: 'include',
      body,
    })
  }
  return fetch(generateParamsString(params, url), {
    credentials: 'include',
  })
}


const request = function request(url, params, isPost = false) {
  return new Promise((resolve, reject) => { // 十秒超时取消
    window.setTimeout(() => {
      reject('time out')
    }, 10000)

    enhancedFetch(url, params, isPost)
      .then((resp) => {
        resolve(resp)
      })
      .catch(e => {
        reject(e.stack)
      })
  })
}

// 用法示例
request('http://www.example.com', { user: 'foo' })
  .then(resp => { console.log(resp)})
  .catch(e => {console.log(e)})

