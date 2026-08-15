// Calculator Plugin
module.exports = {
  activate(context) {
    console.log('Calculator Plugin activated!')
    
    return {
      menuItem: {
        label: 'Calculator',
        action: 'open-calculator-window'
      }
    }
  },

  openWindow() {
    return {
      title: 'Calculator',
      width: 400,
      height: 500,
      content: `
        <div style="padding: 20px; color: white; font-family: Arial, sans-serif;">
          <h1 style="text-align: center; margin-bottom: 20px;">Calculator</h1>
          
          <div style="background: #2d2d2d; padding: 20px; border-radius: 8px;">
            <input 
              type="text" 
              id="display" 
              readonly 
              style="
                width: 100%; 
                padding: 15px; 
                font-size: 24px; 
                text-align: right; 
                background: #1e1e1e; 
                color: white; 
                border: 1px solid #444; 
                border-radius: 4px;
                margin-bottom: 15px;
              "
              value="0"
            />
            
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
              <button onclick="clearDisplay()" style="grid-column: span 2; padding: 15px; font-size: 18px; background: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer;">C</button>
              <button onclick="appendToDisplay('/')" style="padding: 15px; font-size: 18px; background: #f57c00; color: white; border: none; border-radius: 4px; cursor: pointer;">/</button>
              <button onclick="appendToDisplay('*')" style="padding: 15px; font-size: 18px; background: #f57c00; color: white; border: none; border-radius: 4px; cursor: pointer;">*</button>
              
              <button onclick="appendToDisplay('7')" style="padding: 15px; font-size: 18px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer;">7</button>
              <button onclick="appendToDisplay('8')" style="padding: 15px; font-size: 18px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer;">8</button>
              <button onclick="appendToDisplay('9')" style="padding: 15px; font-size: 18px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer;">9</button>
              <button onclick="appendToDisplay('-')" style="padding: 15px; font-size: 18px; background: #f57c00; color: white; border: none; border-radius: 4px; cursor: pointer;">-</button>
              
              <button onclick="appendToDisplay('4')" style="padding: 15px; font-size: 18px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer;">4</button>
              <button onclick="appendToDisplay('5')" style="padding: 15px; font-size: 18px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer;">5</button>
              <button onclick="appendToDisplay('6')" style="padding: 15px; font-size: 18px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer;">6</button>
              <button onclick="appendToDisplay('+')" style="padding: 15px; font-size: 18px; background: #f57c00; color: white; border: none; border-radius: 4px; cursor: pointer;">+</button>
              
              <button onclick="appendToDisplay('1')" style="padding: 15px; font-size: 18px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer;">1</button>
              <button onclick="appendToDisplay('2')" style="padding: 15px; font-size: 18px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer;">2</button>
              <button onclick="appendToDisplay('3')" style="padding: 15px; font-size: 18px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer;">3</button>
              <button onclick="calculate()" style="grid-row: span 2; padding: 15px; font-size: 18px; background: #388e3c; color: white; border: none; border-radius: 4px; cursor: pointer;">=</button>
              
              <button onclick="appendToDisplay('0')" style="grid-column: span 2; padding: 15px; font-size: 18px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer;">0</button>
              <button onclick="appendToDisplay('.')" style="padding: 15px; font-size: 18px; background: #424242; color: white; border: none; border-radius: 4px; cursor: pointer;">.</button>
            </div>
          </div>
          
          <script>
            function appendToDisplay(value) {
              const display = document.getElementById('display');
              if (display.value === '0') {
                display.value = value;
              } else {
                display.value += value;
              }
            }
            
            function clearDisplay() {
              document.getElementById('display').value = '0';
            }
            
            function calculate() {
              const display = document.getElementById('display');
              try {
                display.value = eval(display.value);
              } catch (error) {
                display.value = 'Error';
              }
            }
          </script>
        </div>
      `
    }
  }
}
