import 'module-alias/register';
import * as dotenv from 'dotenv';
import { reduceAsync, getRandomItem, probability } from 'src/common/utils';
import { settings as SETTINGS, job as jobConfig, auth as authConfig, authMultiple as authList, bundles as bundle } from 'src/config';
import { struct as structure} from 'src/commentSpinner';
import { createBrowser } from 'src/common/browser';
import { schedule, jobs } from 'src/common/scheduler';
dotenv.config();

const NUMBER_OF_POSTS_PER_HASHTAG = 3;
const IG_ACTION_LIKE = 1;
const IG_ACTION_FOLLOW = 2;
const IG_ACTION_COMMENT = 3;

// these three values should add up to 100 (%). "80" means 80% frequency for a given IG action. 
const IG_ACTION_COMMENT_FREQUENCY = 80;
const IG_ACTION_FOLLOW_FREQUENCY = 10;
const IG_ACTION_LIKE_FREQUENCY = 10;

var cronscheduler = require('node-schedule');

/* this is the main function that performs the bulk of operations - login, find posts, perform comment/follow/like action, etc 

*/
function run(){
  console.log('number of accounts ' + bundle.length);
  (async () => {

    for(var i=0;i<bundle.length;i++){
      var spinnerComment = getCommentFromSpinner();
      console.log(getTimestamp());
      console.log("get Spinner Comment: " + spinnerComment);

      try {
          var login = {username: "",  password: ""};
          login.username = bundle[i].username;
          login.password = bundle[i].password;
          const browser = await createBrowser();
          await browser.authenticate(login);
          console.log('browser authenticated. start scheduling');

          try {
              const hashtag = getRandomItem(jobConfig.hashtags);
              const postsUrls = await browser.findPosts(hashtag, NUMBER_OF_POSTS_PER_HASHTAG);
              console.log('found post urls');
              await reduceAsync<string, void>(
                postsUrls,
                async (prev, url) =>
                  browser.getPage(url, async page => {
                    try {
                      const post = await browser.getPostInfo(page);

                      // randomizing IG action
                      var action = pickIGAction();
                      // ADD COMMENT
                      if(action == IG_ACTION_COMMENT){ 
                        var message = getCommentFromSpinner();
                        await browser.commentPost(page, post, message);
                      }
                      // LIKE POST
                      else if(action == IG_ACTION_LIKE){
                        await browser.likePost(page, post);
                      }
                      // FOLLOW USER
                      else if(action == IG_ACTION_FOLLOW){

                      }
                    } catch (e) {
                      console.log('Failed to like/follow/comment.');
                      console.log(e);
                    }
                  }),
                35,
              );
              console.log('job executed successfully.');
            } catch (e) {   
              console.log('FollowJob failed to execute.');
              console.log(e);
            }
          browser.close();
        } catch (e) {
          console.log(e);
        }
    }
  })();
}
   
function pickIGAction(){
  // default - 80% comments, 10% likes, 10% follows
  var random = Math.floor(Math.random() * 100);
  console.log(getTimestamp());
  if(random <= IG_ACTION_COMMENT_FREQUENCY){
    console.log("selected IG action: comment");
    return IG_ACTION_COMMENT;
  }else if(random <= (IG_ACTION_COMMENT_FREQUENCY + IG_ACTION_FOLLOW_FREQUENCY)){
    console.log("selected IG action: follow");
    return IG_ACTION_FOLLOW;
  }else{
    console.log("selected IG action: like");
    return IG_ACTION_LIKE;
  }
}

function getCommentFromSpinner(){
  var completeComment = "";
  var struct = structure.commentStructure;
  for(var i =0;i<struct.length;i++){
    var type = struct[i].charAt(0);
    var index = struct[i].charAt(1);
    if(type == "x"){ // choose a spinner variable
      completeComment += pickRandomString(structure[struct[i]]) + " ";
    }else if(type == "s"){ // use static constant
      completeComment += structure[struct[i]] + " ";
    }
  }
  return completeComment;
}

// choose a random string from array 
function pickRandomString(list){
  var index = Math.floor(Math.random()*list.length);
  return list[index];
}

function chronSetup(){
  console.log('setting up chron scheduler.');
  console.log(getTimestamp());
  // for(var i = 0;i<50;i++){
  //   console.log(getCommentFromSpinner());
  // }

  cronscheduler.scheduleJob('*/30 * * * * *', function(){
    console.log(getTimestamp() + 'TEST chron scheduler: run main block');
    run();
  });

  cronscheduler.scheduleJob('* * * * * *', function(){

  });

  //runs every day, on the first minute of each hour. runs from 12-8, cool off from 9-12, runs again from 12 to 8, then off from 9-12. 
  // cronscheduler.scheduleJob('1 1 0-8,12-20 * * *', function(){
  //   console.log(getTimestamp() + 'chron scheduler: run main block');
  //   //console.log("chosen action: " + pickIGAction());
  //   run();
  // });
}

function getTimestamp(){
  var currentdate = new Date(); 
  var timestamp = "TIMESTAMP: " + (currentdate.getMonth()+1) + "/"
                + currentdate.getDate() + "/"
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

  return timestamp;
}

// run this function to start the bot
chronSetup();





