# Exact Entropy Password Generator

Generate random passwords in your browser and see how large the possible password space is.

The tool is a single `index.html` file. You can open it on your own computer or host it as a static page on a server.

## Purpose

Use this tool when you want a random password and a clear estimate of how difficult it is to guess by random trial.

It lets you choose the password length and the character groups:

- lowercase letters
- uppercase letters
- digits
- printable ASCII symbols, with spaces excluded

Every selected character group appears at least once in each generated password.

## How to use it

### On your own computer

Download the GitHub release ZIP, unzip it, and open `index.html` in a modern browser.

The release ZIP contains only the standalone page, this README and the licence file.

You do not need a build step, package manager, server, account, or internet connection.

### On a server

Upload `index.html` as a static file and open it through a browser.

The page does not need server-side code. If you publish it for other people, serve it over HTTPS.

### On GitHub Pages

After publishing the repository to GitHub, you can use GitHub Pages to serve the generator itself.

In the repository settings, set Pages to `Deploy from a branch`, choose the `main` branch, and choose `/ (root)` as the folder. GitHub Pages will then use the existing `index.html` as the site entry point.

The expected project-page URL is:

```text
https://macsteini.github.io/exact-entropy-password-generator/
```

## WordPress plugin

A separate WordPress plugin is prepared from the same project. It adds the generator to the WordPress admin area and links to it from backend screens where normal user passwords are created or updated.

The WordPress plugin is not part of the GitHub release ZIP for the standalone page. It will be published separately through WordPress.org after the plugin review.

## Privacy

Password generation happens locally in the browser with `crypto.getRandomValues()`.

The password, settings, entropy value and search space do not get sent anywhere by this tool.

## Features

- length from 1 to 1000 characters
- lowercase, uppercase, digit and printable ASCII-symbol character groups, with spaces excluded
- at least one character from every selected group
- alphabet size, entropy and search space shown in the details panel and updated whenever settings change
- click the password field or the copy control to copy the password
- light and dark modes
- ten colour palettes
- English (US/UK), German, French, Spanish, Italian and Dutch interface text

## Understanding the numbers

**Alphabet size** is the number of different characters the generator may use.

**Entropy** measures the size of the random choice in bits. More bits means many more possible passwords could have been generated.

**Search space** is the number of different passwords the current settings can produce.

The entropy guide in the page uses these practical ranges:

- `<64 bits`: low; not suitable for important accounts
- `64-79 bits`: limited; only for less critical or short-term use
- `80-111 bits`: strong for many everyday uses
- `112-127 bits`: stronger still
- `128 bits or more`: strong enough for normal password use

These ranges are a guide, not a guarantee. Password reuse, phishing, account recovery and data leaks can still defeat a strong password.

## How the tool calculates entropy

The entropy value comes from the generator rules, not from a guess about the visible password.

Let:

- `L` be the password length
- `A` be the alphabet size
- `H` be the entropy in bits

If every position could use any character from the alphabet without extra rules, the formula would be:

```text
H = L × log2(A)
```

This tool also requires every selected character group to appear at least once. That removes passwords that miss a selected group, so the valid search space is smaller than `A^L`.

For selected group sizes `g1, g2, ..., gk`, with `A = g1 + g2 + ... + gk`, the tool counts valid passwords with inclusion-exclusion:

```text
valid passwords =
  sum over all group subsets S of
  (-1)^size(S) × (A - sum of group sizes in S)^L

H = log2(valid passwords)
```

The displayed search space is the same valid password count, shown directly for smaller values or as an approximate power of ten for large values.

```mermaid
flowchart TD
    A[Choose length and character groups] --> B[Build the alphabet]
    B --> C[Count passwords that include every selected group]
    C --> D[Calculate entropy: H = log2(valid passwords)]
    D --> E[Show alphabet size, entropy and search space]
    B --> F[Generate a random password locally]
    F --> G[Reject candidates that miss a selected group]
    G --> H[Show the generated password]
```

## Why this only applies to generated passwords

The entropy value describes the random process used by this generator.

If a person chooses a password, edits the generated password, follows a pattern, or reuses part of an old password, the calculation no longer describes how hard that password is to guess.

That is why the password field does not accept manual edits.

## Safe use notes

- Generate a fresh password for each account.
- Store generated passwords in a password manager.
- Do not send passwords through chat, email, screenshots, or shared documents.
- Prefer multi-factor authentication for important accounts.
- Treat the entropy value as a measure of random guessing resistance, not as a full security rating.

## Browser support

Use a modern browser with support for `crypto.getRandomValues()`.

## Contributing

Bug reports, small fixes and documentation improvements are welcome.

Keep changes focused, test `index.html` in a modern browser when the interface changes, and do not include secrets, tokens or private keys. Please report security issues privately instead of publishing exploit details.

## Licence

This project is licensed under the [GNU General Public License v2.0 or later](LICENCE "GNU General Public License v2.0"). You may use, change and distribute it under the licence terms.
