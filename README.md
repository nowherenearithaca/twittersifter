# Twitter Sifter

This is a simple node app for watching and hearing tweets.

<img src="https://github.com/nowherenearithaca/twittersifter/blob/master/twittersifter_screenshot.png" width="500px">

## Setting things up


1\.     **Make sure you have `node` installed for your operating system - you can get it from https://nodejs.org/en/download/ **

1\.     **With `npm` (which is installed with `node`), install bower and grunt: **

 `npm install -g bower`

 `npm install -g grunt-cli`


1\. 	**Download the needed node/bower components (these will take a few minutes to complete):**

 `npm install`

 `bower install`

2\. 	**Create config.js**

Create a file `config.js` in the main directory that contains your twitter keys:
```javascript
  module.exports = {
     "consumer_secret": "your-twitter-consumer-secret",
     "consumer_key": "your-twitter-consumer-key",
     "access_token": "your-twitter-access-token",
     "access_token_secret": "your-twitter-access-secret"
   };
```
You can get these by creating an "app" at twitter at https://apps.twitter.com/

Don't commit `config.js` to a public repository!


3\. **Build the web app side of things**

`grunt`

Do this any time you modify files in the public directory.

It puts everything needed for the web side in `public_dist` (creating `public_dist` if necessary).

4\. **Start the server portion**

In a command window, start the server portion (this particular example will catch tweets that contain "hello" or "hi"):

`node twittersifter.js --track hello,hi`

5\. **Watch and Listen to Tweets**

Open a browser using web address http://localhost:8080

By default, the tweets are "colorified" based on how BeeLine does this - this simply gradually changes the color of each character from red to black to blue to black to red.  This may improve readability for fast-moving text, but other options need to be explored (for example, maybe color parts of speech certain ways).  This can be disabled in the current settings.


## "Interesting" Tweets

This currently uses Cynthia Whissel's "dictionary with imagery", where words were assigned
 pleasantness, activation, and imagery scores.
 This dictionary is used here with perission of C. Whissel.
  Commercial use of this dictionary is not permitted.  Check with 
	C. Whissel at cwhissell@laurentian.ca regarding such uses of her dictionary.

If you want to try different approaches for what "interesting" means, just tweak the 
method `ponderTweet` in the file `pondertweeets.js`.  This is a web worker that is passed the tweet content
for every tweet received, and can send those tweets it finds "interesting" back to the main page via the 
method `sendBackInterestingTweet`.

