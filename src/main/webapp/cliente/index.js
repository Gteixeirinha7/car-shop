function InstaleFacil(){

	var CORE = this;

	this.view = null;
	this.action = null;

  this.showPage = function(page){
		CORE.view = document.getElementById('lContent');
		document.getElementById('lContent').className = 'NE_CONTENT_2COL50 NE_CENTER NE_HOME_SPACE_TOP';
		if(typeof CORE.view != 'undefined'){
			CORE.action = page;
			switch(page){
				case 'select-user':
				document.getElementById('loginCliente').style.display = 'none';
					CORE.view.innerHTML =
			          '<form class="NE_FORM" style="padding: 0 0 20px 0">'+
			            '<input type="button" onclick="location.href=\'login.html\';" style="height: 70px" class="NE_SPACE_BOTTOM  NE_COLOR_SECONDARY NE_MAIN_BUTTON " value="TENHO COMGÁS"/>'+
			            '<input type="button" class="NE_SPACE_BOTTOM  NE_COLOR_SECONDARY  NE_MAIN_BUTTON" style="height: 70px" value="AINDA NÃO TENHO COMGÁS" onclick="location.href=\'https://virtual.comgas.com.br/comgasvirtual/#/comgasvirtual/ortec\'"/>'+
			            '<div class="NE_CENTER"><p class="NE_MAIN_LINK NE_WHITE_TEXT_COLOR NE_CURSOR" onclick="InstaleFacil.getInstance().showPage(\'known-more\');">Quero saber mais</p></div>'+
			          '</form>'
					;
				break;
				case 'known-more':
				document.getElementById('lContent').className = 'NE_CONTENT_2COL50 NE_CENTER NE_HOME_SPACE_TOP';
				document.getElementById('loginCliente').style.display = 'table-cell';
					CORE.view.innerHTML =
						'<form class="NE_FORM" style="padding: 0 0 20px 0">'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING ">'+
						'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'			<h2 class="NE_LIGHT NE_PT10 NE_WHITE_TEXT_COLOR NE_SPACE_BOTTOM">Como Funciona?</h2>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
						'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'			<table cellspading = "0" cellspacing = "0" class="NE_TABLE_FIXED">'+
						'				<tr>'+
						'					<td width = "30px">'+
						'						<img width="35px" height="35px" class="NE_CENTER" src="../images/comoFunciona0.png" />'+
						'					</td>'+
						'					<td width = "70%">'+
						'							<h3 class="NE_LIGHT NE_PT10 NE_PB10 NE_WHITE_TEXT_COLOR">Negocie com o Consultor COMGÁS</h3>'+
						'					</td>'+
						'				</tr>'+
						'				<tr>'+
						'					<td width = "100%" class="NE_CENTER" colspan="2">'+
						'						<img width="15px" height="10px" class="NE_CENTER" src="../images/setaAtivo2.png" />'+
						'					</td>'+
						'				</tr>'+
						'			</table>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
						'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'			<table cellspading = "0" cellspacing = "0" class="NE_TABLE_FIXED">'+
						'				<tr>'+
						'					<td width = "30px">'+
						'						<img width="40px" height="30px" class="NE_CENTER" src="../images/comoFunciona1.png" />'+
						'					</td>'+
						'					<td width = "70%">'+
						'							<h3 class="NE_LIGHT NE_PT10 NE_PB10 NE_WHITE_TEXT_COLOR">Inclua seu projeto na plataforma</h3>'+
						'					</td>'+
						'				</tr>'+
						'				<tr>'+
						'					<td width = "100%" class="NE_CENTER" colspan="2">'+
						'						<img width="15px" height="10px" class="NE_CENTER" src="../images/setaAtivo2.png" />'+
						'					</td>'+
						'				</tr>'+
						'			</table>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
						'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'			<table cellspading = "0" cellspacing = "0" class="NE_TABLE_FIXED">'+
						'				<tr>'+
						'					<td width = "30px">'+
						'						<img width="35px" height="30px" class="NE_CENTER" src="../images/comoFunciona2.png" />'+
						'					</td>'+
						'					<td width = "70%">'+
						'							<h3 class="NE_LIGHT NE_PT10 NE_PB10 NE_WHITE_TEXT_COLOR">Receba até 5 orçamentos</h3>'+
						'					</td>'+
						'				</tr>'+
						'				<tr>'+
						'					<td width = "100%" class="NE_CENTER" colspan="2">'+
						'						<img width="15px" height="10px" class="NE_CENTER" src="../images/setaAtivo2.png" />'+
						'					</td>'+
						'				</tr>'+
						'			</table>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING">'+
						'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING">'+
						'			<table cellspading = "0" cellspacing = "0" class="NE_TABLE_FIXED">'+
						'				<tr>'+
						'					<td width = "30px">'+
						'						<img width="33px" height="25px" class="NE_CENTER" src="../images/faco_a_obra.png" />'+
						'					</td>'+
						'					<td width = "70%">'+
						'							<h3 class="NE_LIGHT NE_PT10 NE_PB10 NE_WHITE_TEXT_COLOR">Feche a obra direto com o Instalador</h3>'+
						'					</td>'+
						'				</tr>'+
						'			</table>'+
						'		</div>'+
						'	</div>'+
						'	<div class="NE_CONTENT_ROW NE_HORIZONTAL_PADDING_10 NE_CLEAR_MOBILE_PADDING NE_SPACE_TOP">'+
						'		<div class="NE_CONTENT_1COL NE_CLEAR_PADDING NE_SPACE_TOP">'+
						'			<table cellspading = "0" cellspacing = "0" class="">'+
						'				<tr>'+
						'					<td width = "110px">'+
						'						<p class="NE_LABEL NE_PT5 NE_WHITE_TEXT_COLOR">Ainda não é cliente?</p>'+
						'					</td>'+
						'					<td width = "90px">'+
						'						<input type="button" style="padding: 5px;border-radius: 3px;" value="Clique aqui" class="NE_BTN_DEFAULT NE_COLOR_QUARTENARY_OUTLINE" onclick="location.href=\'https://virtual.comgas.com.br/comgasvirtual/#/comgasvirtual/ortec\'"  />'+
						'					</td>'+
						'				</tr>'+
						'			</table>'+
						'		</div>'+
						'	</div>'+
						'</form>'
					;
				break;
			}
		}
    };

	this.initialize = function(){
			CORE.showPage('select-user');
			showContent();
			showLoading(false);
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
