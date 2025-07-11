sap.ui.define([

    "sap/ui/core/UIComponent",

    "sap/ui/model/json/JSONModel"

], function (UIComponent, JSONModel) {

    "use strict";

    return UIComponent.extend("com.dxc.strategy.registration.Component", {

        metadata: {

            manifest: "json",

            interfaces: ["sap.ui.core.IAsyncContentCreation"]

        },

        init: function () {

            // 1. Gọi hàm init của lớp cha

            UIComponent.prototype.init.apply(this, arguments);

            // 2. Khởi tạo các models

            this._initModels();

            // 3. Khởi tạo router sau khi model đã sẵn sàng

            this._initRouter();

        },

        _initModels: function () {

            // Model cho role

            this.setModel(new JSONModel({

                role: "",

                editable: false,

                roles: [

                    { key: "admin", text: "Administrator" },

                    { key: "employee", text: "Employee" }

                ]

            }), "role");

            //Model cho strategy (load từ file JSON)

            // var oStrategyModel = new JSONModel();

            // oStrategyModel.loadData("./model/Strategy.json");

            // this.setModel(oStrategyModel, "strategy");

            // // Model cho employee (có thể để trống ban đầu)

            // this.setModel(new JSONModel({

            //     Employees: []

            // }), "employee");

        },

        _initRouter: function () {

            // Đảm bảo model đã load xong trước khi khởi tạo router

            this.getModel("strategy").attachRequestCompleted(function () {

                this.getRouter().initialize();

                // Debug: Kiểm tra dữ liệu strategy

                console.log("Strategy data loaded:",

                    this.getModel("strategy").getData());

            }.bind(this));

        },

        createContent: function () {

            // Tạo root view với preprocessors để xử lý async

            return sap.ui.view({

                viewName: "com.dxc.strategy.registration.view.App",

                type: "XML",

                async: true,

                preprocessors: {

                    xml: {

                        models: {

                            role: this.getModel("role"),

                            strategy: this.getModel("strategy")

                        }

                    }

                }

            });

        },

        /**

         * Hiển thị dialog chọn role (có thể gọi từ bất kỳ controller nào)

         */

        showRoleSelection: function () {

            if (!this._oRoleDialog) {

                this._oRoleDialog = sap.ui.xmlfragment(

                    "com.dxc.strategy.registration.view.fragments.RoleDialog",

                    this

                );

                this.getRootControl().addDependent(this._oRoleDialog);

            }

            this._oRoleDialog.open();

        }

    });

});
