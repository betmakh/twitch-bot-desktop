'use strict';
var config = require('./config');
// var utils = require('./utils');
// var sayWin = require('./sayWin');
// var moment = require('moment');

// sayWin('zalupa');
// sayWin('Я както раз нашел зайца на свалке. А он был пидором и пососал мне хуй');
// var ircClient = require('twitch-irc').client;
// var io = require('socket.io-client');
// var _ = require('underscore');
var tmi = require('tmi.js');
// var fetch = require('node-fetch');
var ahuevshie = {};

var opts = {
  options: {
    debug: true
  },
  connection: {
    reconnect: true
  },
  identity: {
    username: config.USER,
    password: config.PASS
  },
  channels: config.CHANNELS
};

// utils.updateModerators().then(function(data) {
//     console.log('data', data);
// });

// utils.getChannelInfo().then(function(json) {
//     console.log('json', json);
// });

// utils.getJokes().then(function(data) {
//     console.log('data', data);
// }, function(err) {
//     console.log('err', err);
// })

var client = new tmi.client(opts);

// sayWin('latin'); //talk

// sayWin('думаю, "йопта, не падай" не остановит от падения'); //silence

// sayWin('\ufeffкирилица'); //silence

// var testResp = {
//   stream: {
//     _id: 25227057424,
//     game: 'Battlefield 1',
//     viewers: 2,
//     video_height: 720,
//     average_fps: 59.9700149925,
//     delay: 0,
//     created_at: '2017-05-09T13:02:48Z',
//     is_playlist: false,
//     stream_type: 'live',
//     preview: {
//       small: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_betmanenko-80x45.jpg',
//       medium: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_betmanenko-320x180.jpg',
//       large: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_betmanenko-640x360.jpg',
//       template: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_betmanenko-{width}x{height}.jpg'
//     },
//     channel: {
//       mature: true,
//       partner: false,
//       status: 'Аллах акбар [ps4]',
//       broadcaster_language: 'ru',
//       display_name: 'betmanenko',
//       game: 'Battlefield 1',
//       language: 'en',
//       _id: 42210420,
//       name: 'betmanenko',
//       created_at: '2013-04-07T18:06:25Z',
//       updated_at: '2017-05-07T18:02:45Z',
//       delay: null,
//       logo: 'https://static-cdn.jtvnw.net/jtv_user_pictures/betmanenko-profile_image-eac9054f05f8f6c3-300x300.png',
//       banner: null,
//       video_banner: 'https://static-cdn.jtvnw.net/jtv_user_pictures/betmanenko-channel_offline_image-c446c146104a1cb0-1920x1080.png',
//       background: null,
//       profile_banner: 'https://static-cdn.jtvnw.net/jtv_user_pictures/betmanenko-profile_banner-8680a6757ee41582-480.png',
//       profile_banner_background_color: '',
//       url: 'https://www.twitch.tv/betmanenko',
//       views: 3907,
//       followers: 91,
//       _links: [Object]
//     },
//     _links: { self: 'https://api.twitch.tv/kraken/streams/betmanenko' }
//   },
//   _links: {
//     self: 'https://api.twitch.tv/kraken/streams/betmanenko',
//     channel: 'https://api.twitch.tv/kraken/channels/betmanenko'
//   }
// }

// var date = moment.utc(testResp.stream.created_at);
// var currDate = moment.utc();
// var diff = moment.utc(moment.utc().diff(moment.utc(testResp.stream.created_at))).format("HH:mm:ss");
// console.log("diff", diff.format("HH:mm:ss"));
// console.log("currDate", currDate.format("HH:mm:ss"));
// console.log("date", date.format("HH:mm:ss"));

// client.on('connected', function(address, port) {
//   utils.sendMsg(client, "Hey bitches, Im here to make some shkol'niki calm down! Prepare your anus!");
// });

// client.on('join', function(channel, username, self) {
//   if (self) return;
//   if (username == config.god) {
//     utils.sendMsg(
//       client,
//       'БАТЯ ИН ДА ХАУС СУКА. ЧИРС ФО ' + username + ', ОН НАГРАДИЛ ВАС СВОИМ ПРИСУТСТВИЕМ(и хуем))0)'
//     );
//   } else {
//     utils.sendMsg(client, '@' + username + ', ' + _.sample(config.messages.greetings));
//   }
// });

// utils.getFollowersList();

// client.on('chat', function(channel, userstate, message, self) {
//   if (self) return;

//   var msg,
//     args = message.split(' '),
//     // skob = [/\({2,}/, /\){2,}/],
//     isAhuel = false;

//   // skob.forEach(function(el) {
//   //     if (el.test(message)) {
//   //         isAhuel = true;
//   //         ahuevshie[userstate.username] = ahuevshie[userstate.username] ? ahuevshie[userstate.username] + 1 : 1;
//   //         return;
//   //     }
//   // });
//   console.log('ahuevshie', ahuevshie);

//   if (message.indexOf('!uptime') === 0) {
//     utils.getChannelInfo(channel.slice('1')).then(function(resp) {
//       console.log('resp', resp);
//       if (resp.stream) {
//         msg = 'Стрим идет: ' + moment.utc(moment.utc().diff(moment.utc(resp.stream.created_at))).format('HH:mm:ss');
//       } else {
//         msg = 'Стрим оффлайн, братишки.';
//       }
//       utils.sendMsg(client, msg, channel);
//     });
//   } else if (message.toLowerCase().indexOf('ахуеть') === 0) {
//     msg = config.messages['jockeAboutLysyi'][0];
//   } else if (message.indexOf('!pidor') === 0) {
//     msg = '@' + userstate.username + ' - пидор.';
//   } else if (isAhuel) {
//     if (ahuevshie[userstate.username] == 2) {
//       msg = '@' + userstate.username + ', еще раз такое напишешь - я тебе круглой скобочкой по еблищу дам!';
//     } else if (ahuevshie[userstate.username] > 2) {
//       msg = '@' + userstate.username + ', ну все сука, ты отгребаешь!';
//       utils.timeoutUser(client, userstate.username, ahuevshie[userstate.username] * 100, channel);
//     } else {
//       msg = '@' + userstate.username + ', не делай так.';
//     }
//   } else if (message.indexOf('!roulette') === 0) {
//     var rand = Math.random() * 10;
//     if (rand < 5) {
//       msg = '@' + userstate.username + ', повезло тебе, сучка!';
//     } else {
//       let banTime = Math.random() * 1000;
//       msg = '@' + userstate.username + ', поздравляю братан. Ты заработал бан(' + Math.round(banTime) + 's)';
//       utils.timeoutUser(client, userstate.username, banTime, channel);
//     }
//   } else if (message.indexOf('!magicball') === 0) {
//     if (message.indexOf('?') < 0) {
//       msg = '@' + userstate.username + ', это не вопрос';
//     } else {
//       msg = '@' + userstate.username + ', ' + _.sample(config.messages.answers);
//     }
//   } else if (message.indexOf('!joke') === 0) {
//     utils.getJokes().then(
//       function(data) {
//         var joke = _.sample(data);
//         utils.sendMsg(
//           client,
//           joke.elementPureHtml.replace(/<[A-Za-z ='"#0-9]+\/?>/g, '').replace(/&[A-Za-z]+;/g, ''),
//           channel
//         );
//       },
//       function(err) {
//         console.log('err', err);
//       }
//     );
//   } else if (message.indexOf('!typidor') === 0) {
//     if (args[1]) {
//       msg = (args[1].indexOf(config.god) == -1 ? args[1] : userstate.username) + ', ты пидор!';
//     }
//   } else if (message.indexOf(config.USER) != -1) {
//     msg = _.sample(config.messages.ascorbinka);
//   } else {
//     utils.sayText(message);
//   }

//   if (msg && msg.length) {
//     utils.sendMsg(client, msg, channel);
//   }
// });

module.exports = client;
