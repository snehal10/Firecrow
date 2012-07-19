var HtmlModelMapping =
{
    models: [],
    push: function(model)
    {
        this.models.push(model)
    },
    getModel: function(url)
    {
        for(var i = 0; i < this.models.length; i++)
        {
            var model = this.models[i];

            if(model.url == url)
            {
                return model.model;
            }
        }

        return null;
    },
    getWholeFileModel: function(url)
    {
        for(var i = 0; i < this.models.length; i++)
        {
            var model = this.models[i];

            if(model.url == url)
            {
                return model;
            }
        }

        return null;
    }
};

HtmlModelMapping.push
(
    {
        url: "file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html",
        results: [{a1:"Title modified by Js"}],
        model: {"docType":"","htmlElement":{"type":"html","attributes":[],"childNodes":[{"type":"head","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":0,"textContent":"\n    "},{"type":"title","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":1,"textContent":"Title"}],"nodeId":2},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":3,"textContent":"\n    "},{"type":"style","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":4,"textContent":"\n        .testClass { color: green; }\n    "}],"nodeId":5,"pathAndModel":{"path":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html","model":{"rules":[{"selector":".testClass","cssText":".testClass { color: green; }","nodeId":6}]}}},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":7,"textContent":"\n"}],"nodeId":8},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":9,"textContent":"\n"},{"type":"body","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":10,"textContent":"\n    "},{"type":"h2","attributes":[{"name":"class","value":"testClass"}],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":11,"textContent":"Title"}],"nodeId":12},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":13,"textContent":"\n    "},{"type":"script","attributes":[{"name":"type","value":"text/javascript"}],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":14,"textContent":"\n        var title = document.querySelector(\".testClass\");\n        title.textContent = \"Title modified by Js\";\n        var a1 = title.textContent;\n        a1;\n    "}],"nodeId":15,"textContent":"\n        var title = document.querySelector(\".testClass\");\n        title.textContent = \"Title modified by Js\";\n        var a1 = title.textContent;\n        a1;\n    ","pathAndModel":{"path":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html","model":{"loc":{"start":{"line":11,"column":0},"end":{"line":15,"column":11},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"Program","body":[{"loc":{"start":{"line":12,"column":8},"end":{"line":12,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":12,"column":12},"end":{"line":12,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":12,"column":12},"end":{"line":12,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"Identifier","name":"title","nodeId":18},"init":{"loc":{"start":{"line":12,"column":20},"end":{"line":12,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"CallExpression","callee":{"loc":{"start":{"line":12,"column":20},"end":{"line":12,"column":42},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":12,"column":20},"end":{"line":12,"column":28},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"Identifier","name":"document","nodeId":21},"property":{"loc":null,"type":"Identifier","name":"querySelector","nodeId":22},"computed":false,"nodeId":20},"arguments":[{"loc":{"start":{"line":12,"column":43},"end":{"line":12,"column":55},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"Literal","value":".testClass","nodeId":23}],"nodeId":19},"nodeId":17}],"nodeId":16},{"loc":{"start":{"line":13,"column":8},"end":{"line":13,"column":50},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"ExpressionStatement","expression":{"loc":{"start":{"line":13,"column":8},"end":{"line":13,"column":50},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"AssignmentExpression","operator":"=","left":{"loc":{"start":{"line":13,"column":8},"end":{"line":13,"column":25},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":13,"column":8},"end":{"line":13,"column":13},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"Identifier","name":"title","nodeId":27},"property":{"loc":null,"type":"Identifier","name":"textContent","nodeId":28},"computed":false,"nodeId":26},"right":{"loc":{"start":{"line":13,"column":28},"end":{"line":13,"column":50},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"Literal","value":"Title modified by Js","nodeId":29},"nodeId":25},"nodeId":24},{"loc":{"start":{"line":14,"column":8},"end":{"line":14,"column":34},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":14,"column":12},"end":{"line":14,"column":34},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":14,"column":12},"end":{"line":14,"column":34},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"Identifier","name":"a1","nodeId":32},"init":{"loc":{"start":{"line":14,"column":17},"end":{"line":14,"column":34},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":14,"column":17},"end":{"line":14,"column":22},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"Identifier","name":"title","nodeId":34},"property":{"loc":null,"type":"Identifier","name":"textContent","nodeId":35},"computed":false,"nodeId":33},"nodeId":31}],"nodeId":30},{"loc":{"start":{"line":15,"column":8},"end":{"line":15,"column":10},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"ExpressionStatement","expression":{"loc":{"start":{"line":15,"column":8},"end":{"line":15,"column":10},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/01/index.html"},"type":"Identifier","name":"a1","nodeId":37},"nodeId":36}]}}},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":38,"textContent":"\n\n"}],"nodeId":39}],"nodeId":40}},
        slicingResult: "PCFET0NUWVBFIGh0bWw+DQo8aHRtbD4NCiAgPGhlYWQ+DQogICAgPHN0eWxlPg0KICAgICAgLnRlc3RDbGFzcyB7IGNvbG9yOiBncmVlbjsgfQ0KICAgIDwvc3R5bGU+DQogIDwvaGVhZD4NCiAgPGJvZHk+DQogICAgPGgyIGNsYXNzPSJ0ZXN0Q2xhc3MiPlRpdGxlPC9oMj4NCiAgICA8c2NyaXB0IHR5cGU9InRleHQvamF2YXNjcmlwdCI+DQogICAgICB2YXIgdGl0bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudGVzdENsYXNzJyk7DQogICAgICB0aXRsZS50ZXh0Q29udGVudCA9ICdUaXRsZSBtb2RpZmllZCBieSBKcyc7DQogICAgICB2YXIgYTEgPSB0aXRsZS50ZXh0Q29udGVudDsNCiAgICAgIGExOw0KICAgIDwvc2NyaXB0Pg0KICA8L2JvZHk+DQo8L2h0bWw+DQo="
    }
);

HtmlModelMapping.push
(
    {
        url: "file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html",
        results: [{a1:"Element created by Js"}],
        model: {"docType":"","htmlElement":{"type":"html","attributes":[],"childNodes":[{"type":"head","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":0,"textContent":"\n    "},{"type":"title","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":1,"textContent":"Title"}],"nodeId":2},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":3,"textContent":"\n    "},{"type":"style","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":4,"textContent":"\n        .testClass { color: green; }\n    "}],"nodeId":5,"pathAndModel":{"path":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html","model":{"rules":[{"selector":".testClass","cssText":".testClass { color: green; }","nodeId":6}]}}},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":7,"textContent":"\n"}],"nodeId":8},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":9,"textContent":"\n"},{"type":"body","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":10,"textContent":"\n"},{"type":"h2","attributes":[{"name":"class","value":"testClass"}],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":11,"textContent":"Title"}],"nodeId":12},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":13,"textContent":"\n"},{"type":"div","attributes":[{"name":"id","value":"container"}],"childNodes":[],"nodeId":14},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":15,"textContent":"\n"},{"type":"script","attributes":[{"name":"type","value":"text/javascript"}],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":16,"textContent":"\n    var newContainer = document.createElement(\"div\");\n\n    var container = document.querySelector(\"#container\");\n    container.appendChild(newContainer);\n\n    newContainer.textContent = \"Element created by Js\";\n    var a1 = newContainer.textContent;\n    a1;\n"}],"nodeId":17,"textContent":"\n    var newContainer = document.createElement(\"div\");\n\n    var container = document.querySelector(\"#container\");\n    container.appendChild(newContainer);\n\n    newContainer.textContent = \"Element created by Js\";\n    var a1 = newContainer.textContent;\n    a1;\n","pathAndModel":{"path":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html","model":{"loc":{"start":{"line":12,"column":0},"end":{"line":20,"column":7},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Program","body":[{"loc":{"start":{"line":13,"column":4},"end":{"line":13,"column":52},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":13,"column":8},"end":{"line":13,"column":52},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":13,"column":8},"end":{"line":13,"column":52},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Identifier","name":"newContainer","nodeId":20},"init":{"loc":{"start":{"line":13,"column":23},"end":{"line":13,"column":52},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"CallExpression","callee":{"loc":{"start":{"line":13,"column":23},"end":{"line":13,"column":45},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":13,"column":23},"end":{"line":13,"column":31},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Identifier","name":"document","nodeId":23},"property":{"loc":null,"type":"Identifier","name":"createElement","nodeId":24},"computed":false,"nodeId":22},"arguments":[{"loc":{"start":{"line":13,"column":46},"end":{"line":13,"column":51},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Literal","value":"div","nodeId":25}],"nodeId":21},"nodeId":19}],"nodeId":18},{"loc":{"start":{"line":15,"column":4},"end":{"line":15,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":15,"column":8},"end":{"line":15,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":15,"column":8},"end":{"line":15,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Identifier","name":"container","nodeId":28},"init":{"loc":{"start":{"line":15,"column":20},"end":{"line":15,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"CallExpression","callee":{"loc":{"start":{"line":15,"column":20},"end":{"line":15,"column":42},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":15,"column":20},"end":{"line":15,"column":28},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Identifier","name":"document","nodeId":31},"property":{"loc":null,"type":"Identifier","name":"querySelector","nodeId":32},"computed":false,"nodeId":30},"arguments":[{"loc":{"start":{"line":15,"column":43},"end":{"line":15,"column":55},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Literal","value":"#container","nodeId":33}],"nodeId":29},"nodeId":27}],"nodeId":26},{"loc":{"start":{"line":16,"column":4},"end":{"line":16,"column":39},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"ExpressionStatement","expression":{"loc":{"start":{"line":16,"column":4},"end":{"line":16,"column":39},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"CallExpression","callee":{"loc":{"start":{"line":16,"column":4},"end":{"line":16,"column":25},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":16,"column":4},"end":{"line":16,"column":13},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Identifier","name":"container","nodeId":37},"property":{"loc":null,"type":"Identifier","name":"appendChild","nodeId":38},"computed":false,"nodeId":36},"arguments":[{"loc":{"start":{"line":16,"column":26},"end":{"line":16,"column":38},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Identifier","name":"newContainer","nodeId":39}],"nodeId":35},"nodeId":34},{"loc":{"start":{"line":18,"column":4},"end":{"line":18,"column":54},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"ExpressionStatement","expression":{"loc":{"start":{"line":18,"column":4},"end":{"line":18,"column":54},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"AssignmentExpression","operator":"=","left":{"loc":{"start":{"line":18,"column":4},"end":{"line":18,"column":28},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":18,"column":4},"end":{"line":18,"column":16},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Identifier","name":"newContainer","nodeId":43},"property":{"loc":null,"type":"Identifier","name":"textContent","nodeId":44},"computed":false,"nodeId":42},"right":{"loc":{"start":{"line":18,"column":31},"end":{"line":18,"column":54},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Literal","value":"Element created by Js","nodeId":45},"nodeId":41},"nodeId":40},{"loc":{"start":{"line":19,"column":4},"end":{"line":19,"column":37},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":19,"column":8},"end":{"line":19,"column":37},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":19,"column":8},"end":{"line":19,"column":37},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Identifier","name":"a1","nodeId":48},"init":{"loc":{"start":{"line":19,"column":13},"end":{"line":19,"column":37},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":19,"column":13},"end":{"line":19,"column":25},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Identifier","name":"newContainer","nodeId":50},"property":{"loc":null,"type":"Identifier","name":"textContent","nodeId":51},"computed":false,"nodeId":49},"nodeId":47}],"nodeId":46},{"loc":{"start":{"line":20,"column":4},"end":{"line":20,"column":6},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"ExpressionStatement","expression":{"loc":{"start":{"line":20,"column":4},"end":{"line":20,"column":6},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/02/index.html"},"type":"Identifier","name":"a1","nodeId":53},"nodeId":52}]}}},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":54,"textContent":"\n\n"}],"nodeId":55}],"nodeId":56}},
        slicingResult: "PCFET0NUWVBFIGh0bWw+DQo8aHRtbD4NCiAgPGJvZHk+DQogICAgPHNjcmlwdCB0eXBlPSJ0ZXh0L2phdmFzY3JpcHQiPg0KICAgICAgdmFyIG5ld0NvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpOw0KICAgICAgbmV3Q29udGFpbmVyLnRleHRDb250ZW50ID0gJ0VsZW1lbnQgY3JlYXRlZCBieSBKcyc7DQogICAgICB2YXIgYTEgPSBuZXdDb250YWluZXIudGV4dENvbnRlbnQ7DQogICAgICBhMTsNCiAgICA8L3NjcmlwdD4NCiAgPC9ib2R5Pg0KPC9odG1sPg0K"
    }
);

HtmlModelMapping.push
(
    {
        url: "file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html",
        results: [{a1:1}],
        model: {"docType":"","htmlElement":{"type":"html","attributes":[],"childNodes":[{"type":"head","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":0,"textContent":"\n    "},{"type":"title","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":1,"textContent":"Title"}],"nodeId":2},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":3,"textContent":"\n    "},{"type":"style","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":4,"textContent":"\n        .testClass { color: green; }\n    "}],"nodeId":5,"pathAndModel":{"path":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html","model":{"rules":[{"selector":".testClass","cssText":".testClass { color: green; }","nodeId":6}]}}},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":7,"textContent":"\n"}],"nodeId":8},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":9,"textContent":"\n"},{"type":"body","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":10,"textContent":"\n"},{"type":"h2","attributes":[{"name":"class","value":"testClass"}],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":11,"textContent":"Title"}],"nodeId":12},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":13,"textContent":"\n"},{"type":"div","attributes":[{"name":"id","value":"container"}],"childNodes":[],"nodeId":14},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":15,"textContent":"\n"},{"type":"script","attributes":[{"name":"type","value":"text/javascript"}],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":16,"textContent":"\n    var container = document.getElementById(\"container\");\n    container.textContent = \"1\";\n\n    var container2 = document.getElementById(\"container\");\n\n    var a1 = container2.textContent;\n    a1;\n"}],"nodeId":17,"textContent":"\n    var container = document.getElementById(\"container\");\n    container.textContent = \"1\";\n\n    var container2 = document.getElementById(\"container\");\n\n    var a1 = container2.textContent;\n    a1;\n","pathAndModel":{"path":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html","model":{"loc":{"start":{"line":12,"column":0},"end":{"line":19,"column":7},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Program","body":[{"loc":{"start":{"line":13,"column":4},"end":{"line":13,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":13,"column":8},"end":{"line":13,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":13,"column":8},"end":{"line":13,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Identifier","name":"container","nodeId":20},"init":{"loc":{"start":{"line":13,"column":20},"end":{"line":13,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"CallExpression","callee":{"loc":{"start":{"line":13,"column":20},"end":{"line":13,"column":43},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":13,"column":20},"end":{"line":13,"column":28},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Identifier","name":"document","nodeId":23},"property":{"loc":null,"type":"Identifier","name":"getElementById","nodeId":24},"computed":false,"nodeId":22},"arguments":[{"loc":{"start":{"line":13,"column":44},"end":{"line":13,"column":55},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Literal","value":"container","nodeId":25}],"nodeId":21},"nodeId":19}],"nodeId":18},{"loc":{"start":{"line":14,"column":4},"end":{"line":14,"column":31},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"ExpressionStatement","expression":{"loc":{"start":{"line":14,"column":4},"end":{"line":14,"column":31},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"AssignmentExpression","operator":"=","left":{"loc":{"start":{"line":14,"column":4},"end":{"line":14,"column":25},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":14,"column":4},"end":{"line":14,"column":13},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Identifier","name":"container","nodeId":29},"property":{"loc":null,"type":"Identifier","name":"textContent","nodeId":30},"computed":false,"nodeId":28},"right":{"loc":{"start":{"line":14,"column":28},"end":{"line":14,"column":31},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Literal","value":"1","nodeId":31},"nodeId":27},"nodeId":26},{"loc":{"start":{"line":16,"column":4},"end":{"line":16,"column":57},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":16,"column":8},"end":{"line":16,"column":57},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":16,"column":8},"end":{"line":16,"column":57},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Identifier","name":"container2","nodeId":34},"init":{"loc":{"start":{"line":16,"column":21},"end":{"line":16,"column":57},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"CallExpression","callee":{"loc":{"start":{"line":16,"column":21},"end":{"line":16,"column":44},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":16,"column":21},"end":{"line":16,"column":29},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Identifier","name":"document","nodeId":37},"property":{"loc":null,"type":"Identifier","name":"getElementById","nodeId":38},"computed":false,"nodeId":36},"arguments":[{"loc":{"start":{"line":16,"column":45},"end":{"line":16,"column":56},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Literal","value":"container","nodeId":39}],"nodeId":35},"nodeId":33}],"nodeId":32},{"loc":{"start":{"line":18,"column":4},"end":{"line":18,"column":35},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":18,"column":8},"end":{"line":18,"column":35},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":18,"column":8},"end":{"line":18,"column":35},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Identifier","name":"a1","nodeId":42},"init":{"loc":{"start":{"line":18,"column":13},"end":{"line":18,"column":35},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":18,"column":13},"end":{"line":18,"column":23},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Identifier","name":"container2","nodeId":44},"property":{"loc":null,"type":"Identifier","name":"textContent","nodeId":45},"computed":false,"nodeId":43},"nodeId":41}],"nodeId":40},{"loc":{"start":{"line":19,"column":4},"end":{"line":19,"column":6},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"ExpressionStatement","expression":{"loc":{"start":{"line":19,"column":4},"end":{"line":19,"column":6},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/03/index.html"},"type":"Identifier","name":"a1","nodeId":47},"nodeId":46}]}}},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":48,"textContent":"\n\n"}],"nodeId":49}],"nodeId":50}},
        slicingResult: "PCFET0NUWVBFIGh0bWw+DQo8aHRtbD4NCiAgPGJvZHk+DQogICAgPGRpdiBpZD0iY29udGFpbmVyIj4NCiAgICA8L2Rpdj4NCiAgICA8c2NyaXB0IHR5cGU9InRleHQvamF2YXNjcmlwdCI+DQogICAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpOw0KICAgICAgY29udGFpbmVyLnRleHRDb250ZW50ID0gJzEnOw0KICAgICAgdmFyIGNvbnRhaW5lcjIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7DQogICAgICB2YXIgYTEgPSBjb250YWluZXIyLnRleHRDb250ZW50Ow0KICAgICAgYTE7DQogICAgPC9zY3JpcHQ+DQogIDwvYm9keT4NCjwvaHRtbD4NCg=="
    }
);

HtmlModelMapping.push
(
    {
        url: "file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html",
        results: [{a1:6}],
        model: {"docType":"","htmlElement":{"type":"html","attributes":[],"childNodes":[{"type":"head","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":0,"textContent":"\n    "},{"type":"title","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":1,"textContent":"Title"}],"nodeId":2},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":3,"textContent":"\n    "},{"type":"style","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":4,"textContent":"\n        .testClass { color: green; }\n    "}],"nodeId":5,"pathAndModel":{"path":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html","model":{"rules":[{"selector":".testClass","cssText":".testClass { color: green; }","nodeId":6}]}}},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":7,"textContent":"\n"}],"nodeId":8},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":9,"textContent":"\n"},{"type":"body","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":10,"textContent":"\n"},{"type":"h2","attributes":[{"name":"class","value":"testClass"}],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":11,"textContent":"Title"}],"nodeId":12},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":13,"textContent":"\n"},{"type":"div","attributes":[{"name":"id","value":"container"}],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":14,"textContent":"\n    "},{"type":"span","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":15,"textContent":"1"}],"nodeId":16},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":17,"textContent":"\n    "},{"type":"span","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":18,"textContent":"2"}],"nodeId":19},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":20,"textContent":"\n    "},{"type":"span","attributes":[],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":21,"textContent":"3"}],"nodeId":22},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":23,"textContent":"\n"}],"nodeId":24},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":25,"textContent":"\n"},{"type":"script","attributes":[{"name":"type","value":"text/javascript"}],"childNodes":[{"type":"textNode","attributes":[],"childNodes":[],"nodeId":26,"textContent":"\n\n        var container = document.getElementById(\"container\");\n        var children = container.children;\n\n        var sum = 0;\n        for(var i = 0; i < children.length; i++)\n        {\n            sum += parseInt(children[i].textContent);\n        }\n\n        var a1 = sum;\n        a1;\n    "}],"nodeId":27,"textContent":"\n\n        var container = document.getElementById(\"container\");\n        var children = container.children;\n\n        var sum = 0;\n        for(var i = 0; i < children.length; i++)\n        {\n            sum += parseInt(children[i].textContent);\n        }\n\n        var a1 = sum;\n        a1;\n    ","pathAndModel":{"path":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html","model":{"loc":{"start":{"line":16,"column":0},"end":{"line":28,"column":11},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Program","body":[{"loc":{"start":{"line":18,"column":8},"end":{"line":18,"column":60},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":18,"column":12},"end":{"line":18,"column":60},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":18,"column":12},"end":{"line":18,"column":60},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"container","nodeId":30},"init":{"loc":{"start":{"line":18,"column":24},"end":{"line":18,"column":60},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"CallExpression","callee":{"loc":{"start":{"line":18,"column":24},"end":{"line":18,"column":47},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":18,"column":24},"end":{"line":18,"column":32},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"document","nodeId":33},"property":{"loc":null,"type":"Identifier","name":"getElementById","nodeId":34},"computed":false,"nodeId":32},"arguments":[{"loc":{"start":{"line":18,"column":48},"end":{"line":18,"column":59},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Literal","value":"container","nodeId":35}],"nodeId":31},"nodeId":29}],"nodeId":28},{"loc":{"start":{"line":19,"column":8},"end":{"line":19,"column":41},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":19,"column":12},"end":{"line":19,"column":41},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":19,"column":12},"end":{"line":19,"column":41},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"children","nodeId":38},"init":{"loc":{"start":{"line":19,"column":23},"end":{"line":19,"column":41},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":19,"column":23},"end":{"line":19,"column":32},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"container","nodeId":40},"property":{"loc":null,"type":"Identifier","name":"children","nodeId":41},"computed":false,"nodeId":39},"nodeId":37}],"nodeId":36},{"loc":{"start":{"line":21,"column":8},"end":{"line":21,"column":19},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":21,"column":12},"end":{"line":21,"column":19},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":21,"column":12},"end":{"line":21,"column":19},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"sum","nodeId":44},"init":{"loc":{"start":{"line":21,"column":18},"end":{"line":21,"column":19},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Literal","value":0,"nodeId":45},"nodeId":43}],"nodeId":42},{"loc":{"start":{"line":22,"column":8},"end":{"line":24,"column":53},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"ForStatement","init":{"loc":{"start":{"line":22,"column":12},"end":{"line":22,"column":21},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":22,"column":16},"end":{"line":22,"column":21},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":22,"column":16},"end":{"line":22,"column":21},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"i","nodeId":49},"init":{"loc":{"start":{"line":22,"column":20},"end":{"line":22,"column":21},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Literal","value":0,"nodeId":50},"nodeId":48}],"nodeId":47},"test":{"loc":{"start":{"line":22,"column":23},"end":{"line":22,"column":42},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"BinaryExpression","operator":"<","left":{"loc":{"start":{"line":22,"column":23},"end":{"line":22,"column":24},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"i","nodeId":52},"right":{"loc":{"start":{"line":22,"column":27},"end":{"line":22,"column":42},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":22,"column":27},"end":{"line":22,"column":35},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"children","nodeId":54},"property":{"loc":null,"type":"Identifier","name":"length","nodeId":55},"computed":false,"nodeId":53},"nodeId":51},"update":{"loc":{"start":{"line":22,"column":44},"end":{"line":22,"column":47},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"UpdateExpression","operator":"++","argument":{"loc":{"start":{"line":22,"column":44},"end":{"line":22,"column":45},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"i","nodeId":57},"prefix":false,"nodeId":56},"body":{"loc":{"start":{"line":23,"column":8},"end":{"line":24,"column":53},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"BlockStatement","body":[{"loc":{"start":{"line":24,"column":12},"end":{"line":24,"column":52},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"ExpressionStatement","expression":{"loc":{"start":{"line":24,"column":12},"end":{"line":24,"column":52},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"AssignmentExpression","operator":"+=","left":{"loc":{"start":{"line":24,"column":12},"end":{"line":24,"column":15},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"sum","nodeId":61},"right":{"loc":{"start":{"line":24,"column":19},"end":{"line":24,"column":52},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"CallExpression","callee":{"loc":{"start":{"line":24,"column":19},"end":{"line":24,"column":27},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"parseInt","nodeId":63},"arguments":[{"loc":{"start":{"line":24,"column":28},"end":{"line":24,"column":51},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":24,"column":28},"end":{"line":24,"column":39},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"MemberExpression","object":{"loc":{"start":{"line":24,"column":28},"end":{"line":24,"column":36},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"children","nodeId":66},"property":{"loc":{"start":{"line":24,"column":37},"end":{"line":24,"column":38},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"i","nodeId":67},"computed":true,"nodeId":65},"property":{"loc":null,"type":"Identifier","name":"textContent","nodeId":68},"computed":false,"nodeId":64}],"nodeId":62},"nodeId":60},"nodeId":59}],"nodeId":58},"nodeId":46},{"loc":{"start":{"line":27,"column":8},"end":{"line":27,"column":20},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"VariableDeclaration","kind":"var","declarations":[{"loc":{"start":{"line":27,"column":12},"end":{"line":27,"column":20},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"VariableDeclarator","id":{"loc":{"start":{"line":27,"column":12},"end":{"line":27,"column":20},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"a1","nodeId":71},"init":{"loc":{"start":{"line":27,"column":17},"end":{"line":27,"column":20},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"sum","nodeId":72},"nodeId":70}],"nodeId":69},{"loc":{"start":{"line":28,"column":8},"end":{"line":28,"column":10},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"ExpressionStatement","expression":{"loc":{"start":{"line":28,"column":8},"end":{"line":28,"column":10},"source":"file:///C:/GitWebStorm/Firecrow/debug/domTests/04/index.html"},"type":"Identifier","name":"a1","nodeId":74},"nodeId":73}]}}},{"type":"textNode","attributes":[],"childNodes":[],"nodeId":75,"textContent":"\n\n"}],"nodeId":76}],"nodeId":77}},
        slicingResult: "PCFET0NUWVBFIGh0bWw+DQo8aHRtbD4NCiAgPGJvZHk+DQogICAgPGRpdiBpZD0iY29udGFpbmVyIj4NCiAgICA8L2Rpdj4NCiAgICA8c2NyaXB0IHR5cGU9InRleHQvamF2YXNjcmlwdCI+DQogICAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpOw0KICAgICAgdmFyIGNoaWxkcmVuID0gY29udGFpbmVyLmNoaWxkcmVuOw0KICAgICAgdmFyIHN1bSA9IDA7DQogICAgICBmb3IodmFyIGkgPSAwO2kgPCBjaGlsZHJlbi5sZW5ndGg7aSsrKQ0KICAgICAgew0KICAgICAgICBzdW0gKz0gcGFyc2VJbnQoY2hpbGRyZW5baV0udGV4dENvbnRlbnQpOw0KICAgICAgfQ0KDQogICAgICB2YXIgYTEgPSBzdW07DQogICAgICBhMTsNCiAgICA8L3NjcmlwdD4NCiAgPC9ib2R5Pg0KPC9odG1sPg0K"
    }
);