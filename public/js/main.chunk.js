(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{237:function(e,t,a){},479:function(e,t){},498:function(e,t,a){e.exports=a(973)},660:function(e,t){},662:function(e,t){},694:function(e,t){},695:function(e,t){},879:function(e,t,a){var r={"./geojson.json":458,"./table-schema.json":880,"./topojson.json":459};function n(e){var t=c(e);return a(t)}function c(e){if(!a.o(r,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return r[e]}n.keys=function(){return Object.keys(r)},n.resolve=c,e.exports=n,n.id=879},964:function(e,t){},965:function(e,t){},969:function(e,t){},970:function(e,t){},973:function(e,t,a){"use strict";a.r(t);var r=a(480),n=a(4),c=a.n(n),i=a(106),o=a.n(i),s=(a(237),a(231)),u=a(146),l=a(482),d=a(483),p=function(e){var t=f(e);return t.resources&&t.resources.forEach(function(e){delete e.data,delete e._values}),t.views&&t.views.forEach(function(e){e.resources&&e.resources.forEach(function(e){delete e.data,delete e._values})}),t},f=function(e){return JSON.parse(JSON.stringify(e))},g=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"DATA_VIEW_CHART_BUILDER_ACTION":var a=f(e);return a=a.map(function(e){return"simple"===e.datapackage.views[0].specType&&(e.datapackage.views[0]=t.payload),e}),Object.assign(f(e),a);case"DATA_VIEW_MAP_BUILDER_ACTION":var r=f(e);return r=r.map(function(e){return"tabularmap"===e.datapackage.views[0].specType&&(e.datapackage.views[0]=t.payload),e}),Object.assign(f(e),r);case"SELECT_TAB":case"FETCH_DATA_BEGIN":case"FETCH_DATA_SUCCESS":case"FETCH_DATA_FAILURE":return t.payload.widgets;default:return e}},v=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"DATAPACKAGE_LOAD":return t.payload.datapackage;default:return e}},m=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};switch((arguments.length>1?arguments[1]:void 0).type){case"FILTER_UI_ACTION":default:return e}},b=function(){arguments.length>0&&void 0!==arguments[0]&&arguments[0],arguments.length>1&&arguments[1];var e=arguments.length>2?arguments[2]:void 0;try{var t=f(e);delete t.serializedState;var a=p(t.datapackage),r=t.widgets.map(function(e){return e.datapackage=p(e.datapackage),e.loading=!1,e});return JSON.stringify(Object.assign(t,{datapackage:a,widgets:r}))}catch(n){return console.warn(n),{}}},w=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;return{widgets:g(e.widgets,t),datapackage:v(e.datapackage,t),datastoreFilters:m(e.datastoreFilters,t),serializedState:b(e.serializedState,t,e)}},y={datastoreFilters:{},datapackage:{},widgets:[],serializedState:{}};function O(e){return Object(u.createStore)(w,Object.assign({},y,e),Object(l.composeWithDevTools)(Object(u.applyMiddleware)(d.a)))}var k=a(30),h=a(484),E=a(488),N=a.n(E),A=a(489),S=function(e){var t=e.datapackage.views;return c.a.createElement(N.a,{loaded:!e.loading,style:{position:"relative"}},c.a.createElement("div",null,t.map(function(e){return c.a.createElement(A.DataView,{key:Math.random(),datapackage:{views:[e]}})})))},j=["archiver","schema","shareLink","iframeText"],x=function(e){var t=function(e){if(e.length<=1500)return e;var t=JSON.parse(e);return t.datapackage.resources.forEach(function(e){for(var t in j)e[j[t]]&&delete e[j[t]]}),JSON.stringify(t)}(e.serializedState),a="localhost:4000/data-explorer?explorer=".concat(t),r='<iframe src="localhost:4000/data-explorer?explorer='.concat(t,'" />'),n=a.length<2e3,i=function(e){var t=document.createElement("textarea");t.value=e,t.setAttribute("readonly",""),t.style={position:"absolute",left:"-9999px"},document.body.appendChild(t),t.select(),document.execCommand("copy"),document.body.removeChild(t)};return c.a.createElement("div",null,n&&c.a.createElement("div",null,c.a.createElement("div",{className:"m-4"},c.a.createElement("input",{id:"share-link",className:"border-solid border-4 border-gray-600 w-1/2 px-2",value:a}),c.a.createElement("button",{id:"copy-share-link",className:"m-4",onClick:function(){i(a)}},c.a.createElement("i",null,"copy share link"))),c.a.createElement("div",{className:"m-4"},c.a.createElement("input",{id:"embed",className:"border-solid border-4 border-gray-600 px-2 w-1/2",value:r}),c.a.createElement("button",{id:"copy-share-link",className:"m-4",onClick:function(){i(r)}},c.a.createElement("i",null,"copy embed text")))),!n&&c.a.createElement("p",null,"No share link available"))},T=a(494),_=a(495),C=a(235),D=a(59),J=a.n(D),P=a(148),I=a(496),B=a(414);function F(e){try{return JSON.parse(e)}catch(t){return e}}var L=function(){var e=Object(P.a)(J.a.mark(function e(t){var a,r,n;return J.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return a=F(t),r=["csv","tsv","dsv","xls","xlsx"],e.prev=2,e.next=5,I.Dataset.load(a);case 5:return n=e.sent,e.next=8,Promise.all(n.resources.map(function(){var e=Object(P.a)(J.a.mark(function e(t){var a,n,c,i,o,s;return J.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if("FileInline"!==t.displayName){e.next=4;break}return e.abrupt("return");case 4:if(!t.descriptor.path||!t.descriptor.path.includes("datastore_search")){e.next=17;break}return e.next=7,fetch(t.descriptor.path);case 7:if((a=e.sent).ok){e.next=11;break}return t.descriptor.unavailable=!0,e.abrupt("return");case 11:return e.next=13,a.json();case 13:n=e.sent,t.descriptor.data=n.result.records,e.next=60;break;case 17:if("FileRemote"!==t.displayName||!r.includes(t.descriptor.format)){e.next=36;break}return e.prev=18,e.next=21,t.rows({size:100,keyed:!0});case 21:return c=e.sent,e.next=24,B(c);case 24:return(i=e.sent).length>0?t.descriptor.data=i:t.descriptor.unavailable=!0,e.next=28,t.addSchema();case 28:e.next=34;break;case 30:e.prev=30,e.t0=e.catch(18),console.warn(e.t0),t.descriptor.unavailable=!0;case 34:e.next=60;break;case 36:if(!t.descriptor.format.toLowerCase().includes("json")){e.next=55;break}return e.next=39,fetch(t.descriptor.path);case 39:if((o=e.sent).ok){e.next=43;break}return t.descriptor.unavailable=!0,e.abrupt("return");case 43:return e.next=45,o.json();case 45:if(s=e.sent,!["Feature","FeatureCollection","Point","MultiPoint","LineString","MultiLineString","Polygon","MultiPolygon","GeometryCollection"].includes(s.type)){e.next=51;break}t.descriptor.data=s,e.next=53;break;case 51:return t.descriptor.unavailable=!0,e.abrupt("return");case 53:e.next=60;break;case 55:if("pdf"!==t.descriptor.format.toLowerCase()){e.next=59;break}return e.abrupt("return");case 59:t.descriptor.unavailable=!0;case 60:case"end":return e.stop()}},e,null,[[18,30]])}));return function(t){return e.apply(this,arguments)}}()));case 8:return e.abrupt("return",n.descriptor);case 11:return e.prev=11,e.t0=e.catch(2),console.warn("Failed to load a Dataset from provided datapackage id\n"+e.t0),e.abrupt("return",a);case 15:case"end":return e.stop()}},e,null,[[2,11]])}));return function(t){return e.apply(this,arguments)}}(),U=a(230);function V(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),a.push.apply(a,r)}return a}function M(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?V(a,!0).forEach(function(t){Object(k.a)(e,t,a[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):V(a).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))})}return e}var R=function(e){return{type:"SELECT_TAB",payload:M({},e)}},z=function(e){return{type:"DATAPACKAGE_LOAD",payload:M({},e)}},H=function(e){return{type:"FETCH_DATA_BEGIN",payload:M({},e)}},W=function(e){return{type:"FETCH_DATA_SUCCESS",payload:M({},e)}};function G(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter(function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable})),a.push.apply(a,r)}return a}var K=Object(s.b)(function(e){return function(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?G(a,!0).forEach(function(t){Object(k.a)(e,t,a[t])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):G(a).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))})}return e}({},e)},function(e){return{filterUIAction:function(t){return e(function(e){return function(){var t=Object(P.a)(J.a.mark(function t(a,r){var n,c,i,o,s,u;return J.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return n=JSON.parse(JSON.stringify(r().datapackage)),c=JSON.parse(JSON.stringify(e)),(i=Object.assign(n,{resources:[c]})).resources[0].datastore_active&&delete i.resources[0].data,a(z({datapackage:i})),o=JSON.parse(JSON.stringify(r().widgets)).map(function(e){return e.loading=!0,e}),a(H({widgets:o})),n=JSON.parse(JSON.stringify(r().datapackage)),t.next=10,L(n);case 10:s=t.sent,a(z({datapackage:s})),u=JSON.parse(JSON.stringify(r().widgets)).map(function(e){return e.datapackage.views=e.datapackage.views.map(function(e){return Object(U.compileView)(e,s)}),e.loading=!1,e}),a(W({widgets:u}));case 14:case"end":return t.stop()}},t)}));return function(e,a){return t.apply(this,arguments)}}()}(t))},fetchDataAction:function(t){return e(function(e){return function(){var t=Object(P.a)(J.a.mark(function t(a){var r,n,c,i;return J.a.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return r=JSON.parse(JSON.stringify(e.widgets)).map(function(e){return e.loading=!0,e}),a(H({widgets:r})),n=JSON.parse(JSON.stringify(e.datapackage)),t.next=5,L(n);case 5:c=t.sent,a(z({datapackage:c})),i=JSON.parse(JSON.stringify(e.widgets)).map(function(e){return e.datapackage.views=e.datapackage.views.map(function(e){return Object(U.compileView)(e,c)}),e}),a(W({widgets:i}));case 9:case"end":return t.stop()}},t)}));return function(e){return t.apply(this,arguments)}}()}(t))},dataViewBuilderAction:function(t){return e(function(e){return function(t){var a;"simple"===e.specType?a="DATA_VIEW_CHART_BUILDER_ACTION":"tabularmap"===e.specType&&(a="DATA_VIEW_MAP_BUILDER_ACTION"),t({type:a,payload:e})}}(t))},selectTabAction:function(t){return e(function(e){return function(t,a){var r=JSON.parse(JSON.stringify(a().widgets));r.forEach(function(t,a){r[a].active=!1,t.name===e&&(r[a].active=!0)}),t(R({widgets:r}))}}(t))}}})(function(e){Object(n.useEffect)(function(){var t={datapackage:e.datapackage,widgets:e.widgets};e.fetchDataAction(t)},[]);var t,a=e.widgets.find(function(e){return e.active}),r=a?a.name:e.widgets[0].name,i=e.widgets.map(function(e){return c.a.createElement(C.TabLink,{to:e.name,className:"mr-4"},e.name)}),o=e.widgets.map(function(t){return c.a.createElement(C.TabContent,{for:t.name},c.a.createElement("div",{className:"container flex py-6"},c.a.createElement("div",{className:"w-3/4 py-3 mr-4"},c.a.createElement(S,t)),c.a.createElement("div",{className:"w-1/4"},c.a.createElement("div",{className:"w-full"},c.a.createElement("div",{className:"p-4 mr-4"},"simple"===t.datapackage.views[0].specType?c.a.createElement(T.ChartBuilder,{view:t.datapackage.views[0],dataViewBuilderAction:e.dataViewBuilderAction}):"","tabularmap"===t.datapackage.views[0].specType?c.a.createElement(_.MapBuilder,{view:t.datapackage.views[0],dataViewBuilderAction:e.dataViewBuilderAction}):"")))))});return c.a.createElement("div",{className:"ml-6"},c.a.createElement("div",{className:"container py-4"},c.a.createElement("div",{className:"datastore-query-builder"},e.datapackage.resources[0].datastore_active?c.a.createElement(h.QueryBuilder,{resource:(t=e.datapackage,t?t.resources[0]:{}),filterBuilderAction:e.filterUIAction}):"")),c.a.createElement(C.Tabs,{renderActiveTabContentOnly:!0,handleSelect:function(t){e.selectTabAction(t)},selectedTab:r},i,o),c.a.createElement(x,{serializedState:e.serializedState}))}),q=function(e){var t,a;if("string"===typeof e.datapackage)try{t=JSON.parse(e.datapackage)}catch(n){t={},console.warn("Invalid datapackage",n)}else"object"===typeof e.datapackage&&(t=e.datapackage);try{a=JSON.parse(JSON.stringify(t.views)),delete t.views}catch(i){console.log("No views set on datapackage")}var r=e.widgets?e.widgets:function(e){var t={table:"Table",tabularmap:"Map",map:"Map",simple:"Chart"};return e.map(function(e,a){return{active:0===a,name:t[e.specType],datapackage:{views:[e]}}})}(a);return c.a.createElement(s.a,{store:O({widgets:r,datapackage:t})},c.a.createElement(K,null))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var Q=document.getElementsByClassName("data-explorer"),$=!0,X=!1,Y=void 0;try{for(var Z,ee=Q[Symbol.iterator]();!($=(Z=ee.next()).done);$=!0){var te=Z.value;try{var ae=JSON.parse(te.getAttribute("data-datapackage")),re=ae.datapackage,ne=Object(r.a)(ae,["datapackage"]);o.a.render(c.a.createElement(q,Object.assign({datapackage:re},ne)),document.getElementById(te.id))}catch(ce){console.warn("Failed to render data-explorer",ce)}}}catch(ie){X=!0,Y=ie}finally{try{$||null==ee.return||ee.return()}finally{if(X)throw Y}}"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})}},[[498,1,2]]]);
//# sourceMappingURL=main.a47343e4.chunk.js.map