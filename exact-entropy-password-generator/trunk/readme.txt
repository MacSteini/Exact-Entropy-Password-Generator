=== Exact Entropy Password Generator ===
Contributors: MacSteini
Tags: password, passwords, entropy, generator, security
Requires at least: 6.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Adds an exact-entropy password generator to the WordPress admin area and links to it while backend user passwords are created or updated.

== Description ==

Exact Entropy Password Generator adds a local password generator under **Tools > Exact Entropy** in the WordPress admin area. The generator runs in the browser, uses `crypto.getRandomValues()`, and shows alphabet size, entropy and search space for the selected length and character groups.

The plugin also adds a single link below the normal WordPress backend password field when a user password is created or updated. The link explains that exact entropy is not available for typed or edited passwords and opens the generator. It does not add output to login forms, password reset screens, post password forms, or Application Passwords.

Passwords are not stored by this plugin, sent to a server, or written to the database by the generator.

The interface uses the active WordPress language. The plugin does not include its own language, colour, or dark mode switches.

== Installation ==

1. Upload the `exact-entropy-password-generator` folder to `/wp-content/plugins/`.
2. Activate the plugin in **Plugins**.
3. Open **Tools > Exact Entropy** in the WordPress admin menu.

== Frequently Asked Questions ==

= Does this plugin store generated passwords? =

No. Passwords are generated in the browser and are not stored by this plugin.

= Does the backend password line appear on the login screen? =

No. It appears only in the WordPress admin screens where normal user passwords are created or updated.

= Why does the backend password line not show a number? =

Exact entropy describes the generator's random process. It is not available for passwords that were typed or edited manually.

= Does this change WordPress password rules? =

No. The backend password line is informational only. It does not block, approve, or modify passwords.

= Does this affect Application Passwords? =

No. Application Passwords remain fully managed by WordPress core.

= Is the plugin translatable? =

Yes. The plugin uses the `exact-entropy-password-generator` text domain and follows the active WordPress language.

== Changelog ==

= 1.0.0 =
* Initial release.
