var fs = require('fs');
var webPage = require('webpage');
var page = webPage.create();
page.onConsoleMessage = function(msg) { system.stderr.writeLine('console: ' + msg); };
page.onAlert = function(msg) { console.log('ALERT: ' + msg); };

var ASTHelper = require("C:\\GitWebStorm\\Firecrow\\chrome\\content\\Firecrow\\helpers\\ASTHelper.js").ASTHelper;
var ValueTypeHelper = require("C:\\GitWebStorm\\Firecrow\\chrome\\content\\Firecrow\\helpers\\ValueTypeHelper.js").ValueTypeHelper;
var ExpressionModule = require("C:\\GitWebStorm\\Firecrow\\phantomJs\\evaluationHelpers\\scenarioGeneratorModules\\Expression.js");

var solverUrl = "http://localhost/Firecrow/constraintSolver/index.php";
page.open(solverUrl, function() {});

var ConstraintResolver =
{
    _getCompoundConstraint: function(symbolicExpressions)
    {
        if(symbolicExpressions == null || symbolicExpressions.length == 0) { return null; }
        if(symbolicExpressions.length == 1) { return symbolicExpressions[0]; }

        var compoundLogicalExpression = new ExpressionModule.Logical(symbolicExpressions[0], symbolicExpressions[1], "&&");

        for(var i = 2; i < symbolicExpressions.length; i++)
        {
            compoundLogicalExpression = new ExpressionModule.Logical(compoundLogicalExpression, symbolicExpressions[i], "&&");
        }

        return compoundLogicalExpression;
    },

    resolveConstraints: function(symbolicExpressionsList)
    {
        var compoundExpressions = this._groupStringAndNumericExpressionsSeparately(symbolicExpressionsList);

        var numericExpressions = [];

        for(var i = 0; i < compoundExpressions.length; i++)
        {
            if(compoundExpressions[i].containsNumericExpressions())
            {
                numericExpressions.push(compoundExpressions[i])
            }
        }

        var stringExpressions = [];

        for(var i = 0; i < compoundExpressions.length; i++)
        {
            if(compoundExpressions[i].containsStringExpressions())
            {
                stringExpressions.push(compoundExpressions[i])
            }
        }

        var numericResults = this._resolveNumericExpressions(numericExpressions);
        var stringResults = this._resolveStringExpressions(stringExpressions);

        var results = [];

        for(var i = 0; i < compoundExpressions.length; i++)
        {
            var symbolicExpression = compoundExpressions[i];

            if(symbolicExpression.containsNumericExpressions())
            {
                results.push(numericResults[numericExpressions.indexOf(symbolicExpression)]);
            }
            else if(symbolicExpression.containsStringExpressions())
            {
                results.push(stringResults[stringExpressions.indexOf(symbolicExpression)]);
            }
            else
            {
                debugger;
                alert("Unhandled situation in ConstraintResolver");
            }
        }

        return results;
    },

    _resolveNumericExpressions: function(numericExpressions)
    {
        var numericResults = Array(numericExpressions.length);

        if(numericExpressions.length != 0)
        {
            try { var json = JSON.stringify(numericExpressions); }
            catch(e) { debugger; alert(e); }

            var solution = this._getSolution(json);

            if(solution.isSuccessful)
            {
                try
                {
                    numericResults = JSON.parse(solution.response);
                }
                catch(e)
                {
                    numericExpressions.forEach(function(numericExpression)
                    {
                        expressions += numericExpression.toString() + ";";
                    });

                    console.log("Expressions: " + expressions + " could not be solved - response: " + solution.response);
                }
            }
            else
            {
                /*var expressions = "";
                numericExpressions.forEach(function(numericExpression)
                {
                    expressions += numericExpression.toString() + ";";
                });

                console.log("Expressions: " + expressions + " could not be solved");*/
            }
        }

        return numericResults;
    },

    _groupStringAndNumericExpressionsSeparately: function(symbolicExpressionsList)
    {
        var compoundExpressions = [];

        for(var i = 0; i < symbolicExpressionsList.length; i++)
        {
            var symbolicExpressions = symbolicExpressionsList[i];

            var numericExpressions = [], stringExpressions = [];

            for(var j = 0; j < symbolicExpressions.length; j++)
            {
                var symbolicExpression = symbolicExpressions[j];

                var containsNumericExpressions = symbolicExpression.containsNumericExpressions();
                var containsStringExpressions = symbolicExpression.containsStringExpressions();

                if(symbolicExpression.isIdentifier())
                {
                    numericExpressions.push(new ExpressionModule.Binary(symbolicExpression, new ExpressionModule.Literal(0), ">="));
                }
                else if((containsNumericExpressions && !containsStringExpressions)
                    || symbolicExpression.hasOnlyIdentifiers())
                {
                    numericExpressions.push(symbolicExpression);
                }
                else if(containsStringExpressions && !containsNumericExpressions)
                {
                    stringExpressions.push(symbolicExpression);
                }
                else if(!containsStringExpressions && !containsNumericExpressions)
                {
                    console.log("Can not resolve: " + symbolicExpression);
                }
                else
                {
                    debugger;
                    alert("Mixing String and Numeric expressions not yet handled in ConstraintResolver");
                    return;
                }
            }

            if(numericExpressions.length != 0) { compoundExpressions.push(this._getCompoundConstraint(numericExpressions)); }
            if(stringExpressions.length != 0) { compoundExpressions.push(this._getCompoundConstraint(stringExpressions)); }
        }

        return compoundExpressions;
    },

    _resolveStringExpressions: function(stringExpressions)
    {
        if(stringExpressions.length == 0) { return []; }

        var replacements = [];
        var reverseReplacements = [];
        var numberExpressions = [];

        for(var i = 0; i < stringExpressions.length; i++)
        {
            var stringExpression = stringExpressions[i];

            var stringLiterals = ValueTypeHelper.cleanDuplicatesFromArray(stringExpression.getStringLiterals());
            var replacement = {};
            var reverseReplacement = {};
            for(var j = 0; j < stringLiterals.length; j++)
            {
                replacement[stringLiterals[j]] = j;
                reverseReplacement[j] = stringLiterals[j];
            }

            replacements.push(replacement);
            reverseReplacements.push(reverseReplacement);

            numberExpressions.push(stringExpression.createCopyWithReplacedLiterals(replacement));
        }

        var results = this._resolveNumericExpressions(numberExpressions);

        for(var i = 0; i < results.length; i++)
        {
            var reverseReplacement = reverseReplacements[i];
            if(reverseReplacement == null) { continue; }
            var result = results[i];
            for(var propName in result)
            {
                var numberResult = result[propName];
                result[propName] = reverseReplacement[numberResult];
            }
        }

        return results;
    },

    updateSelectElement: function(propName, selectElement, newValue)
    {
        var oldValue = selectElement[propName];

        selectElement[propName] = newValue;

        return {htmlElement: selectElement, oldValue: oldValue, newValue: newValue};
    },

    getHtmlElementIdFromSymbolicParameter: function(parameter)
    {
        //format: DOM_PROPERTY_NAME_FC_EVENT_INDEX_ID_XX_CLASS_ -> from HtmlElement class
        var startIdIndex = parameter.indexOf("_ID_");
        if(startIdIndex == -1) { return ""; }

        var startClassIndex = parameter.indexOf("_CLASS_");
        if(startClassIndex == -1) { startClassIndex = parameter.length; }

        return parameter.substring(startIdIndex + "_ID_".length, startClassIndex);
    },

    getHtmlElementPropertyFromSymbolicParameter: function(parameter)
    {
        var startDomIndex = parameter.indexOf("DOM_");

        var startPropertyNameIndex = 0;

        if(startDomIndex == 0)
        {
            startPropertyNameIndex = "DOM_".length;
        }

        var startFcIndex = parameter.indexOf("_FC_");
        var endPropertyIndex = parameter.length;

        if(startFcIndex != -1)
        {
            endPropertyIndex = startFcIndex;
        }

        return parameter.substring(startPropertyNameIndex, endPropertyIndex);
    },

    _getNextValue: function(item, items)
    {
        return items[items.indexOf(item) + 1];
    },

    _isStringLiteralBinaryExpression: function(symbolicExpression)
    {
        return symbolicExpression.isBinary() && symbolicExpression.left.isIdentifier() && symbolicExpression.right.isLiteral()
            && ValueTypeHelper.isString(symbolicExpression.right.value);
    },

    getInverseConstraint: function(symbolicExpression)
    {
        if(symbolicExpression == null) { return null; }

        if(symbolicExpression.isBinary()) { return this._getBinaryInverse(symbolicExpression); }
        else if(symbolicExpression.isLogical()) { return this._getLogicalInverse(symbolicExpression); }
        else if (symbolicExpression.isLiteral() || symbolicExpression.isIdentifier()) { return null; }
        else
        {
            debugger;
            alert("Unhandled constraint");
        }

        return null;
    },

    getStricterConstraint: function(symbolicExpression)
    {
        if(symbolicExpression == null) { return null; }

        if(symbolicExpression.isBinary()) { return this._getBinaryStricter(symbolicExpression); }

        return symbolicExpression;
    },

    _getBinaryStricter: function(symbolicExpression)
    {
        if(symbolicExpression.operator == ">=" || symbolicExpression.operator == "<=")
        {
            return new ExpressionModule.Binary
            (
                symbolicExpression.left,
                symbolicExpression.right,
                symbolicExpression.operator == ">=" ? ">" : "<"
            );
        }
        else if (symbolicExpression.operator == ">" && symbolicExpression.right.isLiteral())
        {
            return new ExpressionModule.Binary
            (
                symbolicExpression.left,
                new ExpressionModule.Literal(symbolicExpression.right.value + 1),
                ">="
            );
        }
        else if (symbolicExpression.operator == "<" && symbolicExpression.right.isLiteral())
        {
            return new ExpressionModule.Binary
            (
                symbolicExpression.left,
                new ExpressionModule.Literal(symbolicExpression.right.value - 1),
                "<="
            );
        }

        return symbolicExpression;
    },


    _getLogicalInverse: function(symbolicExpression)
    {
        //DEMORGAN'S LAW: !(A && B) = !A || !B; !(A || B) = !A && !B

        var leftInverse = this.getInverseConstraint(symbolicExpression.left);
        var rightInverse = this.getInverseConstraint(symbolicExpression.right);

        if(leftInverse != null && rightInverse != null) { return new ExpressionModule.Logical(leftInverse, rightInverse, symbolicExpression.operator == "&&" ? "||" : "&&"); }

        return leftInverse || rightInverse;
    },

    _getBinaryInverse: function(symbolicExpression)
    {
        return new ExpressionModule.Binary
        (
            symbolicExpression.left,
            symbolicExpression.right,
            ExpressionModule.CONST.BINARY_OP.getInverse(symbolicExpression.operator)
        );
    },

    _getSolution: function(json)
    {
        return page.evaluate(function(solverUrl, json)
        {
            var http = new XMLHttpRequest();

            try
            {
                http.open("POST", solverUrl, false);
                http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                http.send("Constraint=" + encodeURIComponent(json));

                return {
                    isSuccessful: http.status == 200,
                    response: http.responseText
                };
            }
            catch(e)
            {
                console.log(e);

                return {
                    isSuccessful: false,
                    response: e
                };
            }
        }, solverUrl, json);
    }
};

var ConstraintResult = function(identifier, value, htmlElement)
{
    this.identifier = identifier;
    this.value = value;
    this.htmlElement = htmlElement;

    this.getValue = function() { return this.value;};
};

exports.ConstraintResolver = ConstraintResolver;
exports.ConstraintResult = ConstraintResult;