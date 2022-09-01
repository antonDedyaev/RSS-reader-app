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

const generateId = (elements) => ((elements.length === 0) ? 1 : elements.length + 1);

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
    rssForm: {
      processState: 'filling',
      errors: null,
    },
    feeds: [],
    posts: [],
    viewedPosts: [],
  };

  const watchedState = watcher(state, i18nextInstance);

  const rssForm = document.querySelector('.rss-form');
  const postsContainer = document.querySelector('.posts');

  rssForm.addEventListener('submit', (e) => {
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
        watchedState.rssForm.processState = 'loading';
        return getResponse(newUrl);
      })
      .then((response) => {
        const parsedData = parseRss(response.data.contents, newUrl);
        parsedData.feed.id = generateId(watchedState.feeds);
        watchedState.feeds.unshift(parsedData.feed);
        const postsWithId = parsedData.posts.map((post, index) => {
          const postId = generateId(watchedState.posts) + index;
          return { ...post, id: postId, feedId: parsedData.feed.id };
        });
        watchedState.posts = postsWithId.concat(watchedState.posts);
        watchedState.rssForm.errors = null;
        watchedState.rssForm.processState = 'success';
      })
      .catch((err) => {
        watchedState.rssForm.processState = 'fault';
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

  postsContainer.addEventListener('click', (e) => {
    const selectedPost = watchedState.posts
      .flatMap((el) => (el.id === Number(e.target.dataset.id) ? el.id : []));
    watchedState.viewedPosts = selectedPost.concat(watchedState.viewedPosts);
  });

  const getUpdatedPosts = () => {
    const urls = watchedState.feeds.map((feed) => feed.url);
    const promises = urls.map((url) => getResponse(url)
      .then((updatedResponse) => parseRss(updatedResponse.data.contents))
      .then((parsedContents) => {
        const { feed, posts } = parsedContents;
        watchedState.feeds.forEach((oldFeed) => {
          if (oldFeed.title === feed.title) {
            feed.id = oldFeed.id;
          }
        });
        const newPosts = _.differenceBy(posts, watchedState.posts, 'title');
        const newPostWithId = newPosts.map((post, index) => {
          const newPostId = generateId(watchedState.posts) + index;
          return { ...post, id: newPostId, feedId: feed.id };
        });
        watchedState.posts = newPostWithId.concat(watchedState.posts);
      })
      .catch((err) => {
        watchedState.rssForm.processState = 'fault';
        /* Тут не стал ставить switch, так как всего два типа ошибок */
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
