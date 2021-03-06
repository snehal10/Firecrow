var path = require('path');

var Event = require(path.resolve(__dirname, "Event.js")).Event;
var PathConstraint = require(path.resolve(__dirname, "PathConstraint.js")).PathConstraint;

var Scenario = function Scenario(events, inputConstraint, parentScenarios, creationType, cookie, browser)
{
    this.id = Scenario.LAST_ID++;

    this.events = events || [];
    this.inputConstraint = inputConstraint || new PathConstraint();
    this.parentScenarios = parentScenarios || [];
    this.executionInfo = null;
    this.parametrizedEvents = [];
    this.creationType = creationType || Scenario.CREATION_TYPE.default;
    this.cookie = cookie || "";
    this.browser = browser || "";
    this.setCoverage(0);
    this.generateFingerprint();
};

Scenario.LAST_ID = 0;

Scenario.CREATION_TYPE =
{
    default: "default",
    symbolic: "symbolic",
    newEvent: "newEvent",
    existingEvent: "existingEvent",
    timingEvents: "timingEvents",
    mouseMoveEvents: "mouseMoveEvents",
    resize: "resize"
};

Scenario.prototype =
{
    getEventsQuery: function()
    {
        var queryComponent = "[";

        for(var i = 0; i < this.parametrizedEvents.length; i++)
        {
            if(i != 0) { queryComponent += ","; }
            queryComponent += this.parametrizedEvents[i].generateQueryString();
        }

        queryComponent += "]";

        return queryComponent;
    },

    addEvent: function(usageScenarioEvent)
    {
        this.events.push(usageScenarioEvent);
    },

    setParametrizedEvents: function(parametrizedEvents)
    {
        this.parametrizedEvents = parametrizedEvents;
    },

    setCoverage: function(coverage)
    {
        this.coverage = coverage;
    },

    isParent: function(scenario)
    {
        if(scenario == null || this.parentScenarios.length == 0) { return false; }

        return this.parentScenarios[0] == scenario
            || this.parentScenarios[1] == scenario;
    },

    isAncestor: function(scenario)
    {
        if(scenario == null || this.parentScenarios.length == 0) { return false; }

        return   this.isParent(scenario)
            || (this.parentScenarios[0] && this.parentScenarios[0].isAncestor(scenario))
            || (this.parentScenarios[1] && this.parentScenarios[1].isAncestor(scenario));
    },

    setExecutionInfo: function(executionInfo)
    {
        this.executionInfo = executionInfo;

        this.ownerCollection.aggregateEventCoverageInfo(this, executionInfo);
    },

    getEventExecutionsInfo: function(eventObjectDescriptor, eventType)
    {
        var executionInfos = [];

        if(this.executionInfo == null) { return executionInfos; }

        for(var i = 0; i < this.executionInfo.eventExecutions.length; i++)
        {
            var eventExecution = this.executionInfo.eventExecutions[i];
            if(eventExecution.baseObjectDescriptor == eventObjectDescriptor && eventExecution.eventType == eventType)
            {
                executionInfos.push(eventExecution);
            }
        }

        return executionInfos;
    },

    addInputConstraintItem: function(pathConstraintItem)
    {
        if(pathConstraintItem == null) { return; }

        this.inputConstraint.addPathConstraintItem(pathConstraintItem);
    },

    addSolutionIfNotExistent: function(identifier, solution)
    {
        this.inputConstraint.addSolutionIfNotExistent(identifier, solution);
    },

    createCopy: function()
    {
        var scenario = new Scenario(this.events.slice(), this.inputConstraint.createCopy());

        scenario.setParametrizedEvents(this.parametrizedEvents.slice());

        return scenario;
    },

    generateFingerprint: function()
    {
        var inputConstraintString = this.inputConstraint != null ? this.inputConstraint.toString() : "";
        try
        {
            var resolvedResult = this.inputConstraint != null ? JSON.stringify(this.inputConstraint.resolvedResult) : "";
        }
        catch(e)
        {
            alert(e + " when generating fingerprint");
        }

        var eventsString = "";

        for(var i = 0 ; i < this.events.length; i++)
        {
            eventsString += this.events[i].generateFingerprint();
        }

        return this.fingerprint = inputConstraintString + resolvedResult + eventsString + this.cookie + this.browser +  JSON.stringify(this.sizeProperties || {});
    },

    isSymbolicCreationType: function() { return this.creationType == Scenario.CREATION_TYPE.symbolic; },
    isResizeCreationType: function() { return this.creationType == Scenario.CREATION_TYPE.resize; },

    isEqualTo: function(scenario)
    {
        return scenario != null
            && this.fingerprint == scenario.fingerprint;
    },

    isEqualToByComponents: function(events, inputConstraint)
    {
        var thisInputConstraintString = this.inputConstraint != null ? this.inputConstraint.toString() : "";
        var scenarioInputConstraintString = inputConstraint != null ? inputConstraint.toString() : "";
        var thisResolvedResult = this.inputConstraint != null ? JSON.stringify(this.inputConstraint.resolvedResult) : "";
        var scenarioResolvedResult = inputConstraint != null ? JSON.stringify(inputConstraint.resolvedResult) : "";

        return (thisInputConstraintString == scenarioInputConstraintString || thisResolvedResult == scenarioResolvedResult)
            && this._haveEqualEventsByComponents(events);
    },

    _haveEqualEventsByComponents: function(events)
    {
        if(this.events.length != events.length || this.events.length == 0) { return false; }

        for(var i = 0; i < this.events.length; i++)
        {
            if(!Event.areEqual(this.events[i], events[i]))
            {
                return false;
            }
        }

        return true;
    },

    filterEvents: function(eventRegistrations)
    {
        var ownEvents = [];
        var thisEventRegistrations = this.executionInfo.eventRegistrations;

        for(var i = 0; i < thisEventRegistrations.length; i++)
        {
            if(!this._containsEvent(eventRegistrations, thisEventRegistrations[i]))
            {
                ownEvents.push(thisEventRegistrations[i]);
            }
        }

        return ownEvents;
    },

    /**
     * @param scenario
     * @returns {{areEqual: boolean, isFirstSubsetOfSecond: boolean, isSecondSubsetOfFirst: boolean}}
     */
    compareEvents: function(scenario)
    {
        var matchingEventsCount = 0;

        for(var i = 0; i < this.events.length; i++)
        {
            var iThEvent = this.events[i];

            for(var j = 0; j < scenario.events.length; j++)
            {
                var jThEvent = scenario.events[j];

                if(Event.areEqual(iThEvent, jThEvent))
                {
                    matchingEventsCount++;
                }
            }
        }

        return {
            areEqual: matchingEventsCount == this.events.length && matchingEventsCount == scenario.events.length,
            isFirstSubsetOfSecond: matchingEventsCount == this.events.length && this.events.length < scenario.events.length,
            isSecondSubsetOfFirst: matchingEventsCount == scenario.events.length && scenario.events.length < this.events.length
        };
    },

    _containsEvent: function(events, event)
    {
        if(event == null || events == null || events.length == 0) { return false; }

        for(var i = 0; i < events.length; i++)
        {
            if(Event.areEqual(events[i], event))
            {
                return true;
            }
        }

        return false;
    },

    toString: function()
    {
        var string = "";

        for(var i = 0; i < this.events.length; i++)
        {
            if(string != "") { string += " - "; }

            string += this.events[i].toString();
        }

        return string;
    },

    getEventsInfo: function()
    {
        var resolvedResult = (this.inputConstraint != null && this.inputConstraint.resolvedResult) || {};

        var string = "";

        for(var i = 0; i < this.parametrizedEvents.length; i++)
        {
            string += "\t" + this.parametrizedEvents[i].baseEvent.toString()  + " -> " + JSON.stringify(this.parametrizedEvents[i].parameters) + "\n";
        }

        return string;
    },

    setCreationTypeResize: function()
    {
        this.creationType = Scenario.CREATION_TYPE.resize;
    },

    setCreationTypeSymbolic: function()
    {
        this.creationType = Scenario.CREATION_TYPE.symbolic;
    },

    setCreationTypeNewEvent: function()
    {
        this.creationType = Scenario.CREATION_TYPE.newEvent;
    },

    isCreatedByWithTimingEvents: function()
    {
        return this.creationType == Scenario.CREATION_TYPE.timingEvents;
    },

    isCreatedBySymbolic: function()
    {
        return this.creationType == Scenario.CREATION_TYPE.symbolic;
    },

    isCreatedByNewEvent: function()
    {
        return this.creationType == Scenario.CREATION_TYPE.newEvent;
    },

    toJSON: function()
    {
        return {
            id: this.id,
            parametrizedEvents: this.parametrizedEvents,
            cookie: this.cookie,
            browser: this.browser
        };
    }
};

exports.Scenario = Scenario;