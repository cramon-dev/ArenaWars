$(document).ready(function() {
	var pointsLeft = 120;
	var maxPoints = 90;
	var strength = 0;
	var finesse = 0;
	var vitality = 0;
	var profession;
	var stats;
	var warriorWeapons = [ 
		'<option value="Greatsword">Greatsword</option>',
		'<option value="Hammer">Hammer</option>',
	];
	var assassinWeapons = [
		'<option value="Sword">Sword</option>',
		'<option value="Staff">Staff</option>'
	];
	var sorcererWeapons = [
		'<option value="Hammer">Hammer</option>',
		'<option value="Staff">Staff</option>'
	];

	$('.mainMenu').hide();
	$('.gameLobby').hide();
	$('.gameOverScreen').hide();
	$('.gameUI').hide();


	function sliderChanged(event, ui) {
		// If the user allocated any points
		if(ui.value > 0) {
			switch(event.target.id) {
				case 'strengthSlider':
					// If the user previously modified the strength slider
					if(strength > 0) {
						var dif = ui.value - strength;
						// This is a workaround to an issue where clicking on the slider without even allocating points will attempt to allocate points
						if(dif != 0) {
							var pointsAvailable = (pointsLeft - dif);
							if(pointsAvailable >= 0) {
								strength = ui.value;
								pointsLeft -= dif;
							}
							else {
								$('#strengthSlider').slider('value', strength); // Otherwise, reset the slider to its original value
							}
						}
					}
					else {
						var pointsAvailable = (pointsLeft - ui.value);
						// If there are still points available after the user's selection
						if(pointsAvailable >= 0) {
							strength = ui.value; // Allocate strength points
							pointsLeft -= strength; // Remove points from points left
						}
						else {
							$('#strengthSlider').slider('value', 0); // Otherwise, reset slider to 0
						}
					}
					break;
				case 'finesseSlider':
					if(finesse > 0) {
						var dif = ui.value - finesse;
						if(dif != 0) {
							var pointsAvailable = (pointsLeft - dif);
							if(pointsAvailable >= 0) {
								finesse = ui.value;
								pointsLeft -= dif;
							}
							else {
								$('#finesseSlider').slider('value', finesse);
							}
						}
					}
					else {
						var pointsAvailable = (pointsLeft - ui.value);
						if(pointsAvailable >= 0) {
							finesse = ui.value;
							pointsLeft -= finesse;
						}
						else {
							$('#finesseSlider').slider('value', 0);
						}
					}
					break;
				case 'vitalitySlider':
					if(vitality > 0) {
						var dif = ui.value - vitality;
						if(dif != 0) {
							var pointsAvailable = (pointsLeft - dif);
							if(pointsAvailable >= 0) {
								vitality = ui.value;
								pointsLeft -= dif;
							}
							else {
								$('#vitalitySlider').slider('value', vitality);
							}
						}
					}
					else {
						var pointsAvailable = (pointsLeft - ui.value);
						if(pointsAvailable >= 0) {
							vitality = ui.value;
							pointsLeft -= vitality;
						}
						else {
							$('#vitalitySlider').slider('value', 0);
						}
					}
					break;
				default:
					break;
			}
		}
		$('#pointsLeft').text(pointsLeft);
		$('#strengthPoints').text(strength);
		$('#finessePoints').text(finesse);
		$('#vitalityPoints').text(vitality);
	}


	window.showMenu = function() {
		$('.mainMenu').show();
		hideGameOver();
	};

	window.hideMenu = function() {
		$('.mainMenu').hide();
	};

	window.showLobby = function() {
		$('#pointsLeft').text(pointsLeft - (strength + finesse + vitality));
		profession = $('#profSelection').val();
		modifyWeaponSelection();
		$('#strengthSlider').slider({ min: 0, max: maxPoints, step: 5, change: sliderChanged });
		$('#finesseSlider').slider({ min: 0, max: maxPoints, step: 5, change: sliderChanged });
		$('#vitalitySlider').slider({ min: 0, max: maxPoints, step: 5, change: sliderChanged });
		$('.gameLobby').show();
	};

	window.hideLobby = function() {
		$('.gameLobby').hide();
	};

	window.showGameUI = function() {
		$('.gameUI').show();
	};

	window.hideGameUI = function() {
		$('.gameUI').hide();
	};

	window.showGameOver = function(winnerName) {
		$('#gameContainer').empty();
		$('#winnerUsername').text('Winner: ' + winnerName);
		$('.gameOverScreen').show();
	};

	window.hideGameOver = function() {
		$('.gameOverScreen').hide();
	};

	window.updateHealth = function(player1, player2) {
		var p1Health = ((player1.health / player1.maxHealth) * 100);
	    $('#healthBar').css('width', p1Health + '%').attr('aria-valuenow', p1Health);
	    $('#healthBar').text(player1.health + ' / ' + player1.maxHealth);

	    var p2Health = ((player2.health / player2.maxHealth) * 100);
	    $('#enemyHealthBar').css('width', p2Health + '%').attr('aria-valuenow', p2Health);
	};

	$('#profSelection').change(function() {
		profession = this.value;

		modifyWeaponSelection();
	});

	function modifyWeaponSelection() {
		// profession == 'Sorcerer' ? $('#weapon2Selection').hide() : $('#weapon2Selection').show();
		clearWeaponSelections();

		switch(profession) {
            case "Warrior":
            	for(var i in warriorWeapons) {
            		$('#weapon1Selection').append(warriorWeapons[i]);
            		// $('#weapon2Selection').append(warriorWeapons[i]);
            	}
                break;

            case "Assassin":
            	for(var i in assassinWeapons) {
            		$('#weapon1Selection').append(assassinWeapons[i]);
            		// $('#weapon2Selection').append(assassinWeapons[i]);
            	}
                break;

            case "Sorcerer":
            	for(var i in sorcererWeapons) {
            		$('#weapon1Selection').append(sorcererWeapons[i]);
            		// $('#weapon2Selection').hide();
            	}
                break;

            default:
            	console.log('You shouldn\'t have reached this');
            	break;
        }
    }

    function clearWeaponSelections() {
    	$('#weapon1Selection').empty();
    	// $('#weapon2Selection').empty();
    }
});

// Old finesse slider code that could be adapted to strength/vitality
// finesse = ui.value;
// if(ui.value < finesse) {
// 	var dif = finesse - ui.value;
// 	console.log(dif);
// 	pointsLeft += dif;
// }
// v2
// if(pointsLeft > 0) {
// 	if(finesse > 0) {
// 		var dif = ui.value - finesse;
// 		if(dif != 0) {
// 			finesse = ui.value;
// 			pointsLeft -= dif;
// 		}
		
// 		// pointsLeft -= dif;
// 	}
// 	else {
// 		finesse = ui.value;
// 		pointsLeft -= finesse;
// 	}
// }