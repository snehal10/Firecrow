/**
 * Created by Jomaras.
 * Date: 10.03.12.@20:02
 */
FBL.ns(function() { with (FBL) {
/*************************************************************************************/
var fcModel = Firecrow.Interpreter.Model;

fcModel.GlobalObject = function(documentFragment)
{
    try
    {
        this.__proto__ = new fcModel.Object(this);

        this.fcInternal = new fcModel.FcInternal(null, this);

        Firecrow.Interpreter.Simulator.VariableObject.liftToVariableObject(this);

        this.arrayPrototype = new fcModel.ArrayPrototype(this);
        this.objectPrototype = new fcModel.ObjectPrototype(this);
        this.functionPrototype = new fcModel.FunctionPrototype(this);
        this.regExPrototype = new fcModel.RegExPrototype(this);
        this.stringPrototype = new fcModel.StringPrototype(this);

        this.stringFunction = new fcModel.StringFunction(this);
        this.arrayFunction = new fcModel.ArrayFunction(this);
        this.regExFunction = new fcModel.RegExFunction(this);
        this.emptyFunction = new fcModel.EmptyFunction(this);

        this.addProperty("Array", this.arrayFunction, null);
        this.addProperty("RegExp", this.regExFunction, null);
        this.addProperty("String", this.stringFunction, null);
    }
    catch(e) { alert("Error when initializing global object:" + e); }
};

fcModel.GlobalObject.prototype = new fcModel.Object(null);
/*************************************************************************************/
}});