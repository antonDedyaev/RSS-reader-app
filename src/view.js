import onChange from 'on-change';

const renderProcessState = (state, i18nextInstance) => {
  const rssForm = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');
  const submitButton = document.querySelector('.px-sm-5');
  const feedBack = document.querySelector('.feedback');

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
      feedBack.classList.remove('text-danger');
      feedBack.classList.add('text-success');
      feedBack.innerHTML = i18nextInstance.t('uIElements.successMessage');
      rssForm.reset();
      break;
    case 'fault':
      submitButton.disabled = false;
      input.classList.add('is-invalid');
      feedBack.classList.remove('text-success');
      feedBack.classList.add('text-danger');
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

const renderFeeds = (state, i18nextInstance) => {
  const container = document.querySelector('.feeds');
  container.innerHTML = '';
  const feedDiv = document.createElement('div');
  feedDiv.classList.add('card', 'border-0');
  const feedDivBody = document.createElement('div');
  feedDivBody.classList.add('card-body');
  const feedHeader = document.createElement('h2');
  feedHeader.classList.add('card-title', 'h4');
  feedHeader.innerHTML = i18nextInstance.t('uIElements.feedTitle');
  feedDivBody.append(feedHeader);

  const feedUl = document.createElement('ul');
  feedUl.classList.add('list-group', 'border-0', 'rounded-0');

  state.feeds.forEach((feed) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    const liTitle = document.createElement('h3');
    liTitle.classList.add('h6', 'm-0');
    liTitle.innerHTML = feed.title;
    const liDescription = document.createElement('p');
    liDescription.classList.add('m-0', 'small', 'text-black-50');
    liDescription.innerHTML = feed.description;
    liEl.append(liTitle, liDescription);
    feedUl.append(liEl);
  });
  feedDiv.append(feedDivBody, feedUl);
  container.append(feedDiv);
};

const renderPosts = (state, i18nextInstance) => {
  const container = document.querySelector('.posts');
  container.innerHTML = '';
  const postDiv = document.createElement('div');
  postDiv.classList.add('card', 'border-0');
  const postDivBody = document.createElement('div');
  postDivBody.classList.add('card-body');
  const postHeader = document.createElement('h2');
  postHeader.classList.add('card-title', 'h4');
  postHeader.innerHTML = i18nextInstance.t('uIElements.postTitle');
  postDivBody.append(postHeader);

  const postUl = document.createElement('ul');
  postUl.classList.add('list-group', 'border-0', 'rounded-0');

  state.posts.forEach((post) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const aEl = document.createElement('a');
    aEl.classList.add('fw-bold');
    aEl.setAttribute('href', post.link);
    aEl.setAttribute('data-id', post.iD);
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.innerHTML = post.title;

    const viewButton = document.createElement('button');
    viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    viewButton.setAttribute('type', 'button');
    viewButton.setAttribute('data-id', post.iD);
    viewButton.setAttribute('data-bs-toggle', 'modal');
    viewButton.setAttribute('data-bs-target', '#modal');
    viewButton.innerHTML = i18nextInstance.t('uIElements.viewButton');
    liEl.append(aEl, viewButton);
    postUl.append(liEl);
  });
  postDiv.append(postDivBody, postUl);
  container.append(postDiv);
};

const watcher = (state, i18nextInstance) => onChange(state, (path) => {
  switch (path) {
    case 'rssForm.processState':
      renderProcessState(state, i18nextInstance);
      break;
    case 'rssForm.errors':
      renderErrors(state, i18nextInstance);
      break;
    case 'feeds':
      renderFeeds(state, i18nextInstance);
      break;
    case 'posts':
      renderPosts(state, i18nextInstance);
      break;
    default:
      break;
  }
});

export default watcher;
