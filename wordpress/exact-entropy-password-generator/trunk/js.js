(function () {
	"use strict";

	var groups = {
		lower: charsFromRange( 0x61, 0x7a ),
		upper: charsFromRange( 0x41, 0x5a ),
		digits: charsFromRange( 0x30, 0x39 ),
		symbols: charsFromRanges( [ [ 0x21, 0x2f ], [ 0x3a, 0x40 ], [ 0x5b, 0x60 ], [ 0x7b, 0x7e ] ] )
	};

	document.addEventListener( "DOMContentLoaded", function () {
		initGenerator();
		initUserPasswordEntropy();
	} );

	function initGenerator() {
		var app = document.getElementById( "eepg-generator-app" );
		if ( ! app ) {
			return;
		}

		var elements = {
			length: app.querySelector( "#length" ),
			password: app.querySelector( "#password" ),
			error: app.querySelector( "#error" ),
			alphabetSize: app.querySelector( "#alphabetSize" ),
			entropyBits: app.querySelector( "#entropyBits" ),
			searchSpace: app.querySelector( "#searchSpace" ),
			generate: app.querySelector( "#generate" ),
			copy: app.querySelector( "#copy" ),
			copyStatus: app.querySelector( "#copyStatus" )
		};

		renderDetailsOnly( app, elements );
		generateAndRender( app, elements );

		elements.generate.addEventListener( "click", function () {
			generateAndRender( app, elements );
		} );
		elements.copy.addEventListener( "click", function () {
			copyPassword( app, elements );
		} );
		elements.password.addEventListener( "click", function () {
			copyPassword( app, elements );
		} );
		elements.length.addEventListener( "input", function () {
			generateAndRender( app, elements );
		} );

		[ "lower", "upper", "digits", "symbols" ].forEach( function ( id ) {
			var checkbox = app.querySelector( "#" + id );
			if ( checkbox ) {
				checkbox.addEventListener( "change", function () {
					generateAndRender( app, elements );
				} );
			}
		} );
	}

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

	function label( app, key, fallback ) {
		return app.dataset[key] || fallback;
	}

	function selectedGroups( app ) {
		return [ "lower", "upper", "digits", "symbols" ].filter( function ( id ) {
			var input = app.querySelector( "#" + id );
			return input && input.checked;
		} ).map( function ( id ) {
			return { id: id, chars: groups[id] };
		} );
	}

	function readSettings( app, elements ) {
		var length = Number( elements.length.value );
		var activeGroups = selectedGroups( app );
		if ( ! Number.isInteger( length ) || length < 1 || length > 1000 || activeGroups.length === 0 || length < activeGroups.length ) {
			return null;
		}
		var alphabet = activeGroups.map( function ( group ) {
			return group.chars;
		} ).join( "" );
		return {
			length: length,
			groups: activeGroups,
			alphabet: alphabet,
			bits: log2ValidPasswordCount( length, activeGroups.map( function ( group ) {
				return group.chars.length;
			} ) )
		};
	}

	function randomBelow( app, maxExclusive ) {
		if ( ! Number.isSafeInteger( maxExclusive ) || maxExclusive <= 0 ) {
			throw new Error( label( app, "errorRandomLimit", "Invalid upper bound for random number." ) );
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

	function randomPasswordFromAlphabet( app, length, alphabet ) {
		var password = "";
		for ( var i = 0; i < length; i++ ) {
			password += alphabet[randomBelow( app, alphabet.length )];
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

	function generatePassword( app, length, activeGroups, alphabet ) {
		var maxAttempts = 100000;
		for ( var attempt = 0; attempt < maxAttempts; attempt++ ) {
			var candidate = randomPasswordFromAlphabet( app, length, alphabet );
			if ( containsEveryGroup( candidate, activeGroups ) ) {
				return candidate;
			}
		}
		throw new Error( label( app, "errorAttempts", "Too many rejected candidates. Try again, increase the length or select fewer groups." ) );
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

	function formatBits( app, bits ) {
		if ( ! Number.isFinite( bits ) ) {
			return "-";
		}
		return bits.toLocaleString( label( app, "locale", "en-US" ), { minimumFractionDigits: 2, maximumFractionDigits: 2 } ) + " " + label( app, "bitUnit", "bits" );
	}

	function formatSearchSpace( app, bits ) {
		var log10 = bits * Math.LOG10E * Math.LN2;
		if ( ! Number.isFinite( log10 ) ) {
			return "-";
		}
		if ( log10 < 6 ) {
			return Math.round( Math.pow( 10, log10 ) ).toLocaleString( label( app, "locale", "en-US" ) );
		}
		return "≈ 10^" + log10.toLocaleString( label( app, "locale", "en-US" ), { minimumFractionDigits: 1, maximumFractionDigits: 1 } );
	}

	function renderMetrics( app, elements, settings ) {
		elements.alphabetSize.textContent = settings.alphabet.length.toLocaleString( label( app, "locale", "en-US" ) );
		elements.entropyBits.textContent = formatBits( app, settings.bits );
		elements.searchSpace.textContent = formatSearchSpace( app, settings.bits );
	}

	function renderDetailsOnly( app, elements ) {
		var settings = readSettings( app, elements );
		if ( settings ) {
			renderMetrics( app, elements, settings );
			return;
		}
		elements.alphabetSize.textContent = "-";
		elements.entropyBits.textContent = "-";
		elements.searchSpace.textContent = "-";
	}

	function generateAndRender( app, elements ) {
		elements.error.textContent = "";
		try {
			if ( ! window.crypto || ! window.crypto.getRandomValues ) {
				throw new Error( label( app, "errorCrypto", "This browser does not provide crypto.getRandomValues()." ) );
			}
			var settings = readSettings( app, elements );
			if ( ! settings ) {
				throw new Error( label( app, "errorSettings", "Check the password length and selected character groups." ) );
			}
			var password = generatePassword( app, settings.length, settings.groups, settings.alphabet );
			elements.password.value = password;
			elements.password.size = Math.min( Math.max( password.length, 1 ), 128 );
			renderMetrics( app, elements, settings );
		} catch ( error ) {
			elements.error.textContent = error.message;
			elements.password.value = "";
			elements.alphabetSize.textContent = "-";
			elements.entropyBits.textContent = "-";
			elements.searchSpace.textContent = "-";
		}
	}

	function copyPassword( app, elements ) {
		if ( ! elements.password.value ) {
			return;
		}
		var done = function () {
			elements.copy.textContent = label( app, "copiedLabel", "Copied" );
			if ( elements.copyStatus ) {
				elements.copyStatus.textContent = "";
				window.setTimeout( function () {
					elements.copyStatus.textContent = label( app, "copyStatus", "Password copied." );
				}, 0 );
			}
			window.setTimeout( function () {
				elements.copy.textContent = label( app, "copyLabel", "Copy" );
			}, 1600 );
		};
		if ( navigator.clipboard && navigator.clipboard.writeText ) {
			navigator.clipboard.writeText( elements.password.value ).then( done ).catch( function () {
				elements.error.textContent = label( app, "errorClipboard", "The password could not be copied." );
			} );
			return;
		}
		elements.error.textContent = label( app, "errorClipboard", "The password could not be copied." );
	}

	function initUserPasswordEntropy() {
		var config = window.EEPG_USER_PASSWORD || {};
		var input = document.getElementById( "pass1" );
		if ( ! input || document.getElementById( "eepg-user-password-entropy" ) ) {
			return;
		}

		var target = input.closest( ".password-input-wrapper" ) || input;
		var line = document.createElement( "p" );
		var link = document.createElement( "a" );
		var live = document.createElement( "span" );
		line.id = "eepg-user-password-entropy";
		line.className = "description";
		link.href = config.generatorUrl || "tools.php?page=exact-entropy-password-generator";
		live.className = "screen-reader-text";
		live.setAttribute( "role", "status" );
		live.setAttribute( "aria-live", "polite" );
		live.setAttribute( "aria-atomic", "true" );
		line.appendChild( link );
		line.appendChild( live );
		target.insertAdjacentElement( "afterend", line );

		var update = function () {
			var password = input.value || "";
			var bits = estimateTypedPasswordEntropy( password );
			var entropyLabel = config.label || "Entropy";
			var unit = config.bits || "bits";
			var text = password && Number.isFinite( bits ) ? entropyLabel + ": " + formatTypedEntropy( bits, config ) + " " + unit : entropyLabel + ": " + ( config.notAvailable || "not available" );
			link.textContent = text;
			link.setAttribute( "aria-label", ( config.generatorLinkLabel || "Open exact entropy generator" ) + ". " + text );
			live.textContent = text;
		};

		input.addEventListener( "input", update );
		input.addEventListener( "change", update );
		document.addEventListener( "click", function ( event ) {
			if ( event.target && event.target.matches( ".wp-generate-pw, .wp-cancel-pw" ) ) {
				window.setTimeout( update, 0 );
				window.setTimeout( update, 100 );
			}
		} );
		update();
	}

	function formatTypedEntropy( bits, config ) {
		try {
			return bits.toLocaleString( config.locale || navigator.language || "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 } );
		} catch ( error ) {
			return bits.toFixed( 2 );
		}
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
		return groupSizes.length ? Array.from( password ).length * Math.log2( groupSizes.reduce( function ( sum, size ) {
			return sum + size;
		}, 0 ) ) : NaN;
	}
}());
