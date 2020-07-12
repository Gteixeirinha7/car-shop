<html  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<head>
    <meta name="viewport" content="width=device-width, user-scalable=no" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="/scripts/angular.min.js" type="text/javascript"></script>
    <link rel="stylesheet" type="text/css" href="/style/styles/salesforce-lightning-design-system.min.css">
    <script src="/scripts/index.js" type="text/javascript"></script>
    <script type="text/javascript">
        window.config = {
            'SalesMan' : {
                'fields' :     ['Name', 'CPF', 'Age'],
                'fieldsLabel': ['Nome' ,'CPF', 'Idade']
            },
            'Car': {
                'fields': ''
            },
        }
    </script>
</head>
<body  ng-app="app" ng-controller="ItemController as c" ng-class="{noscroll: c.loading}">
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
                <a onclick="c.callPage('SalesMan')" class="slds-context-bar__label-action" title="SalesMan">
                    <span class="slds-truncate" title="SalesMan">SalesMan</span>
                </a>
            </li>
            <li id="tagCar" class="slds-context-bar__item">
                <a onclick="c.callPage('Car')" class="slds-context-bar__label-action" title="Car">
                    <span class="slds-truncate" title="Car">Car</span>
                </a>
            </li>
            <li id="tagModel" class="slds-context-bar__item">
                <a onclick="c.callPage('Model')" class="slds-context-bar__label-action" title="Model">
                    <span class="slds-truncate" title="Model">Model</span>
                </a>
            </li>
            <li id="tagBrand" class="slds-context-bar__item">
                <a onclick="c.callPage('Brand')" class="slds-context-bar__label-action" title="Brand">
                    <span class="slds-truncate" title="Brand">Brand</span>
                </a>
            </li>
            <li id="tagClient" class="slds-context-bar__item">
                <a onclick="c.callPage('Client')" class="slds-context-bar__label-action" title="Client">
                    <span class="slds-truncate" title="Client">Client</span>
                </a>
            </li>
        </ul>
    </nav>
    <div id="contentData" class="slds-context-bar">
    </div>
</div>
</body>
</html>
