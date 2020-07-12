<html  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"   ng-app="app">
<head>
        <title>Car Shop FTT</title>
    <meta name="viewport" content="width=device-width, user-scalable=no" charset="UTF-8"/>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="/scripts/angular.min.js" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="/style/styles/salesforce-lightning-design-system.min.css">
    <link rel="stylesheet" type="text/css" href="/style/styles/SweetalertCss.css">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@8.2.5" charset="UTF-8"></script>
    <script src="/scripts/index.js" type="text/javascript"></script>
    <script type="text/javascript">
        window.config = {
            'SalesMan' : {
                'fields' :     ['Name', 'CPF', 'Age',   'Experience' , 'Goal', 'Email', 'Phone', 'CNH'],
                'fieldsLabel': ['Nome' ,'CPF', 'Idade', 'Experiencia', 'Meta', 'Email', 'Telefone', 'CNH'],
                'data' : {}
            },
            'Car': {
                'fields': ['Name', 'Fuel', 'Year', 'BrandData.Name', 'ModelData.Name', 'Armored', 'UsedCar', 'Color', 'Exchange'],
                'fieldsLabel': ['Nome', 'Gasolina', 'Ano', 'Marca', 'Modelo'         , 'Blindado?', 'Carro usado?', 'Cor', 'Cambio'],
                'data': {}
            },
            'Model': {
                'fields': ['Name', 'BrandData.Name'],
                'fieldsLabel': ['Nome', 'Marca'],
                'data': {}
            },
            'Brand': {
                'fields': ['Name'],
                'fieldsLabel': ['Nome'],
                'data': {},
                'fieldsMetaData': [
                    {
                        'Type' : 'Text',
                        'Label' : 'Nome',
                        'Field': 'Name'
                    }
                ]
            },
            'Client': {
                'fields': ['Name', 'Type', 'Email', 'Phone', 'PostalCode' , 'City', 'Street', 'State', 'Country'],
                'fieldsLabel': ['Nome', 'Tipo', 'Email', 'Telefone', 'CEP', 'Cidade', 'Rua', 'Estado', 'Pais'],
                'data': {}
            }
        }
    </script>
</head>
<body class="app {{containerClass}}" ng-controller="ItemController as c" ng-init="c.init()">
<div class="lds-css ng-scope loading" ng-if="c.loading == true" ng-model="c.loading">
    <div class="lds-rolling">
        <div></div>
    </div>
</div>
<div id="content" class="slds-context-bar">
    <div class="slds-context-bar__primary">
        <div
            class="slds-context-bar__item slds-context-bar__dropdown-trigger slds-dropdown-trigger slds-dropdown-trigger_click slds-no-hover">
            <span class="slds-context-bar__label-action slds-context-bar__app-name">
                <span class="slds-truncate" title="App Name">Car Shop</span>
            </span>
        </div>
    </div>
    <nav class="slds-context-bar__secondary" role="navigation">
        <ul class="slds-grid">
            <li id="tagSalesMan" class="slds-context-bar__item slds-is-active">
                <a ng-click="c.callPageGet('SalesMan')" class="slds-context-bar__label-action" title="SalesMan">
                    <span class="slds-truncate" title="SalesMan">SalesMan</span>
                </a>
            </li>
            <li id="tagCar" class="slds-context-bar__item">
                <a ng-click="c.callPageGet('Car')" class="slds-context-bar__label-action" title="Car">
                    <span class="slds-truncate" title="Car">Car</span>
                </a>
            </li>
            <li id="tagModel" class="slds-context-bar__item">
                <a ng-click="c.callPageGet('Model')" class="slds-context-bar__label-action" title="Model">
                    <span class="slds-truncate" title="Model">Model</span>
                </a>
            </li>
            <li id="tagBrand" class="slds-context-bar__item">
                <a ng-click="c.callPageGet('Brand')" class="slds-context-bar__label-action" title="Brand">
                    <span class="slds-truncate" title="Brand">Brand</span>
                </a>
            </li>
            <li id="tagClient" class="slds-context-bar__item">
                <a ng-click="c.callPageGet('Client')" class="slds-context-bar__label-action" title="Client">
                    <span class="slds-truncate" title="Client">Client</span>
                </a>
            </li>
        </ul>
    </nav>
    <button ng-click="c.createRecord()" class="slds-button slds-button_brand" style="margin: 2px 10px;">Novo</button>
</div>
    <div id="contentData" style="margin: 5px;">
    </div>
</body>
</html>
