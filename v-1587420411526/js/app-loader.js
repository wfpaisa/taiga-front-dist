(function() {
  var loadPlugin, loadPlugins, loadStylesheet, promise;

  window._version = "v-1587420411526";

  window.taigaConfig = {
    "api": "http://localhost:8000/api/v1/",
    "eventsUrl": null,
    "tribeHost": null,
    "eventsMaxMissedHeartbeats": 5,
    "eventsHeartbeatIntervalTime": 60000,
    "debug": true,
    "defaultLanguage": "en",
    "themes": ["taiga", "taiga-legacy", "material-design", "high-contrast"],
    "defaultTheme": "taiga",
    "publicRegisterEnabled": true,
    "feedbackEnabled": true,
    "supportUrl": null,
    "privacyPolicyUrl": null,
    "termsOfServiceUrl": null,
    "maxUploadFileSize": null,
    "importers": [],
    "contribPlugins": []
  };

  window.taigaContribPlugins = [];

  window._decorators = [];

  window.addDecorator = function(provider, decorator) {
    return window._decorators.push({
      provider: provider,
      decorator: decorator
    });
  };

  window.getDecorators = function() {
    return window._decorators;
  };

  loadStylesheet = function(path) {
    return $('head').append('<link rel="stylesheet" href="' + path + '" type="text/css" />');
  };

  loadPlugin = function(pluginPath) {
    return new Promise(function(resolve, reject) {
      var fail, success;
      success = function(plugin) {
        var i, item, len, ref;
        if (plugin.isPack) {
          ref = plugin.plugins;
          for (i = 0, len = ref.length; i < len; i++) {
            item = ref[i];
            window.taigaContribPlugins.push(item);
          }
        } else {
          window.taigaContribPlugins.push(plugin);
        }
        if (plugin.css) {
          loadStylesheet(plugin.css);
        }
        if (plugin.js) {
          return ljs.load(plugin.js, resolve);
        } else {
          return resolve();
        }
      };
      fail = function(jqXHR, textStatus, errorThrown) {
        return console.error("Error loading plugin", pluginPath, errorThrown);
      };
      return $.getJSON(pluginPath).then(success, fail);
    });
  };

  loadPlugins = function(plugins) {
    var promises;
    promises = [];
    _.map(plugins, function(pluginPath) {
      return promises.push(loadPlugin(pluginPath));
    });
    return Promise.all(promises);
  };

  promise = $.getJSON("/conf.json");

  promise.done(function(data) {
    return window.taigaConfig = _.assign({}, window.taigaConfig, data);
  });

  promise.fail(function() {
    return console.error("Your conf.json file is not a valid json file, please review it.");
  });

  promise.always(function() {
    var emojisPromise;
    emojisPromise = $.getJSON("/" + window._version + "/emojis/emojis-data.json").then(function(emojis) {
      return window.emojis = emojis;
    });
    if (window.taigaConfig.contribPlugins.length > 0) {
      return loadPlugins(window.taigaConfig.contribPlugins).then(function() {
        return ljs.load("/" + window._version + "/js/app.js", function() {
          return emojisPromise.then(function() {
            return angular.bootstrap(document, ['taiga']);
          });
        });
      });
    } else {
      return ljs.load("/" + window._version + "/js/app.js", function() {
        return emojisPromise.then(function() {
          return angular.bootstrap(document, ['taiga']);
        });
      });
    }
  });

}).call(this);
