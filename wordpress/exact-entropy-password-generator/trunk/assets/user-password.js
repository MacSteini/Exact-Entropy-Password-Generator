(function () {
	"use strict";

	document.addEventListener( "DOMContentLoaded", function () {
		var config = window.EEPG_USER_PASSWORD || {};
		var input = document.getElementById( "pass1" );
		if ( ! input || document.getElementById( "eepg-user-password-entropy" ) ) {
			return;
		}

		var target = input.closest( ".password-input-wrapper" ) || input;
		var line = document.createElement( "p" );
		var link = document.createElement( "a" );
		line.id = "eepg-user-password-entropy";
		line.className = "description";
		line.setAttribute( "role", "status" );
		line.setAttribute( "aria-live", "polite" );
		line.setAttribute( "aria-atomic", "true" );
		link.href = config.generatorUrl || "options-general.php?page=exact-entropy-password-generator";
		line.appendChild( link );
		target.insertAdjacentElement( "afterend", line );

		var update = function () {
			var password = input.value || "";
			var bits = estimateTypedPasswordEntropy( password );
			var label = config.label || "Entropy";
			var unit = config.bits || "bits";
			link.textContent = password && Number.isFinite( bits ) ? label + ": " + bits.toFixed( 2 ) + " " + unit : label + ": " + ( config.notAvailable || "not available" );
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
	} );

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
