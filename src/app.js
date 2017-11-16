import React from 'react';
import { render } from 'react-dom';
import { ipcRenderer } from 'electron';
// import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import MainContainer from './components/Main.jsx';

const writeSettingsToFile = data => {
	console.log('data', data);
	if (data) {
		ipcRenderer.send('settings-save', data);
	}
};

ipcRenderer.on('settings-save-received', (event, arg) => {
	console.log(arg); // prints "pong"
});

render(<MainContainer onSettingsSave={writeSettingsToFile} />, document.getElementById('root'));
