const ALARM_NAME = "tictac";

class Tictac {
  constructor() {
    this.workTime = 1;
    this.time = 1;
    this.restTime = 5;
    this.longRestTime = 15;
    this.timer = "work";
    this.isRun = false;
    this.workNum = 0;
    this.restNum = 0;
    
    // 預設icon背景顏色
    chrome.browserAction.setBadgeBackgroundColor({ color: '#4285f4' })
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
      this.stop()
    } else {
      this.start()
      this.workTime = 1
    }
    // 點擊icon後變更運轉狀態
    this.isRun = !this.isRun;
  }

  handleAlarm() {
    this.time--
    if (this.time < 1) {
      this.stop()
      // chrome.runtime.openOptionsPage()
    } else {
      chrome.browserAction.setBadgeText({text: String(this.workTime)})
    }
  }

  start() {
    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: 1,
      periodInMinutes: 1
    });
    chrome.browserAction.setBadgeText({text: String(this.workTime)})
  }
  
  stop() {
    this.isRun = false
    chrome.alarms.clear(ALARM_NAME);
    chrome.browserAction.setBadgeText({text: ""});
  }

  onMessage(request) {
    if (request.func === 'getTimeInfo') {
      return {
        func: request.func,
        timeType: this.timer,
        restNum: this.restNum,
        workNum: this.workNum
      }
    } else if (request.func === 'switchAlarm') {
      this.switchAlarm()
    }
  }

  switchAlarm() {
    if (this.timer === 'work') {
      chrome.browserAction.setBadgeBackgroundColor({ color: '#6e6e6e' })
      this.workNum++
      this.timer = 'rest'
      if (this.workNum === 4) {
        this.time = this.longRestTime
      } else {
        this.time = this.restTime
      }
      this.start()
    } else {
      chrome.browserAction.setBadgeBackgroundColor({ color: '#4285f4' })
      this.restNum++
      if (this.restNum === 4) {
        this.workNum = 0
        this.restNum = 0
        // 不用this.timer = 'work'?
        // 這兩行可以移除去嗎？
        this.time = this.workTime
      } else {
        this.timer = 'work'
        this.time = this.workTime
      }
      this.start()
    }
  }
}

var tictac = new Tictac();

chrome.runtime.onConnect.addListener(function(port) {
  if(port.name === "tictac") {
    port.onMessage.addListener(function(request) {
      port.postMessage(tictac.onMessage(request))
    })
  }
})