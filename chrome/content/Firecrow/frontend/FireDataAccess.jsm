var EXPORTED_SYMBOLS = ["FireDataAccess"];

var Cu = Components.utils;
var Ci = Components.interfaces;

var FireDataAccess =
{
     _externalFilesMap: {},
    _pathSourceLoadedCallbackMap: {},

    reset: function(window, htmlHelper)
    {
        this._window = window;

        this._externalFilesMap = {};
        this._pathSourceLoadedCallbackMap = {};
        this._htmlHelper = htmlHelper;
    },

    setBrowser: function(browser)
    {
        this._browser = browser;
    },

    getFileContent: function(filePath)
    {
        return this._externalFilesMap[filePath];
    },

    cacheAllExternalFilesContent: function(document, allFinishedCallback)
    {
        var externalFileElements = FireDataAccess.getExternalFileElements(document);
        externalFileElements.push({src: document.baseURI});
        var processedFiles = 0;

        for(var i = 0; i < externalFileElements.length; i++)
        {
            this.cacheExternalFileContent(externalFileElements[i].src || externalFileElements[i].href, function()
            {
                processedFiles++;

                if(processedFiles == externalFileElements.length) { allFinishedCallback(); }
            });
        }
    },

    cacheExternalFileContent: function(path, finishedCallback)
    {
        if(this._externalFilesMap[path]) { finishedCallback && finishedCallback(); return; }

        this._pathSourceLoadedCallbackMap[path] = { finishedCallback: finishedCallback, failCallbackId: this._window.setTimeout(function()
        {
            this._externalFilesMap[path] = "SOURCE_UNAVAILABLE";
            this._pathSourceLoadedCallbackMap[path] && this._pathSourceLoadedCallbackMap[path].finishedCallback && this._pathSourceLoadedCallbackMap[path].finishedCallback();
        }.bind(this), 500)};

        this._sourceCodeLoadedInBrowser = this._sourceCodeLoadedInBrowser.bind(this);

        this._browser.addEventListener("DOMContentLoaded", this._sourceCodeLoadedInBrowser);
        this._browser.setAttribute("src", "view-source:" + path);
    },

    asyncGetPageModel: function(url, iFrame, callback)
    {
        try
        {
            iFrame.style.height = "0px";
            iFrame.webNavigation.allowAuth = true;
            iFrame.webNavigation.allowImages = false;
            iFrame.webNavigation.allowJavascript = false;
            iFrame.webNavigation.allowMetaRedirects = true;
            iFrame.webNavigation.allowPlugins = false;
            iFrame.webNavigation.allowSubframes = false;

            iFrame.addEventListener("DOMContentLoaded", function listener(e)
            {
                try
                {
                    var document = e.originalTarget.wrappedJSObject;

                    iFrame.removeEventListener("DOMContentLoaded", listener, true);

                    this.cacheAllExternalFilesContent(document, function()
                    {
                        var htmlJson = this._htmlHelper.serializeToHtmlJSON
                        (
                            document,
                            this._getScriptsPathsAndModels(document),
                            this._getStylesPathsAndModels(document)
                        );

                        callback(document.defaultView, htmlJson);
                    }.bind(this));
                }
                catch(e) { Cu.reportError("Error while serializing html code:" + e + "->" + e.lineNo + " " + e.href);}
            }.bind(this), true);

            iFrame.webNavigation.loadURI(url, Ci.nsIWebNavigation, null, null, null);
        }
        catch(e) { Cu.reportError("Loading html in iFrame errror: " + e); }
    },

    _sourceCodeLoadedInBrowser: function()
    {
        var path = this._browser.contentDocument.baseURI.replace("view-source:", "");

        this._window.clearTimeout(this._pathSourceLoadedCallbackMap[path].failCallbackId);

        this._browser.removeEventListener("DOMContentLoaded", this._sourceCodeLoadedInBrowser);

        this._externalFilesMap[path] = this._browser.contentDocument.getElementById('viewsource').textContent;

        this._pathSourceLoadedCallbackMap[path] && this._pathSourceLoadedCallbackMap[path].finishedCallback && this._pathSourceLoadedCallbackMap[path].finishedCallback();
        this._pathSourceLoadedCallbackMap[path] = null;
    },

    getExternalFileElements: function(document)
    {
        var potentialExternalElements = document.querySelectorAll("script, link");
        var externalElements = [];

        for(var i = 0; i < potentialExternalElements.length; i++)
        {
            var element = potentialExternalElements[i];

            if(element.tagName == "SCRIPT" && element.src != "")
            {
                externalElements.push(element)
            }
            else if(element.tagName == "LINK" && element.rel == "stylesheet" && element.href != "")
            {
                externalElements.push(element);
            }
        }

        return externalElements;
    },

    _getScriptsPathsAndModels: function(document)
    {
        var scripts = document.getElementsByTagName("script");
        var scriptPathsAndModels = [];

        var currentPageContent = this._externalFilesMap[document.baseURI];
        currentPageContent = currentPageContent.replace(/(\r)?\n/g, "\n");

        var currentScriptIndex = 0;

        for(var i = 0; i < scripts.length; i++)
        {
            var script = scripts[i];

            if(script.src != "")
            {
                scriptPathsAndModels.push
                ({
                    path: script.src,
                    model: this.parseSourceCode(this._externalFilesMap[script.src], script.src, 1)
                });
            }
            else
            {
                scriptPathsAndModels.push
                ({
                    path: script.src,
                    model: this.parseSourceCode
                    (
                        script.textContent,
                        script.baseURI,
                        (function()
                        {
                            var code = script.textContent.replace(/(\r)?\n/g, "\n");
                            var scriptStringIndex = currentPageContent.indexOf(code, currentScriptIndex);

                            if(scriptStringIndex == null || scriptStringIndex == -1) { return -1; }
                            else
                            {
                                currentScriptIndex = scriptStringIndex + code.length;
                                return currentPageContent.substring(0, scriptStringIndex).split("\n").length;
                            }
                        })()
                    )
                });
            }
        }

        return scriptPathsAndModels;
    },

    _getStylesPathsAndModels: function(document)
    {
        var stylesheets = document.styleSheets;
        var stylePathAndModels = [];

        for(var i = 0; i < stylesheets.length; i++)
        {
            var styleSheet = stylesheets[i];
            stylePathAndModels.push
            (
                {
                    path : styleSheet.href != null ? styleSheet.href : document.baseURI,
                    model:  this._getStyleSheetModel(styleSheet)
                }
            );
        }

        return stylePathAndModels;
    },

    _getStyleSheetModel: function(styleSheet)
    {
        if(styleSheet == null) { return {}; }

        var model = { rules: [] };

        try
        {
            var cssRules = styleSheet.cssRules;

            for(var i = 0; i < cssRules.length; i++)
            {
                var cssRule = cssRules[i];
                model.rules.push
                (
                    {
                        selector: cssRule.selectorText,
                        cssText: cssRule.cssText,
                        declarations: this._getStyleDeclarations(cssRule)
                    }
                );
            }
        }
        catch(e)
        {
            CU.reportError("Error when getting stylesheet model: " + e);
        }

        return model;
    },

    _getStyleDeclarations: function(cssRule)
    {
        var declarations = {};

        try
        {
            //type == 1 for styles, so far we don't care about others
            if(cssRule == null || cssRule.style == null || cssRule.type != 1) { return declarations;}

            var style = cssRule.style;

            for(var i = 0; i < style.length; i++)
            {
                var key = style[i];
                declarations[key] = style[key];

                if(declarations[key] == null)
                {
                    if(key == "float")
                    {
                        declarations[key] = style["cssFloat"];
                    }
                    else
                    {
                        var newKey = key.replace(/-[a-z]/g, function(match){ return match[1].toUpperCase()});
                        declarations[key] = style[newKey];
                    }
                }

                if(declarations[key] == null)
                {
                    newKey = newKey.replace("Value", "");
                    declarations[key] = style[newKey];
                }

                if(declarations[key] == null)
                {
                    Cu.reportError("Unrecognized CSS Property: " + key);
                }
            }
        }
        catch(e)
        {
            CU.reportError("Error when getting style declarations: " + e  + " " + key + " " + newKey);
        }

        return declarations;
    },

    getScriptName: function(url)
    {
        if(!url) { return ""; }

        var lastIndexOfSlash = url.lastIndexOf("/");

        if(lastIndexOfSlash != -1) { return url.substring(lastIndexOfSlash + 1); }

        lastIndexOfSlash = url.lastIndexOf("\\");

        if(lastIndexOfSlash != -1) { return url.substring(lastIndexOfSlash + 1); }

        return url;
    },

    getContentScriptNameAndPaths: function(document)
    {
        var scriptPaths = [];

        scriptPaths.push({name: "* - " + FireDataAccess.getScriptName(document.baseURI), path: document.baseURI });
        scriptPaths.push({name: "DOM - " + FireDataAccess.getScriptName(document.baseURI), path: document.baseURI });

        var scriptElements = document.querySelectorAll("script");

        for(var i = 0; i < scriptElements.length; i++)
        {
            var src = scriptElements[i].src;

            if(src != "")
            {
                scriptPaths.push({name: FireDataAccess.getScriptName(src), path: src });
            }
        }

        return scriptPaths;
    },

    parseSourceCode: function(sourceCode, path, startLine)
    {
        Components.utils.import("resource://gre/modules/reflect.jsm");

        var model = Reflect.parse(sourceCode);

        if(model != null)
        {
            if(model.loc == null)
            {
                model.loc = { start: {line: startLine}, source: path};
            }

            if(model.loc.start.line != startLine)
            {
                model.lineAdjuster = startLine;
            }
            else
            {
                model.lineAdjuster = 0;
            }

            model.source = path;
        }

        return model;
    }
};
