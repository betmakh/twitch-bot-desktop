var fetch = require('node-fetch');
var config = require('./config');
var say = require('./sayWin');

var krakenPrefix = 'https://api.twitch.tv/kraken/';
module.exports = {
    getKrakenData: function(url) {
        return fetch(url, {
                headers: {
                    'Client-ID': config.TOKEN
                }
            })
            .then(function(res) {
                if (res.status === 200) {
                    return res.json();
                } else {
                    return null;
                }
            })
    },
    getFollowersList: function(channel = config.CHANNELS[0]) {
        return fetch(krakenPrefix + 'channels/' + channel + '/follows', {
                headers: {
                    'Client-ID': config.TOKEN
                }
            })
            .then(function(res) {
                if (res.status === 200) {
                    return res.json();
                } else {
                    return null;
                }
            })
    },
    updateFollowersList: function(channel = config.CHANNELS[0], list = []) {
        var utils = this;
        var result = {};
        var responses = [],
            isNoMore = false;
        result.list = list;

        return new Promise(function(resolve, reject) {
            function processResponse(resp) {
                resp.follows.forEach(function(follow) {
                    if (!_.find(result.list, function(el) {
                            return el.created_at == follow.created_at;
                        })) {
                        result.list.push(follow);
                    }
                    if (resp._cursor && resp._cursor.lenght && resp._links.next) {
                        getNextPage(resp._links.next);
                    } else {
                        resolve(result);
                    }
                })
            }

            function getNextPage(url) {
                utils.getKrakenData(url).then(processResponse, function(err) {
                    reject(err);
                    console.log('err', err);
                });
            }

            utils.getFollowersList(channel).then(processResponse, function(err) {
                reject(err);
                console.log('err', err);
            })
        })
    },
    getChannelInfo: function(channel) {
        channel = channel || config.CHANNELS[0];
            console.log(krakenPrefix + 'streams/' + channel);
        return fetch(krakenPrefix + 'streams/' + channel, {
                headers: {
                    'Client-ID': config.TOKEN
                }
            })
            .then(function(res) {
                if (res.status === 200) {
                    return res.json();
                } else {
                    return null;
                }
            })
    },
    getJokes: function() {
        return fetch('http://www.umori.li/api/get?site=bash.im&name=bash&num=100')
            .then(function(resp) {
                if (resp.status === 200) {
                    return resp.json();
                } else {
                    return null;
                }
            })
    },
    updateModerators: function() {
        return new Promise(function(resolve, reject) {
            fetch('http://tmi.twitch.tv/group/user/betmanenko/chatters')
                .then(function(res) {
                    if (res.status === 200) {
                        return res.json();
                    } else {
                        return null;
                    }
                }).then(function(json) {
                    var data = [];
                    if (json && json.chatters) {
                        config.moderatorGroups.forEach(function(el) {
                            if (json.chatters[el].length) {
                                data = data.concat(json.chatters[el]);
                            }
                        });
                        resolve(data);
                    } else {
                        reject(null)
                    }
                });
        })
    },
    sendMsg: function(client, msg, channel) {
        if (channel) {
            client.action(channel, " : " + msg);
        } else {
            config.CHANNELS.forEach(function(ch) {
                client.action(ch, " : " + msg);
            })
        }
    },
    timeoutUser: function(client, user, time, channel) {
        if (channel) {
            client.timeout(channel, user, time);
        } else {
            config.CHANNELS.forEach(function(ch) {
                client.timeout(ch, user, time);
            })
        }
    },
    sayText: function(txt) {
        return say(txt);
    }

}
