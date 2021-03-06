var usesModule = typeof module !== 'undefined' && module.exports;
var ASTHelper;
if(usesModule)
{
    FBL =  { Firecrow: {}, ns:  function(namespaceFunction){ namespaceFunction(); }};
}

FBL.ns(function () { with (FBL) {

Firecrow.ASTHelper = ASTHelper =
{
    parseSourceCodeToAST: function(sourceCode, sourceCodePath, startLine)
    {
        try
        {
            Components.utils.import("resource://gre/modules/reflect.jsm");

            var model = Reflect.parse(sourceCode);

            if(model != null)
            {
                if(model.loc == null)
                {
                    model.loc = { start: {line: startLine}, source: sourceCodePath};
                }

                if(model.loc.start.line != startLine)
                {
                    model.lineAdjuster = startLine;
                }
                else
                {
                    model.lineAdjuster = 0;
                }

                model.source = sourceCodePath;
            }

            return model;
        }
        catch(e) { Cu.reportError("Error while getting AST from source code@" + sourceCodePath + "; error: " + e); }
    },

    calculateCoverage: function(pageModel, scriptPathsToIgnore)
    {
        if(pageModel.htmlElement == null && pageModel.model != null) { pageModel = pageModel.model; }

        var scripts = ASTHelper.getScriptElements(pageModel.htmlElement);
        scriptPathsToIgnore = scriptPathsToIgnore || [];

        var totalNumberOfExpressions = 0;
        var executedNumberOfExpressions = 0;

        var totalNumberOfStatements = 0;
        var executedNumberOfStatements = 0;

        var totalNumberOfBranches = 0;
        var executedNumberOfBranches = 0;

        for(var i = 0; i < scripts.length; i++)
        {
            var script = scripts[i];

            if(scriptPathsToIgnore.indexOf(ASTHelper.getAttributeValue(script, "src")) != -1)
            {
                console.log("Skipping when calculating coverage", ASTHelper.getAttributeValue(script, "src"));
                continue;
            }

            ASTHelper.traverseAst(script.pathAndModel.model, function(astElement)
            {
                if(ASTHelper.isExpression(astElement))
                {
                    totalNumberOfExpressions++;
                    if(astElement.hasBeenExecuted)
                    {
                        executedNumberOfExpressions++;
                    }
                }

                if(ASTHelper.isStatement(astElement) && !ASTHelper.isBlockStatement(astElement) && !ASTHelper.isEmptyStatement(astElement))
                {
                    totalNumberOfStatements++;

                    if(astElement.hasBeenExecuted)
                    {
                        executedNumberOfStatements++;
                    }
                }

                if(ASTHelper.isBranchExpression(astElement))
                {
                    if((ASTHelper.isIfStatement(astElement) && ASTHelper.isIfStatementBodyExecuted(astElement))
                    || (ASTHelper.isSwitchCase(astElement) && ASTHelper.isSwitchCaseExecuted(astElement))
                    || (ASTHelper.isLoopStatement(astElement) && ASTHelper.isLoopStatementExecuted(astElement)))
                    //|| (ASTHelper.isPureElseStatement(astElement) && ASTHelper._isElseStatementExecuted(astElement)))
                    {
                        executedNumberOfBranches++;
                    }
                    else if (ASTHelper.isConditionalExpression(astElement))
                    {
                        //has two alternatives - so maybe count it as two branches
                        totalNumberOfBranches++;

                        if(astElement.consequent.hasBeenExecuted) { executedNumberOfBranches++; }
                        if(astElement.alternate.hasBeenExecuted) { executedNumberOfBranches++; }
                    }

                    if(ASTHelper.isSwitchCase(astElement) && astElement.consequent.length == 0)
                    {
                        return;
                    }

                    totalNumberOfBranches++;
                }
            });
        }

        return {
            totalNumberOfExpressions: totalNumberOfExpressions,
            executedNumberOfExpressions: executedNumberOfExpressions,
            totalNumberOfStatements: totalNumberOfStatements,
            executedNumberOfStatements: executedNumberOfStatements,
            expressionCoverage: executedNumberOfExpressions/totalNumberOfExpressions,
            statementCoverage: executedNumberOfStatements/totalNumberOfStatements,
            totalNumberOfBranches: totalNumberOfBranches,
            executedNumberOfBranches: executedNumberOfBranches,
            branchCoverage:  totalNumberOfBranches != 0 ? executedNumberOfBranches/totalNumberOfBranches : 1
        };
    },

    isBranchExpression: function(element)
    {
        return this.isSwitchCase(element) || this.isIfStatement(element) || this.isLoopStatement(element)
            || this.isConditionalExpression(element);
    },

    isLoopStatementExecuted: function(element)
    {
        if(this.isBlockStatement(element.body))
        {
            return this._isBlockStatementExecuted(element.body);
        }

        return element.body.hasBeenExecuted;
    },

    _isLoopStatementEventExecuted: function(element, executionId)
    {
        if(executionId == null) { return this.isLoopStatementExecuted(element); }

        if(this.isBlockStatement(element.body))
        {
            return this._isBlockStatementEventExecuted(element.body, executionId);
        }

        return this._hasBeenExecutedByEvent(element.body, executionId);
    },

    isSwitchCaseExecuted: function(element)
    {
        for(var i = 0; i < element.consequent.length; i++)
        {
            if(element.consequent[i].hasBeenExecuted)
            {
                return true;
            }
        }

        return false;
    },

    _isSwitchCaseEventExecuted: function(element, executionId)
    {
        if(executionId == null) { return this.isSwitchCaseExecuted(element); }
        for(var i = 0; i < element.consequent.length; i++)
        {
            if(this._hasBeenExecutedByEvent(element.consequent[i], executionId))
            {
                return true;
            }
        }

        return false;
    },

    isIfStatementBodyExecuted: function(ifStatement)
    {
        if(this.isBlockStatement(ifStatement.consequent))
        {
            return this._isBlockStatementExecuted(ifStatement.consequent);
        }

        return ifStatement.consequent.hasBeenExecuted;
    },

    isIfStatementElseExecuted: function(ifStatement)
    {
        if(this.isBlockStatement(ifStatement.alternate))
        {
            return this._isBlockStatementExecuted(ifStatement.alternate);
        }

        return ifStatement.alternate.hasBeenExecuted;
    },

    _isElseStatementExecuted: function(elseConstruct)
    {
        debugger;
    },

    _isIfStatementBodyEventExecuted: function(ifStatement, executionId)
    {
        if(executionId == null) { return this.isIfStatementBodyExecuted(ifStatement);}

        if(this.isBlockStatement(ifStatement.consequent))
        {
            return this._isBlockStatementEventExecuted(ifStatement.consequent, executionId);
        }

        return this._hasBeenExecutedByEvent(ifStatement.consequent, executionId);
    },

    _isBlockStatementExecuted: function(blockStatement)
    {
        for(var i = 0; i < blockStatement.body.length; i++)
        {
            if(blockStatement.body[i].hasBeenExecuted)
            {
                return true;
            }
        }

        return false;
    },

    _isBlockStatementEventExecuted: function(blockStatement, executionId)
    {
        for(var i = 0; i < blockStatement.body.length; i++)
        {
            if(this._hasBeenExecutedByEvent(blockStatement.body[i], executionId))
            {
                return true;
            }
        }

        return false;
    },

    getNodeWithId: function(pageModel, nodeId)
    {
        var foundNode = null;
        this.traverseAst(pageModel, function(currentElement)
        {
            if(currentElement.nodeId == nodeId)
            {
                foundNode = currentElement;
            }
        });

        return foundNode;
    },

    getFunctionCoverageInfo: function(functionConstruct, executionId)
    {
        var totalNumberOfExpressions = 0;
        var executedNumberOfExpressions = 0;

        var totalNumberOfStatements = 0;
        var executedNumberOfStatements = 0;

        var totalNumberOfBranches = 0;
        var executedNumberOfBranches = 0;

        if(functionConstruct != null)
        {
            this.traverseAstWhileIgnoring(functionConstruct.body, function(astElement)
            {
                if(ASTHelper.isExpression(astElement))
                {
                    totalNumberOfExpressions++;
                    if(ASTHelper._hasBeenExecutedByEvent(astElement, executionId))
                    {
                        executedNumberOfExpressions++;
                    }
                }

                if(ASTHelper.isStatement(astElement) && !ASTHelper.isBlockStatement(astElement))
                {
                    totalNumberOfStatements++;

                    if(ASTHelper._hasBeenExecutedByEvent(astElement, executionId))
                    {
                        executedNumberOfStatements++;
                    }
                }

                if(ASTHelper.isBranchExpression(astElement))
                {
                    if((ASTHelper.isIfStatement(astElement) && ASTHelper._isIfStatementBodyEventExecuted(astElement, executionId))
                    || (ASTHelper.isSwitchCase(astElement) && ASTHelper._isSwitchCaseEventExecuted(astElement, executionId))
                    || (ASTHelper.isLoopStatement(astElement) && ASTHelper._isLoopStatementEventExecuted(astElement, executionId)))
                    {
                        executedNumberOfBranches++;
                    }
                    else if (ASTHelper.isConditionalExpression(astElement))
                    {
                        //has two alternatives - so maybe count it as two branches
                        totalNumberOfBranches++;

                        if(ASTHelper._hasBeenExecutedByEvent(astElement.consequent, executionId)) { executedNumberOfBranches++; }
                        if(ASTHelper._hasBeenExecutedByEvent(astElement.alternate, executionId)) { executedNumberOfBranches++; }
                    }

                    if(ASTHelper.isSwitchCase(astElement) && astElement.consequent.length == 0)
                    {
                        return;
                    }

                    totalNumberOfBranches++;
                }
            }, ["FunctionExpression", "FunctionDeclaration"]);
        }


        var branchCoverage = totalNumberOfBranches != 0 ? executedNumberOfBranches/totalNumberOfBranches
                                                        : 1;

         return {
            totalNumberOfExpressions: totalNumberOfExpressions,
            executedNumberOfExpressions: executedNumberOfExpressions,
            totalNumberOfStatements: totalNumberOfStatements,
            executedNumberOfStatements: executedNumberOfStatements,
            expressionCoverage: executedNumberOfExpressions/totalNumberOfExpressions,
            statementCoverage: executedNumberOfStatements/totalNumberOfStatements,
            totalNumberOfBranches: totalNumberOfBranches,
            executedNumberOfBranches: executedNumberOfBranches,
            branchCoverage: branchCoverage
        };
    },

    getLoopStatements: function(root)
    {
        var loops = [];
        ASTHelper.traverseDirectSourceElements(root, function(element)
        {
            if(ASTHelper.isLoopStatement(element))
            {
                loops.push(element)
            }
        }, false);

        return loops;
    },

    _hasBeenExecutedByEvent: function(astElement, executionId)
    {
        if(executionId == null) { return astElement.hasBeenExecuted; }

        return astElement.executorEventsMap != null && astElement.executorEventsMap[executionId];
    },

    setParentsChildRelationships: function(rootElement)
    {
        try
        {
            if(rootElement == null || rootElement.parentChildRelationshipsHaveBeenSet) { return; }

            var lineNumberAdjust = rootElement.lineAdjuster || 0;
            var source = rootElement.source || "";

            this.traverseAst(rootElement, function(currentElement, propertyName, parentElement)
            {
                if(currentElement != null)
                {
                    currentElement.parent = parentElement;
                }

                if(ASTHelper.isProgram(currentElement))
                {
                    lineNumberAdjust = currentElement.lineAdjuster || 0;
                    source = rootElement.source || "";
                }

                if(currentElement.loc != null)
                {
                    currentElement.loc.start.line += lineNumberAdjust;
                    currentElement.loc.end.line += lineNumberAdjust
                    currentElement.loc.source = source;
                }

                if(parentElement != null)
                {
                    if(parentElement.children == null) { parentElement.children = []; }

                    if(currentElement != null)
                    {
                        currentElement.indexInParent = parentElement.children.length;

                        if(ASTHelper.getFunctionParent(currentElement) != null)
                        {
                            for(var i = parentElement.children.length - 1; i >= 0; i--)
                            {
                                var child = parentElement.children[i];

                                if((ASTHelper.isLoopStatement(child) || ASTHelper.isIfStatement(child)))
                                {
                                    currentElement.previousCondition = child.test;
                                    break;
                                }
                            }

                            if(ASTHelper.isStatement(parentElement) && currentElement.previousCondition == null)
                            {
                                currentElement.previousCondition = parentElement.previousCondition;
                            }
                        }

                        parentElement.children.push(currentElement);
                    }
                }
            });

            rootElement.parentChildRelationshipsHaveBeenSet = true;
        }
        catch(e) { alert("Error when setting parent-child relationships:" + e); }
    },

    isAncestor: function(firstNode, secondNode)
    {
        var ancestor = firstNode;

        while(ancestor != null)
        {
            if(secondNode == ancestor) { return true; }
            ancestor = ancestor.parent;
        }

        return false;
    },

    getCssRules: function(codeModel)
    {
        var cssRules = [];

        var styleElements = this.getStyleElements(codeModel.htmlElement);

        for(var i = 0; i < styleElements.length; i++)
        {
            var cssElement = styleElements[i];

            var jCssRules = this.getCssRulesFromElement(cssElement);

            if(jCssRules == null) { continue; }

            for(var j = 0; j < jCssRules.length; j++)
            {
                var rule = jCssRules[j];
                var properties = [];

                for(var propName in rule.declarations)
                {
                    if(propName == "parent") { continue; }

                    properties.push({key: propName, value: rule.declarations[propName]});
                }

                cssRules.push({
                   selector: rule.selector,
                   properties: properties,
                   rule: rule
                });
            }
        }

        return cssRules;
    },

    getCssRulesFromElement: function(cssElement)
    {
        if(cssElement == null) { return null; }

        var pathAndModel = cssElement.pathAndModel;

        if(pathAndModel == null) { return null; }

        var model = pathAndModel.model;

        if(model == null) { return null; }

        return model.rules;
    },

    getCssFilePathFromDeclaration: function(cssDeclarationsObject)
    {
        if(cssDeclarationsObject == null || cssDeclarationsObject.parent == null
        || cssDeclarationsObject.parent.cssText == null || cssDeclarationsObject.parent.parent == null
        || cssDeclarationsObject.parent.parent.parent == null)
        {
            return null;
        }

        return cssDeclarationsObject.parent.parent.parent.path;
    },

    getStyleElements: function(element)
    {
        var styleElements = [];

        if(element == null) { return styleElements; }

        var elementType = element.type.toLowerCase();

        if(elementType == "style" || (elementType == "link" && this.hasAttribute(element, "rel", "stylesheet")))
        {
            styleElements.push(element);
        }
        else
        {
            var children = element.childNodes;

            for(var i = 0; i < children.length; i++)
            {
                ASTHelper._pushAll(styleElements, this.getStyleElements(children[i]));
            }
        }

        return styleElements;
    },

    getAllHtmlNodes: function(element)
    {
        var htmlElements = [];

        if(element == null || element.type == "textNode") { return htmlElements; }

        htmlElements.push(element);

        var children = element.childNodes;

        for(var i = 0; i < children.length; i++)
        {
            ASTHelper._pushAll(htmlElements, this.getAllHtmlNodes(children[i]));
        }

        return htmlElements;
    },

    getScriptElements: function(element)
    {
        var scriptElements = [];

        if(element == null) { return scriptElements; }

        if(element.type.toLowerCase() == "script")
        {
            scriptElements.push(element);
        }
        else
        {
            var children = element.childNodes;

            for(var i = 0; i < children.length; i++)
            {
                ASTHelper._pushAll(scriptElements, this.getScriptElements(children[i]));
            }
        }

        return scriptElements;
    },

    getAttributeValue: function(element, attributeName)
    {
        if(element == null || element.attributes == null) { return null; }

        var attributes = element.attributes;

        for(var i = 0; i < attributes.length; i++)
        {
            if(attributes[i].name === attributeName)
            {
                return attributes[i].value;
            }
        }

        return null;
    },

    hasAttribute: function(element, key, value)
    {
        if(element == null) { return false; }
        if(element.attributes == null) { return false; }

        var attributes = element.attributes;

        for(var i = 0; i < attributes.length; i++)
        {
            var attribute = attributes[i];

            if(attribute.name == key && attribute.value == value) { return true; }
        }

        return false;
    },

    getChildStatements: function(blockStatement)
    {
        if(this.isFunction(blockStatement))
        {
            return blockStatement.body.body;
        }
        else if (this.isIfStatement(blockStatement) || this.isLoopStatement(blockStatement))
        {
            var body = this.isIfStatement(blockStatement) ? blockStatement.consequent
                                                          : blockStatement.body;

            return body.body || [body];
        }
        else if (this.isBlockStatement(blockStatement) || this.isProgram(blockStatement))
        {
            return blockStatement.body;
        }
        else if (this.isObjectExpression(blockStatement))
        {
            return blockStatement.properties;
        }
        else if (this.isSwitchStatement(blockStatement))
        {
            var cases = blockStatement.cases;
            var items = [];

            for(var i = 0; i < cases.length; i++)
            {
                ASTHelper._pushAll(items, cases[i].consequent);
            }
        }
        else if (this.isTryStatement(blockStatement))
        {
            return blockStatement.block.body;
        }
        else if (this.isCatchClause(blockStatement))
        {
            return blockStatement.body.body;
        }
        else
        {
            alert("Unhandled block statement command");
        }

        return [];
    },

    getTypeExpressionsFromProgram: function(program, types)
    {
        try
        {
            var result = {};

            var traversalFunction = function(elementValue, elementName, parentObject)
            {
                types.forEach(function(type)
                {
                    if(elementName === "type" &&  elementValue === type)
                    {
                        if(result[type] == null) { result[type] = []; }

                        result[type].push(parentObject);
                    }
                });
            };

            this.traverseAst(program, traversalFunction);

            return result;
        }
        catch(e) { alert("Error while getting type expressions from program in ASTHelper: " + e);}
    },

    createCopy: function(programModel, copyOnlyUsedElements)
    {
        var newModel = {};

        newModel.type = programModel.type;

        var mapping = { };
        var that = this;

        this.traverseAst(programModel, function(propertyValue, propertyName, parentElement)
        {
            if(copyOnlyUsedElements
           && (!parentElement.shouldBeIncluded || !propertyValue.shouldBeIncluded)
           && parentElement.type != "Program" && propertyValue.RegExpBase64 == null)
            {
                return;
            }

            var mappedParentElement = parentElement.type == "Program" ? newModel
                                                                      : mapping[parentElement.nodeId];

            if(mappedParentElement == null) { return; }

            var isPropertyArray = ASTHelper._isArray(parentElement[propertyName]);

            if(mappedParentElement[propertyName] == null)
            {
                if(isPropertyArray)
                {
                    mappedParentElement[propertyName] = [];
                }
                else
                {
                    mappedParentElement[propertyName] = that._cloneShallowASTNode(propertyValue);
                    mapping[propertyValue.nodeId] = mappedParentElement[propertyName];
                }
            }

            var mappedElement = mapping[propertyValue.nodeId];

            if(mappedElement == null)
            {
                mappedElement = that._cloneShallowASTNode(propertyValue);
                mapping[propertyValue.nodeId] = mappedElement;
            }

            if(isPropertyArray)
            {
               mappedParentElement[propertyName].push(mappedElement);
            }
        });

        return newModel;
    },

    _cloneShallowASTNode: function(originalNode)
    {
        var clone = {};

        for(var prop in originalNode)
        {
            if(!ASTHelper._isObject(originalNode[prop]) || originalNode[prop] instanceof RegExp || prop == "comments")
            {
                clone[prop] = originalNode[prop];
            }
        }

        return clone;
    },

    traverseWholeAST: function(astElement, processElementFunction)
    {
        try
        {
            if(astElement == null) { return; }

            if(ASTHelper._isString(astElement)) { return; }

            for(var propName in astElement)
            {
                var propertyValue = astElement[propName];

                if(ASTHelper._isArray(propertyValue))
                {
                    for(var i = 0; i < propertyValue.length; i++)
                    {
                        processElementFunction(propertyValue[i], propName, astElement, i);
                        this.traverseWholeAST(propertyValue[i], processElementFunction);
                    }
                }
                else if(ASTHelper._isString(propertyValue))
                {
                    processElementFunction(propertyValue, propName, astElement);
                }
                else
                {
                    processElementFunction(propertyValue, propName, astElement);
                    this.traverseWholeAST(propertyValue, processElementFunction);
                }
            }
        }
        catch(e)
        {
            alert("Error while traversing whole AST in ASTHelper: " + e);
        }
    },

    traverseAst: function(astElement, processElementFunction, ignoreProperties)
    {
        if(!(ASTHelper._isObject(astElement))) { return; }
        if(astElement.addJsProperty != null)debugger;
        for(var propName in astElement)
        {
            if(!astElement.hasOwnProperty(propName)) { continue; }
            //Do not traverse the source code location properties and parents and graphNodes!
            if(propName == "loc"
                || propName == "parent"
                || propName == "graphNode"
                || propName == "children"
                || propName == "domElement"
                || propName == "graphNode"
                || propName == "htmlNode"
                || propName == "attributes"
                || propName == "previousCondition"
                || propName == "includesNodes"
                || propName == "includedByNodes"
                || propName == "type"
                || propName == "eventTraces"
                || propName == "inclusionDependencyConstraint"
                || propName == "blockStackConstructs"
                || propName == "executorEventsMap"
                || propName == "simpleDependencies"
                || propName == "match"
                || propName == "globalObject"
                || propName == "dependencies"
                || propName == "reverseDependencies"
                || (ignoreProperties && ignoreProperties.indexOf(propName) != -1)) { continue; }

            var propertyValue = astElement[propName];

            if(propertyValue == null) { continue; }

            if(ASTHelper._isArray(propertyValue))
            {
                for(var i = 0; i < propertyValue.length; i++)
                {
                    if(ASTHelper._isObject(propertyValue[i]))
                    {
                        processElementFunction(propertyValue[i], propName, astElement, i);
                        this.traverseAst(propertyValue[i], processElementFunction, ignoreProperties);
                    }
                }
            }
            else if (ASTHelper._isObject(propertyValue))
            {
                processElementFunction(propertyValue, propName, astElement);
                this.traverseAst(propertyValue, processElementFunction, ignoreProperties);
            }
        }
    },

    traverseAstWhileIgnoring: function(astElement, processElementFunction, ignoreElementTypes)
    {
        if(!(ASTHelper._isObject(astElement))) { return; }

        if(ignoreElementTypes != null && ignoreElementTypes.indexOf(astElement.type) != -1) { return; }

        for(var propName in astElement)
        {
            //Do not traverse the source code location properties and parents and graphNodes!
            if(propName == "loc"
                || propName == "parent"
                || propName == "graphNode"
                || propName == "children"
                || propName == "domElement"
                || propName == "graphNode"
                || propName == "htmlNode"
                || propName == "attributes"
                || propName == "previousCondition"
                || propName == "includesNodes"
                || propName == "includedByNodes"
                || propName == "type"
                || propName == "eventTraces"
                || propName == "inclusionDependencyConstraint"
                || propName == "blockStackConstructs"
                || propName == "simpleDependencies"
                || propName == "executorEventsMap") { continue; }

            var propertyValue = astElement[propName];

            if(propertyValue == null) { continue; }

            if(ASTHelper._isArray(propertyValue))
            {
                for(var i = 0; i < propertyValue.length; i++)
                {
                    if(ASTHelper._isObject(propertyValue[i]))
                    {
                        processElementFunction(propertyValue[i], propName, astElement, i);
                        this.traverseAstWhileIgnoring(propertyValue[i], processElementFunction, ignoreElementTypes);
                    }
                }
            }
            else if (ASTHelper._isObject(propertyValue))
            {
                if(ignoreElementTypes == null || ignoreElementTypes.indexOf(propertyValue.type) == -1)
                {
                    processElementFunction(propertyValue, propName, astElement);
                    this.traverseAstWhileIgnoring(propertyValue, processElementFunction, ignoreElementTypes);
                }
            }
        }
    },

    traverseDirectSourceElements: function(astElement, processSourceElementFunction, enterBranchAndLoops)
    {
        try
        {
            if((this.isStatement(astElement) || this.isFunctionDeclaration(astElement) || this.isVariableDeclaration(astElement)) && !this.isBlockStatement(astElement))
            {
                processSourceElementFunction(astElement);
            }

            if(this.isProgram(astElement) || this.isBlockStatement(astElement))
            {
                this.traverseArrayOfDirectStatements(astElement.body, astElement, processSourceElementFunction, enterBranchAndLoops);
            }
            else if (this.isIfStatement(astElement))
            {
                if(enterBranchAndLoops)
                {
                    this.traverseDirectSourceElements(astElement.consequent, processSourceElementFunction, enterBranchAndLoops);

                    if(astElement.alternate != null)
                    {
                        this.traverseDirectSourceElements(astElement.alternate, processSourceElementFunction, enterBranchAndLoops);
                    }
                }
            }
            else if (this.isLabeledStatement(astElement)
                || this.isLetStatement(astElement))
            {
                this.traverseDirectSourceElements(astElement.body, processSourceElementFunction, enterBranchAndLoops);
            }
            else if (this.isLoopStatement(astElement)
                || this.isWithStatement(astElement))
            {
                if(enterBranchAndLoops)
                {
                    this.traverseDirectSourceElements(astElement.body, processSourceElementFunction, enterBranchAndLoops);
                }
            }
            else if (this.isSwitchStatement(astElement))
            {
                if(enterBranchAndLoops)
                {
                    astElement.cases.forEach(function(switchCase)
                    {
                        this.traverseArrayOfDirectStatements
                        (
                            switchCase.consequent,
                            astElement,
                            processSourceElementFunction,
                            enterBranchAndLoops
                        );
                    }, this);
                }
            }
            else if(this.isTryStatement(astElement))
            {
                if(enterBranchAndLoops)
                {
                    this.traverseDirectSourceElements(astElement.block, processSourceElementFunction, enterBranchAndLoops);

                    var handlers = astElement.handlers || (ASTHelper._isArray(astElement.handler) ? astElement.handler : [astElement.handler]);

                    handlers.forEach(function(catchClause)
                    {
                        this.traverseDirectSourceElements(catchClause.body, processSourceElementFunction, enterBranchAndLoops);
                    }, this);
                }

                if(astElement.finalizer != null)
                {
                    this.traverseDirectSourceElements(astElement.finalizer, processSourceElementFunction, enterBranchAndLoops);
                }
            }
            else if (this.isBreakStatement(astElement)
                || this.isContinueStatement(astElement)
                || this.isReturnStatement(astElement)
                || this.isThrowStatement(astElement)
                || this.isDebuggerStatement(astElement)) { }
        }
        catch(e)
        {
            debugger;
            alert("Error while traversing direct source elements in ASTHelper: " + e);
        }
    },

    traverseArrayOfDirectStatements: function(statements, parentElement, processSourceElementFunction, enterBranchAndLoops)
    {
        try
        {
            statements.forEach(function(statement)
            {
                this.traverseDirectSourceElements(statement, processSourceElementFunction, enterBranchAndLoops);
            }, this);
        }
        catch(e) { debugger; alert("Error while traversing direct statements: " + e + " for " + JSON.stringify(parentElement));}
    },

    getParentOfTypes: function(codeConstruct, types)
    {
        if(codeConstruct == null) { return null; }

        var parent = codeConstruct.parent;

        while(parent != null)
        {
            for(var i = 0; i < types.length; i++)
            {
                if(parent.type === types[i]) { return parent; }
            }

            parent = parent.parent;
        }

        return parent;
    },

    getPropertyNameFromForInStatement: function(forInStatement)
    {
        if(!this.isForInStatement(forInStatement)) { return; }

        if(this.isVariableDeclaration(forInStatement.left))
        {
            return forInStatement.left.declarations[0].id.name;
        }
        else
        {
            return forInStatement.left.name;
        }
    },

    isBranchingConditionConstruct: function(codeConstruct)
    {
        var branchingParent = this.getBranchingParent(codeConstruct);

        if(branchingParent == null) { return false; }

        if(branchingParent.test != null)
        {
            return this.isAncestor(codeConstruct, branchingParent.test);
        }
        else if(branchingParent.discriminant != null)
        {
            return this.isAncestor(codeConstruct, branchingParent.discriminant);
        }

        return false;
    },

    isForStatementInit: function(codeConstruct)
    {
        if(codeConstruct == null) { return false; }

        var loopParent = this.getLoopParent(codeConstruct);

        if(loopParent == null) { return false; }

        if(this.isForStatement(loopParent)) { return loopParent.init == codeConstruct;}
        else if (this.isForInStatement(loopParent)) { return loopParent.left == codeConstruct; }

        return false;
    },

    isForStatementTest: function(codeConstruct)
    {
        if(codeConstruct == null) { return false; }

        var loopParent = this.getLoopParent(codeConstruct);

        if(loopParent == null) { return false; }

        if(this.isForStatement(loopParent)) { return loopParent.test == codeConstruct;}

        return false;
    },

    isPureElseStatement: function(codeConstruct)
    {
        if(codeConstruct == null) { return false; }

        return this.isIfStatement(codeConstruct.parent) && codeConstruct.parent.alternate == codeConstruct && !this.isIfStatement(codeConstruct);
    },

    isIfStatementCondition: function(codeConstruct)
    {
        if(codeConstruct == null) { return false; }

        return this.isIfStatement(codeConstruct.parent) && codeConstruct.parent.test == codeConstruct;
    },

    isElseIfStatement: function(codeConstruct)
    {
        if(!this.isIfStatement(codeConstruct)){ return false; }

        return this.isIfStatement(codeConstruct.parent) && codeConstruct.parent.alternate == codeConstruct;
    },

    isObjectExpressionPropertyValue: function(element)
    {
        if(element == null) { return false; }

        return this.isElementOfType(element, this.CONST.Property);
    },

    isFunctionExpressionBlockAsObjectProperty: function(element)
    {
        if(element == null) { return false; }
        if(element.parent == null) { return false; }

        return this.isFunctionExpression(element.parent) && this.isElementOfType(element.parent.parent, this.CONST.Property);
    },

    isCallExpressionCallee: function(element)
    {
        if(element == null) { return false; }

        return this.isCallExpression(element.parent) && element.parent.callee == element;
    },

    isLastPropertyInLeftHandAssignment: function(element)
    {
        if(element == null) { return false; }

        return this.isMemberExpression(element.parent) && this.isAssignmentExpression(element.parent.parent)
             && element.parent.parent.left == element.parent && element.parent.parent.operator.length == 1;
    },

    isIfTest: function(element)
    {
        if(element == null) { return false; }

        return ASTHelper.isIfStatement(element.parent) && element.parent.test == element;
    },

    isWhileTest: function(element)
    {
        if(element == null) { return false; }

        return ASTHelper.isWhileStatement(element.parent) && element.parent.test == element;
    },

    isDoWhileTest: function(element)
    {
        if(element == null) { return false; }

        return ASTHelper.isDoWhileStatement(element.parent) && element.parent.test == element;
    },

    isConditionalTest: function(element)
    {
        if(element == null) { return false; }

        return ASTHelper.isConditionalExpression(element.parent) && element.parent.test == element;
    },

    areRelated: function(statements1, statements2)
    {
        if(!ASTHelper._isArray(statements1) && !ASTHelper._isArray(statements2))
        {
            return this.isAncestor(statements1, statements2) || this.isAncestor(statements2, statements1)
        }

        for(var i = 0; i < statements1.length; i++)
        {
            var firstStatement = statements1[i];
            for(var j = 0; j < statements2.length; j++)
            {
                var secondStatement = statements2[j];

                if(this.isAncestor(firstStatement, secondStatement) || this.isAncestor(secondStatement, firstStatement))
                {
                    return true;
                }
            }
        }

        return false;
    },

    areAncestors: function(statements1, statements2)
    {
        for(var i = 0; i < statements1.length; i++)
        {
            var firstStatement = statements1[i];

            for(var j = 0; j < statements2.length; j++)
            {
                var secondStatement = statements2[j];

                if(this.isAncestor(firstStatement, secondStatement))
                {
                    return true;
                }
            }
        }

        return false;
    },

    getBreakContinueReturnImportantAncestor: function(codeConstruct)
    {
        if(this.isReturnStatement(codeConstruct))
        {
            return this.getFunctionParent(codeConstruct);
        }
        else if (this.isBreakStatement(codeConstruct))
        {
            return this.getLoopOrSwitchParent(codeConstruct);
        }
        else if(this.isContinueStatement(codeConstruct))
        {
            return this.getLoopParent(codeConstruct);
        }

        return null;
    },

    getFirstArgumentOfCallExpression: function(element)
    {
        if(!this.isCallExpression(element) || element.arguments == null) { return null;}

        return element.arguments[0];
    },

    getLastLoopOrBranchingConditionInFunctionBody: function(element)
    {
        if(!this.isFunction(element)){ return null; }

        var firstLevelStatements = element.body.body;

        for(var i = firstLevelStatements.length - 1; i >= 0; i--)
        {
            var statement = firstLevelStatements[i];
            if(this.isIfStatement(statement) || this.isLoopStatement(statement)){ return statement.test; }
            else if (this.isWithStatement(statement)) { return statement.object; }
            else if (this.isForInStatement(statement)) { return statement.right; }
        }

        return null;
    },

    getAllElementsOfType: function(codeElement, types)
    {
        var elementsOfType = [];

        this.traverseAst(codeElement, function(currentElement, propertyName, parentElement)
        {
            if(types.indexOf(currentElement.type) != -1)
            {
                elementsOfType.push(currentElement);
            }
        });

        return elementsOfType;
    },

    getDirectlyContainedReturnStatement: function(body)
    {
        var bodyStatements = this.isBlockStatement(body) ? body.body : [body];

        for(var i = 0; i < bodyStatements.length; i++)
        {
            if(this.isReturnStatement(bodyStatements[i])) { return bodyStatements[i]; }
        }

        return null;
    },

    containsCallOrUpdateOrAssignmentExpression: function(element)
    {
        if(element == null) { return false; }

        if(this.isCallExpression(element) || this.isUpdateExpression(element) || this.isAssignmentExpression(element)) { return true;}

        if(element.containsCallOrUpdateOrAssignmentExpression === true
        || element.containsCallOrUpdateOrAssignmentExpression === false)
        {
            return element.containsCallOrUpdateOrAssignmentExpression;
        }

        var containsCallOrUpdateOrAssignmentExpression = false;

        this.traverseAst(element, function(currentElement)
        {
            if(ASTHelper.isCallExpression(currentElement)
            || ASTHelper.isAssignmentExpression(currentElement)
            || ASTHelper.isUpdateExpression(currentElement))
            {
                containsCallOrUpdateOrAssignmentExpression = true;
            }
        });

        element.containsCallOrUpdateOrAssignmentExpression = containsCallOrUpdateOrAssignmentExpression;

        return containsCallOrUpdateOrAssignmentExpression;
    },

    getDeclarator: function(identifier)
    {
       if(!this.isIdentifier(identifier)) { return null; }

       var dependencies = identifier.graphNode != null ? identifier.graphNode.dataDependencies
                                                       : identifier.dependencies;

       if(dependencies == null) { return null; }

        for(var i = 0; i < dependencies.length; i++)
       {
           var destinationNode = dependencies[i].destinationNode.model || dependencies[i].destinationNode;

           if(this.isVariableDeclarator(destinationNode) && destinationNode.id.name == identifier.name)
           {
                return destinationNode;
           }
       }

       return null;
    },

    getValueLiteral: function(identifier)
    {
        if(!this.isIdentifier(identifier)) { return null; }

        var dependencies = identifier.dependencies;

        for(var i = 0; i < dependencies.length; i++)
        {
            var destinationNode = dependencies[i].destinationNode;

            if(this.isLiteral(destinationNode)) { return destinationNode; }
        }

        return null;
    },

    isIdentifierMemberOrCallExpression: function(element)
    {
        //HAS TO BE FAST!
        return element != null && (element.type == "Identifier" || element.type == "MemberExpression" || element.type == "CallExpression")
            && (element.parent == null || (element.parent.argument == null && element.parent.left == null)); // do not care about unary and binary expressions
    },

    isFunctionParameter: function(element)
    {
        if(!this.isIdentifier(element)){ return false; }
        if(!this.isFunction(element.parent)) { return false;}

        var functionParent = element.parent;
        var params = functionParent.params;

        for(var i = 0; i < params.length; i++)
        {
            if(params[i] ==  element) { return true;}
        }

        return false;
    },

    isDeleteExpression: function(element)
    {
        return this.isUnaryExpression(element) && element.operator == "delete";
    },

    isMemberExpressionObject: function(element)
    {
        if(element == null) { return false; }

        return this.isMemberExpression(element.parent) && element.parent.object == element;
    },

    isMemberExpressionProperty: function(element)
    {
        if(element == null) { return false; }

        return this.isMemberExpression(element.parent) && element.parent.property == element;
    },

    getParentStatementOrFunction: function(codeConstruct)
    {
        if(codeConstruct == null) { return null; }

        if(this.isStatement(codeConstruct)) { return codeConstruct; }

        return this.getParentOfTypes(codeConstruct, this.parentStatementOrFunctionTypes);
    },

    //Will be created at the end
    parentStatementOrFunctionTypes: [],

    getParentStatement: function(codeConstruct)
    {
        return this.getParentOfTypes
        (
            codeConstruct,
            [
                this.CONST.STATEMENT.ExpressionStatement,
                this.CONST.STATEMENT.IfStatement,
                this.CONST.STATEMENT.LabeledStatement,
                this.CONST.STATEMENT.BreakStatement,
                this.CONST.STATEMENT.ContinueStatement,
                this.CONST.STATEMENT.WithStatement,
                this.CONST.STATEMENT.SwitchStatement,
                this.CONST.STATEMENT.ReturnStatement,
                this.CONST.STATEMENT.ThrowStatement,
                this.CONST.STATEMENT.TryStatement,
                this.CONST.STATEMENT.WhileStatement,
                this.CONST.STATEMENT.DoWhileStatement,
                this.CONST.STATEMENT.ForStatement,
                this.CONST.STATEMENT.ForInStatement,
                this.CONST.STATEMENT.LetStatement,
                this.CONST.STATEMENT.DebuggerStatement,
                this.CONST.VariableDeclaration
            ]
        );
    },

    getParentAssignmentExpression: function(codeConstruct)
    {
        return this.getParentOfTypes
        (
            codeConstruct,
            [ this.CONST.EXPRESSION.AssignmentExpression ]
        );
    },

    getFunctionParent: function(codeConstruct)
    {
        return this.getParentOfTypes
        (
            codeConstruct,
            [
                this.CONST.FunctionDeclaration,
                this.CONST.EXPRESSION.FunctionExpression
            ]
        );
    },

    getLoopOrSwitchParent: function(codeConstruct)
    {
        return this.getParentOfTypes
        (
            codeConstruct,
            [
                this.CONST.STATEMENT.ForStatement,
                this.CONST.STATEMENT.ForInStatement,
                this.CONST.STATEMENT.WhileStatement,
                this.CONST.STATEMENT.DoWhileStatement,
                this.CONST.STATEMENT.SwitchStatement
            ]
        );
    },

    getBranchingParent: function(codeConstruct)
    {
        return this.getParentOfTypes
        (
            codeConstruct,
            [
                this.CONST.STATEMENT.ForStatement,
                this.CONST.STATEMENT.ForInStatement,
                this.CONST.STATEMENT.WhileStatement,
                this.CONST.STATEMENT.DoWhileStatement,
                this.CONST.STATEMENT.SwitchStatement,
                this.CONST.STATEMENT.IfStatement,
                this.CONST.EXPRESSION.ConditionalExpression
            ]
        );
    },

    getLoopParent: function(codeConstruct)
    {
        return this.getParentOfTypes
        (
            codeConstruct,
            [
                this.CONST.STATEMENT.ForStatement,
                this.CONST.STATEMENT.ForInStatement,
                this.CONST.STATEMENT.WhileStatement,
                this.CONST.STATEMENT.DoWhileStatement
            ]
        );
    },

    getParentLabelStatement: function(codeConstruct, labelName)
    {
        var labeledStatement = this.getParentOfTypes(codeConstruct, [this.CONST.STATEMENT.LabeledStatement]);

        if(labeledStatement == null || labeledStatement.label == null) { return null; }
        if(labeledStatement.label.name == labelName) { return labeledStatement; }

        return this.getParentLabelStatement(labeledStatement, labelName);
    },

    getSwitchParent: function(codeConstruct)
    {
        return this.getParentOfTypes
        (
            codeConstruct,
            [ this.CONST.STATEMENT.SwitchStatement ]
        );
    },

    getDescendantConditionsMap: function(codeConstruct)
    {
        var conditions = {};

        if(codeConstruct == null) { return conditions; }

        ASTHelper.traverseAst(codeConstruct, function(element)
        {
            //TODO - Do this for if, while, and conditional expressions
            //For and for-in are also possibilities, switch, but i'm not sure should i include them
            //This is a rare problem why i do this
            if(ASTHelper.isIfTest(element) || ASTHelper.isWhileTest(element)
            || ASTHelper.isDoWhileTest(element) || ASTHelper.isConditionalTest(element))
            {
                conditions[element.nodeId] = element;
            }
        });

        return conditions;
    },

    getHeadElement: function(model)
    {
        if(model == null) { return null; }
        if(model.htmlElement == null) { return null; }

        var children = model.htmlElement.childNodes;

        for(var i = 0; i < children.length; i++)
        {
            if(children[i].type === "head")
            {
                return children[i];
            }
        }

        return null;
    },

    getBodyElement: function(model)
    {
        if(model == null) { return null; }
        if(model.htmlElement == null) { return null; }

        var children = model.htmlElement.childNodes;

        for(var i = 0; i < children.length; i++)
        {
            if(children[i].type === "body")
            {
                return children[i];
            }
        }

        return null;
    },

    removeFromParent: function(node)
    {
        if(node == null) { return; }

        var parent = node.parent;

        if(parent == null || parent.children == null) { return; }

        ASTHelper._removeFromArrayByIndex(parent.children, parent.children.indexOf(node));

        if(parent.rules == null) { return; }
        ASTHelper._removeFromArrayByIndex(parent.rules, parent.rules.indexOf(node));
    },

    isElementOfType: function(element, type)
    {
        if(element == null) { return false; }

        return element.type === type;
    },

    isExpression: function(element)
    {
        return element != null ? this.CONST.EXPRESSION[element.type] != null
            : false;
    },

    isJsElement: function(element)
    {
        if(element == null || element.type == null) { return false; }

        return this.CONST[element.type] != null || this.CONST.STATEMENT[element.type] != null || this.CONST.EXPRESSION[element.type] != null;
    },

    isProgram: function(element) { return this.isElementOfType(element, this.CONST.Program); },
    isFunction: function(element) { return this.isFunctionDeclaration(element) || this.isFunctionExpression(element); },
    isFunctionDeclaration: function(element) { return this.isElementOfType(element, this.CONST.FunctionDeclaration); },
    isVariableDeclaration: function(element) { return this.isElementOfType(element, this.CONST.VariableDeclaration); },
    isVariableDeclarator: function(element) { return this.isElementOfType(element, this.CONST.VariableDeclarator); },
    isSwitchCase: function(element) { return this.isElementOfType(element, this.CONST.SwitchCase); },
    isCatchClause: function(element) { return this.isElementOfType(element, this.CONST.CatchClause); },
    isIdentifier: function(element) { return this.isElementOfType(element, this.CONST.Identifier); },
    isLiteral: function(element) { return this.isElementOfType(element, this.CONST.Literal); },
    isProperty: function(element) { return this.isElementOfType(element, this.CONST.Property); },
    isStringLiteral: function(element) { return this.isLiteral(element) && ASTHelper._isString(element.value);},

    isStatement: function(element)
    {
        return element != null ? this.CONST.STATEMENT[element.type] != null
            : false;
    },
    isEmptyStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.EmptyStatement); },
    isBlockStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.BlockStatement); },
    isExpressionStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.ExpressionStatement); },
    isIfStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.IfStatement); },
    isLabeledStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.LabeledStatement); },
    isBreakStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.BreakStatement); },
    isContinueStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.ContinueStatement); },
    isWithStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.WithStatement); },
    isSwitchStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.SwitchStatement); },
    isReturnStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.ReturnStatement); },
    isThrowStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.ThrowStatement); },
    isTryStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.TryStatement); },

    isLoopStatement: function(element)
    {
        return this.isWhileStatement(element)
            || this.isDoWhileStatement(element)
            || this.isForStatement(element)
            || this.isForInStatement(element);
    },

    isLoopStatementCondition: function(element)
    {
        return this.isLoopStatement(element.parent) && element.parent.test == element;
    },

    isWhileStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.WhileStatement); },
    isDoWhileStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.DoWhileStatement); },
    isForStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.ForStatement); },
    isForInStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.ForInStatement); },
    isLetStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.LetStatement); },
    isDebuggerStatement: function(element) { return this.isElementOfType(element, this.CONST.STATEMENT.DebuggerStatement); },

    isThisExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.ThisExpression); },
    isArrayExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.ArrayExpression); },
    isObjectExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.ObjectExpression); },
    isFunctionExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.FunctionExpression); },
    isSequenceExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.SequenceExpression); },
    isUnaryExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.UnaryExpression); },
    isBinaryExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.BinaryExpression); },
    isAssignmentExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.AssignmentExpression); },
    isUpdateExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.UpdateExpression); },
    isLogicalExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.LogicalExpression); },
    isConditionalExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.ConditionalExpression); },
    isNewExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.NewExpression); },
    isCallExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.CallExpression); },
    isMemberExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.MemberExpression); },
    isYieldExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.YieldExpression); },
    isComprehensionExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.ComprehensionExpression); },
    isGeneratorExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.GeneratorExpression); },
    isLetExpression: function(element) { return this.isElementOfType(element, this.CONST.EXPRESSION.LetExpression); },

    isUnaryOperator: function(element) { return this.isElementOfType(element, this.CONST.OPERATOR.UnaryOperator); },
    isBinaryOperator: function(element) { return this.isElementOfType(element, this.CONST.OPERATOR.BinaryOperator); },
    isAssignmentOperator: function(element) { return this.isElementOfType(element, this.CONST.OPERATOR.AssignmentOperator); },
    isUpdateOperator: function(element) { return this.isElementOfType(element, this.CONST.OPERATOR.UpdateOperator); },
    isLogicalOperator: function(element) { return this.isElementOfType(element, this.CONST.OPERATOR.LogicalOperator); },

    isUnaryMathOperator: function(operator)
    {
        return operator == "-" || operator == "+";
    },

    isUnaryLogicalOperator: function(operator)
    {
        return operator == "!";
    },

    isUnaryBitOperator: function(operator)
    {
        return operator == "~";
    },

    isUnaryObjectOperator: function(operator)
    {
        return operator == "typeof" || operator == "void"
            || operator == "delete";
    },

    isBinaryEqualityOperator:function (element)
    {
        return element == "==" || element == "==="
            || element == "!=" || element == "!==";
    },

    isBinaryMathOperator:function (element)
    {
        return element == "+" || element == "-"
            || element == "*" || element == "/" || element == "%";
    },

    isBinaryRelationalOperator:function (element)
    {
        return element == "<" || element == "<="
            || element == ">" || element == ">=";
    },

    isBinaryBitOperator:function (element)
    {
        return element == "|" || element == "&"
            || element == "^"
            || element == "<<" || element == ">>"
            || element == ">>>";
    },

    isBinaryObjectOperator: function (element)
    {
        return element == "in" || element == "instanceof";
    },

    isBinaryXmlOperator: function (element)
    {
        return element == "..";
    },

    getSimpleSortingFunctionReturnArg: function(functionConstruct)
    {
        if(!this.isFunction(functionConstruct)) { return false; }

        if(functionConstruct.params.length != 2) { return false; }
        if(functionConstruct.body.body.length != 1) { return false; }

        if(!this.isReturnStatement(functionConstruct.body.body[0])) { return false; }

        var returnStatement = functionConstruct.body.body[0];

        if(!this.isBinaryExpression(returnStatement.argument)) { return false; }

        if(!this.isIdentifier(returnStatement.argument.left) || !this.isIdentifier(returnStatement.argument.right))
        {
            return false;
        }

        return returnStatement.argument;
    },
    
    _pushAll: function(baseArray, arrayWithItems)
    {
        if(baseArray == null || arrayWithItems == null) { return; }
        
        baseArray.push.apply(baseArray, arrayWithItems);    
    },

    _isArray: function(arrayOfElements)
    {
        return (typeof arrayOfElements) == "array" || arrayOfElements instanceof Array;
    },

    _isObject: function(potentialObject)
    {
        return 'object' == typeof potentialObject;
    },
    
    _isString: function(variable)
    {
        return (typeof variable) == "string" || variable instanceof String;   
    },

    _removeFromArrayByIndex: function(array, index)
    {
        if(array == null) { return null; }

        return array.splice(index, 1);
    },

    CONST :
    {
        Program: "Program",
        FunctionDeclaration: "FunctionDeclaration",
        VariableDeclaration: "VariableDeclaration",
        VariableDeclarator: "VariableDeclarator",
        SwitchCase: "SwitchCase",
        CatchClause: "CatchClause",
        Identifier: "Identifier",
        Literal: "Literal",
        Property: "Property",
        STATEMENT:
        {
            EmptyStatement: "EmptyStatement",
            BlockStatement: "BlockStatement",
            ExpressionStatement : "ExpressionStatement",
            IfStatement: "IfStatement",
            LabeledStatement: "LabeledStatement",
            BreakStatement: "BreakStatement",
            ContinueStatement: "ContinueStatement",
            WithStatement: "WithStatement",
            SwitchStatement: "SwitchStatement",
            ReturnStatement: "ReturnStatement",
            ThrowStatement: "ThrowStatement",
            TryStatement: "TryStatement",
            WhileStatement: "WhileStatement",
            DoWhileStatement: "DoWhileStatement",
            ForStatement: "ForStatement",
            ForInStatement: "ForInStatement",
            LetStatement: "LetStatement",
            DebuggerStatement: "DebuggerStatement"
        },
        EXPRESSION:
        {
            ThisExpression : "ThisExpression",
            ArrayExpression: "ArrayExpression",
            ObjectExpression: "ObjectExpression",
            FunctionExpression: "FunctionExpression",
            SequenceExpression: "SequenceExpression",
            UnaryExpression: "UnaryExpression",
            BinaryExpression: "BinaryExpression",
            AssignmentExpression: "AssignmentExpression",
            UpdateExpression: "UpdateExpression",
            LogicalExpression: "LogicalExpression",
            ConditionalExpression: "ConditionalExpression",
            NewExpression: "NewExpression",
            CallExpression: "CallExpression",
            MemberExpression: "MemberExpression",
            YieldExpression: "YieldExpression",
            ComprehensionExpression: "ComprehensionExpression",
            GeneratorExpression: "GeneratorExpression",
            LetExpression: "LetExpression"
        },
        OPERATOR:
        {
            UnaryOperator : "UnaryOperator",
            BinaryOperator: "BinaryOperator",
            AssignmentOperator: "AssignmentOperator",
            UpdateOperator: "UpdateOperator",
            LogicalOperator: "LogicalOperator"
        }
    }
};

Firecrow.ASTHelper.parentStatementOrFunctionTypes =
[
    Firecrow.ASTHelper.CONST.STATEMENT.ExpressionStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.IfStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.LabeledStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.BreakStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.ContinueStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.WithStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.SwitchStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.ReturnStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.ThrowStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.TryStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.WhileStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.DoWhileStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.ForStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.ForInStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.LetStatement,
    Firecrow.ASTHelper.CONST.STATEMENT.DebuggerStatement,
    Firecrow.ASTHelper.CONST.VariableDeclaration,
    Firecrow.ASTHelper.CONST.FunctionDeclaration
];
/******/
}});

if(usesModule)
{
    exports.ASTHelper = ASTHelper;
}