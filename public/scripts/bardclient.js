"use strict";

//TODO - color parts of speech instead of each letter
//TODO: mouseover on the graph shows the tweets?  would require storing all of the tweets, but
//        I found myself wanting to see these details when there was a spike

//TODO - "endquote" regexp is not right - it's chopping out the actual info in there
//TODO: min # followers to show the tweet for

//TODO: mouseover on quicklist allows like/retweet after all - save the effort of 
//			having to pick it
//The voices did not work on Safari for the mac

//Have one area for "previous" tweets that are not live
//this would be "casually" grabbed - can you restrict thing to one hour up to one second ago?

//TODO - add some sort of indication of the raw rate, independent of how many are being displayed;
//			this for the case where there is a burst of activity

//TODO be able to set up N different apps in twitter so that you can get full
//      separete streams/rivers of activity

//TODO if watching a stream, don't say the "hashtag tracked term" because it is redundant there;
//      of course, you might not be able to always parse it out, but try to

//
//Need to review the LL stuff for how to calculate this...

//TODO - slide down.  However, you can't just use jquery's slidedown

/* global SmsLingo */
/* global speechSynthesis */
/* global SpeechSynthesisUtterance */
//load speech stuff for later
//TODO - move to other lib

//TODO - doesn't handle very very fast stream when there are lots of results
//TODO - throttle what is shown or even ignore some when things are coming too fast
//TODO - show queued count?
//TODO - the voices are getting in the way of each other 
//TODO - option to try to filter out OneDirection-related tweets - they're just a lot of them

//TODO - indicate somehow how many followers

//TODO - build up corpus for the LL thing

//TODO - interrupt not working for fast streams...

//2014 paper
// Eye-tracking Study of Reading Speed from
// LCD Displays: Influence of Type Style and
// Type Size
// Gregor Franken
// University of Ljubljana
// Anja Podlesek
// University of Ljubljana
// Klementina Možina
// University of Ljubljana
// file:///Users/bradflyon/Downloads/franken_jemr_2015_final_eye-tracking_study_of_reading_speed_from_lcd_displays-influence_of_type_style_and_type_size.pdf

// The results of our study show that the reading speed
// and, consequently, the legibility of the text displayed on
// an LCD screen are influenced by the typeface and the
// font size. The texts set in Verdana, regardless of the font
// size, were read faster than the texts set in Georgia. Verdana
// has no variations in stroke width, while Georgia
// does. At the same time Verdana has a slightly larger xheight
// and wider characters, which increases its legibility
// in reading from screens; this contributes to faster information
// processing. 

//TODO - escape "\" in text (maybe do it on server end)

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}


//testing color thing
var c = [];
//go ahead and set this up - we rotate from red to black to blue to black

var cycleLength = 25; // this is the number of characters
var colorDiff = Math.floor(256/cycleLength);
//red to black
c = d3.range(25).map(function(i) {
  return 'color: rgb(' + Math.max(0,(255 - colorDiff*i)) + ', 0, 0);';
});
//black to blue
c = c.concat(
      d3.range(25).map(function(i) {
        return 'color: rgb(0, 0,' + Math.min(0,colorDiff*i) + ');';
      })
);
//blue to black
c = c.concat(
    d3.range(25).map(function(i) {
      return 'color: rgb(0,0,' + Math.max(0,(255 - colorDiff*i)) + ');';
    })
  );
//black to red
c = c.concat(
      d3.range(25).map(function(i) {
        return 'color: rgb(' + Math.max(colorDiff*i) + ', 0, 0);';
      })
    );


//TODO - pass in selectors for stuff...
function BardClient(config) {

var returnedStuff = {};

var me = {};
var that = me;

me.maxInList = 100; //5; //small for testing

me.threshold_of_interest = 3;

//me.numberTweetsNotSpoken = 0; //used for keeping list small

me.valueInSecond = {};

me.showTest = config.showTest;

me.numberFollowersToInterrupt = config.numberFollowersToInterrupt || 50000;

me.min_gap_between_tweets_ms = config.min_gap_between_tweets_ms || 250;

var g = me; //ugh, but I am bringing in the live chart from somewhere else


function doTickForLiveChartUpdate() {

        // if (!g.currentLiveChartEmoji) {
        //   console.log("Called tick, but not watching an emoji");
        //   return;
        // }
        // if (g.isDoingLiveChartUpdate === false) {
        //   console.log("Called tick, but isDoingLiveChartUpdate is false");
        //   return;
        // }
        var now = new Date();
        var now_ms = now.getTime();
        var now_sec = Math.floor(now_ms/1000);
        var now_time_lower_second = new Date(now_sec*1000);

        var previousMax = g.liveChart.maxAmount;
        var didChangeYScale = false; //(g.rescaleNextTime === true);

        //console.log("seconds: " + now_sec);
        
        //grab the data for the latest second

        // Shift domain
        //g.liveChart.x.domain([now_ms - (g.liveChart.limit*1000 - 2000) * g.liveChart.duration, now - g.liveChart.duration]);
        g.liveChart.x.domain([now - ( g.liveChart.limit - 2) *1000, now]); // - g.liveChart.duration]);

        var x = g.liveChart.x;
        var y = g.liveChart.y;


        //g.rescaleNextTime = false;

        //in case there are no amounts, make sure and scale
//         if (didChangeYScale) {
//           y.domain([0, g.liveChart.maxAmount]);
//         }

        var thisAmount = me.valueInSecond[now_sec];

        if (thisAmount && (thisAmount > 0)) {


          //check if we changed - don't rescale if we didn't
          //this is checked below after data set up : g.liveChart.maxAmount = Math.max(g.liveChart.maxAmount, 6 + thisAmount);

          //only change if it's "enough"' no - then it creeps up
//           didChangeYScale = didChangeYScale || (Math.abs(currentMax - g.liveChart.maxAmount) > 0);
//           if (didChangeYScale) {
//             console.log("didChangeYScale - g.liveChart.maxAmount: " + g.liveChart.maxAmount);
//             y.domain([0, g.liveChart.maxAmount]);
//           }

        }
          //console.log(thisAmount);
          //g.liveChart.maxAmount = Math.max(g.liveChart.maxAmount, thisAmount);

          //g.liveChart.y.domain([0, g.liveChart.maxAmount]);

          //if this one exists, just update it, else create a new one

          //is this too slow?
          //we use the last 60
          var theData = [];
          var iSec;
          //set up the data to use - we do it for all 60 seconds in case
          //  we missed some in earlier seconds that went by
          //this could be optimized a bit, since we won't be updating those
          //  who are more than a few seconds old



          

          //for (iSec=now_sec;iSec >= now_sec-60;iSec--) {
          for (iSec=now_sec;iSec >= now_sec - g.liveChart.limit;iSec--) {
            var theAmount = me.valueInSecond[iSec];
            if (theAmount && theAmount > 0) {
              theData.push({time_sec:iSec, amount: theAmount});
            }
            else if (iSec > g.timeStartTickForLiveUpdate_sec) {
              //nothing happened for this one
              theData.push({time_sec:iSec, amount: 0});
            }

          }

          
          //is a min


          //can be zero at first, which we need to guard for
          g.liveChart.maxAmount = (theData.length === 0) ? 6 : 6 + d3.max(theData, function(d){ return d.amount;});
          didChangeYScale = (g.liveChart.maxAmount !== previousMax); //true; //see about always doing this


          //update yaxis if scale changed...
          if (didChangeYScale) {
            y.domain([0, g.liveChart.maxAmount]);
            g.liveChart.y.axis
                            .ticks(2)
                            .scale(g.liveChart.y).outerTickSize(0)
                                                        .tickFormat(function (d) {

                                                          if (d % 1 === 0) {
                                                            //return d3.format('.f')(d)
                                                            //return (d >= g.liveChart.maxAmount) ? "" : d;
                                                            return (Math.floor(d)===0) || (d >= g.liveChart.maxAmount) ? "" : d;
                                                          } else {
                                                            return "";
                                                          }
                                                          
                                                          //return (Math.floor(d)===0) || (d >= g.liveChart.maxAmount) ? "" : d;
                                                        });
            g.liveChart.axis_y.call(g.liveChart.y.axis);                                             
          }

          var theId = "sec_" + now_sec;
          var theBar = g.liveChart.paths
                                  .selectAll(".value-in-second-blip") //#" + theId)
                                  .data(theData, function(d) {return d.time_sec;});
                                  //.data([thisAmount]);

          var theWidth = Math.ceil(x(now_time_lower_second) - x(now_time_lower_second-1000));
          theBar.enter()
                  .append("rect")
                  .classed("value-in-second-blip", true)
                  .attr("id", theId)
                  .attr("time_sec", function(d) {
                    return new Date(d.time_sec*1000).getTime();//  now_time_lower_second.getTime())
                    })
                  .attr("x", function(d) {
                      var t_lowerSec = new Date(d.time_sec*1000);//  x(now_time_lower_second) - theWidth/2) //the first one should be the only one that gets it
                      //console.log(t_lowerSec + ", " + theWidth);
                      return x(t_lowerSec) - theWidth/2;
                   })                      
                  .attr("y", function(d) {
                         return y(d.amount); // y(thisAmount))
                    })
                  .attr("width", theWidth) //width is one second...
                  .attr("height",function(d) {
                        return Math.abs(y(d.amount) - y(0));// Math.abs(y(thisAmount) - y(0)))
                  })
                  .attr("amount", function(d) {
                         return d.amount; // y(thisAmount))
                    })
                  .attr("rx","2")
                  .attr("ry","2");

          theBar.attr("x", function(d) {
                      var t_lowerSec = new Date(d.time_sec*1000);//  x(now_time_lower_second) - theWidth/2) //the first one should be the only one that gets it
                      return x(t_lowerSec) - theWidth/2;
                   })                      
                  .attr("y", function(d) {
                         return y(d.amount); // y(thisAmount))
                    })
                  .attr("height",function(d) {
                        return Math.abs(y(d.amount) - y(0));// Math.abs(y(thisAmount) - y(0)))
                  })
                  .attr("amount", function(d) {
                         return d.amount; // y(thisAmount))
                    });

          //this automatically removes the ones for which we no longer have data...
          theBar.exit().remove();

          g.liveChart.meanAmount = d3.mean(theData, function(d){ return d.amount;});
          if (typeof g.liveChart.meanAmount !== "undefined") {
            g.liveChart.minTime_sec = d3.min(theData, function(d){ return d.time_sec;});
            var theYForLine = y(g.liveChart.meanAmount);
            g.liveChart.meanLine
                        .attr("y1",theYForLine)
                        .attr("y2",theYForLine)
                        .attr("x1",x(new Date(g.liveChart.minTime_sec*1000)) - theWidth/2);
          }
          //unnecessary ? theBar.attr("amount",thisAmount).attr("y", y(thisAmount)).attr("height",Math.abs(y(thisAmount) - y(0)));


           // Slide x-axis left
           //we always do this...

          g.liveChart.axis.transition()
              .duration(g.liveChart.duration)
                  .ease('linear')
                  .call(g.liveChart.x.axis);


        
        //setTimeout(doTickForLiveChartUpdate, g.liveChart.duration); //we repeat until that flag is no longer set

        //TODO - is this too often to do this?
        requestAnimFrame(doTickForLiveChartUpdate);

} //doTickForLiveChartUpdate


//TODO - wrap up in a better encapsulated way if this works...
g.makeLiveChart = function() {

    g.liveChart = {};

    g.liveChart.maxAmount = 10;
    g.liveChart.limit = 120 * 1; //trying 2 minutes now... one minute seemed too short 60 * 1;
    g.liveChart.duration = 100; //ms for the animation of the axes


    var now = new Date();
    var now_ms = now.getTime();
    var $el = $('#live-chart');
    
    var width = $el.width();
    var height = $el.height();

    var gapForYAxisOnRight = 35; //had to increase a little if > 100 or it uses decimals

    g.liveChart.width = width;
    g.liveChart.gapForYAxisOnRight = gapForYAxisOnRight;

    g.liveChart.svg = d3.select('#live-chart').append('svg')
                                    .classed("live-chart",true)
                                    .attr('width', width)
                                    .attr('height', height); //leave space for axis labels

    //doing in html to simplify have a partially transparent background for the title                                    
    // var theTitle = g.liveChart.svg.append('text')
    //                   .classed("live-chart-title",true)
    //                   .attr("x",0)
    //                   .attr("y",20)
    //                   .attr("dy","0.3em")
    //                   .text("tweets per second");


    g.liveChart.x = d3.time.scale()
                          .domain([now - (g.liveChart.limit-2)*1000, now]) // - g.liveChart.duration])
                          .range([0, width - gapForYAxisOnRight]);

    g.liveChart.y = d3.scale.linear()
                    .domain([0, g.liveChart.maxAmount])
                    .range([height-20, 0]);

    g.liveChart.axis = g.liveChart.svg.append('g')
                              .attr('class', 'x axis')
                              .attr('transform', 'translate(0,' + (height-20) + ')')
                              .call(g.liveChart.x.axis = d3.svg.axis().scale(g.liveChart.x).orient('bottom'));

//     g.liveChart.yAxis = d3.svg.axis()
//                         .orient("right")
//                         .outerTickSize(0)
//                         .scale(g.liveChart.y);

    g.liveChart.axis_y = g.liveChart.svg.append('g')
                              .attr('class', 'y axis')
                              .attr('transform', 'translate(' + (width-gapForYAxisOnRight) + ', ' + (0) + ')')
                              .call(g.liveChart.y.axis = d3.svg.axis()
                                            .ticks(2)
                                            .scale(g.liveChart.y).orient('right')
                                            .outerTickSize(0)
                                                        .tickFormat(function (d) {
                                                          //http://stackoverflow.com/questions/13513177/display-only-whole-values-along-y-axis-in-d3-js-when-range-is-0-1-or-0-2
                                                          //return (d >= g.liveChart.maxAmount) ? "" : d;
                                                          if (d % 1 === 0) {
                                                            //return d3.format('.f')(d)
                                                            //return (d >= g.liveChart.maxAmount) ? "" : d;
                                                            return (Math.floor(d)===0) || (d >= g.liveChart.maxAmount) ? "" : d;
                                                          } else {
                                                            return "";
                                                          }

                                                        })
                                        );

    d3.select(g.liveChart.axis_y.selectAll(".tick")[0][0]).attr("visibility","hidden");
    //everything is under this - we shift it around, etc...
    g.liveChart.paths = g.liveChart.svg.append('g');
    g.liveChart.meanLine = g.liveChart.svg.append('g')
                                          .append("line")
                                          .classed("chart-mean-line",true)
                                          .attr("stroke-linecap", "round")
                                          .attr("x1", width - gapForYAxisOnRight)
                                          .attr("x2", width - gapForYAxisOnRight);


};



me.doColorify = true;
me.doShowUserInfo = true;
me.doShowUserReferences = true;

me.stats = {};
me.stats.numberTweets = 0;
me.stats.numberWordsInTweets = 0;
me.stats.numberTermsSpoken = 0;
me.stats.numberTweetsSpoken = 0;


that.sentiments = {};
that.sentiments.negative=[]; //scores
that.sentiments.neutral=[]; //scores
that.sentiments.positive=[]; //scores


        that.resetSentimentBar = function() {

              console.log('reset sentiment bar');

              that.numberTweetsForSentiment = 0;

              that.sentiments = {};
              that.sentiments.negative=[]; //scores
              that.sentiments.neutral=[]; //scores
              that.sentiments.positive=[]; //scores

              $('.polarity.negative').css({width:0});
              $('.polarity.neutral').css({left:0, width:0});
              $('.polarity.positive').css({left:0, width:0});

        };

        that.updateSentimentBar = function(polarity) {

                that.numberTweetsForSentiment++;

                //console.log(polarity);

                if (polarity<0) {
                  that.sentiments.negative.push(polarity);
                }
                else if (polarity>0) {
                  that.sentiments.positive.push(polarity);
                }
                else {
                  that.sentiments.neutral.push(polarity);
                }

                var sum = 0;
                var count = 0;
                ['negative', 'neutral', 'positive'].forEach(function(sent) {
                  that.sentiments[sent].forEach(function(val) {
                      sum += val;
                      count ++;
                  });
                });

                var avg = sum/count;
                var fractionNegative = Number((100*that.sentiments.negative.length/count).toFixed(0));
                var fractionNeutral = Number((100*that.sentiments.neutral.length/count).toFixed(0));
                var fractionPositive = 100 - fractionNeutral - fractionNegative;

                $('.polarity.negative').css({width:fractionNegative + "%"});
                $('.polarity.neutral').css({left:fractionNegative + "%", width:fractionNeutral + "%"});
                $('.polarity.positive').css({left:(fractionNegative + fractionNeutral) + "%", 
                                                  width:fractionPositive + "%"});


            };

        that.getSentimentColorForTweet = function(polarity) {
          if (polarity < 0){
            return "rgb(255,60,0)";
          }
          else if (polarity > 0){
            return "rgb(0,198,1)";
          }
          else {
            return "rgb(220,220,220)";
          }
        };

        that.getSentimentClass = function(polarity) {

          if (polarity < 0){
            return "sentiment-negative";
          }
          else if (polarity > 0){
            return "sentiment-positive";
          }
          else {
            return "sentiment-neutral";
          }

        };

function handleUserReferencesInTweet(text) {
  if (me.doShowUserReferences===true) {
    return text;
  }
  else {

    //replace @blah with blank
    return text.replace(/(@\S+)/gi,"");
  }
}

function colorify(text) {

	if (!me.doColorify) {
		return text;
	}

	var s = "";
	var letters = text.split("");

	var index = 0;
	letters.forEach(function(letter,i) {

		if (index > c.length-1) {
			index=0;
		}
		if (letter.charCodeAt(0) < 255) { //tweak so that emojis can show up...
		s += "<span style='" + c[index] + "'>" + letter + "</span>";
		}
		else {
			s += letter;
		}

		index++;
	});

	return s;

}

me.doSayTweet =  (config && (typeof config.doSayTweet !== "undefined")) ? 
						config.doSayTweet : true;


returnedStuff.setDoSayTweet = function(bValue) {
	me.doSayTweet = bValue;
};

me.isSayingTweet = false;

var gLastSayIt_ms = (new Date()).getTime();
var gSayItMaxDifference_ms = 25*1000; //20 sec

var sms = new SmsLingo();

var canSpeak = ((typeof speechSynthesis !== "undefined") && (speechSynthesis !== null));
var theVoices = [];
var defaultVoiceIndex = -1; //not sure we need this
var currentVoiceIndex = -1;
//default nil action
me.sayTweet = function (tweet, callbackWhenDone) {
		callbackWhenDone();
};

me.voiceNamesToInclude = [];

//mac specific

me.voiceNamesToInclude.push('Victoria'); //eastern europish

//voices.push('Albert');
me.voiceNamesToInclude.push('Alex');
me.voiceNamesToInclude.push('Fred');
me.voiceNamesToInclude.push('Junior');

me.voiceNamesToIgnore = [];
me.voiceNamesToIgnore.push("Albert");
me.voiceNamesToIgnore.push("Bad News");
me.voiceNamesToIgnore.push("Bahh");
me.voiceNamesToIgnore.push("Bells");
me.voiceNamesToIgnore.push("Boing");
me.voiceNamesToIgnore.push("Bubbles");
me.voiceNamesToIgnore.push("Cellos");
me.voiceNamesToIgnore.push("Deranged");
me.voiceNamesToIgnore.push("Good News");
me.voiceNamesToIgnore.push("Deranged");
me.voiceNamesToIgnore.push("Hysterical");
me.voiceNamesToIgnore.push("Pipe Organ");
me.voiceNamesToIgnore.push("Whisper");
me.voiceNamesToIgnore.push("Trinoids");
me.voiceNamesToIgnore.push("Zarvox");
me.voiceNamesToIgnore.push("Ralph");

me.speechSynthesisReady = false;



//alert("Next: strip out html from stuff to be said... or use text before it is added");
if (canSpeak) {

	//this is getting called more than once for some reason...
	speechSynthesis.onvoiceschanged = function() {

		//console.dir(speechSynthesis);
		
		me.speechSynthesisReady = false;
		theVoices = [];

		var systemVoices = speechSynthesis.getVoices();
		if (theVoices.length===0) {
			console.log("Will loop over voices...");
			systemVoices.forEach(function(voice) {

					//if not one of the unusable ones...

					if (voice.lang.startsWith("en-US")) {
						if (me.voiceNamesToIgnore.indexOf(voice.name) === -1) {
							var thisIndex = theVoices.push(voice) - 1;
							console.log("Found english voice: " + voice.name + ", " + voice.lang);
						 	//console.dir(voice);		
							if (voice.default === true) {
								defaultVoiceIndex = thisIndex;
								currentVoiceIndex = thisIndex;
							}
						}
					}
			});
			if ((currentVoiceIndex < 0) && theVoices.length>0) {
				//defaultVoice = theVoices[0];
				currentVoiceIndex = 0;
			}
		}

		var getNextVoice = function() {
			var theVoice = theVoices[currentVoiceIndex];	
			currentVoiceIndex++;
			if (currentVoiceIndex > theVoices.length-1) {
				currentVoiceIndex = 0;
			}
			return theVoice;
		};


		//TODO - outline the one being said - the bold conflicts with importance
		//The rate attribute defines the speed at which the text should be spoken. 
		//	This should be a float value between 0 and 10, the default being 1.
		me.sayTweet = function (thingToSay, callbackWhenDone) {
			//TODO - look up more on SpeechSynthesisUtterance


      // console.log("Say tweet");
      // console.dir(callbackWhenDone);
      // callbackWhenDone();

      //TODO - why onend not working?
      
			speechSynthesis.cancel(); //quirkiness
			var msg = new SpeechSynthesisUtterance(thingToSay);
			msg.lang ="en-US";
			//get a voice to use
			msg.voice = getNextVoice();
			msg.rate = 1.1; //1.1 was a little oto fast as well... 1.1; //1.25 is still too fast ; // 1.5 is still too fast; //2 is very fast - too fast 2;
			//set up callback
			msg.onend = function(e) {
				//console.log("said something...");
				//console.dir(e);
				//console.log("Done saying text '" + thingToSay + "'");
				console.log("DONE Voice '" + msg.voice.name + "': " + thingToSay + "'");
				callbackWhenDone();
			};
			//say it
			console.log("START Voice '" + msg.voice.name + "': " + thingToSay + "'");
			setTimeout(function() {
				speechSynthesis.speak(msg);
				},50); //quirkiness 
		};

		me.speechSynthesisReady = true;

		//for testing...
		if (me.showTest) {
			(function() {
				for (var i=0;i<5;i++) {
					setTimeout(doTestTweet,i*3000);
				}
			})();
		}

	};

}
// var msg = new SpeechSynthesisUtterance("test");

// msg.voice = speechSynthesis.getVoices()[0];
// msg.onend = function(e) {
// 	console.log("said something...");
// 	console.dir(e);
// 	//log("Finished first msg test in " + )
// };

//speechSynthesis.speak(msg); 

//end load speech stuff

    var urlRegex = /(https?:\/\/[^\s]+)/g;
    //var regexpHashtag = new RegExp('#([^\\s]*)','g');
    var regexpHashtag = new RegExp('#','g');
    //var regexpAt = new RegExp('@([^\\s]*)','g');

    var regexpAt = new RegExp('@','g');

    var regexpAmp = new RegExp('&amp;','g');
    var regexpGt = new RegExp('&gt;','g');
    var regexpLt = new RegExp('&lt;','g');
    var regexpRT = new RegExp(' RT ','g');

    var regexpQuote = new RegExp('"','g');
    var regexpQuoteEveryOther = new RegExp('quote.*?(quote)','g');

    //“ ”

    var regexpLeftQuote = new RegExp('“','g');
    var regexpRightQuote = new RegExp('”','g');

//this replaces every other comma, according to stackoverflow
//http://stackoverflow.com/questions/13507354/javascript-regex-replace-every-other-comma-with-semicolon
//var times = '5:11,14:00,17:11,22:00';
//times.replace(/(,[^,]*),/g, '$1;');

	function makeTweetTextForConciseTextDisplay(text) {

	    var s = text.replace(urlRegex,'');
	    s = s.replace(regexpAmp,'&');
	    s = s.replace(regexpGt,'>');
	    s = s.replace(regexpLt,'<');

	    return s;
	}

  function makeTweetMoreConversational(text) {

    //console.log("Before: " + text);
    
    var s = text.replace(urlRegex,'');


    s = s.replace(/!+/g, '!'); //multiples causes voice to pause
    s = s.replace(regexpHashtag,' hashtag ');
    s = s.replace(regexpHashtag,'');
    s = s.replace(regexpRT,' retweet ');

    //foo.*?(foo)

    s = s.replace(regexpLeftQuote,'"');
    s = s.replace(regexpRightQuote,'"');

    s = s.replace(regexpQuote,' quote ');
    //console.log("before every other quote: " + s);

    var pieces = s.split('quote');

    s = pieces[0].trim();
    pieces.forEach(function(piece,i) {

      if (i>0) {
        if (i % 2 === 0) {
          s += " end quote " + piece.trim();
        }
        else {
          s += " quote " + piece.trim();
        }
      }
    });

    // s = s.replace(/(,[^quote]*)"/g, '$1 end quote');
    //s = s.replace(regexpQuoteEveryOther,'end quote');


    //replace quotes

    //replace every other one with "end quote"

    //s = s.replace(regexpAt,'at ');
    //s = s.replace(regexpAt,'to ');
    s = s.replace(regexpAt,'');
    s = s.replace(regexpAmp,'&');
    s = s.replace(regexpGt,'>');
    s = s.replace(regexpLt,'<');

    s = sms.statement(s);
  
    //console.log("After: " + s);

    return s;

  }


function addCommas(nStr) {

        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }

        return x1 + x2;

}


function getRowForInterestingTweet(tweet) {

  var s = "<div class='maybe-interesting-tweet' tweet_id='" + tweet.id_str + "'>";

  // s += "<div class='interest-score'>" + tweet.interest_score.toFixed(2) + "</div>";
  s += "<div class='tweet-text'>" + colorify("[" + tweet.interest_score.toFixed(2) + "] " + tweet.text ) + "</div>";

  s += "</div>";

  return s;

}


function getTextForPickedTweet(user_name, user_screen_name, tweet_text,tweet_id, numberFollowers) {

	// data-cards="hidden"
  var sCopyId = "picked-tweet-" + tweet_id;

  var sForCopy = ""; 
  sForCopy += '<blockquote class="twitter-tweet" lang="en" data-cards="hidden" data-conversation="none">';
  sForCopy += '<p lang="en" dir="ltr">';
  sForCopy += tweet_text;
  sForCopy += '</p>';
  sForCopy += '<a href="https://twitter.com/' + user_screen_name + '/status/' + tweet_id + '">' + '</a>';
  sForCopy += '</blockquote>';
  sForCopy += '<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>';

	var s = '<div class="picked-tweet-wrapper" tweet_id="' + tweet_id + '">' +
        '<div style="margin-bottom:15px;z-index:100000;">' +
  				'<div class="btn btn-xs">' +
  				'<span class="remove-picked glyphicon glyphicon-remove" tweet_id="' + tweet_id + '"></span>' +
  				'</div>' +
          "<div class='button btn btn-primary btn-xs copy' data-clipboard-text='" + sForCopy + "'>" +
          '    Copy to clipboard' +
          '</div>' +
        '</div>';





// <blockquote class="twitter-tweet">
// <p>Brazil to export low-cost measles &amp; rubella vaccines to developing countries 
// <a href="http://t.co/moEfOssAqQ">http://t.co/moEfOssAqQ</a>
// </p>
// &mdash; BBC News (World) (@BBCWorld) 
// <a href="https://twitter.com/BBCWorld/statuses/395287088033447936">October 29, 2013</a>
// </blockquote>
 
// <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

	s += '<blockquote class="twitter-tweet" lang="en" data-cards="hidden" data-conversation="none">';
	s += '<p lang="en" dir="ltr">';
	s += tweet_text;

	//	mnf,cowboy,redskin: Sentiment 0.0 (interval 2.0 minutes, 48 tweets included)
	// decodeURIComponent(user_name) + 
	s += '</p>';
	//s += '&mdash; ' + '@' + decodeURIComponent(user_name); //Hail Bard (@hailbard) 
	s += decodeURIComponent(user_name) + ' '; //Hail Bard (@hailbard) 
	s += '<a href="https://twitter.com/' + user_screen_name + '/status/' + tweet_id + '">' + '@' + decodeURIComponent(user_screen_name) + '</a>';
	s += '<div class="embedded-tweet-number-followers">' + numberFollowers + '</div>';
	//<a href="https://twitter.com/hailbard/status/674063022617300992">December 8, 2015</a>
	s += '</blockquote>';
	s += '</div>'; 
	s += '<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>';

	return s;

// <blockquote class="twitter-tweet" lang="en">
// 	<p lang="en" dir="ltr">
// 		mnf,cowboy,redskin: Sentiment 0.0 (interval 2.0 minutes, 48 tweets included)
// 	</p>
// 	&mdash; Hail Bard (@hailbard) <a href="https://twitter.com/hailbard/status/674063022617300992">December 8, 2015</a></blockquote>
// <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

}

var pickedTweetArea = $("#picked-favorites-area");

var maybeInterestingArea = $("#maybe-interesting-area");

function addInterestingTweet(tweet) {

  if (!isPaused) {
    //maybeInterestingArea.prepend(getRowForInterestingTweet(tweet));
    containerElementInteresting.prepend(getDivRowTweetForInteresting(tweet));
  }

}

function addPickedTweet(user_name, user_screen_name, tweet_text,tweet_id, numberFollowers) {

	pickedTweetArea.prepend(getTextForPickedTweet(user_name, user_screen_name, tweet_text,tweet_id, numberFollowers));

}

$('body').on('click', '.remove-picked', function() {
	var tweet_id = $(this).attr("tweet_id");
	var el = $(".picked-tweet-wrapper[tweet_id='" + tweet_id + "']");
	el.remove();

	//set the other one to not picked
	var elrawTweet = $(".pick-favorite[tweet_id='" + tweet_id + "']");
	elrawTweet.attr("is-picked","false");


});

 $('body').on('click', '.pick-favorite', function () {

 	var el = $(this);
 	if (el.attr("is-picked")!=="true") {
	 	var user_name = el.attr("user_name");
	 	var user_screen_name = el.attr("user_screen_name");
	 	var tweet_id = el.attr("tweet_id");
	 	var tweet_text = decodeURIComponent(el.attr("tweet_text"));
	 	var numberFollowers = decodeURIComponent(el.attr("number_followers"));
		addPickedTweet(user_name, user_screen_name, tweet_text,tweet_id, numberFollowers);
		el.attr("is-picked","true");
	}

 });

//not sure we need to do this anymore...
var requestAnimFrame = (function(){
          return  window.requestAnimationFrame       || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame    || 
                  window.oRequestAnimationFrame      || 
                  window.msRequestAnimationFrame     || 
                  function(/* function */ callback, /* DOMElement */ element){
                    window.setTimeout(callback, 1000 / 60);
                  };
    })();

var theTermsRegExp = [];
var sourceTerms = new EventSource("/terms/"); 
var isPaused = false;
var pendingTweets = [];

var overArchingCntainerElement = $('#initial-tweet-container');
var containerElement = $('#tweet-table tbody');
var containerElementSpoken = $('#spoken-tweet-table tbody');

var containerElementInteresting = $('#interesting-tweet-table tbody');

var horizontalTickersDiv = $("#tickers");
var horizontalTickers = [];


var currentTickerIndex=0; //loop through the tickers
var numberTickers = 0; //this is making my stomach hurt... 1; //TODO need to pretty this up
var lastTicker = null;
for (var i=0;i<numberTickers;i++) {
	//console.log("Added ticker")
	var hTicker = $("<table/>").addClass("horizontal-ticker");
	//$('#horizontal-ticker-' + i);
	hTicker.css("top",(10 + 50*i) + "px");
	hTicker.indexes = [];
	horizontalTickersDiv.append(hTicker);
	horizontalTickers.push(hTicker);
	lastTicker = hTicker;
}

if (lastTicker) {
	overArchingCntainerElement.css("top", (40 + (lastTicker.height() + lastTicker.position().top)) + "px");
}
else {
	//don't do this anymore... overArchingCntainerElement.css("top", 50 + "px");
}

// [0,1,2,3].forEach(function(i) {
// 	horizontalTickers.push($('#horizontal-ticker-' + i));
// });
//var horizontalTicker = $('#horizontal-ticker');
var currentIndex = 0; //keeping up with ones added
var gIsAddingFromOnMessage = false;

//set up some stuff with tags input here... when I was going to use tags

function sendBasedOnCurrent() {

  var terms = [];
  $(".current-term").each(function(d) {
    terms.push( $(this).text());
  });
  sendNewTerms(terms);

}

returnedStuff.addTerm = function(term) {

  //get current terms
  var terms = [];

  terms.push(term);
  $(".current-term").each(function(d) {
    terms.push( $(this).text());
  });

  // d3.selectAll(".current-term").each(function(d) {
  //   console.log(d);
  //   terms.push(d);
  // });

  //create new thing
  sendNewTerms(terms);

};


var tags$ = $("#current-terms-tags");

tags$.on('itemRemoved', function(event) {
  // event.item: contains the item
  console.log("terms after the remove",tags$.tagsinput('items'));
  var terms = tags$.tagsinput('items');
  var termsHash = {};
  terms.forEach(function(t) {if (t !== event.item) {termsHash[t.trim()]=t.trim();}});
  terms = Object.keys(termsHash);

  sendNewTerms(terms);

});

function sendNewTerms(terms) {

  var params;

  // if (!terms) {
  //   terms = tags$.tagsinput('items');
  // }
  params = encodeURIComponent(terms.join('\t'));

  //$("#what-sent-to-server").html(params);

  console.log("Sending params",params);
  var url = "http://localhost:8080/setterms?theterms=" + params;
  d3.xhr(url)
    .get(function(error, data) {
      console.log(data);
    });
}

tags$.on('beforeItemAdd', function(event) {
  console.log("before itemAdd: " + event.item + ", gIsAddingFromOnMessage = " + gIsAddingFromOnMessage);
  var terms = tags$.tagsinput('items');
  if (terms.indexOf(event.item) <0) {
    terms.push(event.item);
  }
  var termsHash = {};
  terms.forEach(function(t) {termsHash[t.trim()]=t.trim();});
  terms = Object.keys(termsHash);
  // event.item: contains the item
  // event.cancel: set to true to prevent the item getting added
  // if (gIsAddingFromOnMessage) {

  // }
  // else {
      //gather up the current terms and send them in
      sendNewTerms(terms);

});


$("#current-terms").on("click",".current-term-btn",function() {
  //console.log("remove one: " + $(this).text());
  $(this).remove();
  sendBasedOnCurrent();  
});


sourceTerms.onmessage = function(e) {

	console.log("e.data", e.data);


	var theArray = e.data.split(",");

  $("#current-terms").html("");
  if ( (theArray.length > 0) && (theArray[0].trim().length>0)) {
  	$("#current-terms").html(theArray.map(function(t) {
  		// return "<span class='highlighted'>" + decodeURIComponent(t) + "</span>";		
      return "<div class='current-term-btn btn btn-primary btn-sm'>" + 
              '<div class="current-term">' + decodeURIComponent(t) + "</div>" +
              '<span class="remove-current-term glyphicon glyphicon-remove" aria-hidden="true"></span>' +
              "</div>";    
  	}).join("&nbsp;"));
  }

  //don't add them here... but could be a sync issue
  // $("#current-terms-tags").tagsinput('removeAll');
  // theArray.forEach(function(tag) {
  //   gIsAddingFromOnMessage=true;
  //     $("#current-terms-tags").tagsinput('add', tag);
  //   gIsAddingFromOnMessage=false;
  // });

	//ignore the ones with "-", remove the "+" in front of any
	theTermsRegExp = e.data.split(",")
							.map(function(t) {return decodeURIComponent(t.trim()).replace('+','');})
							.filter(function(t) {return !(t.startsWith('-'));}) 
							.map(function(t) {var term = t;
												return {
													regexp:new RegExp(term,'gi'),
													newterm:"<span class='highlighted'>" + term + "</span>"
														};
												});

	// this seems to be working... console.dir(theTermsRegExp);	
};

var urlFavorite = "https://twitter.com/intent/like?tweet_id=";
var urlUserInfo = "https://twitter.com/intent/user?screen_name=";

var lastCall_ms; //  = (new Date()).getTime();
var pxPerSecond = 250;

function moveTicker() {

	var current_ms = (new Date()).getTime();

	lastCall_ms = lastCall_ms || current_ms;

	horizontalTickers.forEach(function(horizontalTicker,i) {
		var currentLeft = horizontalTicker.position().left;

		var newLeft = currentLeft - (pxPerSecond + i*25) * (current_ms - lastCall_ms)/1000;
		horizontalTicker.css("left",newLeft);
	});

	lastCall_ms = (new Date()).getTime();

	if (!isPaused) {
		requestAnimFrame(moveTicker);
	}

}



lastCall_ms = (new Date()).getTime();
requestAnimFrame(moveTicker);


//var maxFontSize = 200;
//var minFontSize = 75;
function getFontPercentString(numberFollowers) {

	//I have no idea how to scale this...
	//10% every 10k?
	// var theFollowerCount = Math.min(20000, numberFollowers)
	//dropping this for the moment
	//return "100%"; //(Math.min(250,Math.floor((100 * (1 + (numberFollowers/20000)))))) + "%";
	//return  (Math.min(250,Math.floor((100 * (1 + (numberFollowers/20000)))))) + "%";
	//250 seems too large
	return  (Math.min(150,Math.floor((100 * (1 + (numberFollowers/20000)))))) + "%";

}
function getStyleBasedOnFollowers(numberFollowers) {

	var maxF = 20000; //play with this I guess
	var theFollowerCount = Math.min(maxF, numberFollowers);
	var r = Math.floor ((-255/maxF) * (theFollowerCount) + 255);

	//TODO - what are valid values for this?
	//look up values...
	var fw = 400 + 100 * Math.floor (3 * (theFollowerCount/maxF));

	var b = "background:rgb(255, " + r + ", " + r + ")"; 

	fw = "font-weight:" + fw;

	return "";
	// return b + ";" + fw;

}

//this is the thing that should calculate the "surprise"/whatever
//start with english dictionary corpus first?
//or just build up corpus
//NOTE - moved to webworker
function getInterestingValueForTweetText(text) {

}

var el_numberTweets = $('.number-tweets');
var el_tweetsPerMinute = $('.tweets-per-minute');
var el_wordsperTweet = $('.words-per-tweet');
var el_wordsPerMinute = $('.words-per-minute');
var el_wordsPerMinuteSpoken = $('.words-per-minute-spoken');

function updateStatsDisplay(stats) {

	var numDigits = 0;
	el_numberTweets.html(stats.numberTweets);
	var s = (stats.numberTweets!==0) ? (stats.numberWordsInTweets/stats.numberTweets).toFixed(numDigits) : "NA";
	el_wordsperTweet.html(s);

	var now_ms = (new Date()).getTime();

	var howLong_ms = now_ms - me.timeStarted_ms;

	var howLong_minutes = howLong_ms/1000/60;

	if ((stats.numberTweets !==0) && (howLong_ms>0)) {

		var wordsPerMinute = stats.numberWordsInTweets/(howLong_minutes);
		el_wordsPerMinute.html(wordsPerMinute.toFixed(numDigits));

		var tweetsPerMinute = stats.numberTweets/(howLong_minutes);
		el_tweetsPerMinute.html(tweetsPerMinute.toFixed(numDigits));


	}
	else {
		el_wordsPerMinute.html("NA");
		el_tweetsPerMinute.html("NA");
	}

	if ((stats.numberTweetsSpoken !==0) && (howLong_ms>0)) {
		var wordsPerMinuteSpoken = stats.numberTermsSpoken/(howLong_ms/1000/60);
		el_wordsPerMinuteSpoken.html(wordsPerMinuteSpoken.toFixed(numDigits));

	}
	else {
		el_wordsPerMinuteSpoken.html("NA");
	}

	// me.stats.numberTweetsSpoken++;
	// me.stats.numberTermsSpoken += numberWordsInTweet;



}

//say the tweet, if nothing being said already
function getFunctionForDoneSayingTweet(indexOfNumberTweetsSpoken) {
  
  var f = function doneSayingTweet() {
      var current = me.stats.numberTweetsSpoken;
      console.log("doneSayingTweet called: " + indexOfNumberTweetsSpoken + " (current is " + me.stats.numberTweetsSpoken + ")");
      if (indexOfNumberTweetsSpoken === current) {
        me.isSayingTweet = false;
      }
    };
  return f;
}


//this written later after I added the "maybe interesting" area
//I want to basically format like the other two
function getDivRowTweetForInteresting(tweet) {

    // divTweet = $("<td class='tweet-text'>" + 
    //           "<div class='pick-favorite' user_screen_name='" + encodeURIComponent(tweet.user_screen_name) + "' " +
    //               " user_name='" + decodeURIComponent(tweet.user_name) + "' " +
    //               " tweet_id='" + id_str + "' " +
    //               " number_followers='" + numberFollowers + "' " +
    //               " tweet_text='" +  encodeURIComponent(originalText.replace(/'/g, "&#39;")) + "' "  +
    //               " href='" + urlFavorite + id_str + "'>" +
    //           verifiedInfo + colorify(conciseText + " (" + addCommas(numberFollowers) + " followers)") +
    //           "</div>" +
    //           "</td");


    var currentCount = ++me.stats.numberTweetsMaybeInteresting;

    if (currentCount % me.maxInList === 0) {

      removeOldOnesFromList(".basic-row.maybe-interesting", 
                  "the-index", 
                  currentCount-me.maxInList);

    }

    //Needed fields here
    //tweet.id_str
    //tweet.text
    //tweet.followers
    //tweet.verified
    //tweet.interest_score

    //console.dir(tweet);

    var divRow = $("<tr class='row basic-row maybe-interesting' tweet-id='" + tweet.id_str + "'></tr>");
    divRow.attr("the-index", currentCount);

    var numberFollowers = Number(tweet.followers);

    var verifiedInfo = "";
    if (tweet.verified) {
      verifiedInfo +=  '<span class="verified fa fa-certificate"></span>' +
                '<span class="verified-check fa fa-check"></span>'; //' "VERIFIED <span class='Icon Icon--verified Icon--small'>" + "\f099" + "</span>";
    }

    var conciseText = makeTweetTextForConciseTextDisplay(tweet.text);

    var divTweet = $("<td class='tweet-text'>" + 
              "<div class='pick-favorite' " +
                  " tweet_id='" + tweet.id_str + "' " +
              "'>" +
              verifiedInfo + colorify("[" + tweet.interest_score.toFixed(2) + "] " + conciseText + " (" + addCommas(numberFollowers) + " followers)") +
              "</div>" +
              "</td");

    divRow.append(divTweet);

    return divRow;

}

function handleTweet(data) {

	var thisIndex = ++currentIndex;
	var id_str = data.id_str;
	var didSayIt = data.didSayIt;
	var numberFollowers = Number(data.followers);

	var numberWordsInTweet = Number(data.numberWordsInTweet);

	me.stats.numberTweets ++;
	me.stats.numberWordsInTweets += numberWordsInTweet;



	updateStatsDisplay(me.stats);

	//don't back up right now to add back later...
	if (isPaused) {
		// if (didSayIt) {
			pendingTweets.push(data);
		// }
		return;
	}

//TODO - positive only

	var polarity = Number(data.polarity);



	var fontPercent = getFontPercentString(numberFollowers);
	//var divRow = $("<tr class='basic-row' index='" + thisIndex + "' tweet-id='" + id_str + "'></tr>");

	var ss = "style='";
	ss += "font-size:" + getFontPercentString(numberFollowers) + ";";
	ss += getStyleBasedOnFollowers(numberFollowers) + ";";
	ss += "'";
	var divRow = $("<tr " + ss + " class='row basic-row' index='" + thisIndex + "' tweet-id='" + id_str + "'></tr>");

	//divRow.addClass(that.getSentimentClass(polarity));
	that.updateSentimentBar(polarity);

	// var divTable = $("<table class='basic-row-table'")

	var text = decodeURIComponent(data.text);

  text = handleUserReferencesInTweet(text); //removes "@username" if option set to do that
	var originalText = text;

	var conciseText = makeTweetTextForConciseTextDisplay(originalText);
	var moreConversationalText = makeTweetMoreConversational(originalText);


	// console.log(text);
	theTermsRegExp.forEach(function(theTerm) {
		text = text.replace(theTerm.regexp,theTerm.newterm);
	});
	// console.log(text);

	// var screenName = $("<td class='tweet-user-name' tweet-id='" + id_str + "'>" +
	// 					"<a href='" + urlUserInfo + data.user_screen_name + "'>" + data.user_name + "</a>" +
	// 					"<br/>" +
	// 					// "<div class='pick-favorite' user_screen_name='" + data.user_screen_name + "' " +
	// 					// 		" user_name='" + data.user_name + "' " +
	// 					// 		" tweet_id='" + id_str + "' " +
	// 					// 		" number_followers='" + numberFollowers + "' " +
	// 					// 		" tweet_text='" +  encodeURIComponent(originalText.replace(/'/g, "&#39;")) + "' "  +
	// 					// 		" href='" + urlFavorite + id_str + "'>" +
	// 					// 		"<span class='glyphicon glyphicon-pushpin'></span></div>" +
	// 					"<div class='number-followers'>(" + addCommas(numberFollowers) + ")</div>" +
	// 					"</td>");

	// divRow.append(screenName);


 // 	var followInfo = $("<td class='follower-info' tweet-id='" + id_str + "'>" +
	// 					addCommas(numberFollowers) +
	// 					"</td>");
	// divRow.append(followInfo);

	//this needs to instead move the tweet over...


	// var user_name = el.attr("user_name");
 // 	var user_screen_name = el.attr("user_screen_name");
 // 	var tweet_id = el.attr("tweet_id");
 // 	var tweet_text = decodeURIComponent(el.attr("tweet_text"));

	//strInputString.replace(/'/g, "''");

	// var favTweet = $("<td class='do-favorite' tweet-id='" + id_str + "'>" +
	// 					"<div class='pick-favorite' user_screen_name='" + data.user_screen_name + "' " +
	// 							" user_name='" + data.user_name + "' " +
	// 							" tweet_id='" + id_str + "' " +
	// 							" number_followers='" + numberFollowers + "' " +
	// 							" tweet_text='" +  encodeURIComponent(originalText.replace(/'/g, "&#39;")) + "' "  +
	// 							" href='" + urlFavorite + id_str + "'>" +
	// 							"<span class='glyphicon glyphicon-pushpin'></span></div>" +
	// 					//"<a href='" + urlFavorite + id_str + "'><span class='glyphicon glyphicon-heart'></span></a>" +
	// 					"</td>");

	// divRow.append(favTweet);

	//TODO - datatable so you can search/filter in the table = see what I did for the emoji thing

	var screenNamePart = "";
	var divTweet = "";

	var verifiedInfo = "";
	//console.log(data.verified);
	if (data.verified) {
		verifiedInfo +=  '<span class="verified fa fa-certificate"></span>' +
							'<span class="verified-check fa fa-check"></span>'; //' "VERIFIED <span class='Icon Icon--verified Icon--small'>" + "\f099" + "</span>";
	}

	if (me.doShowUserInfo) {

		screenNamePart = "<div class='tweet-user-name' tweet-id='" + id_str + "'>" +
						"&#8212;<a class='user-name-link' href='" + urlUserInfo + data.user_screen_name + "'>" + decodeURIComponent(decodeURIComponent(data.user_name)) + "</a>" +
						// "<div class='pick-favorite' user_screen_name='" + data.user_screen_name + "' " +
						// 		" user_name='" + data.user_name + "' " +
						// 		" tweet_id='" + id_str + "' " +
						// 		" number_followers='" + numberFollowers + "' " +
						// 		" tweet_text='" +  encodeURIComponent(originalText.replace(/'/g, "&#39;")) + "' "  +
						// 		" href='" + urlFavorite + id_str + "'>" +
						// 		"<span class='glyphicon glyphicon-pushpin'></span></div>" +
						" <div class='number-followers'>(" + addCommas(numberFollowers) + " followers)</div>" +
						"</div>";


		divTweet = $("<td class='tweet-text'>" + 
							"<div class='pick-favorite' user_screen_name='" + encodeURIComponent(data.user_screen_name) + "' " +
									" user_name='" + data.user_name + "' " +
									" tweet_id='" + id_str + "' " +
									" number_followers='" + numberFollowers + "' " +
									" tweet_text='" +  encodeURIComponent(originalText.replace(/'/g, "&#39;")) + "' "  +
									" href='" + urlFavorite + id_str + "'>" +
							verifiedInfo + colorify(conciseText) +
							"</div>" +
							screenNamePart +
							"</td");
	}
	else {

		//screenNamePart = " <div class='number-followers'>(" + addCommas(numberFollowers) + " followers)</div>";
		divTweet = $("<td class='tweet-text'>" + 
							"<div class='pick-favorite' user_screen_name='" + encodeURIComponent(data.user_screen_name) + "' " +
									" user_name='" + decodeURIComponent(data.user_name) + "' " +
									" tweet_id='" + id_str + "' " +
									" number_followers='" + numberFollowers + "' " +
									" tweet_text='" +  encodeURIComponent(originalText.replace(/'/g, "&#39;")) + "' "  +
									" href='" + urlFavorite + id_str + "'>" +
							verifiedInfo + colorify(conciseText + " (" + addCommas(numberFollowers) + " followers)") +
							"</div>" +
							"</td");


	}




	//					"<a class='ignore-see-tweet pick-favorite' href='" + urlUserInfo + data.user_screen_name + "'>" + conciseText + "</a></td>");
	divRow.append(divTweet);


//TODO - look at styling on tweet to better style left side
//TODO - prevent width overrun
//TODO - be able to specify max rate for display - it's really a minimum
//			delay between tweets to show
//TODO - look at doing the slide-down thing...
//DONE - be able to remove "picked" tweets - wrap in new item thing...
//TODO - show dummy things for more styling tweaks

	// var divNameAndLike = $("<div class='col-md-2'>");
	//screen name
	// var screenName = $("<td class='' tweet-id='" + id_str + "'>" +
	// 					"<a href='" + urlUserInfo + data.user_screen_name + "'>" + data.user_screen_name + "</a>" +
	// 					"</td>");

	// divRow.append(screenName);

	// target='_blank'
	// var favTweet = $("<td class='btn btn-xs do-favorite' tweet-id='" + id_str + "'>" +
	// 					"<a href='" + urlFavorite + id_str + "'><span class='glyphicon glyphicon-heart'></span></a>" +
	// 					"</td>");

	// divRow.append(divNameAndLike);


	//divRow.append(favTweet);
	// var followInfo = $("<td class='follower-info' tweet-id='" + id_str + "'>" +
	// 					addCommas(numberFollowers) +
	// 					"</td>");



	// var tweetText = emoji.replace_unified(
 //                        twttr.txt.autoLink(text, {
 //                          ignoreurlEntities: tweet.links,
 //                          usernameIncludeSymbol: true,
 //                          targetBlank: true
 //                              })
 //                        );

	//var divTweet = $("<td style='font-size:" + getFontPercentString(numberFollowers) + ";' class='tweet-text'>" + text + "</td>");



	var now_ms = (new Date()).getTime();
	if  ((me.doSayTweet === true) && (me.speechSynthesisReady===true)) {
		//console.log(me.isSayingTweet);

		//If the person has more than N followers, we interrupt and say it

		var isOverride = false;
		//(data.verified) || 
		if ( (numberFollowers > me.numberFollowersToInterrupt)) {

			isOverride = true;
			console.log("Will override speaking");

		}

    if (now_ms > gLastSayIt_ms + gSayItMaxDifference_ms) {
    
      console.log("Been too long - will say tweet");

    }

    if (me.isSayingTweet) {
      console.log("me.isSayingTweet...");
    }

		if ( (isOverride) ||
				(!me.isSayingTweet) ||
	         	(now_ms > gLastSayIt_ms + gSayItMaxDifference_ms) //in case child process gets stuck                
			)			
		{
			me.isSayingTweet = true;
			gLastSayIt_ms = now_ms;
			// 		if (didSayIt) {
			// screenName.addClass("did-say-it");
			// followInfo.addClass("did-say-it");
			// favTweet.addClass("did-say-it");
			// divTweet.addClass("did-say-it");
			divRow.addClass("did-say-it");

			var currentCount = ++me.stats.numberTweetsSpoken;
			me.stats.numberTermsSpoken += numberWordsInTweet;

			divRow.attr("the-index", currentCount);

			// 		}
			//TODO - remove more junk from tweet
			//var moreConversationalText = makeTweetMoreConversational(originalText);
			// console.log("Say tweet...");
			containerElementSpoken.prepend(divRow);

			if (currentCount % me.maxInList === 0) {

				removeOldOnesFromList(".basic-row.did-say-it", 
										"the-index", 
										currentCount-me.maxInList);

			}



			me.sayTweet(moreConversationalText, getFunctionForDoneSayingTweet(currentCount));
			// setTimeout(function() {
			// 					me.sayTweet(moreConversationalText, doneSayingTweet);
			// 					},10); //let's move on
		}
		else {
			divRow.addClass("did-not-say-it");
			containerElement.prepend(divRow);

			if (thisIndex % me.maxInList === 0) {
				removeOldOnesFromList(".basic-row.did-not-say-it", 
										"index",
										thisIndex-me.maxInList);
			}

		}
	}
	else {
		containerElement.prepend(divRow);
	}

	if (numberTickers>0) {
		horizontalTickers[currentTickerIndex].append(divRow
								.clone()
								.addClass("horizontal-tweet")
								.attr("ticker-index",currentTickerIndex));
		//these are the ones that were used for here
		horizontalTickers[currentTickerIndex].indexes.push(thisIndex);
		currentTickerIndex++;
		if (currentTickerIndex>=numberTickers) {currentTickerIndex=0;}
	}

//TODO - this may not yet work when there is more than one ticker
	//100 per ticker before we start removing
	if ((numberTickers>0) && (thisIndex % (100 * numberTickers) === 0)) {

			doPause(); //top the world for the moment we do this
						//will see if it cases an issue

			horizontalTickers.forEach(function(hTicker,hTickerIndex) {
			//get the left just to the right of where we're going to remove

			var indexInIndexes = horizontalTickers[currentTickerIndex].indexes.length - 100;
			//if this is > 0, then we do stuff

			if (indexInIndexes > 0 ) {
				var idOfOneToKeep = horizontalTickers[currentTickerIndex].indexes[indexInIndexes + 1]; // + thisIndex - 100;
				var firstOneToKeep = $(".basic-row[index=" + idOfOneToKeep + "]");
				var newLeft;
				if (firstOneToKeep) {
					//TODO! - get left in same coordinate system as its container
					newLeft = firstOneToKeep.position().left;
				}
				//this will get them all for all of the tickers
				//the trick is to find the one in each ticker that
				//is right to the right of the last one that's about to be removed
				$(".basic-row[ticker-index="+hTickerIndex+"]").filter(function() {
						var t = $(this);
						//var tickerIndex = t.attr("ticker-index");
						var index = t.attr("index");
						var didSayIt = t.hasClass("did-say-it");
		    			return (!didSayIt) && (index < idOfOneToKeep);
				}).remove();
				if (firstOneToKeep) {
					hTicker.css("left",newLeft);
				}
			}

			doUnPause();
	});
	}
}

//used to purge the list of spoken/unspoken list
function removeOldOnesFromList(selector, attributeForIndex,  minIndex) {
	//console.log("removeOldOnesFromList : " + selector + ", " + minIndex);
	$(selector).filter(function() {

		var t = $(this);
		//var tickerIndex = t.attr("ticker-index");
		var index = Number(t.attr(attributeForIndex));

		return (index < minIndex);

	}).remove();
}

function showPendingTweets() {

	var theTweets = pendingTweets.splice(0,pendingTweets.length);
	theTweets.forEach(function(tweet) {
		handleTweet(tweet);
	});

}


function doPause(isManual) {
	if ( (me.currentPauseIsManual===true)) {

		//we're already paused - this is also intended to avoid unsetting the manual pause		
		return;
	}

	isManual = (isManual===true); //this is the only way
	me.currentPauseIsManual = isManual;
	isPaused = true;
    $('#btnPause .glyphicon').removeClass('glyphicon-pause').addClass('glyphicon-play');
}
function doUnPause(isManual) {
	isManual = (isManual===true); //this is the only way
	if ( (me.currentPauseIsManual===true) && (isManual!==true)) {
		return; //requires a manual click to do it
	}
	isPaused = false;
	me.currentPauseIsManual = false;
	showPendingTweets();
	lastCall_ms = (new Date()).getTime();
    $('#btnPause .glyphicon').removeClass('glyphicon-play').addClass('glyphicon-pause');
	requestAnimFrame(moveTicker);
}
// $('#initial-tweet-container, .horizontal-ticker').on("mouseenter", function() {
// 	doPause();
// });
$('.tweet-table').on("mouseenter", function() {
	doPause();
});
//$('#initial-tweet-container, .horizontal-ticker').on("mouseleave", function() {
$('.tweet-table').on("mouseleave", function() {
	doUnPause();
	// isPaused = false;
	// showPendingTweets();
	// lastCall_ms = (new Date()).getTime();
	// requestAnimFrame(moveTicker);

});

//TODO - handle better for getting element name
returnedStuff.setIsPaused = function(bValue) {
	//whether we are setting/unsetting via a manual click,
	//	which requires a manual click to unpause it
	if (bValue) 
		{doPause(true);} 
	else 
		{doUnPause(true);}

};

returnedStuff.getIsPaused = function() {
    return isPaused;
};



me.last_second_events = [];

me.tweets_per_second_div = $('.tweets-per-last-second');
me.tweets_per_second_bar = $('#raw-tweets-per-second-bar');

// seeing if this is what is hanging it
var source = new EventSource("/tweets/"); 
source.onmessage = function(e) { 


	//update display about current raw rate...

	//see about throttling things
	var now_ms = (new Date()).getTime();

	//we want to update the count in the last second/minute/whatever
	//why is this trickier than I thought?

	// var the_sec = (now_ms/1000).toFixed(0);
	// me.last_second_events.push({second:the_sec, when:now_ms});

	// me.last_second_events = me.last_second_events.filter(function(event) {
	// 	return event.when >= now_ms - 1000;
	// });

	// me.tweets_per_second_div.html(me.last_second_events.length);
	// me.tweets_per_second_bar.css('width',me.last_second_events.length + 'px');

    //var now_ms = (new Date()).getTime();

    //TODO - get the current second from the tweet itself

	var data = JSON.parse(e.data);


    //'data: "timestamp_ms":' + tweet.timestamp_ms + ',\n' +
    var tweet_timestamp_ms = Number(data.timestamp_ms);
    var currentSecond = Math.floor(tweet_timestamp_ms/1000);

    if(!me.valueInSecond[currentSecond]) {
          me.valueInSecond[currentSecond] = 0;
    }
    me.valueInSecond[currentSecond]++; //need to be able to remove these...      

    //we send it to the ponderer no matter what
    data.text_decoded = decodeURIComponent(data.text);

    sendNewTweetToPonderer({text: data.text_decoded, id_str: data.id_str,
                              followers: Number(data.followers),
                              verified: data.verified});

  // me.heartYou.addNewTweet(data);

	if (now_ms - me.time_last_tweet_process_ms > me.min_gap_between_tweets_ms) {

		me.time_last_tweet_process_ms = now_ms;
		//console.dir(e);
		// console.dir(data);

		handleTweet(data);

	}
}; 


that.resetSentimentBar(); //set it up...

//TODO - border color is distracting and hard to pick out for "did say it" - 
// what about just changing the background color
//			to indicate it was spoken
function doTestTweet() { 

          // clients[clientId].write('data: ' + '{\n' +
          //                         'data: "text": "'+ encodeURIComponent(cleanedTweet) + '", \n' +
          //                         'data: "didSayIt":' + tweet.didSayIt + ',\n' +
          //                         'data: "valence":"' + cst.data.valence + '",\n' +
          //                         'data: "polarity":' + cst.data.polarity + ',\n' +
          //                         'data: "id_str":"' + tweet.id_str + '",\n' +
          //                         'data: "user_name": "' + user.name + '", \n' +
          //                         'data: "user_screen_name": "' + user.screen_name + '", \n' +
          //                         'data: "followers":"' + user.followers_count + '",\n' +
          //                         'data: "tweets_per_day":"' + tweetsPerDay + '",\n' +
          //                         'data: "tweets_since":"' + ((1+userCreatedDate.getMonth()) + "/" + userCreatedDate.getFullYear() ) + '"\n' +
          //                         'data: }\n\n'); // <- Push a message to a single attached client

	var pseudotweet = {text: "Some trump stuff, long stuff here",
						polarity: 5* (Math.random() - 0.5),
						id_str: "222",
						user_name: "user name",
						user_screen_name: "userscreenname",
						followers:Math.floor(Math.random()*20000)
						};	
	if (Math.random()<0.33) {
		pseudotweet.polarity=0;
	}
	handleTweet(pseudotweet);
}

returnedStuff.doTestTweet = function() {
	doTestTweet();
};

returnedStuff.setDoColorify = function(val) {
	me.doColorify = (val===true);
};


returnedStuff.setDoShowUserInfo = function(val) {
	me.doShowUserInfo = (val===true);
};

returnedStuff.setDoShowUserReferences = function(val) {
  me.doShowUserReferences = (val===true);
};



returnedStuff.setMinDiffBetweenHandlingTweets_ms = function(val) {
	me.min_gap_between_tweets_ms = Number(val);
};

returnedStuff.setFollowerThresholdToInterrupt = function(val) {
	me.numberFollowersToInterrupt = Number(val);
	console.log("Set numberFollowersToInterrupt = " + me.numberFollowersToInterrupt);
};

function tellPondererToUpdateInterestThreshold() {
  if (me.ponderTweetsWorker) {
    me.ponderTweetsWorker.postMessage({"cmd": "change-interest-threshold","value": me.threshold_of_interest});
  }
}

returnedStuff.setInterestThreshold = function(val) {
  me.threshold_of_interest = Number(val);
  tellPondererToUpdateInterestThreshold();
};

returnedStuff.setHeartYou = function(heartYou) {

  me.heartYou = heartYou;

};

//TODO - green text color against that light background?



me.timeStarted_ms = (new Date()).getTime();
me.time_last_tweet_process_ms = me.timeStarted_ms - me.min_gap_between_tweets_ms - 1000; 
//so we start getting them right away


updateStatsDisplay(me.stats);

me.makeLiveChart();

//doTickForLiveChartUpdate();

requestAnimFrame(doTickForLiveChartUpdate);


//var urlNewLine = "%0D%0A";

 var entityMap = {
                "&": "%26",
                "<": "%3C",
                ">": "%3E",
                '"': '%22',
                "'": '%27',
                "/": '%2F;'
              };

function escapeHtml(string) {
          var s =  String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
          });
          
          return s;
          
}

//this is not going to work - you can't create an html email with client javascript
//I need to be able to save it
returnedStuff.doEmailPickedTweets = function() {

  //grab the html for all of the ".picked-tweet-wrapper" things
  //and see about just shoving it in the email?
  //or... just grab the full contents of "#picked-favorites-area"

          var html = $("#picked-favorites-area").html();
          var subject = "Picked tweets"; //sTitle + " (" + moment().format('MMMM Do YYYY, h:mm:ss a') + ")";
          window.open("mailto:?subject=" + subject + "&body=" + html); //escapeHtml(html));   

};

me.ponderTweetsWorker = new Worker("scripts/pondertweets.js");
tellPondererToUpdateInterestThreshold(); //sends current value...

me.ponderTweetsWorker.addEventListener('message', function(e) {

  var data = e.data;

  //console.log("message back");
  //console.log('Worker said: ', e.data);
  //console.log("cmd: " + e.data.cmd);

  if (data.cmd === "info-message") {
      console.log("Info: " + e.data.msg);
  }
  else if (data.cmd === "interest-stats") {

    var theQuantiles = data.quantiles;
    var s = "<table class='table table-condensed interest-initial-stats'>";

    var sQ = "";
    var sQuantile = "";
    if (theQuantiles.length >0) {
      theQuantiles.forEach(function(thing) {

        sQ += "<td>" + thing.q.toFixed(2) + "</td>";
        sQuantile += "<td>" + thing.quantile.toFixed(2) + "</td>";

      });
    }

    s += "<tr>" + sQ + "</tr>";
    s += "<tr>" + sQuantile + "</tr>";
    s += "</table>";
    $("#interest-stats-area").html(s);

  }
  else if (data.cmd === "interesting-tweet") {

    //we should be getting the text and the id_str

    var tweet = data.tweet;
    // var text = tweet.text;
    // var id_str = tweet.id_str;
    // var interest_score = tweet.interest_score;

    // console.log("interesting tweet: " + text);
    // console.log("interest_score: " + tweet.interest_score);

    addInterestingTweet(tweet);

  }

}, false);

me.ponderTweetsWorker.postMessage({'cmd': 'start'});

function sendNewTweetToPonderer(tweet) {
  me.ponderTweetsWorker.postMessage({'cmd': 'new-tweet', 'tweet': tweet});
                                            // {'text': tweet.text, 
                                            //   'id_str': tweet.id_str}});
}


var testForConversational = [];
testForConversational.push('And he said "yes man" he did');
testForConversational.forEach(function(msg) {
  console.log("Before: " + msg);
  console.log("After:  " + makeTweetMoreConversational(msg));
});

return returnedStuff;

} //BardClient
