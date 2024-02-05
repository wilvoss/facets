async function HandleOnLoadEvent(_e) {
  var corsflareUrl = 'https://worker-winter-glade-cd02.bigtentgames.workers.dev/';
  var rawUrl = window.location.search.split('?')[1];

  // Validate and sanitize the URL
  var requestUrl;
  try {
    requestUrl = new URL(decodeURIComponent(rawUrl));
  } catch (_) {
    console.error('Invalid URL:', rawUrl);
    HandleError();
    return;
  }

  requestUrl = corsflareUrl + encodeURIComponent(requestUrl);

  await fetch(requestUrl, {
    headers: {
      Host: window.location.hostname,
      Origin: window.location.origin,
    },
  })
    .then((response) => {
      if (!response.ok) {
        HandleError();
        throw new Error('Server error: ' + response.status);
      }
      return response.text();
    })
    .then((shortUrl) => {
      location.href = location.origin + '/' + shortUrl;
    })
    .catch((error) => {
      HandleError();
      console.error('Error:', error);
    });
}

function HandleError() {
  let button = document.getElementById('loadingButton');
  let controls = document.getElementById('controls');
  let message = document.getElementById('message');

  message.className = '';
  controls.className = '';
  button.className = 'hide';
}

window.addEventListener('load', HandleOnLoadEvent);
