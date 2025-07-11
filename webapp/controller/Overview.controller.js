sap.ui.define([
    "sap/ui/core/mvc/Controller"
    , "sap/ui/model/json/JSONModel"
    , "sap/m/MessageBox"
    , "sap/ui/core/Fragment"]
    , function (Controller, JSONModel, MessageBox, Fragment) {
        "use strict"; return Controller.extend("com.dxc.strategy.registration.controller.Overview", {
            onInit: function () {
                this._oRouter = this.getOwnerComponent().getRouter(); this._oRouter.getRoute("overview").attachPatternMatched(this._onRouteMatched, this);
                // Set up table model
                var oTableModel = new JSONModel({ searchQuery: "" });
                this.getView().setModel(oTableModel, "table");
                this.showRoleSelectionDialog();
            },
            _onRouteMatched: function () { this._bindView(); },
            _bindView: function () {
                var oView = this.getView();
                var oStrategyModel = this.getOwnerComponent().getModel("strategy");
                oView.bindElement({ path: "/Strategies", model: "strategy" });
            }, onStrategyPress: function (oEvent) {
                var oItem = oEvent.getSource(); var sStratId = oItem.getBindingContext("strategy").getProperty("strat_id"); this._oRouter.navTo("employee", {
                    stratId: sStratId
                });
            }, onSearch: function (oEvent) { var sQuery = oEvent.getParameter("query"); this.getView().getModel("table").setProperty("/searchQuery", sQuery); }, onExport: function () {
                var oTable = this.byId("strategiesTable"); var aColumns = oTable.getColumns(); var aItems = oTable.getItems(); var csvContent = "data:text/csv;charset=utf-8,";

                // Add headers
                var aHeaders = aColumns.map(function (oColumn) { return oColumn.getHeader().getText(); }); csvContent += aHeaders.join(",") + "\r\n";
                // Add data      
                aItems.forEach(function (oItem) { var aCells = oItem.getCells(); var aRow = aCells.map(function (oCell) { return oCell.getText(); }); csvContent += aRow.join(",") + "\r\n"; });
                // Create download link
                var encodedUri = encodeURI(csvContent);
                var link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "strategies_export.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            showRoleSelectionDialog: async function () {
                var oView = this.getView();
                let oDailog = this.byId("RoleDialog");
                if (!oDailog) {
                    // oDailog = sap.ui.xmlfragment("com.dxc.strategy.registration.view.fragments.RoleDialog", this);
                    oDailog = await Fragment.load({
                        id: oView.getId(),
                        name: "com.dxc.strategy.registration.view.fragments.RoleDialog",
                        controller: this
                    })
                    oView.addDependent(oDailog);

                }
                oDailog.open();

            },

            onRoleSelect: function (oEvent) {
                var sRole = this.getView().byId('selectedItem').getSelectedItem().getKey();

                var oRoleModel = this.getOwnerComponent().getModel("role");
                oRoleModel.setProperty("/role", sRole);
                oRoleModel.setProperty("/editable", sRole === "admin");
                this.byId("RoleDialog").close();
            },

            onEditRolePress: function () {
                this._showRoleSelectionDialog();

            }

        });
    });