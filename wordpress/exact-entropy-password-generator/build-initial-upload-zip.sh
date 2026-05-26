#!/usr/bin/env sh
set -eu

plugin_slug="exact-entropy-password-generator"
root_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
dist_dir="$root_dir/dist"
stage_parent="$dist_dir/upload"
stage_dir="$stage_parent/$plugin_slug"
zip_path="$dist_dir/$plugin_slug.zip"

rm -rf "$stage_parent" "$zip_path"
mkdir -p "$stage_dir"

cp "$root_dir/trunk/exact-entropy-password-generator.php" "$stage_dir/"
cp "$root_dir/trunk/readme.txt" "$stage_dir/"
cp "$root_dir/trunk/style.css" "$stage_dir/"
cp "$root_dir/trunk/js.js" "$stage_dir/"

(cd "$stage_parent" && zip -qr "$zip_path" "$plugin_slug" -x "*/.DS_Store")
rm -rf "$stage_parent"

printf 'Created %s\n' "$zip_path"
