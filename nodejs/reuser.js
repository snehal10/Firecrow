var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

console.log("reuser started");

var startTime = new Date();

//var pageAModelPath = process.argv[2] || path.resolve(__dirname, "../../CodeModels/evaluation/reuseTests/24/pageA.html-codeModel.txt");
//var pageBModelPath = process.argv[3] || path.resolve(__dirname, "../../CodeModels/evaluation/reuseTests/24/pageB.html-codeModel.txt");
//var expectedResultPath = process.argv[4] || path.resolve(__dirname, "../../CodeModels/evaluation/reuseTests/24/expectedResult.html");

var reuseFolder = "01-01_02";
var pageAModelPath = process.argv[2] || path.resolve(__dirname, "../evaluation/reuse/" + reuseFolder + "/pageA.html-codeModel.txt");
var pageBModelPath = process.argv[3] || path.resolve(__dirname, "../evaluation/reuse/" + reuseFolder + "/pageB.html-codeModel.txt");
var expectedResultPath = process.argv[4] || path.resolve(__dirname, "../evaluation/reuse/" + reuseFolder + "/expectedResult.html");

var resultPath = expectedResultPath.replace(/\w+\.\w+$/, "resultNew.html");

var expectedResult = fs.existsSync(expectedResultPath) ? fs.readFileSync(expectedResultPath, {encoding:"utf8"})
                                                       : "";
var allReadyComputed = false;

var scenarioModelForReuserSlicerPath = path.resolve(__dirname, "../phantomJs/dataFiles/scenarioModelForReuserSlicer.txt");
var scenarioModelForReuserAnalyzerPath = path.resolve(__dirname, "../phantomJs/dataFiles/scenarioModelForReuserAnalyzer.txt");

var phantomReuseSlicerScript = path.resolve(__dirname, "../phantomJs/evaluationHelpers/reuserScenarioExecutorSlicer.js");
var phantomReuseAnalyzerScript = path.resolve(__dirname, "../phantomJs/evaluationHelpers/reuserScenarioExecutorAnalyzer.js");

var scenarioExecutionSlicerSummaryFile = path.resolve(__dirname, "../phantomJs/dataFiles/scenarioExecutorSlicer.txt");
var scenarioExecutionAnalyzerSummaryFile = path.resolve(__dirname, "../phantomJs/dataFiles/scenarioExecutorAnalyzer.txt");

var Reuser = require(path.resolve(__dirname, "reuserModules/Reuser.js")).Reuser;
var ASTHelper = require(path.resolve(__dirname, "../chrome/content/Firecrow/helpers/ASTHelper.js")).ASTHelper;
var CodeTextGenerator = require(path.resolve(__dirname, "../chrome/content/Firecrow/codeMarkupGenerator/codeTextGenerator.js")).CodeTextGenerator;

var os = require('os');
var isWin = os.platform().indexOf("win") != -1 ? true : false;

var phantomJsPath = isWin ? 'C:\\phantomJs\\phantomjs.exe' : "/home/jomaras/phantomJs/phantomjs/bin/phantomjs";
/**************************************************************************************************************/
var HtmlModelMapping = []; //for the files

var pageAModelText = fs.readFileSync(pageAModelPath, {encoding:"utf8"});
var pageBModelText = fs.readFileSync(pageBModelPath, {encoding:"utf8"});
var pageAModel = (eval(pageAModelText), HtmlModelMapping[0].model); //HtmlModelMapping contained within the file
var pageBModel = (eval(pageBModelText), (HtmlModelMapping[1] || HtmlModelMapping[0]).model); //HtmlModelMapping contained within the file [1] - if we use reuse case studies, and [0] if not

var pageAModelMapping = createModelMapping(pageAModel);
var pageBModelMapping = createModelMapping(pageBModel);

pageAModelMapping.createdDependencies = {};
pageBModelMapping.createdDependencies = {};

pageAModel.parentChildRelationshipsHaveBeenSet = false;
pageBModel.parentChildRelationshipsHaveBeenSet = false;

var pageAExecutionSummary = null;
var pageBExecutionSummary = null;

ASTHelper.setParentsChildRelationships(pageAModel);
ASTHelper.setParentsChildRelationships(pageBModel);

copyFileContent(pageAModelPath, scenarioModelForReuserSlicerPath);
console.log("reuser:", "Slicing", pageAModelPath);

if(allReadyComputed)
{
    pageAExecutionSummary = JSON.parse(fs.readFileSync(scenarioExecutionSlicerSummaryFile, {encoding: "utf8"}));

    updatePageModel(pageAExecutionSummary, pageAModelMapping, pageAModel);

    pageBExecutionSummary = JSON.parse(fs.readFileSync(scenarioExecutionAnalyzerSummaryFile, {encoding: "utf8"}));
    updatePageModel(pageBExecutionSummary, pageBModelMapping, pageBModel);
    performReuse(pageAExecutionSummary, pageBExecutionSummary);
}
else
spawnPhantomJsProcess
(
    phantomReuseSlicerScript, [],
    function onData(data) { console.log("PhantomJs-ReuseSlicer:", data.toString()); },
    function onClose()
    {
        pageAExecutionSummary = JSON.parse(fs.readFileSync(scenarioExecutionSlicerSummaryFile, {encoding: "utf8"}));

        updatePageModel(pageAExecutionSummary, pageAModelMapping, pageAModel);

        copyFileContent(pageBModelPath, scenarioModelForReuserAnalyzerPath);
        console.log("reuser:", "Analyzing", pageBModelPath);

        spawnPhantomJsProcess
        (
            phantomReuseAnalyzerScript, [],
            function onData(data) { console.log("PhantomJs-ReuseAnalyzer:" + data.toString()); },
            function onClose()
            {
                pageBExecutionSummary = JSON.parse(fs.readFileSync(scenarioExecutionAnalyzerSummaryFile, {encoding: "utf8"}));
                updatePageModel(pageBExecutionSummary, pageBModelMapping, pageBModel);
                performReuse(pageAExecutionSummary, pageBExecutionSummary);
                var endTime = new Date();
                var diff = endTime - startTime;
                console.log("Time: ", diff/1000, "sec");
            }
        );
    }
);

function performReuse(pageAExecutionSummary, pageBExecutionSummary)
{
    console.log("Performing reuse");

    var mergedModel = Reuser.getMergedModel(pageAModel, pageBModel, pageAExecutionSummary, pageBExecutionSummary);
    var result = CodeTextGenerator.generateCode(mergedModel);

    console.log("Result written to:", resultPath);
    console.log("Changes:", JSON.stringify(mergedModel.changes));
    fs.writeFileSync(resultPath, result);

    if(expectedResult != null && expectedResult != "")
    {
        var expectedWithoutWhitespace = expectedResult.replace(/\s/g, "").replace(/\*([^*]|[\r\n])*\*/g,"").replace(/\/\//g,"");
        var resultWithoutWhitespace = result.replace(/\s/g, "").replace(/\*([^*]|[\r\n])*\*/g, "").replace(/\/\//g,"");
        if(expectedWithoutWhitespace != resultWithoutWhitespace)
        {
            console.log("Result and expected result differ!");
            console.log(result);
            console.log("/*********************/");
            console.log("/*********************/");
            console.log(expectedResult);
            console.log("/*********************/");
            console.log(expectedWithoutWhitespace);
            console.log("/*********************/");
            console.log(resultWithoutWhitespace);
        }
        else
        {
            console.log("Result and expected result match!");
        }
    }
    else
    {
        console.log("There is no expected result!");
    }
}

function updatePageModel(executionSummary, pageModelMapping, pageModel)
{
    updateIncludedNodes(executionSummary.includedNodeIds, pageModelMapping);

    pageModel.htmlNodes = [];
    pageModel.cssNodes = [];
    pageModel.jsNodes = [];

    updatePageModelNodes(executionSummary.dependencyGraph.htmlNodes, pageModelMapping, pageModel);
    updatePageModelNodes(executionSummary.dependencyGraph.cssNodes, pageModelMapping, pageModel);
    updatePageModelNodes(executionSummary.dependencyGraph.jsNodes, pageModelMapping, pageModel);

    updateDomQueriesMap(executionSummary.domQueriesMap, pageModelMapping);
    updateUserSetGlobalProperties(executionSummary.userSetGlobalProperties, pageModelMapping);
    updateUserSetDocumentProperties(executionSummary.userSetDocumentProperties, pageModelMapping);

    updateDynamicIds(executionSummary.dynamicIdMap, pageModelMapping);
    updateDynamicClasses(executionSummary.dynamicClassMap, pageModelMapping);

    updateUndefinedGlobalProperties(executionSummary.undefinedGlobalProperties, pageModelMapping);
    updateEventHandlerPropertiesMap(executionSummary.eventHandlerPropertiesMap, pageModelMapping);
    updateResourceSetterMap(executionSummary.resourceSetterMap, pageModelMapping);
    updatePrototypeExtensions(executionSummary.prototypeExtensions, pageModelMapping);
    updateForInIterations(executionSummary.forInIterations, pageModelMapping);

    updateAdditionalDependencies(executionSummary.dataDependencies, pageModelMapping);

    updatePostProcessorInclusions(executionSummary.postProcessorInclusions, pageModelMapping);
}

function updateIncludedNodes(includedNodeIds, pageModelMapping)
{
    if(includedNodeIds == null || includedNodeIds.length == 0) { return; }

    for(var i = 0; i < includedNodeIds.length; i++)
    {
        var node = pageModelMapping[includedNodeIds[i]];

        node && (node.shouldBeIncluded = true);
    }
}

function updatePageModelNodes(nodes, pageModelMapping, pageModel)
{
    for(var i = 0; i < nodes.length; i++)
    {
        var node = nodes[i];

        if(node.modelId != -1)
        {
            var nodeModel = pageModelMapping[node.modelId];

            if(nodeModel == null)
            {
                pageModelMapping[node.modelId] = nodeModel = { type:"DummyCodeElement", nodeId: node.modelId };;
            }

                 if(node.type == "html") { pageModel.htmlNodes.push(nodeModel); }
            else if(node.type == "css") { pageModel.cssNodes.push(nodeModel); }
            else if(node.type == "js") { pageModel.jsNodes.push(nodeModel); }

            if(nodeModel != null)
            {
                nodeModel.dependencies = getUpdatedDependencies(node.dataDependencies, pageModelMapping);
                nodeModel.reverseDependencies = getUpdatedDependencies(node.reverseDependencies, pageModelMapping, true);
            }
        }
    }
}

function getUpdatedDependencies(dependencies, pageModelMapping, areReverseDependencies)
{
    var updatedDependencies = [];

    for(var i = 0; i < dependencies.length; i++)
    {
        var dependency = dependencies[i];
        var sourceNodeId = dependency.sourceNodeId;
        var destinationNodeId = dependency.destinationNodeId;

        if(pageModelMapping.createdDependencies[sourceNodeId] == null) { pageModelMapping.createdDependencies[sourceNodeId] = {}; }
        if(pageModelMapping.createdDependencies[destinationNodeId] == null) { pageModelMapping.createdDependencies[destinationNodeId] = {}; }

        if(areReverseDependencies)
        {
            pageModelMapping.createdDependencies[destinationNodeId][sourceNodeId] = true;
        }
        else
        {
            pageModelMapping.createdDependencies[sourceNodeId][destinationNodeId] = true;
        }

        updatedDependencies.push
        ({
            sourceNode: pageModelMapping[sourceNodeId],
            destinationNode: pageModelMapping[destinationNodeId]
        });
    }

    return updatedDependencies;
}

function updateDomQueriesMap(domQueriesMap, pageModelMapping)
{
    for(var nodeId in domQueriesMap)
    {
        domQueriesMap[nodeId].codeConstruct = pageModelMapping[nodeId];
    }
}

function updateUserSetGlobalProperties(userSetGlobalProperties, pageModelMapping)
{
    for(var i = 0; i < userSetGlobalProperties.length; i++)
    {
        var userSetGlobalProperty = userSetGlobalProperties[i];

        userSetGlobalProperty.declarationConstruct = pageModelMapping[userSetGlobalProperty.declarationConstructId];
    }
}

function updateUserSetDocumentProperties(userSetDocumentProperties, pageModelMapping)
{
    for(var i = 0; i < userSetDocumentProperties.length; i++)
    {
        var userSetProperty = userSetDocumentProperties[i];

        userSetProperty.declarationConstruct = pageModelMapping[userSetProperty.declarationConstructId];
    }
}

function updateDynamicIds(dynamicIdMap, pageModelMapping)
{
    for(var dynamicId in dynamicIdMap)
    {
        var item = dynamicIdMap[dynamicId];

        for(var nodeId in item.nodeIdMap)
        {
            var model = pageModelMapping[nodeId];

            if(model)
            {
                if(model.dynamicIds == null) { model.dynamicIds = []; }

                for(var setConstructId in item.codeConstructIdMap)
                {
                    model.dynamicIds.push({name: "id", value: item.value, setConstruct: pageModelMapping[setConstructId]});
                }
            }
        }
    }
}

function updateDynamicClasses(dynamicClassesMap, pageModelMapping)
{
    for(var dynamicClass in dynamicClassesMap)
    {
        var item = dynamicClassesMap[dynamicClass];

        for(var nodeId in item.nodeIdMap)
        {
            var model = pageModelMapping[nodeId];

            if(model)
            {
                if(model.dynamicClasses == null) { model.dynamicClasses = []; }

                for(var setConstructId in item.codeConstructIdMap)
                {
                    model.dynamicClasses.push({name: "class", value: item.value, setConstruct: pageModelMapping[setConstructId]});
                }
            }
        }
    }
}

function updateUndefinedGlobalProperties(undefinedGlobalProperties, pageModelMapping)
{
    for(var propName in undefinedGlobalProperties)
    {
        var property = undefinedGlobalProperties[propName];

        for(var nodeId in property)
        {
            property[nodeId] = pageModelMapping[nodeId];
        }
    }
}


function updateEventHandlerPropertiesMap(eventHandlerPropertiesMap, pageModelMapping)
{
    for(var propertyName in eventHandlerPropertiesMap)
    {
        eventHandlerPropertiesMap[propertyName] = pageModelMapping[eventHandlerPropertiesMap[propertyName]];
    }
}

function updateResourceSetterMap(resourceSetterMap, pageModelMapping)
{
    for(var nodeId in resourceSetterMap)
    {
        resourceSetterMap[nodeId].codeConstruct = pageModelMapping[nodeId];
    }
}

function updatePrototypeExtensions(prototypeExtensions, pageModelMapping)
{
    for(var prototype in prototypeExtensions)
    {
        var prototypeExtension = prototypeExtensions[prototype];

        for(var i = 0; i < prototypeExtension.length; i++)
        {
            prototypeExtension[i].declarationConstruct = pageModelMapping[prototypeExtension[i].codeConstructId];
        }
    }
}

function updateForInIterations(forInIterations, pageModelMapping)
{
    for(var nodeId in forInIterations)
    {
        forInIterations[nodeId].codeConstruct = pageModelMapping[nodeId];
    }
}

function updateAdditionalDependencies(dataDependencies, pageModelMapping)
{
    if(dataDependencies == null) { return; }

    for(var fromId in dataDependencies)
    {
        var fromDependencies = dataDependencies[fromId];

        for(var toId in fromDependencies)
        {
            var fromNode = pageModelMapping[fromId];
            var toNode = pageModelMapping[toId];

            if(pageModelMapping.createdDependencies[fromId] == null)
            {
                pageModelMapping.createdDependencies[fromId] = {};
            }

            if(!pageModelMapping.createdDependencies[fromId][toId])
            {
                var edge = { sourceNode: fromNode, destinationNode: toNode };

                fromNode.dependencies.push(edge);
                toNode.reverseDependencies.push(edge);

                pageModelMapping.createdDependencies[fromId][toId];
                console.log("Added");
            }
        }
    }
}

function updatePostProcessorInclusions(postProcessorInclusions, pageModelMapping)
{
    for(var nodeId in postProcessorInclusions)
    {
        var node = pageModelMapping[nodeId];

        if(node)
        {
            node.isIncludedByPostprocessor = true;
        }
    }
}

function createModelMapping(pageModel)
{
    var pageModelMapping = {};

    ASTHelper.traverseAst(pageModel, function(element)
    {
        if(element.nodeId !== null && element.nodeId !== undefined)
        {
            pageModelMapping[element.nodeId] = element;
        }
    });

    return pageModelMapping;
}

/**************************************************************************************************************/
function spawnPhantomJsProcess(pathToFile, args, onDataFunction, onCloseFunction)
{
    var prc = spawn(phantomJsPath, [pathToFile].concat(args));

    prc.stdout.setEncoding('utf8');

    prc.stdout.on('data', onDataFunction);
    prc.on('close', onCloseFunction);
}

function copyFileContent(fromLocation, toLocation)
{
    fs.writeFileSync(toLocation, fs.readFileSync(fromLocation, { encoding: "utf8"}));
}