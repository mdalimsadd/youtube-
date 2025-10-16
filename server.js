const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

app.get('/api/get-video', (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'No URL provided' });

  const outputTemplate = path.join(TMP_DIR, '%(title).200s-%(id)s.%(ext)s');

  const ytdlp = spawn('yt-dlp', ['-f', 'best', '-o', outputTemplate, url]);

  let stderr = '';
  ytdlp.stderr.on('data', data => stderr += data.toString());

  ytdlp.on('close', code => {
    if (code !== 0) {
      return res.status(500).json({ error: 'yt-dlp failed', details: stderr });
    }

    const files = fs.readdirSync(TMP_DIR).map(f => ({
      file: f,
      time: fs.statSync(path.join(TMP_DIR, f)).mtimeMs
    })).sort((a, b) => b.time - a.time);

    if (!files.length) {
      return res.status(404).json({ error: 'No file downloaded' });
    }

    const filePath = path.join(TMP_DIR, files[0].file);
    const downloadUrl = `/download/${encodeURIComponent(files[0].file)}`;
    return res.json({ downloadUrl });
  });
});

app.get('/download/:filename', (req, res) => {
  const file = req.params.filename;
  const filePath = path.join(TMP_DIR, file);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.download(filePath);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
