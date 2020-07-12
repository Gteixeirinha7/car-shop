<html  xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ng-app="app">
<head>
    <meta name="viewport" content="width=device-width, user-scalable=no" />
    <script src="/scripts/index.js" type="text/javascript"></script>
    <script src="/scripts/jquery-3.5.1.min.js" type="text/javascript"></script>
    <script src="/scripts/angular.min.js" type="text/javascript"></script>
    <script src="/style/styles/salesforce-lightning-design-system.min.css" type="text/css"></script>
    <script type="text/javascript">
        window.config = {
            'SalesMan' : {
                'fields' : ''
            },
            'Car': {
                'fields': ''
            },
        }
    </script>
</head>
<body  ng-controller="ItemController as c" ng-class="{noscroll: c.loading}">
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
            <li class="slds-context-bar__item slds-is-active">
                <a href="javascript:void(0);" class="slds-context-bar__label-action" title="Home">
                    <span class="slds-truncate" title="Home">SalesMan</span>
                </a>
            </li>
            <li class="slds-context-bar__item">
                <a href="javascript:void(0);" class="slds-context-bar__label-action" title="Menu Item">
                    <span class="slds-truncate" title="Menu Item">Car</span>
                </a>
            </li>
            <li class="slds-context-bar__item">
                <a href="javascript:void(0);" class="slds-context-bar__label-action" title="Menu Item">
                    <span class="slds-truncate" title="Menu Item">Model</span>
                </a>
            </li>
            <li class="slds-context-bar__item">
                <a href="javascript:void(0);" class="slds-context-bar__label-action" title="Menu Item">
                    <span class="slds-truncate" title="Menu Item">Brand</span>
                </a>
            </li><li class="slds-context-bar__item">
                <a href="javascript:void(0);" class="slds-context-bar__label-action" title="Menu Item">
                    <span class="slds-truncate" title="Menu Item">Client</span>
                </a>
            </li>
        </ul>
    </nav>
</div>
</body>
</html>
