const express = require('express');
const app = express();
const morgan = require('morgan');
const axios = require('axios');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser')
var xml2js = require('xml2js');
const sqlite3 = require('sqlite3').verbose();
//var btoa = require('btoa');//codifica
//var atob = require('atob');//decodifica
//const databases = require('./databases.json');


//setting---------------------------------------------------------------------------------------------------------------------------------
app.set('port', process.env.PORT || 3003);


//middlewares-----------------------------------------------------------------------------------------------------------------------------
app.use(morgan('dev'));
app.use(express.static('.'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//app.use(express.urlencoded({extended: false}));
//app.use(express.json());


//ANALIZA SI LA CUENTA GOOGLE ES NUEVA-----------------------------------------------------------------------------------------------------
function getDatabase(usuarioGoogle){

  const json_database3 = fs.readFileSync('src/databases.json','utf-8');
  let databases= JSON.parse(json_database3);
  var n = 0;
  let estado = false;
  databases.forEach(element =>{
      if (usuarioGoogle == element.usuarioGoogle){
           n ++;
      };

  });
  if (n == 0){
    const json_database = fs.readFileSync('src/databases.json','utf-8');
    let databases22 = JSON.parse(json_database);

    let newUsuario = {
      id : uuidv4(),
      usuarioGoogle,
      token: ""
    };

    databases22.push(newUsuario);

    const json_databases = JSON.stringify(databases22)
    fs.writeFileSync('src/databases.json', json_databases,'utf-8');
    console.log('se creo')
    

    databases.forEach(element =>{
      if (usuarioGoogle == element.usuarioGoogle){
           n ++;
      };
    });
  };
  if (n == 1) {
    databases.forEach(element =>{
      if (usuarioGoogle == element.usuarioGoogle && element.token.length > 10 ){
           n = 1000;
           estado = true;
      };
    });
  }
  return(estado)
}

//GUARDAR---------------------------------------------------------------------------------------------------------------------------------------


function guardar (usuarioGoogle,token){
  
  const json_database3 = fs.readFileSync('src/databases.json','utf-8');
  let databases= JSON.parse(json_database3);

  databases.forEach(element =>{
    if (usuarioGoogle == element.usuarioGoogle){
      cambiar = element.token = token;
    }
    });
  
  const json_databases = JSON.stringify(databases);
  fs.writeFileSync('src/databases.json', json_databases,'utf-8');
  //console.log(json_databases);
}

//BORRA--------------------------------------------------------------------------------------------------------------------------------------------


function borrar (usuarioGoogle){
  const json_database3 = fs.readFileSync('src/databases.json','utf-8');
  let databases= JSON.parse(json_database3);

  databases.forEach(element =>{
    if (usuarioGoogle == element.usuarioGoogle){
      cambiar = element.token = "";
    }
    });
  
  const json_databases = JSON.stringify(databases);
  fs.writeFileSync('src/databases.json', json_databases,'utf-8');
}

//PRIMERA CONSULTA----------------------------------------------------------------------------------------------------------------------------


app.post(/consulta/,(req, res)=>{

  const usuarioGoogle = req.body.usuarioGoogle;
  console.log(usuarioGoogle);

  var n2 = getDatabase(usuarioGoogle)
  console.log(n2)

  res.send(n2.toString());

});

//INICIO DE SESION -------------------------------------------------------------------------------------------------------------



app.post(/inicioSesion/,(req, res,)=>{

  var nombre = req.body.usuarioGoogle;
  var usuario = req.body.usuario;
  var contraseña = req.body.contraseña;

  console.log(usuario, contraseña)

  var xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
    <soapenv:Header/>
    <soapenv:Body>
       <tem:IniciaSesion>
          <!--Optional:-->
          <tem:usuario>${usuario}</tem:usuario>
          <!--Optional:-->
          <tem:clave>${contraseña}</tem:clave>
          <!--Optional:-->
          <tem:acceso>{Create}</tem:acceso>
          <!--Optional:-->
          <tem:rememberMe>false</tem:rememberMe>
          <!--Optional:-->
          <tem:deviceToLogin>Test</tem:deviceToLogin>
       </tem:IniciaSesion>
    </soapenv:Body>
 </soapenv:Envelope>`
   
  axios.post('http://abox-2-7-local.adapting.net/document-api.svc/soap',xml,
    {headers:
      {'Content-Type':'text/xml;charset=utf-8',
      'Accept-Encoding': 'gzip,deflate',
      'Content-Length':xml.length,
      'SOAPAction':"http://tempuri.org/ILegacyDocumentApi/IniciaSesion"}
    })
    .then(function (response) {
      console.log(response.data);
      var parser = new xml2js.Parser({explicitArray: false, trim: true});

      parser.parseString(response.data, (err, result) => {
        //console.log(result);
        var token = result['s:Envelope']['s:Body'].IniciaSesionResponse.IniciaSesionResult['a:exitvalue'];
        var errormsg = result['s:Envelope']['s:Body'].IniciaSesionResponse.IniciaSesionResult['a:errormsg'];

        if (token.length>10){
          guardar(nombre,token);
          console.log(token)
          res.send(true);
        } else{
        //console.log(errormsg,token);
          res.send(errormsg);
        }
      });

    })
    .catch(function (error) {
      console.log(error.response);
      res.send("error")
    });
});

//anexo----------------------------------------------------------------------------------------------------------------------------------------------------
function anexo (token,codigo,nArchivo,adjunto){
  var token2 = token
  var codigo2 = codigo
  var nArchivo2 = nArchivo
  var adjunto2 = adjunto
  let carga = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soapenv:Header/>
  <soapenv:Body>
     <tem:AnexarArchivo>
        <!--Optional:-->
        <tem:token>${token2}</tem:token>
        <!--Optional:-->
        <tem:codigo>${codigo2}</tem:codigo>
        <!--Optional:-->
        <tem:nombre>${nArchivo2}</tem:nombre>
        <!--Optional:-->
        <tem:descripcion></tem:descripcion>
        <!--Optional:-->
        <tem:bytearray_archivo>${adjunto2}</tem:bytearray_archivo>
     </tem:AnexarArchivo>
  </soapenv:Body>
</soapenv:Envelope>`;
  axios.post('http://abox-2-7-local.adapting.net/document-api.svc/soap',
            carga,
            {headers:
              {'Content-Type':'text/xml;charset=utf-8',
              'Accept-Encoding': 'gzip,deflate',
              'Content-Length':carga.length,
              'SOAPAction':"http://tempuri.org/ILegacyDocumentApi/AnexarArchivo"}
            })
            .then(function (response) {
              console.log(response.data);
            })
            .catch(function (error) {
              console.log(error);
            });

}

//CREAR DOCUMENTOS EN ABOX ---------------------------------------------------------------------------------------------------------
 app.post(/crearDocumento/,(req, res)=>{
  var asunto = req.body.asunto;
  var bodyCorreo = req.body.bodyCorreo;
  bodyCorreo=bodyCorreo.replace(/[^a-zA-Z0-9]/g," ");
  var usuarioGoogle = req.body.usuarioGoogle;
  var cuerpo = req.body.APrincipal;
  var adjunto = req.body.Asecundario;
  var nArchivo = req.body.nArchivo;
  var idMessage = 'idCorreo: '+req.body.idMessage;
  console.log(idMessage);
  var token = "";

  const json_database3 = fs.readFileSync('src/databases.json','utf-8');
  let databases= JSON.parse(json_database3);
  databases.forEach(element =>{
      if (usuarioGoogle == element.usuarioGoogle){
        token = element.token;
      }
  });
  //console.log(bodyCorreo);
  let xmls = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soapenv:Header/>
  <soapenv:Body>
     <tem:CreateDocument>
        <!--Optional:-->
         <tem:token>${token}</tem:token>
        <!--Optional:-->
        <tem:title>${asunto}</tem:title>
        <!--Optional:-->
        <tem:code/>
        <!--Optional:-->
        <tem:documentTypeCode>100.02.00.El.E#</tem:documentTypeCode>
        <!--Optional:-->
        <tem:folderCode>100.InBox.In</tem:folderCode>
        <!--Optional:-->
        <tem:description>${bodyCorreo}</tem:description>
        <!--Optional:-->
        <tem:keywords/>
        <!--Optional:-->
        <tem:filename>${usuarioGoogle}.eml</tem:filename>
        <!--Optional:-->
        <tem:fileDescription/>
        <!--Optional:-->
        <tem:fileBytearray>${cuerpo}</tem:fileBytearray>
        <!--Optional:-->
        <tem:metadataValues><![CDATA[<?xml version="1.0" encoding="UTF-8"?>
        <metadataValues>
        <metadataValue code="Doc.Radicacion.Anexos">${idMessage}</metadataValue>
        <metadataValue code="Doc.Radicacion.Anexos">${idMessage}</metadataValue>
        </metadataValues>]]></tem:metadataValues>
     </tem:CreateDocument>
  </soapenv:Body>
</soapenv:Envelope>`;

  axios.post('http://abox-2-7-local.adapting.net/document-api.svc/soap',
           xmls,
           {headers:
             {'Content-Type':'text/xml;charset=utf-8',
             'Accept-Encoding': 'gzip,deflate',
             'Content-Length':xmls.length,
             'SOAPAction':"http://tempuri.org/ILegacyDocumentApi/CreateDocument"}
           })
           .then(resp=>{

            var idDocumento = "";
            var msgerror = "";
            var codigo = "";

            var parser = new xml2js.Parser({explicitArray: false, trim: true});
            parser.parseString(resp.data, (err, result) => {

               msgerror = result['s:Envelope']['s:Body'].CreateDocumentResponse.CreateDocumentResult['a:errormsg'];
               idDocumento = result['s:Envelope']['s:Body'].CreateDocumentResponse.CreateDocumentResult['a:guidvalue'];
               codigo = result['s:Envelope']['s:Body'].CreateDocumentResponse.CreateDocumentResult['a:exitvalue'];

            });

            if (adjunto.length > 0){
              anexo(token,codigo,nArchivo,adjunto);
              console.log(anexo)
            }

            if (msgerror == ""){
             console.log(resp.data);
             res.send("Documento creado id: "+idDocumento);

            } else {

                console.log(msgerror);
                res.send(msgerror);

                if (msgerror = "No está autorizado o la sesión ha caducado."){
                  borrar(usuarioGoogle)
                  console.log('cerro sesion')
              }
            }
            })
           .catch(err=>{
             //console.log(err.response.data);
             console.log(err.response.data);
             res.send("ERROR al crear documento")
            });
 });


//CERRAR SESION--------------------------------------------------------------------------------------------------------------------------
 app.post(/cerrarSesion/,(req, res)=>{

    var usuarioGoogle = req.body.usuarioGoogle
    borrar(usuarioGoogle);

    console.log('cerro sesion');

    res.send('sesion cerrada');
 });



 app.post(/prueba/,(req, res)=>{

  var idcuenta = req.body.usuarioGoogle;
  var usuario = req.body.usuario;
  var contraseña = req.body.contraseña;
  console.log(idcuenta,usuario,contraseña);
  res.send(idcuenta)

 });
//server-------------------------------------------------------------------------------
app.listen(app.get('port'), () => {
    console.log (`Servidor on port ${app.get('port')}`);
});