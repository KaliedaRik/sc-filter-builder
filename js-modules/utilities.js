// ------------------------------------------------------------------------
// Utility functions
// ------------------------------------------------------------------------


const _random = Math.random,
  _floor = Math.floor;


// __generateUniqueString__ is a simple random String generator
// - https://gist.github.com/SimonHoiberg/ad2710c8626c5a74cddd8f6385795cc0
export const generateUniqueString = () => performance.now().toString(36) + _random().toString(36).substr(2);


// __generateUuid__ is a simple (crude) uuid generator
// - http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
const s4 = () => _floor((1 + _random()) * 0x10000).toString(16).substring(1);
export const generateUuid = () => `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;


// Padded date-time string
const pad = (n) => String(n).padStart(2, '0');
export const generateFileDate = () => {

  const now = new Date();

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
};
