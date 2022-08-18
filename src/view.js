const renderForm = (state) => {
  const rssForm = document.querySelector('.rss-form');
  const input = document.getElementById('url-input');
  if (state.rssForm.valid) {
    input.classList.remove('is-invalid');
    rssForm.reset();
  } else {
    input.classList.add('is-invalid');
  }
  rssForm.focus();
};

export default renderForm;
