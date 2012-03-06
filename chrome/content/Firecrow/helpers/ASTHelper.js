FBL.ns(function () { with (FBL) {
/*******/

const ValueTypeHelper = Firecrow.ValueTypeHelper;

Firecrow.ASTHelper = 
{
	parseSourceCodeToAST: function(sourceCode, sourceCodePath, startLine)
	{
		try
		{
			Components.utils.import("resource://gre/modules/reflect.jsm");
			
			return Reflect.parse
			(
				sourceCode, 
				{ loc:true, source: sourceCodePath, line: startLine }
			);
		}
		catch(e) { alert("Error while getting AST from source code@" + sourceCodePath + "; error: " + sourceCodePath); }
	},
	
	getTypeExpressionsFromProgram: function(program, types)
	{
		try
		{
			var result = {};
			
			var traverserFunction = function(elementValue, elementName, parentObject)
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
			
			this.traverseAst(program, traverserFunction);
			
			return result;
		}
		catch(e) { alert("Error while getting type expressions from program in ASTHelper: " + e);}
	},
	
	traverseAst: function(astElement, processElementFunction)
	{
		try
		{
			if(!(ValueTypeHelper.isObject(astElement))) { return; }

			for(var propName in astElement)
		    {
		        var propertyValue = astElement[propName];
		        
		        processElementFunction(propertyValue, propName, astElement);
		        
		        if(propertyValue == null) { continue; }
		        
		        if(ValueTypeHelper.isArray(propertyValue))
		        {
		            for(var i = 0; i < propertyValue.length; i++)
		            {
		            	this.traverseAst(propertyValue[i], processElementFunction);
		            }
		        }
		        else if (ValueTypeHelper.isObject(propertyValue))
		        {
		        	this.traverseAst(propertyValue, processElementFunction);
		        }
		    }
		}
		catch(e) { alert("Error while traversing AST in ASTHelper: " + e); }
	},

    traverseDirectSourceElements: function(astElement, processSourceElementFunction)
    {
        try
        {
            if(this.isStatement(astElement)
            || this.isFunctionDeclaration(astElement))
            {
                processSourceElementFunction(astElement);
            }

            if(this.isProgram(astElement))
            {
                this.traverseArrayOfDirectStatements(astElement.elements, processSourceElementFunction);
            }
            else if (this.isBlockStatement(astElement))
            {
                this.traverseArrayOfDirectStatements(astElement.body, processSourceElementFunction);
            }
            else if (this.isIfStatement(astElement))
            {
                this.traverseDirectSourceElements(astElement.consequent, processSourceElementFunction);

                if(astElement.alternate != null)
                {
                    this.traverseDirectSourceElements(astElement.alternate, processSourceElementFunction);
                }
            }
            else if (this.isLabeledStatement(astElement)
                  || this.isWithStatement(astElement)
                  || this.isLoopStatement(astElement)
                  || this.isLetStatement(astElement))
            {
                this.traverseDirectSourceElements(astElement.body, processSourceElementFunction);
            }
            else if (this.isSwitchStatement(astElement))
            {
                astElement.cases.forEach(function(switchCase)
                {
                    this.traverseArrayOfDirectStatements(switchCase.consequent, processSourceElementFunction);
                }, this);
            }
            else if(this.isTryStatement(astElement))
            {
                this.traverseDirectSourceElements(astElement.block, processSourceElementFunction);
                astElement.handlers.forEach(function(catchClause)
                {
                    this.traverseDirectSourceElements(catchClause.body, processSourceElementFunction);
                }, this);
                if(astElement.finalizer != null)
                {
                    this.traverseDirectSourceElements(astElement.finalizer, processSourceElementFunction);
                }
            }
            else if (this.isBreakStatement(astElement)
                  || this.isContinueStatement(astElement)
                  || this.isReturnStatement(astElement)
                  || this.isThrowStatement(astElement)
                  || this.isDebuggerStatement(astElement)) { }
        }
        catch(e) { alert("Error while traversing direct source elements in ASTHelper: " + e); }
    },

    traverseArrayOfDirectStatements: function(statements, processStatementFunction)
    {
        try
        {
            statements.forEach(function(statement)
            {
                processSourceElementFunction(statement);
                this.traverseDirectSourceElements(statement, processStatementFunction);
            }, this);
        }
        catch(e) { alert("Error while traversing direct statements: " + e);}
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

    isProgram: function(element) { return this.isElementOfType(element, CONST.Program); },
    isFunctionDeclaration: function(element) { return this.isElementOfType(element, CONST.FunctionDeclaration); },
    isVariableDeclaration: function(element) { return this.isElementOfType(element, CONST.VariableDeclaration); },
    isVariableDeclarator: function(element) { return this.isElementOfType(element, CONST.VariableDeclarator); },
    isSwitchCase: function(element) { return this.isElementOfType(element, CONST.SwitchCase); },
    isCatchCase: function(element) { return this.isElementOfType(element, CONST.CatchClause); },
    isIdentifier: function(element) { return this.isElementOfType(element, CONST.Identifier); },
    isLiteral: function(element) { return this.isElementOfType(element, CONST.Literal); },

    isStatement: function(element)
    {
        return element != null ? this.CONST.STATEMENT[element.type] != null
            : false;
    },
    isEmptyStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.EmptyStatement); },
    isBlockStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.BlockStatement); },
    isExpressionStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.ExpressionStatement); },
    isIfStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.IfStatement); },
    isLabeledStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.LabeledStatement); },
    isBreakStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.BreakStatement); },
    isContinueStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.ContinueStatement); },
    isWithStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.WithStatement); },
    isSwitchStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.SwitchStatement); },
    isReturnStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.ReturnStatement); },
    isThrowStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.ThrowStatement); },
    isTryStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.TryStatement); },

    isLoopStatement: function(element)
    {
        return this.isWhileStatement(element)
            || this.isDoWhileStatement(element)
            || this.isForStatement(element)
            || this.isForInStatement(element);
    },

    isWhileStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.WhileStatement); },
    isDoWhileStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.DoWhileStatement); },
    isForStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.ForStatement); },
    isForInStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.ForInStatement); },
    isLetStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.LetStatement); },
    isDebuggerStatement: function(element) { return this.isElementOfType(element, CONST.STATEMENT.DebuggerStatement); },

    isThisExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.ThisExpression); },
    isArrayExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.ArrayExpression); },
    isObjectExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.ObjectExpression); },
    isFunctionExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.FunctionExpression); },
    isSequenceExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.SequenceExpression); },
    isUnaryExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.UnaryExpression); },
    isBinaryExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.BinaryExpression); },
    isAssignmentExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.AssignmentExpression); },
    isUpdateExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.UpdateExpression); },
    isLogicalExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.LogicalExpression); },
    isConditionalExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.ConditionalExpression); },
    isNewExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.NewExpression); },
    isCallExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.CallExpression); },
    isMemberExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.MemberExpression); },
    isYieldExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.YieldExpression); },
    isComprehensionExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.ComprehensionExpression); },
    isGeneratorExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.GeneratorExpression); },
    isLetExpression: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.LetExpression); },

    isUnaryOperator: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.UnaryOperator); },
    isBinaryOperator: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.BinaryOperator); },
    isAssignmentOperator: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.AssignmentOperator); },
    isUpdateOperator: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.UpdateOperator); },
    isLogicalOperator: function(element) { return this.isElementOfType(element, CONST.EXPRESSION.LogicalOperator); },

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

/******/
}});