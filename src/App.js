import logo from './logo.svg';
import './App.css';
import { useState } from 'react';



function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [sendEnabled, setSendEnabled] = useState(false); // step 1
  const [customMessage, setCustomMessage] = useState(''); // step 2

  const password = "my";

  const handleLogin = () => {
    if (passwordInput === password) {
      setAuthenticated(true);
    } else {
      alert("Wrong password!");
    }
  };

  return (
    <div>
      {!authenticated ? (
        <div>
          <h2>Enter Password to Access</h2>
          <input
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <Input />
          
          <button onClick={() => setSendEnabled(true)}>Enable Send All</button>
          {sendEnabled && (<div>
            <textarea
              placeholder="Type custom message here..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              
            />
            <Send customMessage={customMessage}/>
          </div>)
          
          
          }
        </div>
      )}
    </div>
  );
}


// Function to add emails to backend
async function add_emails(email){ 
  const response = await fetch("https://h3scynmcn9.execute-api.us-west-1.amazonaws.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  console.log("Server response:", data);
  alert("Email saved!");
}

// Input component
function Input(){
  const [input, setInput] = useState('');
  return (
    <div>
      <input
        type="text"
        placeholder='Enter email...'
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={async ()=>{add_emails(input); setInput('');}}>Submit</button>
    </div>
  );
}

// Send component


function Send({ customMessage }) {
  const handleSend = async () => {
    const response = await fetch(
      "https://h3scynmcn9.execute-api.us-west-1.amazonaws.com/send-emails",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: customMessage }) // pass custom message
      }
    );
    const data = await response.json();
    alert(data.message);
  };

  return <button onClick={handleSend}>Send All Emails</button>;
}

export default App;
