function InstaleFacil(){

	var CORE = this;

	this.view = null;
	this.action = null;
	this.finished = false;
	this.loadData = null;
	this.loadUser = null;
	this.orderQuestions = [];
	this.sendData = {
		avaliacao:null,
		modulo: null,
		respostas: []
	};
	this.moduleToBuild = 1;
	this.questionStep = 1;
	this.answer = null;

	this.radioCheck = function(a){
		CORE.answer = a;
	};

	this.questionButtonPressed = function(){
		if(CORE.answer != null){
			CORE.sendData.modulo = CORE.loadData.modulos[CORE.moduleToBuild-1].id;
			CORE.sendData.respostas.push(CORE.answer);
			CORE.questionStep++;
			if(CORE.questionStep > CORE.loadData.modulos[CORE.moduleToBuild-1].perguntas.length){
				CORE.questionStep = 1;
				CORE.loadData.modulos[CORE.moduleToBuild-1].finalizado = true;
				CORE.moduleToBuild++;
				sendQuestions();
				showContentMobile(true);
			}else{
				CORE.orderQuestions[CORE.moduleToBuild]++;
			}
			if(CORE.moduleToBuild > CORE.loadData.modulos.length){
				enableButton();
			}else{
				CORE.answer = null;
				continueWithData(false);
			}
		}else{
			showMessage('Ops!', 'Por favor, selecione pelo menos uma alternativa');
		}
	};

	function sendQuestions(){
		showLoading(true);
		remoteCall(
			'instalador/api/save-qualificacao-data',
			CORE.sendData,
			function(data){
				if(typeof data['error'] != 'undefined'){
					showMessage('Ops!', 'Por favor, tente novamente em alguns segundos.');
					showLoading(false);
				}else{
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
							CORE.loadUser['ativacao'] = data['ativacao'];
							CORE.sendData.respostas = [];
							continueWithData(false);
							showLoading(false);
						break;
						case '9X':
							CORE.loadUser['pontuacaoInicial'] = data['pontuacaoInicial'];
							approved();

						break;
						// default:
						// 	window.location.replace('erro.html');
					}

				}
			}
		);
	}

	function drawAnswer(type, desc){
		return ''+
			'<tr>'+
				'<td width="20px">'+
					'<input onchange="InstaleFacil.getInstance().radioCheck(\''+type+'\')" type="radio" name="answer" id="'+type+'" value="'+type+'" style="cursor:pointer" />'+
				'</td>'+
				'<td style="padding:0px">'+
					'<div class="NE_QUESTION">'+
						'<label for="'+type+'" style="cursor:pointer"><p name="'+type+'" class="NE_INFO NE_LINE_HEIGHT_20">'+desc+'</p></label>'+
					'</div>'+
				'</td>'+
				'<td>'+
					'<div class="NE_QUESTION">&nbsp;'+
					'</div>'+
				'</td>'+
			'</tr>'
		;
	}

	function drawAnswers(questions){
		var html = '';
		for(var i = 1 ; i <= 5 ; i++){
			var elem = CORE.loadData.modulos[CORE.moduleToBuild-1].perguntas[CORE.questionStep-1]['alternativa'+i];
			if(elem > ' '){
				html += drawAnswer(i,elem);
			}
		}
		return html;
	}

	function enableButton(){
		CORE.finished = true;
		continueWithData(false);
	}

	function drawQuestion(){
		return ''+
			'<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
				'<div class="NE_LIST_DEFAULT NE_CLEAR_PADDING">'+
					'<form name="Fr">'+
						'<table width="100%" cellspacing="0" cellpadding="0" height="40" class="">'+
							'<tr>'+
								'<td colspan="2">'+
									'<p class="NE_LIGHT NE_PT10 NE_PB5" style = "font-size: 20px">'+CORE.loadData.modulos[CORE.moduleToBuild-1].perguntas[CORE.questionStep-1].pergunta+'</p>'+
								'</td>'+
								'<td width="25%" class="NE_RIGHT">'+
									'<h2 class="NE_PRIMARY_TEXT_COLOR NE_LIGHT NE_RIGHT">'+CORE.questionStep+'/'+CORE.loadData.modulos[CORE.moduleToBuild-1].perguntas.length+'</h2>'+
								'</td>'+
							'</tr>'+
							drawAnswers()+
							'<tr>'+
								'<td colspan="3">'+
									'<div class="NE_CONTENT_2COL30 NE_CLEAR_PADDING">'+
										'<div class="NE_PB5 NE_PT5">'+
											'<button onclick="InstaleFacil.getInstance().questionButtonPressed();" type="button" class="NE_TRUNCATE NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON" style="margin-bottom: 50px;" name="button">Próxima</button>'+
										'</div>'+
									'</div>'+
								'</td>'+
							'</tr>'+
						'</table>'+
					'</form>'+
				'</div>'+
			'</div>'
		;
	}

	function drawModule(){
		return ''+
			'<div class="NE_CONTENT_ROW" style="background-color: #D5D5D5;" id="">'+
				'<div class="NE_LIST_DEFAULT">'+
					'<table cellspacing="0" cellpadding="0" width="100%">'+
						'<tr>'+
							'<td width="100" class="NE_LEFT" style="padding:0px">'+
								'<div style="background-image:url(\''+CORE.loadData.modulos[CORE.moduleToBuild-1].image+'\');background-size:cover;background-position:center;height:60px; width:100px;cursor:pointer" onclick="InstaleFacil.getInstance().showVideo(\''+CORE.moduleToBuild+'\', );"></div>'+
							'</td>'+
							'<td>'+
								'<h2 class="NE_HEAVY NE_PRIMARY_TEXT_COLOR NE_TRUNCATE NE_PB5 NE_HORIZONTAL_PADDING_10">'+CORE.loadData.modulos[CORE.moduleToBuild-1].tipo+'</h2>'+
								'<div class="NE_LABEL NE_HORIZONTAL_PADDING_10" style="padding: 5px 10px">'+removeNullString(CORE.loadData.modulos[CORE.moduleToBuild-1].descricao)+'</div>'+
							'</td>'+
						'</tr>'+
					'</table>'+
				'</div>'+
			'</div>'
		;
	}

	function drawModuleList(first){
		if(first){
			CORE.sendData.avaliacao = CORE.loadData.avaliacao;
			for(var i = 0 ; i < CORE.loadData.modulos.length ; i++){
				CORE.orderQuestions[i+1] = 1;
				if(CORE.loadData.modulos[i].finalizado){
					CORE.moduleToBuild++;
				}
			}
			if(CORE.moduleToBuild > CORE.loadData.modulos.length){
				CORE.moduleToBuild = CORE.loadData.modulos.length;
			}
		}

		var comp = document.getElementById('mList'),
			html = '<table cellspacing="0" cellpadding="0" class="NE_TABLE_FIXED">';
		for(var i = 0 ; i < CORE.loadData.modulos.length ; i++){
			var totalQuestions = CORE.loadData.modulos[i].perguntas.length;
			if(CORE.loadData.modulos[i].finalizado){
				CORE.orderQuestions[i+1] = totalQuestions;
			}
			html += CORE.buildModuleListItem(
				CORE.loadData.modulos[i].tipo,
				CORE.loadData.modulos[i].descricao == null ? '':CORE.loadData.modulos[i].descricao,
				CORE.orderQuestions[i+1],
				totalQuestions,
				CORE.loadData.modulos[i].image == null ? '': CORE.loadData.modulos[i].image,
				i+1,
				CORE.loadData.modulos[i].finalizado
			);
		}
		if(CORE.moduleToBuild > CORE.loadData.modulos.length){
			CORE.moduleToBuild = CORE.loadData.modulos.length;
		}
		html += '</table>';
		comp.innerHTML = html;
	}

	this.buildModuleListItem = function(title, desc, currentQuestion, totalQuestions, imageUrl, module, finished){
		var func = (
			finished ?
				' style="opacity: .5 !important;cursor:pointer" onclick="InstaleFacil.getInstance().showVideo(\''+module+'\', );" '
			:
				(
					CORE.moduleToBuild == module ?
						' style="cursor:pointer;opacity:1" onclick="InstaleFacil.getInstance().moduleItemClick(\''+module+'\');" '
					:
						' style="opacity: .5" '
				)
		);

		return ''+
			'<tr '+func+' >'+
				'<td width="30%" rowspan="2" class="NE_LEFT" style="padding:0px">'+
					'<div style="backgorund-color:#CCCCCC;background-image:url(\''+imageUrl+'\');background-size:cover;background-position:center;height:60px;margin-top:10px;padding: 0px;"></div>'+
				'</td>'+
				'<td width="60%" class="NE_BOTTOM">'+
					'<h3 class="NE_HEAVY NE_INFO NE_PADDING_5 NE_TRUNCATE">'+title+'</h3>'+
				'</td>'+
				'<td width="15%" class="NE_BOTTOM">'+
					'<h3 class="NE_LIGHT NE_INFO NE_PADDING_5  NE_TRUNCATE NE_RIGHT ">'+currentQuestion+'/'+totalQuestions+'</h3>'+
				'</td>'+
			'</tr>'+
			'<tr '+func+' class="'+(module==CORE.loadData.modulos.length?'':' NE_BORDER_BOTTOM')+'">'+
				'<td class="NE_TOP" colspan="2">'+
					'<p class="NE_PADDING_5">' +(desc == null || desc == ''?'&nbsp;':desc)+ '</p>'+
				'</td>'+
			'</tr>'
		;
	};

	this.showVideo = function(module){
		CORE.showVideoFrame(true, CORE.loadData.modulos[module-1].video);
	};

	this.moduleItemClick = function (module){
		showContentMobile(true);
	};

	function reproved(){
		var comp = document.getElementById('cList');
		comp.innerHTML = ''+
			'<div class="NE_MAIN_PADDING_CONTENT">'+
			'	<div class="NE_CONTENT_ROW">'+
			'		<div class="NE_CONTENT_2COL80">'+
			'			<div class="NE_SPACE_BOTTOM">'+
			'				<h1 class="NE_TERCIARY_TEXT_COLOR NE_SPACE_BOTTOM">Pontuação insuficiente.</h1>'+
			'				<p class="NE_INFO">Infelizmente, sua pontuação não foi suficiente para se qualificar, mas você pode tentar mais uma vez!</p>'+
			'			</div>'+
			'		</div>'+
			'	</div>'+
			(CORE.sendData.avaliacao == 1?
				'	<div class="NE_CONTENT_ROW ">'+
				'		<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
				'			<button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON" onclick="InstaleFacil.getInstance().restartQuestions();">Tentar Novamente</button>'+
				'		</div>'+
				'	</div>'
			:
				''
			)+
			'</div>'
		;
		showLoading(false);
		showContentMobile(true);
	}
	function approved(){
		var comp = document.getElementById('cList');
		var nota = Math.round((CORE.loadUser['pontuacaoInicial']*10000)/5)/100;

		comp.innerHTML = ''+
			'<div class="NE_MAIN_PADDING_CONTENT">'+
			'	<div class="NE_CONTENT_ROW">'+
			'		<div class="NE_CONTENT_2COL80">'+
			'			<div class="NE_SPACE_BOTTOM">'+
			'				<h1 class="NE_TERCIARY_TEXT_COLOR NE_SPACE_BOTTOM">Parabéns!</h1>'+
			'				<p class="NE_INFO">Você acertou '+
			'					<span class="NE_SECONDARY_TEXT_COLOR" style=" font-size: 20px;">'+nota+'</span>'+
			'					 % das questões e está qualificado para enviar Orçamentos nesta plataforma.</p>'+
			'			</div>'+
			'		</div>'+
			'	</div>'+
			'	<div class="NE_CONTENT_ROW ">'+
			'		<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
			'			<button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON" onclick="window.location.replace(\'projetos.html\');">Começar</button>'+
			'		</div>'+
			'	</div>'+
			'</div>'
		;
		showLoading(false);
		showContentMobile(true);
	}

	function drawStart(){
		var compStart = document.getElementById('startQuest');
		var comp = document.getElementById('List');
		comp.style.display = 'none';
		compStart.innerHTML = ''+
			'<div class="NE_MAIN_PADDING_CONTENT">'+
			'	<div class="NE_CONTENT_ROW">'+
			'		<div class="NE_CONTENT_2COL80 NE_CLEAR_PADDING">'+
			'				<h1 class="NE_TERCIARY_TEXT_COLOR NE_SPACE_BOTTOM">Questionário de Qualificação</h1>'+
			'				<p class="NE_INFO">Para oferecer seus serviços na plataforma, é necessário ser aprovado no teste de qualificação a seguir. A avaliação é composta por 15 questões e tem duração média de 30 minutos. Clique no botão abaixo ou volte a qualquer momento para completar esta etapa.</p>'+
			'				<p class="NE_SECONDARY_TEXT_COLOR NE_PT10 NE_PB10" style=" font-size: 20px;">Atenção: é necessária uma conexão estável de internet.</p>'+
			'		</div>'+
			'	</div>'+
				'	<div class="NE_CONTENT_ROW ">'+
				'		<div class="NE_CONTENT_2COL50 NE_CLEAR_PADDING">'+
				'			<button class="NE_BTN_DEFAULT NE_COLOR_SECONDARY_CONFIRM_BUTTON" onclick="InstaleFacil.getInstance().switchScreen()">COMEÇAR</button>'+
				'		</div>'+
				'	</div>'+
			'</div>'
		;
		showLoading(false);
		showContentMobile(true);
	}
	this.switchScreen = function(){
		showLoading(true);
		var compStart = document.getElementById('Start');
		var comp = document.getElementById('List');
		compStart.style.display = 'none';
		comp.style.display = 'block';
		continueLogged();
	}

	this.restartQuestions = function(){
		remoteCall(
			'instalador/api/refazer-qualificacao',
			{},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showMessage('Atenção', data['description']);
					showLoading(false);
				}else{
					window.location.replace('qualificacao.html');
				}
			}
		);
	};

	function continueWithData(first){
		drawModuleList(first);
		if(CORE.loadUser['ativacao'] == '2X'){
			reproved();
			CORE.finished = true;
		}else{
			var comp = document.getElementById('cList'),
				html = '';
			if(CORE.finished){
				html += '';
			}else{
				html += drawModule();
				html += drawQuestion();
			}
			comp.innerHTML = html;
		}

	}
	function drawName(){
		var comp = document.getElementById('nomeInstalador');
		comp.innerHTML = CORE.loadUser.razao;
	}

	function continueLogged(){
		remoteCall(
			'instalador/api/load-qualificacao-data',
			{},
			function(data){
				if(typeof data['error'] != 'undefined'){
					showMessage('Atenção', data['description']);
					showLoading(false);
				}else{
					CORE.loadData = data;
					continueWithData(true);
					showLoading(false);
				}
			}
		);
	}

	function showContentMobile(show){
		// var comp = document.getElementById('cList');
		// if(typeof comp != 'undefined'){
		// 	comp.className = 'NE_HORIZONTAL_PADDING_30 NE_CONTENT NE_PT20 ' + (show?'NE_NOT_MOBILE':'');
		// }
		comp = document.getElementById('mList');
		if(typeof comp != 'undefined'){
			comp.className = 'NE_HORIZONTAL_PADDING_10 NE_CONTENT NE_PT10 ' + (show?'NE_NOT_MOBILE':'');
		}
	}

	this.showVideoFrame = function(show, url){
		var comp = document.getElementById('NE_VIDEO');
		if(typeof comp != 'undefined'){
			comp.style.display = (show?'table':'none');
			if(show && url > ' '){
				comp.innerHTML = buildVideoFrame(url) + '<span class="NE_VIDEO_CLOSE" onclick="InstaleFacil.getInstance().showVideoFrame(false, \'\');">X</span>';
			}else{
				comp.innerHTML = '';
			}
		}
		showLoading(show);
	}

	function buildVideoFrame(url){
		return '<tr><td><iframe class="NE_VIDEO_FRAME" src="'+url+'" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe></td></tr>';
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
							case '1B':
							case '1C':
							case '1D':
							 	window.location.replace('cadastro.html');
							break;
							case '2A':
							case '2X':
								CORE.loadUser = data;
								drawStart();
								//continueLogged();
								showContent();
								drawName();
							break;
							case '9X':
								window.location.replace('projetos.html');
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
			}
		);
	};

	function removeNullString(param){
		return (param == null?'':param);
	}

	this.logout = function(){
		logout('instalador');
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
InstaleFacil.logout = function(){
    this.getInstance().logout();
};
