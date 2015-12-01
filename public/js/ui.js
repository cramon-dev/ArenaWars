$(document).ready(function() {
	$('.mainMenu').hide();
	$('.gameLobby').hide();

	window.showMenu = function() {
		$('.mainMenu').show();
	};

	window.hideMenu = function() {
		$('.mainMenu').hide();
	};

	window.showLobby = function() {
		$('.gameLobby').show();
	};

	window.hideLobby = function() {
		$('.gameLobby').hide();
	};
});