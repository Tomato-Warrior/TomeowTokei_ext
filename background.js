const ALARM_NAME = "tictac";

class Tictac {
  constructor() {
    this.workTime = 1;
    this.restTime = 5;
    this.longRestTime = 15;
    this.timer = "work";
    this.isRun = false;

    // 點擊icon時觸發事件
    //browser_action有default_popup時無法使用
    chrome.browserAction.onClicked.addListener(() => {this.handleIconClick()})
    // tictac運轉時呼叫handleAlarm
    chrome.alarms.onAlarm.addListener(() => {this.handleAlarm()})
    // 預設icon文字
    chrome.browserAction.setBadgeText({text: ""})
  }

  handleIconClick() {
    if (this.isRun) {
      chrome.browserAction.setBadgeText({text: ""})
      this.stop()
    } else {
      this.start()
      this.workTime = 1
      chrome.browserAction.setBadgeText({text: String(this.workTime)})
    }
    // 點擊icon後變更運轉狀態
    this.isRun = !this.isRun;
  }

  handleAlarm() {
    if (this.workTime - 1 < 1) {
      this.stop()
    }
    if (this.timer === "work") {
      this.workTime --
      chrome.browserAction.setBadgeText({text: String(this.workTime)})
    }
  }

  start() {
    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: 1,
      periodInMinutes: 1
    });
    chrome.alarms.getAll((array) => {
      console.log(array);
    })
  }
  
  stop() {
    chrome.alarms.clear(ALARM_NAME);
    chrome.browserAction.setBadgeText({text: ""});
  }
}

var tictac = new Tictac();

chrome.runtime.openOptionsPage(callback)

{
  fun: 'getTimeInfo'
  data: {}
}

chrome.runtime.onConnect.addListener(function(port) {
  if(port.name === "tictac") {
    port.onMessage.addListener(function(request) {
      port.postMessage(tictac.onMessage(request))
    })
  }
})