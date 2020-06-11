function InstaleFacil(){

	var CORE = this;

	this.view = null;
	this.action = null;
	this.termosHTML = '';

	this.formLoad = {
		telefone: '',
		celular: '',
		nome: '',
		cnpj: '',
		razao: '',
		email: '',
		ativacao: '',
		descricao: '',
		status: '',
		aceitaTermo: false
	};

	this.regionList = {};
	this.selectedRegionList = [];

	this.formButtonPressed = function(){
		if(CORE.action == 'step_one'){
			var preparedData = {
				aceitaTermo: CORE.formLoad.aceitaTermo
			}
			sendUpdate(preparedData);
		}
		if(CORE.action == 'step_two'){
			var preparedData = {
				cnpj: document.nForm.cnpj.value,
				razao: document.nForm.razaosocial.value,
				nome: document.nForm.nomefantasia.value,
				telefone: document.nForm.telefone.value,
				celular: document.nForm.celular.value,
				cep: document.nForm.cep.value
			};
			sendUpdate(preparedData);
		}
		if(CORE.action == 'step_three'){
			if (document.nForm.descricao.value < ' ') {
				showMessage('Atenção', 'A descrição de seus serviços é obrigatória!');
				return false;
			}
			var preparedData = {
				descricao: document.nForm.descricao.value
			};
			sendUpdate(preparedData);
		}
		if(CORE.action == 'step_four'){
			var preparedData = {
				areas: CORE.selectedRegionList
			};
			sendUpdateArea(preparedData);
		}
	};

	function sendUpdateArea(preparedData){
		showLoading(true);
		remoteCall(
			'instalador/api/set-area-atuacao',
			preparedData,
			function(data){
				showLoading(false);
				if(typeof data['error'] != 'undefined'){
					showScreenMessage(data['message']);
				}else if (data['regioes'].length < 1) {
					showScreenMessage('Você deve seleionar ao menos uma região');
				}else{
					if(data['ativacao'] == '2A'){
						window.location.replace('qualificacao.html');
					}
				}
			}
		);
	}

	function sendUpdate(preparedData){
		showLoading(true);
		remoteCall(
			'instalador/api/update-profile',
			preparedData,
			function(data){
				if(typeof data['error'] != 'undefined'){
					showScreenMessage(data['message']);
					showLoading(false);
				}else{
					CORE.formLoad = data;
					pageToDraw();
					if (CORE.formLoad['ativacao'] !== '1D') {
						showLoading(false);
					}
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
			case 'waiting_confirmation':
					CORE.view.innerHTML =
						'<h2 class="NE_LIGHT NE_PT10">Aguardando Confirmação do Email.</h2>'+
						'<h3 class="NE_LIGHT NE_PT10" style="margin-bottom:100px;">O link foi enviado para seu email.</h3>'
					;
				break;
			case 'step_one':
					CORE.view.innerHTML =
						'<div class="NE_CONTENT_ROW NE_MAIN_PADDING_CONTENT NE_CLEAR_MOBILE_PADDING">'+
						'	<div class="NE_CONTENT_1COL NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
								CORE.termosHTML+
						'		<div class="NE_CONTENT_ROW NE_SPACE_TOP">'+
						'			<label class="NE_CHECKBOX_LABEL">'+
						'				<input id="aceitaTermo" type="checkbox" name="checkbox" onchange="InstaleFacil.formCheckChangeTermo(this.checked, this.id);"/>'+
						'				Estou ciente de que a COMGÁS não é responsável pela minha negociação com o Instalador, realizada nesta plataforma.'+
						'			</label>'+
						'			<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED NE_SPACE_TOP">'+
						'				<tr>'+
						'					<td style="padding: 0;">'+
						'						<input type="button" class="NE_MAIN_BUTTON NE_COLOR_QUARTENARY NE_WHITE_TEXT_COLOR NE_TRUNCATE" value="NÃO ACEITO" />'+
						'					</td>'+
						'					<td style="width:10px">&nbsp;</td>'+
						'					<td>'+
						'						<input id="btnAceito" type="button" onclick="InstaleFacil.formButtonPressed();" class="NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_MAIN_BUTTON NE_WHITE_TEXT_COLOR NE_TRUNCATE" style="background-color: #808080;		border-color:#808080" value="ACEITO" disabled/>'+
						'					</td style="padding: 0;">'+
						'				</tr>'+
						'			</table>'+
						'		</div>'+
						'	</div>'+
						'</div>';
				break;
			case 'step_two':
					CORE.view.innerHTML =
						'<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
							'<div class="NE_CONTENT_2COL80">'+
								'<h2 class="NE_BORDER_BOTTOM NE_SPACE_BOTTOM" style="word-break: break-word;">Olá, Instalador.</h2>'+
								'<p class="NE_INFO">Preencha os campos abaixo para finalizar o seu cadastro.</p>'+
							'</div>'+
						'</div>'+
						'<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING" id="divMsg" style="display: none">'+
							'<div class="NE_CONTENT_2COL50 NE_SPACE_BOTTOM NE_CLEAR_PADDING">'+
								'<h4 class="NE_LEFT" id="NE_MSG"></h4>'+
							'</div>'+
						'</div>'+
						'<form name="nForm">'+
							'<div class="NE_CONTENT_ROW  NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
								'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
									'<div class="NE_LABEL NE_PT5">CNPJ *</div>'+
									'<input name="cnpj" id="CNPJ" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED " />'+
								'</div>'+
							'</div>'+
							'<div class="NE_CONTENT_ROW  NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
								'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
									'<div class="NE_LABEL NE_PT5">Razão Social *</div>'+
									'<input name="razaosocial" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10 " />'+
								'</div>'+
								'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
									'<div class="NE_LABEL NE_PT5">Nome Fantasia *</div>'+
									'<input name="nomefantasia" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10 " />'+
								'</div>'+
							'</div>'+
							'<div class="NE_CONTENT_ROW  NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
								'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
									'<div class="NE_LABEL NE_PT5">Telefone *</div>'+
									'<input name="telefone" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10 " />'+
								'</div>'+
								'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
									'<div class="NE_LABEL NE_PT5">Celular *</div>'+
									'<input name="celular" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10 " />'+
								'</div>'+
							'</div>'+
							'<div class="NE_CONTENT_ROW  NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
								'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
									'<div class="NE_LABEL NE_PT5">CEP *</div>'+
									'<input name="cep" id="CEP" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10" />'+
								'</div>'+
							'</div>'+
						'</form>'+
						'<div class="NE_CONTENT_ROW  NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
							'<div class="NE_CONTENT_2COL30 ">'+
								'<input type="button" value="CONTINUAR" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_HEAVY" onclick="InstaleFacil.formButtonPressed();"  />'+
							'</div>'+
						'</div>'
					;
					populateForm();
				break;
			case 'step_three':
						CORE.view.innerHTML =
							'<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
								'<div class="NE_CONTENT_2COL80">'+
									'<h2 class="NE_BORDER_BOTTOM NE_SPACE_BOTTOM">Falta pouco, '+CORE.formLoad.nome+'!</h2>'+
									'<p class="NE_INFO">Descreva os serviços que sua empresa oferece.</p>'+
								'</div>'+
							'</div>'+
							'<div class="NE_CONTENT_ROW  NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING" id="divMsg" style="display: none">'+
								'<div class="NE_CONTENT_2COL50 NE_SPACE_BOTTOM NE_CLEAR_PADDING">'+
									'<h4 class="NE_LEFT" id="NE_MSG"></h4>'+
								'</div>'+
							'</div>'+
							'<form name="nForm">'+
								'<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
									'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
										'<div class="NE_LABEL NE_PT10">Fale sobre a empresa *</div>'+
										'<textarea name="descricao" rows="15" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED" ></textarea>'+
									'</div>'+
								'</div>'+
							'</form>'+
							'<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
								'<div class="NE_CONTENT_2COL30 ">'+
									'<input type="button" value="CONTINUAR" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_HEAVY" onclick="InstaleFacil.formButtonPressed();"  />'+
								'</div>'+
							'</div>'
						;
						populateForm();
					break;
			case 'step_four':
					var html =
						'<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
							'<div class="NE_CONTENT_2COL80">'+
								'<h2 class="NE_BORDER_BOTTOM NE_SPACE_BOTTOM">Quais regiões você atende?</h2>'+
								'<p class="NE_INFO">Marque as regiões de atuação da empresa.</p>'+
							'</div>'+
						'</div>'+
						'<div class="NE_CONTENT_ROW" id="divMsg" style="display: none">'+
							'<div class="NE_CONTENT_2COL50 NE_SPACE_BOTTOM NE_CLEAR_PADDING">'+
								'<h4 class="NE_LEFT" id="NE_MSG"></h4>'+
							'</div>'+
						'</div>'
					;
					for(var i = 0 ; i < CORE.regionList.areas.length ; i++){
						html +=
							'<div class="NE_CONTENT_ROW  NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
								'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
									'<div class="NE_COLLAPSIBLE_VIEW NE_PB10 NE_PT5 NE_BORDER_BOTTOM">'+
										'<div class="NE_TRUNCATE NE_CURSOR">'+
											'<table cellspacing="0" cellpadding="0" height="40" class="NE_TABLE_FIXED">'+
												'<tr>'+
													'<td width="30px"><input type="checkbox" name="checkbox" onchange="InstaleFacil.formCheckChange(this.checked, \''+CORE.regionList.areas[i].nome+'\');" /></td>'+
													'<td width="80%" class="NE_COLLAPSIBLE_CLICK">'+
														'<p class="NE_TRUNCATE NE_INFO NE_PRIMARY_TEXT_COLOR NE_HEAVY NE_LEFT NE_LINE_HEIGHT_20">'+CORE.regionList.areas[i].nome+'</p>'+
													'</td>'+
														'<td width="20px"class="NE_RIGHT NE_COLLAPSIBLE_CLICK"><span class="NE_ICON NE_COLLAPSIBLE_ICON ">&#xf107;</span></td>'+
												'</tr>'+
											'</table>'+
										'</div>'+
										'<div class="NE_COLLAPSIBLE_VIEWPORT">'+
											'<div class="NE_COLLAPSIBLE_CONTENT NE_COLLAPSIBLE_CONTENT_BOX NE_COLLAPSIBLE_COLOR_BOX">'+
												'<table cellspacing="0" cellpadding="0" height="40" class="NE_TABLE_FIXED">'
						;
						for(var j = 0 ; j < CORE.regionList.areas[i].regioes.length ; j++){
							html += '<tr><td><p class="NE_TRUNCATE NE_INFO NE_LINE_HEIGHT_20 NE_BORDER_BOTTOM NE_SPACE_BOTTOM NE_SPACE_TOP">'+CORE.regionList.areas[i].regioes[j]+'</p></td></tr>';
						}
						html +=
												'</table>'+
											'</div>'+
										'</div>'+
									'</div>'+
								'</div>'+
							'</div>'
						;
					}
					html +=
						'<div class="NE_CONTENT_ROW  NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
							'<div class="NE_CONTENT_2COL30 ">'+
								'<input type="button" value="CONTINUAR" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_HEAVY" onclick="InstaleFacil.formButtonPressed();"  />'+
							'</div>'+
						'</div>'
					;
					CORE.selectedRegionList = [];
					CORE.view.innerHTML = html;
					break;
			}
		}
    };

	this.formCheckChange = function(checked, name){
		if(checked){
			CORE.selectedRegionList.push(name);
		}else{
			CORE.selectedRegionList = removeFromArray(
				CORE.selectedRegionList,
				name
			);
		}
	};

	function populateForm(){
		if(CORE.action == 'step_two'){
			document.nForm.cnpj.value = CORE.formLoad.cnpj;
			document.nForm.razaosocial.value = CORE.formLoad.razao;
			document.nForm.nomefantasia.value = CORE.formLoad.nome;
			document.nForm.telefone.value = CORE.formLoad.telefone;
			document.nForm.celular.value = CORE.formLoad.celular;
			document.nForm.cep.value = CORE.formLoad.cep;
		}
		if(CORE.action == 'step_three'){
			document.nForm.descricao.value = CORE.formLoad.descricao;
		}
	}

	function pageToDraw(){
		switch(CORE.formLoad['ativacao']){
			case '1A': CORE.showPage('step_one'); break;
			case '1B': CORE.showPage('step_two'); break;
			case '1C': CORE.showPage('step_three'); break;
			case '1D': prepareRegionList(); break;

		}
		showContent();
		if (CORE.formLoad['ativacao'] !== '1D') {
			showLoading(false);
		}
	}

	function prepareRegionList(){
		remoteCall(
			'instalador/api/get-region-list',
			{},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showMessage('Atenção', data['message']);
				}else{
					CORE.regionList = data;
					CORE.showPage('step_four');
					showLoading(false);
					setTimeout(function(){SUB_setCollapsibles();}, 10)
				}
			}
		);

	}
	this.formCheckChangeTermo = function(checked, id){
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
			'instalador/api/get-termo-uso',
			{},
			function(data){
				if(typeof data['error'] != 'undefined' && data['error'] != 0){
					console.log(data);
					//window.location.replace('index.html');
				}else{
					CORE.termosHTML = data.termo;
					CORE.showPage('step_one');
					showContent();
					showLoading(false);
				}
			}
		);
	}

	this.initialize = function(){
		remoteCall(
			'instalador/api/load-user-data',
			{},
			function(data){
				if(typeof data['error'] != 'undefined'){
					window.location.replace('index.html');
				}else{
					if(data['status'] == 'Inativo'){
						switch(data['ativacao']){
							case '0A':
								window.location.replace('verificar-email.html');
							break;
							case '1A':
								CORE.getTermos();
								break;
							case '1B':
							case '1C':
							case '1D':
								CORE.formLoad = data;
								pageToDraw();
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
InstaleFacil.formCheckChangeTermo = function(checked, name){
    this.getInstance().formCheckChangeTermo(checked, name);
};
