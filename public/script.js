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
