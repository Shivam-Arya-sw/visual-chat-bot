import React, { useState } from 'react';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const upload = (e) => {
    const f = e.target.files[0];
    setImage(f);
    setPreview(URL.createObjectURL(f));
    setAnswer("");
  };

  const ask = async () => {
    if (!image || !question) return alert('Please upload an image and ask a question.');
    setLoading(true);
    const form = new FormData();
    form.append("image", image);
    form.append("question", question);

    try {
      const backend = process.env.REACT_APP_BACKEND_URL || "https://your-backend.example.com";
      const res = await fetch(backend + "/ask", { method: "POST", body: form });
      const data = await res.json();
      if (data.error) setAnswer("Error: " + (data.error.detail || data.error || JSON.stringify(data)));
      else setAnswer(data.answer || JSON.stringify(data));
    } catch (e) {
      setAnswer("Request failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{maxWidth:720,margin:'36px auto',fontFamily:'Inter, Arial'}}>
      <div style={{padding:24,background:'#fff',borderRadius:12,boxShadow:'0 6px 30px rgba(0,0,0,0.06)'}}>
        <h1 style={{margin:0}}>Visual Chatbot</h1>
        <p style={{color:'#555'}}>Uploads image → backend forwards to Hugging Face model <strong>microsoft/phi-3-vision-128k-instruct</strong>.</p>

        <input type="file" accept="image/*" onChange={upload} style={{marginTop:12}} />
        {preview && <img src={preview} alt="preview" style={{width:'100%',borderRadius:8,marginTop:12}} />}

        <textarea rows={3} placeholder="Ask question (e.g. What's on the table?)" value={question} onChange={e=>setQuestion(e.target.value)} style={{width:'100%',marginTop:12,padding:10,borderRadius:8,border:'1px solid #eee'}} />

        <div style={{display:'flex',gap:12,marginTop:12}}>
          <button onClick={ask} disabled={loading} style={{background:'#2563eb',color:'#fff',padding:'10px 16px',borderRadius:8,border:'none',cursor:'pointer'}}>
            {loading ? 'Thinking...' : 'Ask'}
          </button>
          <button onClick={()=>{ setImage(null); setPreview(null); setQuestion(''); setAnswer(''); }} style={{padding:'10px 12px',borderRadius:8}}>Reset</button>
        </div>

        {answer && <div style={{marginTop:18,background:'#f7f9fc',padding:12,borderRadius:8}}><strong>Answer</strong><div style={{whiteSpace:'pre-wrap',marginTop:6}}>{answer}</div></div>}
      </div>
    </div>
  );
}

export default App;
