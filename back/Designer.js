define(['ojs/ojcore', 'knockout', 'jquery', 'appController',"ojs/ojoffcanvas", 'ojDesigner/ggGridLayout', "text!../ojDesigner/data.json",
    'ojs/ojasyncvalidator-regexp', 'ojs/ojconverterutils-i18n', 'ojs/ojconverter-datetime', 'ojs/ojconverter-number',
    "ojs/ojpagingdataproviderview", "ojs/ojarraydataprovider", "ojs/ojattributegrouphandler", "ojs/ojdiagram-utils", "ojs/ojkeyset",
    "ojs/ojknockout", "ojs/ojdiagram", 'ojs/ojdialog', 'ojs/ojradioset', 'ojs/ojswitch', 'ojs/ojcheckboxset', 'ojs/ojdatetimepicker', 'ojs/ojtrain',
    'ojs/ojlabel', 'ojs/ojbutton', 'ojs/ojlabelvalue', "ojs/ojavatar",
    'ojs/ojprogress-bar', "ojs/ojmenu", 'ojs/ojselectsingle', 'ojs/ojformlayout', 'ojs/ojselectcombobox', 'ojs/ojtable', 'ojs/ojinputtext',
    "ojs/ojpagingcontrol", 'ojs/ojvalidationgroup'],
    function (oj, ko, $, app,OffcanvasUtils, layout, jsonData, AsyncRegExpValidator, ConverterUtilsI18n, DateTimeConverter, NumberConverter, PagingDataProviderView, ArrayDataProvider, ojattributegrouphandler_1, ojdiagram_utils_1, ojkeyset_1) {
        class DesignerViewModel {
            constructor(args) {
                var self = this;
                self.DepName = args.routerState.detail.dep_url;
                self.SrcOnePDepName = ko.observable();
                self.TgtOnePDepName = ko.observable();
                self.isFormReadonly = ko.observable(false);
                self.pdbSelList = ko.observableArray([]);
                self.pdbRegList = ko.observableArray([]);
                self.dialogTitle = ko.observable();

                self.groupValid = ko.observable();

                self.ExtName = ko.observable();
                self.ExtDesc = ko.observable();
                self.PmpName = ko.observable();
                self.PmpDesc = ko.observable();

                self.CancelBehaviorOpt = ko.observable('icon');

                self.startExtChk = ko.observable(true);
                self.startRepChk = ko.observable(true);
                self.currentTrailType = ko.observable();
                self.SRCcurrentPDB = ko.observable();
                self.TGTcurrentPDB = ko.observable();
                self.ExtName = ko.observable();
                self.ExtDesc = ko.observable();
                self.RepName = ko.observable();
                self.RepDesc = ko.observable();
                self.rmtOnepPort = ko.observable();
                self.rmtTrailName = ko.observable();
                self.rmttrailSubDir = ko.observable();
                self.dbTgtDetList = ko.observableArray([]);
                self.onepDepList = ko.observableArray([]);

                self.schemaList = ko.observableArray([]);

                self.gatherMeta = ko.observable(false);


                self.CDBCheck = ko.observable();
                self.SRConepDepUrl = ko.observable();
                self.TGTonepDepUrl = ko.observable();

                self.repType = ko.observableArray([]);
                self.currentRepType = ko.observable('parallel');
                self.paramValue = ko.observable("text area value");
                self.currentPassThru = ko.observable('passthru');
                self.rmtHostName = ko.observable();
                self.rmtMgrPort = ko.observable(0);
                self.ButtonVal = ko.observable();
                self.PDBName = ko.observable();


                this.dndData = JSON.parse(jsonData);
                this.colorHandler = new ojattributegrouphandler_1.ColorAttributeGroupHandler();
                this.nodes1 = ko.observableArray(this.dndData.nodesA);
                this.nodes2 = ko.observableArray(this.dndData.nodesB);
                this.links2 = ko.observableArray(this.dndData.linksB);
                this.nodeDataProvider1 = new ArrayDataProvider(this.nodes1, {
                    keyAttributes: "id",
                });
                this.nodeDataProvider2 = new ArrayDataProvider(this.nodes2, {
                    keyAttributes: "id",
                });
                this.linkDataProvider2 = new ArrayDataProvider(this.links2, {
                    keyAttributes: "id",
                });

                this.getBaseColor = (anchor) => {
                    return anchor
                        ? this.colorHandler.getValue("1")
                        : this.colorHandler.getValue("0");
                };
                this.getColor = (anchor, state, isInverted, isOuterCircle) => {
                    let color = this.getBaseColor(anchor);
                    if (state && state.selected && isOuterCircle)
                        color = "red";
                    else if (state && state.hovered && !isOuterCircle)
                        color = "green";
                    if (isInverted) {
                        color = color === "blue" ? this.getBaseColor(anchor) : "white";
                    }
                    return color;
                };

                this.onDrop = (event, context, nodes, linkCleanUp) => {
                    const diagramData = event.dataTransfer.getData("text/nodes1") ||
                        event.dataTransfer.getData("text/nodes2");
                    let newNodeId;
                    // create new node
                    if (diagramData) {
                        const dataContext = JSON.parse(diagramData)[0];
                        //remove specific node from from it's current location
                        this.nodes1.remove((s) => {
                            return s.id === dataContext.id;
                        });
                        this.nodes2.remove((s) => {
                            return s.id === dataContext.id;
                        });
                        if (linkCleanUp)
                            this.links2.remove((s) => {
                                return s.start === dataContext.id || s.endNode === dataContext.id;
                            });
                        //add node to the target
                        dataContext.itemData.x = context.nodeContext
                            ? context.x + 100
                            : context.x;
                        dataContext.itemData.y = context.y;
                        newNodeId = dataContext.itemData.id;
                        nodes.push(dataContext.itemData);
                    }
                    if (context.nodeContext) {
                        const startNodeId = context.nodeContext.id;
                        this.links2.push({
                            id: "L" + startNodeId + "_" + newNodeId,
                            startNode: startNodeId,
                            endNode: newNodeId,
                        });
                    }
                    else if (context.linkContext) {
                        const linkId = context.linkContext.id, startNode = context.linkContext.data.startNode, endNode = context.linkContext.data.endNode;
                        this.links2.remove((s) => {
                            return s.id === linkId;
                        });
                        this.links2.push({
                            id: "L" + startNode + "_" + newNodeId,
                            startNode: startNode,
                            endNode: newNodeId,
                        });
                        this.links2.push({
                            id: "L" + newNodeId + "_" + endNode,
                            startNode: newNodeId,
                            endNode: endNode,
                        });
                    }
                };
                this.labelLayoutFunc = (layoutContext, node) => {
                    const nodeBounds = node["getContentBounds"]();
                    const nodePos = node["getPosition"]();
                    const labelLayout = {
                        x: nodeBounds.x + nodePos.x + 0.5 * nodeBounds.w,
                        y: nodeBounds.y + nodePos.y + 0.5 * nodeBounds.h,
                        halign: "center",
                        valign: "middle",
                    };
                    return labelLayout;
                };
                this.linkPathFunc = (layoutContext, link) => {
                    const node1 = layoutContext.getNodeById(link["getStartId"]());
                    const node2 = layoutContext.getNodeById(link["getEndId"]());
                    const n1Pos = node1.getPosition(), n2Pos = node2.getPosition();
                    const n1Bounds = node1.getBounds(), n2Bounds = node2.getBounds();
                    const startX = n1Pos.x + 0.5 * n1Bounds.w;
                    const startY = n1Pos.y + 0.5 * n1Bounds.h;
                    const endX = n2Pos.x + 0.5 * n2Bounds.w;
                    const endY = n2Pos.y + 0.5 * n2Bounds.h;
                    return [startX, startY, endX, endY].toString();
                };
                this.onDrop1 = (event, context) => {
                    this.onDrop(event, context, this.nodes1, true);
                };
                this.onDrop2 = (event, context) => {
                    this.onDrop(event, context, this.nodes2, false);
                };
                this.onLinkDrop = (event, context) => {
                    this.onDrop(event, context, this.nodes2, false);
                };
                this.gridLayout = layout.gridLayout();
                this.dropLayout = ko.pureComputed(() => {
                    return ojdiagram_utils_1.getLayout({
                        nodes: this.nodes2(),
                        links: this.links2(),
                        nodeDefaults: { labelLayout: this.labelLayoutFunc },
                        linkDefaults: { path: this.linkPathFunc },
                        viewport: (layoutContext) => {
                            if (layoutContext.getCurrentViewport()) {
                                return layoutContext.getCurrentViewport();
                            }
                            else
                                return layoutContext.getComponentSize();
                        },
                    });
                });


                self.selectedMenuItem = ko.observable("(None selected yet)");
                self.beforeOpenFunction = (event) => {
                    const target = event.detail.originalEvent.target;
                    const diagram = document.getElementById("diagram2");
                    const context = diagram.getContextByNode(target);
                    (self.node = null), (self.link = null);
                    if (context) {
                        if (context.subId == "oj-diagram-node") {
                            self.node = self.dndData.nodesB[context.index];
                            this.selectedMenuItem(self.node.id)
                        }
                        else if (context.subId == "oj-diagram-link") {
                            self.link = self.dndData.links[context.index];
                        }
                    }
                };
                self.menuItemAction = (event) => {
                    const text = event.target.textContent;
                    if (self.node) {
                        this.selectedMenuItem(self.node.id)
                        if (self.node.id == 'Source Deployment') {
                            getOnepDep();
                            document.querySelector('#SelectDeployment').open();
                        }
                        else if (this.selectedMenuItem() == 'Source CredentialStore') {
                            getSrcDomains();
                            document.querySelector('#SelectSrcCS').open();
                        }
                        else if (this.selectedMenuItem() == 'Target CredentialStore') {
                            getTgtDomains();
                            document.querySelector('#SelectTgtCS').open();
                        }
                        else if (this.selectedMenuItem() == 'Integrated Extract') {
                            self.currentExtType('Integrated Tranlog');
                            self.selectedStepValue("stp1");
                            self.selectedStepFormLabel('Extract Options');
                            self.dialogTitle('Add Integrated Extract')
                            document.querySelector('#AddExtract').open();
                        }
                        else if (this.selectedMenuItem() == 'Classic Extract') {
                            self.currentExtType('Tranlog');
                            self.selectedStepValue("stp1");
                            self.selectedStepFormLabel('Extract Options');
                            self.dialogTitle('Add Classic Extract')
                            document.querySelector('#AddExtract').open();
                        }
                        else if (this.selectedMenuItem() == 'Extract Pump') {
                            self.currentExtType('EXTTRAILSOURCE');
                            self.selectedStepValue("stp1");
                            self.selectedStepFormLabel('Extract Options');
                            self.dialogTitle('Add Extract Pump')
                            document.querySelector('#AddExtract').open();
                            getExtTrails();
                            self.ExtPrmList([]);
                        }
                        else if (this.selectedMenuItem() == 'Target Deployment') {
                            getOnepDep();
                            document.querySelector('#SelectDeployment').open();
                        }
                        else if (this.selectedMenuItem() == 'Classic Replicat') {
                            self.currentRepType('');
                            self.selectedStepValue("stp1");
                            self.selectedStepFormLabel('Replicat Options');
                            self.dialogTitle('Add Classic Replicat')
                            document.querySelector('#addReplicat').open();
                            getExtTrails();
                        }
                        else if (this.selectedMenuItem() == 'Parallel Replicat') {
                            self.currentRepType('PARALLEL');
                            self.selectedStepValue("stp1");
                            self.dialogTitle('Add Parallel Replicat')
                            document.querySelector('#addReplicat').open();
                            getExtTrails();
                        }
                        else if (this.selectedMenuItem() == 'Integrated Replicat') {
                            self.currentRepType('INTEGRATED');
                            self.selectedStepValue("stp1");
                            self.selectedStepFormLabel('Replicat Options');
                            self.dialogTitle('Add Integarted Replicat')
                            document.querySelector('#addReplicat').open();
                            getExtTrails();
                        }
                        else if (this.selectedMenuItem() == 'Parallel Integrated Replicat') {
                            self.currentRepType('PARALLEL INTEGRATED');
                            self.selectedStepValue("stp1");
                            self.selectedStepFormLabel('Replicat Options');
                            self.dialogTitle('Add Parallel Integarted Replicat')
                            document.querySelector('#addReplicat').open();
                            getExtTrails();
                        }


                    }
                    else if (this.link) {
                        this.selectedMenuItem(text + " from Link " + this.link.id);
                    }
                    else {
                        this.selectedMenuItem(text + " from diagram background");
                    }
                };


                self.onepDepList = ko.observableArray([]);
                self.SRConepDepUrl = ko.observable();

                function getOnepDep() {
                    self.onepDepList([]);
                    $.ajax({
                        url: self.DepName() + "/onepdep",
                        type: 'GET',
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            for (var i = 0; i < data[0].length; i++) {
                                self.onepDepList.push({ 'label': data[0][i].dep, value: data[0][i].dep });
                            }
                            self.onepDepList.valueHasMutated();
                            return self;
                        }

                    })
                }

                self.onepDepListDP = new ArrayDataProvider(self.onepDepList, { keyAttributes: 'value' });


                self.SelectSRCDeployment = (event, data) => {
                    self.SRConepDepUrl('');
                    $.ajax({
                        url: self.DepName() + "/onepdepurl",
                        type: 'POST',
                        data: JSON.stringify({
                            dep: self.SrcOnePDepName()
                        }),
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            self.SRConepDepUrl(data[0]);
                            self.trailSubDir(data[1]);
                            return self;
                        }
                    })

                };


                //SRC
                self.SRCusername1 = ko.observableArray([]);
                self.SRCaliasname1 = ko.observableArray([]);
                self.SRCdomname1 = ko.observableArray([]);
                self.SRCothdom = ko.observableArray([]);
                self.selectedSRCDomCategory = ko.observable();
                self.selectedSRCAliascategory = ko.observable();
                self.selectedSRCUsercategory = ko.observable();
                self.SRCaliascategories = ko.observableArray([]);
                self.SRCunamecategories = ko.observable();
                //TGT
                self.TGTusername1 = ko.observableArray([]);
                self.TGTaliasname1 = ko.observableArray([]);
                self.TGTdomname1 = ko.observableArray([]);
                self.TGTothdom = ko.observableArray([]);
                self.selectedTGTDomCategory = ko.observable();
                self.selectedTGTAliascategory = ko.observable();
                self.selectedTGTUsercategory = ko.observable();
                self.TGTaliascategories = ko.observableArray([]);
                self.TGTunamecategories = ko.observable();


                self.ChooseDepOkClose = function () {
                    var valid = self._checkValidationGroup("DeploymentGRP");
                    if (valid) {
                        document.querySelector('#SelectDeployment').close();
                    }
                }

                self.regExpValidator =
                    new AsyncRegExpValidator({
                        pattern: "[a-zA-Z0-9,.'-]{1,}",
                        hint: "1 or more letters",
                        messageDetail: "You must enter at least 1 letter"
                    });

                self.emailRegExpValidator =
                    new AsyncRegExpValidator({
                        pattern: ".+\@.+\..+",
                        hint: "email format",
                        messageDetail: "Invalid email format"
                    });


                self.ExtoptParam = ko.observableArray([]);
                self.PmpoptParam = ko.observableArray([])
                self.RepoptParam = ko.observableArray([]);

                self.startExtChk = ko.observable(true);

                self.currentTrailType = ko.observable('exttrail');


                self.paramValue = ko.observable("text area value");
                self.currentPassThru = ko.observable('passthru');

                self.isDDLChecked = ko.observable();

                self.isGetTruncChecked = ko.observable();
                self.isEncrytChecked = ko.observable();
                self.isNoUseSnapChecked = ko.observable();
                self.isExcludeTagChecked = ko.observable();
                self.isGetUpdBefChecked = ko.observable();
                self.Threads = ko.observable(1);


                self.LMDict = ko.observableArray([]);
                self.CaptureList = ko.observableArray([]);
                self.CaptureName = ko.observable(' ');
                self.CDBCheck = ko.observable();


                this.toggleOuter = () => {
                    return OffcanvasUtils.toggle(this.outerDrawer);
                };
                this.outerDrawer = {
                    displayMode: "push",
                    selector: "#oDrawer",
                    content: "#oMain",
                    autoDismiss: "none",
                };


                function queryDBLMDict() {
                    self.LMDict([]);
                    self.CaptureList([]);
                    $.ajax({
                        url: self.SRConepDepUrl() + "/lmdictdet",
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify({
                            dbname: self.SRCcurrentPDB()
                        }),
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            for (var i = 0; i < data[0].length; i++) {
                                self.CaptureList.push({ 'label': data[0][i].CLIENT_NAME, 'value': data[0][i].CLIENT_NAME });
                            }
                            for (var i = 0; i < data[1].length; i++) {
                                self.LMDict.push(data[1][i]);
                            }
                            return self;
                        }
                    })
                }

                self.DBLMDictDP = new ArrayDataProvider(self.LMDict, { keyAttributes: 'FIRST_CHANGE', textFilterAttributes: ['FIRST_CHANGE', 'FIRST_TIME'] });
                self.CaptureListDP = new ArrayDataProvider(self.CaptureList, { keyAttributes: 'value' });

                self.ExtPrmList = ko.observableArray([]);
                self.ExtTrailName = ko.observable();
                self.queryExtPrm = function (event, data) {

                  //  self.ExtPrmList([]);
                    self.ExtTrailName('');
                    $.ajax({
                        url: self.SRConepDepUrl() + "/gggetextprm",
                        type: 'POST',
                        dataType: 'json',
                        data: JSON.stringify({
                            currentextname: self.CurrentExtName()
                        }),
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {

                            for (var i = 0; i < self.ExtList().length; i++) {
                                if (self.ExtList()[i].value == self.CurrentExtName()) {
                                    self.ExtTrailName(self.ExtList()[i].children.value);
                                }
                            }
                            if (self.selectedMenuItem() == 'Classic Replicat'){
                            for (var j = 0; j < data[0].length; j++) {
                                if (data[0][j].search("TABLE") != "-1") {
                                    var temp = data[0][j].replace("TABLE", "MAP")
                                    var temp = temp.replace(";\n", ",")
                                    var temp1 = data[0][j].replace("TABLE", "TARGET")
                                    var new_temp = temp + temp1;
                                    data[0][j] = new_temp;
                                }

                            }
                        }
                            self.ExtPrmList(data[0]);
                            //self.ExtTrailName(data[1]);
                            return self;
                        }
                    })
                }
            



                self.lmDictSCN = ko.observable(' ');


                self.getItemText = function (itemContext) {
                    return itemContext.data.FIRST_CHANGE;
                };

                self.tableColumns = [
                    { "headerText": "SCN", "field": "FIRST_CHANGE", "template": "cellTemplate" },
                    { "headerText": "Time", "field": "FIRST_TIME", "template": "cellTemplate" }
                ];

                self.regVal = ko.observable('now');
                self.regOptions = [
                    { id: 'now', value: 'now', label: 'Now' },
                    { id: 'existscn', value: 'existscn', label: 'Existing Dictionary' }
                ];

                self.lmShareOpt = ko.observableArray([
                    { label: 'AUTOMATIC', value: 'AUTOMATIC' },
                    { label: 'NONE', value: 'NONE' },
                    { label: 'EXTRACT', value: 'EXTRACT' }
                ]);
                self.lmShareOptDP = new ArrayDataProvider(self.lmShareOpt, { keyAttributes: 'value' });

                self.currentShareOpt = ko.observable('NONE');


                self.PDBName = ko.observableArray([]);



                self.CurrentExtName = ko.observable();
                self.ExtList = ko.observableArray([]);

                function getExtTrails() {
                    self.CurrentExtName('');
                    self.ExtList([]);
                    $.ajax({
                        url: self.SRConepDepUrl() + "/gggetexttrail",
                        type: 'GET',
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            for (var i = 0; i < data[0].length; i++) {
                                self.ExtList.push({ 'label': data[0][i].label, 'value': data[0][i].label, 'children': { 'value': data[0][i].value } });
                            }
                            return self;
                        }
                    })
                }

                self.ExtListDP = new ArrayDataProvider(self.ExtList, { keyAttributes: 'value' });

                self.currentExtType = ko.observable();


                self.CEOPT = ko.observable('LR');
                self.regExtChk = ko.observable(true);


                self.isFormReadonly = ko.observable(false);




                self.categorySelectionChanged = (event) => {
                    self.selectedSubcategory('');
                    let sub = getSubcategories(event.detail.value);
                    self.subcategories(sub);
                };

                self.ctvalue = ko.observable(ConverterUtilsI18n.IntlConverterUtils.dateToLocalIso(new Date()));

                self.secondConverter = new DateTimeConverter.IntlDateTimeConverter(
                    {
                        pattern: "yyyy-MM-dd HH:mm:ss"
                    });
                self.csnvalue = ko.observable();

                self.decimalHalfDownConverter =
                    new NumberConverter.IntlNumberConverter({
                        style: 'decimal',
                        roundingMode: 'HALF_DOWN',
                        maximumFractionDigits: 0,
                        useGrouping: false
                    });


                self.ExtTrail = ko.observable();
                self.ExtTrailSize = ko.observable('500');

                self.modeVal = ko.observable("Integrated Tranlog");

                self.currentbeginmode = ko.observable('Begin Now');

                self.TrailName = ko.observable();
                self.trailSubDir = ko.observable();
                self.trailSubDirSlash = ko.observable('/');
                self.trailSize = ko.observable(500);

                self.beginmode = ko.observableArray([
                    { value: 'Begin Now', label: 'Now' },
                    { value: 'Begin ', label: 'Custom Time' },
                    { value: 'CSN', label: 'CSN' }
                ]);

                self.startOptionDP = new ArrayDataProvider(self.beginmode, { keyAttributes: 'value' });






                //Get the Credentail Alias Domains

                function getSrcDomains() {
                    if (self.SRConepDepUrl()) {
                        self.SRCusername1([]);
                        self.SRCothdom([]);
                        self.SRCaliasname1([]);
                        self.SRCdomname1([]);
                        $.ajax({
                            url: self.SRConepDepUrl() + "/ggcredstore",
                            type: 'GET',
                            dataType: 'json',
                            error: function (e) {
                            },
                            success: function (data) {

                                for (var i = 0; i < data[1].length; i++) {
                                    self.SRCothdom.push({ dom: data[1][i].value });
                                }

                                self.SRCaliasname1(data[4]);


                                for (var i = 0; i < data[2].length; i++) {
                                    self.SRCdomname1.push({ label: data[2][i], value: data[2][i] });
                                }

                                for (var i = 0; i < data[0].length; i++) {
                                    self.SRCusername1.push({ label: data[0][i].alias, value: data[0][i].alias, 'children': [{ label: data[0][i].uname, value: data[0][i].uname }] });
                                }
                                return self;
                            }
                        })
                    }
                }
                self.dbTgtDetList = ko.observableArray([]);


                self.SelectTGTDeployment = (event, data) => {
                    self.TGTonepDepUrl('');
                    $.ajax({
                        url: self.DepName() + "/onepdepurl",
                        type: 'POST',
                        data: JSON.stringify({
                            dep: self.TgtOnePDepName()
                        }),
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            self.TGTonepDepUrl(data[0]);
                            getRmtHost();
                            return self;
                        }
                    })
                };

                function getRmtHost(data, event) {
                    if (self.TGTonepDepUrl()) {
                        self.rmtHostName('');
                        self.rmtMgrPort();
                        self.rmttrailSubDir('');
                        $.ajax({
                            url: self.TGTonepDepUrl() + "/gginfoall",
                            type: 'GET',
                            dataType: 'json',
                            context: self,
                            error: function (e) {
                            },
                            success: function (data) {
                                self.rmtHostName(self.TGTonepDepUrl().split(':')[1].replace("//", ''));
                                for (var i = 0; i < data[0].length; i++) {
                                    self.rmtMgrPort(data[0][i].mgrport);
                                }
                                self.rmttrailSubDir(data[1])
                                return self;

                            }
                        })
                    }
                }


                function getTgtDomains(data, event) {
                    if (self.TGTonepDepUrl()) {
                        self.TGTusername1([]);
                        self.TGTothdom([]);
                        self.TGTaliasname1([]);
                        self.TGTdomname1([]);
                        $.ajax({
                            url: self.TGTonepDepUrl() + "/ggcredstore",
                            type: 'GET',
                            dataType: 'json',
                            error: function (e) {
                            },
                            success: function (data) {

                                for (var i = 0; i < data[1].length; i++) {
                                    self.TGTothdom.push({ dom: data[1][i].value });
                                }

                                self.TGTaliasname1(data[4]);


                                for (var i = 0; i < data[2].length; i++) {
                                    self.TGTdomname1.push({ label: data[2][i], value: data[2][i] });
                                }

                                for (var i = 0; i < data[0].length; i++) {
                                    self.TGTusername1.push({ label: data[0][i].alias, value: data[0][i].alias, 'children': [{ label: data[0][i].uname, value: data[0][i].uname }] });
                                }

                                return self;
                            }
                        })

                    }
                }

                self.replicatDP = new ArrayDataProvider(self.repType, { keyAttributes: 'value' });


                //SRC
                let SRCgetAliascategories = (category) => {
                    let found = self.SRCaliasname1().find(c => c.value === category);
                    return found ? found.children : null;
                };
                let SRCgetUnamecategories = (category) => {
                    let found = self.SRCusername1().find(c => c.value === category);
                    return found ? found.children : null;
                };
                self.SRCdomSelectionChanged = (event) => {
                    self.selectedSRCAliascategory('');
                    let children = SRCgetAliascategories(event.detail.value);
                    self.SRCaliascategories(children);
                    self.schemaList([]);
                    self.PDBName();
                };


                self.SRCaliasSelectionChanged = (event) => {
                    self.selectedSRCUsercategory('');
                    let children = SRCgetUnamecategories(event.detail.value);
                    self.SRCunamecategories(children);
                };


                //TGT
                let TGTgetAliascategories = (category) => {
                    let found = self.TGTaliasname1().find(c => c.value === category);
                    return found ? found.children : null;
                };
                let TGTgetUnamecategories = (category) => {
                    let found = self.TGTusername1().find(c => c.value === category);
                    return found ? found.children : null;
                };
                self.TGTdomSelectionChanged = (event) => {
                    self.selectedTGTAliascategory('');
                    let children = TGTgetAliascategories(event.detail.value);
                    self.TGTaliascategories(children);
                };


                self.TGTaliasSelectionChanged = (event) => {
                    self.selectedTGTUsercategory('');
                    let children = TGTgetUnamecategories(event.detail.value);
                    self.TGTunamecategories(children);
                };


                self.isRequired = ko.observable(true);
                self.checkboxValues = ko.observableArray(['required', 'helpSource', 'helpDef']);

                self.isRequired = ko.computed(function () {
                    return self.checkboxValues.indexOf('required') !== -1;
                });
                self.helpDef = ko.computed(function () {
                    return (self.checkboxValues.indexOf('helpDef') !== -1) ? self._HELP_DEF : null;
                });
                self.helpSource = ko.computed(function () {
                    return (self.checkboxValues.indexOf('helpSource') !== -1) ? self._HELP_SOURCE : null;
                });

                self.PDBNameList = ko.observableArray([]);
                self.schemaNameList = ko.observableArray([]);
                self.dbDetList = ko.observableArray([]);

                self.CDBData = function (data, event) {
                    self.CDBCheck('');
                    self.PDBNameList([]);
                    self.dbDetList([]);
                    self.schemaNameList([]);
                    self.schemaList([]);
                    self.PDBName('');
                    document.querySelector('#SelectSchemaDialog').open();
                    if (self.selectedMenuItem() == 'Source CredentialStore') {
                        var url = self.SRConepDepUrl();
                        var dbname = self.SRCcurrentPDB();
                    } else {
                        var url = self.TGTonepDepUrl();
                        var dbname = self.TGTcurrentPDB();
                    }
                    $.ajax({
                        url: url + "/cdbcheck",
                        type: 'POST',
                        data: JSON.stringify({
                            dbname: dbname
                        }),
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            self.CDBCheck(data[0]);
                            for (var i = 0; i < data[1].length; i++) {
                                self.PDBNameList.push({ 'label': data[1][i].NAME, 'value': data[1][i].NAME });
                            }
                            self.PDBNameList.valueHasMutated();
                            for (var i = 0; i < data[2].length; i++) {
                                self.schemaNameList.push({ 'label': data[2][i].USERNAME, 'value': data[2][i].USERNAME });
                            }
                            self.schemaNameList.valueHasMutated();
                            for (var i = 0; i < data[3].length; i++) {
                                self.dbDetList.push({ 'dbid': data[3][i].DBID, 'dbname': data[3][i].DBNAME, 'pdbname': data[3][i].PDBNAME, 'platform': data[3][i].PLATFORM_NAME, 'host': data[3][i].HOST, 'version': data[3][i].VERSION, 'dbedition': data[3][i].DB_EDITION, 'db_role': data[3][i].DATABASE_ROLE, 'current_scn': data[3][i].CURRENT_SCN, 'cdb': data[3][i].CDB });
                            }
                            self.dbDetList.valueHasMutated();
                            document.querySelector('#SelectSchemaDialog').close();
                            return self;

                        }

                    })
                }

                self.PDBNameListDP = new ArrayDataProvider(self.PDBNameList, { keyAttributes: 'value' });
                self.schemaNameListDP = new ArrayDataProvider(self.schemaNameList, { keyAttributes: 'value' });

                self.schemaNameCDBList = ko.observableArray([]);

                self.SRCDBSchema = function (data, event) {
                    document.querySelector('#SelectSchemaDialog').open();
                    self.schemaNameCDBList([]);
                    $.ajax({
                        url: self.SRConepDepUrl() + "/supplogschema",
                        type: 'POST',
                        data: JSON.stringify({
                            dbname: self.SRCcurrentPDB(),
                            cdbCheck: self.CDBCheck(),
                            pdbName: self.PDBName()
                        }),
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            for (var i = 0; i < data[0].length; i++) {
                                self.schemaNameCDBList.push({ 'label': data[0][i].USERNAME, 'value': data[0][i].USERNAME });
                            }
                            self.schemaNameCDBList.valueHasMutated();
                            document.querySelector('#SelectSchemaDialog').close();
                            return self;

                        }

                    })
                }

                self.schemaNameCDBListDP = new ArrayDataProvider(self.schemaNameCDBList, { keyAttributes: 'value' });
                self.dbDetListDP = new ArrayDataProvider(self.dbDetList, { keyAttributes: 'dbid' });

                self.dbVer = ko.observable(0);
                self.DBTgtSchema = function (data, event) {
                    document.querySelector('#SelectSchemaDialog').open();
                    self.trailSubDir('');
                    self.dbTgtDetList([]);
                    self.dbVer('');
                    $.ajax({
                        url: self.TGTonepDepUrl() + "/cdbcheck",
                        type: 'POST',
                        data: JSON.stringify({
                            dbname: self.TGTcurrentPDB()
                        }),
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            for (var i = 0; i < data[3].length; i++) {
                                self.dbTgtDetList.push({ 'dbid': data[3][i].DBID, 'dbname': data[3][i].DBNAME, 'pdbname': data[3][i].PDBNAME, 'platform': data[3][i].PLATFORM_NAME, 'host': data[3][i].HOST, 'version': data[3][i].VERSION, 'dbedition': data[3][i].DB_EDITION, 'db_role': data[3][i].DATABASE_ROLE, 'current_scn': data[3][i].CURRENT_SCN, 'cdb': data[3][i].CDB });
                                self.dbVer(data[3][i].VERSION);
                            }
                            self.dbTgtDetList.valueHasMutated();
                            self.trailSubDir(data[4] + '/dirdat');
                            document.querySelector('#SelectSchemaDialog').close();
                            queryChkTbl();
                            return self;

                        }

                    })
                }

                function getGGVersion() {
                    self.repType([]);
                    $.ajax({
                        url: self.TGTonepDepUrl() + "/ggversion",
                        type: 'GET',
                        dataType: 'json',
                        error: function (e) {
                        },
                        success: function (data) {
                            if ((data[1] == '211' || data[1] == '191' || data[1] == '181' || data[1] == '123') && self.dbVer().split('.')[0] > 11) {
                                self.repType.push(
                                    { label: 'Parallel Replicat', value: 'parallel' },
                                    { label: 'Integrated Replicat', value: 'integrated' },
                                    { label: 'Classic Replicat', value: '' },
                                    { label: 'Coordinated Replicat', value: 'coordinated' },
                                    { label: 'Parallel Integrated Replicat', value: 'parallelIR' }
                                );
                            } else if ((data[1] == '211' || data[1] == '191' || data[1] == '181' || data[1] == '123') && self.dbVer().split('.')[0] == 11) {
                                self.repType.push(
                                    { label: 'Parallel Replicat', value: 'parallel' },
                                    { label: 'Classic Replicat', value: '' },
                                    { label: 'Coordinated Replicat', value: 'coordinated' },

                                );
                            } else if (data[1] <= '122' && self.dbVer().split('.')[0] == '11') {
                                self.repType.push(
                                    { label: 'Classic Replicat', value: '' },
                                    { label: 'Coordinated Replicat', value: 'coordinated' }
                                );
                            }
                            return self;
                        }
                    })

                }


                self.dbTgtDetListDP = new ArrayDataProvider(self.dbTgtDetList, { keyAttributes: 'dbid' });





                self.tableNameList = ko.observableArray([]);

                self.SrcDBSchemaFetch = function (data, event) {
                    document.querySelector('#SelectSchemaDialog').open();
                    self.tableNameList([]);
                    $.ajax({
                        url: self.SRConepDepUrl() + "/tablelist",
                        type: 'POST',
                        data: JSON.stringify({
                            dbname: self.SRCcurrentPDB(),
                            schemaList: self.schemaList(),
                            cdbCheck: self.CDBCheck(),
                            pdbName: self.PDBName(),
                            gatherMeta: self.gatherMeta()
                        }),
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            document.querySelector('#SelectSchemaDialog').close();

                            document.querySelector('#TABLEExclude').open();
                            for (var i = 0; i < data[0].length; i++) {
                                self.tableNameList.push({ 'TABLE_NAME': data[0][i].owner + '.' + data[0][i].table_name, 'ROWCNT': data[0][i].num_rows, 'AVGSPC': data[0][i].avg_space, 'ANALYZETIME': data[0][i].last_analyzed });
                            }
                            self.tableNameList.valueHasMutated();
                            self.trailSubDir(data[1] + '/dirdat');
                            if (self.currentExtType() != 'EXTTRAILSOURCE' && self.currentExtType() == 'Integrated Tranlog') {
                                queryDBLMDict();
                            }
                            document.querySelector('#SelectSchemaDialog').close();
                            return self;
                        }

                    })
                }

                self.tableNameListDP = new PagingDataProviderView(new ArrayDataProvider(self.tableNameList, { idAttribute: 'TABLE_NAME' }));


                self.ChooseExcludeOkClose = function () {
                    document.querySelector('#TABLEExclude').close();
                }

                self.ChooseCredOkClose = function () {

                    if (self.selectedMenuItem() == 'Source CredentialStore') {
                        var valid = self._checkValidationGroup("SelectSrcCSGRP");
                    }
                    else if (self.selectedMenuItem() == 'Target CredentialStore') {
                        var valid = self._checkValidationGroup("SelectTgtCSGRP");
                    }

                    if (valid) {
                        if (self.selectedMenuItem() == 'Source CredentialStore') {
                            document.querySelector('#SelectSrcCS').close();
                        }
                        else if (self.selectedMenuItem() == 'Target CredentialStore') {
                            document.querySelector('#SelectTgtCS').close();
                        }
                    }
                }

                //vallidation start

                self._checkValidationGroup = (value) => {
                         var tracker = document.getElementById(value);
                    if (tracker.valid === "valid") {
                        return true;
                    }
                    else {

                        tracker.showMessages();
                        tracker.focusOn("@firstInvalidShown");
                        return false;
                    }
                };

                this.validate = (event) => {
                    if (self.selectedMenuItem() == 'Integrated Extract' || self.selectedMenuItem() == 'Extract Pump' || self.selectedMenuItem() == 'Classic Extract') {
                           var valid = self._checkValidationGroup("AddExtractGRP");
                    } else {
                        // //console.log(222)
                        // var valid = self._checkValidationGroup("addReplicatGRP");
                    }
                    //var valid = self._checkValidationGroup("addReplicatGRP");
                    if (valid) {

                        return true;
                    }
                    else {
                        //The ojBeforeSelect can be cancelled by calling event.preventDefault().
                        event.preventDefault();
                        return;
                    }
                }



                self._checkValidationGroup1 = (value) => {
                    ////console.log(value)
                    var tracker = document.getElementById(value);
                    ////console.log(tracker.valid)
                    if (tracker.valid === "valid") {
                        return true;
                    }
                    else {

                        tracker.showMessages();
                        tracker.focusOn("@firstInvalidShown");
                        return false;
                    }
                };


                this.validate1 = (event) => {
                    if (self.selectedMenuItem() == 'Classic Replicat') {
                        var valid = self._checkValidationGroup1("addReplicatGRP");

                    }
                    
                 //var valid = self._checkValidationGroup("addReplicatGRP");
                    if (valid) {

                        return true;
                    }
                    else {
                        //The ojBeforeSelect can be cancelled by calling event.preventDefault().
                        event.preventDefault();
                        return;
                    }
                }

                //end

                self.tableListcolumnArray = [
                    {
                        headerText: 'Schema.Table Name',
                        field: 'TABLE_NAME'
                    },
                    {
                        headerText: 'Row Count',
                        field: 'ROWCNT'
                    },
                    {
                        headerText: 'Average Size(MB)',
                        field: 'AVGSPC'
                    },
                    {
                        headerText: 'Analyze Time',
                        field: 'ANALYZETIME'
                    }]

                self.dbDetcolumnArray = [{
                    headerText: 'DB Name',
                    field: 'dbname'
                },
                {
                    headerText: 'PDB Name',
                    field: 'pdbname'
                },
                {
                    headerText: 'Platform',
                    field: 'platform'
                },
                {
                    headerText: 'Host',
                    field: 'host'
                },
                {
                    headerText: 'Version',
                    field: 'version'
                },
                {
                    headerText: 'DB Edition',
                    field: 'dbedition'
                },
                {
                    headerText: 'DB Role',
                    field: 'db_role'
                },
                {
                    headerText: 'Current SCN',
                    field: 'current_scn'
                },
                {
                    headerText: 'CDB',
                    field: 'cdb'
                },
                ]

                self.valueChangedHandler = (event) => {
                    self.ButtonVal(false);
                };
                self.selectionInfo = ko.observable("");

                this.selectedItems = ko.observable({
                    row: new ojkeyset_1.KeySetImpl(),
                    column: new ojkeyset_1.KeySetImpl(),
                });

                this.selectedSelectionMode = ko.observable({
                    row: "multiple",
                    column: "none",
                });
                this.selectionModes = [
                    { value: { row: "none", column: "single" }, label: "Single Column" },
                    { value: { row: "none", column: "multiple" }, label: "Multiple Column" },
                    { value: { row: "single", column: "none" }, label: "Single Row" },
                    { value: { row: "multiple", column: "none" }, label: "Multiple Row" },
                ];
                this.selectionModeDP = new ArrayDataProvider(this.selectionModes, {
                    keyAttributes: "value",
                });

                this.selectedChangedListener = (event) => {
                    let selectionText = "";
                    if (event.detail.value.row.isAddAll()) {
                        const iterator = event.detail.value.row.deletedValues();
                        iterator.forEach(function (key) {
                            selectionText =
                                selectionText.length === 0 ? `${key}` : `${selectionText}, ${key}`;
                        });
                        if (iterator.size > 0) {
                            selectionText = " except " + selectionText;
                        }
                        selectionText = '' + selectionText;
                    }
                    else {
                        const row = event.detail.value.row;
                        const column = event.detail.value.column;
                        if (row.values().size > 0) {
                            row.values().forEach(function (key) {
                                selectionText += selectionText.length === 0 ? key : ", " + key;
                            });
                            selectionText = '' + selectionText;
                        }
                        if (column.values().size > 0) {
                            column.values().forEach(function (key) {
                                selectionText += selectionText.length === 0 ? key : ", " + key;
                            });
                            selectionText = "Column Selection:\nColumn Keys: " + selectionText;
                        }
                    }
                    this.selectionInfo(selectionText);
                };
                this.selectedSelectionMode.subscribe((newValue) => {
                    // Reset selected Items on selection mode change.
                    this.selectedItems({ row: new ojkeyset_1.KeySetImpl(), column: new ojkeyset_1.KeySetImpl() });
                });


                self.selectedStepValue = ko.observable('stp1');
                self.selectedStepLabel = ko.observable('Extract Options');
                self.selectedStepFormLabel = ko.observable('Extract Options');

                self.stepArray =
                    ko.observableArray([
                        { label: 'Extract Options', id: 'stp1' },
                        { label: 'Parameter File', id: 'stp2' }
                    ]);
                self.stepRepArray =
                    ko.observableArray([
                        { label: 'Replicat Options', id: 'stp1' },
                        { label: 'Parameter File', id: 'stp2' }
                    ]);


                self.previousStep = function () {
                    var train = document.getElementById('train');
                    var prev = train.getPreviousSelectableStep();
                    if (prev != null) {
                        self.selectedStepValue(prev);
                        self.selectedStepLabel(train.getStep(prev).label);
                        self.selectedStepFormLabel(train.getStep(prev).label);
                    }
                };

                self.nextStep = function (event) {
                    var train = document.getElementById('train');
                    var next = train.getNextSelectableStep();
                    if (self.selectedMenuItem() == 'Integrated Extract' || self.selectedMenuItem() == 'Extract Pump' || self.selectedMenuItem() == 'Classic Extract') {
                        var valid = self._checkValidationGroup("addExtractGRP");
                    } else {
                        //var valid = self._checkValidationGroup("addReplicatGRP");
                    }

                    if (valid) {
                        //The previous step will have a confirmation message type icon
                        self.selectedStepLabel.messageType = 'confirmation';
                        document.getElementById("train").updateStep(self.selectedStepValue, self.selectedStepValue);
                        //Now the clicked step could be selected
                        self.selectedStepValue(next);
                        self.selectedStepLabel(train.getStep(next).label);
                        self.selectedStepFormLabel(train.getStep(next).label);
                        return;
                    } else {
                        //The ojBeforeSelect can be cancelled by calling event.preventDefault().
                        event.preventDefault();
                        //The previous step will have an error message type icon
                        self.selectedStepLabel.messageType = 'error';
                        document.getElementById("train").updateStep(self.selectedStepLabel.id, self.selectedStepLabel);
                        return;
                    }
                };

                self.updateLabelText = function (event) {
                    if (self.selectedStepValue() == "stp1") {
                        self.selectedStepFormLabel('Extract Options');
                        self.isFormReadonly(false);
                    } else if (self.selectedStepValue() == "stp2") {
                        self.selectedStepFormLabel('Parameter File');
                        self.isFormReadonly(false);
                    }
                };




                //duplicate validation for replicate

                self.previousStep1 = function () {
                    var train = document.getElementById('repTrain');
                    var prev = train.getPreviousSelectableStep();
                    if (prev != null) {
                        self.selectedStepValue(prev);
                        self.selectedStepLabel(train.getStep(prev).label);
                        self.selectedStepFormLabel(train.getStep(prev).label);
                    }
                };

                self.nextStep1 = function (event) {
                    var train = document.getElementById('repTrain');
                    var next = train.getNextSelectableStep();
                    var valid = self._checkValidationGroup1("addReplicatGRP");

                    if (valid) {
                        //The previous step will have a confirmation message type icon
                        self.selectedStepLabel.messageType = 'confirmation';
                        document.getElementById("repTrain").updateStep(self.selectedStepValue, self.selectedStepValue);
                        //Now the clicked step could be selected
                        self.selectedStepValue(next);
                        self.selectedStepLabel(train.getStep(next).label);
                        self.selectedStepFormLabel(train.getStep(next).label);
                        return;
                    } else {
                        //The ojBeforeSelect can be cancelled by calling event.preventDefault().
                        event.preventDefault();
                        //The previous step will have an error message type icon
                        self.selectedStepLabel.messageType = 'error';
                        document.getElementById("repTrain").updateStep(self.selectedStepLabel.id, self.selectedStepLabel);
                        return;
                    }
                };

                self.updateRepLabelText = function (event) {
                    if (self.selectedStepValue() == "stp1") {
                        self.selectedStepFormLabel('Replicat Options');
                        self.isFormReadonly(false);
                    } else if (self.selectedStepValue() == "stp2") {
                        self.selectedStepFormLabel('Parameter File');
                        self.isFormReadonly(false);
                    }
                };


                self.newExtParamList = ko.observable('');
                self.newPmpParamList = ko.observable('');
                self.newRepParamList = ko.observable('');


                self.currentExtOptParamList = ko.computed(function () {
                    var currentExtOptParamList = '';
                    if (self.ExtoptParam()) {
                        for (var i = 0; i < self.ExtoptParam().length; i++) {
                            currentExtOptParamList = currentExtOptParamList + self.ExtoptParam()[i] + '\n'
                        }
                        return currentExtOptParamList;
                    }
                    else {
                        return '';
                    }
                });



                self.currentSchemaParam = ko.computed({
                    read: function () {
                        var currentSchemaParam = '';
                        if (self.CDBCheck() == 'YES' && self.PDBName().length > 0) {
                            var currentSchemaParam = 'SOURCECATALOG ' + self.PDBName() + '\n';
                            if (self.selectionInfo().length > 0) {
                                let selectedData = self.selectionInfo().split(",");
                                for (var i = 0; i < selectedData.length; i++) {
                                    currentSchemaParam = currentSchemaParam + 'TABLEEXCLUDE ' + selectedData[i] + '\n';
                                }
                            }
                        }
                        else {
                            if (self.selectionInfo().length > 0) {
                                let selectedData = self.selectionInfo().split(",");
                                for (var i = 0; i < selectedData.length; i++) {
                                    currentSchemaParam = currentSchemaParam + 'TABLEEXCLUDE ' + selectedData[i] + '\n';
                                }
                            }

                        }
                        return currentSchemaParam;

                    }
                });

                self.ExtSchemaParam = ko.computed({
                    read: function () {
                        var ExtSchemaParam = '';
                        if (self.CDBCheck() == 'YES' && self.PDBName().length > 0) {
                            for (var i = 0; i < self.schemaList().length; i++) {
                                ExtSchemaParam = ExtSchemaParam + 'TABLE ' + self.schemaList()[i] + ".* ;" + '\n';
                            }
                        }
                        else {
                            for (var i = 0; i < self.schemaList().length; i++) {
                                ExtSchemaParam = ExtSchemaParam + 'TABLE ' + self.schemaList()[i] + ".*;" + '\n';
                            }
                        }
                        return ExtSchemaParam;

                    }
                });

                self.SrcExtTrail = ko.computed({
                    read: function () {
                        if (self.ExtName()) {
                            var SrcExtTrail = self.trailSubDir() + self.trailSubDirSlash() + self.TrailName();
                        }
                        else {
                            var SrcExtTrail = self.ExtTrailName();
                        }

                        return SrcExtTrail;
                    }
                });


                self.SrcRmtTrail = ko.computed({
                    read: function () {
                        if (self.PmpName()) {
                            var SrcRmtTrail = self.rmttrailSubDir() + self.trailSubDirSlash() + self.rmtTrailName();
                        }
                        else if (self.ExtName()) {
                            var SrcRmtTrail = self.trailSubDir() + self.trailSubDirSlash() + self.TrailName();
                        }
                        else {
                            var SrcRmtTrail = self.ExtTrailName();
                        }
                        return SrcRmtTrail;
                    }
                });


                self.rmthostParam = ko.computed({
                    read: function () {
                        var rmthostParam = '';
                        if (self.currentTrailType() == 'exttrail') {
                            var rmthostParam = 'exttrail ' + self.SrcExtTrail() + '\n'
                        }
                        else if (self.currentTrailType() == 'rmttrail' || self.currentExtType() === 'Pump') {
                            var rmthostParam = 'RMTHOST ' + self.rmtHostName() + ',MGRPORT ' + self.rmtMgrPort() + ' , TCPBUFSIZE  4194304,TCPFLUSHBYTES 4194304,ENCRYPT AES256' + '\n' + 'ENCRYPTTRAIL' + '\n' + 'rmttrail ' + self.trailSubDir() + self.trailSubDirSlash() + self.TrailName() + '\n';
                        }

                        return rmthostParam;
                    }
                });


                self.currentExtParam = ko.computed({
                    read: function () {
                        var currentExtParam = 'EXTRACT ' + self.ExtName() + '\n' + 'useridalias ' + self.SRCcurrentPDB() + ' domain ' + self.selectedSRCDomCategory() + '\n' + self.rmthostParam() + '\n' + 'REPORTCOUNT EVERY 5 MINUTES, RATE' + '\n' + self.currentExtOptParamList() + '\n' + self.currentSchemaParam() + self.ExtSchemaParam();
                        return currentExtParam;
                    }
                });


                self.AddExtractMsg = ko.observableArray([]);

                self.addIE = function (data, event) {
                    self.AddExtractMsg([]);
                    document.querySelector('#CreateExtractDialog').open();
                    $.ajax({
                        url: self.SRConepDepUrl() + "/ggaddie",
                        type: 'POST',
                        data: JSON.stringify({
                            regExtChk: self.regExtChk(),
                            regVal: self.regVal(),
                            lmDictSCN: self.lmDictSCN(),
                            currentShareOpt: self.currentShareOpt(),
                            CaptureName: self.CaptureName(),
                            extname: self.ExtName(),
                            extdesc: self.ExtDesc(),
                            domain: self.selectedSRCDomCategory(),
                            alias: self.SRCcurrentPDB(),
                            mode: self.currentExtType(),
                            beginmode: self.currentbeginmode(),
                            trailtype: self.currentTrailType(),
                            trailsubdir: self.trailSubDir(),
                            trailsubdirslash: self.trailSubDirSlash(),
                            trail: self.TrailName(),
                            trailsize: self.trailSize(),
                            currentExtParamList: self.newExtParamList(),
                            startExtChk: self.startExtChk(),
                            CDBCheck: self.CDBCheck(),
                            PDBName: self.PDBName(),
                            pdbSelList: self.pdbRegList()
                        }),
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            document.querySelector('#CreateExtractDialog').close();
                            document.querySelector('#AddExtractDialog').open();
                            self.AddExtractMsg(data[0]);
                            return self;
                        }

                    })
                }



                self.addCE = function (data, event) {
                    self.AddExtractMsg([]);
                    document.querySelector('#CreateExtractDialog').open();
                    $.ajax({
                        url: self.SRConepDepUrl() + "/ggaddce",
                        type: 'POST',
                        data: JSON.stringify({
                            extname: self.ExtName(),
                            extdesc: self.ExtDesc(),
                            domain: self.selectedSRCDomCategory(),
                            alias: self.SRCcurrentPDB(),
                            mode: self.currentExtType(),
                            threads: self.Threads(),
                            beginmode: self.currentbeginmode(),
                            trailtype: self.currentTrailType(),
                            trailsubdir: self.trailSubDir(),
                            trailsubdirslash: self.trailSubDirSlash(),
                            trail: self.TrailName(),
                            trailsize: self.trailSize(),
                            currentExtParamList: self.newparamList(),
                            startExtChk: self.startExtChk(),
                            regExtChk: self.regExtChk()
                        }),
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            document.querySelector('#CreateExtractDialog').close();
                            self.AddExtractMsg(data[0]);
                            document.querySelector('#AddExtractDialog').open();
                            return self;
                        }

                    })
                }
                self.ExtPrmList1 = ko.computed(function () {
                    if (self.ExtPrmList()) {
                        return self.ExtPrmList().join('');
                    }
                    else {
                        return '';

                    }
                });

                self.currentPmpOptParamList = ko.computed(function () {
                    var currentPmpOptParamList = '';
                    if (self.PmpoptParam()) {
                        for (var i = 0; i < self.PmpoptParam().length; i++) {
                            currentPmpOptParamList = currentPmpOptParamList + self.PmpoptParam()[i] + '\n'
                        }
                        return currentPmpOptParamList;
                    }
                    else {
                        return '';
                    }
                });

                self.currentPmpParam = ko.computed({
                    read: function () {
                        if (self.ExtName()) {
                            var currentPmpParam = 'EXTRACT ' + self.PmpName() + '\n' + 'RMTHOST ' + self.rmtHostName() + ',MGRPORT ' + self.rmtMgrPort() + ' ' + self.currentPmpOptParamList() + '\n' + 'rmttrail' + '  ' + self.rmttrailSubDir() + '/' + self.rmtTrailName() + '\n' + 'REPORTCOUNT EVERY 5 MINUTES, RATE' + '\n' + self.currentSchemaParam() + '\n' + self.ExtSchemaParam() + '\n';
                        }
                        else {
                            var currentPmpParam = 'EXTRACT ' + self.PmpName() + '\n' + 'RMTHOST ' + self.rmtHostName() + ',MGRPORT ' + self.rmtMgrPort() + ' ' + self.currentPmpOptParamList() + '\n' + 'rmttrail' + '  ' + self.rmttrailSubDir() + '/' + self.rmtTrailName() + '\n' + 'REPORTCOUNT EVERY 5 MINUTES, RATE' + '\n' + self.ExtPrmList1();
                        }
                        return currentPmpParam;
                    }
                });

                self.addPumpPT = function (data, event) {
                    self.AddExtractMsg([]);
                    document.querySelector('#CreateExtractDialog').open();
                    $.ajax({
                        url: self.SRConepDepUrl() + "/ggaddpumppt",
                        type: 'POST',
                        data: JSON.stringify({
                            extname: self.PmpName(),
                            extdesc: self.PmpDesc(),
                            mode: self.currentExtType(),
                            srcTrail: self.SrcExtTrail(),
                            beginmode: self.currentbeginmode(),
                            trail: self.SrcRmtTrail(),
                            trailsize: self.trailSize(),
                            currentPmpParamList: self.newPmpParamList(),
                            startPmpChk: self.startExtChk()
                        }),
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            document.querySelector('#CreateExtractDialog').close();
                            self.AddExtractMsg(data[0]);
                            document.querySelector('#AddExtractDialog').open();
                            return self;
                        }

                    })
                }

                self.currentRepOptParamList = ko.computed(function () {
                    var currentRepOptParamList = '';
                    if (self.RepoptParam()) {
                        for (var i = 0; i < self.RepoptParam().length; i++) {
                            currentRepOptParamList = currentRepOptParamList + self.RepoptParam()[i] + '\n'
                        }
                        return currentRepOptParamList;
                    }
                    else {
                        return '';
                    }
                });

                self.currentRepParam = ko.observable();

                self.newparamList = ko.observable('');


                self.RepSchemaParam = ko.computed({
                    read: function () {
                        var RepSchemaParam = '';
                        for (var i = 0; i < self.schemaList().length; i++) {
                            RepSchemaParam = RepSchemaParam + 'MAP ' + self.schemaList()[i] + ".* , TARGET " + self.schemaList()[i] + ".*;" + '\n';
                        }
                        return RepSchemaParam;

                    }
                });

                self.currentRepParamList = ko.computed({
                    read: function () {
                        if (self.ExtName() && !self.PmpName()) {
                            var currentRepParam = 'REPLICAT ' + self.RepName() + '\n' + 'useridalias ' + self.TGTcurrentPDB() + ' domain ' + self.selectedTGTDomCategory() + '\n' + 'REPORTCOUNT EVERY 5 MINUTES, RATE' + '\n' + self.currentRepOptParamList() + '\n' + self.RepSchemaParam();
                        }
                        else {
                            var currentRepParam = 'REPLICAT ' + self.RepName() + '\n' + 'useridalias ' + self.TGTcurrentPDB() + ' domain ' + self.selectedTGTDomCategory() + '\n' + 'REPORTCOUNT EVERY 5 MINUTES, RATE' + '\n' + self.currentRepOptParamList() + '\n' + self.ExtPrmList1();
                        }
                        // //console.log(currentRepParam)
                        return currentRepParam;
                    }
                });


                self.AddReplicatMsg = ko.observableArray([]);

                self.addRep = function (data, event) {
                    document.querySelector('#CreateReplicatDialog').open();
                    self.AddReplicatMsg([]);
                    $.ajax({
                        url: self.TGTonepDepUrl() + "/ggaddreplicat",
                        type: 'POST',
                        data: JSON.stringify({
                            repname: self.RepName(),
                            repdesc: self.RepDesc(),
                            domain: self.selectedTGTDomCategory(),
                            alias: self.TGTcurrentPDB(),
                            repmode: self.currentRepType(),
                            beginmode: self.currentbeginmode(),
                            trail: self.SrcRmtTrail(),
                            chkpttbl: self.currentChkptTbl(),
                            currentParamList: self.newparamList()
                        }),
                        dataType: 'json',
                        contrep: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            document.querySelector('#CreateReplicatDialog').close();
                            document.querySelector('#AddReplicatDialog').open();
                            self.AddReplicatMsg(data[0]);
                            return self;
                        }

                    })
                }

                self.AddReplicatOKClose = function (event) {
                    document.querySelector('#AddReplicatDialog').close();
                    if (self.AddReplicatMsg().toString().includes('ERROR')) {
                        self.router.go({ path: 'addreplicat' });
                    }
                    else {
                        self.router.go({ path: 'manage' });
                    }
                };


                self.args = args;
                // Create a child router with one default path
                self.router = self.args.parentRouter;


                self.AddExtractOKClose = function () {
                    document.querySelector('#AddExtractDialog').close();
                    if (self.AddExtractMsg().toString().includes('ERROR')) {
                    }
                    else {
                        self.router.go({ path: 'Designer' });
                    }
                };

                self.cancel = function () {
                    self.CancelBehaviorOpt('');
                }

                // Replicat Start 

                self.chkTblList = ko.observableArray([]);
                self.currentChkptTbl = ko.observable();

                function queryChkTbl(data, event) {
                    self.chkTblList([]);
                    self.currentChkptTbl('');
                    $.ajax({
                        url: self.TGTonepDepUrl() + "/infochkpttbl",
                        type: 'POST',
                        data: JSON.stringify({
                            domain: self.selectedTGTDomCategory(),
                            alias: self.TGTcurrentPDB(),
                        }),
                        dataType: 'json',
                        contrep: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            for (var i = 0; i < data[0].length; i++) {
                                self.chkTblList.push({ 'label': data[0][i], 'value': data[0][i] });
                            }
                            return self;
                        }

                    })
                }
                self.chkpttblDP = new ArrayDataProvider(self.chkTblList, { keyAttributes: 'value' });

                self.chkptTblName = ko.observable();
                self.AddChkptTblMsg = ko.observable();


                self.addsuppOKClose = function (event) {
                    document.querySelector('#chkDlg').close();
                };


                self.openCkptTblDiaglog = function () {
                    document.querySelector('#AddCkptTblDialog').open();
                }

                self.addChkptTbl = function (data, event) {
                    self.AddChkptTblMsg('');
                    document.querySelector('#AddCkptTblDialog').close();
                    document.querySelector('#addChkTblProgress').open();
                    $.ajax({
                        url: self.TGTonepDepUrl() + "/ggaddchkpttbl",
                        type: 'POST',
                        data: JSON.stringify({
                            domain: self.selectedTGTDomCategory(),
                            alias: self.TGTcurrentPDB(),
                            chkpttbl: self.chkptTblName()
                        }),
                        dataType: 'json',
                        context: self,
                        error: function (e) {
                        },
                        success: function (data) {
                            document.querySelector('#addChkTblProgress').close();
                            document.querySelector('#ChkptTblDialog').open();
                            self.AddChkptTblMsg(data[0]);
                            return self;
                        }

                    })
                }

                self.AddChkptTblMsgOKClose = function (event) {
                    document.querySelector('#ChkptTblDialog').close();
                    queryChkTbl();
                };

                //enf




                self.connected = function () {
                    if (sessionStorage.getItem("userName") == null) {
                        self.router.go({ path: 'signin' });
                    }
                    else {
                        app.onAppSuccess();
                        self.ExtName('');
                        self.PmpName('');
                        self.toggleOuter();
                    }
                };

                /**
                 * Optional ViewModel method invoked after the View is disconnected from the DOM.
                 */
                self.disconnected = function () {


                    // Implement if needed
                };

                /**
                 * Optional ViewModel method invoked after transition to the new View is complete.
                 * That includes any possible animation between the old and the new View.
                 */
                self.transitionCompleted = function () {

                    // Implement if needed
                };
            }

        }
        /*
        * Returns a constructor for the ViewModel so that the ViewModel is constructed
        * each time the view is displayed.  Return an instance of the ViewModel if
        * only one instance of the ViewModel is needed.
        */
        return DesignerViewModel;
    }
);