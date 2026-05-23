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
 * Domain Path: /languages
 *
 * @package ExactEntropyPasswordGenerator
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'EEPG_VERSION', '1.0.0' );
define( 'EEPG_MENU_SLUG', 'exact-entropy-password-generator' );

/**
 * Load bundled translations when present.
 */
function eepg_load_textdomain() {
	load_plugin_textdomain(
		'exact-entropy-password-generator',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);
}

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
			'locale' => str_replace( '_', '-', get_user_locale() ),
			'strings' => array(
				'entropy' => __( 'Entropy', 'exact-entropy-password-generator' ),
				'bits' => __( 'bits', 'exact-entropy-password-generator' ),
				'bitUnit' => __( 'bits', 'exact-entropy-password-generator' ),
				'copyButton' => __( 'Copy', 'exact-entropy-password-generator' ),
				'copiedButton' => __( 'Copied', 'exact-entropy-password-generator' ),
				'notAvailable' => __( 'not available', 'exact-entropy-password-generator' ),
				'errorCrypto' => __( 'This browser does not provide crypto.getRandomValues().', 'exact-entropy-password-generator' ),
				'errorRandomLimit' => __( 'Invalid upper bound for random number.', 'exact-entropy-password-generator' ),
				'errorLength' => __( 'Length must be an integer between 1 and 1000.', 'exact-entropy-password-generator' ),
				'errorGroup' => __( 'Select at least one character group.', 'exact-entropy-password-generator' ),
				'errorTooShort' => __( 'Length is too short to include every selected group at least once.', 'exact-entropy-password-generator' ),
				'errorAttempts' => __( 'Too many rejected candidates. Try again, increase the length or select fewer groups.', 'exact-entropy-password-generator' ),
				'errorClipboard' => __( 'The password could not be copied.', 'exact-entropy-password-generator' ),
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
		<div id="eepg-generator-app" class="eepg-app">
			<header class="eepg-header">
				<h1><?php echo esc_html__( 'Exact Entropy Password Generator', 'exact-entropy-password-generator' ); ?></h1>
				<div class="eepg-copy">
					<p><?php echo wp_kses( __( 'Creates passwords locally in your browser with <code>crypto.getRandomValues()</code>. Passwords, settings and entropy values are not sent anywhere.', 'exact-entropy-password-generator' ), array( 'code' => array() ) ); ?></p>
					<p><?php echo esc_html__( 'Entropy is calculated from the current length and character groups; every selected group appears at least once. The value applies only while you use the generated password unchanged.', 'exact-entropy-password-generator' ); ?></p>
				</div>
			</header>

			<section class="eepg-card eepg-settings" aria-label="<?php echo esc_attr__( 'Password settings', 'exact-entropy-password-generator' ); ?>">
				<div class="eepg-length-control">
					<label for="length"><?php echo esc_html__( 'Length', 'exact-entropy-password-generator' ); ?></label>
					<input id="length" type="number" min="1" max="1000" value="64" />
				</div>

				<fieldset class="eepg-groups">
					<legend><?php echo esc_html__( 'Character groups', 'exact-entropy-password-generator' ); ?></legend>
					<label class="eepg-group-option">
						<input type="checkbox" id="lower" checked />
						<span><?php echo wp_kses( __( 'Lowercase letters <code>a-z</code>', 'exact-entropy-password-generator' ), array( 'code' => array() ) ); ?></span>
					</label>
					<label class="eepg-group-option">
						<input type="checkbox" id="upper" checked />
						<span><?php echo wp_kses( __( 'Uppercase letters <code>A-Z</code>', 'exact-entropy-password-generator' ), array( 'code' => array() ) ); ?></span>
					</label>
					<label class="eepg-group-option">
						<input type="checkbox" id="digits" checked />
						<span><?php echo wp_kses( __( 'Digits <code>0-9</code>', 'exact-entropy-password-generator' ), array( 'code' => array() ) ); ?></span>
					</label>
					<label class="eepg-group-option">
						<input type="checkbox" id="symbols" checked />
						<span><?php echo esc_html__( 'ASCII symbols', 'exact-entropy-password-generator' ); ?></span>
					</label>
				</fieldset>
			</section>

			<section class="eepg-card eepg-results" aria-label="<?php echo esc_attr__( 'Password details', 'exact-entropy-password-generator' ); ?>">
				<div class="eepg-stats">
					<div class="eepg-stat">
						<span><?php echo esc_html__( 'Alphabet size', 'exact-entropy-password-generator' ); ?></span>
						<strong id="alphabetSize">-</strong>
					</div>
					<div class="eepg-stat">
						<span><?php echo esc_html__( 'Entropy', 'exact-entropy-password-generator' ); ?></span>
						<strong id="entropyBits">-</strong>
					</div>
					<div class="eepg-stat">
						<span><?php echo esc_html__( 'Search space', 'exact-entropy-password-generator' ); ?></span>
						<strong id="searchSpace">-</strong>
					</div>
				</div>

				<div class="eepg-password-box">
					<label for="password"><?php echo esc_html__( 'Password', 'exact-entropy-password-generator' ); ?></label>
					<input id="password" type="text" readonly spellcheck="false" autocomplete="off" aria-describedby="passwordCopyHint" />
					<span id="passwordCopyHint" class="screen-reader-text"><?php echo esc_html__( 'Click the password field or use the copy button to copy the password.', 'exact-entropy-password-generator' ); ?></span>
				</div>

				<div class="eepg-actions">
					<button id="generate" class="button button-primary button-hero" type="button"><?php echo esc_html__( 'Generate password', 'exact-entropy-password-generator' ); ?></button>
					<button id="copy" class="button button-secondary button-hero" type="button"><?php echo esc_html__( 'Copy', 'exact-entropy-password-generator' ); ?></button>
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

add_action( 'plugins_loaded', 'eepg_load_textdomain' );
add_action( 'admin_menu', 'eepg_register_admin_page' );
add_action( 'admin_enqueue_scripts', 'eepg_enqueue_admin_assets' );
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'eepg_settings_link' );
