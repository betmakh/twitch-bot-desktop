import jsonfile from 'jsonfile';

const Settings = {
	init: ipcMain => {
		ipcMain.on('settings-save', (event, arg) => {
			console.log('arg', arg);

			console.log('__dirname', __dirname);

			jsonfile.writeFile('./data/config.json', arg, err => {
				console.log('err', err);
			});
		});
	}
};

export default Settings;
