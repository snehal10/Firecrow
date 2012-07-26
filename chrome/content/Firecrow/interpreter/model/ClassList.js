/**
 * User: Jomaras
 * Date: 06.06.12.
 * Time: 08:15
 */
/**
 * User: Jomaras
 * Date: 05.06.12.
 * Time: 16:03
 */
FBL.ns(function() { with (FBL) {
/*************************************************************************************/
var fcModel = Firecrow.Interpreter.Model;
var ValueTypeHelper = Firecrow.ValueTypeHelper;

fcModel.ClassList = function(htmlElement, globalObject, codeConstruct)
{
    try
    {
        if(!ValueTypeHelper.isOfType(htmlElement, HTMLElement) && !ValueTypeHelper.isOfType(htmlElement, DocumentFragment)) { this.notifyError("Constructor argument has to be a HTMLElement");}

        this.globalObject = globalObject;
        this.htmlElement = htmlElement;

        this.__proto__ =  new fcModel.Object(this.globalObject);

        var classList = htmlElement.classList;

        if(classList != null)
        {
            for(var i = 0, length = classList.length; i < length; i++)
            {
                var className = classList[i];
                this.addProperty(i, new fcModel.JsValue(i, new fcModel.FcInternal(codeConstruct)), codeConstruct);
            }

            this.globalObject.internalExecutor.expandWithInternalFunction(classList.add, "add");
            this.globalObject.internalExecutor.expandWithInternalFunction(classList.remove, "remove");
            this.globalObject.internalExecutor.expandWithInternalFunction(classList.toggle, "toggle");
        }
    }
    catch(e) { Firecrow.Interpreter.Model.ClassList.notifyError("Error when creating ClassList: " + e); }
};

fcModel.ClassList.prototype = new fcModel.Object(null);

Firecrow.Interpreter.Model.ClassList.notifyError = function(message) { alert("ClassList - " + message); };

//https://developer.mozilla.org/en/DOM/element
fcModel.ClassList.CONST =
{
    INTERNAL_PROPERTIES :
    {
        METHODS: [ "add", "remove", "toggle"]
    }
};
}});