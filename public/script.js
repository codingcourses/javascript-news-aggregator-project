class Model {
  #bookmarks;
  #searchResults;
  #article;
  #onChange;

  constructor() {
    // { id, source, author, title, description, url, urlToImage, publishedAt }
    this.#bookmarks = localStorage.getItem(LOCAL_STORAGE_KEY)
      ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
      : [];
    this.#searchResults = [];
    this.#article = null;
    this.#onChange = () => {};
  }

  addBookmark(article) {
    this.#bookmarks.push({
      id: uuidv4(),
      ...article,
    });
    this.#onChange('bookmarks', this.#bookmarks);
  }

  deleteBookmark(id) {
    const index = this.#bookmarks.find(article => article.id === id);
    if (index === -1) {
      return;
    }
    this.#bookmarks.splice(index, 1);
    this.#onChange('bookmarks', this.#bookmarks);
  }

  save() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.#bookmarks));
  }

  #updateSearchResults(searchResults) {
    this.#searchResults = searchResults;
    this.#onChange('searchResults', this.#searchResults);
  }

  updateArticle(article) {
    this.#article = article;
    this.#onChange('article', this.#article);
  }

  async search(query) {
    const response = await fetch(`/news?q=${query}`);
    const data = await response.json();
    this.#updateSearchResults(data)
  }
}

class View {
  #search;
  #bookmarksList;
  #searchResults;
  #articleImage;
  #articleTitle;
  #articleAuthor;
  #articleLinkButton;
  #articleBookmarkButton;
  #articleSource;
  #articleDate;
  #articleContent;

  #onBookmarkOpen;
  #onBookmarkAdd;
  #onSearchResultClick;

  constructor() {
    this.#search = View.getElement('#search');
    this.#bookmarksList = View.getElement('#bookmarks-list');
    this.#searchResults = View.getElement('#search-results');
    this.#articleImage = View.getElement('#article-img');
    this.#articleTitle = View.getElement('#article-title');
    this.#articleAuthor = View.getElement('#article-author');
    this.#articleLinkButton = View.getElement('#article-link-btn');
    this.#articleBookmarkButton = View.getElement('#article-bookmark-btn');
    this.#articleSource = View.getElement('#article-source');
    this.#articleDate = View.getElement('#article-date');
    this.#articleContent = View.getElement('#article-content');

    this.#onBookmarkOpen = () => {};
    this.#onBookmarkAdd = () => {};
    this.#onSearchResultClick = () => {};
  }

  static getElement(selector) {
    const elem = document.querySelector(selector);
    return elem;
  }

  bindOnSearch(handler) {
    this.#search.addEventListener('keyup', event => {
      if (!event.target.value) {
        return;
      }

      if (event.code === 'Enter' || event.key === 'Enter' || event.keyCode === 13) {
        handler(event.target.value);
      }
    });
  }

  updateBookmarks(bookmarks) {
    this.#bookmarksList.innerHTML = '';
    for (const article of bookmarks) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = article.title;
      a.addEventListener('click', () => this.#onBookmarkOpen(article));
      li.append(a);
      this.#bookmarksList.append(a);
    }
  }

  bindBookmarkOpen(handler) {
    this.#onBookmarkOpen = handler;
  }

  updateSearchResults(searchResults) {
    this.#searchResults.innerHTML = '';
    for (const article of searchResults) {
      const li = document.createElement('li');
      const divOuter = document.createElement('div');
      divOuter.addEventListener('click', () => this.#onSearchResultClick(article));

      const img = document.createElement('img');
      img.setAttribute('src', article.urlToImage);
      img.setAttribute('uk-img', 'uk-img');

      const divTitle = document.createElement('div');
      divTitle.textContent = article.title;

      divOuter.append(img, divTitle);
      li.append(divOuter);
      this.#searchResults.append(li);
    }
  }

  bindSearchResultClick(handler) {
    this.#onSearchResultClick = handler;
  }

  updateArticle(article) {
    this.#articleImage.setAttribute('src', article.urlToImage);
    this.#articleTitle.textContent = article.title;
    this.#articleAuthor.textContent = article.author;
    this.#articleLinkButton.addEventListener('click', () => window.open(article.url));
    this.#articleBookmarkButton.addEventListener('click', () => this.#onBookmarkAdd(article));
    this.#articleSource.textContent = article.source;
    this.#articleDate.textContent = article.date;
    this.#articleContent.textContent = article.description;
  }

  bindBookmarkAdd(handler) {
    this.#onBookmarkAdd = handler;
  }
}

class Controller {
  #model;
  #view;

  constructor(model, view) {
    this.#model = model;
    this.#view = view;
  }
}

const LOCAL_STORAGE_KEY = 'NewsAggregatorProject';

const app = new Controller(new Model(), new View());
