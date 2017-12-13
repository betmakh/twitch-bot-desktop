import jsonfile from 'jsonfile';
import { ipcMain } from 'electron';

const configFilePath = './data/config.json';

ipcMain.on('settings-request', event => {
	jsonfile.readFile(configFilePath, (err, data) => {
		if (!err) {
			event.sender.send('settings-updated', data);
		} else {
			event.sender.send('error', err);
		}
	});
});

ipcMain.on('settings-save', (event, data) => {
	jsonfile.writeFile(configFilePath, data, err => {
		if (!err) {
			event.sender.send('settings-updated', data);
		} else {
			event.sender.send('error', err);
		}
	});
});
