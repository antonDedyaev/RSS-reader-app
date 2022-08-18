import onChange from 'on-change';

const renderProcessState = (state) => {
  const rssForm = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');
  const submitButton = document.querySelector('.px-sm-5');

  switch (state.rssForm.processState) {
    case 'filling':
      submitButton.disabled = false;
      input.classList.remove('is-invalid');
      rssForm.reset();
      break;
    case 'loading':
      submitButton.disabled = true;
      break;
    case 'success':
      submitButton.disabled = false;
      input.classList.remove('is-invalid');
      rssForm.reset();
      break;
    case 'fault':
      submitButton.disabled = false;
      input.classList.add('is-invalid');
      break;
    default:
      break;
  }
  input.focus();
};

const renderErrors = (state, i18nextInstance) => {
  const errorField = document.querySelector('.feedback');
  errorField.innerHTML = state.rssForm.errors ? i18nextInstance.t(`errors.${state.rssForm.errors}`) : null;
};

const watcher = (state, i18nextInstance) => onChange(state, (path) => {
  switch (path) {
    case 'rssForm.processState':
      renderProcessState(state);
      break;
    case 'rssForm.errors':
      renderErrors(state, i18nextInstance);
      break;
    default:
      break;
  }
});

export default watcher;
