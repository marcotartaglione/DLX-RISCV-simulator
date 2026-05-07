import CodeMirror from "codemirror";
import {DLX_INSTRUCTIONS} from '../../interpreters/dlx/dlx.instructions';
import {DLXRegisters} from '../../registers/dlx.registers';

(CodeMirror as any).defineMode('dlx', function () {
  const instructions_R = 'ADDU|ADD|AND|MOVI2S|MOVS2I|NOP|OR|SEQ|SGE|SGT|SLE|SLL|SLT|SNE|SRA|SRL|SUBU|SUB|XOR';
  const instructions_I = 'ADDI|ADDUI|ANDI|LBU|LB|LHI|LHU|LH|LW|ORI|SB|SEQI|SGEI|SGTI|SH|SLEI|SLLI|SLTI|SNEI|SRAI|SRLI|SUBI|SUBUI|SW|XORI';
  const instructions_IJ = 'BEQZ|BNEZ|JALR|JR';
  const instructions_J = 'JAL|J|RFE|TRAP';

  return {
    startState: function () {
      return {first: true, j_instruction: false, indent: 0};
    },
    token: function (stream: any, state: any) {
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
    indent: function (state: any) {
      return state.indent;
    }
  };
});

(CodeMirror as any).registerHelper('hint', 'dlx', (editor: any) => {
  const cursor = editor.getCursor();
  const token = editor.getTokenAt(cursor);
  const currentWord = token.string.toUpperCase();

  const registers = Array.from({length: DLXRegisters.registersCount}, (_, i) => `R${i}`).concat(['IAR']);
  const instructions = [...DLX_INSTRUCTIONS];

  const suggestions = [...instructions, ...registers];
  const filtered = suggestions.filter(item => item.startsWith(currentWord));

  const list = filtered.map(item => {
    const isReg = registers.includes(item);
    return {
      text: item,
      displayText: item,
      className: isReg ? 'hint-register' : 'hint-instruction'
    };
  });

  return {
    list,
    from: CodeMirror.Pos(cursor.line, token.start),
    to: CodeMirror.Pos(cursor.line, token.end),
  };
});
