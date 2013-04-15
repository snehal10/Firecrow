/**
 * Created by Jomaras.
 * Date: 10.03.12.@09:49
 */
FBL.ns(function() { with (FBL) {
/*************************************************************************************/
var ASTHelper = Firecrow.ASTHelper;
var fcModel = Firecrow.Interpreter.Model;

fcModel.Identifier = function(name, value, codeConstruct, globalObject)
{
    try
    {
        this.id = fcModel.Identifier.LAST_ID++;  if(this.id == 84651) debugger;

        this.name = name;
        this.value = value;
        this.globalObject = globalObject;

        this.modificationPositions = [];
        this.lastModificationPosition = null;

        if(codeConstruct != null)
        {
            this.declarationPosition = { codeConstruct: codeConstruct, evaluationPositionId: globalObject.getPreciseEvaluationPositionId()};

            if(ASTHelper.isObjectExpressionPropertyValue(codeConstruct))
            {
                this.lastModificationPosition = { codeConstruct: codeConstruct.value, evaluationPositionId: globalObject.getPreciseEvaluationPositionId()};
            }
            else
            {
                this.lastModificationPosition = this.declarationPosition;
            }

            this.modificationPositions.push(this.declarationPosition);
        }
    }
    catch(e) { fcModel.Identifier.notifyError("Error when constructing: " + e ); }
};

fcModel.Identifier.notifyError = function(message) { alert("Identifier - " + message); };

fcModel.Identifier.prototype =
{
    setValue: function(newValue, modificationConstruct)
    {
        try
        {  if(this.id == 84651) debugger;
            if(this.writable === false) { return; }

            this.value = newValue;

            if(modificationConstruct != null)
            {
                this.lastModificationPosition = { codeConstruct: modificationConstruct, evaluationPositionId: this.globalObject.getPreciseEvaluationPositionId()};
                this.modificationPositions.push({ codeConstruct: modificationConstruct, evaluationPositionId: this.globalObject.getPreciseEvaluationPositionId()});
            }
        }
        catch(e) { Firecrow.Interpreter.Model.Identifier.notifyError("Error when setting value: " + e); }
    }
};

fcModel.Identifier.LAST_ID = 0;
/****************************************************************************/
}});