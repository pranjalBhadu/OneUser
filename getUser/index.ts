import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import {TelemetryProvider} from 'opentelemetrywrapper'
const connstr = "InstrumentationKey=e42c6ebf-ab37-42b5-9993-6ea44d52f6bf;IngestionEndpoint=https://centralindia-0.in.applicationinsights.azure.com/;LiveEndpoint=https://centralindia.livediagnostics.monitor.azure.com/"
const axios = require("axios").default;

const tp = new TelemetryProvider("http user app", "0.1.0", connstr);

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const span = TelemetryProvider.startTracing("User Index")
    const idx = (req.query.index || (req.body && req.body.index));
    var responseMessage: string;
    if(idx!=undefined){
        if(idx<=0 && idx>10){
            context.log("Please enter user index from 1 to 10")
        }else{
            context.log("The data for user index "+idx)
        }
    }else{
        context.log("Please enter a user index to fetch data")
    }

    const span1 = TelemetryProvider.startTracing("User Data", span)
    let userData: JSON;
    const reqData = await axios.get('https://user-dashboard.azurewebsites.net/api/showDashboard?')
    .then(users => { 
        userData = users.data[idx-1]; 
    })
    .catch(err => {console.log("unable to get users")})
    TelemetryProvider.endTracing(span1)
    TelemetryProvider.endTracing(span)
    const span3 = TelemetryProvider.startTracing("sending context data")
    if(userData!=null){
        context.res = {
            body: userData
        };
    }
    else{
        context.res ={ 
            body: "Enter a user index to get data"
        }
    }
    TelemetryProvider.endTracing(span3)

};

export default httpTrigger;