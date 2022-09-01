import onChange from 'on-change';

const modalHandler = (e, post) => {
  e.preventDefault();
  const modalHeader = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const modalArticle = document.querySelector('.full-article');
  modalHeader.innerHTML = post.title;
  modalBody.innerHTML = post.description;
  modalArticle.href = post.link;
};

const buildContainerBody = (i18nextInstance, i18text, listElements) => {
  const mainDiv = document.createElement('div');
  mainDiv.classList.add('card', 'border-0');
  const mainDivBody = document.createElement('div');
  mainDivBody.classList.add('card-body');
  const mainDivHeader = document.createElement('h2');
  mainDivHeader.classList.add('card-title', 'h4');
  mainDivHeader.innerHTML = i18nextInstance.t(i18text);
  mainDivBody.append(mainDivHeader);
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  ulEl.replaceChildren(...listElements);
  mainDiv.append(mainDivBody, ulEl);
  return mainDiv;
};

const renderProcessState = (status, i18nextInstance) => {
  const rssForm = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');
  const submitButton = document.querySelector('.px-sm-5');
  const feedBack = document.querySelector('.feedback');

  switch (status) {
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
      throw new Error(`Unknown process state: ${status}`);
  }
  input.focus();
};

const renderErrors = (errors, i18nextInstance) => {
  const errorField = document.querySelector('.feedback');
  errorField.innerHTML = errors ? i18nextInstance.t(`errors.${errors}`) : null;
};

const renderFeeds = (feeds, i18nextInstance) => {
  const container = document.querySelector('.feeds');
  container.innerHTML = '';

  const feedList = feeds.map((feed) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    const liTitle = document.createElement('h3');
    liTitle.classList.add('h6', 'm-0');
    liTitle.innerHTML = feed.title;
    const liDescription = document.createElement('p');
    liDescription.classList.add('m-0', 'small', 'text-black-50');
    liDescription.innerHTML = feed.description;
    liEl.append(liTitle, liDescription);
    return liEl;
  });
  const containerBody = buildContainerBody(i18nextInstance, 'uIElements.feedTitle', feedList);
  container.append(containerBody);
};

const renderPosts = (state, i18nextInstance) => {
  const container = document.querySelector('.posts');
  container.innerHTML = '';

  const postList = state.posts.map((post) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const aEl = document.createElement('a');
    aEl.setAttribute('href', post.link);
    aEl.classList.add(state.viewedPosts.includes(post.id) ? ('fw-normal', 'link-secondary') : ('fw-bold'));
    aEl.setAttribute('data-id', post.id);
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.innerHTML = post.title;

    const viewButton = document.createElement('button');
    viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    viewButton.setAttribute('type', 'button');
    viewButton.setAttribute('data-id', post.id);
    viewButton.setAttribute('data-bs-toggle', 'modal');
    viewButton.setAttribute('data-bs-target', '#modal');
    viewButton.innerHTML = i18nextInstance.t('uIElements.viewButton');
    viewButton.addEventListener('click', (e) => modalHandler(e, post));
    liEl.append(aEl, viewButton);
    return liEl;
  });
  const containerBody = buildContainerBody(i18nextInstance, 'uIElements.postTitle', postList);
  container.append(containerBody);
};

const renderViewedPosts = (viewedPosts) => {
  viewedPosts.forEach((id) => {
    const viewedEl = document.querySelector(`[data-id="${id}"]`);
    viewedEl.classList.remove('fw-bold');
    viewedEl.classList.add('fw-normal', 'link-secondary');
  });
};

const watcher = (state, i18nextInstance) => onChange(state, (path) => {
  switch (path) {
    case 'rssForm.processState':
      renderProcessState(state.rssForm.processState, i18nextInstance);
      break;
    case 'rssForm.errors':
      renderErrors(state.rssForm.errors, i18nextInstance);
      break;
    case 'feeds':
      renderFeeds(state.feeds, i18nextInstance);
      break;
    case 'posts':
      renderPosts(state, i18nextInstance);
      break;
    case 'viewedPosts':
      renderViewedPosts(state.viewedPosts);
      break;
    default:
      throw new Error(`Unknown path: ${path}`);
  }
});

export default watcher;
