const express = require('express');
const app = express();

const history = [];

function calculateExpression(tokens) {
  const precedence = {
    'plus': 1,
    'minus': 1,
    'into': 2,
    'over': 2,
  };

  const outputQueue = [];
  const operatorStack = [];

  for (const token of tokens) {
    if (!isNaN(parseFloat(token))) {
      outputQueue.push(parseFloat(token));
    } else if (token in precedence) {
      while (
        operatorStack.length &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop());
      }
      operatorStack.pop(); // Pop the '('
    }
  }

  while (operatorStack.length) {
    outputQueue.push(operatorStack.pop());
  }

  const evalStack = [];

  for (const token of outputQueue) {
    if (typeof token === 'number') {
      evalStack.push(token);
    } else {
      const b = evalStack.pop();
      const a = evalStack.pop();
      switch (token) {
        case 'plus':
          evalStack.push(a + b);
          break;
        case 'minus':
          evalStack.push(a - b);
          break;
        case 'into':
          evalStack.push(a * b);
          break;
        case 'over':
          evalStack.push(a / b);
          break;
      }
    }
  }

  return evalStack[0];
}

app.get('/', (req, res) => {
  const expression = req.query.expr;

  if (!expression) {
    res.status(400).send('Expression parameter missing');
    return;
  }

  const tokens = expression
    .replace(/ /g, '') // Remove spaces
    .split(/(\+|\-|\*|\/|\(|\))/) // Split using operators and parentheses as separators
    .filter(token => token !== ''); // Filter out empty tokens

  const result = calculateExpression(tokens);

  history.push({ expression, result });

  if (history.length > 20) {
    history.shift();
  }

  res.status(200).send(result.toString());
});

app.get('/history', (req, res) => {
  res.status(200).json(history);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});