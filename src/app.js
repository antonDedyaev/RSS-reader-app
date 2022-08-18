import 'bootstrap';
import './styles/styles.scss';
import onChange from 'on-change';
import * as yup from 'yup';

import renderForm from './view.js';

const app = () => {
  const state = {
    rssForm: {
      valid: false,
      state: 'initial',
    },
    addedFeeds: [],
    errors: [],
  };

  const watchedState = onChange(state, (path, value) => {
    if (path === 'rssForm.valid') {
      renderForm(watchedState);
    }
  });

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
      .then(() => {
        watchedState.rssForm.valid = true;
        watchedState.addedFeeds.push(newUrl);
      })
      .catch((err) => {
        watchedState.errors.push(err);
        watchedState.rssForm.valid = false;
        console.log(err);
      });
    renderForm(watchedState);
  });

  renderForm(watchedState);
};

export default app;
