FBL.ns(function() { with (FBL) {
/*************************************************************************************/
var fcModel = Firecrow.Interpreter.Model;
var ValueTypeHelper = Firecrow.ValueTypeHelper;

fcModel.ClassList = function(htmlElement, globalObject, codeConstruct)
{
    try
    {
        if(!ValueTypeHelper.isHtmlElement(htmlElement) && !ValueTypeHelper.isDocumentFragment(htmlElement)) { fcModel.ClassList.notifyError("Constructor argument has to be a HTMLElement");}

        this.initObject(this.globalObject, codeConstruct);

        this.htmlElement = htmlElement;

        var classList = htmlElement.classList;

        if(classList != null)
        {
            for(var i = 0, length = classList.length; i < length; i++)
            {
                this.addProperty(i, this.globalObject.internalExecutor.createInternalPrimitiveObject(codeConstruct, i), codeConstruct);
            }

            this.globalObject.internalExecutor.expandWithInternalFunction(classList.add, "add");
            this.globalObject.internalExecutor.expandWithInternalFunction(classList.remove, "remove");
            this.globalObject.internalExecutor.expandWithInternalFunction(classList.toggle, "toggle");
        }

        this.getJsPropertyValue = function(propertyName, codeConstruct) { fcModel.ClassList.notifyError("get property Class not yet implemented"); };
        this.addJsProperty = function(propertyName, value, codeConstruct) { fcModel.ClassList.notifyError("add property Class not yet implemented"); };
    }
    catch(e) { fcModel.ClassList.notifyError("Error when creating ClassList: " + e); }
};

fcModel.ClassList.notifyError = function(message) { alert("ClassList - " + message); };

fcModel.ClassList.prototype = new fcModel.Object();

fcModel.ClassList.createClassList = function(htmlElement, globalObject, codeConstruct)
{
    var jClassList = new fcModel.ClassList(htmlElement, globalObject, codeConstruct);
    return new fcModel.fcValue(jClassList, jClassList, codeConstruct);
};

//https://developer.mozilla.org/en/DOM/element
fcModel.ClassList.CONST =
{
    INTERNAL_PROPERTIES :
    {
        METHODS: [ "add", "remove", "toggle"]
    }
};
}});