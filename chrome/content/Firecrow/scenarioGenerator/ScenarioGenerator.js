FBL.ns(function() { with (FBL) {
/*****************************************************/
var fcScenarioGenerator = Firecrow.ScenarioGenerator;
var ValueTypeHelper = Firecrow.ValueTypeHelper;
var ASTHelper = Firecrow.ASTHelper;
var fcSymbolic = fcScenarioGenerator.Symbolic;

fcScenarioGenerator.ScenarioGenerator =
{
    achievedCoverage: 0,
    achievedCoverages: [],
    scenarios: null,
    scenarioProcessingLimit: 200,
    uiControlsSelectors: null,
    uiControlsJointSelector: "",

    uiControlEventPriority: 0.4,
    globalObjectEventPriority: 0.5,
    externalEventPriority: 1,

    generateScenarios: function(pageModel, uiControlsSelectors, scenarioExecutedCallback)
    {
        ASTHelper.setParentsChildRelationships(pageModel);

        this._setUiControlsSelectors(uiControlsSelectors);

        var scenarios = new fcScenarioGenerator.ScenarioCollection();
        this.scenarios = scenarios;

        var browser = this._executeApplication(pageModel);
        this.achievedCoverage = ASTHelper.calculateCoverage(pageModel).expressionCoverage;

        this._createInitialRegisteredEventsScenarios(browser, scenarios);

        var processedScenarioCounter = 0;

        var currentScenario = scenarios.getNext();
        var that = this;

        var asyncLoop = function()
        {
            if(currentScenario == null || processedScenarioCounter > that.scenarioProcessingLimit
            || that.achievedCoverage == 1 || (that._isStuck() && that._hasFullEventCoverage()))
            {
                scenarioExecutedCallback(scenarios.getSubsumedProcessedScenarios());
                return;
            }

            that._createDerivedScenarios(pageModel, currentScenario, scenarios, scenarioExecutedCallback);

            processedScenarioCounter++;

            currentScenario = scenarios.getNext();

            setTimeout(asyncLoop, 1500);
        };

        setTimeout(asyncLoop, 100);
    },

    _setUiControlsSelectors: function(uiControlsSelectors)
    {
        this.slicingCriteria = [];

        if(uiControlsSelectors != null)
        {
            uiControlsSelectors.forEach(function(selector)
            {
                this.slicingCriteria.push(Firecrow.DependencyGraph.SlicingCriterion.createModifyDomCriterion(selector));
            }, this);
        }
        else
        {
            this.slicingCriteria.push(Firecrow.DependencyGraph.SlicingCriterion.createModifyDomCriterion("*"));
        }

        this.uiControlsSelectors = uiControlsSelectors;
        this.uiControlsJointSelector = uiControlsSelectors == null || uiControlsSelectors.length == 0 ? "*" : uiControlsSelectors.join(" *, ");
    },

    _hasFullEventCoverage: function()
    {
        var eventCoverageInfo = this.scenarios.eventCoverageInfo;

        for(var baseObjectDescriptor in eventCoverageInfo)
        {
            for(var eventType in eventCoverageInfo[baseObjectDescriptor])
            {
                var coverage = eventCoverageInfo[baseObjectDescriptor][eventType].coverage;
                if(!Number.isNaN(coverage) && coverage < 0.99)
                {
                    return false;
                }
            }
        }

        return true;
    },

    _isStuck: function()
    {
        if(this.achievedCoverages.length <= 10) { return false; }

        var lastItem = this.achievedCoverages[this.achievedCoverages.length-1];

        for(var i = this.achievedCoverages.length - 2; i >= this.achievedCoverages.length - 10; i--)
        {
            if(lastItem.branchCoverage != this.achievedCoverages[i].branchCoverage) { return false; }
        }

        return true;
    },

    _hasAchievedEnoughCoverage: function(pageModel, scenarios)
    {
        return (ASTHelper.calculatePageExpressionCoverage(pageModel) + scenarios.calculateEventCoverage() - 1) >= 0.99
    },

    _executeApplication: function(pageModel)
    {
        var browser = new FBL.Firecrow.DoppelBrowser.Browser(pageModel);
        browser.registerSlicingCriteria(this.slicingCriteria);

        browser.evaluatePage();

        this._executeLoadingEvents(browser);

        browser.setLoadingEventsExecuted();

        return browser;
    },

    _executeLoadingEvents: function(browser)
    {
        var loadingEvents = browser.globalObject.getLoadedHandlers();

        loadingEvents.forEach(function(loadingEvent)
        {
            browser.executeEvent(loadingEvent);
        }, this);
    },

    _createInitialRegisteredEventsScenarios: function(browser, scenarios)
    {
        this._createEventsScenarios(browser.getEventRegistrations(), scenarios, browser)
    },

    _createEventsScenarios: function(eventRegistrations, scenarios, browser)
    {
        for(var i = 0; i < eventRegistrations.length; i++)
        {
            var eventRegistration = eventRegistrations[i];

            if(eventRegistration.handler.jsValue == null) { continue; }

            var newScenario = new fcScenarioGenerator.Scenario([this._createEventFromEventRegistration(eventRegistration, browser)]);

            newScenario.createdBy = "extendingWithNewEvent";

            scenarios.addScenario(newScenario);

            if(eventRegistration.eventType == "timeout" || eventRegistration.eventType == "interval")
            {
                this._createAdditionalTimingEvents(eventRegistration, newScenario.events, null, newScenario);
            }
        }
    },

    _createDerivedScenarios: function(pageModel, scenario, scenarios, scenarioExecutedCallback)
    {
        var executionResult = this._executeScenario(pageModel, scenario, scenarios);

        if(scenarioExecutedCallback != null) { scenarioExecutedCallback(scenario); }

        this._createInvertedPathScenarios(scenario, scenarios);
        this._createRegisteredEventsScenarios(scenario, scenarios, executionResult.browser);
    },

    _createInvertedPathScenarios: function(scenario, scenarios)
    {
        var invertedPaths = scenario.executionInfo.pathConstraint.getAllResolvedInversions();

        for(var i = 0; i < invertedPaths.length; i++)
        {
            var createdScenario = scenarios.addScenarioByComponents(scenario.events, invertedPaths[i], [scenario]);

            if(createdScenario != null)
            {
                createdScenario.createdBy = "symbolic";
            }
        }
    },

    _createRegisteredEventsScenarios: function(scenario, scenarios, browser)
    {
        var eventRegistrations = browser.getEventRegistrations();

        for(var i = 0; i < eventRegistrations.length; i++)
        {
            var eventRegistration = eventRegistrations[i];

            if(!ASTHelper.isFunction(eventRegistration.handlerConstruct)) { return; }

            var eventRegistrationFingerprint = this._getEventRegistrationFingerprint(eventRegistration);

            //has not been executed so far
            if(this.parametrizedEventsMap[eventRegistrationFingerprint] == null)
            {
                this._createNewScenarioByAppendingNewEvent(scenario, scenarios, eventRegistration, browser);
            }
            else //this event was executed so far
            {
                var parametrizedEventsLog = this.parametrizedEventsMap[eventRegistrationFingerprint];
                this._createNewScenariosByAppendingParametrizedEvents(scenario, scenarios, eventRegistration, parametrizedEventsLog);
            }
        }
    },

    _createNewScenarioByAppendingNewEvent: function(scenario, scenarios, eventRegistration, browser)
    {
        var newScenario = scenario.createCopy();

        var newEvent = this._createEventFromEventRegistration(eventRegistration, browser);
        newScenario.events.push(newEvent);
        newScenario.createdBy = "extendingWithNewEvent";
        newScenario.generateFingerprint();

        newScenario.parentScenarios.push(scenario);

        scenarios.addScenario(newScenario);

        if(newEvent.eventType == "timeout" || newEvent.eventType == "interval")
        {
            this._createAdditionalTimingEvents(newEvent, newScenario.events, null, newScenario);
        }
    },

    _createEventFromEventRegistration: function(eventRegistration, browser)
    {
        var event = new fcScenarioGenerator.Event
        (
            eventRegistration.thisObjectDescriptor,
            eventRegistration.thisObjectModel,
            eventRegistration.eventType,
            eventRegistration.registrationConstruct,
            eventRegistration.handlerConstruct
        );

        event.timePeriod = eventRegistration.timePeriod;

        this.scenarios.assignEventPriority(eventRegistration, this._getEventPriority(eventRegistration, browser));

        return event;
    },

    _getEventPriority: function(eventRegistration, browser)
    {
        if(eventRegistration.thisObjectDescriptor == "window" || eventRegistration.thisObjectDescriptor == "document")
        {
            return this.globalObjectEventPriority;
        }

        if(browser.matchesSelector(eventRegistration.thisObject.implementationObject, this.uiControlsJointSelector))
        {
            return this.uiControlEventPriority;
        }

        return this.externalEventPriority;
    },

    _createNewScenariosByAppendingParametrizedEvents: function(scenario, scenarios, eventRegistration, parametrizedEventsLog)
    {
        for(var propName in parametrizedEventsLog)
        {
            var log = parametrizedEventsLog[propName];

            for(var i = 0; i < log.scenarios.length; i++)
            {
                var scenarioWithParametrizedEvent = log.scenarios[i];

                var executionsInfo = scenarioWithParametrizedEvent.getEventExecutionsInfo(eventRegistration.thisObjectDescriptor, eventRegistration.eventType);

                for(var j = 0; j < executionsInfo.length; j++)
                {
                    var executionInfo = executionsInfo[j];

                    if(this._isExecutionInfoDependentOnScenario(executionInfo, scenario))
                    {
                        this._createNewScenarioByAppendingExistingEvent(scenario, scenarios, log.parametrizedEvents[i], scenarioWithParametrizedEvent);
                    }
                }
            }
        }
    },

    _createNewScenarioByAppendingExistingEvent: function(scenario, scenarios, parametrizedEvent, scenarioWithParametrizedEvent)
    {
        var mergedEvents = scenario.events.concat([parametrizedEvent.baseEvent]);
        var mergedInputConstraint = scenario.inputConstraint.createCopyUpgradedByIndex(0);

        var singleItemConstraint = scenarioWithParametrizedEvent.inputConstraint.createSingleItemBasedOnIndex
        (
            scenarioWithParametrizedEvent.parametrizedEvents.indexOf(parametrizedEvent),
            mergedEvents.length - 1
        );

        if(singleItemConstraint != null)
        {
            mergedInputConstraint.append(singleItemConstraint);
        }

        var newScenario = new fcScenarioGenerator.Scenario(mergedEvents, mergedInputConstraint, [scenario]);
        newScenario.createdBy = "extendingWithExistingEvent";
        scenarios.addScenario(newScenario);

        if(parametrizedEvent.baseEvent.eventType == "timeout" || parametrizedEvent.baseEvent.eventType == "interval")
        {
            this._createAdditionalTimingEvents(parametrizedEvent.baseEvent, mergedEvents, mergedInputConstraint, scenario);
        }
    },

    _createAdditionalTimingEvents: function(event, previousEvents, inputConstraint, parentScenario)
    {
        var times = Math.floor(200/event.timePeriod);

        if(!Number.isNaN(times) && times > 0)
        {
            previousEvents = previousEvents.slice();

            for(var i = 0; i < times; i++)
            {
                previousEvents.push(event);

                var newScenario = new fcScenarioGenerator.Scenario(previousEvents, inputConstraint && inputConstraint.createCopy(), [parentScenario]);
                newScenario.createdBy = "extendingWithExistingEvent";
                this.scenarios.addScenario(newScenario);
            }
        }
    },

    _isExecutionInfoDependentOnScenario: function(executionInfo, scenario)
    {
        var scenarioExecutionInfo = scenario.executionInfo;
        for(var branchingConstructId in executionInfo.branchingConstructs)
        {
            for(var modifiedIdentifierId in scenarioExecutionInfo.globalModifiedIdentifiers)
            {
                if(this._dependencyExists(branchingConstructId, modifiedIdentifierId))
                {
                    return true;
                }
            }

            for(var modifiedObjectId in scenarioExecutionInfo.globalModifiedObjects)
            {
                if(this._dependencyExists(branchingConstructId, modifiedObjectId))
                {
                    return true;
                }
            }
        }

        return false;
        /*return this._isExecutionInfoIdentifierDependentOn(executionInfo, scenario)
            || this._isExecutionInfoObjectDependentOn(executionInfo, scenario);*/
    },

    _dependencyExists: function(sourceNodeId, targetNodeId)
    {
        if(this.dependencyCache[sourceNodeId + "-" + targetNodeId]) { return true; }

        this.traversedDependencies = {};

        return this._pathExists(sourceNodeId, targetNodeId);
    },

    traversedDependencies: {},

    _pathExists: function(sourceNodeId, targetNodeId)
    {
        var dataDependencies = Firecrow.DATA_DEPENDENCIES;

        if(dataDependencies[sourceNodeId] == null) { return false; }

        if(dataDependencies[sourceNodeId][targetNodeId])
        {
            this.dependencyCache[sourceNodeId + "-" + targetNodeId] = true;
            return true;
        }

        this.traversedDependencies[sourceNodeId] = true;

        for(var dependencyId in dataDependencies[sourceNodeId])
        {
            if(this.traversedDependencies[dependencyId]) { continue; }

            if(this._pathExists(dependencyId, targetNodeId))
            {
                return true;
            }
        }

        return false;
    },

    dependencyCache: {},

    _isExecutionInfoIdentifierDependentOn: function(executionInfo, scenario)
    {
        for(var accessedIdentifier in executionInfo.globalAccessedIdentifiers)
        {
            if(scenario.executionInfo.globalModifiedIdentifiers[accessedIdentifier])
            {
                return true;
            }
        }

        return false;
    },

    _isExecutionInfoObjectDependentOn: function(executionInfo, scenario)
    {
        for(var accessedObject in executionInfo.globalAccessedObjects)
        {
            if(scenario.executionInfo.globalModifiedObjects[accessedObject])
            {
                return true;
            }
        }

        return false;
    },

    _getEventRegistrationFingerprint: function(eventRegistration)
    {
        return eventRegistration.thisObjectDescriptor + eventRegistration.eventType
             + eventRegistration.handlerConstruct.nodeId;
    },

    _executeScenario: function(pageModel, scenario)
    {
        var browser = this._executeApplication(pageModel);
        var parametrizedEvents = this._createParametrizedEvents(scenario);

        this._logParametrizedEvents(scenario, parametrizedEvents);

        scenario.setParametrizedEvents(parametrizedEvents);

        for(var i = 0; i < parametrizedEvents.length; i++)
        {
            this._executeEvent(browser, parametrizedEvents[i], scenario, i);
        }

        var executionInfo = browser.getExecutionInfo();

        this._addDefaultConstraints(browser, scenario, parametrizedEvents);

        scenario.setExecutionInfo(executionInfo);

        var coverage = ASTHelper.calculateCoverage(pageModel);

        this.achievedCoverage = coverage.expressionCoverage;
        this.achievedCoverages.push(coverage);

        return {
            executionInfo: executionInfo,
            browser: browser
        };
    },

    parametrizedEventsMap: {},

    _logParametrizedEvents: function(scenario, parametrizedEvents)
    {
        for(var i = 0; i < parametrizedEvents.length; i++)
        {
            var parametrizedEvent = parametrizedEvents[i];

            if(this.parametrizedEventsMap[parametrizedEvent.baseEvent.fingerprint] == null)
            {
                this.parametrizedEventsMap[parametrizedEvent.baseEvent.fingerprint] = { };
            }

            if(this.parametrizedEventsMap[parametrizedEvent.baseEvent.fingerprint][parametrizedEvent.fingerprint] == null)
            {
                this.parametrizedEventsMap[parametrizedEvent.baseEvent.fingerprint][parametrizedEvent.fingerprint] = {
                    scenarios: [],
                    parametrizedEvents: []
                };
            }

            this.parametrizedEventsMap[parametrizedEvent.baseEvent.fingerprint][parametrizedEvent.fingerprint].scenarios.push(scenario);
            this.parametrizedEventsMap[parametrizedEvent.baseEvent.fingerprint][parametrizedEvent.fingerprint].parametrizedEvents.push(parametrizedEvent);
        }
    },

    _createParametrizedEvents: function(scenario)
    {
        if(scenario.inputConstraint == null)
        {
            return scenario.events.map(function(event)
            {
                return new fcScenarioGenerator.ParametrizedEvent(event, null);
            }, this);
        }

        var parametrizedEvents = [];

        var resolvedResults = scenario.inputConstraint.resolvedResult;
        var events = scenario.events;

        for(var i = 0; i < events.length; i++)
        {
            var event = events[i];
            var resolvedResult = resolvedResults[i];
            parametrizedEvents.push(new fcScenarioGenerator.ParametrizedEvent(event, resolvedResult));
        }

        return parametrizedEvents;
    },

    _executeEvent: function(browser, parametrizedEvent, scenario, eventIndex)
    {
        browser.eventIndex = eventIndex;
        var eventRegistration = this._getMatchingEventRegistration(browser, parametrizedEvent.baseEvent.thisObjectModel, parametrizedEvent.baseEvent.registrationConstruct);

        if(eventRegistration == null) { return; }

        var handlerArguments = this._getArguments(eventRegistration, browser, parametrizedEvent.parameters, eventIndex);
        this._modifyDom(eventRegistration, scenario, parametrizedEvent.parameters);

        browser.executeEvent(eventRegistration, handlerArguments);
    },

    _addDefaultConstraints: function(browser, scenario, parametrizedEvents)
    {
        var executionInfo = browser.getExecutionInfo();
        var identifiersMap = executionInfo.pathConstraint.getSymbolicIdentifierNameMap();

        for(var identifierName in identifiersMap)
        {
            if(this._isPositiveNumberIdentifier(identifierName))
            {
                var binary = new fcSymbolic.Binary(new fcSymbolic.Identifier(identifierName), new fcSymbolic.Literal(0), ">=");

                binary.markAsIrreversible();

                var pathConstraintItem = new fcSymbolic.PathConstraintItem(null, binary);

                executionInfo.addPathConstraintItemToBeginning(pathConstraintItem);
                scenario.addInputConstraintItem(pathConstraintItem);
                scenario.addSolutionIfNotExistent(identifierName, 0);
            }
            else if(identifierName.indexOf("DOM_") == 0)
            {
                var id = fcSymbolic.ConstraintResolver.getHtmlElementIdFromSymbolicParameter(identifierName);
                var cleansedProperty = fcSymbolic.ConstraintResolver.getHtmlElementPropertyFromSymbolicParameter(identifierName);
                if(id != "")
                {
                    var htmlElement = browser.hostDocument.getElementById(id);

                    if(ValueTypeHelper.isHtmlSelectElement(htmlElement))
                    {
                        var availableValues = this._getSelectAvailableValues(htmlElement);
                        var binaryExpressions = [];

                        var compoundLogical = null;

                        for(var i = 0; i < availableValues.length; i++)
                        {
                            var binary = new fcSymbolic.Binary(new fcSymbolic.Identifier(identifierName), new fcSymbolic.Literal(availableValues[i]), "==");
                            binary.markAsIrreversible();
                            binaryExpressions.push(binary);

                            var previousBinary = binaryExpressions[i-1];
                            var currentBinary = binaryExpressions[i];

                            if(previousBinary != null && currentBinary != null)
                            {
                                if(compoundLogical == null)
                                {
                                    compoundLogical = new fcSymbolic.Logical(previousBinary, currentBinary, "||");
                                    compoundLogical.markAsIrreversible();
                                }
                                else
                                {
                                    compoundLogical = new fcSymbolic.Logical(compoundLogical, currentBinary, "||");
                                    compoundLogical.markAsIrreversible();
                                }
                            }
                        }

                        var pathConstraintItem = new fcSymbolic.PathConstraintItem(null, compoundLogical);
                        executionInfo.addPathConstraintItemToBeginning(pathConstraintItem);
                        scenario.addInputConstraintItem(pathConstraintItem);
                        scenario.addSolutionIfNotExistent(identifierName, availableValues[0]);
                    }
                    else
                    {
                        debugger;
                        alert("Unhandled HTMLElement in ScenarioGenerator when adding default constraints");
                    }
                }
                else
                {
                    debugger;
                    alert("No id in ScenarioGenerator when adding default constraints");
                }
            }
        }

        for(var i = 0; i < parametrizedEvents.length; i++)
        {
            var event = parametrizedEvents[i];

            for(var identifierName in identifiersMap)
            {
                if(this._isPositiveNumberIdentifier(identifierName))
                {
                    if(this.endsWithSuffix(identifierName, i))
                    {
                        var identifier = this.removeSuffix(identifierName);

                        if(event.parameters[identifier] == null)
                        {
                            event.parameters[identifier] = 0;
                        }
                    }
                }
            }
        }
    },

    _getSelectAvailableValues: function(selectElement)
    {
        var values = [];

        if(selectElement == null) { return values; }

        for(var i = 0; i < selectElement.children.length; i++)
        {
            values.push(selectElement.children[i].value);
        }

        return values;
    },

    _isPositiveNumberIdentifier: function(identifierName)
    {
        return identifierName.indexOf("page") == 0
            || identifierName.indexOf("client") == 0
            || identifierName.indexOf("layer") == 0
            || identifierName.indexOf("range") == 0
            || identifierName.indexOf("keyCode") == 0
            || identifierName.indexOf("screen") == 0
            || identifierName.indexOf("which") == 0;
    },

    _getMatchingEventRegistration: function(browser, thisObjectModel, registrationConstruct)
    {
        var intervalHandlers = browser.globalObject.intervalHandlers;
        for(var i = 0; i < intervalHandlers.length; i++)
        {
            var intervalHandler = intervalHandlers[i];

            if(intervalHandler.registrationConstruct == registrationConstruct)
            {
                return intervalHandler;
            }
        }

        var timeoutHandlers = browser.globalObject.timeoutHandlers;
        for(var i = 0; i < timeoutHandlers.length; i++)
        {
            var timeoutHandler = timeoutHandlers[i];

            if(timeoutHandler.registrationConstruct == registrationConstruct)
            {
                return timeoutHandler;
            }
        }

        var domHandlers = browser.globalObject.htmlElementEventHandlingRegistrations;

        for(var i = 0; i < domHandlers.length; i++)
        {
            var domHandler = domHandlers[i];

            if(domHandler.registrationConstruct != registrationConstruct) { continue; }

            if(domHandler.thisObjectModel == thisObjectModel)
            {
                return domHandler;
            }
        }

        console.log("Could not find eventRegistration: " + registrationConstruct.nodeId);

        return null;
    },

    _getArguments: function(eventRegistration, browser, parameters, eventIndex)
    {
        switch(eventRegistration.eventType)
        {
            case "onclick":
            case "click":
            case "onmousedown":
            case "onmouseup":
            case "onmousemove":
            case "mousedown":
            case "mouseup":
            case "mousemove":
            case "onmouseover":
            case "mouseover":
                return this._generateMouseHandlerArguments(eventRegistration, browser, parameters, eventIndex);
            case "onkeydown":
            case "keydown":
                return this._generateKeyHandlerArguments(eventRegistration, browser, parameters, eventIndex);
            default:
                break;
        }

        return [];
    },

    _modifyDom: function(eventRegistration, scenario, parameters)
    {
        return this._updateDomWithConstraintInfo(eventRegistration, scenario, parameters);
    },

    _generateMouseHandlerArguments: function(eventRegistration, browser, parameters, eventIndex)
    {
        var args = [];
        var fcModel = FBL.Firecrow.Interpreter.Model;

        var eventInfo = {};
        var eventInfoFcObject = new fcModel.Event(eventInfo, browser.globalObject, eventRegistration.thisObject);

        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "target", null, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "currentTarget", null, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "pageX", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "pageY", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "clientX", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "clientY", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "screenX", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "screenY", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "type", eventRegistration.eventType, browser, eventIndex, true);

        this._updateWithConstraintInfo(eventInfo, eventInfoFcObject, eventRegistration, browser, parameters, eventIndex);

        args.push(new fcModel.fcValue(eventInfo, eventInfoFcObject, null));

        return args;
    },

    _generateKeyHandlerArguments: function(eventRegistration, browser, parameters, eventIndex)
    {
        var args = [];
        var fcModel = FBL.Firecrow.Interpreter.Model;

        var eventInfo = {};
        var eventInfoFcObject = new fcModel.Event(eventInfo, browser.globalObject, eventRegistration.thisObject);

        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "altKey", false, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "bubbles", true, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "cancelBubble", false, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "cancelable", true, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "charCode", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "ctrlKey", false, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "currentTarget", null, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "detail", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "eventPhase", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "explicitOriginalTarget", null, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "isChar", false, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "isTrusted", true, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "keyCode", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "layerX", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "layerY", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "rangeOffset", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "rangeParent", 0, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "shiftKey", false, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "target", null, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "type", eventRegistration.eventType, browser, eventIndex);
        this._addEventObjectProperty(eventInfo, eventInfoFcObject, "which", 1, browser, eventIndex);

        this._updateWithConstraintInfo(eventInfo, eventInfoFcObject, eventRegistration, browser, parameters, eventIndex);

        args.push(new fcModel.fcValue(eventInfo, eventInfoFcObject, null));

        return args;
    },

    endsWithSuffix: function(name, suffixID)
    {
        return name.match(new RegExp("_FC_" + suffixID + "$")) != null;
    },

    addSuffix: function(name, suffixID)
    {
        return name + "_FC_" + suffixID;
    },

    replaceSuffix: function(value, replacementArgument)
    {
        return value.replace(/_FC_([0-9+])/gi, replacementArgument)
    },

    removeSuffix: function(name)
    {
        var indexOfFcStart = name.indexOf("_FC_");

        if(indexOfFcStart == -1) { return name; }

        return name.substr(0, indexOfFcStart);
    },

    addToPropertyName: function(name, increment)
    {
        return this.replaceSuffix(name, function(match, number)
        {
            if(number !== undefined)
            {
                return match.replace(number, parseInt(number) + increment);
            }

            return match;
        });
    },

    updatePropertyNameWithNewIndex: function(name, newNumber)
    {
        return this.replaceSuffix(name, function(match, number)
        {
            if(number !== undefined)
            {
                return match.replace(number, newNumber);
            }

            return match;
        });
    },

    _addEventObjectProperty: function(eventInfo, eventInfoFcObject, propertyName, propertyValue, browser, executionOrderId, dontCreateSymbolicValue)
    {
        var symbolicValue = null;
        if(!dontCreateSymbolicValue)
        {
            symbolicValue = new fcSymbolic.Identifier(this.addSuffix(propertyName, executionOrderId));
        }

        eventInfo[propertyName] = browser.globalObject.internalExecutor.createInternalPrimitiveObject(null, propertyValue, symbolicValue);
        eventInfoFcObject.addProperty(propertyName, eventInfo[propertyName]);
    },

    _updateWithConstraintInfo: function(eventInfo, eventInfoFcObject, eventRegistration, browser, parameters, eventIndex)
    {
        if(parameters == null) { return; }

        for(var propName in parameters)
        {
            var propValue = parameters[propName];

            eventInfo[propName] = browser.globalObject.internalExecutor.createInternalPrimitiveObject(null, propValue, new fcSymbolic.Identifier(this.addSuffix(propName, eventIndex)));
            eventInfoFcObject.addProperty(propName, eventInfo[propName]);
        }
    },

    _updateDomWithConstraintInfo: function(eventRegistration, scenario, parameters)
    {
        if(parameters == null) { return; }

        for(var parameterName in parameters)
        {
            if(parameterName.indexOf("DOM_") == 0)
            {
                var id = fcSymbolic.ConstraintResolver.getHtmlElementIdFromSymbolicParameter(parameterName);
                var cleansedProperty = fcSymbolic.ConstraintResolver.getHtmlElementPropertyFromSymbolicParameter(parameterName);
                if(id != "")
                {
                    var htmlElement = eventRegistration.thisObject.globalObject.document.document.getElementById(id);

                    if(ValueTypeHelper.isHtmlSelectElement(htmlElement))
                    {
                        var updateResult = fcSymbolic.ConstraintResolver.updateSelectElement(cleansedProperty, htmlElement, parameters[parameterName]);

                        scenario.inputConstraint.resolvedResult[eventRegistration.thisObject.globalObject.browser.eventIndex][parameterName] = updateResult.oldValue + " -&gt; " + updateResult.newValue;
                        parameters.value = updateResult.newValue;
                    }
                }
                else
                {
                    debugger;
                    alert("When updating DOM can not find ID!");
                }
            }
        }
    },


    notifyError: function(message) { alert("UsageScenarioGenerator Error: " + message); }
};
/*****************************************************/
}});
