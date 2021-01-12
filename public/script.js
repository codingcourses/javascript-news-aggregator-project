class Model {
  #bookmarks;
  #searchResults;
  #article;

  constructor() {
    // { id, source, author, title, description, url, urlToImage, publishedAt }
    this.#bookmarks = localStorage.getItem(LOCAL_STORAGE_KEY)
      ? JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))
      : [];
    this.#searchResults = [];
    this.#article = null;
  }

  addBookmark(article) {
    this.#bookmarks.push(article);
  }

  deleteBookmark(id) {
    const index = this.#bookmarks.find(article => article.id === id);
    if (index === -1) {
      return;
    }
    this.#bookmarks.splice(index, 1);
  }

  save() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(this.#bookmarks));
  }

  #updateSearchResults(searchResults) {
    this.#searchResults = searchResults;
  }

  updateArticle(article) {
    this.#article = article;
  }

  async search(query) {
    const response = await fetch(`/news?q=${query}`);
    const data = await response.json();
    this.#updateSearchResults(data)
  }
}

class View {
  constructor() {}

  static getElement(selector) {
    const elem = document.querySelector(selector);
    return elem;
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
