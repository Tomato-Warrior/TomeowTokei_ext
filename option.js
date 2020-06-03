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
    loginPage(false);
  } else {
    loginPage(true);
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
      if (data["message"] === "ok") {
        loginPage(true);
      }
    })
    .catch((error) => {
    });
});

function loginPage(isLogin) {
  let logincontainer = document.querySelector('.logincontainer');
  console.log(logincontainer)
  let tomato = document.querySelector('.tomato');
  if (isLogin) {
    logincontainer.classList.add("d-none");
    tomato.classList.remove("d-none");
  } else {
    localStorage.clear();
    logincontainer.classList.remove("d-none");
    tomato.classList.add("d-none");
  }
}

// handle logout

let logout = document.querySelector('.logoutcontainer');
logout.addEventListener('click', function logoutjson(e) {
  e.preventDefault();
  let logoutvalue = localStorage.getItem("auth_token");
  postData("http://127.0.0.1:3000/api/v1/logout", { auth_token: logoutvalue })
    .then((data) => {
      // console.log(data), {message: "you have logged out"}
      loginPage(false);
    })
    .catch((error) => {
      console.log(error);
    })
});