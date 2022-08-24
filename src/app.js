import 'bootstrap';
import './styles/styles.scss';

import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import ru from './locales/ru.js';
import watcher from './view.js';

import { pullNewFeeds, parseRss } from './rssParser.js';

const getResponse = (url) => axios.get(pullNewFeeds(url));

const app = () => {
  const defaultLanguage = 'ru';

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: true,
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
    addedFeeds: [],
    feeds: [],
    posts: [],
  };

  let feedCounter = 0;
  let postCounter = 0;

  const watchedState = watcher(state, i18nextInstance);

  const rssForm = document.querySelector('.rss-form');
  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newUrl = formData.get('url');

    const schema = yup
      .string()
      .required()
      .url()
      .notOneOf(watchedState.addedFeeds);

    schema.validate(newUrl)
      .then((link) => {
        watchedState.rssForm.processState = 'loading';
        watchedState.rssForm.errors = null;
        watchedState.addedFeeds.push(link);
        return getResponse(link);
      })
      .then((response) => {
        const parsedData = parseRss(response.data.contents);
        feedCounter += 1;
        parsedData.feed.id = feedCounter;
        watchedState.feeds.unshift(parsedData.feed);
        parsedData.posts.forEach((post) => {
          postCounter += 1;
          Object.assign(post, { id: postCounter, feedId: parsedData.feed.id });
        });
        watchedState.posts = parsedData.posts.concat(watchedState.posts);
        watchedState.rssForm.processState = 'success';
      })
      .catch((err) => {
        watchedState.rssForm.processState = 'fault';
        watchedState.rssForm.errors = err.message;
        console.log(watchedState.rssForm);
      });
  });
  const getUpdatedPosts = () => {
    const promises = watchedState.addedFeeds.map((addedFeed) => getResponse(addedFeed)
      .then((updatedResponse) => parseRss(updatedResponse.data.contents))
      .then((parsedContents) => {
        const { feed, posts } = parsedContents;
        watchedState.feeds.forEach((oldFeed) => {
          if (oldFeed.title === feed.title) {
            feed.id = oldFeed.id;
          }
        });
        const newPosts = _.differenceBy(posts, watchedState.posts, 'title');
        newPosts.forEach((newPost) => {
          postCounter += 1;
          Object.assign(newPost, { id: postCounter, feedId: feed.id });
        });
        watchedState.posts = newPosts.concat(watchedState.posts);
      })
      .catch((err) => console.log(err)));
    Promise.all(promises).then(() => setTimeout(() => getUpdatedPosts(), 5000));
  };
  getUpdatedPosts();
};

export default app;
