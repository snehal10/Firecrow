FBL.ns(function() { with (FBL) {
/*************************************************************************************/
var fcModel = Firecrow.Interpreter.Model;

fcModel.ArrayFunction = function(globalObject)
{
    try
    {
        this.initObject(globalObject);

        this.addProperty("prototype", globalObject.fcArrayPrototype);
        this.proto = globalObject.fcFunctionPrototype;

        this.isInternalFunction = true;
        this.name = "Array";

        fcModel.ArrayPrototype.CONST.INTERNAL_PROPERTIES.METHODS.forEach(function(propertyName)
        {
            //Right instanceof reuse HACK - the problem that the second
            //application is executed within the same scope, so they target the same global objects
            //RW the reuse process, to be independent in phantomJs
            this.addProperty
            (
                propertyName,
                new fcModel.fcValue
                (
                    FBL.Firecrow.INTERNAL_PROTOTYPE_FUNCTIONS.Array[propertyName],
                    fcModel.Function.createInternalNamedFunction(globalObject, propertyName, this),
                    null
                ),
                null,
                false
            );
        }, this);
    }
    catch(e){ fcModel.Array.notifyError("Error when creating Array Function:" + e); }
};

fcModel.ArrayFunction.prototype = new fcModel.Object();
/*************************************************************************************/
}});