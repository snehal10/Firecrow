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
        slicingResult: "PCFET0NUWVBFIGh0bWw+DQo8aHRtbD4NCiAgPGhlYWQ+DQogICAgPHN0eWxlPg0KICAgICAgLnRlc3RDbGFzcyB7IGNvbG9yOiBncmVlbjsgfQ0KICAgIDwvc3R5bGU+DQogIDwvaGVhZD4NCiAgPGJvZHk+DQogICAgPGgyIGNsYXNzPSJ0ZXN0Q2xhc3MiPlRpdGxlPC9oMj4NCiAgICA8c2NyaXB0IHR5cGU9InRleHQvamF2YXNjcmlwdCI+DQogICAgICB2YXIgdGl0bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudGVzdENsYXNzJyk7DQogICAgICB0aXRsZS50ZXh0Q29udGVudCA9ICdUaXRsZSBtb2RpZmllZCBieSBKcyc7DQogICAgICB2YXIgYTEgPSB0aXRsZS50ZXh0Q29udGVudDsNCiAgICAgIGExOw0KICAgIDwvc2NyaXB0Pg0KICA8L2JvZHk+DQo8L2h0bWw+DQo="
    }
);