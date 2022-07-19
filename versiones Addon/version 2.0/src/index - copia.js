const express = require('express');
const app = express();
require('dotenv').config();
const morgan = require('morgan');
const axios = require('axios');
const fs = require('fs');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');
const { base64encode } = require('nodejs-base64');
const https = require('https');
const sql = require('mssql')
var parserXml = require('xml2json');
const path = require('path')
const funciones = require('./funciones');
var soap = require('soap');
const { log } = require('console');


//setting---------------------------------------------------------------------------------------------------------------------------------
app.set('port', process.env.PORT || 3001);

//middlewares-----------------------------------------------------------------------------------------------------------------------------
app.use(morgan('dev'));
app.use(express.static(__dirname +'/login'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


//ANALIZA SI LA CUENTA GOOGLE ES NUEVA-----------------------------------------------------------------------------------------------------
app.post(/consulta/,async(req, res)=>{

  const usuarioGoogle = req.body.usuarioGoogle;
  //console.log(usuarioGoogle);
  var estado = false;

  var dabaBase = await funciones.conexion();
  
  if (dabaBase == true)
  {

    const result = await sql.query(`SELECT * FROM GmailAccounts WHERE usuarioGoogle ='${usuarioGoogle}' ;`)
    //console.log(result.rowsAffected.length)

    if (result.recordset.length==0){

      var inse = await sql.query(`INSERT INTO GmailAccounts (usuarioGoogle) VALUES ('${usuarioGoogle}');`)
      //console.log(inse);
      if (inse.rowsAffected[0]==1)
      {
        console.log('insertado: ',usuarioGoogle);
        estado = 'primeraVez'

        funciones.log("INFO",'Primera vez '+usuarioGoogle)

        res.send(JSON.stringify({ tipoDocumental: [], estado:estado}));
        sql.close()
      }
      else
      {
        res.send(JSON.stringify({ tipoDocumental: [], estado:estado}));
      }

    }
    else
    {
      //query donde consulte si el usuarioGoogle tiene token
      if (result.recordset[0].token != null && result.recordset[0].documentTypeCode != null)
      {
        estado = true
        sql.close()
        //console.log(estado);
        res.send(JSON.stringify({ estado:estado, tipoDocumental: result.recordset[0].documentTypeCode, tipoDefault:result.recordset[0].documentTypeDefault, folders:result.recordset[0].folders, folderDefailt:result.recordset[0].folderDefault}))

      }
      else
      {
        if (result.recordset[0].documentTypeCode == null)
        {
          estado = 'primeraVez'
          sql.close()
          //console.log(estado);
          res.send(JSON.stringify({ tipoDocumental: [], estado:estado}))

        }
        else
        {
          sql.close()
          //console.log(estado);
          res.send(JSON.stringify({ tipoDocumental: [], estado:estado}))
        }

      }
        
    }

  }
  else
  {
    funciones.log("ERROR",'conexion a la base de datos fracaso '+usuarioGoogle)

    console.log('conexion a la base de datos fracaso');
    res.send('conexion a la base de datos fracaso');
  }

});


//URL SOAP ------------------------------------------------------------------------------------------------------------------------------------
//Verifica si la url de abox ingresada tiene la api de document

app.post(/servicioSoap/,(req,res)=>{

  var url = req.body.urlSoap

  soap.createClient(url, function(err, client) {
    if(!err)
    {
        client.GetServerInfo("", function(err, result)
        {
            if(!err){
              res.send(JSON.stringify({"error":"","message":result.GetServerInfoResult}));
            }
            else{
              res.send(JSON.stringify({"error":true,"message":err}));
            }
        });
    }
    else{
      funciones.log("ERROR",err)
      res.send(JSON.stringify({"error":true,"message":err}));
    }
  });
  
})


app.post(/Inicio/,async(req, res,)=>{

  console.log("");
  res.send(JSON.stringify({"error":true,"message":"0"}));
});


//INICIO DE SESION --------------------------------------------------------------------------------------------------------------------
//Inicia sesion en abox mediante el servicio soap, antes de iniciar verefica si los datos son correctos para guardarlos en el json (de momento)
app.post(/inicioSesion/,async(req, res,)=>{
  
  var usuarioGmail = req.body.usuarioGmail;
  var usuario = req.body.usuario;
  var password = req.body.contrasena;
  var urlAbox = req.body.urlAbox;
  var urlSoap = req.body.urlSoap;
  var token = "";
  var errormsg = null
  var obje = [];
  //var objeFolder = [];
  var objeFolder = [{nombre : "", codigo: ""}];
  
    try
    {
      var dataXml = await funciones.iniciaSesion(urlSoap, usuario, password);
      var dataJson = JSON.parse(parserXml.toJson(dataXml.data)); 
      errormsg = dataJson["s:Envelope"]["s:Body"].IniciaSesionResponse.IniciaSesionResult["a:errormsg"];
      
        if(dataJson["s:Envelope"]["s:Body"].IniciaSesionResponse.IniciaSesionResult["a:exitvalue"].length > 5)
        {
            token = dataJson["s:Envelope"]["s:Body"].IniciaSesionResponse.IniciaSesionResult["a:exitvalue"];
            var dataXmlDocument ="";
            var dataCXmlDocument = "";

            try
            {
              dataXmlDocument = await funciones.findAllEntityTypesByUser(urlSoap, token);
              
            }
            catch(e)
            {
              res.send(JSON.stringify({"error":true,"message":"Por favor configurar el metodo: Find All Entity Types By User"}));
              funciones.log("ERROR",ee.message+" "+usuarioGmail)
            }
            
            var dataJsonDocument = JSON.parse(parserXml.toJson(dataXmlDocument.data));
            var dataJsonDocumentFolder ="";
			      var err = dataJsonDocument["s:Envelope"]["s:Body"].FindAllEntityTypesByUserResponse.FindAllEntityTypesByUserResult["a:errormsg"];
            
            if(err.length>0)
            {
              res.send(JSON.stringify({"error":true,"message":err}));
            }

            try{
              dataCXmlDocument = await funciones.findAllFolderByUser(urlSoap, token);
              dataJsonDocumentFolder = JSON.parse(parserXml.toJson(dataCXmlDocument.data));
              var errCarpeta = dataJsonDocumentFolder["s:Envelope"]["s:Body"].FindAllEntityTypesByUserResponse.FindAllEntityTypesByUserResult["a:errormsg"];
              if(errCarpeta.length>0)
              {
                res.send(JSON.stringify({"error":true,"message":errCarpeta}));
              }
            }
            catch(er){
              res.send(JSON.stringify({"error":true,"message": er}));
              funciones.log("INFO",er+" "+usuarioGmail)
            }
            
            
              if(dataJsonDocument['s:Envelope']['s:Body'].FindAllEntityTypesByUserResponse.FindAllEntityTypesByUserResult['a:exitvalue'] != 'does not have a documentary type assigned')
              {
                var entityTypeByUser = JSON.parse(parserXml.toJson(dataJsonDocument['s:Envelope']['s:Body'].FindAllEntityTypesByUserResponse.FindAllEntityTypesByUserResult['a:exitvalue'])).dsDocument.TiposDocumentales;
                var folderByUser = JSON.parse(parserXml.toJson(dataJsonDocumentFolder["s:Envelope"]["s:Body"].FindAllEntityTypesByUserResponse.FindAllEntityTypesByUserResult["a:exitvalue"])).dsDocument.Carpetas;

                if (entityTypeByUser.length)
                {
                    for (var i = 0; i < entityTypeByUser.length; i++)
                    {
                      obje.push({nombre : entityTypeByUser[i].nombre, tipo : entityTypeByUser[i].codigoTipo});
                    }

                    if(folderByUser!=null && folderByUser.length)
                    {
                      folderByUser.forEach(element => {
                        objeFolder.push({nombre : element.nombre, codigo: element.codigo})
                      });
                    }
                    else if (folderByUser!=null){
                      objeFolder.push({nombre : folderByUser.nombre, codigo: folderByUser.codigo})
                    }

                    
                    var guarda = await funciones.guardar(usuarioGmail,token,urlAbox,urlSoap,usuario,JSON.stringify(obje), JSON.stringify(objeFolder));
                    if(guarda == true)
                    {
                      res.send(JSON.stringify({"error":"","message":obje, "folders":objeFolder}));
                    }
                    else
                    {
                      res.send(JSON.stringify({"error":true,"message":guarda}));
                      funciones.log("INFO",guarda+" "+usuarioGmail)
                    }

                }
                else
                {
                    obje.push({nombre : entityTypeByUser.nombre, tipo : entityTypeByUser.codigoTipo});

                    if(folderByUser!=null && folderByUser.length)
                    {
                      folderByUser.forEach(element => {
                        objeFolder.push({nombre : element.nombre, codigo: element.codigo})
                      });
                    }
                    else if (folderByUser!=null){
                      objeFolder.push({nombre : folderByUser.nombre, codigo: folderByUser.codigo})
                    }

                    var guarda = await funciones.guardar(usuarioGmail,token,urlAbox,urlSoap,usuario,JSON.stringify(obje),JSON.stringify(objeFolder));
                    if(guarda == true)
                    {
                      res.send(JSON.stringify({"error":"","message":obje, "folders":objeFolder}));
                    }
                    else
                    {
                      res.send(JSON.stringify({"error":true,"message":guarda}));
                      funciones.log("INFO",guarda+" "+usuarioGmail)
                    }
                }
              }
              else
              {
                funciones.log("INFO",'does not have a documentary type assigned '+usuarioGmail)
                res.send(JSON.stringify({"error":true,"message":'does not have a documentary type assigned'}));
              }
          
        }
        else
        {
          res.send(JSON.stringify({"error":true,"message":errormsg}));
          funciones.log("INFO",errormsg+" "+usuarioGmail)
        }
      
    }
    catch(ee)
    {
      //console.log(ee.message);
      res.send(JSON.stringify({"error":true,"message":ee.message}));
      
      funciones.log("ERROR",ee.message+" "+usuarioGmail)
    }

});


app.post(/saveDocumentTypeDefault/,async(req, res,)=>{

  var usuarioGmail = req.body.usuarioGmail;
  var documentTypeDefault = req.body.documentTypeDefault;
  var folderDefailt = req.body.folderDefailt;

  var dabaBase = await funciones.conexion();

  if (dabaBase == true){
    const result = await sql.query(`UPDATE GmailAccounts SET documentTypeDefault='${documentTypeDefault}', folderDefault='${folderDefailt != undefined ? folderDefailt : "NULL"}' WHERE usuarioGoogle='${usuarioGmail}';`)

    if (result.rowsAffected[0]==1){

      console.log('guardado tipo documental default '+usuarioGmail)
      sql.close()
      res.send(JSON.stringify({mensaje:"guardado"}))
      
    } else{

      sql.close()
      console.log('no guardo tipo documental default '+usuarioGmail)
      res.send(JSON.stringify({mensaje:"no guardo"}))

    }
    
  }
  
});

//---------------------------------------------------------------------------------------------------------------------------------------------



app.post(/identificarse/,async(req, res,)=>{

  var usuarioGmail = req.body.usuarioGmail;
  var datos = await funciones.getDatos(usuarioGmail);
  var usuario = req.body.usuario;
  var password = req.body.contrasena;
  var token = "";
  var errormsg = null
  var obje = [];
  var objeFolder = [{nombre : "", codigo: ""}];

  try
  {
    var dataXml = await funciones.iniciaSesion(datos.urlSoap, usuario, password);
    var dataJson = JSON.parse(parserXml.toJson(dataXml.data)); 
    errormsg = dataJson["s:Envelope"]["s:Body"].IniciaSesionResponse.IniciaSesionResult["a:errormsg"];
    
      if(dataJson["s:Envelope"]["s:Body"].IniciaSesionResponse.IniciaSesionResult["a:exitvalue"].length > 5){

          token = dataJson["s:Envelope"]["s:Body"].IniciaSesionResponse.IniciaSesionResult["a:exitvalue"];
          
          var dataXmlDocument = "";
          var dataCXmlDocument = "";
          try
          {
            dataXmlDocument = await funciones.findAllEntityTypesByUser(datos.urlSoap, token);
            
          }
          catch(e)
          {
            res.send(JSON.stringify({"error":true,"message":"Por favor configurar el metodo: Find All Entity Types By User"}));
            funciones.log("ERROR",ee.message+" "+usuarioGmail)
          }
          var dataJsonDocument = JSON.parse(parserXml.toJson(dataXmlDocument.data));
          var dataJsonDocumentFolder ="";
          var err = dataJsonDocument["s:Envelope"]["s:Body"].FindAllEntityTypesByUserResponse.FindAllEntityTypesByUserResult["a:errormsg"];
          if(err.length>0)
          {
            res.send(JSON.stringify({"error":true,"message":"Ocurrio un error: "+err}));
          }

          try{
            dataCXmlDocument = await funciones.findAllFolderByUser(datos.urlSoap, token);
            dataJsonDocumentFolder = JSON.parse(parserXml.toJson(dataCXmlDocument.data));
            var errCarpeta = dataJsonDocumentFolder["s:Envelope"]["s:Body"].FindAllEntityTypesByUserResponse.FindAllEntityTypesByUserResult["a:errormsg"];
            if(errCarpeta.length>0)
            {
              res.send(JSON.stringify({"error":true,"message":errCarpeta}));
            }
          }
          catch(er){
            res.send(JSON.stringify({"error":true,"message": er}));
            funciones.log("INFO",er+" "+usuarioGmail)
          }
			
            if(dataJsonDocument['s:Envelope']['s:Body'].FindAllEntityTypesByUserResponse.FindAllEntityTypesByUserResult['a:exitvalue'] != 'does not have a documentary type assigned')
            {
              var entityTypeByUser = JSON.parse(parserXml.toJson(dataJsonDocument['s:Envelope']['s:Body'].FindAllEntityTypesByUserResponse.FindAllEntityTypesByUserResult['a:exitvalue'])).dsDocument.TiposDocumentales;
              var folderByUser = JSON.parse(parserXml.toJson(dataJsonDocumentFolder["s:Envelope"]["s:Body"].FindAllEntityTypesByUserResponse.FindAllEntityTypesByUserResult["a:exitvalue"])).dsDocument.Carpetas;
              if (entityTypeByUser.length)
              {
                if(folderByUser!=null && folderByUser.length)
                {
                  folderByUser.forEach(element => {
                    objeFolder.push({nombre : element.nombre, codigo: element.codigo})
                  });
                }
                else if (folderByUser!=null){
                  objeFolder.push({nombre : folderByUser.nombre, codigo: folderByUser.codigo})
                }

                  for (var i = 0; i < entityTypeByUser.length; i++)
                  {
                    obje.push({nombre : entityTypeByUser[i].nombre, tipo : entityTypeByUser[i].codigoTipo});
                  }

                  
                  var guarda = await funciones.guardar(usuarioGmail,token,datos.urlAbox,datos.urlSoap,usuario,JSON.stringify(obje),JSON.stringify(objeFolder));
                  if(guarda == true)
                  {
                    res.send(JSON.stringify({"error":"","message":obje,"folders":objeFolder}));
                  }
                  else
                  {
                    res.send(JSON.stringify({"error":true,"message":guarda}));
                    funciones.log("INFO",guarda+" "+usuarioGmail)
                  }

              }
              else
              {
                  obje.push({nombre : entityTypeByUser.nombre, tipo : entityTypeByUser.codigoTipo});

                  if(folderByUser!=null && folderByUser.length)
                  {
                    folderByUser.forEach(element => {
                      objeFolder.push({nombre : element.nombre, codigo: element.codigo})
                    });
                  }
                  else if (folderByUser!=null){
                    objeFolder.push({nombre : folderByUser.nombre, codigo: folderByUser.codigo})
                  }

                  var guarda = await funciones.guardar(usuarioGmail,token,datos.urlAbox,datos.urlSoap,usuario,JSON.stringify(obje),JSON.stringify(objeFolder));
                  if(guarda == true)
                  {
                    res.send(JSON.stringify({"error":"","message":obje, "folders":objeFolder}));
                  }
                  else
                  {
                    res.send(JSON.stringify({"error":true,"message":guarda}));
                    funciones.log("INFO",guarda+" "+usuarioGmail)
                  }
              }
            }
            else
            {
              funciones.log("INFO",'does not have a documentary type assigned '+usuarioGmail)
              res.send(JSON.stringify({"error":true,"message":'does not have a documentary type assigned'}));
            }
        
      }
      else
      {
        res.send(JSON.stringify({"error":true,"message":errormsg}));
        funciones.log("INFO",errormsg+" "+usuarioGmail)
      }
    
  }
  catch(ee)
  {
    res.send(JSON.stringify({"error":true,"message":ee.message}));
    
    funciones.log("ERROR",ee.message+" "+usuarioGmail)
  }
});

//anexo----------------------------------------------------------------------------------------------------------------------------------------------------

/**

 * Carga el fichero como anexo segundario del documento

 * @param  {string}

 * @return  {boolean}

 */
function anexo (token,codigo,nArchivo,adjunto,urlSoa){
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
  axios.post(urlSoa,
            carga,
            {headers:
              {'Content-Type':'text/xml;charset=utf-8',
              'Accept-Encoding': 'gzip,deflate',
              'Content-Length':carga.length,
              'SOAPAction':"http://tempuri.org/ILegacyDocumentApi/AnexarArchivo"}
            })
            .then(function (response) {
              //console.log(response.data);
              return true
            })
            .catch(function (error) {
              console.log(error)
              console.log('error al cargar el archivo')
              //console.log(error);
              return false
            });

}

//CREAR DOCUMENTOS EN ABOX ---------------------------------------------------------------------------------------------------------
/*
  Crea el documento en abox usando el la api document
  - carga en el anexo principal del documento un eml del correo original
  - cargar los demas datos en del correo en los metadatos
  */
function sliceText(text) {
  var inicio = text.search("<")+1;
  var fin = text.search(">");
  var newText = text.slice(inicio,fin);
  return newText;
}




app.post(/crearDocumento/,async(req, res)=>{

  var usuarioGmail = req.body.usuarioGoogle;

  var nCedula = req.body.nCedula;

  var validacion = funciones.getDatos(usuarioGmail,nCedula);

  if(validacion == null){
    res.send(JSON.stringify({exito: false,mensaje : "Usuario no ah iniciado sesion"}));
  }

  var asunto = req.body.asunto;

  var entityType = req.body.documenType;

  var folder = "";

  if(req.body.folder === undefined || req.body.folder == "null")
  {
    folder = "";
  }
  else
  {
    folder = req.body.folder;
  }

  var cuerpo = req.body.APrincipal;
  //var eml = base64encode(cuerpo);
  //var encoding = new UnicodeEncoding();
  //var eml = btoa(cuerpo)
  var eml = Buffer.from(cuerpo).toString('base64')
  var bodyCorreo = req.body.bodyCorreo;
  bodyCorreo=bodyCorreo.replace(/[^a-zA-Z0-9]/g," ");

  var idMessage = req.body.idMessage;

  var mailFrom = req.body.mailFrom;
  mailFrom = sliceText(mailFrom);

  var mailCC = req.body.mailCC;
  mailCC = mailCC.replace(/<|>/g,"");

  var mailDate = req.body.mailDate;
  var a = new Date(mailDate);
  var mes = a.getMonth()+1
  var fecha = a.getDate() +"/"+mes +"/"+a.getFullYear() +" "+a.getHours()+":"+a.getMinutes()

  var mailTo = req.body.mailTo;
  mailTo = mailTo.replace(/<|>/g,"");
  
  var mailContentType = req.body.mailContentType;

  var mailMimeVersion = req.body.mailMimeVersion;

  var mailSize = req.body.mailSize;

  var checkAdjuntos = req.body.checkAdjuntos;

  var adjunto = ""
  if (checkAdjuntos=='true'){
    adjunto = await funciones.getattachments(cuerpo)
  }

  var datos = await funciones.getDatos(usuarioGmail);

  var metadataValue = `<![CDATA[<?xml version="1.0" encoding="UTF-8"?>
                              <metadataValues>
                              <metadataValue code="mailFrom">${mailFrom}</metadataValue>
                              <metadataValue code="mailData.853">${mailTo}</metadataValue>
                              <metadataValue code="mailData.854">${mailCC}</metadataValue>
                              <metadataValue code="mailDate">${fecha}</metadataValue>
                              <metadataValue code="mailSize">${mailSize}</metadataValue>
                              <metadataValue code="mailAllHeaders">${asunto}</metadataValue>
                              <metadataValue code="mailMessageId">${idMessage}</metadataValue>
                              <metadataValue code="mailContentType">${mailContentType}</metadataValue>
                              <metadataValue code="mailMimeVersion">${mailMimeVersion}</metadataValue>
                              <metadataValue code="deviceCode">"Add-On"</metadataValue>
                              <metadataValue code="deviceVersion">"1.0"</metadataValue>
                              <metadataValue code="mailSourceFolder">${usuarioGmail}</metadataValue>
                              <metadataValue code="Doc.Remitente.MedioEnvio">CANALES.CORRELE,VENT.EMAILS.${usuarioGmail}</metadataValue>       
                              </metadataValues>]]>`
  
  var idDocument = "";
  var codigoDocument = "";
  var errormsg = "";
  try
  {
    var createDocument = await funciones.createDocument(datos.urlSoap, datos.token, asunto, entityType, bodyCorreo, idMessage, eml, folder,metadataValue);
    var dataJson = JSON.parse(parserXml.toJson(createDocument.data));

    idDocument = dataJson['s:Envelope']['s:Body'].CreateDocumentResponse.CreateDocumentResult['a:guidvalue'];
    codigoDocument = dataJson['s:Envelope']['s:Body'].CreateDocumentResponse.CreateDocumentResult['a:exitvalue'];
    errormsg = dataJson['s:Envelope']['s:Body'].CreateDocumentResponse.CreateDocumentResult['a:errormsg'];

    if (codigoDocument.length > 4)
    {
        if (checkAdjuntos == 'true')
        {
          
          for (var i = 0; i < adjunto.length; i++)
          {
            var nombre = adjunto[i].nombre;
            var base64 = adjunto[i].bytes.toString('base64');
            anexo(datos.token,codigoDocument,nombre,base64,datos.urlSoap)
          }
        
        }
        var urlAbo = datos.urlAbox;
        res.send(JSON.stringify({
                                  exito: true,
                                  mensaje: urlAbo+`/Document/Documents/Show/${idDocument}`,
                                  codigo: codigoDocument
                                }));

        funciones.log("INFO","Documento creado: "+codigoDocument+" "+usuarioGmail)

    }
    else
    {
      if (errormsg == "No está autorizado o la sesión ha caducado.")
      {
        var msg = await funciones.borrar(usuarioGmail);
      }
      res.send(JSON.stringify({exito: false,mensaje : errormsg}));
      funciones.log("INFO", errormsg+" "+usuarioGmail)
    }

  }
  catch(e)
  {
    //console.log(e.message);
    funciones.log("ERROR",e.message+" "+usuarioGmail)
    res.send(JSON.stringify({exito: false,mensaje : e.message}));
  }
});


//CERRAR SESION--------------------------------------------------------------------------------------------------------------------------
//Cierra la sesion borrando el token 
 app.post(/cerrarSesion/,async(req, res)=>{

    var usuarioGoogle = req.body.usuarioGoogle
    var msg = await funciones.borrar(usuarioGoogle);

    console.log('cerro sesion: '+usuarioGoogle);

    if (msg == "no se encontro usuario"){

      res.send("no se encontro usuario");

    }else{
      res.send(false);
    }
});


//HTML-------------------------------------------------------------------------------------------------------------------------------------
//responde con la pagina de inicio de sesion

app.get('/pagina/:file?', function (req, res)
{
  //console.log(req.query.correo);
  var index = fs.readFileSync(path.join(`${__dirname}/login/${req.params.file || 'index.html'}`),{encoding:'utf8', flag:'r'});
  index = index.replace('%%correo%%',req.query.correo)
	res.send(index);
});

app.get('/paginaIdenti/', async function (req, res)
{
  var datos = await funciones.getDatos(req.query.correo)
  var index = fs.readFileSync(path.join(`${__dirname}/login/${req.params.file || 'login.html'}`),{encoding:'utf8', flag:'r'});
  index = index.replace('%%correo%%',req.query.correo)
  index = index.replace('%%ABOX%%',datos.urlAbox)
	res.send(index);

});



//server------------------------------------------------------------------------------------------------------------------------------------
if(process.env.DESARROLO == 'true')
{
  app.listen(app.get('port'), () => {
    console.warn(`http://localhost:${app.get('port')}/pagina?correo=ejemplo`);
    console.log("Desarrollo");
  });
}
else
{
  https.createServer({
    cert: fs.readFileSync('src/cert_adptg.crt'),
    key: fs.readFileSync('src/llave_lista.key')
  },app).listen(app.get('port'), () => {
    console.log (`Servidor https on port ${app.get('port')}`);
    console.log("Producción");
	  //console.log("https://gmail2-demo.adapting.com:3003/")
  });
}

