import WMSLayersPanel from './vue/panel/wmslayerspanel';
import {LOCALSTORAGE_EXTERNALWMS_ITEM} from '../../constant';
const ApplicationService = require('core/applicationservice');
const ProjectsRegistry = require('core/project/projectsregistry');
const {uniqueId} = require('core/utils/utils');
const DataRouteService = require('core/data/routerservice');
const {isInfoFormatSupported} = require('core/parsers/response/parser');
const GUI = require('gui/gui');
 function Service(options={}){
  const {wmsurls=[]} = options;
  this.projectId = ProjectsRegistry.getCurrentProject().getId(); // get current project id used to store data or get data to current project
  this.panel;
  this.state = {
    adminwmsurls: wmsurls, // coming from admin wmsurls
    localwmsurls: []
  };
  this.loadClientWmsUrls()
    .then(urls => this.state.localwmsurls = urls);
  ProjectsRegistry.onafter('setCurrentProject', async project => {
    this.projectId = project.getId();
    this.state.adminwmsurls = project.wmsurls || [];
    this.state.localwmsurls = await this.loadClientWmsUrls();
  })
}

const proto = Service.prototype;

/**
 * Getting Wms Urls from local browser storage
 */
proto.loadClientWmsUrls = async function(){
  let data = this.getLocalWMSData();
  if (data === undefined){
    data = {
      urls: [], // unique url fro wms
      wms: {} // object contain url as key and array of layers bind to url
    };
    this.updateLocalWMSData(data);
  }
  await GUI.isReady();
  setTimeout(()=>{
    const mapService = GUI.getService('map');
    mapService.on('remove-external-layer', name => this.deleteWms(name));
    mapService.on('change-layer-position-map', ({id:name, position}={}) => this.changeLayerData(name, {
      key: 'position',
      value: position
    })); mapService.on('change-layer-opacity', ({id:name, opacity}={}) => this.changeLayerData(name, {
      key: 'opacity',
      value: opacity
    }));

    // load eventually data
    Object.keys(data.wms).forEach(url =>{
      data.wms[url].forEach(config => {
        this.loadWMSLayerToMap({
          url,
          ...config
        })
      })
    });
  });
  return data.urls;
};

/**
 * General Method to change config of storage layer options as position, opacity
 * @param name
 * @param config
 */
proto.changeLayerData = function(name, attribute={}){
  const data = this.getLocalWMSData();
  Object.keys(data.wms).find(wmsurl =>{
    const wmsConfigLayers = data.wms[wmsurl];
    const index = wmsConfigLayers.findIndex(config => config.name == name);
    if (index !== -1) {
      wmsConfigLayers[index][attribute.key] = attribute.value;
      return true
    }
  });
  this.updateLocalWMSData(data);
};

/**
 * Create a common status object
 * @param error
 * @param added
 * @returns {{error, status: string}}
 */
proto.getRequestStatusObject = function({error=false, added=false}={}){
  return {
    error,
    added
  }
};

/**
 * Add new
 * @param wmsurl
 * @returns {*}
 */
proto.addNewWmsUrl = async function(wmsurl){
  const findwmsurl = this.state.localwmsurls.find(url => url == wmsurl);
  const status = this.getRequestStatusObject({
    added: !!findwmsurl
  });
  if (!findwmsurl) {
    try {
      const response = await this.getWMSLayers(wmsurl);
      // if result (meaning reponse in done right)
      if (response.result) {
        const data = this.getLocalWMSData();
        this.state.localwmsurls.push(wmsurl);
        data.urls = this.state.localwmsurls;
        this.updateLocalWMSData(data);
        response.wmsurl = wmsurl;
        this.showWmsLayersPanel(response);
      } else status.error = true;
    }
    catch(err){
      status.error = true;
    }
  }
  return status;
};

/**
 * Delete WMS
 * @param name
 */
proto.deleteWms = function(name){
  const data = this.getLocalWMSData();
  Object.keys(data.wms).find(wmsurl =>{
    const wmsConfigLayers = data.wms[wmsurl];
    const index = wmsConfigLayers.findIndex(config => config.name == name);
    if (index !== -1) {
      wmsConfigLayers.splice(index, 1);
      if (wmsConfigLayers.length == 0) delete data.wms[wmsurl];
      return true
    }
  });
  this.updateLocalWMSData(data);
};
/**
 * Method to find if name or layer of a specific url is already added
 * @param name
 * @param layers
 */
proto.checkIfWMSAlreadyAdded = function({url, layers=[]}={}){
  let added = false;
  const data = this.getLocalWMSData();
  if (data.wms[url]){
    added = !!data.wms[url].find(({layers:addedLayers}) => {
      const layersLength = layers.length;
      if (addedLayers.length === layersLength){
        return layers.reduce((accumulator, layerName) =>{
          return accumulator + addedLayers.indexOf(layerName) !== -1 ? 1 : 0;
        },0) === layersLength;
      }
    })
  }
  return added;
};

/**
 * Delete url from local storage
 * @param wmsurl
 */
proto.deleteWmsUrl = function(wmsurl){
  this.state.localwmsurls = this.state.localwmsurls.filter(url => url !== wmsurl);
  const data = this.getLocalWMSData();
  data.urls = this.state.localwmsurls;
  this.updateLocalWMSData(data);
};

/**
 * Method to lad data from server and show wms layer panel
 * @param wmsurl
 * @returns {Promise<{added: boolean, error: boolean}>}
 */
proto.loadWMSDataAndShowWmsLayersPanel = async function(wmsurl){
  const status = this.getRequestStatusObject();
  try {
    const response = await this.getWMSLayers(wmsurl);
    status.error = !response.result;
    if (response.result){
      response.wmsurl = wmsurl;
      this.showWmsLayersPanel(response);
    }
  } catch(err){
    status.error = true;
  }
  return status;
};

/**
 * show addding wma layers wms panel
 * @param wmsurl
 * @returns {WmsLayersPanel}
 */
proto.showWmsLayersPanel = function(config={}){
  this.panel = new WMSLayersPanel({
    service: this,
    config
  });
  this.panel.show();
  return this.panel;
};

/**
 * gettind data of wms url from server
 * @param url
 * @returns {Promise<{result: boolean, info_formats: [], layers: [], map_formats: [], abstract: null, title: null}>}
 */
proto.getWMSLayers = async function(url){
  let response = {
    result: false,
    layers: [],
    info_formats:[],
    abstract: null,
    map_formats: [],
    title: null
  };
  try {
    response = await DataRouteService.getData('ows:wmsCapabilities', {
      inputs: {
        url
      },
      outputs: false
    });
  } catch(err){
    console.log(err)
  }
  if (response.result) return response;
  return response;
};

proto.loadWMSLayerToMap = async function({url, name, epsg, position, opacity, layers=[], info_format, info_formats=[]}={}){
  const mapService = GUI.getService('map');
  mapService.addExternalWMSLayer({
    url,
    name,
    layers,
    epsg,
    position,
    info_format,
    info_formats,
    opacity
  });
};

/**
 * Method to check if a layer is already added to map
 * @param url
 * @param name
 * @param epsg
 * @param position
 * @param layers
 * @returns {Promise<void>}
 */
proto.addWMSlayer = async function({url, name=`wms_${uniqueId()}`, epsg, position, layers=[], info_formats=[], opacity=1, checked=true}={}){
  info_formats = info_formats.filter(info_format => isInfoFormatSupported(info_format));
  const info_format = info_formats.length ? info_formats[0] : null;
  const data = this.getLocalWMSData();
  const wmsLayerConfig = {
    name,
    layers,
    epsg,
    position,
    checked,
    info_format,
    info_formats,
    opacity
  };
  if (data.wms[url] === undefined) data.wms[url] = [wmsLayerConfig];
  else data.wms[url].push(wmsLayerConfig);
  this.updateLocalWMSData(data);
  await this.loadWMSLayerToMap(wmsLayerConfig);
  this.panel.close();
};

/**
 * Method to get local storage wms  data based on current projectId
 * @returns {*}
 */
proto.getLocalWMSData = function(){
  return ApplicationService.getLocalItem(LOCALSTORAGE_EXTERNALWMS_ITEM) && ApplicationService.getLocalItem(LOCALSTORAGE_EXTERNALWMS_ITEM)[this.projectId];
};

/**
 * Method to update local storage data based on changes
 * @param data
 */
proto.updateLocalWMSData = function(data){
  // in case for the firs time is non present set empty object
  const alldata = ApplicationService.getLocalItem(LOCALSTORAGE_EXTERNALWMS_ITEM) || {};
  alldata[this.projectId] = data;
  ApplicationService.setLocalItem({
    id: LOCALSTORAGE_EXTERNALWMS_ITEM,
    data: alldata
  })
};

proto.clear = function(){
  this.panel = null;
};


export default Service