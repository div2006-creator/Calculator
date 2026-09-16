document.addEventListener('DOMContentLoaded', () => {
  const expressionDisplay = document.getElementById('expression-display');
  const resultDisplay = document.getElementById('result-display');
  const keypad = document.getElementById('keypad');

  let expression = '';
  let activeResult = '0';
  let isEvaluated = false;

  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
      const action = button.dataset.action;
      const val = button.dataset.val;
      handleInput(action, val);
    });
  });

  function handleInput(action, val) {
    if (isEvaluated && action !== 'equals' && action !== 'delete') {
      if (['op', 'func'].includes(action)) {
        expression = activeResult;
      } else {
        expression = '';
      }
      isEvaluated = false;
    }

    switch (action) {
      case 'num':
        appendCharacter(val);
        break;
      case 'op':
        appendOperator(val);
        break;
      case 'func':
        appendFunction(val);
        break;
      case 'insert':
        appendCharacter(val);
        break;
      case 'clear':
        clearAll();
        break;
      case 'delete':
        deleteLast();
        break;
      case 'negate':
        toggleNegate();
        break;
      case 'equals':
        calculateResult();
        break;
    }

    updateDisplay();
  }

  function appendCharacter(char) {
    if (expression === '0' && char !== '.') {
      expression = char;
    } else {
      expression += char;
    }
  }

  function appendOperator(op) {
    if (!expression && op !== '-') {
      expression = '0' + op;
      return;
    }
    const lastChar = expression.slice(-1);
    if (['+', '-', '×', '÷', '%'].includes(lastChar)) {
      expression = expression.slice(0, -1) + op;
    } else {
      expression += op;
    }
  }

  function appendFunction(func) {
    expression += func;
  }

  function clearAll() {
    expression = '';
    activeResult = '0';
    isEvaluated = false;
    updateDisplay();
  }

  function deleteLast() {
    if (isEvaluated) {
      clearAll();
      return;
    }
    expression = expression.slice(0, -1);
  }

  function toggleNegate() {
    if (!expression) {
      expression = '-';
      return;
    }
    if (expression.startsWith('-')) {
      expression = expression.substring(1);
    } else {
      expression = '-' + expression;
    }
  }

  function calculateResult() {
    if (!expression) return;

    try {
      const sanitized = sanitizeExpression(expression);
      const rawResult = evaluateMath(sanitized);

      if (isNaN(rawResult) || !isFinite(rawResult)) {
        activeResult = 'Error';
      } else {
        activeResult = formatResult(rawResult);
        isEvaluated = true;
      }
    } catch (err) {
      activeResult = 'Error';
    }
    updateDisplay();
  }

  function sanitizeExpression(expr) {
    let sanitized = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/');

    sanitized = sanitized.replace(/(\d+)\s*([a-zA-Z\(])/g, '$1*$2');
    sanitized = sanitized.replace(/\)\s*(\d+)/g, ')*$1');
    sanitized = sanitized.replace(/\)\s*\(/g, ')*(');

    return sanitized;
  }

  function evaluateMath(sanitizedExpr) {
    const fn = new Function(`"use strict"; return (${sanitizedExpr});`);
    return fn();
  }

  function formatResult(num) {
    const precisionFixed = parseFloat(num.toFixed(10));

    if (Math.abs(precisionFixed) > 1e11 || (Math.abs(precisionFixed) < 1e-6 && precisionFixed !== 0)) {
      return precisionFixed.toExponential(6);
    }
    return precisionFixed.toLocaleString('en-US', { maximumFractionDigits: 8 });
  }

  function updateDisplay() {
    expressionDisplay.textContent = expression || '';
    resultDisplay.textContent = activeResult;

    if (activeResult.length > 10) {
      resultDisplay.style.fontSize = '1.7rem';
    } else if (activeResult.length > 7) {
      resultDisplay.style.fontSize = '2.1rem';
    } else {
      resultDisplay.style.fontSize = '2.4rem';
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key;

    if (key >= '0' && key <= '9') {
      handleInput('num', key);
    } else if (key === '.') {
      handleInput('num', '.');
    } else if (key === '+') {
      handleInput('op', '+');
    } else if (key === '-') {
      handleInput('op', '-');
    } else if (key === '*') {
      handleInput('op', '×');
    } else if (key === '/') {
      e.preventDefault();
      handleInput('op', '÷');
    } else if (key === '%') {
      handleInput('op', '%');
    } else if (key === '(' || key === ')') {
      handleInput('insert', key);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      handleInput('equals');
    } else if (key === 'Backspace') {
      handleInput('delete');
    } else if (key === 'Escape') {
      handleInput('clear');
    }
  });
});
