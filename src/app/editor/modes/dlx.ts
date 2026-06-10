import CodeMirror from 'codemirror';
import {
  DLX_INSTRUCTIONS,
  DLX_INSTRUCTIONS_I,
  DLX_INSTRUCTIONS_IJ,
  DLX_INSTRUCTIONS_J,
  DLX_INSTRUCTIONS_R,
  specialRegisters
} from '../../interpreters/dlx/dlx.instructions';
import {instructions} from '../../interpreters/dlx/dlx.instruction-set';
import {DLXRegisters} from '../../registers/dlx.registers';

(CodeMirror as any).defineMode('dlx', function() {
  const instructions_R = DLX_INSTRUCTIONS_R.join('|');
  const instructions_I = DLX_INSTRUCTIONS_I.join('|');
  const instructions_IJ = DLX_INSTRUCTIONS_IJ.join('|');
  const instructions_J = DLX_INSTRUCTIONS_J.join('|');

  return {
    startState: function() {
      return {first: true, j_instruction: false, indent: 0};
    },
    token: function(stream: any, state: any) {
      let style: string;
      let matched: any;

      if (stream.sol()) {
        state.first = true;
        state.j_instruction = false;
      }

      if (stream.match(/^;.*/)) {
        style = 'comment';
      } else if (matched = stream.match(/^\w+:/)) {
        style = 'tag';
        state.indent = matched[0].length + 1;
      } else if (stream.match(RegExp('^(' + instructions_J + ')(\\s+|$)'))) {
        style = 'keyword-j';
        state.j_instruction = true;
      } else if (stream.match(RegExp('^(' + instructions_IJ + ')(\\s+|$)'))) {
        style = 'keyword-j';
        state.j_instruction = true;
      } else if (stream.match(RegExp('^(' + instructions_I + ')(\\s+|$)'))) {
        style = 'keyword-i';
      } else if (stream.match(RegExp('^(' + instructions_R + ')(\\s+|$)'))) {
        style = 'keyword-r';
      } else if (stream.match(/^(R([12]?\d|3[01])|IAR)(?=\W|$)/i)) {
        style = 'variable';
        if (state.first) {
          style += '-2';
          state.first = false;
        }
      } else if (stream.match(/^0x([0-9A-F]{4})(?=\W|$)/i)) {
        style = 'number';
      } else if (state.j_instruction && stream.match(/^\w+/)) {
        style = 'tag';
        state.j_instruction = false;
      } else {
        stream.next();
      }

      return style;
    },
    indent: function(state: any) {
      return state.indent;
    }
  };
});

(CodeMirror as any).registerHelper('hint', 'dlx', (editor: any) => {
  const cursor = editor.getCursor();
  const token = editor.getTokenAt(cursor);

  const line = editor.getLine(cursor.line);
  const beforeCursor = line.slice(0, cursor.ch);

  const match = beforeCursor.search(/[\w]+$/) !== -1
    ? beforeCursor.match(/[\w]+$/)[0].toUpperCase()
    : '';
  const currentWord = match;

  if (token.type === 'comment') {
    return { list: [], from: cursor, to: cursor };
  }

  const lineUpToCursor = beforeCursor.trimStart();
  const tokensBefore = lineUpToCursor.split(/\s+/).filter(Boolean);

  const firstMeaningfulToken =
    tokensBefore[0]?.endsWith(':') ? tokensBefore[1] : tokensBefore[0];
  const isFirstWord =
    !firstMeaningfulToken ||
    firstMeaningfulToken.toUpperCase() === currentWord;

  const registers = Array.from({length: DLXRegisters.registersCount}, (_, i) => `R${i}`).concat(specialRegisters);

  const suggestions = isFirstWord
    ? DLX_INSTRUCTIONS
    : [...DLX_INSTRUCTIONS, ...registers];

  const filtered = currentWord
    ? suggestions.filter((item) => item.startsWith(currentWord))
    : suggestions;

  const list = filtered.map((item) => ({
    text: item,
    displayText: item,
    className: registers.includes(item) ? 'hint-register' : 'hint-instruction',
  }));

  const wordRange = editor.findWordAt(cursor);

  return {
    list,
    from: wordRange.anchor,
    to: wordRange.head,
  };
});
