$(document).ready(function() {
	var profession;
	var weapon1;
	var weapon2;
	var stats;
	var warriorWeapons = [ 
		'<option value="Greatsword">Greatsword</option>',
		'<option value="Hammer">Hammer</option>',
		'<option value="Longbow">Longbow</option>'
	];
	var assassinWeapons = [
		'<option value="Dagger">Dagger</option>',
		'<option value="Rifle">Rifle</option>',
		'<option value="Staff">Staff</option>'
	];
	var sorcererWeapons = [
		'<option value="Hammer">Hammer</option>',
		'<option value="Staff">Staff</option>'
	];

	$('.mainMenu').hide();
	$('.gameLobby').hide();


	window.showMenu = function() {
		$('.mainMenu').show();
	};

	window.hideMenu = function() {
		$('.mainMenu').hide();
	};

	window.showLobby = function() {
		profession = $('#profSelection').val();
		modifyWeaponSelection();
		$('.gameLobby').show();
	};

	window.hideLobby = function() {
		$('.gameLobby').hide();
	};

	$('#profSelection').change(function() {
		profession = this.value;

		modifyWeaponSelection();
	});

	function modifyWeaponSelection() {
		profession == 'Sorcerer' ? $('#weapon2Selection').hide() : $('#weapon2Selection').show();
		clearWeaponSelections();

		switch(profession) {
            case "Warrior":
            	for(var i in warriorWeapons) {
            		$('#weapon1Selection').append(warriorWeapons[i]);
            		$('#weapon2Selection').append(warriorWeapons[i]);
            	}
                break;

            case "Assassin":
            	for(var i in assassinWeapons) {
            		$('#weapon1Selection').append(assassinWeapons[i]);
            		$('#weapon2Selection').append(assassinWeapons[i]);
            	}
                break;

            case "Sorcerer":
            	for(var i in sorcererWeapons) {
            		$('#weapon1Selection').append(sorcererWeapons[i]);
            		$('#weapon2Selection').hide();
            	}
                break;

            default:
            	console.log('You shouldn\'t have reached this');
            	break;
        }
    }

    function clearWeaponSelections() {
    	$('#weapon1Selection').empty();
    	$('#weapon2Selection').empty();
    }
});