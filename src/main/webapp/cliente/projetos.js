"use strict";

function InstaleFacil(){

	var CORE = this;

	this.view = null;
	this.viewConfig = null;
	this.action = null;
	this.orcamentoValor = null;
	this.projetoAtivo = 0;
	this.sizeInstaladores = 0;
	this.previousProjectActive = '';
	this.activeProjectAtive = 'div0Project';
	this.previousIndexActive = -1;
	this.activeIndexActive = -1;
	this.comercioAtivo = 0;
	this.instaladorContratado = -1;
	this.rateAvaliacao = 0;
	this.previousAvaliacao = {
		el: '',
		id: ''
	};

	this.loadData = {};
	this.loadProject = {};
	this.sendProject = {};
	this.ligacao = {
		periodo: {
			dia: 	[],
			turno: 	[],
		},
		el: {
			dia: [],
			turno: []
		},
		comentario: ''
	}
	this.avaliacao = {
		id: 						"",
		pontuacao: 					0,
		elogioTransparencia: 		false,
		elogioPontualidade: 		false,
		elogioOrganizacao: 			false,
		elogioConhecimento: 		false,
		elogioAtendimento: 			false,
		reclamacaoDesorganizacao: 	false,
		reclamacaoConhecimento: 	false,
		reclamacaoAtraso: 			false,
		reclamacaoAtendimento: 		false,
		comentario: 				""
	};


	this.actionProjHandler = function(action, id, data){
		CORE.action = action;
		switch(action){
			case 'ch':
				startChat(id);
				break;
		}
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
							'<div style="max-height:250px;overflow:auto;" id="NE_CHAT_VIEW"></div>'+
						'</td></tr>'+
					'</table>'+
				'</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW">'+
				'<div class="NE_CONTENT_2COL80">'+
					'<textarea onkeypress="InstaleFacil.getInstance().chatKeyPressed(event, this);" rows="4" cols="50" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_LEFT" style="width:100;" id="NE_CHAT_AREA"></textarea>'+
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

	function getNameOfOrcamentoId(id){
		var name = '';
		for(var i = 0 ; i < CORE.loadProject.instaladores.length ; i++){
			if(CORE.loadProject.instaladores[i].orcamento == id){
				name = CORE.loadProject.instaladores[i].nome;
			}
		}
		return name;
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
				if(CORE.chatData.messages[i].sender == 'C'){
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
			if(messages[i].sender == 'C'){
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

	function htmlEntities(str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
			'cliente/api/send-receive-message',
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
			'cliente/api/send-receive-message',
			{'id': id},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showLoading(false);
					showMessage('Atenção', data['message']);
				}else{
					showLoading(false);
					CORE.chatData = data;
					CORE.chatIsBusy = false;
					if(CORE.chatData.messages.length > 0){
						CORE.chatControl.last = CORE.chatData.messages[0].id;
						CORE.chatControl.first = CORE.chatData.messages[CORE.chatData.messages.length-1].id;
					}
					callback();
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

	function drawName(){
		var comp = document.getElementById('nome');
		var compMobile = document.getElementById('nomeMobile');
		var html =
			'<h3 class="NE_TRUNCATE NE_HEAVY NE_WHITE_TEXT_COLOR">'+CORE.loadProject.razao+'</h3>'+
			'<p class="NE_TRUNCATE NE_WHITE_TEXT_COLOR"><small>'+CORE.loadProject.logradouro+', '+CORE.loadProject.numero+' - '+CORE.loadProject.bairro+', '+CORE.loadProject.cidade+', '+CORE.loadProject.uf+'</small></p>'
		;
		comp.innerHTML = html;
		compMobile.innerHTML = html;
		if (CORE.loadData.projetos.length > 1) {
			document.getElementById('showMore').style.display = '';
			document.getElementById('showMoreMobile').style.display = '';
		}else{
			comp.onclick = function() { return false; };
			compMobile.onclick = function() { return false; };
		}
	}

	this.drawStep = function(step, go){
		if (go > step) {
			return false;
		}
		var comp = document.getElementById('lContentSteps');
		var compMobile = document.getElementById('lContentStepsMobile');
		var html =
			'<tr>'+
			( go == '2A' ?
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG NE_ICON_ACTIVED" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'2A\');">'
			:
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'2A\');">'
			)
			+
			( step >= '2A' ?
				(go == '2A' ?
						'<img src="../images/006.png" />'
					:
						'<img src="../images/014.png" />'
				)
			:
				'		<img src="../images/013.png">'
			)
			+
			'	</td>'+
			'	<td class="NE_NAV_COMP_LINE"><hr/></td>'+
			( go >= '3A' &&  go < '4A' ?
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG NE_ICON_ACTIVED" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'3A\');">'
			:
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'3A\');">'
			)
			+
			( step >= '3A' ?
				(go >= '3A' &&  go < '4A' ?
						'<img src="../images/004.png" />'
					:
						'<img src="../images/012.png" />'
				)
			:
				'		<img src="../images/011.png">'
			)
			+
			'	</td>'+
			'	<td class="NE_NAV_COMP_LINE"><hr/></td>'+
			( go >= '4A' &&  go < '5A' ?
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG NE_ICON_ACTIVED" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'4A\');">'
			:
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'4A\');">'
			)
			+
			( step >= '4A' ?
				(go >= '4A' &&  go < '5A' ?
						'<img src="../images/007.png" />'
					:
						'<img src="../images/015.png" />'
				)
			:
				'		<img src="../images/016.png">'
			)
			+
			'	</td>'+
			'	<td class="NE_NAV_COMP_LINE"><hr/></td>'+
			( go >= '5A' ?
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG NE_ICON_ACTIVED" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'5A\');">'
			:
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'5A\');">'
			)
			+
			( step >= '5A' ?
				(go == '5A' ?
						'<img src="../images/001.png" />'
					:
						'<img src="../images/009.png" />'
				)
			:
				'		<img src="../images/010.png">'
			)
			+
			'	</td>'+
			'</tr>'+
			'<tr>'+
			( go == '2A' ?
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG NE_ICON_ACTIVED" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'2A\');">'
			:
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'2A\');">'
			)
			+
			'		<div class="NE_LABEL NE_PRIMARY_TEXT_COLOR NE_MT5 NE_TRUNCATE"><span style="padding-right: 0px;padding-left: 0px;">Orçamento</span></div>'+
			'	</td>'+
			'	<td class="NE_NAV_COMP_LINE"></td>'+
			( go >= '3A' &&  go < '4A' ?
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG NE_ICON_ACTIVED" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'3A\');">'
			:
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'3A\');">'
			)
			+
			'		<div class="NE_LABEL NE_PRIMARY_TEXT_COLOR NE_MT5 NE_TRUNCATE"><span style="padding-right: 0px;padding-left: 0px;">Obra</span></div>'+
			'	</td>'+
			'	<td class="NE_NAV_COMP_LINE"></td>'+
			( go >= '4A' &&  go < '5A' ?
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG NE_ICON_ACTIVED" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'4A\');">'
			:
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'4A\');">'
			)
			+
			'		<div class="NE_LABEL NE_PRIMARY_TEXT_COLOR NE_MT5 NE_TRUNCATE"><span style="padding-right: 0px;padding-left: 0px;">Ligação</span></div>'+
			'	</td>'+
			'	<td class="NE_NAV_COMP_LINE"></td>'+
			( go >= '5A' ?
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG NE_ICON_ACTIVED" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'5A\');">'
			:
				'	<td class="NE_CENTER NE_CURSOR NE_NAV_COMP_IMG" onclick="InstaleFacil.getInstance().drawStep(\''+step+'\', \'5A\');">'
			)
			+
			'		<div class="NE_LABEL NE_PRIMARY_TEXT_COLOR NE_MT5 NE_TRUNCATE"><span style="padding-right: 0px;padding-left: 0px;">Avaliar</span></div>'+
			'	</td>'+
			'</tr>'
		;
		comp.innerHTML = html;
		compMobile.innerHTML = html;
		CORE.showPage(go);
	};

	this.formButtonPressed = function(){
		if(CORE.action == 'step_one'){

		}
	};

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

	this.prepareSecondView = function(){
		CORE.secondView = document.getElementById('lContentSecondary');
		CORE.secondView.innerHTML =
			'<div class="NE_CONTENT_1COL NE_HORIZONTAL_PADDING_LEFT_20 NE_PB10 NE_PT10 NE_CENTER_MOBILE">'+
			'	<p class="NE_INFO NE_HEAVY NE_LINE_HEIGHT_20 NE_PRIMARY_TEXT_COLOR" id="name"></p>'+
			'	<p class="NE_TEXT_NORMAL NE_INFO NE_LINE_HEIGHT_20 NE_TRUNCATE" id="email"></p>'+
			'	<p class="NE_TEXT_NORMAL NE_INFO NE_LINE_HEIGHT_20" id="celular"></p>'+
			'</div>'
		;
		populateProfile();
		showContent();
		showLoading(false);
	};

	this.showPage = function(page){
		CORE.view = document.getElementById('lContent');
		CORE.viewConfig = document.getElementById('lContentConfig');
		if(typeof CORE.view != 'undefined'){
			CORE.action = page;
			document.getElementById('NE_DETAILS').style.display = 'none';
			if (CORE.loadData.projetos.length < 1) {
				document.getElementById('lConfig').style.display = '';
				CORE.viewConfig.innerHTML =
					'<div class="NE_CONTENT_ROW">'+
					'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
					'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
					'			<tr>'+
					'				<td style="vertical-align: top; position: relative;padding:0;">'+
					'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
					'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
					'							<div class="NE_WBOX NE_WBOX_H320">'+
					'								<div class="NE_CONTENT_ROW">'+
					'									<div class="NE_CONTENT_2COL70">'+
					'										<div class="NE_MAIN_PADDING_CONTENT">'+
					'											<div class="NE_SPACE_BOTTOM">'+
					'												<h1 class="NE_TERCIARY_TEXT_COLOR NE_SPACE_BOTTOM">Olá, '+CORE.loadData.nome+'!</h1>'+
					'												<p class="NE_INFO">Sua conta foi criada com sucesso, entre em contato com a nossa central de atendimento para cadastrar o seu comércio na plataforma Instale Fácil.</p>'+
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
			}
			switch(page){
				case '1A':
					CORE.viewConfig.innerHTML = buildEquipamentos();
					document.getElementById('lConfig').style.display = '';
					document.getElementById('lPanel').style.display = 'none';
				break;
				case 'confirm_equipamentos':
					CORE.viewConfig.innerHTML = buildConfirmEquipamentos();
					document.getElementById('lConfig').style.display = '';
					document.getElementById('lPanel').style.display = 'none';
				break;
				case '1B':
					CORE.viewConfig.innerHTML = buildPendente();
					document.getElementById('lConfig').style.display = '';
					document.getElementById('lPanel').style.display = 'none';
				break;
				case '2A':
					document.getElementById('NE_DETAILS').style.display = '';
					CORE.view.innerHTML = buildInstaladores();
					CORE.previousIndexActive = CORE.activeIndexActive;
					CORE.loadProject.instaladores.length > 0 ?  CORE.buildContentDetail(CORE.activeProjectAtive, CORE.activeIndexActive) : '';
					CORE.loadProject.instaladores.length > 0 ?  document.getElementById('NE_DETAILS').style.display = '' : document.getElementById('NE_DETAILS').style.display = 'none';
					document.getElementById('lPanel').style.display = '';
					document.getElementById('lConfig').style.display = 'none';
				break;
				case '3A':
				case '3B':
				case '3D':
					CORE.view.innerHTML = CORE.buildPhotoScreen();
					if (CORE.loadProject.gasContratado) {
						CORE.setPhotoScreen();
						CORE.photoClick();
					}
					document.getElementById('lPanel').style.display = '';
					document.getElementById('lConfig').style.display = 'none';
				break;
				case '4A':
				case '4B':
				case '4D':
					CORE.showList('NE_LIGACAO', false, '');
					CORE.view.innerHTML = buildSolicitarLigacao();
					CORE.ligacao = {
						periodo: {
							dia: 	[],
							turno: 	[],
						},
						el: {
							dia: [],
							turno: []
						},
						comentario: ''
					}
					if (CORE.loadProject.status == '4A') {
						CORE.setSelectedLigacao((new Date()).getUTCDay() + 1, 'dia');
						CORE.setSelectedLigacao('Manhã', 'turno');
					}
					document.getElementById('lPanel').style.display = '';
					document.getElementById('lConfig').style.display = 'none';
				break;
				case '5A':
				case '9A':
				if (CORE.instaladorContratado > -1) {
					CORE.view.innerHTML = buildAvaliacao();
					if (CORE.loadProject.status == '5A') {
						var rate1 = new StarRate();
						rate1.build(
							'STAR1',
							5,
							function(rate){
								CORE.setAvaliacao('', 'pontuacao', rate);
								document.getElementById("pRate").style.display = "block";
								document.getElementById("divComentario").style.display = "block";
								document.getElementById("divBtnAvaliacao").style.display = "block";
								switch (rate) {
									case 1:
										document.getElementById("pRate").innerHTML = 'Muito ruim';
										break;
									case 2:
										document.getElementById("pRate").innerHTML = 'Ruim';
										break;
									case 3:
										document.getElementById("pRate").innerHTML = 'Regular';
										break;
									case 4:
										document.getElementById("pRate").innerHTML = 'Bom';
										break;
									case 5:
										document.getElementById("pRate").innerHTML = 'Muito bom';
										break;
									default:
										document.getElementById("pRate").style.display = "none";
								}
								document.getElementById("divElogio").style.display = "none";
								document.getElementById("divReclamaco").style.display = "none";
								if (rate > 3) {
									document.getElementById("divElogio").style.display = "block";
								}else if (rate < 3) {
									document.getElementById("divReclamaco").style.display = "block";
								}
							}
						);
					}
				}else{
					CORE.showPage('2A');
				}
				document.getElementById('lPanel').style.display = '';
				document.getElementById('lConfig').style.display = 'none';
				break;
			}
		}
		showContent();
		showLoading(false);
	};

	this.showPhotoDica = function() {
		var html =
			'<div class="NE_CONTENT_ROW NE_CLEAR_MOBILE_PADDING">'+
				'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
					'<div class="NE_LABEL NE_PT5">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus luctus risus vel diam ultricies scelerisque. Vestibulum et fringilla metus, sed egestas erat. Morbi vehicula volutpat urna vitae rhoncus. Praesent rutrum purus a dapibus dictum. Morbi non volutpat odio. Praesent lorem orci, efficitur id ultricies eu, sodales a mauris. Donec vel risus accumsan, hendrerit sem sit amet, aliquam lacus. Ut blandit magna ut lorem convallis, eget placerat nulla consequat. In dapibus metus sed metus placerat fringilla. In vel malesuada ex. Donec euismod purus sed lacus suscipit scelerisque non in massa.</div>'+
				'</div>'+
			'</div>'
		;

		CORE.showPopUp(true, 'Dica', html);
	};

	this.showConfigScreen = function() {
		var html =
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
					'<div class="NE_CONTENT_2COL50 NE_CLEAR_MOBILE_PADDING">'+
							'<input type="button" value="SALVAR" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_HEAVY" onclick="InstaleFacil.getInstance().sendUpdate();"  />'+
					'</div>'+
			'</div>'
		;
		CORE.showPopUp(true, 'Dados cadastrais', html);
		populateForm();
	};

	function populateForm(){
		document.nForm.cpf.value 		= CORE.loadData.cpf;
		document.nForm.telefone.value 	= CORE.loadData.telefone;
		document.nForm.celular.value 	= CORE.loadData.celular;
	}

	this.sendUpdate = function(){
		CORE.chatIsBusy = true;
		showLoading(true);
		var preparedData = {
			telefone: document.nForm.telefone.value,
			celular: document.nForm.celular.value
		}
		remoteCall(
			'cliente/api/update-profile',
			preparedData,
			function(data){
				showLoading(false);
				if(typeof data['error'] != 'undefined'){
					showScreenMessage(data['message']);
				}else{
					CORE.loadData.cpf 		= data.cpf;
					CORE.loadData.telefone 	= data.telefone;
					CORE.loadData.celular 	= data.celular;
					CORE.prepareSecondView();
					CORE.showPopUp(false, '', '');
					CORE.chatIsBusy = false;
				}
			}
		);
	}

	function populateProfile(){
		document.getElementById('name').innerHTML = CORE.loadData.nome;
		document.getElementById('email').innerHTML = CORE.loadData.email;
		document.getElementById('celular').innerHTML = CORE.loadData.celular;
	}

	function buildProjetoScreen() {
		var html = '';
		if (CORE.loadData.projetos.length > 1) {
			html =
				'<div class="NE_CONTENT_1COL NE_BORDER_BOTTOM NE_CLEAR_PADDING" style="padding: 0;">'+
				'	<h3 class="NE_HORIZONTAL_PADDING_LEFT_20 NE_TRUNCATE NE_REGULAR NE_PRIMARY_TEXT_COLOR NE_PB10 NE_PT10">Meus Comércios</h3>'+
				'</div>'
			;
			var classActive = 'NE_HEAVY';
			var border = 'NE_BORDER_BOTTOM';
			var j = CORE.loadData.projetos.length;
			for (var i = 0; i < j; i++) {
				if (i == CORE.projetoAtivo) {
					classActive = 'NE_HEAVY';
				}else{
					classActive = '';
				}
				if ((i + 1) == j) {
					border = '';
				}else{
					border = 'NE_BORDER_BOTTOM';
				}
				html +=
					'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_PB10 '+border+' NE_CURSOR" onclick="InstaleFacil.getInstance().loadProjetoData('+i+');" style="padding: 0;">'+
					'	<h2 class="NE_HORIZONTAL_PADDING_LEFT_20 NE_INFO NE_TEXT_NORMAL NE_TRUNCATE NE_PT10 '+classActive+'">'+CORE.loadData.projetos[i].razao+'</h2>'+
					'	<p class="NE_HORIZONTAL_PADDING_LEFT_20 NE_TEXT_NORMAL NE_TRUNCATE NE_PB10 '+classActive+'">'+CORE.loadData.projetos[i].logradouro+', '+CORE.loadData.projetos[i].numero+' - '+CORE.loadData.projetos[i].bairro+', '+CORE.loadData.projetos[i].cidade+', '+CORE.loadData.projetos[i].uf+'</p>'+
					'</div>'
				;
			}
			html +=
				'</div>'
			;
		}
		return html;
	}

	function buildProjetoPopUp() {
		var html = '';
		if (CORE.loadData.projetos.length > 1) {
			html =
				'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_10 NE_SPACE_BOTTOM">'+
				'	<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED" >'
			;
			var classActive = '';
			for (var i = 0; i < CORE.loadData.projetos.length; i++) {
				if (i == CORE.comercioAtivo) {
					classActive = 'NE_HEAVY';
				}else{
					classActive = '';
				}
				html +=
					'		<tr>'+
					'			<td class="NE_BORDER_BOTTOM NE_CURSOR NE_PB5" onclick="InstaleFacil.getInstance().loadProjetoData('+i+');">'+
					'				<h2 class="NE_INFO NE_TRUNCATE NE_PT10 '+classActive+'">'+CORE.loadData.projetos[i].razao+'</h2>'+
					'				<p class="NE_TRUNCATE '+classActive+'">'+CORE.loadData.projetos[i].logradouro+', '+CORE.loadData.projetos[i].numero+' - '+CORE.loadData.projetos[i].bairro+', '+CORE.loadData.projetos[i].cidade+', '+CORE.loadData.projetos[i].uf+'</p>'+
					'			</td>'+
					'			<td width="5%" class="NE_BORDER_BOTTOM NE_CURSOR NE_PB5 NE_RIGHT" onclick="InstaleFacil.getInstance().loadProjetoData('+i+');">'+
					'				<div style="font-family: \'FA\'">&#xf054;</div>'+
					'			</td>'+
					'		</tr>'
				;
			}
			html +=
				'	</table>'+
				'</div>'
			;
			return html;
		}
	}

	this.openPopUpContratar = function(index) {
		CORE.orcamentoValor = CORE.loadProject.instaladores[index].valorTotal;
		CORE.loadProjetoData(CORE.projetoAtivo, true, index);
	};

	function buildContratarPopUp(index) {
		var html =
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'		<div class="NE_SPACE_BOTTOM">'+
			'			<p class="NE_LABEL NE_HEAVY NE_PB5 NE_PT5">Nome do instalador</p>'+
			'			<h2 class="NE_TRUNCATE NE_PRIMARY_TEXT_COLOR NE_HEAVY">'+CORE.loadProject.instaladores[index].nome+'</h2>'+
			'		</div>'+
			'		<div>'+
			'			<p class="NE_LABEL NE_HEAVY NE_PB5">Valor total do orçamento</p>'+
			'			<h2 class="NE_TRUNCATE NE_QUARTENARY_TEXT_COLOR NE_HEAVY"><small>R$ </small>'+SUB_parseMonetaryValues(CORE.loadProject.instaladores[index].valorTotal, 2)+(CORE.orcamentoValor !== CORE.loadProject.instaladores[index].valorTotal ? '<small style="font-size: 12px;"> Valor atualizado, confira as mudanças no detalhe do orçamento</small>' : '')+'</h2>'+
			'		</div>'+
			'	</div>'+
			'</div>'+
			( CORE.loadProject.instaladores[index].materialIncluso ?
					''
				:
					'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING">'+
					'	<div class="NE_CONTENT_1COL NE_SPACE_TOP NE_CLEAR_PADDING">'+
					'		<h4 class="NE_SPACE_BOTTOM NE_WHITE_TEXT_COLOR NE_CENTER" id="NE_MSG"><div class="NE_NOTIFY_MESSAGE">MATERIAL A SER ADQUIRIDO SEPARADAMENTE PELO CLIENTE.</div></h4>'+
					'	</div>'+
					'</div>'
			)+
			'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING">'+
			'	<div class="NE_CONTENT_1COL NE_SPACE_BOTTOM NE_SPACE_TOP NE_CLEAR_PADDING">'+
			'		<div clas="NE_PB10">'+
			'			<p class="NE_LABEL NE_HEAVY NE_PB10">Para maior agilidade, recomendamos que você autorize o instalador a fazer o upload das fotos da obra nesta plataforma.</p>'+
			'		</div>'+
			'		<label class="NE_CHECKBOX_LABEL">'+
			'			<input id="lbContratarCheckBox" type="checkbox" id="checkbox" checked="">'+
			'			Sim, quero que o instalador se responsabilize pelo envio das fotos.'+
			'		</label>'+
			'	</div>'+
			'</div>'
		;

		document.getElementById('lbBtnContratarNE_CONTRATAR').onclick = function() {CORE.contratarData(CORE.loadProject.instaladores[index])};

		return html;
	}

	function buildLigacaoPopUp() {
		CORE.ligacao.comentario = document.getElementById('pComentario').value;
		var html =
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1 NE_CLEAR_PADDING">'+
			'		<div class="NE_SPACE_BOTTOM_10">'+
			'			<p class="NE_LABEL NE_HEAVY NE_PB5">Dias da semana</p>'+
			'			<h3 class="NE_TERCIARY_TEXT_COLOR NE_TEXT_NORMAL NE_HEAVY">'+sortStringSpace(CORE.ligacao.periodo.dia, true)+'</h3>'+
			'		</div>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1 NE_CLEAR_PADDING">'+
			'		<div class="NE_SPACE_BOTTOM_10">'+
			'			<p class="NE_LABEL NE_HEAVY NE_PB5">Período</p>'+
			'			<h3 class="NE_TRUNCATE NE_TERCIARY_TEXT_COLOR NE_TEXT_NORMAL NE_HEAVY">'+sortStringSpace(CORE.ligacao.periodo.turno, false)+'</h3>'+
			'		</div>'+
			'	</div>'+
			'</div>'+
			(
				CORE.ligacao.comentario > ' ' ?
					'<div class="NE_CONTENT_ROW">'+
					'	<div class="NE_CONTENT_1 NE_CLEAR_PADDING">'+
					'		<div class="NE_SPACE_BOTTOM">'+
					'			<p class="NE_LABEL NE_HEAVY NE_PB5">Comentário</p>'+
					'			<p class="NE_LABEL NE_TEXT_NORMAL">'+CORE.ligacao.comentario+'</p>'+
					'		</div>'+
					'	</div>'+
					'</div>'
				:
					''
			)
		;

		document.getElementById('lbBtnContratarNE_LIGACAO').onclick = function() { InstaleFacil.getInstance().setLigacaoObra(); };

		return html;
	}

	function sortStringSpace(array, sort){
		if (sort) {
			var days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
			var d = [];
			for (var i = 0; i < days.length; i++) {
				if (array.indexOf(days[i]) !== -1) {
					d.push(days[i]);
				}
			}
			array = d;
		}
		return array.join(', ');
	}

	function buildPhotoPopUp(index) {
		var html =
			'<div class="NE_CONTENT_ROW NE_PT10">'+
			'	<div class="NE_CONTENT_2COL60_FIXED NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_10">'+
			'		<div class="NE_SPACE_BOTTOM_10">'+
			'			<h2 class="NE_TRUNCATE NE_PRIMARY_TEXT_COLOR NE_HEAVY" style="line-height: 30px;">'+CORE.loadProject.fotos[index].tipo+'</h2>'+
			'		</div>'+
			'	</div>'+
			'	<div class="NE_CONTENT_2COL40_FIXED NE_CLEAR_PADDING">'+
			'		<div class="NE_SPACE_BOTTOM_10 NE_RIGHT NE_HORIZONTAL_PADDING_10">'+
						CORE.getStatusPhoto(CORE.loadProject.fotos[index].status)+
			'		</div>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1 NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_10">'+
			'		<div class="NE_SPACE_BOTTOM_10 NE_BTN_UPLOAD_UPDATE NE_CURSOR">'+
			'			<input class="NE_BTN_UPLOAD_UPDATE_CONTENT" id="btnUpdate'+CORE.loadProject.fotos[index].tipo+'" style="background-image: url(\''+CORE.loadProject.fotos[index].imageURL+'\');" type="button" value=""></input>'+
			'		</div>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1 NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_10 NE_SPACE_BOTTOM">'+
					( CORE.loadProject.fotos[index].status == '9D' && CORE.loadProject.fotos[index].motivo !== null ?
						'<p class="NE_LABEL NE_TEXT_NORMAL NE_QUARTENARY_TEXT_COLOR NE_HEAVY">'+CORE.loadProject.fotos[index].motivo+'</p>'
					:
						''
					)+
			'	</div>'+
			'</div>'+
			( CORE.loadProject.fotos[index].status == '9D' && CORE.loadProject.status > '3A' && CORE.loadProject.status < '4A' ?
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
				'        	<input type="file" accept="image/*" id="'+CORE.loadProject.fotos[index].tipo+'" name="'+index+'" class="NE_INPUTFILE NE_TEXT NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_TRUNCATE" onclick="InstaleFacil.getInstance().changeButton(this.id, this.files[0])"/>'+
				'        	<label style="width: 50%" id="lbl'+CORE.loadProject.fotos[index].tipo+'" for="'+CORE.loadProject.fotos[index].tipo+'" class="NE_CENTER NE_LABEL NE_TEXT_NORMAL NE_TRUNCATE">SELECIONAR IMAGEM</label>'+
				'    	</div>'+
				'    </div>'+
				'</div>'
			:
				''
			)
		;

		return html;
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

	function buildEquipamentos(){
		var html =
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
			'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
			'			<tr>'+
			'				<td style="vertical-align: top; position: relative;padding:0;">'+
			'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
			'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
			'							<div class="NE_WBOX">'+
			'								<div class="NE_CONTENT_ROW NE_MB10">'+
			'									<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'										<div class="NE_HORIZONTAL_PADDING_30 NE_MT20 NE_MB10" style="min-height: 0;">'+
			'											<div>'+
			'												<h1 class="NE_TERCIARY_TEXT_COLOR NE_MB10">Vamos começar, '+CORE.loadData.nome+'?</h1>'+
			'												<p class="NE_INFO">Informe a seguir quantos e quais equipamentos a gás existem em seu comércio.</p>'+
			'											</div>'+
			'										</div>'+
			'									</div>'+
			'								</div>'
		;
		var htmlMeusEquipamentos 		= '';
		var htmlMeusEquipamentosHeader 	=
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL">'+
			'		<div class="NE_HORIZONTAL_PADDING_30">'+
			'			<table cellspacing="0" class="NE_TABLE_FIXED">'+
			'				<thead>'+
			'					<th width="70%" class="NE_LEFT NE_TRUNCATE NE_HEAVY">Meus Equipamentos</th>'+
			'					<th width="50px" class="NE_CENTER NE_TRUNCATE"></th>'+
			'					<th width="2px" class="NE_CENTER NE_TRUNCATE NE_HEAVY">&nbsp;</th>'+
			'					<th width="50px" class="NE_CENTER NE_TRUNCATE"></th>'+
			'					<th width="2px" class="NE_CENTER NE_TRUNCATE NE_HEAVY">&nbsp;</th>'+
			'					<th width="50px" class="NE_CENTER NE_TRUNCATE"></th>'+
			'				</thead>'+
			'				<tbody>'
		;
		var htmlEquipamentosHeader 	=
			'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING" id="divME" style="display: none">'+
			'	<div class="NE_CONTENT_1COL">'+
			'		<div class="NE_HORIZONTAL_PADDING_30">'+
			'			<table cellspacing="0" class="NE_TABLE_FIXED">'+
			'				<thead>'+
			'					<th width="70%" class="NE_LEFT NE_TRUNCATE NE_HEAVY">Mais Equipamentos</th>'+
			'					<th width="50px" class="NE_CENTER NE_TRUNCATE"></th>'+
			'					<th width="2px" class="NE_CENTER NE_TRUNCATE NE_HEAVY">&nbsp;</th>'+
			'					<th width="50px" class="NE_CENTER NE_TRUNCATE"></th>'+
			'					<th width="2px" class="NE_CENTER NE_TRUNCATE NE_HEAVY">&nbsp;</th>'+
			'					<th width="50px" class="NE_CENTER NE_TRUNCATE"></th>'+
			'				</thead>'+
			'				<tbody>'
		;
		var htmlEquipamentos 			= '';
		var htmlHelper 					= '';
		var htmlButton 					=
			'<div class="NE_CONTENT_ROW NE_CLEAR_PADDING" id="divButton">'+
			'	<div class="NE_CONTENT_2COL30 NE_CLEAR_PADDING NE_MB10">'+
			'		<div class="NE_HORIZONTAL_PADDING_30">'+
			'			<button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON" onclick="InstaleFacil.getInstance().toggleEquipamento(\'divButton\');">Mais Equipamentos</button>'+
			'		</div>'+
			'	</div>'+
			'</div>'
		;
		var htmlAvancar =
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_2COL30 NE_CLEAR_PADDING NE_MT10 NE_SPACE_BOTTOM">'+
			'		<div class="NE_HORIZONTAL_PADDING_30">'+
			'			<button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON" onclick="InstaleFacil.getInstance().confirmEquipamentos()">Avançar</button>'+
			'		</div>'+
			'	</div>'+
			'</div>'
		;
		var htmlClose =
			'				</tbody>'+
			'			</table>'+
			'		</div>'+
			'	</div>'+
			'</div>';
		for (var i = 0; i < CORE.loadProject.equipamentos.length; i++) {
			htmlHelper =
				'<tr>'+
				'	<td 			 class="NE_TD_EQUIPAMENTOS NE_LEFT NE_TRUNCATE"><p class="NE_TRUNCATE NE_INFO NE_LINE_HEIGHT_20">'+CORE.loadProject.equipamentos[i].descricao+'</p></td>'+
				'	<td width="70px" class="NE_TD_EQUIPAMENTOS NE_CENTER NE_TRUNCATE NE_RIGHT"><button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_FORM_GRID" onclick="InstaleFacil.getInstance().controlQtd('+i+' ,false);" style="border-width: 0px"><span class="NE_ICON NE_SECONDARY_TEXT_COLOR">&#xf068;</span></button></td>'+
				'	<td width="2px"  class="NE_TD_EQUIPAMENTOS NE_CENTER NE_TRUNCATE"></td>'+
				'	<td width="70px" class="NE_TD_EQUIPAMENTOS NE_CENTER NE_TRUNCATE"><input  class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_FORM_GRID NE_CENTER	" type="text" id="qtd'+i+'" value="'+CORE.loadProject.equipamentos[i].quantidade+'" min="0" readonly /></td>'+
				'	<td width="2px"  class="NE_TD_EQUIPAMENTOS NE_CENTER NE_TRUNCATE"></td>'+
				'	<td width="70px" class="NE_TD_EQUIPAMENTOS NE_CENTER NE_TRUNCATE NE_LEFT"><button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED NE_FORM_GRID" onclick="InstaleFacil.getInstance().controlQtd('+i+' ,true);" style="border-width: 0px"><span class="NE_ICON NE_SECONDARY_TEXT_COLOR">&#xf067;</span></button></td>'+
				'</tr>'
			;
			if (CORE.loadProject.equipamentos[i].quantidade > 0) {
				htmlMeusEquipamentos += htmlHelper;
			}else{
				htmlEquipamentos += htmlHelper;
			}
		}
		if (htmlMeusEquipamentos > ' ') {
			html += htmlMeusEquipamentosHeader + htmlMeusEquipamentos + htmlClose + htmlButton + htmlEquipamentosHeader;
		}else{
			html +=
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
				'		<div class="NE_HORIZONTAL_PADDING_30">'+
				'			<table cellspacing="0" class="NE_TABLE_FIXED">'+
				'				<thead>'+
				'					<th width="70%" class="NE_LEFT NE_TRUNCATE NE_HEAVY">Equipamentos</th>'+
				'					<th width="50px" class="NE_CENTER NE_TRUNCATE"></th>'+
				'					<th width="2px" class="NE_CENTER NE_TRUNCATE NE_HEAVY">&nbsp;</th>'+
				'					<th width="50px" class="NE_CENTER NE_TRUNCATE"></th>'+
				'					<th width="2px" class="NE_CENTER NE_TRUNCATE NE_HEAVY">&nbsp;</th>'+
				'					<th width="50px" class="NE_CENTER NE_TRUNCATE"></th>'+
				'				</thead>'+
				'				<tbody>'
			;
		}
		html += htmlEquipamentos + htmlClose + htmlAvancar;
		html +=
			'								</div>'+
			'							</div>'+
			'						</div>'+
			'					</td>'+
			'				</tr>'+
			'			</table>'+
			'		</div>'+
			'	</div>'+
			'</div>'
		;

		return html;
	}

	function buildConfirmEquipamentos() {
		var html =
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
			'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
			'			<tr>'+
			'				<td style="vertical-align: top; position: relative;padding:0;">'+
			'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
			'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
			'							<div class="NE_WBOX">'+
			'								<div class="NE_CONTENT_ROW NE_MB10">'+
			'									<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'										<div class="NE_HORIZONTAL_PADDING_30 NE_MT20 NE_MB10" style="min-height: 0;">'+
			'											<div>'+
			'												<h1 class="NE_TERCIARY_TEXT_COLOR NE_MB10">'+CORE.loadData.nome+',</h1>'+
			'												<p class="NE_INFO">Estes são os equipamentos do seu comércio?</p>'+
			'											</div>'+
			'										</div>'+
			'									</div>'+
			'								</div>'+
			'								<div class="NE_CONTENT_ROW">'+
			'									<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'										<div class="NE_HORIZONTAL_PADDING_30">'+
			'											<table cellspacing="0" class="NE_TABLE_FIXED">'+
			'												<thead>'+
			'													<th width="70%" class="NE_LEFT NE_TRUNCATE NE_HEAVY NE_LABEL">Meus Equipamentos</th>'+
			'													<th width="30%" class="NE_CENTER NE_TRUNCATE NE_HEAVY">Quantidade</th>'+
			'												</thead>'+
			'												<tbody>'
		;
		for (var i = 0; i < CORE.sendProject.equipamentos.length; i++) {
			html +=
				'<tr>'+
				'	<td width="60%" class="NE_LEFT NE_TRUNCATE">'+
				'		<p class="NE_INFO NE_TRUNCATE NE_LINE_HEIGHT_BIG">'+CORE.sendProject.equipamentos[i].descricao+'</p>'+
				'	</td>'+
				'	<td width="20%" class="NE_CENTER NE_TRUNCATE">'+
				'		<p class="NE_INFO NE_TRUNCATE NE_LINE_HEIGHT_BIG">'+CORE.sendProject.equipamentos[i].quantidade+'</p>'+
				'	</td>'+
				'</tr>'
			;
		}
		html +=
			'				</tbody>'+
			'			</table>'+
			'		</div>'+
			'	</div>'+
			'</div>'
		;
		html +=
			'<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_30">'+
			'	<div class="NE_CONTENT_5COL NE_CLEAR_PADDING">'+
			'		<button class="NE_SPACE_BOTTOM NE_BTN_DEFAULT NE_COLOR_SECONDARY_FILLED NE_SECONDARY_TEXT_COLOR" onclick="InstaleFacil.getInstance().showPage(\'1A\')">CORRIGIR</button>'+
			'	</div>'+
			'	<div class="NE_CONTENT_5COL NE_CLEAR_PADDING">'+
			'		<button class="NE_SPACE_BOTTOM NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON" onclick="InstaleFacil.getInstance().saveEquipamentoData()">CONFIRMAR</button>'+
			'	</div>'+
			'</div>'
		;
		return html;
	}

	function buildPendente() {
		var html =
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
			'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
			'			<tr>'+
			'				<td style="vertical-align: top; position: relative;padding:0;">'+
			'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
			'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
			'							<div class="NE_WBOX NE_WBOX_H320">'+
			'								<div class="NE_CONTENT_ROW NE_MB10 NE_HORIZONTAL_PADDING_10">'+
			'									<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'										<div class="NE_HORIZONTAL_PADDING_30 NE_MT20 NE_MB10" style="min-height: 0;">'+
			'											<div>'+
			'												<h1 class="NE_TERCIARY_TEXT_COLOR NE_MB10">Falta pouco para você começar a receber orçamentos!</h1>'+
			'												<p class="NE_INFO">Clique em CONTINUAR para tornar seu contato disponível ao instaladores da sua região.</p>'+
			'											</div>'+
			'										</div>'+
			'									</div>'+
			'								</div>'+
			'								<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10">'+
			'									<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_30">'+
			'										<button class="NE_SPACE_BOTTOM NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON" onclick="InstaleFacil.getInstance().liberarProjeto();">CONTINUAR</button>'+
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
	}

	function buildInstaladores() {
		var receber = true;
		var html =
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'		<h3 class="NE_PB5 NE_HORIZONTAL_PADDING_10_TITLE NE_REGULAR NE_TEXT_COLOR">SEUS ORÇAMENTOS</h3>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
			'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
			'			<tr>'+
			'				<td style="vertical-align: top; position: relative;padding:0;">'

		;
		CORE.sizeInstaladores = CORE.loadProject.instaladores.length;
		if (CORE.sizeInstaladores > 0) {
			html +=
				'				<div class="NE_CONTENT_ROW NE_WBOX" style="padding: 0;">'+
				'					<div class="NE_CONTENT_2COL30 NE_CLEAR_MOBILE_PADDING" style="padding: 0; box-shadow: inset -10px 0 33px -14px #DEDEDE;">'+
				'						<div>'
			;
			var read = 'NE_READ_ONLY';
			var divider = '<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING NE_READ_ONLY"><div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING"><div class="NE_BORDER_BOTTOM_MIN_85 NE_CENTER"></div></div></div>';
			for (var i = 0; i < CORE.sizeInstaladores; i++) {
				divider = (i > 0 && (i + 1) < CORE.sizeInstaladores ? 'block' : 'none');

				if(CORE.loadProject.instaladores[i].status == '9A'){
					receber = false;
					CORE.activeIndexActive = i;
					CORE.activeProjectAtive = 'div'+i+'Project';
					if (CORE.activeIndexActive > 0) {
						CORE.previousIndexActive = i - 1;
					}
				}
				read = (i !== CORE.activeIndexActive ? 'NE_READ_ONLY' : '');

				CORE.loadProject.instaladores[i].valorTotal = InstaleFacil.getInstance().sumValueOrcamento(CORE.loadProject.instaladores[i].valorServico, CORE.loadProject.instaladores[i].valorMaterial, CORE.loadProject.instaladores[i].desconto);
				html +=
					'						<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING NE_CURSOR '+read+' NE_LIST_INSTALADORES" onclick="InstaleFacil.getInstance().buildContentDetail(this, '+i+');" id="div'+i+'Project">'+

					(CORE.loadProject.instaladores[i].status == '9A' ?
						'<div class="NE_CENTER NE_TRUNCATE" style="margin-left: 70px;height: 80%;width: 100%;background-image: url(\'../images/approved.png\');background-size: contain;position: absolute;background-repeat:no-repeat;z-index:999999;top:10px;"></div>'
					:
						''
					)+

					'							<div class="NE_CONTENT_2COL30_FIXED">'+
					'								<div class=" NE_TRUNCATE" style="margin-left: 7px; height: 50px; width: 50px; border-radius: 50%;background-image: url(\'' + (CORE.loadProject.instaladores[i].image !== null ? CORE.getThumbnailUrl(CORE.loadProject.instaladores[i].image) : "../images/user.jpg" ) +'\');background-size: cover;"></div>'+
					'							</div>'+
					'							<div class="NE_CONTENT_2COL70_FIXED">'+
					'								<div class="NE_CONTENT_ROW NE_CLEAR_PADDING" style="padding: 0;">'+
					'									<div class="NE_CONTENT_1 NE_CLEAR_PADDING NE_PB5" style="padding: 0;">'+
					'										<table class="NE_TABLE_FIXED" style="padding: 0; width: 70px;">'+
					'											<tr>'+
																		generateScore('FA', '10px', {first: ['&#xf005;', 'NE_QUARTENARY_TEXT_COLOR'], middle: ['&#xf089;', 'NE_QUARTENARY_TEXT_COLOR'], last: ['&#xf005;', 'NE_TEXT_COLOR']}, CORE.loadProject.instaladores[i].pontuacao)+
					'											</tr>'+
					'										</table>'+
					'									</div>'+
					'									<div class="NE_CONTENT_1 NE_CLEAR_PADDING" style="padding: 0;">'+
					'										<p class="NE_TRUNCATE NE_INFO NE_REGULAR NE_LINE_HEIGHT_20 NE_PRIMARY_TEXT_COLOR NE_PB5">'+CORE.loadProject.instaladores[i].nome+'</p>'+
					'									</div>'+
					'									<div class="NE_CONTENT_1 NE_CLEAR_PADDING" style="padding: 0;">'+
					(CORE.loadProject.instaladores[i].valorTotal > 0 ?
						'										<h2 class="NE_TRUNCATE NE_PRIMARY_TEXT_COLOR NE_PB5 NE_HEAVY"><small>R$ </small>'+SUB_parseMonetaryValues(CORE.loadProject.instaladores[i].valorTotal, 2)+'</h2>'
					:
						'										<p class="NE_INFO NE_TRUNCATE NE_PRIMARY_TEXT_COLOR NE_PB5 NE_HEAVY"><small>Aguardando orçamento</small></p>'
					)+
					'									</div>'+
					'								</div>'+
					'							</div>'+
					'						</div>'+
					'						<div style="display: '+divider+'" id="divider'+i+'" class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING NE_READ_ONLY"><div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING"><div class="NE_BORDER_BOTTOM_MIN_85 NE_CENTER"></div></div></div>'
				;
			}
			if (receber) {
				html +=
					'						<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING NE_CURSOR NE_LIST_INSTALADORES">'+
					'							<div class="NE_CONTENT_1COL NE_CENTER">'+
					'								<div class="NE_CONTENT_ROW NE_CLEAR_PADDING" style="padding: 0;">'+
					'									<div class="NE_CONTENT_1 " style="padding-left: 6px; padding-right: 8px;">'+
					'										<button class="NE_BTN_DEFAULT NE_TRUNCATE NE_COLOR_PRIMARY_OUTLINE" onclick="InstaleFacil.getInstance().liberarProjeto()" style="font-size: 14px;">SOLICITAR MAIS ORÇAMENTOS</button>'+
					'									</div>'+
					'								</div>'+
					'							</div>'+
					'						</div>'+
					'						<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLER_MOBILE_PADDING NE_READ_ONLY NE_NOT_DESKTOP_2 NE_SPACE_BOTTOM"><div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING"><div class="NE_BORDER_BOTTOM NE_CENTER"></div></div></div>'
				;
			}
			html +=
				'					</div>'+
				'				</div>'
			;

			html +=
				'<div class="NE_CONTENT_2COL70 NE_NOT_MOBILE NE_PT5">'+
				'	<div id="lContentDetail">'+
				'	</div>'+
				'</div>'
			;

			html +=
				'				</div>'
			;
		}else{
			html +=
				'			<div class="NE_WBOX NE_WBOX_H320">'+
				'				<div class="NE_CONTENT_ROW">'+
				'					<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
				'						<div class="NE_SPACE_BOTTOM NE_SPACE_TOP NE_HORIZONTAL_PADDING_LEFT_20">'+
				'							<h1 class="NE_TERCIARY_TEXT_COLOR NE_SPACE_BOTTOM">Ainda não há orçamentos para visualizar.</h1>'+
				'							<p class="NE_INFO">Você já enviou as informações sobre o seu projeto. Em breve, até 5 instaladores de sua região entrarão em contato para enviar orçamentos.</p>'+
				'						</div>'+
				'					</div>'+
				'				</div>'+
				'				<div class="NE_CONTENT_ROW">'+
				'					<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
				'						<div class="NE_SPACE_BOTTOM NE_SPACE_TOP NE_HORIZONTAL_PADDING_LEFT_20">'+
				'							<button class="NE_SPACE_BOTTOM NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON" onclick="InstaleFacil.getInstance().liberarProjeto();">QUERO RECEBER ORÇAMENTOS</button>'+
				'						</div>'+
				'					</div>'+
				'				</div>'+
				'			</div>'
			;
		}

		html +=
			'				</td>'+
			'			</tr>'+
			'		</table>'+
			'	</div>'+
			'	</div>'
		;

		if (CORE.previousIndexActive < 0) {
			CORE.previousIndexActive = 0;
			CORE.activeIndexActive = 0;
		}

		return html;
	}

	this.showListMaterias = function() {
		var list = '';
		if (CORE.loadProject.instaladores[CORE.previousIndexActive].materialIncluso == false && CORE.loadProject.instaladores[CORE.previousIndexActive].materiais.length > 0) {
			list +=
				'		<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_20" id="divMateriais">'+
				'			<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_SPACE_BOTTOM">'+
				'				<div class="NE_COLLAPSIBLE_VIEW">'+
				'					<div class="NE_CONTENT_ROW">'+
				'						<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
				'							<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED">'
			;
			for (var i = 0; i < CORE.loadProject.instaladores[CORE.previousIndexActive].materiais.length; i++) {
				list +=
					'								<tr>'+
					'									<td width="65%">'+
					'										<p class="NE_INFO NE_PADDING_10">'+CORE.loadProject.instaladores[CORE.previousIndexActive].materiais[i].descricao+'</p>'+
					'									</td>'+
					'									<td>'+
					'										<h2 class="NE_RIGHT">'+CORE.loadProject.instaladores[CORE.previousIndexActive].materiais[i].quantidade+'<small> '+CORE.loadProject.instaladores[CORE.previousIndexActive].materiais[i].unidade+'</small></h2>'+
					'									</td>'+
					'								</tr>'
				;
			}
			list +=
				'							</table>'+
				'						</div>'+
				'					</div>'+
				'				</div>'+
				'			</div>'+
				'		</div>'
			;
		}
		CORE.showPopUp(true, 'Materiais a serem adquiridos', list);
	};

	this.buildContentDetail = function(el, index) {
		if (CORE.previousIndexActive < CORE.sizeInstaladores - 1) {
			document.getElementById('divider'+CORE.previousIndexActive).style.display = 'block';
		}
		if (CORE.previousIndexActive > 0 && CORE.previousIndexActive < CORE.sizeInstaladores) {
			document.getElementById('divider'+(CORE.previousIndexActive - 1)).style.display = 'block';
		}
		document.getElementById('divider'+index).style.display = 'none';
		document.getElementById('divider'+( (index - 1 > 0 ? index - 1 : 0) )).style.display = 'none';
		if (typeof el == 'string' && el > ' ') {
			CORE.previousProjectActive = el = document.getElementById(el);
		}
		if (el > ' ') {
			el.classList.remove('NE_READ_ONLY');
		}else{
			CORE.previousProjectActive = document.getElementById('div0Project');
			CORE.previousIndexActive = index;
		}
		if (el.id !== CORE.previousProjectActive.id && el > ' ') {
			CORE.previousProjectActive.classList.add('NE_READ_ONLY');
			CORE.previousProjectActive = el;
			CORE.previousIndexActive = index;
		}
		var list = '';
		var html =
			'		<div class="NE_CONTENT_ROW NE_PB20 NE_PT20">'+
			'			<div class="NE_CONTENT_2COL40_FIXED NE_CLEAR_PADDING">'+
			'				<div class="NE_CENTER NE_TRUNCATE" style="height: 100px; width: 100px; border-radius: 50%;background-image: url(\'' + (CORE.loadProject.instaladores[index].image !== null ? CORE.getThumbnailUrl(CORE.loadProject.instaladores[index].image) : "../images/user.jpg" ) +'\');background-size: cover;"></div>'+
			'			</div>'+
			'			<div class="NE_CONTENT_2COL60_FIXED NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_10">'+
			'				<div class="NE_CONTENT_ROW NE_CLEAR_PADDING">'+
			'					<div class="NE_CONTENT_1 NE_CLEAR_PADDING" style="padding-left: 5px; margin-bottom: 5px;">'+
			'						<table class="NE_TABLE_FIXED" style="padding: 0; width: 70px;">'+
			'							<tr>'+
											generateScore('FA', '10px', {first: ['&#xf005;', 'NE_QUARTENARY_TEXT_COLOR'], middle: ['&#xf089;', 'NE_QUARTENARY_TEXT_COLOR'], last: ['&#xf005;', 'NE_TEXT_COLOR']}, CORE.loadProject.instaladores[index].pontuacao)+
			'							</tr>'+
			'						</table>'+
			'					</div>'+
			'					<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'						<h2 class="NE_TRUNCATE NE_PB5 NE_LIGHT">'+CORE.loadProject.instaladores[index].nome+'</h2>'+
			'					</div>'+
			'					<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'						<button class="NE_BTN_DEFAULT NE_BUTTON_MIN NE_TRUNCATE NE_COLOR_LIGHTBLUE_OUTLINE NE_TERCIARY_TEXT_COLOR" onclick="InstaleFacil.getInstance().getInstaladorData('+index+')">PERFIL</button>'+
			'					</div>'+
			'				</div>'+
			'			</div>'+
			'		</div>'+
			'		<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
			'			<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING NE_SPACE_BOTTOM">'+
			'				<div class="NE_BORDER_BOTTOM_MIN_95 NE_CENTER" style="position: relative"><div class="NE_ACTION_D_1"></div><div class="NE_ACTION_D_2"></div></div>'+
			'			</div>'+
			'		</div>'+
			'		<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_20">'+
			'			<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'				<div class="NE_COLLAPSIBLE_VIEW NE_PB10 NE_PT5">'+
			'					<div class="NE_TRUNCATE NE_CURSOR NE_COLLAPSIBLE_CLICK">'+
			'						<table cellspacing="0" cellpadding="0" height="40" class="NE_TABLE_FIXED">'+
			'							<tr>'+
			'								<td width="90%">'+
			'									<p class="NE_TRUNCATE NE_INFO NE_REGULAR NE_TEXT_COLOR NE_LINE_HEIGHT_20">SERVIÇOS</p>'+
			'								</td>'+
			( CORE.loadProject.instaladores[index].servicos.length > 0 ?
				'								<td class="NE_RIGHT">'+
				'									<span class="NE_ICON NE_COLLAPSIBLE_ICON">&#xf078;</span>'+
				'								</td>'
			:
				''
			)+
			'							</tr>'+
			'							<tr>'+
			'								<td colspan="2">'+
			'									<h2 class="NE_TRUNCATE NE_PRIMARY_TEXT_COLOR NE_HEAVY"><small>R$ </small>'+SUB_parseMonetaryValues(CORE.loadProject.instaladores[index].valorServico, 2)+'</h2>'+
			'								</td>'+
			'							</tr>'+
			'						</table>'+
			'					</div>'
		;
		if (CORE.loadProject.instaladores[index].servicos.length > 0) {
			html +=
				'					<div class="NE_COLLAPSIBLE_VIEWPORT">'+
				'						<div class="NE_COLLAPSIBLE_CONTENT NE_COLLAPSIBLE_CONTENT_BOX NE_CLEAR_MOBILE_PADDING">'+
				'							<table cellspacing="0" cellpadding="0" height="40" class="NE_TABLE_FIXED">'
			;
			for (var i = 0; i < CORE.loadProject.instaladores[index].servicos.length; i++) {
				html +=
					'								<tr>'+
					'									<td class="NE_WIDTH_TD_SERVICOS '+( (i + 1) < CORE.loadProject.instaladores[index].servicos.length ? 'NE_BORDER_BOTTOM_LIST' : '')+'" rowspan="2">'+
					'										<p class="NE_INFO NE_LINE_HEIGHT_20 NE_PT5 NE_HORIZONTAL_PADDING_LEFT_20">'+CORE.loadProject.instaladores[index].servicos[i].descricao+'</p>'+
					'									</td>'+
					'									<td>'+
					'										<h2 class="NE_RIGHT NE_PADDING_5 NE_UNIDADE_MOBILE">'+CORE.loadProject.instaladores[index].servicos[i].quantidade+'<small> '+CORE.loadProject.instaladores[index].servicos[i].unidade+'</small></h2>'+
					'									</td>'+
					'								</tr>'+
					'								<tr>'+
					'									<td class="'+( (i + 1) < CORE.loadProject.instaladores[index].servicos.length ? 'NE_BORDER_BOTTOM_LIST' : '')+'">'+
					'										<h2 class="NE_RIGHT NE_PADDING_5"><small>R$ </small>'+SUB_parseMonetaryValues(CORE.loadProject.instaladores[index].servicos[i].precoUnitario, 2)+'</h2>'+
					'									</td>'+
					'								</tr>'
				;
			}
			html +=
				'							</table>'+
				'						</div>'+
				'					</div>'
			;
		}
		html +=
			'				</div>'+
			'				<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING NE_PB10">'+
			'					<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
			'						<div class="NE_BORDER_BOTTOM NE_CENTER"></div>'+
			'					</div>'+
			'				</div>'+
			'			</div>'+
			'		</div>'+
			'		<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_20">'+
			'			<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'				<div class="NE_COLLAPSIBLE_VIEW NE_PB10 NE_PT5">'+
			'					<div class="NE_TRUNCATE NE_CURSOR NE_COLLAPSIBLE_CLICK">'+
			'						<table cellspacing="0" cellpadding="0" height="40" class="NE_TABLE_FIXED">'+
			'							<tr>'+
			'								<td>'+
			'									<p class="NE_TRUNCATE NE_INFO NE_REGULAR NE_TEXT_COLOR NE_LINE_HEIGHT_20">MATERIAIS</p>'+
			'								</td>'+
			'							</tr>'+
			'							<tr>'+
			'								<td>'+
			(	CORE.loadProject.instaladores[index].materialIncluso ?
			'									<h2 class="NE_TRUNCATE NE_PRIMARY_TEXT_COLOR NE_HEAVY"><small>R$ </small>'+SUB_parseMonetaryValues((CORE.loadProject.instaladores[index].valorMaterial !== null ? CORE.loadProject.instaladores[index].valorMaterial : 0), 2)+'</h2>'
				:
						'						<p class="NE_TRUNCATE NE_INFO NE_QUARTENARY_TEXT_COLOR NE_HEAVY NE_PB5">Materiais não inclusos '+
				(CORE.loadProject.instaladores[index].materiais.length > 0 ?
						'							<a onclick="InstaleFacil.getInstance().showListMaterias()" style="float: right;text-decoration: none;" class="NE_TERCIARY_TEXT_COLOR">Ver lista</a></p>'
					:
						'						</p>'
				)
			)+
			'								</td>'+
			'							</tr>'+
			'						</table>'+
			'					</div>'+
			'				</div>'+
			'				<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING NE_PB10">'+
			'					<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
			'						<div class="NE_BORDER_BOTTOM NE_CENTER"></div>'+
			'					</div>'+
			'				</div>'+
			'			</div>'+
			'		</div>'+
			(	CORE.loadProject.instaladores[index].desconto > 0 ?
				'		<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_HORIZONTAL_PADDING_20">'+
				'			<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
				'				<div class="NE_COLLAPSIBLE_VIEW NE_PB10 NE_PT5">'+
				'					<div class="NE_TRUNCATE NE_CURSOR NE_COLLAPSIBLE_CLICK">'+
				'						<table cellspacing="0" cellpadding="0" height="40" class="NE_TABLE_FIXED">'+
				'							<tr>'+
				'								<td>'+
				'									<p class="NE_TRUNCATE NE_INFO NE_REGULAR NE_TEXT_COLOR NE_LINE_HEIGHT_20">DESCONTOS</p>'+
				'								</td>'+
				'							</tr>'+
				'							<tr>'+
				'								<td>'+
				'									<h2 class="NE_TRUNCATE NE_PRIMARY_TEXT_COLOR NE_HEAVY"><small>R$ </small>'+SUB_parseMonetaryValues((CORE.loadProject.instaladores[index].desconto !== null ? CORE.loadProject.instaladores[index].desconto : 0), 2)+'</h2>'+
				'								</td>'+
				'							</tr>'+
				'						</table>'+
				'					</div>'+
				'				</div>'+
				'				<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'					<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'						<div class="NE_BORDER_BOTTOM NE_CENTER"></div>'+
				'					</div>'+
				'				</div>'+
				'			</div>'+
				'		</div>'
				:
			''
			)+
			'		<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_SPACE_BOTTOM NE_HORIZONTAL_PADDING_20">'+
			'			<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'				<div>'+
			'					<table cellspacing="0" cellpadding="0" height="40" class="NE_TABLE_FIXED NE_PT10">'+
			'						<tr>'+
			'							<td>'+
			'								<p class="NE_TRUNCATE NE_INFO NE_RIGHT NE_REGULAR NE_TEXT_COLOR NE_LINE_HEIGHT_20">VALOR TOTAL</p>'+
			(CORE.loadProject.instaladores[index].valorTotal > 0 ?
				'								<h1 class="NE_TRUNCATE NE_RIGHT NE_PRIMARY_TEXT_COLOR NE_HEAVY NE_PB5"><small>R$ </small>'+SUB_parseMonetaryValues(CORE.loadProject.instaladores[index].valorTotal, 2)+'</h1>'
			:
				'								<p class="NE_INFO NE_RIGHT NE_TRUNCATE NE_PRIMARY_TEXT_COLOR NE_PB5 NE_HEAVY"><small>Aguardando orçamento</small></p>'
			)+
			'							</td>'+
			'						</tr>'+
			'					</table>'+
			'				</div>'+
			'			</div>'+
			'		</div>'+
			'		<div class="NE_CONTENT_ROW NE_SPACE_BOTTOM NE_HORIZONTAL_PADDING_30">'+
			'			<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING">'+
			(CORE.loadProject.instaladores[index].valorTotal > 0 && CORE.loadProject.instaladores[index].status !== '9X' ?
				( CORE.loadProject.instaladores[index].status !== '9A' ?
					'				<button class="NE_BTN_DEFAULT NE_TRUNCATE NE_COLOR_SECONDARY_OUTLINE" onclick="InstaleFacil.getInstance().openPopUpContratar('+index+')">CONTRATAR</button>'
				:
					'				<button class="NE_BTN_DEFAULT NE_TRUNCATE NE_COLOR_SECONDARY_CONFIRM_BUTTON" >CONTRATADO</button>'
				)
			:
				'				<button class="NE_BTN_DEFAULT NE_READ_ONLY NE_TRUNCATE NE_COLOR_SECONDARY_OUTLINE" disabled>CONTRATAR</button>'
			)+
			'			</div>'+
			'			<div class="NE_CONTENT_2COL50_FIXED NE_CLEAR_PADDING">'+
			(CORE.loadProject.instaladores[index].status !== '9X' ?
				'				<button class="NE_BTN_DEFAULT NE_TRUNCATE NE_COLOR_PRIMARY_OUTLINE" onclick="InstaleFacil.getInstance().actionProjHandler(\'ch\','+CORE.loadProject.instaladores[index].orcamento+',\'\')">CHAT</button>'
			:
				'				<button class="NE_BTN_DEFAULT NE_TRUNCATE NE_COLOR_PRIMARY_OUTLINE NE_READ_ONLY" disabled>CHAT</button>'
			)+
			'			</div>'+
			'		</div>'
		;
		document.getElementById('lContentDetail').innerHTML = html;
		document.getElementById('lbContentNE_DETAILS').innerHTML = html;
		SUB_setCollapsibles();
		CORE.showList('NE_DETAILS', true, 'open');
		setTimeout(function() {
			toggleCollapsible();
		},0);
	};

	this.buildPhotoScreen = function() {
		var html = '';
		if (CORE.loadProject.gasContratado) {
			html +=
				'<span class="NE_ACTION_ICON_ENVIAR NE_COLOR_SECONDARY NE_CURSOR NE_NOT_DESKTOP" style="position: absolute;top: 85px;right: 10px;z-index: 99999;" onclick="InstaleFacil.getInstance().showPhotoDica()"></span>'+
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
				'		<h3 class="NE_PB5 NE_HORIZONTAL_PADDING_10_TITLE NE_REGULAR NE_TEXT_COLOR">ACOMPANHAMENTO DA OBRA</h3>'+
				'	</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
				'			<tr>'+
				'				<td style="vertical-align: top; position: relative;padding:0;">'+
				'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
				'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
				'							<div class="NE_WBOX">'+
				'								<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'									<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
				'										<div class="NE_CONTENT_ROW">'+
				'											<div class="NE_CONTENT_1COL NE_PB5 NE_CENTER">'+
																(CORE.loadProject.status == '3B' ?
				'													<p class="NE_LABEL NE_TEXT_NORMAL NE_PRIMARY_TEXT_COLOR NE_HEAVY">Agora é só aguardar a aprovação das fotos!</p>'
																:
																	(CORE.loadProject.status == '3A' ?
				'														<p class="NE_LABEL NE_TEXT_NORMAL">Envie as fotos para aprovação da finalização da sua obra</p>'+
				'														<span class="NE_ACTION_ICON_ENVIAR NE_COLOR_SECONDARY NE_CURSOR NE_NOT_MOBILE" style="position: absolute;top: 5px;right: 10px;" onclick="InstaleFacil.getInstance().showPhotoDica()"></span>'
																	:
																		(CORE.loadProject.status == '3D' ?
				'															<p class="NE_LABEL NE_TEXT_NORMAL NE_QUARTENARY_TEXT_COLOR NE_HEAVY">Alguma(s) fotos foram reprovadas, clique sobre elas para saber o motivo e reenviá-las</p>'+
				'															<span class="NE_ACTION_ICON_ENVIAR NE_COLOR_SECONDARY NE_CURSOR NE_NOT_MOBILE" style="position: absolute;top: 5px;right: 10px;" onclick="InstaleFacil.getInstance().showPhotoDica()"></span>'
																		:
				'															<p class="NE_LABEL NE_TEXT_NORMAL NE_HEAVY NE_SECONDARY_TEXT_COLOR">Suas fotos foram aprovadas!</p>'
																		)
																	)
																)+
				'											</div>'+
				'										</div>'+
				'										<div class="NE_CONTENT_ROW" id="divPhotos">'+
				'											<div class="NE_CONTENT_5COL NE_PB5 NE_CENTER">'+
				'												<table class="NE_PHOTO_VIEW">'+
				'													<tbody>'+
				'														<tr>'+
				'															<td style="padding: 0;position: relative;">'+
				'																<div class="NE_BTN_UPLOAD NE_CURSOR" id="divFrente do comércio">'+
				// '																  <span class="NE_ACTION_ICON_ENVIAR NE_COLOR_SECONDARY NE_CURSOR" style="position: absolute;top: 2px;left: 5px;z-index: 99999;"></span>'+
				'																  <input class="NE_BTN_UPLOAD_CONTENT NE_CURSOR" id="btnFrente do comércio" style="background-image: url(\'../images/new_photos/foto_fachada_001.png\');" type="button" value=""></input>'+
				'																  <input type="file" accept=".jpg" name="" id="Frente do comércio" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'+
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
				'																<div class="NE_BTN_UPLOAD NE_CURSOR" id="divAbrigo">'+
				'																  <input class="NE_BTN_UPLOAD_CONTENT NE_CURSOR" id="btnAbrigo" style="background-image: url(\'../images/new_photos/foto_abrigo_001.png\');" type="button" value=""></input>'+
				'																  <input type="file" accept=".jpg" name="" id="Abrigo" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'+
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
				'																<div class="NE_BTN_UPLOAD NE_CURSOR" id="divInterna">'+
				'																  <input class="NE_BTN_UPLOAD_CONTENT NE_CURSOR" id="btnInterna" style="background-image: url(\'../images/new_photos/foto_interna_001.png\');" type="button" value=""></input>'+
				'																  <input type="file" accept=".jpg" name="" id="Interna" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'+
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
				'																<div class="NE_BTN_UPLOAD NE_CURSOR" id="divPorta do abrigo">'+
				'																  <input class="NE_BTN_UPLOAD_CONTENT NE_CURSOR" id="btnPorta do abrigo" style="background-image: url(\'../images/new_photos/foto_equipamento_002.png\');" type="button" value=""></input>'+
				'																  <input type="file" accept=".jpg" name="" id="Porta do abrigo" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'+
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
				'																<div class="NE_BTN_UPLOAD NE_CURSOR" id="divEquipamento1">'+
				'																  <input class="NE_BTN_UPLOAD_CONTENT NE_CURSOR" id="btnEquipamento1" style="background-image: url(\'../images/new_photos/foto_equipamento_001.png\');" type="button" value=""></input>'+
				'																  <input type="file" accept=".jpg" name="" id="Equipamento1" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'+
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
																(CORE.loadProject.status == '3A' || CORE.loadProject.status == '3D' ?
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
		}else {
			html +=
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
				'		<h3 class="NE_PB5 NE_HORIZONTAL_PADDING_10_TITLE NE_REGULAR NE_TEXT_COLOR">VAMOS COMEÇAR A OBRA?.</h3>'+
				'	</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
				'			<tr>'+
				'				<td style="vertical-align: top; position: relative;padding:0;">'+
				'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
				'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
				'							<div class="NE_WBOX NE_WBOX_H320">'+
				'								<div class="NE_CONTENT_ROW">'+
				'									<div class="NE_CONTENT_1COL">'+
				'										<div class="NE_MAIN_PADDING_CONTENT">'+
				'											<div class="NE_SPACE_BOTTOM">'+
				'												<h1 class="NE_TERCIARY_TEXT_COLOR NE_SPACE_BOTTOM">Ops, o gás ainda não foi contratado!</h1>'+
				'												<p class="NE_INFO">Converse com seu Consultor Comgás para continuar a obra.</p>'+
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

		}

		return html;
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
	this.photoClick = function() {
		var j = 0;
		for (var i = 0; i < CORE.loadProject.fotos.length; i++) {
			if (CORE.loadProject.fotos[i].tipo == 'Equipamento') {
				j++;
			}
			if (document.getElementById(CORE.loadProject.fotos[i].tipo + (CORE.loadProject.fotos[i].tipo == 'Equipamento' ? j : '')) !== null) {
				generateSetUpPhoto((CORE.loadProject.fotos[i].tipo == 'Equipamento' ? j : ''), i);
			}
		}
	};

	this.setPhotoScreen = function(tipo, url) {
		if (typeof tipo == 'undefined') {
			if (CORE.loadProject.fotos.length > 0) {
				var j = 0;
				for (var i = 0; i < CORE.loadProject.fotos.length; i++) {
					if (CORE.loadProject.fotos[i].tipo == 'Equipamento') {
						if (j > 0) {
							CORE.newEquipamentoFoto(j);
						}
						j++;
					}
					if (CORE.loadProject.fotos[i].status == '9A') {
						document.getElementById('div'+CORE.loadProject.fotos[i].tipo  + (j > ' ' && CORE.loadProject.fotos[i].tipo == 'Equipamento' ? j : '') ).innerHTML += '<div class="NE_PHOTO_STATUS_ACCEPT">&nbsp;</div>';
					}else if (CORE.loadProject.fotos[i].status == '9D') {
						document.getElementById('div'+CORE.loadProject.fotos[i].tipo  + (j > ' ' && CORE.loadProject.fotos[i].tipo == 'Equipamento' ? j : '') ).innerHTML += '<div class="NE_PHOTO_STATUS_REJECT">&nbsp;</div>';
					}
				}
				if (j > 0 && CORE.loadProject.status <= '3A') {
					CORE.newEquipamentoFoto(j);
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

	function enableButtonPhotos() {
		var obrigatorias = ['Frente do comércio', 'Abrigo', 'Interna', 'Porta do abrigo', 'Equipamento'];
		var v = false;
		if (CORE.loadProject.fotos.length < obrigatorias.length) {
			return v;
		}
		for (var i = 0; i < CORE.loadProject.fotos.length; i++) {
			v = false;
			for (var j = 0; j < obrigatorias.length; j++) {
				if (CORE.loadProject.fotos[i].tipo == obrigatorias[j]) {
					v = true;
				}
			}
			if (!v) {
				return v;
			}
		}
		return v;
	}

	function generateSetUpPhoto(j, i) {
		document.getElementById('btn'+CORE.loadProject.fotos[i].tipo  + (j > ' ' ? j : '') ).style.backgroundImage = "url(\'"+CORE.getThumbnailUrl(CORE.loadProject.fotos[i].imageURL)+"\')";
		document.getElementById(CORE.loadProject.fotos[i].tipo  + (j > ' ' ? j : '') ).name = i;
		if (j > ' ') {
			document.getElementById('btn'+CORE.loadProject.fotos[i].tipo+j).onclick = function(){ InstaleFacil.getInstance().showList('NE_PHOTO', true, i); };
		}else{
			document.getElementById('btn'+CORE.loadProject.fotos[i].tipo).onclick = function(){ InstaleFacil.getInstance().showList('NE_PHOTO', true, i); };
		}
		document.getElementById(CORE.loadProject.fotos[i].tipo  + (j > ' ' ? j : '') ).style.display = 'none';
	}

	function StarRate(){
		var elem = null,
			sq = this,
			qnt = 5,
			tbl = document.createElement('table'),
			strs = [],
			cllbck = function(){ return false; };
		this.rate = 0;
		function bind(i){
			var i = i;
			return function(){
				sq.refresh(i);
			};
		}
		this.build = function(elem, qnt, cllbck){
			if(typeof cllbck != 'undefined'){
				this.cllbck = cllbck;
			}
			tbl.className = 'NE_STAR_VIEW';
			this.qnt = qnt;
			this.elem = document.getElementById(elem);
			for(var i = 0 ; i < this.qnt ; i++){
				var st = document.createElement('td');
				st.innerHTML = '&#xf005;';
				st.onclick = bind(i);
				tbl.appendChild(st);
				strs.push(st);
			}
			this.elem.appendChild(tbl);
		};
		this.refresh = function(index){
			this.rate = index+1;
			for(var i = 0 ; i < strs.length ; i++){
				strs[i].style.color = (i <= index?'#ffd003':'#CCCCCC');
			}
			setTimeout(function(){
				sq.cllbck(sq.rate);
			}, 0);
		};
	}

	function buildSolicitarLigacao() {
		var html =
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'		<h3 class="NE_PB5 NE_HORIZONTAL_PADDING_10_TITLE NE_REGULAR NE_TEXT_COLOR">AGENDAMENTO DE LIGAÇÃO</h3>'+
			'	</div>'+
			'</div>'
		;
		if (CORE.loadProject.status == '4A') {
			html +=
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
				'			<tr>'+
				'				<td style="vertical-align: top; position: relative;padding:0;">'+
				'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
				'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
				'							<div class="NE_WBOX">'+
				'								<div class="NE_CONTENT_ROW NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'									<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
				'										<div class="NE_CONTENT_ROW">'+
				'											<div class="NE_CONTENT_1COL NE_PB5 NE_CENTER NE_SPACE_BOTTOM">'+
				'												<p class="NE_LABEL NE_TEXT_NORMAL">Escolha os possíveis horários para realizarmos a ligação do seu gás</p>'+
				'											</div>'+
				'										</div>'+
				'										<div class="NE_CONTENT_ROW">'+
				'											<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CENTER">'+
				'												<table celldpadding="0" cellspacing="0" class="NE_TABLE_FIXED NE_SPACE_BOTTOM NE_CENTER NE_TABLE_50">'+
				'													<tbody><tr>'+
				'														<td><div class="NE_WEEK_SELECTOR NE_QUARTENARY_TEXT_COLOR" style="opacity: 0.6;">D</div></td>'+
				'														<td><div id="Segunda" onclick="InstaleFacil.getInstance().setSelectedLigacao(this, \'dia\')" class="NE_WEEK_SELECTOR">S</div></td>'+
				'														<td><div id="Terça" onclick="InstaleFacil.getInstance().setSelectedLigacao(this, \'dia\')" class="NE_WEEK_SELECTOR">T</div></td>'+
				'														<td><div id="Quarta" onclick="InstaleFacil.getInstance().setSelectedLigacao(this, \'dia\')" class="NE_WEEK_SELECTOR">Q</div></td>'+
				'														<td><div id="Quinta" onclick="InstaleFacil.getInstance().setSelectedLigacao(this, \'dia\')" class="NE_WEEK_SELECTOR">Q</div></td>'+
				'														<td><div id="Sexta" onclick="InstaleFacil.getInstance().setSelectedLigacao(this, \'dia\')" class="NE_WEEK_SELECTOR">S</div></td>'+
				'														<td><div id="Sábado" onclick="InstaleFacil.getInstance().setSelectedLigacao(this, \'dia\')" class="NE_WEEK_SELECTOR">S</div></td>'+
				'													</tr>'+
				'												</tbody></table>'+
				'											</div>'+
				'										</div>'+
				'										<div class="NE_CONTENT_ROW NE_SPACE_BOTTOM">'+
				'											<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
				'												<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED NE_CENTER NE_TABLE_50" style="width: 50%">'+
				'													<tbody><tr>'+
				'														<td><div class="NE_WEEK_SELECTOR_PERIOD NE_TRUNCATE" id="Manhã" onclick="InstaleFacil.getInstance().setSelectedLigacao(this, \'turno\')">Manhã</div></td>'+
				'														<td><div class="NE_WEEK_SELECTOR_PERIOD NE_TRUNCATE" id="Tarde" onclick="InstaleFacil.getInstance().setSelectedLigacao(this, \'turno\')">Tarde</div></td>'+
				'													</tr>'+
				'												</tbody></table>'+
				'											</div>'+
				'										</div>'+
				'										<div class="NE_CONTENT_ROW">'+
				'											<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
				'												<div class="NE_CENTER NE_TABLE_50">'+
				'													<p class="NE_LABEL NE_TEXT_NORMAL NE_PB5 NE_LEFT">Deseja acresentar algum comentário sobre os horários?</p>'+
				'													<textarea rows="5" type="text" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED" id="pComentario"></textarea>'+
				'												</div>'+
				'											</div>'+
				'										</div>'+
				'										<div class="NE_CONTENT_ROW">'+
				'											<div class="NE_CONTENT_1COL NE_TABLE_50 NE_CENTER">'+
				'												<input type="button" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_WHITE_TEXT_COLOR" value="SOLICITAR AGENDAMENTO" onclick="InstaleFacil.getInstance().validateLigacao();">'+
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
		}else if (CORE.loadProject.status == '4B'){
			html +=
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
				'			<tr>'+
				'				<td style="vertical-align: top; position: relative;padding:0;">'+
				'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
				'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
				'							<div class="NE_WBOX NE_WBOX_H320">'+
				'								<div class="NE_CONTENT_ROW">'+
				'									<div class="NE_CONTENT_1COL">'+
				'										<div class="NE_MAIN_PADDING_CONTENT">'+
				'											<div class="NE_SPACE_BOTTOM">'+
				'												<h1 class="NE_TERCIARY_TEXT_COLOR NE_SPACE_BOTTOM">Solicitação enviada!</h1>'+
				'												<p class="NE_INFO">A confirmação de agendamento será enviada nas próximas 24 horas para seu e-mail cadastrado.</p>'+
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
		}else if (CORE.loadProject.status == '4D'){
			html +=
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
				'			<tr>'+
				'				<td style="vertical-align: top; position: relative;padding:0;">'+
				'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
				'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
				'							<div class="NE_WBOX NE_WBOX_H320">'+
				'								<div class="NE_CONTENT_ROW">'+
				'									<div class="NE_CONTENT_1COL">'+
				'										<div class="NE_MAIN_PADDING_CONTENT">'+
				'											<div class="NE_SPACE_BOTTOM">'+
				'												<h1 class="NE_TERCIARY_TEXT_COLOR NE_SPACE_BOTTOM">Ops, tivemos um problema!</h1>'+
				'												<p class="NE_INFO">Seu gás não foi ligado, entre em contato conosco para saber mais.</p>'+
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
		}else if (CORE.loadProject.status > '4D'){
			html +=
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
				'			<tr>'+
				'				<td style="vertical-align: top; position: relative;padding:0;">'+
				'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
				'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
				'							<div class="NE_WBOX NE_WBOX_H320">'+
				'								<div class="NE_CONTENT_ROW">'+
				'									<div class="NE_CONTENT_1COL">'+
				'										<div class="NE_MAIN_PADDING_CONTENT">'+
				'											<div class="NE_SPACE_BOTTOM">'+
				'												<h1 class="NE_TERCIARY_TEXT_COLOR NE_SPACE_BOTTOM">Seu gás está ligado!</h1>'+
				'												<p class="NE_INFO">Agora é só avaliar o seu instalador para que com o seu feedback, nós melhoremos nossa plataforma.</p>'+
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
		}


		return html;
	}

	this.validateLigacao = function() {
		if (CORE.ligacao.periodo.dia.length > 0 && CORE.ligacao.periodo.turno.length > 0) {
			CORE.showList('NE_LIGACAO', true, 'open');
		}else {
			showMessage('Atenção', 'Por favor, selecione pelo menos um dia e um período!');
		}
	};

	function buildAvaliacao() {
		var html = '';
		if (CORE.loadProject.status == '9A') {
			html =
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
				'		<h3 class="NE_PB5 NE_HORIZONTAL_PADDING_10_TITLE NE_REGULAR NE_TEXT_COLOR">AVALIAR INSTALADOR</h3>'+
				'	</div>'+
				'</div>'+
				'<div class="NE_CONTENT_ROW">'+
				'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
				'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
				'			<tr>'+
				'				<td style="vertical-align: top; position: relative;padding:0;">'+
				'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
				'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5">'+
				'							<div class="NE_WBOX NE_WBOX_H320">'+
				'								<div class="NE_CONTENT_ROW">'+
				'									<div class="NE_CONTENT_1COL">'+
				'										<div class="NE_MAIN_PADDING_CONTENT">'+
				'											<div class="NE_SPACE_BOTTOM">'+
				'												<h1 class="NE_TERCIARY_TEXT_COLOR NE_SPACE_BOTTOM">Obrigado por usar o Instale Fácil!</h1>'+
				'												<p class="NE_INFO">A sua obra foi concluída com sucesso! Qualquer dúvida entre em contato conosco pela nossa central de atendimento 24h.</p>'+
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
		}
		html =
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'		<h3 class="NE_PB5 NE_HORIZONTAL_PADDING_10_TITLE NE_REGULAR NE_TEXT_COLOR">AVALIAR INSTALADOR</h3>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
			'		<table class="NE_TABLE_FIXED NE_WBOX_H600" style="background-color: #FFFFFF;">'+
			'			<tr>'+
			'				<td style="vertical-align: top; position: relative;padding:0;">'+
			'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
			'						<div class="NE_CONTENT_1COL NE_PT5 NE_CLEAR_MOBILE_PADDING">'+
			'							<div class="NE_WBOX NE_PB20 NE_PT20" style="min-height: 400px">'+
			'								<div class="NE_CONTENT_ROW">'+
			'									<div class="NE_CONTENT_1COL NE_CENTER NE_TABLE_50 NE_PB10 NE_PT20">'+
			'										<div class="NE_CENTER NE_TRUNCATE" style="height: 100px; width: 100px; border-radius: 50%;background-image: url(\'' + (CORE.loadProject.instaladores[CORE.instaladorContratado].image !== null ? CORE.getThumbnailUrl(CORE.loadProject.instaladores[CORE.instaladorContratado].image) : "../images/user.jpg" ) +'\');background-size: cover;"></div>'+
			'									</div>'+
			'								</div>'+
			'								<div class="NE_CONTENT_ROW">'+
			'									<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CENTER NE_TABLE_50">'+
			'										<h2 class="NE_TRUNCATE NE_PB5 NE_LIGHT">'+CORE.loadProject.instaladores[CORE.instaladorContratado].nome+'</h2>'+
			'									</div>'+
			'								</div>'+
			'								<div class="NE_CONTENT_ROW">'+
			'									<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CENTER NE_TABLE_50" style="height: 24px;">'+
			'										<p class="NE_TRUNCATE NE_PB5 NE_HEAVY" id="pRate" style="display: none"></p>'+
			'									</div>'+
			'								</div>'+
			'								<div class="NE_CONTENT_ROW">'+
			'									<div class="NE_CONTENT_1COL NE_CENTER NE_TABLE_50 NE_CLEAR_PADDING">'+
			'										<div id="STAR1" class="NE_PT5 NE_PB20"></div>'+
			'									</div>'+
			'								</div>'+
			'								<div class="NE_CONTENT_ROW" id="divElogio" style="display: none;">'+
			'									<div class="NE_CONTENT_1COL NE_CENTER NE_TABLE_70 NE_CLEAR_PADDING">'+
			'										<table cellspacing="0" cellpadding="0" class="NE_PT5">'+
			'											<tr>'+
			'												<td>'+
			'													<p class="NE_LABEL NE_HEAVY">Quer fazer um elogio?</p>'+
			'												</td>'+
			'												<td class="NE_LEFT NE_TRUNCATE" >'+
			'													<span class="NE_ACTION_ICON_ENVIAR NE_COLOR_SECONDARY NE_CURSOR" style="width:20px; height: 20px; font-size:10px; line-height:20px">&#xf128;</span>'+
			'												</td>'+
			'											</tr>'+
			'										</table>'+
			'										<div class="NE_DRAG_VIEWPORT">'+
			'											<div class="NE_DRAG_CONTENT NE_LEFT">'+
			'												<div class="NE_RATE_ICON" style="opacity: 0.6" onclick="InstaleFacil.getInstance().setAvaliacao(this, \'elogioAtendimento\', true);">'+
			'													<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_ATENDIMENTO"></div>'+
			'													<div class="NE_TEXT NE_CENTER">Ótimo Atendimento</div>'+
			'												</div>'+
			'												<div class="NE_RATE_ICON" style="opacity: 0.6" onclick="InstaleFacil.getInstance().setAvaliacao(this, \'elogioPontualidade\', true);">'+
			'													<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_PONTUALIDADE"></div>'+
			'													<div class="NE_TEXT NE_CENTER">Pontual</div>'+
			'												</div>'+
			'												<div class="NE_RATE_ICON" style="opacity: 0.6" onclick="InstaleFacil.getInstance().setAvaliacao(this, \'elogioOrganizacao\', true);">'+
			'													<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_ORGANIZACAO"></div>'+
			'													<div class="NE_TEXT NE_CENTER">Organizado</div>'+
			'												</div>'+
			'												<div class="NE_RATE_ICON" style="opacity: 0.6" onclick="InstaleFacil.getInstance().setAvaliacao(this, \'elogioConhecimento\', true);">'+
			'													<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_CONHECIMENTO"></div>'+
			'													<div class="NE_TEXT NE_CENTER">Conhecimento Técnico</div>'+
			'												</div>'+
			'												<div class="NE_RATE_ICON" style="opacity: 0.6" onclick="InstaleFacil.getInstance().setAvaliacao(this, \'elogioTransparencia\', true);">'+
			'													<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_QUALIDADE"></div>'+
			'													<div class="NE_TEXT NE_CENTER">Direcionamento / Transpência / Clareza</div>'+
			'												</div>'+
			'											</div>'+
			'										</div>'+
			'									</div>'+
			'								</div>'+
			'								<div class="NE_CONTENT_ROW" id="divReclamaco" style="display: none;">'+
			'									<div class="NE_CONTENT_1COL NE_CENTER NE_TABLE_70 NE_CLEAR_PADDING">'+
			'										<table cellspacing="0" cellpadding="0" class="NE_PT5">'+
			'											<tr>'+
			'												<td>'+
			'													<p class="NE_LABEL NE_HEAVY">Tem alguma reclamação?</p>'+
			'												</td>'+
			'												<td class="NE_LEFT NE_TRUNCATE" >'+
			'													<span class="NE_ACTION_ICON_ENVIAR NE_COLOR_SECONDARY NE_CURSOR" style="width:20px; height: 20px; font-size:10px; line-height:20px">&#xf128;</span>'+
			'												</td>'+
			'											</tr>'+
			'										</table>'+
			'										<div class="NE_DRAG_VIEWPORT">'+
			'											<div class="NE_DRAG_CONTENT NE_LEFT">'+
			'												<div class="NE_RATE_ICON" style="opacity: 0.6" onclick="InstaleFacil.getInstance().setAvaliacao(this, \'reclamacaoAtendimento\', true);">'+
			'													<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_ATENDIMENTO"></div>'+
			'													<div class="NE_TEXT NE_CENTER">Péssimo Atendimento</div>'+
			'												</div>'+
			'												<div class="NE_RATE_ICON" style="opacity: 0.6" onclick="InstaleFacil.getInstance().setAvaliacao(this, \'reclamacaoAtraso\', true);">'+
			'													<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_PONTUALIDADE"></div>'+
			'													<div class="NE_TEXT NE_CENTER">Atrasou a Obra</div>'+
			'												</div>'+
			'												<div class="NE_RATE_ICON" style="opacity: 0.6" onclick="InstaleFacil.getInstance().setAvaliacao(this, \'reclamacaoDesorganizacao\', true);">'+
			'													<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_ORGANIZACAO"></div>'+
			'													<div class="NE_TEXT NE_CENTER">É Desorganizado</div>'+
			'												</div>'+
			'												<div class="NE_RATE_ICON" style="opacity: 0.6" onclick="InstaleFacil.getInstance().setAvaliacao(this, \'reclamacaoConhecimento\', true);">'+
			'													<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_CONHECIMENTO"></div>'+
			'													<div class="NE_TEXT NE_CENTER">Não Demonstrou Conhecimento Técnico</div>'+
			'												</div>'+
			'											</div>'+
			'										</div>'+
			'									</div>'+
			'								</div>'+
			'								<div class="NE_CONTENT_ROW NE_TABLE_70" id="divComentario" style="display: none">'+
			'									<div class="NE_CONTENT_1COL NE_PT10">'+
			'										<p class="NE_LABEL NE_HEAVY">Deixe seu comentário</p>'+
			'										<textarea id="txtComentario" name="name" rows="5" class="NE_INPUT NE_COLOR_SECONDARY_CONFIRM_BUTTON_FILLED" style="margin-top: 2px; margin-bottom: 0px; height: 108px;"></textarea>'+
			'									</div>'+
			'								</div>'+
			'								<div class="NE_CONTENT_ROW NE_TABLE_50" id="divBtnAvaliacao" style="display: none">'+
			'									<div class="NE_CONTENT_1COL NE_PT10">'+
			'										<input type="button" class="NE_MAIN_BUTTON NE_COLOR_SECONDARY_CONFIRM_BUTTON NE_WHITE_TEXT_COLOR" value="ENVIAR AVALIAÇÃO" onclick="InstaleFacil.getInstance().saveAvaliacao()">'+
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
	}

	function buildPerfil(instalador) {
		var html =
			'<div class="NE_CONTENT_ROW NE_PB5 NE_PT20">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'		<div class="NE_CENTER NE_TRUNCATE" style="height: 100px; width: 100px; border-radius: 50%;background-image: url(\'' + (instalador.image !== null ? CORE.getThumbnailUrl(instalador.image) : "../images/user.jpg" ) +'\');background-size: cover;"></div>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CENTER" style="padding-left: 5px; margin-bottom: 5px;">'+
			'		<table class="NE_TABLE_FIXED NE_CENTER" style="padding: 0; width: 70px;">'+
			'			<tr>'+
							generateScore('FA', '10px', {first: ['&#xf005;', 'NE_QUARTENARY_TEXT_COLOR'], middle: ['&#xf089;', 'NE_QUARTENARY_TEXT_COLOR'], last: ['&#xf005;', 'NE_TEXT_COLOR']}, instalador.pontuacao)+
			'			</tr>'+
			'		</table>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_CONTENT_ROW">'+
			'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CENTER">'+
			'		<h2 class="NE_TRUNCATE NE_PB5 NE_LIGHT NE_CENTER">'+instalador.nome+'</h2>'+
			'	</div>'+
			'</div>'+
			'<div class="NE_MAIN_PADDING_CONTENT" style="padding-top: 10px;">'+
			'	<div class="NE_CONTENT_ROW ">'+
			'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'			<div class="NE_PB10">'+
			'				<div class="NE_BORDER_BOTTOM ">'+
			'					<p class="NE_LABEL NE_TRUNCATE">Sobre</p>'+
			'				</div>'+
			'			</div>'+
			'		</div>'+
			'	</div>'+
			'	<div class="NE_CONTENT_ROW ">'+
			'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING ">'+
			'			<div class="NE_SPACE_BOTTOM NE_PINFO">'+
							instalador.descricao +
			'			</div>'+
			'		</div>'+
			'	</div>'+
			'	<div class="NE_CONTENT_ROW">'+
			'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'			<div class="NE_BORDER_BOTTOM">'+
			'				<p class="NE_LABEL NE_TRUNCATE">Avaliações</p>'+
			'			</div>'+
			'		</div>'+
			'	</div>'+
			'	<div class="NE_CONTENT_ROW">'+
			'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			( instalador.elogioAtendimento > 0 || instalador.elogioPontualidade > 0 || instalador.elogioOrganizacao > 0 || instalador.elogioConhecimento > 0 || instalador.elogioTransparencia > 0 ?
				'			<div class="NE_DRAG_VIEWPORT">'+
				'				<div class="NE_DRAG_CONTENT NE_LEFT">'+
				( instalador.elogioAtendimento > 0 ?
					'					<div class="NE_RATE_ICON">'+
					'						<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_ATENDIMENTO">'+
					(
						instalador.elogioAtendimento > 1 ?
							'							<div class="NE_COUNT_AVALIACAO NE_COLOR_BLACK_FILLED NE_TEXT">'+instalador.elogioAtendimento+'</div>'
						:
							''
					)+
					'						</div>'+
					'						<div class="NE_TEXT">Ótimo Atendimento</div>'+
					'					</div>'
				:
					''
				)+
				( instalador.elogioPontualidade > 0 ?
					'					<div class="NE_RATE_ICON">'+
					'						<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_PONTUALIDADE">'+
					(
						instalador.elogioPontualidade > 1 ?
							'							<div class="NE_COUNT_AVALIACAO NE_COLOR_BLACK_FILLED NE_TEXT">'+instalador.elogioPontualidade+'</div>'
						:
							''
					)+
					'						</div>'+
					'						<div class="NE_TEXT">Pontual</div>'+
					'					</div>'
				:
					''
				)+
				( instalador.elogioOrganizacao > 0 ?
					'					<div class="NE_RATE_ICON">'+
					'						<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_ORGANIZACAO">'+
					(
						instalador.elogioOrganizacao > 1 ?
							'							<div class="NE_COUNT_AVALIACAO NE_COLOR_BLACK_FILLED NE_TEXT">'+instalador.elogioOrganizacao+'</div>'
						:
							''
					)+
					'						</div>'+
					'						<div class="NE_TEXT">Organizado</div>'+
					'					</div>'
				:
					''
				)+
				( instalador.elogioConhecimento > 0 ?
					'					<div class="NE_RATE_ICON">'+
					'						<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_CONHECIMENTO">'+
					(
						instalador.elogioConhecimento > 1 ?
							'							<div class="NE_COUNT_AVALIACAO NE_COLOR_BLACK_FILLED NE_TEXT">'+instalador.elogioConhecimento+'</div>'
						:
							''
					)+
					'						</div>'+
					'						<div class="NE_TEXT">Conhecimento Técnico</div>'+
					'					</div>'
				:
					''
				)+
				( instalador.elogioTransparencia > 0 ?
					'					<div class="NE_RATE_ICON">'+
					'						<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_QUALIDADE">'+
					(
						instalador.elogioTransparencia > 1 ?
							'							<div class="NE_COUNT_AVALIACAO NE_COLOR_BLACK_FILLED NE_TEXT">'+instalador.elogioTransparencia+'</div>'
						:
							''
					)+
					'						</div>'+
					'						<div class="NE_TEXT">Direcionamento / Transpência / Clareza</div>'+
					'					</div>'
				:
					''
				)+
				'				</div>'+
				'			</div>'
			:
				'<p class="NE_INFO NE_PT10 NE_TEXT_COLOR">Nenhuma avaliação.</p>'
			)+
			'		</div>'+
			'	</div>'+
			'	<div class="NE_CONTENT_ROW">'+
			'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'			<div class="NE_BORDER_BOTTOM NE_MT20">'+
			'				<p class="NE_LABEL NE_TRUNCATE">Qualificações</p>'+
			'			</div>'+
			'		</div>'+
			'	</div>'+
			'	<div class="NE_CONTENT_ROW">'+
			'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
			'			<div class="NE_DRAG_VIEWPORT">'+
			'				<div class="NE_DRAG_CONTENT NE_LEFT">'+
			'					<div class="NE_RATE_ICON">'+
			'						<div class="NE_ICON_AVALIACAO NE_ICON_AVALIACAO_BORDER_NONE NE_ICON_AVALIACAO_QUALINSTALL"></div>'+
			'						<div class="NE_TEXT">Qualinstall</div>'+
			'					</div>'+
			'				</div>'+
			'			</div>'+
			'		</div>'+
			'	</div>'+
			'</div>'
		;

		return html;
	}

	this.setSelectedLigacao = function(el, tipo) {
		if (typeof el == 'number') {
			var days = ["Segunda", "Terca", "Quarta", "Quinta", "Sexta", "Sábado"];
			el = document.getElementById(days[(el > 5 ? 0 : el)]);
		}
		if (typeof el == 'string') {
			el = document.getElementById(el);
		}
		if (CORE.ligacao.el[tipo].indexOf(el) !== -1) {
			CORE.ligacao.el[tipo][CORE.ligacao.el[tipo].indexOf(el)].classList.remove('NE_WEEK_SELECTOR_PERIOD_SELECTED');
			CORE.ligacao.el[tipo].splice(CORE.ligacao.el[tipo].indexOf(el), 1);
		}else{
			el.classList.add('NE_WEEK_SELECTOR_PERIOD_SELECTED');
			CORE.ligacao.el[tipo].push(el);
		}
		if (CORE.ligacao.periodo[tipo].indexOf(el.id) !== -1) {
			CORE.ligacao.periodo[tipo].splice(CORE.ligacao.periodo[tipo].indexOf(el.id), 1);
		}else{
			CORE.ligacao.periodo[tipo].push(el.id);
		}
	};

	this.newEquipamentoFoto = function(i) {
		document.getElementById('divPhotos').innerHTML +=
			'	<div class="NE_CONTENT_5COL NE_CENTER">'+
			'		<table class="NE_PHOTO_VIEW">'+
			'			<tbody>'+
			'				<tr>'+
			'					<td style="padding: 0;position: relative;">'+
			'						<div class="NE_BTN_UPLOAD NE_CURSOR" id="divEquipamento'+(parseInt(i)+1)+'">'+
			'						  <input class="NE_BTN_UPLOAD_CONTENT NE_CURSOR" id="btnEquipamento'+(parseInt(i)+1)+'" style="background-image: url(\'../images/new_photos/foto_equipamento_001.png\');" type="button" value=""></input>'+
			'						  <input type="file" accept="image/*" name="" id="Equipamento'+(parseInt(i)+1)+'" onchange="InstaleFacil.getInstance().preparePhotos(this.id, this.files[0]);" class="NE_FILE_UPLOAD NE_CURSOR" />'+
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

	this.sumValueOrcamento = function(s, m, d) {
		return parseFloat(s !== null ? s : 0) + parseFloat(m !== null ? m : 0) - parseFloat(d !== null ? d : 0);
	};

	this.toggleEquipamento = function(el) {
		document.getElementById(el).style.display = 'none';
		var div = document.getElementById('divME');
		if (div.style.display == 'none') {
			div.style.display = 'block';
		}
	};

	this.controlQtd = function(id, soma){
		if (soma) {
			document.getElementById('qtd'+id).value++;
			CORE.loadProject.equipamentos[id].quantidade++;
			return false;
		}
		if (document.getElementById('qtd'+id).value > 0) {
			CORE.loadProject.equipamentos[id].quantidade--;
			document.getElementById('qtd'+id).value--;
		}
	};

	this.confirmEquipamentos = function() {
		CORE.sendProject = {
			id: 0,
			equipamentos: []
		};
		CORE.sendProject.id = CORE.loadProject.id;
		for (var i = 0; i < CORE.loadProject.equipamentos.length; i++) {
			if (CORE.loadProject.equipamentos[i].quantidade > 0) {
				CORE.sendProject.equipamentos.push( CORE.loadProject.equipamentos[i] );
			}
		}
		if (CORE.sendProject.equipamentos.length > 0) {
			CORE.showPage('confirm_equipamentos');
		}else{
			showMessage('Atenção', 'Você deve listar ao menos um equipamento para o seu estabelecimento antes de prosseguir.');
		}
	};

	this.showList = function(id, show, info){
		var comp = document.getElementById(id);
		var compContent = document.getElementById('lbContent'+id);
		if(typeof comp != 'undefined'){
			if( id == 'NE_DETAILS') {
				comp.style.display = (show?'':'none');
				setTimeout(function() {
					toggleCollapsible();
				},0);
				return false;
			}
			comp.style.display = (show?'block':'none');
			if(show && info !== ''){
				compContent.innerHTML =
				(
					id == 'NE_LIST' ?
						'<tr><td>'+
						'	<div class="NE_CONTENT_1COL NE_COLOR_SECONDARY_FILLED">'+
								buildProjetoPopUp()+
						'		<span class="NE_POPUP_CLOSE" onclick="InstaleFacil.getInstance().showList(\''+id+'\', false, \'\');">X</span>'+
						'	</div>'+
						'</td></tr>'
					:
						(
							id == 'NE_CONTRATAR' ?
								buildContratarPopUp(info)
							:
							(
								id == 'NE_LIGACAO' ?
									buildLigacaoPopUp()
								:
								(
									id == 'NE_PHOTO' ?
										buildPhotoPopUp(info)
									:
										buildPerfil(info)
								)
							)
						)
				)
				;
			}else{
				compContent.innerHTML = '';
			}
		}
	};

	this.showPopUp = function(show, title, content, width, exit){
		if(!show && CORE.action == 'ch'){
			stopChat();
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
		}else{
			document.getElementById('NE_CLOSE_LIGHTBOX').onclick = function() {
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

	this.preparePhotos = function(tipo, photo) {
		showLoading(true);
		CORE.chatIsBusy = true;
		var fotoId = '';
		if (document.getElementById(tipo).name > ' ') {
			if (CORE.loadProject.fotos[document.getElementById(tipo).name].id > ' ') {
				fotoId = CORE.loadProject.fotos[document.getElementById(tipo).name].id;
			}
		}
		if (tipo.includes('Equipamento')) {
			tipo = 'Equipamento';
		}

		var dataToSend = {
				'Data-id': CORE.loadProject.id,
				'Data-tipo': tipo
			},
			imageToSend = '';

		var reader = new FileReader();
		reader.readAsDataURL(photo);
		reader.onload = function () {
			imageToSend = reader.result.split(',')[1];
			if (fotoId > ' ') {
				dataToSend['Data-foto-id'] = fotoId;
			}
			sendFile(
				'cliente/api/upload-projeto-foto',
				dataToSend,
				imageToSend,
				function(data){
					if(typeof data['error'] != 'undefined'){
					showMessage('Atenção', data['message']);
					showLoading(false);
					}else{
						CORE.chatIsBusy = false;
						CORE.loadProject.fotos = data.fotos;
						CORE.showPage(data.status);
						CORE.showList('NE_PHOTO', false, '');
						showLoading(false);
					}
				}, true
			);
		};
		reader.onerror = function (error) {
			showLoading(false);
		};
	};

	this.getThumbnailUrl = function(imageUrl) {
		return imageUrl.replace('-0.jpg', '-1.jpg');
	};

	this.loadProjetoData = function(projectIdx, contratar, instalador){
		CORE.showList('NE_LIST', false, '');
		showLoading(true);
		CORE.chatIsBusy = true;
		if (typeof projectIdx == 'undefined') {
			projectIdx = CORE.projetoAtivo;
		}else{
			CORE.projetoAtivo = projectIdx;
		}
		CORE.comercioAtivo = projectIdx;
		remoteCall(
			'cliente/api/load-projeto-data',
			{
				id: CORE.loadData.projetos[projectIdx].id
			},
			function(data){
				if(typeof data['error'] != 'undefined'){
					window.location.replace('index.html');
				}else{
					CORE.loadProject = data.projeto;
					CORE.chatIsBusy = false;
					CORE.projetoAtivo = projectIdx;
					CORE.sizeInstaladores = 0;
					CORE.previousProjectActive = '';
					CORE.activeProjectAtive = 'div0Project';
					CORE.previousIndexActive = -1;
					CORE.activeIndexActive = -1;
					CORE.instaladorContratado = -1;
					for (var i = 0; i < CORE.loadProject.instaladores.length; i++) {
						if(CORE.loadProject.instaladores[i].status == '9A'){
							CORE.instaladorContratado = i;
						}
					}
					drawName();
					CORE.drawStep(CORE.loadProject['status'], CORE.loadProject['status']);
					CORE.prepareSecondView();
					CORE.showPopUp(false, '', '');
					CORE.newMessagesWorker = setInterval(messageWorker, CORE.messageWorkerDelay);
					setTimeout(messageWorker, 1000);
					if (contratar) {
						InstaleFacil.getInstance().showList('NE_CONTRATAR', true, instalador);
					}
				}
			}
		);
	};

	this.saveEquipamentoData = function(){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'cliente/api/save-projeto-equipamentos',
			{
				id: CORE.sendProject.id,
				equipamentos: CORE.sendProject.equipamentos
			},
			function(data){
				if(typeof data['error'] != 'undefined'){
					window.location.replace('index.html');
				}else{
					CORE.chatIsBusy = false;
					CORE.showPage(data['status']);
				}
			}
		);
	};

	this.contratarData = function(project){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'cliente/api/contratar',
			{
				id: project.orcamento,
				valorTotal: project.valorTotal,
				fotos: document.getElementById('lbContratarCheckBox').checked
			},
			function(data){
				if(typeof data['error'] != 'undefined'){
					if (data['error'] == 601) {
						showMessage('Atenção', data['message']);
						CORE.loadProjetoData();
						CORE.showList('NE_CONTRATAR', false, '');
					}
				}else{
					CORE.chatIsBusy = false;
					CORE.showList('NE_CONTRATAR', false, '');
					CORE.showList('NE_DETAILS', false, '');

					var html =
						'<div class="NE_CONTENT_ROW">'+
						'	<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_CLEAR_MOBILE_PADDING">'+
						'		<table class="NE_TABLE_FIXED" style="background-color: #FFFFFF;">'+
						'			<tr>'+
						'				<td style="vertical-align: top; position: relative;padding:0;">'+
						'					<div class="NE_CONTENT_ROW" style="padding: 0;">'+
						'						<div class="NE_CONTENT_1COL NE_CLEAR_MOBILE_PADDING NE_PT5 NE_CLEAR_PADDING">'+
						'							<div class="NE_CONTENT_ROW">'+
						'								<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'									<h1 class="NE_TERCIARY_TEXT_COLOR NE_PB10">Instalador contratado com sucesso!</h1>'+
						'									<p class="NE_INFO">Agora vamos começar a obra, na próxima tela você poderá subir as fotos da obra assim que finalizada pelo instalador.</p>'+
						'								</div>'+
						'							</div>'+
						'							<div class="NE_CONTENT_ROW">'+
						'								<div class="NE_CONTENT_1COL">'+
						'									<button class="NE_BTN_DEFAULT NE_TRUNCATE NE_COLOR_SECONDARY_OUTLINE" onclick="InstaleFacil.getInstance().loadProjetoData();">ENTENDIDO</button>'+
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
					CORE.showPopUp(true, 'Vamos começar?', html);
					showLoading(false);
				}
			}
		);
	};

	this.setObraFinalizada = function(){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'cliente/api/set-obra-finalizada',
			{
				id: CORE.loadProject.id,
			},
			function(data){
				if(typeof data['error'] != 'undefined'){
					window.location.replace('index.html');
				}else{
					CORE.chatIsBusy = false;
					CORE.loadProjetoData();
				}
			}
		);
	};

	this.setLigacaoObra = function(){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'cliente/api/solicita-ligacao',
			{
				id: CORE.loadProject.id,
				semana: (CORE.ligacao.periodo.dia).join(';'),
				periodo: (CORE.ligacao.periodo.turno).join(';'),
				comentario: CORE.ligacao.comentario
			},
			function(data){
				if(typeof data['error'] != 'undefined'){
					window.location.replace('index.html');
				}else{
					CORE.chatIsBusy = false;
					CORE.loadProjetoData();
				}
			}
		);
	};

	this.liberarAvaliacao = function(){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'cliente/api/set-orcamento-status',
			{
				id: CORE.loadProject.id
			},
			function(data){
				if(typeof data['error'] != 'undefined'){
					window.location.replace('index.html');
				}else{
					CORE.chatIsBusy = false;
					CORE.loadProjetoData();
				}
			}
		);
	};

	this.setAvaliacao = function(el, index, value) {
		if (CORE.previousAvaliacao.el > ' ') {
			CORE.previousAvaliacao.el.style.opacity = '0.6';
		}
		if (el > ' ') {
			el.style.opacity = '1';
			CORE.previousAvaliacao.el = el;
		}
		if (index !== 'pontuacao') {
			if (CORE.previousAvaliacao.id > ' ') {
				CORE.avaliacao[CORE.previousAvaliacao.id] = false;
			}
			CORE.previousAvaliacao.id = index;
		}
		CORE.avaliacao[index] = value;
	};

	this.saveAvaliacao = function(){
		CORE.avaliacao.id = CORE.loadProject.id;
		CORE.avaliacao.comentario = document.getElementById('txtComentario').value;
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'cliente/api/save-avaliacao-data',
			CORE.avaliacao,
			function(data){
				if(typeof data['error'] != 'undefined'){
					window.location.replace('index.html');
				}else{
					CORE.chatIsBusy = false;
					CORE.loadProjetoData();
				}
			}
		);
	};

	this.getInstaladorData = function(index){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'cliente/api/get-instalador',
			{
				sfid: CORE.loadProject.instaladores[index].sfid
			},
			function(data){
				if(typeof data['error'] != 'undefined'){
					window.location.replace('index.html');
				}else{
					CORE.chatIsBusy = false;
					CORE.showList('NE_PERFIL', true, data);
					showLoading(false);
				}
			}
		);
	};

	this.liberarProjeto = function(){
		showLoading(true);
		var status = CORE.loadProject.status;
		CORE.chatIsBusy = true;
		remoteCall(
			'cliente/api/libera-projeto',
			{
				id: CORE.loadProject.id
			},
			function(data){
				if(typeof data['error'] != 'undefined'){
					window.location.replace('index.html');
				}else{
					CORE.chatIsBusy = false;
					CORE.showPage(data['status']);
					if(status == '2A'){
						showMessage('Atenção','Mais 5 pedidos de orçamentos foram mandados para outros instaladores da sua região!');
					}
				}
			}
		);
	};

	this.newChatData = null;

	this.messageIcon = function(){
		showLoading(true);
		CORE.chatIsBusy = true;
		remoteCall(
			'cliente/api/load-chat-list',
			{
				id: CORE.loadProject.id
			},
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
							'<p class="NE_CHAT_ITEM_LIST NE_TRUNCATE NE_LETTER_0">' + CORE.newChatData.chats[i].instalador + '</span></p>'+
						'</td>'+
						'<td class="NE_RIGHT NE_COLLAPSIBLE_CLICK " rowspan="2">'+
							'<span class="NE_ICON NE_COLLAPSIBLE_ICON">&#xf054;</span>'+
						'</td>'+
					'</tr>'+
					'<tr>'+
						'<td>'+
							'<p class="NE_CHAT_ITEM_MESSSAGE'+( CORE.newChatData.chats[i].ispending && CORE.newChatData.chats[i].sender == 'I'?'_NEW':'')+' NE_TRUNCATE NE_LETTER_0">' + CORE.newChatData.chats[i].message + '</p>'+
						'</td>'+
					'</tr>'+
				'</table>'
			;
		}
		buffer += '<div class="NE_PADDING_10"></div>';
		buffer += '</div></div>';
		CORE.showPopUp(true, 'Novas Mensagens', buffer);
		showLoading(false);
	}

	this.recentChatClick = function(id){
		showLoading(true);
		startChat(id);
	};

	this.clearInterval = function() {
		clearInterval(chatWorker);
		startChatWorker(false);
		CORE.showPopUp(false, '', '');
	};

	this.notifyData = null;

	this.notifyIcon = function(){
	    showLoading(true);
	    CORE.chatIsBusy = true;
	    remoteCall(
	        'cliente/api/load-notifications',
	        {
				id: CORE.loadProject.id
			},
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
	            '<p class="NE_CHAT_ITEM_LIST NE_TRUNCATE NE_LETTER_0">' + CORE.notifyData.notifications[i].instalador + ' - <span class="NE_PRIMARY_TEXT_COLOR NE_TRUNCATE NE_HEAVY NE_PT5">' + getActionLabel(CORE.notifyData.notifications[i].tipo) + '</span></p>'+
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
	        'cliente/api/set-notification-viewed',
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
	    CORE.loadProjetoData();
	}



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
	            'cliente/api/check-panel-status',
	            {
					id: CORE.loadProject.id
				},
	            function(data){
	                if(typeof data['error'] != 'undefined'){
	                }else{
	                    CORE.chatIsBusy = false;
	                    CORE.changeMessageStatus(data.messageCount > 0, data.notificationCount > 0);
	                }
	            }
	        );
	    }
	}

	this.initialize = function(){
		CORE.chatIsBusy = true;
		remoteCall(
			'cliente/api/load-user-data',
			{
				complete: true
			},
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
								window.location.replace('cadastro.html');
							break;
							// default:
							// 	window.location.replace('erro.html');
						}
					}else if(data['status'] == 'Ativo'){
						CORE.loadData = data;
						CORE.chatIsBusy = false;
						if (CORE.loadData.projetos.length > 0) {
							CORE.loadProjetoData();
						}else{
							CORE.showPage('');
							showContent();
						}
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
InstaleFacil.messageIcon = function(){
    this.getInstance().messageIcon();
};
InstaleFacil.notifyIcon = function(){
    this.getInstance().notifyIcon();
};
