FBL.ns(function() { with (FBL) {
/*************************************************************************************/
var fcModel = Firecrow.Interpreter.Model;
var ValueTypeHelper = Firecrow.ValueTypeHelper;

fcModel.GlobalObjectExecutor =
{
    executeInternalFunction: function(fcFunction, args, callExpression, globalObject)
    {
        try
        {
                 if (fcFunction.jsValue.name == "eval") { return _handleEval(fcFunction, args, callExpression, globalObject); }
            else if (fcFunction.jsValue.name == "addEventListener") { return globalObject.addEventListener(args, callExpression, globalObject); }
            else if (fcFunction.jsValue.name == "removeEventListener") { return globalObject.removeEventListener(args, callExpression, globalObject); }
            else if (fcFunction.jsValue.name == "setTimeout" || fcFunction.jsValue.name == "setInterval") { return this._setTimingEvents(fcFunction.jsValue.name, args[0], args[1] != null ? args[1].jsValue : 0, args.slice(2), globalObject, callExpression); }
            else if (fcFunction.jsValue.name == "clearTimeout" || fcFunction.jsValue.name == "clearInterval") { return this._clearTimingEvents(fcFunction.jsValue.name, args[0] != null ? args[0].jsValue : 0, globalObject, callExpression); }
            else if (fcFunction.jsValue.name == "getComputedStyle") { return this._getComputedStyle(args[0], globalObject.getJsValues(args), globalObject, callExpression) }
            else if (fcFunction.jsValue.name == "alert") { return null; }
            else if (fcFunction.jsValue.name.indexOf("assert") != -1)
            {
                globalObject.browser.callImportantConstructReachedCallbacks(callExpression);
            }
            else if (fcModel.GlobalObject.CONST.INTERNAL_PROPERTIES.METHODS.indexOf(fcFunction.jsValue.name) != -1)
            {
                return globalObject.internalExecutor.createInternalPrimitiveObject
                (
                    callExpression,
                    (globalObject.origWindow[fcFunction.jsValue.name] || eval(fcFunction.jsValue.name)).apply(globalObject.origWindow, globalObject.getJsValues(args))
                );
            }
            else if (globalObject.internalExecutor.isInternalConstructor(fcFunction))
            {
                return globalObject.internalExecutor.executeInternalConstructor(callExpression, fcFunction, args);
            }
            else
            {
                fcModel.GlobalObject.notifyError("Unhandled internal function: " + e);
            }
        }
        catch(e)
        {
            fcModel.GlobalObject.notifyError("Error when executing global object function internal function: " + e);
        }
    },

    _getComputedStyle: function(jsHtmlElement, args, globalObject, callExpression)
    {
        if(!ValueTypeHelper.isHtmlElement(jsHtmlElement.jsValue)) { this.notifyError("Wrong argument when getting computed style"); return; }

        var htmlElement = jsHtmlElement.jsValue;
        var computedStyle = globalObject.origWindow.getComputedStyle.apply(globalObject.origWindow, args);

        return fcModel.CSSStyleDeclaration.createStyleDeclaration(htmlElement, computedStyle, globalObject, callExpression);
    },

    _setTimingEvents: function(functionName, handler, timePeriod, sentArguments, globalObject, callExpression)
    {
        var timeoutId = globalObject.TIMEOUT_ID_COUNTER++;

        var timingEventArguments = [timeoutId, handler, timePeriod, sentArguments, { codeConstruct:callExpression, evaluationPositionId: globalObject.getPreciseEvaluationPositionId()}];

        if(functionName == "setTimeout") { globalObject.registerTimeout.apply(globalObject, timingEventArguments); }
        else if(functionName == "setInterval") { globalObject.registerInterval.apply(globalObject, timingEventArguments); }

        return globalObject.internalExecutor.createInternalPrimitiveObject(callExpression, timeoutId);
    },

    _clearTimingEvents: function(functionName, timerId, globalObject, callExpression)
    {
        if(functionName == "clearTimeout") { globalObject.unregisterTimeout(arguments[0] != null ? timerId : null, callExpression); }
        else { globalObject.unregisterInterval(arguments[0] != null ? timerId : null, callExpression); }

        return globalObject.internalExecutor.createInternalPrimitiveObject(callExpression, undefined);
    },

    _handleEval: function(fcFunction, arguments, callExpression, globalObject)
    {
        fcModel.GlobalObject.notifyError("Not handling eval function!");

        return globalObject.internalExecutor.createInternalPrimitiveObject(callExpression, null);
    },

    executesFunction: function(globalObject, functionName)
    {
        return (globalObject.origWindow[functionName] != null || eval(functionName))
             && ValueTypeHelper.isFunction(globalObject.origWindow[functionName] || eval(functionName));
    }
};
/*************************************************************************************/
}});