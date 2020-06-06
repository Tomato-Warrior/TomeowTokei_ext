// var btns = document.getElementsByClassName('btn')

// Array.prototype.map.call(btns, node => {
//   node.addEventListener('click', switchAlarm)
// })

// var port = chrome.runtime.connect({name:'tictac'})

// port.onMessage.addListener(function(response) {
//   console.log(response.timeType)
//   if(response.func === 'getTimeInfo') {
//     if (response.timeType === 'rest' && response.restNum === 3) {
//       document.getElementsById('finish').style.display = 'block'
//       document.getElementsById('work').style.display = 'none'
//       document.getElementsById('rest').style.display = 'none'
//     } else {
//     document.getElementById(response.timeType === 'work' ? 'work' : 'rest').style.display = 'block'
//     document.getElementById(response.timeType === 'work' ? 'rest' : 'work').style.display = 'none'
//     }
//   }
// })

// port.postMessage({func: 'getTimeInfo'})

// function switchAlarm() {
//   port.postMessage({func: 'switchAlarm'})
//   window.close()
// }

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
    body.classList.remove("logout-color");
    getAllTasks();
  } else {
    localStorage.clear();
    logincontainer.classList.remove("d-none");
    tomato.classList.add("d-none");
    body.classList.remove("login-color");
    body.classList.add("logout-color");
  }
}

// 找任務
function getAllTasks() {
  let auth_token = localStorage.getItem("auth_token");
  postData("http://127.0.0.1:3000/api/v1/gettasks", { auth_token: auth_token })
    .then((data) => {
      localStorage.setItem("tasks", JSON.stringify(data["tasks"]));
      taskDropdown();
    })
    .catch((error) => {
    });
}

// 任務dropdown list
function taskDropdown() {
  let tasks = document.querySelector('.tasks');
  let allTasks = JSON.parse(localStorage.getItem('tasks'));
  tasks.innerHTML += allTasks.map(task => 
    `
    <option data-id=${task.id} value="${task.title}">${task.title}</option>
    `
  ).join('')
}

// 確認選取的任務
const selectedTask = document.querySelector('.tasks');
selectedTask.addEventListener('change', (e) => {
  let task_title = e.target.value;
  let task_id = e.target.options[e.target.selectedIndex].dataset.id;
  localStorage.removeItem("selectedTask");
  localStorage.setItem("selectedTask", JSON.stringify({task_id: task_id, task_title: task_title}))
});

// handle logout
let logout = document.querySelector('.logoutcontainer');
logout.addEventListener('click', function logoutjson(e) {
  e.preventDefault();
  let logoutValue = localStorage.getItem("auth_token");
  postData("http://127.0.0.1:3000/api/v1/logout", { auth_token: logoutValue })
    .then((data) => {
      pageContent(false);
    })
    .catch((error) => {
    })
});

// clock countdown
function displayTimeLeft(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainSeconds = seconds % 60
  const display = `${minutes < 10 ? 0 : ''}${minutes}:${remainSeconds < 10 ? 0 : ''}${remainSeconds}`
  const displayTimeLeft = document.querySelector('.display-time')
  displayTimeLeft.textContent = display
}

let startBtn = document.querySelector('.workstartbtn');
startBtn.addEventListener('click', function(e) {
  e.preventDefault;
  startWorkApiPromise();
  startWorkPromise();
  start();
})

//開始api
function startWorkApiPromise() {
  let auth_token = localStorage.getItem("auth_token");
  let selectedTask = JSON.parse(localStorage.getItem("selectedTask"));
  let task_id = selectedTask.task_id;
  return new Promise(function(resolve, reject) {
    postData("http://127.0.0.1:3000/api/v1/startwork", { auth_token: auth_token, task_id: task_id})
    .then((data) => {
      resolve((data));
    })
  })
}

//開始計時
function startWorkPromise() {
  let workStart = document.querySelector('.workstartbtn');
  let workStop = document.querySelector('.workstopbtn');
  const seconds = workStart.dataset.time;
  let setCounter;
  //設定計時器
  let now = Date.now();
  let end_time = now + seconds * 1000;
  let secondsLeft = Math.round((end_time - now) / 1000);
  let selectedTask = JSON.parse(localStorage.getItem("selectedTask")).task_title;
  let selectBox = document.querySelector('.selecttask')
  let messageBox = document.querySelector('.messagebox');
  messageBox.innerHTML = selectedTask;

  return new Promise(function(resolve, reject) {
    selectBox.classList.add('d-none')
    messageBox.classList.remove('d-none')
    workStart.classList.add("d-none")
    workStop.classList.remove("d-none")
    setCounter = setInterval(() => {
      secondsLeft = Math.round((end_time - Date.now()) / 1000)
      displayTimeLeft(secondsLeft)    
      if (secondsLeft <= 0) {
        clearInterval(setCounter)
        workStop.removeEventListener('click', stop)
        resolve("timeup")
      }
    },1000)

    //中斷事件
    workStop.addEventListener('click', stop)

    function stop() {
      return new Promise(function(yes, no) {
        clearInterval(setCounter);
        const stopTime = Date.now()
        if (confirm('確定要捨棄番茄嗎?')) {
          clearInterval(setCounter);
          displayTimeLeft(seconds)
          workStop.removeEventListener('click', stop)
          selectBox.classList.remove('d-none')
          messageBox.classList.add('d-none')
          workStart.classList.remove("d-none")
          workStop.classList.add("d-none")
          reject(confirmDropOrNot)
        } else {
          end_time += (Date.now() - stopTime) 
          setCounter = setInterval(() => {
            secondsLeft = Math.round((end_time - Date.now()) / 1000)
            displayTimeLeft(secondsLeft)    
            if (secondsLeft <= 0) {
              clearInterval(setCounter)
              resolve("timeup")
              workStop.removeEventListener('click', stop)
            }
          },1000)
        }
      })
    }
  })
}

//計時結束
function finishWorkApiPromise() {
  let auth_token = localStorage.getItem("auth_token");
  let workStop = document.querySelector(".workstopbtn");
  let tictac_id = workStop.dataset.id;
  let selectedTask = JSON.parse(localStorage.getItem("selectedTask"));
  let task_id = selectedTask.task_id;
  return new Promise(function(resolve, reject) {
    postData("http://127.0.0.1:3000/api/v1/finishwork", { auth_token: auth_token, tictac_id: tictac_id , task_id: task_id})
    .then((data) => {
      resolve((data));
    })
  })
}

//開始休息計時
function startRelaxPromise() {
let setCounter;
let workStop = document.querySelector(".workstopbtn");
let relaxStart = document.querySelector(".relaxstartbtn");
let seconds = relaxStart.dataset.time;
let now = Date.now();
let end_time = now + seconds * 1000;
let secondsLeft = Math.round((end_time - now) / 1000);
let messageBox = document.querySelector('.messagebox');
messageBox.innerHTML = "休息中...";


return new Promise(function(resolve, reject) {
  relaxStart .classList.add("d-none")
  workStop.classList.remove("d-none")

  setCounter = setInterval(() => {
    secondsLeft = Math.round((end_time - Date.now()) / 1000)
    displayTimeLeft(secondsLeft)    
  
    if (secondsLeft < 0) {
      clearInterval(setCounter)
      workStop.removeEventListener('click', stop)
      resolve("relaxtime over")
    }
  },1000)

  //中斷休息
  workStop.addEventListener('click', stop)
  
    function stop() {
      return new Promise(function(resolve, reject) {
        clearInterval(setCounter)
        displayTimeLeft(relaxStart.dataset.time)
        reject("relaxstop")
        workStop.removeEventListener('click', stop)
      })
    }
})
}

//中斷工作
function breakWorkApiPromise(data){
  let workStop = document.querySelector(".workstopbtn");
  let tictac_id = workStop.dataset.id;
  let auth_token = localStorage.getItem("auth_token");
  let selectedTask = JSON.parse(localStorage.getItem("selectedTask"));
  let task_id = selectedTask.task_id;
  return new Promise(function(resolve, reject) {
    postData("http://127.0.0.1:3000/api/v1/cancelwork", { auth_token: auth_token, task_id: task_id, tictac_id: tictac_id})
    .then((data) => {
      resolve((data));
    })
  })
}

// connect(){
// this.clicked = false
// let relax_num = 0

// //每4次休息一次長休息

// this.relaxbtnTarget.addEventListener("click", function(){
//   relax_num += 1
  
//   if (relax_num % 4 === 0){
//     dataset.time = "15"
//   }else{
//     dataset.time = "5"
//   }
// })

// //顯示時間
// this.displayTimeLeft(parseInt(this.startbtnTarget.dataset.time))
// }

let workStart = document.querySelector(".workstartbtn");
displayTimeLeft(parseInt(workStart.dataset.time))

function start() {
  startWorkApiPromise().then((data) => {
    let workStop = document.querySelector(".workstopbtn");
    let relaxStart = document.querySelector(".relaxstartbtn");
    workStop.dataset.id = data["tictac_id"];
    relaxStart.dataset.id = data["tictac_id"];
    return startWorkPromise();
  }).then((data) => {
    return finishWorkApiPromise();
  }).then((data) => {
    let workStop = document.querySelector(".workstopbtn");
    let relaxStart = document.querySelector(".relaxstartbtn");
    workStop.classList.add("d-none");
    relaxStart.classList.remove("d-none");
    relaxStart.addEventListener('click', relax);
    alert('休息一下');
    displayTimeLeft(relaxStart.dataset.time);
  }).catch((data) => {
    return breakWorkApiPromise(data);
  }).then((data) => {
  })
}

function relax() {
  startRelaxPromise().then((data) => {
    let workStart = document.querySelector(".workstartbtn");
    let workStop = document.querySelector(".workstopbtn");
    let selectBox = document.querySelector('.selecttask');
    let messageBox = document.querySelector('.messagebox');
    workStart.classList.remove("d-none");
    workStop.classList.add("d-none");
    selectBox.classList.remove("d-none");
    messageBox.classList.add("d-none");
    alert("該開始下一顆番茄了");
    displayTimeLeft(workStart.dataset.time);
  }).catch((data) => {
    let workStart = document.querySelector(".workstartbtn");
    let workStop = document.querySelector(".workstopbtn");
    let relaxStart = document.querySelector(".relaxstartbtn");
    let selectBox = document.querySelector('.selecttask');
    let messageBox = document.querySelector('.messagebox');
    workStart.classList.remove("d-none");
    workStop.classList.add("d-none");
    relaxStart.classList.add("d-none");
    selectBox.classList.remove("d-none");
    messageBox.classList.add("d-none");
    alert("直接開始下一顆番茄");
    displayTimeLeft(workStart.dataset.time);
  })
}

function stop(e) {
  e.preventDefault();
}