var system = require('system');
var webPage = require('webpage');
var page = webPage.create();
var fs = require('fs');

var loadInProgress = false;

var htmlFiles = [];
var pageIndex = 0;

var libraryName = system.args[1] || "jQuery";
var sourceFolder = system.args[2] || "slicedAll";
var destinationFolderAddon = "_models";

var rootFolder = "C:\\GitWebStorm\\Firecrow\\evaluation\\libraries\\" + libraryName + "\\" + sourceFolder;

page.onConsoleMessage = function(msg) { system.stderr.writeLine('console: ' + msg); };
page.onAlert = function(msg) { console.log('ALERT: ' + msg); };
htmlFiles = fs.list(rootFolder).map(function(fileName)
{
    var fullPath = rootFolder + fs.separator + fileName;

    if(fs.isFile(fullPath) && fullPath.indexOf('.html') != -1 && fullPath.indexOf("effects04") != -1)
    {
        return fullPath;
    }
}).filter(function(item){ return item != null; });

var interval = setInterval(function() {
    if (!loadInProgress && pageIndex < htmlFiles.length)
    {
        page.open(htmlFiles[pageIndex].replace("C:\\GitWebStorm\\", "http:\\\\localhost\\").replace(/\\/g, "/"));
    }
    if (pageIndex == htmlFiles.length)
    {
        phantom.exit();
    }
}, 250);

page.onLoadStarted = function() {
    loadInProgress = true;
};

page.onLoadFinished = function() {
    page.injectJs("C:/GitWebStorm/Firecrow/phantomJs/evaluationHelpers/injections/getExternalSources.js");

    var externalFiles = page.evaluate(function()
    {
        return FIRECROW_EXTERNAL_SOURCES;
    });

    var pageJSON = page.evaluate(function(externalFiles)
    {
        function getSimplifiedElement(rootElement)
        {
            var elem = { type: rootElement.nodeType != 3 ? rootElement.localName : "textNode" };

            var attributes = getAttributes(rootElement);
            if(attributes.length != 0) { elem.attributes = attributes; }

            var childNodes = getChildren(rootElement)
            if(childNodes.length != 0) { elem.childNodes = childNodes; }

            if(rootElement.tagName == "SCRIPT" || rootElement.tagName == "STYLE" || rootElement.nodeType == 3)
            {
                elem.textContent = rootElement.textContent;

                if(rootElement.tagName == "SCRIPT")
                {
                    elem.textContent = rootElement.text;

                    unifyChildTextNodes(elem);

                    if(rootElement.src != null)
                    {
                        elem.textContent = externalFiles[rootElement.src];
                    }
                }
            }

            return elem;
        };

        function getAttributes(element)
        {
            var attributes = [];

            if(element.attributes == null) { return attributes; }

            for(var i = 0; i < element.attributes.length; i++)
            {
                var currentAttribute = element.attributes[i];
                attributes.push
                ({
                    name: currentAttribute.name,
                    value: currentAttribute.value
                });
            }

            return attributes;
        }

        function getChildren(rootElement)
        {
            var allNodes = [];
            if(rootElement.childNodes == null) { return allNodes;}

            for(var i = 0; i < rootElement.childNodes.length;i++)
            {
                var simplifiedNode = getSimplifiedElement(rootElement.childNodes[i]);
                if(simplifiedNode != null)
                {
                    allNodes.push(simplifiedNode);
                }
            }

            return allNodes;
        }

        function unifyChildTextNodes(elem)
        {
            var childNodes = elem.childNodes;
            var newChild = { type: "textNode", textContent: ""};
            var textContent;

            for(var i = 0; i < childNodes.length; i++)
            {
                newChild.textContent += childNodes[i].textContent;
            }

            elem.childNodes = [newChild];
        }
        try
        {
            return JSON.stringify(getSimplifiedElement(document.documentElement));
        }
        catch(e)
        {
            alert("Error when stringifying in pageModeler");
            return "";
        }

    }, externalFiles);

    fs.write(htmlFiles[pageIndex].replace(".html", ".json").replace(sourceFolder, sourceFolder + destinationFolderAddon), pageJSON);

    loadInProgress = false;

    pageIndex++;
};