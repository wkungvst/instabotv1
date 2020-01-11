import { CommentPost } from 'src/common/interfaces';

const commentPost: CommentPost = async function commentPost(page, post, message) {
  await page.click(post.commentButtonSelector);
  await page.waitForSelector(post.commentSelector);
  await page.waitFor(1000);
  await page.type(post.commentSelector, message, {delay:10});
  await page.waitFor(1000);
  await page.waitForSelector(post.commentSelector);
  await page.keyboard.press('Enter');
  await page.waitFor(1000);
  console.log('commented post.');
  return page;
};

export { commentPost };
