(function () {
	"use strict";

	var config = window.EEPG_ADMIN || {};
	var strings = config.strings || {};
	var locale = config.locale || document.documentElement.lang || navigator.language || "en-US";
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

	function text( key, fallback ) {
		return strings[key] || fallback;
	}

	function initGeneratorPage() {
		var app = document.getElementById( "eepg-generator-app" );
		if ( ! app ) {
			return;
		}

		var state = {
			copyTimer: 0
		};
		var elements = {
			length: app.querySelector( "#length" ),
			password: app.querySelector( "#password" ),
			error: app.querySelector( "#error" ),
			alphabetSize: app.querySelector( "#alphabetSize" ),
			entropyBits: app.querySelector( "#entropyBits" ),
			searchSpace: app.querySelector( "#searchSpace" ),
			generate: app.querySelector( "#generate" ),
			copy: app.querySelector( "#copy" )
		};

		renderDetailsOnly( elements );
		generateAndRender( elements );

		elements.generate.addEventListener( "click", function () {
			generateAndRender( elements );
		} );
		elements.copy.addEventListener( "click", function () {
			copyPassword( elements, state );
		} );
		elements.password.addEventListener( "click", function () {
			copyPassword( elements, state );
		} );
		elements.length.addEventListener( "input", function () {
			renderDetailsOnly( elements );
		} );
		[ "lower", "upper", "digits", "symbols" ].forEach( function ( id ) {
			var checkbox = app.querySelector( "#" + id );
			if ( checkbox ) {
				checkbox.addEventListener( "change", function () {
					renderDetailsOnly( elements );
				} );
			}
		} );
	}

	function selectedGroups() {
		return [ "lower", "upper", "digits", "symbols" ].filter( function ( id ) {
			var input = document.getElementById( id );
			return input && input.checked;
		} ).map( function ( id ) {
			return { id: id, chars: groups[id] };
		} );
	}

	function readSettings( elements, reportErrors ) {
		var length = Number( elements.length.value );
		var activeGroups = selectedGroups();
		if ( ! Number.isInteger( length ) || length < 1 || length > 1000 ) {
			if ( reportErrors ) {
				throw new Error( text( "errorLength", "Length must be an integer between 1 and 1000." ) );
			}
			return null;
		}
		if ( activeGroups.length === 0 ) {
			if ( reportErrors ) {
				throw new Error( text( "errorGroup", "Select at least one character group." ) );
			}
			return null;
		}
		if ( length < activeGroups.length ) {
			if ( reportErrors ) {
				throw new Error( text( "errorTooShort", "Length is too short to include every selected group at least once." ) );
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

	function randomBelow( maxExclusive ) {
		if ( ! Number.isSafeInteger( maxExclusive ) || maxExclusive <= 0 ) {
			throw new Error( text( "errorRandomLimit", "Invalid upper bound for random number." ) );
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

	function randomPasswordFromAlphabet( length, alphabet ) {
		var password = "";
		for ( var i = 0; i < length; i++ ) {
			password += alphabet[randomBelow( alphabet.length )];
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

	function generatePassword( length, activeGroups, alphabet ) {
		var maxAttempts = 100000;
		for ( var attempt = 0; attempt < maxAttempts; attempt++ ) {
			var candidate = randomPasswordFromAlphabet( length, alphabet );
			if ( containsEveryGroup( candidate, activeGroups ) ) {
				return candidate;
			}
		}
		throw new Error( text( "errorAttempts", "Too many rejected candidates. Try again, increase the length or select fewer groups." ) );
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

	function formatBits( bits ) {
		if ( ! Number.isFinite( bits ) ) {
			return "-";
		}
		return bits.toLocaleString( locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 } ) + " " + text( "bitUnit", "bits" );
	}

	function formatSearchSpace( bits ) {
		var log10 = bits * Math.LOG10E * Math.LN2;
		if ( ! Number.isFinite( log10 ) ) {
			return "-";
		}
		if ( log10 < 6 ) {
			return Math.round( Math.pow( 10, log10 ) ).toLocaleString( locale );
		}
		return "≈ 10^" + log10.toLocaleString( locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 } );
	}

	function renderMetrics( elements, settings ) {
		elements.alphabetSize.textContent = settings.alphabet.length.toLocaleString( locale );
		elements.entropyBits.textContent = formatBits( settings.bits );
		elements.searchSpace.textContent = formatSearchSpace( settings.bits );
	}

	function renderDetailsOnly( elements ) {
		try {
			var settings = readSettings( elements, false );
			if ( settings ) {
				renderMetrics( elements, settings );
			}
		} catch ( error ) {
			// Do not interrupt typing with validation messages.
		}
	}

	function generateAndRender( elements ) {
		elements.error.textContent = "";
		try {
			if ( ! window.crypto || ! window.crypto.getRandomValues ) {
				throw new Error( text( "errorCrypto", "This browser does not provide crypto.getRandomValues()." ) );
			}
			var settings = readSettings( elements, true );
			var password = generatePassword( settings.length, settings.groups, settings.alphabet );
			elements.password.value = password;
			elements.password.size = Math.min( Math.max( password.length, 1 ), 128 );
			renderMetrics( elements, settings );
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
			elements.copy.textContent = text( "copiedButton", "Copied" );
			state.copyTimer = window.setTimeout( function () {
				elements.copy.textContent = text( "copyButton", "Copy" );
			}, 1600 );
		};
		if ( navigator.clipboard && navigator.clipboard.writeText ) {
			navigator.clipboard.writeText( elements.password.value ).then( done ).catch( function () {
				elements.error.textContent = text( "errorClipboard", "The password could not be copied." );
			} );
			return;
		}
		elements.error.textContent = text( "errorClipboard", "The password could not be copied." );
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
			var label = text( "entropy", "Entropy" ) + ": ";
			var unit = text( "bits", "bits" );
			link.textContent = password && Number.isFinite( bits ) ? label + bits.toFixed( 2 ) + " " + unit : label + text( "notAvailable", "not available" );
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
