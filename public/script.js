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
    if (this.#bookmarks.some(bookmark => bookmark.url === article.url)) {
      return;
    }

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

  bindOnChange(handler) {
    this.#onChange = handler;
  }

  initialize() {
    this.#onChange('bookmarks', this.#bookmarks);
  }
}

class View {
  #search;
  #bookmarksList;
  #searchResults;
  #articleImage;
  #articleTitle;
  #articleAuthor;
  #articleButtons;
  #articleSource;
  #articleDate;
  #articleContent;

  #onBookmarkOpen;
  #onBookmarkAdd;
  #onBookmarkDelete;
  #onSearchResultClick;

  constructor() {
    this.#search = View.getElement('#search');
    this.#bookmarksList = View.getElement('#bookmarks-list');
    this.#searchResults = View.getElement('#search-results');
    this.#articleImage = View.getElement('#article-img');
    this.#articleTitle = View.getElement('#article-title');
    this.#articleAuthor = View.getElement('#article-author');
    this.#articleButtons = View.getElement('#article-btns');
    this.#articleSource = View.getElement('#article-source');
    this.#articleDate = View.getElement('#article-date');
    this.#articleContent = View.getElement('#article-content');

    this.#onBookmarkOpen = () => {};
    this.#onBookmarkAdd = () => {};
    this.#onBookmarkDelete = () => {};
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
      const deleteButton = document.createElement('a');
      deleteButton.setAttribute('uk-icon', 'icon: trash');
      deleteButton.addEventListener('click', () => this.#onBookmarkDelete(article.id));
      li.append(a, deleteButton);
      this.#bookmarksList.append(li);
    }
  }

  bindBookmarkOpen(handler) {
    this.#onBookmarkOpen = handler;
  }

  bindBookmarkDelete(handler) {
    this.#onBookmarkDelete = handler;
  }

  updateSearchResults(searchResults) {
    this.#searchResults.innerHTML = '';
    for (const article of searchResults) {
      const li = document.createElement('li');
      const divOuter = document.createElement('div');
      divOuter.addEventListener('click', () => this.#onSearchResultClick(article));

      const img = document.createElement('img');
      img.setAttribute('src', article.urlToImage);

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

    const articleLinkButton = document.createElement('button');
    articleLinkButton.setAttribute('class', 'uk-button');
    const spanLink = document.createElement('span');
    spanLink.setAttribute('class', 'icon');
    spanLink.setAttribute('uk-icon', 'icon: link');
    articleLinkButton.append(spanLink, 'View Full Article');
    articleLinkButton.addEventListener('click', () => window.open(article.url));

    const articleBookmarkButton = document.createElement('button');
    articleBookmarkButton.setAttribute('class', 'uk-button');
    const spanBookmark = document.createElement('span');
    spanBookmark.setAttribute('class', 'icon');
    spanBookmark.setAttribute('uk-icon', 'icon: bookmark');
    articleBookmarkButton.append(spanBookmark, 'Add to Bookmarks');
    articleBookmarkButton.addEventListener('click', () => this.#onBookmarkAdd(article));

    this.#articleButtons.innerHTML = '';
    this.#articleButtons.append(articleLinkButton, articleBookmarkButton);

    this.#articleSource.textContent = article.source;
    this.#articleDate.textContent = `Published ${formatDate(article.publishedAt)}`;
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

    this.#view.bindOnSearch(this.onSearch);
    this.#view.bindBookmarkOpen(this.onSelectArticle);
    this.#view.bindSearchResultClick(this.onSelectArticle);
    this.#view.bindBookmarkAdd(this.onBookmarkAdd);
    this.#view.bindBookmarkDelete(this.onBookmarkDelete);

    this.#model.bindOnChange(this.onDataChange);

    this.#model.initialize();
  }

  onSearch = searchQuery => this.#model.search(searchQuery);

  onSelectArticle = article => this.#model.updateArticle(article);

  onBookmarkAdd = article => this.#model.addBookmark(article);

  onBookmarkDelete = id => this.#model.deleteBookmark(id);

  onDataChange = (key, data) => {
    switch (key) {
      case 'bookmarks':
        this.#view.updateBookmarks(data);
        this.#model.save();
        break;
      case 'searchResults':
        this.#view.updateSearchResults(data);
        break;
      case 'article':
        this.#view.updateArticle(data);
        break;
      default:
        break;
    }
  };
}

const LOCAL_STORAGE_KEY = 'NewsAggregatorProject';

const app = new Controller(new Model(), new View());

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };
  return date.toLocaleString('en-US', options);
}
