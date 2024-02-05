async function HandleOnLoadEvent(_e) {
  var corsflareUrl = 'https://worker-winter-glade-cd02.bigtentgames.workers.dev/';
  var requestUrl = corsflareUrl + encodeURIComponent(window.location.search.split('?')[1]);

  await fetch(requestUrl, {
    headers: {
      Host: window.location.hostname,
      Origin: window.location.origin,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }
      return response.text();
    })
    .then(
      (shortUrl) =>
        function () {
          location.href = location.origin + '/' + shortUrl;
        },
    )
    .catch((error) => console.error('Error:', error));
}

window.addEventListener('load', HandleOnLoadEvent);
