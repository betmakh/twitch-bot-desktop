# Twitch bot desktop

## Basic information

This application created to help streamers monitor and manage their streams. Current functionality includes:

* Translation messages to voice (useful for small channels)
* Several bot commands(f.e. !uptime, !joke, !pidor, etc.)
* Interface for ban/timeout/mod watchers
* notification about new followers

NOTE: application is still in development so some function man not work have unstable behaviour

### Functions to be implemented

* Bot command modifications
* Followers search and managment
* Subscribers notifications

## Development guide

Source code located within `src` folder. To start development with file watcher run:

```bash
# Clone this repository
git clone https://github.com/betmakh/twitch-bot-desktop
# Go into the repository
cd twitch-bot-desktop
# Install dependencies
yarn install
# Run the app
yarn start
```

To create windows executable file run:

```bash
yarn create-win
```

