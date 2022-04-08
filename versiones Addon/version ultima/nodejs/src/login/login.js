
//---------------------------------------------------------------------------------------------------------------------------------------------
var nodeJs = window.location.origin;

function identificarse(){
    var usuarioGmail = document.getElementById('usuarioGmail').value;
    var usuario = document.getElementById('usuario').value;
    var password = document.getElementById('contrasena').value;
    
    if (usuarioGmail.length>7 && usuario.length>2 && password.length>3)
    {

        document.getElementById('contenedor_carga').style.display = 'block';

        fetch (nodeJs+'/identificarse/',
        {
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                usuarioGmail: usuarioGmail,
                usuario: usuario, 
                contrasena: password,
            })
        })
        .then ( async msg => {

            var json = await msg.json()
            var array = json.message
            var palabras = [];
            document.getElementById('contenedor_carga').style.display = 'none';

            if (json.error == "")
            {
                array.forEach(element => {
                    palabras.push(element.nombre);
                    palabras.push(element.tipo)
                });

                document.getElementById('tags').style.display = 'block';
                document.getElementById('enviarButton').style.display = 'block';
                document.getElementById('loginButton').style.display = 'none';
                document.getElementById('TiposDocumentales').innerText = 'Tipo Documental (default)';

                $( "#tags" ).autocomplete({
                    source: palabras,
                    minLength: 2
                });

            }
            else
            {
                document.getElementById('contenedor_carga').style.display = 'none';
                alert(json.message)
            }
            
        })
        .catch(err => {
            document.getElementById('contenedor_carga').style.display = 'none';
            alert(err)
        })

    }
    else
    {
        alert("Por favor ingresar campos correctos")
    }

}


function atras(){

    var form = document.getElementById('form1')
    var form2 = document.getElementById('form02')
    form2.style.display = "none";
    form.style.display = "block";

}

/**

 * Verifica si existe servicio SOAP

 */
function verificar(){

    const soap = '/document-api.svc?wsdl';
    var urlAbox = document.getElementById('url').value;
    var urlSoap = urlAbox+soap;

    if (urlAbox.length < 10){

        alert("Por favor introduzca valores correctos")

    } else{

        document.getElementById('contenedor_carga').style.display = 'block';

        fetch (nodeJs+'/servicioSoap/',
            {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    urlSoap: urlSoap
                })
            })
            .then ( async msg => {

                var json = await msg.json()

                if(json.error =="")
                {
                    document.getElementById('contenedor_carga').style.display = 'none';
                    document.getElementById('respuesta').innerHTML = "Url Valida"
                    document.getElementById('form1').style.display = "none";
                    document.getElementById('form02').style.display = "block";
                }
                else
                {
                    document.getElementById('contenedor_carga').style.display = 'none';
                    document.getElementById('respuesta').innerHTML = "Url Invalida"
                }
                
            })

    }
}



/**

 * inicia sesion en ABOX

 */
function login(){
    const soap = '/document-api.svc/soap';
    var urlAbox = document.getElementById('url').value;
    var usuarioGmail = document.getElementById('usuarioGmail').value;
    var usuario = document.getElementById('usuario').value;
    var password = document.getElementById('contrasena').value;
    var urlSoap = urlAbox+soap

    var contenedor = document.getElementById('contenedor_carga')
    document.getElementById('contenedor_carga').style.display = 'block';
    //var inputDocument = document.getElementById('tags')
    
    if (usuarioGmail.length>7 && urlAbox.length>5)
    {
        fetch (nodeJs+'/inicioSesion/',
            {
                headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    usuarioGmail: usuarioGmail,
                    usuario: usuario, 
                    contrasena: password,
                    urlSoap: urlSoap,
                    urlAbox : urlAbox

                })
            }).then ( async msg => {

                var json = await msg.json()
                var array = json.message
                var palabras = [];
                contenedor.style.display = 'none';

                if (json.error == "")
                {
                    array.forEach(element => {
                        palabras.push(element.nombre);
                        palabras.push(element.tipo)
                    });

                    document.getElementById('tags').style.display = 'block';
                    document.getElementById('enviarButton').style.display = 'block';
                    document.getElementById('loginButton').style.display = 'none';
                    document.getElementById('TiposDocumentales').innerText = 'Tipo Documental (default)';

                    $( "#tags" ).autocomplete({
                        source: palabras,
                        minLength: 2
                    });

                }
                else
                {
                    document.getElementById('contenedor_carga').style.display = 'none';
                    alert(json.message)
                }
                
            })
            .catch(err => {
                document.getElementById('contenedor_carga').style.display = 'none';
                alert(err)
            })
    }
    else
    {
        alert("Por favor ingresar campos correctos")
    }
}


function enviar(){

    var usuarioGmail = document.getElementById('usuarioGmail').value;
    var documentTypeDefault = document.getElementById('tags').value;

    if (documentTypeDefault.length>3){

        fetch (nodeJs+'/saveDocumentTypeDefault/',
                {
                    headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({
                        usuarioGmail: usuarioGmail,
                        documentTypeDefault:documentTypeDefault

                    })
                }).then ( async msg => {

                    var json = await msg.json()

                    if (json.mensaje == 'guardado'){
                        window.close();
                    } else{
                        alert(json.mensaje)
                    }
                    
                }).catch(ee)
                {
                    alert(ee)
                }
    } else{
        alert('ingresar campos validos')
    }
}