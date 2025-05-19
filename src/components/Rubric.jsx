import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const primaryFeedback = [
  "Outstanding – keep practising and well done!",
  "Very good, but there’s one or two small things that have kept you from the very top mark.",
  "A ‘solid’ piece of writing, with a couple of factors holding it back.",
  "A competent piece that lacks the sense of completion of those that are scoring higher.",
  "A piece that is ‘doing the job’, but there’s more it could be doing in order to be better.",
  "Showing that there’s some things we can work on to improve your piece.",
  "Telling us that your focus needs to be on ensuring you understand the task."
];

const secondaryFeedback = [
    "Ensure your language is clear throughout the whole piece.",
    "You need to engage with the 'big ideas' and show a level of insight through your writing, going further than what the statements say.",
    "Consider how your arguments have a greater impact upon the community, nation, world.",
    "Your piece is not as 'complete' as a 10 in the sense of its structure and conclusion.",
    "The statements could be responded to in a more creative and thoughtful manner.",
    "Your piece doesn't quite have a 'complete' feel due to length and how comprehensively the material is covered.",
    "You need to engage with more insightful ideas/arguments.",
    "Your piece has an opinion but it needs more supporting ideas.",
    "You need to go beyond the basic premise of the information – bring in thinking and ideas that show you've considered your community/the world.",
    "Your piece is too brief.",
    "Your piece lacks the flow, structure and eloquence of higher scoring pieces.",
    "Your opinion and contention is not entirely clear and focused.",
    "You have not engaged with the material throughout your entire piece.",
    "Your piece doesn't have a sense of completion – it doesn't work through arguments and conclude with a strong sense of resolution.",
    "Errors in your grammar, punctuation, syntax that impact on the meaning of your writing.",
    "You haven't organised your piece into a coherent series of arguments.",
    "Most of what you have written is merely a reiteration of the statements provided.",
    "Your use of language hasn't allowed you to be as clear as needed.",
    "Remember that you need to organise the material into paragraphs.",
    "Remember that you need to work with the statements to make a clear point. Take a position.",
    "Remember that you need to write clearly and focus on making clear arguments."
  ];

const commentBank = [
    "This was a good start! Keep going and provide further thinking and ideas in a more comprehensive piece.",
    "Aim to add further thinking and arguments to your piece to lift it further.",
    "Look to develop your point of view further through the use of separate ideas, organised in paragraphs, that support your overarching contention.",
    "Look to develop your point of view further through the use of separate ideas, organised in paragraphs, that support your overarching contention. Also look to avoid referring directly to the information - instead use it as inspiration for your own point of view.",
    "Flesh out your arguments further and add more thought and ideas to your paragraphs to improve.",
    "Develop your own point of view. You don’t need to refer to the material directly or reference which information you are using in your thinking and writing.",
    "Look to be stronger and bolder in your view – make it clear what you believe!"
];

export default function Rubric() {
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState('');
  const [score, setScore] = useState(null);
  const [primary, setPrimary] = useState('');
  const [secondary, setSecondary] = useState([]);
  const [comments, setComments] = useState([]);
  const [customComment, setCustomComment] = useState('');

  // -- CSV Upload Handlers --
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const lines = evt.target.result.trim().split('\n');
      // Assuming header row: firstName,lastName,class
      const data = lines.slice(1).map(line => {
        const [first, last, classGroup] = line.split(',');
        return {
          name: `${first.trim()} ${last.trim()}`,
          class: classGroup?.trim() || ''
        };
      });
      setStudents(data);
    };
    reader.readAsText(file);
  };
  const handleStudentSelect = (e) => {
    setStudentName(e.target.value);
  };

  // -- Feedback Logic --
  const toggleSecondary = (item) => {
    setSecondary(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : prev.length < 4
        ? [...prev, item]
        : prev
    );
  };
  const addComment = (text) => {
    if (!comments.includes(text)) setComments([...comments, text]);
  };
  const handleAddCustomComment = () => {
    if (customComment.trim()) {
      addComment(customComment.trim());
      setCustomComment('');
    }
  };

  // -- PDF Export --
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait' });
    const pageWidth = doc.internal.pageSize.getWidth();
  
    // — Header —
    doc.setFontSize(16);
    doc.text(
      'GAT Section B – Feedback',
      pageWidth / 2,
      15,
      { align: 'center' }
    );
  
    // — Student & Score —
    doc.setFontSize(12);
    doc.text(`Student: ${studentName}`, 15, 30);
    doc.text(
      `Score: ${score !== null ? score : 'Not selected'}`,
      15,
      40
    );
  
    // — Primary Feedback Table —
    autoTable(doc, {
      startY: 50,
      head: [
        ['Generally, your piece has been assessed as:']
      ],
      body: [
        [ primary || 'None selected' ]
      ],
      headStyles: {
        fillColor: [25,118,210],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      theme: 'striped'
    });
  
    // — Secondary Feedback Table —
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [
        ['The reasons why you’ve been assessed this way:']
      ],
      body: secondary.length
        ? secondary.map(item => [item])
        : [['None selected']],
      headStyles: {
        fillColor: [25,118,210],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      theme: 'striped'
    });
  
    // — Further Feedback Table —
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [
        ['Further Feedback']
      ],
      body: comments.length
        ? comments.map(c => [c])
        : [['None provided']],
      headStyles: {
        fillColor: [25,118,210],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      },
      theme: 'striped'
    });
  
    // — Save PDF —
    const filename = `${studentName
      .trim()
      .replace(/\s+/g, '_') || 'student'}_GATSectionB_Feedback.pdf`;
    doc.save(filename);
  };
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h2>GAT Section B – Assessment and Feedback</h2>

      {/* CSV Upload + Student Select */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          <strong>Upload Student List (CSV):</strong>
          <input
            type="file"
            accept=".csv"
            onChange={handleCSVUpload}
            style={{ marginLeft: '1rem' }}
          />
        </label>
      </div>
      {students.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <label>
            <strong>Select Student:</strong>
            <select
              value={studentName}
              onChange={handleStudentSelect}
              style={{ marginLeft: '1rem', padding: '0.5rem' }}
            >
              <option value="">-- Choose a student --</option>
              {students.map((s, i) => (
                <option key={i} value={s.name}>
                  {s.name} {s.class && `(${s.class})`}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {/* Student Name Fallback/Edit */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          <strong>Student Name:</strong>
          <input
            type="text"
            value={studentName}
            onChange={e => setStudentName(e.target.value)}
            placeholder="Enter student name"
            style={{ marginLeft: '1rem', padding: '0.5rem', width: '300px' }}
          />
        </label>
      </div>

      {/* Score Selection */}
      <div style={{ marginBottom: '1rem' }}>
        <strong>Score (0–10):</strong>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          {[...Array(11).keys()].map(n => (
            <label key={n}>
              <input
                type="radio"
                name="score"
                value={n}
                checked={score === n}
                onChange={() => setScore(n)}
              />{' '}
              {n}
            </label>
          ))}
        </div>
      </div>

      {/* Primary Feedback */}
      <div style={{ marginBottom: '1rem' }}>
  <strong>Generally, your piece has been assessed as:</strong>
  <select
    value={primary}
    onChange={e => setPrimary(e.target.value)}
    style={{ marginLeft: '1rem', padding: '0.5rem', width: '100%' }}
  >
    <option value="">-- Choose a rating --</option>
    {primaryFeedback.map((item, idx) => (
      <option key={idx} value={item}>{item}</option>
    ))}
  </select>
</div>

      {/* Secondary Feedback */}
      <div style={{ marginBottom: '1rem' }}>
  <strong>The reasons why you've been assessed this way:</strong>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    {secondaryFeedback.map((item, idx) => (
      <label key={idx}>
        <input
          type="checkbox"
          checked={secondary.includes(item)}
          onChange={() => toggleSecondary(item)}
          disabled={!secondary.includes(item) && secondary.length >= 4}
        />{' '}
        {item}
      </label>
    ))}
  </div>
</div>

      {/* Comment Bank */}
      <div style={{ marginTop: '1rem' }}>
        <strong>Comment Bank:</strong>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {commentBank.map((text, idx) => (
            <button
              key={idx}
              onClick={() => addComment(text)}
              style={{ padding: '0.5rem', textAlign: 'left' }}
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Comment */}
      <div style={{ marginTop: '1rem' }}>
        <textarea
          rows="3"
          value={customComment}
          onChange={e => setCustomComment(e.target.value)}
          placeholder="Add a custom comment..."
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <br />
        <button onClick={handleAddCustomComment}>Add Custom Comment</button>
      </div>

      {/* Selected Comments */}
      <div style={{ marginTop: '1rem' }}>
        <h4>Selected Comments:</h4>
        <ul>
          {comments.map((c, i) => (
            <li key={i}>
              {c}{' '}
              <button
                onClick={() =>
                  setComments(comments.filter((_, idx) => idx !== i))
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Export */}
      <button
        onClick={exportPDF}
        style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#1976d2',
          color: 'white',
          border: 'none'
        }}
      >
        Export as PDF
      </button>
    </div>
  );
}
