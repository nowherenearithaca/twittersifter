'use strict';

//module.exports = SmsLingo;

/**
 * Initialize
 */
function SmsLingo() {
    this.mapping = {
        '@': 'at',
        'b': 'be',
        'c': 'see',
        'd': 'the',
        'k': 'okay',
        'n': 'and',
        'q': 'queue',
        'r': 'are',
        //ignore this - whew - 't': 'tea',
        'u': 'you',
        'w': 'with',
        'y': 'why',
        'b4': 'before',
        'bf': 'boy friend',
        'cn': 'can',
        'da': 'the',
        'ez': 'easy',
        'fb': 'facebook',
        'gb': 'good bye',
        'gf': 'girl friend',
        'gn': 'good night',
        'h8': 'hate',
        'hv': 'have',
        'hw': 'homework',
        'ik': 'i know',
        'jk': 'just kidding',
        'kk': 'okay',
        'l8': 'late',
        'm8': 'mate',
        'ne': 'any',
        'np': 'no problem',
        'ty': 'thank you',
        'ur': 'your',
        'wl': 'will',
        'yw': 'you are welcome',
        '1ce': 'once',
        'abt': 'about',
        'ack': 'acknowledge',
        'afk': 'away from keyboard',
        'aka': 'also known as',
        'app': 'application',
        'atb': 'all the best',
        'atm': 'at the moment',
        'bff': 'best friend forever',
        'brb': 'be right back',
        'brd': 'bored',
        'brt': 'be right there',
        'btw': 'by the way',
        'chk': 'check',
        'cos': 'because',
        'coz': 'because',
        'cr8': 'create',
        'cuz': 'because',
        'cya': 'see you',
        'der': 'there',
        'diy': 'do it yourself',
        'dnt': 'don\'t',
        'ezy': 'easy',
        'fab': 'fabulous',
        'fwd': 'forward',
        'fyi': 'for your information',
        'g2g': 'got to go',
        'gr8': 'great',
        'gud': 'good',
        'hak': 'hugs and kisses',
        'idc': 'i don\'t care',
        'idk': 'i don\'t know',
        'ilu': 'i love you',
        'imo': 'in my opinion',
        'l8r': 'later',
        'lmk': 'let me know',
        'lol': 'laugh out loud',
        'luv': 'love',
        'msg': 'message',
        'ne1': 'anyone',
        'no1': 'no one',
        'nvr': 'never',
        'oic': 'oh, I see',
        'omg': 'oh my God',
        'pls': 'please',
        'plz': 'please',
        'pov': 'point of view',
        'ppl': 'people',
        'sez': 'says',
        'sry': 'sorry',
        'sup': 'what\'s up?',
        'thx': 'thanks',
        'txt': 'text',
        'w/o': 'without',
        'wen': 'when',
        'wtf': 'what the fuck',
        'wth': 'what the hell',
        '2day': 'today',
        '2mor': 'tomorrow',
        '4get': 'forget',
        'asap': 'as soon as possible',
        'bcos': 'because',
        'bday': 'birthday',
        'cre8': 'create',
        'imho': 'in my humble opinion',
        'lmao': 'laughing my ass off',
        'lolz': 'laughing out loud',
        'njoy': 'enjoy',
        'noob': 'newbie',
        'nsfw': 'not safe for work',
        'rofl': 'rolling on the floor laughing',
        'str8': 'straight',
        'sum1': 'someone',
        'thnq': 'thank you',
        'thnx': 'thanks',
        'ttul': 'talk to you later',
        'ttyl': 'talk to you later',
        'xoxo': 'hugs and kisses',
        '2moro': 'tomorrow',
        '2nite': 'tonight',
        '4ever': 'forever',
        'afaik': 'as far as i know',
        'gonna': 'going to',
        'some1': 'someone'
    };
    return this;
}


/**
 * Check if `abbr` is an abbreviation
 * @param {string} abbr - a word from a statement
 * @returns {Boolean}
 */
SmsLingo.prototype.isAbbr = function(abbr) {
    return abbr in this.mapping;
};


/**
 * Normal Text form for `abb`
 * @param {string} abbr - a word from a statement
 * @returns {string|null}
 */
SmsLingo.prototype.text = function(abbr) {
    abbr = abbr.toLowerCase();
    return this.mapping[abbr] || null;
};


/**
 * Goes through the statement and replaces all the abbreviations with regular text
 * @param {string} statement - abbreviated statement
 * @returns {string|null}
 */
SmsLingo.prototype.statement = function(statement) {
    var re = /[\w]+|@/g;
    var m;

    while ((m = re.exec(statement)) !== null) {
        if (m.index === re.lastIndex) {
            re.lastIndex++;
        }
        var text = this.text(m[0]) || m[0];
        // replacing the statement inside here won't create problems
        // because if the abbr is found the statement will always expand
        // thus there won't by any index that `re` won't go over
        statement = this.replaceBetween(statement, m.index, re.lastIndex, text);

        // adjust the last index;
        re.lastIndex += (text.length - m[0].length);
    }
    return statement.trim();
};


/**
 * Replace the string between given indices with `what`
 * @param {string} str - input string
 * @param {int} start - start index (inclusive)
 * @param {int} end - end index (exclusive)
 * @param {string} what - string to replace with
 * @returns {string}
 */
SmsLingo.prototype.replaceBetween = function(str, start, end, what) {
    return str.substring(0, start) + what + str.substring(end);
};