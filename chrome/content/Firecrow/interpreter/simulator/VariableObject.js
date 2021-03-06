/**
 * Created by Jomaras.
 * Date: 10.03.12.@09:04
 */
FBL.ns(function() { with (FBL) {
    /*************************************************************************************/
    var ValueTypeHelper = Firecrow.ValueTypeHelper;
    var ASTHelper = Firecrow.ASTHelper;
    var fcSimulator = Firecrow.Interpreter.Simulator;
    var fcModel = Firecrow.Interpreter.Model;

//<editor-fold desc="Variable Object">
    fcSimulator.VariableObject = function(executionContext)
    {
        this.executionContext = executionContext;
        this.identifiers = [];
    };

    fcSimulator.VariableObject.notifyError = function(message) { alert("VariableObject - " + message); };

    fcSimulator.VariableObject.prototype =
    {
        registerIdentifier: function(identifier)
        {
            if(!ValueTypeHelper.isOfType(identifier, fcModel.Identifier)) { fcSimulator.VariableObject.notifyError("When registering an identifier has to be passed"); return; }

            var existingIdentifier = this.getIdentifier(identifier.name);

            if(existingIdentifier == null)
            {
                this.identifiers.push(identifier);
            }
            else if(existingIdentifier.value != null && ASTHelper.isFunctionDeclaration(existingIdentifier.value.codeConstruct)
                &&  identifier.value != null && !ASTHelper.isFunction(identifier.value.codeConstruct))
            {
                //a variable declaration can not override a function declaration
            }
            else if(ASTHelper.isFunctionParameter(existingIdentifier.declarationPosition.codeConstruct)
                && ASTHelper.getFunctionParent(existingIdentifier.declarationPosition.codeConstruct) == ASTHelper.getFunctionParent(identifier.declarationPosition.codeConstruct))
            {
                //don't shadow if the existing identifier is a parameter from the function parent
            }
            else
            {
                existingIdentifier.setValue(identifier.value, identifier.lastModificationPosition.codeConstruct);
            }
        },

        getIdentifierValue: function(identifierName)
        {
            var identifier = this.getIdentifier(identifierName);

            return identifier != null ? identifier.value : null;
        },

        getIdentifier: function(identifierName)
        {
            return ValueTypeHelper.findInArray
            (
                this.identifiers,
                identifierName,
                function(currentIdentifier, identifierName)
                {
                    return currentIdentifier.name === identifierName;
                }
            );
        },

        deleteIdentifier: function(identifierName, codeConstruct)
        {
            var identifier = this.getIdentifier(identifierName);

            if(identifier != null)
            {
                ValueTypeHelper.removeFromArrayByElement(this.identifiers, identifier);
            }
        }
    };
//</editor-fold>

//<editor-fold desc="Variable Object Mixin">
    fcSimulator.VariableObjectMixin =
    {
        getIdentifier: function(identifierName) { return this.iValue.getProperty(identifierName); },

        getIdentifierValue: function(identifierName, readConstruct, currentContext)
        {
            return this.iValue.getPropertyValue(identifierName, readConstruct, currentContext);
        },

        registerIdentifier: function(identifier)
        {
            var existingProperty = this.iValue.getOwnProperty(identifier.name);

            //TODO - problem with overriding global properties - they are only overriden when an assignement
            //is performed, not when a variable is declared - this mixin is only used for the globalObject
            //so if a property already exists, don't override it
            if(existingProperty == null)
            {
                this.iValue.addProperty
                    (
                        identifier.name,
                        identifier.value,
                        identifier.declarationPosition != null ? identifier.declarationPosition.codeConstruct : null
                    );
            }
        },

        deleteIdentifier: function(identifierName, deleteConstruct)
        {
            this.iValue.deleteProperty(identifierName, deleteConstruct);
        }
    };
//</editor-fold>

//<editor-fold desc="'Static' methods">
    fcSimulator.VariableObject.createFunctionVariableObject = function(functionIdentifier, formalParameters, calleeFunction, sentArguments, callCommand, globalObject)
    {
        try
        {
            var functionVariableObject = new fcSimulator.VariableObject(null);

            functionVariableObject.functionIdentifier = functionIdentifier;
            functionVariableObject.formalParameters = formalParameters;
            functionVariableObject.calleeFunction = calleeFunction;
            functionVariableObject.sentArguments = sentArguments;

            var callConstruct = callCommand != null ? callCommand.codeConstruct : null;

            this._registerArgumentsVariable(functionVariableObject, callConstruct, sentArguments, globalObject);

            if(functionIdentifier != null) { functionVariableObject.registerIdentifier(functionIdentifier); }
            if(formalParameters != null) { this._registerFormalParameters(formalParameters, functionVariableObject, sentArguments, this._getArgumentsConstructs(callCommand, callConstruct, sentArguments));}

            return functionVariableObject;
        }
        catch(e) { fcSimulator.VariableObject.notifyError("Error while creating function variable object: " + e + " " + e.fileName + " " + e.lineNumber); }
    };

    fcSimulator.VariableObject._registerArgumentsVariable = function(functionVariableObject, callConstruct, sentArguments, globalObject)
    {
        var argumentsValue = globalObject.internalExecutor.createNonConstructorObject(callConstruct);

        for(var i = 0; i < sentArguments.length;i++)
        {
            argumentsValue.iValue.addProperty(i +"", sentArguments[i], callConstruct);
            argumentsValue.jsValue[i] = sentArguments[i];
        }

        var length = globalObject.internalExecutor.createInternalPrimitiveObject(callConstruct, sentArguments.length);

        argumentsValue.iValue.addProperty("length", length, callConstruct);
        Object.defineProperty(argumentsValue.jsValue, "length", { enumerable: false, value: sentArguments.length, writable:true, configurable:true});

        argumentsValue.iValue.addProperty("callee", functionVariableObject.calleeFunction, callConstruct, false);
        Object.defineProperty(argumentsValue.jsValue, "callee", { enumerable: false, value: functionVariableObject.calleeFunction});
        /*var argumentsValue = globalObject.internalExecutor.createArray(callConstruct, sentArguments);

        argumentsValue.jsValue.callee = functionVariableObject.calleeFunction;
        argumentsValue.iValue.addProperty("callee", functionVariableObject.calleeFunction, callConstruct, false);
        argumentsValue.iValue.removePrototypeMethods(); */

        functionVariableObject.registerIdentifier
        (
            new fcModel.Identifier
            (
                "arguments",
                argumentsValue,
                callConstruct != null ? callConstruct.arguments : null,
                globalObject
            )
        );
    };

    fcSimulator.VariableObject._getArgumentsConstructs = function(callCommand, callConstruct, sentArguments)
    {
        var argumentsConstruct = callConstruct != null ? callConstruct.arguments : [];

        if(callCommand != null)
        {
            if(callCommand.isCall)
            {
                argumentsConstruct = callConstruct.arguments.slice(1);
            }
            else if (callCommand.isApply)
            {
                var argumentsArray = callConstruct.arguments[1];

                argumentsConstruct = [];

                for(var i = 0; i < sentArguments.length; i++)
                {
                    argumentsConstruct.push(argumentsArray);
                }
            }
        }

        return argumentsConstruct || [];
    };

    fcSimulator.VariableObject._registerFormalParameters = function(formalParameters, functionVariableObject, sentArguments, argumentConstructs)
    {
        if(sentArguments == null) { debugger; }

        for(var i = 0; i < formalParameters.length; i++)
        {
            var formalParameter = formalParameters[i];

            functionVariableObject.registerIdentifier(formalParameter);

            formalParameter.setValue
                (
                    sentArguments[i] || new fcModel.fcValue(undefined, undefined, formalParameter.declarationPosition != null ? formalParameter.declarationPosition.codeConstruct : null),
                    argumentConstructs[i]
                );
        }
    }

    fcSimulator.VariableObject.liftToVariableObject = function(object)
    {
        if(object == null || object.iValue == null) { fcSimulator.VariableObject.notifyError("Can not lift object to variable object:"); };

        ValueTypeHelper.expand(object, fcSimulator.VariableObjectMixin);

        return object;
    };
//</editor-fold>
    /***************************************************************************************/
}});