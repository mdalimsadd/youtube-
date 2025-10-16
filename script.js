const urlInput = document.getElementById('url');
const previewBtn = document.getElementById('preview');
const downloadBtn = document.getElementById('downloadBtn');
const previewArea = document.getElementById('previewArea');
const meta = document.getElementById('meta');

previewBtn.addEventListener('click', () => {
  const url = urlInput.value.trim();
  if (!url) return alert('Please enter a URL');

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const match = url.match(/(?:v=|\/)([A-Za-z0-9_-]{6,})/);
    const id = match ? match[1] : '';
    previewArea.innerHTML = `<iframe width="100%" height="360" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`;
    meta.textContent = 'Previewing YouTube video';
    return;
  }

  if (url.includes('tiktok.com')) {
    previewArea.innerHTML = `<blockquote class="tiktok-embed" cite="${url}" style="max-width:560px"><section></section></blockquote><script async src="https://www.tiktok.com/embed.js"></script>`;
    meta.textContent = 'Previewing TikTok video';
    return;
  }

  previewArea.innerHTML = `<p>No preview available for this platform.</p>`;
  meta.textContent = '';
});

downloadBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) return alert('Please enter a URL');

  meta.textContent = 'Requesting download...';

  try {
    const res = await fetch(`/api/get-video?url=${encodeURIComponent(url)}`);
    const data = await res.json();

    if (data.downloadUrl) {
      meta.innerHTML = `<a href="${data.downloadUrl}" download>Download file</a>`;
    } else {
      meta.textContent = 'Download failed or not available.';
    }
  } catch (err) {
    meta.textContent = 'Error: ' + err.message;
  }
});
