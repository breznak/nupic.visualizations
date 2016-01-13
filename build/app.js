angular.module("app",["ui.bootstrap"]),angular.module("app").constant("appConfig",{TIMESTAMP:"timestamp",EXCLUDE_FIELDS:[],HEADER_SKIPPED_ROWS:1,ZOOM:"HighlightSelector",NONE_VALUE_REPLACEMENT:0,WINDOW_SIZE:1e4,MAX_FILE_SIZE:62914560,LOCAL_CHUNK_SIZE:2097152,REMOTE_CHUNK_SIZE:65536,POLLING_INTERVAL:5e3}),angular.module("app").controller("appCtrl",["$scope","$http","$timeout","appConfig","$interval",function(e,i,n,t,a){e.view={fieldState:[],graph:null,dataField:null,optionsVisible:!0,filePath:"",loadedFileName:"",errors:[],loading:!1,windowing:{threshold:t.MAX_FILE_SIZE,size:-1,show:!1,paused:!1,aborted:!1,update_interval:1},monitor:{clock:void 0,interval:0,lastChunkIter:0},file:{size:0,file:null,name:null,path:null,loadingInProgress:!1,local:!0}};var l=[],o=[],r=[],s={},d=!1,u=0,f=-1,g=null,p=!1;e.toggleOptions=function(){e.view.optionsVisible=!e.view.optionsVisible,e.view.graph&&(s.resize=n(function(){e.view.graph.resize()}))},e.getRemoteFile=function(){e.view.windowing.show=!1,e.view.windowing.paused=!1,e.view.windowing.aborted=!1,e.$broadcast("fileUploadChange"),e.view.loading=!0,e.view.file.size=c(e.view.filePath),console.log("File size "+e.view.file.size),e.canDownload()&&e.view.file.size>t.MAX_FILE_SIZE?(console.log("streamig..."),S(e.view.filePath,"streamRemote")):S(e.view.filePath,"download")},e.getLocalFile=function(){e.view.file.size=c(e.view.file.file),console.log("File size "+e.view.file.size),e.view.file.size>e.view.windowing.threshold&&-1!==e.view.windowing.threshold&&(e.view.windowing.show=!0,e.view.windowing.size=t.WINDOW_SIZE,I("File too large, automatic sliding window enabled.","warning")),e.view.loading=!0,S(e.view.file.file,"streamLocal")},e.loadFile=function(i){null!==i&&(e.view.file.file=i.target.files[0],e.view.file.name=e.view.file.file.name,e.view.file.path=i.target.files[0].name,e.view.filePath=e.view.file.path),e.canDownload(),w(),v(t.POLLING_INTERVAL)};var v=function(i){(angular.isDefined(e.view.monitor.clock)||0>=i)&&(a.cancel(e.view.monitor.clock),e.view.monitor.clock=void 0,e.view.monitor.interval=0),i>0&&(I("Monitoring mode started, update interval "+t.POLLING_INTERVAL+"ms. ","warning",!0),e.view.monitor.interval=i,e.view.monitor.clock=a(function(){w(),console.log("updating...")},e.view.monitor.interval))},w=function(){return e.view.file.loadingInProgress?void console.log("File was not completely read yet, cancelling another re-read till done!"):(e.view.file.loadingInProgress=!0,void(e.view.file.local?e.getLocalFile():e.getRemoteFile()))};e.canDownload=function(){var n=e.view.filePath.split("://");if(!(("https"===n[0]||"http"===n[0])&&n.length>1&&n[1].length>0))return e.view.file.local=!0,!1;e.view.file.local=!1;try{i.head(e.view.filePath,{headers:{Range:"bytes=0-32"}}).then(function(e){return 206===e.status?(console.log("server supports remote streaming"),!0):(I("Server does not support remote file streaming. (Missing Range HTTP header).","danger",!0),!1)},function(){return!1})}catch(t){return!1}};var c=function(e){return"object"==typeof e?e.size:void i.head(e).then(function(e){return e.headers("Content-Length")},function(){return I("Failed to get remote file's size","danger",!0),-1})};e.abortParse=function(){angular.isDefined(g)&&angular.isDefined(g.abort)&&(g.abort(),e.view.windowing.paused=!1,e.view.windowing.aborted=!0)},e.pauseParse=function(){angular.isDefined(g)&&angular.isDefined(g.pause)&&(g.pause(),e.view.windowing.paused=!0)},e.resumeParse=function(){angular.isDefined(g)&&angular.isDefined(g.resume)&&(g.resume(),e.view.windowing.paused=!1)};var h=function(e){var i=e.split("/");return i[i.length-1]},m=function(i){console.log("SLOW");for(var n=-1,a=0;a<i.length;a++){for(var s=[],g=0;g<o.length;g++){var v=o[g],w=i[a][v];if(v===t.TIMESTAMP){if(u++,d?w=u:"number"==typeof w||("string"==typeof w&&null!==b(w)?w=b(w):(I("Parsing timestamp failed, fallback to using iteration number","warning",!0),w=u)),n>=w&&1!==i[a][f]){I("Your time is not monotonic at row "+u+"! Graphs are incorrect.","danger",!1),console.log("Incorrect timestamp!");break}n=w}else"None"===w&&(w=t.NONE_VALUE_REPLACEMENT);s.push(w)}s.length===o.length?(l.push(s),r.push(angular.extend([],s)),-1!==e.view.windowing.size&&l.length>e.view.windowing.size&&(l.shift(),r.shift())):console.log("Incomplete row loaded "+s+"; skipping.")}null===e.view.graph?P():u%e.view.windowing.update_interval===0&&e.view.graph.updateOptions({file:l}),p||(e.$apply(),p=!0)},E=function(){e.view.fieldState.length=0,e.view.graph=null,e.view.dataField=null,e.view.errors.length=0,e.view.loadedFileName="",d=!1,u=0,l.length=0,o.length=0,p=!1},S=function(i,n){E(),Papa.RemoteChunkSize=t.REMOTE_CHUNK_SIZE,Papa.LocalChunkSize=t.LOCAL_CHUNK_SIZE;var a=!1,l=0;Papa.parse(i,{download:!0,skipEmptyLines:!0,header:!0,dynamicTyping:!0,worker:!1,comments:"#",complete:function(a){console.log("COMPLETED"),e.view.monitor.lastChunkIter=l,e.view.file.loadingInProgress=!1,"download"===n&&(angular.isDefined(a.data)?(e.view.loadedFileName=h(i),o=F(a.data,t.EXCLUDE_FIELDS),a.data.splice(0,t.HEADER_SKIPPED_ROWS),m(a.data)):I("An error occurred when attempting to download file.","danger"),e.view.loading=!1,e.$apply())},chunk:function(i,n){return l++,g=n,a=!0,l<=e.view.monitor.lastChunkIter&&l>1?void console.log("Skipping: iter "+l+" < = "+e.view.monitor.lastChunkIter):l*t.LOCAL_CHUNK_SIZE+10*t.LOCAL_CHUNK_SIZE<e.view.file.size?void console.log("Skipping 2: iter "+l+", bytes read "+l*t.LOCAL_CHUNK_SIZE+" < "+e.view.file.size):(console.log("working"),void m(i.data))},beforeFirstChunk:function(a){"streamRemote"===n?e.view.loadedFileName=h(i):"streamLocal"===n&&(e.view.loadedFileName=i.name);var l=a.split(/\r\n|\r|\n/);return o=F(l,t.EXCLUDE_FIELDS),l.splice(1,t.HEADER_SKIPPED_ROWS),e.view.loading=!1,l=l.join("\n")},error:function(i){e.view.loading=!1,I("Could not download/stream the file.","danger")}})},I=function(i,n,t){if(t="undefined"!=typeof t?t:!1,exists=!1,t){errs=e.view.errors;for(var a=0;a<errs.length;a++)if(errs[a].message===i)return}e.view.errors.push({message:i,type:n}),e.$apply()};e.clearErrors=function(){e.view.errors.length=0},e.clearError=function(i){e.view.errors.splice(i,1)};var b=function(e){var i=new Date(e);if("Invalid Date"!==i.toString())return i;var n=String(e).split(" "),t=[],a=n[0].split("/"),l=n[0].split("-");if(1===a.length&&1===l.length||a.length>1&&l.length>1)return I("Could not parse the timestamp: "+e,"warning",!0),null;if(l.length>2)t.push(l[0]),t.push(l[1]),t.push(l[2]);else{if(!(a.length>2))return I("There was something wrong with the date in the timestamp field.","warning",!0),null;t.push(a[2]),t.push(a[0]),t.push(a[1])}if(n[1]){var o=n[1].split(":");t=t.concat(o)}for(var r=0;r<t.length;r++)t[r]=parseInt(t[r]);return i=new Function.prototype.bind.apply(Date,[null].concat(t)),"Invalid Date"===i.toString()?(I("The timestamp appears to be invalid.","warning",!0),null):i};e.normalizeField=function(i){var n=i+1;if(null===e.view.dataField)return void console.warn("No data field is set");for(var t=parseInt(e.view.dataField)+1,a=function(e,i){return Math[i].apply(null,e)},o=[],r=[],s=0;s<l.length;s++)"number"==typeof l[s][t]&&"number"==typeof l[s][n]&&(o.push(l[s][t]),r.push(l[s][n]));for(var d=a(o,"max")-a(o,"min"),u=a(r,"max")-a(r,"min"),f=d/u,g=0;g<l.length;g++)l[g][n]=parseFloat((l[g][n]*f).toFixed(10));e.view.graph.updateOptions({file:l})},e.denormalizeField=function(i){for(var n=i+1,t=0;t<l.length;t++)l[t][n]=r[t][n];e.view.graph.updateOptions({file:l})},e.renormalize=function(){for(var i=0;i<e.view.fieldState.length;i++)e.view.fieldState[i].normalized&&e.normalizeField(e.view.fieldState[i].id)};var y=function(i,n){for(var t=0;t<e.view.fieldState.length;t++)if(e.view.fieldState[t].name===i){e.view.fieldState[t].value=n;break}},C=function(i){for(var n=0;n<i.length;n++)e.view.fieldState[n].color=i[n]},F=function(e,i){for(var n=e[0].split(","),a=Papa.parse(e[2],{dynamicTyping:!0,skipEmptyLines:!0,comments:"#"}).data[0],l=!0,o=0;o<a.length;o++)"number"==typeof a[o]?l=!1:("R"===a[o]||"r"===a[o])&&(f=o);l&&(console.log("Detected OPF/NuPIC file. "),t.HEADER_SKIPPED_ROWS=3),-1===n.indexOf(t.TIMESTAMP)?(I("No timestamp field was found, using iterations instead","info"),d=!0):l&&-1!==f&&(I("OPF file with resets not supported. Ignoring timestamp and using iterations instead.","info"),d=!0);var r=e[e.length-2];r=Papa.parse(r,{dynamicTyping:!0,skipEmptyLines:!0,comments:"#"});for(var s=[],u=0;u<n.length;u++){var g=r.data[0][u],p=n[u];"number"==typeof g&&-1===i.indexOf(p)&&s.push(p)}return-1===s.indexOf(t.TIMESTAMP)&&s.unshift(t.TIMESTAMP),s};e.toggleVisibility=function(i){e.view.graph.setVisibility(i.id,i.visible),i.visible||(i.value=null)},e.showHideAll=function(i){for(var n=0;n<e.view.fieldState.length;n++)e.view.fieldState[n].visible=i,e.view.graph.setVisibility(e.view.fieldState[n].id,i),i||(e.view.fieldState[n].value=null)};var P=function(){var i=document.getElementById("dataContainer");e.view.fieldState.length=0,e.view.dataField=null;for(var n=0,a=d,r=0;r<o.length;r++){var s=o[r];s===t.TIMESTAMP||a?a=!1:(e.view.fieldState.push({name:s,id:n,visible:!0,normalized:!1,value:null,color:"rgb(0,0,0)"}),n++)}e.view.graph=new Dygraph(i,l,{labels:o,labelsUTC:!1,showLabelsOnHighlight:!1,xlabel:"Time",ylabel:"Values",strokeWidth:1,pointClickCallback:function(e,i){timestamp=moment(i.xval),timestampString=timestamp.format("YYYY-MM-DD HH:mm:ss.SSS000"),window.prompt("Copy to clipboard: Ctrl+C, Enter",timestampString)},animatedZooms:!0,showRangeSelector:"RangeSelector"===t.ZOOM,highlightCallback:function(i,n,t,a,l){for(var o=0;o<t.length;o++)y(t[o].name,t[o].yval);e.$apply()},drawCallback:function(e,i){i&&C(e.getColors())}})};e.$on("$destroy",function(){angular.forEach(s,function(e){n.cancel(e)})})}]),angular.module("app").filter("bytes",function(){return function(e,i){if(isNaN(parseFloat(e))||!isFinite(e))return"-";"undefined"==typeof i&&(i=1);var n=["bytes","kB","MB","GB","TB","PB"],t=Math.floor(Math.log(e)/Math.log(1024));return(e/Math.pow(1024,Math.floor(t))).toFixed(i)+" "+n[t]}}),angular.module("app").directive("fileUploadChange",function(){return{restrict:"A",link:function(e,i,n){var t=e.$eval(n.fileUploadChange);i.on("change",t);var a=e.$on("fileUploadChange",function(){angular.element(i).val(null)});e.$on("$destroy",function(){i.off(),a()})}}}),angular.module("app").directive("normalizeFields",function(){return{restrict:"A",scope:!1,template:'<td><input type="checkbox" ng-disabled="field.id === view.dataField || view.dataField === null" ng-model="field.normalized"></td><td><input type="radio" ng-disabled="field.normalized" ng-model="view.dataField" ng-value="{{field.id}}"></td>',link:function(e,i,n){var t={};t.normalized=e.$watch("field.normalized",function(i,n){i?e.normalizeField(e.field.id):i||i===n||e.denormalizeField(e.field.id)}),t.isData=e.$watch("view.dataField",function(){e.renormalize()}),e.$on("$destroy",function(){angular.forEach(t,function(e){e()})})}}});