import 'bootstrap';
import './styles/styles.scss';
import * as yup from 'yup';
import i18next from 'i18next';
import ru from './locales/ru.js';

import watcher from './view.js';

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
  };

  const watchedState = watcher(state, i18nextInstance);

  const rssForm = document.querySelector('.rss-form');
  rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.rssForm.processState = 'loading';
    const formData = new FormData(e.target);
    const newUrl = formData.get('url');

    const schema = yup
      .string()
      .required()
      .url()
      .notOneOf(watchedState.addedFeeds);

    schema.validate(newUrl)
      .then(() => {
        watchedState.rssForm.processState = 'success';
        watchedState.rssForm.errors = null;
        watchedState.addedFeeds.push(newUrl);
        console.log(watchedState.rssForm);
      })
      .catch((err) => {
        watchedState.rssForm.processState = 'fault';
        watchedState.rssForm.errors = err.message;
        console.log(watchedState.rssForm);
      });
  });
};

export default app;
