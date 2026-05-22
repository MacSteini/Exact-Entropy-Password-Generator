<?php
/**
 * Plugin Name: Exact Entropy Password Generator
 * Plugin URI: https://github.com/MacSteini/exact-entropy-password-generator
 * Description: Adds an exact-entropy password generator to the WordPress admin area and shows password entropy while users create or update backend passwords.
 * Version: 1.0.0
 * Author: Marco Steinbrecher
 * Author URI: https://profiles.wordpress.org/macsteini
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPLv3 or later
 * License URI: https://gnu.org/licenses/gpl
 * Text Domain: exact-entropy-password-generator
 *
 * @package ExactEntropyPasswordGenerator
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'EEPG_VERSION', '1.0.0' );
define( 'EEPG_MENU_SLUG', 'exact-entropy-password-generator' );

/**
 * Register the generator page in the admin sidebar.
 */
function eepg_register_admin_page() {
	$GLOBALS['eepg_admin_page_hook'] = add_menu_page(
		__( 'Password Generator', 'exact-entropy-password-generator' ),
		__( 'Password Generator', 'exact-entropy-password-generator' ),
		'read',
		EEPG_MENU_SLUG,
		'eepg_render_generator_page',
		'dashicons-lock',
		80
	);
}

/**
 * Enqueue plugin assets only where they are needed.
 *
 * @param string $hook_suffix Current admin page hook suffix.
 */
function eepg_enqueue_admin_assets( $hook_suffix ) {
	$generator_hook = isset( $GLOBALS['eepg_admin_page_hook'] ) ? $GLOBALS['eepg_admin_page_hook'] : '';
	$is_generator = $hook_suffix === $generator_hook;
	$is_user_screen = in_array( $hook_suffix, array( 'profile.php', 'user-edit.php', 'user-new.php' ), true );

	if ( ! $is_generator && ! $is_user_screen ) {
		return;
	}

	wp_enqueue_style(
		'eepg-admin',
		plugins_url( 'assets/admin.css', __FILE__ ),
		array(),
		EEPG_VERSION
	);

	wp_enqueue_script(
		'eepg-generator',
		plugins_url( 'assets/generator.js', __FILE__ ),
		$is_user_screen ? array( 'jquery' ) : array(),
		EEPG_VERSION,
		true
	);

	wp_localize_script(
		'eepg-generator',
		'EEPG_ADMIN',
		array(
			'context' => $is_generator ? 'generator' : 'user-password',
			'generatorUrl' => admin_url( 'admin.php?page=' . EEPG_MENU_SLUG ),
			'strings' => array(
				'entropy' => __( 'Entropy', 'exact-entropy-password-generator' ),
				'bits' => __( 'bits', 'exact-entropy-password-generator' ),
				'notAvailable' => __( 'not available', 'exact-entropy-password-generator' ),
			),
		)
	);
}

/**
 * Render the admin generator page.
 */
function eepg_render_generator_page() {
	if ( ! current_user_can( 'read' ) ) {
		wp_die( esc_html__( 'You do not have permission to access this page.', 'exact-entropy-password-generator' ) );
	}

	?>
	<div class="wrap eepg-wrap">
		<div id="eepg-generator-app" class="eepg-app" data-theme="light" data-palette="teal">
			<header class="eepg-header">
				<h1 data-i18n="title"><?php echo esc_html__( 'Exact Entropy Password Generator', 'exact-entropy-password-generator' ); ?></h1>
				<div class="eepg-header-grid">
					<div class="eepg-copy">
						<p data-i18n-html="introPrimary"><?php echo wp_kses( __( 'Creates passwords locally in your browser with <code>crypto.getRandomValues()</code>. Passwords, settings and entropy values are not sent anywhere.', 'exact-entropy-password-generator' ), array( 'code' => array() ) ); ?></p>
						<p data-i18n="introSecondary"><?php echo esc_html__( 'Entropy is calculated from the current length and character groups; every selected group appears at least once. The value applies only while you use the generated password unchanged.', 'exact-entropy-password-generator' ); ?></p>
					</div>
					<div class="eepg-controls" aria-label="<?php echo esc_attr__( 'Display controls', 'exact-entropy-password-generator' ); ?>">
						<button id="paletteToggle" class="eepg-icon-button" type="button" data-i18n-aria="randomColorLayout" aria-label="<?php echo esc_attr__( 'Random colour palette', 'exact-entropy-password-generator' ); ?>">◇</button>
						<button id="themeToggle" class="eepg-icon-button" type="button" data-i18n-aria="switchToDark" aria-label="<?php echo esc_attr__( 'Switch to dark mode', 'exact-entropy-password-generator' ); ?>">☾</button>
						<label class="eepg-language-control" for="languageSelect">
							<span class="screen-reader-text" data-i18n="languageSelectAria"><?php echo esc_html__( 'Choose language', 'exact-entropy-password-generator' ); ?></span>
							<select id="languageSelect" data-i18n-aria="languageSelectAria" aria-label="<?php echo esc_attr__( 'Choose language', 'exact-entropy-password-generator' ); ?>">
								<option value="en-US" aria-label="<?php echo esc_attr__( 'English (US)', 'exact-entropy-password-generator' ); ?>">🇺🇸</option>
								<option value="en-GB" aria-label="<?php echo esc_attr__( 'English (UK)', 'exact-entropy-password-generator' ); ?>">🇬🇧</option>
								<option value="de-DE" aria-label="<?php echo esc_attr__( 'German', 'exact-entropy-password-generator' ); ?>">🇩🇪</option>
								<option value="fr-FR" aria-label="<?php echo esc_attr__( 'French', 'exact-entropy-password-generator' ); ?>">🇫🇷</option>
								<option value="es-ES" aria-label="<?php echo esc_attr__( 'Spanish', 'exact-entropy-password-generator' ); ?>">🇪🇸</option>
								<option value="it-IT" aria-label="<?php echo esc_attr__( 'Italian', 'exact-entropy-password-generator' ); ?>">🇮🇹</option>
								<option value="nl-NL" aria-label="<?php echo esc_attr__( 'Dutch', 'exact-entropy-password-generator' ); ?>">🇳🇱</option>
							</select>
						</label>
					</div>
				</div>
			</header>

			<section class="eepg-card eepg-settings" aria-label="<?php echo esc_attr__( 'Password settings', 'exact-entropy-password-generator' ); ?>" data-i18n-aria="settingsRegionLabel">
				<div class="eepg-length-control">
					<label for="length" data-i18n="lengthLabel"><?php echo esc_html__( 'Length', 'exact-entropy-password-generator' ); ?></label>
					<input id="length" type="number" min="1" max="1000" value="64" />
				</div>

				<fieldset class="eepg-groups">
					<legend data-i18n="groupsHeading"><?php echo esc_html__( 'Character groups', 'exact-entropy-password-generator' ); ?></legend>
					<label class="eepg-group-option">
						<input type="checkbox" id="lower" checked />
						<span data-i18n-html="lowerLabel"><?php echo wp_kses( __( 'Lowercase letters <code>a-z</code>', 'exact-entropy-password-generator' ), array( 'code' => array() ) ); ?></span>
					</label>
					<label class="eepg-group-option">
						<input type="checkbox" id="upper" checked />
						<span data-i18n-html="upperLabel"><?php echo wp_kses( __( 'Uppercase letters <code>A-Z</code>', 'exact-entropy-password-generator' ), array( 'code' => array() ) ); ?></span>
					</label>
					<label class="eepg-group-option">
						<input type="checkbox" id="digits" checked />
						<span data-i18n-html="digitsLabel"><?php echo wp_kses( __( 'Digits <code>0-9</code>', 'exact-entropy-password-generator' ), array( 'code' => array() ) ); ?></span>
					</label>
					<label class="eepg-group-option">
						<input type="checkbox" id="symbols" checked />
						<span data-i18n="symbolsLabel"><?php echo esc_html__( 'ASCII symbols', 'exact-entropy-password-generator' ); ?></span>
					</label>
				</fieldset>
			</section>

			<section class="eepg-card eepg-results" aria-label="<?php echo esc_attr__( 'Password details', 'exact-entropy-password-generator' ); ?>">
				<div class="eepg-stats">
					<div class="eepg-stat">
						<span data-i18n="alphabetSizeLabel"><?php echo esc_html__( 'Alphabet size', 'exact-entropy-password-generator' ); ?></span>
						<strong id="alphabetSize">-</strong>
					</div>
					<div class="eepg-stat">
						<span data-i18n="entropyLabel"><?php echo esc_html__( 'Entropy', 'exact-entropy-password-generator' ); ?></span>
						<strong id="entropyBits">-</strong>
					</div>
					<div class="eepg-stat">
						<span data-i18n="searchSpaceLabel"><?php echo esc_html__( 'Search space', 'exact-entropy-password-generator' ); ?></span>
						<strong id="searchSpace">-</strong>
					</div>
				</div>

				<div class="eepg-password-box">
					<label for="password" data-i18n="passwordLabel"><?php echo esc_html__( 'Password', 'exact-entropy-password-generator' ); ?></label>
					<input id="password" type="text" readonly spellcheck="false" autocomplete="off" aria-describedby="passwordCopyHint" />
					<span id="passwordCopyHint" class="screen-reader-text" data-i18n="passwordCopyHint"><?php echo esc_html__( 'Click the password field or use the copy button to copy the password.', 'exact-entropy-password-generator' ); ?></span>
				</div>

				<div class="eepg-actions">
					<button id="generate" class="button button-primary button-hero" type="button" data-i18n="generateButton"><?php echo esc_html__( 'Generate password', 'exact-entropy-password-generator' ); ?></button>
					<button id="copy" class="button button-secondary button-hero" type="button" data-i18n="copyButton"><?php echo esc_html__( 'Copy', 'exact-entropy-password-generator' ); ?></button>
				</div>
				<p id="error" class="eepg-error" role="status" aria-live="polite" aria-atomic="true"></p>
			</section>
		</div>
	</div>
	<?php
}

/**
 * Add a settings shortcut on the plugins screen.
 *
 * @param string[] $links Plugin action links.
 * @return string[]
 */
function eepg_settings_link( $links ) {
	return array_merge(
		array(
			'generator' => '<a href="' . esc_url( admin_url( 'admin.php?page=' . EEPG_MENU_SLUG ) ) . '">' . esc_html__( 'Generator', 'exact-entropy-password-generator' ) . '</a>',
		),
		$links
	);
}

add_action( 'admin_menu', 'eepg_register_admin_page' );
add_action( 'admin_enqueue_scripts', 'eepg_enqueue_admin_assets' );
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'eepg_settings_link' );
