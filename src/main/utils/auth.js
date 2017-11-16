const auth = {
	init: app => {
		// process.argv
		console.log('process.argv', process.argv);
		app.setAsDefaultProtocolClient('electron-app');
	}
};

export default auth;
