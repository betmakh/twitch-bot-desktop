const utf8 = require('utf8');
const config = require('./config');
const googleTTS = require('google-tts-api');
const Shell = require('node-powershell');

var fs = require('fs'),
  request = require('request');

var transliterate = function(word) {
  var a = {
    Ё: 'YO',
    Ц: 'TS',
    У: 'U',
    К: 'K',
    Е: 'E',
    Н: 'N',
    Г: 'G',
    Ш: 'SH',
    Щ: 'SCH',
    З: 'Z',
    Х: 'H',
    Ъ: "'",
    ё: 'yo',
    ц: 'ts',
    у: 'u',
    к: 'k',
    е: 'e',
    н: 'n',
    г: 'g',
    ш: 'sh',
    щ: 'sch',
    з: 'z',
    х: 'h',
    ъ: "'",
    Ф: 'F',
    Ы: 'I',
    В: 'V',
    А: 'a',
    П: 'P',
    Р: 'R',
    О: 'O',
    Л: 'L',
    Д: 'D',
    Ж: 'ZH',
    Э: 'E',
    ф: 'f',
    ы: 'i',
    в: 'v',
    а: 'a',
    п: 'p',
    р: 'r',
    о: 'o',
    л: 'l',
    д: 'd',
    ж: 'zh',
    э: 'e',
    Я: 'Ya',
    Ч: 'CH',
    С: 'S',
    М: 'M',
    И: 'yi',
    Т: 'T',
    Ь: "'",
    Б: 'B',
    Ю: 'YU',
    я: 'ya',
    ч: 'ch',
    с: 's',
    м: 'm',
    и: 'yi',
    т: 't',
    ь: "'",
    б: 'b',
    ю: 'yu',
    й: 'i'
  };
  return word
    .split('')
    .map(function(char) {
      return a[char] || char;
    })
    .join('');
};

var SpeachQueue = [];
var sayWin = text => {
  var lang = 'en';
  if (config.transliterate && /[а-яА-ЯЁё]/.test(text)) {
    lang = 'ru-RU';
  }

  return googleTTS(text, lang)
    .then(function(url) {
      let audioPath = 'audioCache/' + Date.now() + '.mp3';
      request
        .get(url)
        .pipe(fs.createWriteStream(audioPath))
        .on('finish', () => {
          var shell = new Shell({
            inputEncoding: 'binary'
          });
          shell.addCommand(`start ./${audioPath}`);
          return shell.invoke().then(output => {
            shell.dispose();
          });
        });
    })
    .catch(function(err) {
      console.error(err.stack);
    });
};

module.exports = sayWin;
