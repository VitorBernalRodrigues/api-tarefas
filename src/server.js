const app = require('./app');

const PORTA = process.env.PORT || 3333;

app.listen(PORTA, () => {
  console.log(`API rodando em http://localhost:${PORTA}`);
});
