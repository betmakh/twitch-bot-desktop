const auth = {
	init: app => {
		// process.argv
		console.log('updated: ', app.setAsDefaultProtocolClient('electron-app'));
	}
};

export default auth;
