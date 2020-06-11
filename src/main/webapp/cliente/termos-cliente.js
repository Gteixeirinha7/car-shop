function InstaleFacil(){

	var CORE = this;

	this.view = null;
	this.action = null;
	this.termosHTML = '';

	this.formLoad = {
		nome: '',
		cpf: '',
		celular: '',
		telefone: '',
		aceitaTermo: false,
		receberNotificacao: false
	};

	this.formButtonPressed = function(){
		if(CORE.action == 'termos'){
			var preparedData = {
				aceitaTermo: CORE.formLoad.aceitaTermo,
				receberNotificacao: CORE.formLoad.receberNotificacao
			}
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
					showMessage('Atenção', data['message']);
					showLoading(false);
				}else{
					redirectTo(data['status'], data['ativacao']);
				}
			}
		);
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
			window.location.replace('login.html');
		}
	}

	this.showPage = function(page){
		CORE.view = document.getElementById('lContent');
		if(typeof CORE.view != 'undefined'){
			CORE.action = page;
			switch(page){
				case 'termos':
					CORE.view.innerHTML =
						'<div class="NE_CONTENT_ROW">'+
						'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
						'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
						'			<tr>'+
						'				<td style="vertical-align: top; position: relative;padding:0;">'+
						'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
						'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
						'							<div class="NE_WBOX">'+
						'								<div class="NE_MAIN_PADDING_CONTENT">'+
						'									<div class="NE_CONTENT_ROW">'+
						'										<div class="NE_CONTENT_1COL">'+
																	CORE.termosHTML+
						'										</div>'+
						'									</div>'+
						'									<div class="NE_CONTENT_ROW">'+
						'										<div class="NE_CONTENT_1COL">'+
						'											<label class="NE_CHECKBOX_LABEL">'+
						'												<input id="aceitaTermo" type="checkbox" name="checkbox" onchange="InstaleFacil.formCheckChange(this.checked, this.id);"/>'+
						'												Estou ciente de que a COMGÁS não se responsabilizará pela minha negociação com o instalador realizada nesta plataforma.'+
						'											</label>'+
						'											<br/>'+
						'											<label class="NE_CHECKBOX_LABEL">'+
						'												<input id="receberNotificacao" type="checkbox" name="checkbox" onchange="InstaleFacil.formCheckChange(this.checked, this.id);" />'+
						'												Aceito receber notificações por e-mail e SMS sobre assuntos relacionados ao meu orçamento realizado nesta plataforma.'+
						'											</label>'+
						'										</div>'+
						'									</div>'+
						'									<div class="NE_CONTENT_ROW">'+
						'										<div class="NE_CONTENT_5COL NE_CLEAR_PADDING">'+
						'											<button class="NE_SPACE_BOTTOM NE_BTN_DEFAULT NE_COLOR_QUARTENARY NE_WHITE_TEXT_COLOR NE_TRUNCATE">NÃO ACEITO</button>'+
						'										</div>'+
						'										<div class="NE_CONTENT_5COL NE_CLEAR_PADDING">'+
						'											<button  id="btnAceito" class="NE_SPACE_BOTTOM NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON" onclick="InstaleFacil.getInstance().formButtonPressed(\'termos\')" style="background-color: #808080;border-color:#808080" disabled>ACEITO</button>'+
						'										</div>'+
						'									</div>'+
						'								</div>'+
						'							</div>'+
						'						</div>'+
						'					</div>'+
						'				</td>'+
						'			</tr>'+
						'		</table>'+
						'	</div>'+
						'</div>'
				break;
			}
		}
    };

	this.formCheckChange = function(checked, id){
		CORE.formLoad[id] = (checked ? "true" : "false");
		if (CORE.formLoad.aceitaTermo == "true") {
			document.getElementById('btnAceito').disabled = false;
			document.getElementById('btnAceito').style.backgroundColor= " #7bb322";
			document.getElementById('btnAceito').style.borderColor = "#7bb322";
		}else{
			document.getElementById('btnAceito').disabled = true;
			document.getElementById('btnAceito').style.backgroundColor= "#808080";
			document.getElementById('btnAceito').style.borderColor = "#808080";
		}
	};

	this.getTermos = function() {
		remoteCall(
			'cliente/api/get-termo-uso',
			{},
			function(data){
				if(typeof data['error'] != 'undefined' && data['error'] != 0){
					window.location.replace('index.html');
				}else{
					CORE.termosHTML = data.termo;
					CORE.showPage('termos');
					showContent();
					showLoading(false);
				}
			}
		);
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
						CORE.formLoad.nome 		= data['nome'];
						CORE.formLoad.cpf 		= data['cpf'];
						CORE.formLoad.telefone 	= data['telefone'];
						CORE.formLoad.celular 	= data['celular'];
						switch(data['ativacao']){
							case '1A':
								CORE.getTermos();
							break;
							case '1B':
								window.location.replace('cadastro.html');
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
InstaleFacil.formCheckChange = function(checked, name){
    this.getInstance().formCheckChange(checked, name);
};
