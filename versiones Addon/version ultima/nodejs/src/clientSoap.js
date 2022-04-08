var soap = require('soap');

//var url = "http://abox-2-7-local.adapting.net/document-api.svc?wsdl";
/*

function getServerInfo (url)
{
    soap.createClient(url, function(err, client) {
        if(!err)
        {
            var args = {usuario:usuario, clave:password, acceso:"{Create}", rememberMe: false, deviceToLogin:""}
            client.IniciaSesion(args, function(err, result)
            {
                if(!err){

                    if(result.IniciaSesionResult.errormsg == "")
                    {
                    var h = {error:"",message:result.IniciaSesionResult};
                    return h  
                    }
                }
            });
        }
        else{
            return({"error":true,"message":err});
        }
    });
}*/
llamada();

async function llamada()
{
    var y = await log("http://abox-2-7-local.adapting.net/document-api.svc?wsdl");
}


async function log(url) {
    try
    {
        var y = await soap.createClient(url, async function(err, client){
            if(!err)
            {
                var args = {usuario:"partner", clave:"Pti12ada", acceso:"{Create}", rememberMe: false, deviceToLogin:""}
                var i = await client.IniciaSesion(args, function(err, result)
                {

                    var h = {error:"",message:result.IniciaSesionResult};
                    return h 

                });
            }
        });
    }
    catch (ee)
    {
        console.log(ee);
    }

};
