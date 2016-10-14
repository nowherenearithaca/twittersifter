"use strict";

//The purpose of this (webworker) is to start the process of setting up
//a way to ponder on "potentially interesting" tweets.
//"Interesting tweets" will then be sent back to the main page.

/* global self */



// Initially, the Dunning "surprise" was going to be used.
// This is currently not being done, but there is some leftover code
//		dealing with the start of that, and I hope to return to that.
// The main starting idea was to let it build up a corpus and for each tweet calculate 
//	the Dunning "surprise" .
// The (new) middle area will be the tweets ranked by this "surprise"
// You can still pick out interesting ones from the stream
//By default, it will try to say all interesting ones
//It will also randomly pick from the stream to say things

//The "document" is the set of terms seen in all of the tweets so far...
//	or maybe a "tweet" is the document...

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}


var me = {};

//every so often, send back the stats quantiles
me.intervalForInterestScores_ms = 120*6000;
//used to send back stats on these
me.interestScores = [];

//me.urlRegex = /(https?:\/\/[^\s]+)/g;
me.bareTweets = {};

me.threshold_of_interest = 3.0; //0; //No idea what to do about this...
me.tweetcountForTweetsContainingTerm = {};

me.termsSeen = {}; //existence and counts, for starters
me.numberTweets = 0;

me.regexpIgnoredCharacters = new RegExp('[\.\-]','g');


//this quantiles calculation from d3.js source
// R-7 per <http://en.wikipedia.org/wiki/Quantile>
//used to send back some basic stats to the main page every now and then
var getQuantile = function(values, p) {
  var H = (values.length - 1) * p + 1,
      h = Math.floor(H),
      v = +values[h - 1],
      e = H - h;
  return e ? v + e * (values[h] - v) : v;
};

me.quantilesOfInterest = [0.5, 0.95, 0.99]; //0.1,0.5, 0.9]; //0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9];

function sendBackCurrentInterestStats() {

	if (me.interestScores.length > 0) {
		//sort the array
		me.interestScores.sort();

		var theQuantilesStat = me.quantilesOfInterest.map(function(q) {

				var quantile = getQuantile(me.interestScores,q);
				return {q:q, quantile:quantile};

		});

		//clear the current scores
		me.interestScores = [];

		self.postMessage({'cmd': 'interest-stats', 
							'quantiles': theQuantilesStat
							});

	}

	//TODO - allow start stop of doing this
	setTimeout(sendBackCurrentInterestStats,me.intervalForInterestScores_ms);

}

function sendBackInterestingTweet(blah) {
	self.postMessage({'cmd': 'interesting-tweet', 
						'tweet': blah
						});
}

function sendBackMessage(msg) {

	self.postMessage({'cmd': 'info-message', 
						'msg':msg
					});

}

//From wikipedia 


//tf–idf is the product of two statistics:
//	term frequency tf(t,d) 
//	inverse document frequency


//In the case of the term frequency tf(t,d), 
//		the simplest choice is to use the raw frequency of a term in a document, 
//		i.e. the number of times that term t occurs in document d.

//	The inverse document frequency is a measure of how much information the word provides, 
//	that is, whether the term is common or rare across all documents. 
//	It is the logarithmically scaled fraction of the documents that contain the word, 
//	obtained by dividing the total number of documents by the number of documents containing the term, 
//	and then taking the logarithm of that quotient.

//so we need to be able to calculate the number of tweets that contain each term

function getNumber(thing) {
	return thing? thing : 0;
}


//http://stackoverflow.com/questions/20663353/is-it-feasible-to-do-an-ajax-request-from-a-web-worker
var ajax = function(url, data, callback, type) {
  var data_array, data_string, idx, req, value;
  if (data === null) {
    data = {};
  }
  if (callback === null) {
    callback = function() {};
  }
  if (type === null) {
    //default to a GET request
    type = 'GET';
  }
  data_array = [];
  for (idx in data) {
    value = data[idx];
    data_array.push("" + idx + "=" + value);
  }
  data_string = data_array.join("&");
  req = new XMLHttpRequest();
  req.open(type, url, false);
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.onreadystatechange = function() {
    if (req.readyState === 4 && req.status === 200) {
      return callback(req.responseText);
    }
  };
  req.send(data_string);
  return req;
};


//This loads Cynthia Whissel's dictionary with imagery, where words were assigned
// pleasantness, activation, and imagery scores.
// This dictionary is used here with perission of C. Whissel.
//		Commercial use of this dictionary is not permitted.  Check with 
//			C. Whissel regarding such uses of her dictionary.
//
var whisselWords = {};
ajax("../whissel/dictionary_justwords.txt", {}, function(theFileData) {

	var arrayOfWhisselWords = theFileData.split("\n");


	arrayOfWhisselWords.forEach(function(line) {

	  var word = line.substr(0,32).trim();
	  word = word.replace(/\*/g, "'");

	  var theRest = line.substr(33,100).trim();
	  var pieces = theRest.split(" ");
	  var pleasantness = pieces[0];
	  var activation = pieces[1];
	  var imagery = pieces[2];

	  whisselWords[word] = {word: word, 
	  												pleasantness: Number(pleasantness) - 1,
	  												activation: Number(activation) - 1,
	  												imagery: Number(imagery) - 1
	  											};

	});
   //self.postMessage(data);
	}, 'GET');

//This returns the "interest score" for the text, based on 
//	a very(!) simple use of Whissel's dictionary.
function scoreTweet(text) {

	var words = text.split(" ");

	var whisselWordsFound = [];

	var wordsSeen = {};

	words.forEach(function(word) {

		word = word.trim().toLowerCase();
		if (!wordsSeen[word]) {
			if (whisselWords[word]) {

					wordsSeen[word] = true;
					var whisselWord = whisselWords[word];

					//let there be doubles for now
					whisselWordsFound.push(whisselWord);

			}
		}

	});

	//score it
	var pleasantness = 0;
	var activation = 0;
	var imagery = 0;

	if (whisselWordsFound.length===0) {
		return 0;
	}

	whisselWordsFound.forEach(function(ww) {

			pleasantness += ww.pleasantness;
			activation += ww.activation;
			imagery += ww.imagery;

	});

	//this makes them equally weighted...
	//TODO - get fancier with this
	return pleasantness + activation + imagery;

}


//This function is given the raw tweet text.
// If it's "interesting enough", it will send it back to the main page.
function ponderTweet(tweet) {
	//ok - go to town
	me.numberTweets++;

	//get the terms
	var terms = tweet.text.toLowerCase().split(" ");

	//First get the score, and then do the updates of some stats...

	//TODO - do we really care about repeats?  unlikely to really happen much

	var interest_score = 0;

	var termsSeenThisTweet = {};

	//we don't want shortened links because they are always going to be unique
	terms = terms.filter(function(t) {

		t = t.trim();
		return (!t.startsWith("http")) && 
				(!t.startsWith("@")) && 
				(t !== "rt") && 
				 !me.regexpIgnoredCharacters.test(t);

	});

	//construct a key used to see if we've seen the text before...
	//	this can happen a lot with different accounts tweeting the
	//	same thing at about the same time.
	//TODO - worth using a hash?
	var bareString = "";
	terms.forEach(function(t) {
		bareString += t;
	});

	if (me.bareTweets[bareString]) {
		return; //we've seen it
						//stop pondering
	}

	//note that we've seen it...
	me.bareTweets[bareString] = 1;


	//this next loop was when I was using td-idf score to determine
	// whether "interesting" or not.  It is the start of
	//	a tf-idf approach that I replaced with the Whissel stuff.
	//

	var numberTermsConsidered = 0;
	terms.forEach(function(term) {

		//ignore links
		if ( (!term.startsWith("http")) && (!termsSeenThisTweet[term])) {

			numberTermsConsidered++;
			termsSeenThisTweet[term] = true;

			//how many times has this occurred?

			var tf_t_d = 1;	//number of times the term appears in the current document
					// do we really care for a tweet?
					// having it appear at all seems enough
					// wikipedia mentions this kind of thing:
					//	Boolean "frequencies": tf(t,d) = 1 if t occurs in d and 0 otherwise 

			var idf_t_D = Math.log( (me.numberTweets) / 
										(1 + getNumber(me.tweetcountForTweetsContainingTerm[term]))
								   );

			//get the td-idf for this one
			//how many tweets contain this term?
	
			var tf_idf_term_d_D =  tf_t_d * idf_t_D;

			interest_score += tf_idf_term_d_D;
			if (!me.tweetcountForTweetsContainingTerm[term]) {
				me.tweetcountForTweetsContainingTerm[term] = 0;
			}

			//update the number of tweets that contain the term
			me.tweetcountForTweetsContainingTerm[term]++;

			//A high weight in tf–idf is reached by a high term frequency 
			//	(in the given document) and a low document frequency of the term 
			//	in the whole collection of documents; the weights hence tend to 
			//	filter out common terms. 
			//	Since the ratio inside the idf's log function is always 
			//		greater than or equal to 1, the value of idf (and tf-idf) 
			//		is greater than or equal to 0. 
			//	As a term appears in more documents, 
			//		the ratio inside the logarithm approaches 1, 
			//		bringing the idf and tf-idf closer to 0.

		}

	});

	// why don't we try simply adding the td_idfs?
	// that's what this seems to suggest
	//		http://nlp.stanford.edu/IR-book/html/htmledition/tf-idf-weighting-1.html
	//they use the word "scoring"

	//TODO - need to keep running info on the "interest" at each second
	//TODO - periodically, send back an update

	//If we had a single part that could be analyzed, calculate an
	//	interest score based on the Whissel dictionary
	if (numberTermsConsidered > 0) {

		var thisScore = scoreTweet(tweet.text); //interest_score / numberTermsConsidered;

		tweet.interest_score = thisScore; // interest_score / numberTermsConsidered;

		//Mar 15, 2016
		//playing with just this for Whissel score...
		//tweet.interest_score = thisScore;

		me.interestScores.push(thisScore);

		if (tweet.interest_score > me.threshold_of_interest) {

			sendBackInterestingTweet(tweet);

		}
	}
	//sendBackMessage("Done pondering..." + tweet.id_str);


}

self.addEventListener('message', function(e) {
  //self.postMessage(e.data);

  	var data = e.data;
  	if (data.cmd === "start") {

  		setTimeout(sendBackCurrentInterestStats(), me.intervalForInterestScores_ms);

  	}
  	else if (data.cmd === 'new-tweet') {

  		ponderTweet(data.tweet);
	  	//me.ponderTweetsWorker.postMessage({'cmd': 'newTweet', 'text': tweet.text, 'id': tweet.id_str});
	}
	else if(data.cmd === "change-interest-threshold") {

		//this is triggered by the main page when the user changes the slider
		var newValue = Number(data.value);
		me.threshold_of_interest = newValue;
	    //me.ponderTweetsWorker.postMessage({"cmd": "change-interest-threshold","value": me.threshold_of_interest});

	}
}, false);

