sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"],
    function (Controller, JSONModel, MessageBox, MessageToast) {
        "use strict";
        return Controller.extend("com.dxc.strategy.registration.controller.Employee", {
            onInit: function () {
                this._oRouter = this.getOwnerComponent().getRouter(); 
                this._oRouter.getRoute("employee").attachPatternMatched(this._onRouteMatched, this);
                // Set up form model
                var oFormModel = new JSONModel({ editMode: false, employee: { emp_ID: "", first_name: "", last_name: "", email: "", phone_no: "", manager: "", subteam: "", strat_id: "" } }); 
                this.getView().setModel(oFormModel, "form");
                // Set up table model
                var oTableModel = new JSONModel({ searchQuery: "" }); 
                this.getView().setModel(oTableModel, "table");

                console.log("search :", oTableModel.getData());// set up subteam
                var oSubteamModel = new JSONModel({
                    subteams: [
                        { key: "Development", text: "Development" },
                        { key: "Quality Assurance", text: "Quality Assurance" },
                        { key: "Human Resources", text: "Human Resources" },
                        { key: "Finance", text: "Finance" },
                        { key: "Marketing", text: "Marketing" }
                    ]
                });
                this.getView().setModel(oSubteamModel, "subteam");
                // Debug log
                console.log("Subteam model initialized:", oSubteamModel.getData());
            }, _onRouteMatched: function (oEvent) { this._sStratId = oEvent.getParameter("arguments").stratId; 
                this._bindView(); 
            }, _bindView: function () {
                var oView = this.getView();
                var oStrategyModel = this.getOwnerComponent().getModel("strategy");

                // Bind strategy details     
                oView.bindElement({
                    path: "/Strategies/" + this._sStratId,
                    model: "strategy",
                    events: { change: this._onStrategyBindingChange.bind(this) }
                });
            },



            _onStrategyBindingChange: function () {
                var oView = this.getView();
                var oElement = oView.getElementBinding("strategy");
                if (!oElement.getBoundContext()) {
                    this._oRouter.getTargets().display("notFound");
                    return;
                }
                // Set title with strategy name
                console.log(this.getOwnerComponent().getModel('employee').getData());


                var oStrategy = oView.getBindingContext("strategy").getObject();

                // console.log("all strategy : ", oStrategy.getData());

                if (oStrategy && oStractegy.strat_name) {
                    oView.byId("employeePage").setTitle(oStrategy.strat_name);
                } else {
                    console.error("startegy data is invalue: ", oStrategy);
                    //fallback title
                    oView.byId("employeePage").setTitle("Employee Registration ")
                }

            }, onAddEmployee: function () {
                var oFormModel = this.getView().getModel("form"); oFormModel.setProperty("/editMode", false); oFormModel.setProperty("/employee", {
                    emp_ID: "", first_name: "", last_name: "", email: "", phone_no: "", manager: "", subteam: "", strat_id: this._sStratId
                }); this._showEmployeeDialog();
            },

            onEditEmployee: function (oEvent) {
                var oItem = oEvent.getSource().getParent(); var oContext = oItem.getBindingContext("employee");
                var oEmployee = oContext.getObject();
                var oFormModel = this.getView().getModel("form");


                oFormModel.setProperty("/editMode", true);
                oFormModel.setProperty("/employee", jQuery.extend(true, {}, oEmployee));
                this._showEmployeeDialog();
            },

            onDeleteEmployee: function (oEvent) {
                var aSelectedItems = this.byId("employeesTable").getSelectedItems();
                if (aSelectedItems.length === 0) {
                    MessageToast.show(this.getView().getModel("i18n").getProperty("selectEmployeeFirst"));
                    return;
                } MessageBox.confirm(this.getView().getModel("i18n").getProperty("confirmDeleteMultiple") + " " + aSelectedItems.length + " employees?",
                    {
                        title: this.getView().getModel("i18n").getProperty("confirmDeleteTitle"),
                        onClose: function (oAction) { if (oAction === MessageBox.Action.OK) { this._deleteSelectedEmployees(aSelectedItems); } }.bind(this)
                    });
            },

            _deleteSelectedEmployees: function (aSelectedItems) {
                var oEmployeeModel = this.getOwnerComponent().getModel("employee");
                var aEmployees = oEmployeeModel.getProperty("/Employees"); aSelectedItems.forEach(
                    function (oItem) {
                        var sEmpId = oItem.getBindingContext("employee").getProperty("emp_ID");
                        aEmployees = aEmployees.filter(function (oEmp) {
                            return oEmp.emp_ID !== sEmpId;

                        });
                    });
                oEmployeeModel.setProperty("/Employees", aEmployees);
                MessageToast.show(this.getView().getModel("i18n").getProperty("employeesDeleted"));
            },

            onSaveEmployee: function () {
                var oFormModel = this.getView().getModel("form");
                var oEmployee = oFormModel.getProperty("/employee");
                if (!this._validateEmployee(oEmployee)) { return; }
                MessageBox.confirm(this.getView().getModel("i18n").getProperty("confirmSave"),
                    {
                        title: this.getView().getModel("i18n").getProperty("confirmSaveTitle"),
                        onClose: function (oAction) {
                            if (oAction === MessageBox.Action.OK) {
                                this._saveEmployee(oEmployee, oFormModel.getProperty("/editMode"));
                            }
                        }.bind(this)
                    });
            },

            onCancelEmployee: function (oEvent) {
                MessageBox.confirm("Do you want to cancel the operation?", {
                    title: "Confirm",
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK && this._oEmployeeDialog) {
                            this._oEmployeeDialog.close();
                        }
                    }.bind(this)
                });


            },

            // add controller
            checkSubteamBinding: function () {
                var oSelect = this.byId("subteamSelect");
                if (oSelect) {
                    console.log("Current subteam value:",
                        this.getView().getModel("form").getProperty("/employee/subteam"));
                    console.log("Available subteams:",
                        this.getView().getModel("subteam").getData().subteams);
                }
            },
            _validateEmployee: function (oEmployee) {
                var oI18n = this.getView().getModel("i18n");
                var oEmployeeModel = this.getOwnerComponent().getModel("employee");
                var aEmployees = oEmployeeModel.getProperty("/Employees");
                // Check required fields
                if (!oEmployee.emp_ID || !oEmployee.first_name || !oEmployee.last_name || !oEmployee.email || !oEmployee.phone_no || !oEmployee.manager || !oEmployee.subteam) {
                    MessageBox.error(oI18n.getProperty("allFieldsRequired")); return false;
                }
                // Check employee ID format (8 digits)
                if (!/^\d{8}$/.test(oEmployee.emp_ID)) {
                    MessageBox.error(oI18n.getProperty("empIdFormatError"));
                    return false;
                }
                // Check first and last name (letters only)
                if (!/^[a-zA-Z]+$/.test(oEmployee.first_name)) {
                    MessageBox.error(oI18n.getProperty("firstNameFormatError"));
                    return false;
                }
                if (!/^[a-zA-Z]+$/.test(oEmployee.last_name)) {
                    MessageBox.error(oI18n.getProperty("lastNameFormatError"));
                    return false;
                }
                // Check email format (@dxc.com)
                if (!oEmployee.email.endsWith("@dxc.com")) {
                    MessageBox.error(oI18n.getProperty("emailFormatError"));
                    return false;
                }
                // Check phone format (09 followed by 9 digits)
                if (!/^09\d{9}$/.test(oEmployee.phone_no)) {
                    MessageBox.error(oI18n.getProperty("phoneFormatError"));
                    return false;
                }
                // Check manager name (letters only)
                if (!/^[a-zA-Z ]+$/.test(oEmployee.manager)) {
                    MessageBox.error(oI18n.getProperty("managerFormatError"));
                    return false;
                }
                // Check if employee ID already exists (for new employees)
                if (!this.getView().getModel("form").getProperty("/editMode")) {
                    var bIdExists = aEmployees.some(function (oEmp) {
                        return oEmp.emp_ID === oEmployee.emp_ID;

                    });
                    if (bIdExists) {
                        MessageBox.error(oI18n.getProperty("empIdExistsError")); return false;
                    }
                }
                // Check if email already exists
                var bEmailExists = aEmployees.some(function (oEmp) {
                    return oEmp.email === oEmployee.email && oEmp.emp_ID !== oEmployee.emp_ID;
                });
                if (bEmailExists) {
                    MessageBox.error(oI18n.getProperty("emailExistsError"));
                    return false;
                }// Check if phone already exists
                var bPhoneExists = aEmployees.some(function (oEmp) {
                    return oEmp.phone_no === oEmployee.phone_no && oEmp.emp_ID !== oEmployee.emp_ID;
                });
                if (bPhoneExists) {
                    MessageBox.error(oI18n.getProperty("phoneExistsError"));
                    return false;
                }
                return true;
            },
            _saveEmployee: function (oEmployee, bEditMode) {
                var oEmployeeModel = this.getOwnerComponent().getModel("employee");
                var aEmployees = oEmployeeModel.getProperty("/Employees");
                if (bEditMode) {
                    // Update existing employee
                    var nIndex = aEmployees.findIndex(function (oEmp) {
                        return oEmp.emp_ID === oEmployee.emp_ID;
                    });
                    if (nIndex !== -1) {
                        aEmployees[nIndex] = oEmployee;
                    }
                } else {
                    // Add new employee       
                    aEmployees.push(oEmployee);
                }
                oEmployeeModel.setProperty("/Employees", aEmployees);
                this._oEmployeeDialog.close();
                MessageToast.show(this.getView().getModel("i18n").getProperty(bEditMode ? "employeeUpdated" : "employeeAdded"));
            },
            _showEmployeeDialog: function () {
                var oView = this.getView();

                if (!this._oEmployeeDialog) {
                    this._oEmployeeDialog = sap.ui.xmlfragment("com.dxc.strategy.registration.view.fragments.EmployeeDialog", this);



                    oView.addDependent(this._oEmployeeDialog);
                } try {
                    this._oEmployeeDialog.open();
                } catch (error) {
                    MessageBox.error("cannot open eployee form");
                }

            },
            onSearch: function (oEvent) {
                // get  query value
                var sQuery = oEvent.getParameter("query") || "";
                // get binding of table 
                var oTable = this.byId("employeesTable");
                var oBinding = oTable.getBinding("items");
                // create new filter 
                var aFilters = [];
                if (sQuery) {
                    aFilters = [
                        new sap.ui.model.Filter("first_name", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("last_name", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("emp_ID", sap.ui.model.FilterOperator.Contains, sQuery),
                        new sap.ui.model.Filter("email", sap.ui.model.FilterOperator.Contains, sQuery)
                    ];
                    oBinding.filter(new sap.ui.model.Filter({
                        filters: aFilters,
                        and: false
                    }));
                } else {
                    oBinding.filter([]); // Reset filter when query empty
                }
                // Debug log
                console.log("Search applied:", sQuery, "Filters:", aFilters);

            }, onExport: function () {
                var oTable = this.byId("employeesTable"); var aColumns = oTable.getColumns();
                var aItems = oTable.getItems();
                var csvContent = "data:text/csv;charset=utf-8,";
                // Add headers
                var aHeaders = aColumns.map(function (oColumn) {
                    return oColumn.getHeader().getText();

                });
                csvContent += aHeaders.join(",") + "\r\n";
                // Add data      
                aItems.forEach(function (oItem) {
                    var aCells = oItem.getCells();
                    var aRow = aCells.map(function (oCell) {
                        return oCell.getText();

                    });
                    csvContent += aRow.join(",") + "\r\n";
                });// Create download link
                var encodedUri = encodeURI(csvContent);
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "employees_export.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    });