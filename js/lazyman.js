// lazyman.say().walk()

var Lazyman = function() {
  this.pro =
    new Promise((resolve, reject) => {
      resolve()
    })
}

Lazyman.prototype.say = function() {
  this.pro = this.pro.then(() => {
    return new Promise((resolve, reject) => {
      console.log('hello');
      window.setTimeout(() => {
        resolve(1)
      }, 1000)
    });
  })
  return this
}

Lazyman.prototype.walk = function() {
  this.pro = this.pro.then(() => {
    return new Promise((resolve, reject) => {
      console.log('goodbye')
      resolve();
    })
  })
  return this
}