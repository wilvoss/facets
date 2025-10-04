let timer, count, counter, loading, controls, message, refresh, okay;

async function HandleOnLoadEvent(_e) {
  loading = document.getElementById('loading');
  controls = document.getElementById('controls');
  message = document.getElementById('message');
  counter = document.getElementById('counter');
  refresh = document.getElementById('refresh');
  okay = document.getElementById('okay');

  var corsflareUrl = 'https://facets-shorturl-api.bigtentgames.workers.dev/';
  var rawUrl = window.location.search.split('?')[1];

  // return;/

  if (!location.search || location.search === '') {
    HandleError();
    return;
  }

  // Validate and sanitize the URL
  var requestUrl;
  try {
    requestUrl = new URL(decodeURIComponent(window.location));
  } catch (_) {
    console.error('Invalid URL:', requestUrl);
    HandleError();
    return;
  }

  requestUrl = corsflareUrl + encodeURIComponent(rawUrl);

  await fetch(requestUrl, {
    method: 'GET',
  })
    .then((response) => {
      if (!response.ok) {
        // HandleError(true);
        throw new Error('Server error: ' + response.status);
      }
      return response.text();
    })
    .then((searchParams) => {
      if (searchParams.indexOf('&board=') === -1) {
        HandleError(true);
      } else {
        location.href = location.origin + '/?' + searchParams;
      }
    })
    .catch((error) => {
      HandleError(true);
      console.error('Error:', error);
    });
}

function HandleError(_refreshable = false) {
  loading.className = 'hide';
  message.className = '';
  okay.className = 'padded';

  if (_refreshable) {
    count = 60;
    message.innerHTML = 'Cutting and polishing a gem takes time! <br />Try refreshing in ' + count + ' seconds.';
    refresh.className = 'padded secondary disabled';
    window.setInterval(() => {
      count--;
      if (count <= 0) {
        window.clearInterval(timer);
        message.innerHTML = 'Cutting and polishing a gem takes time! <br />Try refreshing your browser.';
        refresh.className = 'padded secondary';
      } else {
        message.innerHTML = 'Cutting and polishing a gem takes time! <br />Try refreshing in ' + count + ' seconds.';
      }
    }, 1000);
  } else {
    message.innerHTML = "You've reached this page in error.";
  }
}

function HandleOnUnloadEvent() {
  window.clearInterval(timer);
}

window.addEventListener('load', HandleOnLoadEvent);
window.addEventListener('unload', HandleOnUnloadEvent);
