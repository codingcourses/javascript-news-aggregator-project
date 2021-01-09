const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.static(__dirname + '/public'));

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

// Example: /news?q=bitcoin
app.get('/news', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    res.status(400).send({ error: 'Missing query' });
    return;
  }

  const endpoint = `https://newsapi.org/v2/everything?q=${q}&apiKey=${process.env.NEWS_API_KEY}`;
  try {
    const { data: { articles } } = await axios.get(endpoint);
    const result = articles.map(article => ({
      source: article.source.name,
      author: article.author || 'No Author Specified',
      title: article.title,
      description: article.description,
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
    }))
    .filter(article => article.urlToImage);
    res.send(result);
  } catch (e) {
    res.status(400).send({ error: 'Error occurred when making NewsAPI request' });
    return;
  }
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
