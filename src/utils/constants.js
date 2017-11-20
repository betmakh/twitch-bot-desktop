export const CHAT_COMPONENT = 'CHAT_COMPONENT';
export const USER_LIST_COMPONENT = 'USER_LIST_COMPONENT';
export const FOLLOWERS_LIST_COMPONENT = 'FOLLOWERS_LIST_COMPONENT';
export const SETTINGS_COMPONENT = 'SETTINGS_COMPONENT';

export const KRAKEN_PREFIX_URL = 'https://api.twitch.tv/kraken/';
export const TOKEN = 'o9gnnqnx1sxt6twajj6h7u4w7ko6bhj';

export const AUTH_URL = `https://api.twitch.tv/kraken/oauth2/authorize?client_id=${
	TOKEN
}&redirect_uri=http://localhost&response_type=id_token&scope=chat_login`;
