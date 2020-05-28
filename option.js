var port = chrome.runtime.connect({name:'tictac'})

port.onMessage.addListener(function(response) {
  if(response.fun === 'getTimeInfo') {
    document.getElementById(response.timeType).style.display = "block"
    document.getElementById(response.timeType === "work" ? 'rest' : 'work').style.display = 'none'
  }
})