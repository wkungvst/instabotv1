import { LikePost } from 'src/common/interfaces';

const likePost: LikePost = async function likePost(page, post) {
  if (post.isLiked) {
    return page;
  }
    await page.waitFor(2000);
  await page.click(post.likeSelector);
  await page.waitFor(2000);
 // await page.waitForSelector(post.unlikeSelector);
  return page;
};

export { likePost };
