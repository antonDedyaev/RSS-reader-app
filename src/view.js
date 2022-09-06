/* eslint-disable no-param-reassign */
import onChange from 'on-change';

const modalHandler = (e, post) => {
  e.preventDefault();
  const modalHeader = document.querySelector('.modal-title');
  const modalBody = document.querySelector('.modal-body');
  const modalArticle = document.querySelector('.full-article');
  modalHeader.textContent = post.title;
  modalBody.textContent = post.description;
  modalArticle.href = post.link;
};

const buildContainerBody = (i18nextInstance, i18text, listElements) => {
  const mainDiv = document.createElement('div');
  mainDiv.classList.add('card', 'border-0');
  const mainDivBody = document.createElement('div');
  mainDivBody.classList.add('card-body');
  const mainDivHeader = document.createElement('h2');
  mainDivHeader.classList.add('card-title', 'h4');
  mainDivHeader.textContent = i18nextInstance.t(i18text);
  mainDivBody.append(mainDivHeader);
  const ulEl = document.createElement('ul');
  ulEl.classList.add('list-group', 'border-0', 'rounded-0');
  ulEl.replaceChildren(...listElements);
  mainDiv.append(mainDivBody, ulEl);
  return mainDiv;
};

const renderProcessState = (elements, status, i18nextInstance) => {
  switch (status) {
    case 'filling':
      elements.submitButton.disabled = false;
      elements.input.classList.remove('is-invalid');
      break;
    case 'loading':
      elements.submitButton.disabled = true;
      break;
    case 'success':
      elements.submitButton.disabled = false;
      elements.input.classList.remove('is-invalid');
      elements.feedBack.classList.remove('text-danger');
      elements.feedBack.classList.add('text-success');
      elements.feedBack.textContent = i18nextInstance.t('uiElements.successMessage');
      elements.rssForm.reset();
      break;
    case 'fault':
      elements.submitButton.disabled = false;
      elements.input.classList.add('is-invalid');
      elements.feedBack.classList.remove('text-success');
      elements.feedBack.classList.add('text-danger');
      break;
    default: throw new Error(`Unknown process state: ${status}`);
  }
  elements.input.focus();
};

const renderErrors = (elements, errors, i18nextInstance) => {
  elements.feedBack.textContent = errors ? i18nextInstance.t(`errors.${errors}`) : null;
};

const renderFeeds = (elements, feeds, i18nextInstance) => {
  elements.feedsContainer.textContent = '';

  const feedList = feeds.map((feed) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    const liTitle = document.createElement('h3');
    liTitle.classList.add('h6', 'm-0');
    liTitle.textContent = feed.title;
    const liDescription = document.createElement('p');
    liDescription.classList.add('m-0', 'small', 'text-black-50');
    liDescription.textContent = feed.description;
    liEl.append(liTitle, liDescription);
    return liEl;
  });
  const containerBody = buildContainerBody(i18nextInstance, 'uiElements.feedTitle', feedList);
  elements.feedsContainer.append(containerBody);
};

const renderPosts = (elements, state, i18nextInstance) => {
  elements.postsContainer.textContent = '';

  const postList = state.posts.map((post) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const aEl = document.createElement('a');
    aEl.setAttribute('href', post.link);
    aEl.classList.add(state.uiState.viewedPosts.includes(post.id) ? ('fw-normal', 'link-secondary') : ('fw-bold'));
    aEl.setAttribute('data-id', post.id);
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.textContent = post.title;

    const viewButton = document.createElement('button');
    viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    viewButton.setAttribute('type', 'button');
    viewButton.setAttribute('data-id', post.id);
    viewButton.setAttribute('data-bs-toggle', 'modal');
    viewButton.setAttribute('data-bs-target', '#modal');
    viewButton.textContent = i18nextInstance.t('uiElements.viewButton');
    viewButton.addEventListener('click', (e) => modalHandler(e, post));
    liEl.append(aEl, viewButton);
    return liEl;
  });
  const containerBody = buildContainerBody(i18nextInstance, 'uiElements.postTitle', postList);
  elements.postsContainer.append(containerBody);
};

const renderViewedPosts = (viewedPosts) => {
  viewedPosts.forEach((id) => {
    const viewedEl = document.querySelector(`[data-id="${id}"]`);
    viewedEl.classList.remove('fw-bold');
    viewedEl.classList.add('fw-normal', 'link-secondary');
  });
};

const watcher = (elements, state, i18nextInstance) => onChange(state, (path) => {
  switch (path) {
    case 'processState':
      renderProcessState(elements, state.processState, i18nextInstance);
      break;
    case 'rssForm.errors':
      renderErrors(elements, state.rssForm.errors, i18nextInstance);
      break;
    case 'feeds':
      renderFeeds(elements, state.feeds, i18nextInstance);
      break;
    case 'posts':
      renderPosts(elements, state, i18nextInstance);
      break;
    case 'uiState.viewedPosts':
      renderViewedPosts(state.uiState.viewedPosts);
      break;
    default: throw new Error(`Unknown path: ${path}`);
  }
});

export default watcher;
