const expressionDisplay = document.getElementById('expression-display');
const resultDisplay = document.getElementById('result-display');
const buttons = document.querySelectorAll('.btn');
let expression = '';

buttons.forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const value = button.dataset.val;

    handleInput(action, value);
  });
});

function handleInput(action, value) {
  if (action === 'clear') {
    expression = '';
    resultDisplay.textContent = '0';
  } else if (action === 'delete') {
    expression = expression.slice(0, -1);
  } else if (action === 'equals') {
    calculateResult();
    return;
  } else if (action === 'negate') {
    if (expression.startsWith('-')) {
      expression = expression.substring(1);
    } else {
      expression = '-' + expression;
    }
  } else if (value) {
    expression += value;
  }

  updateDisplay();
}

function calculateResult() {
  if (!expression) return;

  try {

    let sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/');

    let result = new Function(`"use strict"; return (${sanitized})`)();

    resultDisplay.textContent = result;
    expression = String(result);
  } catch (error) {
    resultDisplay.textContent = 'Error';
    expression = '';
  }
}

function updateDisplay() {
  expressionDisplay.textContent = expression;
  if (!expression) {
    resultDisplay.textContent = '0';
  }
}
document.addEventListener('keydown', (event) => {
  const key = event.key;

  if (key >= '0' && key <= '9') handleInput('num', key);
  if (key === '.') handleInput('num', '.');
  if (key === '+') handleInput('op', '+');
  if (key === '-') handleInput('op', '-');
  if (key === '*') handleInput('op', '×');
  if (key === '/') {
    event.preventDefault();
    handleInput('op', '÷');
  }
  if (key === '%') handleInput('op', '%');
  if (key === '(' || key === ')') handleInput('insert', key);
  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    handleInput('equals');
  }
  if (key === 'Backspace') handleInput('delete');
  if (key === 'Escape') handleInput('clear');
});

