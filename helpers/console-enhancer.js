var UseDebug = false;

function getCallerLines() {
  const stack = new Error().stack;
  const lines = stack.split('\n');
  // Extract line numbers from the stack trace (format: ...:line:column)
  function extractLineNum(str) {
    const match = str.match(/:(\d+):\d+\)?$/);
    return match ? match[1] : '';
  }
  const lineNum1 = extractLineNum(lines[3] || lines[2]);
  const lineNum2 = extractLineNum(lines[4] || lines[3]);
  let value = `${lineNum1}:${lineNum2}`;
  return value.padEnd(9, ' ');
}

function highlight(text, isolate) {
  isolate = isolate == undefined ? false : isolate;
  log(text, isolate, 'color:#97FF90;');
}

function warn(text, isolate) {
  isolate = isolate == undefined ? false : isolate;
  log(text, isolate, 'color:orange;');
}

function error(text, isolate) {
  isolate = isolate == undefined ? false : isolate;
  log(text, isolate, 'color:red;');
}

function note(text, isolate) {
  isolate = isolate == undefined ? false : isolate;
  log(text, isolate, 'color:gray;');
}

function log(text, isolate, color) {
  text = text.toString();

  const callerLines = getCallerLines();
  color = color == undefined ? 'black' : color;
  isolate = isolate == undefined ? false : isolate;
  var ms = new Date(Date.now()).getMilliseconds();
  ms = ms < 10 ? ms * 100 : ms;
  ms = ms < 100 ? ms * 10 : ms;
  ms = ms.toString().padEnd(3, ' ');

  if (UseDebug || isolate) {
    if (isolate) {
      console.log('◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦');
    }
    if (warn) {
      console.log('%c' + new Date(Date.now()).toLocaleTimeString('en-US').replace(/ AM/, '').replace(/ PM/, '') + '.' + ms + ' \t%c' + callerLines + '\t%c' + text, 'color:lightgray;', 'font-family: monospace; color: inherit;', color);
    } else {
      console.log('%c' + new Date(Date.now()).toLocaleTimeString('en-US').replace(/ AM/, '').replace(/ PM/, '') + '.' + ms + '%c' + callerLines + '\t%c' + text, '', 'font-family: monospace; color: inherit;', color);
    }
    if (isolate) {
      console.log('◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦');
    }
  }
}

function getHashValue(key) {
  var matches = location.hash.match(new RegExp(key + '=([^&]*)'));
  return matches ? matches[1] : null;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
