require('dotenv').config();
const sql = require('mssql');
const EmlParser = require('eml-parser');
const axios = require('axios');




/**

 * retorna true si esta conectado, false si fallo la conexion a la base de datos

 * @return  {boolean}

 */
let conexion = async function conexion ()
{
    try
    {
        await sql.connect(`Server=${process.env.SERVER};User Id=${process.env.USERID};Password=${process.env.PASSWORD};Min Pool Size=2;Database=addon;trustServerCertificate=true;`)
        return true
    } 
    catch (err) 
    {
        console.log(err)
        return false
    }
}



/**

 * funcion que guarda los datos en la base de datos

 * @return  {boolean}

 */

let guardar = async function guardar (usuarioGoogle,token,urlAbox,urlSoap,usuario,documentTypeCode)
{
  
    var dabaBase = await conexion();
    if (dabaBase == true)
    {

  
        const result = await sql.query(`UPDATE GmailAccounts SET token='${token}',urlAbox='${urlAbox}',urlSoap='${urlSoap}',usuario='${usuario}',documentTypeCode='${documentTypeCode}' WHERE usuarioGoogle='${usuarioGoogle}';`)
        //console.log(result.rowsAffected)

        if (result.rowsAffected[0]==1)
        {

            console.log('se actualizo: '+usuarioGoogle)

            sql.close()
            return true

        } 
        else
        {

        //console.log('no se encontro el usuario')
        sql.close()
        return ("No se encontro usuario "+usuarioGoogle)
        
        }
    }
    else
    {
        //console.log("error en actualizar")
        return ("error en actualizar")
    }
    
}



/**

 * retorna todos los datos de ese usuario

 * @param  {string}

 * @return  {JSON}

 */

let getDatos = async function getDatos(usuarioGoogle)
{

    var dabaBase = await conexion();
    
    if (dabaBase == true)
    {
  
      const result = await sql.query(`SELECT * FROM GmailAccounts WHERE usuarioGoogle ='${usuarioGoogle}' ;`)
  
      let datos = {
        accounId:result.recordset[0].accounId,
        token:result.recordset[0].token,
        urlAbox:result.recordset[0].urlAbox,
        urlSoap:result.recordset[0].urlSoap,
        usuario:result.recordset[0].usuario,
        documentTypeCode:result.recordset[0].documentTypeCode
      }
  
      sql.close()
  
      return datos
  
    }
    else
    {
        return 'la conexion fallo'
    }
  
}



/**

 * borra el token de la base de datos retorna un string

 * @param  {string}

 * @return  {string}

 */

let borrar = async function borrar (usuarioGoogle)
{
    var dabaBase = await conexion();
    if (dabaBase == true)
    {
        const result = await sql.query(`UPDATE GmailAccounts SET token=NULL WHERE usuarioGoogle='${usuarioGoogle}';`)
        //console.log(result.rowsAffected)
  
        if (result.rowsAffected[0]==1){
    
            console.log('se cerro sesion: '+usuarioGoogle)
            sql.close()
            return "cerro sesion"
        } 
        else
        {
            //console.log('no se encontro el usuario')
            sql.close()
            return "no se encontro usuario"
        }
  
    }
    else
    {
        //console.log("error en cerrar sesion")
        return ("error en cerrar sesion")
  
    }
}


/**

 * guarda los tipos documentales del usuario

 * @param  {string}

 * @return  {string}

 */
let saveDocumenType = async function saveDocumenType(usuarioGmail,string)
{

    var json = await JSON.parse(string)

    let carga = []

    var num = json.dsDocument.TiposDocumentales.length;

    if (num)
    {
        for (var i = 0; i < json.dsDocument.TiposDocumentales.length; i++)
        {
            var date = {
                nombre:json.dsDocument.TiposDocumentales[i].nombre,
                tipo:json.dsDocument.TiposDocumentales[i].codigoTipo
            }
            carga.push(date)
        }

    }
    else
    {

        var valor = []
        valor.push(json.dsDocument.TiposDocumentales)

        json.dsDocument.TiposDocumentales

        for (var i = 0; i < valor.length; i++)
        {
            var date = {
                nombre:valor[i].nombre,
                tipo:valor[i].codigoTipo
            }
            carga.push(date)
        }

    }


    var dabaBase = await conexion();

    if (dabaBase == true )
    {

        var convert = JSON.stringify(carga)

        const result = await sql.query(`UPDATE GmailAccounts SET documentTypeCode='${convert}' WHERE usuarioGoogle='${usuarioGmail}';`)

        if (result.rowsAffected[0]==1)
        {

            sql.close()

            console.log('guardo Documentype database :',usuarioGmail)

            return 'guardo documentype'

        }
        else
        {
            console.log('No guardo Documentype database :',usuarioGmail);
            return 'No guardo Documentype database :',usuarioGmail
        }
    }
    else
    {
        return'error al conectar base de dato'
    }
    
  
}


/**

 * obtiene los attachments de un correo, y retorna un array con el nombre attachments y bytes attachments en base64

 * @param  {string}

 * @return  {Array}

 */
let getattachments = async function getattachments(cuerpo)
{

    var emlCorreo = new EmlParser(cuerpo)
  
    var result = await emlCorreo.parseEml();
  
      var dataAdjunto = [];
  
      var  datos = result.attachments
      
      for(var i = 0; i < datos.length; i++){
  
        var nameAdjunto = datos[i].filename;
        var base64 =  datos[i].content;
  
        var jsson = {
          nombre:nameAdjunto,
          bytes:base64
        }
  
        dataAdjunto.push(jsson);
      }
    return dataAdjunto
}


/**

 * guarda el token y el usuario en la base de datos

 * @param  {string}

 * @return  {Array}

 */
let GuardarToken = async function GuardarToken(usuarioGoogle,token,usuario)
{

    let ini = false;
  
    var dabaBase = await conexion();

    if (dabaBase == true)
    {
  
      const result = await sql.query(`UPDATE GmailAccounts SET token='${token}',usuario='${usuario}' WHERE usuarioGoogle='${usuarioGoogle}';`)
      //console.log(result.rowsAffected)
  
      if (result.rowsAffected[0]==1){
  
          console.log('se actualizo: '+usuarioGoogle)
          ini = true;
          sql.close()
          return ini
          
  
      } else{
  
        //console.log('no se encontro el usuario')
        sql.close()
        return ("No se encontro usuario "+usuarioGoogle)
        
      }
  
    }
    else
    {
  
        console.log("error en actualizar")
        return ("error en actualizar")
  
    }
    
    
}


/**

 * Registra los eventos en un archivo text (tipo de mensaje, mensaje)

 * @param  {string}

 * @return  {Array}

 */
let log = function log(type,mensaje) {
    
    let fs = require('fs');
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let fecha = date +"/"+month+"/"+date_ob.getFullYear()+" "+date_ob.getHours()+":"+date_ob.getMinutes()+":"+date_ob.getSeconds();
    mensaje = fecha+" => "+type+" "+mensaje+"\n"

    try
    {
        let previousMessage = fs.readFileSync("EventLog.txt", 'utf-8');
        var file = fs.createWriteStream("EventLog.txt");
        file.once('open', (fd) => {
            file.write(previousMessage);
            file.write(mensaje+"\n");
            file.end();
        });
    }
    catch(error)
    {
        if(error)
        {
            var encoding = "utf8";
            fs.writeFile("EventLog.txt", mensaje, encoding, (err) => {
                if (err) throw err;
            });
        }
    }
};


/**

 * Inicia sesion en ABOX (urlAboxSoap, userName, clave)

 * @param  {string}

 * @return  {xmlResult}

 */

let iniciaSesion = function iniciaSesion(urlSoap,usuario,password)
{
    
    var xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
    <soapenv:Header/>
    <soapenv:Body>
       <tem:IniciaSesion>
          <!--Optional:-->
          <tem:usuario>${usuario}</tem:usuario>
          <!--Optional:-->
          <tem:clave>${password}</tem:clave>
          <!--Optional:-->
          <tem:acceso>{Create}</tem:acceso>
          <!--Optional:-->
          <tem:rememberMe>false</tem:rememberMe>
          <!--Optional:-->
          <tem:deviceToLogin>Test</tem:deviceToLogin>
       </tem:IniciaSesion>
    </soapenv:Body>
 </soapenv:Envelope>`

  return axios.post(urlSoap,xml,
    {headers:
      {'Content-Type':'text/xml;charset=utf-8',
      'Accept-Encoding': 'gzip,deflate',
      'Content-Length':xml.length,
      'SOAPAction':"http://tempuri.org/ILegacyDocumentApi/IniciaSesion"}
    })
};




/**

 * Retorna los tipos documentales por userName (urlAboxSoap, clave)

 * @param  {string}

 * @return  {xmlResult}

 */
let findAllEntityTypesByUser = function findAllEntityTypesByUser(urlSoap,token)
{
    var xml = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
                    <soapenv:Header/>
                    <soapenv:Body>
                        <tem:FindAllEntityTypesByUser>
                          <!--Optional:-->
                          <tem:token>${token}</tem:token>
                          <!--Optional:-->
                          <tem:entity>document</tem:entity>
                        </tem:FindAllEntityTypesByUser>
                    </soapenv:Body>
                  </soapenv:Envelope>`

    return axios.post(urlSoap,xml,
        {headers:
            {'Content-Type':'text/xml;charset=utf-8',
            'Accept-Encoding': 'gzip,deflate',
            'Content-Length':xml.length,
            'SOAPAction':"http://tempuri.org/ILegacyDocumentApi/FindAllEntityTypesByUser"}})
};





/**

 * Crea un documento en Abox

 * @param  {string}

 * @return  {xmlResult}

 */
let createDocument = function createDocument(urlSoap,token,title,documentTypeCode,description,filename,fileBytearray,metadata="")
{
    let xml = `
    <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
        <Body>
            <CreateDocument xmlns="http://tempuri.org/">
                <token>${token}</token>
                <title>${title}</title>
                <code></code>
                <documentTypeCode>${documentTypeCode}</documentTypeCode>
                <folderCode></folderCode>
                <description>${description}</description>
                <keywords></keywords>
                <filename>${filename}.eml</filename>
                <fileDescription></fileDescription>
                <fileBytearray>${fileBytearray}</fileBytearray>
                <metadataValues>${metadata}</metadataValues>
            </CreateDocument>
        </Body>
    </Envelope>
`;
return axios ({ method: 'post',
                url: urlSoap,
                data: xml,
                headers: 
                {  'Content-Type':'text/xml;charset=utf-8',
                        'Accept-Encoding': 'gzip,deflate',
                        'Content-Length':xml.length,
                        'SOAPAction':"http://tempuri.org/ILegacyDocumentApi/CreateDocument"
                }})

}
 
// Exportamos las funciones 
module.exports = {
    conexion,
    guardar,
    getDatos,
    borrar,
    saveDocumenType,
    getattachments,
    GuardarToken,
    log,
    iniciaSesion,
    findAllEntityTypesByUser,
    createDocument
}