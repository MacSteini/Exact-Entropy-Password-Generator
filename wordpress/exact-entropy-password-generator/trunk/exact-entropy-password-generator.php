<?php
/**
 * Plugin Name: Exact Entropy Password Generator
 * Plugin URI: https://wordpress.org/plugins/exact-entropy-password-generator/
 * Description: Adds an exact-entropy password generator to the WordPress admin area and shows entropy while backend user passwords are created or updated.
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
 * Check whether the current admin screen can create or update normal user passwords.
 *
 * @param string $hook_suffix Current admin page hook suffix.
 * @return bool
 */
function eepg_is_user_password_screen( $hook_suffix ) {
	return in_array( $hook_suffix, array( 'profile.php', 'user-edit.php', 'user-new.php' ), true );
}

/**
 * Register the generator page under Tools.
 */
function eepg_register_admin_page() {
	$GLOBALS['eepg_admin_page_hook'] = add_management_page(
		__( 'Exact Entropy Password Generator', 'exact-entropy-password-generator' ),
		__( 'Exact Entropy', 'exact-entropy-password-generator' ),
		'manage_options',
		EEPG_MENU_SLUG,
		'eepg_render_admin_page'
	);
}

/**
 * Enqueue generator styles only on the plugin admin page.
 *
 * @param string $hook_suffix Current admin page hook suffix.
 */
function eepg_enqueue_admin_assets( $hook_suffix ) {
	$generator_hook = isset( $GLOBALS['eepg_admin_page_hook'] ) ? $GLOBALS['eepg_admin_page_hook'] : '';

	if ( $hook_suffix === $generator_hook ) {
		wp_enqueue_style(
			'eepg-admin',
			plugins_url( 'style.css', __FILE__ ),
			array(),
			EEPG_VERSION
		);

		wp_enqueue_script(
			'eepg-admin',
			plugins_url( 'js.js', __FILE__ ),
			array(),
			EEPG_VERSION,
			true
		);

		return;
	}

	if ( ! eepg_is_user_password_screen( $hook_suffix ) ) {
		return;
	}

	wp_enqueue_script(
		'eepg-admin',
		plugins_url( 'js.js', __FILE__ ),
		array(),
		EEPG_VERSION,
		true
	);
}

/**
 * Render the admin generator page.
 */
function eepg_render_admin_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to access this page.', 'exact-entropy-password-generator' ) );
	}

	?>
	<div class="wrap eepg-wrap">
		<div
			id="eepg-generator-app"
			class="eepg-app"
			data-locale="<?php echo esc_attr( str_replace( '_', '-', get_user_locale() ) ); ?>"
			data-bit-unit="<?php echo esc_attr__( 'bits', 'exact-entropy-password-generator' ); ?>"
			data-copy-label="<?php echo esc_attr__( 'Copy', 'exact-entropy-password-generator' ); ?>"
			data-copied-label="<?php echo esc_attr__( 'Copied', 'exact-entropy-password-generator' ); ?>"
			data-copy-status="<?php echo esc_attr__( 'Password copied.', 'exact-entropy-password-generator' ); ?>"
			data-error-crypto="<?php echo esc_attr__( 'This browser does not provide crypto.getRandomValues().', 'exact-entropy-password-generator' ); ?>"
			data-error-random-limit="<?php echo esc_attr__( 'Invalid upper bound for random number.', 'exact-entropy-password-generator' ); ?>"
			data-error-settings="<?php echo esc_attr__( 'Check the password length and selected character groups.', 'exact-entropy-password-generator' ); ?>"
			data-error-attempts="<?php echo esc_attr__( 'Too many rejected candidates. Try again, increase the length or select fewer groups.', 'exact-entropy-password-generator' ); ?>"
			data-error-clipboard="<?php echo esc_attr__( 'The password could not be copied.', 'exact-entropy-password-generator' ); ?>"
		>
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
					<span id="copyStatus" class="screen-reader-text" role="status" aria-live="polite" aria-atomic="true"></span>
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

add_action( 'admin_menu', 'eepg_register_admin_page' );
add_action( 'admin_enqueue_scripts', 'eepg_enqueue_admin_assets' );

/**
 * Add a settings shortcut on the plugins screen.
 *
 * @param string[] $links Plugin action links.
 * @return string[]
 */
function eepg_settings_link( $links ) {
	return array_merge(
		array(
			'settings' => '<a href="' . esc_url( admin_url( 'tools.php?page=' . EEPG_MENU_SLUG ) ) . '">' . esc_html__( 'Settings', 'exact-entropy-password-generator' ) . '</a>',
		),
		$links
	);
}

/**
 * Print small, page-local configuration for the backend password entropy helper.
 */
function eepg_print_user_password_config() {
	$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
	if ( ! $screen || ! in_array( $screen->base, array( 'profile', 'user-edit', 'user' ), true ) ) {
		return;
	}

	?>
	<script>
		window.EEPG_USER_PASSWORD = {
			generatorUrl: <?php echo wp_json_encode( admin_url( 'tools.php?page=' . EEPG_MENU_SLUG ) ); ?>,
			generatorLinkLabel: <?php echo wp_json_encode( __( 'Open exact entropy generator', 'exact-entropy-password-generator' ) ); ?>,
			locale: <?php echo wp_json_encode( str_replace( '_', '-', get_user_locale() ) ); ?>,
			label: <?php echo wp_json_encode( __( 'Entropy', 'exact-entropy-password-generator' ) ); ?>,
			bits: <?php echo wp_json_encode( __( 'bits', 'exact-entropy-password-generator' ) ); ?>,
			notAvailable: <?php echo wp_json_encode( __( 'not available', 'exact-entropy-password-generator' ) ); ?>
		};
	</script>
	<?php
}

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'eepg_settings_link' );
add_action( 'admin_print_footer_scripts', 'eepg_print_user_password_config' );
