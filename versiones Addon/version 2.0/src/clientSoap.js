var soap = require('soap');
var parserXml = require('xml2json');
const funciones = require('./funciones');

async function hola (){
    soap.createClient("https://cronos.superservicios.gov.co/document-api.svc?wsdl", function(err, client) {
        if(!err)
        {
            var args = {usuario: "admin",
            clave: "Pti12ada",
            acceso: "{Create}",
            rememberMe: "false",
            deviceToLogin: ""};
            client.IniciaSesion(args, function(err, result)
            {
                if(!err){
                    var args2 = {token: result.IniciaSesionResult.exitvalue,
                    entity: "document"};
                    client.FindAllEntityTypesByUser(args2, function(err, result){
                        console.log(result);
                    })
                }
                else{
                    return err;
                  //res.send(JSON.stringify({"error":true,"message":err}));
                }
            });
        }
        else{
          //funciones.log("ERROR",err)
            return err;
          //res.send(JSON.stringify({"error":true,"message":err}));
        }
      });
}

hola();
