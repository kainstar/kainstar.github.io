setTimeout(() => {
  function notify() {
    var notification = new Notification("嗨(⊙▽⊙)", {
      body: "这里是一个提醒的正文哦⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄",
      icon: "./head.jpg",
    });
  }

  var validate_btn = document.getElementById("validate-btn");
  validate_btn.onclick = function (e) {
    if (Notification != null) {
      alert("notification可用!");
    } else {
      alert("notification不可用!");
    }
  };

  var test1_btn = document.getElementById("test1-btn");
  test1_btn.onclick = function (e) {
    if (Notification.permission === "granted") {
      notify();
    } else {
      Notification.requestPermission(function (permission) {
        if (permission === "granted") {
          notify();
        }
      });
    }
  };

  var test2_btn = document.getElementById("test2-btn");
  test2_btn.onclick = function (e) {
    var notification = new Notification("嗨(⊙▽⊙)", {
      body: "这里是一个提醒的正文哦⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄",
      icon: "./head.jpg",
    });
    notification.onshow = function () {
      console.log("notification已被打开");
    };
    notification.onclick = function () {
      this.close();
      console.log("notification已被点击");
    };
    notification.onclose = function () {
      console.log("notification已被关闭");
    };
    notification.onerror = function () {
      console.log("notification出错");
    };
  };
}, 0);
