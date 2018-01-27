import jsonfile from 'jsonfile';
import { ipcMain } from 'electron';
import path from 'path';

const configFilePath = path.resolve(__dirname, 'static/data/config.json');

ipcMain.on('settings-request', event => {
	jsonfile.readFile(configFilePath, (err, data) => {
		if (!err) {
			event.sender.send('settings-updated', data);
		} else {
			event.sender.send('settings-updated', {});
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
