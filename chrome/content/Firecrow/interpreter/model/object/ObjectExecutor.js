FBL.ns(function() { with (FBL) {
/*************************************************************************************/
var fcModel = Firecrow.Interpreter.Model;
var fcSimulator = Firecrow.Interpreter.Simulator;
var ValueTypeHelper = Firecrow.ValueTypeHelper;

fcModel.ObjectExecutor =
{
    executeInternalMethod: function(thisObject, functionObject, args, callExpression, callCommand)
    {
        if(functionObject.jsValue.name == "hasOwnProperty")
        {
            return this._executeHasOwnProperty(thisObject, args, callExpression);
        }
        else if (functionObject.jsValue.name == "toString")
        {
            var result = "";
            if(callCommand != null && (callCommand.isCall || callCommand.isApply))
            {
                result = Object.prototype.toString.call(thisObject.jsValue);
            }
            else
            {
                result = thisObject.jsValue.toString();
            }

            return thisObject.iValue.globalObject.internalExecutor.createInternalPrimitiveObject(callExpression, result);
        }
        else
        {
            fcModel.Object.notifyError("Unknown ObjectExecutor method");
        }
    },

    executeInternalObjectFunctionMethod: function(thisObject, functionObject, args, callExpression, callCommand)
    {
        var functionObjectValue = functionObject.jsValue;
        var thisObjectValue = thisObject.jsValue;
        var functionName = functionObjectValue.name;
        var fcThisValue =  thisObject.iValue;
        var argumentValues = args.map(function(argument){ return argument.jsValue;});
        var globalObject = fcThisValue != null ? fcThisValue.globalObject
                                               : functionObjectValue.fcValue.iValue.globalObject;

        switch(functionName)
        {
            case "create":
                return this._executeCreate(callExpression, args, globalObject);
            case "defineProperty":
                return this._executeDefineProperty(callExpression, args, globalObject);
            case "defineProperties":
                return this._executeDefineProperties(callExpression, args, globalObject);
            case "getOwnPropertyDescriptor":
                return this._executeGetOwnPropertyDescriptor(callExpression, args, globalObject);
            case "keys":
                return this._executeKeys(callExpression, args, globalObject);
            default:
                alert("Object Function unhandled function: " + functionName);
        }
    },

    _executeCreate: function(callExpression, args, globalObject)
    {
        if(args.length == 0) { fcModel.Object.notifyError("Can not call Object.create with zero parameters"); return null; }

        var baseObject = {};

        var newlyCreatedObject = new fcModel.fcValue
        (
            baseObject,
            fcModel.Object.createObjectWithInit(globalObject, callExpression, baseObject, args[0]),
            callExpression
        );

        if(args.length > 1)
        {
            this._definePropertiesOnObject(newlyCreatedObject, args[1], globalObject, callExpression);
        }

        return newlyCreatedObject;
    },

    _executeDefineProperties: function(callExpression, args, globalObject)
    {
        if(args.length < 2) { fcModel.Object.notifyError("Object.defineProperties can not have less than 2 arguments"); return null;}

        args[0].iValue.addModification(callExpression);

        this._definePropertiesOnObject(args[0], args[1], globalObject, callExpression);
    },

    _definePropertiesOnObject: function(fcBaseObject, propertyDescriptorsMap, globalObject, callExpression)
    {
        var jsPropertyDescriptorsMap = propertyDescriptorsMap.jsValue;
        var fcPropertyDescriptorsMap = propertyDescriptorsMap.iValue;

        var iObject = fcBaseObject.iValue;
        iObject.addModification(callExpression);

        var dependencyCreator = new fcSimulator.DependencyCreator(globalObject, globalObject.executionContextStack);

        for(var propName in jsPropertyDescriptorsMap)
        {
            var propertyDescriptor = fcPropertyDescriptorsMap.getPropertyValue(propName);

            var configurable = this._getPropertyDescriptorValue(propertyDescriptor.jsValue, "configurable", false);
            var enumerable = this._getPropertyDescriptorValue(propertyDescriptor.jsValue, "enumerable", false);
            var writable = this._getPropertyDescriptorValue(propertyDescriptor.jsValue, "writable", false);
            var get = this._getPropertyDescriptorValue(propertyDescriptor.jsValue, "get", null);
            var set = this._getPropertyDescriptorValue(propertyDescriptor.jsValue, "set", null);

            if(get != null || set != null) { fcModel.Object.notifyError("Still does not handle defining getters and setters"); return; }

            var propertyValue = propertyDescriptor.iValue.getPropertyValue("value");

            dependencyCreator.createDataDependency(propertyDescriptor.codeConstruct, callExpression);
            dependencyCreator.createDependenciesForObjectPropertyDefinition(propertyDescriptor.codeConstruct);

            Object.defineProperty(fcBaseObject.jsValue, propName,
            {
                configurable: configurable,
                enumerable: enumerable,
                writable: writable,
                value: propertyValue
            });

            iObject.addProperty(propName, propertyValue, propertyDescriptor.codeConstruct, enumerable, configurable, writable);
        }
    },

    _executeDefineProperty: function(callExpression, args, globalObject)
    {
        if(args.length < 3) { fcModel.Object.notifyError("Can not call Object.defineProperty with less than 3 parameters"); return; }

        var propertyName = args[1].jsValue;

        var jsPropertyDescriptorMap = args[2].jsValue;

        var configurable = this._getPropertyDescriptorValue(jsPropertyDescriptorMap, "configurable", false);
        var enumerable = this._getPropertyDescriptorValue(jsPropertyDescriptorMap, "enumerable", false);
        var writable = this._getPropertyDescriptorValue(jsPropertyDescriptorMap, "writable", false);
        var get = this._getPropertyDescriptorValue(jsPropertyDescriptorMap, "get", null);
        var set = this._getPropertyDescriptorValue(jsPropertyDescriptorMap, "set", null);
        var value = jsPropertyDescriptorMap.value;

        if(get != null || set != null) { fcModel.Object.notifyError("Still does not handle defining getters and setters"); return; }
        if(value == null) { fcModel.Object.notifyError("Value must be set when definining property"); return; }

        var dependencyCreator = new fcSimulator.DependencyCreator(globalObject, globalObject.executionContextStack);

        dependencyCreator.createDependenciesForObjectPropertyDefinition(args[2].codeConstruct);

        Object.defineProperty(args[0].jsValue, propertyName,
        {
            configurable: configurable,
            enumerable: enumerable,
            writable: writable,
            value: value
        });

        args[0].iValue.addProperty(propertyName, jsPropertyDescriptorMap.value, args[2].codeConstruct, enumerable, configurable, writable);
    },

    _executeGetOwnPropertyDescriptor: function(callExpression, args, globalObject)
    {
        if(args.length < 1) { fcModel.Object.notifyError("Can not call getOwnPropertyDescriptor with 0 arguments"); return null; }

        if(args.length == 1) { return globalObject.internalExecutor.createInternalPrimitiveObject(callExpression, undefined); }

        var property = args[0].iValue.getOwnProperty(args[1].jsValue);

        if(property == null) { return globalObject.internalExecutor.createInternalPrimitiveObject(callExpression, undefined); }

        var baseObject = {};

        var newlyCreatedObject = new fcModel.fcValue
        (
            baseObject,
            fcModel.Object.createObjectWithInit(globalObject, callExpression, baseObject),
            callExpression
        );

        baseObject.configurable = globalObject.internalExecutor.createInternalPrimitiveObject(callExpression, property.configurable);
        baseObject.enumerable = globalObject.internalExecutor.createInternalPrimitiveObject(callExpression, property.enumerable);
        baseObject.writable = globalObject.internalExecutor.createInternalPrimitiveObject(callExpression, property.writable);
        baseObject.value = property.value;

        newlyCreatedObject.iValue.addProperty("configurable", baseObject.configurable, callExpression, true, true, true);
        newlyCreatedObject.iValue.addProperty("enumerable", baseObject.enumerable, callExpression, true, true, true);
        newlyCreatedObject.iValue.addProperty("writable", baseObject.writable, callExpression, true, true, true);
        newlyCreatedObject.iValue.addProperty("value", baseObject.value, callExpression, true, true, true);

        return newlyCreatedObject;
    },

    _executeKeys: function(callExpression, args, globalObject)
    {
        if(args.length == 0) { fcModel.Object.notifyError("Can not call Object.keys with 0 arguments"); return null; }

        if(args[0] == null || args[0].iValue == null) { fcModel.Object.notifyError("Object keys argument hast to have iValue"); return null; }

        var iObject = args[0].iValue;

        var propertyNames = iObject.getEnumeratedPropertyNames();

        var propertyKeysArray = [];

        for(var i = 0; i < propertyNames.length; i++)
        {
            var propertyName = propertyNames[i];
            var property = iObject.getProperty(propertyName);

            propertyKeysArray.push
            (
                globalObject.internalExecutor.createInternalPrimitiveObject
                (
                    property.lastModificationPosition != null ? property.lastModificationPosition.codeConstruct : null,
                    propertyName
                )
            );
        }

        return globalObject.internalExecutor.createArray(callExpression, propertyKeysArray);
    },

    _getPropertyDescriptorValue: function(propertyDescriptorMap, propertyName, defaultValue)
    {
        return propertyDescriptorMap[propertyName] != null ? propertyDescriptorMap[propertyName].jsValue
                                                           : defaultValue;
    },

    executeInternalConstructor: function(constructorConstruct, args, globalObject)
    {
        var newlyCreatedObject = null;

        if (args.length == 0)
        {
            return globalObject.internalExecutor.createNonConstructorObject(constructorConstruct, new Object());
        }

        var firstArgument = args[0];

        if(firstArgument.jsValue == null)
        {
            return globalObject.internalExecutor.createNonConstructorObject(constructorConstruct, new Object(firstArgument.jsValue));
        }
        else if (ValueTypeHelper.isBoolean(firstArgument.jsValue))
        {
            return new fcModel.fcValue
            (
                new Boolean(firstArgument.jsValue),
                new fcModel.Boolean(firstArgument.jsValue, globalObject, constructorConstruct),
                constructorConstruct
            );
        }
        else if(ValueTypeHelper.isString(firstArgument.jsValue))
        {
            return new fcModel.fcValue
            (
                new String(firstArgument.jsValue),
                new fcModel.String(firstArgument.jsValue, globalObject, constructorConstruct),
                constructorConstruct
            );
        }
        else if(ValueTypeHelper.isNumber(firstArgument.jsValue))
        {
            return new fcModel.fcValue
            (
                new Number(firstArgument.jsValue),
                new fcModel.Number(firstArgument.jsValue, globalObject, constructorConstruct),
                constructorConstruct
            );
        }
        else
        {
            return args[0];
        }
    },

    _executeHasOwnProperty: function(thisObject, args, callExpression)
    {
        if(thisObject == null || thisObject.iValue == null || args == null || args.length <= 0) { fcModel.Object.notifyError("Invalid argument when executing hasOwnProperty");}

        var result = thisObject.iValue.isOwnProperty(args[0].jsValue);

        return thisObject.iValue.globalObject.internalExecutor.createInternalPrimitiveObject(callExpression, result);
    }
};
/*************************************************************************************/
}});