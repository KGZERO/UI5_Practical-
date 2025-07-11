sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment"],
  function (Controller, MessageBox, Fragment) {
    "use strict";
    return Controller.extend("com.dxc.strategy.registration.controller.App",
      {
        onInit: function () {
          this.showRoleSelectionDialog();

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