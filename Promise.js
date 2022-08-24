function Promise(executor) {
  // 保存this;
  const that = this;
  // 添加属性
  this.PromiseState = 'pending'
  this.PromiseResult = null;
  // 保存回调
  this.callbacks = [];
  // 成功回调
  function resolve(data) {
    if (that.PromiseState !== 'pending') return;

    // 1.修改对象的状态[PromiseState]
    that.PromiseState = 'fullfilled';

    // 2.修改对象的结果值[PromiseResult]
    that.PromiseResult = data;
    that.callbacks.forEach(item => {
      item.onResolved(data);

    })
  }
  // 失败回调
  function reject(data) {
    if (that.PromiseState !== 'pending') return;
    that.PromiseState = 'rejected';
    that.PromiseResult = data;
    that.callbacks.forEach(item => {
      item.onRejected(data);
    })
  }

  // 执行器函数同步调用
  try {
    executor(resolve, reject);
  } catch (e) {
    // 修改Promise状态的值为失败
    reject(e);
  }

}

// 添加then方法
Promise.prototype.then = function (onResolved, onRejected) {
  const that = this;

  return new Promise((resolve, reject) => {
    function callback(type) {
      try {
        let result = type(that.PromiseResult);
        if (result instanceof Promise) {
          result.then(v => { resolve(v) }, r => { reject(r) });
        } else {
          resolve(result);
        }
      } catch (e) {
        reject(e);
      }
    }
    // 如果成功
    if (this.PromiseState == 'fullfilled') {
      // 获取回调函数的执行结果
      callback(onResolved);
    }
    // 失败
    if (this.PromiseState == 'rejected') {
      callback(onRejected);
    }

    // 异步(pending)
    if (this.PromiseState == 'pending') {
      // 保存回调函数
      this.callbacks.push({
        onResolved: function () {
          // 执行成功回调函数
          callback(onResolved);
        },
        onRejected: function () {
          callback(onRejected);

        }
      })
    }
  })


}

// 添加catch方法