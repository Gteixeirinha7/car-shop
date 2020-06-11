"use strict";

function InstaleFacil(){

	var CORE = this;

	this.view = null;
	this.action = null;

	this.loadUser = null;

	this.servicoList = null;
	this.materialList = null;
	this.photoList = null;
	this.enviaFotos = false;

	this.orcamentoInfo = null;

	this.itensPrinted = 0;

	this.screenNumbers = {
		servicosAndamento: 0,
		orcamentos: 0,
		fotos:0,
		ligacoes: 0,
		obrasDisponiveis:0,
		recebimentosFuturos:0
	};

	this.filter = '';
	this.selectedProject = null;

	function clearNumbers(){
		CORE.screenNumbers.servicosAndamento = 0;
		CORE.screenNumbers.orcamentos = 0;
		CORE.screenNumbers.fotos = 0;
		CORE.screenNumbers.ligacoes = 0;
		CORE.screenNumbers.obrasDisponiveis = 0;
		CORE.screenNumbers.recebimentosFuturos = 0;
	}

	this.changeFilter = function(filter){
		CORE.filter = filter;
		CORE.selectedProject = null;
		refreshScreenData();
	};

	this.itemListClick = function(index){
		CORE.selectedProject = index;
		refreshScreenData();
	};

	this.actionProjHandler = function(action, id, data){
		CORE.action = action;
		switch(action){
			case 'os':
				sendOrcamentoStatus(id, data);
				break;
			case 'lo':
				loadOrcamento(id);
				break;
			case 'ao':
				sendOrcamento(id);
				break;
			case 'ph':
				loadPhoto(id);
				break;
			case 'ch':
				startChat(id);
				break;
		}
	};

	this.rejectOrcamento = function(id) {
		var html =
		'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
			'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING" style="padding: 0;">'+
				'<div class="NE_LABEL NE_PT5 NE_PB5 NE_HEAVY">Descreva o motivo para não aceitação desta obra</div>'+
				'<textarea rows="4" cols="50" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_LEFT NE_PB10" style="width:100%;" id="motivo" name="motivo"></textarea>'+
			'</div>'+
		'</div>'+
		'<div class="NE_CONTENT_ROW NE_PB10">'+
			'<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING" style="padding-left: 0px"><button class="NE_BTN_DEFAULT NE_COLOR_QUARTENARY_OUTLINE NE_TRUNCATE" onclick="InstaleFacil.getInstance().showPopUp(false, \'\', \'\')">CANCELAR</button></div>'+
			'<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING" style="padding-right: 0px"><button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON_OUTLINE NE_TRUNCATE" onclick="InstaleFacil.getInstance().actionProjHandler(\'os\','+id+',\'9D\');">CONFIRMAR</button></div>'+
		'</div>'
		;

		CORE.showPopUp(true, 'Rejeitar Serviço', html);
	};

	this.currentChatId = null;
	this.chatWorker = null;
	this.chatInterval = 1000;
	this.chatCountDown = 5;
	this.messages = [];
	this.chatData = null;
	this.chatControl = {
		first: 0,
		last: 0,
		lastDate: null
	};
	this.chatIsBusy = false;

	this.regionList = {};
	this.selectedRegionList = [];

	function startChatWorker(start){
		if(CORE.chatWorker != null){
			clearInterval(CORE.chatWorker);
			CORE.chatWorker = null;
		}
		if(start){
			CORE.chatWorker = setInterval(chatWorker, CORE.chatInterval);
		}else{
			CORE.chatData = null;
			CORE.currentChatId = null;
			CORE.chatIsBusy = false;
			CORE.chatCountDown = 10;
			CORE.messages = [];
		}
	}

	function chatWorker(){
		if(CORE.chatCountDown <= 0){
			var messagesToSend = CORE.messages;
			CORE.messages = [];
			getMessages(messagesToSend, function(){ return false; });
			CORE.chatCountDown = 10;
		}else{
			CORE.chatCountDown--;
		}
	}

	function addMessageToSend(message){
		if(message > ' '){
			CORE.messages.push(message);
			CORE.chatCountDown = 0;
		}
	}

	function startChat(id){
		CORE.currentChatId = id;
		showLoading(true);
		var html = '' +
			'<div class="NE_CONTENT_ROW">'+
				'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
					'<table cellspacing="0" cellspacing="0" style="padding:0;height:250px;width:100%;table-layout: fixed;">'+
						'<tr><td valign="bottom">'+
							'<div style="max-height:250px;overflow:auto;width:100%;" id="NE_CHAT_VIEW"></div>'+
						'</td></tr>'+
					'</table>'+
				'</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW">'+
				'<div class="NE_CONTENT_2COL80">'+
					'<textarea onkeypress="InstaleFacil.getInstance().chatKeyPressed(event, this);" rows="4" cols="50" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_LEFT" style="width:100%;" id="NE_CHAT_AREA"></textarea>'+
				'</div>'+
				'<div class="NE_CONTENT_2COL20">'+
					'<button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_OUTLINE" onclick="InstaleFacil.getInstance().buttonSendPressed()">Enviar</button>'+
				'</div>'+
			'</div>'
		;
		CORE.showPopUp(true, getNameOfOrcamentoId(id), html, '500px', function(){ CORE.clearInterval(); });
		getAllMessages(id, function(){
			drawMessages();
			showLoading(false);
			startChatWorker(true);
		});
	}

	this.clearInterval = function() {
		clearInterval(chatWorker);
		startChatWorker(false);
		CORE.showPopUp(false, '', '');
	};

	function getNameOfOrcamentoId(id){
		var name = '';
		for(var i = 0 ; i < CORE.loadUser.projetos.length ; i++){
			if(CORE.loadUser.projetos[i].orcamento.id == id){
				name = CORE.loadUser.projetos[i].contato.nome;
			}
		}
		return name;
	}

	function htmlEntities(str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	this.buttonSendPressed = function(){
		var elem = document.getElementById('NE_CHAT_AREA');
		if(elem != null){
			addMessageToSend(elem.value);
			elem.value = '';
		}
	};

	this.chatKeyPressed = function(e, elem){
		if(e.keyCode == 13){
			addMessageToSend(elem.value);
			elem.value = '';
			e.preventDefault();
		}
	};

	function drawMessages(){
		var elem = document.getElementById('NE_CHAT_VIEW'),
			html = '';
		if(elem != null){
			for(var i = CORE.chatData.messages.length-1 ; i >= 0 ; i--){
				var dateMsg = parseMessageDate(CORE.chatData.messages[i].createddate);
				if (messageDate(dateMsg)) {
					html +=
						'<div class="NE_CONTAINER_CHAT NE_CENTER">'+
							'<span class="NE_LABEL NE_TRUNCATE NE_TEXT_COLOR">'+CORE.chatControl.lastDate+'</span>'+
						'</div>'
					;
				}
				if(CORE.chatData.messages[i].sender == 'I'){
					html += buildSendMessage(CORE.chatData.messages[i].message, CORE.chatData.messages[i].createddate);
				} else {
					html += buildReceivedMessage(CORE.chatData.messages[i].message, CORE.chatData.messages[i].createddate);
				}
			}
			elem.innerHTML = html;
			elem.scrollTop = elem.scrollHeight;
		}
	}

	function appendMessages(messages){
		var elem = document.getElementById('NE_CHAT_VIEW'),
			html = '';
		for(var i = 0 ; i < messages.length ; i++){
			var dateMsg = parseMessageDate(messages[i].createddate);
			if (messageDate(dateMsg)) {
				html +=
					'<div class="NE_CONTAINER_CHAT NE_CENTER">'+
						'<span class="NE_LABEL NE_TRUNCATE NE_TEXT_COLOR">'+CORE.chatControl.lastDate+'</span>'+
					'</div>'
				;
			}
			if(messages[i].sender == 'I'){
				html += buildSendMessage(messages[i].message, messages[i].createddate);
			} else {
				html += buildReceivedMessage(messages[i].message, messages[i].createddate);
			}
		}
		elem.innerHTML += html;
		elem.scrollTop = elem.scrollHeight;
	}

	function parseReceivedDate(time){
		time = new Date(time + ' GMT');
		return numSize(time.getHours()) + ':' + numSize(time.getMinutes());
	}

	function parseMessageDate(time){
		time = new Date(time + ' GMT');
		return numSize(time.getDate()) + '/' + numSize(time.getMonth() + 1);
	}

	function messageDate(date){
		if (CORE.chatControl.lastDate !== date || CORE.chatControl.lastDate == null) {
			CORE.chatControl.lastDate = date;
			return true;
		}
		return false;
	}

	function buildReceivedMessage(message, time){
		return '' +
			'<div class="NE_CONTAINER_CHAT">'+
				'<div class="NE_CHAT_BOX NE_CHAT_BOX_RECEIVER">'+
					htmlEntities(message) +
					'<span class="NE_CHAT_BOX_TIME">'+parseReceivedDate(time)+'</span>'+
				'</div>'+
			'</div>'
		;
	}

	function buildSendMessage(message, time){
		return '' +
			'<div class="NE_CONTAINER_CHAT">'+
				'<div class="NE_CHAT_BOX NE_CHAT_BOX_SEND NE_COLOR_LIGHTBLUE_FILLED">'+
					htmlEntities(message) +
					'<span class="NE_CHAT_BOX_TIME">'+parseReceivedDate(time)+'</span>'+
				'</div>'+
			'</div>'
		;
	}

	function getMessages(messagesToSend, callback){
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/send-receive-message',
			{
				'id': CORE.currentChatId,
				'messages': messagesToSend,
				'lastMessageId': CORE.chatControl.last
			},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}else{
					if(CORE.chatData != null){
						CORE.chatData.messages = data.messages.concat(
							CORE.chatData.messages
						);
					}else{
						CORE.chatData['messages'] = data.messages;
					}
					if(CORE.chatData.messages.length > 0){
						CORE.chatControl.last = CORE.chatData.messages[0].id;
						CORE.chatControl.first = CORE.chatData.messages[CORE.chatData.messages.length-1].id;
					}
					if(data.messages.length > 0){
						appendMessages(data.messages);
					}
					CORE.chatIsBusy = false;
					callback();
				}
			}
		);
	}

	function getAllMessages(id, callback){
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/send-receive-message',
			{'id': id},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}else{
					showLoading(false);
					CORE.chatData = data;
					if(CORE.chatData.messages.length > 0){
						CORE.chatControl.last = CORE.chatData.messages[0].id;
						CORE.chatControl.first = CORE.chatData.messages[CORE.chatData.messages.length-1].id;
					}
					callback();
					CORE.chatIsBusy = false;
				}
			}
		);
	}

	function stopChat(){
		startChatWorker(false);
	}

	function numSize(VAR_text){
		return (VAR_text < 10 ? '0' + VAR_text : VAR_text)
	}

	function sendOrcamento(id){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/set-orcamento-status',
			{id: id, status: '2A', motivo: ''},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}else{
					showLoading(false);
					CORE.chatIsBusy = false;
					if(data.status == '2A'){
						CORE.initialize();
					}else{
						showMessage('Atenção', JSON.stringify(data));
					}
				}
			}
		);
	}

	function loadOrcamento(id){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/load-orcamento-data',
			{id:id, complete: true},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}else{
					showLoading(false);
					CORE.orcamentoInfo = data.orcamento;
					CORE.servicoList = {};
					for(var i = 0 ; i < data.servicoList.length ; i++){
						CORE.servicoList[data.servicoList[i].sfid] = data.servicoList[i];
					}
					CORE.materialList = {};
					for(var i = 0 ; i < data.materialList.length ; i++){
						CORE.materialList[data.materialList[i].sfid] = data.materialList[i];
					}
					CORE.chatIsBusy = false;
					CORE.buildOrcamentoData();
				}
			}
		);
	}

	function loadPhoto(id){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/load-projeto-foto-data',
			{id:id, complete: true},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					CORE.chatIsBusy = false;
					showMessage('Atenção', data['message']);
				}else{
					showLoading(false);
					CORE.photoList = data.fotos;
					CORE.enviaFotos = data.enviaFotos;
					CORE.chatIsBusy = false;
					CORE.buildPhotoData();
				}
			}
		);
	}

	function buildOrcamentoServicoItem(){
		var html = '';
		CORE.orcamentoInfo.valorServico = 0;
		for(var i = 0 ; i < CORE.orcamentoInfo.servicos.length ; i++){
			CORE.orcamentoInfo.valorServico += (
				CORE.orcamentoInfo.servicos[i].precoUnitario *
				CORE.orcamentoInfo.servicos[i].quantidade
			);
			html += ''+
				'<table cellspacing="0" cellpadding="0" class="' + ( (i + 1) >= CORE.orcamentoInfo.servicos.length ? '' : 'NE_BORDER_BOTTOM' ) + '" width="100%">'+
					'<tr>'+
						'<td width="100%" colspan="3">'+
							'<p class="NE_TRUNCATE NE_INFO NE_PB10">'+CORE.servicoList[CORE.orcamentoInfo.servicos[i].sfid].descricao+
								(
									CORE.servicoList[CORE.orcamentoInfo.servicos[i].sfid].editar ?
										' - ' + CORE.orcamentoInfo.servicos[i].descricao
									:
										''
								)+
							'</p>'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td class="NE_LEFT" width="5%">'+
							(
								CORE.loadUser.projetos[CORE.selectedProject].status >= '3A' ?
									''
								:
									'<span onclick="InstaleFacil.getInstance().removeServiceActionClick('+i+')" class="NE_TRUNCATE NE_CURSOR NE_QUARTENARY_TEXT_COLOR NE_ICON" style="font-size: 16px;">&#xf1f8;</span>'
							)+
						'</td>'+
						'<td width="10%">'+
							'<p class="NE_TRUNCATE NE_INFO NE_PB5 NE_RIGHT ">'+
								'<span class="NE_HEAVY">'+CORE.orcamentoInfo.servicos[i].quantidade+'<small> X </small></span>'+
							'</p>'+
						'</td>'+
						'<td width="85%">'+
							'<p class="NE_TRUNCATE NE_INFO NE_PB5 NE_LEFT " style="padding-left: 5px;">'+
								'<span>R$ '+SUB_parseMonetaryValues(CORE.orcamentoInfo.servicos[i].precoUnitario, 2)+'</span>'+
							'</p>'+
						'</td>'+
					'</tr>'+
				'</table>'
			;
		}
		return html;
	}

	function buildOrcamentoMaterialItem(){
		var html = '';

		for(var i = 0 ; i < CORE.orcamentoInfo.materiais.length ; i++){
			html += '' +
				'<table cellspacing="0" cellpadding="0" class="' + ( (i + 1) >= CORE.orcamentoInfo.materiais.length ? '' : 'NE_BORDER_BOTTOM' ) + '" width="100%">'+
					'<tr>'+
						'<td class="NE_LEFT" width="5%">'+
						((CORE.loadUser.projetos[CORE.selectedProject].status >= '5A')?'':
							'<span class="NE_TRUNCATE NE_CURSOR NE_QUARTENARY_TEXT_COLOR NE_ICON" onclick="InstaleFacil.getInstance().removeMaterialActionClick('+i+')" style="font-size: 16px;">&#xf1f8;</span>')+
						'</td>'+
						'<td width="10%">'+
							'<p class="NE_TRUNCATE NE_INFO NE_PB5 NE_RIGHT NE_HEAVY">'+
								'<span>'+CORE.orcamentoInfo.materiais[i].quantidade+'<small> X </small></span>'+
							'</p>'+
						'</td>'+
						'<td width="85%" colspan="2">'+
							'<p class="NE_TRUNCATE NE_INFO NE_PB5" style="padding-left: 5px;">'+CORE.materialList[CORE.orcamentoInfo.materiais[i].sfid].descricao+
							(
								CORE.materialList[CORE.orcamentoInfo.materiais[i].sfid].editar ?
									' - ' + CORE.orcamentoInfo.materiais[i].descricao
								:
									''
							)+
							'</p>'+
						'</td>'+
					'</tr>'+
				'</table>'
			;
		}
		return html;
	}

	this.insertService = function(){
		var buffer = '<div style="height:450px;"><div class="NE_CONTENT_WRAPPER" style="padding:10px">';
		for(var sfid in CORE.servicoList){
			buffer += '' +
				'<div class="NE_CONTENT_ROW">'+
					'<div class="NE_BORDER_BOTTOM NE_CURSOR">'+
						'<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED" onclick="InstaleFacil.getInstance().insertServiceClick(\''+sfid+'\')">'+
							'<tr>'+
								'<td width="90%">'+
									'<p class="NE_INFO NE_PADDING_10">' + CORE.servicoList[sfid].descricao + '</p>'+
								'</td>'+
								'<td class="NE_RIGHT NE_COLLAPSIBLE_CLICK ">'+
									'<span class="NE_ICON NE_COLLAPSIBLE_ICON">&#xf054;</span>'+
								'</td>'+
							'</tr>'+
						'</table>'+
					'</div>'+
				'</div>'
			;
		}
		buffer += '<div class="NE_PADDING_10"></div>';
		buffer += '</div></div>';
		CORE.showPopUp(true, 'Serviços', buffer, '500px', function() { InstaleFacil.getInstance().buildOrcamentoData() });
	};

	this.insertServiceClick = function(sfid){
		var buffer = '' +
			'<div style="padding:10px">'+
				'<div class="NE_CONTENT_ROW">'+
					'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED NE_CLEAR_PADDING">'+
							'<tr>'+
								'<td>'+
									'<div class="NE_CONTENT_ROW">'+
										'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
											'<h1 class="NE_INFO NE_PRIMARY_TEXT_COLOR NE_HEAVY">Serviço</h1>'+
											(
												CORE.servicoList[sfid].editar ?
													'<input type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_LEFT" id="NE_NOME_SERVC" value="'+CORE.servicoList[sfid].descricao+'"/>'
														:
													'<input type="text" class="NE_INPUT NE_LEFT" style="padding: 5px 0px 0px 0px; border: 0px" id="NE_NOME_SERVC" readonly value="'+CORE.servicoList[sfid].descricao+'"/>'
											)+
										'</div>'+
										'<div class="NE_CONTENT_2COL50">'+
											'<h1 class="NE_INFO NE_PRIMARY_TEXT_COLOR NE_HEAVY">Quantidade ('+CORE.servicoList[sfid].unidade+')</h1>'+
											'<input type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_LEFT" id="NE_QNTD_SERVC" placeholder="0" oninput="InstaleFacil.getInstance().validateText(\'NE_QNTD_SERVC\', false, \'servico\')"/>'+
										'</div>'+
										'<div class="NE_CONTENT_2COL50">'+
											'<h1 class="NE_INFO NE_PRIMARY_TEXT_COLOR NE_HEAVY">Preço Unitário (R$)</h1>'+
											'<input type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_LEFT" id="NE_PREC_SERVC" placeholder="0" onchange="InstaleFacil.getInstance().inputRefresh(this.id, this.value);"  oninput="InstaleFacil.getInstance().validateText(\'NE_PREC_SERVC\', false, \'servico\')"/>'+
										'</div>'+
										'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING"><button class="NE_BTN_DEFAULT NE_TRUNCATE NE_COLOR_QUARTENARY_OUTLINE" onclick="InstaleFacil.getInstance().insertServiceActionClick(\'\', false,\'\',0,0,false)">Cancelar</button></div>'+
										'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING"><button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_OUTLINE NE_DISABLED" disabled id="NE_BTN_SERVC"  onclick="InstaleFacil.getInstance().insertServiceActionClick(\''+sfid+'\', true, document.getElementById(\'NE_NOME_SERVC\').value, document.getElementById(\'NE_QNTD_SERVC\').value, document.getElementById(\'NE_PREC_SERVC\').value, '+CORE.servicoList[sfid].editar+')">Adicionar</button></div>'+
									'</div>'+
								'</td>'+
							'</tr>'+
						'</table>'+
					'</div>'+
				'</div>'+
			'</div>'
		;
		CORE.showPopUp(true, 'Inserir Serviço', buffer, '500px', function() { InstaleFacil.getInstance().buildOrcamentoData() });
	};
	this.insertServiceActionClick = function (sfid, accept, nome, qntd, preco, edit){
		preco	=	scapeCommaPoint(preco);
		if(accept){
			if(qntd > 0 && preco > 0){
				qntd = (qntd[0] == "0" ? qntd.substring(1,qntd.length) : qntd);
				preco = (preco[0] == "0" ? preco.substring(1,qntd.length) : preco);
				var serv = {
					sfid:sfid,
					quantidade:qntd,
					precoUnitario: preco
				};
				if(edit){
					serv.descricao = nome;
				}
				CORE.orcamentoInfo.servicos.push(serv);
			}
		}
		CORE.buildOrcamentoData();
	};
	this.removeServiceActionClick = function (index){
		CORE.orcamentoInfo.servicos.splice(index, 1);
		CORE.buildOrcamentoData();
	};

	this.insertMaterial = function(){
		var buffer = '<div style="height:450px;"><div class="NE_CONTENT_WRAPPER" style="padding:10px">';
		for(var sfid in CORE.materialList){
			buffer += '' +
				'<div class="NE_CONTENT_ROW">'+
					'<div class="NE_BORDER_BOTTOM NE_CURSOR">'+
						'<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED" onclick="InstaleFacil.getInstance().insertMaterialClick(\''+sfid+'\')">'+
							'<tr>'+
								'<td width="90%">'+
									'<p class="NE_INFO NE_PADDING_10">' + CORE.materialList[sfid].descricao + '</p>'+
								'</td>'+
								'<td class="NE_RIGHT NE_COLLAPSIBLE_CLICK ">'+
									'<span class="NE_ICON NE_COLLAPSIBLE_ICON">&#xf054;</span>'+
								'</td>'+
							'</tr>'+
						'</table>'+
					'</div>'+
				'</div>'
			;
		}
		buffer += '<div class="NE_PADDING_10"></div>';
		buffer += '</div></div>';
		CORE.showPopUp(true, 'Inserir Material', buffer, '500px', function() { InstaleFacil.getInstance().buildOrcamentoData() });
	};

	this.insertMaterialClick = function(sfid){
		var buffer = '' +
			'<div style="padding:10px">'+
				'<div class="NE_CONTENT_ROW">'+
					'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED NE_CLEAR_PADDING">'+
							'<tr>'+
								'<td>'+
									'<div class="NE_CONTENT_ROW">'+
										'<div class="NE_CONTENT_1COL NE_PT5 NE_PB10">'+
											'<h1 class="NE_INFO NE_PRIMARY_TEXT_COLOR NE_HEAVY">Material</h1>'+
											(
												CORE.materialList[sfid].editar ?
												'<input type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_LEFT" id="NE_NOME_MAT" value="'+CORE.materialList[sfid].descricao+'"/>'
													:
												'<input type="text" class="NE_INPUT NE_LEFT" style="padding: 5px 0px 0px 0px; border: 0px" id="NE_NOME_MAT" readonly value="'+CORE.materialList[sfid].descricao+'"/>'
											)+
										'</div>'+
										'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
											'<h1 class="NE_INFO NE_PRIMARY_TEXT_COLOR NE_HEAVY">Quantidade</h1>'+
											'<input type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_RIGHT" id="NE_QNTD_MAT" placeholder="0" oninput="InstaleFacil.getInstance().validateText(\'NE_QNTD_MAT\', false, \'material\')"/>'+
										'</div>'+
									'</div>'+
									'<div class="NE_CONTENT_ROW">'+
										'<div class="NE_CONTENT_2COL50_FIXED"><button class="NE_BTN_DEFAULT NE_TRUNCATE NE_COLOR_QUARTENARY_OUTLINE" onclick="InstaleFacil.getInstance().insertMaterialActionClick(\'\', false, 0,0)">Cancelar</button></div>'+
										'<div class="NE_CONTENT_2COL50_FIXED"><button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_OUTLINE NE_DISABLED" disabled id="NE_BTN_MAT" onclick="InstaleFacil.getInstance().insertMaterialActionClick(\''+sfid+'\', true, document.getElementById(\'NE_QNTD_MAT\').value, document.getElementById(\'NE_NOME_MAT\').value, '+CORE.materialList[sfid].editar +')">Adicionar</button></div>'+
									'</div>'+
								'</td>'+
							'</tr>'+
						'</table>'+
					'</div>'+
				'</div>'+
			'</div>'
		;
		CORE.showPopUp(true, 'Inserir Material', buffer, '500px', function() { InstaleFacil.getInstance().buildOrcamentoData() });
	};

	this.insertMaterialActionClick = function (sfid, accept, qntd, nome, edit){
		if(accept && qntd != "0"){
			qntd = (qntd[0] == "0" ? qntd.substring(1,qntd.length) : qntd);
			var matrl = {
				sfid:sfid,
				quantidade:qntd
			};
			if(edit){
				matrl.descricao = nome;
			}
			CORE.orcamentoInfo.materiais.push(matrl);
		}
		CORE.buildOrcamentoData();
	};
	this.removeMaterialActionClick = function (index){
		CORE.orcamentoInfo.materiais.splice(index, 1);
		CORE.buildOrcamentoData();
	};

	this.buildOrcamentoData = function(){
		var buffer = '' +
			'<div style="padding"10px;box-sizing:border-box;">'+
				'<div class="NE_CONTENT_ROW">'+
					'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'<div class="NE_COLLAPSIBLE_VIEW">'+
							'<div class="NE_TRUNCATE NE_CURSOR NE_COLLAPSIBLE_CLICK">'+
								'<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED  NE_PT10">'+
									'<tr>'+
										'<td width="80%">'+
											'<p class="NE_TRUNCATE NE_INFO NE_PRIMARY_TEXT_COLOR NE_HEAVY NE_LINE_HEIGHT_20">Serviços</p>'+
										'</td>'+
										'<td width="5%" class="NE_RIGHT">'+
											'<span class="NE_ICON NE_COLLAPSIBLE_ICON">&#xf078;</span>'+
										'</td>'+
									'</tr>'+
								'</table>'+
							'</div>'+
							'<div class="NE_COLLAPSIBLE_VIEWPORT">'+
								'<div class="NE_COLLAPSIBLE_CONTENT NE_COLLAPSIBLE_CONTENT_BOX NE_COLLAPSIBLE_COLOR_BOX">'+
									'<div class="NE_LIST_DEFAULT">'+
										buildOrcamentoServicoItem()+
									'</div>'+
								'</div>'+
							'</div>'+
						'</div>'+
					'</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW NE_BORDER_BOTTOM">'+
					'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_PB5">'+
						'<table  cellpadding="0" cellspacing="0" height="40" class="NE_TABLE_FIXED">'+
							'<tr>'+
							'<td width="15px">'+
							(
								CORE.loadUser.projetos[CORE.selectedProject].status >= '3A' ?
									''
								:
							'<h3 class="NE_TRUNCATE NE_SECONDARY_TEXT_COLOR NE_HEAVY NE_LEFT NE_CURSOR" style="font-size: 40px;" onclick="InstaleFacil.getInstance().insertService()">+</h3>'
							)+
							'</td>'+
								'<td width="40%" class="NE_PB10">'+
									(
										CORE.loadUser.projetos[CORE.selectedProject].status >= '3A' ?
											''
										:
										'<button type="button" class="NE_TRUNCATE NE_BTN_DEFAULT NE_COLOR_SECONDARY_OUTLINE NE_LEFT" style="border: 0px; padding:15px 0px 0px 0px;" name="button" onclick="InstaleFacil.getInstance().insertService()">Inserir serviço</button>'
	 								)+
								'</td>'+
								'<td width="100px">'+
									'<h3 class="NE_TRUNCATE NE_PRIMARY_TEXT_COLOR NE_HEAVY NE_RIGHT">R$ '+SUB_parseMonetaryValues(CORE.orcamentoInfo.valorServico, 2)+'</h3>'+
								'</td>'+
							'</tr>'+
						'</table>'+
					'</div>'+
				'</div>'+

				'<div class="NE_CONTENT_ROW NE_PT10">'+
					'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'<div class="NE_COLLAPSIBLE_VIEW">'+
							'<div class="NE_TRUNCATE NE_CURSOR NE_COLLAPSIBLE_CLICK">'+
								'<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED NE_PB5">'+
									'<tr>'+
										'<td width="70%">'+
											'<p class="NE_TRUNCATE NE_INFO NE_PRIMARY_TEXT_COLOR NE_HEAVY NE_LINE_HEIGHT_20">Materiais</p>'+
										'</td>'+
										'<td width="5%" class="NE_RIGHT">'+
											(CORE.orcamentoInfo.materialIncluso?'':'<span class="NE_ICON NE_COLLAPSIBLE_ICON">&#xf078;</span>')+
										'</td>'+
									'</tr>'+
								'</table>'+
							'</div>'+
							(CORE.orcamentoInfo.materialIncluso ?
								'<input  type="text" id="NE_MATERIAL_INPUT" '+(CORE.loadUser.projetos[CORE.selectedProject].status >= '3A' ?'disabled':'')+' onchange="InstaleFacil.getInstance().inputRefresh(\'NE_MATERIAL_INPUT\', this.value);" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_RIGHT " value="'+SUB_parseMonetaryValues(CORE.orcamentoInfo.valorMaterial, 2)+'"/>'
							:
								'<div class="NE_COLLAPSIBLE_VIEWPORT">'+
									'<div class="NE_COLLAPSIBLE_CONTENT NE_COLLAPSIBLE_CONTENT_BOX NE_COLLAPSIBLE_COLOR_BOX">'+
										'<div id="materialEscolhido1" class="NE_LIST_DEFAULT">'+
											buildOrcamentoMaterialItem()+
										'</div>'+
									'</div>'+
								'</div>'
							)+
						'</div>'+
					'</div>'+
				'</div>'+

				(CORE.orcamentoInfo.materialIncluso ?
					''
				:
					'<div class="NE_CONTENT_ROW ">'+
						'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
							'<table cellspacing="0" cellpadding="0" height="40" class="NE_TABLE_FIXED">'+
								'<tr>'+
								(
									CORE.loadUser.projetos[CORE.selectedProject].status >= '3A' ?
									''
									:
									'<td width="15px"><h3 class="NE_TRUNCATE NE_SECONDARY_TEXT_COLOR NE_HEAVY NE_LEFT NE_CURSOR" style="font-size: 40px;" onclick="InstaleFacil.getInstance().insertMaterial()" >+</h3></td>'+
									'<td width="40%" >'+
										'<button type="button" class="NE_TRUNCATE NE_BTN_DEFAULT NE_COLOR_SECONDARY_OUTLINE NE_LEFT" style="border: 0px; padding:5px 0px 0px 0px;" onclick="InstaleFacil.getInstance().insertMaterial()" name="button">Inserir material</button>'+
									'</td>')+


									'<td width="100px">'+
										'<h2 class="NE_TRUNCATE NE_PRIMARY_TEXT_COLOR NE_HEAVY NE_RIGHT"></h2>'+
									'</td>'+
								'</tr>'+
							'</table>'+
						'</div>'+
					'</div>'
				)+


				'<div class="NE_CONTENT_ROW NE_BORDER_BOTTOM">'+
					'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'<table height="40" class="NE_TABLE_FIXED">'+
							'<tr>'+
								'<td class="NE_LEFT">'+
									'<label class="NE_CHECKBOX_LABEL">'+
										'<input '+(CORE.loadUser.projetos[CORE.selectedProject].status >= '3A' ?'disabled':'')+' type="checkbox" name="checkbox" '+(CORE.orcamentoInfo.materialIncluso?'checked':'')+' onchange="InstaleFacil.getInstance().changeMaterialCheck(event);" />'+
										'Orçamento inclui materiais'+
									'</label>'+
								'</td>'+
							'</tr>'+
						'</table>'+
					'</div>'+
				'</div>'+



				'<div class="NE_CONTENT_ROW NE_PT10  ">'+
					'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED NE_CLEAR_PADDING">'+
							'<tr>'+
								'<td width="50%" style="padding-right: 10px;">'+
									'<h1 class="NE_INFO NE_PRIMARY_TEXT_COLOR NE_HEAVY">Desconto: R$</h1 >'+
									'<input type="text" '+(CORE.loadUser.projetos[CORE.selectedProject].status >= '3A' ?'disabled':'')+' onchange="InstaleFacil.getInstance().inputRefresh(\'NE_DESCONTO_INPUT\', this.value);" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_RIGHT " value="'+CORE.orcamentoInfo.desconto+'" id="NE_DESCONTO_INPUT"/>'+
								'</td>'+
									'<td width="50%">'+
									'<h1 class="NE_INFO NE_PRIMARY_TEXT_COLOR NE_HEAVY">Total do orçamento: R$</h1 >'+
									'<input type="text" '+(CORE.loadUser.projetos[CORE.selectedProject].status >= '3A' ?'disabled':'')+' onchange="InstaleFacil.getInstance().inputRefresh(\'NE_TOTAL_INPUT\', this.value);" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_RIGHT "  value="'+CORE.orcamentoInfo.valorTotal+'" id="NE_TOTAL_INPUT"/>'+
								'</td>'+
							'</tr>'+
						'</table>'+
					'</div>'+
				'</div>'+

				(
					CORE.loadUser.projetos[CORE.selectedProject].status >= '3A' ?
						''
					:
					'<div class="NE_CONTENT_ROW  NE_PT10">'+
						'<div class="NE_CONTENT_2COL40  NE_CLEAR_PADDING">'+
							'<button id="btnConfirmarOrcamento" type="button" class="NE_BTN_DEFAULT NE_READ_ONLY NE_TRUNCATE NE_COLOR_SECONDARY_OUTLINE" name="button" disabled>Confirmar Orçamento</button>'+
						'</div>'+
					'</div>'
				)+


			'</div>'
		;
		CORE.showPopUp(true, 'Orçamento', buffer);
		CORE.inputRefresh('NE_SERVICO_SELECTED', CORE.orcamentoInfo.valorServico);
		SUB_setCollapsibles();
		toggleCollapsible();
	};

	this.buildConfigScreen = function() {
		var html = '';
		html =
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'		<div class="NE_CENTER NE_TRUNCATE NE_CURSOR" style="height: 100px; width: 100px; border-radius: 50%;background-image: url(\'' + (CORE.loadUser.image !== null ? CORE.getThumbnailUrl(CORE.loadUser.image) : "../images/user.jpg" ) +'\');background-size: cover;">'+
			'			<input type="file" accept=".jpg" name="" onchange="InstaleFacil.getInstance().sendUpdateFoto(this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'+
			'		</div>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CENTER NE_SPACE_BOTTOM">'+
			'		<div class="NE_LABEL NE_PT5 NE_CENTER NE_CURSOR">Alterar foto</div>'+
			'		<input type="file" accept=".jpg" name="" onchange="InstaleFacil.getInstance().sendUpdateFoto(this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING NE_SPACE_BOTTOM">'+
			'		<div class="NE_BORDER_BOTTOM NE_CENTER" style="position: relative"><div class="NE_ACTION_D_1"></div><div class="NE_ACTION_D_2"></div></div>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING" id="divMsg" style="display: none">'+
				'<div class="NE_CONTENT_2COL50 NE_SPACE_BOTTOM NE_CLEAR_PADDING">'+
					'<h4 class="NE_LEFT" id="NE_MSG"></h4>'+
				'</div>'+
			'</div>'+
			'<form name="nForm">'+
				'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
					'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CENTER">'+
						'<div class="NE_LABEL NE_PT5 NE_PB5">Receber pedidos *</div>'+
						'<label class="NE_TOGGLE NE_RIGHT">'+
						'	<input type="checkbox" '+( CORE.loadUser.receberPedidos ? 'checked' : '' )+' name="receberPedidos" id="receberPedidos">'+
						'	<span class="NE_SWITCH"></span>'+
						'</label>'+
					'</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
					'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'<div class="NE_LABEL NE_PT5">CNPJ *</div>'+
						'<input name="cnpj" id="CNPJ" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED " />'+
					'</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
					'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'<div class="NE_LABEL NE_PT5">Razão Social *</div>'+
						'<input name="razaosocial" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10 " />'+
					'</div>'+
					'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'<div class="NE_LABEL NE_PT5">Nome Fantasia *</div>'+
						'<input name="nomefantasia" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10 " />'+
					'</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
					'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'<div class="NE_LABEL NE_PT5">Telefone *</div>'+
						'<input name="telefone" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10 " />'+
					'</div>'+
					'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'<div class="NE_LABEL NE_PT5">Celular *</div>'+
						'<input name="celular" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10 " />'+
					'</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
					'<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
						'<div class="NE_LABEL NE_PT5">CEP *</div>'+
						'<input name="cep" id="CEP" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_PB10" />'+
					'</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
					'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'<div class="NE_LABEL NE_PT5">Descrição *</div>'+
						'<textarea rows="4" cols="50" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_LEFT NE_PB10" style="width:100%;" id="DESC" name="desc"></textarea>'+
					'</div>'+
				'</div>'+
			'</form>'+
			'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
				'<div class="NE_CONTENT_2COL50">'+
					'<input type="button" value="ÁREAS DE ATUAÇÃO" class="NE_BTN_DEFAULT NE_COLOR_PRIMARY_OUTLINE NE_HEAVY NE_TRUNCATE" onclick="InstaleFacil.getInstance().prepareRegionList()"  />'+
				'</div>'+
			// '</div>'+
			// '<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
				'<div class="NE_CONTENT_2COL50">'+
					'<input type="button" value="SALVAR" class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_OUTLINE NE_HEAVY NE_TRUNCATE" onclick="InstaleFacil.getInstance().sendUpdate(\'1A\');"  />'+
				'</div>'+
			'</div>'
		;
		CORE.showPopUp(true, 'Configurações', html, '500px');
		populateForm();

	};

	this.buildComgasScreen = function(){
		var html = '';
		html =
			'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
				 '<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_SPACE_BOTTOM">'+
					 '<div class="NE_LABEL"><h3>Tem alguma sugestão ou dúvida sobre a plataforma?</h3></div>'+
					 '<div class="NE_LABEL NE_PT20"><h3>Entre em contato com a gente no e-mail abaixo!</h3></div>'+
					 '<div class="NE_LABEL NE_PT20"><h3>contato@instalefacil.com.br</h3></div>'+
					 '<div class="NE_LABEL NE_PT20"><h3>Só não esqueça de incluir seus dados para agilizar a comunicação.</h3></div>'+
				 '</div>'+
			 '</div>'
		;
		CORE.showPopUp(true, 'Fale Conosco Instale Fácil', html);
	}
	this.buildAreaScreen = function() {
		var html = '';
		CORE.selectedRegionList = [];
		for(var i = 0 ; i < CORE.regionList.areas.length ; i++){
			if (CORE.regionList.areas[i].selected == true) {
				CORE.formCheckChange(true, CORE.regionList.areas[i].nome);
			}
			html +=
				'<div class="NE_CONTENT_ROW  NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
					'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'<div class="NE_COLLAPSIBLE_VIEW NE_PB10 NE_PT5 NE_BORDER_BOTTOM">'+
							'<div class="NE_TRUNCATE NE_CURSOR">'+
								'<table cellspacing="0" cellpadding="0" height="40" class="NE_TABLE_FIXED">'+
									'<tr>'+
										'<td width="30px"><input type="checkbox" name="checkbox" '+(CORE.regionList.areas[i].selected == true ? 'checked' : '')+' onchange="InstaleFacil.getInstance().formCheckChange(this.checked, \''+CORE.regionList.areas[i].nome+'\');" /></td>'+
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
					'<input type="button" value="CONFIRMAR" class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_OUTLINE NE_HEAVY" onclick="InstaleFacil.getInstance().sendUpdateArea();"  />'+
				'</div>'+
			'</div>'
		;
		CORE.showPopUp(true, 'Áreas de Atuação', html, '500px', function() { InstaleFacil.getInstance().buildConfigScreen() });
	};

	this.prepareRegionList = function(){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/get-region-list',
			{},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showMessage('Atenção', data['message']);
				}else{
					CORE.chatIsBusy = false;
					CORE.regionList = data;
					CORE.buildAreaScreen();
					showLoading(false);
					setTimeout(function(){SUB_setCollapsibles();toggleCollapsible();}, 10)
				}
			}
		);
	};

	this.sendUpdateArea = function(){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/set-area-atuacao',
			prepareData('0A'),
			function(data){
				showLoading(false);
				if(typeof data['error'] != 'undefined'){
					showMessage(data['message']);
				}else if (data['regioes'].length < 1) {
					showMessage('Você deve seleionar ao menos uma região');
				}else{
					showLoading(false);
					CORE.chatIsBusy = false;
					CORE.buildConfigScreen();
				}
			}
		);
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
		document.nForm.cnpj.value = CORE.loadUser.cnpj;
		document.nForm.razaosocial.value = CORE.loadUser.razao;
		document.nForm.nomefantasia.value = CORE.loadUser.nome;
		document.nForm.telefone.value = CORE.loadUser.telefone;
		document.nForm.celular.value = CORE.loadUser.celular;
		document.nForm.cep.value = CORE.loadUser.cep;
		document.nForm.desc.value = CORE.loadUser.descricao;
	}

	this.sendUpdate = function(step){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/update-profile',
			prepareData(step),
			function(data){
				if(typeof data['error'] != 'undefined'){
					showMessage(data['message']);
					showLoading(false);
				}else{
					CORE.loadUser.receberPedidos 	= data.receberPedidos;
					CORE.loadUser.cnpj 				= data.cnpj;
					CORE.loadUser.razao 			= data.razao;
					CORE.loadUser.nome 				= data.nome;
					CORE.loadUser.telefone 			= data.telefone;
					CORE.loadUser.celular 			= data.celular;
					CORE.loadUser.cep 				= data.cep;
					CORE.loadUser.descricao 		= data.descricao;
					showLoading(false);
					CORE.chatIsBusy = false;
					CORE.showPopUp(false, '', '');
				}
			}
		);
	};

	this.sendUpdateFoto = function(photo) {
		CORE.chatIsBusy = true;
		var dataToSend = {};
		var imageToSend = '';
		var reader = new FileReader();
		reader.readAsDataURL(photo);
		reader.onload = function () {



			showLoading(true);
			imageToSend = reader.result.split(',')[1];
			sendFile(
				'instalador/api/upload-profile-foto',
				dataToSend,
				imageToSend,
				function(data){
					if(typeof data['error'] != 'undefined'){
						showMessage('Erro', data['error']);
						showLoading(false);
						CORE.chatIsBusy = false;
					}else{
						CORE.loadUser.image = data.imageURL;
						CORE.buildConfigScreen();
						showLoading(false);
						CORE.chatIsBusy = false;
					}
				}, true
			);


		};
		reader.onerror = function (error) {
			showLoading(false);
		};
	};

	function prepareData(step) {
		if (step == '0A') {
			return  {
				areas: CORE.selectedRegionList
			};
		}
		if (step == '1A') {
			return {
				receberPedidos: document.nForm.receberPedidos.checked,
				cnpj: document.nForm.cnpj.value,
				razao: document.nForm.razaosocial.value,
				nome: document.nForm.nomefantasia.value,
				telefone: document.nForm.telefone.value,
				celular: document.nForm.celular.value,
				cep: document.nForm.cep.value,
				descricao: document.nForm.desc.value
			}
		}
	}

	this.buildPhotoData = function(){
		CORE.showPopUp(true, 'Acompanhamento da obra', CORE.buildPhotoScreen(), '800px');
		CORE.setPhotoScreen();
		CORE.photoClick();
	};

	this.buildPhotoPopUpData = function(index){
		CORE.showPopUp(true, 'Foto', buildPhotoPopUp(index), '500px', function() { InstaleFacil.getInstance().buildPhotoData() } );
	};

	this.inputRefresh = function(element, value){
		if(typeof value == 'string'){
			value = parseFloat(scapeCommaPoint(value).toFixed(2));
		}
		switch(element){
			case 'NE_SERVICO_SELECTED':
				CORE.orcamentoInfo.valorServico = value;
				break;
			case 'NE_TOTAL_INPUT':
					if (value >= 0 && value <= CORE.orcamentoInfo.valorTotal) {
						CORE.orcamentoInfo.desconto = CORE.orcamentoInfo.valorTotal - value;
					}
				break;
			case 'NE_DESCONTO_INPUT':
				if((CORE.orcamentoInfo.valorServico) + (CORE.orcamentoInfo.valorMaterial) - (value) >= 0){
					CORE.orcamentoInfo.desconto = (value);
				}
				break;
			case 'NE_MATERIAL_INPUT':
				if((CORE.orcamentoInfo.valorServico) + (value) - (CORE.orcamentoInfo.desconto) >= 0){
					CORE.orcamentoInfo.valorMaterial = (value);
				}
				break;
			case 'NE_PREC_SERVC':
				document.getElementById('NE_PREC_SERVC').value = SUB_parseMonetaryValues((value), 2);
				return false;
				break;
		}
		CORE.orcamentoInfo.valorTotal = (CORE.orcamentoInfo.valorServico) + CORE.orcamentoInfo.valorMaterial;
		document.getElementById('NE_TOTAL_INPUT').value = SUB_parseMonetaryValues(CORE.orcamentoInfo.valorTotal - CORE.orcamentoInfo.desconto, 2);
		document.getElementById('NE_DESCONTO_INPUT').value = SUB_parseMonetaryValues(CORE.orcamentoInfo.desconto, 2);
		if (document.getElementById('NE_MATERIAL_INPUT') !== null) {
			document.getElementById('NE_MATERIAL_INPUT').value = SUB_parseMonetaryValues(CORE.orcamentoInfo.valorMaterial, 2);
		}

		if (enableButtonOrcamento()) {
			if (document.getElementById('btnConfirmarOrcamento') !== null) {
				document.getElementById('btnConfirmarOrcamento').disabled = false;
				document.getElementById('btnConfirmarOrcamento').classList.remove('NE_READ_ONLY');
				document.getElementById('btnConfirmarOrcamento').classList.remove('NE_COLOR_SECONDARY_OUTLINE');
				document.getElementById('btnConfirmarOrcamento').classList.add('NE_COLOR_SECONDARY_CONFIRM_BUTTON');
				document.getElementById('btnConfirmarOrcamento').onclick = function(){InstaleFacil.getInstance().sendOrcamento();};
			}
		}

	}

	this.changeMaterialCheck = function(event){
		CORE.orcamentoInfo.materialIncluso = event.target.checked;
		if(!CORE.orcamentoInfo.materialIncluso){
			CORE.orcamentoInfo.valorMaterial = 0;
		}
		CORE.buildOrcamentoData();
	};

	function parseUseFloat(value){
		return value.replace(".","").replace(",",".");
	}

	this.sendOrcamento = function(){

		showLoading(true);
		CORE.chatIsBusy = true;
		if(CORE.orcamentoInfo.materialIncluso){
			CORE.orcamentoInfo.materiais = [];
		}

		remoteCall(
			'instalador/api/save-orcamento-data',
			CORE.orcamentoInfo,
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}
				CORE.chatIsBusy = false;
				CORE.showPopUp(false, '', '');
				CORE.initialize();
			}
		);
	};

	this.enableButton = function(options) {
		var enable = true;
		for (var i = 0; i < options.values.length; i++) {
			if(options.values[i] < ' ' || options.values[i] <= 0){
				enable = false;
			}
		}
		if (enable) {
			document.getElementById(options.btn).disabled = false;
			document.getElementById(options.btn).classList.remove('NE_READ_ONLY');
			document.getElementById(options.btn).classList.remove('NE_COLOR_SECONDARY_OUTLINE');
			document.getElementById(options.btn).classList.add('NE_COLOR_SECONDARY_CONFIRM_BUTTON');
		}else{
			document.getElementById(options.btn).disabled = true;
			document.getElementById(options.btn).classList.add('NE_READ_ONLY');
			document.getElementById(options.btn).classList.add('NE_COLOR_SECONDARY_OUTLINE');
			document.getElementById(options.btn).classList.remove('NE_COLOR_SECONDARY_CONFIRM_BUTTON');
		}
	};

	this.validateText = function(text, number, enable){
		if (number) {
			return text.toString().replace(/[^-\d,\.]/g,"");
		}
		var el = document.getElementById(text);
		el.value = (el.value > ' ' ? el.value.toString().replace(/[^-\d,\.]/g,"") : 0);
		if (enable > ' ') {
			validateButton(enable);
		}
	}

	function validateButton(type) {
		var options = {
			btn: '',
			values: []
		};
		if (type == 'material') {
			options.btn = 'NE_BTN_MAT';
			options.values.push(document.getElementById('NE_QNTD_MAT').value);
		}else{
			options.btn = 'NE_BTN_SERVC';
			options.values.push(document.getElementById('NE_QNTD_SERVC').value);
			options.values.push(document.getElementById('NE_PREC_SERVC').value);
		}
		CORE.enableButton(options);
	}

	function validateMonetaryText(text){

		if(text == ""){
    	return "0";
		}else if(text != "0"){
			var numbers = text.toString().replace(/[^-\d]/g,"");
    	numbers = numbers.split(/(?=(?:...)*$)/).join(".");
    	return numbers + ",00";
		}else {
			return text+",00";
		}
	}

	function scapeCommaPoint(string){
		if (string > ' ') {
			return parseFloat((string.toString().replace(/[\.]/g, '')).replace(/[,]/g, '.'));
		}else{
			return 0;
		}
	}

	function sendOrcamentoStatus(id, data){
		showLoading(true);
		CORE.chatIsBusy = true;
		var motivo = '';
		if (data == '9D') {
			motivo = document.getElementById('motivo').value;
		}
		remoteCall(
			'instalador/api/set-orcamento-status',
			{
				id:id,
				motivo: motivo,
				status: data
			},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}else{
					CORE.chatIsBusy = false;
					if (data.status == '9D') {
						CORE.loadUser.projetos.splice(CORE.selectedProject, 1);
						CORE.showPopUp(false, '', '');
					}
					CORE.initialize();
				}
			}
		);
	}

	function continueLogged(){
		parseNumbers();
		refreshScreenData();
	}

	function refreshScreenData(){
		document.getElementById('NE_DETAILS').style.display = 'none';
		buildStatsList();
		buildContent();
		buildEquipments();
		if (CORE.itensPrinted > 0) {
			document.getElementById('NE_DETAILS').style.display = '';
		}else{
			document.getElementById('NE_DETAILS').style.display = 'none';
		}
	}

	function buildEquipments(){
		var comp = document.getElementById('NE_LIST'),
			buffer = '';
		if(CORE.selectedProject != null){
			var equips = CORE.loadUser.projetos[CORE.selectedProject].equipamentos;
			for(var i = 0 ; i < equips.length ; i++){
				buffer += '<tr><td class="NE_EQUIP_TITLE">'+equips[i].descricao+'</td><td class="NE_EQUIP_QNT">'+equips[i].quantidade+'</td></tr>';
			}
			comp.innerHTML = buffer;
		}else{
			comp.innerHTML = '<tr><td class="NE_EQUIP_TITLE"></td><td class="NE_EQUIP_QNT"></td></tr>';
		}
		document.getElementById('NE_LISTNE_DETAILS').innerHTML = comp.innerHTML;
		CORE.showList('NE_DETAILS', true, 'open');
	}

	function buildContent(){
		var comp = document.getElementById('NE_INFO');
		if(CORE.selectedProject != null){
			var currentProj = CORE.loadUser.projetos[CORE.selectedProject],
				buffer = '';

			buffer += '' +
				'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<h2 class="NE_TERCIARY_TEXT_COLOR NE_PB5">'+currentProj.razao+'</h2>'+
				'	</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<h4 class="NE_PRIMARY_TEXT_COLOR NE_PB5">'+currentProj.ramo+'</h4>'+
				'	</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING NE_SPACE_BOTTOM" style="padding: 0;">'+
				'		<div class="NE_BORDER_BOTTOM NE_CENTER" style="position: relative"><div class="NE_ACTION_D_1"></div><div class="NE_ACTION_D_2"></div></div>'+
				'	</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<p style="font-size: 16px;" class="NE_PRIMARY_TEXT_COLOR NE_HEAVY NE_PB5">'+currentProj.contato.nome+'</p>'+
				'	</div>'+
				'</div>'+
				( currentProj.contato.telefone !== null ?
					'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
					'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
					'		<a style="font-size: 16px;" href="tel:'+currentProj.contato.telefone+'" class="NE_MAIN_LINK NE_PRIMARY_TEXT_COLOR">'+currentProj.contato.telefone+'</a>'+
					'	</div>'+
					'</div>'
				:
					''
				)+
				( currentProj.contato.celular !== null ?
					'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
					'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
					'		<a style="font-size: 16px;" href="tel:'+currentProj.contato.celular+'" class="NE_MAIN_LINK NE_PRIMARY_TEXT_COLOR">'+currentProj.contato.celular+'</a>'+
					'	</div>'+
					'</div>'
				:
					''
				)+
				'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<p style="font-size: 16px;" class="NE_PRIMARY_TEXT_COLOR NE_PT5">'+currentProj.cidade+'</p>'+
				'	</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<p style="font-size: 16px;" class="NE_PRIMARY_TEXT_COLOR NE_SPACE_BOTTOM">'+currentProj.logradouro+', '+currentProj.numero+' - '+currentProj.bairro+'</p>'+
				'	</div>'+
				'</div>'+
				'<h2 class="NE_PRIMARY_TEXT_COLOR NE_RIGHT NE_HEAVY NE_PB5">R$ '+
					SUB_parseMonetaryValues((currentProj.orcamento.valorServico +
					(currentProj.orcamento.materialIncluso?
						currentProj.orcamento.valorMaterial
					:0) - currentProj.orcamento.desconto), 2)+
				'</h2>'+
				'<p style="font-size: 16px;" class="NE_TERCIARY_TEXT_COLOR NE_HEAVY NE_SPACE_BOTTOM NE_RIGHT">'+(currentProj.orcamento.status == '9A' ? getProjetoStatus(currentProj.status) : getOrcamentoStatus(currentProj.orcamento.status))+'</p>'+
				'<div class="NE_BORDER_BOTTOM NE_CENTER NE_SPACE_BOTTOM"></div>'
			;

			if(currentProj.status == '2A'
				&& currentProj.orcamento.status == '0A'){
				buffer += '' +
					'<div class="NE_CONTENT_ROW NE_PB10">'+
						'<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING" style="padding-left: 0px"><button class="NE_BTN_DEFAULT NE_COLOR_QUARTENARY_OUTLINE NE_TRUNCATE" onclick="InstaleFacil.getInstance().rejectOrcamento('+currentProj.orcamento.id+')">Rejeitar</button></div>'+
						'<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING" style="padding-right: 0px"><button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON_OUTLINE NE_TRUNCATE" onclick="InstaleFacil.getInstance().actionProjHandler(\'os\','+currentProj.orcamento.id+',\'1A\')">Aceitar</button></div>'+
					'</div>'
				;
			}

			if(currentProj.status == '2A'
				&& (currentProj.orcamento.status == '1B')){
				buffer += '' +
					'<div class="NE_CONTENT_ROW NE_PB10">'+
						'<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING" style="padding-left: 0px" ><button class="NE_BTN_DEFAULT NE_COLOR_QUARTENARY_OUTLINE NE_TRUNCATE" onclick="InstaleFacil.getInstance().actionProjHandler(\'lo\','+currentProj.orcamento.id+',\'\')">Alterar</button></div>'+
						'<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING" style="padding-right: 0px"><button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON_OUTLINE NE_TRUNCATE" onclick="InstaleFacil.getInstance().actionProjHandler(\'ao\','+currentProj.orcamento.id+',\'\')">Enviar</button></div>'+
					'</div>'+
					'<div class="NE_CONTENT_ROW">'+
						'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING" style="padding: 0;">'+
							'<button class="NE_BTN_DEFAULT NE_COLOR_PRIMARY_OUTLINE NE_TRUNCATE" onclick="InstaleFacil.getInstance().actionProjHandler(\'ch\','+currentProj.orcamento.id+',\'\')">Chat</button>'+
						'</div>'+
					'</div>'
				;
			}

			if(currentProj.status == '2A'
				&& (currentProj.orcamento.status == '1A'
					|| currentProj.orcamento.status == '2A')){
				buffer += '' +
					'<div class="NE_CONTENT_ROW NE_PB10">'+
						'<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING"  style="padding-left: 0px" ><button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON_OUTLINE NE_TRUNCATE" onclick="InstaleFacil.getInstance().actionProjHandler(\'lo\','+currentProj.orcamento.id+',\'\')">'+ (currentProj.orcamento.status == '1A'?'Orçar ':'Orçamento') +'</button></div>'+
						'<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING" style="padding-right: 0px" >'+
							'<button class="NE_BTN_DEFAULT NE_COLOR_PRIMARY_OUTLINE NE_TRUNCATE" onclick="InstaleFacil.getInstance().actionProjHandler(\'ch\','+currentProj.orcamento.id+',\'\')">Chat</button>'+
						'</div>'+
					'</div>'
				;
			}

			if(currentProj.status >= '3A'
				&& currentProj.orcamento.status == '9A'){
				buffer += '' +
					'<div class="NE_CONTENT_ROW NE_PB10">'+
						'<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING" style="padding-left: 0px">'+
							'<button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON_OUTLINE NE_TRUNCATE"  onclick="InstaleFacil.getInstance().actionProjHandler(\'lo\','+currentProj.orcamento.id+',\'\')">'+ (currentProj.orcamento.status == '1A'?'Orçar ':'Orçamento') +'</button>'+
						'</div>'+
						'<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING" style="padding-right: 0px">'+
							(currentProj.enviaFotos ?
									'<button class="NE_BTN_DEFAULT NE_COLOR_TERCEARY_OUTLINE NE_TRUNCATE"  onclick="InstaleFacil.getInstance().actionProjHandler(\'ph\','+currentProj.id+',\'\')">'+( currentProj.status == '3A' && currentProj.enviaFotos ? 'Enviar fotos' : 'Fotos' )+'</button>'
								:
									'<button class="NE_BTN_DEFAULT NE_COLOR_TERCEARY_OUTLINE NE_TRUNCATE" style="opacity:.3" >'+( currentProj.status == '3A' && currentProj.enviaFotos ? 'Enviar fotos' : 'Fotos' )+'</button>'
							 )+
						'</div>'+
					'</div>'+
					'<div class="NE_CONTENT_ROW">'+
						'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING" style="padding: 0;">'+
							'<button class="NE_BTN_DEFAULT NE_COLOR_PRIMARY_OUTLINE NE_TRUNCATE" onclick="InstaleFacil.getInstance().actionProjHandler(\'ch\','+currentProj.orcamento.id+',\'\')">Chat</button>'+
						'</div>'+
					'</div>'
				;
			}

			comp.innerHTML = buffer;
		}else{
			comp.innerHTML = '';
		}
		document.getElementById('NE_INFONE_DETAILS').innerHTML = comp.innerHTML;
	}

	function buildStatsList(){
		var comp = document.getElementById('NE_STATUS_LIST'),
			buffer = '',
			getFirst = true,
			itensPrinted = 0,
			title = '';

		switch (CORE.filter) {
			case 'servicosAndamento':
				title = 'SERVIÇOS EM ANDAMENTO';
				break;
			case 'orcamentos':
				title = 'ORÇAMENTOS PENDENTES';
				break;
			case 'fotos':
				title = 'FOTOS REPROVADAS';
				break;
			case 'ligacoes':
				title = 'LIGAÇÃO NÃO EXECUTADA';
				break;
			case 'obrasDisponiveis':
				title = 'OBRAS DISPONÍVEIS';
				break;
			case 'historico':
				title = 'HISTÓRICO';
				break;
			default:
			title = 'STATUS DO PROJETO';
		}

		document.getElementById('NE_TITLE_STATUS').innerHTML = title;

		for(var i = 0 ; i < CORE.loadUser.projetos.length ; i++){
			var currentProj = CORE.loadUser.projetos[i];
			if(CORE.filter == '' && currentProj.status != '9A' && currentProj.status != '5A'){
				if(getFirst && CORE.selectedProject == null){
					CORE.selectedProject = i;
					getFirst = false;
				}
				buffer += buildListItem(currentProj.razao, currentProj.cidade, i, CORE.selectedProject == i, (currentProj.orcamento.status == '9A' ? getProjetoStatus(currentProj.status) : getOrcamentoStatus(currentProj.orcamento.status)));
				itensPrinted++;
			}
			if(CORE.filter == 'servicosAndamento'){
				if(
					(
						currentProj.status == '2A' && (
							currentProj.orcamento.status == '1A'
							|| currentProj.orcamento.status == '1B'
						)
					)
					||
					(
						currentProj.status == '2A'
						&& currentProj.orcamento.status == '2A'
					)
					||
					(
						(
							currentProj.status == '3A' ||
							currentProj.status == '3B' ||
							currentProj.status == '3C' ||
							currentProj.status == '3D' ||
							currentProj.status == '4A' ||
							currentProj.status == '4B' ||
							currentProj.status == '4D'
						)
						&& currentProj.orcamento.status == '9A'

					)
				){
					if(getFirst && CORE.selectedProject == null){
						CORE.selectedProject = i;
						getFirst = false;
					}
					buffer += buildListItem(currentProj.razao, currentProj.cidade, i, CORE.selectedProject == i, (currentProj.orcamento.status == '9A' ? getProjetoStatus(currentProj.status) : getOrcamentoStatus(currentProj.orcamento.status)));
					itensPrinted++;
				}
			}
			if(CORE.filter == 'orcamentos'){
				if(
					(
						currentProj.status == '2A'
					) && (
						currentProj.orcamento.status == '1B'
						|| currentProj.orcamento.status == '1A'
					)){
					if(getFirst && CORE.selectedProject == null){
						CORE.selectedProject = i;
						getFirst = false;
					}
					buffer += buildListItem(currentProj.razao, currentProj.cidade, i, CORE.selectedProject == i, (currentProj.orcamento.status == '9A' ? getProjetoStatus(currentProj.status) : getOrcamentoStatus(currentProj.orcamento.status)));
					itensPrinted++;
				}
			}
			if(CORE.filter == 'fotos'){
				if(currentProj.status == '3D'
					&& currentProj.orcamento.status == '9A'){
					if(getFirst && CORE.selectedProject == null){
						CORE.selectedProject = i;
						getFirst = false;
					}
					buffer += buildListItem(currentProj.razao, currentProj.cidade, i, CORE.selectedProject == i, (currentProj.orcamento.status == '9A' ? getProjetoStatus(currentProj.status) : getOrcamentoStatus(currentProj.orcamento.status)));
					itensPrinted++;
				}
			}
			if(CORE.filter == 'ligacoes'){
				if(currentProj.status == '4D'
					&& currentProj.orcamento.status == '9A'){
					if(getFirst && CORE.selectedProject == null){
						CORE.selectedProject = i;
						getFirst = false;
					}
					buffer += buildListItem(currentProj.razao, currentProj.cidade, i, CORE.selectedProject == i, (currentProj.orcamento.status == '9A' ? getProjetoStatus(currentProj.status) : getOrcamentoStatus(currentProj.orcamento.status)));
					itensPrinted++;
				}
			}
			if(CORE.filter == 'obrasDisponiveis'){
				if(currentProj.status == '2A'
					&& currentProj.orcamento.status == '0A'){
					if(getFirst && CORE.selectedProject == null){
						CORE.selectedProject = i;
						getFirst = false;
					}
					buffer += buildListItem(currentProj.razao, currentProj.cidade, i, CORE.selectedProject == i, (currentProj.orcamento.status == '9A' ? getProjetoStatus(currentProj.status) : getOrcamentoStatus(currentProj.orcamento.status)));
					itensPrinted++;
				}
			}
			if(CORE.filter == 'historico'){
				if(
					(currentProj.status == '5A' || currentProj.status == '9A')
					&& currentProj.orcamento.status == '9A'){
					if(getFirst && CORE.selectedProject == null){
						CORE.selectedProject = i;
						getFirst = false;
					}
					buffer += buildListItem(currentProj.razao, currentProj.cidade, i, CORE.selectedProject == i, (currentProj.orcamento.status == '9A' ? getProjetoStatus(currentProj.status) : getOrcamentoStatus(currentProj.orcamento.status)));
					itensPrinted++;
				}
			}
		}
		CORE.itensPrinted = itensPrinted;
		if(itensPrinted == 0){
			buffer += '' +
				'<div class="NE_STATUS_ITEM_LIST NE_TRUNCATE NE_LETTER_0">'+
					'Nenhum registro para exibir'+
				'</div>'
			;
		}
		comp.innerHTML = buffer;
	}

	function buildListItem(razao, cidade, index, active, status){
		return '' +
			'<div id="ps_'+index+'" '+( CORE.loadUser.projetos[CORE.selectedProject].orcamento.status == '0A' && index > 0 ? '' : 'onclick="InstaleFacil.getInstance().itemListClick('+index+')"' )+' class="NE_STATUS_ITEM_LIST NE_TRUNCATE NE_LETTER_0" style="position: relative; '+(active?'':'opacity:.2')+'">'+
				// '<div class="NE_NOTIFY_LIST"></div>'+
				razao +
				'<p class="NE_PRIMARY_TEXT_COLOR NE_TRUNCATE NE_HEAVY NE_PT5" style="line-height: normal;">'+
					status +
				'</p>'+
			'</div>'
		;
	}

	function buildPhotoPopUp(index) {
		var html =
			'<div class="NE_CONTENT_ROW NE_PT10">'+
			'	<div class="NE_CONTENT_2COL60_FIXED NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_10">'+
			'		<div class="NE_SPACE_BOTTOM_10">'+
			'			<h2 class="NE_TRUNCATE NE_PRIMARY_TEXT_COLOR NE_HEAVY" style="line-height: 30px;">'+CORE.photoList[index].tipo+'</h2>'+
			'		</div>'+
			'	</div>'+
			'	<div class="NE_CONTENT_2COL40_FIXED NE_CLEAR_PADDING">'+
			'		<div class="NE_SPACE_BOTTOM_10 NE_RIGHT NE_HORIZONTAL_PADDING_10">'+
						CORE.getStatusPhoto(CORE.photoList[index].status)+
			'		</div>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1 NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_10">'+
			'		<div class="NE_SPACE_BOTTOM_10 NE_BTN_UPLOAD_UPDATE NE_CURSOR">'+
			'			<input class="NE_BTN_UPLOAD_UPDATE_CONTENT" id="btnUpdate'+CORE.photoList[index].tipo+'" style="background-image: url(\''+CORE.photoList[index].imageURL+'\');" type="button" value=""></input>'+
			'		</div>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1 NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_10 NE_SPACE_BOTTOM">'+
					( CORE.photoList[index].status == '9D' && CORE.photoList[index].motivo !== null ?
						'<p class="NE_LABEL NE_TEXT_NORMAL NE_QUARTENARY_TEXT_COLOR NE_HEAVY">'+CORE.photoList[index].motivo+'</p>'
					:
						''
					)+
			'	</div>'+
			'</div>'+
			( CORE.photoList[index].status == '9A' || CORE.loadUser.projetos[CORE.selectedProject].status >= '4A' || CORE.enviaFotos == false  ?
				''
			:
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_2COL60_FIXED NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_10">'+
				'		<div class="NE_SPACE_BOTTOM_10 NE_PT10">'+
				'			<p class="NE_LABEL NE_TRUNCATE NE_HEAVY">Deseja enviar outra foto?</p>'+
				'		</div>'+
				'	</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW">'+
				'    <div class="NE_CONTENT_1 NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_10 NE_SPACE_BOTTOM">'+
				'		<div style="position: relative;">'+
				'        	<input type="file" accept="image/*" id="file'+CORE.photoList[index].tipo+'" name="'+index+'" class="NE_INPUTFILE NE_TEXT NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_TRUNCATE" onclick="InstaleFacil.getInstance().changeButton(this.id, this.files[0])"/>'+
				'        	<label id="lblfile'+CORE.photoList[index].tipo+'" for="file'+CORE.photoList[index].tipo+'" class="NE_LABEL NE_TEXT_NORMAL NE_TRUNCATE">SELECIONAR IMAGEM</label>'+
				'    	</div>'+
				'    </div>'+
				'</div>'
			)
		;

		return html;
	}

	this.getStatusPhoto = function(status) {
		var html = '';
		var s = '';
		var c = '';
		switch (status) {
			case '1A':
				c = 'NE_TERCIARY_TEXT_COLOR';
				s = 'PENDENTE';
				break;
			case '9A':
				c = 'NE_SECONDARY_TEXT_COLOR';
				s = 'APROVADA';
				break;
			case '9D':
				c = 'NE_QUARTENARY_TEXT_COLOR';
				s = 'RECUSADA';
				break;
		}
		return '<h3 class="NE_TRUNCATE '+c+' NE_HEAVY">'+s+'</h3>';
	};

	this.buildPhotoScreen = function() {
		var html =
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
			'		<table class="NE_TABLE_FIXED" style="background-color: #FFFFFF;">'+
			'			<tr>'+
			'				<td style="vertical-align: top; position: relative;padding:0;">'+
			'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
			'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
			'							<div class="">'+
			'								<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
			'									<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
			'										<div class="NE_CONTENT_ROW">'+
			'											<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CENTER">'+
																(CORE.loadUser.projetos[CORE.selectedProject].status == '3B' ?
			'														<p class="NE_LABEL NE_TEXT_NORMAL NE_PRIMARY_TEXT_COLOR NE_HEAVY">Agora é só aguardar a aprovação das fotos!</p>'
																:
																	(CORE.enviaFotos ?
																		(CORE.loadUser.projetos[CORE.selectedProject].status == '3A' ?
			'																<p class="NE_LABEL NE_TEXT_NORMAL">Envie as fotos para aprovação da finalização da sua obra</p>'
																		:
																			(CORE.loadUser.projetos[CORE.selectedProject].status == '3D' ?
			'																	<p class="NE_LABEL NE_TEXT_NORMAL NE_QUARTENARY_TEXT_COLOR NE_HEAVY">Alguma(s) fotos foram reprovadas, clique sobre elas para saber o motivo e reenviá-las</p>'
																			:
			'																	<p class="NE_LABEL NE_TEXT_NORMAL NE_HEAVY NE_SECONDARY_TEXT_COLOR">Suas fotos foram aprovadas!</p>'
																			)
																		)
																	:
			'																<p class="NE_LABEL NE_TEXT_NORMAL">Aguarde o envio das fotos para aprovação da finalização da sua obra</p>'
																	)
															)+
			'											</div>'+
			'										</div>'+
			'										<div class="NE_CONTENT_ROW" id="divPhotos">'+
			'											<div class="NE_CONTENT_5COL NE_CENTER">'+
			'												<table class="NE_PHOTO_VIEW">'+
			'													<tbody>'+
			'														<tr>'+
			'															<td style="padding: 0;position: relative;">'+
			'																<div class="NE_BTN_UPLOAD" id="divFrente do comércio">'+
			'																  <input class="NE_BTN_UPLOAD_CONTENT" id="btnFrente do comércio" style="background-image: url(\'../images/new_photos/foto_fachada_001.png\');" type="button" value=""></input>'+
																				(CORE.enviaFotos ?
			'																  		<input type="file" accept=".jpg" name="" id="Frente do comércio" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'
																				:
			'																  		<input type="button" disabled name="" id="Frente do comércio" class="NE_FILE_UPLOAD" />'
																				)+
			'																</div>'+
			'															</td>'+
			'														</tr>'+
			'														<tr>'+
			'															<td class="NE_PHOTO_LABEL">Frente do comércio</td>'+
			'														</tr>'+
			'													</tbody>'+
			'												</table>'+
			'											</div>'+
			'											<div class="NE_CONTENT_5COL NE_CENTER">'+
			'												<table class="NE_PHOTO_VIEW">'+
			'													<tbody>'+
			'														<tr>'+
			'															<td style="padding: 0;position: relative;">'+
			'																<div class="NE_BTN_UPLOAD" id="divAbrigo">'+
			'																  <input class="NE_BTN_UPLOAD_CONTENT" id="btnAbrigo" style="background-image: url(\'../images/new_photos/foto_abrigo_001.png\');" type="button" value=""></input>'+
																				(CORE.enviaFotos ?
			'																  		<input type="file" accept=".jpg" name="" id="Abrigo" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'
																				:
			'																  		<input type="button" disabled name="" id="Abrigo" class="NE_FILE_UPLOAD" />'
																				)+
			'																</div>'+
			'															</td>'+
			'														</tr>'+
			'														<tr>'+
			'															<td class="NE_PHOTO_LABEL">Abrigo</td>'+
			'														</tr>'+
			'													</tbody>'+
			'												</table>'+
			'											</div>'+
			'											<div class="NE_CONTENT_5COL NE_CENTER">'+
			'												<table class="NE_PHOTO_VIEW">'+
			'													<tbody>'+
			'														<tr>'+
			'															<td style="padding: 0;position: relative;">'+
			'																<div class="NE_BTN_UPLOAD" id="divInterna">'+
			'																  <input class="NE_BTN_UPLOAD_CONTENT" id="btnInterna" style="background-image: url(\'../images/new_photos/foto_interna_001.png\');" type="button" value=""></input>'+
																				(CORE.enviaFotos ?
			'																  		<input type="file" accept=".jpg" name="" id="Interna" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'
																				:
			'																  		<input type="button" disabled name="" id="Interna" class="NE_FILE_UPLOAD" />'
																				)+
			'																</div>'+
			'															</td>'+
			'														</tr>'+
			'														<tr>'+
			'															<td class="NE_PHOTO_LABEL">Interna</td>'+
			'														</tr>'+
			'													</tbody>'+
			'												</table>'+
			'											</div>'+
			'											<div class="NE_CONTENT_5COL NE_CENTER">'+
			'												<table class="NE_PHOTO_VIEW">'+
			'													<tbody>'+
			'														<tr>'+
			'															<td style="padding: 0;position: relative;">'+
			'																<div class="NE_BTN_UPLOAD" id="divPorta do abrigo">'+
			'																  <input class="NE_BTN_UPLOAD_CONTENT" id="btnPorta do abrigo" style="background-image: url(\'../images/new_photos/foto_equipamento_002.png\');" type="button" value=""></input>'+
																				(CORE.enviaFotos ?
			'																  		<input type="file" accept=".jpg" name="" id="Porta do abrigo" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'
																				:
			'																  		<input type="button" disabled name="" id="Porta do abrigo" class="NE_FILE_UPLOAD" />'
																				)+
			'																</div>'+
			'															</td>'+
			'														</tr>'+
			'														<tr>'+
			'															<td class="NE_PHOTO_LABEL">Porta do abrigo</td>'+
			'														</tr>'+
			'													</tbody>'+
			'												</table>'+
			'											</div>'+
			'											<div class="NE_CONTENT_5COL NE_CENTER">'+
			'												<table class="NE_PHOTO_VIEW">'+
			'													<tbody>'+
			'														<tr>'+
			'															<td style="padding: 0;position: relative;">'+
			'																<div class="NE_BTN_UPLOAD" id="divEquipamento1">'+
			'																  <input class="NE_BTN_UPLOAD_CONTENT" id="btnEquipamento1" style="background-image: url(\'../images/new_photos/foto_equipamento_001.png\');" type="button" value=""></input>'+
																				(CORE.enviaFotos ?
			'																  		<input type="file" accept=".jpg" name="" id="Equipamento1" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'
																				:
			'																  		<input type="button" disabled name="" id="Equipamento1" class="NE_FILE_UPLOAD" />'
																				)+
			'																</div>'+
			'															</td>'+
			'														</tr>'+
			'														<tr>'+
			'															<td class="NE_PHOTO_LABEL">Equipamento 1</td>'+
			'														</tr>'+
			'													</tbody>'+
			'												</table>'+
			'											</div>'+
			'										</div>'+
			'										<div class="NE_CONTENT_ROW">'+
			'											<div class="NE_CONTENT_2COL30 NE_PB5 NE_CURSOR">'+
															( (CORE.loadUser.projetos[CORE.selectedProject].status == '3A' || CORE.loadUser.projetos[CORE.selectedProject].status == '3D') && CORE.enviaFotos ?
																'	<button class="NE_BTN_DEFAULT NE_READ_ONLY NE_TRUNCATE NE_COLOR_SECONDARY_OUTLINE" disabled id="btnObraFinalizada">OBRA FINALIZADA</button>'
															:
																''
															)+
			'											</div>'+
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
		;
		return html;
	};

	this.photoClick = function() {
		var j = 0;
		for (var i = 0; i < CORE.photoList.length; i++) {
			if (CORE.photoList[i].tipo == 'Equipamento') {
				j++;
			}
			if (document.getElementById(CORE.photoList[i].tipo + (CORE.photoList[i].tipo == 'Equipamento' ? j : '')) !== null) {
				generateSetUpPhoto((CORE.photoList[i].tipo == 'Equipamento' ? j : ''), i);
			}
		}
	};

	this.setPhotoScreen = function(tipo, url) {
		if (typeof tipo == 'undefined') {
			if (CORE.photoList.length > 0) {
				var j = 0;
				for (var i = 0; i < CORE.photoList.length; i++) {
					if (CORE.photoList[i].tipo == 'Equipamento') {
						if (j > 0) {
							CORE.newEquipamentoFoto(j);
						}
						j++;
					}
					if (CORE.photoList[i].status == '9A') {
						document.getElementById('div'+CORE.photoList[i].tipo  + (j > ' ' && CORE.photoList[i].tipo == 'Equipamento' ? j : '') ).innerHTML += '<div class="NE_PHOTO_STATUS_ACCEPT">&nbsp;</div>';
					}else if (CORE.photoList[i].status == '9D') {
						document.getElementById('div'+CORE.photoList[i].tipo  + (j > ' ' && CORE.photoList[i].tipo == 'Equipamento' ? j : '') ).innerHTML += '<div class="NE_PHOTO_STATUS_REJECT">&nbsp;</div>';
					}
				}
				if (j > 0 && CORE.loadUser.projetos[CORE.selectedProject].status < '4A') {
					if (CORE.enviaFotos) {
						CORE.newEquipamentoFoto(j);
					}
				}
			}
		}else{
			document.getElementById('btn'+tipo).style.backgroundImage = "url(\'"+CORE.getThumbnailUrl(url)+"\')";
		}
		if (enableButtonPhotos()) {
			if (document.getElementById('btnObraFinalizada') !== null) {
				document.getElementById('btnObraFinalizada').disabled = false;
				document.getElementById('btnObraFinalizada').classList.remove('NE_READ_ONLY');
				document.getElementById('btnObraFinalizada').classList.remove('NE_COLOR_SECONDARY_OUTLINE');
				document.getElementById('btnObraFinalizada').classList.add('NE_COLOR_SECONDARY_CONFIRM_BUTTON');
				document.getElementById('btnObraFinalizada').onclick = function(){InstaleFacil.getInstance().setObraFinalizada()};
			}
		}
	};

	this.newEquipamentoFoto = function(i) {
		document.getElementById('divPhotos').innerHTML +=
			'	<div class="NE_CONTENT_5COL NE_CENTER">'+
			'		<table class="NE_PHOTO_VIEW">'+
			'			<tbody>'+
			'				<tr>'+
			'					<td style="padding: 0;position: relative;">'+
			'						<div class="NE_BTN_UPLOAD" id="divEquipamento'+(parseInt(i)+1)+'">'+
			'						  <input class="NE_BTN_UPLOAD_CONTENT" id="btnEquipamento'+(parseInt(i)+1)+'" style="background-image: url(\'../images/new_photos/foto_equipamento_001.png\');" type="button" value=""></input>'+
									(CORE.enviaFotos ?
			'						  	<input type="file" accept="image/*" name="" id="Equipamento'+(parseInt(i)+1)+'" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'
									:
									'  	<input type="button" disabled" name="" id="Equipamento'+(parseInt(i)+1)+'" class="NE_FILE_UPLOAD" />'
									)+
			'						</div>'+
			'					</td>'+
			'				</tr>'+
			'				<tr>'+
			'					<td class="NE_PHOTO_LABEL">Equipamento '+(parseInt(i)+1)+'</td>'+
			'				</tr>'+
			'			</tbody>'+
			'		</table>'+
			'	</div>'
		;
	};

	function enableButtonPhotos() {
		var obrigatorias = ['Frente do comércio', 'Abrigo', 'Interna', 'Porta do abrigo', 'Equipamento'];
		var v = false;
		if (CORE.photoList.length < obrigatorias.length) {
			return v;
		}
		for (var i = 0; i < CORE.photoList.length; i++) {
			v = false;
			for (var j = 0; j < obrigatorias.length; j++) {
				if (CORE.photoList[i].tipo == obrigatorias[j]) {
					v = true;
				}
			}
			if (!v) {
				return v;
			}
		}
		return v;
	}

	function enableButtonOrcamento() {
		if (CORE.orcamentoInfo.servicos !== null && CORE.orcamentoInfo.servicos.length > 0 && ( CORE.orcamentoInfo.materiais !== null && CORE.orcamentoInfo.materiais.length > 0 || CORE.orcamentoInfo.materialIncluso ) ) {
			return true;
		}
		return false;
	}

	function generateSetUpPhoto(j, i) {
		document.getElementById('btn'+CORE.photoList[i].tipo  + (j > ' ' ? j : '') ).style.backgroundImage = "url(\'"+CORE.getThumbnailUrl(CORE.photoList[i].imageURL)+"\')";
		document.getElementById(CORE.photoList[i].tipo  + (j > ' ' ? j : '') ).name = i;
		if (j > ' ') {
			document.getElementById('btn'+CORE.photoList[i].tipo+j).onclick = function(){ InstaleFacil.getInstance().buildPhotoPopUpData(i) };
		}else{
			document.getElementById('btn'+CORE.photoList[i].tipo).onclick = function(){ InstaleFacil.getInstance().buildPhotoPopUpData(i) };
		}
		document.getElementById(CORE.photoList[i].tipo  + (j > ' ' ? j : '') ).style.display = 'none';
	}

	this.changeButton = function(tipo, photo){
	    var input = document.getElementById(tipo);
	    var label  = document.getElementById('lbl'+tipo);
	    input.addEventListener( 'change', function(e){
            var fileName = e.target.value.split( '\\' ).pop();
            if(fileName){
                label.innerHTML = fileName;
            }else{
                label.innerHTML = 'Selecionar Imagem';
			}
			CORE.preparePhotos(tipo, input.files[0]);
	    });
	};

	this.preparePhotos = function(tipo, photo) {
		showLoading(true);
		CORE.chatIsBusy = true;
		var fotoId = '';
		if (document.getElementById(tipo).name > ' ') {
			if (CORE.photoList[document.getElementById(tipo).name].id > ' ') {
				fotoId = CORE.photoList[document.getElementById(tipo).name].id;
			}
		}
		if (tipo.includes('Equipamento')) {
			tipo = 'Equipamento';
		}

		var dataToSend = {
				'Data-id': CORE.loadUser.projetos[CORE.selectedProject].id,
				'Data-tipo': tipo
			},
			imageToSend = '';

		var reader = new FileReader();
		reader.readAsDataURL(photo);
		reader.onload = function () {
			var src_image = new Image();

			src_image.onload = function() {

				var totalPixels = src_image.width * src_image.height;
				if(totalPixels > 9432184){
					var canvas = document.getElementById('cFRes'),
						context = canvas.getContext('2d');

					canvas.width = src_image.width;
					canvas.height = src_image.height;
					context.drawImage(src_image, 0, 0);

					var sw = src_image.width,
						sh = src_image.height,
						scale =  1/(Math.sqrt((sw*sh)/9432184)),
						sqScale = scale * scale,
						tw = Math.floor(sw * scale),
						th = Math.floor(sh * scale),
						sx = 0, sy = 0, sIndex = 0,
						tx = 0, ty = 0, yIndex = 0, tIndex = 0,
						tX = 0, tY = 0,
						w = 0, nw = 0, wx = 0, nwx = 0, wy = 0, nwy = 0,
						crossX = false,
						crossY = false,
						sBuffer = context.getImageData(0, 0, sw, sh).data,
						tBuffer = new Float32Array(3 * tw * th),
						sR = 0, sG = 0,  sB = 0;

					for (sy = 0; sy < sh; sy++) {
						ty = sy * scale;
						tY = 0 | ty;
						yIndex = 3 * tY * tw;
						crossY = (tY != (0 | ty + scale));
						if (crossY) {
							wy = (tY + 1 - ty);
							nwy = (ty + scale - tY - 1);
						}
						for (sx = 0; sx < sw; sx++, sIndex += 4) {
							tx = sx * scale;
							tX = 0 |  tx;
							tIndex = yIndex + tX * 3;
							crossX = (tX != (0 | tx + scale));
							if (crossX) {
								wx = (tX + 1 - tx);
								nwx = (tx + scale - tX - 1);
							}
							sR = sBuffer[sIndex    ];
							sG = sBuffer[sIndex + 1];
							sB = sBuffer[sIndex + 2];
							if (!crossX && !crossY) {
								tBuffer[tIndex    ] += sR * sqScale;
								tBuffer[tIndex + 1] += sG * sqScale;
								tBuffer[tIndex + 2] += sB * sqScale;
							} else if (crossX && !crossY) {
								w = wx * scale;
								tBuffer[tIndex    ] += sR * w;
								tBuffer[tIndex + 1] += sG * w;
								tBuffer[tIndex + 2] += sB * w;
								nw = nwx * scale
								tBuffer[tIndex + 3] += sR * nw;
								tBuffer[tIndex + 4] += sG * nw;
								tBuffer[tIndex + 5] += sB * nw;
							} else if (crossY && !crossX) {
								w = wy * scale;
								tBuffer[tIndex    ] += sR * w;
								tBuffer[tIndex + 1] += sG * w;
								tBuffer[tIndex + 2] += sB * w;
								nw = nwy * scale
								tBuffer[tIndex + 3 * tw    ] += sR * nw;
								tBuffer[tIndex + 3 * tw + 1] += sG * nw;
								tBuffer[tIndex + 3 * tw + 2] += sB * nw;
							} else {
								w = wx * wy;
								tBuffer[tIndex    ] += sR * w;
								tBuffer[tIndex + 1] += sG * w;
								tBuffer[tIndex + 2] += sB * w;
								nw = nwx * wy;
								tBuffer[tIndex + 3] += sR * nw;
								tBuffer[tIndex + 4] += sG * nw;
								tBuffer[tIndex + 5] += sB * nw;
								nw = wx * nwy;
								tBuffer[tIndex + 3 * tw    ] += sR * nw;
								tBuffer[tIndex + 3 * tw + 1] += sG * nw;
								tBuffer[tIndex + 3 * tw + 2] += sB * nw;
								nw = nwx * nwy;
								tBuffer[tIndex + 3 * tw + 3] += sR * nw;
								tBuffer[tIndex + 3 * tw + 4] += sG * nw;
								tBuffer[tIndex + 3 * tw + 5] += sB * nw;
							}
						}
					}
					canvas.width = tw;
					canvas.height = th;
					var imgRes = context.getImageData(0, 0, tw, th);
					var tByteBuffer = imgRes.data;
					var pxIndex = 0;
					for (sIndex = 0, tIndex = 0; pxIndex < tw * th; sIndex += 3, tIndex += 4, pxIndex++) {
						tByteBuffer[tIndex] = Math.ceil(tBuffer[sIndex]);
						tByteBuffer[tIndex + 1] = Math.ceil(tBuffer[sIndex + 1]);
						tByteBuffer[tIndex + 2] = Math.ceil(tBuffer[sIndex + 2]);
						tByteBuffer[tIndex + 3] = 255;
					}
					canvas.width = tw;
					canvas.height = th;
					context.putImageData(imgRes, 0, 0);
					imageToSend = canvas.toDataURL("image/jpeg").split(',')[1];
				}else{
					imageToSend = reader.result.split(',')[1];
				}
				if (fotoId > ' ') {
					dataToSend['Data-foto-id'] = fotoId;
				}
				sendFile(
					'instalador/api/upload-projeto-foto',
					dataToSend,
					imageToSend,
					function(data){
						if(typeof data['error'] != 'undefined'){
							showLoading(false);
						}else{
							CORE.photoList = data.fotos;
							CORE.buildPhotoData();
							showLoading(false);
							CORE.chatIsBusy = false;
						}
					}, true
				);
			}
			src_image.src = reader.result;
		};
		reader.onerror = function (error) {
			showLoading(false);
			CORE.chatIsBusy = false;
		};
	};

	this.setObraFinalizada = function(){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/set-obra-finalizada',
			{
				id: CORE.loadUser.projetos[CORE.selectedProject].id,
			},
			function(data){
				if(typeof data['error'] != 'undefined'){
					window.location.replace('index.html');
				}else{
					CORE.initialize();
					CORE.showPopUp(false, '', '');
					CORE.chatIsBusy = false;
				}
			}
		);
	};

	function getStatus(status) {
		switch (status) {
			case 'Equipamento_Pendente':
				return 'Equipamentos Pendentes';
				break;
			default:
				return 'Aguardando confirmação';
		}
	}

	this.getThumbnailUrl = function(imageUrl) {
		return imageUrl.replace('-0.jpg', '-1.jpg');
	};

	function parseNumbers(){
		clearNumbers();
		for(var i = 0 ; i < CORE.loadUser.projetos.length ; i++){
			var currentProj = CORE.loadUser.projetos[i];

			if(
				currentProj.status == '2A'
				&& ( currentProj.orcamento.status == '1A'
					|| currentProj.orcamento.status == '1B' )
			){
				CORE.screenNumbers.servicosAndamento++;
				CORE.screenNumbers.orcamentos++;
			}

			if(
				currentProj.status == '2A'
				&& (currentProj.orcamento.status == '2A')
			){
				CORE.screenNumbers.servicosAndamento++;
			}

			if(
				currentProj.status == '2A'
				&& ( currentProj.orcamento.status == '0A' )
			){
				CORE.screenNumbers.obrasDisponiveis++;
			}

			if(
				currentProj.status == '3A'
				&& ( currentProj.orcamento.status == '9A' )
			){
				CORE.screenNumbers.servicosAndamento++;
			}

			if(
				currentProj.status == '3B'
				&& ( currentProj.orcamento.status == '9A' )
			){
				CORE.screenNumbers.servicosAndamento++;
			}

			if(
				currentProj.status == '3D'
				&& ( currentProj.orcamento.status == '9A' )
			){
				CORE.screenNumbers.servicosAndamento++;
				CORE.screenNumbers.fotos++;
			}

			if(
				currentProj.status == '4A'
				&& ( currentProj.orcamento.status == '9A' )
			){
				CORE.screenNumbers.servicosAndamento++;
			}

			if(
				currentProj.status == '4B'
				&& ( currentProj.orcamento.status == '9A' )
			){
				CORE.screenNumbers.servicosAndamento++;
			}

			if(
				currentProj.status == '4D'
				&& ( currentProj.orcamento.status == '9A' )
			){
				CORE.screenNumbers.servicosAndamento++;
				CORE.screenNumbers.ligacoes++;
			}

			if(
				currentProj.status == '5A'
				|| currentProj.status == '9A'
			){
				CORE.screenNumbers.recebimentosFuturos +=
					currentProj.orcamento.valorServico +
					(currentProj.orcamento.materialIncluso?
						currentProj.orcamento.valorMaterial
					:0) - currentProj.orcamento.desconto;
			}

		}
		setNumbers();
	}

	function setNumbers(){
		var compServAndamento = document.getElementById('NE_SERV_ANDAMENTO'),
			compOrcamentos = document.getElementById('NE_ORCAMENTOS'),
			compFotos = document.getElementById('NE_FOTO'),
			compLigacoes = document.getElementById('NE_LIGAC'),
			compObrasDisponiveis = document.getElementById('NE_OBRAS_DISPONIVEIS'),
			compRecFuturos = document.getElementById('NE_RECEB_FUTUROS'),
			compRating = document.getElementById('NE_RATING');

		compServAndamento.innerHTML = CORE.screenNumbers.servicosAndamento;
		compOrcamentos.innerHTML = CORE.screenNumbers.orcamentos;
		compFotos.innerHTML = CORE.screenNumbers.fotos;
		compLigacoes.innerHTML = CORE.screenNumbers.ligacoes;
		compObrasDisponiveis.innerHTML = '<h1 class="NE_LIGHT">'+ CORE.screenNumbers.obrasDisponiveis+'</h1>';
		compRecFuturos.innerHTML = '<span style="font-size: 16px;vertical-align:super" class="NE_LETTER_0">R$ </span>' + SUB_parseMonetaryValues(CORE.screenNumbers.recebimentosFuturos, 2);
		compRating.innerHTML = '' +
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CENTER">'+
			SUB_parseMonetaryValues(CORE.loadUser.pontuacao, 1) +
			'	</div>'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'		<table class="NE_TABLE_FIXED" style="padding:0;width:60%;margin:10px auto;">'+
			'			<tr>'+
			generateScore('FA', '17px', {first: ['&#xf005;', 'NE_QUARTENARY_TEXT_COLOR'], middle: ['&#xf089;', 'NE_QUARTENARY_TEXT_COLOR'], last: ['&#xf005;', 'NE_TEXT_COLOR']}, CORE.loadUser.pontuacao)+
			'			</tr>'+
			'		</table>'+
			'	</div>'+
			'</div>'
		;
	}

	function drawName(){
		var comp = document.getElementById('nome');
		var compMobile = document.getElementById('nomeMobile');
		var html =
			'<h3 class="NE_TRUNCATE NE_HEAVY NE_WHITE_TEXT_COLOR">'+CORE.loadUser.razao+'</h3>'+
			'<p class="NE_TRUNCATE NE_WHITE_TEXT_COLOR"><small>'+CORE.loadUser.email+'</small></p>'
		;
		comp.innerHTML = html;
		compMobile.innerHTML = html;
	}

	this.initialize = function(){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/load-user-data',
			{complete:true},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}else{
					if(data['status'] == 'Inativo'){
						switch(data['ativacao']){
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
							case '2X':
							case '9X':
								window.location.replace('qualificacao.html');
							break;
							// default:
							// 	window.location.replace('erro.html');
						}
					}else if(data['status'] == 'Ativo'){
						CORE.loadUser = data;
						CORE.filter = 'servicosAndamento';
						drawName();
						continueLogged();
						showContent();
						showLoading(false);
						document.getElementById('NE_DETAILS').style.display = 'none';
						CORE.newMessagesWorker = setInterval(messageWorker, CORE.messageWorkerDelay);
						setTimeout(messageWorker, 1000);
						CORE.chatIsBusy = false;
					}else{
						window.location.replace('index.html');
					}
				}
			}
		);
	};

	this.logout = function(){
		logout('instalador');
	};

	this.showPopUp = function(show, title, content, width, exit){
		if(!show && CORE.action == 'ch'){
			stopChat();
			messageWorker();
		}
		if (typeof width != 'undefined') {
			document.getElementById('NE_LIGHTBOX_CONTENT_WIDTH').style.maxWidth = width;
			document.getElementById('NE_LIGHTBOX_X_WIDTH').style.maxWidth = width;
		}else{
			document.getElementById('NE_LIGHTBOX_CONTENT_WIDTH').style.maxWidth = '500px';
			document.getElementById('NE_LIGHTBOX_X_WIDTH').style.maxWidth = '500px';
		}
		if (typeof exit != 'undefined') {
			document.getElementById('NE_CLOSE_LIGHTBOX').onclick = exit;
			document.getElementById('NE_CLOSE_LIGHTBOX_MOBILE').onclick = exit;
		}else{
			document.getElementById('NE_CLOSE_LIGHTBOX').onclick = function() {
				InstaleFacil.getInstance().showPopUp(false,'','');
			};
			document.getElementById('NE_CLOSE_LIGHTBOX_MOBILE').onclick = function() {
				InstaleFacil.getInstance().showPopUp(false,'','');
			};
		}
		var lightBox = document.getElementById('NE_LIGHTBOX'),
			lightBoxTitle = document.getElementById('NE_LIGHTBOX_TITLE'),
			lightBoxContent = document.getElementById('NE_LIGHTBOX_CONTENT');
		lightBox.style.display = (show?'block':'none');
		lightBoxTitle.innerHTML = title;
		lightBoxContent.innerHTML = content;
	}

	this.showList = function(id, show, info){
		var comp = document.getElementById(id);
		var compContent = document.getElementById('lbContent'+id);
		if(typeof comp != 'undefined'){
			if( id == 'NE_DETAILS') {
				comp.style.display = (show?'':'none');
				return false;
			}
			comp.style.display = (show?'block':'none');
		}
	};

	this.notifyData = null;

	this.notifyIcon = function(){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/load-notifications',
			{},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}else{
					CORE.chatIsBusy = false;
					CORE.notifyData = data;
					buildNotifyPopup();
				}
			}
		);
	};

	function buildNotifyPopup(){
		var buffer = '<div style="height:450px;"><div class="NE_CONTENT_WRAPPER" style="box-sizing:border-box;padding:10px">';
		for(var i = 0 ; i < CORE.notifyData.notifications.length ; i++){
			buffer += '' +
				'<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED" style="box-sizing:border-box;width:100%;border-bottom:1px solid #EEEEEE;" onclick="InstaleFacil.getInstance().recentNotifyClick(\''+CORE.notifyData.notifications[i].id+'\',\''+CORE.notifyData.notifications[i].tipo+'\')"   >'+
					'<tr>'+
						'<td width="90%">'+
							'<p class="NE_CHAT_ITEM_LIST NE_TRUNCATE NE_LETTER_0">' + CORE.notifyData.notifications[i].razao + ' - <span class="NE_PRIMARY_TEXT_COLOR NE_TRUNCATE NE_HEAVY NE_PT5">' + getActionLabel(CORE.notifyData.notifications[i].tipo) + '</span></p>'+
						'</td>'+
						'<td class="NE_RIGHT NE_COLLAPSIBLE_CLICK " rowspan="2">'+
							'<span class="NE_ICON NE_COLLAPSIBLE_ICON">&#xf054;</span>'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>'+
							'<p class="NE_CHAT_ITEM_MESSSAGE">' + toDateTime(CORE.notifyData.notifications[i].createddate) + '</p>'+
						'</td>'+
					'</tr>'+
				'</table>'
			;
		}
		buffer += '<div class="NE_PADDING_10"></div>';
		buffer += '</div></div>';
		CORE.showPopUp(true, 'Notificações', buffer);
		showLoading(false);
	}
	this.recentNotifyClick = function(sfId, tipo){
		showLoading(true);
		CORE.showPopUp(false, '', '');
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/set-notification-viewed',
			{id:sfId},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}else{
					loadDataNotify(sfId, tipo);
					//continueNotifyClick(sfId, tipo);
					//CORE.initialize();
				}
			}
		);
	};

	function loadDataNotify(sfId, tipo){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/load-user-data',
			{complete:true},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}else{
					if(data['status'] == 'Inativo'){
						switch(data['ativacao']){
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
							case '2X':
							case '9X':
								window.location.replace('qualificacao.html');
							break;
							// default:
							// 	window.location.replace('erro.html');
						}
					}else if(data['status'] == 'Ativo'){
						CORE.loadUser = data;
						switch(tipo){
							case 'PhotoAprovalPending': CORE.filter = 'servicosAndamento'; break;
							case 'QuotationApproved': CORE.filter = 'servicosAndamento'; break;
							case 'QuotationChanged': CORE.filter = 'servicosAndamento'; break;
							case 'QuotationPending': CORE.filter = 'servicosAndamento'; break;
							case 'EvaluationPending': CORE.filter = 'servicosAndamento'; break;
							case 'PhotoPending': CORE.filter = 'servicosAndamento'; break;
							case 'GasOnPending': CORE.filter = 'servicosAndamento'; break;
							//case '': CORE.filter = 'orcamentos'; break;
							case 'PhotoReproved': CORE.filter = 'fotos'; break;
							case 'GasOnReproved': CORE.filter = 'ligacoes'; break;
							case 'QuotationReceived': CORE.filter = 'obrasDisponiveis'; break;
							default: CORE.filter = '';
							//case '': CORE.filter = 'historico'; break;
						}
						drawName();
						// continueLogged();
						CORE.changeFilter(CORE.filter);
						showLoading(false);
						CORE.chatIsBusy = false;
					}else{
						window.location.replace('index.html');
					}
				}
			}
		);
	}

	this.newChatData = null;

	this.messageIcon = function(){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'instalador/api/load-chat-list',
			{},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}else{
					CORE.chatIsBusy = false;
					CORE.newChatData = data;
					buildNewMessagesChat();
				}
			}
		);
	};

	function buildNewMessagesChat(){
		var buffer = '<div style="height:450px;"><div class="NE_CONTENT_WRAPPER" style="box-sizing:border-box;padding:10px">';
		for(var i = 0 ; i < CORE.newChatData.chats.length ; i++){
			buffer += '' +
				'<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED" style="box-sizing:border-box;width:100%;border-bottom:1px solid #EEEEEE;" onclick="InstaleFacil.getInstance().recentChatClick(\''+CORE.newChatData.chats[i].id+'\')"   >'+
					'<tr>'+
						'<td width="90%">'+
							'<p class="NE_CHAT_ITEM_LIST NE_TRUNCATE NE_LETTER_0">' + CORE.newChatData.chats[i].cliente + ' - <span class="NE_PRIMARY_TEXT_COLOR NE_TRUNCATE NE_HEAVY NE_PT5">' + CORE.newChatData.chats[i].comercio + '</span></p>'+
						'</td>'+
						'<td class="NE_RIGHT NE_COLLAPSIBLE_CLICK " rowspan="2">'+
							'<span class="NE_ICON NE_COLLAPSIBLE_ICON">&#xf054;</span>'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>'+
							'<p class="NE_CHAT_ITEM_MESSSAGE'+( CORE.newChatData.chats[i].ispending && CORE.newChatData.chats[i].sender == 'C'?'_NEW':'')+' NE_TRUNCATE NE_LETTER_0">' + CORE.newChatData.chats[i].message + '</p>'+
						'</td>'+
					'</tr>'+
				'</table>'
			;
		}
		buffer += '<div class="NE_PADDING_10"></div>';
		buffer += '</div></div>';
		CORE.showPopUp(true, 'Novas Mensagens', buffer);
		//CORE.changeMessageStatus(false);
		showLoading(false);
	}

	this.recentChatClick = function(id){
		showLoading(true);
		startChat(id);
	};

	this.changeMessageStatus = function(novaMensagem, novoOrcamento){
		var elems = document.getElementsByClassName('NE_ICON_CARTA_STATUS');
		for(var i = 0 ; i < elems.length ; i++){
			elems[i].style.display = (novaMensagem?'block':'none');
		}
		var elems = document.getElementsByClassName('NE_ICON_SINO_STATUS');
		for(var i = 0 ; i < elems.length ; i++){
			elems[i].style.display = (novoOrcamento?'block':'none');
		}
	};

	this.messageWorkerDelay = 20000;
	this.newMessagesWorker = null;

	function messageWorker(){
		if(!CORE.chatIsBusy){
			CORE.chatIsBusy = true;
			remoteCall(
				'instalador/api/check-panel-status',
				{},
				function(data){
					if(typeof data['error'] != 'undefined'){
						//showMessage('Atenção', data['message']);
					}else{
						CORE.chatIsBusy = false;
						CORE.changeMessageStatus(data.messageCount > 0, data.notificationCount > 0);
					}
				}
			);
		}
	}

}
InstaleFacil.instance = null;
InstaleFacil.getInstance = function(){
    if(this.instance === null) this.instance = new InstaleFacil();
    return this.instance;
};
InstaleFacil.initialize = function(){
    this.getInstance().initialize();
};

InstaleFacil.logout = function(){
    this.getInstance().logout();
};

InstaleFacil.messageIcon = function(){
    this.getInstance().messageIcon();
};
InstaleFacil.notifyIcon = function(){
    this.getInstance().notifyIcon();
};
