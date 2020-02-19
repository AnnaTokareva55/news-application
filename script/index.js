"use strict";

const apiKey = "bc29cab729d34b1d9d0358d7ff86dabb";
const apiUrl = "http://newsapi.org/v2/";
const form = document.querySelector(".search-form");

document.addEventListener("DOMContentLoaded", () => {
  const newsService = new NewsService(apiKey, apiUrl, document);
  newsService.loadNews();

  form.addEventListener("submit", event => {
    event.preventDefault();
    newsService.loadNews();
  });
});

class NewsService {
  constructor(apiKey, apiUrl, document) {
    (this.apiKey = apiKey),
      (this.apiUrl = apiUrl),
      (this.main = document.querySelector("main")),
      (this.searchContainer = document.querySelector(".search-container")),
      (this.newsContainer = document.querySelector(".news-container")),
      (this.countrySelect = document.getElementById("country")),
      (this.categorySelect = document.getElementById("category")),
      (this.searchInput = document.getElementById("search"));
  }

  /**
   * GET-запрос на сервер для получения новостей.
   * @param {string} url - api запроса на сервер.
   */
  getNews(url) {
    return fetch(url).then(response => response.json());
  }

  /**
   * Загрузка новостей на страницу.
   */
  loadNews() {
    if (this.newsContainer.children.length)
      this.clearContainer(this.newsContainer);
    this.showLoader();
    const country = this.countrySelect.value;
    const category = this.categorySelect.value;
    const query = this.searchInput.value;
    let urlFetch = "";
    if (!query) {
      category === "all"
        ? (urlFetch = `${this.apiUrl}top-headlines?country=${country}&apikey=${this.apiKey}`)
        : (urlFetch = `${this.apiUrl}top-headlines?country=${country}&category=${category}&apikey=${this.apiKey}`);
    } else {
      urlFetch = `${this.apiUrl}everything?q=${query}&apikey=${this.apiKey}`;
      this.searchInput.value = "";
    }
    this.onGetResponse(urlFetch);
  }

  /**
   * Обработка ответа от сервера.
   * @param {string} urlFetch - api запроса на сервер.
   */
  onGetResponse(urlFetch) {
    this.getNews(urlFetch)
      .then(response => this.renderNews(response.articles))
      .catch(error => this.showAlert(`${error}.`));
  }

  /**
   * Рендеринг элементов новостей на странице.
   * @param {array} news - массив новостей, полученный от сервера.
   */
  renderNews(news) {
    this.removeLoader();
    if (!news.length) this.showAlert("Новости по данному запросу отсутствуют.");
    let fragment = "";
    news.forEach(newsItem => {
      const newsItemEl = this.getNewsTemplate(newsItem);
      fragment += newsItemEl;
    });
    this.newsContainer.insertAdjacentHTML("afterbegin", fragment);
  }

  /**
   * Рендеринг блока одной новости.
   * @param {object} param0 - объект новости.
   */
  getNewsTemplate({ urlToImage, title, description, url }) {
    return `<div class="card">
    <img src="${urlToImage}" class="card-img-top" alt="${title}" />
    <div class="card-body">
      <h3 class="card-title">${title || ""}</h3>
      <p class="card-text">
      ${description}
      </p>
      <a href="${url}" class="btn btn-primary">Read more</a>
    </div>
  </div>`;
  }

  /**
   * Отображение уведомления об ошибке.
   * @param {string} msg - текст ошибки.
   */
  showAlert(msg) {
    const alertEl = `<div class="alert alert-danger alert-dismissible" role="alert">
    ${msg}<button class="close" data-dismiss="alert" aria-label="Close">&times;</button>
    </div>`;
    this.main.insertAdjacentHTML("afterbegin", alertEl);
  }

  /**
   * Очистка html-контейнера на странице.
   * @param {object} container - элемент контейнера.
   */
  clearContainer(container) {
    container.innerHTML = "";
  }

  /**
   * Отображение лоадера во время загрузки новостей.
   */
  showLoader() {
    this.searchContainer.insertAdjacentHTML(
      "afterend",
      `<div class="progress" style="height: 20px;">
      <div class="progress-bar" role="progressbar" style="width: 25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
    </div>`
    );
  }

  /**
   * Удаление лоадера после загрузки новостей.
   */
  removeLoader() {
    const loader = this.main.querySelector(".progress");
    if (loader) loader.remove();
  }
}