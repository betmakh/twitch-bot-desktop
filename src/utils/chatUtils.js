import googleTTS from 'google-tts-api';
import Sound from 'react-sound';

/**
 * Gets audio url with  generated voice
 * @param  {string} text Message which should pronounce
 * @return {Promise}      Succes - link to url, err - orr object
 */
const  GetMessageAudio = text => {
  var lang = 'en';
  if (/[а-яА-ЯЁё]/.test(text)) {
    lang = 'ru-RU';
  }

  return googleTTS(text, lang)
};

const SoundStatus = Object.assign(Sound.status, {QUEUED: 'QUEUED'});

export {GetMessageAudio, SoundStatus}