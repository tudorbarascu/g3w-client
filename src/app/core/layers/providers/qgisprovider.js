const { base, inherit } = require('core/utils/utils');
const { XHR } = require('core/utils/utils');
const t = require('core/i18n/i18n.service').t;
const DataProvider = require('core/layers/providers/provider');
const RelationsService = require('core/relations/relationsservice');
const Feature = require('core/layers/features/feature');
const Parsers = require('core/parsers/parsers');

function QGISProvider(options = {}) {
  base(this);
  this._name = 'qgis';
  this._layer = options.layer || {};
  this._projections = {
    map: null,
    layer: null
  };
  this._unlockUrl = this._layer.getUrl('unlock');
  // url referred to query
  this._queryUrl = this._layer.getUrl('query');
  this._dataUrl = this._layer.getUrl('data');
  // editing url api
  this._editingUrl = this._layer.getUrl('editing');
  this._commitUrl = this._layer.getUrl('commit');
  // url to get configuration
  this._configUrl = this._layer.getUrl('config');
  // widget url
  this._widgetUrls = this._layer.getUrl('widget');
  // layer name
  this._layerName = this._layer.getName() || null; // get name  from QGIS layer, because the query are proxed from g3w-server
  this._infoFormat = this._layer.getInfoFormat() || 'application/vnd.ogc.gml';
}

inherit(QGISProvider, DataProvider);

const proto = QGISProvider.prototype;

proto.getFilterData = async function({field, suggest={}, unique}={}){
  const params = {
    field,
    suggest,
    unique
  };
  try {
    const response = await XHR.get({
      url: `${this._dataUrl}`,
      params
    });
    const isVector = this._layer.getType() !== "table";
    isVector && this.setProjections();
    const data = response.result ?  unique ? response.data :  {
      data: this._parseGeoJsonResponse({
        layer: this._layer,
        response,
        projections: this._projections
      })
    }: Promise.reject();
    return data;
  } catch(error){
    return Promise.reject(error);
  }
};

proto.setProjections = function() {
  this._projections.layer = this._layer.getProjection();
  this._projections.map = this._layer.getMapProjection() || this._projections.layer;
};

//query by filter
proto.query = function(options={}) {
  const d = $.Deferred();
  const feature_count = options.feature_count || 10;
  const filter = options.filter || null;
  const isVector = this._layer.getType() !== "table";
  isVector && this.setProjections();
  const CRS = isVector ? this._layer.getSourceType() === 'spatialite' ? this._layer.getCrs() : this._projections.map.getCode() : null;
  const queryUrl = options.queryUrl || this._queryUrl;
  const layers = options.layers;
  const {I,J} = options;
  const layerNames = layers ? layers.map(layer => layer.getWMSLayerName()).join(',') : this._layer.getWMSLayerName();
  if (filter) {
    // check if geomemtry filter. If not i have to remove projection layer
    if (filter.getType() !== 'geometry' && this._layer.getSourceType() !== 'spatialite')
      this._projections.layer = null;
    const url = queryUrl ;
    const params = {
      SERVICE: 'WMS',
      VERSION: '1.3.0',
      REQUEST: 'GetFeatureInfo',
      LAYERS: layerNames,
      QUERY_LAYERS: layerNames,
      INFO_FORMAT: this._infoFormat,
      FEATURE_COUNT: feature_count,
      CRS,
      I,
      J,
      FILTER: filter.get(),
      WITH_GEOMETRY: isVector ? 1: 0
    };

    XHR.get({
      url,
      params
    }).then((response) => {
      const featuresForLayers = this.handleQueryResponseFromServer(response, this._projections, layers);
      d.resolve(featuresForLayers);
    }).catch((err) => {
      d.reject(err);
    });
  } else d.reject();
  return d.promise();
};

// get layer config
proto.getConfig = function() {
  const d = $.Deferred();
  const url = this._configUrl;
  if (!url) {
    d.reject('not valid url');
    return;
  }
  $.get(url)
    .then((config) => {
      d.resolve(config);
    })
    .fail((err) => {
      d.reject(err);
    });
  return d.promise();
};

proto.getWidgetData = function(options) {
  options = options || {};
  const type = options.type;
  const fields = options.fields;
  const url = this._widgetUrls[type];
  return $.get(url, {
    fields: fields
  });
};

// unlock feature
proto.unlock = function() {
  const d = $.Deferred();
  $.post(this._unlockUrl)
    .then((response) => {
      d.resolve(response);
    })
    .fail((err) => {
      d.reject(err);
    });
  return d.promise()
};

// commit function
proto.commit = function(commitItems) {
  const d = $.Deferred();
  //check if editing or not;
  const url = this._commitUrl;
  const jsonCommits = JSON.stringify(commitItems);
  $.post({
    url: url,
    data: jsonCommits,
    contentType: "application/json"
  })
    .then(function(response) {
      d.resolve(response);
    })
    .fail(function(err) {
      d.reject(err);
    });
  return d.promise();
};

// METODS LOADING EDITING FEATURES (READ/WRITE) //
proto.getFeatures = function(options={}, params={}) {
  const d = $.Deferred();
  // filter null value
  Object.entries(params).forEach(([key, value]) => {
    if (value === null)
      delete params[key]
  });
  const layerType = this._layer.getType();
  // check if data are requested in read or write mode;
  let url;
  //editing mode
  if (options.editing) {
    let promise;
    url = this._editingUrl;
    if (!url) {
      d.reject('Url non valido');
      return;
    }
    const urlParams = $.param(params);
    url+=  urlParams ? '?' + urlParams : '';
    const features = [];
    let filter = options.filter || null;
    if (filter) {
      if (filter.bbox) {
        const bbox = filter.bbox;
        filter = {in_bbox: `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`};
        const jsonFilter = JSON.stringify(filter);
        promise = XHR.post({
          url,
          data: jsonFilter,
          contentType: "application/json"
        })
      } else if (filter.fid) {
        const options = filter.fid;
        promise = RelationsService.getRelations(options);
      }
    } else promise = XHR.post({url,contentType: "application/json"});
    promise.then((response) => {
        const {vector, result, featurelocks} = response;
        if (result) {
          const {data, geometrytype} = vector;
          const parser = Parsers[layerType].get({
            type: 'json'
          });
          const parser_options = (geometrytype !== 'NoGeometry') ? { crs: this._layer.getCrs() } : {};
          const lockIds = featurelocks.map((featureLock) => {
            return featureLock.featureid
          });
          parser(data, parser_options).forEach((feature) => {
            const featureId = `${feature.getId()}`;
            if (lockIds.indexOf(featureId) > -1) {
              features.push(new Feature({
                feature
              }));
            }
          });
          // resolve with featers locked and requested
          d.resolve({
            features,
            featurelocks
          });
        } else {// case when server responde with result false (error)
          d.reject({
            message: t("info.server_error")
          });
        }
      })
      .catch(function(err) {
        d.reject({
          message: t("info.server_error")
        });
      });
  } else {
    url = this._dataUrl;
    const urlParams = $.param(params);
    url+=  urlParams ? '?' + urlParams : '';
    $.get({
      url: url,
      contentType: "application/json"
    })
      .then((response) => {
        const vector = response.vector;
        const data = vector.data;
        count = vector.count;
        d.resolve({
          data,
          count
        })
      })
      .fail((err) => {
        d.reject(err)
      })
  }

  return d.promise();
};

proto._loadLayerData = function(mode, customUrlParameters) {
  const d = $.Deferred();
  Obkect.entries(this._layers).forEach(([layerCode, layer]) => {
    if (_.isNull(layer.vector)) {
      noVectorlayerCodes.push(layerCode);
    }
  });
  const vectorLayersSetup = noVectorlayerCodes.map((layerCode) => {
    return this._setupVectorLayer(layerCode);
  });
  this.emit('loadingvectorlayersstart');
  $.when.apply(this, vectorLayersSetup)
    .then(() => {
      const vectorLayersCodes = Array.prototype.slice.call(arguments);
      this.emit('loadingvectolayersdatastart');
      this.loadAllVectorsData(vectorLayersCodes)
        .then(() => {
          this._vectorLayersCodes = vectorLayersCodes;
          d.resolve(vectorLayersCodes);
          this.emit('loadingvectorlayersend');
          this.setReady(true);
        })
        .fail(() =>  {
          this._layers.forEach((layer) => {
            layer.vector = null;
          });
          d.reject();
          this.emit('errorloadingvectorlayersend');
          this.setReady(false);
        })
    })
    .fail(() => {
      this.setReady(false);
      this.emit('errorloadingvectorlayersend');
      d.reject();
    });
  return d.promise();
};

proto.setVectorLayersCodes = function(vectorLayersCodes) {
  this._vectorLayersCodes = vectorLayersCodes;
};

proto.getVectorLayersCodes = function() {
  return this._vectorLayersCodes;
};

proto.getLayers = function() {
  return this._layers;
};

proto.reloadVectorData = function(layerCode) {
  const d = $.Deferred();
  const bbox = this._mapService.state.bbox;
  this._createVectorLayerFromConfig(layerCode)
    .then((vectorLayer) => {
      this._getVectorLayerData(vectorLayer, bbox)
        .then((vectorDataResponse) => {
          this.setVectorLayerData(vectorLayer[this._editingApiField], vectorDataResponse);
          vectorLayer.setData(vectorDataResponse.vector.data);
          d.resolve(vectorLayer);
        });
    });
  return d.promise();
};

proto.loadAllVectorsData = function(layerCodes) {
  const d = $.Deferred();
  let layers = this._layers;
  const bbox = this._mapService.state.bbox;
  const loadedExtent = this._loadedExtent;
  if (loadedExtent && ol.extent.containsExtent(loadedExtent, bbox)) {
    return resolvedValue();
  }
  if (!loadedExtent) {
    this._loadedExtent = bbox;
  } else {
    this._loadedExtent = ol.extent.extend(loadedExtent, bbox);
  }
  if (layerCodes) {
    layers = [];
    layerCodes.forEach((layerCode) => {
      layers.push(this._layers[layerCode]);
    });
  }
  const vectorDataRequests = layers.map((Layer) => {
    return this._loadVectorData(Layer.vector, bbox);
  });

  $.when.apply(this, vectorDataRequests)
    .then(() => {
      d.resolve(layerCodes);
    })
    .fail(() => {
      d.reject();
    });

  return d.promise();
};

proto._setCustomUrlParameters = function(customUrlParameters) {
  this._customUrlParameters = customUrlParameters;
};

proto._checkVectorGeometryTypeFromConfig = function(vectorConfig) {
  switch (vectorConfig.geometrytype) {
    case 'Line':
      vectorConfig.geometrytype = 'LineString';
      break;
    case 'MultiLine':
      vectorConfig.geometrytype = 'MultiLineString';
      break;
  }
  return vectorConfig;
};

proto._createVectorLayerFromConfig = function(layerCode) {
  const layerConfig = this._layers[layerCode];
  const d = $.Deferred();
  this._getVectorLayerConfig(layerConfig[this._editingApiField])
    .then((vectorConfigResponse) => {
      let vectorConfig = vectorConfigResponse.vector;
      vectorConfig = this._checkVectorGeometryTypeFromConfig(vectorConfig);
      const crsLayer = layerConfig.crs || this._mapService.getProjection().getCode();
      const vectorLayer = this._createVectorLayer({
        geometrytype: vectorConfig.geometrytype,
        format: vectorConfig.format,
        crs: this._mapService.getProjection().getCode(),
        crsLayer : crsLayer,
        id: layerConfig.id,
        name: layerConfig.name,
        editing: self._editingMode
      });
      vectorLayer.setFields(vectorConfig.fields);
      vectorLayer.setCrs(crsLayer);
      const relations = vectorConfig.relations;
      if (relations) {
        vectorLayer.lazyRelations = true;
        vectorLayer.setRelations(relations);
      }
      if (layerConfig.style) vectorLayer.setStyle(layerConfig.style);
      d.resolve(vectorLayer);
    })
    .fail(() => {
      d.reject();
    });
  return d.promise();
};


proto._setupVectorLayer = function(layerCode) {
  const d = $.Deferred();
  this._createVectorLayerFromConfig(layerCode)
    .then((vectorLayer) => {
      const layerConfig = this._layers[layerCode];
      layerConfig.vector = vectorLayer;
      d.resolve(layerCode);
    })
    .fail(() => {
      d.reject();
    });
  return d.promise();
};

proto._loadVectorData = function(vectorLayer, bbox) {
  return self._getVectorLayerData(vectorLayer, bbox)
    .then((vectorDataResponse) => {
      this.setVectorLayerData(vectorLayer[this._editingApiField], vectorDataResponse);
      if (this._editingMode && vectorDataResponse.featurelocks) {
        this.setVectorFeaturesLock(vectorLayer, vectorDataResponse.featurelocks);
      }
      vectorLayer.setData(vectorDataResponse.vector.data);
      if (this._) return vectorDataResponse;
    })
    .fail(() => {
      return false;
    })
};

proto.getVectorLayerData = function(layerCode) {
  return this._vectorLayersData[layerCode];
};

proto.getVectorLayersData = function() {
  return this._vectorLayersData;
};

proto.setVectorLayerData = function(layerCode, vectorLayerData) {
  this._vectorLayersData[layerCode] = vectorLayerData;
};

proto.setVectorFeaturesLock = function(vectorLayer, featureslock) {
  const newFeaturesLockIds = _.differenceBy(featureslock, vectorLayer.getFeatureLocks(), 'featureid');
  newFeaturesLockIds.forEach((newLockId) => {
    vectorLayer.addLockId(newLockId)
  });
};

proto.cleanVectorFeaturesLock = function(vectorLayer) {
  vectorLayer.cleanFeatureLocks();
};

proto.lockFeatures = function(layerName) {
  const d = $.Deferred();
  const bbox = this._mapService.state.bbox;
  const vectorLayer = this._layers[layerName].vector;
  $.get(this._baseUrl+layerName+"/?lock" + this._customUrlParameters+"&in_bbox=" + bbox[0]+","+bbox[1]+","+bbox[2]+","+bbox[3])
    .done((data) => {
      this.setVectorFeaturesLock(vectorLayer, data.featurelocks);
      d.resolve(data);
    })
    .fail(() => {
      d.reject();
    });
  return d.promise();
};

proto._getVectorLayerConfig = function(layerApiField) {
  const d = $.Deferred();
  $.get(this._baseUrl+layerApiField+"/?config"+ this._customUrlParameters)
    .done((data) => {
      d.resolve(data);
    })
    .fail(() => {
      d.reject();
    });
  return d.promise();
};

proto._getVectorLayerData = function(vectorLayer, bbox) {
  const d = $.Deferred();
  const lock = this.getMode() == 'w' ? true : false;
  let apiUrl;
  if (lock) {
    apiUrl = this._baseUrl+vectorLayer[this._editingApiField]+"/?editing";
  } else {
    apiUrl = this._baseUrl+vectorLayer[this._editingApiField]+"/?"
  }
  $.get(apiUrl + this._customUrlParameters+"&in_bbox=" + bbox[0]+","+bbox[1]+","+bbox[2]+","+bbox[3])
    .done((data) => {
      d.resolve(data);
    })
    .fail(() => {
      d.reject();
    });
  return d.promise();
};

proto._createVectorLayer = function(options={}) {
  const vector = new VectorLayer(options);
  return vector;
};


proto.cleanUpLayers = function() {
  this._loadedExtent = null;
};

module.exports = QGISProvider;