// ------------------------------------------------------------------------
// Utility functions
// ------------------------------------------------------------------------


const _random = Math.random,
  _floor = Math.floor;


// __generateUniqueString__ is a simple random String generator
// - https://gist.github.com/SimonHoiberg/ad2710c8626c5a74cddd8f6385795cc0
export const generateUniqueString = () => {

    return performance.now().toString(36) + _random().toString(36).substr(2);
};

// __generateUuid__ is a simple (crude) uuid generator
// - http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export const generateUuid = () => {

    function s4() {

        return _floor((1 + _random()) * 0x10000).toString(16).substring(1);
    }

    return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};
