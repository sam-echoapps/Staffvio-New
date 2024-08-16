define(['ojs/ojcore', 'knockout', 'jquery', 'appController', "ojs/ojmodulerouter-adapter", 
    "ojs/ojarraydataprovider", "ojs/ojprogress-bar",
    "ojs/ojknockout", "ojs/ojlistview", "ojs/ojmodule-element"], 
    function (oj, ko, $, app, ModuleRouterAdapter, ArrayDataProvider) {
    "use strict";
    class ViewModel {
        constructor(args) {
            var self = this

            self.record = ko.observable();
                
            self.router = args.parentRouter;

            self.connected = function () {
                if (sessionStorage.getItem("userName") == null) {
                    self.router.go({path : 'signin'});
                }
                else {
                    app.onAppSuccess();
                }
            }
            self.role = ko.observable(sessionStorage.getItem("userRole"));
            var routerLength = args.parentRouter._routes.length;
            
            // if(self.role() === "counselor" || self.role() === "manager"){
            //     var records = { 
            //         "childPath" : [
            //             { "path" : "guideStudentAdd", "label" : "How to add a student?"},
            //             { "path" : "guideEditStudent", "label" : "How to edit a student’s profile?"},
            //             { "path" : "guideChangeStatus", "label" : "How to change the status, staff or office of a student?"},
            //             { "path" : "guideStudentLog", "label" : "How to add a student log?"},
            //             { "path" : "guideAddApplication", "label" : "How to add and edit an application under a student?"},
            //             { "path" : "guideFinalChoiceApplication", "label" : "How to add a Final Choice application?"},
            //             { "path" : "guideSearchStudent", "label" : "How to search for a student?"},
            //             { "path" : "guideBulkAssignStudent", "label" : "How to bulk assign unassigned leads to staff?"},
            //         ]
            //     }
            // }
            // else{
            //     var records = { 
            //         "childPath" : [
            //             { "path" : "guideStudentAdd", "label" : "How to add a student?"},
            //             { "path" : "guideEditStudent", "label" : "How to edit a student’s profile?"},
            //             { "path" : "guideChangeStatus", "label" : "How to change the status, staff or office of a student?"},
            //             { "path" : "guideStudentLog", "label" : "How to add a student log?"},
            //             { "path" : "guideAddApplication", "label" : "How to add and edit an application under a student?"},
            //             { "path" : "guideFinalChoiceApplication", "label" : "How to add a Final Choice application?"},
            //             { "path" : "guideSearchStudent", "label" : "How to search for a student?"},
            //             { "path" : "guideDeleteStudent", "label" : "How to delete a student?"},
            //             { "path" : "guideBulkAssignStudent", "label" : "How to bulk assign unassigned leads to staff?"},
            //         ]
            //     }
            // }

            var records = { 
                "childPath" : [
                    { "path" : "guideManageApprovingShift", "label" : "Approving shift"},
                    { "path" : "guideManageTimeSheet", "label" : "Creating Timesheet for staff"},
                    { "path" : "guideManageShiftManager", "label" : "How to post a shift in Shift Manager?"},
                    { "path" : "guideManageInvoice", "label" : "How to create and manage invoice?"},

                ]
            }

            self.incidentData = records.childPath;
            
            self.dataProvider = new ArrayDataProvider(self.incidentData);
            
            self.selection = ko.pureComputed({
                read: () => {
                    const selected = [];
                    const record = self.record();
                    
                    if (record) {
                        var index = self.incidentData.indexOf(record);
                        selected.push(index);
                    }
                    return selected;
                },
                
                write: (selected) => {
                    var path = self.incidentData[selected[0]].path
                    
                    self.router.go({ path: path, params: { index: selected[0] } });
                }
            });
            
            self.args = args;
            // Create a child router with one default path
            self.router = self.args.parentRouter.createChildRouter([
                { path: '', redirect: 'guideManageApprovingShift' },
                { path: 'guideManageApprovingShift' },
                { path: 'guideManageTimeSheet' },
                { path: 'guideManageShiftManager' },
                { path: 'guideManageInvoice' },
                
                
            ]);

            self.router.currentState.subscribe((args) => {
                const state = args.state;
                if (state) {
                    self.record(self.incidentData[state.params.index]);
                }
            });

            self.module = new ModuleRouterAdapter(self.router, {
                viewPath: 'views/Help/manageClient/',
                viewModelPath: 'viewModels/Help/manageClient/'
            });
        }
        
    }
    return ViewModel;
});