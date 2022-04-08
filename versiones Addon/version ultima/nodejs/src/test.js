const sql = require('mssql')
var parser = require('xml2json');

async function conexion () {
    try {
        // make sure that any items are correctly URL encoded in the connection string
        await sql.connect("Server=DESKTOP-L0VB48E;User Id=glsbox;Password=glsbox;Min Pool Size=2;Database=addon;trustServerCertificate=true;")
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

async function insert(usuarioGoogle){ 
    var dabaBase = await conexion();
    if (dabaBase == true){
        //const result = await sql.query(`select * from accounts`)
        //const result = await sql.query(`INSERT INTO accounts (id,usuarioGoogle,usuario,contrasena,token,urlAbox,urlSoap,documentTypeCode)
        //VALUES ('','fjtorres@gmail.co','partner','Pti12ada','s8df151f8s','urldeabox','urlssoapdeabox','estaCarpeta');`)
        const result = await sql.query(`INSERT INTO GmailAccounts (usuarioGoogle)
        VALUES (${usuarioGoogle});`)
        console.dir(result)


    }else{
        console.log("no se inserto")

    }
}

async function consulta(){
    var dabaBase = await conexion();
    var usuarioGmail = 'fabberthj@'
    if (dabaBase == true){
        const result = await sql.query(`SELECT * FROM GmailAccounts WHERE usuarioGoogle = '${usuarioGmail}' ;`)
        console.log(result);
        /*if (result.recordset.length==0){
            var inse = await sql.query(`INSERT INTO GmailAccounts (usuarioGoogle) VALUES ('${usuarioGmail}');`)
            console.log(inse)
            sql.close()
        }*/
        
    }else{

        console.log("error en la consulta")

    }
}

//consulta()



async function actualizar(){
    var dabaBase = await conexion();
    if (dabaBase == true){
        const result = await sql.query(`UPDATE GmailAccounts SET token='1rd8g61rg81rgh',urlAbox='http:/urlAbox.com',urlSoap='https://urlSoap.con',usuario='partner!',documentTypeCode='ABOX.100' WHERE usuarioGoogle='fabberth@edu.com';`)
        console.log(result)

        if (result.rowsAffected[0]==0){
            console.log('no se encontro el usuario')
        }

        if (result.rowsAffected[0]==1){
            console.log('se actualizo')
        }

        sql.close()
    }else{

        console.log("error en actualizar")

    }
}

//actualizar()


async function getDatos(usuarioGoogle){

    var dabaBase = await conexion();
    
    if (dabaBase == true){
  
      const result = await sql.query(`SELECT * FROM GmailAccounts WHERE usuarioGoogle ='${usuarioGoogle}' ;`)

      //console.log(result);
  
      let json = {
        accounId:result.recordset[0].accounId,
        token:result.recordset[0].token,
        urlAbox:result.recordset[0].urlAbox,
        urlSoap:result.recordset[0].urlSoap,
        usuario:result.recordset[0].usuario,
        documentTypeCode:result.recordset[0].documentTypeCode
      }
      
      sql.close()
  
      return json
  
    }
  
}

setTimeout(function(){
    console.log("Hola Mundo");
}, 10000);
/*async function x (){
var x = await getDatos('fjtorres35@misena.edu.co');
//x = x.documentTypeCode
console.log(x);
}
x()*/



//var json2 = getDatos("fjtorres35@misena.edu.co")
//console.log(json2.hola);


/*var xml = ``


var json = parser.toJson(xml);
json=JSON.parse(json)

for (var i = 0; i < json.dsDocument.TiposDocumentales.length; i++){

    console.log(json.dsDocument.TiposDocumentales[i].nombre+" = "+json.dsDocument.TiposDocumentales[i].codigoTipo);

}*/




