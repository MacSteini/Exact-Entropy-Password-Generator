(function () {
	"use strict";

	var config = window.EEPG_ADMIN || {};
	var supportedLocales = [ "en-GB", "en-US", "de-DE", "fr-FR", "es-ES", "it-IT", "nl-NL" ];
	var defaultLocale = "en-US";
	var palettes = [ "teal", "indigo", "rose", "amber", "forest", "ocean", "violet", "copper", "graphite", "candy" ];
	var paletteSymbols = {
		teal: "◇",
		indigo: "◆",
		rose: "○",
		amber: "◐",
		forest: "◈",
		ocean: "△",
		violet: "⬡",
		copper: "◎",
		graphite: "◒",
		candy: "□"
	};

	var i18n = {
		"en-US": {
			title: "Exact Entropy Password Generator",
			introPrimary: "Creates passwords locally in your browser with <code>crypto.getRandomValues()</code>. Passwords, settings and entropy values are not sent anywhere.",
			introSecondary: "Entropy is calculated from the current length and character groups; every selected group appears at least once. The value applies only while you use the generated password unchanged.",
			randomColorLayout: "Random colour palette",
			switchToLight: "Switch to light mode",
			switchToDark: "Switch to dark mode",
			languageSelectAria: "Choose language",
			settingsRegionLabel: "Password settings",
			lengthLabel: "Length",
			groupsHeading: "Character groups",
			lowerLabel: "Lowercase letters <code>a-z</code>",
			upperLabel: "Uppercase letters <code>A-Z</code>",
			digitsLabel: "Digits <code>0-9</code>",
			symbolsLabel: "ASCII symbols",
			alphabetSizeLabel: "Alphabet size",
			entropyLabel: "Entropy",
			searchSpaceLabel: "Search space",
			passwordLabel: "Password",
			passwordCopyHint: "Click the password field or use the copy button to copy the password.",
			generateButton: "Generate password",
			copyButton: "Copy",
			copiedButton: "Copied",
			bitUnit: "bits",
			errorCrypto: "This browser does not provide crypto.getRandomValues().",
			errorRandomLimit: "Invalid upper bound for random number.",
			errorLength: "Length must be an integer between 1 and 1000.",
			errorGroup: "Select at least one character group.",
			errorTooShort: "Length is too short to include every selected group at least once.",
			errorAttempts: "Too many rejected candidates. Try again, increase the length or select fewer groups.",
			errorClipboard: "The password could not be copied."
		},
		"de-DE": {
			title: "Generator für Passwörter mit exakter Entropie",
			introPrimary: "Erzeugt Passwörter lokal im Browser mit <code>crypto.getRandomValues()</code>. Passwort, Einstellungen und Entropiewerte werden nirgendwohin übertragen.",
			introSecondary: "Die Entropie wird aus aktueller Länge und Zeichengruppen berechnet; jede ausgewählte Gruppe kommt mindestens einmal vor. Der Wert gilt nur, solange du das generierte Passwort unverändert nutzt.",
			randomColorLayout: "Zufällige Farbpalette",
			switchToLight: "Hellen Modus aktivieren",
			switchToDark: "Dunklen Modus aktivieren",
			languageSelectAria: "Sprache auswählen",
			settingsRegionLabel: "Passworteinstellungen",
			lengthLabel: "Länge",
			groupsHeading: "Zeichengruppen",
			lowerLabel: "Kleinbuchstaben <code>a-z</code>",
			upperLabel: "Großbuchstaben <code>A-Z</code>",
			digitsLabel: "Zahlen <code>0-9</code>",
			symbolsLabel: "ASCII-Sonderzeichen",
			alphabetSizeLabel: "Alphabetgröße",
			entropyLabel: "Entropie",
			searchSpaceLabel: "Suchraum",
			passwordLabel: "Passwort",
			passwordCopyHint: "Klicke in das Passwortfeld oder nutze die Kopieren-Schaltfläche, um das Passwort zu kopieren.",
			generateButton: "Passwort generieren",
			copyButton: "Kopieren",
			copiedButton: "Kopiert",
			bitUnit: "Bit",
			errorCrypto: "Dieser Browser stellt crypto.getRandomValues() nicht bereit.",
			errorRandomLimit: "Ungültige Obergrenze für Zufallszahl.",
			errorLength: "Die Länge muss eine ganze Zahl zwischen 1 und 1000 sein.",
			errorGroup: "Wähle mindestens eine Zeichengruppe aus.",
			errorTooShort: "Die Länge ist zu kurz, um jede ausgewählte Gruppe mindestens einmal zu enthalten.",
			errorAttempts: "Zu viele Kandidaten verworfen. Versuche es erneut, erhöhe die Länge oder wähle weniger Gruppen.",
			errorClipboard: "Das Passwort konnte nicht kopiert werden."
		}
	};

	i18n["en-GB"] = Object.assign( {}, i18n["en-US"], { languageSelectAria: "Choose language" } );
	i18n["fr-FR"] = Object.assign( {}, i18n["en-US"], {
		title: "Générateur de mots de passe à entropie exacte",
		introPrimary: "Génère des mots de passe localement dans le navigateur avec <code>crypto.getRandomValues()</code>. Le mot de passe, les réglages et les valeurs d’entropie ne sont envoyés nulle part.",
		introSecondary: "L’entropie est calculée à partir de la longueur actuelle et des groupes de caractères ; chaque groupe sélectionné apparaît au moins une fois. La valeur reste valable uniquement si le mot de passe généré est utilisé tel quel.",
		languageSelectAria: "Choisir la langue",
		lengthLabel: "Longueur",
		groupsHeading: "Groupes de caractères",
		lowerLabel: "Minuscules <code>a-z</code>",
		upperLabel: "Majuscules <code>A-Z</code>",
		digitsLabel: "Chiffres <code>0-9</code>",
		symbolsLabel: "Symboles ASCII",
		generateButton: "Générer le mot de passe",
		copyButton: "Copier",
		copiedButton: "Copié",
		passwordLabel: "Mot de passe",
		passwordCopyHint: "Cliquez dans le champ du mot de passe ou utilisez le bouton Copier pour copier le mot de passe.",
		alphabetSizeLabel: "Taille de l’alphabet",
		entropyLabel: "Entropie",
		searchSpaceLabel: "Espace de recherche",
		errorGroup: "Sélectionnez au moins un groupe de caractères.",
		errorClipboard: "Impossible de copier le mot de passe."
	} );
	i18n["es-ES"] = Object.assign( {}, i18n["en-US"], {
		title: "Generador de contraseñas con entropía exacta",
		introPrimary: "Genera contraseñas localmente en el navegador con <code>crypto.getRandomValues()</code>. La contraseña, la configuración y los valores de entropía no se envían a ningún sitio.",
		introSecondary: "La entropía se calcula a partir de la longitud actual y de los grupos de caracteres; cada grupo seleccionado aparece al menos una vez. El valor solo es válido mientras uses la contraseña generada sin modificarla.",
		languageSelectAria: "Elegir idioma",
		lengthLabel: "Longitud",
		groupsHeading: "Grupos de caracteres",
		lowerLabel: "Minúsculas <code>a-z</code>",
		upperLabel: "Mayúsculas <code>A-Z</code>",
		digitsLabel: "Dígitos <code>0-9</code>",
		symbolsLabel: "Símbolos ASCII",
		generateButton: "Generar contraseña",
		copyButton: "Copiar",
		copiedButton: "Copiado",
		passwordLabel: "Contraseña",
		passwordCopyHint: "Haz clic en el campo de contraseña o usa el botón Copiar para copiar la contraseña.",
		alphabetSizeLabel: "Tamaño del alfabeto",
		entropyLabel: "Entropía",
		searchSpaceLabel: "Espacio de búsqueda",
		errorGroup: "Selecciona al menos un grupo de caracteres.",
		errorClipboard: "No se ha podido copiar la contraseña."
	} );
	i18n["it-IT"] = Object.assign( {}, i18n["en-US"], {
		title: "Generatore di password a entropia esatta",
		introPrimary: "Genera password localmente nel browser con <code>crypto.getRandomValues()</code>. Password, impostazioni e valori di entropia non vengono inviati da nessuna parte.",
		introSecondary: "L’entropia viene calcolata in base alla lunghezza attuale e ai gruppi di caratteri; ogni gruppo selezionato compare almeno una volta. Il valore resta valido solo se usi la password generata senza modificarla.",
		languageSelectAria: "Scegli la lingua",
		lengthLabel: "Lunghezza",
		groupsHeading: "Gruppi di caratteri",
		lowerLabel: "Minuscole <code>a-z</code>",
		upperLabel: "Maiuscole <code>A-Z</code>",
		digitsLabel: "Cifre <code>0-9</code>",
		symbolsLabel: "Simboli ASCII",
		generateButton: "Genera password",
		copyButton: "Copia",
		copiedButton: "Copiato",
		passwordLabel: "Password",
		passwordCopyHint: "Fai clic nel campo della password o usa il pulsante Copia per copiare la password.",
		alphabetSizeLabel: "Dimensione dell'alfabeto",
		entropyLabel: "Entropia",
		searchSpaceLabel: "Spazio di ricerca",
		bitUnit: "bit",
		errorGroup: "Seleziona almeno un gruppo di caratteri.",
		errorClipboard: "Impossibile copiare la password."
	} );
	i18n["nl-NL"] = Object.assign( {}, i18n["en-US"], {
		title: "Wachtwoordgenerator met exacte entropie",
		introPrimary: "Genereert wachtwoorden lokaal in je browser met <code>crypto.getRandomValues()</code>. Wachtwoord, instellingen en entropiewaarden worden nergens naartoe verzonden.",
		introSecondary: "De entropie wordt berekend op basis van de huidige lengte en tekengroepen; elke geselecteerde groep komt minstens één keer voor. De waarde geldt alleen zolang je het gegenereerde wachtwoord ongewijzigd gebruikt.",
		languageSelectAria: "Taal kiezen",
		lengthLabel: "Lengte",
		groupsHeading: "Tekengroepen",
		lowerLabel: "Kleine letters <code>a-z</code>",
		upperLabel: "Hoofdletters <code>A-Z</code>",
		digitsLabel: "Cijfers <code>0-9</code>",
		symbolsLabel: "ASCII-symbolen",
		generateButton: "Wachtwoord genereren",
		copyButton: "Kopiëren",
		copiedButton: "Gekopieerd",
		passwordLabel: "Wachtwoord",
		passwordCopyHint: "Klik in het wachtwoordveld of gebruik de knop Kopiëren om het wachtwoord te kopiëren.",
		alphabetSizeLabel: "Alfabetgrootte",
		entropyLabel: "Entropie",
		searchSpaceLabel: "Zoekruimte",
		errorGroup: "Selecteer minstens één tekengroep.",
		errorClipboard: "Het wachtwoord kon niet worden gekopieerd."
	} );

	var groups = {
		lower: charsFromRange( 0x61, 0x7a ),
		upper: charsFromRange( 0x41, 0x5a ),
		digits: charsFromRange( 0x30, 0x39 ),
		symbols: charsFromRanges( [ [ 0x21, 0x2f ], [ 0x3a, 0x40 ], [ 0x5b, 0x60 ], [ 0x7b, 0x7e ] ] )
	};

	document.addEventListener( "DOMContentLoaded", function () {
		initGeneratorPage();
		initUserPasswordEntropy();
	} );

	function charsFromRange( start, end ) {
		var chars = "";
		for ( var code = start; code <= end; code++ ) {
			chars += String.fromCharCode( code );
		}
		return chars;
	}

	function charsFromRanges( ranges ) {
		return ranges.map( function ( range ) {
			return charsFromRange( range[0], range[1] );
		} ).join( "" );
	}

	function resolveLocale( raw ) {
		var values = Array.isArray( raw ) ? raw : [ raw ];
		for ( var i = 0; i < values.length; i++ ) {
			if ( ! values[i] ) {
				continue;
			}
			var canonical = String( values[i] ).replace( "_", "-" );
			if ( supportedLocales.indexOf( canonical ) !== -1 ) {
				return canonical;
			}
			var base = canonical.split( "-" )[0];
			if ( base === "de" ) {
				return "de-DE";
			}
			if ( base === "fr" ) {
				return "fr-FR";
			}
			if ( base === "es" ) {
				return "es-ES";
			}
			if ( base === "it" ) {
				return "it-IT";
			}
			if ( base === "nl" ) {
				return "nl-NL";
			}
			if ( base === "en" ) {
				return "en-US";
			}
		}
		return defaultLocale;
	}

	function initGeneratorPage() {
		var app = document.getElementById( "eepg-generator-app" );
		if ( ! app ) {
			return;
		}

		var state = {
			locale: resolveLocale( navigator.languages || navigator.language || defaultLocale ),
			theme: "light",
			palette: "teal",
			copyTimer: 0
		};
		var elements = {
			length: app.querySelector( "#length" ),
			password: app.querySelector( "#password" ),
			error: app.querySelector( "#error" ),
			alphabetSize: app.querySelector( "#alphabetSize" ),
			entropyBits: app.querySelector( "#entropyBits" ),
			searchSpace: app.querySelector( "#searchSpace" ),
			paletteToggle: app.querySelector( "#paletteToggle" ),
			themeToggle: app.querySelector( "#themeToggle" ),
			languageSelect: app.querySelector( "#languageSelect" ),
			generate: app.querySelector( "#generate" ),
			copy: app.querySelector( "#copy" )
		};

		elements.languageSelect.value = state.locale;
		translateApp( app, state.locale );
		applyPalette( app, elements, state.palette );
		applyTheme( app, elements, state.theme, state.locale );
		renderDetailsOnly( elements, state.locale );
		generateAndRender( elements, state.locale );

		elements.generate.addEventListener( "click", function () {
			generateAndRender( elements, state.locale );
		} );
		elements.copy.addEventListener( "click", function () {
			copyPassword( elements, state );
		} );
		elements.password.addEventListener( "click", function () {
			copyPassword( elements, state );
		} );
		elements.length.addEventListener( "input", function () {
			renderDetailsOnly( elements, state.locale );
		} );
		[ "lower", "upper", "digits", "symbols" ].forEach( function ( id ) {
			var checkbox = app.querySelector( "#" + id );
			if ( checkbox ) {
				checkbox.addEventListener( "change", function () {
					renderDetailsOnly( elements, state.locale );
				} );
			}
		} );
		elements.paletteToggle.addEventListener( "click", function () {
			var candidates = palettes.filter( function ( palette ) {
				return palette !== state.palette;
			} );
			state.palette = candidates[Math.floor( Math.random() * candidates.length )] || "teal";
			applyPalette( app, elements, state.palette );
		} );
		elements.themeToggle.addEventListener( "click", function () {
			state.theme = state.theme === "dark" ? "light" : "dark";
			applyTheme( app, elements, state.theme, state.locale );
		} );
		elements.languageSelect.addEventListener( "change", function () {
			state.locale = supportedLocales.indexOf( elements.languageSelect.value ) !== -1 ? elements.languageSelect.value : defaultLocale;
			translateApp( app, state.locale );
			applyTheme( app, elements, state.theme, state.locale );
			renderDetailsOnly( elements, state.locale );
		} );
	}

	function t( locale, key ) {
		var text = i18n[locale] || i18n[defaultLocale];
		return text[key] || i18n[defaultLocale][key] || key;
	}

	function translateApp( app, locale ) {
		app.querySelectorAll( "[data-i18n]" ).forEach( function ( element ) {
			element.textContent = t( locale, element.getAttribute( "data-i18n" ) );
		} );
		app.querySelectorAll( "[data-i18n-html]" ).forEach( function ( element ) {
			element.innerHTML = t( locale, element.getAttribute( "data-i18n-html" ) );
		} );
		app.querySelectorAll( "[data-i18n-aria]" ).forEach( function ( element ) {
			element.setAttribute( "aria-label", t( locale, element.getAttribute( "data-i18n-aria" ) ) );
		} );
	}

	function applyPalette( app, elements, palette ) {
		app.setAttribute( "data-palette", palette );
		elements.paletteToggle.textContent = paletteSymbols[palette] || paletteSymbols.teal;
	}

	function applyTheme( app, elements, theme, locale ) {
		app.setAttribute( "data-theme", theme );
		elements.themeToggle.textContent = theme === "dark" ? "☀" : "☾";
		elements.themeToggle.setAttribute( "aria-label", t( locale, theme === "dark" ? "switchToLight" : "switchToDark" ) );
	}

	function selectedGroups() {
		return [ "lower", "upper", "digits", "symbols" ].filter( function ( id ) {
			var input = document.getElementById( id );
			return input && input.checked;
		} ).map( function ( id ) {
			return { id: id, chars: groups[id] };
		} );
	}

	function readSettings( elements, locale, reportErrors ) {
		var length = Number( elements.length.value );
		var activeGroups = selectedGroups();
		if ( ! Number.isInteger( length ) || length < 1 || length > 1000 ) {
			if ( reportErrors ) {
				throw new Error( t( locale, "errorLength" ) );
			}
			return null;
		}
		if ( activeGroups.length === 0 ) {
			if ( reportErrors ) {
				throw new Error( t( locale, "errorGroup" ) );
			}
			return null;
		}
		if ( length < activeGroups.length ) {
			if ( reportErrors ) {
				throw new Error( t( locale, "errorTooShort" ) );
			}
			return null;
		}
		var alphabet = activeGroups.map( function ( group ) {
			return group.chars;
		} ).join( "" );
		return {
			length: length,
			groups: activeGroups,
			alphabet: alphabet,
			bits: entropyBits( length, activeGroups.map( function ( group ) {
				return group.chars.length;
			} ) )
		};
	}

	function randomBelow( maxExclusive, locale ) {
		if ( ! Number.isSafeInteger( maxExclusive ) || maxExclusive <= 0 ) {
			throw new Error( t( locale, "errorRandomLimit" ) );
		}
		var maxUint32 = 0x100000000;
		var limit = maxUint32 - ( maxUint32 % maxExclusive );
		var buffer = new Uint32Array( 1 );
		while ( true ) {
			crypto.getRandomValues( buffer );
			if ( buffer[0] < limit ) {
				return buffer[0] % maxExclusive;
			}
		}
	}

	function randomPasswordFromAlphabet( length, alphabet, locale ) {
		var password = "";
		for ( var i = 0; i < length; i++ ) {
			password += alphabet[randomBelow( alphabet.length, locale )];
		}
		return password;
	}

	function containsEveryGroup( password, activeGroups ) {
		return activeGroups.every( function ( group ) {
			return Array.from( password ).some( function ( char ) {
				return group.chars.indexOf( char ) !== -1;
			} );
		} );
	}

	function generatePassword( length, activeGroups, alphabet, locale ) {
		var maxAttempts = 100000;
		for ( var attempt = 0; attempt < maxAttempts; attempt++ ) {
			var candidate = randomPasswordFromAlphabet( length, alphabet, locale );
			if ( containsEveryGroup( candidate, activeGroups ) ) {
				return candidate;
			}
		}
		throw new Error( t( locale, "errorAttempts" ) );
	}

	function entropyBits( length, groupSizes ) {
		return log2ValidPasswordCount( length, groupSizes );
	}

	function log2ValidPasswordCount( length, groupSizes ) {
		var totalAlphabet = groupSizes.reduce( function ( sum, size ) {
			return sum + size;
		}, 0 );
		var positiveTerms = [];
		var negativeTerms = [];
		var subsets = 1 << groupSizes.length;
		for ( var mask = 0; mask < subsets; mask++ ) {
			var removed = 0;
			var bits = 0;
			for ( var i = 0; i < groupSizes.length; i++ ) {
				if ( mask & ( 1 << i ) ) {
					removed += groupSizes[i];
					bits++;
				}
			}
			var remaining = totalAlphabet - removed;
			if ( remaining <= 0 ) {
				continue;
			}
			var logTerm = length * Math.log2( remaining );
			if ( bits % 2 === 0 ) {
				positiveTerms.push( logTerm );
			} else {
				negativeTerms.push( logTerm );
			}
		}
		return log2Subtract( log2Sum( positiveTerms ), log2Sum( negativeTerms ) );
	}

	function log2Sum( logValues ) {
		if ( logValues.length === 0 ) {
			return -Infinity;
		}
		var max = Math.max.apply( Math, logValues );
		var sum = logValues.reduce( function ( acc, value ) {
			return acc + Math.pow( 2, value - max );
		}, 0 );
		return max + Math.log2( sum );
	}

	function log2Subtract( logA, logB ) {
		if ( logB === -Infinity ) {
			return logA;
		}
		if ( logB >= logA ) {
			return -Infinity;
		}
		return logA + Math.log2( 1 - Math.pow( 2, logB - logA ) );
	}

	function formatBits( bits, locale ) {
		if ( ! Number.isFinite( bits ) ) {
			return "-";
		}
		return bits.toLocaleString( locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 } ) + " " + t( locale, "bitUnit" );
	}

	function formatSearchSpace( bits, locale ) {
		var log10 = bits * Math.LOG10E * Math.LN2;
		if ( ! Number.isFinite( log10 ) ) {
			return "-";
		}
		if ( log10 < 6 ) {
			return Math.round( Math.pow( 10, log10 ) ).toLocaleString( locale );
		}
		return "≈ 10^" + log10.toLocaleString( locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 } );
	}

	function renderMetrics( elements, settings, locale ) {
		elements.alphabetSize.textContent = settings.alphabet.length.toLocaleString( locale );
		elements.entropyBits.textContent = formatBits( settings.bits, locale );
		elements.searchSpace.textContent = formatSearchSpace( settings.bits, locale );
	}

	function renderDetailsOnly( elements, locale ) {
		try {
			var settings = readSettings( elements, locale, false );
			if ( settings ) {
				renderMetrics( elements, settings, locale );
			}
		} catch ( error ) {
			// Do not interrupt typing with validation messages.
		}
	}

	function generateAndRender( elements, locale ) {
		elements.error.textContent = "";
		try {
			if ( ! window.crypto || ! window.crypto.getRandomValues ) {
				throw new Error( t( locale, "errorCrypto" ) );
			}
			var settings = readSettings( elements, locale, true );
			var password = generatePassword( settings.length, settings.groups, settings.alphabet, locale );
			elements.password.value = password;
			elements.password.size = Math.min( Math.max( password.length, 1 ), 128 );
			renderMetrics( elements, settings, locale );
		} catch ( error ) {
			elements.error.textContent = error.message;
			elements.password.value = "";
			elements.alphabetSize.textContent = "-";
			elements.entropyBits.textContent = "-";
			elements.searchSpace.textContent = "-";
		}
	}

	function copyPassword( elements, state ) {
		if ( ! elements.password.value ) {
			return;
		}
		var done = function () {
			window.clearTimeout( state.copyTimer );
			elements.copy.textContent = t( state.locale, "copiedButton" );
			state.copyTimer = window.setTimeout( function () {
				elements.copy.textContent = t( state.locale, "copyButton" );
			}, 1600 );
		};
		if ( navigator.clipboard && navigator.clipboard.writeText ) {
			navigator.clipboard.writeText( elements.password.value ).then( done ).catch( function () {
				elements.error.textContent = t( state.locale, "errorClipboard" );
			} );
			return;
		}
		elements.error.textContent = t( state.locale, "errorClipboard" );
	}

	function initUserPasswordEntropy() {
		if ( config.context !== "user-password" ) {
			return;
		}
		var input = document.getElementById( "pass1" );
		if ( ! input || document.getElementById( "eepg-user-password-entropy" ) ) {
			return;
		}
		var target = input.closest( ".password-input-wrapper" ) || input;
		var line = document.createElement( "p" );
		var link = document.createElement( "a" );
		line.id = "eepg-user-password-entropy";
		line.className = "description eepg-user-password-entropy";
		line.setAttribute( "role", "status" );
		line.setAttribute( "aria-live", "polite" );
		line.setAttribute( "aria-atomic", "true" );
		link.href = config.generatorUrl || "admin.php?page=exact-entropy-password-generator";
		link.textContent = "";
		line.appendChild( link );
		target.insertAdjacentElement( "afterend", line );

		var update = function () {
			var password = input.value || "";
			var bits = estimateTypedPasswordEntropy( password );
			var label = ( config.strings && config.strings.entropy ? config.strings.entropy : "Entropy" ) + ": ";
			var unit = config.strings && config.strings.bits ? config.strings.bits : "bits";
			link.textContent = password && Number.isFinite( bits ) ? label + bits.toFixed( 2 ) + " " + unit : label + ( config.strings && config.strings.notAvailable ? config.strings.notAvailable : "not available" );
		};

		input.addEventListener( "input", update );
		if ( window.jQuery ) {
			window.jQuery( input ).on( "pwupdate", update );
		}
		document.addEventListener( "click", function ( event ) {
			if ( event.target && event.target.matches( ".wp-generate-pw, .wp-cancel-pw" ) ) {
				window.setTimeout( update, 0 );
			}
		} );
		update();
	}

	function estimateTypedPasswordEntropy( password ) {
		if ( ! password ) {
			return NaN;
		}
		var groupSizes = [];
		if ( /[a-z]/.test( password ) ) {
			groupSizes.push( 26 );
		}
		if ( /[A-Z]/.test( password ) ) {
			groupSizes.push( 26 );
		}
		if ( /[0-9]/.test( password ) ) {
			groupSizes.push( 10 );
		}
		if ( /[!-\/:-@\[-`{-~]/.test( password ) ) {
			groupSizes.push( 32 );
		}
		var extraChars = Array.from( password ).filter( function ( char ) {
			return ! /[A-Za-z0-9!-\/:-@\[-`{-~]/.test( char );
		} );
		if ( extraChars.length ) {
			groupSizes.push( Array.from( new Set( extraChars ) ).length );
		}
		return groupSizes.length ? entropyBits( Array.from( password ).length, groupSizes ) : NaN;
	}
}());
