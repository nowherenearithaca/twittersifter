# Twitter Sifter

This is a simple node app for watching and hearing tweets.

![alt text](https://github.com/nowherenearithaca/twittersifter/blob/master/Screen%20Shot%202016-10-14%20at%201.07.20%20AM.png "Twitter Sifter Screenshot")




## Setting things up

### Download the needed node/bower components

`node install`

`bower install`

### Create config.js

Create a file config.js in the main directory that contains your twitter keys:

```javascript
  module.exports = {
     "consumer_secret": "your-twitter-consumer-secret",
     "consumer_key": "your-twitter-consumer-key",
     "access_token": "your-twitter-access-token",
     "access_token_secret": "your-twitter-access-secret"
   };
```
You can get these by creating an "app" at twitter at https://apps.twitter.com/

### Build the web app side of things

`grunt`

Do this any time you modify files in the public directory.

### Start the server portion

In a command window, start the server portion (this particular example will catch tweets that contain "hello" or "hi"):

`node twittersifter.js --doStream --track hello,hi`

### Watch and Listen to Tweets

Open a browser using web address http://localhost:8080

By default, the tweets are "colorified" based on how BeeLine does this - this simply gradually changes the color of each character
from red to black to blue to black to blue.  This may improve readability for fast-moving text, but other options
need to be explored (for example, maybe color parts of speech certain ways).  This can be disabled in the current settings.


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

