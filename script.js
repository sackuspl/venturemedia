fetch('articles.json')
  .then(response => response.json())
  .then(articles => {
    articles.forEach((article, index) => {
      const box = document.getElementById(`article-${index}`);
      if (box) {
        const imageDiv = box.querySelector('.article-image');
        imageDiv.style.backgroundImage = `url('${article.image}')`;
        imageDiv.querySelector('.category-badge').textContent = article.category;

        box.querySelector('.article-title').textContent = article.title;
        box.querySelector('.article-description').textContent = article.description;
        box.querySelector('.author').textContent = article.author;
        box.querySelector('.date').textContent = article.date;
      }
    });
  })
  .catch(error => console.error('Błąd wczytywania danych:', error));
