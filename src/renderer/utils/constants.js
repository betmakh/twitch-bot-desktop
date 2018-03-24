export const CHAT_COMPONENT = 'CHAT_COMPONENT';
export const USER_LIST_COMPONENT = 'USER_LIST_COMPONENT';
export const FOLLOWERS_LIST_COMPONENT = 'FOLLOWERS_LIST_COMPONENT';
export const SETTINGS_COMPONENT = 'SETTINGS_COMPONENT';

export const KRAKEN_PREFIX_URL = 'https://api.twitch.tv/kraken/';
export const TWITCH_API_PREFIX_URL = 'https://api.twitch.tv/helix/';
export const TOKEN = 'o9gnnqnx1sxt6twajj6h7u4w7ko6bhj';
export const AUTH_URL = `https://api.twitch.tv/kraken/oauth2/authorize?client_id=${
	TOKEN
}&redirect_uri=https://localhost&response_type=token+id_token&scope=chat_login+viewing_activity_read+openid`;

export const FOLLOWERS_UPDATE_TIME = 6000;

export const BOT_COMMANDS_DESCRIPTION = [
	{
		name: '%uptime%',
		description: 'time of stream'
	},
	{
		name: '%game%',
		description: 'current game'
	},
	{
		name: '%username%',
		description: 'username who sends the command'
	},
	{
		name: '%joke%',
		description: 'tell the lame joke'
	},
	{
		name: '%magicball%',
		description: 'simple random answer (yes/no/maybe)'
	},
	{
		name: '%arg0%',
		description: 'first word of requested command'
	}
];
