import { CommentPost } from 'src/common/interfaces';

const commentPost: CommentPost = async function commentPost(page, post, message) {
  await page.click(post.commentButtonSelector);
  await page.waitForSelector(post.commentSelector);
  await page.waitFor(getRandomDelayMS());
  await page.type(post.commentSelector, message, {delay:50});
  await page.waitFor(getRandomDelayMS());
  await page.waitForSelector(post.commentSelector);
  await page.keyboard.press('Enter');
  await page.waitFor(getRandomDelayMS());
  console.log('commented post.'); 
  return page;
};


function getRandomDelayMS(){
	var random = Math.floor(Math.random() * 10000);
	console.log('random: ' + random);
	return random;
}

export { commentPost };
