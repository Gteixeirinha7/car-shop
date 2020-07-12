var app = angular.module('app', ['infinite-scroll']);

app.controller('ItemController', ['$scope', '$http', function ($scope, $http) {
    var c = this;
    c.loading = true;

    this.callPage = function (table, recordId = null) {
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

        $http.post('https://car-shop-ftt.herokuapp.com/' + table, body, req).then(function successCallback(response) { c.handleGET(response) }, function errorCallback(response) { c.errorHandleGET(response) });
    };
    this.errorHandleGET = function (response) {
    };
    this.handleGET = function (response) {
        this.loading = true;

        $scope.$apply(function () {
            var c = $scope.c;
            c.loading = false;
        });
    };
    this.initPage = function () {
        c.callPage('SalesMan');
    }
    window.onload = function () {
        c.initPage();
    }
}]);