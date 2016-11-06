

//ugh - the problem with letting client side change it is that you can quickly get rate limited
//      where twitter waits a minute before sending tweets again... 

//Basic usage:
// node twittersifter.js --doStream --sayIt --track hello
// separate different terms with commas

//All tweets that match the terms are sent to the client.
//It's up to the client to decide what's "interesting" or not


if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

function getRandomInt(min, max, rnd) {
  rnd = rnd || Math.random;
  return Math.floor(rnd() * (max - min + 1)) + min;
}

function stringContainsOneOfTheseTerms(s, terms) {
  var i;

  s = s.toLowerCase();
  for (i=0;i<terms.length;i++) {
    if (s.indexOf(terms[i]) > -1) {
      return true;
    }
  }
  return false;

}

function isDefined(x) {
  return typeof x !== 'undefined';
}


// testing using everything related to NFL
// use "allnfl" as tracking to get all of this
function getAllNFLTracking() {

  var s = "nfl";
  s += "," + "officials";
  s += "," + "refs";
  s += "," + "packers";
  s += "," + "greenbay";
  s += "," + "cowboys";
  s += "," + "redskin";
  s += "," + "eagles";
  s += "," + "giants";
  s += "," + "cardinals";

  s += "," + "steelers";
  s += "," + "titans";
  s += "," + "chargers";
  s += "," + "vikings";
  s += "," + "jets";
  s += "," + "raiders";

  s += "," + "dolphins";
  s += "," + "falcons";
  s += "," + "texans";

  s += "," + "rams";

  s += "," + "bears";

  s += "," + "chiefs";

  s += "," + "carolina";
  s += "," + "patriots";

  s += "," + "seahawks";

  s += "," + "49ers";

  s += "," + "broncos";

  s += "," + "ravens";

  s += "," + "bills";

  s += "," + "panthers";

  s += "," + "lions";

  s += "," + "colts";

  s += "," + "browns";

  s += "," + "jaguars";

  s += "," + "saints";

  s += "," + "bengals";
  s += "," + "tampa bay";
  s += "," + "buccaneers";

  return s;

}


function cleanTweet(text) {
  //remove line breaks
  return text.replace(/(\r\n|\n|\r)/gm,"");
}


 function makeTweetMoreConversational(tweet) {

    var urlRegex = /(https?:\/\/[^\s]+)/g;
    //var regexpHashtag = new RegExp('#([^\\s]*)','g');
    var regexpHashtag = new RegExp('#','g');
    //var regexpAt = new RegExp('@([^\\s]*)','g');

    var regexpAt = new RegExp('@','g');

    var regexpAmp = new RegExp('&amp;','g');
    var regexpGt = new RegExp('&gt;','g');
    var regexpLt = new RegExp('&lt;','g');
    var regexpRT = new RegExp(' RT ;','g');
    
    var s = tweet.text.replace(urlRegex,'');
    //s = s.replace(regexpHashtag,'hashtag ');
    s = s.replace(regexpHashtag,'');
    s = s.replace(regexpRT,' retweet ');
    //s = s.replace(regexpAt,'at ');
    //s = s.replace(regexpAt,'to ');
    s = s.replace(regexpAt,'');
    s = s.replace(regexpAmp,'&');
    s = s.replace(regexpGt,'>');
    s = s.replace(regexpLt,'<');

    s = sms.statement(s);
  
    return s;

  }


//**********************************************

var retext = require('retext');
//not used anymore... var inspect = require('unist-util-inspect');
var sentiment = require('retext-sentiment');

//this one should be better
//var NLP = require('stanford-corenlp');

//var config = {"nlpPath":"./corenlp","version":"3.4"};
var path = require('path');
//console.log(path.join ( __dirname,'./stanford-corenlp-full-2015-04-20'));

// I played with this a little - might return to it eventually
// var config = {

// 	'nlpPath':path.join ( __dirname,'./stanford-corenlp-full-2015-04-20'), //the path of corenlp
// 	'version':'3.5.2', //what version of corenlp are you using
// 	'annotators': ['tokenize','ssplit','pos','parse','sentiment','depparse','quote'], //optional!
// 	'extra' : {
//       'depparse.extradependencie': 'MAXIMAL'
//     }

// };

//Old note:
  //issue with java stuff atm and weird error installing "java" module ld: library not found for -lgcc_s.10.5
  //hitting memory error thing to deal with - I think it's worth figuring out... 
  //var coreNLP = new NLP.StanfordNLP(config);
  //wait - do I even need java npm?  stanford thing has its own thing for it

  //coreNLP.loadPipelineSync(); //this was overwriting my options defined above...
  // coreNLP.process('This is so good.', function(err, result) {
  //   console.log(err,JSON.stringify(result,null));
  // });

var say = require('say');
var SmsLingo = require('smslingo');
var sms = new SmsLingo();
var argv = require('yargs').argv;


//The file config.js should be of this form
// Include your access information below
// module.exports = {
//   "consumer_secret": "your-twitter-consumer-secret",
//   "consumer_key": "your-twitter-consumer-key",
//   "access_token": "your-twitter-access-token",
//   "access_token_secret": "your-twitter-access-secret"
// };
var config = require('./config.js');

var Twit = require('twit')
var T = new Twit(config);

//Set up the speaking voices on the server side
  var voices = [];
  //voices.push('Agnes'); //a little unpleasant
  //voices.push('Kathy');
  //not nice voices.push('Princess');
  //voices.push('Vicki');
  voices.push('Victoria'); //eastern europish
  //voices.push('Albert');
  voices.push('Alex');
  voices.push('Fred');
  voices.push('Junior');
  //voices.push('Bruce');
  //voices.push('Ralph');

function getRandomVoice() {
  var index = getRandomInt(0,voices.length-1);
  return voices[index];
}


//see about mixing in the user's home timeline
  //NOTE - doesn't seem as straightforward here...
  // T.get("https://api.twitter.com/1.1/statuses/home_timeline.json",config,function (err, data, response) {
  //   console.log(err);
  //   console.log(data);
  //   console.log(response);
  // })


  //used this once to see the full thing returned from the streaming api var haveLoggedFull = false;

  var track = argv.track || "happy birthday"; // default is just something to always get results

  if (track==="allnfl") {
    track = getAllNFLTracking();
  }

  var requiredThings;
  var ignoredThings;
  var trackedThingsArrayStructure;

  //TODO get rid of the side-effect changes
  function getTrackToSendToTwitter(trackStringCommaDelimited) {

    var things = trackStringCommaDelimited.split(',')
                          .filter(function (t){return t.trim().length>0;})
                          .map(function(t) {return {term:t, results:[]}}); //


    requiredThings = things.filter(function(t) {return t.term.length>1 && t.term.startsWith("+");})
                              .map(function(t) {return t.term.toLowerCase().slice(1);});

    ignoredThings = things.filter(function(t) {return t.term.length>1 && t.term.startsWith("-");})
                              .map(function(t) {return t.term.toLowerCase().slice(1);});

  
    trackedThingsArrayStructure = things.filter(function(t) {return !t.term.startsWith("-");});

    return trackedThingsArrayStructure.map(function(t) {return t.term;})
                          .join(","); //put back together the things we want...

  }

  //some more initial set up
  var trackStringForTwitter = getTrackToSendToTwitter(track);
  var streamToTwitter;
  var timeStart_ms = (new Date()).getTime();
  var lastTweet_ms = timeStart_ms;

  var gTweetsSinceLastSay = 0;

  var logTweetsToConsole = false;
  if (argv.doLogTweet) {
    logTweetsToConsole=true;
  }

  //This is if you want it to tweet every now and then with a summary of
  //  the sentiment for the search terms
  var gDoTweet = argv.doTweet;
  
  //This is if you want the server side to speak the tweets
  //I was doing this before I had the browser do it, but can 
  //  be useful if you don't care about the browser side.
  var sayIt = argv.sayIt;
  var gLastSayIt_ms = 0;
  var gSayItMinDifference_ms = 1000 * 10;
  var gSayItMaxDifference_ms = 2 * gSayItMinDifference_ms;
  var currentlySpeaking = false;

  function startStream( trackedThingsForTwitterAPI) {

      console.log("starting to get tweets - " + trackedThingsForTwitterAPI);

      var streamToTwitter = T.stream('statuses/filter', { track: trackedThingsForTwitterAPI, language: 'en' });

      //console.log("setting up stream to process tweets");
      streamToTwitter.on('tweet', function (tweet) {
    //     if (!haveLoggedFull) {
    //       console.log(tweet)
    //       haveLoggedFull = true;
    //     }
        //console.log("about to call process tweet");
        //console.log(trackedThingsForTwitterAPI.split(","));
        processTweet({tweet:tweet, trackedThings: trackedThingsForTwitterAPI, 
                        trackedThingsArray:trackedThingsArrayStructure,
                        retweets:false, //whether we include retweets in calculating things at the moment
                        sayIt: sayIt});
        //console.log(tweet.user.name + "\t "+ tweet.user.screen_name + "\t " + tweet.created_at + "\t" + tweet.text);
    //    console.log(tweet.user.name + "\t "+ tweet.user.screen_name + "\t " + tweet.text);
      });

      streamToTwitter.on('limit', function (limitMessage) {
        //this is an info thing that twitter did not provide all of the tweets
        // { limit: { track: 8, timestamp_ms: '1478354620889' } }
        // not logging this to console... console.log("Limit",limitMessage);
      });

      streamToTwitter.on('reconnect', function (request, response, connectInterval) {
          //...
          if (response.statusCode === 420) {
            //twitter says to "Enhance your calm" and back off
            sendStatusMessageToClients("Hold on - twitter is now rate limiting - must wait before reconnecting again...")
          }
      });

      streamToTwitter.on('connected', function (request, response, connectInterval) {
            sendStatusMessageToClients("Connected to twitter api...")
      });

    return streamToTwitter;

  }

  function sendStatusMessageToClients(msg) {

    console.log("sendStatusMessageToClients: " + msg);

    for (var clientId in clientsStatusInfo) {

          // data: {\n
          // data: "msg": "hello world",\n
          // data: "id": 12345\n
          // data: }\n\n

          //timestamp_ms: '1445085128691'

          clientsStatusInfo[clientId].write('data: ' + '{\n' +
                                  'data: "message": "'+ msg + '" \n' +
                                  'data: }\n\n'); // <- Push a message to a single attached client
        };


          // clients[clientId].write('data: ' + '{\n' +
          //                         'data: "text": "'+ encodeURIComponent(cleanedTweet) + '", \n' +
          //                         'data: "didSayIt":' + tweet.didSayIt + ',\n' +
          //                         'data: "timestamp_ms":' + tweet.timestamp_ms + ',\n' +
          //                         'data: "valence":"' + cst.data.valence + '",\n' +
          //                         'data: "polarity":' + cst.data.polarity + ',\n' +
          //                         'data: "id_str":"' + tweet.id_str + '",\n' +
          //                         'data: "user_name": "' + encodeURIComponent(user.name) + '", \n' +
          //                         'data: "user_screen_name": "' + encodeURIComponent(user.screen_name) + '", \n' +
          //                         'data: "followers":"' + user.followers_count + '",\n' +
          //                         'data: "verified" :'+ user.verified + ',\n' +
          //                         'data: "tweets_per_day":"' + tweetsPerDay + '",\n' +
          //                         'data: "numberWordsInTweet":"' + numberWordsInTweet + '",\n' +
          //                         'data: "tweets_since":"' + ((1+userCreatedDate.getMonth()) + "/" + userCreatedDate.getFullYear() ) + '"\n' +
          //                         'data: }\n\n'); // <- Push a message to a single attached client



  }

  //This is the initial startup 
  var streamToTwitter = startStream(trackStringForTwitter);
  //T.stream('statuses/filter', { track: trackStringForTwitter, language: 'en' });
  //startStream(streamToTwitter, trackStringForTwitter); //track);

  //every minute or so, tweet something eventually
  function doSummarySoFar() {

    return; //return to this after other stuff cleaned up

//     var now = (new Date());
//     var now_ms = now.getTime(); 

//     var timeForAverage_ms = 1000*60*2; 

//     //do running average last N
//     var current = trackStringForTwitter.split(",").slice();
//     current.forEach(function(t) {
//       var sum = 0;
//       var numberTerms = 0;
//       var avg = 0;
//       //console.log("Length: " + t.results.length);
//       t.results.forEach(function(result) {
//           var p = result.polarity;
//           if (result.time_ms > now_ms - timeForAverage_ms) {
//             if (p !=0) {
//               numberTerms++;
//               sum += p;
//             }
//           }
//           else {
//             //console.log('tweet too old to include');
//           }

//       });
//       if (numberTerms>0) {
//          avg = sum/numberTerms;
//       }

//       //console.log(now + '\t' + t.term + ': ' + avg.toFixed(1) + ' (' + numberTerms + ' tweets included)');

//       if (gDoTweet) {
// //         console.log("DO TWEET");
//         if ( (numberTerms>0) && (now_ms > lastTweet_ms + timeForAverage_ms)) {
           
//            var s = trackedThingsForTwitterAPI + ': Sentiment ' + avg.toFixed(1) + ' (interval ' + (timeForAverage_ms/1000/60).toFixed(1) + ' minutes, ' + numberTerms + ' tweets included)';
//            T.post('statuses/update', { status:s}, function(err, data, response) {
//            console.log("Tweeted info: " + s);
//             //console.log(data)
//           });

//           lastTweet_ms = now_ms;

//         }
//       }

//     });
//     //purge old ones
//     if (trackedThings) {
//       trackedThings.forEach(function(t) {
//           t.results = t.results.filter(function(r) {
//               return r.time_ms > now_ms - timeForAverage_ms;
//           })      
//       })
//     }
//     //console.dir(trackedThings);
//     setTimeout(doSummarySoFar, 10000);
  }

  setTimeout(doSummarySoFar, 10000);

//was doStream if}


//This is the main method that will handle processing a tweet returned from the 
//  streaming api.
function processTweet(opts) {

  //console.log("in processTweet", config.tweet.text);

  var now_ms = (new Date()).getTime();

  var tweet = opts.tweet;
  var tweetLowerCase = opts.tweet.text.toLowerCase();

  if (stringContainsOneOfTheseTerms(tweet.text, ignoredThings)) {
    return; //don't process it...
  } 
  if ((ignoredThings.length>0) && (!stringContainsOneOfTheseTerms(tweet.text, requiredThings))) {
    return; //don't process it...
  } 

  var trackedThingsArray = opts.trackedThingsArray; // = trackedThingsForTwitterAPI; //config.trackedThings;

  //console.log(trackedThingsArray.join(","));

  var user = tweet.user;
  var rt_status = tweet.retweeted_status;

  //make sure it contains at least one of the desired terms
  var sWhiches = [];

  trackedThingsArray.forEach(function(t) {

    if (tweetLowerCase.indexOf(t.term) > -1) {
      sWhiches.push(t); 
    }

  });

  if (   (sWhiches.length===0)
          ||
         (rt_status && (!(config.retweets===true)))
      ) {

      //console.log("sWhiches.length: " + sWhiches.length + " (" + tweet.text + ")");

      return;

  }

  gTweetsSinceLastSay++;

  var rt_user;
  if (rt_status) {
    rt_user = rt_status.user;
  }

  tweet.didSayIt = false;
  if (opts && opts.sayIt && 
        ( 
            ( (!currentlySpeaking)) // && (now_ms > gLastSayIt_ms + gSayItMinDifference_ms))
            ||
                (now_ms > gLastSayIt_ms + gSayItMaxDifference_ms) //in case child process gets stuck                
            )    
        ) {

    tweet.didSayIt = true;
    currentlySpeaking = true;
    gLastSayIt_ms = now_ms; //to prevent others from jumping in

    var urlRegex = /(https?:\/\/[^\s]+)/g;
    //var regexpHashtag = new RegExp('#([^\\s]*)','g');
    var regexpHashtag = new RegExp('#','g');
    //var regexpAt = new RegExp('@([^\\s]*)','g');

    var regexpAt = new RegExp('@','g');

    var regexpAmp = new RegExp('&amp;','g');
    var regexpGt = new RegExp('&gt;','g');
    var regexpLt = new RegExp('&lt;','g');
    var regexpRT = new RegExp(' RT ;','g');
    
    var s = tweet.text.replace(urlRegex,'');
    //s = s.replace(regexpHashtag,'hashtag ');
    s = s.replace(regexpHashtag,'');
    s = s.replace(regexpRT,' retweet ');
    //s = s.replace(regexpAt,'at ');
    //s = s.replace(regexpAt,'to ');
    s = s.replace(regexpAt,'');
    s = s.replace(regexpAmp,'&');
    s = s.replace(regexpGt,'>');
    s = s.replace(regexpLt,'<');

    s = sms.statement(s);

    //Don't say the user screen name - wastes space I think s = 'User ' + user.screen_name + ' - ' + s;

    gLastSayIt_ms = (new Date()).getTime();

    var voice = getRandomVoice();
    console.log('');
    console.log('');
    console.log('Say (' + voice + ', ' + gTweetsSinceLastSay + ' tweets since): ' + 'User ' + user.screen_name + ' - ' + tweet.text);
    gTweetsSinceLastSay=0;
    say.speak(voice, s, function() {
      currentlySpeaking = false;
    });

    console.log('');
    console.log('');
  
  } //if we say it or not on the server side




  //   //console.log('NLP on tweet');
  //   coreNLP.process(makeTweetMoreConversational(tweet), function(err, result) {
  //     //"document":{"sentences":{"sentence":{"$":{"id":"1","sentimentValue":"4","sentiment":"Verypositive"}
  //     //console.log(JSON.stringify(result, null));
  //     var theSentences = result.document.sentences.sentence;
  //     if (Array.isArray(theSentences)) {
  //       //console.dir(theSentences);
  //       var sum = 0;
  //       theSentences.forEach(function(sentence) {
  //         sum += Number(sentence.$.sentimentValue);
  //       })
  //       //console.log(theSentences[0].$.sentimentValue + ' ' + theSentences[0].$.sentiment + ' ' + tweet.text);
  //       console.log((sum/theSentences.length).toFixed(1) + ' ' + tweet.text);
  //     }
  //     else {
  //       console.log(theSentences.$.sentimentValue + ' ' + theSentences.$.sentiment + ' ' + tweet.text);
  //     }
  //   });

  //get sentiment stuff and send stuff to clients
  retext().use(sentiment).use(function () {
    
      return function (cst) {

        var terms = [];

        sWhiches.forEach(function(t) {

          terms.push(t.term);
          t.results.push({time_ms: Number(tweet.timestamp_ms), polarity: cst.data.polarity});

        });

        var userCreatedDate = new Date(user.created_at);
        var userCreatedDate_ms = userCreatedDate.getTime();
        var now_ms = new Date().getTime();

        var daysAgoCreated = ((((now_ms - userCreatedDate_ms)/1000)/3600)/24);
        var tweetsPerDay = user.statuses_count/daysAgoCreated;

        var cleanedTweet = cleanTweet(tweet.text);

        var numberWordsInTweet = tweet.text.split(" ").length;


        if (logTweetsToConsole) {
          console.log((1000*gTweetsSinceLastSay/(0.0000001 + now_ms-gLastSayIt_ms)).toFixed(1) + '\t' + 
                        terms.join(',') + '\t' + cst.data.valence + '(' + cst.data.polarity + ') \t' + 
                        user.screen_name + 
                        '\t'+  
                        ', ' + tweetsPerDay.toFixed(1) + ' tweets/day since ' + (1+userCreatedDate.getMonth()) + "/" + userCreatedDate.getFullYear() +
                        ', ' + user.followers_count + ' followers ' + 
                            //', tweets:'  + user.statuses_count + 
                            //', ' + ('is_quote_status=' + tweet.is_quote_status) + 
                            //', ' + (rt_status ? (rt_status.retweet_count + 'rts - RT ' + rt_status.user.screen_name + ', ' + rt_user.followers_count + ' followers'):'') + 
                            //')' +
                        '\t'+  cleanTweet(tweet.text)
                        );
      }

        for (clientId in clients) {

          // data: {\n
          // data: "msg": "hello world",\n
          // data: "id": 12345\n
          // data: }\n\n

          //timestamp_ms: '1445085128691'

          clients[clientId].write('data: ' + '{\n' +
                                  'data: "text": "'+ encodeURIComponent(cleanedTweet) + '", \n' +
                                  'data: "didSayIt":' + tweet.didSayIt + ',\n' +
                                  'data: "timestamp_ms":' + tweet.timestamp_ms + ',\n' +
                                  'data: "valence":"' + cst.data.valence + '",\n' +
                                  'data: "polarity":' + cst.data.polarity + ',\n' +
                                  'data: "id_str":"' + tweet.id_str + '",\n' +
                                  'data: "user_name": "' + encodeURIComponent(user.name) + '", \n' +
                                  'data: "user_screen_name": "' + encodeURIComponent(user.screen_name) + '", \n' +
                                  'data: "followers":"' + user.followers_count + '",\n' +
                                  'data: "verified" :'+ user.verified + ',\n' +
                                  'data: "tweets_per_day":"' + tweetsPerDay + '",\n' +
                                  'data: "numberWordsInTweet":"' + numberWordsInTweet + '",\n' +
                                  'data: "tweets_since":"' + ((1+userCreatedDate.getMonth()) + "/" + userCreatedDate.getFullYear() ) + '"\n' +
                                  'data: }\n\n'); // <- Push a message to a single attached client
        };

      };
  }).process(tweet.text);

  //   console.log(sWhiches.join(',') + '\t' + user.screen_name + 
  //                 '\t'+  ' (' + user.followers_count + 
  //                     ', ' + user.statuses_count + 
  //                     //', ' + ('is_quote_status=' + tweet.is_quote_status) + 
  //                     ', ' + (rt_status ? (rt_status.retweet_count + 'rts - RT ' + rt_status.user.screen_name + ', ' + rt_user.followers_count + ' followers'):'') + ')' +
  //                 '\t'+  cleanTweet(tweet.text)
  //                 );

  
} //process tweet

////////////////////////////////////////////////////////////////////////////
//Simple app server stuff

var express = require('express');
var app = express();

//app.use(express.static(__dirname + '/public'));
//where web server files loaded from
app.use(express.static(__dirname + '/public_dist'));

// var template = ' \
// <!DOCTYPE html> <html> <body> \
//   <script type="text/javascript"> \
//         var source = new EventSource("/tweets/"); \
//         source.onmessage = function(e) { \
//             document.body.innerHTML += e.data + "<br>"; \
//         }; \
// </script> </body> </html>';

// app.get('/', function(req, res) {
//   res.send(template);  // <- Return the static template above
// });

var clientId = 0;
var clients = {};  // <- Keep a map of attached clients

var clientTermsId = 0;
var clientsTerms = {};  // <- Keep a map of attached clients

var clientStatusInfoId = 0;
var clientsStatusInfo = {};

//This is from a sample I found somewhere - need to look that up

// Called once for each new client. Note, this response is left open!
app.get('/tweets/', function(req, res) {
  //req.socket.setTimeout(Infinity);
  req.socket.setTimeout(Number.MAX_VALUE);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',  // <- Important headers
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');
    (function(clientId) {
        clients[clientId] = res;  // <- Add this client to those we consider "attached"
        req.on("close", function(){delete clients[clientId]});  // <- Remove this client when he disconnects
    })(++clientId)
});

app.get('/terms/', function(req, res) {
  //req.socket.setTimeout(Infinity);
  req.socket.setTimeout(Number.MAX_VALUE);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',  // <- Important headers
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');
    (function(clientId) {
        clientsTerms[clientId] = res;  // <- Add this client to those we consider "attached"
        req.on("close", function(){delete clientsTerms[clientTermsId]});  // <- Remove this client when he disconnects
    })(++clientTermsId)
  });

app.get('/status-info/', function(req, res) {
  //req.socket.setTimeout(Infinity);
  req.socket.setTimeout(Number.MAX_VALUE);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',  // <- Important headers
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('\n');
    (function(clientId) {
        clientsStatusInfo[clientId] = res;  // <- Add this client to those we consider "attached"
        req.on("close", function(){delete clientsStatusInfo[clientTermsId]});  // <- Remove this client when he disconnects
    })(++clientStatusInfoId)
  });

//this is used by browser clients to change the search terms
app.get('/setterms', function(req, res) {

  //console.log("setterms");
  console.dir(req.query);

  var allTerms = (req.query.theterms) ? req.query.theterms.split('\t').map(function(t){return t.trim();}).join(",")
                                      :"";
                                       //.join("  ,");
  trackStringForTwitter = getTrackToSendToTwitter(allTerms);
  //console.log("track",trackStringForTwitter);
  //originalTrack = track; //allTerms;
  
  //why isn't this working when it was previously blank?
  if (streamToTwitter) {
    streamToTwitter.stop();
  }

  console.log("trackStringForTwitter: " + trackStringForTwitter);

  if (trackStringForTwitter.trim().length > 0) {
    T = new Twit(config); //see if this helps with the rate limiting - just reconstruct a new one on change here...
    //console.log("new track",trackStringForTwitter);
    //streamToTwitter = T.stream('statuses/filter', { track: trackStringForTwitter, language: 'en' });
    //console.log("Will call startStream")
    streamToTwitter = startStream(trackStringForTwitter);
    res.send("Working to set terms... created stream");
  }
  else {
    //don't create a stream
    res.send("No search terms determined...");
  }

  updateClientsAboutWhatIsBeingTracked(trackStringForTwitter);
        // allTerms.forEach(function(t,i) {
        // console.log(i + ": " + t);
        // });
        //set the terms now...

  // var user_id = req.param('id');
  // var token = req.param('token');
  // var geo = req.param('geo');  
  //res.send(user_id + ' ' + token + ' ' + geo);
});



function updateClientsAboutWhatIsBeingTracked(tracked) {
  //var msg = originalTrack; //show the raw one... track;
  //console.log("Updating clients: '" + tracked + "'");
  //console.log("Clients: " + Object.keys(clients) + " <- " + msg);
  for (clientTermId in clientsTerms) {
    clientsTerms[clientTermId].write("data: "+ tracked + "\n\n"); // <- Push a message to a single attached client
  }
}

setInterval(function(){updateClientsAboutWhatIsBeingTracked(trackStringForTwitter);},
              5000);


//updateClientsAboutWhatIsBeingTracked(); //call at beginning
// setInterval(function(){
//   var msg = Math.random();
//   console.log("Clients: " + Object.keys(clients) + " <- " + msg);
//   for (clientId in clients) {
//     clients[clientId].write("data: "+ msg + "\n\n"); // <- Push a message to a single attached client
//   };
// }, 2000);

app.listen(process.env.PORT || 8080);


//end simple app server stuff for client
/////////////////////////////////////////////////////////////////////////


// This was a reference tweet to remind myself of the fields
// { created_at: 'Sat Oct 17 12:32:08 +0000 2015',
//   id: 655360646066868200,
//   id_str: '655360646066868224',
//   text: 'RT @MontieUSA: Be afraid, be very afraid https://t.co/nzBsQ8X72a',
//   source: '<a href="http://twitter.com/#!/download/ipad" rel="nofollow">Twitter for iPad</a>',
//   truncated: false,
//   in_reply_to_status_id: null,
//   in_reply_to_status_id_str: null,
//   in_reply_to_user_id: null,
//   in_reply_to_user_id_str: null,
//   in_reply_to_screen_name: null,
//   user: 
//    { id: 1622493138,
//      id_str: '1622493138',
//      name: 'Ann Russell-Day',
//      screen_name: 'Granny_Day',
//      location: 'Harlow',
//      url: null,
//      description: 'work for Tory MP. Mother and g\'mother. Christian. lived with MS for 35+ years. Tweets own. Retweets not necessarily an endorsement',
//      protected: false,
//      verified: false,
//      followers_count: 588,
//      friends_count: 441,
//      listed_count: 37,
//      favourites_count: 10462,
//      statuses_count: 27398,
//      created_at: 'Fri Jul 26 09:27:22 +0000 2013',
//      utc_offset: null,
//      time_zone: null,
//      geo_enabled: true,
//      lang: 'en-gb',
//      contributors_enabled: false,
//      is_translator: false,
//      profile_background_color: 'ACDED6',
//      profile_background_image_url: 'http://abs.twimg.com/images/themes/theme18/bg.gif',
//      profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme18/bg.gif',
//      profile_background_tile: false,
//      profile_link_color: '038543',
//      profile_sidebar_border_color: 'EEEEEE',
//      profile_sidebar_fill_color: 'F6F6F6',
//      profile_text_color: '333333',
//      profile_use_background_image: true,
//      profile_image_url: 'http://pbs.twimg.com/profile_images/584370511079202817/y8qLy0Jc_normal.jpg',
//      profile_image_url_https: 'https://pbs.twimg.com/profile_images/584370511079202817/y8qLy0Jc_normal.jpg',
//      default_profile: false,
//      default_profile_image: false,
//      following: null,
//      follow_request_sent: null,
//      notifications: null },
//   geo: null,
//   coordinates: null,
//   place: null,
//   contributors: null,
//   retweeted_status: 
//    { created_at: 'Sat Oct 17 12:29:46 +0000 2015',
//      id: 655360047992713200,
//      id_str: '655360047992713216',
//      text: 'Be afraid, be very afraid https://t.co/nzBsQ8X72a',
//      source: '<a href="http://twitter.com/download/iphone" rel="nofollow">Twitter for iPhone</a>',
//      truncated: false,
//      in_reply_to_status_id: null,
//      in_reply_to_status_id_str: null,
//      in_reply_to_user_id: null,
//      in_reply_to_user_id_str: null,
//      in_reply_to_screen_name: null,
//      user: 
//       { id: 3964865811,
//         id_str: '3964865811',
//         name: 'Tim Montgomerie',
//         screen_name: 'MontieUSA',
//         location: null,
//         url: null,
//         description: 'Where @Montie writes about the USA without boring his largely UK following',
//         protected: false,
//         verified: false,
//         followers_count: 714,
//         friends_count: 38,
//         listed_count: 5,
//         favourites_count: 0,
//         statuses_count: 12,
//         created_at: 'Thu Oct 15 11:57:12 +0000 2015',
//         utc_offset: null,
//         time_zone: null,
//         geo_enabled: false,
//         lang: 'en',
//         contributors_enabled: false,
//         is_translator: false,
//         profile_background_color: 'C0DEED',
//         profile_background_image_url: 'http://abs.twimg.com/images/themes/theme1/bg.png',
//         profile_background_image_url_https: 'https://abs.twimg.com/images/themes/theme1/bg.png',
//         profile_background_tile: false,
//         profile_link_color: '0084B4',
//         profile_sidebar_border_color: 'C0DEED',
//         profile_sidebar_fill_color: 'DDEEF6',
//         profile_text_color: '333333',
//         profile_use_background_image: true,
//         profile_image_url: 'http://pbs.twimg.com/profile_images/654630850949156868/Hq5MiLrc_normal.png',
//         profile_image_url_https: 'https://pbs.twimg.com/profile_images/654630850949156868/Hq5MiLrc_normal.png',
//         profile_banner_url: 'https://pbs.twimg.com/profile_banners/3964865811/1445023555',
//         default_profile: true,
//         default_profile_image: false,
//         following: null,
//         follow_request_sent: null,
//         notifications: null },
//      geo: null,
//      coordinates: null,
//      place: null,
//      contributors: null,
//      quoted_status_id: 655329411160526800,
//      quoted_status_id_str: '655329411160526849',
//      quoted_status: 
//       { created_at: 'Sat Oct 17 10:28:01 +0000 2015',
//         id: 655329411160526800,
//         id_str: '655329411160526849',
//         text: 'Donald Trump\'s building a long-term operation http://t.co/QY1tEzKvFv http://t.co/mC8Y1yDwY8',
//         source: '<a href="http://www.socialflow.com" rel="nofollow">SocialFlow</a>',
//         truncated: false,
//         in_reply_to_status_id: null,
//         in_reply_to_status_id_str: null,
//         in_reply_to_user_id: null,
//         in_reply_to_user_id_str: null,
//         in_reply_to_screen_name: null,
//         user: [Object],
//         geo: null,
//         coordinates: null,
//         place: null,
//         contributors: null,
//         is_quote_status: false,
//         retweet_count: 0,
//         favorite_count: 0,
//         entities: [Object],
//         extended_entities: [Object],
//         favorited: false,
//         retweeted: false,
//         possibly_sensitive: false,
//         filter_level: 'low',
//         lang: 'en' },
//      is_quote_status: true,
//      retweet_count: 1,
//      favorite_count: 0,
//      entities: { hashtags: [], urls: [Object], user_mentions: [], symbols: [] },
//      favorited: false,
//      retweeted: false,
//      possibly_sensitive: false,
//      filter_level: 'low',
//      lang: 'en' },
//   is_quote_status: true,
//   retweet_count: 0,
//   favorite_count: 0,
//   entities: 
//    { hashtags: [],
//      urls: [ [Object] ],
//      user_mentions: [ [Object] ],
//      symbols: [] },
//   favorited: false,
//   retweeted: false,
//   possibly_sensitive: false,
//   filter_level: 'low',
//   lang: 'en',
//   timestamp_ms: '1445085128691' }

// This is some basic info on the use of Twit
// {
//     consumer_key:         '...'
//   , consumer_secret:      '...'
//   , access_token:         '...'
//   , access_token_secret:  '...'
// })

//
//  tweet 'hello world!'
//
// T.post('statuses/update', { status: 'Hello at ' +  (new Date()) }, function(err, data, response) {
//   console.log("Updated status");
//   console.log(data)
// })

//until
//Returns tweets created before the given date. Date should be formatted as YYYY-MM-DD. 
// Keep in mind that the search index has a 7-day limit. In other words, no tweets will be found for a date older than one week.
//Example Values: 2015-07-19
//
//  search twitter for all tweets containing the word 'banana' since Nov. 11, 2011
//
// T.get('search/tweets', { q: 'shakespeare until:2010-11-11', count: 100 }, function(err, data, response) {
//   console.log(data)
// })

//
//  get the list of user id's that follow @tolga_tezel
//
// T.get('followers/ids', { screen_name: 'tolga_tezel' },  function (err, data, response) {
//   console.log(data)
// })

//
//  retweet a tweet with id '343360866131001345'
//
// T.post('statuses/retweet/:id', { id: '343360866131001345' }, function (err, data, response) {
//   console.log(data)
// })

//
//  destroy a tweet with id '343360866131001345'
//
// T.post('statuses/destroy/:id', { id: '343360866131001345' }, function (err, data, response) {
//   console.log(data)
// })

//
// get `funny` twitter users
//
// T.get('users/suggestions/:slug', { slug: 'twitter' }, function (err, data, response) {
//   console.log("Got suggestions");
//   console.log(data)
// })

// T.get('users/suggestions/:slug', { slug: 'shakespeare' }, function (err, data, response) {
//   console.log(data)
// })


//
// post a tweet with media
//
// var b64content = fs.readFileSync('/path/to/img', { encoding: 'base64' })

// // first we must post the media to Twitter
// T.post('media/upload', { media_data: b64content }, function (err, data, response) {

//   // now we can reference the media and post a tweet (media will attach to the tweet)
//   var mediaIdStr = data.media_id_string
//   var params = { status: 'loving life #nofilter', media_ids: [mediaIdStr] }

//   T.post('statuses/update', params, function (err, data, response) {
//     console.log(data)
//   })
// })

//
//  stream a sample of public statuses
//
// var stream = T.stream('statuses/sample')

// stream.on('tweet', function (tweet) {
//   console.log(tweet)
// })

//
//  filter the twitter public stream by the word 'mango'.
//
// var stream = T.stream('statuses/filter', { track: 'shakespeare' })

// stream.on('tweet', function (tweet) {
//   console.log(tweet)
// })

//
// filter the public stream by the latitude/longitude bounded box of San Francisco
//
// var sanFrancisco = [ '-122.75', '36.8', '-121.75', '37.8' ]

// var stream = T.stream('statuses/filter', { locations: sanFrancisco })

// stream.on('tweet', function (tweet) {
//   console.log(tweet)
// })

//
// filter the public stream by english tweets containing `#apple`
//

