function InstaleFacil(){

	var CORE = this;

	this.view = null;
	this.action = null;

	this.formButtonPressed = function(){
		if(CORE.action == 'login'){
			if(!document.nForm.email.value.length > ' '){
				showLoginMessage('Digite um E-Mail');
			}else{
				if(!validateEmail(document.nForm.email.value)){
					showLoginMessage('Digite um E-Mail válido');
				}else{
					if(!document.nForm.pass.value.length > ' '){
						showLoginMessage('Digite uma Senha.');
					}else{
						login(document.nForm.email.value, document.nForm.pass.value);
					}
				}
			}
		}
		/*
		if(CORE.action == 'login'){
			if(!document.nForm.email.value.length > ' '){
				showLoginMessage('Digite um E-Mail');
			}else{
				if(!validateEmail(document.nForm.email.value)){
					showLoginMessage('Digite um E-Mail válido');
				}else{
					if(document.nForm.pass.value.length <= 4){
						showLoginMessage('Sua senha precisa ser maior que 4 dígitos.');
					}else{
						login(document.nForm.email.value, document.nForm.pass.value);
					}
				}
			}
		}*/
		if(CORE.action == 'send'){
			if(!document.nForm.email.value.length > ' '){
				showLoginMessage('Digite um E-Mail');
			}else{
				if(!validateEmail(document.nForm.email.value)){
					showLoginMessage('Digite um E-Mail válido');
				}else{
					sendPassword(document.nForm.email.value);
				}
			}
		}
	};

	function login(email, pass){
		showLoading(true);
		Request.send({
			method:	'POST',
			parameters: {
				email: email,
				password: pass
			},
			headers:{'Content-Type': 'application/json'},
			url: BASE_URL + 'cliente/api/login',
			synchronous: true
		}, function(readyState, status, response){
			if(readyState == 4){
				if(status == 200){
					response = JSON.parse(response);
					if(response['error'] == 0){
						showLoginMessage('');
						setCookie('c-access-token',response['accessToken'],999);
						setCookie('c-session-id',response['sessionId'],999);
						setCookie('c-client-id',response['clientId'],999);
						setCookie('c-refresh-token',response['refreshToken'],999);
						redirectTo(response['status'], response['ativacao']);
					}else{
						showLoading(false);
						setCookie('c-access-token','',-1);
						setCookie('c-session-id','',-1);
						setCookie('c-client-id','', -1);
						setCookie('c-refresh-token','', -1);
						showLoginMessage(response['message']);
						document.nForm.pass.value 	= "";
					}
				}else{
					showLoading(false);
					showLoginMessage('');
					setCookie('c-access-token','',-1);
					setCookie('c-session-id','',-1);
					setCookie('c-client-id','', -1);
					setCookie('c-refresh-token','', -1);
					showMessage('Atenção', 'Houve um erro na sua solicitação<br/>Verifique sua conexão e tente novamente.');
				}
			}
		});
	}

	function sendPassword(email){
		showLoading(true);
		Request.send({
			method:	'POST',
			parameters: {
				email: email
			},
			headers:{'Content-Type': 'application/json'},
			url: BASE_URL + 'cliente/api/send-password',
			synchronous: true
		}, function(readyState, status, response){
			if(readyState == 4){
				if(status == 200){
					response = JSON.parse(response);
					if(response['error'] == 0){
						showLoading(false);
						showLoginMessage('');
						showMessage('Sucesso', 'Solicitação Enviada!');
						disableButton();
					}else{
						showLoginMessage(response['message']);
						showLoading(false);
					}
				}else{
					showLoading(false);
					showLoginMessage('');
					showMessage('Atenção', 'Houve um erro na sua solicitação<br/>Verifique sua conexão e tente novamente.');
				}
			}
		});
	}

	function redirectTo(status, ativacao){
		if(status == 'Inativo'){
			switch(ativacao){
				case '1A':
					window.location.replace('termos-cliente.html');
				break;
				case '1B':
					window.location.replace('cadastro.html');
				break;
				// default:
				// 	window.location.replace('erro.html');
			}
		}else if(status == 'Ativo'){
			window.location.replace('projetos.html');
		}else{
			showMessage('Ops!', 'Você não tem permissão para acessar.<br/>Entre em contato com a Comgás.');
			showLoading(false);
		}
	}

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

	function validateEmail(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	}

	function disableButton(){
		var comp = document.getElementById('SEND_MAIL');
		if(typeof comp != 'undefined'){
			comp.onclick = function(){ return false; };
			comp.style.backgroundColor = '#666666';
			comp.style.borderColor = '#666666';
			comp.style.color = '#CCCCCC';
			comp.opacity = .5;
		}
	}

    this.showPage = function(page){
		CORE.view = document.getElementById('lContent');
		if(typeof CORE.view != 'undefined'){
			CORE.action = page;
			switch(page){
				case 'login':
					CORE.view.innerHTML =
						'<form class="NE_FORM" name="nForm" style="padding: 0 0 20px 0" onsubmit="return false">'+
							'<h2 class="NE_SPACE_BOTTOM NE_WHITE_TEXT_COLOR">Faça seu Login</h2>'+
							'<h4 class="NE_SPACE_BOTTOM NE_WHITE_TEXT_COLOR NE_CENTER" id="NE_MSG"></h4>'+
							'<div class="NE_LABEL NE_SECONDARY_TEXT_COLOR NE_HEAVY">E-mail</div>'+
							'<input name="email" type="text" class="NE_SPACE_BOTTOM NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_CARET_COLOR_PRIMARY" placeholder="Inserir E-mail" onkeypress="InstaleFacil.getInstance().keyPressed(event);"/>'+
							'<div class="NE_LABEL NE_SECONDARY_TEXT_COLOR NE_HEAVY">Senha</div>'+
							'<input name="pass" type="password" class="NE_SPACE_BOTTOM NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_CARET_COLOR_PRIMARY"  placeholder="Inserir Senha" onkeypress="InstaleFacil.getInstance().keyPressed(event);" />'+
							'<input type="button" value="ACESSAR" onclick="InstaleFacil.formButtonPressed()" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_PRIMARY_TEXT_COLOR NE_HEAVY" />'+
						'</form>'+
						'<div class="NE_CENTER NE_PB5">'+
							'<p class="NE_MAIN_LINK NE_WHITE_TEXT_COLOR NE_CURSOR" onclick="InstaleFacil.showPage(\'send\');">Esqueci minha senha</p>'+
						'</div>'
					;
				break;
				case 'send':
					CORE.view.innerHTML =
						'<form class="NE_FORM" name="nForm" style="padding: 0 0 20px 0" onsubmit="return false">'+
							'<h2 class="NE_SPACE_BOTTOM NE_WHITE_TEXT_COLOR">Recupere sua senha</h2>'+
							'<h4 class="NE_SPACE_BOTTOM NE_WHITE_TEXT_COLOR NE_CENTER" id="NE_MSG"></h4>'+
							'<div class="NE_LABEL NE_SECONDARY_TEXT_COLOR NE_HEAVY">E-mail</div>'+
							'<input name="email" type="text" class="NE_SPACE_BOTTOM NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_CARET_COLOR_PRIMARY" onkeypress="InstaleFacil.getInstance().keyPressed(event);" placeholder="Inserir E-mail"/>'+
							'<input type="button" id="SEND_MAIL" value="ENVIAR" onclick="InstaleFacil.formButtonPressed()" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_PRIMARY_TEXT_COLOR NE_HEAVY" />'+
						'</form>'+
						'<div class="NE_CENTER NE_SPACE_BOTTOM">'+
							'<p class="NE_MAIN_LINK NE_WHITE_TEXT_COLOR NE_CURSOR" onclick="InstaleFacil.showPage(\'login\');">Voltar</p>'+
						'</div>'
					;
				break;
			}
		}
    };

	this.initialize = function(){
		var sessionId = getCookie('c-session-id'),
			refreshToken = getCookie('c-access-token');

		if(sessionId != null && sessionId > ' '
			&& refreshToken != null && refreshToken > ' '){
				remoteCall(
					'cliente/api/load-user-data',
					{},
					function(data){
						if(typeof data['error'] == 'undefined'){
							redirectTo(data['status'], data['ativacao']);
						}else{
							CORE.showPage('login');
							showContent();
							showLoading(false);
						}
					}
				);

		}else{
			CORE.showPage('login');
			showContent();
			showLoading(false);
		}
	};

	this.keyPressed = function(e){
		if(e.keyCode == 13){
			CORE.formButtonPressed();
			// switch(CORE.action){
			// 	case 'login': alert('submit login'); break;
			// 	case 'send': alert('submit send'); break;
			// 	case 'register': alert('submit register'); break;
			// }
		}
	};

}
InstaleFacil.instance = null;
InstaleFacil.getInstance = function(){
    if(this.instance === null) this.instance = new InstaleFacil();
    return this.instance;
};
InstaleFacil.showPage = function(page){
    this.getInstance().showPage(page);
};
InstaleFacil.initialize = function(){
    this.getInstance().initialize();
};
InstaleFacil.formButtonPressed = function(){
    this.getInstance().formButtonPressed();
};
