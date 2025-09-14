import logo from './logo.svg';
import './App.css';
import { useState } from 'react';



function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [sendEnabled, setSendEnabled] = useState(false); // step 1
  const [customMessage, setCustomMessage] = useState(''); // step 2

  

 const handleLogin = async () => {
  try {
    const response = await fetch("https://h3scynmcn9.execute-api.us-west-1.amazonaws.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwordInput }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setAuthenticated(true);   // ✅ same as before
    } else {
      alert(data.message || "Wrong password!");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Error connecting to server.");
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
