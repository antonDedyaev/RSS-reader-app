const pullNewFeeds = (url) => {
  const uniqueFeedUrl = new URL('https://allorigins.hexlet.app/get');
  uniqueFeedUrl.searchParams.set('disableCache', 'true');
  uniqueFeedUrl.searchParams.set('url', url);
  return uniqueFeedUrl;
};

const parseRss = (content) => {
  const feedDom = new DOMParser().parseFromString(content, 'application/xml');
  if (feedDom.querySelector('parsererror')) {
    const error = new Error();
    error.message = 'noValidRss';
    throw error;
  }
  console.log(feedDom);

  const title = feedDom.querySelector('title').textContent;
  const description = feedDom.querySelector('description').textContent;
  const feed = {
    title,
    description,
  };

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

export { pullNewFeeds, parseRss };
