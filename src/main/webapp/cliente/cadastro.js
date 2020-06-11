function InstaleFacil(){

	var CORE = this;

	this.view = null;
	this.action = null;

	this.formLoad = {
		telefone: '',
		celular: '',
		nome: '',
		cpf: '',
		email: '',
		ativacao: '',
		status: ''
	};

	this.formButtonPressed = function(){
		if(CORE.action == 'step_one'){
			var preparedData = {
				telefone: document.nForm.telefone.value,
				celular: document.nForm.celular.value
			};
			sendUpdate(preparedData);
		}
	};

	function sendUpdate(preparedData){
		showLoading(true);
		remoteCall(
			'cliente/api/update-profile',
			preparedData,
			function(data){
				showLoading(false);
				if(typeof data['error'] != 'undefined'){
					showScreenMessage(data['message']);
				}else{
					window.location.replace('projetos.html');
				}
			}
		);
	}

	function showScreenMessage(message){
		document.getElementById('divMsg').style.display = '';
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
                            case 'step_one':
                                    CORE.view.innerHTML =
                                            '<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
                                                    '<div class="NE_CONTENT_2COL80 NE_CLEAR_MOBILE_PADDING">'+
                                                            '<h2 class="NE_BORDER_BOTTOM NE_SPACE_BOTTOM">Olá, '+CORE.formLoad.nome+'</h2>'+
                                                            '<p class="NE_INFO NE_PB10">Preencha os campos abaixo para confirmar o seu cadastro na plataforma Instale Fácil.</p>'+
                                                    '</div>'+
                                            '</div>'+
                                            '<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING" id="divMsg" style="display: none;">'+
                                                    '<div class="NE_CONTENT_2COL50 NE_SPACE_BOTTOM NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
                                                            '<h4 class="NE_LEFT" id="NE_MSG"></h4>'+
                                                    '</div>'+
                                            '</div>'+
                                            '<form name="nForm">'+
                                                    '<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
                                                            '<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
                                                                    '<div class="NE_LABEL NE_PT10">CPF *</div>'+
                                                                    '<input name="cpf" id="cpf" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_DISABLED" readonly />'+
                                                            '</div>'+
                                                    '</div>'+
                                                    '<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
                                                            '<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
                                                                    '<div class="NE_LABEL NE_PT5">Telefone</div>'+
                                                                    '<input name="telefone" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10 " />'+
                                                            '</div>'+
                                                            '<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
                                                                    '<div class="NE_LABEL NE_PT5">Celular</div>'+
                                                                    '<input name="celular" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10 " />'+
                                                            '</div>'+
                                                    '</div>'+
                                            '</form>'+
                                            '<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
                                                    '<div class="NE_CONTENT_2COL30 NE_CLEAR_MOBILE_PADDING NE_SPACE_TOP">'+
                                                            '<input type="button" value="CONFIRMAR" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_HEAVY" onclick="InstaleFacil.formButtonPressed();"  />'+
                                                    '</div>'+
                                            '</div>'
                                    ;
                                    populateForm();
                            break;
			}
		}
    };

	function populateForm(){
		document.nForm.cpf.value = CORE.formLoad.cpf;
		document.nForm.telefone.value = CORE.formLoad.telefone;
		document.nForm.celular.value = CORE.formLoad.celular;
	}

	this.initialize = function(){
		remoteCall(
			'cliente/api/load-user-data',
			{},
			function(data){
				if(typeof data['error'] != 'undefined'){
					window.location.replace('index.html');
				}else{
					if(data['status'] == 'Inativo'){
						switch(data['ativacao']){
							case '1A':
								window.location.replace('termos-cliente.html');
							break;
							case '1B':
								CORE.formLoad = data;
								CORE.showPage('step_one');
								showContent();
								showLoading(false);
							break;
							// default:
							// 	window.location.replace('erro.html');
						}
					}else if(data['status'] == 'Ativo'){
						window.location.replace('projetos.html');
					}else{
						window.location.replace('login.html');
					}
				}
			}
		);
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
