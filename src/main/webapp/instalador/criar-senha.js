function InstaleFacil(){

	var CORE = this;

	this.view = null;
	this.action = null;
	this.params = null;

	this.formButtonPressed = function(){
		if(document.nForm.pNova.value.length < 10){
			showLoginMessage('Sua senha precisa ter ao menos 10 caracteres contendo maiúscula, minúscula, número e caractere especial.');
		}else{
			if(document.nForm.pConf.value != document.nForm.pNova.value){
				showLoginMessage('Senhas não coincidem.');
			}else{
				var checkedString = document.nForm.pNova.value.match(/[A-Z]/g);
				if(checkedString == null || checkedString.length == 0){
					showLoginMessage('Sua senha precisa ter ao menos 10 caracteres contendo maiúscula, minúscula, número e caractere especial.');
				}else{
					var checkedString = document.nForm.pNova.value.match(/[a-z]/g);
					if(checkedString == null || checkedString.length == 0){
						showLoginMessage('Sua senha precisa ter ao menos 10 caracteres contendo maiúscula, minúscula, número e caractere especial.');
					}else{
						var checkedString = document.nForm.pNova.value.match(/[0-9]/g);
						if(checkedString == null || checkedString.length == 0){
							showLoginMessage('Sua senha precisa ter ao menos 10 caracteres contendo maiúscula, minúscula, número e caractere especial.');
						}else{
							var checkedString = document.nForm.pNova.value.match(/[^A-Za-z0-9]/g);
							if(checkedString == null || checkedString.length == 0){
								showLoginMessage('Sua senha precisa ter ao menos 10 caracteres contendo maiúscula, minúscula, número e caractere especial.');
							}else{
								if(CORE.action == 'change-password'){
									if(document.nForm.pAtual.value.length < 10){
										showLoginMessage('Sua senha atual contém 10 ou mais caracteres.');
									}else{
										remoteCall(
											'instalador/api/change-password',
											{
												oldPassword: document.nForm.pAtual.value,
												newPassword: document.nForm.pNova.value
											},
											function(data){
												if(typeof data['error'] != 'undefined'){
													if(data['error'] == 0){
														setCookie('access-token',data['accessToken'],999);
														setCookie('session-id',data['sessionId'],999);
														redirectTo(data['status'], data['ativacao']);
													}else{
														CORE.showPage('show_error');
														showContent();
														showLoading(false);
														setTimeout(function (){
															setErrorMessage(response['message'], response['description']);
															document.nForm.pAtual.value = "";
															document.nForm.pNova.value 	= "";
															document.nForm.pConf.value  = "";
														},10);
													}
												}else{
													showLoading(false);
													showMessage('Atenção', 'Houve um erro na sua solicitação<br/>Verifique sua conexão e tente novamente.');
												}
											}
										);
									}
								}else if (CORE.action == 'reset-password') {
									Request.send({
										method:	'POST',
										parameters: {
											id: CORE.params.id,
											token: CORE.params.token,
											password: document.nForm.pNova.value
										},
										headers:{'Content-Type': 'application/json;charset=UTF-8'},
										url: BASE_URL + 'instalador/api/reset-password',
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
													showLoginMessage(response['message']);
													showLoading(false);
													document.nForm.pNova.value 	= "";
													document.nForm.pConf.value  = "";
												}
											}else{
												showLoading(false);
												showLoginMessage('');
												showMessage('Atenção', 'Houve um erro na sua solicitação<br/>Verifique sua conexão e tente novamente.');
											}
										}
									});
								}
							}
						}
					}
				}
			}
		}
	};

	function showLoginMessage(message){
		var comp = document.getElementById('NE_MSG');
		if(typeof comp != 'undefined'){
			if(message == ''){
				comp.innerHTML = '';
			}else{
				comp.innerHTML = '<div class="NE_NOTIFY_MESSAGE">' + message + '</div>';
			}
		}
	}

	function redirectTo(status, ativacao){
		if(status == 'Inativo'){
			switch(ativacao){
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
				case 'change-password':
					CORE.view.innerHTML =
						'<form name="nForm">'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING NE_SPACE_TOP">'+
						'		<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'			<h2 class="NE_LIGHT NE_PT10">Redefinição de senha</h2>'+
						'			<h3 class="NE_LIGHT NE_PT10 NE_PB10">Preencha os campos abaixo para criar uma nova senha na plataforma Instale Fácil.</h3>'+
						'			<p class=" NE_PB10 NE_QUARTENARY_TEXT_COLOR">Dica: A senha deve conter no mínimo 10 caracteres, incluindo números, letras minúsculas, maiúsculas e caracteres especiais</p>	'+
						'           <h4 class="NE_QUARTENARY_TEXT_COLOR NE_CENTER NE_SPACE_BOTTOM" id="NE_MSG"></h4>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
						'		<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'			<div class="NE_PB10">'+
						'				<div class="NE_LABEL NE_PT5">Senha atual *</div>'+
						'				<input id="pAtual" type="password" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED " />'+
						'			</div>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
						'		<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'			<div class="NE_PB10">'+
						'				<div class="NE_LABEL NE_PT5">Nova senha *</div>'+
						'				<input id="pNova" type="password" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED " />'+
						'			</div>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
						'		<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'			<div class="NE_PB5">'+
						'				<div class="NE_LABEL NE_PT5">Confirmar senha *</div>'+
						'				<input id="pConf" type="password" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED " />'+
						'			</div>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_SPACE_BOTTOM NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
						'		<div class="NE_CONTENT_2COL30 NE_CLEAR_PADDING">'+
						'			<div class="NE_PT10">'+
						'				'+
						'				<input type="button" value="Redefinir senha" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_HEAVY" onclick="InstaleFacil.formButtonPressed();"  />'+
						'			</div>'+
						'		</div>'+
						'	</div>'+
						'</form>'
					;
				break;
				case 'reset-password':
					CORE.view.innerHTML =
						'<form name="nForm">'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING NE_SPACE_TOP">'+
						'		<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'			<h2 class="NE_LIGHT NE_PT10">Criação de senha</h2>'+
						'			<h3 class="NE_LIGHT NE_PT10 NE_PB10">Preencha os campos abaixo para criar uma nova senha na plataforma Instale Fácil.</h3>'+
						'			<p class=" NE_PB10 NE_QUARTENARY_TEXT_COLOR">Dica: A senha deve conter no mínimo 10 caracteres, incluindo números, letras minúsculas, maiúsculas e caracteres especiais</p>	'+
						'			<h4 class="NE_QUARTENARY_TEXT_COLOR NE_CENTER NE_SPACE_BOTTOM" id="NE_MSG"></h4>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
						'		<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'			<div class="NE_PB10">'+
						'				<div class="NE_LABEL NE_PT5">Senha *</div>'+
						'				<input id="pNova" type="password" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED " />'+
						'			</div>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
						'		<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'			<div class="NE_PB5">'+
						'				<div class="NE_LABEL NE_PT5">Confirmar senha *</div>'+
						'				<input id="pConf" type="password" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED " />'+
						'			</div>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_SPACE_BOTTOM  NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
						'		<div class="NE_CONTENT_2COL30 NE_CLEAR_PADDING">'+
						'			<div class="NE_PT10">'+
						'				'+
						'				<input type="button" value="Criar senha" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_HEAVY" onclick="InstaleFacil.formButtonPressed();"  />'+
						'			</div>'+
						'		</div>'+
						'	</div>'+
						'</form>'
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

	this.initialize = function(){
		CORE.params = getQueryParams();
		if(typeof CORE.params.id != 'undefined' && typeof CORE.params.token != 'undefined'){
			Request.send({
				method:	'POST',
				parameters: {id: CORE.params.id, token: CORE.params.token},
				headers:{'Content-Type': 'application/json;charset=UTF-8'},
				url: BASE_URL + 'instalador/api/is-action-valid',
				synchronous: true
			}, function(readyState, status, response){
				if(readyState == 4){
					if(status == 200){
						response = JSON.parse(response);
						if(typeof response['error'] != 'undefined'){
							CustomPopup.setup({
								title: 'Ops!',
								content: 'Seu link expirou ou já foi usado.',
								buttons: [{
									label: 'Ok'
								}],
								showTime: 250,
								callback: function(isCancel, object) {
									window.location.replace('index.html');
								}
							});
							showContent();
							showLoading(false);
							CustomPopup.show();
						}else{
							CORE.showPage('reset-password');
							showContent();
							showLoading(false);
						}
					}else{
						window.location.replace('index.html');
					}
				}
			});
		}else{

			remoteCall(
				'instalador/api/load-user-data',
				{},
				function(data){
					if(typeof data['error'] != 'undefined'){
						showMessage('Erro', data['error']);
					}else{
						CORE.showPage('change-password');
						showContent();
						showLoading(false);
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
