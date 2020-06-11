function InstaleFacil(){

	var CORE = this;

	this.view = null;
	this.action = null;

	this.formButtonPressed = function(){
		if(CORE.action == 'waiting_confirmation'){
			sendEmailConfirmation();
		}
	};

	function redirectTo(status, ativacao){
		if(status == 'Inativo'){
			switch(ativacao){
				case '0A':
					window.location.replace('verificar-email.html');
				break;
				case '1A':
				case '1B':
				case '1C':
				case '1D':
				 	window.location.replace('cadastro.html');
				break;
				case '2A':
					window.location.replace('qualificacao.html');
				break;
				// default:
				// 	window.location.replace('erro.html');
			}
		}else if(status == 'Ativo'){
			window.location.replace('projetos.html');
		}else{
			window.location.replace('index.html');
		}
	}

	function showScreenMessage(message){
		var comp = document.getElementById('NE_MSG');
		if(typeof comp != 'undefined'){
			if(message == ''){
				comp.innerHTML = '';
			}else{
				comp.innerHTML = '<div class="NE_NOTIFY_MESSAGE">' + message + '</div>';
			}
		}
	}

    this.showPage = function(page){
		CORE.view = document.getElementById('lContent');
		if(typeof CORE.view != 'undefined'){
			CORE.action = page;
			switch(page){
				case 'waiting_confirmation':
					CORE.view.innerHTML =
						'<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
							'<div class="NE_CONTENT_2COL80  NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
								'<h2 class="NE_BORDER_BOTTOM NE_SPACE_BOTTOM NE_SPACE_TOP">Bem-vindo, Instalador!</h2>'+
								'<p class="NE_INFO NE_SPACE_BOTTOM">Agora que você já se cadastrou, verifique seu e-mail para prosseguir.</p>'+
							'</div>'+
						'</div>'+
						'<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
							'<div class="NE_CONTENT_2COL50 NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
								'<input id="SEND_CONF" type="button" value="REENVIAR E-MAIL DE VERIFICAÇÃO" style="margin-bottom:50px;" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_HEAVY" onclick="InstaleFacil.formButtonPressed();"  />'+
							'</div>'+
						'</div>'
					;
				break;
				case 'show_error':
					CORE.view.innerHTML =
						'<h2 class="NE_LIGHT NE_PT10" id="ERROR_TITLE"></h2>'+
						'<h3 class="NE_LIGHT NE_PT10" style="margin-bottom:50px;" id="ERROR_DESCRIPTION"></h3>'
					;
				break;
			}
		}
    };


	function setErrorMessage(error, description){
		var cTitle = document.getElementById('ERROR_TITLE'),
			cDescription = document.getElementById('ERROR_DESCRIPTION');
		if(typeof cTitle != 'undefined'){
			cTitle.innerHTML = error;
		}
		if(typeof cDescription != 'undefined'){
			cDescription.innerHTML = description;
		}
	}

	function sendEmailConfirmation(){
		showLoading(true);
		remoteCall(
			'instalador/api/send-email-check',
			{},
			function(data){
				if(typeof data['error'] != 'undefined' && data['error'] != 0){
					window.location.replace('index.html');
				}else{
					var comp = document.getElementById('SEND_CONF');
					if(typeof comp != 'undefined'){
						comp.onclick = function(){ return false; };
						comp.style.backgroundColor = '#cccccc';
						comp.style.borderColor = '#cccccc';
						comp.value = 'Enviado! Verifique sua caixa de entrada';
					}
				}
				showLoading(false);
			}
		);
	}

	this.initialize = function(){
		var params = getQueryParams();
		if(typeof params.id != 'undefined' && typeof params.token != 'undefined'){
			Request.send({
				method:	'POST',
				parameters: {
					id: params.id,
					token: params.token
				},
				headers:{'Content-Type': 'application/json;charset=UTF-8'},
				url: BASE_URL + 'instalador/api/emailchecked',
				synchronous: true
			}, function(readyState, status, response){
				if(readyState == 4){
					if(status == 200){
						response = JSON.parse(response);
						if(response['error'] == 0){
							setCookie('i-access-token',response['accessToken'],999);
							setCookie('i-session-id',response['sessionId'],999);
							redirectTo(response['status'], response['ativacao']);
						}else{
							CORE.showPage('show_error');
							showContent();
							showLoading(false);
							setTimeout(function (){
								setErrorMessage(response['message'], response['description']);
							},10);
						}
					}else{
						showLoading(false);
						showMessage('Atenção', 'Houve um erro na sua solicitação<br/>Verifique sua conexão e tente novamente.');
					}
				}
			});
		}else{
			remoteCall(
				'instalador/api/load-user-data',
				{},
				function(data){
					if(typeof data['error'] != 'undefined'){
						window.location.replace('index.html');
					}else{
						if(data['status'] == 'Inativo'){
							console.log(data['ativacao']);
							switch(data['ativacao']){
								case '0A':
									CORE.showPage('waiting_confirmation');
									showContent();
									showLoading(false);
									break;
								case '1A':
								case '1B':
								case '1C':
								case '1D':
									window.location.replace('cadastro.html');
								break;
								case '2A':
									window.location.replace('qualificacao.html');
								break;
								// default:
								// 	window.location.replace('erro.html');
							}
						}else if(data['status'] == 'Ativo'){
							window.location.replace('projetos.html');
						}else{
							window.location.replace('index.html');
						}
					}
				}
			);
		}
	};



}
InstaleFacil.instance = null;
InstaleFacil.getInstance = function(){
    if(this.instance === null) this.instance = new InstaleFacil();
    return this.instance;
};
InstaleFacil.initialize = function(){
    this.getInstance().initialize();
};
InstaleFacil.showPage = function(page){
    this.getInstance().showPage(page);
};
InstaleFacil.formButtonPressed = function(){
    this.getInstance().formButtonPressed();
};
InstaleFacil.formCheckChange = function(checked, name){
    this.getInstance().formCheckChange(checked, name);
};
