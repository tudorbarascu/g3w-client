// state of application reactive
const STATE = Vue.observable({
  ready: false,
  iframe: false,
  online: false,
  ismobile: false,
  download: false,
  upload: false,
  lng: 'en',
  plugins: [],
  keys: {
    vendorkeys: {
      google: void 0,
      bing: void 0
    }
  },
  tokens: {
    filtertoken: void 0
  }
});


export default STATE;
