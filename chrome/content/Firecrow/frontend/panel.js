/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var Cc = Components.classes;
var Ci = Components.interfaces;
var Cu = Components.utils;
var Cr = Components.results;

this.EXPORTED_SYMBOLS = ["FirecrowPanel"];

Cu.import("resource://gre/modules/XPCOMUtils.jsm");

Cu.import("chrome://Firecrow/content/frontend/FireDataAccess.jsm");
Cu.import("chrome://Firecrow/content/frontend/SlicerPanelController.jsm");
Cu.import("chrome://Firecrow/content/frontend/ScenarioGeneratorPanelController.jsm");
Cu.import("chrome://Firecrow/content/frontend/ReuserPanelController.jsm");

Cu.import("resource://gre/modules/devtools/Require.jsm");

var scriptLoader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

XPCOMUtils.defineLazyModuleGetter(this, "EventEmitter", "resource:///modules/devtools/shared/event-emitter.js");
XPCOMUtils.defineLazyModuleGetter(this, "promise", "resource://gre/modules/commonjs/sdk/core/promise.js", "Promise");

this.FirecrowPanel = function FirecrowPanel(iframeWindow, toolbox)
{
    this.panelWin = iframeWindow;
    this._toolbox = toolbox;
    this._destroyer = null;

    this.target.on("will-navigate", this._onBeforeNavigate.bind(this));

    EventEmitter.decorate(this);
};

FirecrowPanel.prototype =
{
    _onBeforeNavigate: function()
    {
        var newUrl = arguments[1] != null ? arguments[1].url : "";

        if(this._slicerPanelController != null)
        {
            this._slicerPanelController.reset(newUrl);
        }
        else if(this.panelWin != null && this.panelWin.slicerPanelController != null && this.panelWin.slicerPanelController.reset != null)
        {
            this.panelWin.slicerPanelController.reset(newUrl);
        }

        if(this._scenarioGeneratorPanelController != null)
        {
            this._scenarioGeneratorPanelController.reset(newUrl);
        }
        else if(this.panelWin != null && this.panelWin.scenarioGeneratorPanelController != null && this.panelWin.scenarioGeneratorPanelController.reset != null)
        {
            this.panelWin.scenarioGeneratorPanelController.reset(newUrl);
        }

        if(this._reuserPanelController != null)
        {
            this._reuserPanelController.reset(newUrl);
        }
        else if(this.panelWin != null && this.panelWin.reuserPanelController != null && this.panelWin.reuserPanelController.reset != null)
        {
            this.panelWin.reuserPanelController.reset(newUrl);
        }
    },

    open: function()
    {
        var panelWin = this.panelWin;
        var panelLoaded = promise.defer();

        // Make sure the iframe content window is ready.
        panelWin.addEventListener("load", function onLoad()
        {
            panelWin.removeEventListener("load", onLoad, true);
            panelLoaded.resolve();
        }, true);

        var that = this;

        return panelLoaded
              .promise
              .then(function(){ return that.panelWin.startup(that._toolbox)})
              .then(function()
              {
                  that.isReady = true;
                  that.emit("ready");
                  that.onLoad();
                  return that;
              })
              .then(null, function onError(aReason)
              {
                    Cu.reportError("Firecrow open failed. " + aReason.error + ": " + aReason.message + " - " + aReason.fileName + "@" + aReason.lineNumber);
              });
    },

    $: function(id)
    {
        return this._frameDoc != null ? this._frameDoc.getElementById(id) : null;
    },

    onLoad: function()
    {
        this._frameDoc = this.panelWin.document;

        this._hiddenIFrame = this.$("fdHiddenIFrame");

        this._slicerTabButton = this.$("slicerTabButton");
        this._scenarioTabButton = this.$("scenarioTabButton");
        this._reuserTabButton = this.$("reuserTabButton");

        this._slicerTabButton.onclick = function()
        {
            this._slicerPanelController.markAsSelected();
            this._scenarioGeneratorPanelController.markAsDeselected();
            this.reuserPanelController.markAsDeselected();
        }.bind(this);

        this._scenarioTabButton.onclick = function()
        {
            this._slicerPanelController.markAsDeselected();
            this._scenarioGeneratorPanelController.markAsSelected();
            this._reuserPanelController.markAsDeselected();
        }.bind(this);

        this._reuserTabButton.onclick = function()
        {
            this._slicerPanelController.markAsDeselected();
            this._scenarioGeneratorPanelController.markAsDeselected();
            this._reuserPanelController.markAsSelected();
        }.bind(this);

        this._slicerPanelController = new SlicerPanelController(this.panelWin, this._frameDoc, this._getCurrentPageWindow.bind(this), this._getCurrentPageDocument.bind(this));
        this._scenarioGeneratorPanelController = new ScenarioGeneratorPanelController(this.panelWin, this._frameDoc, this._toolbox, this._getCurrentPageWindow.bind(this), this._getCurrentPageDocument.bind(this));
        this._reuserPanelController = new ReuserPanelController(this.panelWin, this._frameDoc, this._getCurrentPageWindow.bind(this), this._getCurrentPageDocument.bind(this));

        this.panelWin.slicerPanelController = this._slicerPanelController;
        this.panelWin.scenarioGeneratorPanelController = this._slicerPanelController;
        this.panelWin.reuserPanelController = this._reuserPanelController;

        this._window = this._getCurrentPageWindow();

        FireDataAccess.reset(this.panelWin, null);
        FireDataAccess.setBrowser(this.$("invisibleBrowser"));
        FireDataAccess.cacheExternalScriptsContent(this._getCurrentPageDocument());

        this._slicerPanelController.markAsSelected();
    },

    _getCurrentPageDocument: function()
    {
        try
        {
            return this._toolbox._target.tab.ownerDocument.defaultView.content.document;
        }
        catch(e)
        {
            this.panelWin.alert("Error when getting current page document: " + e);
        }
    },

    _getCurrentPageWindow: function()
    {
        try
        {
            return this._toolbox._target.tab.ownerDocument.defaultView.content;
        }
        catch(e)
        {
            this.panelWin.alert("Error when getting current page document: " + e);
        }
    },

    get target() this._toolbox.target,

    destroy: function()
    {
        // Make sure this panel is not already destroyed.
        if (this._destroyer) {
            return this._destroyer;
        }

        return this._destroyer = this.panelWin.shutdown().then(() =>
        {
            this.isReady = false;
            this.emit("destroyed");
        }).then(null, function onError(aReason)
        {
            Cu.reportError("Firecrow destroy failed. " + aReason.error + ": " + aReason.message);
        });
    }
};