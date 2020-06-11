
var BASE_URL = '/';

function showLoading(show){
	var comp = document.getElementById('NE_LOADING');
	if(typeof comp != 'undefined'){
		comp.style.display = (show?'table':'none');
	}
}

function showContent(){
	var content = document.getElementById('NE_CONTENT');
	if(typeof content != 'undefined'){
		content.style.opacity = 1;
	}
}

function setCookie(name, value, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    name += "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

function removeFromArray(array, value){
	var index = array.indexOf(value);
	if (index > -1) {
		array.splice(index, 1);
	}
	return array;
}

function getQueryParams() {
	var params = {},
		tokens,
		qs = (window.location.href.split('?')[1] != undefined?
			window.location.href.split('?')[1].split('+').join(' '):''
		),
		re = /[?&]?([^=]+)=([^&]*)/g;
	while (tokens = re.exec(qs)) {
		params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
	}
	return params;
}

function Request() {

	var request;

	this.send = function(data, callback) {

		var method = '',
			parameters = '';

		if (typeof request == 'undefined') {
			if (window.XMLHttpRequest) request = new XMLHttpRequest();
			else request = new ActiveXObject("Microsoft.XMLHTTP");
		}

		request.onreadystatechange = function() {
			callback(request.readyState, request.status, request.responseText);
		};

		switch (data.method) {
			case 'GET': method = 'GET'; break;
			case 'POST': method = 'POST'; break;
			default: method = 'GET';
		}

		if (typeof data.parameters != 'undefined') {

			if(typeof data.headers['Content-Type'] != 'undefined'
				&& (data.headers['Content-Type'] == 'application/json;charset=UTF-8'
					||  data.headers['Content-Type'] == 'application/json')){
				parameters = JSON.stringify(data.parameters);
			}else{
				parameters = data.parameters;
			}
		}

		request.open(method, data.url + (method == 'GET' ? parameters : ''), data.synchronous);

		if (typeof data.headers != 'undefined')
			for (var header in data.headers) {
				request.setRequestHeader(header, data.headers[header]);
			}

		request.send((method == 'POST' ? parameters : null));
	};

}
Request.instance = null;
Request.getInstance = function() {
	if (this.instance == null) this.instance = new Request();
	return this.instance;
};

Request.send = function(data, callback) {
	Request.getInstance().send(data, callback);
};

function remoteCall (url, data, callback){

	var sessionPrefix = '',
		urlDirection = '';
	var partsUrl = url.split('/');
	if(partsUrl[0].indexOf('instalador') >= 0){
		sessionPrefix = 'i-';
		urlDirection = 'instalador';
	}else if(partsUrl[0].indexOf('cliente') >= 0){
		sessionPrefix = 'c-';
		urlDirection = 'cliente';
	}
	var sessionId = getCookie(sessionPrefix+'session-id'),
		accesToken = getCookie(sessionPrefix+'access-token');
	if(sessionId != null && sessionId > ' '
	&& accesToken!= null && accesToken > ' '){
		var headers = {
			'Session-id': sessionId,
			'Access-token': accesToken,
			'Content-Type': 'application/json;charset=UTF-8'
		};
		Request.send({
			method:	'POST',
			parameters: data,
			headers: headers,
			url: BASE_URL + url,
			synchronous: true
		}, function(readyState, status, response){
			if(readyState == 4){
				if(status == 200){
					response = JSON.parse(response);
					if(typeof response['error'] != 'undefined' &&
						(response['error'] == 591 || response['error'] == 592 )){
						var clientId = getCookie(sessionPrefix+'client-id'),
							refreshToken = getCookie(sessionPrefix+'refresh-token');
						if(clientId != null && clientId > ' '
						&& refreshToken!= null && refreshToken > ' '){
							Request.send({
								method:	'POST',
								parameters: {
									clientId : clientId,
									refreshToken: refreshToken
								},
								headers: {
									'Content-Type': 'application/json;charset=UTF-8'
								},
								url: BASE_URL + urlDirection + '/api/refresh-login',
								synchronous: true
							}, function(readyState, status, response){
								if(readyState == 4){
									if (status == 200) {
										response = JSON.parse(response);
										if(response['error'] == 0){
											setCookie(sessionPrefix+'access-token',response['accessToken'],999);
											setCookie(sessionPrefix+'session-id',response['sessionId'],999);
											headers['Session-id'] = response['sessionId'];
											headers['Access-token'] = response['accessToken'];
											Request.send({
												method:	'POST',
												parameters: data,
												headers: headers,
												url: BASE_URL + url,
												synchronous: true
											}, function(readyState, status, response){
												if(readyState == 4){
													if (status == 200) {
														response = JSON.parse(response);
														if(typeof response['error'] != 'undefined' &&
															(response['error'] == 591 || response['error'] == 592 )){
																setCookie(sessionPrefix+'access-token','',-1);
																setCookie(sessionPrefix+'session-id','',-1);
																setCookie(sessionPrefix+'client-id','', -1);
																setCookie(sessionPrefix+'refresh-token','', -1);
																window.location.replace('index.html');
														}else{
															setTimeout(function(){
																callback(response);
															},1);
														}
													}else{
														setCookie(sessionPrefix+'access-token','',-1);
														setCookie(sessionPrefix+'session-id','',-1);
														window.location.replace('index.html');
													}
												}
											});
										}else{
											showLoading(false);
											setCookie(sessionPrefix+'access-token','',-1);
											setCookie(sessionPrefix+'session-id','',-1);
											setCookie(sessionPrefix+'client-id','', -1);
											setCookie(sessionPrefix+'refresh-token','', -1);
											window.location.replace('index.html');
										}
									}else{
										setCookie(sessionPrefix+'access-token','',-1);
										setCookie(sessionPrefix+'session-id','',-1);
										window.location.replace('index.html');
									}
								}
							});
						}else{
							setCookie(sessionPrefix+'client-id','',-1);
							setCookie(sessionPrefix+'refresh-token','',-1);
							window.location.replace('index.html');
						}
					}else{
						setTimeout(function(){
							callback(response);
						},1);
					}
				}else{
					setCookie(sessionPrefix+'access-token','',-1);
					setCookie(sessionPrefix+'session-id','',-1);
					window.location.replace('index.html');
				}
			}
		});
	}else{
		setCookie(sessionPrefix+'access-token','',-1);
		setCookie(sessionPrefix+'session-id','',-1);
		window.location.replace('index.html');
	}
}

function sendRequest(url, data, headers, callback){
	Request.send({
		method:	'POST',
		parameters: data,
		headers: headers,
		url: BASE_URL + url,
		synchronous: true
	}, function(readyState, status, response){
		if(readyState == 4){
			callback(status, JSON.parse(response));
		}
	});
}

// function remoteCall(url, data, callback){
//
// 	var sessionPrefix = '';
// 	var partsUrl = url.split('/');
// 	if(partsUrl[0].includes('instalador')){
// 		sessionPrefix = 'i-';
// 	}else if(partsUrl[0].includes('cliente')){
// 		sessionPrefix = 'c-';
// 	}
//
// 	var sessionId = getCookie(sessionPrefix+'session-id'),
// 		refreshToken = getCookie(sessionPrefix+'access-token');
//
// 	if(sessionId != null && sessionId > ' '
// 	&& refreshToken!= null && refreshToken > ' '){
//
// 		var headers = {
// 			'Session-id': sessionId,
// 			'Access-token': refreshToken,
// 			'Content-Type': 'application/json;charset=UTF-8'
// 		};
//
// 		Request.send({
// 			method:	'POST',
// 			parameters: data,
// 			headers: headers,
// 			url: BASE_URL + url,
// 			synchronous: true
// 		}, function(readyState, status, response){
// 			if(readyState == 4){
				// if(status == 200){
				// 	setTimeout(function(){
				// 		callback(JSON.parse(response));
				// 	},1);
				// }else{
				// 	setCookie(sessionPrefix+'access-token','',-1);
				// 	setCookie(sessionPrefix+'session-id','',-1);
				// 	window.location.replace('index.html');
				// }
// 			}
// 		});
// 	}else{
// 		setCookie(sessionPrefix+'access-token','',-1);
// 		setCookie(sessionPrefix+'session-id','',-1);
// 		window.location.replace('index.html');
// 	}
// }

function sendFile(url, headers, data, callback){

	var sessionPrefix = '',
		urlDirection = '';
	var partsUrl = url.split('/');
	if(partsUrl[0].indexOf('instalador') >= 0){
		sessionPrefix = 'i-';
		urlDirection = 'instalador';
	}else if(partsUrl[0].indexOf('cliente') >= 0){
		sessionPrefix = 'c-';
		urlDirection = 'cliente';
	}

	var sessionId = getCookie(sessionPrefix+'session-id'),
		refreshToken = getCookie(sessionPrefix+'access-token');

	if(sessionId != null && sessionId > ' ' && refreshToken!= null && refreshToken > ' '){

		headers['Session-id'] = sessionId;
		headers['Access-token'] = refreshToken;

		Request.send({
			method:	'POST',
			parameters: data,
			headers: headers,
			url: BASE_URL + url,
			synchronous: true
		}, function(readyState, status, response){
			if(readyState == 4){
				if(status == 200){
					response = JSON.parse(response);
					if(typeof response['error'] != 'undefined' &&
						(response['error'] == 591 || response['error'] == 592 )){
						var clientId = getCookie(sessionPrefix+'client-id'),
							refreshToken = getCookie(sessionPrefix+'refresh-token');
						if(clientId != null && clientId > ' '
						&& refreshToken!= null && refreshToken > ' '){
							Request.send({
								method:	'POST',
								parameters: {
									clientId : clientId,
									refreshToken: refreshToken
								},
								headers: {
									'Content-Type': 'application/json;charset=UTF-8'
								},
								url: BASE_URL + urlDirection + '/api/refresh-login',
								synchronous: true
							}, function(readyState, status, response){
								if(readyState == 4){
									if (status == 200) {
										response = JSON.parse(response);
										if(response['error'] == 0){
											setCookie(sessionPrefix+'access-token',response['accessToken'],999);
											setCookie(sessionPrefix+'session-id',response['sessionId'],999);
											headers['Session-id'] = response['sessionId'];
											headers['Access-token'] = response['accessToken'];
											Request.send({
												method:	'POST',
												parameters: data,
												headers: headers,
												url: BASE_URL + url,
												synchronous: true
											}, function(readyState, status, response){
												if(readyState == 4){
													if (status == 200) {
														response = JSON.parse(response);
														if(typeof response['error'] != 'undefined' &&
															(response['error'] == 591 || response['error'] == 592 )){
																setCookie(sessionPrefix+'access-token','',-1);
																setCookie(sessionPrefix+'session-id','',-1);
																setCookie(sessionPrefix+'client-id','', -1);
																setCookie(sessionPrefix+'refresh-token','', -1);
																window.location.replace('index.html');
														}else{
															setTimeout(function(){
																callback(response);
															},1);
														}
													}else{
														setCookie(sessionPrefix+'access-token','',-1);
														setCookie(sessionPrefix+'session-id','',-1);
														window.location.replace('index.html');
													}
												}
											});
										}else{
											showLoading(false);
											setCookie(sessionPrefix+'access-token','',-1);
											setCookie(sessionPrefix+'session-id','',-1);
											setCookie(sessionPrefix+'client-id','', -1);
											setCookie(sessionPrefix+'refresh-token','', -1);
											window.location.replace('index.html');
										}
									}else{
										setCookie(sessionPrefix+'access-token','',-1);
										setCookie(sessionPrefix+'session-id','',-1);
										window.location.replace('index.html');
									}
								}
							});
						}else{
							setCookie(sessionPrefix+'client-id','',-1);
							setCookie(sessionPrefix+'refresh-token','',-1);
							window.location.replace('index.html');
						}
					}else{
						setTimeout(function(){
							callback(response);
						},1);
					}
				}else{
					setCookie(sessionPrefix+'access-token','',-1);
					setCookie(sessionPrefix+'session-id','',-1);
					window.location.replace('index.html');
				}
			}
		});

	}else{
		setCookie(sessionPrefix+'access-token','',-1);
		setCookie(sessionPrefix+'session-id','',-1);
		window.location.replace('index.html');
	}
}

function logout(service) {
	showLoading(true);
	var sessionPrefix = '';
	if(service == 'instalador'){
		sessionPrefix = 'i-';
	}else if(service == 'cliente'){
		sessionPrefix = 'c-';
	}
	remoteCall(
		service+'/api/logout',
		{},
		function(data){
			if(typeof data['error'] != 'undefined' && data['error'] != 0){
				showMessage('Atenção', data['message']);
				showLoading(false);
			}else{
				setCookie(sessionPrefix+'access-token','',-1);
				setCookie(sessionPrefix+'session-id','',-1);
				showLoading(false);
				window.location.replace('index.html');
			}
		}
	);
}

function CustomPopup() {
	var config = {
			title: '',
			content: '',
			buttons: [],
			showTime: 500,
			timeOut: 0
		},
		isBuilded = false,
		timeOut = null,
		bg = document.createElement('table'),
		bgRow = bg.insertRow(0),
		bgCell = bgRow.insertCell(0),
		popupDiv = document.createElement('div'),
		popupTable = document.createElement('table'),
		popupTableRowTitle = popupTable.insertRow(0),
		popupTableCellTitle = popupTableRowTitle.insertCell(0),
		popupTableRowContent = popupTable.insertRow(1),
		popupTableCellContent = popupTableRowContent.insertCell(0),
		popupTableRowButtons = popupTable.insertRow(2),
		popupTableCellButtons = popupTableRowButtons.insertCell(0),
		popupTableRowLoading = popupTable.insertRow(3),
		popupTableCellLoading = popupTableRowLoading.insertCell(0),
		popupTableCellLoadingBar = document.createElement('div'),
		coreCallBack = function(isCancel, object) {
			callBack(isCancel, object);
			clearTimeout(timeOut);
			timeOut = null;
			hidePopup();
		},
		callBack;

	this.setup = function(options) {
		refresh(options);
		return this;
	};

	this.show = function() {
		if (config.timeOut > 0) {
			popupTableCellLoading.style.display = 'table-cell';
			popupTableCellLoadingBar.style.width = '100%';
			timeOut = setTimeout(function() {
				coreCallBack(false, 'DEFAULT');
			}, config.timeOut);
		} else {
			popupTableCellLoading.style.display = 'none';
		}
		bg.style.display = 'table';
		bg.style.opacity = 1;
	};

	function hidePopup() {
		bg.style.display = 'none';
	}

	function build() {

		bg.className = 'NES_COMPONENT_POPUP_BG';
		bgCell.align = 'center';
		bgCell.valign = 'middle';
		bgCell.appendChild(popupDiv);
		popupDiv.className = 'NES_COMPONENT_POPUP';
		popupDiv.appendChild(popupTable);
		popupTable.className = 'NES_COMPONENT_POPUP_CONTENT';
		popupTableCellTitle.className = 'NES_COMPONENT_POPUP_TITLE';
		popupTableCellContent.className = 'NES_COMPONENT_POPUP_CONTAINER';
		popupTableCellButtons.className = 'NES_COMPONENT_POPUP_BUTTONS';
		popupTableCellLoading.className = 'NES_COMPONENT_POPUP_LOADING';
		popupTableCellLoading.height = 5;
		popupTableCellLoadingBar.className = 'NES_COMPONENT_POPUP_LOADING_BAR';

		popupTableCellLoading.appendChild(popupTableCellLoadingBar);

		appendInRoot(bg, 'body');

		isBuilded = true;
	}

	function refresh(options) {
		if (!isBuilded) build();

		if (options.title > ' ') config.title = options.title;
		config.timeOut = (
			typeof options.timeOut != 'undefined' ?
			parseInt(options.timeOut) : 0
		);
		if (options.content > ' ')
			config.content = options.content;
		if (options.showTime > 0)
			config.showTime = options.showTime;
		if (typeof options.callback == 'function')
			callBack = options.callback;
		config.buttons = [];
		config.buttons = options.buttons;

		popupTableCellTitle.innerHTML = config.title;
		popupTableCellContent.innerHTML = config.content;
		popupTableCellButtons.innerHTML = '';
		for (var i = 0; i < config.buttons.length; i++) {
			buildButton(config.buttons[i].label,
				config.buttons[i].type,
				config.buttons[i].callback);
		}
	}

	function buildButton(label, type, callback) {
		var button = document.createElement('button');
		button.className 			= 'NES_COMPONENT_POPUP_BUTTON NE_CURSOR ';
		switch (type) {
			case 'accept':
				button.className += 'NES_COMPONENT_POPUP_BUTTON_ACCEPT';
				break;
			case 'reject':
				button.className += 'NES_COMPONENT_POPUP_BUTTON_REJECT';
				break;
			default:
				button.className += 'NES_COMPONENT_POPUP_BUTTON_NORMAL';
		}
		button.innerHTML = label;
		button.onclick = function() {
			var isCancel = (type == 'reject');
			coreCallBack(isCancel, label);
		};
		popupTableCellButtons.appendChild(button);
	}

	function appendInRoot(element, target) {
		if (typeof document.getElementsByTagName(target)[0] == 'object') {
			document.getElementsByTagName(target)[0].appendChild(element);
		} else {
			document[target].appendChild(element);
		}
	}

}

CustomPopup.instance = null;
CustomPopup.getInstance = function() {
	if (this.instance == null) this.instance = new CustomPopup();
	return this.instance;
};

CustomPopup.show = function() {
	this.getInstance().show();

};

CustomPopup.setup = function(options) {
	return this.getInstance().setup(options);

};

function showMessage(title, message){
	CustomPopup.setup({
		title: title,
		content: message,
		buttons: [{
			label: 'Ok'
		}],
		showTime: 250,
		callback: function(isCancel, object) { return false; }
	});
	CustomPopup.show();
}

function SUB_bindAction(parentReference, iconReference){
	var parentReference = parentReference,
		iconReference = iconReference;
	return function(){
		var elems = parentReference.getElementsByClassName('NE_COLLAPSIBLE_VIEWPORT');
		if(elems.length > 0){
			var viewport = elems[0],
				content = viewport.getElementsByClassName('NE_COLLAPSIBLE_CONTENT');
			if(content.length > 0){
				content = content[0];
				if(viewport.clientHeight == 0){
					viewport.style.height = content.clientHeight + 'px';
					if(iconReference != null){
						iconReference.innerHTML = '&#xf106;';
					}
				}else{
					viewport.style.height = 0;
					if(iconReference != null){
						iconReference.innerHTML = '&#xf107;';
					}
				}
			}
		}
	};
}

function toggleCollapsible(){
	var comps = document.getElementsByClassName('NE_COLLAPSIBLE_VIEW');
	for(var i = 0; i < comps.length ; i++){
		var clickComp = comps[i].getElementsByClassName('NE_COLLAPSIBLE_CLICK'),
			iconComp = comps[i].getElementsByClassName('NE_COLLAPSIBLE_ICON');
		if(clickComp.length > 0){
			clickComp = clickComp[0];
			if(iconComp.length > 0) iconComp = iconComp[0];
			else iconComp = null;
			var elems = comps[i].getElementsByClassName('NE_COLLAPSIBLE_VIEWPORT');
			if(elems.length > 0){
				var viewport = elems[0],
					content = viewport.getElementsByClassName('NE_COLLAPSIBLE_CONTENT');
				if(content.length > 0){
					content = content[0];
					if(viewport.clientHeight == 0){
						viewport.style.height = content.clientHeight + 'px';
						if(iconComp != null){
							iconComp.innerHTML = '&#xf106;';
						}
					}else{
						viewport.style.height = 0;
						if(iconComp != null){
							iconComp.innerHTML = '&#xf107;';
						}
					}
				}
			}
		}
	}
}



function SUB_setCollapsibles(){
	var comps = document.getElementsByClassName('NE_COLLAPSIBLE_VIEW');
	for(var i = 0; i < comps.length ; i++){
		var clickComp = comps[i].getElementsByClassName('NE_COLLAPSIBLE_CLICK'),
			iconComp = comps[i].getElementsByClassName('NE_COLLAPSIBLE_ICON');
		if(clickComp.length > 0){
			clickComp = clickComp[0];
			if(iconComp.length > 0) iconComp = iconComp[0];
			else iconComp = null;
			clickComp.onclick = SUB_bindAction(comps[i], iconComp);
		}
	}
}

function SUB_parseMonetaryValues(VAR_number, VAR_decimals){
	if (typeof VAR_number == 'undefined' || VAR_number == null) {
		return '';
	}
	var VAR_parsed = VAR_number.toString().split('.'),
	  VAR_buffer = '',
	  VAR_decimal = '',
	  VAR_total = VAR_parsed[0].length;
	if(VAR_total > 0) while(VAR_total != 0){
		if(VAR_total % 3 == 0 && VAR_buffer > ' '){
			VAR_buffer += '.';
		}
		VAR_buffer += VAR_parsed[0].substring(0, 1);
		VAR_parsed[0] = VAR_parsed[0].substring(VAR_total, 1);
		VAR_total--;
	}
	if(VAR_parsed.length > 1){
		var l = VAR_parsed[1].length;
		VAR_decimal = ',' +VAR_parsed[1].substring(0, (l > VAR_decimals ? VAR_decimals : l));
		VAR_decimals++;
		while(VAR_decimal.length < VAR_decimals) VAR_decimal += '0';
		VAR_buffer += VAR_decimal;
	}else{
		while(VAR_decimal.length < VAR_decimals) VAR_decimal += '0';
		VAR_buffer += ',' + VAR_decimal;
	}
		return VAR_buffer;
}

function generateScore(font, size, icon, score) {
	var top = '5.4px';
	if (size !== '10px') {
		top = '8px';
	}
	var VAR_html = '';
	if (typeof score == 'undefined' || score == null) {
		return VAR_html;
	}
	var VAR_value = score.toString().split(".");
	VAR_value[0] = parseInt(VAR_value[0]);
	VAR_value[1] = parseInt(VAR_value[1]);
	if(VAR_value[0] > 0){
		for(var k = 0; k < VAR_value[0]; k++){
			VAR_html +=
				'	<td style="padding: 0;position: relative;">'+
				'		<span style="font-family: \''+font+'\';font-size: '+size+';" class="'+icon.first[1]+'">'+icon.first[0]+'</span>'+
				'	</td>'
			;
		}
	}
	if(VAR_value[1] > 0){
		VAR_html +=
				'<td style="padding: 0;position: relative;">'+
				'	<span style="font-family: \''+font+'\';font-size: '+size+';" class="'+icon.last[1]+'">'+icon.last[0]+'</span>'+
				'	<span style="position: absolute;font-family: \''+font+'\';font-size: '+size+';left: 0;top: '+top+';" class="'+icon.middle[1]+'">'+icon.middle[0]+'</span>'+
				'</td>'
		;
		VAR_value[0]++;
	}
	for (var j = 0; j < ( 5 - VAR_value[0] ); j++) {
		VAR_html +=
			'	<td style="padding: 0;position: relative;">'+
			'		<span style="font-family: \''+font+'\';font-size: '+size+';" class="'+icon.last[1]+'">'+icon.last[0]+'</span>'+
			'	</td>'
		;
	}
	return VAR_html;
};

function getOrcamentoStatus(status) {
	switch (status) {
		case '0A':
			return 'Confirmação pendente';
			break;
		case '1A':
			return 'Orçamento pendente';
			break;
		case '1B':
			return 'Envio pendente';
			break;
		case '2A':
			return 'Aguardando aprovação';
			break;
		case '9X':
			return 'Orçamento perdido';
			break;
		case '9D':
			return 'Orçamento rejeitado';
			break;
		case '9A':
			return 'Orçamento ganho';
			break;
	}
}

function getProjetoStatus(status) {
	switch (status) {
		case '2A':
			return 'Aguardando orçamento';
			break;
		case '3A':
			return 'Fotos pendentes';
			break;
		case '3B':
			return 'Aprovando fotos';
			break;
		case '3C':
		case '3D':
			return 'Fotos recusadas';
			break;
		case '4A':
			return 'Aguardando agendamento';
			break;
		case '4B':
			return 'Ligação agendada';
			break;
		case '4D':
			return 'Ligação rejeitada';
			break;
		case '5A':
			return 'Avaliando instalador';
			break;
		case '9A':
		case '9X':
			return 'Projeto finalizado';
			break;
	}
}

function getActionLabel(code){
	switch(code){
		case 'QuotationReceived': return 'Cotação Recebida';
		case 'PhotoPending': return 'Foto Pendente';
		case 'GasOnPending': return 'Ligação Pendente';
		case 'PhotoReproved': return 'Foto Reprovada';
		case 'EvaluationPending': return 'Qualificação Pendente';
		case 'QuotationPending': return 'Aguardando Cotação';
		case 'QuotationChanged': return 'Cotação Alterada';
		case 'QuotationApproved': return 'Cotação Aprovada';
		case 'PhotoAprovalPending': return 'Aprovação de Foto Pentende';
		case 'GasOnReproved': return 'Ligação Reprovada';
	}
}

function toDateTime(VAR_data){
	if (typeof VAR_data == 'string') {
		VAR_data = new Date(VAR_data + ' GMT');
	}
	return  sSize(VAR_data.getDate()) + '/' + sSize((VAR_data.getMonth()+1)) + '/' + VAR_data.getFullYear() + ' ' + sSize(VAR_data.getHours()) + ':' + sSize(VAR_data.getMinutes());
}

function sSize(VAR_text){
	return (VAR_text < 10 ? '0' + VAR_text : VAR_text)
}
