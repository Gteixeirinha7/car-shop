(function () {
var app = angular.module('app', []);

app.controller('ItemController', ['$scope', '$http', function (scope, $http) {
    var c = this;
    c.loading = true;
    c.allChecked = false;
    c.currentTable = '';

    c.objectData = null;

    c.callPageGet = function (table, recordId = null) {
        var req = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        var body = {};
        if (recordId != null){
            body['ExternalId'] = recordId;
        }
        c.currentTable = table;
        $http.get('https://car-shop-ftt.herokuapp.com/' + table, body, req).then(function successCallback(response) { c.handleGET(response, table) }, function errorCallback(response) { c.errorHandleGET(response) });
    };
    c.errorHandleGET = function (response) {
        c.finallyHandler();
    };
    c.handleGET = function (response, table) {
        window.config[table]['data'] = response.data.objectData.filter(item => item.ExternalId != null);

        c.removeSelection();
        $('#tag' + table).addClass('slds-is-active');

        $('#contentData').html(c.addTable(window.config[table]['data'], table));

        c.hideAllElements();
        c.finallyHandler();
    };
    c.finallyHandler = function () {
        scope.$applyAsync();
        scope.$evalAsync();
        c.allChecked = false;
    };
    c.delete = function (table, ExternalIds) {
        Swal.fire({
            title: 'Tem certeaza que deseja apagar?',
            text: "Ao deletar o registro, ele vai sumir da base de dados",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim'
        }).then((result) => {
            if (result.value) {
                $http.delete('https://car-shop-ftt.herokuapp.com/' + table, { body: { ExternalId: ExternalIds}}).then(
                    function successCallback(response) {
                        c.handleDelete(response, table);
                    },
                    function errorCallback(response) {
                        c.errorHandleDelete(response)
                    }
                );
            }
        });
    };
    c.errorHandleDelete = function (response) {
    };
    c.handleDelete = function (response, table) {
        c.loading = true;

        Swal.fire(
            'Deletado!',
            'Registro deletado com sucesso',
            'success'
        );
        c.callPageGet(table);
    };
    c.addTableSingleHader = function (tableLabel){
        return `
            <th aria-label="${tableLabel}" aria-sort="none" class="slds-is-resizable slds-is-sortable" scope="col">
              <a class="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabindex="0">
                <span class="slds-assistive-text">Sort by: </span>
                <div class="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                  <span class="slds-truncate" title="${tableLabel}">${tableLabel}</span>
                  <span class="slds-icon_container slds-icon-utility-arrowdown">
                    <svg class="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                      <use xlink:href="/style/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
                    </svg>
                  </span>
                </div>
              </a>
              <div class="slds-resizable">
                <input type="range" aria-label="${tableLabel} column width" class="slds-resizable__input slds-assistive-text" id="cell-resize-handle-540" max="1000" min="20" tabindex="0" />
                <span class="slds-resizable__handle">
                  <span class="slds-resizable__divider"></span>
                </span>
              </div>
            </th>
        `;
    };
    c.returnSingleData = function (itemData, prop) {
        var currItem = JSON.parse(JSON.stringify(itemData));
        var path = prop.split('.');
        path.forEach(function(item){
            currItem = currItem[item] ? currItem[item] : 'Vazio';
        }, { prop, currItem, itemData});

        return `
            <th scope="row">
              <div class="slds-truncate" title="${currItem}">${currItem}</div>
            </th>
        `;
    }
    c.addDataItem = function (table, item) {
        var dataTable = '';
        window.config[table]['fields'].forEach(function (prop) {
            dataTable += c.returnSingleData(item, prop);
        }, { dataTable });
        return `
        <tr aria-selected="false" class="slds-hint-parent">
          <td class="slds-text-align_right" role="gridcell">
            <div class="slds-checkbox">
              <input type="checkbox" name="options" id="checkbox-${item.SalesforceId}" value="checkbox-${item.SalesforceId}" tabindex="0" aria-labelledby="check-button-label-01 column-group-header" />
              <label class="slds-checkbox__label" for="checkbox-${item.SalesforceId}" id="checkbox-${item.SalesforceId}-label-01">
                <span class="slds-checkbox_faux"></span>
                <span class="slds-form-element__label slds-assistive-text">Select item 1</span>
              </label>
            </div>
          </td>
          ${dataTable}
          <td role="gridcell">
            <button onclick="window.showHide('actions-${item.SalesforceId}')" class="slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small" aria-haspopup="true" tabindex="0" title="More actions for Acme - 1,200 Widgets">
              <svg class="slds-button__icon slds-button__icon_hint slds-button__icon_small" aria-hidden="true">
                <use xlink:href="/style/icons/utility-sprite/svg/symbols.svg#down"></use>
              </svg>
              <span class="slds-assistive-text">More actions for Acme - 1,200 Widgets</span>
            </button>
            <div id="actions-${item.SalesforceId}" class="slds-dropdown slds-dropdown_left" style="left: -60px;" >
              <ul class="slds-dropdown__list" role="menu" aria-label="Show More">
                <li class="slds-dropdown__item" role="presentation" onclick="window.edit('${table}', '${item.ExternalId}')">
                  <a href="javascript:void(0);" role="menuitem" tabindex="0">
                    <span class="slds-truncate" title="Editar">Editar</span>
                  </a>
                </li>
                <li class="slds-dropdown__item" role="presentation" onclick="window.delete('${table}', '${item.ExternalId}')">
                  <a href="javascript:void(0);" role="menuitem" tabindex="-1">
                    <span class="slds-truncate" title="Apagar">Apagar</span>
                  </a>
                </li>
              </ul>
            </div>
          </td>
        </tr>
        `;
    };
    c.addTable = function(data, table){
        var tableHeader = '';
        window.config[table]['fieldsLabel'].forEach(function (item) {
            tableHeader += c.addTableSingleHader(item);
        }, { tableHeader });

        var tableData = '';
        data.forEach(function (item) {
            tableData += c.addDataItem(table, item);
        }, { tableData, table });

        return `
        <table aria-multiselectable="true" class="slds-table slds-table_bordered slds-table_fixed-layout slds-table_resizable-cols" role="grid">
          <thead>
            <tr class="slds-line-height_reset">
              <th class="slds-text-align_right" scope="col" style="width:3.25rem">
                <span id="column-group-header" class="slds-assistive-text">Choose a row</span>
                <div class="slds-th__action slds-th__action_form">
                  <div class="slds-checkbox">
                    <input onclick="window.markAll(event)" type="checkbox" name="options" id="checkbox-unique-id-297" value="checkbox-unique-id-297" tabindex="0" aria-labelledby="check-select-all-label column-group-header" />
                    <label class="slds-checkbox__label" for="checkbox-unique-id-297" id="check-select-all-label">
                      <span class="slds-checkbox_faux"></span>
                      <span class="slds-form-element__label slds-assistive-text">Selecionar Todos</span>
                    </label>
                  </div>
                </div>
              </th>
              ${tableHeader}     
              <th class="" scope="col" style="width:3.25rem">
                <div class="slds-truncate slds-assistive-text" title="Actions">Actions</div>
              </th>
            </tr>
          </thead>
          <tbody>
              ${tableData}  
          </tbody>
        </table>`;
    }
    c.markAll = function () {
        c.allChecked = !c.allChecked;
        var elements = $('div[id^="checkbox-"]');
        for (var i = 0; i < elements.length; i++) {
            elements[i].checked = c.allChecked;
        }
    }
    c.hideAllElements = function () {
        var elements = $('div[id^="actions-"]');
        for(var i =0; i<elements.length; i++){
            $('#'+elements[i].id).hide();
        }
    }
    c.removeSelection = function () {
        $('#tagSalesMan').removeClass('slds-is-active');
        $('#tagCar').removeClass('slds-is-active');
        $('#tagModel').removeClass('slds-is-active');
        $('#tagBrand').removeClass('slds-is-active');
        $('#tagClient').removeClass('slds-is-active');
    };
    c.showHide = function(Ids){
        if ($('#' + Ids).css('display') == 'none'){
            $('#' + Ids).show();
        } else {
            $('#' + Ids).hide();
        }
    };
    c.init = function () {
        c.callPageGet('SalesMan');
    };
    c.getCurrentData = function(table, id){
        return window.config[table].data.filter(item => item.SalesforceId == id)[0];
    };
    c.handleEdit = function(table, externalId){
        Swal.fire({
            title: 'Digite os dados do registro',
            html: c.getBody(table),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sim'
        }).then((result) => {
            if (result.value) {
                var req = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
                if (c.objectData == null) {
                    Swal.fire(
                        'Erro!',
                        'Informe todos os dados...',
                        'warning'
                    ).then((result) => { c.handleEdit(table, externalId);});

                } else {
                    if (externalId){
                        c.objectData['ExternalId'] = externalId;
                    }
                    $http.post('https://car-shop-ftt.herokuapp.com/' + table, c.objectData, req).then(
                        function successCallback(response) {
                            c.handleSucessEdit(response, table);
                        },
                        function errorCallback(response) {
                            c.errorHandleSucessEdit(response)
                        }
                    );
                }
                c.objectData = null;
            }
        });
    };
    c.checkFields = function (field, event){
        if (c.objectData == null)
            c.objectData = {};
        c.objectData[field] = event.target.value;
    };
    c.getBody = function (table){
        var fieldMetaData = window.config[table]['fieldsMetaData'];
        var fieldData = '';
        fieldMetaData.forEach(function(item){
            if (item.Type == 'Text')
                fieldData += c.createSingleIput(table, item.Label, item.Field);
        }, {fieldData});
        var html  = `
        <div class="slds-form slds-grid">
            ${fieldData}
        </div>
        `;

        return html;
    }
    c.createSingleIput = function (table, label, field){
        return `
        <div class="slds-size--1-of-2">
            <div class="slds-form-element">
                <label class="slds-form-element__label" for="form-element-${field}-${table}">${label}</label>
                <div class="slds-form-element__control">
                    <input onchange="window.checkFields('${field}', event)" type="text" id="form-element-${field}-${table}" placeholder="${label}" class="slds-input" />
                </div>
            </div>
        </div>`;
    }
    c.handleSucessEdit = function (response, table) {
        Swal.fire(
            'Sucesso!',
            'Registro Atualizado/Inserido com sucesso!',
            'success'
        );
        c.callPageGet(table);

    }
    c.newData = function () {
        c.handleEdit(c.currentTable);
    };
    window.markAll = function(){
        c.markAll();
    };
    window.showHide = function (Ids) {
        c.showHide(Ids);
    };
    window.edit = function (table, Id) {
        c.handleEdit(table, Id);
    };
    window.newData = function () {
        c.newData();
    };
    window.delete = function (table, ExternalIds) {
        c.delete(table, ExternalIds);
    };
    window.checkFields = function (field, event) {
        c.checkFields(field, event);
    };
}]);
app.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);
})();