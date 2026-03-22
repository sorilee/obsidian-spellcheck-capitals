import { Plugin } from 'obsidian';

import { createCapitalizedWordSpellcheckExtension } from './editor-extension';

export default class SpellcheckCapitalsPlugin extends Plugin {
  public onload(): void {
    this.registerEditorExtension(createCapitalizedWordSpellcheckExtension());
  }
}
