var btns = document.getElementsByClassName('btn')

Array.prototype.map.call(btns, node => {
  node.addEventListener('click', switchAlarm)
})

var port = chrome.runtime.connect({name:'tictac'})

port.onMessage.addListener(function(response) {
  console.log(response.timeType)
  if(response.func === 'getTimeInfo') {
    if (response.timeType === 'rest' && response.restNum === 3) {
      document.getElementsById('finish').style.display = 'block'
      document.getElementsById('work').style.display = 'none'
      document.getElementsById('rest').style.display = 'none'
    } else {
    document.getElementById(response.timeType === 'work' ? 'work' : 'rest').style.display = 'block'
    document.getElementById(response.timeType === 'work' ? 'rest' : 'work').style.display = 'none'
    }
  }
})

port.postMessage({func: 'getTimeInfo'})

function switchAlarm() {
  port.postMessage({func: 'switchAlarm'})
  window.close()
}

// 確認是否有登入過
function initialize() {
  if (
    localStorage.getItem('auth_token') === "undefined" || 
    localStorage.getItem('auth_token') === null
  ) {
    pageContent(false);
  } else {
    pageContent(true);
  }
}

initialize();


// handle login
function postData(url, data) {
  return fetch(url, {
    body: JSON.stringify(data),
    cache: "no-cache",
    method: "POST",
    redirect: "follow",
    referrer: "no-referrer",
    mode: "cors",
    headers: {
      "user-agent": "Mozilla/4.0 MDN Example",
      "content-type": "application/json",
    },
  }).then(res => res.json());
}

const form = document.querySelector('form');
form.addEventListener('submit', function loginJson(e) {
  e.preventDefault();
  const email = document.querySelector('#email');
  const password = document.querySelector('#password');
  postData("http://127.0.0.1:3000/api/v1/login", { email: email.value, password: password.value })
    .then((data) => {
      localStorage.setItem("auth_token", data["auth_token"]);
      localStorage.setItem("tasks", JSON.stringify(data["tasks"]));
      if (data["message"] === "ok") {
        pageContent(true);
      }
    })
    .catch((error) => {
    });
});

// 控制畫面內容
function pageContent(isLogin) {
  let logincontainer = document.querySelector('.logincontainer');
  let tomato = document.querySelector('.tomato');
  let body = document .querySelector('body');
  
  if (isLogin) {
    logincontainer.classList.add("d-none");
    tomato.classList.remove("d-none");
    body.classList.add("login-color");
    // 取得user's tasks
    var tasks = document.querySelector('.tasks');
    var allTasks = JSON.parse(localStorage.getItem('tasks'));
    tasks.innerHTML += allTasks.map(task => 
      `
      <option id=${task.id} value="${task.title}">${task.title}</option>
      `
    ).join('')
  } else {
    localStorage.clear();
    logincontainer.classList.remove("d-none");
    tomato.classList.add("d-none");
    body.classList.remove("login-color");
    body.classList.add("logout-color");
  }
}

// handle logout
let logout = document.querySelector('.logoutcontainer');
logout.addEventListener('click', function logoutjson(e) {
  e.preventDefault();
  let logoutValue = localStorage.getItem("auth_token");
  postData("http://127.0.0.1:3000/api/v1/logout", { auth_token: logoutValue })
    .then((data) => {
      // console.log(data), {message: "you have logged out"}
      pageContent(false);
    })
    .catch((error) => {
      console.log(error);
    })
});