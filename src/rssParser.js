const getProxiedUrl = (url) => {
  const uniqueFeedUrl = new URL('https://allorigins.hexlet.app/get');
  uniqueFeedUrl.searchParams.set('disableCache', 'true');
  uniqueFeedUrl.searchParams.set('url', url);
  return uniqueFeedUrl;
};

const parseRss = (content, url = null) => {
  const feedDom = new DOMParser().parseFromString(content, 'application/xml');
  const parserError = feedDom.querySelector('parsererror');
  if (parserError) {
    const error = new Error(parserError.textContent);
    error.name = 'parsingError';
    error.message = 'noValidRssContained';
    throw error;
  }

  const title = feedDom.querySelector('title').textContent;
  const description = feedDom.querySelector('description').textContent;
  const feed = { title, description, url };

  const items = feedDom.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const postDescription = item.querySelector('description').textContent;
    return {
      title: postTitle,
      link: postLink,
      description: postDescription,
    };
  });
  return { feed, posts };
};

export { getProxiedUrl, parseRss };
