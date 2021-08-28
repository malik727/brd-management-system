import axiosInstance from "../axios/axios_jwt";

const resources = {};

var LiveSearch = (function() {
    var query = "";
    let result;
    let cancel;
    let status;
    var getQueryResults = () => {
        return new Promise ((resolve, reject) => {
            if (cancel) {
                cancel.cancel();
            }
            // Create a new CancelToken
            cancel = axiosInstance.CancelToken.source();
            // Check if the query result has cache
            if (resources[query]) {
                result = resources[query];
                resolve();
            }
            axiosInstance.get(query, { cancelToken: cancel.token })
            .then((response) => {
                result = response.data;
                status = response.status;
                // Store response
                resources[query] = result;
                resolve();
            }).catch(error => {
                status = error.response.status;
                resolve();
            });
        });
    }
    var setQuery = (val) => {
        query = val;
    }
    var getResults = () => {
        return result;
    }
    var getStatus = () => {
        return status;
    }
    return {
        getQueryResults:getQueryResults,
        setQuery:setQuery,
        getResults:getResults,
        getStatus:getStatus
    };
})();

export default LiveSearch;