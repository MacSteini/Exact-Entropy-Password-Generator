=== Exact Entropy Password Generator ===
Contributors: MacSteini
Tags: password, passwords, entropy, generator, security
Requires at least: 6.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv3 or later
License URI: https://gnu.org/licenses/gpl

Adds an exact-entropy password generator to the WordPress admin area.

== Description ==

Exact Entropy Password Generator adds a local password generator to the WordPress admin sidebar. The generator runs in the browser, uses `crypto.getRandomValues()`, and shows alphabet size, entropy and search space for the selected length and character groups.

The plugin also adds a single entropy link below the normal WordPress backend password field when a user password is created or updated. It does not add entropy output to login forms, password reset screens, post password forms, or Application Passwords.

Passwords are not stored by this plugin, sent to a server, or written to the database by the generator.

== Installation ==

1. Upload the `exact-entropy-password-generator` folder to `/wp-content/plugins/`.
2. Activate the plugin in **Plugins**.
3. Open **Password Generator** in the WordPress admin sidebar.

== Frequently Asked Questions ==

= Does this plugin store generated passwords? =

No. Passwords are generated in the browser and are not stored by this plugin.

= Does the entropy line appear on the login screen? =

No. It appears only in the WordPress admin screens where normal user passwords are created or updated.

= Does this change WordPress password rules? =

No. The entropy line is informational only. It does not block, approve, or modify passwords.

= Does this affect Application Passwords? =

No. Application Passwords remain fully managed by WordPress core.

== Changelog ==

= 1.0.0 =
* Initial release.
