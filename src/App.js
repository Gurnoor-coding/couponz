import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  const password = "my"; // simple password for now

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
          <Send />
        </div>
      )}
    </div>
  );
}

// Function to add emails to backend
async function add_emails(email){
  const response = await fetch("http://localhost:5000/emails", {
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
function Send(){
  const handleSend = async () => {
    const response = await fetch("http://localhost:5000/send-emails", {
      method: "POST",
    });
    const data = await response.json();
    alert(data.message);
  };

  return (
    <button onClick={handleSend}>Send All Emails</button>
  );
}

export default App;
