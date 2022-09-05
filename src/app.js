import 'bootstrap';
import './styles/styles.scss';

import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import ru from './locales/ru.js';
import watcher from './view.js';

import { getProxiedUrl, parseRss } from './rssParser.js';

const getResponse = (url) => axios.get(getProxiedUrl(url));

const app = () => {
  const defaultLanguage = 'ru';

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources: {
      ru,
    },
  });

  yup.setLocale({
    string: {
      url: 'invalidUrl',
    },
    mixed: {
      notOneOf: 'urlAlreadyAdded',
    },
  });

  const state = {
    uiState: {
      viewedPosts: [],
    },
    processState: 'filling',
    rssForm: {
      errors: null,
    },
    feeds: [],
    posts: [],
  };

  const rssForm = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');
  const submitButton = document.querySelector('.px-sm-5');
  const feedBack = document.querySelector('.feedback');
  const feedsContainer = document.querySelector('.feeds');
  const postsContainer = document.querySelector('.posts');

  const domElements = {
    rssForm,
    input,
    submitButton,
    feedBack,
    feedsContainer,
    postsContainer,
  };

  const watchedState = watcher(domElements, state, i18nextInstance);

  domElements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUrl = formData.get('url');

    const schema = yup
      .string()
      .required()
      .url()
      .notOneOf(watchedState.feeds.map((feed) => feed.url));

    schema.validate(newUrl)
      .then(() => {
        watchedState.rssForm.errors = null;
        watchedState.processState = 'loading';
        return getResponse(newUrl);
      })
      .then((response) => {
        const parsedData = parseRss(response.data.contents, newUrl);
        watchedState.feeds.unshift(parsedData.feed);
        const postsWithId = parsedData.posts.map((post) => ({ ...post, id: _.uniqueId() }));
        watchedState.posts = postsWithId.concat(watchedState.posts);
        watchedState.rssForm.errors = null;
        watchedState.processState = 'success';
      })
      .catch((err) => {
        watchedState.processState = 'fault';
        switch (err.name) {
          case 'ValidationError':
          case 'parsingError':
            watchedState.rssForm.errors = err.message;
            break;
          case 'AxiosError':
            watchedState.rssForm.errors = 'networkError';
            break;
          default:
            watchedState.rssForm.errors = 'unknownError';
            throw new Error(err.name);
        }
      });
  });

  domElements.postsContainer.addEventListener('click', (e) => {
    const selectedPost = watchedState.posts
      .flatMap((el) => (el.id === e.target.dataset.id ? el.id : []));
    watchedState.uiState.viewedPosts = selectedPost.concat(watchedState.uiState.viewedPosts);
  });

  const getUpdatedPosts = () => {
    const urls = watchedState.feeds.map((feed) => feed.url);
    const promises = urls.map((url) => getResponse(url)
      .then((updatedResponse) => parseRss(updatedResponse.data.contents))
      .then((parsedContents) => {
        const { posts } = parsedContents;
        const newPosts = _.differenceBy(posts, watchedState.posts, 'title');
        if (newPosts.length === 0) {
          return;
        }
        const newPostWithId = newPosts.map((post) => ({ ...post, id: _.uniqueId() }));
        watchedState.posts = newPostWithId.concat(watchedState.posts);
      })
      .catch((err) => {
        watchedState.processState = 'fault';
        if (err.name === 'AxiosError') {
          watchedState.rssForm.errors = 'networkError';
        } else {
          watchedState.rssForm.errors = 'unknownError';
          throw new Error(err.name);
        }
      }));
    Promise.all(promises).finally(() => setTimeout(() => getUpdatedPosts(), 5000));
  };
  getUpdatedPosts();
};

export default app;
