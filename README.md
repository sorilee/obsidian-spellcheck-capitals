# Spellcheck Capitals

Spellcheck Capitals is an Obsidian plugin that suppresses spellcheck for capitalized words in the editor.

## What it does

By default, the plugin:

- ignores words that start with an uppercase letter;
- supports Unicode uppercase letters such as `Élodie`;
- supports internal apostrophes and dashes such as `O'Neill` and `Jean-Luc`;
- ignores only words with at least two letters or digits, so single-letter words such as `I` remain spellchecked.

## How to use

Simply turn on the plugin in the community-plugins settings in Obsidian.

## What it does internally

When Obsidian renders editable Markdown through CodeMirror, this plugin wraps matching words in a span with `spellcheck="false"`. That prevents the browser from drawing spellcheck underlines for those words while leaving the rest of the editor untouched.

## Build

```bash
npm install
npm test
npm run build
```

After that, copy `manifest.json` and `main.js` into:

```text
<Vault>/.obsidian/plugins/spellcheck-capitals/
```

## Support

If you find this plugin useful, you can support me on Ko-fi.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/sorilee)
