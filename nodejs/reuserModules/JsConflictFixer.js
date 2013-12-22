var path = require('path');
var atob = require("atob");

var ValueTypeHelper = require(path.resolve(__dirname, "../../chrome/content/Firecrow/helpers/valueTypeHelper.js")).ValueTypeHelper;
var ASTHelper = require(path.resolve(__dirname, "../../chrome/content/Firecrow/helpers/ASTHelper.js")).ASTHelper;
var CssSelectorParser = require(path.resolve(__dirname, "../../chrome/content/Firecrow/parsers/CssSelectorParser.js")).CssSelectorParser;
var ReuserTemplates = require(path.resolve(__dirname, "../../chrome/content/Firecrow/templates/reuserTemplates.js")).ReuserTemplates;

var ConflictFixerCommon = require(path.resolve(__dirname, "ConflictFixerCommon.js")).ConflictFixerCommon;

var JsConflictFixer =
{
    _CONFLICT_COUNTER: 0,

    fixJsConflicts: function(pageAModel, pageBModel, pageAExecutionSummary, pageBExecutionSummary)
    {
        this._fixGlobalPropertyConflicts(pageAExecutionSummary, pageBExecutionSummary);
        this._fixPrototypeConflicts(pageAModel, pageBModel, pageAExecutionSummary, pageBExecutionSummary);
        this._fixTypeOnlyDomSelectors(pageAModel, pageBModel, pageAExecutionSummary, pageBExecutionSummary);
        this._fixEventHandlerProperties(pageAModel, pageBModel, pageAExecutionSummary, pageBExecutionSummary);
    },

    _fixGlobalPropertyConflicts: function(pageAExecutionSummary, pageBExecutionSummary)
    {
        var conflictedProperties = this._getConflictingProperties(pageAExecutionSummary, pageBExecutionSummary);

        conflictedProperties.forEach(function(conflictedProperty)
        {
            if(conflictedProperty == null || conflictedProperty.declarationConstruct == null) { return; }

            var newName = ConflictFixerCommon.generateReusePrefix() + conflictedProperty.name;

            var declarationConstruct = conflictedProperty.declarationConstruct;
            var hasDeclarationBeenChanged = false;

            if(ASTHelper.isAssignmentExpression(declarationConstruct))
            {
                if(ASTHelper.isIdentifier(declarationConstruct.left))
                {
                    declarationConstruct.left.name = newName;
                    hasDeclarationBeenChanged = true;
                }
                else if (ASTHelper.isMemberExpression(declarationConstruct.left))
                {
                    if(!declarationConstruct.left.computed || conflictedProperty.name == declarationConstruct.left.property.name)
                    {
                        declarationConstruct.left.property.name = newName;
                        hasDeclarationBeenChanged = true;
                    }
                    else if (ASTHelper.isMemberExpression(declarationConstruct.right)
                        ||  (ASTHelper.isAssignmentExpression(declarationConstruct.right)
                        && (ASTHelper.isMemberExpression(declarationConstruct.right.right)
                        || ASTHelper.isIdentifier(declarationConstruct.right.right)))
                        || (declarationConstruct.left.computed && ASTHelper.isIdentifier(declarationConstruct.right)))
                    {
                        //TODO - consider improving (problem when the conflicting property is assigned over for-in object extension)
                        console.log("Trying to replace computed member expression");

                        var memberPropertyDeclaration = null;

                        if(ASTHelper.isMemberExpression(declarationConstruct.right) || ASTHelper.isIdentifier(declarationConstruct.right))
                        {
                            memberPropertyDeclaration = this._getPropertyDeclaration(declarationConstruct.right, conflictedProperty.name);
                        }
                        else if (ASTHelper.isAssignmentExpression(declarationConstruct.right))
                        {
                            if(ASTHelper.isMemberExpression(declarationConstruct.right.right) || ASTHelper.isIdentifier(declarationConstruct.right.right))
                            {
                                memberPropertyDeclaration = this._getPropertyDeclaration(declarationConstruct.right.right, conflictedProperty.name);
                            }
                        }

                        if(memberPropertyDeclaration != null)
                        {
                            ConflictFixerCommon.addCommentToParentStatement(memberPropertyDeclaration, "Firecrow - Rename global property");
                            memberPropertyDeclaration.name = newName;
                            hasDeclarationBeenChanged = true;
                        }
                        else
                        {
                            //In MooTools multiple objects can be extended with the same property, so it could have been fixed before
                            //console.log("Can not find property declarator when fixing property conflicts");
                            debugger;
                        }
                    }
                    else
                    {
                        debugger;
                        console.log("Unhandled expression when fixing global properties conflicts in assignment expression");
                    }
                }
                else
                {
                    debugger;
                    console.log("Unhandled expression when fixing global properties conflicts in assignment expression");
                }
            }
            else if (ASTHelper.isVariableDeclarator(declarationConstruct) || ASTHelper.isFunctionDeclaration(declarationConstruct))
            {
                declarationConstruct.id.name = newName;
                hasDeclarationBeenChanged = true;
            }
            else
            {
                debugger;
                console.log("Unhandled expression when fixing global properties conflicts");
            }

            if(!hasDeclarationBeenChanged) { return; }

            ConflictFixerCommon.addCommentToParentStatement(declarationConstruct, "Firecrow - Rename global property");

            var dependentEdges = declarationConstruct.reverseDependencies;

            for(var i = 0, length = dependentEdges.length; i < length; i++)
            {
                var edge = dependentEdges[i];

                var sourceConstruct = edge.sourceNode;

                ConflictFixerCommon.addCommentToParentStatement(sourceConstruct, "Firecrow - Rename global property");

                if(ASTHelper.isIdentifier(sourceConstruct) && sourceConstruct.name == conflictedProperty.name)
                {
                    sourceConstruct.name = ConflictFixerCommon.generateReusePrefix() + sourceConstruct.name;
                }
                else if (ASTHelper.isMemberExpression(sourceConstruct) && sourceConstruct.property.name == conflictedProperty.name)
                {
                    sourceConstruct.property.name = ConflictFixerCommon.generateReusePrefix() + sourceConstruct.property.name;
                }
            }

            var undefinedGlobalPropertiesMap = pageAExecutionSummary.undefinedGlobalProperties;

            for(var propertyName in undefinedGlobalPropertiesMap)
            {
                for(var propertyAccess in undefinedGlobalPropertiesMap[propertyName])
                {
                    var codeConstruct = undefinedGlobalPropertiesMap[propertyName][propertyAccess];

                    var identifiers = ASTHelper.getAllElementsOfType(codeConstruct, [ASTHelper.CONST.Identifier]);

                    identifiers.forEach(function(identifier)
                    {
                        if(identifier.name == conflictedProperty.name)
                        {
                            identifier.name = newName;

                            ConflictFixerCommon.addCommentToParentStatement(identifier, "Firecrow - Rename global property");
                        }
                    }, this);
                }
            }

        }, this);
    },

    _fixPrototypeConflicts: function(pageAModel, pageBModel, pageAExecutionSummary, pageBExecutionSummary)
    {
        this._fixPrototypeSpilling(pageAModel, pageAExecutionSummary, pageBExecutionSummary.prototypeExtensions);
        this._fixPrototypeSpilling(pageBModel, pageBExecutionSummary, pageAExecutionSummary.prototypeExtensions);
    },

    _fixTypeOnlyDomSelectors: function(pageAModel, pageBModel, pageAExecutionSummary, pageBExecutionSummary)
    {
        this._fixTypeOnlyDomSelectorsInApplication(pageAModel, pageAExecutionSummary, "r");
        this._fixTypeOnlyDomSelectorsInApplication(pageBModel, pageBExecutionSummary, null);
    },

    _fixEventHandlerProperties: function(pageAModel, pageBModel, pageAExecutionSummary, pageBExecutionSummary)
    {
        var conflictedHandlers = this._getConflictedHandlers(pageAExecutionSummary, pageBExecutionSummary);

        if(conflictedHandlers.length == 0) { return; }

        conflictedHandlers.forEach(function(conflictedHandler)
        {
            this._replaceWithFirecrowHandler(conflictedHandler.pageAConflictConstruct);
            this._replaceWithFirecrowHandler(conflictedHandler.pageBConflictConstruct);
        }, this);

        this._insertFirecrowHandleConflictsCode(pageAModel, pageBModel);
    },

    _fixTypeOnlyDomSelectorsInApplication: function(pageModel, pageExecutionSummary, origin)
    {
        if(pageExecutionSummary == null) { return; }
        if(pageExecutionSummary.domQueriesMap == null) { return;}

        var attributeSelector = origin == "r" ? ConflictFixerCommon.generateReuseAttributeSelector()
                                              : ConflictFixerCommon.generateOriginalAttributeSelector();

        for(var domQueryProp in pageExecutionSummary.domQueriesMap)
        {
            var domQuery = pageExecutionSummary.domQueriesMap[domQueryProp];
            var callExpressionFirstArgument = ASTHelper.getFirstArgumentOfCallExpression(domQuery.codeConstruct);

            for(var selector in domQuery.selectorsMap)
            {
                //TODO - selector warning, possible problems with getElementsByTagName
                if(CssSelectorParser.containsTypeSelector(selector) && (domQuery.methodName == "querySelector" || domQuery.methodName == "querySelectorAll"))
                {
                    ConflictFixerCommon.replaceLiteralOrDirectIdentifierValue
                    (
                        {
                            oldValue: selector,
                            newValue: selector + attributeSelector
                        },
                        callExpressionFirstArgument
                    );
                }
            }
        }
    },

    _getPropertyDeclaration: function(codeConstruct, propertyName)
    {
        var dependencies = codeConstruct.dependencies;

        for(var i = 0; i < dependencies.length; i++)
        {
            var destinationConstruct = dependencies[i].destinationNode;

            if(ASTHelper.isProperty(destinationConstruct.parent) && destinationConstruct.parent.key.name == propertyName)
            {
                return destinationConstruct.parent.key;
            }
        }

        return null;
    },

    _getPrototypeExtensions: function(executionSummary)
    {
        var extensions = [];

        var prototypes = executionSummary.internalPrototypes || [];

        for(var i = 0; i < prototypes.length; i++)
        {
            var prototype = prototypes[i];

            var userDefinedProperties = prototype.userDefinedProperties;

            if(userDefinedProperties.length > 0)
            {
                extensions.push({ extendedObject: prototype, extendedProperties: userDefinedProperties});
            }
        }

        return extensions;
    },

    _fixPrototypeSpilling: function(pageModel, pageExecutionSummary, prototypeExtensions)
    {
        for(var prototype in prototypeExtensions)
        {
            var prototypeExtension = prototypeExtensions[prototype];
            var forInIterations = this._getIterationsOverPrototype(pageExecutionSummary.forInIterations, prototype);
            this._fixIterationConstructs(forInIterations, prototypeExtension);
        }
    },

    _getIterationsOverPrototype: function(forInIterations, prototype)
    {
        var iterations = [];

        for(var nodeId in forInIterations)
        {
            var forInIteration = forInIterations[nodeId];

            if(forInIteration.prototypes[prototype])
            {
                iterations.push(forInIteration.codeConstruct);
            }
        }

        return iterations;
    },

    _fixIterationConstructs: function(forInIterations, prototypeExtension)
    {
        for(var i = 0; i < forInIterations.length; i++)
        {
            this._extendForInBody(forInIterations[i], prototypeExtension);
        }
    },

    _extendForInBody: function(forInStatement, extendedProperties)
    {
        var propertyName = ASTHelper.getPropertyNameFromForInStatement(forInStatement);

        for(var i = 0; i < extendedProperties.length; i++)
        {
            var extendedProperty = extendedProperties[i];

            if(forInStatement.handledForInExtensions == null) { forInStatement.handledForInExtensions = []; }

            if(forInStatement.handledForInExtensions.indexOf(extendedProperty.name) == -1)
            {
                this._prependToForInBody(forInStatement, this._getSkipIterationConstruct(propertyName, extendedProperty.name));

                forInStatement.handledForInExtensions.push(extendedProperty.name);
            }
        }
    },

    _getSkipIterationConstruct: function(propertyName, skipPropertyName)
    {
        var skipIterationConstructString = atob(ReuserTemplates._FOR_IN_SKIPPER);

        var conflictCounter = this._CONFLICT_COUNTER;

        var updatedSkipIterationConstructString = skipIterationConstructString.replace("{PROPERTY_NAME}", propertyName)
        updatedSkipIterationConstructString = updatedSkipIterationConstructString.replace("{PROPERTY_VALUE}", skipPropertyName)
        updatedSkipIterationConstructString = updatedSkipIterationConstructString.replace(/{NODE_ID}/g, function()
        {
            return '"' + (propertyName +  (conflictCounter++)) + '"';
        });

        var skipIterationConstruct = JSON.parse(updatedSkipIterationConstructString);

        skipIterationConstruct.shouldBeIncluded = true;
        skipIterationConstruct.test.shouldBeIncluded = true;
        skipIterationConstruct.test.left.shouldBeIncluded = true;
        skipIterationConstruct.test.right.shouldBeIncluded = true;
        skipIterationConstruct.consequent.shouldBeIncluded = true;

        skipIterationConstruct.children = [skipIterationConstruct.test, skipIterationConstruct.consequent];

        skipIterationConstruct.test.parent = skipIterationConstruct;
        skipIterationConstruct.consequent.parent = skipIterationConstruct;

        return skipIterationConstruct;
    },

    _prependToForInBody: function(forInStatement, skipIterationConstruct)
    {
        if(ASTHelper.isBlockStatement(forInStatement.body))
        {
            skipIterationConstruct.parent = forInStatement.body;

            ValueTypeHelper.insertIntoArrayAtIndex(forInStatement.body.body, skipIterationConstruct, 0);
            ValueTypeHelper.insertIntoArrayAtIndex(forInStatement.body.children, skipIterationConstruct, 0);
        }
        else
        {
            debugger;
            //alert("Reuser - Unhandled construct when prepending to ForIn body");
        }
    },

    _replaceWithFirecrowHandler: function(codeConstruct)
    {
        var conflictCounter = this._CONFLICT_COUNTER;
        var handlerParent = null;
        var propertyNameParent = null;
        var conflictTemplate = ValueTypeHelper.deepClone(ReuserTemplates._HANDLER_CONFLICT_TEMPLATE);

        ASTHelper.traverseWholeAST(conflictTemplate, function(propertyValue, propertyName, parentObject)
        {
            if(propertyName == "nodeId")
            {
                parentObject[propertyName] = propertyValue.replace("{ID_PREFIX}", "FirecrowHandler" + conflictCounter);
            }

            if(propertyName == "value")
            {
                if(propertyValue != null && propertyValue.value == "{HANDLER_LITERAL_TEMPLATE}")
                {
                    handlerParent = parentObject;
                }
                else if (propertyValue == "{PROPERTY_NAME}")
                {
                    propertyNameParent = parentObject;
                }
            }
        });

        ASTHelper.setParentsChildRelationships(conflictTemplate);

        if(handlerParent != null && propertyNameParent != null)
        {
            if(ASTHelper.isAssignmentExpression(codeConstruct))
            {
                var parent = codeConstruct.parent;

                parent.expression = conflictTemplate;
                parent.children = [conflictTemplate];

                conflictTemplate.parent = parent;

                if(ASTHelper.isMemberExpression(codeConstruct.left))
                {
                    propertyNameParent.value = codeConstruct.left.property.name;
                }
                else if (ASTHelper.isIdentifier(codeConstruct.left))
                {
                    propertyNameParent.value = codeConstruct.left.name;
                }
                else { console.log("Unknown left hand side when replacing handlers");}

                handlerParent.value = codeConstruct.right;
                codeConstruct.right.parent = handlerParent;
            }
            else
            {
                console.log("Unhandled expression when replacing handlers");
            }
        }

        this._CONFLICT_COUNTER++;
    },

    _insertFirecrowHandleConflictsCode: function(pageAModel, pageBModel)
    {
        var headElement = ASTHelper.getHeadElement(pageBModel);

        if(headElement == null) { console.log("There is no head element"); return; }

        var handlerMapperScript = ValueTypeHelper.deepClone(ReuserTemplates._HANDLER_MAPPER_SCRIPT_CREATION_TEMPLATE);

        ValueTypeHelper.insertIntoArrayAtIndex(headElement.childNodes, handlerMapperScript, 0);

        var bodyElement = ASTHelper.getBodyElement(pageAModel);

        if(bodyElement == null) { console.log("There is no body element"); return; }

        var scriptInvokerScriptElement =
        {
            type: "script", childNodes:[], attributes:[{name:"o", value: "Firecrow"}],
            sourceCode: atob(ReuserTemplates._HANDLER_MAPPER_SCRIPT_INVOKER),
            shouldBeIncluded: true
        };

        bodyElement.childNodes.push(scriptInvokerScriptElement);
    },

    _getConflictedHandlers: function(pageAExecutionSummary, pageBExecutionSummary)
    {
        var pageAHandlerPropertiesMap = pageAExecutionSummary.eventHandlerPropertiesMap;
        var pageBHandlerPropertiesMap = pageBExecutionSummary.eventHandlerPropertiesMap;

        var conflictingHandlers = [];

        for(var pageAProperty in pageAHandlerPropertiesMap)
        {
            for(var pageBProperty in pageBHandlerPropertiesMap)
            {
                if(pageAProperty == pageBProperty && pageAHandlerPropertiesMap[pageAProperty].shouldBeIncluded)
                {
                    conflictingHandlers.push
                    ({
                        pageAConflictConstruct : pageAHandlerPropertiesMap[pageAProperty],
                        pageBConflictConstruct : pageBHandlerPropertiesMap[pageBProperty]
                    });
                }
            }
        }

        return conflictingHandlers;
    },

    _getConflictingProperties: function(pageAExecutionSummary, pageBExecutionSummary)
    {
        if(pageAExecutionSummary == null || pageBExecutionSummary == null) { return []; }

        var pageAGlobalProperties = pageAExecutionSummary.userSetGlobalProperties;
        var pageBGlobalProperties = pageBExecutionSummary.userSetGlobalProperties;

        var conflictedProperties = [];

        for(var i = 0; i < pageBGlobalProperties.length; i++)
        {
            var pageBProperty = pageBGlobalProperties[i];

            for(var j = 0; j < pageAGlobalProperties.length; j++)
            {
                var pageAGlobalProperty = pageAGlobalProperties[j];

                if(pageAGlobalProperty.name == pageBProperty.name && !pageAGlobalProperty.isEventProperty)
                {
                    conflictedProperties.push(pageAGlobalProperty);
                }
            }
        }

        var pageAUserDocumentProperties = pageAExecutionSummary.userSetDocumentProperties;
        var pageBUserDocumentProperties = pageBExecutionSummary.userSetDocumentProperties;

        for(var i = 0; i < pageBUserDocumentProperties.length; i++)
        {
            var pageBProperty = pageBUserDocumentProperties[i];

            for(var j = 0; j < pageAUserDocumentProperties.length; j++)
            {
                var pageAProperty = pageAUserDocumentProperties[j];

                if(pageAProperty.name == pageBProperty.name)
                {
                    conflictedProperties.push(pageAProperty);
                }
            }
        }

        var pageAPrototypeExtensions = pageAExecutionSummary.prototypeExtensions || {};
        var pageBPrototypeExtensions = pageBExecutionSummary.prototypeExtensions || {};

        for(var prototypeAExtension in pageAExecutionSummary.prototypeExtensions)
        {
            var pageAPrototypeExtension = pageAPrototypeExtensions[prototypeAExtension];
            var pageBPrototypeExtension = pageBPrototypeExtensions[prototypeAExtension];

            if(pageBPrototypeExtension != null)
            {
                for(var i = 0; i < pageAPrototypeExtension.length; i++)
                {
                    for(var j = 0; j < pageBPrototypeExtension.length; j++)
                    {
                        if(pageAPrototypeExtension[i].name == pageBPrototypeExtension[j].name)
                        {
                            conflictedProperties.push(pageAPrototypeExtension[i]);
                        }
                    }
                }
            }
        }

        return conflictedProperties;
    },

    _getCommonExtendedPropertiesFromReuse: function(pageAProperties, pageBProperties)
    {
        var common = [];

        for(var i = 0; i < pageAProperties.length; i++)
        {
            var pageAProperty = pageAProperties[i];
            for(var j = 0; j < pageBProperties.length; j++)
            {
                if(pageAProperty.name == pageBProperties[j].name)
                {
                    common.push(pageAProperty);
                }
            }
        }

        return common;
    }
};

exports.JsConflictFixer = JsConflictFixer;