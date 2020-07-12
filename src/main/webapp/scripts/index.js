var app = angular.module('app', []);

app.controller('ItemController', ['$scope', '$http', function ($scope, $http) {
    var c = this;
    c.loading = true;

    this.callPageGet = function (table, recordId = null) {
        this.removeSelection();
        $('#tag' + table).addClass('slds-is-active');
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

        $http.get('https://car-shop-ftt.herokuapp.com/' + table, body, req).then(function successCallback(response) { c.handleGET(response, table) }, function errorCallback(response) { c.errorHandleGET(response) });
    };
    this.errorHandleGET = function (response) {
    };
    this.handleGET = function (response, table) {
        this.loading = true;

        $('#contentData').html(this.addTable(response.data.objectData, table))

        $scope.$apply(function () {
            var c = $scope.c;
            c.loading = false;
        });
    };
    this.addTableSingleHader = function (tableLabel){
        return `
            <th aria-label="${tableLabel}" aria-sort="none" class="slds-is-resizable slds-is-sortable" scope="col">
              <a class="slds-th__action slds-text-link_reset" href="javascript:void(0);" role="button" tabindex="0">
                <span class="slds-assistive-text">Sort by: </span>
                <div class="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                  <span class="slds-truncate" title="${tableLabel}">${tableLabel}</span>
                  <span class="slds-icon_container slds-icon-utility-arrowdown">
                    <svg class="slds-icon slds-icon-text-default slds-is-sortable__icon " aria-hidden="true">
                      <use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#arrowdown"></use>
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
    this.returnSingleData = function (item, prop) {
        return `
            <th scope="row">
              <div class="slds-truncate" title="${item[prop]}">${item[prop]}</div>
            </th>
        `;
    }
    this.addDataItem = function (table, item) {
        var dataTable = '';
        window.config[table]['fields'].forEach(function (prop) {
            dataTable += c.returnSingleData(item, prop);
        }, { dataTable });
        return `
        <tr aria-selected="false" class="slds-hint-parent">
          <td class="slds-text-align_right" role="gridcell">
            <div class="slds-checkbox">
              <input type="checkbox" name="options" id="checkbox-${item.SalesforceId}" value="checkbox-${item.SalesforceId}" tabindex="0" aria-labelledby="check-button-label-01 column-group-header" />
              <label class="slds-checkbox__label" for="checkbox-01" id="check-button-label-01">
                <span class="slds-checkbox_faux"></span>
                <span class="slds-form-element__label slds-assistive-text">Select item 1</span>
              </label>
            </div>
          </td>
          ${dataTable}
          <td role="gridcell">
            <button class="slds-button slds-button_icon slds-button_icon-border-filled slds-button_icon-x-small" aria-haspopup="true" tabindex="0" title="More actions for Acme - 1,200 Widgets">
              <svg class="slds-button__icon slds-button__icon_hint slds-button__icon_small" aria-hidden="true">
                <use xlink:href="/assets/icons/utility-sprite/svg/symbols.svg#down"></use>
              </svg>
              <span class="slds-assistive-text">More actions for Acme - 1,200 Widgets</span>
            </button>
          </td>
        </tr>
        `;
    };
    this.addTable = function(data, table){
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
                    <input type="checkbox" name="options" id="checkbox-unique-id-297" value="checkbox-unique-id-297" tabindex="0" aria-labelledby="check-select-all-label column-group-header" />
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
    this.removeSelection = function () {
        $('#tagSalesMan').removeClass('slds-is-active');
        $('#tagCar').removeClass('slds-is-active');
        $('#tagModel').removeClass('slds-is-active');
        $('#tagBrand').removeClass('slds-is-active');
        $('#tagClient').removeClass('slds-is-active');
    };
    this.initPage = function () {
        c.callPageGet('SalesMan');
    }
    window.onload = function () {
        c.initPage();
    }
}]);