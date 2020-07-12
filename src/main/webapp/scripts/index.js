var app = angular.module('app', ['infinite-scroll']);

app.controller('ItemController', ['$scope', '$http', function ($scope, $http) {
    var c = this;
    c.loading = true;

    this.callPage = function (table) {
        var req = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IlNzWnNCTmhaY0YzUTlTNHRycFFCVEJ5TlJSSSIsImtpZCI6IlNzWnNCTmhaY0YzUTlTNHRycFFCVEJ5TlJSSSJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvNmJiNDkwNDAtMTkyYy00NmUwLWFiZjEtM2Y3YmFjZTQ2ZmQxLyIsImlhdCI6MTU5NDIzODUyNSwibmJmIjoxNTk0MjM4NTI1LCJleHAiOjE1OTQyNDI0MjUsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJFMkJnWUpqMlVFYzY2WlQ3dVYwTGVvM1Bmbk4wWncyLzh5UzE2NTBucjZPMHJmS1BDRVVBIiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6IjM0YjlmYmY4LWM2MTItNGMxOS05Y2JlLTU2M2RmZWU1MWZjMSIsImFwcGlkYWNyIjoiMSIsImZhbWlseV9uYW1lIjoiQklfREVWIiwiZ2l2ZW5fbmFtZSI6IlRJIiwiaXBhZGRyIjoiMTc3LjE5MC4yMDAuMzAiLCJuYW1lIjoiVEkgQkkgREVWIiwib2lkIjoiZTQ2MjE3NDItNDI2YS00YWMyLWFkNDUtY2EyNDFkZDEwYTQ4Iiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTEwMDQzMzYzNDgtMjExMTY4NzY1NS0xODAxNjc0NTMxLTM0MzYyIiwicHVpZCI6IjEwMDMyMDAwNDVEOERBMzQiLCJzY3AiOiJBcHAuUmVhZC5BbGwgQ2FwYWNpdHkuUmVhZC5BbGwgQ2FwYWNpdHkuUmVhZFdyaXRlLkFsbCBDb250ZW50LkNyZWF0ZSBEYXNoYm9hcmQuUmVhZC5BbGwgRGFzaGJvYXJkLlJlYWRXcml0ZS5BbGwgRGF0YWZsb3cuUmVhZC5BbGwgRGF0YWZsb3cuUmVhZFdyaXRlLkFsbCBEYXRhc2V0LlJlYWQuQWxsIERhdGFzZXQuUmVhZFdyaXRlLkFsbCBHYXRld2F5LlJlYWQuQWxsIEdhdGV3YXkuUmVhZFdyaXRlLkFsbCBSZXBvcnQuUmVhZC5BbGwgUmVwb3J0LlJlYWRXcml0ZS5BbGwgU3RvcmFnZUFjY291bnQuUmVhZC5BbGwgU3RvcmFnZUFjY291bnQuUmVhZFdyaXRlLkFsbCBXb3Jrc3BhY2UuUmVhZC5BbGwgV29ya3NwYWNlLlJlYWRXcml0ZS5BbGwiLCJzdWIiOiJvcjlpTm1nSjZQTVlZWkRCaXJfOEdwOWM5eFVEUlNVY1FIMTl2NVAxelBRIiwidGlkIjoiNmJiNDkwNDAtMTkyYy00NmUwLWFiZjEtM2Y3YmFjZTQ2ZmQxIiwidW5pcXVlX25hbWUiOiJ0aS5iaV9kZXZAY2FtaWwuY29tLmJyIiwidXBuIjoidGkuYmlfZGV2QGNhbWlsLmNvbS5iciIsInV0aSI6InhsS2phMHdLQVVPcXFJNHE2V293QUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImE5ZWE4OTk2LTEyMmYtNGM3NC05NTIwLThlZGNkMTkyODI2YyJdfQ.cb-7bDpGAWVmtVdBkZHNoCnzi3vUqDeSrJIuSygItfVv9gyHs9jNFsh3fvWo_V_6_qAKoeoKzRo4VAFkkIpWyxdPgY3gRDKOSa0AY4mqhjzkpB5WZu2fUjVhfEnKyL6nCsFaX45HJYTnBCKcLOt9UEyoEtHSEZD1aed1PG0ZrcwIkZW98smvmXPSeGHiiA9p8zK5MdhSOh5jcGiD-CgWD-BmXTD85ngFXhiitY9pb6F9hXTgtKiwecfIta-AVTw9BQ8eaVwF4reo49F0BNzXgEO-zE4TYy8AlKDDgbGxbwLVRe91WPLWKVomb6gIOOJQBoCNRDbUAuDNUh8N4K2ANA'
            }
        }

        $http.post('https://api.powerbi.com/v1.0/myorg/groups/' + window.config.groupId + '/reports/' + window.config.reportId + '/GenerateToken', c.identities, req).then(function successCallback(response) { debugger; c.handlePowerBIDash(response) }, function errorCallback(response) { c.errorHandlePowerBIDash(response) });
    };
    this.handlePowerBIDash = function (response) {
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